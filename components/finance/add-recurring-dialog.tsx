"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Id } from "@/convex/_generated/dataModel";

interface AddRecurringDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddRecurringDialog({ open, onOpenChange }: AddRecurringDialogProps) {
  const createRecurring = useMutation(api.recurring.createRecurringTemplate);
  const accounts = useQuery(api.accounts.listAccounts, {});
  const categories = useQuery(api.categories.listCategories, {});

  const [accountId, setAccountId] = useState<Id<"accounts"> | "">("");
  const [categoryId, setCategoryId] = useState<Id<"categories"> | "">("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [templateAmount, setTemplateAmount] = useState("");
  const [kind, setKind] = useState<"expense" | "income">("expense");
  const [isBusiness, setIsBusiness] = useState(false);
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [interval, setInterval] = useState("1");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountId || !categoryId) {
      alert("Please select an account and category");
      return;
    }

    setIsLoading(true);

    try {
      await createRecurring({
        accountId: accountId as Id<"accounts">,
        categoryId: categoryId as Id<"categories">,
        startDate: new Date(startDate).getTime(),
        endDate: endDate ? new Date(endDate).getTime() : undefined,
        templateAmount: parseFloat(templateAmount),
        kind,
        isBusiness,
        description,
        frequency,
        interval: parseInt(interval),
        dayOfMonth: frequency === "monthly" ? parseInt(dayOfMonth) : undefined,
      });

      // Reset and close
      setAccountId("");
      setCategoryId("");
      setStartDate(new Date().toISOString().split("T")[0]);
      setEndDate("");
      setTemplateAmount("");
      setKind("expense");
      setIsBusiness(false);
      setDescription("");
      setFrequency("monthly");
      setInterval("1");
      setDayOfMonth("1");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating recurring transaction:", error);
      alert("Failed to create recurring transaction. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const expenseCategories = categories?.filter((c) => c.kind === "expense") || [];
  const incomeCategories = categories?.filter((c) => c.kind === "income") || [];
  const relevantCategories = kind === "expense" ? expenseCategories : incomeCategories;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Recurring Transaction</DialogTitle>
          <DialogDescription>
            Set up automatic recurring income or expense
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="kind">Type</Label>
            <Select value={kind} onValueChange={(v: any) => setKind(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="account">Account</Label>
            <Select value={accountId} onValueChange={(v) => setAccountId(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts?.map((account) => (
                  <SelectItem key={account._id} value={account._id}>
                    {account.name} ({account.isBusiness ? "Business" : "Personal"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {relevantCategories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Netflix Subscription"
              required
            />
          </div>

          <div>
            <Label htmlFor="templateAmount">Amount (₹)</Label>
            <Input
              id="templateAmount"
              type="number"
              step="0.01"
              value={templateAmount}
              onChange={(e) => setTemplateAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="interval">
              Repeat every (e.g., 1 = every month, 2 = every 2 months)
            </Label>
            <Input
              id="interval"
              type="number"
              min="1"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              required
            />
          </div>

          {frequency === "monthly" && (
            <div>
              <Label htmlFor="dayOfMonth">Day of Month (1-31)</Label>
              <Input
                id="dayOfMonth"
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="endDate">End Date (optional)</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isBusiness"
              checked={isBusiness}
              onChange={(e) => setIsBusiness(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="isBusiness" className="cursor-pointer">
              Business transaction
            </Label>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Recurring Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

