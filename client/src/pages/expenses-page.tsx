import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { PlusCircle, Loader2, Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExpenseList } from "@/components/expenses/expense-list";
import { ExpenseCategories } from "@/components/expenses/expense-categories";
import { useCurrencyConverter } from "@/hooks/use-currency-converter";

export default function ExpensesPage() {
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  
  const { data: expenses, isLoading, error } = useQuery({
    queryKey: ["/api/expenses"],
  });

  if (isLoading) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-6">One-Time Expenses</h1>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-6">One-Time Expenses</h1>
        <div className="text-center py-10">
          <p className="text-destructive">Failed to load expenses. Please try again later.</p>
        </div>
      </>
    );
  }

  // Safely handle currency conversion
  const { convertToUserCurrency } = useCurrencyConverter();
  
  // Group expenses by category for summary
  const expensesByCategory: Record<string, number> = {};
  const expensesByCategoryUSD: Record<string, number> = {};
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  
  safeExpenses.forEach((expense: any) => {
    const category = expense.category;
    if (!expensesByCategory[category]) {
      expensesByCategory[category] = 0;
      expensesByCategoryUSD[category] = 0;
    }
    
    // Convert to default currency (TRY) explicitly
    let amountInTRY = 0;
    if ((expense.currency || 'TRY') !== 'TRY') {
      amountInTRY = convertToUserCurrency(Number(expense.amount), expense.currency || 'TRY', 'TRY');
    } else {
      amountInTRY = Number(expense.amount);
    }
    expensesByCategory[category] += amountInTRY;
    
    // Convert to USD
    const amountInUSD = convertToUserCurrency(Number(expense.amount), expense.currency || 'TRY', 'USD');
    expensesByCategoryUSD[category] += amountInUSD;
  });

  // Filter expenses by selected category
  const filteredExpenses = selectedCategory === 'all' 
    ? safeExpenses 
    : safeExpenses.filter((expense: any) => expense.category === selectedCategory);

  const categories = Object.keys(expensesByCategory);

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">One-Time Expenses</h1>
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={() => navigate("/expenses/new")}
            className="flex items-center"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        </div>

        {/* Expense Categories */}
        <ExpenseCategories 
          expensesByCategory={expensesByCategory} 
          expensesByCategoryUSD={expensesByCategoryUSD}
        />

        {/* Expense List */}
        <Card className="p-4">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-medium">Expense History</h3>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {safeExpenses.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No expenses yet</h3>
              <p className="text-muted-foreground mt-2 mb-4">
                Start tracking your one-time expenses to manage your finances better.
              </p>
              <Button
                onClick={() => navigate("/expenses/new")}
                className="flex items-center mx-auto"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add First Expense
              </Button>
            </div>
          ) : (
            <ExpenseList expenses={filteredExpenses} />
          )}
        </Card>
      </div>
    </>
  );
}
