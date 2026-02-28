import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// =============================================================================
// DR. GAMBLING'S HOSPITAL — SCHEMA
// The backend Dr. Gambling thinks is his private system.
// The other doctors can see everything. He doesn't know.
// =============================================================================

export default defineSchema({
  ...authTables,
  // ---------------------------------------------------------------------------
  // CEOs — The "patients" Dr. Gambling speculates on
  // ---------------------------------------------------------------------------
  ceos: defineTable({
    name: v.string(),
    company: v.string(),
    ticker: v.string(),
    age: v.number(),
    stockPrice: v.number(),
    netWorth: v.number(),
    healthProfile: v.object({
      conditions: v.array(v.string()),
      riskFactors: v.array(v.string()),
      medications: v.array(v.string()),
      familyHistory: v.array(v.string()),
      lifestyle: v.string(),
    }),
    status: v.union(
      v.literal("alive"),
      v.literal("critical"),
      v.literal("deceased"),
      v.literal("cured")
    ),
    createdAt: v.number(),
  })
    .index("byTicker", ["ticker"])
    .index("byStatus", ["status"]),

  // ---------------------------------------------------------------------------
  // PATIENTS — CEOs admitted to the hospital
  // ---------------------------------------------------------------------------
  patients: defineTable({
    ceoId: v.id("ceos"),
    presentingComplaint: v.string(),
    diagnosis: v.optional(v.string()),
    diagnosisConfidence: v.optional(v.number()),
    diagnosisReasoning: v.optional(v.string()),
    severity: v.number(), // 0.0 - 1.0
    trajectory: v.union(
      v.literal("declining"),
      v.literal("stable"),
      v.literal("improving")
    ),
    vitals: v.array(
      v.object({
        simTime: v.number(),
        heartRate: v.number(),
        bloodPressure: v.string(),
        temperature: v.number(),
        oxygenSaturation: v.number(),
        notes: v.optional(v.string()),
      })
    ),
    status: v.union(
      v.literal("active"),
      v.literal("discharged"),
      v.literal("deceased")
    ),
    admittedAt: v.number(),
    dischargedAt: v.optional(v.number()),
  })
    .index("byCeo", ["ceoId"])
    .index("byStatus", ["status"]),

  // ---------------------------------------------------------------------------
  // STOCK PRICES — Time-series market data
  // ---------------------------------------------------------------------------
  stockPrices: defineTable({
    ticker: v.string(),
    price: v.number(),
    volume: v.number(),
    simTime: v.number(),
  })
    .index("byTicker", ["ticker"])
    .index("byTickerAndTime", ["ticker", "simTime"]),

  // ---------------------------------------------------------------------------
  // PREDICTION MARKETS — Dr. Gambling's specialty
  // ---------------------------------------------------------------------------
  predictionMarkets: defineTable({
    title: v.string(),
    description: v.string(),
    ceoId: v.optional(v.id("ceos")),
    probability: v.number(), // 0.0 - 1.0
    resolution: v.optional(
      v.union(v.literal("yes"), v.literal("no"), v.literal("void"))
    ),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
    .index("byResolution", ["resolution"])
    .index("byCeo", ["ceoId"]),

  // ---------------------------------------------------------------------------
  // POSITIONS — Portfolio positions (shorts, longs)
  // ---------------------------------------------------------------------------
  positions: defineTable({
    ticker: v.string(),
    type: v.union(v.literal("short"), v.literal("long")),
    quantity: v.number(),
    entryPrice: v.number(),
    currentPrice: v.number(),
    pnl: v.number(),
    status: v.union(v.literal("open"), v.literal("closed")),
    openedAt: v.number(),
    closedAt: v.optional(v.number()),
    reasoning: v.optional(v.string()),
  })
    .index("byStatus", ["status"])
    .index("byTicker", ["ticker"]),

  // ---------------------------------------------------------------------------
  // TRADES — Execution records
  // ---------------------------------------------------------------------------
  trades: defineTable({
    positionId: v.optional(v.id("positions")),
    ticker: v.string(),
    action: v.union(
      v.literal("buy"),
      v.literal("sell"),
      v.literal("short"),
      v.literal("cover")
    ),
    quantity: v.number(),
    price: v.number(),
    simTime: v.number(),
  }),

  // ---------------------------------------------------------------------------
  // PENSION FUND — The shared hospital pension everyone screams about
  // ---------------------------------------------------------------------------
  pensionFund: defineTable({
    balance: v.number(),
    initialBalance: v.number(),
    allocatedToPositions: v.number(),
    lastUpdated: v.number(),
  }),

  // ---------------------------------------------------------------------------
  // AGENT MEMORIES — Dr. Gambling's notes, insights, grudges
  // ---------------------------------------------------------------------------
  agentMemories: defineTable({
    type: v.union(
      v.literal("note"),
      v.literal("diagnosis"),
      v.literal("insight"),
      v.literal("grudge"),
      v.literal("research"),
      v.literal("trade_thesis")
    ),
    title: v.string(),
    content: v.string(),
    simTime: v.number(),
    createdAt: v.number(),
  })
    .index("byType", ["type"])
    .index("byCreatedAt", ["createdAt"]),

  // ---------------------------------------------------------------------------
  // CHAT MESSAGES — The group chat (Dr. Gambling + coworkers)
  // Dr. Gambling doesn't know the other doctors can see his whole dashboard.
  // ---------------------------------------------------------------------------
  chatMessages: defineTable({
    sender: v.string(),
    content: v.string(),
    messageType: v.union(
      v.literal("text"),
      v.literal("trade_alert"),
      v.literal("diagnosis"),
      v.literal("rant"),
      v.literal("system")
    ),
    simTime: v.number(),
    createdAt: v.number(),
  })
    .index("bySimTime", ["simTime"])
    .index("byCreatedAt", ["createdAt"]),

  // ---------------------------------------------------------------------------
  // SIMULATION STATE — The clock that drives everything
  // ---------------------------------------------------------------------------
  simulationState: defineTable({
    simTime: v.number(), // simulated timestamp
    speed: v.number(), // multiplier (10 = 10x real time)
    paused: v.boolean(),
    lastTickAt: v.number(), // real timestamp of last tick
    tickCount: v.number(),
  }),
});
