import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

/**
 * List all recurring transactions for the user
 */
export const listRecurringTransactions = query({
  args: {
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    let recurring = await ctx.db
      .query("recurringTransactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (args.active !== undefined) {
      recurring = recurring.filter((r) => r.active === args.active);
    }

    // Enrich with account and category data
    const enriched = await Promise.all(
      recurring.map(async (r) => {
        const account = await ctx.db.get(r.accountId);
        const category = await ctx.db.get(r.categoryId);
        return {
          ...r,
          account,
          category,
        };
      })
    );

    return enriched;
  },
});

/**
 * Create a recurring transaction template
 */
export const createRecurringTemplate = mutation({
  args: {
    accountId: v.id("accounts"),
    categoryId: v.id("categories"),
    templateAmount: v.number(),
    kind: v.union(v.literal("expense"), v.literal("income")),
    isBusiness: v.boolean(),
    description: v.string(),
    frequency: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("yearly")
    ),
    interval: v.number(),
    dayOfMonth: v.optional(v.number()),
    dayOfWeek: v.optional(v.number()),
    startDate: v.number(),
    endDate: v.optional(v.number()),
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

    return await ctx.db.insert("recurringTransactions", {
      userId,
      accountId: args.accountId,
      categoryId: args.categoryId,
      templateAmount: args.templateAmount,
      kind: args.kind,
      isBusiness: args.isBusiness,
      description: args.description,
      frequency: args.frequency,
      interval: args.interval,
      dayOfMonth: args.dayOfMonth,
      dayOfWeek: args.dayOfWeek,
      nextOccurrence: args.startDate,
      endDate: args.endDate,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update a recurring transaction template
 */
export const updateRecurringTemplate = mutation({
  args: {
    id: v.id("recurringTransactions"),
    templateAmount: v.optional(v.number()),
    description: v.optional(v.string()),
    frequency: v.optional(
      v.union(
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly"),
        v.literal("yearly")
      )
    ),
    interval: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const recurring = await ctx.db.get(args.id);
    if (!recurring || recurring.userId !== userId) {
      throw new Error("Recurring transaction not found");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.templateAmount !== undefined)
      updates.templateAmount = args.templateAmount;
    if (args.description !== undefined) updates.description = args.description;
    if (args.frequency !== undefined) updates.frequency = args.frequency;
    if (args.interval !== undefined) updates.interval = args.interval;
    if (args.endDate !== undefined) updates.endDate = args.endDate;

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

/**
 * Pause/resume a recurring transaction
 */
export const toggleRecurringTransaction = mutation({
  args: {
    id: v.id("recurringTransactions"),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const recurring = await ctx.db.get(args.id);
    if (!recurring || recurring.userId !== userId) {
      throw new Error("Recurring transaction not found");
    }

    await ctx.db.patch(args.id, {
      active: args.active,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Delete a recurring transaction template
 */
export const deleteRecurringTemplate = mutation({
  args: { id: v.id("recurringTransactions") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const recurring = await ctx.db.get(args.id);
    if (!recurring || recurring.userId !== userId) {
      throw new Error("Recurring transaction not found");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

