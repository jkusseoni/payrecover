"use client";

import { useRouter } from "@/i18n/navigation";
import { signOut } from "@/lib/auth";

export default function LogoutButton({ className = "" }) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={className}
      style={{
        width: className.includes("w-full") ? "100%" : undefined,
        padding: "8px 16px",
        backgroundColor: "transparent",
        color: "#64748b",
        border: "1px solid #cbd5e1",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 14,
      }}
    >
      Logout
    </button>
  );
}
