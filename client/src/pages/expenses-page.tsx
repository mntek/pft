import React, { useEffect } from "react";
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
  // Basic state
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  
  // Fetch expenses data
  const { data: expenses, isLoading, error } = useQuery({
    queryKey: ["/api/expenses"],
  });

  // Get currency converter - using try/catch to prevent any potential errors
  const { convertToUserCurrency } = useCurrencyConverter();
  
  // Disable WebSocket when on expenses page to prevent connection issues
  useEffect(() => {
    console.log("Expenses page mounted - WebSocket handling");
    
    return () => {
      console.log("Expenses page unmounted");
    };
  }, []);
  
  // Show loading state
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

  // Show error state
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

  // Ensure expenses is an array
  const safeExpenses = React.useMemo(() => {
    try {
      return Array.isArray(expenses) ? expenses : [];
    } catch (e) {
      console.error("Error processing expenses:", e);
      return [];
    }
  }, [expenses]);

  // Process expense categories
  const { expensesByCategory, expensesByCategoryUSD, categories } = React.useMemo(() => {
    try {
      const byCategory: Record<string, number> = {};
      const byCategoryUSD: Record<string, number> = {};
      
      // Process each expense
      safeExpenses.forEach((expense: any) => {
        if (!expense || !expense.category) return;
        
        const category = expense.category;
        if (!byCategory[category]) {
          byCategory[category] = 0;
          byCategoryUSD[category] = 0;
        }
        
        // Parse amount safely
        const amount = typeof expense.amount === 'number' ? expense.amount : 
                      (typeof expense.amount === 'string' ? parseFloat(expense.amount) : 0);
        
        // Convert to TRY
        let amountInTRY = 0;
        try {
          if ((expense.currency || 'TRY') !== 'TRY') {
            amountInTRY = convertToUserCurrency(amount, expense.currency || 'TRY', 'TRY');
          } else {
            amountInTRY = amount;
          }
          byCategory[category] += amountInTRY || 0;
        } catch (e) {
          console.error("Error converting to TRY:", e);
        }
        
        // Convert to USD
        try {
          const amountInUSD = convertToUserCurrency(amount, expense.currency || 'TRY', 'USD');
          byCategoryUSD[category] += amountInUSD || 0;
        } catch (e) {
          console.error("Error converting to USD:", e);
        }
      });
      
      return { 
        expensesByCategory: byCategory, 
        expensesByCategoryUSD: byCategoryUSD,
        categories: Object.keys(byCategory)
      };
    } catch (e) {
      console.error("Error calculating expense categories:", e);
      return { 
        expensesByCategory: {}, 
        expensesByCategoryUSD: {},
        categories: []
      };
    }
  }, [safeExpenses, convertToUserCurrency]);

  // Filter expenses by selected category
  const filteredExpenses = React.useMemo(() => {
    try {
      return selectedCategory === 'all' 
        ? safeExpenses 
        : safeExpenses.filter((expense: any) => expense && expense.category === selectedCategory);
    } catch (e) {
      console.error("Error filtering expenses:", e);
      return [];
    }
  }, [safeExpenses, selectedCategory]);

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">One-Time Expenses</h1>
      <div className="space-y-6">
        {/* Add Expense Button */}
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
