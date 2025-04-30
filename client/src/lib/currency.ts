import { useExchangeRatesContext } from '@/providers/exchange-rates-provider';
import type { ExchangeRate } from '@shared/schema';

export type CurrencyOption = {
  value: string;
  label: string;
  symbol: string;
};

// List of supported currencies with symbols
export const CURRENCIES: CurrencyOption[] = [
  { value: 'TRY', label: 'Turkish Lira', symbol: '₺' },
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { value: 'CHF', label: 'Swiss Franc', symbol: 'CHF' },
  { value: 'CNY', label: 'Chinese Yuan', symbol: '¥' },
  { value: 'HKD', label: 'Hong Kong Dollar', symbol: 'HK$' },
  { value: 'SGD', label: 'Singapore Dollar', symbol: 'S$' },
];

// Get currency symbol by code
export function getCurrencySymbol(currencyCode: string): string {
  const currency = CURRENCIES.find(c => c.value === currencyCode);
  return currency ? currency.symbol : currencyCode;
}

// Format number using Turkish locale
export function formatNumber(amount: string | number, decimals = 2): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle NaN case
  if (isNaN(numericAmount)) {
    return `0${decimals > 0 ? ',00' : ''}`;
  }
  
  // Format using Turkish locale (dots for thousands, comma for decimals)
  return numericAmount.toLocaleString('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

// Format amount with currency
export function formatCurrency(amount: string | number, currencyCode: string): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle NaN case
  if (isNaN(numericAmount)) {
    return `${getCurrencySymbol(currencyCode)}0,00`;
  }
  
  // Get currency symbol
  const symbol = getCurrencySymbol(currencyCode);
  
  // Format amount using Turkish locale
  return `${symbol}${numericAmount.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

// Convert amount from one currency to another
export function convertCurrency(
  amount: string | number,
  fromCurrency: string,
  toCurrency: string
): number | null {
  // Use the hook to get exchange rates
  const { rates, isLoading, error } = useExchangeRatesContext();
  
  // Handle errors or loading state
  if (isLoading || error || !rates) {
    return null;
  }
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle NaN case
  if (isNaN(numericAmount)) {
    return 0;
  }
  
  // If same currency, no conversion needed
  if (fromCurrency === toCurrency) {
    return numericAmount;
  }
  
  // Find relevant exchange rate
  const rate = rates.find(
    (r: ExchangeRate) => r.fromCurrency === fromCurrency && r.toCurrency === toCurrency
  );
  
  // If direct rate exists, use it
  if (rate) {
    return numericAmount * parseFloat(rate.rate);
  }
  
  // Look for inverse rate
  const inverseRate = rates.find(
    (r: ExchangeRate) => r.fromCurrency === toCurrency && r.toCurrency === fromCurrency
  );
  
  // If inverse rate exists, convert using it
  if (inverseRate) {
    return numericAmount / parseFloat(inverseRate.rate);
  }
  
  // If no direct or inverse rate, try through USD (assuming USD is base currency)
  if (fromCurrency !== 'USD' && toCurrency !== 'USD') {
    const toUsdRate = rates.find(
      (r: ExchangeRate) => r.fromCurrency === fromCurrency && r.toCurrency === 'USD'
    );
    
    const fromUsdRate = rates.find(
      (r: ExchangeRate) => r.fromCurrency === 'USD' && r.toCurrency === toCurrency
    );
    
    if (toUsdRate && fromUsdRate) {
      const usdAmount = numericAmount * parseFloat(toUsdRate.rate);
      return usdAmount * parseFloat(fromUsdRate.rate);
    }
  }
  
  // If all attempts fail, return null
  return null;
}