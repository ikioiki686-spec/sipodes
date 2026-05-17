import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function isRealSupabaseConfig(url?: string, anonKey?: string) {
  return Boolean(
    url &&
      anonKey &&
      url.startsWith("https://") &&
      url.includes(".supabase.co") &&
      !url.includes("your-project") &&
      anonKey !== "your-anon-key",
  );
}

export const isSupabaseConfigured = isRealSupabaseConfig(
  supabaseUrl,
  supabaseAnonKey,
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;
