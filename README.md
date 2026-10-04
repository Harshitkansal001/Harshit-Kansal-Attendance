# Harshit Kansal — NIT Self Attendance

A personal, offline-first attendance tracker for NIT Hamirpur. Built and maintained for Harshit Kansal.

## Features

- One-tap Present / Absent with Undo
- Asia/Kolkata live clock, current class and countdown
- Daily and weekly timetable editing
- Subject-wise attendance, target warnings and streaks
- Leave, holiday, cancellation, reschedule and exam calendar support
- Offline-first local storage with optional Supabase account sync
- JSON/CSV export and import
- Installable offline PWA
- Light/dark mode and Android-friendly touch targets

## Run locally

```sh
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Supabase cloud sync

The app continues to work offline and keeps a local copy. To enable account sign-in and sync:

1. Create a Supabase project.
2. Run [`supabase/migrations/20261004000000_user_app_state.sql`](supabase/migrations/20261004000000_user_app_state.sql) in the Supabase SQL Editor. It creates a per-user JSON state table with row-level security.
3. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the project's API settings. The anon/publishable key is safe for browser use; never put a service-role key in this app.
4. Restart `npm run dev`, then open Settings → Cloud backup to create an account or sign in.

On first sign-in, the app uploads the current device's data if the account has no saved state. If the account already has data, that cloud state becomes this device's active state. Changes then sync automatically; local storage remains available offline.

For production, configure the app's deployed URL under Supabase Authentication → URL Configuration, and choose the email confirmation policy under Authentication → Providers → Email.

## Build

```sh
npm run build
```
