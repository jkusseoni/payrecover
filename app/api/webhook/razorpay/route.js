import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import { processRazorpayWebhookEvent } from "@/lib/process-razorpay-webhook";

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  let eventType = "unknown";
  let invoiceId = null;
  let parsedBody = null;

  try {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      throw new Error("Invalid signature verification failed");
    }

    parsedBody = JSON.parse(body);
    eventType = parsedBody.event || "unknown";

    const result = await processRazorpayWebhookEvent(parsedBody);
    invoiceId = result.invoiceId;

    await supabase.from("webhook_logs").insert({
      event_type: eventType,
      invoice_id: invoiceId,
      status: "success",
      payload: parsedBody,
      provider: "razorpay",
    });
  } catch (err) {
    await supabase.from("webhook_logs").insert({
      event_type: eventType,
      invoice_id: invoiceId,
      status: "failed",
      error_message: err.message,
      payload: parsedBody ? parsedBody : { raw_body: body },
      provider: "razorpay",
    });
  }

  return new Response("OK", { status: 200 });
}
