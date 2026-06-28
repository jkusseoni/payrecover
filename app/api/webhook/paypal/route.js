import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();

    if (
      body.event_type === "BILLING.SUBSCRIPTION.ACTIVATED" ||
      body.event_type === "PAYMENT.SALE.COMPLETED"
    ) {
      const userEmail =
        body.resource?.subscriber?.email_address ||
        body.resource?.payer?.email_address;
      const paypalPlanId = body.resource?.plan_id;

      if (!userEmail) {
        return Response.json({ error: "No email found in webhook" }, { status: 400 });
      }

      const supabaseAdmin = getSupabaseAdmin();

      const { data: userData, error: userError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", userEmail)
        .single();

      if (userError || !userData) {
        console.error("User not found for email:", userEmail);
        return Response.json({ error: "User profile not found" }, { status: 404 });
      }

      let planName = "Basic";
      if (paypalPlanId === "YOUR_PAYPAL_PRO_PLAN_ID") planName = "Professional";
      if (paypalPlanId === "YOUR_PAYPAL_ULTIMATE_PLAN_ID") planName = "Ultimate";

      const { error: subError } = await supabaseAdmin
        .from("subscriptions")
        .upsert(
          {
            user_id: userData.id,
            status: "active",
            plan: planName,
            paypal_subscription_id: body.resource.id,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (subError) {
        console.error("Database insert error:", subError.message);
        return Response.json({ error: subError.message }, { status: 500 });
      }

      console.log(`Subscription successfully activated for ${userEmail}`);
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
