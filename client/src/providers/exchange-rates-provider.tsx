import React, { createContext, ReactNode, useContext, useEffect } from 'react';
import { useExchangeRates } from '@/hooks/use-exchange-rates';

// Create context
const ExchangeRatesContext = createContext<ReturnType<typeof useExchangeRates> | undefined>(undefined);

// Provider component
export function ExchangeRatesProvider({ children }: { children: ReactNode }) {
  const exchangeRatesData = useExchangeRates();

  // Log exchange rates loading status
  useEffect(() => {
    if (exchangeRatesData.isLoading) {
      console.log('Loading exchange rates...');
    } else if (exchangeRatesData.error) {
      console.error('Error loading exchange rates:', exchangeRatesData.error);
    } else {
      console.log('Exchange rates loaded successfully');
    }
  }, [exchangeRatesData.isLoading, exchangeRatesData.error]);

  return (
    <ExchangeRatesContext.Provider value={exchangeRatesData}>
      {children}
    </ExchangeRatesContext.Provider>
  );
}

// Hook for consuming the context
export function useExchangeRatesContext() {
  const context = useContext(ExchangeRatesContext);
  if (context === undefined) {
    throw new Error('useExchangeRatesContext must be used within an ExchangeRatesProvider');
  }
  return context;
}