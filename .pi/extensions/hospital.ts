// =============================================================================
// HOSPITAL EXTENSION — Dr. Gambling's tools for interacting with the world
//
// This Pi extension registers tools that let Dr. Gambling:
// - Query patient data and CEO health profiles
// - Diagnose patients
// - View market data and stock prices
// - Place trades using the pension fund
// - Send messages to the group chat
// - Write private notes and research
// - View portfolio and pension fund
//
// All tools call Convex mutations/queries via the ConvexHttpClient.
// =============================================================================

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

// NOTE: This is a conceptual extension file.
// Pi extension API shape may differ — adapt to actual Pi ExtensionAPI interface.
// The tool registrations below show the intended tools and their handlers.

export default function hospital(pi: any) {
  const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
  if (!convexUrl) {
    console.error("CONVEX_URL not set — hospital extension disabled");
    return;
  }

  const client = new ConvexHttpClient(convexUrl);

  // --- OBSERVATION TOOLS ---

  pi.registerTool({
    name: "view_world",
    description:
      "Get a complete snapshot of the current world: patients, market data, portfolio, pension, recent chat. Use this to orient yourself.",
    handler: async () => {
      return await client.query(api.agent.getWorldState);
    },
  });

  pi.registerTool({
    name: "view_patients",
    description: "View all active patients with their vitals and CEO info",
    handler: async () => {
      return await client.query(api.patients.getActive);
    },
  });

  pi.registerTool({
    name: "view_patient",
    description: "View detailed info about a specific patient",
    parameters: {
      patientId: {
        type: "string",
        description: "The patient ID",
      },
    },
    handler: async ({ patientId }: { patientId: string }) => {
      return await client.query(api.patients.get, { id: patientId as any });
    },
  });

  pi.registerTool({
    name: "view_market",
    description: "View current stock prices for all CEOs",
    handler: async () => {
      return await client.query(api.market.getLatestPrices);
    },
  });

  pi.registerTool({
    name: "view_price_history",
    description: "View price history for a specific stock ticker",
    parameters: {
      ticker: { type: "string", description: "Stock ticker symbol" },
      limit: {
        type: "number",
        description: "Number of price points (default 100)",
        optional: true,
      },
    },
    handler: async ({ ticker, limit }: { ticker: string; limit?: number }) => {
      return await client.query(api.market.getPriceHistory, { ticker, limit });
    },
  });

  pi.registerTool({
    name: "view_portfolio",
    description: "View all open positions and trading summary",
    handler: async () => {
      return await client.query(api.portfolio.getSummary);
    },
  });

  pi.registerTool({
    name: "view_pension",
    description:
      "View the hospital pension fund balance, including unrealized P&L from open positions",
    handler: async () => {
      return await client.query(api.portfolio.getPensionFund);
    },
  });

  pi.registerTool({
    name: "view_chat",
    description: "View recent group chat messages",
    handler: async () => {
      return await client.query(api.chat.recent);
    },
  });

  pi.registerTool({
    name: "view_memories",
    description: "View your recent notes, diagnoses, and research",
    parameters: {
      type: {
        type: "string",
        description:
          "Filter by type: note, diagnosis, insight, grudge, research, trade_thesis",
        optional: true,
      },
    },
    handler: async ({ type }: { type?: string }) => {
      return await client.query(api.agent.getMemories, { type });
    },
  });

  // --- ACTION TOOLS ---

  pi.registerTool({
    name: "diagnose_patient",
    description:
      "Record a diagnosis for a patient. Include your confidence (0-1) and detailed reasoning.",
    parameters: {
      patientId: { type: "string", description: "The patient ID" },
      diagnosis: { type: "string", description: "Your diagnosis" },
      confidence: {
        type: "number",
        description: "Confidence score 0.0-1.0",
      },
      reasoning: {
        type: "string",
        description: "Detailed diagnostic reasoning",
      },
    },
    handler: async (args: {
      patientId: string;
      diagnosis: string;
      confidence: number;
      reasoning: string;
    }) => {
      return await client.mutation(api.patients.diagnose, {
        patientId: args.patientId as any,
        diagnosis: args.diagnosis,
        confidence: args.confidence,
        reasoning: args.reasoning,
      });
    },
  });

  pi.registerTool({
    name: "place_trade",
    description:
      "Execute a trade using the hospital pension fund. Actions: short, buy, cover, sell.",
    parameters: {
      ticker: { type: "string", description: "Stock ticker symbol" },
      action: {
        type: "string",
        description: "Trade action: buy, sell, short, or cover",
      },
      quantity: { type: "number", description: "Number of shares" },
      reasoning: {
        type: "string",
        description: "Why you're making this trade (private note)",
        optional: true,
      },
    },
    handler: async (args: {
      ticker: string;
      action: string;
      quantity: number;
      reasoning?: string;
    }) => {
      return await client.mutation(api.portfolio.placeTrade, args as any);
    },
  });

  pi.registerTool({
    name: "send_chat",
    description:
      "Send a message to the group chat. The other doctors will see this.",
    parameters: {
      content: { type: "string", description: "Your message" },
      messageType: {
        type: "string",
        description: "Message type: text, diagnosis, rant (default: text)",
        optional: true,
      },
    },
    handler: async ({
      content,
      messageType,
    }: {
      content: string;
      messageType?: string;
    }) => {
      return await client.mutation(api.chat.send, {
        sender: "Dr. Gambling",
        content,
        messageType: (messageType as any) ?? "text",
      });
    },
  });

  pi.registerTool({
    name: "write_note",
    description:
      "Write a private note. Types: note, insight, grudge, research, trade_thesis. THESE ARE PRIVATE. Nobody else can see them.",
    parameters: {
      type: {
        type: "string",
        description:
          "Note type: note, insight, grudge, research, trade_thesis",
      },
      title: { type: "string", description: "Note title" },
      content: { type: "string", description: "Note content — be candid" },
    },
    handler: async (args: {
      type: string;
      title: string;
      content: string;
    }) => {
      return await client.mutation(api.agent.writeMemory, args as any);
    },
  });

  pi.registerTool({
    name: "admit_patient",
    description: "Admit a CEO as a new patient to the hospital",
    parameters: {
      ceoId: { type: "string", description: "The CEO ID" },
      presentingComplaint: {
        type: "string",
        description: "What symptoms/condition they present with",
      },
      severity: {
        type: "number",
        description: "Severity 0.0-1.0",
      },
    },
    handler: async (args: {
      ceoId: string;
      presentingComplaint: string;
      severity: number;
    }) => {
      return await client.mutation(api.patients.admit, {
        ceoId: args.ceoId as any,
        presentingComplaint: args.presentingComplaint,
        severity: args.severity,
      });
    },
  });

  // --- SIMULATION CONTROL ---

  pi.registerTool({
    name: "pause_simulation",
    description: "Pause the simulation clock",
    handler: async () => {
      return await client.mutation(api.simulation.setPaused, { paused: true });
    },
  });

  pi.registerTool({
    name: "resume_simulation",
    description: "Resume the simulation clock",
    handler: async () => {
      return await client.mutation(api.simulation.setPaused, { paused: false });
    },
  });

  pi.registerTool({
    name: "set_sim_speed",
    description: "Change simulation speed multiplier (default 10x)",
    parameters: {
      speed: {
        type: "number",
        description: "Speed multiplier (e.g. 10 = 10x real time)",
      },
    },
    handler: async ({ speed }: { speed: number }) => {
      return await client.mutation(api.simulation.setSpeed, { speed });
    },
  });
}
