import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { PlusCircle, Loader2, Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

export default function ExpensesPage() {
  // Basic state
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const { toast } = useToast();
  const [expenseToDelete, setExpenseToDelete] = React.useState<number | null>(null);
  
  // Fetch expenses data using React Query's built-in fetcher
  const { data: expenses, isLoading, error } = useQuery({
    queryKey: ["/api/expenses"]
  });
  
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

  // Simple error handling for authentication issues
  
  // Show error state
  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isAuthError = errorMessage.includes("Authentication required") || 
                         errorMessage.includes("401") ||
                         errorMessage.includes("Unauthorized");
    
    return (
      <>
        <h1 className="text-2xl font-bold mb-6">One-Time Expenses</h1>
        <div className="text-center py-10">
          <p className="text-destructive">
            {isAuthError 
              ? "Authentication required. Please log in to view your expenses." 
              : "Failed to load expenses. Please try again later."}
          </p>
          
          {isAuthError ? (
            <Button 
              onClick={() => navigate("/auth")} 
              variant="default" 
              className="mt-4"
            >
              Go to Login
            </Button>
          ) : (
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="mt-4"
            >
              Try Again
            </Button>
          )}
        </div>
      </>
    );
  }

  // Ensure expenses is an array
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  
  // Get unique categories
  const allCategories = React.useMemo(() => {
    const categories = new Set<string>();
    safeExpenses.forEach((expense: any) => {
      if (expense && expense.category) {
        categories.add(expense.category);
      }
    });
    return Array.from(categories);
  }, [safeExpenses]);
  
  // Category totals
  const categoryTotals = React.useMemo(() => {
    const result: Record<string, { amount: number, count: number }> = {};
    
    safeExpenses.forEach((expense: any) => {
      if (!expense || !expense.category) return;
      
      const category = expense.category;
      if (!result[category]) {
        result[category] = { amount: 0, count: 0 };
      }
      
      const amount = typeof expense.amount === 'number' ? expense.amount : 
                    (typeof expense.amount === 'string' ? parseFloat(expense.amount) : 0);
      
      result[category].amount += amount;
      result[category].count += 1;
    });
    
    return result;
  }, [safeExpenses]);
  
  // Filter expenses by selected category
  const filteredExpenses = React.useMemo(() => {
    return selectedCategory === 'all' 
      ? safeExpenses 
      : safeExpenses.filter((expense: any) => expense && expense.category === selectedCategory);
  }, [safeExpenses, selectedCategory]);
  
  // Handle delete
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setExpenseToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete expense: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Get category badge color
  const getCategoryVariant = (category: string) => {
    switch (category) {
      case 'Education': return 'warning';
      case 'Health': return 'success';
      case 'Travel': return 'info';
      case 'Shopping': return 'secondary';
      default: return 'default';
    }
  };

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(categoryTotals).length === 0 ? (
            <div className="md:col-span-4 text-center py-4 text-muted-foreground">
              No expense categories to display. Add your first expense to get started.
            </div>
          ) : (
            Object.entries(categoryTotals).map(([category, { amount, count }]) => (
              <div key={category} className="rounded-lg border bg-card p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">{category}</p>
                    <p className="text-2xl font-mono font-semibold text-red-500">
                      {formatCurrency(amount || 0, 'TRY')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {count} {count === 1 ? 'expense' : 'expenses'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

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
                {allCategories.map((category) => (
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense: any) => (
                    <TableRow key={expense.id || 'unknown'}>
                      <TableCell className="text-sm font-medium">{expense.description || 'Unknown'}</TableCell>
                      <TableCell>
                        {expense.category ? (
                          <Badge variant={getCategoryVariant(expense.category)}>
                            {expense.category}
                          </Badge>
                        ) : (
                          <Badge variant="default">Uncategorized</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{expense.date ? formatDate(expense.date) : 'N/A'}</TableCell>
                      <TableCell className="font-mono font-semibold text-red-500">
                        {formatCurrency(-(expense.amount ? Number(expense.amount) : 0), expense.currency || 'TRY')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (expense.id) {
                                navigate(`/expenses/edit/${expense.id}`);
                              }
                            }}
                            disabled={!expense.id}
                            className="flex items-center"
                          >
                            <Pencil className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (expense.id && confirm("Are you sure you want to delete this expense?")) {
                                setExpenseToDelete(expense.id);
                                deleteMutation.mutate(expense.id);
                              }
                            }}
                            disabled={!expense.id || (deleteMutation.isPending && expenseToDelete === expense.id)}
                            className="flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {deleteMutation.isPending && expenseToDelete === expense.id ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
