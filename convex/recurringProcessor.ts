import { internalMutation } from "./_generated/server";

/**
 * Internal mutation to process recurring transactions
 * This is called by the cron job
 */
export const processRecurringTransactions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get all active recurring transactions that are due
    const dueRecurring = await ctx.db
      .query("recurringTransactions")
      .withIndex("by_active_next", (q) => q.eq("active", true))
      .filter((q) => q.lte(q.field("nextOccurrence"), now))
      .collect();

    console.log(`Processing ${dueRecurring.length} recurring transactions`);

    for (const recurring of dueRecurring) {
      // Check if end date has passed
      if (recurring.endDate && recurring.endDate < now) {
        await ctx.db.patch(recurring._id, { active: false });
        continue;
      }

      try {
        // Create the transaction
        const transactionId = await ctx.db.insert("transactions", {
          userId: recurring.userId,
          accountId: recurring.accountId,
          categoryId: recurring.categoryId,
          date: recurring.nextOccurrence,
          amount: recurring.templateAmount,
          kind: recurring.kind,
          isBusiness: recurring.isBusiness,
          description: recurring.description,
          recurringTemplateId: recurring._id,
          createdAt: now,
          updatedAt: now,
        });

        // Update account balance
        const account = await ctx.db.get(recurring.accountId);
        if (account) {
          const delta =
            recurring.kind === "income"
              ? recurring.templateAmount
              : -recurring.templateAmount;
          await ctx.db.patch(recurring.accountId, {
            currentBalance: account.currentBalance + delta,
          });
        }

        // Calculate next occurrence
        let nextOccurrence = recurring.nextOccurrence;

        switch (recurring.frequency) {
          case "daily":
            nextOccurrence += recurring.interval * 24 * 60 * 60 * 1000;
            break;
          case "weekly":
            nextOccurrence += recurring.interval * 7 * 24 * 60 * 60 * 1000;
            break;
          case "monthly":
            const date = new Date(nextOccurrence);
            date.setMonth(date.getMonth() + recurring.interval);
            // If dayOfMonth is set, use it
            if (recurring.dayOfMonth) {
              date.setDate(recurring.dayOfMonth);
            }
            nextOccurrence = date.getTime();
            break;
          case "yearly":
            const yearDate = new Date(nextOccurrence);
            yearDate.setFullYear(yearDate.getFullYear() + recurring.interval);
            nextOccurrence = yearDate.getTime();
            break;
        }

        // Update next occurrence
        await ctx.db.patch(recurring._id, {
          nextOccurrence,
          updatedAt: now,
        });

        console.log(`Created transaction ${transactionId} from recurring ${recurring._id}`);
      } catch (error) {
        console.error(`Error processing recurring transaction ${recurring._id}:`, error);
      }
    }

    return { processed: dueRecurring.length };
  },
});


