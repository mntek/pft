import React from "react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface SummaryCardProps {
  title: string;
  amount: number;
  currency?: string;
  change?: number;
  icon: React.ReactNode;
  iconClassName?: string;
  amountClassName?: string;
}

export function SummaryCard({
  title,
  amount,
  currency = "USD",
  change,
  icon,
  iconClassName = "bg-primary bg-opacity-20 text-primary",
  amountClassName = "text-foreground",
}: SummaryCardProps) {
  const isPositiveChange = change !== undefined && change >= 0;
  
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={`text-2xl font-mono font-semibold ${amountClassName}`}>
            {formatCurrency(amount, currency)}
          </p>
        </div>
        <span className={`flex h-10 w-10 rounded-full items-center justify-center ${iconClassName}`}>
          {icon}
        </span>
      </div>
      
      {change !== undefined && (
        <div className="mt-2 flex items-center">
          <span className={`text-xs font-medium flex items-center ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
            {isPositiveChange ? (
              <ArrowUpRight className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-1" />
            )}
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-muted-foreground ml-2">from last month</span>
        </div>
      )}
    </Card>
  );
}
