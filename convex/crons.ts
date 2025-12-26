import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Process recurring transactions every day at 1 AM
 */
crons.daily(
  "process recurring transactions",
  { hourUTC: 1, minuteUTC: 0 },
  internal.recurringProcessor.processRecurringTransactions
);

export default crons;

