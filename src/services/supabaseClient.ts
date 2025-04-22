
import { createClient } from "@supabase/supabase-js";

// Use the provided Supabase credentials
const supabaseUrl = "https://brtortldwvimpejrofqg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJydG9ydGxkd3ZpbXBlanJvZnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNDU2NzgsImV4cCI6MjA2MDkyMTY3OH0.47vqx5cK5otF_YfZRkj2XHqQjq32K3PfaXuND3Ju2kc";

// Create the Supabase client with better timeout and retry configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (...args) => {
      // @ts-ignore - args typing issue with fetch
      return fetch(...args).catch(err => {
        console.error("Supabase fetch error:", err);
        throw err;
      });
    },
  },
});

// Test connection and log connection status
(async function testConnection() {
  try {
    const { data, error } = await supabase.from('products').select('count(*)', { count: 'exact', head: true });
    if (error) {
      console.error("Supabase connection test error:", error.message);
    } else {
      console.log("Supabase connection test successful!");
    }
  } catch (err) {
    console.error("Supabase connection test failed:", err);
  }
})();

// Helper function to check if Supabase connection is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};
