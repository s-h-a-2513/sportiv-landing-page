# Sportiv For Owners — App Context

> **Product:** Sportiv For Owners — court booking management for facility owners  
> **Package:** `com.sportiv.owners`  
> **Backend:** Shared Supabase project with player app  
> **Workspace:** `c:\Spinder\owner_app`

## Product summary

Sportiv For Owners helps Pakistani sports facilities manage incoming bookings, customers, pricing, and revenue analytics. Phase 1 focuses on owner-operated workflows with manual payment confirmation; player self-service booking ships in Phase 2.

### Core capabilities (Phase 1)

1. **Facility onboarding** — create venue, first court, default peak/off-peak pricing
2. **Booking management** — manual create, calendar view, check-in, no-show, cancel
3. **Payment tracking** — mark deposit or full payment (bank transfer / manual)
4. **Dynamic pricing** — peak/off-peak rules per court by day and time
5. **Customer CRM** — contact list, inactive 30-day filter, waiver uploads
6. **Analytics** — revenue, utilization, busiest hours/sports
7. **Reminders** — scheduled edge function (24h + 2h before slot)

## Architecture

```
owner_app/lib/main.dart
  → Supabase.initialize
  → SportivOwnersApp
  → OwnerAuthGate
       ├─ no session → AuthScreen
       ├─ no facility → FacilityOnboardingScreen → owner-onboard
       └─ facility → OwnerHomeShell (5 tabs)
```

### Backend tables

| Table | Purpose |
|-------|---------|
| `facilities` | Venue owned by `profiles.id` |
| `courts` | Courts per facility |
| `pricing_rules` | Peak/off-peak rates |
| `bookings` | Slots with overlap exclusion constraint |
| `facility_customers` | CRM records |
| `customer_waivers` | Waiver metadata + Storage path |
| `availability_blocks` | Maintenance / blocked slots |

### Edge functions

| Function | Purpose |
|----------|---------|
| `owner-onboard` | Create facility + court + default pricing |
| `create-booking` | Atomic booking with price calculation |
| `update-booking` | Status transitions |
| `mark-booking-paid` | Manual payment confirmation |
| `get-owner-analytics` | Dashboard aggregates |
| `send-booking-reminders` | Cron: 24h / 2h reminders |

## Booking lifecycle

```
pending_payment → (mark paid) → confirmed → check_in → completed
                              ↘ cancel / no_show
```

No-show protection (MVP): facility `deposit_percent` setting; booking stays `pending_payment` until owner marks `deposit_paid` or `paid`.

## Run locally

```powershell
cd owner_app
flutter run --dart-define=SUPABASE_URL=https://xxx.supabase.co `
  --dart-define=SUPABASE_ANON_KEY=eyJ...
```

## Project structure

```
owner_app/lib/
├── main.dart, app.dart
├── app/                    # auth gate, home shell
├── core/                   # config, theme, api service, constants
└── features/
    ├── auth/
    ├── onboarding/
    ├── dashboard/
    ├── calendar/
    ├── bookings/
    ├── courts/
    ├── pricing/
    ├── customers/
    ├── analytics/
    ├── facilities/
    └── settings/
```

## Phase 2 (not in owner app yet)

- Player app "Book Courts" tab
- JazzCash / Easypaisa payment gateway
- SMS reminders
- Targeted discount campaigns

See [OWNER_BOOKING_API.md](./OWNER_BOOKING_API.md) for the public booking API contract.
