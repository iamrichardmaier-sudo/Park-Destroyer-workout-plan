# Park-Destroyer-workout-plan

A single-page workout app with a training dashboard, streak calendar, and seven
sessions (Park Destroyer, Recovery Pump, No Excuses, Arm Destroyer, The Blitz,
Core Shredder, Gym Destroyer).

## The shareable link

Everything is served from `index.html` at the repository root — a single static
file with no build step, so any static host works. The site is deployed on
Netlify, which picks up `index.html` automatically and redeploys on every push
to `main`. GitHub Pages works too if you ever want a fallback
(**Settings → Pages → branch `main`, folder `/ (root)`**).

`park-workout.html` is the original filename kept as an identical copy so older
links keep working. Edit `index.html` and copy it across, or drop the old file
once nobody is using that link.

## Widgets

### iOS home screen (Scriptable)

`park-destroyer.scriptable.js` renders the full Park Destroyer session as a
**Large** Scriptable widget: 5 phases, 8 blocks, 22 exercises with sets and rep
qualifiers, in two columns.

1. Scriptable → **+** → paste the file in → name it *Park Destroyer*.
2. Home screen → long press → **+** → Scriptable → **Large**.
3. Long press the placed widget → *Edit Widget* → *Script* → pick it.

iOS widgets can't scroll and clip silently when content overruns, so the script
sizes itself: it looks up the large-widget box for the device, derives a fit
factor against a reference layout, and scales every font and gap by it — with a
safety margin, since real text metrics vary by font and iOS version. Type lands
around 6.7pt on an iPhone SE and 13.6pt on a 12.9" iPad, always fitting.

Tapping the widget opens the live app. Set `SITE_URL` at the top of the file to
your deployed URL — until you do, the widget deliberately stays inert rather
than launching a dead page.

Other knobs at the top: `SHOW_NOTES` (form cues, off by default — they roughly
double the line count), `TUNE` (overall density), `COL_WIDTH` (override if the
device lookup guesses wrong).

### Embeddable web page

`widget.html` is a standalone, read-only view of the full **Park Destroyer**
(red / AM) session — all 5 phases, 8 blocks and 22 exercises with sets, reps
and form cues on a single screen. It's for embedding somewhere you want the
whole workout visible at a glance, and is served alongside the app:

```
https://<your-site>/widget.html
```

It has no dependencies and no app state — nothing to configure, nothing to
sign into. Because an embed can be given more or less any dimensions, it
doesn't guess breakpoints: it binary-searches the largest scale whose laid-out
height still clears the viewport, deriving column count (1–4) from the width
each candidate scale implies. Text reflows before it shrinks, and the whole
session stays on screen at any size.

The `NOTES` button in the corner hides the form cues, which are the bulk of the
text — worth it on a small embed. The choice is remembered per browser.

The content is generated from the app's own markup rather than retyped, so the
two can't drift apart in wording. Re-generate it if you edit the AM session.

## The game

The app is built around a completion loop: finish a session → earn XP → level
up → unlock trophies → protect your streak.

**XP and levels.** Every banked session pays out `minutes × 2` plus a bonus for
how hard the session is (Gym 60, Park Destroyer 40, Arms 30, No Excuses 25,
Recovery 20, Core Shredder 20, Blitz 15). Each level costs 28% more than the last, and rank
titles climb Rookie → Grinder → Warrior → Beast → Savage → Destroyer → Legend →
Immortal.

XP is *derived* from the sessions already stored rather than saved as its own
number, so it recomputes identically on any device and can never drift out of
sync with your actual history.

**Trophies.** 14 unlockables covering firsts, streaks, volume, variety and
timing (All Rounder now wants all seven sessions). Locked ones still show their name so you know what to chase — tap any
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
- **The Blitz** and **Core Shredder** — log themselves automatically when the
  circuit runs to the end.

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
| `session_type` | one of `am`, `pm`, `bw`, `daily`, `arms`, `gym`, `abs` |
