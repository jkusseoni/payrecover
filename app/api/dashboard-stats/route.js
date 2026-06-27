import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: invoices, error } = await supabase
      .from("invoices")
      .select("amount, status, due_date");

    if (error) throw error;

    let expectedIncome = 0;
    let overdue = 0;
    const today = new Date();

    for (const invoice of invoices ?? []) {
      const amount = Number(invoice.amount) || 0;

      if (invoice.status !== "paid") {
        expectedIncome += amount;
      }

      if (
        invoice.status === "pending" &&
        invoice.due_date &&
        new Date(invoice.due_date) < today
      ) {
        overdue += amount;
      }
    }

    return NextResponse.json({ expectedIncome, overdue });
  } catch (error) {
    const message =
      error?.message ??
      (typeof error === "string" ? error : "Failed to load dashboard stats");

    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
