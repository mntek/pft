import { useQuery } from "@tanstack/react-query";
import { defaultExchangeRates, exchangeRates } from "@/lib/currency";

/**
 * Custom hook to fetch and manage exchange rates
 * Fetches rates on initial load and provides them globally to the application
 */
export function useExchangeRates() {
  const { 
    data: rates, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['/api/exchange-rates'],
    queryFn: async () => {
      const response = await fetch('/api/exchange-rates');
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      
      const data = await response.json();
      const processedRates: Record<string, number> = {};
      
      // Process rates from API
      data.forEach((rate: any) => {
        if (rate.fromCurrency === 'USD') {
          processedRates[rate.toCurrency] = parseFloat(rate.rate.toString());
        }
      });
      
      // Always ensure USD is 1.0
      processedRates['USD'] = 1.0;
      
      // Update the global exchange rates
      Object.assign(exchangeRates, { ...defaultExchangeRates, ...processedRates });
      
      return processedRates;
    },
    // Refetch every hour
    refetchInterval: 60 * 60 * 1000,
    // Use stale data while refetching
    staleTime: 60 * 60 * 1000,
    // Initialize with default rates
    initialData: defaultExchangeRates,
  });

  return {
    rates: rates || defaultExchangeRates,
    isLoading,
    error,
    refetch
  };
}