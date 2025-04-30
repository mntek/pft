import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/currency";
import { useCurrencyConverter } from "@/hooks/use-currency-converter";
import { CreditCard, PiggyBank, Banknote, BarChart4 } from "lucide-react";
import { CreditCard as CreditCardType } from "@shared/schema";

interface CreditCardsSummaryProps {
  creditCards: CreditCardType[];
}

export function CreditCardsSummary({ creditCards }: CreditCardsSummaryProps) {
  const { convertToUserCurrency } = useCurrencyConverter();
  
  // Calculate total values with proper currency conversion to TRY (primary currency)
  const totalCreditLimit = creditCards.reduce((total, card) => {
    const convertedAmount = convertToUserCurrency(Number(card.creditLimit || 0), card.currency || 'TRY');
    return total + (convertedAmount || 0);
  }, 0);
  
  const totalCurrentBalance = creditCards.reduce((total, card) => {
    const convertedAmount = convertToUserCurrency(Number(card.currentBalance || 0), card.currency || 'TRY');
    return total + (convertedAmount || 0);
  }, 0);
  
  const totalAvailableCredit = totalCreditLimit - totalCurrentBalance;
  
  // Calculate utilization percentage
  const utilizationPercentage = totalCreditLimit > 0 
    ? (totalCurrentBalance / totalCreditLimit) * 100 
    : 0;
    
  // Calculate total values with proper currency conversion to USD (secondary currency)
  const totalCreditLimitUSD = creditCards.reduce((total, card) => {
    const convertedAmount = convertToUserCurrency(Number(card.creditLimit || 0), card.currency || 'TRY', 'USD');
    return total + (convertedAmount || 0);
  }, 0);
  
  const totalCurrentBalanceUSD = creditCards.reduce((total, card) => {
    const convertedAmount = convertToUserCurrency(Number(card.currentBalance || 0), card.currency || 'TRY', 'USD');
    return total + (convertedAmount || 0);
  }, 0);
  
  const totalAvailableCreditUSD = totalCreditLimitUSD - totalCurrentBalanceUSD;
  
  interface CardData {
    title: string;
    value?: number;
    valueUSD?: number;
    valueFormatted?: string;
    icon: React.ElementType;
    iconColor: string;
    bgColor: string;
  }
  
  const cards: CardData[] = [
    {
      title: "Total Credit Limit",
      value: totalCreditLimit,
      valueUSD: totalCreditLimitUSD,
      icon: CreditCard,
      iconColor: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Current Balance",
      value: totalCurrentBalance,
      valueUSD: totalCurrentBalanceUSD,
      icon: Banknote,
      iconColor: "text-red-500 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
    {
      title: "Available Credit",
      value: totalAvailableCredit,
      valueUSD: totalAvailableCreditUSD,
      icon: PiggyBank,
      iconColor: "text-green-500 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Credit Utilization",
      valueFormatted: `${formatNumber(utilizationPercentage, 1)}%`,
      icon: BarChart4,
      iconColor: "text-purple-500 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <h3 className="text-2xl font-bold mt-1">
                  {card.valueFormatted || formatCurrency(card.value || 0, 'TRY')}
                </h3>
                {!card.valueFormatted && card.valueUSD !== undefined && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(card.valueUSD, 'USD')}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}