"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import LogoutButton from "./LogoutButton";

function hasSupabaseSessionCookie() {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((entry) => {
    const name = entry.trim().split("=")[0];
    return name.startsWith("sb-");
  });
}

async function checkLoggedIn() {
  try {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return Boolean(user);
  } catch {
    return hasSupabaseSessionCookie();
  }
}

function CloseIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

const navLinks = [
  { href: "#features", label: "Features", external: true },
  { href: "#how-it-works", label: "How it works", external: true },
  { href: "/billing", label: "Pricing", external: false },
];

export default function LandingPage() {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    checkLoggedIn().then(setIsLoggedIn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="flex min-h-full flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              P
            </span>
            PayRecover
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-1 text-xs font-semibold">
              {routing.locales.map((loc) => (
                <Link
                  key={loc}
                  href={pathname || "/"}
                  locale={loc}
                  className={`rounded px-2 py-1 uppercase no-underline ${
                    locale === loc
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:text-blue-600"
                  }`}
                >
                  {loc}
                </Link>
              ))}
            </div>
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                  {t("dashboard")}
                </Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center px-4 text-sm font-medium text-slate-700 transition-colors hover:text-blue-600"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/billing"
                  className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                  {t("startTrial")}
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            aria-label="Close menu overlay"
            onClick={closeMobile}
          />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
              <span className="font-semibold text-slate-900">Menu</span>
              <button
                type="button"
                className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
                aria-label="Close menu"
                onClick={closeMobile}
              >
                <CloseIcon />
              </button>
            </div>

            <nav className="flex flex-col gap-1 p-4">
              {navLinks.map((link) =>
                link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={closeMobile}
                    className="rounded-lg px-4 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobile}
                    className="rounded-lg px-4 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            <div className="mt-auto border-t border-slate-200 p-4">
              {isLoggedIn ? (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/dashboard"
                    onClick={closeMobile}
                    className="flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    {t("dashboard")}
                  </Link>
                  <LogoutButton className="w-full" />
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/billing"
                    onClick={closeMobile}
                    className="flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    {t("startTrial")}
                  </Link>
                  <Link
                    href="/login"
                    onClick={closeMobile}
                    className="flex h-12 w-full items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    {t("login")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-white" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
              Built for freelancers &amp; small teams
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              {t("title")}
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 sm:text-xl">
              {t("subtitle")}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-lg bg-blue-600 px-8 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-700/25"
                >
                  {t("dashboard")}
                </Link>
              ) : (
                <>
                  <Link
                    href="/billing"
                    className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-lg bg-blue-600 px-8 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-700/25"
                  >
                    {t("startTrial")}
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-lg border border-slate-300 bg-white px-8 text-base font-semibold text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50"
                  >
                    {t("login")}
                  </Link>
                </>
              )}
            </div>

            <p className="mt-4 text-sm text-slate-500">
              No credit card required to explore. Plans from $4.90/month.
            </p>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-slate-200 bg-slate-900 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { value: "3×", label: "Faster follow-ups with automated reminders" },
            { value: "24/7", label: "Payment tracking & webhook monitoring" },
            { value: "2 min", label: "Average setup time to your first invoice" },
          ].map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <p className="text-3xl font-bold text-blue-400">{stat.value}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to get paid on time
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              A simple dashboard that handles the awkward part of business — asking for money.
            </p>
          </div>

          <ul className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Invoice tracking",
                desc: "See expected income, overdue totals, and client payment status in one view.",
                icon: "📊",
              },
              {
                title: "Smart reminders",
                desc: "Send friendly, timed follow-ups based on how late each invoice is.",
                icon: "✉️",
              },
              {
                title: "Razorpay & PayPal",
                desc: "Generate payment links and mark invoices paid automatically via webhooks.",
                icon: "💳",
              },
              {
                title: "Webhook debug",
                desc: "Monitor payment events, retry failures, and catch issues before they cost you.",
                icon: "🔔",
              },
              {
                title: "Multi-currency",
                desc: "Collect in INR via Razorpay or USD internationally via PayPal.",
                icon: "🌍",
              },
              {
                title: "Secure auth",
                desc: "Sign in with Google or magic link. Your data stays scoped to your account.",
                icon: "🔒",
              },
            ].map((feature) => (
              <li
                key={feature.title}
                className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="text-3xl" aria-hidden="true">
                  {feature.icon}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-blue-600">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-slate-200 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              How PayRecover works
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Three steps from overdue invoice to money in your account.
            </p>
          </div>

          <ol className="mt-16 grid gap-10 lg:grid-cols-3">
            {[
              {
                step: "01",
                title: "Add your invoices",
                desc: "Log client details, amounts, and due dates. PayRecover keeps everything organized.",
              },
              {
                step: "02",
                title: "Automate follow-ups",
                desc: "Reminders go out on schedule. Payment links are ready when clients are ready to pay.",
              },
              {
                step: "03",
                title: "Get paid & reconcile",
                desc: "Webhooks mark invoices paid instantly. Your dashboard always reflects reality.",
              },
            ].map((item) => (
              <li key={item.step} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-8">
                <span className="text-4xl font-bold text-blue-600/30">{item.step}</span>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to stop leaving money on the table?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Join PayRecover and turn unpaid invoices into recovered revenue — automatically.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-lg bg-white px-8 text-base font-semibold text-blue-700 transition-colors hover:bg-blue-50"
              >
                {t("dashboard")}
              </Link>
            ) : (
              <>
                <Link
                  href="/billing"
                  className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-lg bg-white px-8 text-base font-semibold text-blue-700 transition-colors hover:bg-blue-50"
                >
                  {t("startTrial")}
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-lg border-2 border-white/40 px-8 text-base font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  {t("login")}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
