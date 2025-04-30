import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { PlusCircle, Loader2, CreditCard, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { formatCurrency, daysUntil, formatDate } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function CreditCardsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [cardToDelete, setCardToDelete] = React.useState<number | null>(null);
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);
  
  const { data: creditCards, isLoading, error } = useQuery({
    queryKey: ["/api/credit-cards"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/credit-cards/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Credit card deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/credit-cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setCardToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete credit card: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (cardToDelete !== null) {
      deleteMutation.mutate(cardToDelete);
    }
  };
  
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedCreditCards = React.useMemo(() => {
    if (!creditCards) return [];
    
    const sortableItems = [...creditCards];
    if (sortConfig !== null) {
      sortableItems.sort((a: any, b: any) => {
        // Handle special cases for different column types
        if (sortConfig.key === 'currentBalance' || sortConfig.key === 'creditLimit') {
          return sortConfig.direction === 'ascending' 
            ? Number(a[sortConfig.key]) - Number(b[sortConfig.key])
            : Number(b[sortConfig.key]) - Number(a[sortConfig.key]);
        } else if (sortConfig.key === 'dueDate') {
          return sortConfig.direction === 'ascending' 
            ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        } else if (sortConfig.key === 'name' || sortConfig.key === 'bank') {
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
        return 0;
      });
    }
    return sortableItems;
  }, [creditCards, sortConfig]);

  const getBadgeVariant = (dueInDays: number) => {
    if (dueInDays <= 3) return "danger";
    if (dueInDays <= 7) return "warning";
    return "info";
  };

  const getBadgeText = (dueInDays: number) => {
    if (dueInDays <= 0) return "Due today";
    if (dueInDays === 1) return "Due tomorrow";
    return `Due in ${dueInDays} days`;
  };

  if (isLoading) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-6">Credit Cards</h1>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-6">Credit Cards</h1>
        <div className="text-center py-10">
          <p className="text-destructive">Failed to load credit cards. Please try again later.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Credit Cards</h1>
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={() => navigate("/credit-cards/new")}
            className="flex items-center"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Credit Card
          </Button>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Your Credit Cards</h3>
          
          {creditCards.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No credit cards yet</h3>
              <p className="text-muted-foreground mt-2 mb-4">
                Add your first credit card to start tracking your expenses and due dates.
              </p>
              <Button
                onClick={() => navigate("/credit-cards/new")}
                className="flex items-center mx-auto"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Credit Card
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => requestSort('name')}
                    >
                      Card {sortConfig?.key === 'name' && (
                        <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => requestSort('currentBalance')}
                    >
                      Balance {sortConfig?.key === 'currentBalance' && (
                        <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => requestSort('creditLimit')}
                    >
                      Limit {sortConfig?.key === 'creditLimit' && (
                        <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => requestSort('dueDate')}
                    >
                      Due Date {sortConfig?.key === 'dueDate' && (
                        <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCreditCards.map((card) => {
                    const dueInDays = daysUntil(card.dueDate);
                    return (
                      <TableRow key={card.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <div
                              className="flex-shrink-0 h-8 w-8 rounded flex items-center justify-center text-white"
                              style={{ backgroundColor: card.color }}
                            >
                              <span className="text-xs font-bold">
                                {card.name.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium">{card.name}</p>
                              <p className="text-xs text-muted-foreground">{card.bank}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-red-500">
                          {formatCurrency(Number(card.currentBalance))}
                        </TableCell>
                        <TableCell className="font-mono">
                          {formatCurrency(Number(card.creditLimit))}
                        </TableCell>
                        <TableCell>{formatDate(card.dueDate)}</TableCell>
                        <TableCell>
                          <Badge variant={getBadgeVariant(dueInDays)}>
                            {getBadgeText(dueInDays)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/credit-cards/edit/${card.id}`)}
                              className="flex items-center"
                            >
                              <Pencil className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this credit card? This action cannot be undone.")) {
                                  setCardToDelete(card.id);
                                  deleteMutation.mutate(card.id);
                                }
                              }}
                              disabled={deleteMutation.isPending && cardToDelete === card.id}
                              className="flex items-center"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              {deleteMutation.isPending && cardToDelete === card.id ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
