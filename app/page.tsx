import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold text-zinc-900">PayRecover</span>
          <nav className="flex gap-4 text-sm font-medium">
            <Link href="/dashboard" className="text-zinc-600 hover:text-zinc-900">
              Dashboard
            </Link>
            <Link href="/dashboard/webhooks" className="text-zinc-600 hover:text-zinc-900">
              Webhooks
            </Link>
            <Link href="/add-invoice" className="text-zinc-600 hover:text-zinc-900">
              Add Invoice
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
          Recover unpaid invoices automatically
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600">
          Track pending payments, send smart reminders, and collect via Razorpay
          payment links — all from one dashboard.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            View Dashboard
          </Link>
          <Link
            href="/add-invoice"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
          >
            Add Invoice
          </Link>
        </div>

        <ul className="mt-16 grid gap-6 sm:grid-cols-3">
          <li className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="font-medium text-zinc-900">Track invoices</h2>
            <p className="mt-2 text-sm text-zinc-600">
              See expected income and overdue amounts at a glance.
            </p>
          </li>
          <li className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="font-medium text-zinc-900">Auto reminders</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Send friendly follow-ups based on how overdue each invoice is.
            </p>
          </li>
          <li className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="font-medium text-zinc-900">Razorpay payments</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Generate payment links and mark invoices paid via webhooks.
            </p>
          </li>
        </ul>
      </main>
    </div>
  );
}
