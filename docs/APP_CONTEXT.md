# Sportiv — App Context & Technical Overview

> **Product:** Sportiv — a Pakistan-focused sports-matching app for finding 2-player game partners  
> **Package:** `com.sportiv.app`  
> **Backend:** Supabase (Postgres + RLS + Edge Functions + Storage) — project `lhdmtyzkbeqldmztcjyl`  
> **Current version:** `1.0.0+4`  
> **Workspace:** `c:\Spinder`  
> **Platform:** Flutter (Android primary)

**Note:** Legacy sections below may still mention Firebase from the pre-Supabase migration. For current backend details see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) and [DOCKER.md](./DOCKER.md).

This document explains what the app is, what has been built, how the pieces fit together, and how data flows through the system. Use it as onboarding context for redesign, new features, or handoff.

**Related doc:** [UI_AUDIT.md](./UI_AUDIT.md) — screen-by-screen UI inventory.

---

## Table of contents

1. [Product summary](#product-summary)
2. [What has been built](#what-has-been-built)
3. [Tech stack](#tech-stack)
4. [Architecture](#architecture)
5. [User journeys](#user-journeys)
6. [Firestore data model](#firestore-data-model)
7. [Core feature logic](#core-feature-logic)
8. [Firebase backend](#firebase-backend)
9. [Security model](#security-model)
10. [Performance & cost optimizations](#performance--cost-optimizations)
11. [Test mode](#test-mode)
12. [Build & deployment](#build--deployment)
13. [Project structure](#project-structure)
14. [Known limitations & pending work](#known-limitations--pending-work)

---

## Product summary

Sportiv is a **Tinder-style discovery app for sports**, not dating. Users in Pakistani cities swipe through nearby players who share at least one sport, match on mutual likes, then chat and propose real-world games at local venues.

### Target users

- Recreational players in **Karachi, Lahore, Islamabad, Rawalpindi**
- Sports supported: **Padel, Tennis, Squash, Snooker, Chess**
- 2-player matching only (no team sports)

### Core value proposition

1. **Discover** compatible players by sport, skill, distance, and city
2. **Match** when both users like each other
3. **Chat** only with matches (safety gate)
4. **Propose** a venue, date, and time for an actual game
5. **Safety tools** — report, block, admin moderation, community guidelines

### Privacy features

- **Women-only visibility** — female users can hide their profile from male discoverers
- **Block** — removes users from deck and prevents interaction
- **Report** — harassment/no-show reports can auto-flag users for admin review

---

## What has been built

### Client app (Flutter)

| Area | Status | Description |
|------|--------|-------------|
| Email auth | ✅ Done | Sign up, sign in, forgot password, email verification banner |
| Onboarding (4 steps) | ✅ Done | Profile, sports/skills, privacy & club |
| Discover deck | ✅ Done | Swipe cards, filters, pagination, location fallback |
| Matches list | ✅ Done | Real-time mutual matches with denormalized profiles |
| Chat | ✅ Done | Messages, pagination, match proposals (accept/decline) |
| Profile | ✅ Done | View + edit profile, photo upload |
| Settings | ✅ Done | Blocked users, safety guidelines, sign out, delete account |
| Admin moderation | ✅ Done | Flagged user review, verify badge (admin custom claim) |
| Security hardening | ✅ Done | Callable Functions, App Check, hardened Firestore rules (v1.0.0+4) |
| Test mode | ✅ Done | In-memory dummy data for demos (admin claim only) |
| Push notifications (client) | ✅ Done | FCM token via `saveFcmToken` callable |
| Release builds | ✅ Done | Signed APK + AAB (`v1.0.0+4`) |

### Firebase backend

| Component | Status | Description |
|-----------|--------|-------------|
| Firestore rules | ✅ Deployed | Auth-gated reads/writes, match-gated chat |
| Firestore indexes | ✅ Deployed | City + updatedAt composite indexes |
| Storage rules | ⚠️ In repo | Profile photos at `user_photos/{uid}.jpg` — deploy after Storage enabled |
| Cloud Functions | ⚠️ In repo | Match/message/proposal notifications + auto-flag on reports — requires Blaze plan |
| FCM | ✅ Client ready | Token stored on user doc; functions send notifications |

### Tooling & docs

| Item | Location |
|------|----------|
| Firebase setup guide | `FIREBASE_SETUP.md` |
| Billing & deploy guide | `FIREBASE_BILLING.md` |
| UI inventory | `docs/UI_AUDIT.md` |
| Security audit | `docs/SECURITY_AUDIT.md` |
| Security deploy guide | `docs/SECURITY_DEPLOY.md` |
| Build script | `scripts/build_android_release.ps1` |
| Deploy script | `scripts/deploy_firebase.ps1` |
| Connect script | `scripts/connect_firebase.ps1` |

---

## Tech stack

### Flutter dependencies (`pubspec.yaml`)

| Package | Purpose |
|---------|---------|
| `firebase_core`, `firebase_auth` | Authentication |
| `cloud_firestore` | Database |
| `firebase_storage` | Profile photo uploads |
| `firebase_messaging` | Push notifications |
| `flutter_bloc` + `equatable` | State management (Cubits) |
| `flutter_card_swiper` | Discover swipe deck |
| `cached_network_image` | Network image caching |
| `image_picker` + `flutter_image_compress` | Photo pick + compress |
| `geolocator` | GPS for distance |
| `shared_preferences` | Test mode toggle persistence |
| `cloud_functions` | Rate-limited HTTPS callables (deck, likes, messages) |
| `firebase_app_check` | Play Integrity / debug attestation |

### Backend

- **Firebase Auth** — email/password only
- **Cloud Firestore** — all app data
- **Firebase Storage** — profile images (JPEG, max 5 MB)
- **Cloud Functions (Node 20)** — callables, triggers, notifications, moderation
- **FCM** — push to Android

### State management pattern

- **Global Cubits** (in `app.dart`): `OnboardingCubit`
- **Feature Cubits**: `DeckCubit` (scoped to Discover tab)
- **Repositories**: Firestore access layer per feature
- **Streams**: `StreamBuilder` for matches, chat messages, proposals
- **Navigation**: Imperative `Navigator.push` / `MaterialPageRoute` (no named routes)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        main.dart                            │
│  Firebase.init → AppCheck → FcmService.init → SportivApp │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│  app.dart — MaterialApp + MultiBlocProvider                 │
│  OnboardingCubit                                            │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│  auth_gate.dart                                             │
│  StreamBuilder(auth) → FutureBuilder(profile complete?)     │
└──────┬──────────────────────────────┬───────────────────────┘
       │ not signed in / incomplete    │ profile complete
       ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│ OnboardingFlow   │          │ HomeShell        │
│ 4 steps          │          │ Discover|Matches │
└──────────────────┘          └────────┬─────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              ▼                        ▼                        ▼
        DeckScreen              MatchesScreen           SettingsScreen
        DeckCubit               MatchesRepository       → Profile, Edit,
        DeckRepository          StreamBuilder           Blocked, Safety, Admin
              │
              ▼
        ChatScreen ← ChatRepository (match-gated)
```

### Layer responsibilities

| Layer | Role |
|-------|------|
| **Screens** | UI, user input, navigation |
| **Cubits** | UI state, orchestration (deck loading, swipes, filters) |
| **Repositories** | Firestore queries, business rules, test mode branching |
| **Services** | Cross-cutting: auth, FCM, App Check, Cloud Functions, location, image upload |
| **Models** | `UserProfile`, `PlayerCardModel`, `MatchEntry`, `ChatMessage`, `MatchProposal` |

---

## User journeys

### 1. First launch → onboarded

```
Launch app
  → AuthGate checks Firebase auth
  → Not signed in → Onboarding step 1 (email sign-up)
  → Step 2: name, age, city, gender, photo
  → Step 3: pick up to 3 sports + skill level each
  → Step 4: women-only toggle (female), club affiliation
  → Save profile to Firestore + capture GPS coordinates
  → Navigate to HomeShell (Discover tab)
```

If user signs in but profile is incomplete (e.g. app closed mid-onboarding), they resume at **step 2**.

### 2. Discover → match

```
User opens Discover tab
  → DeckCubit.loadDeck()
  → DeckRepository calls getDeckPage Cloud Function (server filters):
       - exclude: self, liked, passed, blocked, flagged
       - require: shared sport, within max distance
       - respect: women-only visibility rules
  → User swipes right (like) or left (pass)
  → recordLike / recordPass callable writes likes server-side
  → If mutual like → Function creates matches/{sortedUidPair}
  → Match dialog shown → optional navigate to Chat
```

### 3. Matches → chat → propose game

```
User opens Matches tab
  → StreamBuilder on matches where users array contains me
  → Tap match row → ChatScreen
  → Chat verifies mutual match exists
  → Messages stream (latest 50) + scroll-up pagination for older
  → "Propose Match" → pick venue, date, time
  → Other user sees pending banner → Accept or Decline
  → Accepted proposal shows as scheduled match banner
```

### 4. Safety flows

```
Report: ReportUserButton → bottom sheet → reason + details
  → reports/{reportedId}/items/{reporterId}
  → Cloud Function counts Harassment/No-Show reports
  → At 3+ reports → user flaggedForReview = true (admin-only field)

Block: BlockRepository → blocks/{uid}/blocked/{otherId}
  → User removed from deck via session cache
  → Chat block confirmation dialog

Admin: Settings → Admin moderation (admin email only)
  → List flagged users → Clear flag / Toggle verified badge
```

---

## Firestore data model

### `users/{userId}`

Profile document for each authenticated user.

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Display name |
| `age` | number | |
| `city` | string | Karachi, Lahore, Islamabad, Rawalpindi |
| `gender` | string | `male` or `female` |
| `sports` | array | `[{ sport, skillIndex }]` — skillIndex 0/1/2 |
| `womenOnlyVisibility` | boolean | Female only; forced false for males |
| `club` | string | Club affiliation or "None" |
| `photoUrl` | string? | Firebase Storage download URL |
| `latitude`, `longitude` | number? | GPS; fallback to city center |
| `email` | string? | From Firebase Auth |
| `emailVerified` | boolean | Synced from auth |
| `fcmToken` | string? | For push notifications |
| `updatedAt` | timestamp | Used for deck ordering |
| `verified` | boolean | **Admin-only** — trust badge |
| `flaggedForReview` | boolean | **Admin-only** — moderation flag |
| `flaggedReasonSummary` | string? | **Admin-only** |
| `flaggedAt` | timestamp? | **Admin-only** |

### `likes/{userId}/liked/{otherUserId}`

Records a right-swipe (like). Subcollection under the liker's UID.

### `likes/{userId}/passed/{otherUserId}`

Records a left-swipe (pass).

### `matches/{matchId}`

Mutual match document. **matchId** = `{lowerUid}_{higherUid}` (sorted pair).

| Field | Type | Notes |
|-------|------|-------|
| `users` | array | Exactly 2 UIDs |
| `createdAt` | timestamp | |
| `profiles` | map | Denormalized `{ uid: { name, photoUrl } }` for fast match list |

Matches are **immutable** after creation (no update/delete in rules).

### `chats/{chatId}`

Chat metadata. **chatId** = same as matchId (`uid1_uid2` sorted).

| Field | Type | Notes |
|-------|------|-------|
| `createdAt` | timestamp | |
| `proposalVenue` | string? | Match proposal fields |
| `proposalDate` | timestamp? | |
| `proposalTime` | string? | e.g. "6:30 PM" |
| `proposalBy` | string? | UID of proposer |
| `proposalStatus` | string? | `pending`, `accepted`, `declined` |
| `proposalCreatedAt` | timestamp? | |

### `chats/{chatId}/messages/{messageId}`

| Field | Type | Notes |
|-------|------|-------|
| `senderId` | string | Must equal auth UID on create |
| `text` | string | 1–2000 chars |
| `createdAt` | timestamp | |

Messages are **append-only** (no update/delete).

### `blocks/{userId}/blocked/{otherUserId}`

Block list per user.

### `reports/{reportedUserId}/items/{reporterId}`

One report per reporter/reported pair (upsert on re-report).

| Field | Type | Notes |
|-------|------|-------|
| `reportedUserId` | string | |
| `reporterId` | string | |
| `reason` | string | Harassment, No-Show, Inappropriate Content, Other |
| `details` | string? | |
| `createdAt`, `updatedAt` | timestamp | |

Reports are **admin-read-only** in security rules.

### Storage: `user_photos/{userId}.jpg`

JPEG profile photo, max 5 MB, owner-write / auth-read.

---

## Core feature logic

### Deck discovery (`DeckRepository`)

**Query strategy (cost-optimized):**

1. Server query: `users` where `city == myCity`, order by `updatedAt` desc, **limit 40**
2. Client-side filter: distance, shared sports, gender/privacy, flagged users, exclusions
3. Pagination: `startAfterDocument` for next page
4. Session cache: 15-minute TTL, exclude set (likes/passes/blocks) loaded once per session

**Distance calculation:**

- Uses GPS coordinates when available (Haversine via `geo_utils.dart`)
- Falls back to hardcoded city center coordinates per city
- If GPS denied/off, uses city center and shows a warning banner

**Women-only rules:**

- If I have `womenOnlyVisibility`, I only see female players
- If another user has `womenOnlyVisibility`, only females can see them

**Flagged users:**

- `flaggedForReview == true` filtered **client-side** (not server query)
- Reason: users cannot set privileged fields; server-side filter would exclude docs missing the field

### Matching (`DeckRepository.likeUser`)

1. Write `likes/{me}/liked/{them}`
2. Check if `likes/{them}/liked/{me}` exists
3. If yes → create `matches/{sortedPair}` with denormalized profiles
4. Cloud Function `onMatchCreated` sends FCM to both users

### Chat gating (`ChatRepository`)

- `areMatched(otherUserId)` checks `matches/{chatId}` exists
- All send/stream/propose operations require a match
- Firestore rules also enforce: chat participant + match document exists

### Profile sync (`onUserProfileUpdated` trigger)

When name or photo changes on `users/{uid}`, a Cloud Function batch-updates `profiles.{uid}` on all match docs — avoids client writes to immutable match docs.

### Image upload (`ImageUploadService`)

1. Pick from gallery → compress (`image_compression.dart`)
2. Upload to `user_photos/{uid}.jpg`
3. Store download URL in `users/{uid}.photoUrl`

---

## Firebase backend

### Cloud Functions (`functions/index.js`)

**Callables (rate-limited):**

| Function | Purpose |
|----------|---------|
| `getDeckPage` | Server-side discover query; returns sanitized card projection only |
| `recordLike` | Write like + create match if reciprocal |
| `recordPass` | Write pass |
| `sendMessage` | Validate match + block status; write message |
| `saveFcmToken` | Write FCM token (server-only field) |
| `deleteAccount` | Cascade delete user data + Auth account |
| `adminGetFlaggedUsers` | Admin-only flagged user list |

**Triggers:**

| Function | Trigger | Action |
|----------|---------|--------|
| `onLikeCreated` | New like doc | Backup reciprocal match creation |
| `onUserProfileUpdated` | User profile update | Sync denormalized match profiles |
| `onReportWritten` | Report create/update | Count flaggable reports; flag at 3+ |
| `onMatchCreated` | New match doc | FCM "It's a match!" to both users |
| `onMessageCreated` | New chat message | FCM "New message" to recipient |
| `onChatUpdated` | Chat doc update | FCM on proposal accept/decline |

**Requires:** Blaze plan for deployment. See [SECURITY_DEPLOY.md](./SECURITY_DEPLOY.md).

### FCM client (`FcmService`)

- Requests permission, saves token via `saveFcmToken` callable
- On notification tap: stores `pendingChatUserId` → `HomeShell` opens `ChatScreen`
- FCM init is **non-fatal** — app launches even if token save fails

### Indexes (`firestore.indexes.json`)

Composite indexes for admin queries and deck ordering:

- `city + flaggedForReview`
- `flaggedForReview + updatedAt`
- `city + flaggedForReview + updatedAt`
- `city + updatedAt` ← **primary deck query**

---

## Security model (v1.0.0+4)

### Authentication

- Email/password via Firebase Auth
- Email verification encouraged (banner in HomeShell) but not blocking
- **Firebase App Check** on all Firestore / Functions calls (`request.app != null` in rules)

### Firestore rules summary

| Collection | Read | Write |
|------------|------|-------|
| `users` | Owner only (`get`); `list` denied | Owner create/update (no server-only fields); admin privileged updates |
| `likes` | Owner read only | **Denied** — Functions Admin SDK only |
| `blocks` | Owner only | Owner only |
| `matches` | Participants only | **Denied** — Functions only |
| `chats` | Participants + valid match | Create (`createdAt` only); update proposal fields only |
| `chats/messages` | Participants + valid match | **Denied** — `sendMessage` callable only |
| `reports` | Admin only | Reporter create/update with validated reason |
| `rate_limits` | Denied | Denied (Functions only) |

### Server-only user fields

- `fcmToken`, `emailVerified` — writable only via Cloud Functions
- `flaggedForReview`, `flaggedReasonSummary`, `flaggedAt`, `verified` — admin only

### Admin identification

- Firebase custom claim `admin: true` (set via `scripts/set_admin_claim.js`)
- `adminGetFlaggedUsers` callable for moderation list

### Rate limiting

Per-UID windows in `rate_limits/{uid}/windows/{action}` — deck, likes, passes, messages, FCM token, delete account.

See [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) and [SECURITY_DEPLOY.md](./SECURITY_DEPLOY.md).

---

## Performance & cost optimizations

Built to keep Firestore reads low on the free/spark tier:

| Optimization | Implementation |
|--------------|----------------|
| Paginated deck | 40 users per page, not full collection scan |
| Session exclude cache | Likes/passes/blocks loaded once per session |
| Deck result cache | 15-min TTL per filter/city/distance key |
| Denormalized match profiles | Name/photo on match doc — no per-row user fetch |
| Chat message limit | Stream latest 50; `loadOlderMessages()` on scroll |
| Debug logging | `DeckLoad: N docs read` in debug builds |

See `FIREBASE_BILLING.md` for cost expectations and monitoring.

---

## Admin moderation

Admin users (Firebase custom claim `admin: true`) can access **Admin moderation** from Settings via `isAdminUser()` in `lib/core/constants/admin_config.dart`.

---

## Build & deployment

### Android release

| Artifact | Path |
|----------|------|
| Release APK | `build/app/outputs/flutter-apk/app-release.apk` (~54 MB) |
| Release AAB | `build/app/outputs/bundle/release/app-release.aab` (~48 MB) |

Signing: `android/upload-keystore.jks` + `android/key.properties` (gitignored).

Build command:

```powershell
.\scripts\build_android_release.ps1
```

### Firebase deploy

```powershell
.\scripts\deploy_firebase.ps1
```

Deploys: Firestore rules + indexes, Storage rules, Functions (if Blaze enabled).

### Flutter SDK path (this machine)

```
c:\Spinder\flutter\flutter\bin\flutter.bat
```

---

## Project structure

```
c:\Spinder\
├── lib/
│   ├── main.dart                 # Entry: Firebase + FCM + error handling
│   ├── app.dart                  # MaterialApp root
│   ├── firebase_options.dart     # FlutterFire generated config
│   ├── app/
│   │   ├── auth_gate.dart        # Auth + profile routing
│   │   └── home_shell.dart       # Bottom nav shell
│   ├── core/
│   │   ├── theme/app_theme.dart
│   │   ├── constants/            # Cities, sports, venues, reports
│   │   ├── services/             # FCM, location, deck cache, test session
│   │   ├── utils/                # Geo, image compression
│   │   └── test_data/            # Dummy data generator
│   └── features/
│       ├── auth/                 # AuthService, UserRepository, ImageUpload
│       ├── onboarding/           # 4-step flow + OnboardingCubit
│       ├── deck/                 # Discover: cubit, repo, screen, cards
│       ├── matches/              # Match list
│       ├── chat/                 # Messaging + proposals
│       ├── profile/              # View/edit profile
│       ├── settings/             # Settings, blocked, safety, admin
│       ├── block/                # BlockRepository
│       ├── report/               # ReportRepository + button widget
│       └── settings/             # Settings, admin moderation
├── android/                      # Android project + release signing
├── functions/                    # Cloud Functions (Node 20)
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── firebase.json
├── scripts/                      # Build & deploy automation
├── docs/
│   ├── APP_CONTEXT.md            # This file
│   └── UI_AUDIT.md               # UI inventory
├── FIREBASE_SETUP.md
└── FIREBASE_BILLING.md
```

---

## Known limitations & pending work

### Backend deployment (v1.0.0+4)

Security remediation code is complete in-repo. Production rollout requires:

1. **Blaze plan** on `khiladi-1400b` (Cloud Functions deploy failed without it)
2. Deploy **functions first**, then ship client **v1.0.0+4**, then **Firestore rules** — see [SECURITY_DEPLOY.md](./SECURITY_DEPLOY.md)
3. Run `node scripts/set_admin_claim.js <uid>` and re-login for admin moderation / test mode
4. Register **App Check** (Play Integrity + debug token) in Console; start in Monitoring, then Enforce
5. **Storage** must be enabled before storage rules deploy

### Product / feature gaps

- No phone auth, social login, or OAuth
- No in-app notifications center (push only)
- No sport-specific matching beyond shared-sport filter
- No rating/review system after games
- No payment or booking integration
- Chat has no image/file attachments
- UI is functional dark theme — **redesign planned**

### Technical debt / notes

- Test mode removed — all features use live Firestore / Cloud Functions only
- FCM deep link uses placeholder name `'Player'` if opened before profile loads
- Local Flutter SDK at `flutter/flutter` had merge conflicts; repair or use a clean SDK for release builds

### Security remediation (v1.0.0+4)

- Discovery, likes, passes, messages, FCM token, and account deletion go through **rate-limited Cloud Functions**
- Peers cannot read `users/{otherUid}`; deck returns sanitized card projection only
- Matches created **server-side** on reciprocal likes only
- Admin via **`admin: true` custom claim** (not hardcoded email)
- App Check required on Firestore / Functions after enforcement is enabled

### Recent fixes (v1.0.0+3)

- CardSwiper crash when 1 or 0 cards remain (`numberOfCardsDisplayed` clamp)
- Deck discovery: removed server-side `flaggedForReview` filter (restored server-side in v1.0.0+4 `getDeckPage`)
- Firestore rules: owner updates no longer blocked by privileged fields check
- FCM init decoupled from app startup — permission errors don't brick the app

---

## Quick reference: key files

| Concern | File |
|---------|------|
| App entry & startup errors | `lib/main.dart` |
| Routing after auth | `lib/app/auth_gate.dart` |
| Main navigation shell | `lib/app/home_shell.dart` |
| Deck logic | `lib/features/deck/repositories/deck_repository.dart` |
| Swipe state | `lib/features/deck/cubit/deck_cubit.dart` |
| User profiles | `lib/features/auth/repositories/user_repository.dart` |
| Chat + proposals | `lib/features/chat/repositories/chat_repository.dart` |
| Security rules | `firestore.rules` |
| Cloud Functions service | `lib/core/services/cloud_functions_service.dart` |
| App Check | `lib/core/services/app_check_service.dart` |
| Theme / colors | `lib/core/theme/app_theme.dart` |
| Session cache | `lib/core/services/deck_session_cache.dart` |

---

*Last updated for Sportiv v1.0.0+4. Complements [UI_AUDIT.md](./UI_AUDIT.md) and [SECURITY_DEPLOY.md](./SECURITY_DEPLOY.md).*
