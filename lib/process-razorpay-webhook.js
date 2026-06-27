import { supabase } from "@/lib/supabase";

/**
 * Core Razorpay webhook processing — used by the live webhook endpoint
 * and the manual retry/reprocess API.
 */
export async function processRazorpayWebhookEvent(event) {
  if (!event || !event.event) {
    throw new Error("Invalid webhook event payload");
  }

  let invoiceId = null;

  if (event.event === "payment_link.paid") {
    const paymentLinkObj = event.payload?.payment_link?.entity;

    if (!paymentLinkObj) {
      throw new Error("payment_link entity missing from payload");
    }

    invoiceId = paymentLinkObj.notes?.invoice_id || paymentLinkObj.id;

    const { error: updateError } = await supabase
      .from("invoices")
      .update({ status: "paid" })
      .eq("payment_link_id", paymentLinkObj.id);

    if (updateError) throw updateError;
  }

  return {
    invoiceId: invoiceId ? String(invoiceId) : null,
    eventType: event.event,
  };
}
