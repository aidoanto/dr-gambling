import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

// =============================================================================
// SIMULATION ENGINE
// Drives the world forward: stock prices, patient health, narrative events
// =============================================================================

// Pseudo-random from seed (for deterministic-ish simulation)
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

// Geometric Brownian Motion step for stock prices
function priceStep(
  currentPrice: number,
  drift: number,
  volatility: number,
  dt: number,
  random: number
): number {
  // Box-Muller transform for normal distribution
  const u1 = Math.max(random, 0.0001);
  const u2 = seededRandom(random * 10000);
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

  const change = drift * dt + volatility * Math.sqrt(dt) * z;
  return Math.max(currentPrice * (1 + change), 0.01);
}

// Main simulation tick — called by cron (internal, not callable externally)
export const tick = internalMutation({
  args: {},
  handler: async (ctx) => {
    const state = await ctx.db.query("simulationState").first();
    if (!state || state.paused) return { status: "paused" };

    const now = Date.now();
    const realElapsed = (now - state.lastTickAt) / 1000; // seconds
    const simElapsed = realElapsed * state.speed; // simulated seconds
    const newSimTime = state.simTime + simElapsed * 1000;

    // --- UPDATE STOCK PRICES ---
    const ceos = await ctx.db.query("ceos").collect();
    for (const ceo of ceos) {
      // Base volatility varies by CEO health status
      let drift = -0.0001; // slight downward drift (entropy)
      let volatility = 0.02;

      if (ceo.status === "critical") {
        drift = -0.003; // declining health → stock pressure
        volatility = 0.05;
      } else if (ceo.status === "deceased") {
        drift = -0.01;
        volatility = 0.08;
      } else if (ceo.status === "cured") {
        drift = 0.005; // relief rally
        volatility = 0.06;
      }

      // Check if Dr. Gambling has a short position — this affects discovery probability
      const openShorts = await ctx.db
        .query("positions")
        .withIndex("byTicker", (q) => q.eq("ticker", ceo.ticker))
        .filter((q) =>
          q.and(
            q.eq(q.field("type"), "short"),
            q.eq(q.field("status"), "open")
          )
        )
        .collect();

      const totalShortQuantity = openShorts.reduce(
        (sum, p) => sum + p.quantity,
        0
      );

      // Large short positions create "Bloomberg anomaly" — CEO might notice
      if (
        totalShortQuantity > 1000 &&
        ceo.status === "critical" &&
        seededRandom(state.tickCount + ceo.stockPrice) < 0.03
      ) {
        // CEO NOTICES THE SHORT. Gets spooked. Goes to a real doctor.
        await ctx.db.patch(ceo._id, { status: "cured" });

        // Stock rebounds hard
        drift = 0.15;
        volatility = 0.1;

        // Find and discharge the patient
        const patient = await ctx.db
          .query("patients")
          .withIndex("byCeo", (q) => q.eq("ceoId", ceo._id))
          .filter((q) => q.eq(q.field("status"), "active"))
          .first();

        if (patient) {
          await ctx.db.patch(patient._id, {
            status: "discharged",
            trajectory: "improving",
            dischargedAt: newSimTime,
          });
        }

        // Post system message to chat
        await ctx.db.insert("chatMessages", {
          sender: "SYSTEM",
          content: `🚨 BLOOMBERG ALERT: ${ceo.name} (${ceo.ticker}) spotted unusual short interest in company stock. CEO reportedly checked into Mayo Clinic for "routine screening." Stock rebounding sharply.`,
          messageType: "system",
          simTime: newSimTime,
          createdAt: now,
        });
      }

      const dt = simElapsed / 86400; // fraction of a day
      const rand = seededRandom(state.tickCount * 7 + ceo.stockPrice);
      const newPrice = priceStep(ceo.stockPrice, drift, volatility, dt, rand);

      await ctx.db.patch(ceo._id, { stockPrice: newPrice });

      // Record price history (every tick)
      await ctx.db.insert("stockPrices", {
        ticker: ceo.ticker,
        price: newPrice,
        volume: Math.floor(
          (Math.abs(newPrice - ceo.stockPrice) / ceo.stockPrice) * 10_000_000 +
            seededRandom(state.tickCount) * 2_000_000
        ),
        simTime: newSimTime,
      });
    }

    // --- UPDATE PATIENT VITALS ---
    const activePatients = await ctx.db
      .query("patients")
      .withIndex("byStatus", (q) => q.eq("status", "active"))
      .collect();

    for (const patient of activePatients) {
      const lastVital = patient.vitals[patient.vitals.length - 1];
      if (!lastVital) continue;

      const rand = seededRandom(state.tickCount * 13 + patient.severity);
      let severityDelta = 0;

      if (patient.trajectory === "declining") {
        severityDelta = 0.01 + rand * 0.02;
      } else if (patient.trajectory === "improving") {
        severityDelta = -(0.01 + rand * 0.02);
      } else {
        severityDelta = (rand - 0.5) * 0.02;
      }

      const newSeverity = Math.max(
        0,
        Math.min(1, patient.severity + severityDelta)
      );

      // Generate new vitals
      const newVital = {
        simTime: newSimTime,
        heartRate: Math.max(
          40,
          Math.min(
            180,
            lastVital.heartRate + Math.floor((rand - 0.4) * 10 * (newSeverity > 0.8 ? 3 : 1))
          )
        ),
        bloodPressure: `${Math.max(80, Math.min(200, parseInt(lastVital.bloodPressure) + Math.floor((rand - 0.45) * 15)))}/${Math.max(50, Math.min(120, 90 + Math.floor((rand - 0.5) * 10)))}`,
        temperature: Math.max(
          35.5,
          Math.min(41, lastVital.temperature + (rand - 0.48) * 0.3)
        ),
        oxygenSaturation: Math.max(
          70,
          Math.min(100, lastVital.oxygenSaturation + Math.floor((0.52 - rand) * 3))
        ),
      };

      // Keep last 50 vitals
      const vitals = [...patient.vitals.slice(-49), newVital];

      // Check for death
      if (newSeverity >= 0.95) {
        await ctx.db.patch(patient._id, {
          vitals,
          severity: 1.0,
          status: "deceased",
          trajectory: "declining",
          dischargedAt: newSimTime,
        });

        // Update CEO status
        await ctx.db.patch(patient.ceoId, { status: "deceased" });

        await ctx.db.insert("chatMessages", {
          sender: "SYSTEM",
          content: `☠️ ${(await ctx.db.get(patient.ceoId))?.name} has been pronounced dead. Time of death: sim-${new Date(newSimTime).toISOString()}.`,
          messageType: "system",
          simTime: newSimTime,
          createdAt: now,
        });
      } else {
        // Trajectory can shift
        let newTrajectory = patient.trajectory;
        if (newSeverity > 0.85 && patient.trajectory !== "declining") {
          newTrajectory = "declining";
        } else if (
          rand > 0.95 &&
          patient.trajectory === "declining"
        ) {
          newTrajectory = "stable"; // small chance of stabilizing
        }

        await ctx.db.patch(patient._id, {
          vitals,
          severity: newSeverity,
          trajectory: newTrajectory,
        });
      }
    }

    // --- UPDATE PORTFOLIO P&L ---
    const openPositions = await ctx.db
      .query("positions")
      .withIndex("byStatus", (q) => q.eq("status", "open"))
      .collect();

    let totalPnl = 0;
    for (const position of openPositions) {
      const ceo = ceos.find((c) => c.ticker === position.ticker);
      if (!ceo) continue;

      const currentPrice = ceo.stockPrice;
      let pnl: number;

      if (position.type === "short") {
        pnl = (position.entryPrice - currentPrice) * position.quantity;
      } else {
        pnl = (currentPrice - position.entryPrice) * position.quantity;
      }

      totalPnl += pnl;
      await ctx.db.patch(position._id, { currentPrice, pnl });
    }

    // --- UPDATE PENSION FUND ---
    const pension = await ctx.db.query("pensionFund").first();
    if (pension) {
      // Pension value = cash balance + unrealized P&L from positions
      await ctx.db.patch(pension._id, {
        lastUpdated: now,
      });
    }

    // --- ADVANCE CLOCK ---
    await ctx.db.patch(state._id, {
      simTime: newSimTime,
      lastTickAt: now,
      tickCount: state.tickCount + 1,
    });

    return {
      status: "ticked",
      tickCount: state.tickCount + 1,
      simTime: newSimTime,
      activeCeos: ceos.length,
      activePatients: activePatients.length,
      openPositions: openPositions.length,
    };
  },
});

// Query simulation state
export const getState = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("simulationState").first();
  },
});

// Pause/resume simulation
export const setPaused = mutation({
  args: { paused: v.boolean() },
  handler: async (ctx, { paused }) => {
    const state = await ctx.db.query("simulationState").first();
    if (!state) return;
    await ctx.db.patch(state._id, { paused, lastTickAt: Date.now() });
  },
});

// Change simulation speed
export const setSpeed = mutation({
  args: { speed: v.number() },
  handler: async (ctx, { speed }) => {
    const state = await ctx.db.query("simulationState").first();
    if (!state) return;
    await ctx.db.patch(state._id, { speed });
  },
});
