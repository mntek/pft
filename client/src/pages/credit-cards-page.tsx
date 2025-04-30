import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { PlusCircle, Loader2, CreditCard } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCurrency, daysUntil, formatDate } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function CreditCardsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [cardToDelete, setCardToDelete] = React.useState<number | null>(null);
  
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
                    <TableHead>Card</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Limit</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditCards.map((card) => {
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
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                className="h-4 w-4 mr-1"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              Edit
                            </Button>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCardToDelete(card.id)}
                                  className="flex items-center text-destructive border-destructive hover:bg-destructive/10"
                                >
                                  <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="16" 
                                    height="16" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    className="h-4 w-4 mr-1"
                                  >
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                  </svg>
                                  Delete
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Credit Card</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete this credit card? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setCardToDelete(null)}
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
