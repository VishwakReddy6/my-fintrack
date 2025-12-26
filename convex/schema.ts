import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    displayName: v.string(),
    role: v.union(v.literal("user"), v.literal("admin")),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  accounts: defineTable({
    userId: v.id("users"),
    name: v.string(),
    type: v.union(
      v.literal("savings"),
      v.literal("current"),
      v.literal("credit_card"),
      v.literal("cash"),
      v.literal("other")
    ),
    isBusiness: v.boolean(),
    currency: v.string(),
    initialBalance: v.number(),
    currentBalance: v.number(),
    archived: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_business", ["userId", "isBusiness"]),

  categories: defineTable({
    userId: v.optional(v.id("users")), // nullable for global defaults
    label: v.string(),
    slug: v.string(),
    kind: v.union(v.literal("expense"), v.literal("income")),
    scope: v.union(v.literal("personal"), v.literal("business"), v.literal("both")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_slug", ["userId", "slug"]),

  transactions: defineTable({
    userId: v.id("users"),
    accountId: v.id("accounts"),
    categoryId: v.id("categories"),
    date: v.number(),
    amount: v.number(),
    kind: v.union(v.literal("expense"), v.literal("income")),
    isBusiness: v.boolean(),
    description: v.string(),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    recurringTemplateId: v.optional(v.id("recurringTransactions")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_account", ["accountId"])
    .index("by_category", ["categoryId"])
    .index("by_user_date", ["userId", "date"])
    .index("by_user_business", ["userId", "isBusiness"]),

  budgets: defineTable({
    userId: v.id("users"),
    categoryId: v.id("categories"),
    yearMonth: v.string(), // e.g., "2025-12"
    amount: v.number(),
    scope: v.union(v.literal("personal"), v.literal("business"), v.literal("both")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_month", ["userId", "yearMonth"])
    .index("by_category_month", ["categoryId", "yearMonth"]),

  recurringTransactions: defineTable({
    userId: v.id("users"),
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
    interval: v.number(), // e.g., every 1 month, 2 weeks
    dayOfMonth: v.optional(v.number()), // for monthly (1-31)
    dayOfWeek: v.optional(v.number()), // for weekly (0-6)
    nextOccurrence: v.number(),
    endDate: v.optional(v.number()),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_active_next", ["active", "nextOccurrence"]),
});

