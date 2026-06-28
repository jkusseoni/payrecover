import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (secret) {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        return Response.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const body = JSON.parse(rawBody);

    if (body.event === "payment.captured" || body.event === "order.paid") {
      const paymentEntity = body.payload.payment.entity;
      const userEmail = paymentEntity.email;

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
        console.error("Razorpay Webhook: User not found for email:", userEmail);
        return Response.json({ error: "User profile not found" }, { status: 404 });
      }

      let planName = "Basic";
      const amountPaid = paymentEntity.amount / 100;

      if (amountPaid >= 800 && amountPaid < 1200) planName = "Professional";
      if (amountPaid >= 1200) planName = "Ultimate";

      const { error: subError } = await supabaseAdmin
        .from("subscriptions")
        .upsert(
          {
            user_id: userData.id,
            status: "active",
            plan: planName,
            razorpay_payment_id: paymentEntity.id,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (subError) {
        console.error("Razorpay DB Error:", subError.message);
        return Response.json({ error: subError.message }, { status: 500 });
      }

      console.log(
        `Razorpay: Subscription activated for ${userEmail} (${planName})`
      );
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error("Razorpay Webhook error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
