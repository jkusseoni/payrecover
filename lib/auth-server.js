import { createServerSupabaseClient } from "./supabase-server";

export async function getUser() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    if (error.message !== "Auth session missing!") {
      console.error("Fetch user error:", error.message);
    }
    return null;
  }
}
