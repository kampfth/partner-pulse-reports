
import { supabase } from '@/services/supabaseClient';

export interface DatabaseConfig {
  tables: {
    products: string;
    transactions: string;
    echoProducts: string;
  }
}

// Database configuration
export const dbConfig: DatabaseConfig = {
  tables: {
    products: 'products',
    transactions: 'transactions',
    echoProducts: 'echo_products'
  }
};

// Function to check if required tables exist
export async function checkDatabaseSetup(): Promise<boolean> {
  try {
    // Check if products table exists
    const { data: productsData, error: productsError } = await supabase
      .from(dbConfig.tables.products)
      .select('count(*)', { count: 'exact', head: true });
    
    // Check if transactions table exists
    const { data: transactionsData, error: transactionsError } = await supabase
      .from(dbConfig.tables.transactions)
      .select('count(*)', { count: 'exact', head: true });
    
    // Check if echo_products table exists
    const { data: echoProductsData, error: echoProductsError } = await supabase
      .from(dbConfig.tables.echoProducts)
      .select('count(*)', { count: 'exact', head: true });
    
    const tablesExist = !productsError && !transactionsError && !echoProductsError;
    
    return tablesExist;
  } catch (error) {
    console.error("Error checking database setup:", error);
    return false;
  }
}

// SQL statements for creating required tables (for reference)
export const createTableStatements = {
  products: `
    CREATE TABLE products (
      id SERIAL PRIMARY KEY,
      "productId" TEXT UNIQUE NOT NULL,
      "productName" TEXT NOT NULL,
      date DATE NOT NULL,
      "isEcho" BOOLEAN DEFAULT false
    );
  `,
  transactions: `
    CREATE TABLE transactions (
      id SERIAL PRIMARY KEY,
      "productId" TEXT NOT NULL,
      "productName" TEXT NOT NULL,
      lever TEXT,
      "transactionDate" DATE NOT NULL,
      "transactionAmount" DECIMAL(10,2) NOT NULL,
      "transactionAmountUSD" DECIMAL(10,2),
      "earningDate" DATE,
      CONSTRAINT unique_transaction UNIQUE ("productId", "transactionDate")
    );
  `,
  echoProducts: `
    CREATE TABLE echo_products (
      id SERIAL PRIMARY KEY,
      "productId" TEXT UNIQUE NOT NULL,
      "productName" TEXT NOT NULL,
      date DATE NOT NULL,
      FOREIGN KEY ("productId") REFERENCES products("productId") ON DELETE CASCADE
    );
  `
};
