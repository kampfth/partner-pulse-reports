
import { useEffect, useState } from 'react';
import { checkDatabaseSetupAndAutoCreate, createTableStatements } from '@/config/database';
import { isSupabaseConfigured } from '@/services/supabaseClient';
import { AlertCircle, CheckCircle2, Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const DatabaseStatus = () => {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [tablesReady, setTablesReady] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [autoCreateMsg, setAutoCreateMsg] = useState<string | null>(null);

  useEffect(() => {
    checkConfiguration();
    // eslint-disable-next-line
  }, []);

  const checkConfiguration = async () => {
    setChecking(true);

    // Check if Supabase is configured with valid credentials
    const configStatus = isSupabaseConfigured();
    setIsConfigured(configStatus);

    if (configStatus) {
      // Verifica se as tabelas existem
      const dbStatus = await checkDatabaseSetupAndAutoCreate();
      setTablesReady(dbStatus);
      if (dbStatus) {
        setAutoCreateMsg("Todas as tabelas necessárias foram encontradas no banco de dados e estão prontas para uso.");
      } else {
        setAutoCreateMsg(
          <>
            <span className="font-semibold text-red-700">Alguma(s) tabela(s) obrigatória(s) não foi/foram encontrada(s) no banco de dados.</span>
            <br />
            <span className="block mt-2">Copie e cole estes comandos no SQL Editor do seu painel Supabase para criar as tabelas:</span>
            <pre className="mt-2 p-2 bg-slate-900 text-white text-xs rounded overflow-auto">
{createTableStatements.products}
{createTableStatements.transactions}
{createTableStatements.echoProducts}
            </pre>
            <p className="mt-2 text-sm">
              Após criar as tabelas pelo painel, clique em <b>Verificar novamente</b>.
            </p>
          </>
        );
      }
    }
    setChecking(false);
  };

  if (isConfigured === null || checking) {
    return (
      <Alert className="my-4">
        <AlertTitle className="flex items-center">
          <span className="animate-pulse mr-2">⏳</span> Checking database configuration...
        </AlertTitle>
      </Alert>
    );
  }

  if (!isConfigured) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertTitle>Database Not Configured</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            The Supabase connection is not properly configured. Please add your Supabase URL and anonymous key.
          </p>
          <ol className="list-decimal list-inside text-sm space-y-1">
            <li>Open the Supabase integration panel (green button in top right)</li>
            <li>Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</li>
            <li>Refresh the page after saving</li>
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
      <AlertTitle>
        {tablesReady ? "Banco pronto para uso" : "Tabelas não encontradas"}
      </AlertTitle>
      <AlertDescription>
        {autoCreateMsg}
        <div className="mt-2">
          <Button size="sm" onClick={checkConfiguration}>
            Verificar novamente
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default DatabaseStatus;
