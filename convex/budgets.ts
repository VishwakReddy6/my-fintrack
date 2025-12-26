import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

/**
 * List budgets for a specific month
 */
export const listBudgetsForMonth = query({
  args: {
    yearMonth: v.string(),
    scope: v.optional(
      v.union(v.literal("personal"), v.literal("business"), v.literal("both"))
    ),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    let budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", userId).eq("yearMonth", args.yearMonth)
      )
      .collect();

    if (args.scope) {
      budgets = budgets.filter(
        (b) => b.scope === args.scope || b.scope === "both"
      );
    }

    // Enrich with category data
    const enriched = await Promise.all(
      budgets.map(async (b) => {
        const category = await ctx.db.get(b.categoryId);
        return {
          ...b,
          category,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get budget vs actual spending for a category in a month
 */
export const getBudgetVsActual = query({
  args: {
    yearMonth: v.string(),
    scope: v.optional(
      v.union(v.literal("personal"), v.literal("business"), v.literal("both"))
    ),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get all budgets for the month
    let budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", userId).eq("yearMonth", args.yearMonth)
      )
      .collect();

    if (args.scope) {
      budgets = budgets.filter(
        (b) => b.scope === args.scope || b.scope === "both"
      );
    }

    // Parse yearMonth to get date range
    const [year, month] = args.yearMonth.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1).getTime();
    const endDate = new Date(year, month, 0, 23, 59, 59).getTime();

    // Get all expense transactions for the month
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), startDate),
          q.lte(q.field("date"), endDate),
          q.eq(q.field("kind"), "expense")
        )
      )
      .collect();

    // Calculate actual spending per category
    const results = await Promise.all(
      budgets.map(async (budget) => {
        const category = await ctx.db.get(budget.categoryId);
        
        const categoryTransactions = transactions.filter(
          (t) => t.categoryId === budget.categoryId
        );

        const actualSpent = categoryTransactions.reduce(
          (sum, t) => sum + t.amount,
          0
        );

        const percentage =
          budget.amount > 0 ? (actualSpent / budget.amount) * 100 : 0;

        return {
          categoryId: budget.categoryId,
          categoryLabel: category?.label || "Unknown",
          budgeted: budget.amount,
          spent: actualSpent,
          remaining: budget.amount - actualSpent,
          percentage,
          isOverBudget: actualSpent > budget.amount,
        };
      })
    );

    return results;
  },
});

/**
 * Create or update a budget
 */
export const upsertBudget = mutation({
  args: {
    categoryId: v.id("categories"),
    yearMonth: v.string(),
    amount: v.number(),
    scope: v.union(v.literal("personal"), v.literal("business"), v.literal("both")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if budget already exists
    const existing = await ctx.db
      .query("budgets")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", userId).eq("yearMonth", args.yearMonth)
      )
      .filter((q) => q.eq(q.field("categoryId"), args.categoryId))
      .first();

    if (existing) {
      // Update
      await ctx.db.patch(existing._id, {
        amount: args.amount,
        scope: args.scope,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      // Create
      return await ctx.db.insert("budgets", {
        userId,
        categoryId: args.categoryId,
        yearMonth: args.yearMonth,
        amount: args.amount,
        scope: args.scope,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

/**
 * Delete a budget
 */
export const deleteBudget = mutation({
  args: { id: v.id("budgets") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const budget = await ctx.db.get(args.id);
    if (!budget || budget.userId !== userId) {
      throw new Error("Budget not found");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

/**
 * Copy budgets from one month to another
 */
export const copyBudgets = mutation({
  args: {
    fromMonth: v.string(),
    toMonth: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const sourceBudgets = await ctx.db
      .query("budgets")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", userId).eq("yearMonth", args.fromMonth)
      )
      .collect();

    for (const budget of sourceBudgets) {
      // Check if target budget already exists
      const existing = await ctx.db
        .query("budgets")
        .withIndex("by_user_month", (q) =>
          q.eq("userId", userId).eq("yearMonth", args.toMonth)
        )
        .filter((q) => q.eq(q.field("categoryId"), budget.categoryId))
        .first();

      if (!existing) {
        await ctx.db.insert("budgets", {
          userId,
          categoryId: budget.categoryId,
          yearMonth: args.toMonth,
          amount: budget.amount,
          scope: budget.scope,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    return { copied: sourceBudgets.length };
  },
});


