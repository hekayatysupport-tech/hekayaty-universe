import { createClient } from "@supabase/supabase-js";

// Ensure environment variables are loaded (Vite uses import.meta.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ufbaokhbfntlkvyzgses.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmYmFva2hiZm50bGt2eXpnc2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjIzNDIsImV4cCI6MjEwMzQzODM0Mn0.sI87nP35sV9B7iKnzUqykjDq3Ht9xcQb-t_CMWzbpi4";

console.log("[Supabase Client] Initialized with URL:", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

