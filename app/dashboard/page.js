import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth-server";
import { checkSubscription } from "@/lib/subscription";
import DashboardStats from "./DashboardStats";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const { isActive } = await checkSubscription();

  if (!isActive) {
    redirect("/billing");
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={{ margin: "8px 0 0", color: "#666", fontSize: 14 }}>
            Signed in as {user.email}
          </p>
        </div>
        <a
          href="/dashboard/webhooks"
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            backgroundColor: "#18181b",
            color: "white",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Webhook Debug
        </a>
      </div>

      <DashboardStats />
    </div>
  );
}
