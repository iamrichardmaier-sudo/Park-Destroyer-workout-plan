-- ═══════════════════════════════════════════════════════════
--  PARK DESTROYER — Supabase schema
--  Run this once in your project's SQL Editor.
-- ═══════════════════════════════════════════════════════════

create table if not exists public.workout_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,

  -- Stable id generated on the device. Lets the same session be pushed
  -- more than once (retry, multi-tab, back-online sync) without duplicating.
  client_id        uuid not null,

  session_type     text not null
                     check (session_type in ('am','pm','bw','daily','arms','gym')),
  duration_seconds integer not null default 0 check (duration_seconds >= 0),

  -- The calendar day as it looked on the user's own clock. Streaks are a
  -- human, local-timezone concept, so the date is resolved on the client
  -- and stored verbatim rather than derived from completed_at in UTC.
  local_date       date not null,

  completed_at     timestamptz not null default now(),
  created_at       timestamptz not null default now(),

  unique (user_id, client_id)
);

-- Streak/calendar reads are always "this user, newest days first".
create index if not exists workout_sessions_user_date_idx
  on public.workout_sessions (user_id, local_date desc);

-- ── Row level security ──
-- Every row is private to the user that created it. The anon key shipped in
-- the page can therefore be public: without a session it reads nothing.
alter table public.workout_sessions enable row level security;

drop policy if exists "own sessions readable" on public.workout_sessions;
create policy "own sessions readable"
  on public.workout_sessions for select
  using (auth.uid() = user_id);

drop policy if exists "own sessions insertable" on public.workout_sessions;
create policy "own sessions insertable"
  on public.workout_sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists "own sessions updatable" on public.workout_sessions;
create policy "own sessions updatable"
  on public.workout_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own sessions deletable" on public.workout_sessions;
create policy "own sessions deletable"
  on public.workout_sessions for delete
  using (auth.uid() = user_id);
