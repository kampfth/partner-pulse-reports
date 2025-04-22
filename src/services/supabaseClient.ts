
import { createClient } from "@supabase/supabase-js";

// Define fallback values for development - replace these with your actual Supabase credentials
const DEFAULT_SUPABASE_URL = "https://your-supabase-project.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "your-anon-key";

// Try to get environment variables, use fallbacks for development if needed
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log connection status for debugging
console.log("Supabase connection initialized with:", 
  supabaseUrl === DEFAULT_SUPABASE_URL ? "DEFAULT URL (please update)" : "Environment URL",
  supabaseAnonKey === DEFAULT_SUPABASE_ANON_KEY ? "DEFAULT KEY (please update)" : "Environment KEY");

// Helper function to check if Supabase connection is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== DEFAULT_SUPABASE_URL && supabaseAnonKey !== DEFAULT_SUPABASE_ANON_KEY;
};
