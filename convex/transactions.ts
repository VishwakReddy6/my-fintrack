import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

/**
 * List transactions with filters
 */
export const listTransactions = query({
  args: {
    accountId: v.optional(v.id("accounts")),
    categoryId: v.optional(v.id("categories")),
    isBusiness: v.optional(v.boolean()),
    kind: v.optional(v.union(v.literal("expense"), v.literal("income"))),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    let query = ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    let transactions = await query.collect();

    // Apply filters
    if (args.accountId) {
      transactions = transactions.filter((t) => t.accountId === args.accountId);
    }
    if (args.categoryId) {
      transactions = transactions.filter((t) => t.categoryId === args.categoryId);
    }
    if (args.isBusiness !== undefined) {
      transactions = transactions.filter((t) => t.isBusiness === args.isBusiness);
    }
    if (args.kind) {
      transactions = transactions.filter((t) => t.kind === args.kind);
    }
    if (args.startDate) {
      transactions = transactions.filter((t) => t.date >= args.startDate!);
    }
    if (args.endDate) {
      transactions = transactions.filter((t) => t.date <= args.endDate!);
    }

    // Sort by date descending
    transactions.sort((a, b) => b.date - a.date);

    // Apply limit
    if (args.limit) {
      transactions = transactions.slice(0, args.limit);
    }

    // Enrich with account and category data
    const enriched = await Promise.all(
      transactions.map(async (t) => {
        const account = await ctx.db.get(t.accountId);
        const category = await ctx.db.get(t.categoryId);
        return {
          ...t,
          account,
          category,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get a single transaction
 */
export const getTransaction = query({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const transaction = await ctx.db.get(args.id);
    if (!transaction || transaction.userId !== userId) {
      throw new Error("Transaction not found");
    }

    const account = await ctx.db.get(transaction.accountId);
    const category = await ctx.db.get(transaction.categoryId);

    return {
      ...transaction,
      account,
      category,
    };
  },
});

/**
 * Create a new transaction
 */
export const createTransaction = mutation({
  args: {
    accountId: v.id("accounts"),
    categoryId: v.id("categories"),
    date: v.number(),
    amount: v.number(),
    kind: v.union(v.literal("expense"), v.literal("income")),
    isBusiness: v.boolean(),
    description: v.string(),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify account ownership
    const account = await ctx.db.get(args.accountId);
    if (!account || account.userId !== userId) {
      throw new Error("Account not found");
    }

    // Create transaction
    const transactionId = await ctx.db.insert("transactions", {
      userId,
      accountId: args.accountId,
      categoryId: args.categoryId,
      date: args.date,
      amount: args.amount,
      kind: args.kind,
      isBusiness: args.isBusiness,
      description: args.description,
      notes: args.notes,
      tags: args.tags,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update account balance
    const delta = args.kind === "income" ? args.amount : -args.amount;
    await ctx.db.patch(args.accountId, {
      currentBalance: account.currentBalance + delta,
    });

    return transactionId;
  },
});

/**
 * Update a transaction
 */
export const updateTransaction = mutation({
  args: {
    id: v.id("transactions"),
    accountId: v.optional(v.id("accounts")),
    categoryId: v.optional(v.id("categories")),
    date: v.optional(v.number()),
    amount: v.optional(v.number()),
    kind: v.optional(v.union(v.literal("expense"), v.literal("income"))),
    isBusiness: v.optional(v.boolean()),
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const transaction = await ctx.db.get(args.id);
    if (!transaction || transaction.userId !== userId) {
      throw new Error("Transaction not found");
    }

    const oldAccount = await ctx.db.get(transaction.accountId);
    if (!oldAccount) {
      throw new Error("Old account not found");
    }

    // Reverse old transaction effect
    const oldDelta = transaction.kind === "income" ? transaction.amount : -transaction.amount;
    await ctx.db.patch(transaction.accountId, {
      currentBalance: oldAccount.currentBalance - oldDelta,
    });

    // Apply updates
    const updates: any = { updatedAt: Date.now() };
    if (args.accountId !== undefined) updates.accountId = args.accountId;
    if (args.categoryId !== undefined) updates.categoryId = args.categoryId;
    if (args.date !== undefined) updates.date = args.date;
    if (args.amount !== undefined) updates.amount = args.amount;
    if (args.kind !== undefined) updates.kind = args.kind;
    if (args.isBusiness !== undefined) updates.isBusiness = args.isBusiness;
    if (args.description !== undefined) updates.description = args.description;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.tags !== undefined) updates.tags = args.tags;

    await ctx.db.patch(args.id, updates);

    // Apply new transaction effect
    const newAccountId = args.accountId || transaction.accountId;
    const newAccount = await ctx.db.get(newAccountId);
    if (!newAccount) {
      throw new Error("New account not found");
    }

    const newAmount = args.amount ?? transaction.amount;
    const newKind = args.kind ?? transaction.kind;
    const newDelta = newKind === "income" ? newAmount : -newAmount;

    await ctx.db.patch(newAccountId, {
      currentBalance: newAccount.currentBalance + newDelta,
    });

    return args.id;
  },
});

/**
 * Delete a transaction
 */
export const deleteTransaction = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const transaction = await ctx.db.get(args.id);
    if (!transaction || transaction.userId !== userId) {
      throw new Error("Transaction not found");
    }

    const account = await ctx.db.get(transaction.accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    // Reverse transaction effect
    const delta = transaction.kind === "income" ? transaction.amount : -transaction.amount;
    await ctx.db.patch(transaction.accountId, {
      currentBalance: account.currentBalance - delta,
    });

    await ctx.db.delete(args.id);
    return args.id;
  },
});

