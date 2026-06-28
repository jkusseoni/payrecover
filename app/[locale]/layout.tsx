import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "PayRecover",
  description:
    "Track invoices, send reminders, and collect payments with Razorpay",
};

import type { ReactNode } from "react";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div lang={locale} className="flex min-h-full flex-col">
        <main className="flex-1">{children}</main>
        <footer className="mt-10 flex justify-center gap-5 border-t border-slate-200 px-5 py-5 text-center">
          <Link href="/terms" className="text-sm text-slate-500 no-underline hover:text-blue-600">
            Terms &amp; Conditions
          </Link>
          <Link href="/privacy" className="text-sm text-slate-500 no-underline hover:text-blue-600">
            Privacy Policy
          </Link>
          <Link href="/refund" className="text-sm text-slate-500 no-underline hover:text-blue-600">
            Refund Policy
          </Link>
        </footer>
      </div>
    </NextIntlClientProvider>
  );
}
