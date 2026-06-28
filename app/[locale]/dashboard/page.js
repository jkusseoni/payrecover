import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
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

  if (!isActive) {
    redirect(`/${locale}/billing`);
  }

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <DashboardProfile />
      <DashboardStats />
    </div>
  );
}
