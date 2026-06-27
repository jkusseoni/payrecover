import { retryWebhookLog } from "@/lib/retry-webhook-log";

export async function POST(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return Response.json(
        { success: false, error: "Missing webhook log id" },
        { status: 400 }
      );
    }

    const result = await retryWebhookLog(id);

    if (!result.success) {
      return Response.json(
        { success: false, error: result.error },
        { status: result.status ?? 400 }
      );
    }

    return Response.json({
      success: true,
      message: result.message,
      invoice_id: result.invoice_id,
      delivery_attempts: result.delivery_attempts,
    });
  } catch (globalErr) {
    return Response.json(
      { success: false, error: globalErr.message },
      { status: 500 }
    );
  }
}
