
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
    
    // Create RPC function for checking RLS permissions if it doesn't exist
    try {
      const { error: rpcError } = await supabase.rpc('check_rls_permissions');
      if (rpcError && rpcError.message.includes('function does not exist')) {
        console.log("Creating check_rls_permissions function...");
        const { error: createError } = await supabase.rpc('create_check_rls_function');
        if (createError) {
          console.error("Error creating RLS check function:", createError);
        }
      }
    } catch (err) {
      console.log("RPC function might not exist yet:", err);
    }
    
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
);`,

  rls_check_function: `
CREATE OR REPLACE FUNCTION check_rls_permissions()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  result := json_build_object(
    'products', (SELECT EXISTS (SELECT 1 FROM products LIMIT 1)),
    'transactions', (SELECT EXISTS (SELECT 1 FROM transactions LIMIT 1)),
    'echo_products', (SELECT EXISTS (SELECT 1 FROM echo_products LIMIT 1))
  );
  RETURN result;
END;
$$;`,

  create_function: `
CREATE OR REPLACE FUNCTION create_check_rls_function()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Create the function that checks RLS permissions
  EXECUTE '
  CREATE OR REPLACE FUNCTION check_rls_permissions()
  RETURNS json
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $func$
  DECLARE
    result json;
  BEGIN
    result := json_build_object(
      ''products'', (SELECT EXISTS (SELECT 1 FROM products LIMIT 1)),
      ''transactions'', (SELECT EXISTS (SELECT 1 FROM transactions LIMIT 1)),
      ''echo_products'', (SELECT EXISTS (SELECT 1 FROM echo_products LIMIT 1))
    );
    RETURN result;
  END;
  $func$;
  ';
  
  result := json_build_object('success', true);
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  result := json_build_object('success', false, 'error', SQLERRM);
  RETURN result;
END;
$$;`
};

// SQL to run all statements in one go (for Supabase SQL Editor)
export const fullDatabaseSetupSQL = `
-- Create Products Table
${createTableStatements.products}

-- Create Transactions Table
${createTableStatements.transactions}

-- Create Echo Products Table
${createTableStatements.echoProducts}

-- Create RLS Check Function
${createTableStatements.rls_check_function}

-- Create Function Builder
${createTableStatements.create_function}

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

-- Allow anon insert/update for demo purposes (remove in production)
CREATE POLICY "Allow anon write on products" 
  ON products FOR INSERT TO anon 
  WITH CHECK (true);

CREATE POLICY "Allow anon update on products" 
  ON products FOR UPDATE TO anon 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow anon write on transactions" 
  ON transactions FOR INSERT TO anon 
  WITH CHECK (true);

CREATE POLICY "Allow anon update on transactions" 
  ON transactions FOR UPDATE TO anon 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow anon write on echo_products" 
  ON echo_products FOR INSERT TO anon 
  WITH CHECK (true);

CREATE POLICY "Allow anon update on echo_products" 
  ON echo_products FOR UPDATE TO anon 
  USING (true) 
  WITH CHECK (true);
`;
