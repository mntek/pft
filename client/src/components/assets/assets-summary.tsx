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
  
  // Calculate TRY values (primary currency)
  const totalBankAssetsValue = bankAssets.reduce((total, asset) => {
    // Convert to TRY explicitly to ensure we're using TRY values
    let amountInTRY = 0;
    if (asset.currency !== 'TRY') {
      amountInTRY = convertToUserCurrency(Number(asset.amount), asset.currency, 'TRY');
    } else {
      amountInTRY = Number(asset.amount);
    }
    return total + amountInTRY;
  }, 0);
  
  const totalNonBankAssetsValue = nonBankAssets.reduce((total, asset) => {
    // Convert to TRY explicitly to ensure we're using TRY values
    let amountInTRY = 0;
    if (asset.currency !== 'TRY') {
      amountInTRY = convertToUserCurrency(Number(asset.amount), asset.currency, 'TRY');
    } else {
      amountInTRY = Number(asset.amount);
    }
    return total + amountInTRY;
  }, 0);
  
  const totalAssetsValue = totalBankAssetsValue + totalNonBankAssetsValue;
  
  // Calculate USD values (secondary currency)
  const totalBankAssetsValueUSD = bankAssets.reduce((total, asset) => {
    // Convert to USD
    let amountInUSD = 0;
    if (asset.currency !== 'USD') {
      amountInUSD = convertToUserCurrency(Number(asset.amount), asset.currency, 'USD');
    } else {
      amountInUSD = Number(asset.amount);
    }
    return total + amountInUSD;
  }, 0);
  
  const totalNonBankAssetsValueUSD = nonBankAssets.reduce((total, asset) => {
    // Convert to USD
    let amountInUSD = 0;
    if (asset.currency !== 'USD') {
      amountInUSD = convertToUserCurrency(Number(asset.amount), asset.currency, 'USD');
    } else {
      amountInUSD = Number(asset.amount);
    }
    return total + amountInUSD;
  }, 0);
  
  const totalAssetsValueUSD = totalBankAssetsValueUSD + totalNonBankAssetsValueUSD;
  
  const cards = [
    {
      title: "Total Assets",
      value: totalAssetsValue,
      valueUSD: totalAssetsValueUSD,
      icon: TrendingUp,
      iconColor: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Bank Assets",
      value: totalBankAssetsValue,
      valueUSD: totalBankAssetsValueUSD,
      icon: Building,
      iconColor: "text-green-500 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Non-Bank Assets",
      value: totalNonBankAssetsValue,
      valueUSD: totalNonBankAssetsValueUSD,
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
                <p className="text-2xl font-mono font-semibold mt-1">
                  {formatCurrency(card.value, 'TRY')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(card.valueUSD, 'USD')}
                </p>
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