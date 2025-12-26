"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useState } from "react";
import { AddTransactionDialog } from "@/components/finance/add-transaction-dialog";
import { AddAccountDialog } from "@/components/finance/add-account-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Scope = "personal" | "business" | "both";

export default function DashboardPage() {
  const [scope, setScope] = useState<Scope>("both");
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);

  // Fetch data
  const summary = useQuery(api.analytics.getDashboardSummary, { scope });
  const accounts = useQuery(api.accounts.listAccounts, {});
  const recentTransactions = useQuery(api.analytics.getRecentTransactions, {
    limit: 10,
    scope,
  });
  const seedCategories = useMutation(api.categories.seedDefaultCategories);

  // Seed categories on first load
  const handleSeedCategories = async () => {
    try {
      await seedCategories({});
    } catch (error) {
      console.error("Error seeding categories:", error);
    }
  };

  const hasAccounts = accounts && accounts.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Track your finances at a glance</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowAddAccount(true)} variant="outline">
            Add Account
          </Button>
          <Button onClick={() => setShowAddTransaction(true)}>
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Scope Filter */}
      <Tabs value={scope} onValueChange={(v) => setScope(v as Scope)} className="w-full md:w-auto">
        <TabsList>
          <TabsTrigger value="both">All</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Balance</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(summary.totalBalance)}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>This Month Income</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                {formatCurrency(summary.monthIncome)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>This Month Expenses</CardDescription>
              <CardTitle className="text-2xl text-red-600">
                {formatCurrency(summary.monthExpenses)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Net Cash Flow</CardDescription>
              <CardTitle
                className={`text-2xl ${
                  summary.netCashFlow >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(summary.netCashFlow)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Accounts */}
      {accounts && accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Accounts</CardTitle>
            <CardDescription>Manage your accounts and balances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account) => (
                <div
                  key={account._id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-slate-900">{account.name}</div>
                      <div className="text-sm text-slate-500 capitalize">{account.type.replace("_", " ")}</div>
                    </div>
                    <Badge variant={account.isBusiness ? "default" : "secondary"}>
                      {account.isBusiness ? "Business" : "Personal"}
                    </Badge>
                  </div>
                  <div className="text-xl font-semibold text-slate-900 mt-2">
                    {formatCurrency(account.currentBalance)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activity</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions && recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-slate-900">
                        {transaction.description}
                      </div>
                      <Badge variant={transaction.isBusiness ? "default" : "secondary"} className="text-xs">
                        {transaction.isBusiness ? "Business" : "Personal"}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {transaction.category?.label} • {transaction.account?.name} •{" "}
                      {formatDate(new Date(transaction.date))}
                    </div>
                  </div>
                  <div
                    className={`text-lg font-semibold ${
                      transaction.kind === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.kind === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>No transactions yet</p>
              <Button onClick={() => setShowAddTransaction(true)} variant="outline" className="mt-4">
                Add your first transaction
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* First-time setup helper */}
      {!hasAccounts && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Welcome to My Fintrack! 👋</CardTitle>
            <CardDescription className="text-blue-900">
              Let's get you started with setting up your finances
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <div className="font-medium text-blue-900">Add your first account</div>
                <div className="text-sm text-blue-700">Start by adding a bank account or cash</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <div className="font-medium text-blue-900">Seed default categories</div>
                <div className="text-sm text-blue-700">We'll create common categories for you</div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={() => setShowAddAccount(true)}>Add Account</Button>
              <Button onClick={handleSeedCategories} variant="outline">
                Seed Categories
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      {showAddTransaction && (
        <AddTransactionDialog
          open={showAddTransaction}
          onOpenChange={setShowAddTransaction}
        />
      )}
      {showAddAccount && (
        <AddAccountDialog open={showAddAccount} onOpenChange={setShowAddAccount} />
      )}
    </div>
  );
}

