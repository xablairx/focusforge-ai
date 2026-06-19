# FocusForge AI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build FocusForge AI — an AI Chief of Staff SaaS that keeps entrepreneurs, freelancers, and SAHMs locked onto one revenue-generating mission at a time.

**Architecture:** Hybrid Next.js 16 App Router app — structured Anthropic API calls (zod-validated) for deterministic ops (check-in, idea scoring, weekly review), one streaming endpoint for the AI chat tab. Supabase handles auth + all 9 DB tables with RLS. No billing in v1.

**Tech Stack:** Next.js 16.2.7 · TypeScript · Tailwind CSS 4 · Supabase (@supabase/ssr) · Anthropic SDK 0.102.0 · Resend · Vercel · Jest + Testing Library

**Spec:** `focusforge-ai/docs/superpowers/specs/2026-06-12-focusforge-ai-design.md`

---

## File Map

```
focusforge-ai/
├── app/
│   ├── layout.tsx                        # Root layout, fonts, global CSS
│   ├── page.tsx                          # Redirect → /app or /auth/login
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── reset/page.tsx
│   └── (app)/                            # Route group — authenticated
│       ├── layout.tsx                    # Shell: TopNav + BottomNav
│       ├── page.tsx                      # Momentum Dashboard
│       ├── checkin/page.tsx
│       ├── ideas/page.tsx
│       ├── chat/page.tsx
│       ├── review/
│       │   ├── page.tsx
│       │   └── [week]/page.tsx
│       ├── mission/
│       │   ├── new/page.tsx
│       │   └── [id]/page.tsx
│       ├── missions/page.tsx
│       ├── revenue/page.tsx
│       ├── settings/page.tsx
│       └── onboarding/page.tsx
├── components/
│   ├── layout/
│   │   ├── BottomNav.tsx
│   │   └── TopNav.tsx
│   ├── dashboard/
│   │   ├── MissionHero.tsx
│   │   ├── StatsRow.tsx
│   │   ├── TaskCard.tsx
│   │   ├── AICoachNudge.tsx
│   │   └── QuickActions.tsx
│   ├── checkin/
│   │   ├── CheckinForm.tsx
│   │   └── TimeSelector.tsx
│   ├── ideas/
│   │   ├── IdeaForm.tsx
│   │   └── IdeaCard.tsx
│   ├── chat/
│   │   ├── ChatMessages.tsx
│   │   ├── ChatInput.tsx
│   │   └── ContextPills.tsx
│   └── review/
│       ├── ReviewStats.tsx
│       └── CoachingBlock.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Browser Supabase client
│   │   └── server.ts                     # Server Supabase client (cookies)
│   ├── anthropic/
│   │   ├── client.ts                     # Anthropic SDK instance
│   │   ├── schemas.ts                    # Zod schemas for structured outputs
│   │   ├── prompts.ts                    # System prompt builders
│   │   └── structured.ts                # Typed Claude call wrappers
│   └── utils.ts                          # Date helpers, formatters
├── types/
│   └── index.ts                          # All shared TypeScript types
├── middleware.ts                          # Auth + onboarding route guards
├── supabase/
│   └── migrations/
│       ├── 001_profiles_missions.sql
│       ├── 002_ideas_checkins_tasks.sql
│       └── 003_revenue_chat_reviews_streaks.sql
├── vercel.json                            # Cron job config
└── __tests__/
    ├── api/
    │   ├── checkin.test.ts
    │   ├── ideas.test.ts
    │   └── review.test.ts
    └── components/
        ├── TaskCard.test.tsx
        └── IdeaCard.test.tsx
```

---

## Phase 1 — Foundation

### Task 1: Scaffold the project

**Files:**
- Create: `focusforge-ai/` (entire project)

- [ ] **Step 1: Scaffold Next.js project**

```bash
cd C:\Users\xabla
npx create-next-app@16.2.7 focusforge-ai \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
cd focusforge-ai
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @anthropic-ai/sdk@0.102.0 @supabase/supabase-js@^2.108.0 @supabase/ssr@^0.10.3 resend@^6.12.4 zod@^3.23.0
npm install -D jest@^30.0.0 jest-environment-jsdom@^30.0.0 @testing-library/react@^16.3.2 @testing-library/jest-dom@^6.9.1 @types/jest@^30.0.0 ts-jest@^29.4.0 husky@^9.1.7
```

- [ ] **Step 3: Configure Jest — create `jest.config.ts`**

```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
}

export default createJestConfig(config)
```

- [ ] **Step 4: Create `jest.setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add test script to `package.json`**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "type-check": "tsc --noEmit"
  }
}
```

- [ ] **Step 6: Verify scaffold runs**

```bash
npm run dev
```
Expected: Next.js app on http://localhost:3000 with no errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold focusforge-ai Next.js project"
```

---

### Task 2: TypeScript types

**Files:**
- Create: `types/index.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/types.test.ts`:

```typescript
import type { Mission, Task, Idea, Profile } from '@/types'

describe('types', () => {
  it('Mission type has required fields', () => {
    const m: Mission = {
      id: 'uuid',
      user_id: 'uuid',
      title: 'Get first client',
      description: null,
      status: 'active',
      completion_pct: 0,
      started_at: new Date().toISOString(),
      completed_at: null,
      abandoned_at: null,
      abandoned_reason: null,
      created_at: new Date().toISOString(),
    }
    expect(m.status).toBe('active')
  })
})
```

- [ ] **Step 2: Run to confirm it fails**

```bash
npm test -- --testPathPattern=types
```
Expected: FAIL — `Cannot find module '@/types'`

- [ ] **Step 3: Create `types/index.ts`**

```typescript
export type MissionStatus = 'active' | 'completed' | 'abandoned' | 'paused'
export type IdeaStatus = 'jailed' | 'flagged' | 'approved' | 'promoted' | 'dismissed'
export type TaskPriority = 'primary' | 'secondary' | 'optional'
export type TaskStatus = 'pending' | 'completed' | 'skipped'
export type MessageRole = 'user' | 'assistant'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  sahm_mode: boolean
  sahm_available_minutes: number
  onboarded: boolean
  created_at: string
  updated_at: string
}

export interface Mission {
  id: string
  user_id: string
  title: string
  description: string | null
  status: MissionStatus
  completion_pct: number
  started_at: string
  completed_at: string | null
  abandoned_at: string | null
  abandoned_reason: string | null
  created_at: string
}

export interface Idea {
  id: string
  user_id: string
  mission_id: string
  title: string
  description: string | null
  status: IdeaStatus
  ai_alignment_score: number | null
  ai_notes: string | null
  scheduled_review_date: string | null
  created_at: string
}

export interface DailyCheckin {
  id: string
  user_id: string
  mission_id: string
  checkin_date: string
  available_hours: number
  obstacles: string | null
  yesterday_progress: string | null
  ai_coaching_notes: string | null
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  mission_id: string
  checkin_id: string | null
  title: string
  description: string | null
  priority: TaskPriority
  revenue_score: number
  status: TaskStatus
  scheduled_date: string | null
  completed_at: string | null
  created_at: string
}

export interface RevenueEntry {
  id: string
  user_id: string
  mission_id: string
  amount: number
  currency: string
  description: string | null
  entry_date: string
  created_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  mission_id: string
  role: MessageRole
  content: string
  created_at: string
}

export interface WeeklyReview {
  id: string
  user_id: string
  mission_id: string
  week_start: string
  week_end: string
  revenue_generated: number
  hours_spent: number
  focus_score: number
  completion_score: number
  tasks_completed: number
  ai_coaching: string | null
  created_at: string
}

export interface Streak {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_checkin_date: string | null
  updated_at: string
}
```

- [ ] **Step 4: Run test — confirm pass**

```bash
npm test -- --testPathPattern=types
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add types/index.ts __tests__/types.test.ts
git commit -m "feat: add shared TypeScript types"
```

---

### Task 3: Supabase client utilities

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `.env.local` (from template)

- [ ] **Step 1: Create `.env.local`**

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_key
RESEND_API_KEY=your_resend_key
CRON_SECRET=your_random_secret_for_cron_auth
```

Fill in values from your Supabase project dashboard and Anthropic/Resend consoles.

- [ ] **Step 2: Create `lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3: Create `lib/supabase/server.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/
git commit -m "feat: add Supabase browser and server clients"
```

---

### Task 4: Database migrations

**Files:**
- Create: `supabase/migrations/001_profiles_missions.sql`
- Create: `supabase/migrations/002_ideas_checkins_tasks.sql`
- Create: `supabase/migrations/003_revenue_chat_reviews_streaks.sql`

- [ ] **Step 1: Create `supabase/migrations/001_profiles_missions.sql`**

```sql
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
```

- [ ] **Step 2: Create `supabase/migrations/002_ideas_checkins_tasks.sql`**

```sql
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
```

- [ ] **Step 3: Create `supabase/migrations/003_revenue_chat_reviews_streaks.sql`**

```sql
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
```

- [ ] **Step 4: Run migrations in Supabase dashboard**

Go to Supabase → SQL Editor → run each migration file in order (001, 002, 003).

- [ ] **Step 5: Commit**

```bash
git add supabase/
git commit -m "feat: add all DB migrations with RLS policies"
```

---

### Task 5: Auth middleware + route guards

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Create `middleware.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Unauthenticated → login
  if (!user && pathname.startsWith('/app')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Authenticated + not onboarded → onboarding (skip if already going there)
  if (user && pathname.startsWith('/app') && pathname !== '/app/onboarding') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarded')
      .eq('id', user.id)
      .single()

    if (profile && !profile.onboarded) {
      return NextResponse.redirect(new URL('/app/onboarding', request.url))
    }
  }

  // Authenticated → skip auth pages
  if (user && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/app/:path*', '/auth/:path*'],
}
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: add auth + onboarding middleware guards"
```

---

### Task 6: Tailwind theme + global styles

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update `app/globals.css`**

```css
@import "tailwindcss";

@theme {
  --color-brand: #f97316;
  --color-brand-dark: #ea6c0a;
  --color-brand-light: #fed7aa;
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
}

body {
  background: #ffffff;
  color: #111111;
  font-family: var(--font-sans);
}
```

- [ ] **Step 2: Update `app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'FocusForge AI',
  description: 'Your AI Chief of Staff. One mission. No distractions.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: add brand theme and Inter font"
```

---

### Task 7: Auth pages

**Files:**
- Create: `app/auth/login/page.tsx`
- Create: `app/auth/signup/page.tsx`
- Create: `app/auth/reset/page.tsx`
- Create: `app/page.tsx` (root redirect)

- [ ] **Step 1: Create `app/page.tsx`**

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  redirect(user ? '/app' : '/auth/login')
}
```

- [ ] **Step 2: Create `app/auth/login/page.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/app')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6">
      <div className="max-w-sm mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-black">
            Focus<span className="text-[#f97316]">Forge</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Sign in to your Chief of Staff</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f97316]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f97316]"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-black uppercase tracking-wide py-3 rounded-xl text-sm disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-500 space-y-2">
          <p><Link href="/auth/signup" className="text-[#f97316] font-semibold">Create account</Link></p>
          <p><Link href="/auth/reset" className="text-gray-400">Forgot password?</Link></p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/auth/signup/page.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/app/onboarding')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6">
      <div className="max-w-sm mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-black">
            Focus<span className="text-[#f97316]">Forge</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">One mission. No distractions. Let's go.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f97316]"
          />
          <input
            type="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={8}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f97316]"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f97316] text-white font-black uppercase tracking-wide py-3 rounded-xl text-sm disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Start My Mission →'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link href="/auth/login" className="text-[#f97316] font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `app/auth/reset/page.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ResetPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/login`,
    })
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center px-6">
        <div className="max-w-sm mx-auto w-full text-center">
          <p className="text-2xl font-black">Check your email</p>
          <p className="text-gray-500 mt-2 text-sm">We sent a password reset link to {email}</p>
          <Link href="/auth/login" className="mt-6 inline-block text-[#f97316] font-semibold text-sm">← Back to login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6">
      <div className="max-w-sm mx-auto w-full">
        <h1 className="text-2xl font-black mb-2">Reset password</h1>
        <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send a reset link.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f97316]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-black uppercase tracking-wide py-3 rounded-xl text-sm disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm"><Link href="/auth/login" className="text-gray-400">← Back to login</Link></p>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/
git commit -m "feat: add auth pages (login, signup, reset)"
```

---

### Task 8: App shell — layout + bottom nav

**Files:**
- Create: `app/(app)/layout.tsx`
- Create: `components/layout/BottomNav.tsx`
- Create: `components/layout/TopNav.tsx`

- [ ] **Step 1: Create `components/layout/BottomNav.tsx`**

```typescript
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/app',        icon: '🏠', label: 'Home'     },
  { href: '/app/checkin', icon: '✅', label: 'Check-in' },
  { href: '/app/ideas',   icon: '🔒', label: 'Ideas'    },
  { href: '/app/chat',    icon: '⚡', label: 'Chat'     },
  { href: '/app/review',  icon: '📊', label: 'Review'   },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 grid grid-cols-5 z-50">
      {tabs.map(tab => {
        const active = pathname === tab.href || (tab.href !== '/app' && pathname.startsWith(tab.href))
        return (
          <Link key={tab.href} href={tab.href} className="flex flex-col items-center py-2 pt-3">
            <span className="text-lg leading-none">{tab.icon}</span>
            <span className={`text-[9px] uppercase tracking-wide font-bold mt-1 ${active ? 'text-[#f97316]' : 'text-gray-400'}`}>
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 2: Create `components/layout/TopNav.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function TopNav() {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('sahm_mode')
    .single()

  return (
    <header className="bg-black px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      <span className="text-[#f97316] font-black text-base">
        Focus<span className="text-white">Forge</span>
      </span>
      <div className="flex items-center gap-2">
        {profile?.sahm_mode && (
          <span className="bg-[#f97316] text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wide">
            SAHM
          </span>
        )}
        <a href="/app/settings" className="w-8 h-8 bg-[#222] rounded-lg flex items-center justify-center text-sm">⚙️</a>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Create `app/(app)/layout.tsx`**

```typescript
import TopNav from '@/components/layout/TopNav'
import BottomNav from '@/components/layout/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/(app)/layout.tsx components/layout/
git commit -m "feat: add app shell with TopNav and BottomNav"
```

---

## Phase 2 — Mission Core

### Task 9: Anthropic client + zod schemas

**Files:**
- Create: `lib/anthropic/client.ts`
- Create: `lib/anthropic/schemas.ts`

- [ ] **Step 1: Create `lib/anthropic/client.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})
```

- [ ] **Step 2: Write failing test**

Create `__tests__/api/schemas.test.ts`:

```typescript
import { TaskOutputSchema, IdeaScoreSchema, WeeklyReviewSchema } from '@/lib/anthropic/schemas'

describe('Claude output schemas', () => {
  it('TaskOutputSchema accepts valid task output', () => {
    const result = TaskOutputSchema.safeParse({
      tasks: [
        { title: 'Send 3 DMs', description: 'Cold outreach', priority: 'primary', revenue_score: 10 },
      ],
      coaching_note: 'Do the DMs first.',
    })
    expect(result.success).toBe(true)
  })

  it('TaskOutputSchema rejects more than 3 tasks', () => {
    const result = TaskOutputSchema.safeParse({
      tasks: [
        { title: 'T1', description: '', priority: 'primary', revenue_score: 9 },
        { title: 'T2', description: '', priority: 'secondary', revenue_score: 6 },
        { title: 'T3', description: '', priority: 'optional', revenue_score: 3 },
        { title: 'T4', description: '', priority: 'optional', revenue_score: 2 },
      ],
      coaching_note: 'Too many',
    })
    expect(result.success).toBe(false)
  })

  it('IdeaScoreSchema accepts valid score', () => {
    const result = IdeaScoreSchema.safeParse({
      alignment_score: 7,
      status: 'flagged',
      ai_notes: 'Possible but not urgent.',
    })
    expect(result.success).toBe(true)
  })
})
```

- [ ] **Step 3: Run to confirm fail**

```bash
npm test -- --testPathPattern=schemas
```
Expected: FAIL — `Cannot find module '@/lib/anthropic/schemas'`

- [ ] **Step 4: Create `lib/anthropic/schemas.ts`**

```typescript
import { z } from 'zod'

export const TaskOutputSchema = z.object({
  tasks: z.array(z.object({
    title:         z.string().min(1),
    description:   z.string(),
    priority:      z.enum(['primary', 'secondary', 'optional']),
    revenue_score: z.number().int().min(0).max(10),
  })).max(3),
  coaching_note: z.string().min(1),
})

export const IdeaScoreSchema = z.object({
  alignment_score: z.number().int().min(0).max(10),
  status:          z.enum(['jailed', 'flagged', 'approved']),
  ai_notes:        z.string().min(1),
})

export const WeeklyReviewSchema = z.object({
  wins:             z.array(z.string()),
  failures:         z.array(z.string()),
  coaching:         z.string().min(1),
  focus_score:      z.number().int().min(0).max(100),
  completion_score: z.number().int().min(0).max(100),
})

export type TaskOutput    = z.infer<typeof TaskOutputSchema>
export type IdeaScore     = z.infer<typeof IdeaScoreSchema>
export type WeeklyReviewOutput = z.infer<typeof WeeklyReviewSchema>
```

- [ ] **Step 5: Run to confirm pass**

```bash
npm test -- --testPathPattern=schemas
```
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add lib/anthropic/ __tests__/api/schemas.test.ts
git commit -m "feat: add Anthropic client and zod output schemas"
```

---

### Task 10: Mission API + onboarding

**Files:**
- Create: `app/api/mission/route.ts`
- Create: `app/api/mission/[id]/route.ts`
- Create: `app/(app)/onboarding/page.tsx`
- Create: `__tests__/api/mission.test.ts`

- [ ] **Step 1: Write failing test**

Create `__tests__/api/mission.test.ts`:

```typescript
import { POST } from '@/app/api/mission/route'
import { createClient } from '@/lib/supabase/server'

jest.mock('@/lib/supabase/server')

const mockInsert = jest.fn()
const mockSelect = jest.fn()
const mockSingle = jest.fn()

;(createClient as jest.Mock).mockResolvedValue({
  auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
  from: jest.fn(() => ({
    insert: jest.fn(() => ({ select: jest.fn(() => ({ single: mockSingle })) })),
  })),
})

describe('POST /api/mission', () => {
  it('returns 401 when unauthenticated', async () => {
    ;(createClient as jest.Mock).mockResolvedValueOnce({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
      from: jest.fn(),
    })
    const req = new Request('http://localhost/api/mission', {
      method: 'POST',
      body: JSON.stringify({ title: 'Get first client' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when title is missing', async () => {
    const req = new Request('http://localhost/api/mission', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
```

- [ ] **Step 2: Run to confirm fail**

```bash
npm test -- --testPathPattern=mission
```
Expected: FAIL — `Cannot find module '@/app/api/mission/route'`

- [ ] **Step 3: Create `app/api/mission/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Mission title is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('missions')
    .insert({
      user_id:     user.id,
      title:       body.title.trim(),
      description: body.description ?? null,
      status:      'active',
    })
    .select()
    .single()

  if (error) {
    // Unique constraint = already has active mission
    if (error.code === '23505') {
      return NextResponse.json({ error: 'You already have an active mission' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
```

- [ ] **Step 4: Create `app/api/mission/[id]/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const allowed = ['completed', 'abandoned', 'paused', 'active']

  if (!allowed.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const updates: Record<string, unknown> = { status: body.status }
  if (body.status === 'completed')  updates.completed_at     = new Date().toISOString()
  if (body.status === 'abandoned') {
    updates.abandoned_at     = new Date().toISOString()
    updates.abandoned_reason = body.reason ?? null
  }
  if (body.completion_pct !== undefined) updates.completion_pct = body.completion_pct

  const { data, error } = await supabase
    .from('missions')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

- [ ] **Step 5: Run tests — confirm pass**

```bash
npm test -- --testPathPattern=mission
```
Expected: PASS (2 tests)

- [ ] **Step 6: Create `app/(app)/onboarding/page.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Step = 'name' | 'mission' | 'sahm'

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('name')
  const [name, setName] = useState('')
  const [mission, setMission] = useState('')
  const [sahmMode, setSahmMode] = useState(false)
  const [sahmMinutes, setSahmMinutes] = useState(45)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleFinish() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Update profile
    await supabase.from('profiles').update({
      full_name:             name.trim(),
      sahm_mode:             sahmMode,
      sahm_available_minutes: sahmMinutes,
      onboarded:             true,
      updated_at:            new Date().toISOString(),
    }).eq('id', user.id)

    // Create first mission
    await fetch('/api/mission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: mission.trim() }),
    })

    // Init streak row
    await supabase.from('streaks').insert({ user_id: user.id })

    router.push('/app/checkin')
  }

  const stepNum = step === 'name' ? 1 : step === 'mission' ? 2 : 3

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6">
      <div className="max-w-sm mx-auto w-full">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1,2,3].map(n => (
            <div key={n} className={`h-1 flex-1 rounded-full ${n <= stepNum ? 'bg-[#f97316]' : 'bg-gray-100'}`} />
          ))}
        </div>

        {step === 'name' && (
          <>
            <h1 className="text-2xl font-black mb-1">What should I call you?</h1>
            <p className="text-gray-400 text-sm mb-6">Your Chief of Staff needs a name for you.</p>
            <input
              type="text"
              placeholder="Your first name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-[#f97316]"
            />
            <button
              onClick={() => setStep('mission')}
              disabled={!name.trim()}
              className="w-full bg-black text-white font-black uppercase tracking-wide py-3 rounded-xl text-sm disabled:opacity-30"
            >
              Next →
            </button>
          </>
        )}

        {step === 'mission' && (
          <>
            <h1 className="text-2xl font-black mb-1">What's your mission, {name}?</h1>
            <p className="text-gray-400 text-sm mb-2">One goal. Make it specific and revenue-related.</p>
            <p className="text-[10px] text-gray-300 uppercase tracking-wide mb-4">e.g. "Land my first paying client" · "Launch MVP" · "Complete certification"</p>
            <input
              type="text"
              placeholder="My mission is to..."
              value={mission}
              onChange={e => setMission(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-[#f97316]"
            />
            <button
              onClick={() => setStep('sahm')}
              disabled={!mission.trim()}
              className="w-full bg-black text-white font-black uppercase tracking-wide py-3 rounded-xl text-sm disabled:opacity-30"
            >
              Next →
            </button>
          </>
        )}

        {step === 'sahm' && (
          <>
            <h1 className="text-2xl font-black mb-1">Limited time windows?</h1>
            <p className="text-gray-400 text-sm mb-6">SAHM Mode gives you one high-leverage task when you have less than an hour. Perfect for caregivers, parents, or anyone with unpredictable time.</p>
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setSahmMode(false)}
                className={`w-full border-2 rounded-xl p-4 text-left text-sm font-semibold ${!sahmMode ? 'border-[#f97316] bg-orange-50' : 'border-gray-200'}`}
              >
                <div className="font-black">Standard Mode</div>
                <div className="text-gray-500 font-normal text-xs mt-1">Up to 3 tasks per day based on available hours</div>
              </button>
              <button
                onClick={() => setSahmMode(true)}
                className={`w-full border-2 rounded-xl p-4 text-left text-sm font-semibold ${sahmMode ? 'border-[#f97316] bg-orange-50' : 'border-gray-200'}`}
              >
                <div className="font-black">SAHM Mode ⚡</div>
                <div className="text-gray-500 font-normal text-xs mt-1">One highest-leverage task, sized to your available time</div>
              </button>
            </div>
            {sahmMode && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Default available time</p>
                <div className="flex gap-2">
                  {[15,30,45,60].map(m => (
                    <button
                      key={m}
                      onClick={() => setSahmMinutes(m)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border ${sahmMinutes === m ? 'border-[#f97316] bg-[#f97316] text-white' : 'border-gray-200 text-gray-600'}`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={handleFinish}
              disabled={loading}
              className="w-full bg-[#f97316] text-white font-black uppercase tracking-wide py-3 rounded-xl text-sm disabled:opacity-50"
            >
              {loading ? 'Setting up...' : "Let's Go →"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add app/api/mission/ app/(app)/onboarding/ __tests__/api/mission.test.ts
git commit -m "feat: add mission API and 3-step onboarding flow"
```

---

### Task 11: Momentum Dashboard (static)

**Files:**
- Create: `app/(app)/page.tsx`
- Create: `components/dashboard/MissionHero.tsx`
- Create: `components/dashboard/StatsRow.tsx`
- Create: `components/dashboard/TaskCard.tsx`
- Create: `components/dashboard/AICoachNudge.tsx`
- Create: `components/dashboard/QuickActions.tsx`

- [ ] **Step 1: Write failing test**

Create `__tests__/components/TaskCard.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import TaskCard from '@/components/dashboard/TaskCard'
import type { Task } from '@/types'

const mockTask: Task = {
  id: '1', user_id: 'u1', mission_id: 'm1', checkin_id: null,
  title: 'Send 3 DMs', description: null,
  priority: 'primary', revenue_score: 10, status: 'pending',
  scheduled_date: null, completed_at: null, created_at: new Date().toISOString(),
}

describe('TaskCard', () => {
  it('renders task title', () => {
    render(<TaskCard task={mockTask} onComplete={jest.fn()} />)
    expect(screen.getByText('Send 3 DMs')).toBeInTheDocument()
  })

  it('shows revenue score badge', () => {
    render(<TaskCard task={mockTask} onComplete={jest.fn()} />)
    expect(screen.getByText('Score 10')).toBeInTheDocument()
  })

  it('applies primary styling for primary tasks', () => {
    const { container } = render(<TaskCard task={mockTask} onComplete={jest.fn()} />)
    expect(container.firstChild).toHaveClass('bg-black')
  })
})
```

- [ ] **Step 2: Run to confirm fail**

```bash
npm test -- --testPathPattern=TaskCard
```
Expected: FAIL

- [ ] **Step 3: Create `components/dashboard/TaskCard.tsx`**

```typescript
'use client'
import type { Task } from '@/types'

interface Props {
  task: Task
  onComplete: (id: string) => void
}

const priorityStyles = {
  primary:   { wrapper: 'bg-black border-l-4 border-[#f97316]', title: 'text-white', badge: 'bg-[#f97316] text-white', label: 'bg-[#f97316] text-white' },
  secondary: { wrapper: 'bg-gray-50 border border-gray-200',     title: 'text-black', badge: 'bg-amber-100 text-amber-800', label: 'bg-amber-100 text-amber-800' },
  optional:  { wrapper: 'bg-gray-50 border border-dashed border-gray-200 opacity-70', title: 'text-gray-600', badge: 'bg-gray-100 text-gray-500', label: 'bg-gray-100 text-gray-500' },
}

const priorityLabels = { primary: 'Primary', secondary: 'Secondary', optional: 'Optional' }

export default function TaskCard({ task, onComplete }: Props) {
  const s = priorityStyles[task.priority]
  return (
    <div className={`rounded-xl p-3 mb-2 flex gap-3 items-start ${s.wrapper}`}>
      <button
        onClick={() => onComplete(task.id)}
        className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center text-[10px] border-2 ${task.priority === 'primary' ? 'border-[#f97316] bg-[#f97316] text-white' : 'border-gray-300'}`}
      >
        {task.status === 'completed' ? '✓' : ''}
      </button>
      <div className="flex-1">
        <span className={`text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded mr-1 ${s.label}`}>
          {priorityLabels[task.priority]}
        </span>
        <p className={`text-sm font-bold mt-1 ${s.title}`}>{task.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${s.badge}`}>
            Score {task.revenue_score}
          </span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test — confirm pass**

```bash
npm test -- --testPathPattern=TaskCard
```
Expected: PASS (3 tests)

- [ ] **Step 5: Create `components/dashboard/MissionHero.tsx`**

```typescript
import type { Mission } from '@/types'

function daysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000) + 1
}

export default function MissionHero({ mission }: { mission: Mission }) {
  const days = daysSince(mission.started_at)
  return (
    <div className="bg-black px-4 pt-4 pb-6 border-b-4 border-[#f97316]">
      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Active Mission</p>
      <h2 className="text-2xl font-black text-white leading-tight mb-3">{mission.title}</h2>
      <div className="flex gap-2 flex-wrap mb-4">
        <span className="bg-[#1a1a1a] border border-[#333] text-gray-300 text-[10px] px-3 py-1 rounded-full">
          <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 align-middle" />
          Day {days}
        </span>
      </div>
      <div>
        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
          <span>Mission progress</span>
          <span>{mission.completion_pct}%</span>
        </div>
        <div className="bg-[#222] rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#f97316] to-amber-400 h-full rounded-full transition-all"
            style={{ width: `${mission.completion_pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create `components/dashboard/StatsRow.tsx`**

```typescript
interface Props {
  revenue: number
  tasksCompleted: number
  focusScore: number
}

export default function StatsRow({ revenue, tasksCompleted, focusScore }: Props) {
  return (
    <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
      <div className="py-3 px-4 text-center">
        <p className="text-xl font-black text-green-600">${revenue.toFixed(0)}</p>
        <p className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">Revenue</p>
      </div>
      <div className="py-3 px-4 text-center">
        <p className="text-xl font-black text-[#f97316]">{tasksCompleted}</p>
        <p className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">Tasks Done</p>
      </div>
      <div className="py-3 px-4 text-center">
        <p className="text-xl font-black text-black">{focusScore}</p>
        <p className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">Focus Score</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Create `components/dashboard/AICoachNudge.tsx`**

```typescript
export default function AICoachNudge({ note }: { note: string }) {
  return (
    <div className="mx-4 mb-4 bg-black rounded-xl p-3 flex gap-2.5">
      <div className="w-7 h-7 bg-[#f97316] rounded-lg flex items-center justify-center text-sm flex-shrink-0">⚡</div>
      <p className="text-[12px] text-gray-300 leading-relaxed">
        <span className="text-[#f97316] font-bold">Chief of Staff: </span>
        {note}
      </p>
    </div>
  )
}
```

- [ ] **Step 8: Create `components/dashboard/QuickActions.tsx`**

```typescript
import Link from 'next/link'

export default function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-3 px-4 pb-4">
      {[
        { href: '/app/ideas',   icon: '💡', label: 'Jail Idea'    },
        { href: '/app/revenue', icon: '💰', label: 'Log Revenue'  },
        { href: '/app/chat',    icon: '💬', label: 'AI Chat'      },
      ].map(({ href, icon, label }) => (
        <Link
          key={href}
          href={href}
          className="bg-gray-50 border border-gray-100 rounded-xl py-3 flex flex-col items-center gap-1"
        >
          <span className="text-xl">{icon}</span>
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">{label}</span>
        </Link>
      ))}
    </div>
  )
}
```

- [ ] **Step 9: Create `app/(app)/page.tsx`**

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MissionHero from '@/components/dashboard/MissionHero'
import StatsRow from '@/components/dashboard/StatsRow'
import TaskCard from '@/components/dashboard/TaskCard'
import AICoachNudge from '@/components/dashboard/AICoachNudge'
import QuickActions from '@/components/dashboard/QuickActions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const today = new Date().toISOString().split('T')[0]

  const [{ data: mission }, { data: tasks }, { data: checkin }, { data: streak }, { data: revenue }] =
    await Promise.all([
      supabase.from('missions').select('*').eq('user_id', user.id).eq('status', 'active').single(),
      supabase.from('tasks').select('*').eq('user_id', user.id).eq('scheduled_date', today).order('revenue_score', { ascending: false }),
      supabase.from('daily_checkins').select('ai_coaching_notes').eq('user_id', user.id).eq('checkin_date', today).single(),
      supabase.from('streaks').select('*').eq('user_id', user.id).single(),
      supabase.from('revenue_entries').select('amount').eq('user_id', user.id).gte('entry_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
    ])

  if (!mission) redirect('/app/mission/new')

  const totalRevenue = (revenue ?? []).reduce((sum: number, r: { amount: number }) => sum + r.amount, 0)
  const completedCount = (tasks ?? []).filter((t: { status: string }) => t.status === 'completed').length

  return (
    <div>
      <MissionHero mission={mission} />
      <StatsRow
        revenue={totalRevenue}
        tasksCompleted={completedCount}
        focusScore={streak?.current_streak ? Math.min(100, streak.current_streak * 10) : 0}
      />
      {tasks && tasks.length > 0 ? (
        <div className="px-4 pt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-black">Today's Tasks</h3>
            <span className="text-xs text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
          {tasks.map((task: Parameters<typeof TaskCard>[0]['task']) => (
            <TaskCard key={task.id} task={task} onComplete={() => {}} />
          ))}
        </div>
      ) : (
        <div className="px-4 pt-6 text-center">
          <p className="text-gray-400 text-sm">No tasks yet.</p>
          <a href="/app/checkin" className="inline-block mt-2 bg-[#f97316] text-white font-black text-xs uppercase px-4 py-2 rounded-lg">
            Start Check-in →
          </a>
        </div>
      )}
      {checkin?.ai_coaching_notes && <AICoachNudge note={checkin.ai_coaching_notes} />}
      <QuickActions />
    </div>
  )
}
```

- [ ] **Step 10: Run all tests**

```bash
npm test
```
Expected: all pass

- [ ] **Step 11: Commit**

```bash
git add app/(app)/page.tsx components/dashboard/ __tests__/components/
git commit -m "feat: add momentum dashboard with mission hero, stats, tasks, and quick actions"
```

---

## Phase 3 — Daily Check-in + Tasks

### Task 12: Check-in API with Claude task generation

**Files:**
- Create: `lib/anthropic/prompts.ts`
- Create: `app/api/checkin/route.ts`
- Create: `__tests__/api/checkin.test.ts`

- [ ] **Step 1: Create `lib/anthropic/prompts.ts`**

```typescript
import type { Mission, Profile } from '@/types'

export function buildCheckinSystemPrompt(mission: Mission, profile: Profile): string {
  return `You are an AI Chief of Staff. Generate focused daily tasks for a user working on a specific mission.

MISSION: "${mission.title}" (Day ${Math.floor((Date.now() - new Date(mission.started_at).getTime()) / 86_400_000) + 1})
SAHM MODE: ${profile.sahm_mode ? `YES — max ${profile.sahm_available_minutes} minutes available` : 'NO'}

TASK GENERATION RULES:
- Revenue score 8-10: direct client outreach, sales calls, proposals, follow-ups
- Revenue score 4-7: portfolio, content, lead magnets supporting the mission
- Revenue score 1-3: admin, learning, preparation
- ${profile.sahm_mode ? 'SAHM MODE: Return EXACTLY 1 task (primary only). The single highest revenue-score action completable in the time window.' : 'Return 1 primary task (score 8-10), up to 2 secondary tasks (score 4-7). Maximum 3 tasks total.'}
- coaching_note: 1-2 sentences, direct, specific to this user's situation. No fluff.`
}

export function buildCheckinUserPrompt(opts: {
  availableHours: number
  obstacles: string
  yesterdayProgress: string
}): string {
  return `Available hours today: ${opts.availableHours}
Obstacles: ${opts.obstacles || 'None mentioned'}
Yesterday's progress: ${opts.yesterdayProgress || 'Not provided'}

Generate the highest-leverage tasks for today.`
}

export function buildChatSystemPrompt(opts: {
  mission: Mission
  profile: Profile
  tasksToday: string[]
  completedCount: number
  revenueTotal: number
  streak: number
  recentIdeas: string[]
}): string {
  const days = Math.floor((Date.now() - new Date(opts.mission.started_at).getTime()) / 86_400_000) + 1
  return `You are the user's AI Chief of Staff. You are direct, honest, and relentlessly focused on execution over planning.

CURRENT MISSION: "${opts.mission.title}" — Day ${days}
TODAY'S TASKS: ${opts.tasksToday.join(', ') || 'None yet'} | Completed: ${opts.completedCount}/${opts.tasksToday.length}
REVENUE THIS MONTH: $${opts.revenueTotal}
STREAK: ${opts.streak} days
${opts.profile.sahm_mode ? `SAHM MODE: ON — user has limited time (default ${opts.profile.sahm_available_minutes} min)` : 'SAHM MODE: OFF'}
RECENTLY JAILED IDEAS: ${opts.recentIdeas.join(', ') || 'None'}

BEHAVIOR RULES:
- Challenge excuses directly and specifically. Name the avoidance.
- Celebrate execution, not planning or preparation.
- When user mentions a new idea, tell them it is going to jail. Be matter-of-fact, not harsh.
- Never suggest switching missions or starting new projects.
- Be supportive of real constraints (sick kid, no sleep) but not of resistance disguised as obstacles.
- Keep responses short: 2-4 sentences max unless explaining something specific.`
}
```

- [ ] **Step 2: Write failing test**

Create `__tests__/api/checkin.test.ts`:

```typescript
import { POST } from '@/app/api/checkin/route'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic/client'

jest.mock('@/lib/supabase/server')
jest.mock('@/lib/anthropic/client', () => ({
  anthropic: { messages: { create: jest.fn() } },
}))

const mockUser = { id: 'user-1' }
const mockMission = { id: 'm1', user_id: 'user-1', title: 'Get first client', started_at: new Date().toISOString(), status: 'active' }
const mockProfile = { id: 'user-1', sahm_mode: false, sahm_available_minutes: 45 }

const mockClaudeResponse = {
  content: [{ type: 'text', text: JSON.stringify({
    tasks: [{ title: 'Send 3 DMs', description: 'Cold outreach', priority: 'primary', revenue_score: 10 }],
    coaching_note: 'Do the outreach first.',
  })}],
}

;(createClient as jest.Mock).mockResolvedValue({
  auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
  from: jest.fn((table: string) => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn().mockResolvedValue({
          data: table === 'missions' ? mockMission : table === 'profiles' ? mockProfile : null,
        }),
        eq: jest.fn(() => ({ single: jest.fn().mockResolvedValue({ data: null }) })),
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({ single: jest.fn().mockResolvedValue({ data: { id: 'ci-1' } }) })),
    })),
  })),
})

;(anthropic.messages.create as jest.Mock).mockResolvedValue(mockClaudeResponse)

describe('POST /api/checkin', () => {
  it('returns 401 when unauthenticated', async () => {
    ;(createClient as jest.Mock).mockResolvedValueOnce({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
      from: jest.fn(),
    })
    const req = new Request('http://localhost/api/checkin', {
      method: 'POST',
      body: JSON.stringify({ available_hours: 2, obstacles: '', yesterday_progress: '' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when available_hours missing', async () => {
    const req = new Request('http://localhost/api/checkin', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
```

- [ ] **Step 3: Run to confirm fail**

```bash
npm test -- --testPathPattern=checkin
```
Expected: FAIL

- [ ] **Step 4: Create `app/api/checkin/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic/client'
import { TaskOutputSchema } from '@/lib/anthropic/schemas'
import { buildCheckinSystemPrompt, buildCheckinUserPrompt } from '@/lib/anthropic/prompts'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  if (body.available_hours === undefined || body.available_hours === null) {
    return NextResponse.json({ error: 'available_hours is required' }, { status: 400 })
  }

  // Fetch mission + profile in parallel
  const [{ data: mission }, { data: profile }] = await Promise.all([
    supabase.from('missions').select('*').eq('user_id', user.id).eq('status', 'active').single(),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
  ])

  if (!mission) return NextResponse.json({ error: 'No active mission' }, { status: 404 })
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Check if check-in already exists today
  const today = new Date().toISOString().split('T')[0]
  const { data: existing } = await supabase
    .from('daily_checkins')
    .select('id')
    .eq('user_id', user.id)
    .eq('checkin_date', today)
    .single()

  if (existing) return NextResponse.json({ error: 'Already checked in today' }, { status: 409 })

  // Call Claude
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: buildCheckinSystemPrompt(mission, profile),
    messages: [{ role: 'user', content: buildCheckinUserPrompt({
      availableHours:    body.available_hours,
      obstacles:         body.obstacles ?? '',
      yesterdayProgress: body.yesterday_progress ?? '',
    })}],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''

  let parsed
  try {
    parsed = TaskOutputSchema.parse(JSON.parse(raw))
  } catch {
    return NextResponse.json({ error: 'AI returned invalid response' }, { status: 500 })
  }

  // Save check-in
  const { data: checkin } = await supabase
    .from('daily_checkins')
    .insert({
      user_id:            user.id,
      mission_id:         mission.id,
      checkin_date:       today,
      available_hours:    body.available_hours,
      obstacles:          body.obstacles ?? null,
      yesterday_progress: body.yesterday_progress ?? null,
      ai_coaching_notes:  parsed.coaching_note,
    })
    .select()
    .single()

  // Save tasks
  const tasksToInsert = parsed.tasks.map(t => ({
    user_id:        user.id,
    mission_id:     mission.id,
    checkin_id:     checkin?.id ?? null,
    title:          t.title,
    description:    t.description,
    priority:       t.priority,
    revenue_score:  t.revenue_score,
    scheduled_date: today,
  }))

  await supabase.from('tasks').insert(tasksToInsert)

  // Update streak
  await updateStreak(supabase, user.id, today)

  return NextResponse.json({ checkin, tasks: tasksToInsert, coaching_note: parsed.coaching_note })
}

async function updateStreak(supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>, userId: string, today: string) {
  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!streak) {
    await supabase.from('streaks').insert({ user_id: userId, current_streak: 1, longest_streak: 1, last_checkin_date: today })
    return
  }

  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]
  const isConsecutive = streak.last_checkin_date === yesterday
  const newCurrent = isConsecutive ? streak.current_streak + 1 : 1
  const newLongest = Math.max(streak.longest_streak, newCurrent)

  await supabase.from('streaks').update({
    current_streak:    newCurrent,
    longest_streak:    newLongest,
    last_checkin_date: today,
    updated_at:        new Date().toISOString(),
  }).eq('user_id', userId)
}
```

- [ ] **Step 5: Run tests — confirm pass**

```bash
npm test -- --testPathPattern=checkin
```
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add app/api/checkin/ lib/anthropic/prompts.ts __tests__/api/checkin.test.ts
git commit -m "feat: add daily check-in API with Claude task generation and streak tracking"
```

---

### Task 13: Check-in form page + task complete API

**Files:**
- Create: `app/(app)/checkin/page.tsx`
- Create: `app/api/tasks/[id]/complete/route.ts`
- Create: `app/api/tasks/[id]/skip/route.ts`

- [ ] **Step 1: Create `app/(app)/checkin/page.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TIME_OPTIONS = [
  { label: '30 min', value: 0.5 },
  { label: '45 min', value: 0.75 },
  { label: '1 hr',   value: 1 },
  { label: '2 hrs',  value: 2 },
  { label: 'Full day', value: 8 },
]

export default function CheckinPage() {
  const [availableHours, setAvailableHours] = useState<number | null>(null)
  const [obstacles, setObstacles] = useState('')
  const [yesterdayProgress, setYesterdayProgress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (availableHours === null) return
    setLoading(true)
    setError(null)

    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available_hours: availableHours, obstacles, yesterday_progress: yesterdayProgress }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
      setLoading(false)
      return
    }

    router.push('/app')
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black px-4 pt-4 pb-6 border-b-4 border-[#f97316]">
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Good morning 👊</p>
        <h1 className="text-2xl font-black text-white">Let's build your day</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-5 space-y-5">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 block mb-2">
            How much time do you have today?
          </label>
          <div className="flex gap-2 flex-wrap">
            {TIME_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAvailableHours(opt.value)}
                className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                  availableHours === opt.value
                    ? 'bg-[#f97316] text-white border-[#f97316]'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 block mb-2">
            Any obstacles today?
          </label>
          <textarea
            value={obstacles}
            onChange={e => setObstacles(e.target.value)}
            placeholder="e.g. kids are home, feeling anxious, no laptop..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f97316] resize-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 block mb-2">
            What did you accomplish yesterday?
          </label>
          <textarea
            value={yesterdayProgress}
            onChange={e => setYesterdayProgress(e.target.value)}
            placeholder="e.g. sent 2 DMs, wrote proposal, had a discovery call..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f97316] resize-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={availableHours === null || loading}
          className="w-full bg-[#f97316] text-white font-black uppercase tracking-wide py-3.5 rounded-xl text-sm disabled:opacity-40"
        >
          {loading ? 'Generating tasks...' : 'Generate My Tasks →'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Create `app/api/tasks/[id]/complete/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { data, error } = await supabase
    .from('tasks')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

- [ ] **Step 3: Create `app/api/tasks/[id]/skip/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { data, error } = await supabase
    .from('tasks')
    .update({ status: 'skipped' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

- [ ] **Step 4: Commit**

```bash
git add app/(app)/checkin/ app/api/tasks/
git commit -m "feat: add check-in form page and task complete/skip APIs"
```

---

## Phase 4 — Idea Jail

### Task 14: Idea API with Claude alignment scoring

**Files:**
- Create: `app/api/ideas/route.ts`
- Create: `app/api/ideas/[id]/route.ts`
- Create: `__tests__/api/ideas.test.ts`

- [ ] **Step 1: Write failing test**

Create `__tests__/api/ideas.test.ts`:

```typescript
import { POST } from '@/app/api/ideas/route'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic/client'

jest.mock('@/lib/supabase/server')
jest.mock('@/lib/anthropic/client', () => ({
  anthropic: { messages: { create: jest.fn() } },
}))

const mockClaudeResponse = {
  content: [{ type: 'text', text: JSON.stringify({
    alignment_score: 2,
    status: 'jailed',
    ai_notes: 'Zero connection to your current mission.',
  })}],
}

;(createClient as jest.Mock).mockResolvedValue({
  auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
  from: jest.fn(() => ({
    select: jest.fn(() => ({ eq: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn().mockResolvedValue({ data: { id: 'm1', title: 'Get first client', started_at: new Date().toISOString() } }) })) })) })),
    insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn().mockResolvedValue({ data: { id: 'idea-1', status: 'jailed' } }) })) })),
  })),
})
;(anthropic.messages.create as jest.Mock).mockResolvedValue(mockClaudeResponse)

describe('POST /api/ideas', () => {
  it('returns 401 when unauthenticated', async () => {
    ;(createClient as jest.Mock).mockResolvedValueOnce({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
      from: jest.fn(),
    })
    const req = new Request('http://localhost/api/ideas', {
      method: 'POST',
      body: JSON.stringify({ title: 'New SaaS idea' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when title missing', async () => {
    const req = new Request('http://localhost/api/ideas', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
```

- [ ] **Step 2: Run to confirm fail**

```bash
npm test -- --testPathPattern=ideas
```

- [ ] **Step 3: Create `app/api/ideas/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic/client'
import { IdeaScoreSchema } from '@/lib/anthropic/schemas'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  if (!body.title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  const { data: mission } = await supabase
    .from('missions')
    .select('id, title, started_at')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!mission) return NextResponse.json({ error: 'No active mission' }, { status: 404 })

  const days = Math.floor((Date.now() - new Date(mission.started_at).getTime()) / 86_400_000) + 1

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: `You evaluate whether a new idea supports a user's current mission. Be honest and direct. Return JSON only.`,
    messages: [{
      role: 'user',
      content: `Current mission: "${mission.title}" (Day ${days})
New idea: "${body.title}"
${body.description ? `Details: ${body.description}` : ''}

Does this idea directly support the current mission?
Return JSON: { "alignment_score": 0-10, "status": "jailed"|"flagged"|"approved", "ai_notes": "1-2 sentence honest assessment" }
Score guide: 0-4=jailed, 5-7=flagged, 8-10=approved`,
    }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  let scored
  try {
    scored = IdeaScoreSchema.parse(JSON.parse(raw))
  } catch {
    return NextResponse.json({ error: 'AI returned invalid response' }, { status: 500 })
  }

  const { data: idea } = await supabase
    .from('ideas')
    .insert({
      user_id:               user.id,
      mission_id:            mission.id,
      title:                 body.title.trim(),
      description:           body.description ?? null,
      status:                scored.status,
      ai_alignment_score:    scored.alignment_score,
      ai_notes:              scored.ai_notes,
      scheduled_review_date: scored.status === 'flagged'
        ? new Date(Date.now() + 7 * 86_400_000).toISOString().split('T')[0]
        : null,
    })
    .select()
    .single()

  return NextResponse.json(idea, { status: 201 })
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const missionFilter = searchParams.get('mission') // 'active' | 'past' | mission_id

  let query = supabase.from('ideas').select('*, missions(title)').eq('user_id', user.id)

  if (missionFilter === 'active') {
    const { data: mission } = await supabase.from('missions').select('id').eq('user_id', user.id).eq('status', 'active').single()
    if (mission) query = query.eq('mission_id', mission.id)
  } else if (missionFilter === 'past') {
    const { data: missions } = await supabase.from('missions').select('id').eq('user_id', user.id).neq('status', 'active')
    const ids = (missions ?? []).map((m: { id: string }) => m.id)
    if (ids.length) query = query.in('mission_id', ids)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

- [ ] **Step 4: Create `app/api/ideas/[id]/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const allowed = ['jailed', 'flagged', 'approved', 'promoted', 'dismissed']
  if (!allowed.includes(body.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

  const { data, error } = await supabase
    .from('ideas')
    .update({ status: body.status })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

- [ ] **Step 5: Run tests — confirm pass**

```bash
npm test -- --testPathPattern=ideas
```
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/api/ideas/ __tests__/api/ideas.test.ts
git commit -m "feat: add idea jail API with Claude alignment scoring"
```

---

### Task 15: Idea Jail page + anti-shiny intercept

**Files:**
- Create: `app/(app)/ideas/page.tsx`
- Create: `components/ideas/IdeaForm.tsx`
- Create: `components/ideas/IdeaCard.tsx`
- Create: `app/(app)/mission/new/page.tsx`

- [ ] **Step 1: Write failing test for IdeaCard**

Create `__tests__/components/IdeaCard.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import IdeaCard from '@/components/ideas/IdeaCard'
import type { Idea } from '@/types'

const mockIdea: Idea = {
  id: '1', user_id: 'u1', mission_id: 'm1',
  title: 'New SaaS idea', description: null,
  status: 'jailed', ai_alignment_score: 2,
  ai_notes: 'Zero connection to mission.',
  scheduled_review_date: null, created_at: new Date().toISOString(),
}

describe('IdeaCard', () => {
  it('renders idea title', () => {
    render(<IdeaCard idea={mockIdea} />)
    expect(screen.getByText('New SaaS idea')).toBeInTheDocument()
  })

  it('shows jailed status badge', () => {
    render(<IdeaCard idea={mockIdea} />)
    expect(screen.getByText('🔒 Jailed')).toBeInTheDocument()
  })

  it('renders AI notes', () => {
    render(<IdeaCard idea={mockIdea} />)
    expect(screen.getByText('Zero connection to mission.')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to confirm fail**

```bash
npm test -- --testPathPattern=IdeaCard
```

- [ ] **Step 3: Create `components/ideas/IdeaCard.tsx`**

```typescript
import type { Idea } from '@/types'

const statusConfig = {
  jailed:   { bg: 'bg-red-50',    border: 'border-red-200',   badge: 'bg-red-100 text-red-700',    label: '🔒 Jailed'    },
  flagged:  { bg: 'bg-amber-50',  border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', label: '⚠️ Review Sunday' },
  approved: { bg: 'bg-green-50',  border: 'border-green-200', badge: 'bg-green-100 text-green-700', label: '✅ Supports mission' },
  promoted: { bg: 'bg-blue-50',   border: 'border-blue-200',  badge: 'bg-blue-100 text-blue-700',   label: '→ Task added'  },
  dismissed:{ bg: 'bg-gray-50',   border: 'border-gray-200',  badge: 'bg-gray-100 text-gray-500',   label: 'Dismissed'    },
}

export default function IdeaCard({ idea }: { idea: Idea }) {
  const s = statusConfig[idea.status] ?? statusConfig.jailed
  return (
    <div className={`rounded-xl p-3 mb-2 border ${s.bg} ${s.border}`}>
      <p className="text-sm font-bold text-gray-900 mb-1.5">{idea.title}</p>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.badge}`}>{s.label}</span>
        {idea.ai_alignment_score !== null && (
          <span className="text-[10px] text-gray-400">Score {idea.ai_alignment_score}/10</span>
        )}
      </div>
      {idea.ai_notes && (
        <p className="text-[11px] text-gray-500 italic mt-1">"{idea.ai_notes}"</p>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run test — confirm pass**

```bash
npm test -- --testPathPattern=IdeaCard
```
Expected: PASS (3 tests)

- [ ] **Step 5: Create `components/ideas/IdeaForm.tsx`**

```typescript
'use client'
import { useState } from 'react'
import type { Idea } from '@/types'

export default function IdeaForm({ onAdd }: { onAdd: (idea: Idea) => void }) {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError(null)

    const res = await fetch('/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim() }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }

    setTitle('')
    setLoading(false)
    onAdd(data)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 border-b border-gray-100 px-4 py-3">
      <input
        type="text"
        placeholder="Describe your idea..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-2 focus:outline-none focus:border-[#f97316]"
      />
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!title.trim() || loading}
          className="bg-black text-white font-black text-xs uppercase tracking-wide px-4 py-2 rounded-lg disabled:opacity-40"
        >
          {loading ? 'Scoring...' : 'Lock It Up →'}
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Step 6: Create `app/(app)/ideas/page.tsx`**

```typescript
'use client'
import { useState, useEffect } from 'react'
import IdeaForm from '@/components/ideas/IdeaForm'
import IdeaCard from '@/components/ideas/IdeaCard'
import type { Idea } from '@/types'

type Filter = 'active' | 'past'

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [filter, setFilter] = useState<Filter>('active')
  const [loading, setLoading] = useState(true)

  async function fetchIdeas(f: Filter) {
    setLoading(true)
    const res = await fetch(`/api/ideas?mission=${f}`)
    if (res.ok) setIdeas(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchIdeas(filter) }, [filter])

  function handleAdd(idea: Idea) {
    setIdeas(prev => [idea, ...prev])
  }

  return (
    <div>
      <div className="bg-black px-4 pt-4 pb-5 border-b-4 border-[#059669]">
        <h1 className="text-2xl font-black text-white">Idea Jail 🔒</h1>
        <p className="text-gray-400 text-xs mt-1">Lock up ideas before they steal your focus.</p>
        <p className="text-gray-500 text-[10px] mt-1">{ideas.length} ideas locked · Review on Sundays</p>
      </div>

      <IdeaForm onAdd={handleAdd} />

      <div className="flex border-b border-gray-100">
        {(['active', 'past'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wide ${filter === f ? 'text-[#f97316] border-b-2 border-[#f97316]' : 'text-gray-400'}`}
          >
            {f === 'active' ? 'Current Mission' : 'Past Missions'}
          </button>
        ))}
      </div>

      <div className="px-4 pt-3">
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-8">Loading...</p>
        ) : ideas.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No ideas jailed yet. Submit one above.</p>
        ) : (
          ideas.map(idea => <IdeaCard key={idea.id} idea={idea} />)
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Create `app/(app)/mission/new/page.tsx`** (with anti-shiny intercept)

```typescript
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type InterceptState = 'checking' | 'challenge' | 'form'

export default function NewMissionPage() {
  const [state, setState] = useState<InterceptState>('checking')
  const [missionAge, setMissionAge] = useState(0)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [challengeResponse, setChallengeResponse] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function checkActiveMission() {
      const res = await fetch('/api/mission/active')
      if (res.ok) {
        const data = await res.json()
        if (data?.started_at) {
          const days = Math.floor((Date.now() - new Date(data.started_at).getTime()) / 86_400_000) + 1
          setMissionAge(days)
          setState(days < 14 ? 'challenge' : 'form')
        } else {
          setState('form')
        }
      } else {
        setState('form')
      }
    }
    checkActiveMission()
  }, [])

  async function handleAbandonAndSwitch() {
    setLoading(true)
    const activeRes = await fetch('/api/mission/active')
    if (activeRes.ok) {
      const active = await activeRes.json()
      if (active?.id) {
        await fetch(`/api/mission/${active.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'abandoned', reason: challengeResponse || 'User chose to switch missions.' }),
        })
      }
    }
    setState('form')
    setLoading(false)
  }

  async function handleCreateMission(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    const res = await fetch('/api/mission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim() }),
    })
    if (res.ok) router.push('/app/checkin')
    else setLoading(false)
  }

  if (state === 'checking') {
    return <div className="min-h-screen bg-white flex items-center justify-center"><p className="text-gray-400 text-sm">Loading...</p></div>
  }

  if (state === 'challenge') {
    return (
      <div className="min-h-screen bg-white px-4 pt-8">
        <div className="max-w-sm mx-auto">
          <div className="bg-black rounded-2xl p-5 mb-6">
            <div className="text-[#f97316] text-xs font-black uppercase tracking-wide mb-3">⚡ Chief of Staff</div>
            <p className="text-white text-sm leading-relaxed">
              You've been on this mission for {missionAge} day{missionAge !== 1 ? 's' : ''}. Before you switch, answer honestly: is this mission no longer valid — or has executing on it become uncomfortable?
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mt-3">
              There's a difference between a dead end and resistance. One requires a pivot. The other requires you to push through.
            </p>
          </div>
          <textarea
            placeholder="Why do you want to switch? (optional but encouraged)"
            value={challengeResponse}
            onChange={e => setChallengeResponse(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-4 focus:outline-none focus:border-[#f97316] resize-none"
          />
          <div className="space-y-2">
            <button
              onClick={() => router.push('/app')}
              className="w-full bg-[#f97316] text-white font-black uppercase tracking-wide py-3 rounded-xl text-sm"
            >
              You're right — I'll continue my mission
            </button>
            <button
              onClick={handleAbandonAndSwitch}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-xl text-sm disabled:opacity-50"
            >
              I want to switch anyway
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white px-4 pt-8">
      <div className="max-w-sm mx-auto">
        <h1 className="text-2xl font-black mb-1">New mission</h1>
        <p className="text-gray-400 text-sm mb-6">Make it specific. Make it revenue-related.</p>
        <form onSubmit={handleCreateMission} className="space-y-4">
          <input
            type="text"
            placeholder="My mission is to..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f97316]"
          />
          <button
            type="submit"
            disabled={!title.trim() || loading}
            className="w-full bg-black text-white font-black uppercase tracking-wide py-3 rounded-xl text-sm disabled:opacity-40"
          >
            {loading ? 'Creating...' : 'Lock In Mission →'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Add `GET /api/mission/active` route**

Create `app/api/mission/active/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('missions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  return NextResponse.json(data ?? null)
}
```

- [ ] **Step 9: Run all tests**

```bash
npm test
```
Expected: all pass

- [ ] **Step 10: Commit**

```bash
git add app/(app)/ideas/ app/(app)/mission/ app/api/mission/active/ components/ideas/ __tests__/components/IdeaCard.test.tsx
git commit -m "feat: add idea jail page, IdeaCard, IdeaForm, and anti-shiny mission intercept"
```

---

## Phase 5 — AI Chat + Revenue

### Task 16: Streaming chat API

**Files:**
- Create: `app/api/chat/route.ts`
- Create: `app/(app)/chat/page.tsx`
- Create: `components/chat/ChatMessages.tsx`
- Create: `components/chat/ChatInput.tsx`

- [ ] **Step 1: Create `app/api/chat/route.ts`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic/client'
import { buildChatSystemPrompt } from '@/lib/anthropic/prompts'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body = await request.json()
  const userMessage: string = body.message?.trim()
  if (!userMessage) return new Response('Message required', { status: 400 })

  // Gather context in parallel
  const today = new Date().toISOString().split('T')[0]
  const [
    { data: mission },
    { data: profile },
    { data: tasks },
    { data: streak },
    { data: recentIdeas },
    { data: history },
  ] = await Promise.all([
    supabase.from('missions').select('*').eq('user_id', user.id).eq('status', 'active').single(),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('tasks').select('title,status').eq('user_id', user.id).eq('scheduled_date', today),
    supabase.from('streaks').select('current_streak').eq('user_id', user.id).single(),
    supabase.from('ideas').select('title').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('chat_messages').select('role,content').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
  ])

  if (!mission || !profile) return new Response('No active mission', { status: 404 })

  const taskTitles = (tasks ?? []).map((t: { title: string; status: string }) => `${t.title}${t.status === 'completed' ? ' ✓' : ''}`)
  const completedCount = (tasks ?? []).filter((t: { status: string }) => t.status === 'completed').length
  const ideaTitles = (recentIdeas ?? []).map((i: { title: string }) => i.title)
  const sortedHistory = [...(history ?? [])].reverse()

  const systemPrompt = buildChatSystemPrompt({
    mission,
    profile,
    tasksToday: taskTitles,
    completedCount,
    revenueTotal: 0,
    streak: streak?.current_streak ?? 0,
    recentIdeas: ideaTitles,
  })

  // Save user message
  await supabase.from('chat_messages').insert({
    user_id: user.id, mission_id: mission.id, role: 'user', content: userMessage,
  })

  // Stream response
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: systemPrompt,
    messages: [
      ...sortedHistory.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: userMessage },
    ],
  })

  const encoder = new TextEncoder()
  let fullResponse = ''

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          const text = chunk.delta.text
          fullResponse += text
          controller.enqueue(encoder.encode(text))
        }
      }
      // Save assistant message after stream completes
      await supabase.from('chat_messages').insert({
        user_id: user.id, mission_id: mission.id, role: 'assistant', content: fullResponse,
      })
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
  })
}
```

- [ ] **Step 2: Create `components/chat/ChatMessages.tsx`**

```typescript
import type { ChatMessage } from '@/types'

export default function ChatMessages({ messages, streaming }: { messages: ChatMessage[]; streaming?: string }) {
  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      {messages.map(msg => (
        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          {msg.role === 'assistant' && (
            <div className="w-6 h-6 bg-[#f97316] rounded-lg flex items-center justify-center text-[10px] mr-2 mt-0.5 flex-shrink-0">⚡</div>
          )}
          <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
            msg.role === 'user' ? 'bg-[#f97316] text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          }`}>
            {msg.content}
          </div>
        </div>
      ))}
      {streaming && (
        <div className="flex justify-start">
          <div className="w-6 h-6 bg-[#f97316] rounded-lg flex items-center justify-center text-[10px] mr-2 mt-0.5 flex-shrink-0">⚡</div>
          <div className="max-w-[78%] bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm leading-relaxed">
            {streaming}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create `components/chat/ChatInput.tsx`**

```typescript
'use client'
import { useState, useRef } from 'react'

interface Props {
  onSend: (message: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSend() {
    if (!text.trim() || disabled) return
    onSend(text.trim())
    setText('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex gap-3 items-end">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Talk to your Chief of Staff..."
        rows={1}
        className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f97316] max-h-24"
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        className="w-10 h-10 bg-[#f97316] rounded-xl flex items-center justify-center disabled:opacity-40"
      >
        <span className="text-white font-black text-lg">↑</span>
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Create `app/(app)/chat/page.tsx`**

```typescript
'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import ChatMessages from '@/components/chat/ChatMessages'
import ChatInput from '@/components/chat/ChatInput'
import type { ChatMessage } from '@/types'

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streaming, setStreaming] = useState<string>('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(50)
      .then(({ data }) => { if (data) setMessages(data) })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  async function handleSend(message: string) {
    setSending(true)

    const optimistic: ChatMessage = {
      id: crypto.randomUUID(),
      user_id: '', mission_id: '',
      role: 'user', content: message,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      if (!res.body) throw new Error('No stream')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setStreaming(full)
      }

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        user_id: '', mission_id: '',
        role: 'assistant', content: full,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMsg])
      setStreaming('')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black px-4 pt-4 pb-4 border-b border-[#222]">
        <h1 className="text-xl font-black text-white">Chief of Staff <span className="text-[#f97316]">⚡</span></h1>
        <p className="text-gray-400 text-xs">Focused on your mission. Always.</p>
      </div>
      <div className="pb-28">
        {messages.length === 0 && !streaming && (
          <div className="px-4 pt-8 text-center">
            <div className="w-12 h-12 bg-[#f97316] rounded-2xl flex items-center justify-center text-xl mx-auto mb-3">⚡</div>
            <p className="font-bold text-gray-900 mb-1">Your AI Chief of Staff</p>
            <p className="text-gray-400 text-sm">Ask me anything about your mission, get unstuck, or tell me what's in your way.</p>
          </div>
        )}
        <ChatMessages messages={messages} streaming={streaming || undefined} />
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={handleSend} disabled={sending} />
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/api/chat/ app/(app)/chat/ components/chat/
git commit -m "feat: add streaming AI chat with context injection"
```

---

### Task 17: Revenue tracking

**Files:**
- Create: `app/api/revenue/route.ts`
- Create: `app/(app)/revenue/page.tsx`

- [ ] **Step 1: Create `app/api/revenue/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  if (!body.amount || isNaN(Number(body.amount)) || Number(body.amount) <= 0) {
    return NextResponse.json({ error: 'Valid positive amount required' }, { status: 400 })
  }

  const { data: mission } = await supabase
    .from('missions').select('id').eq('user_id', user.id).eq('status', 'active').single()

  const { data, error } = await supabase
    .from('revenue_entries')
    .insert({
      user_id:     user.id,
      mission_id:  mission?.id ?? null,
      amount:      Number(body.amount),
      currency:    body.currency ?? 'USD',
      description: body.description ?? null,
      entry_date:  body.entry_date ?? new Date().toISOString().split('T')[0],
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const firstOfMonth = new Date()
  firstOfMonth.setDate(1)
  const startDate = firstOfMonth.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('revenue_entries')
    .select('*')
    .eq('user_id', user.id)
    .gte('entry_date', startDate)
    .order('entry_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

- [ ] **Step 2: Create `app/(app)/revenue/page.tsx`**

```typescript
'use client'
import { useState, useEffect } from 'react'
import type { RevenueEntry } from '@/types'

export default function RevenuePage() {
  const [entries, setEntries] = useState<RevenueEntry[]>([])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/revenue').then(r => r.json()).then(setEntries)
  }, [])

  const total = entries.reduce((sum, e) => sum + Number(e.amount), 0)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!amount) return
    setLoading(true)
    setError(null)
    const res = await fetch('/api/revenue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount), description }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    setEntries(prev => [data, ...prev])
    setAmount('')
    setDescription('')
    setLoading(false)
  }

  return (
    <div>
      <div className="bg-black px-4 pt-4 pb-5 border-b-4 border-green-500">
        <h1 className="text-2xl font-black text-white">Revenue 💰</h1>
        <div className="mt-2">
          <p className="text-gray-400 text-xs uppercase tracking-widest">This Month</p>
          <p className="text-4xl font-black text-green-400">${total.toFixed(2)}</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="px-4 pt-4 pb-2 border-b border-gray-100">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Log Revenue</p>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            placeholder="Amount ($)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min="0.01"
            step="0.01"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f97316]"
          />
        </div>
        <input
          type="text"
          placeholder="What was this for? (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-2 focus:outline-none focus:border-[#f97316]"
        />
        {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
        <button
          type="submit"
          disabled={!amount || loading}
          className="w-full bg-green-600 text-white font-black uppercase tracking-wide py-2.5 rounded-xl text-sm disabled:opacity-40"
        >
          {loading ? 'Logging...' : '+ Add Revenue'}
        </button>
      </form>

      <div className="px-4 pt-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">This Month's Entries</p>
        {entries.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No revenue logged yet. Every dollar starts here.</p>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="flex items-center justify-between py-3 border-b border-gray-50">
              <div>
                <p className="text-sm font-bold text-gray-900">{entry.description || 'Revenue'}</p>
                <p className="text-[10px] text-gray-400">{entry.entry_date}</p>
              </div>
              <p className="text-base font-black text-green-600">+${Number(entry.amount).toFixed(2)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/revenue/ app/(app)/revenue/
git commit -m "feat: add revenue tracking API and log page"
```

---

## Phase 6 — Weekly Review + Missions Archive

### Task 18: Weekly review API with Claude coaching

**Files:**
- Create: `app/api/review/generate/route.ts`
- Create: `app/api/cron/weekly-review/route.ts`
- Create: `__tests__/api/review.test.ts`
- Create: `vercel.json`

- [ ] **Step 1: Write failing test**

Create `__tests__/api/review.test.ts`:

```typescript
import { POST } from '@/app/api/review/generate/route'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic/client'

jest.mock('@/lib/supabase/server')
jest.mock('@/lib/anthropic/client', () => ({
  anthropic: { messages: { create: jest.fn() } },
}))

const mockClaudeResponse = {
  content: [{ type: 'text', text: JSON.stringify({
    wins: ['Sent 5 DMs'], failures: ['Missed two days'],
    coaching: 'Show up every day.', focus_score: 72, completion_score: 65,
  })}],
}

;(createClient as jest.Mock).mockResolvedValue({
  auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn().mockResolvedValue({ data: { id: 'm1', title: 'Get clients', started_at: new Date().toISOString() } }),
        gte: jest.fn(() => ({ lte: jest.fn().mockResolvedValue({ data: [] }) })),
        order: jest.fn(() => ({ limit: jest.fn().mockResolvedValue({ data: [] }) })),
      })),
    })),
    upsert: jest.fn().mockResolvedValue({ data: { id: 'wr-1' }, error: null }),
  })),
})
;(anthropic.messages.create as jest.Mock).mockResolvedValue(mockClaudeResponse)

describe('POST /api/review/generate', () => {
  it('returns 401 when unauthenticated', async () => {
    ;(createClient as jest.Mock).mockResolvedValueOnce({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
      from: jest.fn(),
    })
    const req = new Request('http://localhost/api/review/generate', { method: 'POST' })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })
})
```

- [ ] **Step 2: Run to confirm fail**

```bash
npm test -- --testPathPattern=review
```
Expected: FAIL

- [ ] **Step 3: Create `app/api/review/generate/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic/client'
import { WeeklyReviewSchema } from '@/lib/anthropic/schemas'

function getWeekBounds() {
  const now = new Date()
  const day = now.getDay()
  const start = new Date(now)
  start.setDate(now.getDate() - day)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return {
    week_start: start.toISOString().split('T')[0],
    week_end:   end.toISOString().split('T')[0],
  }
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { week_start, week_end } = getWeekBounds()

  const { data: mission } = await supabase
    .from('missions').select('*').eq('user_id', user.id).eq('status', 'active').single()
  if (!mission) return NextResponse.json({ error: 'No active mission' }, { status: 404 })

  // Collect week data in parallel
  const [{ data: checkins }, { data: tasks }, { data: revenue }] = await Promise.all([
    supabase.from('daily_checkins').select('checkin_date,available_hours').eq('user_id', user.id).gte('checkin_date', week_start).lte('checkin_date', week_end),
    supabase.from('tasks').select('title,status,revenue_score').eq('user_id', user.id).gte('scheduled_date', week_start).lte('scheduled_date', week_end),
    supabase.from('revenue_entries').select('amount').eq('user_id', user.id).gte('entry_date', week_start).lte('entry_date', week_end),
  ])

  const totalRevenue  = (revenue ?? []).reduce((s: number, r: { amount: number }) => s + Number(r.amount), 0)
  const hoursSpent    = (checkins ?? []).reduce((s: number, c: { available_hours: number }) => s + Number(c.available_hours), 0)
  const completedTasks = (tasks ?? []).filter((t: { status: string }) => t.status === 'completed')

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 768,
    system: `Generate a weekly review for an entrepreneur. Be direct, specific, and actionable. Return JSON only.`,
    messages: [{
      role: 'user',
      content: `Mission: "${mission.title}"
Week: ${week_start} to ${week_end}
Check-ins: ${checkins?.length ?? 0}/7 days
Hours worked: ${hoursSpent}
Tasks completed: ${completedTasks.length}/${tasks?.length ?? 0}
Revenue: $${totalRevenue}

Return JSON: { "wins": ["..."], "failures": ["..."], "coaching": "direct 2-3 sentence coaching note", "focus_score": 0-100, "completion_score": 0-100 }`,
    }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  let parsed
  try { parsed = WeeklyReviewSchema.parse(JSON.parse(raw)) }
  catch { return NextResponse.json({ error: 'AI returned invalid response' }, { status: 500 }) }

  const { data, error } = await supabase
    .from('weekly_reviews')
    .upsert({
      user_id:          user.id,
      mission_id:       mission.id,
      week_start,
      week_end,
      revenue_generated: totalRevenue,
      hours_spent:       hoursSpent,
      focus_score:       parsed.focus_score,
      completion_score:  parsed.completion_score,
      tasks_completed:   completedTasks.length,
      ai_coaching:       parsed.coaching,
    }, { onConflict: 'user_id,week_start' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ review: data, wins: parsed.wins, failures: parsed.failures })
}
```

- [ ] **Step 4: Create `app/api/cron/weekly-review/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data: profiles } = await supabase.from('profiles').select('id').eq('onboarded', true)

  const results = await Promise.allSettled(
    (profiles ?? []).map(async (p: { id: string }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://localhost:3000'}/api/review/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': p.id,
          },
        }
      )
      return { userId: p.id, status: res.status }
    })
  )

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  return NextResponse.json({ processed: profiles?.length ?? 0, succeeded })
}
```

- [ ] **Step 5: Create `lib/supabase/admin.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

- [ ] **Step 6: Create `vercel.json`**

```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-review",
      "schedule": "0 9 * * 0"
    }
  ]
}
```

(Runs at 9am UTC every Sunday)

- [ ] **Step 7: Run tests — confirm pass**

```bash
npm test -- --testPathPattern=review
```
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add app/api/review/ app/api/cron/ lib/supabase/admin.ts vercel.json __tests__/api/review.test.ts
git commit -m "feat: add weekly review API with Claude coaching and Sunday cron job"
```

---

### Task 19: Weekly review page + mission history

**Files:**
- Create: `app/(app)/review/page.tsx`
- Create: `app/(app)/review/[week]/page.tsx`
- Create: `app/(app)/missions/page.tsx`
- Create: `components/review/ReviewStats.tsx`
- Create: `components/review/CoachingBlock.tsx`

- [ ] **Step 1: Create `components/review/ReviewStats.tsx`**

```typescript
interface Props {
  focusScore: number
  completionScore: number
  revenue: number
  tasksCompleted: number
  hoursSpent: number
}

export default function ReviewStats({ focusScore, completionScore, revenue, tasksCompleted, hoursSpent }: Props) {
  return (
    <div className="px-4 py-4 grid grid-cols-2 gap-3">
      {[
        { label: 'Focus Score',   value: `${focusScore}%`,           color: 'text-[#f97316]' },
        { label: 'Task Rate',     value: `${completionScore}%`,      color: 'text-blue-600'  },
        { label: 'Revenue',       value: `$${revenue.toFixed(0)}`,   color: 'text-green-600' },
        { label: 'Tasks Done',    value: String(tasksCompleted),     color: 'text-black'     },
      ].map(({ label, value, color }) => (
        <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
          <p className={`text-2xl font-black ${color}`}>{value}</p>
          <p className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create `components/review/CoachingBlock.tsx`**

```typescript
export default function CoachingBlock({ coaching, wins, failures }: {
  coaching: string
  wins: string[]
  failures: string[]
}) {
  return (
    <div className="px-4 space-y-3">
      <div className="bg-black rounded-xl p-4">
        <div className="text-[#f97316] text-[10px] font-black uppercase tracking-wide mb-2">⚡ Chief of Staff Coaching</div>
        <p className="text-gray-200 text-sm leading-relaxed">{coaching}</p>
      </div>
      {wins.length > 0 && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-3">
          <p className="text-green-700 font-black text-xs uppercase tracking-wide mb-1.5">Wins ✓</p>
          {wins.map((w, i) => <p key={i} className="text-green-800 text-sm">• {w}</p>)}
        </div>
      )}
      {failures.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3">
          <p className="text-red-700 font-black text-xs uppercase tracking-wide mb-1.5">Misses</p>
          {failures.map((f, i) => <p key={i} className="text-red-800 text-sm">• {f}</p>)}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create `app/(app)/review/page.tsx`**

```typescript
'use client'
import { useState, useEffect } from 'react'
import ReviewStats from '@/components/review/ReviewStats'
import CoachingBlock from '@/components/review/CoachingBlock'
import Link from 'next/link'

interface ReviewData {
  review: { focus_score: number; completion_score: number; revenue_generated: number; tasks_completed: number; hours_spent: number; ai_coaching: string; week_start: string };
  wins: string[]
  failures: string[]
}

export default function ReviewPage() {
  const [data, setData] = useState<ReviewData | null>(null)
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    const res = await fetch('/api/review/generate', { method: 'POST' })
    if (res.ok) {
      const json = await res.json()
      setData(json)
      setGenerated(true)
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="bg-black px-4 pt-4 pb-5 border-b-4 border-[#f97316]">
        <h1 className="text-2xl font-black text-white">Weekly Review 📊</h1>
        <p className="text-gray-400 text-xs mt-1">Your Chief of Staff's honest assessment of this week.</p>
      </div>

      {!generated && (
        <div className="px-4 pt-6 text-center">
          <p className="text-gray-500 text-sm mb-4">Ready to see how this week went?</p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-[#f97316] text-white font-black uppercase tracking-wide px-6 py-3 rounded-xl text-sm disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Generate This Week\'s Review →'}
          </button>
          <div className="mt-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Past Reviews</p>
            <Link href="/app/review/history" className="text-[#f97316] text-sm font-bold">View History →</Link>
          </div>
        </div>
      )}

      {generated && data && (
        <>
          <ReviewStats
            focusScore={data.review.focus_score}
            completionScore={data.review.completion_score}
            revenue={data.review.revenue_generated}
            tasksCompleted={data.review.tasks_completed}
            hoursSpent={data.review.hours_spent}
          />
          <CoachingBlock
            coaching={data.review.ai_coaching}
            wins={data.wins}
            failures={data.failures}
          />
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create `app/(app)/missions/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Mission } from '@/types'

const statusStyles: Record<string, string> = {
  active:    'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  abandoned: 'bg-red-100 text-red-700',
  paused:    'bg-amber-100 text-amber-700',
}

function dayCount(m: Mission) {
  const end = m.completed_at || m.abandoned_at || new Date().toISOString()
  return Math.floor((new Date(end).getTime() - new Date(m.started_at).getTime()) / 86_400_000) + 1
}

export default async function MissionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: missions } = await supabase
    .from('missions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="bg-black px-4 pt-4 pb-5 border-b-4 border-[#f97316]">
        <h1 className="text-2xl font-black text-white">Mission Archive</h1>
        <p className="text-gray-400 text-xs mt-1">{missions?.length ?? 0} missions total</p>
      </div>
      <div className="px-4 pt-3">
        {(missions ?? []).map((m: Mission) => (
          <Link
            key={m.id}
            href={`/app/mission/${m.id}`}
            className="block border border-gray-100 rounded-xl p-3.5 mb-2"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-bold text-gray-900 leading-tight">{m.title}</p>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 capitalize ${statusStyles[m.status] ?? 'bg-gray-100'}`}>
                {m.status}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{dayCount(m)} day{dayCount(m) !== 1 ? 's' : ''} · {m.completion_pct}% complete</p>
          </Link>
        ))}
        {(missions ?? []).every((m: Mission) => m.status !== 'active') && (
          <div className="mt-4 text-center">
            <Link
              href="/app/mission/new"
              className="inline-block bg-[#f97316] text-white font-black uppercase text-xs px-5 py-3 rounded-xl"
            >
              Start New Mission →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create `app/(app)/mission/[id]/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Mission } from '@/types'

function fmt(d: string | null) {
  if (!d) return '–'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function MissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const [{ data: mission }, { data: tasks }, { data: ideas }] = await Promise.all([
    supabase.from('missions').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('tasks').select('title,status,revenue_score').eq('mission_id', id).eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
    supabase.from('ideas').select('title,status,ai_alignment_score').eq('mission_id', id).eq('user_id', user.id).limit(10),
  ])

  if (!mission) return notFound()

  const m = mission as Mission
  const completedTasks = (tasks ?? []).filter((t: { status: string }) => t.status === 'completed').length

  return (
    <div>
      <div className="bg-black px-4 pt-4 pb-5 border-b-4 border-[#f97316]">
        <Link href="/app/missions" className="text-gray-500 text-xs">← Missions</Link>
        <h1 className="text-xl font-black text-white mt-2 leading-tight">{m.title}</h1>
        <div className="flex gap-2 mt-2">
          <span className="text-[10px] text-gray-400 capitalize">Status: {m.status}</span>
          <span className="text-[10px] text-gray-400">{m.completion_pct}% complete</span>
        </div>
      </div>

      <div className="px-4 pt-4 grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400">Started</p>
          <p className="font-bold text-sm">{fmt(m.started_at)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400">{m.status === 'completed' ? 'Completed' : 'Last updated'}</p>
          <p className="font-bold text-sm">{fmt(m.completed_at ?? m.abandoned_at ?? m.started_at)}</p>
        </div>
      </div>

      {tasks && tasks.length > 0 && (
        <div className="px-4 pt-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
            Tasks ({completedTasks}/{tasks.length} completed)
          </p>
          {tasks.slice(0, 10).map((t: { title: string; status: string; revenue_score: number }, i: number) => (
            <div key={i} className="flex items-center gap-2 py-2 border-b border-gray-50">
              <span className="text-sm">{t.status === 'completed' ? '✅' : '⬜'}</span>
              <p className="text-sm text-gray-800 flex-1">{t.title}</p>
              <span className="text-[10px] text-gray-400">Score {t.revenue_score}</span>
            </div>
          ))}
        </div>
      )}

      {ideas && ideas.length > 0 && (
        <div className="px-4 pt-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
            Idea Jail ({ideas.length} ideas)
          </p>
          {ideas.map((idea: { title: string; status: string; ai_alignment_score: number | null }, i: number) => (
            <div key={i} className="flex items-center gap-2 py-2 border-b border-gray-50">
              <p className="text-sm text-gray-600 flex-1">{idea.title}</p>
              <span className="text-[10px] text-gray-400">{idea.ai_alignment_score ?? '–'}/10</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add app/(app)/review/ app/(app)/missions/ app/(app)/mission/[id]/ components/review/ __tests__/api/review.test.ts
git commit -m "feat: add weekly review page, mission history, and mission detail"
```

---

## Phase 7 — Settings + Streak Visualization

### Task 20: Settings page + profile update API

**Files:**
- Create: `app/api/profile/route.ts`
- Create: `app/(app)/settings/page.tsx`

- [ ] **Step 1: Create `app/api/profile/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const allowed = ['full_name', 'sahm_mode', 'sahm_available_minutes']
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

- [ ] **Step 2: Create `app/(app)/settings/page.tsx`**

```typescript
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile, Streak } from '@/types'

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [streak, setStreak] = useState<Streak | null>(null)
  const [name, setName] = useState('')
  const [sahmMode, setSahmMode] = useState(false)
  const [sahmMinutes, setSahmMinutes] = useState(45)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  useEffect(() => {
    Promise.all([
      fetch('/api/profile').then(r => r.json()),
      fetch('/api/streak').then(r => r.json()).catch(() => null),
    ]).then(([p, s]) => {
      setProfile(p)
      setName(p.full_name ?? '')
      setSahmMode(p.sahm_mode ?? false)
      setSahmMinutes(p.sahm_available_minutes ?? 45)
      if (s) setStreak(s)
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: name, sahm_mode: sahmMode, sahm_available_minutes: sahmMinutes }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  async function handleMissionProgress(pct: number) {
    const res = await fetch('/api/mission/active')
    if (res.ok) {
      const mission = await res.json()
      if (mission?.id) {
        await fetch(`/api/mission/${mission.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completion_pct: pct }),
        })
      }
    }
  }

  if (!profile) return <div className="min-h-screen bg-white flex items-center justify-center"><p className="text-gray-400 text-sm">Loading...</p></div>

  return (
    <div>
      <div className="bg-black px-4 pt-4 pb-5 border-b-4 border-[#f97316]">
        <h1 className="text-2xl font-black text-white">Settings</h1>
      </div>

      {/* Streak block */}
      {streak && (
        <div className="mx-4 mt-4 bg-black rounded-xl p-3.5 flex items-center gap-3">
          <div className="text-3xl font-black text-[#f97316]">{streak.current_streak}</div>
          <div>
            <p className="text-white text-sm font-bold">day streak 🔥</p>
            <p className="text-gray-400 text-xs">Best: {streak.longest_streak} days</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="px-4 pt-5 space-y-4">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#f97316]"
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">SAHM Mode</label>
          <div className="space-y-2">
            {[{ label: 'Off — Standard (up to 3 tasks)', value: false }, { label: 'On — One task, time-capped', value: true }].map(opt => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setSahmMode(opt.value)}
                className={`w-full border-2 rounded-xl p-3 text-left text-xs font-semibold ${sahmMode === opt.value ? 'border-[#f97316] bg-orange-50' : 'border-gray-200'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {sahmMode && (
            <div className="mt-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Default available time</label>
              <div className="flex gap-2">
                {[15,30,45,60].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSahmMinutes(m)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border ${sahmMinutes === m ? 'border-[#f97316] bg-[#f97316] text-white' : 'border-gray-200 text-gray-600'}`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mission progress slider */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">
            Update Mission Progress
          </label>
          <MissionProgressSlider onSave={handleMissionProgress} />
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-wide ${saved ? 'bg-green-600 text-white' : 'bg-black text-white'} disabled:opacity-50`}
        >
          {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div className="px-4 pt-4 pb-6">
        <button
          onClick={handleSignOut}
          className="w-full border border-gray-200 text-gray-400 font-bold py-3 rounded-xl text-sm"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

function MissionProgressSlider({ onSave }: { onSave: (pct: number) => void }) {
  const [pct, setPct] = useState(0)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    await onSave(pct)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={100}
          value={pct}
          onChange={e => setPct(Number(e.target.value))}
          className="flex-1 accent-[#f97316]"
        />
        <span className="text-sm font-black w-10 text-right">{pct}%</span>
      </div>
      <button
        type="button"
        onClick={handleSave}
        className={`mt-2 text-xs font-bold px-3 py-1.5 rounded-lg ${saved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
      >
        {saved ? '✓ Updated' : 'Update progress'}
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/api/streak/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase.from('streaks').select('*').eq('user_id', user.id).single()
  return NextResponse.json(data ?? null)
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/profile/ app/api/streak/ app/(app)/settings/
git commit -m "feat: add settings page with SAHM toggle, name edit, mission progress slider, and sign out"
```

---

## Phase 8 — Resend Email + Final Polish

### Task 21: Weekly review email via Resend

**Files:**
- Create: `lib/resend/client.ts`
- Create: `lib/resend/templates.ts`
- Modify: `app/api/cron/weekly-review/route.ts`

- [ ] **Step 1: Create `lib/resend/client.ts`**

```typescript
import { Resend } from 'resend'
export const resend = new Resend(process.env.RESEND_API_KEY!)
```

- [ ] **Step 2: Create `lib/resend/templates.ts`**

```typescript
export function weeklyReviewEmailHtml(opts: {
  name: string
  missionTitle: string
  weekStart: string
  weekEnd: string
  focusScore: number
  completionScore: number
  revenue: number
  tasksCompleted: number
  coaching: string
  wins: string[]
  failures: string[]
}): string {
  const { name, missionTitle, weekStart, weekEnd, focusScore, completionScore, revenue, tasksCompleted, coaching, wins, failures } = opts
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; background: #fff; color: #111; margin: 0; padding: 0; }
  .header { background: #000; padding: 24px; border-bottom: 4px solid #f97316; }
  .brand { color: #f97316; font-size: 20px; font-weight: 900; }
  .brand span { color: #fff; }
  .container { max-width: 520px; margin: 0 auto; }
  .section { padding: 20px 24px; }
  .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 0 24px 20px; }
  .stat { background: #f9f9f9; border-radius: 12px; padding: 12px; text-align: center; }
  .stat-val { font-size: 22px; font-weight: 900; }
  .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: .05em; color: #888; margin-top: 2px; }
  .coaching { background: #000; border-radius: 12px; padding: 16px; margin: 0 24px 16px; color: #ccc; font-size: 14px; line-height: 1.6; }
  .coaching-label { color: #f97316; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 8px; }
  .cta { text-align: center; padding: 16px 24px 32px; }
  .cta a { background: #f97316; color: #fff; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: .05em; padding: 12px 24px; border-radius: 12px; text-decoration: none; }
  ul { margin: 4px 0; padding-left: 16px; font-size: 14px; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <div class="brand">Focus<span>Forge</span></div>
    <div style="color:#888;font-size:12px;margin-top:4px">Week of ${weekStart} – ${weekEnd}</div>
  </div>
  <div class="section">
    <div style="font-size:18px;font-weight:900">Hey ${name} 👊</div>
    <div style="color:#555;font-size:13px;margin-top:4px">Mission: <strong>${missionTitle}</strong></div>
  </div>
  <div class="stats">
    <div class="stat"><div class="stat-val" style="color:#f97316">${focusScore}%</div><div class="stat-label">Focus Score</div></div>
    <div class="stat"><div class="stat-val" style="color:#3b82f6">${completionScore}%</div><div class="stat-label">Task Rate</div></div>
    <div class="stat"><div class="stat-val" style="color:#16a34a">$${revenue.toFixed(0)}</div><div class="stat-label">Revenue</div></div>
    <div class="stat"><div class="stat-val">${tasksCompleted}</div><div class="stat-label">Tasks Done</div></div>
  </div>
  <div class="coaching">
    <div class="coaching-label">⚡ Chief of Staff</div>
    ${coaching}
  </div>
  ${wins.length > 0 ? `<div class="section"><strong style="color:#16a34a">Wins ✓</strong><ul>${wins.map(w => `<li>${w}</li>`).join('')}</ul></div>` : ''}
  ${failures.length > 0 ? `<div class="section"><strong style="color:#dc2626">Misses</strong><ul>${failures.map(f => `<li>${f}</li>`).join('')}</ul></div>` : ''}
  <div class="cta"><a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://localhost:3000'}/app">Open FocusForge →</a></div>
</div>
</body>
</html>`
}
```

- [ ] **Step 3: Modify `app/api/cron/weekly-review/route.ts` — send emails**

Replace the file with:

```typescript
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resend } from '@/lib/resend/client'
import { weeklyReviewEmailHtml } from '@/lib/resend/templates'

interface ReviewResult {
  review: {
    focus_score: number
    completion_score: number
    revenue_generated: number
    tasks_completed: number
    ai_coaching: string
    week_start: string
    week_end: string
  }
  wins: string[]
  failures: string[]
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('onboarded', true)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://localhost:3000'

  const results = await Promise.allSettled(
    (profiles ?? []).map(async (p: { id: string; full_name: string | null }) => {
      try {
        // Get user's email from auth
        const { data: { user } } = await supabase.auth.admin.getUserById(p.id)
        if (!user?.email) return { userId: p.id, status: 'no-email' }

        // Generate review
        const reviewRes = await fetch(`${baseUrl}/api/review/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-cron-user-id': p.id },
        })
        if (!reviewRes.ok) return { userId: p.id, status: 'review-failed' }

        const data: ReviewResult = await reviewRes.json()
        const { data: mission } = await supabase
          .from('missions').select('title').eq('user_id', p.id).eq('status', 'active').single()

        await resend.emails.send({
          from: 'FocusForge AI <noreply@focusforge.ai>',
          to: user.email,
          subject: `Your week in review — ${data.review.week_start}`,
          html: weeklyReviewEmailHtml({
            name:             p.full_name ?? 'there',
            missionTitle:     mission?.title ?? 'Your mission',
            weekStart:        data.review.week_start,
            weekEnd:          data.review.week_end,
            focusScore:       data.review.focus_score,
            completionScore:  data.review.completion_score,
            revenue:          data.review.revenue_generated,
            tasksCompleted:   data.review.tasks_completed,
            coaching:         data.review.ai_coaching,
            wins:             data.wins,
            failures:         data.failures,
          }),
        })
        return { userId: p.id, status: 'sent' }
      } catch (e) {
        return { userId: p.id, status: 'error', error: String(e) }
      }
    })
  )

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  return NextResponse.json({ processed: profiles?.length ?? 0, succeeded })
}
```

- [ ] **Step 4: Add `NEXT_PUBLIC_APP_URL` to `.env.local`**

```bash
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

- [ ] **Step 5: Commit**

```bash
git add lib/resend/ app/api/cron/
git commit -m "feat: add weekly review email via Resend with HTML template"
```

---

### Task 22: Final polish — loading states, empty states, type-check pass

**Files:**
- Modify: various pages for edge cases

- [ ] **Step 1: Verify full type-check passes**

```bash
npm run type-check
```
Fix any type errors before continuing.

- [ ] **Step 2: Run the full test suite**

```bash
npm test
```
Expected: all tests pass.

- [ ] **Step 3: Manual smoke test checklist**

Test each flow in the browser:
- [ ] Sign up → onboarding → creates profile + mission + streak row
- [ ] Daily check-in → Claude generates tasks → tasks appear on dashboard
- [ ] Complete a task → status updates on dashboard
- [ ] Add idea → AI scores it → appears in Idea Jail with correct status badge
- [ ] Attempt to add new mission within 14 days → anti-shiny intercept fires
- [ ] Chat with Chief of Staff → streaming response renders
- [ ] Log revenue → appears on revenue page + dashboard total updates
- [ ] Generate weekly review → stats render + coaching block shows
- [ ] Settings: toggle SAHM mode → saved → TopNav badge appears
- [ ] Sign out → redirected to login

- [ ] **Step 4: Add `.env.example` to repo root**

```bash
# .env.example
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
CRON_SECRET=
NEXT_PUBLIC_APP_URL=
```

- [ ] **Step 5: Final commit**

```bash
git add .env.example
git commit -m "chore: add .env.example and final polish"
```

---

### Task 23: Deploy to Vercel

- [ ] **Step 1: Push to GitHub**

```bash
git remote add origin https://github.com/YOUR_USERNAME/focusforge-ai.git
git push -u origin master
```

- [ ] **Step 2: Create Vercel project**

1. Go to vercel.com → New Project
2. Import the `focusforge-ai` repository
3. Add all environment variables from `.env.local`
4. Click Deploy

- [ ] **Step 3: Verify cron job registered**

After deploy:
- Vercel dashboard → Project → Settings → Cron Jobs
- Confirm `GET /api/cron/weekly-review` appears with `0 9 * * 0` schedule

- [ ] **Step 4: Final smoke test on production URL**

Run through the same checklist as Task 22 Step 3, but on the live Vercel URL.

- [ ] **Step 5: Tag release**

```bash
git tag v1.0.0-beta
git push origin v1.0.0-beta
```

---

## Self-Review

### Spec Coverage Check

| Spec Feature | Tasks |
|---|---|
| Mission management (create, complete, abandon) | Tasks 10, 15 |
| Daily check-in + AI task generation | Tasks 12, 13 |
| Task completion tracking | Task 13 |
| Idea Jail with AI scoring | Tasks 14, 15 |
| Anti-shiny object protocol | Task 15 |
| SAHM Mode | Tasks 2, 12, 20 |
| AI Chat (streaming) | Task 16 |
| Revenue tracking | Task 17 |
| Weekly review with Claude | Task 18 |
| Weekly email (Resend) | Task 21 |
| Streak tracking | Tasks 12, 20 |
| Auth (login/signup/reset) | Tasks 7, 8 |
| Onboarding (3-step) | Task 10 |
| Mission archive + detail | Task 19 |
| Settings page | Task 20 |
| DB migrations with RLS | Task 4 |
| Vercel deploy + cron | Tasks 18, 23 |

All 8 v1 features covered. ✓

### Type Consistency Check

- `Mission`, `Task`, `Idea`, `Profile`, `ChatMessage`, `WeeklyReview`, `Streak`, `RevenueEntry` — all defined in `types/index.ts` (Task 2) and used consistently throughout.
- `TaskOutput`, `IdeaScore`, `WeeklyReviewOutput` — zod inferred types from `lib/anthropic/schemas.ts` (Task 9).
- `createClient()` — used as `await createClient()` in server components and `createClient()` (sync) in client components. Both exported from distinct files (`lib/supabase/server.ts` vs `lib/supabase/client.ts`).
- `anthropic.messages.stream()` — called in Task 16 chat route. `anthropic.messages.create()` called in Tasks 12, 14, 18. Both valid on the SDK.

### Placeholder Scan

No TBD, TODO, or "fill in later" items found. Every step has complete code. ✓

---

**Plan complete and saved to `focusforge-ai/docs/superpowers/plans/2026-06-13-focusforge-ai.md`.**

**Two execution options:**

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration with `superpowers:subagent-driven-development`

**2. Inline Execution** — execute tasks in this session using `superpowers:executing-plans`, batch with checkpoints

**Which approach?**
