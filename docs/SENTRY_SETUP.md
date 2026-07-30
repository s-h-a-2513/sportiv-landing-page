# Sentry setup for Sportiv (Android)

## 1. Create a Sentry project

1. Sign up at [sentry.io](https://sentry.io)
2. Create a project → **Flutter**
3. Copy the **DSN** (looks like `https://...@....ingest.sentry.io/...`)

## 2. Run with DSN (local / CI)

Pass the DSN at build or run time — **do not commit the DSN** to git:

```powershell
# Debug on device
c:\Spinder\flutter\bin\flutter.bat run `
  --dart-define=SENTRY_DSN=https://YOUR_KEY@YOUR_ORG.ingest.sentry.io/YOUR_PROJECT

# Release APK
c:\Spinder\flutter\bin\flutter.bat build apk --release `
  --dart-define=SENTRY_DSN=https://YOUR_KEY@YOUR_ORG.ingest.sentry.io/YOUR_PROJECT `
  --dart-define=SENTRY_ENVIRONMENT=production
```

Or set env vars before `.\scripts\build_android_release.ps1` (script passes them when set).

Without `SENTRY_DSN`, Sentry is **disabled** and the app runs normally.

## 3. What is monitored

- Uncaught Dart/Flutter errors
- Android JVM + NDK native crashes
- ANRs (Application Not Responding)
- Discover deck errors (`getDeckPage`, like/pass) — tagged `feature:discover`
- Supabase / push startup failures (non-fatal where applicable)
- Navigation breadcrumbs via `SentryNavigatorObserver`
- Supabase Auth user id attached to events (no PII by default)

## 4. Debug symbol upload (readable release stack traces)

After creating a Sentry project, configure symbol upload in `pubspec.yaml`:

```yaml
sentry:
  upload_debug_symbols: true
  org: your-org-slug
  project: sportiv
  # auth_token: use SENTRY_AUTH_TOKEN env var instead
```

Build with obfuscation + upload:

```powershell
c:\Spinder\flutter\bin\flutter.bat build apk --release `
  --obfuscate `
  --split-debug-info=build/debug-info `
  --dart-define=SENTRY_DSN=YOUR_DSN
dart run sentry_dart_plugin
```

Set `SENTRY_AUTH_TOKEN` from Sentry → Settings → Auth Tokens.

## 5. Verify

1. Build/run with `SENTRY_DSN` set
2. Trigger a test error in debug (optional): `throw StateError('Sentry test');`
3. Open Sentry → Issues — event should appear within a minute

## 6. Wizard (optional)

For full interactive setup (symbol upload, Gradle patches):

```bash
brew install getsentry/tools/sentry-wizard && sentry-wizard -i flutter
```

On Windows, use the manual steps above or run the wizard from WSL.
