# Owner Booking API (Phase 2 contract)

Public player booking endpoints are **not implemented in Phase 1**. Owner operations use the same `create-booking` core with `source: manual`.

## Planned player endpoints

| Function | Method | Purpose |
|----------|--------|---------|
| `player-list-venues` | POST | List active facilities by city |
| `player-available-slots` | POST | Available slots for court + date |
| `player-create-booking` | POST | Self-serve booking (`source: player_app`) |

## create-booking (current)

**Auth:** Bearer JWT (owner account)

**Body:**

```json
{
  "courtId": "uuid",
  "startAt": "2026-07-20T13:00:00.000Z",
  "endAt": "2026-07-20T14:00:00.000Z",
  "customerId": "uuid (optional)",
  "customerName": "string (if no customerId)",
  "customerPhone": "string",
  "customerEmail": "string",
  "amountPkr": 4000,
  "notes": "string",
  "source": "manual | api | player_app"
}
```

**Response:**

```json
{
  "booking": { "id": "...", "status": "pending_payment", ... }
}
```

**Errors:** `409` slot conflict (overlap constraint)

## update-booking

**Body:** `{ "bookingId": "uuid", "action": "confirm|check_in|complete|cancel|no_show" }`

## mark-booking-paid

**Body:** `{ "bookingId": "uuid", "paymentType": "deposit|paid|refund" }`

## get-owner-analytics

**Body:** `{ "facilityId": "uuid", "startDate": "ISO", "endDate": "ISO" }`

**Response:** `revenue`, `utilizationPercent`, `bookingCount`, `busiestDays`, `busiestHours`, `topSports`, `inactiveCustomers`
