import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

/**
 * List categories for the current user (including global defaults)
 */
export const listCategories = query({
  args: {
    kind: v.optional(v.union(v.literal("expense"), v.literal("income"))),
    scope: v.optional(
      v.union(v.literal("personal"), v.literal("business"), v.literal("both"))
    ),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get user-specific and global categories
    let categories = await ctx.db
      .query("categories")
      .filter((q) =>
        q.or(q.eq(q.field("userId"), userId), q.eq(q.field("userId"), undefined))
      )
      .collect();

    // Apply filters
    if (args.kind) {
      categories = categories.filter((c) => c.kind === args.kind);
    }
    if (args.scope) {
      categories = categories.filter(
        (c) => c.scope === args.scope || c.scope === "both"
      );
    }

    return categories;
  },
});

/**
 * Create a new category
 */
export const createCategory = mutation({
  args: {
    label: v.string(),
    slug: v.string(),
    kind: v.union(v.literal("expense"), v.literal("income")),
    scope: v.union(v.literal("personal"), v.literal("business"), v.literal("both")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if category with same slug exists
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_user_slug", (q) =>
        q.eq("userId", userId).eq("slug", args.slug)
      )
      .first();

    if (existing) {
      throw new Error("Category with this slug already exists");
    }

    return await ctx.db.insert("categories", {
      userId,
      label: args.label,
      slug: args.slug,
      kind: args.kind,
      scope: args.scope,
      createdAt: Date.now(),
    });
  },
});

/**
 * Update a category
 */
export const updateCategory = mutation({
  args: {
    id: v.id("categories"),
    label: v.optional(v.string()),
    scope: v.optional(
      v.union(v.literal("personal"), v.literal("business"), v.literal("both"))
    ),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const category = await ctx.db.get(args.id);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found or not owned by user");
    }

    const updates: any = {};
    if (args.label !== undefined) updates.label = args.label;
    if (args.scope !== undefined) updates.scope = args.scope;

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

/**
 * Seed default categories for a new user
 */
export const seedDefaultCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user already has categories
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      return; // Already seeded
    }

    const defaultCategories = [
      // Personal Expenses
      { label: "Food & Dining", slug: "food-dining", kind: "expense" as const, scope: "personal" as const },
      { label: "Groceries", slug: "groceries", kind: "expense" as const, scope: "personal" as const },
      { label: "Transportation", slug: "transportation", kind: "expense" as const, scope: "personal" as const },
      { label: "Utilities", slug: "utilities", kind: "expense" as const, scope: "both" as const },
      { label: "Rent/Mortgage", slug: "rent-mortgage", kind: "expense" as const, scope: "personal" as const },
      { label: "Healthcare", slug: "healthcare", kind: "expense" as const, scope: "personal" as const },
      { label: "Entertainment", slug: "entertainment", kind: "expense" as const, scope: "personal" as const },
      { label: "Shopping", slug: "shopping", kind: "expense" as const, scope: "personal" as const },
      { label: "Education", slug: "education", kind: "expense" as const, scope: "personal" as const },
      { label: "Subscriptions", slug: "subscriptions", kind: "expense" as const, scope: "both" as const },
      
      // Business Expenses
      { label: "Office Supplies", slug: "office-supplies", kind: "expense" as const, scope: "business" as const },
      { label: "Marketing", slug: "marketing", kind: "expense" as const, scope: "business" as const },
      { label: "Software/Tools", slug: "software-tools", kind: "expense" as const, scope: "business" as const },
      { label: "Professional Services", slug: "professional-services", kind: "expense" as const, scope: "business" as const },
      
      // Income
      { label: "Salary", slug: "salary", kind: "income" as const, scope: "personal" as const },
      { label: "Business Income", slug: "business-income", kind: "income" as const, scope: "business" as const },
      { label: "Investment", slug: "investment", kind: "income" as const, scope: "both" as const },
      { label: "Other Income", slug: "other-income", kind: "income" as const, scope: "both" as const },
    ];

    for (const cat of defaultCategories) {
      await ctx.db.insert("categories", {
        userId,
        ...cat,
        createdAt: Date.now(),
      });
    }
  },
});

