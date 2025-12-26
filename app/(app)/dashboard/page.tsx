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
import { Wallet, TrendingUp, TrendingDown, ArrowUpDown, Plus, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const categories = useQuery(api.categories.listCategories, {});
  const hasCategories = categories && categories.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Track your finances at a glance</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowAddAccount(true)} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
          <Button onClick={() => setShowAddTransaction(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Scope Filter */}
      <Tabs value={scope} onValueChange={(v) => setScope(v as Scope)}>
        <TabsList className="bg-slate-100">
          <TabsTrigger value="both">All</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm font-medium text-slate-600">
                  Total Balance
                </CardDescription>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900 mt-2">
                {formatCurrency(summary.totalBalance)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm font-medium text-slate-600">
                  This Month Income
                </CardDescription>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-emerald-600 mt-2">
                {formatCurrency(summary.monthIncome)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm font-medium text-slate-600">
                  This Month Expenses
                </CardDescription>
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-red-600 mt-2">
                {formatCurrency(summary.monthExpenses)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm font-medium text-slate-600">
                  Net Cash Flow
                </CardDescription>
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <ArrowUpDown className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <CardTitle
                className={`text-2xl font-bold mt-2 ${
                  summary.netCashFlow >= 0 ? "text-emerald-600" : "text-red-600"
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
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Your Accounts</CardTitle>
                <CardDescription className="mt-1">Manage your accounts and balances</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account, index) => (
                <div
                  key={account._id}
                  className={`p-5 rounded-xl border transition-all hover:shadow-md ${
                    index === 0
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-white border-slate-200 hover:border-emerald-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 mb-1">{account.name}</div>
                      <div className="text-sm text-slate-500 capitalize">
                        {account.type.replace("_", " ")}
                      </div>
                    </div>
                    <Badge
                      variant={account.isBusiness ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {account.isBusiness ? "Business" : "Personal"}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {formatCurrency(account.currentBalance)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
          <CardDescription className="mt-1">Your latest financial activity</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions && recentTransactions.length > 0 ? (
            <div className="space-y-2">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white hover:border-emerald-200 hover:shadow-sm transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium text-slate-900 truncate">
                        {transaction.description}
                      </div>
                      <Badge
                        variant={transaction.isBusiness ? "default" : "secondary"}
                        className="text-xs shrink-0"
                      >
                        {transaction.isBusiness ? "Business" : "Personal"}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-500">
                      {transaction.category?.label} • {transaction.account?.name} •{" "}
                      {formatDate(new Date(transaction.date))}
                    </div>
                  </div>
                  <div
                    className={`text-lg font-bold ml-4 shrink-0 ${
                      transaction.kind === "income" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {transaction.kind === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p className="mb-4">No transactions yet</p>
              <Button onClick={() => setShowAddTransaction(true)} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add your first transaction
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* First-time setup helper */}
      {(!hasAccounts || !hasCategories) && (
        <Card className="border-emerald-200 bg-emerald-50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Welcome to My Fintrack! 👋
            </CardTitle>
            <CardDescription className="text-slate-600 mt-1">
              Let&apos;s get you started with setting up your finances
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                1
              </div>
              <div>
                <div className="font-medium text-slate-900">Add your first account</div>
                <div className="text-sm text-slate-600 mt-0.5">
                  Start by adding a bank account or cash
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                2
              </div>
              <div>
                <div className="font-medium text-slate-900">Seed default categories</div>
                <div className="text-sm text-slate-600 mt-0.5">
                  We&apos;ll create common categories for you
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2 flex-wrap">
              {!hasAccounts && (
                <Button onClick={() => setShowAddAccount(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Account
                </Button>
              )}
              {!hasCategories && (
                <Button onClick={handleSeedCategories} variant={hasAccounts ? "default" : "outline"} size="sm">
                  Seed Categories
                </Button>
              )}
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


