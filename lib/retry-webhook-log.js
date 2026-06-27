import { supabase } from "@/lib/supabase";
import { processRazorpayWebhookEvent } from "@/lib/process-razorpay-webhook";
import { sendWebhookHardFailAlert } from "@/lib/webhook-alerts";

/**
 * Reprocess a single failed webhook log. Used by manual retry API and cron auto-retry.
 */
export async function retryWebhookLog(id) {
  const { data: log, error: fetchError } = await supabase
    .from("webhook_logs")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !log) {
    return { success: false, error: "Log not found", status: 404 };
  }

  if (log.status !== "failed") {
    return {
      success: false,
      error: "Only failed webhooks can be retried",
      status: 400,
    };
  }

  if ((log.delivery_attempts ?? 0) >= 3) {
    return {
      success: false,
      error: "Maximum retry attempts (3) reached",
      status: 400,
    };
  }

  if (!log.payload || log.payload.raw_body) {
    return {
      success: false,
      error: "Invalid or unparsed payload — cannot retry",
      status: 400,
    };
  }

  const nextAttempts = (log.delivery_attempts ?? 0) + 1;

  let status = "success";
  let errorMsg = null;
  let invoiceId = log.invoice_id;

  try {
    const result = await processRazorpayWebhookEvent(log.payload);
    invoiceId = result.invoiceId ?? invoiceId;
  } catch (err) {
    status = "failed";
    errorMsg = err.message;
  }

  const { error: updateLogErr } = await supabase
    .from("webhook_logs")
    .update({
      status,
      error_message: errorMsg,
      invoice_id: invoiceId,
      delivery_attempts: nextAttempts,
    })
    .eq("id", id);

  if (updateLogErr) {
    return { success: false, error: updateLogErr.message, status: 500 };
  }

  // Hard fail: 3 retry attempts exhausted — notify merchant via Slack + email
  if (status === "failed" && nextAttempts >= 3) {
    await sendWebhookHardFailAlert({
      eventType: log.event_type,
      invoiceId,
      errorMessage: errorMsg,
      logId: id,
    });
  }

  if (status === "failed") {
    return { success: false, error: errorMsg, status: 400, delivery_attempts: nextAttempts };
  }

  return {
    success: true,
    message: "Webhook reprocessed successfully!",
    invoice_id: invoiceId,
    delivery_attempts: nextAttempts,
  };
}
