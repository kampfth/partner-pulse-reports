
import { createClient } from "@supabase/supabase-js";

// As variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY estão disponíveis automaticamente para o projeto Lovable integrado.
// Se necessário, ajuste para sua configuração.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
