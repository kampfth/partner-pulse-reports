
import { createClient } from "@supabase/supabase-js";

// Use the provided Supabase credentials
const supabaseUrl = "https://brtortldwvimpejrofqg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJydG9ydGxkd3ZpbXBlanJvZnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNDU2NzgsImV4cCI6MjA2MDkyMTY3OH0.47vqx5cK5otF_YfZRkj2XHqQjq32K3PfaXuND3Ju2kc";

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log connection status for debugging
console.log("Supabase connection initialized with provided credentials");

// Helper function to check if Supabase connection is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey); // Checa se ambos são verdadeiros (não vazios)
};
