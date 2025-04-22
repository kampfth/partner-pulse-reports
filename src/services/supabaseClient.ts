
import { createClient } from "@supabase/supabase-js";

// Use the provided Supabase credentials
const supabaseUrl = "https://brtortldwvimpejrofqg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJydG9ydGxkd3ZpbXBlanJvZnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNDU2NzgsImV4cCI6MjA2MDkyMTY3OH0.47vqx5cK5otF_YfZRkj2XHqQjq32K3PfaXuND3Ju2kc";

// Create the Supabase client with better timeout and retry configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Simple helper to test direct table access
export async function testTableAccess(tableName: string): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    return !error;
  } catch (err) {
    console.error(`Error testing access to table ${tableName}:`, err);
    return false;
  }
}

// Helper function to check if Supabase connection is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};
