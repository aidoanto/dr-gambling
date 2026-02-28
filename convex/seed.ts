import { mutation } from "./_generated/server";

// =============================================================================
// WORLD SEED — Generate the initial cast of CEOs, market data, and pension fund
// Run with: npx convex run seed:seedWorld
// =============================================================================

const INITIAL_CEOS = [
  {
    name: "Reginald Thornberry III",
    company: "Thornberry Pharmaceuticals",
    ticker: "THRN",
    age: 67,
    stockPrice: 142.5,
    netWorth: 2_800_000_000,
    healthProfile: {
      conditions: ["Type 2 Diabetes", "Hypertension", "Gout"],
      riskFactors: ["Obesity (BMI 34)", "Sedentary lifestyle", "High stress"],
      medications: ["Metformin", "Lisinopril", "Allopurinol"],
      familyHistory: ["Father: MI at 58", "Mother: Stroke at 72"],
      lifestyle:
        "Eats at steakhouses 5 nights/week. Refuses to walk anywhere. Has a personal golf cart for his office.",
    },
    status: "alive" as const,
  },
  {
    name: "Vivienne Zhao-Mitchell",
    company: "AetherAI Systems",
    ticker: "AETH",
    age: 52,
    stockPrice: 387.2,
    netWorth: 8_400_000_000,
    healthProfile: {
      conditions: ["Arrhythmia (AFib)", "Chronic insomnia"],
      riskFactors: [
        "Works 18hr days",
        "Caffeine intake: 12 espressos/day",
        "Sleep: 3-4hrs/night",
      ],
      medications: ["Flecainide", "Ambien (intermittent)"],
      familyHistory: ["Mother: Breast cancer at 61 (survived)"],
      lifestyle:
        "Meditates for exactly 4 minutes daily. Claims it's enough. Lives in a glass house overlooking the Pacific.",
    },
    status: "alive" as const,
  },
  {
    name: "Douglas 'Duke' Crampton",
    company: "Crampton Defense Industries",
    ticker: "CDFI",
    age: 74,
    stockPrice: 89.3,
    netWorth: 1_200_000_000,
    healthProfile: {
      conditions: [
        "COPD",
        "Peripheral artery disease",
        "History of TIA",
      ],
      riskFactors: [
        "Former 2-pack/day smoker (quit 5 years ago)",
        "Agent Orange exposure (Vietnam)",
        "Refuses most medications",
      ],
      medications: ["Tiotropium inhaler", "Aspirin (when he remembers)"],
      familyHistory: [
        "Father: Lung cancer at 66",
        "Brother: AAA rupture at 70",
      ],
      lifestyle:
        "Still goes to the shooting range weekly. Drinks bourbon 'medicinally'. Has threatened three cardiologists.",
    },
    status: "critical" as const,
  },
  {
    name: "Priya Chakraborty",
    company: "NovaBio Therapeutics",
    ticker: "NVBT",
    age: 45,
    stockPrice: 223.8,
    netWorth: 3_600_000_000,
    healthProfile: {
      conditions: ["Migraine with aura", "Iron deficiency anemia"],
      riskFactors: ["Family history of autoimmune disease", "High stress"],
      medications: ["Sumatriptan (as needed)", "Iron supplements"],
      familyHistory: [
        "Mother: Lupus",
        "Sister: Hashimoto's thyroiditis",
      ],
      lifestyle:
        "Runs ultramarathons. Vegan. Ironically runs a pharma company. Actually quite healthy, which frustrates Dr. Gambling.",
    },
    status: "alive" as const,
  },
  {
    name: "Harold 'Hal' Pendergast",
    company: "Pendergast Media Group",
    ticker: "PNDG",
    age: 71,
    stockPrice: 56.4,
    netWorth: 890_000_000,
    healthProfile: {
      conditions: [
        "Coronary artery disease (3-vessel)",
        "Type 2 Diabetes",
        "Chronic kidney disease Stage 3",
      ],
      riskFactors: [
        "Morbid obesity (BMI 41)",
        "Non-compliant with medications",
        "Refuses dietary changes",
      ],
      medications: [
        "Atorvastatin (takes sporadically)",
        "Metformin (skips most days)",
        "Clopidogrel",
      ],
      familyHistory: [
        "Father: MI at 52 (fatal)",
        "Mother: Diabetes complications",
        "Brother: CABG at 60",
      ],
      lifestyle:
        "Owns 14 fast food franchises. Eats at them. Has a standing table at every one. Cardiologist has given up.",
    },
    status: "critical" as const,
  },
  {
    name: "Astrid Engström",
    company: "Boreal Minerals AB",
    ticker: "BRLM",
    age: 61,
    stockPrice: 178.9,
    netWorth: 4_100_000_000,
    healthProfile: {
      conditions: ["Early-stage pancreatic mass (unconfirmed)"],
      riskFactors: [
        "Recent unexplained weight loss (8kg in 2 months)",
        "New onset back pain",
        "Elevated CA 19-9",
      ],
      medications: ["Omeprazole", "Vitamin D"],
      familyHistory: ["Father: Pancreatic cancer at 63 (fatal)"],
      lifestyle:
        "Competitive cross-country skier. Noticed declining performance. Hasn't told anyone about the weight loss.",
    },
    status: "alive" as const,
  },
  {
    name: "Terrence 'T-Bone' Jackson",
    company: "Jackson Entertainment Holdings",
    ticker: "JENT",
    age: 58,
    stockPrice: 34.7,
    netWorth: 450_000_000,
    healthProfile: {
      conditions: [
        "Cardiomyopathy (dilated)",
        "History of substance abuse (cocaine, 20 years clean)",
      ],
      riskFactors: [
        "Cardiac damage from prior cocaine use",
        "Ejection fraction 35%",
        "Refuses ICD implant",
      ],
      medications: [
        "Carvedilol",
        "Entresto",
        "Spironolactone",
        "Furosemide",
      ],
      familyHistory: ["Unknown — adopted"],
      lifestyle:
        "Former rapper turned entertainment mogul. Actually takes his meds. Still performs occasionally. His cardiologist begs him not to.",
    },
    status: "alive" as const,
  },
];

export const seedWorld = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("ceos").first();
    if (existing) {
      return { status: "already_seeded" };
    }

    const now = Date.now();
    const simStartTime = now;

    // Seed CEOs
    for (const ceo of INITIAL_CEOS) {
      const ceoId = await ctx.db.insert("ceos", {
        ...ceo,
        createdAt: now,
      });

      // Create initial stock price entry
      await ctx.db.insert("stockPrices", {
        ticker: ceo.ticker,
        price: ceo.stockPrice,
        volume: Math.floor(Math.random() * 5_000_000) + 500_000,
        simTime: simStartTime,
      });

      // Admit critical CEOs as patients
      if (ceo.status === "critical") {
        await ctx.db.insert("patients", {
          ceoId,
          presentingComplaint:
            ceo.name === "Douglas 'Duke' Crampton"
              ? "Acute exacerbation of COPD with suspected TIA symptoms"
              : "Acute chest pain, troponin elevated, ECG changes",
          severity: 0.7 + Math.random() * 0.2,
          trajectory: "declining",
          vitals: [
            {
              simTime: simStartTime,
              heartRate: 88 + Math.floor(Math.random() * 30),
              bloodPressure: `${150 + Math.floor(Math.random() * 30)}/${85 + Math.floor(Math.random() * 15)}`,
              temperature: 37.2 + Math.random() * 1.2,
              oxygenSaturation: 89 + Math.floor(Math.random() * 6),
            },
          ],
          status: "active",
          admittedAt: simStartTime,
        });
      }
    }

    // Initialize pension fund — $2.4M, about to have a very bad time
    await ctx.db.insert("pensionFund", {
      balance: 2_400_000,
      initialBalance: 2_400_000,
      allocatedToPositions: 0,
      lastUpdated: now,
    });

    // Initialize simulation state
    await ctx.db.insert("simulationState", {
      simTime: simStartTime,
      speed: 10,
      paused: false,
      lastTickAt: now,
      tickCount: 0,
    });

    return {
      status: "seeded",
      ceos: INITIAL_CEOS.length,
      patients: INITIAL_CEOS.filter((c) => c.status === "critical").length,
    };
  },
});
