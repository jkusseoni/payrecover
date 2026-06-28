import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth-server";
import { checkSubscription } from "@/lib/subscription";
import DashboardProfile from "./DashboardProfile";
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
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <DashboardProfile />
      <DashboardStats />
    </div>
  );
}
