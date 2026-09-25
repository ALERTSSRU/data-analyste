/**
 * Single place where the Supabase environment variables are read.
 * Every Supabase helper in `lib/supabase/*` imports from here so that the
 * "is Supabase configured?" check is never duplicated.
 *
 * When the variables are missing the app keeps working with the static
 * fallbacks declared in `lib/portfolio.ts` — useful for local UI work.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
