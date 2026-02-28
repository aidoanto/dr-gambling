import { query } from "./_generated/server";
import { v } from "convex/values";

export const listCeos = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("ceos").collect();
  },
});

export const getCeo = query({
  args: { id: v.id("ceos") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getPriceHistory = query({
  args: { ticker: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { ticker, limit }) => {
    const prices = await ctx.db
      .query("stockPrices")
      .withIndex("byTickerAndTime", (q) => q.eq("ticker", ticker))
      .order("desc")
      .take(limit ?? 100);
    return prices.reverse();
  },
});

export const getLatestPrices = query({
  args: {},
  handler: async (ctx) => {
    const ceos = await ctx.db.query("ceos").collect();
    return ceos.map((ceo) => ({
      ticker: ceo.ticker,
      name: ceo.name,
      company: ceo.company,
      price: ceo.stockPrice,
      status: ceo.status,
    }));
  },
});

export const listPredictionMarkets = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("predictionMarkets")
      .filter((q) => q.eq(q.field("resolution"), undefined))
      .collect();
  },
});
