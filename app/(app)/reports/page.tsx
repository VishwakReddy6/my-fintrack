"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0f172a", "#475569", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"];

export default function ReportsPage() {
  const [scope, setScope] = useState<"personal" | "business" | "both">("both");
  const [months, setMonths] = useState(6);

  // Get date range for current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime();

  const spendingByCategory = useQuery(api.analytics.getSpendingByCategory, {
    startDate: startOfMonth,
    endDate: endOfMonth,
    scope: scope === "both" ? undefined : scope,
    kind: "expense",
  });

  const incomeByCategory = useQuery(api.analytics.getSpendingByCategory, {
    startDate: startOfMonth,
    endDate: endOfMonth,
    scope: scope === "both" ? undefined : scope,
    kind: "income",
  });

  const cashFlowTimeSeries = useQuery(api.analytics.getCashFlowTimeSeries, {
    months,
    scope: scope === "both" ? undefined : scope,
  });

  const accountBalances = useQuery(api.analytics.getAccountBalances, {
    scope: scope === "both" ? undefined : scope,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-600 mt-1">
          Visualize your financial data with detailed charts and insights
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="scope">Scope</Label>
              <Tabs value={scope} onValueChange={(v: any) => setScope(v)}>
                <TabsList className="w-full">
                  <TabsTrigger value="both" className="flex-1">All</TabsTrigger>
                  <TabsTrigger value="personal" className="flex-1">Personal</TabsTrigger>
                  <TabsTrigger value="business" className="flex-1">Business</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex-1">
              <Label htmlFor="months">Time Period</Label>
              <Select value={months.toString()} onValueChange={(v) => setMonths(parseInt(v))}>
                <SelectTrigger id="months">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Last 3 months</SelectItem>
                  <SelectItem value="6">Last 6 months</SelectItem>
                  <SelectItem value="12">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Trends</CardTitle>
          <CardDescription>
            Income vs expenses over the last {months} months
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cashFlowTimeSeries && cashFlowTimeSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cashFlowTimeSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="yearMonth" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => formatCurrency(value)}
                  labelStyle={{ color: "#0f172a" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Income"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Expenses"
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Net"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-slate-500">
              No data available for the selected period
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Current month spending by category</CardDescription>
          </CardHeader>
          <CardContent>
            {spendingByCategory && spendingByCategory.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={spendingByCategory}
                      dataKey="amount"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => entry.label}
                    >
                      {spendingByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => formatCurrency(value)}
                      labelStyle={{ color: "#0f172a" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {spendingByCategory.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{item.label}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-500">
                No expense data for this month
              </div>
            )}
          </CardContent>
        </Card>

        {/* Income Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Income Breakdown</CardTitle>
            <CardDescription>Current month income by category</CardDescription>
          </CardHeader>
          <CardContent>
            {incomeByCategory && incomeByCategory.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={incomeByCategory}
                      dataKey="amount"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => entry.label}
                    >
                      {incomeByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => formatCurrency(value)}
                      labelStyle={{ color: "#0f172a" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {incomeByCategory.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{item.label}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-500">
                No income data for this month
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Account Balances */}
      <Card>
        <CardHeader>
          <CardTitle>Account Balances by Type</CardTitle>
          <CardDescription>
            Distribution of your money across account types
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accountBalances && accountBalances.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={accountBalances}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => formatCurrency(value)}
                  labelStyle={{ color: "#0f172a" }}
                />
                <Legend />
                <Bar dataKey="balance" fill="#0f172a" name="Balance" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-slate-500">
              No account data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Comparison */}
      {cashFlowTimeSeries && cashFlowTimeSeries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Comparison</CardTitle>
            <CardDescription>
              Compare income and expenses across months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cashFlowTimeSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="yearMonth" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => formatCurrency(value)}
                  labelStyle={{ color: "#0f172a" }}
                />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Income" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

