-- ═══════════════════════════════════════════════════════════
--  001 — allow the 'abs' (Core Shredder) session type
--
--  Only needed if you already ran schema.sql before the Core
--  Shredder existed. Fresh installs get this from schema.sql.
--  Safe to run more than once.
-- ═══════════════════════════════════════════════════════════

alter table public.workout_sessions
  drop constraint if exists workout_sessions_session_type_check;

alter table public.workout_sessions
  add constraint workout_sessions_session_type_check
  check (session_type in ('am','pm','bw','daily','arms','gym','abs'));
