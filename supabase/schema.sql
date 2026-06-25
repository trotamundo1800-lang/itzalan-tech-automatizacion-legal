create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text,
  role text not null default 'abogado',
  office_name text,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  full_name text not null,
  document_number text not null,
  phone text not null,
  email text not null,
  address text not null,
  client_type text not null check (client_type in ('persona', 'empresa')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  client_id uuid not null references public.clients(id) on delete cascade,
  internal_number text not null unique,
  case_type text not null,
  status text not null check (status in ('abierto', 'en-curso', 'cerrado')),
  court_institution text not null,
  start_date date not null,
  next_hearing date not null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  case_id uuid references public.cases(id) on delete set null,
  template text not null,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  case_id uuid references public.cases(id) on delete set null,
  title text not null,
  event_date date not null,
  event_time time not null,
  event_type text not null check (event_type in ('audiencia', 'reunion', 'vencimiento', 'tarea', 'seguimiento')),
  status text not null check (status in ('pendiente', 'completado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  provider text not null check (provider in ('stripe', 'paypal')),
  plan_name text not null,
  plan_code text not null,
  monthly_price numeric(12,2) not null,
  currency text not null default 'HNL',
  status text not null,
  starts_at date,
  ends_at date,
  is_active boolean not null default false,
  external_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  case_id uuid references public.cases(id) on delete set null,
  prompt text not null,
  analysis_type text not null,
  response text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_user_id_idx on public.clients (user_id);
create index if not exists cases_user_id_idx on public.cases (user_id);
create index if not exists cases_client_id_idx on public.cases (client_id);
create index if not exists documents_case_id_idx on public.documents (case_id);
create index if not exists events_case_id_idx on public.events (case_id);
create index if not exists events_client_id_idx on public.events (client_id);
create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists ai_queries_user_id_idx on public.ai_queries (user_id);
