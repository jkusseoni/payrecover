import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createInvoice } from "@/lib/create-invoice";
import { createRazorpayPaymentLink } from "@/lib/create-razorpay-payment-link";
import {
  getErrorMessage,
  validateInvoiceSetupEnv,
} from "@/lib/validate-env";

export async function POST(request) {
  const envCheck = validateInvoiceSetupEnv();
  if (!envCheck.ok) {
    console.error("Invoice Setup Error:", envCheck.error);
    return NextResponse.json({ error: envCheck.error }, { status: 500 });
  }

  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { client_name, client_email, amount, due_date } =
      await request.json();

    if (!client_email || !amount || !due_date) {
      return NextResponse.json(
        { error: "Missing required fields: client_email, amount, or due_date" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    let { data: client, error: clientLookupError } = await supabase
      .from("clients")
      .select("id")
      .eq("email", client_email)
      .maybeSingle();

    if (clientLookupError) {
      throw new Error(
        `Supabase client lookup failed: ${clientLookupError.message}`
      );
    }

    let clientId = client?.id;

    if (!client) {
      const { data: newClient, error: clientCreateError } = await supabase
        .from("clients")
        .insert([
          {
            name: client_name || client_email.split("@")[0],
            email: client_email,
            user_id: user.id,
          },
        ])
        .select("id")
        .single();

      if (clientCreateError) {
        throw new Error(
          `Supabase client create failed: ${clientCreateError.message}`
        );
      }

      clientId = newClient.id;
    }

    const invoice = await createInvoice({
      client_id: clientId,
      amount: parseFloat(amount),
      due_date,
      status: "pending",
    });

    let linkData;
    try {
      linkData = await createRazorpayPaymentLink({
        amount,
        name: client_name,
        email: client_email,
        invoice_id: invoice.id,
      });
    } catch (paymentLinkError) {
      console.error(
        "Razorpay payment link error:",
        getErrorMessage(paymentLinkError)
      );
      throw new Error(
        `Payment link creation failed: ${getErrorMessage(paymentLinkError)}`
      );
    }

    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        payment_link: linkData.link,
        payment_link_id: linkData.link_id,
      })
      .eq("id", invoice.id);

    if (updateError) {
      throw new Error(`Supabase invoice update failed: ${updateError.message}`);
    }

    return NextResponse.json({
      success: true,
      invoice_id: invoice.id,
      payment_link: linkData.link,
      payment_link_id: linkData.link_id,
    });
  } catch (error) {
    const message = getErrorMessage(error);

    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    console.error("Invoice Setup Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
