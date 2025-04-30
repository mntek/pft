import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Expense } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useLocation } from "wouter";


interface ExpenseListProps {
  expenses: Expense[];
}

export function ExpenseList({ expenses }: ExpenseListProps) {
  const { toast } = useToast();
  const [expenseToDelete, setExpenseToDelete] = React.useState<number | null>(null);
  const [, navigate] = useLocation();
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);
  
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

  const handleDelete = () => {
    if (expenseToDelete !== null) {
      deleteMutation.mutate(expenseToDelete);
    }
  };
  
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedExpenses = React.useMemo(() => {
    // Filter out any invalid expenses
    const validExpenses = Array.isArray(expenses) ? expenses.filter(expense => expense && typeof expense === 'object') : [];
    const sortableItems = [...validExpenses];
    
    if (sortConfig !== null) {
      sortableItems.sort((a: any, b: any) => {
        // Handle special cases for different column types
        if (sortConfig.key === 'amount') {
          // Handle missing or non-numeric values
          const aAmount = a.amount !== undefined && a.amount !== null ? Number(a.amount) : 0;
          const bAmount = b.amount !== undefined && b.amount !== null ? Number(b.amount) : 0;
          
          return sortConfig.direction === 'ascending' 
            ? aAmount - bAmount
            : bAmount - aAmount;
        } else if (sortConfig.key === 'date') {
          // Handle missing dates
          const aDate = a.date ? new Date(a.date).getTime() : 0;
          const bDate = b.date ? new Date(b.date).getTime() : 0;
          
          return sortConfig.direction === 'ascending' 
            ? aDate - bDate
            : bDate - aDate;
        } else {
          // Default string comparison for other columns
          const aValue = a[sortConfig.key] || '';
          const bValue = b[sortConfig.key] || '';
          
          if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        }
      });
    }
    return sortableItems;
  }, [expenses, sortConfig]);

  // Category badge variants
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => requestSort('description')}
            >
              Description {sortConfig?.key === 'description' && (
                <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
              )}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => requestSort('category')}
            >
              Category {sortConfig?.key === 'category' && (
                <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
              )}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => requestSort('date')}
            >
              Date {sortConfig?.key === 'date' && (
                <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
              )}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => requestSort('amount')}
            >
              Amount {sortConfig?.key === 'amount' && (
                <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
              )}
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedExpenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="text-sm font-medium">{expense.description}</TableCell>
              <TableCell>
                <Badge variant={getCategoryVariant(expense.category)}>
                  {expense.category}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">{formatDate(expense.date)}</TableCell>
              <TableCell className="font-mono text-red-500">
                {formatCurrency(-Number(expense.amount))}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/expenses/edit/${expense.id}`)}
                    className="flex items-center"
                  >
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this expense? This action cannot be undone.")) {
                        setExpenseToDelete(expense.id);
                        deleteMutation.mutate(expense.id);
                      }
                    }}
                    disabled={deleteMutation.isPending && expenseToDelete === expense.id}
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
  );
}
