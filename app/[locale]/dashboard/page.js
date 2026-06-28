import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import Link from "next/link";
import { getUser } from "@/lib/auth-server";
import { checkSubscription } from "@/lib/subscription";
import DashboardProfile from "./DashboardProfile";
import DashboardStats from "./DashboardStats";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const locale = await getLocale();
  const user = await getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { isActive } = await checkSubscription();

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <DashboardProfile
        user={{
          email: user.email ?? "",
          id: user.id,
          fullName: user.user_metadata?.full_name ?? null,
        }}
      />

      {!isActive && (
        <div
          style={{
            marginBottom: 24,
            padding: 16,
            borderRadius: 8,
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            color: "#1e3a8a",
          }}
        >
          Your subscription is inactive.{" "}
          <Link href={`/${locale}/billing`} style={{ fontWeight: 700, color: "#1d4ed8" }}>
            Choose a plan
          </Link>{" "}
          to unlock full dashboard access.
        </div>
      )}

      <DashboardStats />
    </div>
  );
}
