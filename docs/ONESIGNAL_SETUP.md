# OneSignal setup (Sportiv)

App ID: `a0f06972-4e89-419e-aa11-765464671688`  
Flutter SDK: `onesignal_flutter` **5.5.2** (stable)  
iOS native pod: `OneSignalXCFramework/OneSignalExtension` **5.5.1** (stable)

Integrated in:
- Player app (`lib/`) — package `com.sportiv.app`
- Owner app (`owner_app/`) — package `com.sportiv.owners` (Android), `com.sportiv.sportivOwners` (iOS)

## Flutter

Initialization is centralized in `PushService` (no permission prompt at launch).  
After a server-assigned subscription ID is detected, `OneSignalVerificationHost` shows the required integration dialog; tapping **Got it** requests push permission.

Override the app id at build time:

```powershell
flutter run --dart-define=ONESIGNAL_APP_ID=a0f06972-4e89-419e-aa11-765464671688
```

## Android

- `POST_NOTIFICATIONS` in manifests
- Default FCM channel `sportiv_default` (created in `MainActivity`)
- No `google-services.json` required for OneSignal

## iOS (best-effort from Windows)

Files added under each app's `ios/` folder:
- `Runner/Runner.entitlements` — Push + App Group
- `OneSignalNotificationServiceExtension/` — NSE source + entitlements
- `Podfile` — Runner + NSE targets

### Finish on a Mac in Xcode

1. Open `ios/Runner.xcworkspace` (after `pod install`).
2. **File → New → Target → Notification Service Extension**, name `OneSignalNotificationServiceExtension` (or wire the existing folder into a new target).
3. Replace generated `NotificationService.swift` with the repo version if needed.
4. Set entitlements on **both** Runner and NSE:
   - Player: `group.com.sportiv.app.onesignal`
   - Owner: `group.com.sportiv.sportivOwners.onesignal`
5. Enable **Push Notifications** and **Background Modes → Remote notifications** on Runner.
6. Embed the NSE in Runner (**General → Frameworks, Libraries, and Embedded Content**).
7. Select a development team and build to a device or simulator.

```bash
cd ios && pod install && cd ..
flutter run
```

### Verification

1. Launch the app (do not clear app data between runs).
2. Wait for the “Your OneSignal SDK integration is complete!” dialog.
3. Tap **Got it** and accept notifications.
4. Confirm the device appears in the OneSignal dashboard with a non-`local-` subscription id.

## Server

Set `ONESIGNAL_APP_ID` and `ONESIGNAL_REST_API_KEY` for Supabase Edge Functions (`webhook-notify`, `send-booking-reminders`).
