import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // .env में यह की होना ज़रूरी है ताकि RLS बायपास हो
);

export async function POST(req) {
  try {
    const rawBody = await req.text(); // रेज़रपे वेरिफिकेशन के लिए रॉ टेक्स्ट चाहिए
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET; // जो हम रेज़रपे डैशबोर्ड में सेट करेंगे

    // 1. सिक्योरिटी चेक: वेरीफाई करें कि रिक्वेस्ट सच में रेज़रपे से आई है
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

    // 2. पेमेंट सक्सेसफुल होने वाले इवेंट को पकड़ें
    if (body.event === "payment.captured" || body.event === "order.paid") {
      const paymentEntity = body.payload.payment.entity;
      const userEmail = paymentEntity.email; // रेज़रपे पेमेंट फॉर्म में यूज़र जो ईमेल डालेगा
      
      // नोट्स या यूआरएल से भी हम ट्रैक कर सकते हैं, पर ईमेल सबसे सेफ है
      if (!userEmail) {
        return Response.json({ error: "No email found in webhook" }, { status: 400 });
      }

      // 3. ईमेल के ज़रिए Supabase profiles से User ID (UUID) निकालें
      const { data: userData, error: userError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", userEmail)
        .single();

      if (userError || !userData) {
        console.error("Razorpay Webhook: User not found for email:", userEmail);
        return Response.json({ error: "User profile not found" }, { status: 404 });
      }

      // 4. पेमेंट अमाउंट के हिसाब से प्लान तय करें (पैसे पैसे में आते हैं, यानी ₹449 = 44900)
      let planName = "Basic";
      const amountPaid = paymentEntity.amount / 100; // पैसे से रुपये में बदलें

      if (amountPaid >= 800 && amountPaid < 1200) planName = "Professional";
      if (amountPaid >= 1200) planName = "Ultimate";

      // 5. डेटाबेस में सब्सक्रिप्शन एक्टिवेट/अपडेट (Upsert) करें
      const { error: subError } = await supabaseAdmin
        .from("subscriptions")
        .upsert({
          user_id: userData.id,
          status: "active",
          plan: planName,
          razorpay_payment_id: paymentEntity.id,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (subError) {
        console.error("Razorpay DB Error:", subError.message);
        return Response.json({ error: subError.message }, { status: 500 });
      }

      console.log(`🎉 Razorpay: Subscription successfully activated for ${userEmail} (${planName})`);
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error("Razorpay Webhook error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}