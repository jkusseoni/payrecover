import { getUser } from "@/lib/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function createInvoice(invoiceData) {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("invoices")
    .insert([
      {
        ...invoiceData,
        user_id: user.id,
      },
    ])
    .select("id")
    .single();

  if (error) throw error;
  return data;
}
