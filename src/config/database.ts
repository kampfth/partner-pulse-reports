
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

// Function to check if the tables exist (without trying to create them)
export async function checkDatabaseSetupAndAutoCreate(): Promise<boolean> {
  let tablesExist = true;
  
  // Check products table
  const { error: productsError } = await supabase
    .from(dbConfig.tables.products)
    .select('count(*)', { count: 'exact', head: true });
    
  if (productsError) {
    console.warn("Products table not found:", productsError.message);
    tablesExist = false;
  }

  // Check transactions table
  const { error: transactionsError } = await supabase
    .from(dbConfig.tables.transactions)
    .select('count(*)', { count: 'exact', head: true });
    
  if (transactionsError) {
    console.warn("Transactions table not found:", transactionsError.message);
    tablesExist = false;
  }

  // Check echo_products table
  const { error: echoProductsError } = await supabase
    .from(dbConfig.tables.echoProducts)
    .select('count(*)', { count: 'exact', head: true });
    
  if (echoProductsError) {
    console.warn("Echo products table not found:", echoProductsError.message);
    tablesExist = false;
  }

  return tablesExist;
}

// SQL statements for creating required tables (to be executed in Supabase SQL Editor)
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
