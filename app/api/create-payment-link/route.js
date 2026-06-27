import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  throw new Error("Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET");
}

if (!keyId.startsWith("rzp_test_")) {
  console.warn(
    "Razorpay is not in test mode. Use rzp_test_* keys for development."
  );
}

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

function amountInPaise(amount) {
  const paise = Math.round(parseFloat(amount) * 100);
  if (Number.isNaN(paise) || paise <= 0) {
    throw new Error("Invalid amount");
  }
  return paise;
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.amount || !body.email || !body.invoice_id) {
      return Response.json(
        { error: "Missing required fields: amount, email, or invoice_id" },
        { status: 400 }
      );
    }

    const paise = amountInPaise(body.amount);
    if (paise < 100) {
      return Response.json(
        { error: "Minimum payment amount is ₹1 (100 paise)" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const paymentLink = await razorpay.paymentLink.create({
      amount: paise,
      currency: "INR",
      description: `Invoice Payment for Invoice #${body.invoice_id}`,
      customer: {
        name: body.name || body.email.split("@")[0],
        email: body.email,
      },
      notify: {
        email: true,
      },
      notes: {
        invoice_id: String(body.invoice_id),
      },
      callback_url: `${baseUrl}/success`,
      callback_method: "get",
    });

    return Response.json({
      success: true,
      link: paymentLink.short_url,
      link_id: paymentLink.id,
      test_mode: keyId.startsWith("rzp_test_"),
    });
  } catch (error) {
    console.error("Razorpay Link Creation Error:", error);
    return Response.json(
      { error: error.message ?? "Failed to create payment link" },
      { status: 500 }
    );
  }
}
