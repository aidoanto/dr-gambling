import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getMemories = query({
  args: {
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { type, limit }) => {
    if (type) {
      return await ctx.db
        .query("agentMemories")
        .withIndex("byType", (q) => q.eq("type", type as any))
        .order("desc")
        .take(limit ?? 50);
    }
    return await ctx.db
      .query("agentMemories")
      .withIndex("byCreatedAt")
      .order("desc")
      .take(limit ?? 50);
  },
});

export const writeMemory = mutation({
  args: {
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
  },
  handler: async (ctx, { type, title, content }) => {
    const state = await ctx.db.query("simulationState").first();
    return await ctx.db.insert("agentMemories", {
      type,
      title,
      content,
      simTime: state?.simTime ?? Date.now(),
      createdAt: Date.now(),
    });
  },
});

// Get everything Dr. Gambling needs to observe the world
export const getWorldState = query({
  args: {},
  handler: async (ctx) => {
    const simState = await ctx.db.query("simulationState").first();

    const ceos = await ctx.db.query("ceos").collect();

    const activePatients = await ctx.db
      .query("patients")
      .withIndex("byStatus", (q) => q.eq("status", "active"))
      .collect();

    const patientsWithCeos = [];
    for (const p of activePatients) {
      const ceo = await ctx.db.get(p.ceoId);
      patientsWithCeos.push({ ...p, ceo });
    }

    const openPositions = await ctx.db
      .query("positions")
      .withIndex("byStatus", (q) => q.eq("status", "open"))
      .collect();

    const pension = await ctx.db.query("pensionFund").first();

    const recentChat = await ctx.db
      .query("chatMessages")
      .withIndex("byCreatedAt")
      .order("desc")
      .take(10)
      .then((msgs) => msgs.reverse());

    const recentMemories = await ctx.db
      .query("agentMemories")
      .withIndex("byCreatedAt")
      .order("desc")
      .take(5);

    return {
      simState,
      ceos,
      activePatients: patientsWithCeos,
      openPositions,
      pension,
      recentChat,
      recentMemories,
    };
  },
});
