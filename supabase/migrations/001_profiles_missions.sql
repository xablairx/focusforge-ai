-- profiles (extends auth.users)
create table public.profiles (
  id                     uuid primary key references auth.users on delete cascade,
  full_name              text,
  avatar_url             text,
  sahm_mode              boolean not null default false,
  sahm_available_minutes int     not null default 45,
  onboarded              boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Users manage own profile"
  on public.profiles for all using (auth.uid() = id);

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- missions
create table public.missions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles on delete cascade,
  title            text not null,
  description      text,
  status           text not null default 'active'
                     check (status in ('active','completed','abandoned','paused')),
  completion_pct   int  not null default 0 check (completion_pct between 0 and 100),
  started_at       timestamptz not null default now(),
  completed_at     timestamptz,
  abandoned_at     timestamptz,
  abandoned_reason text,
  created_at       timestamptz not null default now()
);

alter table public.missions enable row level security;
create policy "Users manage own missions"
  on public.missions for all using (auth.uid() = user_id);

-- one active mission per user enforced at DB level
create unique index missions_one_active_per_user
  on public.missions (user_id) where status = 'active';
