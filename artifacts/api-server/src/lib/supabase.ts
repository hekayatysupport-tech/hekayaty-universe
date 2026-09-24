import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

/**
 * Returns the server-side Supabase client (service role — bypasses RLS).
 * Initialized lazily so that dotenv has time to load env vars first.
 */
const DEFAULT_SUPABASE_URL = "https://ufbaokhbfntlkvyzgses.supabase.co";
const DEFAULT_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmYmFva2hiZm50bGt2eXpnc2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NjIzNDIsImV4cCI6MjEwMzQzODM0Mn0.sI87nP35sV9B7iKnzUqykjDq3Ht9xcQb-t_CMWzbpi4";

export function getSupabase(): SupabaseClient {
  if (_client) return _client;

  const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"] || DEFAULT_SUPABASE_URL;
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"] || process.env["SUPABASE_ANON_KEY"] || process.env["VITE_SUPABASE_ANON_KEY"] || DEFAULT_SUPABASE_KEY;

  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

/** Convenience proxy — routes can use `supabase` directly. */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as any)[prop];
  },
});
