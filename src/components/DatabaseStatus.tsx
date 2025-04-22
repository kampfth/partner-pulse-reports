
import { useEffect, useState } from 'react';
import { checkDatabaseSetup } from '@/config/database';
import { isSupabaseConfigured, supabase } from '@/services/supabaseClient';
import { AlertCircle, CheckCircle2, RefreshCw, Table } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

const DatabaseStatus = () => {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [tablesStatus, setTablesStatus] = useState<{
    products: boolean;
    transactions: boolean;
    echoProducts: boolean;
  } | null>(null);
  const [allTablesReady, setAllTablesReady] = useState<boolean>(false);
  const [checking, setChecking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  useEffect(() => {
    checkConfiguration();
    // eslint-disable-next-line
  }, []);

  const checkConfiguration = async () => {
    setChecking(true);
    setConnectionStatus("Testando conexão com o Supabase...");

    // Check if Supabase is configured with valid credentials
    const configStatus = isSupabaseConfigured();
    setIsConfigured(configStatus);

    if (configStatus) {
      try {
        // Test tables
        setConnectionStatus("Conectado ao Supabase, verificando tabelas...");
        const { isReady, tablesStatus: status } = await checkDatabaseSetup();
        
        setTablesStatus(status);
        setAllTablesReady(isReady);
        
        setConnectionStatus(isReady 
          ? "Conexão com o banco de dados estabelecida com sucesso." 
          : "Conexão estabelecida, mas nem todas as tabelas estão acessíveis.");
      } catch (error) {
        console.error("Unexpected error during database check:", error);
        setConnectionStatus(`Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`);
        setAllTablesReady(false);
      }
    }
    
    setChecking(false);
  };

  const handleManualCheck = () => {
    toast.info("Verificando configuração do banco de dados...");
    checkConfiguration();
  };

  // Render SQL instructions for missing tables
  const renderSQLInstructions = () => {
    if (tablesStatus && !allTablesReady) {
      const missingTables: string[] = [];
      if (!tablesStatus.products) missingTables.push("products");
      if (!tablesStatus.transactions) missingTables.push("transactions");
      if (!tablesStatus.echoProducts) missingTables.push("echo_products");
      
      if (missingTables.length > 0) {
        return (
          <>
            <div className="flex items-center mt-3 mb-2">
              <Table className="h-4 w-4 mr-2" />
              <span className="font-semibold">Tabelas faltantes: {missingTables.join(", ")}</span>
            </div>
            <span className="block text-sm">
              Verifique suas permissões RLS no Supabase ou execute os seguintes comandos SQL para criar as tabelas faltantes:
            </span>
            <pre className="mt-2 p-2 bg-slate-900 text-white text-xs rounded overflow-auto max-h-52">
{`-- Create Products Table (if needed)
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  "productId" TEXT UNIQUE NOT NULL,
  "productName" TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  "isEcho" BOOLEAN DEFAULT false
);

-- Create Transactions Table (if needed)
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

-- Create Echo Products Table (if needed)
CREATE TABLE IF NOT EXISTS echo_products (
  id SERIAL PRIMARY KEY,
  "productId" TEXT UNIQUE NOT NULL,
  "productName" TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  FOREIGN KEY ("productId") REFERENCES products("productId") ON DELETE CASCADE
);

-- Set up RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE echo_products ENABLE ROW LEVEL SECURITY;

-- Create policies for table access
CREATE POLICY "Allow all operations for authenticated users on products" 
  ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read on products" 
  ON products FOR SELECT TO anon USING (true);

CREATE POLICY "Allow all operations for authenticated users on transactions" 
  ON transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read on transactions" 
  ON transactions FOR SELECT TO anon USING (true);

CREATE POLICY "Allow all operations for authenticated users on echo_products" 
  ON echo_products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read on echo_products" 
  ON echo_products FOR SELECT TO anon USING (true);`}
            </pre>
          </>
        );
      }
    }
    return null;
  };

  // Render table status summary
  const renderTableStatus = () => {
    if (!tablesStatus) return null;
    
    return (
      <div className="grid grid-cols-1 gap-2 mt-3">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${tablesStatus.products ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">Tabela products: {tablesStatus.products ? 'Acessível' : 'Inacessível'}</span>
        </div>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${tablesStatus.transactions ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">Tabela transactions: {tablesStatus.transactions ? 'Acessível' : 'Inacessível'}</span>
        </div>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${tablesStatus.echoProducts ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">Tabela echo_products: {tablesStatus.echoProducts ? 'Acessível' : 'Inacessível'}</span>
        </div>
      </div>
    );
  };

  if (isConfigured === null || checking) {
    return (
      <Alert className="my-4">
        <AlertTitle className="flex items-center">
          <span className="animate-pulse mr-2">⏳</span> {connectionStatus || "Verificando configuração do banco de dados..."}
        </AlertTitle>
      </Alert>
    );
  }

  if (!isConfigured) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertTitle>Banco de dados não configurado</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            A conexão com o Supabase não está configurada corretamente. Por favor, adicione sua URL do Supabase e chave anônima.
          </p>
          <ol className="list-decimal list-inside text-sm space-y-1">
            <li>Abra o painel de integração do Supabase (botão verde no canto superior direito)</li>
            <li>Adicione seus VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY</li>
            <li>Atualize a página após salvar</li>
          </ol>
        </AlertDescription>
      </Alert>
    );
  }

  // Exibe alerta de sucesso/erro após checagem de tabelas
  return (
    <Alert variant={allTablesReady ? "default" : "destructive"} className={`my-4 ${allTablesReady ? "bg-green-500/10 border-green-500 text-green-700" : ""}`}>
      {allTablesReady
        ? (<CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />)
        : (<AlertCircle className="h-4 w-4 mr-2" />)
      }
      <AlertTitle className="flex items-center justify-between">
        <span>{allTablesReady ? "Banco pronto para uso" : "Problema de acesso às tabelas"}</span>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-7 px-2 flex items-center gap-1" 
          onClick={handleManualCheck}
          title="Verificar status do banco de dados novamente"
        >
          <RefreshCw className="h-3 w-3" />
          <span className="text-xs">Verificar</span>
        </Button>
      </AlertTitle>
      <AlertDescription>
        {connectionStatus && <p className="text-sm mb-2">{connectionStatus}</p>}
        {renderTableStatus()}
        {renderSQLInstructions()}
      </AlertDescription>
    </Alert>
  );
};

export default DatabaseStatus;
