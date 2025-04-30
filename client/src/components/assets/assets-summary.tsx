import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { useCurrencyConverter } from "@/hooks/use-currency-converter";
import { ArrowDown, ArrowUp, TrendingUp, Building, Coins } from "lucide-react";
import { Asset } from "@shared/schema";

interface AssetsSummaryProps {
  assets: Asset[];
}

export function AssetsSummary({ assets }: AssetsSummaryProps) {
  const { convertToUserCurrency } = useCurrencyConverter();
  
  // Calculate total values with proper currency conversion
  const bankAssets = assets.filter(asset => asset.type === 'bank');
  const nonBankAssets = assets.filter(asset => asset.type === 'non-bank');
  
  const totalBankAssetsValue = bankAssets.reduce((total, asset) => {
    const convertedAmount = convertToUserCurrency(asset.amount, asset.currency);
    return total + (convertedAmount || 0);
  }, 0);
  
  const totalNonBankAssetsValue = nonBankAssets.reduce((total, asset) => {
    const convertedAmount = convertToUserCurrency(asset.amount, asset.currency);
    return total + (convertedAmount || 0);
  }, 0);
  
  const totalAssetsValue = totalBankAssetsValue + totalNonBankAssetsValue;
  
  const cards = [
    {
      title: "Total Assets",
      value: totalAssetsValue,
      icon: TrendingUp,
      iconColor: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Bank Assets",
      value: totalBankAssetsValue,
      icon: Building,
      iconColor: "text-green-500 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Non-Bank Assets",
      value: totalNonBankAssetsValue,
      icon: Coins,
      iconColor: "text-yellow-500 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <h3 className="text-2xl font-bold mt-1">
                  {formatCurrency(card.value, 'TRY')}
                </h3>
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