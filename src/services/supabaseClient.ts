
import { createClient } from "@supabase/supabase-js";

// Check if environment variables are available and provide fallbacks if needed
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that we have the required configuration
if (!supabaseUrl) {
  console.error("Missing VITE_SUPABASE_URL environment variable");
}

if (!supabaseAnonKey) {
  console.error("Missing VITE_SUPABASE_ANON_KEY environment variable");
}

// Create the Supabase client with appropriate error handling
export const supabase = createClient(
  supabaseUrl || "",
  supabaseAnonKey || ""
);

// Log connection status for debugging
console.log("Supabase connection status:", supabaseUrl ? "URL configured" : "URL missing", 
  supabaseAnonKey ? "Key configured" : "Key missing");
