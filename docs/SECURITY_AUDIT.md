# KhelKhiladi — Security Audit Report

> **Remediation status (v1.0.0+4):** Critical fixes implemented — see [SECURITY_DEPLOY.md](./SECURITY_DEPLOY.md) for deploy steps.

**Auditor role:** Senior Cybersecurity Engineer / Firebase Security Specialist  
**Scope:** Client (`lib/`), `firestore.rules`, `storage.rules`, `functions/index.js`  
**Version audited:** `1.0.0+3`  
**Date:** June 2026

---

## Executive summary

KhelKhiladi has correct instincts in several areas (append-only messages, `senderId` binding, privileged-field guards on user docs), but **Firestore rules are the primary failure point**. The rules over-expose the entire `users` collection, allow **forged match documents** that unlock chat, and simultaneously **block legitimate mutual-match detection** via overly strict `likes` read rules. Multiple privacy controls (`flaggedForReview`, women-only visibility) exist **only in client code** and are trivially bypassed with the Firebase SDK.

**Immediate action required:** Fix match creation rules, restrict user profile reads, move discovery filtering server-side, and deploy mutual-match logic via Cloud Functions.

| Severity | Count |
|----------|-------|
| Critical | 4 |
| High | 6 |
| Medium | 5 |
| Low | 4 |

---

## 1. Firestore security rules & data models

### CRITICAL-01 — Forged match documents unlock chat without mutual consent

**Finding:** `matches/{matchId}` create rule only requires:

```74:78:firestore.rules
    match /matches/{matchId} {
      allow read: if isMatchParticipant();
      allow create: if isCreatingMatchParticipant()
        && request.resource.data.users.size() == 2;
```

`isCreatingMatchParticipant()` checks that `request.auth.uid` appears in `request.resource.data.users`. It does **not** verify:

- `matchId` equals `sort(uid1)_sort(uid2)`
- A reciprocal like exists in `likes/{other}/liked/{me}`
- The other user consented

**Exploit:** Attacker `A` writes:

```javascript
db.collection('matches').doc(`${minUid}_${maxUid}`).set({
  users: [A, Victim],
  createdAt: serverTimestamp(),
  profiles: { /* optional */ }
});
```

`hasMatchForChat(chatId)` returns true. Attacker gains read/write on `chats/{chatId}` and can send messages to `Victim` without ever being liked back.

**Impact:** Harassment, unsolicited contact, reputational harm. `onMatchCreated` Cloud Function will also fire FCM notifications to both parties.

**Fix:**

1. **Remove client `create` on `matches` entirely.**
2. Add Cloud Function `onLikeCreated` (trigger: `likes/{userId}/liked/{otherId}`) that:
   - Checks `likes/{otherId}/liked/{userId}` exists (Admin SDK bypasses user-scoped rules).
   - Creates `matches/{sortedPair}` only when reciprocal.
3. If client create must remain temporarily, add rules:

```
function sortedPair(uid1, uid2) {
  return uid1 < uid2 ? uid1 + '_' + uid2 : uid2 + '_' + uid1;
}
function validMatchCreate() {
  let u = request.resource.data.users;
  return u.size() == 2
    && request.auth.uid in u
    && matchId == sortedPair(u[0], u[1])
    && exists(/databases/$(database)/documents/likes/$(u[0])/liked/$(u[1]))
    && exists(/databases/$(database)/documents/likes/$(u[1])/liked/$(u[0]));
}
allow create: if validMatchCreate();
```

Prefer server-only match creation.

---

### CRITICAL-02 — Mutual like verification is blocked by `likes` read rules (functional + security gap)

**Finding:** `DeckRepository.likeUser()` reads the other user's like subcollection:

```333:338:lib/features/deck/repositories/deck_repository.dart
    final theirLike = await _firestore
        .collection('likes')
        .doc(likedUserId)
        .collection('liked')
        .doc(uid)
        .get();
```

Rules allow read only on `likes/{userId}` when `isOwner(userId)`:

```66:68:firestore.rules
    match /likes/{userId}/liked/{otherId} {
      allow read, write: if isOwner(userId);
    }
```

User `A` cannot read `likes/B/liked/A`. This read **always fails** with `permission-denied` unless rules differ in production.

**Impact:** Legitimate matches may never form from the client; developers may "fix" this by weakening rules (e.g. global like reads), which leaks who liked whom.

**Fix:** Move match detection to Cloud Function (see CRITICAL-01). Change client `likeUser()` to only write `likes/{me}/liked/{them}` and listen for new `matches` doc. Do **not** widen like reads to all users.

---

### CRITICAL-03 — Any signed-in user can read every profile (privacy controls are illusory)

**Finding:**

```54:56:firestore.rules
    match /users/{userId} {
      allow read: if isSignedIn();
```

Any authenticated user can `get` or `list` **all** `users` documents, including:

- `latitude`, `longitude` (precise location)
- `gender`, `womenOnlyVisibility`
- `flaggedForReview`, `flaggedReasonSummary`
- `email`, `fcmToken`
- `age`, `club`, `sports`

Client-side filters in `DeckRepository._mapDocsToCandidates()` are **not security controls**:

```242:247:lib/features/deck/repositories/deck_repository.dart
      if (data['flaggedForReview'] == true) continue;
      ...
      if (theirWomenOnly && myGender != 'female') continue;
```

**Exploit:** Script with Firebase Auth credentials:

```javascript
const snap = await db.collection('users').where('city','==','Karachi').get();
snap.docs.forEach(d => console.log(d.id, d.data().womenOnlyVisibility, d.data().latitude));
```

Bypasses deck UI entirely. Flagged users remain discoverable. Women-only profiles are visible to any male account.

**Impact:** Stalking, harassment, GDPR-style privacy breach, undermines core safety marketing.

**Fix:**

1. Split collection or field visibility:
   - **Option A:** `users/{uid}` (owner read/write) + `discoverable_profiles/{uid}` (limited fields, queryable) written by Cloud Function on profile change.
   - **Option B:** Callable Function `getDeckPage()` returns filtered cards; no direct peer user reads.
2. Until then, tighten rules:

```
allow get: if isOwner(userId);
allow list: if false;  // ban collection scans
```

Use Cloud Function for deck with Admin SDK applying gender, block, flag, distance filters.

---

### HIGH-01 — Privileged fields are guarded; other sensitive fields are not

**Finding:** `flaggedForReview`, `verified`, etc. are protected via `privilegedFieldsUnchanged()` on owner update. **Good.**

However, these fields are **not** privileged and users can self-assign:

| Field | Risk |
|-------|------|
| `emailVerified` | Written from client in `_profileData()` — attacker can `update({emailVerified: true})` without verifying email |
| `gender` | No server validation — male can set `gender: 'female'` to view women-only profiles (combined with CRITICAL-03) |
| `womenOnlyVisibility` | Only forced false when `gender != 'female'` in client — direct Firestore write can set true on male profile |
| `fcmToken` | Readable on all user docs — enables token harvesting |
| `email` | Writable string on profile, not tied to Auth token |

**Fix:**

- Add `immutableProfileFields()` or `serverOnlyFields()`: `emailVerified`, `verified`, `flaggedForReview`, `flaggedReasonSummary`, `flaggedAt`, `fcmToken`.
- Set `emailVerified` only via Cloud Function on Auth trigger `onUserUpdated`.
- Validate `gender` changes via Callable Function with re-auth or admin review.
- Remove `email` from client-writable profile; read from `request.auth.token.email` in rules if needed.

---

### HIGH-02 — Chat document has unrestricted write; message rules are narrow but parent doc is not

**Finding:** Messages are well-constrained:

```90:96:firestore.rules
        allow create: if isSignedIn()
          && isChatParticipant(chatId)
          && hasMatchForChat(chatId)
          && request.resource.data.senderId == request.auth.uid
          && request.resource.data.text is string
```

`senderId` spoofing on **messages** is blocked.

But parent `chats/{chatId}` allows full `write`:

```81:84:firestore.rules
    match /chats/{chatId} {
      allow read, write: if isSignedIn()
        && isChatParticipant(chatId)
        && hasMatchForChat(chatId);
```

**Exploit:** Participant sets `proposalStatus: 'accepted'`, `proposalBy: victimUid` without recipient consent. Participant injects arbitrary fields. Combined with CRITICAL-01, attacker forges match then manipulates proposal state.

**Fix:** Split chat metadata updates:

```
allow create: if participant && hasMatch && validInitialChatData();
allow update: if participant && hasMatch && onlyProposalFieldsChanged()
  && (proposal accept/decline only by non-proposer);
```

Or move proposals to `chats/{id}/proposals/{id}` with per-field rules. Best: handle accept/decline via Callable Function.

---

### HIGH-03 — `matchId` / `chatId` participant regex is fragile

**Finding:**

```19:22:firestore.rules
    function isChatParticipant(chatId) {
      let uid = request.auth.uid;
      return chatId.matches(uid + '_.*') || chatId.matches('.*_' + uid);
    }
```

Firebase Auth UIDs rarely contain `_`, but this pattern matches any chat whose ID **ends with** `_{uid}`, not necessarily `sortedPair(uid, other)`. If UID `abc` exists, chat `attacker_abc` grants access to `abc`.

Cloud Functions split `chatId` on `_` assuming exactly two parts (`functions/index.js` lines 95–97). Multi-underscore IDs break FCM routing.

**Fix:**

```
function isChatParticipant(chatId) {
  let uid = request.auth.uid;
  return chatId == uid + '_' + /* other from match doc */ ...
}
```

Bind `chatId` to `matchId` and validate `request.auth.uid in get(/matches/$(chatId)).data.users`.

---

### MEDIUM-01 — `matches` documents cannot be updated; denormalized profile sync fails

**Finding:** `UserRepository._syncDenormalizedMatchProfiles()` batch-updates `profiles.{uid}` on match docs, but rules deny match updates:

```74:78:firestore.rules
      allow update, delete: if false;
```

**Impact:** Stale names/photos on match list; encourages extra `users/{id}` reads (which over-expose data).

**Fix:** Cloud Function on `users/{uid}` update syncs match denormalization with Admin SDK, or allow narrowly scoped update:

```
allow update: if isMatchParticipant()
  && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['profiles'])
  && /* only own profile key changed */;
```

---

### LOW-01 — Append-only messages: correctly enforced

`allow update, delete: if false` on messages prevents tampering and deletion. **No action** beyond rate limiting (see abuse section).

---

## 2. Client-side vulnerabilities & logic bypasses

### CRITICAL-03 (reprise) — Client-side `flaggedForReview` filter

**Risk quantification:**

| Attack vector | Effort | Detection in app |
|---------------|--------|------------------|
| Modified APK skipping 2 lines in `_mapDocsToCandidates` | Low | None |
| Firebase REST/SDK direct query | Low | None |
| Collection group scan `users` | Low | None |

**Severity:** Critical for user safety — flagged harassers remain fully visible to scripted clients.

**Fix:** Server-side exclusion in deck API / discoverable profile index (`flaggedForReview != true` as query filter on a safe projection).

---

### CRITICAL-03 (reprise) — Women-only visibility is client-only

**Finding:** Rules do not enforce women-only visibility on read. A male attacker:

1. Sets `gender: 'female'` on own profile (HIGH-01), **or**
2. Ignores client filters and reads raw `users` docs,

…then accesses `womenOnlyVisibility: true` profiles with full location data.

**Fix:**

- Enforce visibility in server deck query: exclude users where `womenOnlyVisibility == true` unless `requester.gender == 'female'` (verified).
- Never expose `womenOnlyVisibility` users to non-female requesters in any API response.

---

### HIGH-04 — Hardcoded admin email in rules and client

**Locations:**

- `firestore.rules` line 16: `request.auth.token.email == 'hassamali131020@gmail.com'`
- `lib/core/constants/test_mode_config.dart`: `kTestAdminEmail`
- `lib/features/settings/screens/settings_screen.dart`: gates Admin UI

**Risks:**

1. **Reconnaissance** — APK decompile reveals admin identity (spear-phishing target).
2. **Email-based admin is weak** — Admin privileges tied to email string, not custom claims. Whoever controls that Auth account (password compromise, unverified email squatting if signup is open) owns moderation.
3. **UI-only admin gate** — `getFlaggedUsers()` queries Firestore directly; any user can run the same query (CRITICAL-03). Admin screen hiding is cosmetic.

**Fix:**

1. Replace `isAdmin()` with `request.auth.token.admin == true` (Firebase custom claims).
2. Set claims only via Admin SDK script / Function; never hardcode email in rules.
3. Remove admin email constant from release builds; use claims check: `idTokenResult.claims['admin']`.
4. Restrict `list` on flagged users to admin Cloud Function only.

---

### MEDIUM-02 — `emailVerified` banner is bypassable

Client shows verification banner but does not block app usage. Users can self-set `emailVerified: true` on Firestore profile (HIGH-01). Low direct security impact but erodes trust signals.

---

## 3. Data leaks & privacy flaws

### HIGH-05 — Denormalized `profiles` map on `matches`

**Finding:** Match docs store `{ uid: { name, photoUrl } }` for both users.

**Leak assessment:**

- **Not premature** if match creation requires true mutual consent.
- **Is premature** under CRITICAL-01 — forged match immediately exposes victim name/photo to attacker in match doc (attacker already had full user read via CRITICAL-03 anyway).

**Fix:** Fix match forgery first. Optionally strip `profiles` from client-readable match docs and resolve via secure Function.

---

### HIGH-06 — Account deletion leaves dangling PII and relationship data

**Finding:** `deleteAccount()` only:

```161:166:lib/features/auth/repositories/user_repository.dart
  Future<void> deleteAccount() async {
    ...
    await _firestore.collection('users').doc(uid).delete();
    await _auth.currentUser?.delete();
  }
```

**Retained data:**

| Collection | Retained content |
|------------|------------------|
| `likes/{uid}/liked/*`, `likes/{uid}/passed/*` | Who user liked/passed |
| `likes/{others}/liked/{uid}` | Others' records of liking deleted user |
| `matches/*` | Match docs, denormalized profile, chat history |
| `chats/{id}/messages/*` | Full message history |
| `blocks/*` | Block references |
| `reports/*/items/*` | Reports about/by user |
| Storage `user_photos/{uid}.jpg` | Profile photo blob |

**Impact:** GDPR/right-to-erasure non-compliance. Deleted users remain in others' match lists and chat threads. Stalking data persists.

**Fix:** Cloud Function `onUserDelete` (Auth trigger `beforeUserDeleted` or Callable):

1. Delete subcollections: likes, blocks.
2. Remove user from match docs or delete matches; delete chat messages.
3. Delete Storage object.
4. Anonymize reports (`reporterId` → hash) rather than delete for safety audit trail.

---

### MEDIUM-03 — `fcmToken` exposed on all user documents

Any signed-in user can harvest FCM tokens. Push sending still requires server key, but tokens enable targeted notification attacks if combined with a leaked service account or misconfigured Function.

**Fix:** Move `fcmToken` to `users/{uid}/private/fcm` with owner-only read, or `users_private/{uid}` collection with `allow read: if isOwner`.

---

### MEDIUM-04 — Profile photos readable by any authenticated user

```7:8:storage.rules
    match /user_photos/{userId}.jpg {
      allow read: if request.auth != null;
```

Acceptable for a discovery app if profiles are public to members. Document this choice. Do not treat Storage rules as women-only or block enforcement.

---

## 4. Exploit scenarios & abuse vectors

### HIGH-07 — Automated swipe and message spam (no rate limits, no App Check)

**Finding:** No Firebase App Check. No Cloud Functions rate limiting. No per-UID write throttles.

**Exploit scripts (Firebase JS SDK):**

```javascript
// Mass-like everyone in city
const users = await db.collection('users').where('city','==','Karachi').limit(40).get();
for (const u of users.docs) {
  if (u.id === myUid) continue;
  await db.collection('likes').doc(myUid).collection('liked').doc(u.id).set({createdAt: serverTimestamp()});
}

// Message flood (requires forged or real match)
for (let i = 0; i < 1000; i++) {
  await db.collection('chats').doc(chatId).collection('messages').add({
    senderId: myUid, text: 'spam', createdAt: serverTimestamp()
  });
}
```

**Cost impact:** Firestore write amplification, FCM spam via `onMessageCreated`, billing abuse.

**Fix:**

1. Enable **Firebase App Check** (Play Integrity / DeviceCheck) on Firestore, Storage, Functions.
2. Add rate limits in Cloud Functions or use Firebase Extensions / upstream WAF.
3. Callable wrappers: `likeUser`, `sendMessage` with per-UID quotas (e.g. 100 likes/day, 60 messages/minute).
4. Consider captcha on signup.

---

### MEDIUM-05 — Report abuse and flag evasion

**Finding:** Reports allow `create, update` per reporter. Reason is any string in rules. `onReportCreated` only fires on **create** — updating report reason to `Harassment` does not re-trigger.

Attackers can:

- Submit many unique accounts reporting a victim (Sybil signup — email auth only).
- Report innocent users 3 times to trigger auto-flag (`FLAG_THRESHOLD = 3`).

**Fix:**

- Validate `reason` against allowlist in rules: `request.resource.data.reason in ['Harassment', 'No-Show', ...]`
- Trigger flag logic on `onWrite` not just `onCreate`
- Weight reports by reporter account age / verified status
- Admin review before hiding user from discovery (server-side flag enforcement)

---

### LOW-02 — Block does not sever existing matches or chat

**Finding:** `BlockRepository.blockUser()` writes block doc. Deck excludes blocked users via cache. **No rule or code** deletes match or prevents chat.

**Exploit:** Blocked harasser continues messaging matched victim.

**Fix:** Cloud Function on block: mark match inactive, deny chat writes via rules checking `!isBlocked(otherUid)`, or delete match with user consent.

---

### LOW-03 — Test mode cannot bypass production Firestore (good)

**Finding:** `TestModeCubit` gates on `isTestAdminEmail(email)` from Firebase Auth + `setEnabled` returns early if `!state.isTestAdmin`.

**Assessment:**

| Vector | Result |
|--------|--------|
| Toggle `SharedPreferences` only | Cubit resets `isEnabled` false for non-admin on load |
| Repackage APK, force `testModeActive: true` in repositories | Routes to in-memory `TestModeSession` only — **no production data access** |
| Non-admin email | Cannot enable test mode in stock app |

**Risk:** Low for data breach. Repackaged app could hide test banner while using dummy data (confusion only).

**Fix:** Strip test mode from release builds (`kReleaseMode` compile flag). Remove `kTestAdminEmail` from production binaries.

---

### LOW-04 — Cloud Functions trust client-created matches and chat IDs

`onMatchCreated`, `onMessageCreated`, `onChatUpdated` do not validate match legitimacy. Forged matches trigger push notifications to victims.

**Fix:** Deploy only after CRITICAL-01 is fixed. Add server-side validation in Functions before sending FCM.

---

## 5. Actionable remediation plan

### Phase 0 — Emergency (deploy within 48 hours)

| # | Action | Addresses |
|---|--------|-----------|
| 1 | **Disable client `create` on `matches`**; deploy `onLikeCreated` Function to create matches server-side | CRITICAL-01, CRITICAL-02 |
| 2 | **`allow list: if false` on `users`**; `allow get: if isOwner(userId)` until deck Function exists | CRITICAL-03 |
| 3 | Add `emailVerified`, `fcmToken` to server-only fields; block client writes | HIGH-01, MEDIUM-03 |
| 4 | Restrict `chats/{chatId}` update to proposal fields with proposer/recipient checks | HIGH-02 |

### Phase 1 — Hardening (1–2 weeks)

| # | Action | Addresses |
|---|--------|-----------|
| 5 | Deploy **Firebase App Check** on all services | HIGH-07 |
| 6 | Callable Functions: `getDeckPage`, `sendMessage`, `likeUser` with rate limits | HIGH-07, CRITICAL-03 |
| 7 | Replace email admin with **custom claims** `admin: true` | HIGH-04 |
| 8 | Auth trigger `beforeUserDeleted` — cascade delete/anonymize | HIGH-06 |
| 9 | `onBlockCreated` — sever chat access | LOW-02 |
| 10 | Enable **Blaze** and deploy hardened Functions | Functions currently optional |

### Phase 2 — Architecture (2–4 weeks)

| # | Action |
|---|--------|
| 11 | Introduce `discoverable_profiles` projection (limited fields, server-written) |
| 12 | Server-side deck query with gender, distance, flag, block filters |
| 13 | Move proposal accept/decline to Callable Function |
| 14 | Strip test mode from release builds |
| 15 | Add monitoring: Firestore rule denials, write rates per UID, anomalous `matches` creates |

---

## Reference: proposed `users` rules (interim)

```
match /users/{userId} {
  function ownerFieldsOnly() {
    let forbidden = ['emailVerified', 'verified', 'flaggedForReview',
                     'flaggedReasonSummary', 'flaggedAt', 'fcmToken'];
    return !request.resource.data.keys().hasAny(forbidden)
      && privilegedFieldsUnchanged();
  }
  allow get: if isOwner(userId);
  allow list: if false;
  allow create: if isOwner(userId) && hasNoPrivilegedFieldsOnCreate();
  allow update: if isOwner(userId) && ownerFieldsOnly();
  allow update: if isAdmin() && adminOnlyPrivilegedUpdate();
  allow delete: if isOwner(userId);
}
```

Pair with Callable `getDiscoverablePlayers()` using Admin SDK.

---

## Reference: proposed match creation Function (sketch)

```javascript
exports.onLikeCreated = onDocumentCreated(
  'likes/{userId}/liked/{otherId}',
  async (event) => {
    const { userId, otherId } = event.params;
    const reciprocal = await db.doc(`likes/${otherId}/liked/${userId}`).get();
    if (!reciprocal.exists) return;

    const pair = [userId, otherId].sort();
    const matchId = `${pair[0]}_${pair[1]}`;
    const matchRef = db.doc(`matches/${matchId}`);
    if ((await matchRef.get()).exists) return;

    // Load profiles with Admin SDK, create match atomically
  }
);
```

Remove `allow create` on `matches` from client rules.

---

## Severity matrix (quick reference)

| ID | Title | Severity |
|----|-------|----------|
| CRITICAL-01 | Forged match → unsolicited chat | Critical |
| CRITICAL-02 | Like read rules block / break mutual match | Critical |
| CRITICAL-03 | Full `users` collection readable; client filters bypassable | Critical |
| HIGH-01 | Self-writable `gender`, `emailVerified`, `womenOnlyVisibility` | High |
| HIGH-02 | Unrestricted `chats` parent write | High |
| HIGH-03 | Fragile `chatId` participant regex | High |
| HIGH-04 | Hardcoded admin email; UI-only admin gate | High |
| HIGH-05 | Denormalized profiles risky under forged matches | High |
| HIGH-06 | Incomplete account deletion | High |
| HIGH-07 | No App Check / rate limits — scripted abuse | High |
| MEDIUM-01 | Match profile sync blocked by rules | Medium |
| MEDIUM-02 | Email verification bypassable | Medium |
| MEDIUM-03 | `fcmToken` harvestable | Medium |
| MEDIUM-04 | Public photo reads (document decision) | Medium |
| MEDIUM-05 | Report / Sybil flagging abuse | Medium |
| LOW-01 | Messages append-only (positive) | Low |
| LOW-02 | Block doesn't stop chat | Low |
| LOW-03 | Test mode isolated from production data | Low |
| LOW-04 | Functions notify on forged events | Low |

---

*This audit reflects static analysis of the repository as of v1.0.0+3. Validate rule behavior against the deployed `khiladi-1400b` project before and after remediation.*
