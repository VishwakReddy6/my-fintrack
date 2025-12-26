import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./_generated/dataModel";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password],
});

/**
 * Helper to get the current authenticated user or throw an error
 */
export async function getCurrentUserOrThrow(
  ctx: { auth: typeof auth }
): Promise<string> {
  const userId = await ctx.auth.getUserIdentity();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId.subject;
}

/**
 * Helper to get user profile from auth identity
 */
export async function getUserProfile(
  ctx: any,
  userId: string
): Promise<any | null> {
  const user = await ctx.db
    .query("users")
    .filter((q: any) => q.eq(q.field("_id"), userId))
    .first();
  return user;
}

