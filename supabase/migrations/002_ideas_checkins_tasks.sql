-- ideas (idea jail)
create table public.ideas (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles on delete cascade,
  mission_id            uuid references public.missions on delete set null,
  title                 text not null,
  description           text,
  status                text not null default 'jailed'
                          check (status in ('jailed','flagged','approved','promoted','dismissed')),
  ai_alignment_score    int  check (ai_alignment_score between 0 and 10),
  ai_notes              text,
  scheduled_review_date date,
  created_at            timestamptz not null default now()
);

alter table public.ideas enable row level security;
create policy "Users manage own ideas"
  on public.ideas for all using (auth.uid() = user_id);

-- daily check-ins
create table public.daily_checkins (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles on delete cascade,
  mission_id          uuid references public.missions on delete set null,
  checkin_date        date not null,
  available_hours     decimal(4,2) not null,
  obstacles           text,
  yesterday_progress  text,
  ai_coaching_notes   text,
  created_at          timestamptz not null default now(),
  unique (user_id, checkin_date)
);

alter table public.daily_checkins enable row level security;
create policy "Users manage own checkins"
  on public.daily_checkins for all using (auth.uid() = user_id);

-- tasks
create table public.tasks (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles on delete cascade,
  mission_id     uuid references public.missions on delete set null,
  checkin_id     uuid references public.daily_checkins on delete set null,
  title          text not null,
  description    text,
  priority       text not null check (priority in ('primary','secondary','optional')),
  revenue_score  int  not null default 5 check (revenue_score between 0 and 10),
  status         text not null default 'pending'
                   check (status in ('pending','completed','skipped')),
  scheduled_date date,
  completed_at   timestamptz,
  created_at     timestamptz not null default now()
);

alter table public.tasks enable row level security;
create policy "Users manage own tasks"
  on public.tasks for all using (auth.uid() = user_id);
