import { getUser } from "@/lib/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function fetchUserInvoices() {
  const user = await getUser();

  if (!user) return [];

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching invoices:", error.message);
    return [];
  }

  return data ?? [];
}
