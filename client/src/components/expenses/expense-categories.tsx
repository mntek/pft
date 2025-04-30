import React from "react";
import { ShoppingBag, Heart, GraduationCap, Plane, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

// Category icons and colors
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Education': <GraduationCap className="h-4 w-4 text-yellow-500" />,
  'Health': <Heart className="h-4 w-4 text-green-500" />,
  'Travel': <Plane className="h-4 w-4 text-blue-500" />,
  'Shopping': <ShoppingBag className="h-4 w-4 text-purple-500" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  'Education': 'bg-yellow-500 bg-opacity-20',
  'Health': 'bg-green-500 bg-opacity-20',
  'Travel': 'bg-blue-500 bg-opacity-20',
  'Shopping': 'bg-purple-500 bg-opacity-20',
};

interface ExpenseCategoriesProps {
  expensesByCategory: Record<string, number>;
  expensesByCategoryUSD?: Record<string, number>;
}

export function ExpenseCategories({ 
  expensesByCategory = {}, 
  expensesByCategoryUSD = {} 
}: ExpenseCategoriesProps) {
  // Safely get an icon or return the default
  const getIcon = (category: string) => {
    try {
      return CATEGORY_ICONS[category] || <ShoppingCart className="h-4 w-4 text-gray-500" />;
    } catch (e) {
      console.error("Error getting icon:", e);
      return <ShoppingCart className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Safely get a color or return the default
  const getColor = (category: string) => {
    try {
      return CATEGORY_COLORS[category] || 'bg-gray-500 bg-opacity-20';
    } catch (e) {
      console.error("Error getting color:", e);
      return 'bg-gray-500 bg-opacity-20';
    }
  };
  
  // Get a safe copy of the categories
  const safeCategories = React.useMemo(() => {
    try {
      return Object.entries(expensesByCategory || {});
    } catch (e) {
      console.error("Error processing expense categories:", e);
      return [];
    }
  }, [expensesByCategory]);
  
  // Render empty state if no categories
  if (safeCategories.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-4 text-center py-4 text-muted-foreground">
          No expense categories to display. Add your first expense to get started.
        </div>
      </div>
    );
  }
  
  // Render categories
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {safeCategories.map(([category, amount]) => (
        <div key={category} className="rounded-lg border bg-card p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">{category}</p>
              <p className="text-2xl font-mono font-semibold text-red-500">
                {formatCurrency(amount || 0, 'TRY')}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(expensesByCategoryUSD[category] || 0, 'USD')}
              </p>
            </div>
            <span className={`flex h-8 w-8 rounded-full items-center justify-center ${getColor(category)}`}>
              {getIcon(category)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
