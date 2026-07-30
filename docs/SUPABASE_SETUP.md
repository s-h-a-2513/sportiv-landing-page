# Sportiv — Supabase setup

Sportiv uses **Supabase** for auth, Postgres (with RLS), Edge Functions, Storage, and Realtime. Push notifications use **OneSignal**.

## 1. Create project

1. Create a project at [supabase.com](https://supabase.com) (e.g. `sportiv-prod`).
2. Note **Project URL** and **anon public** key (Settings → API).
3. Note **service_role** key (Edge Functions / server only — never ship in the app).

## 2. Apply schema

From this repo root (with [Supabase CLI](https://supabase.com/docs/guides/cli) installed):

```powershell
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Or paste migrations from `supabase/migrations/` into the SQL editor and run them in order:

1. `20250625000000_initial_schema.sql`
2. `20250701000000_performance_and_rate_limits.sql`
3. `20250720000000_owner_booking_schema.sql` — **Sportiv For Owners** (facilities, courts, bookings)

## 3. Deploy Edge Functions

```powershell
supabase functions deploy get-deck-page
supabase functions deploy record-like
supabase functions deploy record-pass
supabase functions deploy send-message
supabase functions deploy save-push-token
supabase functions deploy delete-account
supabase functions deploy admin-flagged-users
supabase functions deploy webhook-notify
supabase functions deploy owner-onboard
supabase functions deploy create-booking
supabase functions deploy update-booking
supabase functions deploy mark-booking-paid
supabase functions deploy get-owner-analytics
supabase functions deploy send-booking-reminders
```

Set secrets (Dashboard → Edge Functions → Secrets or CLI):

| Secret | Purpose |
|--------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-injected on hosted Supabase |
| `SUPABASE_ANON_KEY` | JWT validation in functions |
| `ONESIGNAL_APP_ID` | Push app id |
| `ONESIGNAL_REST_API_KEY` | Push REST API |
| `WEBHOOK_SECRET` | Optional bearer for `webhook-notify` |
| `CRON_SECRET` | Bearer for `send-booking-reminders` scheduled invocations |

## 4. Database webhooks (push triggers)

In Supabase Dashboard → Database → Webhooks, create HTTP webhooks to `webhook-notify`:

| Table | Events |
|-------|--------|
| `matches` | INSERT |
| `messages` | INSERT |
| `match_proposals` | UPDATE |

Use `Authorization: Bearer YOUR_WEBHOOK_SECRET` if you set `WEBHOOK_SECRET`.

## 5. OneSignal

1. Create Android apps:
   - **Players:** package `com.sportiv.app`
   - **Owners:** package `com.sportiv.owners`
2. Configure FCM credentials in OneSignal (or use their wizard).
3. Use notification channel id `sportiv_default` (matches player `MainActivity.kt`).

## 5b. Booking reminders (owners)

Schedule `send-booking-reminders` via Supabase Dashboard → Edge Functions → Schedules (hourly recommended), or use pg_cron HTTP POST with:

```
Authorization: Bearer YOUR_CRON_SECRET
```

## 5c. Storage buckets

| Bucket | Purpose |
|--------|---------|
| `user_photos` | Player profile photos |
| `facility_waivers` | Owner-uploaded customer waivers |

## 6. Seed admin (optional)

```sql
UPDATE public.profiles SET is_admin = TRUE WHERE id = 'YOUR_USER_UUID';
```

## 7. Flutter build — player app

Pass Supabase (and optional OneSignal / Sentry) via dart-define:

```powershell
flutter run --dart-define=SUPABASE_URL=https://xxx.supabase.co `
  --dart-define=SUPABASE_ANON_KEY=eyJ... `
  --dart-define=ONESIGNAL_APP_ID=your-app-id
```

Release build:

```powershell
$env:SUPABASE_URL = "https://xxx.supabase.co"
$env:SUPABASE_ANON_KEY = "eyJ..."
.\scripts\build_android_release.ps1
```

## 7b. Flutter build — owner app

```powershell
cd owner_app
flutter run --dart-define=SUPABASE_URL=https://xxx.supabase.co `
  --dart-define=SUPABASE_ANON_KEY=eyJ...
```

See [OWNER_APP_CONTEXT.md](./OWNER_APP_CONTEXT.md) for owner app details.

## 8. Auth email

Enable Email provider in Supabase Auth settings. Configure SMTP for production password reset / verification emails.

## 9. Observability

- Edge Functions emit structured JSON logs (`event`, `request_id`, `user_id`, `metric`).
- Flutter client uses `AppLogger` + Sentry (optional `--dart-define=SENTRY_DSN=...`).
- Key metrics: `deck.build.duration_ms`, `api.edge.duration_ms`, `deck.empty_page`, `match.created`.

## Fresh start

This migration does **not** import data from the legacy Firebase project `khiladi-1400b`. Users sign up again on Supabase.
