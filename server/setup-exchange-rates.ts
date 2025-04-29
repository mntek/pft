import { pool } from './db';

async function setupExchangeRatesTable() {
  try {
    console.log('Setting up exchange_rates table...');
    
    // Check if the table exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'exchange_rates'
      );
    `;
    
    const tableExists = await pool.query(tableExistsQuery);
    
    if (!tableExists.rows[0].exists) {
      console.log('Creating exchange_rates table...');
      
      // Create the table
      const createTableQuery = `
        CREATE TABLE exchange_rates (
          id SERIAL PRIMARY KEY,
          from_currency VARCHAR(3) NOT NULL,
          to_currency VARCHAR(3) NOT NULL,
          rate TEXT NOT NULL,
          last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          UNIQUE(from_currency, to_currency)
        );
      `;
      
      await pool.query(createTableQuery);
      console.log('Exchange rates table created successfully');
      
      // Insert default exchange rates
      await seedDefaultExchangeRates();
    } else {
      console.log('Exchange rates table already exists');
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up exchange rates table:', error);
    return false;
  }
}

async function seedDefaultExchangeRates() {
  try {
    console.log('Seeding default exchange rates...');
    
    const defaultRates = [
      { fromCurrency: 'USD', toCurrency: 'USD', rate: '1.0' },
      { fromCurrency: 'USD', toCurrency: 'EUR', rate: '0.91' },
      { fromCurrency: 'USD', toCurrency: 'GBP', rate: '0.78' },
      { fromCurrency: 'USD', toCurrency: 'JPY', rate: '151.82' },
      { fromCurrency: 'USD', toCurrency: 'CAD', rate: '1.36' },
      { fromCurrency: 'USD', toCurrency: 'AUD', rate: '1.52' },
      { fromCurrency: 'USD', toCurrency: 'CHF', rate: '0.90' },
      { fromCurrency: 'USD', toCurrency: 'CNY', rate: '7.24' },
      { fromCurrency: 'USD', toCurrency: 'HKD', rate: '7.82' },
      { fromCurrency: 'USD', toCurrency: 'SGD', rate: '1.35' }
    ];
    
    for (const rate of defaultRates) {
      const insertQuery = `
        INSERT INTO exchange_rates (from_currency, to_currency, rate, last_updated)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (from_currency, to_currency) DO UPDATE
        SET rate = $3, last_updated = NOW();
      `;
      
      await pool.query(insertQuery, [
        rate.fromCurrency,
        rate.toCurrency,
        rate.rate
      ]);
    }
    
    console.log('Default exchange rates seeded successfully');
    return true;
  } catch (error) {
    console.error('Error seeding default exchange rates:', error);
    return false;
  }
}

export { setupExchangeRatesTable };