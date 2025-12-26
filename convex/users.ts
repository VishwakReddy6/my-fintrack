import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

/**
 * Get or create user profile
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    return user;
  },
});

/**
 * Create user profile after signup
 */
export const createUserProfile = mutation({
  args: {
    email: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user already exists
    const existing = await ctx.db.get(userId);
    if (existing) {
      return userId;
    }

    // Create user profile
    return await ctx.db.insert("users", {
      email: args.email,
      displayName: args.displayName,
      role: "user",
      createdAt: Date.now(),
    });
  },
});


