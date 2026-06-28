"use client";

import { useEffect, useState } from "react";

function formatError(error) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "Failed to load dashboard stats";
}

export default function DashboardStats() {
  const [stats, setStats] = useState({ expectedIncome: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch("/api/dashboard-stats");
        const contentType = res.headers.get("content-type") ?? "";

        if (!contentType.includes("application/json")) {
          throw new Error("Failed to load dashboard stats");
        }

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load dashboard stats");
        }

        setStats({
          expectedIncome: data.expectedIncome ?? 0,
          overdue: data.overdue ?? 0,
        });
        setError(null);
      } catch (err) {
        const message = formatError(err);
        console.error("Error loading dashboard stats:", message);
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div style={{ padding: 20 }}>Loading Dashboard...</div>;
  }

  return (
    <>
      {error && (
        <div
          style={{
            marginBottom: 20,
            padding: 12,
            borderRadius: 8,
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <div
          style={{
            padding: "20px",
            borderRadius: "8px",
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            minWidth: "200px",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0", color: "#166534" }}>
            Expected Income
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "bold",
              color: "#14532d",
            }}
          >
            ₹{stats.expectedIncome}
          </p>
        </div>

        <div
          style={{
            padding: "20px",
            borderRadius: "8px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            minWidth: "200px",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0", color: "#991b1b" }}>Overdue</h3>
          <p
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "bold",
              color: "#7f1d1d",
            }}
          >
            ₹{stats.overdue}
          </p>
        </div>
      </div>
    </>
  );
}
