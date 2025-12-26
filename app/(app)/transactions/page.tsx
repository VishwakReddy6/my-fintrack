"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AddTransactionDialog } from "@/components/finance/add-transaction-dialog";
import { EditTransactionDialog } from "@/components/finance/edit-transaction-dialog";
import { Id } from "@/convex/_generated/dataModel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TransactionsPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<Id<"transactions"> | null>(null);
  const [scope, setScope] = useState<"personal" | "business" | "both">("both");
  
  const transactions = useQuery(api.transactions.listTransactions, {
    isBusiness: scope === "both" ? undefined : scope === "business",
    limit: 100,
  });

  const deleteTransaction = useMutation(api.transactions.deleteTransaction);

  const handleDelete = async (id: Id<"transactions">) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteTransaction({ id });
      } catch (error) {
        console.error("Error deleting transaction:", error);
        alert("Failed to delete transaction");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-600 mt-1">View and manage all your transactions</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>Add Transaction</Button>
      </div>

      <Tabs value={scope} onValueChange={(v: any) => setScope(v)}>
        <TabsList>
          <TabsTrigger value="both">All</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            {transactions?.length || 0} transaction(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900">
                        {transaction.description}
                      </span>
                      <Badge
                        variant={transaction.kind === "income" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {transaction.kind}
                      </Badge>
                      <Badge
                        variant={transaction.isBusiness ? "default" : "outline"}
                        className="text-xs"
                      >
                        {transaction.isBusiness ? "Business" : "Personal"}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-500">
                      {transaction.category?.label} •{" "}
                      {transaction.account?.name} •{" "}
                      {formatDate(new Date(transaction.date))}
                    </div>
                    {transaction.notes && (
                      <div className="text-sm text-slate-400 mt-1">
                        {transaction.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div
                      className={`text-lg font-semibold ${
                        transaction.kind === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.kind === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(transaction._id)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(transaction._id)}
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
              <p className="mb-4">No transactions yet</p>
              <Button onClick={() => setShowAdd(true)}>Add your first transaction</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showAdd && <AddTransactionDialog open={showAdd} onOpenChange={setShowAdd} />}
      {editingId && (
        <EditTransactionDialog
          open={!!editingId}
          onOpenChange={(open) => !open && setEditingId(null)}
          transactionId={editingId}
        />
      )}
    </div>
  );
}

