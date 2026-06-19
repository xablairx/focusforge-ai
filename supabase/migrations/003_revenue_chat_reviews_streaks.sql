-- revenue entries
create table public.revenue_entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles on delete cascade,
  mission_id   uuid references public.missions on delete set null,
  amount       decimal(10,2) not null,
  currency     text not null default 'USD',
  description  text,
  entry_date   date not null,
  created_at   timestamptz not null default now()
);

alter table public.revenue_entries enable row level security;
create policy "Users manage own revenue"
  on public.revenue_entries for all using (auth.uid() = user_id);

-- chat messages
create table public.chat_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles on delete cascade,
  mission_id uuid references public.missions on delete set null,
  role       text not null check (role in ('user','assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;
create policy "Users manage own messages"
  on public.chat_messages for all using (auth.uid() = user_id);

-- weekly reviews
create table public.weekly_reviews (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles on delete cascade,
  mission_id        uuid references public.missions on delete set null,
  week_start        date not null,
  week_end          date not null,
  revenue_generated decimal(10,2) not null default 0,
  hours_spent       decimal(5,2)  not null default 0,
  focus_score       int  not null default 0 check (focus_score between 0 and 100),
  completion_score  int  not null default 0 check (completion_score between 0 and 100),
  tasks_completed   int  not null default 0,
  ai_coaching       text,
  created_at        timestamptz not null default now(),
  unique (user_id, week_start)
);

alter table public.weekly_reviews enable row level security;
create policy "Users manage own reviews"
  on public.weekly_reviews for all using (auth.uid() = user_id);

-- streaks (one row per user)
create table public.streaks (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null unique references public.profiles on delete cascade,
  current_streak    int  not null default 0,
  longest_streak    int  not null default 0,
  last_checkin_date date,
  updated_at        timestamptz not null default now()
);

alter table public.streaks enable row level security;
create policy "Users manage own streak"
  on public.streaks for all using (auth.uid() = user_id);
