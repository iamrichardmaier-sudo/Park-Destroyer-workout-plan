# Park-Destroyer-workout-plan

A single-page workout app with a training dashboard, streak calendar, and six
sessions (Park Destroyer, Recovery Pump, No Excuses, Arm Destroyer, The Blitz,
Gym Destroyer).

## The shareable link

The app is served from `index.html` at the repository root, so GitHub Pages
publishes it at:

```
https://iamrichardmaier-sudo.github.io/Park-Destroyer-workout-plan/
```

To switch Pages on: **Settings → Pages → Source: Deploy from a branch →
branch `main`, folder `/ (root)` → Save.**

`park-workout.html` is the original filename kept as an identical copy so older
links keep working. Edit `index.html` and copy it across, or drop the old file
once nobody is using that link.

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

5. Copy `index.html` over `park-workout.html` and push.

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
