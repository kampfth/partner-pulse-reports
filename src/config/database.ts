
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

// Função para criar tabela usando SQL
async function createTableIfMissing(tableName: string, sql: string): Promise<boolean> {
  // Tentativa de criar a tabela via função SQL do Supabase
  try {
    // Fallback usando o método restante RPC direto
    const { error } = await supabase.rpc('execute_sql', { sql });
    if (error) {
      console.error(`Erro ao criar tabela ${tableName}:`, error);
      
      // Tentativa alternativa usando REST API (createTable)
      try {
        const { data, error: createError } = await supabase
          .from('_meta')
          .select('*')
          .then(() => ({
            data: null,
            error: null
          }))
          .catch(() => {
            // Executar SQL diretamente (em alguns ambientes Supabase)
            return supabase.auth.admin.createTable({ tableName, sql });
          });
          
        if (createError) {
          console.error(`Erro na segunda tentativa de criar ${tableName}:`, createError);
          return false;
        }
        
        return true;
      } catch (fallbackError) {
        console.error(`Erro completo ao tentar criar ${tableName}:`, fallbackError);
        return false;
      }
    }
    
    console.log(`Tabela ${tableName} criada com sucesso!`);
    return true;
  } catch (e) {
    console.error(`Exceção ao criar tabela ${tableName}:`, e);
    return false;
  }
}

// Função que verifica e cria as tabelas caso não existam:
export async function checkDatabaseSetupAndAutoCreate(): Promise<boolean> {
  try {
    // Checa products
    let tablesExist = true;

    const { error: productsError } = await supabase
      .from(dbConfig.tables.products)
      .select('count(*)', { count: 'exact', head: true });
    if (productsError) {
      tablesExist = false;
      const productsCreated = await createTableIfMissing('products', createTableStatements.products);
      if (!productsCreated) return false;
    }

    const { error: transactionsError } = await supabase
      .from(dbConfig.tables.transactions)
      .select('count(*)', { count: 'exact', head: true });
    if (transactionsError) {
      tablesExist = false;
      const txCreated = await createTableIfMissing('transactions', createTableStatements.transactions);
      if (!txCreated) return false;
    }

    const { error: echoProductsError } = await supabase
      .from(dbConfig.tables.echoProducts)
      .select('count(*)', { count: 'exact', head: true });
    if (echoProductsError) {
      tablesExist = false;
      const echoCreated = await createTableIfMissing('echo_products', createTableStatements.echoProducts);
      if (!echoCreated) return false;
    }

    // Após garantir as tabelas, retorna true se todas existem/agora existem
    return true;
  } catch (error) {
    console.error("Erro ao checar/criar tabelas no banco:", error);
    return false;
  }
}

// SQL statements for creating required tables (updated to match Supabase tables)
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
