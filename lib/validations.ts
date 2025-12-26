import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(1, "Account name is required").max(100),
  type: z.enum(["savings", "current", "credit_card", "cash", "other"]),
  isBusiness: z.boolean(),
  initialBalance: z.number().finite(),
  currency: z.string().default("INR"),
});

export const transactionSchema = z.object({
  accountId: z.string(),
  categoryId: z.string(),
  date: z.number().positive(),
  amount: z.number().positive("Amount must be greater than 0"),
  kind: z.enum(["expense", "income"]),
  isBusiness: z.boolean(),
  description: z.string().min(1, "Description is required").max(200),
  notes: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
});

export const budgetSchema = z.object({
  categoryId: z.string(),
  yearMonth: z.string().regex(/^\d{4}-\d{2}$/, "Invalid year-month format"),
  amount: z.number().positive("Budget amount must be greater than 0"),
  scope: z.enum(["personal", "business", "both"]),
});

export const recurringTransactionSchema = z.object({
  accountId: z.string(),
  categoryId: z.string(),
  templateAmount: z.number().positive("Amount must be greater than 0"),
  kind: z.enum(["expense", "income"]),
  isBusiness: z.boolean(),
  description: z.string().min(1, "Description is required").max(200),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  interval: z.number().int().positive(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  startDate: z.number().positive(),
  endDate: z.number().positive().optional(),
});

export type AccountInput = z.infer<typeof accountSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;
export type RecurringTransactionInput = z.infer<typeof recurringTransactionSchema>;


