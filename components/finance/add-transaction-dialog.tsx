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

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTransactionDialog({ open, onOpenChange }: AddTransactionDialogProps) {
  const createTransaction = useMutation(api.transactions.createTransaction);
  const seedCategories = useMutation(api.categories.seedDefaultCategories);
  const accounts = useQuery(api.accounts.listAccounts, {});
  const categories = useQuery(api.categories.listCategories, {});

  const [accountId, setAccountId] = useState<Id<"accounts"> | "">("");
  const [categoryId, setCategoryId] = useState<Id<"categories"> | "">("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [amount, setAmount] = useState("");
  const [kind, setKind] = useState<"expense" | "income">("expense");
  const [isBusiness, setIsBusiness] = useState(false);
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountId || !categoryId) {
      alert("Please select an account and category");
      return;
    }

    setIsLoading(true);

    try {
      await createTransaction({
        accountId: accountId as Id<"accounts">,
        categoryId: categoryId as Id<"categories">,
        date: new Date(date).getTime(),
        amount: parseFloat(amount),
        kind,
        isBusiness,
        description,
        notes: notes || undefined,
      });

      // Reset and close
      setAccountId("");
      setCategoryId("");
      setDate(new Date().toISOString().split("T")[0]);
      setAmount("");
      setKind("expense");
      setIsBusiness(false);
      setDescription("");
      setNotes("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating transaction:", error);
      alert("Failed to create transaction. Please try again.");
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
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Record a new income or expense transaction
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
            {relevantCategories.length === 0 ? (
              <div className="space-y-2">
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="No categories available" />
                  </SelectTrigger>
                </Select>
                <p className="text-sm text-slate-500">
                  No categories found. Click the button below to create default categories.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await seedCategories({});
                      // The query will automatically refetch after mutation
                    } catch (error) {
                      console.error("Error seeding categories:", error);
                      alert("Failed to seed categories. Please try again.");
                    }
                  }}
                  className="w-full"
                >
                  Create Default Categories
                </Button>
              </div>
            ) : (
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
            )}
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this for?"
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details"
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
              {isLoading ? "Adding..." : "Add Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


