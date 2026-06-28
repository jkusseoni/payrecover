import { getUser } from "@/lib/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// यूज़र का सब्सक्रिप्शन स्टेटस चेक करने के लिए
export async function checkSubscription() {
  const user = await getUser();
  if (!user) return { isActive: false, plan: null };

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return { isActive: false, plan: null };
  }

  // चेक करें कि प्लान एक्टिव है और उसकी वैलिडिटी बची है या नहीं
  const isExpired = new Date(data.current_period_end) < new Date();

  if (data.status === "active" && !isExpired) {
    return { isActive: true, plan: data.plan, data };
  }

  return { isActive: false, plan: data.plan };
}
