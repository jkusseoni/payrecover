import { createRazorpayPaymentLink } from "@/lib/create-razorpay-payment-link";
import {
  getErrorMessage,
  validatePaymentLinkEnv,
} from "@/lib/validate-env";

export async function POST(req) {
  const envCheck = validatePaymentLinkEnv();
  if (!envCheck.ok) {
    console.error("Razorpay Link Creation Error:", envCheck.error);
    return Response.json({ error: envCheck.error }, { status: 500 });
  }

  try {
    const body = await req.json();

    const result = await createRazorpayPaymentLink({
      amount: body.amount,
      email: body.email,
      invoice_id: body.invoice_id,
      name: body.name,
    });

    return Response.json({
      success: true,
      link: result.link,
      link_id: result.link_id,
      test_mode: result.test_mode,
    });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Razorpay Link Creation Error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
