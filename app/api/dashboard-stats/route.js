import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth-server";
import { fetchUserInvoices } from "@/lib/fetch-user-invoices";

export async function GET() {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoices = await fetchUserInvoices();

    let expectedIncome = 0;
    let overdue = 0;
    const today = new Date();

    for (const invoice of invoices) {
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
