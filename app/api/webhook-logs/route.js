import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function buildLast7DaysChart(logs) {
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);

    const date = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    days.push({ date, label, success: 0, failed: 0 });
  }

  const dayMap = Object.fromEntries(days.map((day) => [day.date, day]));

  for (const log of logs) {
    const key = new Date(log.created_at).toISOString().slice(0, 10);
    const bucket = dayMap[key];
    if (!bucket) continue;

    if (log.status === "success") bucket.success += 1;
    if (log.status === "failed") bucket.failed += 1;
  }

  return days;
}

export async function GET() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [logsResult, totalResult, failedResult, chartResult] =
      await Promise.all([
        supabase
          .from("webhook_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("webhook_logs")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("webhook_logs")
          .select("*", { count: "exact", head: true })
          .eq("status", "failed"),
        supabase
          .from("webhook_logs")
          .select("status, created_at")
          .gte("created_at", sevenDaysAgo.toISOString()),
      ]);

    if (logsResult.error) throw logsResult.error;
    if (totalResult.error) throw totalResult.error;
    if (failedResult.error) throw failedResult.error;
    if (chartResult.error) throw chartResult.error;

    const total = totalResult.count ?? 0;
    const failed = failedResult.count ?? 0;
    const success = total - failed;
    const successRate = total > 0 ? Math.round((success / total) * 100) : 0;

    const chartData = buildLast7DaysChart(chartResult.data ?? []);

    return NextResponse.json({
      metrics: {
        total,
        successRate,
        failed,
      },
      chartData,
      logs: logsResult.data ?? [],
    });
  } catch (error) {
    const message = error?.message ?? "Failed to load webhook logs";
    console.error("Webhook logs error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
