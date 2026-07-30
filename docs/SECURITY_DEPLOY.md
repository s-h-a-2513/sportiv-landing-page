# Security deployment guide (v1.0.0+4)

Deploy in this order to avoid breaking production clients.

## 1. Deploy Cloud Functions

**Symptom:** Discover shows `[firebase_functions/not-found] NOT_FOUND` — `getDeckPage` is not deployed.

**Status:** Blocked until project is on **Blaze**. Error: `cloudbuild.googleapis.com can't be enabled until the upgrade is complete`.

Upgrade: https://console.firebase.google.com/project/khiladi-1400b/usage/details

One-shot setup (after Blaze + `firebase login`):

```powershell
.\scripts\setup_discover_backend.ps1
```

Or manually:

```powershell
cd functions; npm install; cd ..
firebase deploy --only functions --project=khiladi-1400b
```

## 2. Install client v1.0.0+4

**Status:** Release build succeeded locally (`build/app/outputs/flutter-apk/app-release.apk`, `app-release.aab`). Distribute to testers before enforcing strict rules.

Build and distribute the APK/AAB with App Check + callable integration before enforcing strict rules.

```powershell
.\scripts\build_android_release.ps1
```

## 3. Set admin custom claim

```powershell
node scripts/set_admin_claim.js <firebase-auth-uid>
```

Admin user must sign out and sign back in. Test mode FAB and admin moderation require this claim.

## 4. App Check (Firebase Console)

1. Open [App Check](https://console.firebase.google.com/project/khiladi-1400b/appcheck) for project `khiladi-1400b`.
2. Register **Play Integrity** for Android app `com.sportiv.app`.
3. For **debug builds**, run the app once and add the debug token printed in logcat to App Check > Manage debug tokens.
4. Start with **Monitoring** mode on Firestore and Cloud Functions.
5. After v1.0.0+4 is on all devices, switch to **Enforced**.

## 5. Deploy Firestore rules + indexes

Rules require App Check (`request.app != null`). Do not deploy rules until App Check works on your test device.

```powershell
firebase deploy --only firestore:rules,firestore:indexes --project=khiladi-1400b
```

## Verification checklist

- [ ] `getDeckPage` returns cards; direct `users` collection list fails
- [ ] `recordLike` creates match only on mutual like
- [ ] Direct `matches` create from SDK fails
- [ ] `sendMessage` callable works; message spam hits rate limit
- [ ] `deleteAccount` removes user, matches, chats, photo
- [ ] Admin moderation loads via `adminGetFlaggedUsers` (admin claim only)
- [ ] Women-only and flagged users excluded from deck server-side

## What changed

| Area | Before | After |
|------|--------|-------|
| User reads | Any signed-in user | Owner only |
| Deck | Client Firestore query | `getDeckPage` callable |
| Likes / matches | Client writes | `recordLike` / `recordPass` callables + server match creation |
| Messages | Direct Firestore write | `sendMessage` callable |
| FCM token | Client write to user doc | `saveFcmToken` callable |
| Admin | Hardcoded email | Custom claim `admin: true` |
| Abuse | No limits | Per-UID rate limits in Functions |

See [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) for full findings.
