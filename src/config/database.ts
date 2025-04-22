
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

// Função que verifica se as tabelas existem (não tenta criar)
export async function checkDatabaseSetupAndAutoCreate(): Promise<boolean> {
  let tablesExist = true;
  let missingTables: string[] = [];
  // Checa products
  const { error: productsError } = await supabase
    .from(dbConfig.tables.products)
    .select('count(*)', { count: 'exact', head: true });
  if (productsError) {
    tablesExist = false;
    missingTables.push('products');
  }

  const { error: transactionsError } = await supabase
    .from(dbConfig.tables.transactions)
    .select('count(*)', { count: 'exact', head: true });
  if (transactionsError) {
    tablesExist = false;
    missingTables.push('transactions');
  }

  const { error: echoProductsError } = await supabase
    .from(dbConfig.tables.echoProducts)
    .select('count(*)', { count: 'exact', head: true });
  if (echoProductsError) {
    tablesExist = false;
    missingTables.push('echo_products');
  }

  // Log if tables are missing
  if (!tablesExist) {
    console.warn("Tabelas não encontradas:", missingTables);
  }

  return tablesExist;
}

// SQL statements for creating required tables (opcional, para mostrar ao usuário)
export const createTableStatements = {
  products: `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      "productId" TEXT UNIQUE NOT NULL,
      "productName" TEXT NOT NULL,
      date TIMESTAMP NOT NULL,
      "isEcho" BOOLEAN DEFAULT false
    );
  `,
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
    );
  `,
  echoProducts: `
    CREATE TABLE IF NOT EXISTS echo_products (
      id SERIAL PRIMARY KEY,
      "productId" TEXT UNIQUE NOT NULL,
      "productName" TEXT NOT NULL,
      date TIMESTAMP NOT NULL,
      FOREIGN KEY ("productId") REFERENCES products("productId") ON DELETE CASCADE
    );
  `
};
