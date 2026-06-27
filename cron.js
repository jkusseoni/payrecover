const fs = require("fs");
const path = require("path");
const cron = require("node-cron");
const { createClient } = require("@supabase/supabase-js");

function loadEnvFile() {
  const envPath = path.join(__dirname, ".env.local");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function getSupabase() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "")
    .replace(/\/rest\/v1\/?$/, "")
    .replace(/\/$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase env vars in .env.local");
  }

  return createClient(url, key);
}

loadEnvFile();

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// रोज़ सुबह 8:00 बजे — invoice reminders
cron.schedule("0 8 * * *", async () => {
  console.log("Running automated daily invoice reminder cron job...");

  try {
    const response = await fetch(`${baseUrl}/api/send-reminder`);
    const data = await response.json();
    console.log("Cron Job Success:", data);
  } catch (error) {
    console.error("Cron Job Failed:", error);
  }
});

// हर 5 मिनट — failed webhooks auto-retry (max 3 attempts)
cron.schedule("*/5 * * * *", async () => {
  console.log("Running failed webhook auto-retry...");

  try {
    const supabase = getSupabase();

    const { data: failedLogs, error } = await supabase
      .from("webhook_logs")
      .select("*")
      .eq("status", "failed")
      .lt("delivery_attempts", 3);

    if (error) {
      console.error("Failed to fetch webhook logs:", error.message);
      return;
    }

    if (!failedLogs?.length) {
      console.log("No failed webhooks eligible for retry.");
      return;
    }

    console.log(`Found ${failedLogs.length} failed webhook(s) to retry.`);

    for (const log of failedLogs) {
      try {
        const res = await fetch(`${baseUrl}/api/webhook/retry`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: log.id }),
        });
        const result = await res.json();

        if (result.success) {
          console.log(`✅ Auto-retry success for log ${log.id}`);
        } else {
          console.warn(
            `⚠️ Auto-retry failed for log ${log.id}:`,
            result.error
          );
        }
      } catch (err) {
        console.error(`❌ Auto-retry network error for log ${log.id}:`, err.message);
      }
    }
  } catch (error) {
    console.error("Webhook auto-retry cron failed:", error.message);
  }
});

console.log("Cron engine started successfully! Waiting for schedule...");
console.log("- Daily reminders: 8:00 AM");
console.log("- Webhook auto-retry: every 5 minutes");
