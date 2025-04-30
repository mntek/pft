import React from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Income } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface IncomeListProps {
  incomes: Income[];
}

export function IncomeList({ incomes }: IncomeListProps) {
  const { toast } = useToast();
  const [incomeToDelete, setIncomeToDelete] = React.useState<number | null>(null);
  const [, navigate] = useLocation();
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/incomes/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Income record deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/incomes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setIncomeToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete income record: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (incomeToDelete !== null) {
      deleteMutation.mutate(incomeToDelete);
    }
  };
  
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedIncomes = React.useMemo(() => {
    const sortableItems = [...incomes];
    if (sortConfig !== null) {
      sortableItems.sort((a: any, b: any) => {
        // Handle special cases for different column types
        if (sortConfig.key === 'amount') {
          return sortConfig.direction === 'ascending' 
            ? Number(a.amount) - Number(b.amount)
            : Number(b.amount) - Number(a.amount);
        } else if (sortConfig.key === 'date') {
          return sortConfig.direction === 'ascending' 
            ? new Date(a.date).getTime() - new Date(b.date).getTime()
            : new Date(b.date).getTime() - new Date(a.date).getTime();
        } else {
          // Default string comparison for other columns
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        }
      });
    }
    return sortableItems;
  }, [incomes, sortConfig]);

  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-4">Income History</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => requestSort('source')}
              >
                Source {sortConfig?.key === 'source' && (
                  <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => requestSort('type')}
              >
                Type {sortConfig?.key === 'type' && (
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
            {sortedIncomes.map((income) => (
              <TableRow key={income.id}>
                <TableCell className="text-sm font-medium">{income.source}</TableCell>
                <TableCell>
                  <Badge variant={income.type === 'fixed' ? 'default' : 'success'}>
                    {income.type === 'fixed' ? 'Fixed' : 'Additional'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{formatDate(income.date)}</TableCell>
                <TableCell className="font-mono text-green-500">
                  {formatCurrency(Number(income.amount))}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/income/edit/${income.id}`)}
                      className="flex items-center"
                    >
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    
                    <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => setIncomeToDelete(income.id)}
                      >
                        <span className="sr-only">Open menu</span>
                        <svg
                          className="h-5 w-5 text-muted-foreground"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Income Record</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this income record? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIncomeToDelete(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
