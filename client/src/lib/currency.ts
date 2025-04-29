// List of common currencies
export const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' }
];

// Default exchange rates - these will be used as fallback if API fails
// All rates are relative to USD (1 USD = X units of currency)
export const defaultExchangeRates: Record<string, number> = {
  'USD': 1.0,
  'EUR': 0.91,
  'GBP': 0.78,
  'JPY': 151.82,
  'CAD': 1.36,
  'AUD': 1.52,
  'CHF': 0.90,
  'CNY': 7.24,
  'HKD': 7.82,
  'SGD': 1.35
};

// Initialize with default rates, will be updated from API
export let exchangeRates: Record<string, number> = { ...defaultExchangeRates };

// Function to fetch exchange rates from API
export async function fetchExchangeRates(): Promise<Record<string, number>> {
  try {
    const response = await fetch('/api/exchange-rates');
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    
    const data = await response.json();
    const rates: Record<string, number> = {};
    
    // Process rates from API
    data.forEach((rate: any) => {
      if (rate.fromCurrency === 'USD') {
        rates[rate.toCurrency] = parseFloat(rate.rate);
      }
    });
    
    // Always ensure USD is 1.0
    rates['USD'] = 1.0;
    
    // Update the exchange rates
    exchangeRates = { ...defaultExchangeRates, ...rates };
    return exchangeRates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return defaultExchangeRates;
  }
};

/**
 * Formats a number as currency
 * @param amount The amount to format
 * @param currencyCode The currency code
 * @returns The formatted currency string
 */
export function formatCurrency(amount: number | string, currencyCode: string = 'USD'): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  const currency = currencies.find(c => c.code === currencyCode) || 
    { code: currencyCode, symbol: currencyCode };
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericAmount);
}

/**
 * Converts an amount from one currency to another
 * @param amount The amount to convert
 * @param fromCurrency The source currency code
 * @param toCurrency The target currency code
 * @returns The converted amount
 */
export function convertCurrency(
  amount: number | string, 
  fromCurrency: string = 'USD', 
  toCurrency: string = 'USD'
): number {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (fromCurrency === toCurrency) {
    return numericAmount;
  }
  
  const fromRate = exchangeRates[fromCurrency] || 1;
  const toRate = exchangeRates[toCurrency] || 1;
  
  // Convert to USD first, then to target currency
  const amountInUSD = numericAmount / fromRate;
  return amountInUSD * toRate;
}

/**
 * Gets the currency symbol for a currency code
 * @param currencyCode The currency code
 * @returns The currency symbol
 */
export function getCurrencySymbol(currencyCode: string = 'USD'): string {
  const currency = currencies.find(c => c.code === currencyCode);
  return currency?.symbol || currencyCode;
}