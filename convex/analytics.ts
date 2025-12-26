import { v } from "convex/values";
import { query } from "./_generated/server";
import { auth } from "./auth";

/**
 * Get dashboard summary with key metrics
 */
export const getDashboardSummary = query({
  args: {
    scope: v.optional(
      v.union(v.literal("personal"), v.literal("business"), v.literal("both"))
    ),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get all accounts
    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("archived"), false))
      .collect();

    const filteredAccounts =
      args.scope && args.scope !== "both"
        ? accounts.filter((a) => a.isBusiness === (args.scope === "business"))
        : accounts;

    // Calculate total balance
    const totalBalance = filteredAccounts.reduce(
      (sum, acc) => sum + acc.currentBalance,
      0
    );

    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    ).getTime();

    // Get this month's transactions
    let transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), startOfMonth),
          q.lte(q.field("date"), endOfMonth)
        )
      )
      .collect();

    if (args.scope && args.scope !== "both") {
      transactions = transactions.filter(
        (t) => t.isBusiness === (args.scope === "business")
      );
    }

    // Calculate income and expenses
    const monthIncome = transactions
      .filter((t) => t.kind === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const monthExpenses = transactions
      .filter((t) => t.kind === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalBalance,
      monthIncome,
      monthExpenses,
      netCashFlow: monthIncome - monthExpenses,
      transactionCount: transactions.length,
    };
  },
});

/**
 * Get spending by category for a date range
 */
export const getSpendingByCategory = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    scope: v.optional(
      v.union(v.literal("personal"), v.literal("business"), v.literal("both"))
    ),
    kind: v.optional(v.union(v.literal("expense"), v.literal("income"))),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    let transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();

    // Apply filters
    if (args.scope && args.scope !== "both") {
      transactions = transactions.filter(
        (t) => t.isBusiness === (args.scope === "business")
      );
    }
    if (args.kind) {
      transactions = transactions.filter((t) => t.kind === args.kind);
    }

    // Group by category
    const categoryMap = new Map<string, { amount: number; count: number; label: string }>();

    for (const transaction of transactions) {
      const category = await ctx.db.get(transaction.categoryId);
      const categoryLabel = category?.label || "Uncategorized";

      const existing = categoryMap.get(transaction.categoryId) || {
        amount: 0,
        count: 0,
        label: categoryLabel,
      };

      categoryMap.set(transaction.categoryId, {
        amount: existing.amount + transaction.amount,
        count: existing.count + 1,
        label: categoryLabel,
      });
    }

    // Convert to array and sort by amount
    const result = Array.from(categoryMap.entries())
      .map(([categoryId, data]) => ({
        categoryId,
        ...data,
      }))
      .sort((a, b) => b.amount - a.amount);

    return result;
  },
});

/**
 * Get cash flow over time (monthly)
 */
export const getCashFlowTimeSeries = query({
  args: {
    months: v.number(), // How many months back
    scope: v.optional(
      v.union(v.literal("personal"), v.literal("business"), v.literal("both"))
    ),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = new Date();
    const results = [];

    for (let i = args.months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();

      const startOfMonth = new Date(year, month, 1).getTime();
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59).getTime();

      let transactions = await ctx.db
        .query("transactions")
        .withIndex("by_user_date", (q) => q.eq("userId", userId))
        .filter((q) =>
          q.and(
            q.gte(q.field("date"), startOfMonth),
            q.lte(q.field("date"), endOfMonth)
          )
        )
        .collect();

      if (args.scope && args.scope !== "both") {
        transactions = transactions.filter(
          (t) => t.isBusiness === (args.scope === "business")
        );
      }

      const income = transactions
        .filter((t) => t.kind === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = transactions
        .filter((t) => t.kind === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      results.push({
        yearMonth: `${year}-${String(month + 1).padStart(2, "0")}`,
        income,
        expenses,
        net: income - expenses,
      });
    }

    return results;
  },
});

/**
 * Get account balances breakdown
 */
export const getAccountBalances = query({
  args: {
    scope: v.optional(
      v.union(v.literal("personal"), v.literal("business"), v.literal("both"))
    ),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    let accounts = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("archived"), false))
      .collect();

    if (args.scope && args.scope !== "both") {
      accounts = accounts.filter(
        (a) => a.isBusiness === (args.scope === "business")
      );
    }

    // Group by type
    const typeMap = new Map<
      string,
      { balance: number; count: number; accounts: typeof accounts }
    >();

    for (const account of accounts) {
      const existing = typeMap.get(account.type) || {
        balance: 0,
        count: 0,
        accounts: [],
      };

      typeMap.set(account.type, {
        balance: existing.balance + account.currentBalance,
        count: existing.count + 1,
        accounts: [...existing.accounts, account],
      });
    }

    return Array.from(typeMap.entries()).map(([type, data]) => ({
      type,
      ...data,
    }));
  },
});

/**
 * Get recent transactions for dashboard
 */
export const getRecentTransactions = query({
  args: {
    limit: v.optional(v.number()),
    scope: v.optional(
      v.union(v.literal("personal"), v.literal("business"), v.literal("both"))
    ),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    let transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit || 10);

    if (args.scope && args.scope !== "both") {
      transactions = transactions.filter(
        (t) => t.isBusiness === (args.scope === "business")
      );
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

