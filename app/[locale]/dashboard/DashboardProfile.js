"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { signOut } from "@/lib/auth";

export default function DashboardProfile({ user }) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          backgroundColor: "#f4f4f5",
          padding: "16px 24px",
          borderRadius: 8,
          marginBottom: 24,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 20 }}>Welcome Back!</h2>
          <p style={{ margin: "4px 0", color: "#71717a" }}>
            <strong>Email:</strong> {user.email}
          </p>
          {user.fullName && (
            <p style={{ margin: "4px 0", color: "#71717a" }}>
              <strong>Name:</strong> {user.fullName}
            </p>
          )}
          <p style={{ margin: "4px 0", fontSize: 12, color: "#a1a1aa" }}>
            <strong>User ID:</strong> {user.id}
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link
            href="/dashboard/webhooks"
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              backgroundColor: "#18181b",
              color: "white",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Webhook Debug
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <h1 style={{ margin: "0 0 8px" }}>Your Invoices Dashboard</h1>
      <p style={{ margin: "0 0 24px", color: "#71717a" }}>
        Track expected income, overdue amounts, and payment status below.
      </p>
    </>
  );
}
