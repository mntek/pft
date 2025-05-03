import React, { useState, useEffect } from "react";
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

export default function ExpensesStandalonePage() {
  // Basic state
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
  
  // Data fetching state
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // State to track authentication status
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  
  // Fetch expenses data using standard fetch with specific authentication handling
  useEffect(() => {
    // Check if we're authenticated first to avoid WebSocket issues
    async function checkAuth() {
      try {
        const authResponse = await fetch(`${window.location.origin}/api/user`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Accept": "application/json"
          }
        });
        
        // If we get a 401, we're not authenticated
        if (authResponse.status === 401) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return false;
        }
        
        setIsAuthenticated(true);
        return true;
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      }
    }
    
    async function fetchExpenses() {
      try {
        // First verify authentication
        const isAuthed = await checkAuth();
        if (!isAuthed) {
          // Early return if not authenticated
          return;
        }
        
        console.log("Fetching expenses data...");
        setIsLoading(true);
        setError(null);
        
        // Use the full URL to avoid any path resolution issues
        const baseUrl = window.location.origin;
        const url = `${baseUrl}/api/expenses`;
        console.log("Fetching from URL:", url);
        
        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: {
            "Accept": "application/json",
            "Cache-Control": "no-cache"
          }
        });
        
        // Special handling for 401 responses based on the debug report
        if (res.status === 401) {
          console.log("Authentication error, redirecting to login");
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        if (!res.ok) {
          console.error("Error response", res.status, res.statusText);
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        
        const contentType = res.headers.get("content-type");
        console.log("Response content type:", contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
          console.error("Unexpected content type", contentType);
          // Try to get the response as text for debugging
          const textResponse = await res.text();
          console.log("Non-JSON response:", textResponse);
          throw new Error(`Unexpected content type: ${contentType}`);
        }
        
        const data = await res.json();
        console.log("Expenses data fetched successfully:", data);
        setExpenses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching expenses:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchExpenses();
  }, []);
  
  // Handle expense deletion
  const deleteExpense = async (id: number) => {
    try {
      setExpenseToDelete(id);
      
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/expenses/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Remove the deleted expense from the local state
      setExpenses(expenses.filter(expense => expense.id !== id));
      
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({
        title: "Error",
        description: `Failed to delete expense: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setExpenseToDelete(null);
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-6">One-Time Expenses (Standalone)</h1>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  // Show unauthenticated state
  if (!isAuthenticated) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-6">One-Time Expenses (Standalone)</h1>
        <div className="text-center py-10">
          <p className="text-destructive">Authentication required</p>
          <p className="text-muted-foreground mt-2 mb-4">
            Please log in to view your expenses.
          </p>
          <Button 
            onClick={() => navigate("/auth")} 
            variant="default" 
            className="mt-4"
          >
            Go to Login
          </Button>
        </div>
      </>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-6">One-Time Expenses (Standalone)</h1>
        <div className="text-center py-10">
          <p className="text-destructive">Failed to load expenses: {error.message}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-4"
          >
            Try Again
          </Button>
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
      <h1 className="text-2xl font-bold mb-6">One-Time Expenses (Standalone)</h1>
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
                                deleteExpense(expense.id);
                              }
                            }}
                            disabled={!expense.id || expenseToDelete === expense.id}
                            className="flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {expenseToDelete === expense.id ? "Deleting..." : "Delete"}
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