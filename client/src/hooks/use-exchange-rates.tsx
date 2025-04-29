import { useQuery } from '@tanstack/react-query';
import { ExchangeRate } from '@shared/schema';
import { CURRENCIES } from '@/lib/currency';

/**
 * Custom hook to fetch and manage exchange rates
 * Fetches rates on initial load and provides them globally to the application
 */
export function useExchangeRates() {
  // Fetch exchange rates
  const {
    data: rates,
    isLoading,
    error,
    refetch
  } = useQuery<ExchangeRate[]>({
    queryKey: ['/api/exchange-rates'],
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // For each supported currency, get the conversion rate to USD
  const getRate = (fromCurrency: string, toCurrency: string): number => {
    if (!rates || rates.length === 0) return 1;
    
    // Direct rate
    const directRate = rates.find(
      r => r.fromCurrency === fromCurrency && r.toCurrency === toCurrency
    );
    
    if (directRate) {
      return parseFloat(directRate.rate);
    }
    
    // Inverse rate
    const inverseRate = rates.find(
      r => r.fromCurrency === toCurrency && r.toCurrency === fromCurrency
    );
    
    if (inverseRate) {
      return 1 / parseFloat(inverseRate.rate);
    }
    
    // If not found, return 1 (assume same currency)
    return 1;
  };

  const supportedCurrencies = CURRENCIES.map(c => c.value);

  return {
    rates,
    isLoading,
    error,
    refetch,
    getRate,
    supportedCurrencies
  };
}