"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AddRecurringDialog } from "@/components/finance/add-recurring-dialog";
import { Id } from "@/convex/_generated/dataModel";
import { Plus } from "lucide-react";

export default function RecurringPage() {
  const [showAdd, setShowAdd] = useState(false);
  const recurring = useQuery(api.recurring.listRecurringTransactions, {});
  const toggleRecurring = useMutation(api.recurring.toggleRecurringTransaction);
  const deleteRecurring = useMutation(api.recurring.deleteRecurringTemplate);

  const handleToggle = async (id: Id<"recurringTransactions">, active: boolean) => {
    try {
      await toggleRecurring({ id, active: !active });
    } catch (error) {
      console.error("Error toggling recurring transaction:", error);
      alert("Failed to update recurring transaction");
    }
  };

  const handleDelete = async (id: Id<"recurringTransactions">) => {
    if (confirm("Are you sure you want to delete this recurring transaction?")) {
      try {
        await deleteRecurring({ id });
      } catch (error) {
        console.error("Error deleting recurring transaction:", error);
        alert("Failed to delete recurring transaction");
      }
    }
  };

  const activeRecurring = recurring?.filter((r) => r.active) || [];
  const pausedRecurring = recurring?.filter((r) => !r.active) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Recurring Transactions</h1>
          <p className="text-slate-600 mt-1">
            Manage subscriptions and regular expenses
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Recurring Transaction
        </Button>
      </div>

      {/* Active Recurring */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Active Recurring Transactions</CardTitle>
          <CardDescription className="mt-1">
            These will be automatically created based on schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeRecurring.length > 0 ? (
            <div className="space-y-2">
              {activeRecurring.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white hover:border-emerald-200 hover:shadow-sm transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-slate-900">
                        {item.description}
                      </span>
                      <Badge
                        variant={item.kind === "income" ? "default" : "secondary"}
                        className="text-xs shrink-0"
                      >
                        {item.kind}
                      </Badge>
                      <Badge
                        variant={item.isBusiness ? "default" : "outline"}
                        className="text-xs shrink-0"
                      >
                        {item.isBusiness ? "Business" : "Personal"}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-500">
                      {item.category?.label} • {item.account?.name}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      <span className="capitalize">{item.frequency}</span>
                      {item.interval > 1 && ` (every ${item.interval})`} •
                      Next: {formatDate(new Date(item.nextOccurrence))}
                      {item.endDate && ` • Ends: ${formatDate(new Date(item.endDate))}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4 shrink-0">
                    <div
                      className={`text-lg font-bold ${
                        item.kind === "income" ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(item.templateAmount)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggle(item._id, item.active)}
                      >
                        Pause
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p className="mb-4">No active recurring transactions</p>
              <Button onClick={() => setShowAdd(true)} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add your first recurring transaction
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paused Recurring */}
      {pausedRecurring.length > 0 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Paused Recurring Transactions</CardTitle>
            <CardDescription className="mt-1">
              These are currently paused and won&apos;t be created automatically
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pausedRecurring.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white opacity-75 hover:opacity-100 transition-opacity"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900">
                        {item.description}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Paused
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-500">
                      {item.category?.label} • {item.account?.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-semibold text-slate-600">
                      {formatCurrency(item.templateAmount)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggle(item._id, item.active)}
                      >
                        Resume
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showAdd && <AddRecurringDialog open={showAdd} onOpenChange={setShowAdd} />}
    </div>
  );
}


