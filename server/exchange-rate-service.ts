import fetch from 'node-fetch';
import { db } from './db';
import { exchangeRates } from '@shared/schema';
import { eq } from 'drizzle-orm';

// API settings
// We'll support multiple API providers with fallbacks
interface ExchangeRateApiConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  getRatesUrl: (apiKey?: string) => string;
  parseResponse: (data: any) => Record<string, number>;
}

// European Central Bank API (no API key required, free)
const ecbApi: ExchangeRateApiConfig = {
  name: 'European Central Bank',
  baseUrl: 'https://api.exchangerate.host',
  getRatesUrl: () => `https://api.exchangerate.host/latest?base=USD`,
  parseResponse: (data: any) => data.rates
};

// Open Exchange Rates (fallback, requires API key)
const openExchangeRatesApi: ExchangeRateApiConfig = {
  name: 'Open Exchange Rates',
  baseUrl: 'https://openexchangerates.org/api',
  apiKey: process.env.OPEN_EXCHANGE_RATES_API_KEY,
  getRatesUrl: (apiKey?: string) => 
    `https://openexchangerates.org/api/latest.json?app_id=${apiKey || ''}`,
  parseResponse: (data: any) => data.rates
};

// List of APIs to try in order
const apiProviders: ExchangeRateApiConfig[] = [
  ecbApi,
  openExchangeRatesApi
];

/**
 * Fetch latest exchange rates from external API
 */
export async function fetchLatestRates(): Promise<boolean> {
  console.log('Fetching latest exchange rates...');
  
  // Try each API in order until one succeeds
  for (const api of apiProviders) {
    try {
      console.log(`Trying to fetch rates from ${api.name}...`);
      
      // Skip if API requires key and we don't have one
      if (api.apiKey === undefined && api.name !== 'European Central Bank') {
        console.log(`Skipping ${api.name}: No API key provided`);
        continue;
      }
      
      // Fetch rates from API
      const response = await fetch(api.getRatesUrl(api.apiKey));
      
      if (!response.ok) {
        console.log(`Failed to fetch from ${api.name}: ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      const rates = api.parseResponse(data);
      
      if (!rates || Object.keys(rates).length === 0) {
        console.log(`No rates returned from ${api.name}`);
        continue;
      }
      
      console.log(`Successfully fetched ${Object.keys(rates).length} rates from ${api.name}`);
      
      // Update database with new rates
      await updateDatabaseRates(rates);
      
      return true;
    } catch (error) {
      console.error(`Error fetching rates from ${api.name}:`, error);
    }
  }
  
  console.log('All API providers failed. Using existing rates from database.');
  return false;
}

/**
 * Update exchange rates in database
 */
async function updateDatabaseRates(rates: Record<string, number>): Promise<void> {
  console.log('Updating exchange rates in database...');
  
  // Get current timestamp
  const now = new Date();
  
  // For each currency pair, update or insert rate
  for (const [currency, rate] of Object.entries(rates)) {
    if (currency === 'USD') continue; // Skip USD to USD rate
    
    try {
      // Check if rate already exists
      const existingRate = await db.select()
        .from(exchangeRates)
        .where(
          eq(exchangeRates.fromCurrency, 'USD')
        )
        .where(
          eq(exchangeRates.toCurrency, currency)
        );
      
      if (existingRate && existingRate.length > 0) {
        // Update existing rate
        await db.update(exchangeRates)
          .set({
            rate: rate.toString(),
            lastUpdated: now
          })
          .where(
            eq(exchangeRates.fromCurrency, 'USD')
          )
          .where(
            eq(exchangeRates.toCurrency, currency)
          );
      } else {
        // Insert new rate
        await db.insert(exchangeRates)
          .values({
            fromCurrency: 'USD',
            toCurrency: currency,
            rate: rate.toString(),
            lastUpdated: now
          });
      }
    } catch (error) {
      console.error(`Error updating rate for USD to ${currency}:`, error);
    }
  }
  
  console.log('Exchange rates updated successfully');
}

/**
 * Schedule regular updates of exchange rates
 * By default, updates once per day
 */
export function scheduleRateUpdates(intervalHours = 24): void {
  console.log(`Scheduling exchange rate updates every ${intervalHours} hours`);
  
  // Convert hours to milliseconds
  const interval = intervalHours * 60 * 60 * 1000;
  
  // Run immediately once
  fetchLatestRates();
  
  // Then schedule regular updates
  setInterval(fetchLatestRates, interval);
}