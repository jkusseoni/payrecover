"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { signOut } from "@/lib/auth";

export default function DashboardProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUserData = async () => {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();

      if (error || !currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    };

    getUserData();
  }, [router]);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Loading Dashboard...</div>;
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#f4f4f5",
          padding: "16px 24px",
          borderRadius: 8,
          marginBottom: 24,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 20 }}>Welcome Back!</h2>
          <p style={{ margin: "4px 0", color: "#71717a" }}>
            <strong>Email:</strong> {user?.email}
          </p>
          {user?.user_metadata?.full_name && (
            <p style={{ margin: "4px 0", color: "#71717a" }}>
              <strong>Name:</strong> {user.user_metadata.full_name}
            </p>
          )}
          <p style={{ margin: "4px 0", fontSize: 12, color: "#a1a1aa" }}>
            <strong>User ID:</strong> {user?.id}
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a
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
          </a>
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
