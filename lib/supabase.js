import { createClient } from "@supabase/supabase-js";
import { getMissingEnvVars } from "@/lib/validate-env";

let supabaseClient = null;

function resolveSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
    /\/rest\/v1\/?$/,
    ""
  ).replace(/\/$/, "");
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  const missing = getMissingEnvVars([
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]);

  if (missing.length > 0) {
    throw new Error(
      `Missing Supabase environment variables: ${missing.join(", ")}`
    );
  }

  if (!supabaseUrl?.startsWith("http")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL must be the project root URL (e.g. https://xxx.supabase.co)"
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

function createSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey } = resolveSupabaseConfig();

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient();
  }
  return supabaseClient;
}

export const supabase = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getSupabase();
      const value = client[prop];
      return typeof value === "function" ? value.bind(client) : value;
    },
  }
);
