-- Run in Supabase SQL Editor to create the webhook_logs table

create table if not exists public.webhook_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_type text not null default 'unknown',
  invoice_id text,
  status text not null check (status in ('success', 'failed')),
  error_message text,
  payload jsonb not null default '{}'::jsonb,
  delivery_attempts integer not null default 0,
  provider text not null default 'razorpay'
);

create index if not exists webhook_logs_created_at_idx
  on public.webhook_logs (created_at desc);

create index if not exists webhook_logs_status_idx
  on public.webhook_logs (status);

alter table public.webhook_logs enable row level security;

-- Allow anon reads/writes for development (tighten in production)
create policy "Allow anon insert on webhook_logs"
  on public.webhook_logs for insert
  to anon with check (true);

create policy "Allow anon select on webhook_logs"
  on public.webhook_logs for select
  to anon using (true);

create policy "Allow anon update on webhook_logs"
  on public.webhook_logs for update
  to anon using (true) with check (true);

-- If table already exists, run this migration instead:
-- alter table public.webhook_logs add column if not exists delivery_attempts integer not null default 0;
-- alter table public.webhook_logs add column if not exists provider text not null default 'razorpay';
