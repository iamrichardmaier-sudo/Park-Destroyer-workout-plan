# Park-Destroyer-workout-plan

A single-page workout app with a training dashboard, streak calendar, and six
sessions (Park Destroyer, Recovery Pump, No Excuses, Arm Destroyer, The Blitz,
Gym Destroyer).

## The shareable link

Everything is served from `index.html` at the repository root — a single static
file with no build step, so any static host works. The site is deployed on
Netlify, which picks up `index.html` automatically and redeploys on every push
to `main`. GitHub Pages works too if you ever want a fallback
(**Settings → Pages → branch `main`, folder `/ (root)`**).

`park-workout.html` is the original filename kept as an identical copy so older
links keep working. Edit `index.html` and copy it across, or drop the old file
once nobody is using that link.

## The game

The app is built around a completion loop: finish a session → earn XP → level
up → unlock trophies → protect your streak.

**XP and levels.** Every banked session pays out `minutes × 2` plus a bonus for
how hard the session is (Gym 60, Park Destroyer 40, Arms 30, No Excuses 25,
Recovery 20, Blitz 15). Each level costs 28% more than the last, and rank
titles climb Rookie → Grinder → Warrior → Beast → Savage → Destroyer → Legend →
Immortal.

XP is *derived* from the sessions already stored rather than saved as its own
number, so it recomputes identically on any device and can never drift out of
sync with your actual history.

**Trophies.** 14 unlockables covering firsts, streaks, volume, variety and
timing. Locked ones still show their name so you know what to chase — tap any
trophy to see how it's earned. Each one celebrates exactly once: the app
remembers which have been shown, so history syncing in from another device
backfills quietly instead of replaying twenty popups.

**Daily mission.** One rotating goal per day, chosen from the date so it's
stable all day and changes tomorrow.

**In-workout.** A progress bar tracks blocks ticked off, the DONE button starts
pulsing once everything is checked, and finishing every block earns the
Perfectionist trophy. Ticking a block pops a `+XP` and a haptic buzz on phones
that support it. Completing a session fires confetti and a summary card.

The workout content itself — every exercise, set, rep and note — is unchanged.

## Tracking and streaks

Finishing a session banks it:

- Any timed session — hit **✔ DONE** in the timer bar (needs at least 30s on the
  clock, so a stray tap doesn't log a workout).
- **The Blitz** — logs itself automatically when the circuit runs to the end.

The homepage dashboard then shows the current and best day streak, total
sessions, total time trained, and a month calendar where each day is shaded by
how many sessions it holds. Cells with training are hoverable (tappable on
mobile) for a breakdown of that day.

A streak counts *calendar days on the user's own clock*. Missing today doesn't
break the streak until the day is actually over.

## Backend setup (optional)

**The app works with no backend.** History is written to `localStorage`, so it
is instant, works offline, and survives reloads on that device. Supabase adds
durable storage on top of that. Without it, clearing browser data clears
history, and history doesn't follow the user to another device.

To turn it on:

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste in [`supabase/schema.sql`](supabase/schema.sql),
   and run it. This creates the `workout_sessions` table with row level
   security so each user can only ever read and write their own rows.
3. Enable **Authentication → Sign In / Providers → Anonymous sign-ins**. The app
   creates an anonymous account per device, so there is no signup step — the
   link stays one tap to open.
4. Copy **Project URL** and the **anon public** key from **Settings → API** into
   the config block near the bottom of `index.html`:

   ```js
   window.PD_CONFIG = {
     SUPABASE_URL: 'https://YOUR-PROJECT.supabase.co',
     SUPABASE_ANON_KEY: 'YOUR-ANON-KEY'
   };
   ```

   Both values are meant to be public. Row level security is what protects the
   data, not the secrecy of the anon key — never put the `service_role` key here.

5. Copy `index.html` over `park-workout.html` and push. Netlify redeploys on
   its own.

Trophy progress and the per-session block checklist live in `localStorage`
only — they're cosmetic state rebuilt from your session history, so they don't
need a table of their own.

A dot under the header reports the current state: green "Synced to your
account", yellow "Saved on this device", or red if the cloud is unreachable.
Sessions logged while offline keep an unsynced flag and upload on the next
successful connection, so nothing is lost either way.

### Data model

`workout_sessions` — one row per completed session.

| column | why |
|---|---|
| `client_id` | generated on the device; unique per user so a retried upload can't duplicate a session |
| `local_date` | the day as it looked on the user's clock, since streaks are a local-timezone idea |
| `duration_seconds` | drives the "trained" total |
| `session_type` | one of `am`, `pm`, `bw`, `daily`, `arms`, `gym` |
