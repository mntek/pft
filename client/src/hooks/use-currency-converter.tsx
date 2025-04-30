import { useAuth } from './use-auth';
import { useExchangeRates } from './use-exchange-rates';
import { formatCurrency } from '@/lib/currency';

/**
 * Hook to convert and format amounts based on user's preferred currency
 */
export function useCurrencyConverter() {
  const { user } = useAuth();
  const { rates, getRate } = useExchangeRates();

  // Default to TRY if user has no preference
  const userCurrency = user?.defaultCurrency || 'TRY';

  /**
   * Convert an amount from one currency to the user's preferred currency
   */
  const convertToUserCurrency = (amount: number | string, fromCurrency: string = 'TRY'): number => {
    if (!rates || rates.length === 0) return parseFloat(amount.toString());
    
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // If already in the user's currency, no conversion needed
    if (fromCurrency === userCurrency) {
      return numericAmount;
    }
    
    // Convert to user's preferred currency
    const rate = getRate(fromCurrency, userCurrency);
    return numericAmount * rate;
  };

  /**
   * Format an amount in the user's preferred currency
   */
  const formatInUserCurrency = (amount: number | string, fromCurrency: string = 'TRY'): string => {
    const convertedAmount = convertToUserCurrency(amount, fromCurrency);
    return formatCurrency(convertedAmount, userCurrency);
  };

  return {
    userCurrency,
    convertToUserCurrency,
    formatInUserCurrency
  };
}