# Docker local development

## Quick start

```powershell
cp .env.example .env
docker compose up -d
```

- **Supabase API:** http://127.0.0.1:54321
- **Supabase Studio:** http://127.0.0.1:54323
- **Postgres:** localhost:54322

Run the Flutter app on your host/device:

```powershell
flutter run `
  --dart-define=SUPABASE_URL=http://127.0.0.1:54321 `
  --dart-define=SUPABASE_ANON_KEY=<from npx supabase status>
```

## Build release APK in Docker

```powershell
docker compose --profile build up sportiv-builder
docker create --name sportiv-art sportiv:local
docker cp sportiv-art:/artifacts/sportiv-release.apk ./build/docker-artifacts/
docker rm sportiv-art
```

## CI

GitHub Actions runs `flutter analyze`, `flutter test`, and a Docker APK build on every push to `main`.

## CD

On push to `main`, `.github/workflows/cd.yml` applies migrations and deploys Edge Functions when `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_REF` secrets are configured.
