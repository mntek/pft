import React from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, daysUntil, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { PlusCircle } from "lucide-react";
import { CreditCard } from "@shared/schema";

interface CreditCardListProps {
  creditCards: CreditCard[];
}

export function CreditCardList({ creditCards }: CreditCardListProps) {
  const [, navigate] = useLocation();
  
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
  
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Credit Cards</h3>
        <Button
          onClick={() => navigate("/credit-cards/new")}
          variant="ghost"
          className="text-primary hover:text-primary hover:bg-background"
        >
          <PlusCircle className="w-4 h-4 mr-1" /> Add Card
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Card</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Limit</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {creditCards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No credit cards added yet. Add your first credit card to track your debt.
                </TableCell>
              </TableRow>
            ) : (
              creditCards.map((card) => {
                const dueInDays = daysUntil(card.dueDate);
                return (
                  <TableRow key={card.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-8 w-8 rounded flex items-center justify-center`} style={{ backgroundColor: card.color }}>
                          <span className="text-xs font-bold text-white">
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
                    <TableCell className="text-sm">
                      {formatDate(card.dueDate)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(dueInDays)}>
                        {getBadgeText(dueInDays)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
