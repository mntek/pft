import React from "react";
import { useQuery } from "@tanstack/react-query";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { AssetsDebtChart } from "@/components/dashboard/assets-debt-chart";
import { MonthlyTrendsChart } from "@/components/dashboard/monthly-trends-chart";
import { CreditCardList } from "@/components/dashboard/credit-card-list";
import { RecentExpenses } from "@/components/dashboard/recent-expenses";
import { Wallet, CreditCard, DollarSign, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  if (isLoading) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="text-center py-10">
          <p className="text-destructive">Failed to load dashboard data. Please try again later.</p>
        </div>
      </>
    );
  }

  const {
    totalAssets,
    totalDebt,
    totalIncome,
    fixedIncome,
    additionalIncome,
    creditCards,
    recentExpenses,
  } = data;

  // Calculate balance (assets - debt)
  const balance = totalAssets - totalDebt;
  
  // Calculate debt to asset ratio
  const debtToAssetRatio = totalAssets > 0 ? (totalDebt / totalAssets) * 100 : 0;

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Financial Overview</h1>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-3 md:mb-0">
            <Select defaultValue="current">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Month</SelectItem>
                <SelectItem value="last">Last Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard
            title="Total Assets"
            amount={totalAssets}
            currency="TRY"
            change={5.2}
            icon={<Wallet className="h-5 w-5" />}
            iconClassName="bg-green-500 bg-opacity-20 text-green-500"
            amountClassName="text-green-500"
          />
          
          <SummaryCard
            title="Total Debt"
            amount={totalDebt}
            currency="TRY"
            change={2.1}
            icon={<CreditCard className="h-5 w-5" />}
            iconClassName="bg-red-500 bg-opacity-20 text-red-500"
            amountClassName="text-red-500"
          />
          
          <SummaryCard
            title="Monthly Income"
            amount={totalIncome}
            currency="TRY"
            change={1.5}
            icon={<DollarSign className="h-5 w-5" />}
            iconClassName="bg-primary bg-opacity-20 text-primary"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AssetsDebtChart totalAssets={totalAssets} totalDebt={totalDebt} />
          <MonthlyTrendsChart />
        </div>

        {/* Credit Cards Section */}
        <CreditCardList creditCards={creditCards} />

        {/* Recent Expenses */}
        <RecentExpenses expenses={recentExpenses} />
      </div>
    </>
  );
}
