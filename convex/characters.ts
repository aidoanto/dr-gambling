import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("characters").collect();
  },
});

export const available = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("characters").collect();
    return all.filter((c) => !c.claimedByUserId);
  },
});

export const myCharacter = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const character = await ctx.db
      .query("characters")
      .withIndex("byClaimedByUserId", (q) => q.eq("claimedByUserId", userId))
      .first();
    return character;
  },
});

export const claim = mutation({
  args: { characterId: v.id("characters") },
  handler: async (ctx, { characterId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check user doesn't already have a character
    const existing = await ctx.db
      .query("characters")
      .withIndex("byClaimedByUserId", (q) => q.eq("claimedByUserId", userId))
      .first();
    if (existing) throw new Error("You already have a character");

    // Check character is unclaimed
    const character = await ctx.db.get(characterId);
    if (!character) throw new Error("Character not found");
    if (character.claimedByUserId) throw new Error("Character already claimed");

    await ctx.db.patch(characterId, { claimedByUserId: userId });
    return character.name;
  },
});

export const release = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const character = await ctx.db
      .query("characters")
      .withIndex("byClaimedByUserId", (q) => q.eq("claimedByUserId", userId))
      .first();
    if (!character) throw new Error("No character to release");

    await ctx.db.patch(character._id, { claimedByUserId: undefined });
    return character.name;
  },
});

export const swap = mutation({
  args: { newCharacterId: v.id("characters") },
  handler: async (ctx, { newCharacterId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Release current
    const current = await ctx.db
      .query("characters")
      .withIndex("byClaimedByUserId", (q) => q.eq("claimedByUserId", userId))
      .first();
    if (current) {
      await ctx.db.patch(current._id, { claimedByUserId: undefined });
    }

    // Claim new
    const newChar = await ctx.db.get(newCharacterId);
    if (!newChar) throw new Error("Character not found");
    if (newChar.claimedByUserId) throw new Error("Character already claimed");

    await ctx.db.patch(newCharacterId, { claimedByUserId: userId });
    return newChar.name;
  },
});
