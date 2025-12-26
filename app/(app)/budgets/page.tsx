"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { formatCurrency, getYearMonth } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Id } from "@/convex/_generated/dataModel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BudgetsPage() {
  const [selectedMonth, setSelectedMonth] = useState(getYearMonth());
  const [scope, setScope] = useState<"personal" | "business" | "both">("both");
  const [editingCategoryId, setEditingCategoryId] = useState<Id<"categories"> | null>(null);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetScope, setBudgetScope] = useState<"personal" | "business" | "both">("personal");

  const budgetsVsActual = useQuery(api.budgets.getBudgetVsActual, {
    yearMonth: selectedMonth,
    scope: scope === "both" ? undefined : scope,
  });

  const categories = useQuery(api.categories.listCategories, { kind: "expense" });
  const upsertBudget = useMutation(api.budgets.upsertBudget);
  const deleteBudget = useMutation(api.budgets.deleteBudget);
  const copyBudgets = useMutation(api.budgets.copyBudgets);

  // Generate month options (current + next 2 + previous 2)
  const monthOptions = [];
  for (let i = -2; i <= 2; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    const yearMonth = getYearMonth(date);
    const label = date.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
    monthOptions.push({ value: yearMonth, label });
  }

  const handleSetBudget = async (categoryId: Id<"categories">) => {
    if (!budgetAmount || parseFloat(budgetAmount) <= 0) {
      alert("Please enter a valid budget amount");
      return;
    }

    try {
      await upsertBudget({
        categoryId,
        yearMonth: selectedMonth,
        amount: parseFloat(budgetAmount),
        scope: budgetScope,
      });

      setEditingCategoryId(null);
      setBudgetAmount("");
      setBudgetScope("personal");
    } catch (error) {
      console.error("Error setting budget:", error);
      alert("Failed to set budget");
    }
  };

  const handleCopyLastMonth = async () => {
    const date = new Date(selectedMonth + "-01");
    date.setMonth(date.getMonth() - 1);
    const lastMonth = getYearMonth(date);

    try {
      await copyBudgets({
        fromMonth: lastMonth,
        toMonth: selectedMonth,
      });
      alert("Budgets copied successfully!");
    } catch (error) {
      console.error("Error copying budgets:", error);
      alert("Failed to copy budgets");
    }
  };

  const categoriesWithoutBudget =
    categories?.filter(
      (cat) =>
        !budgetsVsActual?.some((budget) => budget.categoryId === cat._id)
    ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Budgets</h1>
          <p className="text-slate-600 mt-1">Set and track monthly spending budgets</p>
        </div>
        <Button onClick={handleCopyLastMonth} variant="outline" size="sm">
          Copy Last Month&apos;s Budgets
        </Button>
      </div>

      {/* Month and Scope Selectors */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="month">Month</Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger id="month">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label htmlFor="scope">Scope</Label>
          <Tabs value={scope} onValueChange={(v: any) => setScope(v)}>
            <TabsList className="w-full bg-slate-100">
              <TabsTrigger value="both" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="personal" className="flex-1">Personal</TabsTrigger>
              <TabsTrigger value="business" className="flex-1">Business</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Budget vs Actual */}
      {budgetsVsActual && budgetsVsActual.length > 0 ? (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Budget Tracking</CardTitle>
            <CardDescription className="mt-1">
              Compare your budgets with actual spending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetsVsActual.map((item) => (
                <div
                  key={item.categoryId}
                  className="p-5 border border-slate-200 rounded-lg bg-white hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {item.categoryLabel}
                      </span>
                      {item.isOverBudget && (
                        <Badge variant="destructive" className="text-xs">
                          Over Budget
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm font-medium text-slate-600">
                      {formatCurrency(item.spent)} of {formatCurrency(item.budgeted)}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden mb-3">
                    <div
                      className={`h-full transition-all ${
                        item.isOverBudget
                          ? "bg-red-500"
                          : item.percentage > 80
                          ? "bg-yellow-500"
                          : "bg-emerald-500"
                      }`}
                      style={{
                        width: `${Math.min(item.percentage, 100)}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span
                      className={`font-medium ${
                        item.isOverBudget ? "text-red-600" : "text-slate-600"
                      }`}
                    >
                      {item.percentage.toFixed(1)}% used
                    </span>
                    <span
                      className={`font-medium ${
                        item.remaining >= 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {item.remaining >= 0 ? "Remaining: " : "Over by: "}
                      {formatCurrency(Math.abs(item.remaining))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">No Budgets Set</CardTitle>
            <CardDescription className="mt-1">
              Set budgets for your expense categories below
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Add/Edit Budgets */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Manage Budgets</CardTitle>
          <CardDescription className="mt-1">
            Add or update budgets for expense categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoriesWithoutBudget.length > 0 ? (
            <div className="space-y-3">
              {categoriesWithoutBudget.map((category) => (
                <div
                  key={category._id}
                  className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg bg-white hover:border-emerald-200 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">
                      {category.label}
                    </div>
                    <div className="text-sm text-slate-500 capitalize">
                      {category.scope}
                    </div>
                  </div>

                  {editingCategoryId === category._id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={budgetAmount}
                        onChange={(e) => setBudgetAmount(e.target.value)}
                        className="w-32"
                      />
                      <Select value={budgetScope} onValueChange={(v: any) => setBudgetScope(v)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="personal">Personal</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={() => handleSetBudget(category._id)}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingCategoryId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingCategoryId(category._id)}
                    >
                      Set Budget
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>All categories have budgets set for this month</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


