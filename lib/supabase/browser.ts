import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAnonKey, supabaseUrl } from './config';

let client: SupabaseClient | null = null;

/**
 * Cookie based browser client used by the admin dashboard.
 *
 * Why not `createClient` from `@supabase/supabase-js`: that client keeps the
 * session in localStorage, which the server (proxy, route handlers) cannot
 * read. With cookies, the browser and the server share the exact same session,
 * so `proxy.ts` can protect `/admin` and `/api/revalidate` can verify the admin.
 *
 * Returns `null` on the server and when Supabase is not configured, so server
 * rendering stays deterministic and the UI can show a clear "not configured"
 * state instead of crashing.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  client ??= createBrowserClient(supabaseUrl, supabaseAnonKey);
  return client;
}
