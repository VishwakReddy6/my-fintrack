import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

/**
 * List all accounts for the current user
 */
export const listAccounts = query({
  args: {
    isBusiness: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    let accountsQuery = ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("archived"), false));

    if (args.isBusiness !== undefined) {
      accountsQuery = accountsQuery.filter((q) =>
        q.eq(q.field("isBusiness"), args.isBusiness)
      );
    }

    return await accountsQuery.collect();
  },
});

/**
 * Get a single account by ID
 */
export const getAccount = query({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const account = await ctx.db.get(args.id);
    if (!account || account.userId !== userId) {
      throw new Error("Account not found");
    }

    return account;
  },
});

/**
 * Create a new account
 */
export const createAccount = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("savings"),
      v.literal("current"),
      v.literal("credit_card"),
      v.literal("cash"),
      v.literal("other")
    ),
    isBusiness: v.boolean(),
    currency: v.optional(v.string()),
    initialBalance: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("accounts", {
      userId,
      name: args.name,
      type: args.type,
      isBusiness: args.isBusiness,
      currency: args.currency || "INR",
      initialBalance: args.initialBalance,
      currentBalance: args.initialBalance,
      archived: false,
      createdAt: Date.now(),
    });
  },
});

/**
 * Update an account
 */
export const updateAccount = mutation({
  args: {
    id: v.id("accounts"),
    name: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("savings"),
        v.literal("current"),
        v.literal("credit_card"),
        v.literal("cash"),
        v.literal("other")
      )
    ),
    isBusiness: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const account = await ctx.db.get(args.id);
    if (!account || account.userId !== userId) {
      throw new Error("Account not found");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.type !== undefined) updates.type = args.type;
    if (args.isBusiness !== undefined) updates.isBusiness = args.isBusiness;

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

/**
 * Archive an account
 */
export const archiveAccount = mutation({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const account = await ctx.db.get(args.id);
    if (!account || account.userId !== userId) {
      throw new Error("Account not found");
    }

    await ctx.db.patch(args.id, { archived: true });
    return args.id;
  },
});

/**
 * Update account balance (called internally by transaction mutations)
 */
export const updateBalance = mutation({
  args: {
    accountId: v.id("accounts"),
    amount: v.number(),
    isIncome: v.boolean(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    const delta = args.isIncome ? args.amount : -args.amount;
    const newBalance = account.currentBalance + delta;

    await ctx.db.patch(args.accountId, {
      currentBalance: newBalance,
    });

    return newBalance;
  },
});


