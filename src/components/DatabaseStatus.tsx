
import { useEffect, useState } from 'react';
-import { checkDatabaseSetup } from '@/config/database';
+import { checkDatabaseSetupAndAutoCreate } from '@/config/database';
import { isSupabaseConfigured } from '@/services/supabaseClient';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const DatabaseStatus = () => {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
-  const [tablesExist, setTablesExist] = useState<boolean | null>(null);
+  const [tablesCreatedOrOk, setTablesCreatedOrOk] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
+  const [autoCreateMsg, setAutoCreateMsg] = useState<string | null>(null);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    setChecking(true);
    
    // Check if Supabase is configured with valid credentials
    const configStatus = isSupabaseConfigured();
    setIsConfigured(configStatus);
    
    if (configStatus) {
-      // Check if required tables exist
-      const dbStatus = await checkDatabaseSetup();
-      setTablesExist(dbStatus);
+      // Tenta checar e criar as tabelas automaticamente
+      const dbStatus = await checkDatabaseSetupAndAutoCreate();
+      setTablesCreatedOrOk(dbStatus);
+      setAutoCreateMsg(!dbStatus ? "Erro ao criar/verificar as tabelas do banco. Veja o console para detalhes ou cheque as permissões do Supabase." :
+        "Todas as tabelas necessárias foram verificadas e/ou criadas com sucesso.");
    }
    
    setChecking(false);
  };

-  if (isConfigured === null || checking) {
+  if (isConfigured === null || checking) {
    return (
      <Alert className="my-4">
        <AlertTitle className="flex items-center">
          <span className="animate-pulse mr-2">⏳</span> Checking database configuration...
        </AlertTitle>
      </Alert>
    );
  }

-  if (!isConfigured) {
+  if (!isConfigured) {
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

-  if (tablesExist === false) {
-    return (
-      <Alert variant="destructive" className="my-4">
-        <AlertCircle className="h-4 w-4 mr-2" />
-        <AlertTitle>Missing Database Tables</AlertTitle>
-        <AlertDescription>
-          <p className="mb-2">
-            Your Supabase database is missing required tables. Please create the following tables:
-          </p>
-          <ul className="list-disc list-inside text-sm">
-            <li>products (productId, productName, date, isEcho)</li>
-            <li>transactions (productId, productName, transactionDate, transactionAmount, etc.)</li>
-            <li>echo_products (productId, productName, date)</li>
-          </ul>
-          <Button size="sm" className="mt-2" onClick={checkConfiguration}>
-            Check Again
-          </Button>
-        </AlertDescription>
-      </Alert>
-    );
-  }
-
-  return (
-    <Alert variant="default" className="my-4 bg-green-500/10 border-green-500 text-green-700">
-      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
-      <AlertTitle>Database Connected</AlertTitle>
-      <AlertDescription>
-        Your Supabase database is properly configured and all required tables exist.
-      </AlertDescription>
-    </Alert>
-  );
+  // Exibe alerta sucesso/erro pós criação automática
+  return (
+    <Alert variant={tablesCreatedOrOk ? "default" : "destructive"} className={`my-4 ${tablesCreatedOrOk ? "bg-green-500/10 border-green-500 text-green-700" : ""}`}>
+      {tablesCreatedOrOk
+        ? (<CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />)
+        : (<AlertCircle className="h-4 w-4 mr-2" />)
+      }
+      <AlertTitle>
+        {tablesCreatedOrOk ? "Banco pronto para uso" : "Erro ao criar/verificar tabelas"}
+      </AlertTitle>
+      <AlertDescription>
+        {autoCreateMsg}
+        <div className="mt-2">
+          <Button size="sm" onClick={checkConfiguration}>
+            Verificar novamente
+          </Button>
+        </div>
+      </AlertDescription>
+    </Alert>
+  );
};

export default DatabaseStatus;

