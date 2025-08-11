-- Create orders table to track payments
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  stripe_session_id text unique,
  amount integer,
  currency text default 'usd',
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS and policies
alter table public.orders enable row level security;

drop policy if exists select_own_orders on public.orders;
create policy select_own_orders on public.orders
  for select using (user_id = auth.uid());

-- Allow authenticated users to insert/update their own orders (edge functions use service role and bypass RLS)
drop policy if exists insert_own_orders on public.orders;
create policy insert_own_orders on public.orders
  for insert with check (auth.uid() = user_id);

drop policy if exists update_own_orders on public.orders;
create policy update_own_orders on public.orders
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- updated_at trigger
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

-- Enable realtime on key tables
alter table public.test_requests replica identity full;
alter table public.submissions replica identity full;
alter table public.orders replica identity full;

do $$ begin
  begin
    alter publication supabase_realtime add table public.test_requests;
  exception when duplicate_object then null; end;
  begin
    alter publication supabase_realtime add table public.submissions;
  exception when duplicate_object then null; end;
  begin
    alter publication supabase_realtime add table public.orders;
  exception when duplicate_object then null; end;
end $$;