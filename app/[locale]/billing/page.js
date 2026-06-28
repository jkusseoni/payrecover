import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getUser } from "@/lib/auth-server";
import { checkSubscription } from "@/lib/subscription";
import BillingPlans from "./BillingPlans";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const locale = await getLocale();
  const user = await getUser();
  let plan = null;

  if (user) {
    const subscription = await checkSubscription();
    plan = subscription.plan;

    if (subscription.isActive) {
      redirect(`/${locale}/dashboard`);
    }
  }

  return (
    <div
      style={{
        minHeight: "100%",
        padding: "40px 20px",
        fontFamily: "sans-serif",
        backgroundColor: "#fafafa",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 14,
              color: "#4f46e5",
              fontWeight: 600,
            }}
          >
            PayRecover Billing
          </p>
          <h1 style={{ margin: "0 0 12px", fontSize: 36 }}>
            Choose a plan to unlock your dashboard
          </h1>
          <p style={{ margin: 0, color: "#71717a", fontSize: 16 }}>
            {user
              ? `Signed in as ${user.email}${plan ? ` · Current plan: ${plan} (inactive or expired)` : ""}`
              : "Sign in after payment to activate your subscription on your account."}
          </p>
        </div>

        <BillingPlans />

        <p
          style={{
            marginTop: 32,
            textAlign: "center",
            fontSize: 13,
            color: "#71717a",
            lineHeight: 1.6,
          }}
        >
          After payment, your subscription activates automatically. Return here
          or go to the dashboard once payment is confirmed.
        </p>
      </div>
    </div>
  );
}
