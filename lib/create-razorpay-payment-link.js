import Razorpay from "razorpay";
import { getBaseUrl } from "@/lib/get-base-url";
import { validatePaymentLinkEnv } from "@/lib/validate-env";

function amountInPaise(amount) {
  const paise = Math.round(parseFloat(amount) * 100);
  if (Number.isNaN(paise) || paise <= 0) {
    throw new Error("Invalid amount");
  }
  return paise;
}

function getRazorpayClient() {
  const envCheck = validatePaymentLinkEnv();
  if (!envCheck.ok) {
    throw new Error(envCheck.error);
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId.startsWith("rzp_test_")) {
    console.warn(
      "Razorpay is not in test mode. Use rzp_test_* keys for development."
    );
  }

  return {
    keyId,
    client: new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    }),
  };
}

export async function createRazorpayPaymentLink({
  amount,
  email,
  invoice_id,
  name,
}) {
  if (!amount || !email || !invoice_id) {
    throw new Error("Missing required fields: amount, email, or invoice_id");
  }

  const paise = amountInPaise(amount);
  if (paise < 100) {
    throw new Error("Minimum payment amount is ₹1 (100 paise)");
  }

  const { client: razorpay, keyId } = getRazorpayClient();
  const baseUrl = getBaseUrl();

  const paymentLink = await razorpay.paymentLink.create({
    amount: paise,
    currency: "INR",
    description: `Invoice Payment for Invoice #${invoice_id}`,
    customer: {
      name: name || email.split("@")[0],
      email,
    },
    notify: {
      email: true,
    },
    notes: {
      invoice_id: String(invoice_id),
    },
    callback_url: `${baseUrl}/success`,
    callback_method: "get",
  });

  return {
    link: paymentLink.short_url,
    link_id: paymentLink.id,
    test_mode: keyId.startsWith("rzp_test_"),
  };
}
