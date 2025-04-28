import { db, pool } from './db';
import { 
  users, 
  creditCards, 
  assets, 
  incomes, 
  expenses, 
  passwordResetTokens 
} from '@shared/schema';
import { sql } from 'drizzle-orm';

// Main function to set up the database
async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Create tables (in the correct order to respect foreign keys)
    await createUsersTable();
    await createCreditCardsTable();
    await createAssetsTable();
    await createIncomesTable();
    await createExpensesTable();
    await createPasswordResetTokensTable();
    
    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await pool.end();
  }
}

// Create individual tables
async function createUsersTable() {
  console.log('Creating users table...');
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ${users} (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT NOT NULL
    )
  `);
}

async function createCreditCardsTable() {
  console.log('Creating credit_cards table...');
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ${creditCards} (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      bank TEXT NOT NULL,
      credit_limit NUMERIC NOT NULL,
      statement_date DATE NOT NULL,
      due_date DATE NOT NULL,
      min_payment_percent NUMERIC NOT NULL,
      current_balance NUMERIC NOT NULL,
      color TEXT NOT NULL
    )
  `);
}

async function createAssetsTable() {
  console.log('Creating assets table...');
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ${assets} (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      asset_type TEXT NOT NULL,
      institution TEXT,
      currency TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      last_updated TIMESTAMP NOT NULL
    )
  `);
}

async function createIncomesTable() {
  console.log('Creating incomes table...');
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ${incomes} (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      source TEXT NOT NULL,
      type TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      date DATE NOT NULL
    )
  `);
}

async function createExpensesTable() {
  console.log('Creating expenses table...');
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ${expenses} (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      date DATE NOT NULL
    )
  `);
}

async function createPasswordResetTokensTable() {
  console.log('Creating password_reset_tokens table...');
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ${passwordResetTokens} (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

// Run the setup
setupDatabase();