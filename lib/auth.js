import { createBrowserSupabaseClient } from "./supabase-browser";

export async function signIn(email) {
  try {
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
      },
    });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Auth Error:", error.message);
    return { data: null, error: error.message };
  }
}

export async function signOut() {
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}
