import React, { useState } from 'react';
import { formatCurrency, convertCurrency } from '@/lib/currency';
import { useExchangeRatesContext } from '@/providers/exchange-rates-provider';
import { useAuth } from '@/hooks/use-auth';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CurrencyDisplayProps {
  amount: string | number;
  currency: string;
  showConversion?: boolean;
  className?: string;
}

/**
 * Component for displaying currency amounts with optional conversion tooltip
 */
export function CurrencyDisplay({
  amount,
  currency,
  showConversion = true,
  className = ''
}: CurrencyDisplayProps) {
  const { user } = useAuth();
  const { rates } = useExchangeRatesContext();
  const userCurrency = user?.defaultCurrency || 'USD';
  
  // Only show conversion if the currency is different from user's default
  const shouldShowConversion = showConversion && currency !== userCurrency;
  
  // Convert the amount to the user's currency
  const convertedAmount = shouldShowConversion
    ? convertCurrency(amount, currency, userCurrency)
    : null;
  
  // Format both amounts
  const formattedAmount = formatCurrency(amount, currency);
  const formattedConvertedAmount = convertedAmount !== null
    ? formatCurrency(convertedAmount, userCurrency)
    : null;
  
  // If no conversion needed, just return the formatted amount
  if (!shouldShowConversion || !formattedConvertedAmount) {
    return <span className={className}>{formattedAmount}</span>;
  }
  
  // With conversion, show a tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className={className}>{formattedAmount}</TooltipTrigger>
        <TooltipContent>
          <p>≈ {formattedConvertedAmount} ({userCurrency})</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}