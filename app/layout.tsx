import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PayRecover",
  description: "Track invoices, send reminders, and collect payments with Razorpay",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <main className="flex-1">{children}</main>
        <footer
          style={{
            marginTop: "40px",
            padding: "20px",
            borderTop: "1px solid #eee",
            textAlign: "center",
            display: "flex",
            gap: "20px",
            justifyContent: "center",
          }}
        >
          <a href="/terms" style={{ color: "#666", textDecoration: "none" }}>
            Terms & Conditions
          </a>
          <a href="/privacy" style={{ color: "#666", textDecoration: "none" }}>
            Privacy Policy
          </a>
          <a href="/refund" style={{ color: "#666", textDecoration: "none" }}>
            Refund Policy
          </a>
        </footer>
      </body>
    </html>
  );
}
