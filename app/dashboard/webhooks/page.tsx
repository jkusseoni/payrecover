"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import WebhookTrendChart, { type ChartDay } from "./WebhookTrendChart";

type WebhookProvider = "razorpay" | "paypal";
type ProviderFilter = "all" | WebhookProvider;

type WebhookLog = {
  id: string;
  created_at: string;
  event_type: string;
  invoice_id: string | null;
  status: "success" | "failed";
  error_message: string | null;
  payload: Record<string, unknown>;
  provider?: WebhookProvider | string | null;
};

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
}

async function parseJsonResponse(res: Response) {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(
      `API returned HTML instead of JSON (${res.status}). Restart the dev server and clear .next cache.`
    );
  }
  return res.json();
}

function StatusBadge({ status }: { status: WebhookLog["status"] }) {
  const isSuccess = status === "success";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        isSuccess
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
          : "bg-red-50 text-red-700 ring-1 ring-red-600/20"
      }`}
    >
      {isSuccess ? "Success" : "Failed"}
    </span>
  );
}

function MetricCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "danger";
}) {
  const toneClasses = {
    default: "border-zinc-200 bg-white text-zinc-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    danger: "border-red-200 bg-red-50 text-red-900",
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${toneClasses[tone]}`}>
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-sm text-zinc-500">{hint}</p> : null}
    </div>
  );
}

function PayloadDrawer({
  log,
  onClose,
}: {
  log: WebhookLog | null;
  onClose: () => void;
}) {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close payload drawer"
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-zinc-200 px-6 py-5">
          <div>
            <p className="text-sm font-medium text-zinc-500">Webhook Payload</p>
            <h2 className="mt-1 text-xl font-semibold text-zinc-900">
              {log.event_type}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {formatTimestamp(log.created_at)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Close
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-zinc-50 p-3">
              <p className="text-zinc-500">Invoice ID</p>
              <p className="mt-1 font-medium text-zinc-900">
                {log.invoice_id ?? "—"}
              </p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3">
              <p className="text-zinc-500">Status</p>
              <div className="mt-1">
                <StatusBadge status={log.status} />
              </div>
            </div>
          </div>

          {log.error_message ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {log.error_message}
            </div>
          ) : null}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-700">Raw JSON</p>
              <button
                type="button"
                onClick={() =>
                  navigator.clipboard.writeText(
                    JSON.stringify(log.payload, null, 2)
                  )
                }
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Copy
              </button>
            </div>
            <pre className="overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-xs leading-6 text-emerald-300">
              <code>{JSON.stringify(log.payload, null, 2)}</code>
            </pre>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function WebhookDebugDashboard() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderFilter>("all");

  const filteredLogs = useMemo(
    () =>
      logs.filter(
        (log) =>
          selectedProvider === "all" ||
          (log.provider ?? "razorpay") === selectedProvider
      ),
    [logs, selectedProvider]
  );

  const filteredMetrics = useMemo(() => {
    const total = filteredLogs.length;
    const failed = filteredLogs.filter((log) => log.status === "failed").length;
    const success = total - failed;
    const successRate = total > 0 ? Math.round((success / total) * 100) : 0;
    return { total, successRate, failed };
  }, [filteredLogs]);

  const filteredChartData = useMemo(() => {
    const days: ChartDay[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);

      days.push({
        date: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("en-IN", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        success: 0,
        failed: 0,
      });
    }

    const dayMap = Object.fromEntries(days.map((day) => [day.date, day]));

    for (const log of filteredLogs) {
      const key = new Date(log.created_at).toISOString().slice(0, 10);
      const bucket = dayMap[key];
      if (!bucket) continue;
      if (log.status === "success") bucket.success += 1;
      if (log.status === "failed") bucket.failed += 1;
    }

    return days;
  }, [filteredLogs]);

  const providerTabs: { id: ProviderFilter; label: string }[] = [
    { id: "all", label: "All Providers" },
    { id: "razorpay", label: "Razorpay" },
    { id: "paypal", label: "PayPal" },
  ];

  async function handleRetry(logId: string) {
    setRetryingId(logId);

    try {
      const res = await fetch("/api/webhook/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: logId }),
      });
      const result = await parseJsonResponse(res);

      if (result.success) {
        alert("🔥 Success! Invoice status updated and webhook log cleared.");
        window.location.reload();
      } else {
        alert("❌ Retry Failed: " + result.error);
        setRetryingId(null);
      }
    } catch {
      alert("Network Error!");
      setRetryingId(null);
    }
  }

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch("/api/webhook-logs");
        const data = await parseJsonResponse(res);

        if (!res.ok) {
          throw new Error(data.error || "Failed to load webhook logs");
        }

        setLogs(data.logs ?? []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load logs");
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-zinc-500">PayRecover</p>
            <h1 className="text-xl font-semibold text-zinc-900">
              Webhook Debug Dashboard
            </h1>
          </div>
          <nav className="flex gap-3 text-sm font-medium">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            >
              Overview
            </Link>
            <Link
              href="/add-invoice"
              className="rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            >
              Add Invoice
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {error ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
            {error.includes("webhook_logs") || error.includes("relation") ? (
              <p className="mt-2">
                Run the SQL in <code>supabase/webhook_logs.sql</code> to create
                the table first.
              </p>
            ) : null}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Total Webhooks" value={filteredMetrics.total} />
          <MetricCard
            label="Success Rate"
            value={`${filteredMetrics.successRate}%`}
            tone="success"
          />
          <MetricCard
            label="Failed Events"
            value={filteredMetrics.failed}
            tone="danger"
          />
        </section>

        <section className="mt-8">
          {loading ? (
            <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-sm text-zinc-500 shadow-sm">
              Loading chart...
            </div>
          ) : (
            <WebhookTrendChart data={filteredChartData} />
          )}
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">Recent Events</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Click a row to inspect the raw webhook payload.
                </p>
              </div>

              <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-1">
                {providerTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedProvider(tab.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      selectedProvider === tab.id
                        ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200"
                        : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-10 text-sm text-zinc-500">Loading logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="px-6 py-10 text-sm text-zinc-500">
              {logs.length === 0
                ? "No webhook events logged yet. Send a test webhook from the Razorpay dashboard."
                : `No ${selectedProvider === "all" ? "" : selectedProvider + " "}webhook events found for this filter.`}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 text-sm">
                <thead className="bg-zinc-50 text-left text-zinc-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Timestamp</th>
                    <th className="px-6 py-3 font-medium">Provider</th>
                    <th className="px-6 py-3 font-medium">Event Type</th>
                    <th className="px-6 py-3 font-medium">Invoice ID</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="cursor-pointer transition hover:bg-zinc-50"
                    >
                      <td className="px-6 py-4 text-zinc-700 whitespace-nowrap">
                        {formatTimestamp(log.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold capitalize text-zinc-700">
                          {log.provider ?? "razorpay"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-medium text-zinc-900 whitespace-nowrap">
                        {log.event_type}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-zinc-600 whitespace-nowrap">
                        {log.invoice_id ?? "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={log.status} />
                      </td>

                      {/* ⭐ PRO FEATURE: QUICK VIEW PAYLOAD + RETRY */}
                      <td
                        className="relative flex items-center justify-end gap-3 px-6 py-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {log.status === "failed" && (
                          <button
                            type="button"
                            disabled={retryingId === log.id}
                            onClick={() => handleRetry(log.id)}
                            className="inline-flex cursor-pointer items-center rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-600/20 transition-all hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {retryingId === log.id ? "Retrying..." : "Retry"}
                          </button>
                        )}

                        <details className="group text-left">
                          <summary className="inline-flex items-center gap-1 cursor-pointer rounded-lg bg-zinc-100 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 list-none select-none">
                            <span>View Payload</span>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1 rounded border border-indigo-200 uppercase tracking-wider scale-90">
                              Pro
                            </span>
                          </summary>

                          {/* Dropdown Content */}
                          <div className="absolute right-6 mt-2 z-10 w-96 max-h-60 overflow-auto rounded-xl border border-zinc-200 bg-zinc-950 p-4 shadow-xl font-mono text-[11px] text-emerald-400">
                            <div className="flex justify-between items-center mb-2 border-b border-zinc-800 pb-1 text-zinc-500 text-[10px]">
                              <span>RAW JSON</span>
                              <button
                                type="button"
                                onClick={() =>
                                  navigator.clipboard.writeText(
                                    JSON.stringify(log.payload, null, 2)
                                  )
                                }
                                className="text-blue-400 hover:underline"
                              >
                                Copy
                              </button>
                            </div>
                            <pre className="whitespace-pre-wrap break-all">
                              {JSON.stringify(log.payload, null, 2)}
                            </pre>
                          </div>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <PayloadDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
}
