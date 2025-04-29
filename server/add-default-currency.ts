import { pool } from './db';

async function addDefaultCurrencyColumn() {
  try {
    console.log('Checking if default_currency column exists in users table...');
    
    // Check if column exists
    const columnExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users'
        AND column_name = 'default_currency'
      );
    `;
    
    const columnExists = await pool.query(columnExistsQuery);
    
    if (!columnExists.rows[0].exists) {
      console.log('Adding default_currency column to users table...');
      
      // Add column to users table
      const addColumnQuery = `
        ALTER TABLE users 
        ADD COLUMN default_currency TEXT NOT NULL DEFAULT 'USD';
      `;
      
      await pool.query(addColumnQuery);
      console.log('default_currency column added successfully');
    } else {
      console.log('default_currency column already exists');
    }
    
    return true;
  } catch (error) {
    console.error('Error adding default_currency column:', error);
    return false;
  }
}

export { addDefaultCurrencyColumn };