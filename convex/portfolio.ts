import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getPositions = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, { status }) => {
    if (status) {
      return await ctx.db
        .query("positions")
        .withIndex("byStatus", (q) => q.eq("status", status as "open" | "closed"))
        .collect();
    }
    return await ctx.db.query("positions").collect();
  },
});

export const getTrades = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query("trades")
      .order("desc")
      .take(limit ?? 50);
  },
});

export const getPensionFund = query({
  args: {},
  handler: async (ctx) => {
    const pension = await ctx.db.query("pensionFund").first();
    if (!pension) return null;

    // Calculate total unrealized P&L from open positions
    const openPositions = await ctx.db
      .query("positions")
      .withIndex("byStatus", (q) => q.eq("status", "open"))
      .collect();
    const unrealizedPnl = openPositions.reduce((sum, p) => sum + p.pnl, 0);

    return {
      ...pension,
      unrealizedPnl,
      effectiveBalance: pension.balance + unrealizedPnl,
      positionCount: openPositions.length,
    };
  },
});

export const placeTrade = mutation({
  args: {
    ticker: v.string(),
    action: v.union(
      v.literal("buy"),
      v.literal("sell"),
      v.literal("short"),
      v.literal("cover")
    ),
    quantity: v.number(),
    reasoning: v.optional(v.string()),
  },
  handler: async (ctx, { ticker, action, quantity, reasoning }) => {
    // Get current price
    const ceo = await ctx.db
      .query("ceos")
      .withIndex("byTicker", (q) => q.eq("ticker", ticker))
      .first();
    if (!ceo) throw new Error(`Unknown ticker: ${ticker}`);

    const state = await ctx.db.query("simulationState").first();
    const simTime = state?.simTime ?? Date.now();
    const price = ceo.stockPrice;

    // Get pension fund
    const pension = await ctx.db.query("pensionFund").first();
    if (!pension) throw new Error("Pension fund not found");

    const cost = price * quantity;

    if (action === "short" || action === "buy") {
      // Check if pension can afford it
      if (cost > pension.balance - pension.allocatedToPositions) {
        throw new Error(
          `Insufficient funds. Need $${cost.toFixed(2)}, available: $${(pension.balance - pension.allocatedToPositions).toFixed(2)}`
        );
      }

      // Open new position
      const positionId = await ctx.db.insert("positions", {
        ticker,
        type: action === "short" ? "short" : "long",
        quantity,
        entryPrice: price,
        currentPrice: price,
        pnl: 0,
        status: "open",
        openedAt: simTime,
        reasoning,
      });

      // Allocate pension funds
      await ctx.db.patch(pension._id, {
        allocatedToPositions: pension.allocatedToPositions + cost,
      });

      // Record trade
      await ctx.db.insert("trades", {
        positionId,
        ticker,
        action,
        quantity,
        price,
        simTime,
      });

      // Auto-post to chat
      await ctx.db.insert("chatMessages", {
        sender: "SYSTEM",
        content: `📊 TRADE EXECUTED: Dr. Gambling ${action === "short" ? "shorted" : "bought"} ${quantity} shares of ${ticker} at $${price.toFixed(2)} ($${cost.toFixed(2)} total)`,
        messageType: "trade_alert",
        simTime,
        createdAt: Date.now(),
      });

      return { status: "opened", positionId, cost };
    } else {
      // Close position (sell or cover)
      const positionType = action === "cover" ? "short" : "long";
      const openPosition = await ctx.db
        .query("positions")
        .withIndex("byTicker", (q) => q.eq("ticker", ticker))
        .filter((q) =>
          q.and(
            q.eq(q.field("type"), positionType),
            q.eq(q.field("status"), "open")
          )
        )
        .first();

      if (!openPosition) {
        throw new Error(`No open ${positionType} position on ${ticker}`);
      }

      const finalPnl =
        positionType === "short"
          ? (openPosition.entryPrice - price) * openPosition.quantity
          : (price - openPosition.entryPrice) * openPosition.quantity;

      await ctx.db.patch(openPosition._id, {
        status: "closed",
        currentPrice: price,
        pnl: finalPnl,
        closedAt: simTime,
      });

      // Return funds + P&L to pension
      const allocated = openPosition.entryPrice * openPosition.quantity;
      await ctx.db.patch(pension._id, {
        balance: pension.balance + finalPnl,
        allocatedToPositions: pension.allocatedToPositions - allocated,
      });

      await ctx.db.insert("trades", {
        positionId: openPosition._id,
        ticker,
        action,
        quantity: openPosition.quantity,
        price,
        simTime,
      });

      const emoji = finalPnl >= 0 ? "💰" : "🔥";
      await ctx.db.insert("chatMessages", {
        sender: "SYSTEM",
        content: `${emoji} POSITION CLOSED: Dr. Gambling ${action === "cover" ? "covered" : "sold"} ${ticker}. P&L: ${finalPnl >= 0 ? "+" : ""}$${finalPnl.toFixed(2)}`,
        messageType: "trade_alert",
        simTime,
        createdAt: Date.now(),
      });

      return { status: "closed", pnl: finalPnl };
    }
  },
});

// Summary for dashboard
export const getSummary = query({
  args: {},
  handler: async (ctx) => {
    const openPositions = await ctx.db
      .query("positions")
      .withIndex("byStatus", (q) => q.eq("status", "open"))
      .collect();

    const totalUnrealized = openPositions.reduce((sum, p) => sum + p.pnl, 0);

    const closedPositions = await ctx.db
      .query("positions")
      .withIndex("byStatus", (q) => q.eq("status", "closed"))
      .collect();

    const totalRealized = closedPositions.reduce((sum, p) => sum + p.pnl, 0);

    return {
      openPositions: openPositions.length,
      totalUnrealizedPnl: totalUnrealized,
      closedPositions: closedPositions.length,
      totalRealizedPnl: totalRealized,
      positions: openPositions,
    };
  },
});
