import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { PlusCircle, Loader2, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { IncomeList } from "@/components/income/income-list";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function IncomePage() {
  const [, navigate] = useLocation();
  const [selectedMonth, setSelectedMonth] = React.useState("current");
  
  const { data: incomes, isLoading, error } = useQuery({
    queryKey: ["/api/incomes"],
  });

  if (isLoading) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-6">Income Tracking</h1>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-6">Income Tracking</h1>
        <div className="text-center py-10">
          <p className="text-destructive">Failed to load income data. Please try again later.</p>
        </div>
      </>
    );
  }

  // Get safe value for incomes and cast to array
  const safeIncomes = incomes as any[] || [];
  
  // Calculate total fixed and additional income
  const fixedIncome = safeIncomes
    .filter(income => income.type === 'fixed')
    .reduce((sum, income) => sum + Number(income.amount), 0);
  
  const additionalIncome = safeIncomes
    .filter(income => income.type === 'additional')
    .reduce((sum, income) => sum + Number(income.amount), 0);
  
  const totalIncome = fixedIncome + additionalIncome;

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Income Tracking</h1>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Month</SelectItem>
              <SelectItem value="previous">Previous Month</SelectItem>
              <SelectItem value="twoMonths">Two Months Ago</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={() => navigate("/income/new")}
            className="flex items-center"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Income
          </Button>
        </div>

        {/* Income Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard
            title="Fixed Income"
            amount={fixedIncome}
            icon={<DollarSign className="h-5 w-5" />}
            iconClassName="bg-primary bg-opacity-20 text-primary"
          />
          
          <SummaryCard
            title="Additional Income"
            amount={additionalIncome}
            change={18.1}
            icon={<ArrowUpRight className="h-5 w-5" />}
            iconClassName="bg-green-500 bg-opacity-20 text-green-500"
          />
          
          <SummaryCard
            title="Total Monthly Income"
            amount={totalIncome}
            change={3.2}
            icon={<DollarSign className="h-5 w-5" />}
            iconClassName="bg-blue-500 bg-opacity-20 text-blue-500"
          />
        </div>

        {/* Income History */}
        {safeIncomes.length === 0 ? (
          <Card className="p-6">
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No income records yet</h3>
              <p className="text-muted-foreground mt-2 mb-4">
                Start tracking your income to get a better picture of your finances.
              </p>
              <Button
                onClick={() => navigate("/income/new")}
                className="flex items-center mx-auto"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Record Income
              </Button>
            </div>
          </Card>
        ) : (
          <IncomeList incomes={safeIncomes} />
        )}
      </div>
    </>
  );
}
