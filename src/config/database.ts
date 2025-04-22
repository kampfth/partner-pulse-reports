
import { supabase, testTableAccess } from '@/services/supabaseClient';

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

// Simplified direct access check for tables
export async function checkDatabaseSetup(): Promise<{
  isReady: boolean;
  tablesStatus: {
    products: boolean;
    transactions: boolean;
    echoProducts: boolean;
  }
}> {
  try {
    // Check each table directly
    const productsExists = await testTableAccess(dbConfig.tables.products);
    const transactionsExists = await testTableAccess(dbConfig.tables.transactions);
    const echoProductsExists = await testTableAccess(dbConfig.tables.echoProducts);
    
    console.log(`Tables direct access check: products=${productsExists}, transactions=${transactionsExists}, echoProducts=${echoProductsExists}`);
    
    return {
      isReady: productsExists && transactionsExists && echoProductsExists,
      tablesStatus: {
        products: productsExists,
        transactions: transactionsExists,
        echoProducts: echoProductsExists
      }
    };
  } catch (error) {
    console.error("Unexpected error during database check:", error);
    return {
      isReady: false,
      tablesStatus: {
        products: false,
        transactions: false,
        echoProducts: false
      }
    };
  }
}

// SQL statements for creating required tables (for reference)
export const createTableStatements = {
  products: `
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  "productId" TEXT UNIQUE NOT NULL,
  "productName" TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  "isEcho" BOOLEAN DEFAULT false
);`,
  
  transactions: `
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "productName" TEXT NOT NULL,
  "lever" TEXT,
  "transactionDate" DATE NOT NULL,
  "transactionAmount" FLOAT4 NOT NULL,
  "transactionAmountUSD" FLOAT4,
  "earningDate" DATE,
  CONSTRAINT unique_transaction UNIQUE ("productId", "transactionDate")
);`,
  
  echoProducts: `
CREATE TABLE IF NOT EXISTS echo_products (
  id SERIAL PRIMARY KEY,
  "productId" TEXT UNIQUE NOT NULL,
  "productName" TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  FOREIGN KEY ("productId") REFERENCES products("productId") ON DELETE CASCADE
);`
};

// SQL to run all statements in one go (for Supabase SQL Editor)
export const fullDatabaseSetupSQL = `
-- Create Products Table
${createTableStatements.products}

-- Create Transactions Table
${createTableStatements.transactions}

-- Create Echo Products Table
${createTableStatements.echoProducts}

-- Set up RLS (Row Level Security) policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE echo_products ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users on products" 
  ON products FOR ALL TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on transactions" 
  ON transactions FOR ALL TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on echo_products" 
  ON echo_products FOR ALL TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Allow anon access for read operations
CREATE POLICY "Allow anon read on products" 
  ON products FOR SELECT TO anon 
  USING (true);

CREATE POLICY "Allow anon read on transactions" 
  ON transactions FOR SELECT TO anon 
  USING (true);

CREATE POLICY "Allow anon read on echo_products" 
  ON echo_products FOR SELECT TO anon 
  USING (true);
`;
