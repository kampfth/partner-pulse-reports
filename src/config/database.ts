
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

// Improved function to check if the tables exist
export async function checkDatabaseSetupAndAutoCreate(): Promise<boolean> {
  try {
    // Use introspection/metadata methods to check tables existence
    const { data: tables, error } = await supabase
      .from('___tables')
      .select('table_name')
      .eq('schema', 'public');
    
    if (error) {
      console.error("Error checking tables:", error);
      
      // If metadata query fails, fallback to direct table queries
      return await fallbackTableCheck();
    }
    
    // Convert table names to a set for easy lookup
    const tableSet = new Set(tables?.map(t => t.table_name) || []);
    
    const productsExists = tableSet.has(dbConfig.tables.products);
    const transactionsExists = tableSet.has(dbConfig.tables.transactions);
    const echoProductsExists = tableSet.has(dbConfig.tables.echoProducts);
    
    // Log table existence status
    console.log(`Tables existence check: products=${productsExists}, transactions=${transactionsExists}, echoProducts=${echoProductsExists}`);
    
    return productsExists && transactionsExists && echoProductsExists;
  } catch (error) {
    console.error("Unexpected error during table check:", error);
    return await fallbackTableCheck();
  }
}

// Fallback method using direct table queries
async function fallbackTableCheck(): Promise<boolean> {
  console.log("Using fallback table check method...");
  
  try {
    // Check products table
    const { data: productsData, error: productsError } = await supabase
      .from(dbConfig.tables.products)
      .select('count(*)', { count: 'exact', head: true });
      
    if (productsError) {
      console.warn("Products table check failed:", productsError.message);
      return false;
    }

    // Check transactions table
    const { data: transactionsData, error: transactionsError } = await supabase
      .from(dbConfig.tables.transactions)
      .select('count(*)', { count: 'exact', head: true });
      
    if (transactionsError) {
      console.warn("Transactions table check failed:", transactionsError.message);
      return false;
    }

    // Check echo_products table
    const { data: echoProductsData, error: echoProductsError } = await supabase
      .from(dbConfig.tables.echoProducts)
      .select('count(*)', { count: 'exact', head: true });
      
    if (echoProductsError) {
      console.warn("Echo products table check failed:", echoProductsError.message);
      return false;
    }

    console.log("All tables found using fallback method");
    return true;
  } catch (error) {
    console.error("Fallback table check failed:", error);
    return false;
  }
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
