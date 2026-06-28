import { createClient } from "@supabase/supabase-js";

// वेबहुक बैकग्राउंड में चलता है, इसलिए सर्विस रोल या डायरेक्ट क्लाइंट यूज़ करें
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // सुनिश्चित करें कि ये .env में हो ताकि RLS बायपास हो सके
);

export async function POST(req) {
  try {
    const body = await req.json();

    // 1. केवल सब्सक्रिप्शन एक्टिवेट होने वाले इवेंट्स को पकड़ें
    if (body.event_type === "BILLING.SUBSCRIPTION.ACTIVATED" || body.event_type === "PAYMENT.SALE.COMPLETED") {
      
      // पेपाल से ईमेल निकालें
      const userEmail = body.resource?.subscriber?.email_address || body.resource?.payer?.email_address;
      
      // पेपाल की प्लान आईडी निकालें ताकि पता चले कौन सा प्लान ख़रीदा है
      const paypalPlanId = body.resource?.plan_id; 

      if (!userEmail) {
        return Response.json({ error: "No email found in webhook" }, { status: 400 });
      }

      // 2. ईमेल के ज़रिए Supabase auth.users से असली User ID (UUID) खोजें
      const { data: userData, error: userError } = await supabaseAdmin
        .from("profiles") // या आपकी जो भी यूज़र/प्रोफाइल टेबल हो जहाँ ईमेल मैप हो
        .select("id")
        .eq("email", userEmail)
        .single();

      if (userError || !userData) {
        console.error("User not found for email:", userEmail);
        // नोट: अगर यूज़र नहीं मिला, तो आप ईमेल को ही आईडी की तरह बैकअप रख सकते हैं या लॉग कर सकते हैं
        return Response.json({ error: "User profile not found" }, { status: 404 });
      }

      // 3. पेपाल प्लान आईडी को अपने प्लान नाम से मैप करें
      let planName = "Basic";
      // अपनी PayPal Dashboard की Plan IDs से यहाँ मैच कर लें
      if (paypalPlanId === "YOUR_PAYPAL_PRO_PLAN_ID") planName = "Professional";
      if (paypalPlanId === "YOUR_PAYPAL_ULTIMATE_PLAN_ID") planName = "Ultimate";

      // 4. डेटाबेस में सब्सक्रिप्शन इन्सर्ट या अपग्रेड (Upsert) करें
      const { error: subError } = await supabaseAdmin
        .from("subscriptions")
        .upsert({
          user_id: userData.id, // असली UUID जा रही है
          status: "active",
          plan: planName,
          paypal_subscription_id: body.resource.id, // ट्रैकिंग के लिए आईडी स्टोर करें
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' }); // अगर पहले से है तो अपडेट हो जाए

      if (subError) {
        console.error("Database insert error:", subError.message);
        return Response.json({ error: subError.message }, { status: 500 });
      }

      console.log(`🎉 Subscription successfully activated for ${userEmail}`);
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}