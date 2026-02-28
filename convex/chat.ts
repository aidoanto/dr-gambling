import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query("chatMessages")
      .withIndex("byCreatedAt")
      .order("desc")
      .take(limit ?? 100)
      .then((msgs) => msgs.reverse());
  },
});

export const recent = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("chatMessages")
      .withIndex("byCreatedAt")
      .order("desc")
      .take(20)
      .then((msgs) => msgs.reverse());
  },
});

export const send = mutation({
  args: {
    sender: v.string(),
    content: v.string(),
    messageType: v.optional(
      v.union(
        v.literal("text"),
        v.literal("trade_alert"),
        v.literal("diagnosis"),
        v.literal("rant"),
        v.literal("system")
      )
    ),
  },
  handler: async (ctx, { sender, content, messageType }) => {
    const state = await ctx.db.query("simulationState").first();
    const msgId = await ctx.db.insert("chatMessages", {
      sender,
      content,
      messageType: messageType ?? "text",
      simTime: state?.simTime ?? Date.now(),
      createdAt: Date.now(),
    });

    // If a human sent a message, wake up Dr. Gambling's brain
    if (sender !== "Dr. Gambling" && sender !== "SYSTEM") {
      await ctx.scheduler.runAfter(1500, internal.brain.respond, {
        triggerMessageId: msgId,
      });
    }

    return msgId;
  },
});

export const sendAsCharacter = mutation({
  args: {
    content: v.string(),
  },
  handler: async (ctx, { content }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const character = await ctx.db
      .query("characters")
      .withIndex("byClaimedByUserId", (q) => q.eq("claimedByUserId", userId))
      .first();
    if (!character) throw new Error("No character claimed — pick one from the cafeteria");

    const state = await ctx.db.query("simulationState").first();
    const msgId = await ctx.db.insert("chatMessages", {
      sender: character.name,
      content,
      messageType: "text",
      simTime: state?.simTime ?? Date.now(),
      createdAt: Date.now(),
    });

    // Wake up Dr. Gambling's brain
    await ctx.scheduler.runAfter(1500, internal.brain.respond, {
      triggerMessageId: msgId,
    });

    return msgId;
  },
});
