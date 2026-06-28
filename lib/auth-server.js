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
    const message = error?.message ?? String(error);
    const isExpectedAuthError =
      message === "Auth session missing!" ||
      message.includes("Dynamic server usage");

    if (!isExpectedAuthError) {
      console.error("Fetch user error:", message);
    }
    return null;
  }
}
