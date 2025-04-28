import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLocation } from "wouter";
import { Expense } from "@shared/schema";
import { ShoppingBag, Heart, GraduationCap, Plane } from "lucide-react";

interface RecentExpensesProps {
  expenses: Expense[];
}

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  const [, navigate] = useLocation();
  
  // Map of expense categories to icons
  const categoryIcons: Record<string, React.ReactNode> = {
    'Shopping': <ShoppingBag className="h-5 w-5 text-blue-500" />,
    'Health': <Heart className="h-5 w-5 text-green-500" />,
    'Education': <GraduationCap className="h-5 w-5 text-yellow-500" />,
    'Travel': <Plane className="h-5 w-5 text-purple-500" />,
  };
  
  // Map of expense categories to background colors
  const categoryColors: Record<string, string> = {
    'Shopping': 'bg-blue-500 bg-opacity-20',
    'Health': 'bg-green-500 bg-opacity-20',
    'Education': 'bg-yellow-500 bg-opacity-20',
    'Travel': 'bg-purple-500 bg-opacity-20',
  };
  
  const getIcon = (category: string) => {
    return categoryIcons[category] || <ShoppingBag className="h-5 w-5 text-gray-500" />;
  };
  
  const getBgColor = (category: string) => {
    return categoryColors[category] || 'bg-gray-500 bg-opacity-20';
  };
  
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Recent Expenses</h3>
        <Button
          onClick={() => navigate("/expenses")}
          variant="link"
          className="text-primary hover:text-primary/90"
        >
          View All
        </Button>
      </div>
      
      <div className="space-y-3">
        {expenses.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No expenses recorded yet. Track your one-time expenses to get insights.
          </div>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getBgColor(expense.category)}`}>
                  {getIcon(expense.category)}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{expense.category}</p>
                  <p className="text-xs text-muted-foreground">{expense.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono text-red-500">{formatCurrency(-Number(expense.amount))}</p>
                <p className="text-xs text-muted-foreground">{formatDate(expense.date)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
