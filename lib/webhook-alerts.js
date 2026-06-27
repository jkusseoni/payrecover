import { sendReminder } from "@/lib/email";

/**
 * Fire Slack + email alerts when a webhook permanently fails after max retries.
 */
export async function sendWebhookHardFailAlert({
  eventType,
  invoiceId,
  errorMessage,
  logId,
}) {
  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  const merchantEmail = process.env.MERCHANT_ALERT_EMAIL;
  const invoiceLabel = invoiceId ?? "N/A";
  const errorLabel = errorMessage ?? "Unknown error";

  const slackText =
    `🚨 *Webhook Hard Fail:* Event \`${eventType}\` permanently failed ` +
    `for Invoice ${invoiceLabel} after 3 retry attempts. ` +
    `Error: ${errorLabel}` +
    (logId ? ` (Log: \`${logId}\`)` : "");

  const alertTasks = [];

  if (slackUrl) {
    alertTasks.push(
      fetch(slackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: slackText }),
      }).then(async (res) => {
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Slack webhook returned ${res.status}: ${body}`);
        }
      })
    );
  } else {
    console.warn("SLACK_WEBHOOK_URL not set — skipping Slack alert.");
  }

  if (merchantEmail && process.env.RESEND_API_KEY) {
    alertTasks.push(
      sendReminder({
        to: merchantEmail,
        subject: `🚨 Webhook Hard Fail: ${eventType}`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px;">
            <h2 style="color: #991b1b;">Webhook Permanently Failed</h2>
            <p>A Razorpay webhook could not be processed after <strong>3 automatic retries</strong>.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px; border: 1px solid #e5e5e5;"><strong>Event</strong></td><td style="padding: 8px; border: 1px solid #e5e5e5;">${eventType}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #e5e5e5;"><strong>Invoice ID</strong></td><td style="padding: 8px; border: 1px solid #e5e5e5;">${invoiceLabel}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #e5e5e5;"><strong>Error</strong></td><td style="padding: 8px; border: 1px solid #e5e5e5;">${errorLabel}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #e5e5e5;"><strong>Log ID</strong></td><td style="padding: 8px; border: 1px solid #e5e5e5;">${logId ?? "N/A"}</td></tr>
            </table>
            <p style="color: #666; font-size: 14px;">
              Open your <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/webhooks">Webhook Debug Dashboard</a> to manually retry or inspect the payload.
            </p>
          </div>
        `,
      })
    );
  } else if (!merchantEmail) {
    console.warn("MERCHANT_ALERT_EMAIL not set — skipping email alert.");
  }

  const results = await Promise.allSettled(alertTasks);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Webhook hard-fail alert error:", result.reason);
    }
  }
}
