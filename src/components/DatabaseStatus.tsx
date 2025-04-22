
import { useEffect, useState } from 'react';
import { checkDatabaseSetupAndAutoCreate } from '@/config/database';
import { isSupabaseConfigured, supabase } from '@/services/supabaseClient';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

const DatabaseStatus = () => {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [tablesReady, setTablesReady] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [autoCreateMsg, setAutoCreateMsg] = useState<string | null>(null);

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
        // Test basic Supabase connectivity first
        const { data: connectionTest, error: connectionError } = await supabase.from('products').select('count(*)', { count: 'exact', head: true });

        if (connectionError) {
          console.error("Connection test error:", connectionError);
          if (connectionError.code === "PGRST116") {
            // This error actually means the table exists but user doesn't have permission
            setConnectionStatus("Conectado ao Supabase, verificando tabelas...");
            const dbStatus = await checkDatabaseSetupAndAutoCreate();
            setTablesReady(dbStatus);
            setAutoCreateMsg(dbStatus 
              ? "Todas as tabelas necessárias foram encontradas no banco de dados e estão prontas para uso."
              : "Alguma(s) tabela(s) obrigatória(s) não foi/foram encontrada(s) no banco de dados.");
          } else {
            setConnectionStatus(`Erro de conexão: ${connectionError.message}`);
            setTablesReady(false);
          }
        } else {
          setConnectionStatus("Conectado ao Supabase, verificando tabelas...");
          // Verify tables existence
          const dbStatus = await checkDatabaseSetupAndAutoCreate();
          setTablesReady(dbStatus);
          setAutoCreateMsg(dbStatus 
            ? "Todas as tabelas necessárias foram encontradas no banco de dados e estão prontas para uso."
            : "Alguma(s) tabela(s) obrigatória(s) não foi/foram encontrada(s) no banco de dados.");
        }
      } catch (error) {
        console.error("Unexpected error during connection check:", error);
        setConnectionStatus(`Erro inesperado: ${error instanceof Error ? error.message : 'Desconhecido'}`);
        setTablesReady(false);
      }
    }
    
    setChecking(false);
  };

  const handleManualCheck = () => {
    toast.info("Verificando configuração do banco de dados...");
    checkConfiguration();
  };

  // Render SQL statements separately from state
  const renderSQLInstructions = () => {
    if (!tablesReady && isConfigured) {
      return (
        <>
          <span className="block mt-2">Copie e cole estes comandos no SQL Editor do seu painel Supabase para criar as tabelas:</span>
          <pre className="mt-2 p-2 bg-slate-900 text-white text-xs rounded overflow-auto max-h-52">
{`-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  "productId" TEXT UNIQUE NOT NULL,
  "productName" TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  "isEcho" BOOLEAN DEFAULT false
);

-- Create Transactions Table
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

-- Create Echo Products Table
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
  USING (true);`}
          </pre>
          <p className="mt-2 text-sm">
            Após criar as tabelas pelo painel, clique em <b>Verificar novamente</b>.
          </p>
        </>
      );
    }
    return null;
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

  // Exibe alerta sucesso/erro pós checagem de tabelas
  return (
    <Alert variant={tablesReady ? "default" : "destructive"} className={`my-4 ${tablesReady ? "bg-green-500/10 border-green-500 text-green-700" : ""}`}>
      {tablesReady
        ? (<CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />)
        : (<AlertCircle className="h-4 w-4 mr-2" />)
      }
      <AlertTitle className="flex items-center justify-between">
        <span>{tablesReady ? "Banco pronto para uso" : "Tabelas não encontradas"}</span>
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
        {autoCreateMsg}
        {renderSQLInstructions()}
      </AlertDescription>
    </Alert>
  );
};

export default DatabaseStatus;
