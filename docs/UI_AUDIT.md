# KhelKhiladi — UI Inventory & Purpose

> **App:** KhelKhiladi — Pakistan sports-matching app for 2-player games  
> **Version:** 1.0.0+3  
> **Stack:** Flutter (Material 3), dark theme only  
> **State:** `flutter_bloc` (Cubit) + local `StatefulWidget` state  
> **Backend UI data:** Firebase Auth, Firestore, Storage, FCM  

This document lists every screen, overlay, and reusable UI element — what it does, how it is built, and which file owns it.

---

## Table of contents

1. [How the UI is built](#how-the-ui-is-built)
2. [Design system](#design-system)
3. [Navigation map](#navigation-map)
4. [System screens](#system-screens)
5. [Onboarding (4 steps)](#onboarding-4-steps)
6. [Main app shell](#main-app-shell)
7. [Discover tab](#discover-tab)
8. [Matches tab](#matches-tab)
9. [Chat](#chat)
10. [Settings hub & sub-screens](#settings-hub--sub-screens)
11. [Modals, sheets & dialogs](#modals-sheets--dialogs)
12. [Reusable widgets](#reusable-widgets)
13. [Data constants (dropdown options)](#data-constants-dropdown-options)
14. [Transient feedback (SnackBars)](#transient-feedback-snackbars)

---

## How the UI is built

| Layer | Implementation | Purpose |
|-------|----------------|---------|
| **Root** | `lib/main.dart` → `KhelKhiladiApp` (`lib/app.dart`) | Firebase init, FCM init, global theme |
| **Routing** | No named routes — `Navigator.push` / `pushReplacement` with `MaterialPageRoute` | Simple imperative navigation |
| **Auth routing** | `AuthGate` (`lib/app/auth_gate.dart`) — `StreamBuilder` on Firebase Auth + `FutureBuilder` for profile | Sends users to onboarding or home |
| **Global state** | `MultiBlocProvider` in `app.dart` — `OnboardingCubit` | Onboarding step index |
| **Feature state** | Per-screen Cubits (e.g. `DeckCubit`) or `StatefulWidget` local state | Deck loading/swipes; form fields |
| **Live data** | `StreamBuilder` on Firestore streams (matches, chat, proposals) | Real-time lists and messages |
| **Images** | `cached_network_image`, `image_picker`, `flutter_image_compress` | Profile photos, card avatars |
| **Swipe deck** | `flutter_card_swiper` package — `CardSwiper` + `CardSwiperController` | Tinder-style discover |
| **Location** | `geolocator` via `LocationService` | Distance on cards; deck filtering |

**File layout:**

```
lib/
├── app.dart                    # MaterialApp root
├── app/
│   ├── auth_gate.dart          # Auth + profile gate
│   └── home_shell.dart         # Bottom nav shell
├── core/
│   ├── theme/app_theme.dart    # Colors + ThemeData
│   └── constants/              # Cities, sports, venues, report reasons
└── features/
    ├── onboarding/screens/     # 4-step signup flow
    ├── deck/screens|widgets/   # Discover
    ├── matches/screens/        # Match list
    ├── chat/screens|widgets/   # Messaging + proposals
    ├── profile/screens|widgets/
    ├── settings/screens/
    └── report/widgets/         # Report button + sheet
```

---

## Design system

**File:** `lib/core/theme/app_theme.dart`

| Token | Hex | Purpose |
|-------|-----|---------|
| `AppColors.primary` | `#2ecc71` | CTAs, likes, selected nav, success |
| `AppColors.primaryDark` | `#27ae60` | Darker green accent |
| `AppColors.background` | `#121212` | Scaffold background |
| `AppColors.surface` | `#252525` | Cards, inputs, sheets |
| `AppColors.surfaceLight` | `#2d2d2d` | Banners, chips, FAB |
| `AppColors.error` | `#e74c3c` | Pass, block, report, delete |
| `AppColors.onSurface` | White | Primary text |
| `AppColors.onSurfaceVariant` | `#b0b0b0` | Subtitles, hints, empty states |

**How it is applied:** `MaterialApp(theme: AppTheme.dark)` — Material 3, 12px rounded buttons/inputs, centered AppBar titles, green `Slider` theme.

---

## Navigation map

```
App launch
  ├─ Firebase fail → Startup Error Screen
  └─ Success → AuthGate
       ├─ Loading → Spinner
       ├─ Not signed in → Onboarding (step 0)
       ├─ Signed in, incomplete profile → Onboarding (step 1+)
       └─ Signed in, complete → HomeShell
            ├─ Tab 0: Discover (DeckScreen)
            │    ├─ Settings → SettingsScreen → Profile / Edit / Blocked / Safety / Admin
            │    ├─ Filters sheet
            │    ├─ Player detail sheet
            │    ├─ Match dialog → ChatScreen
            │    └─ Tap card → Player detail sheet
            └─ Tab 1: Matches (MatchesScreen)
                 └─ Tap row → ChatScreen
```

---

## System screens

### 1. Startup error screen

| | |
|---|---|
| **File** | `lib/main.dart` — class `_StartupErrorApp` |
| **Purpose** | Shown when Firebase fails to initialize; prevents a blank crash |
| **How built** | Standalone `MaterialApp` + `Scaffold` + `SafeArea` + `Column` |
| **When shown** | Missing `firebase_options`, or other Firebase init errors |

| Element | Widget | Purpose |
|---------|--------|---------|
| Title | `Text` (headline) | "Firebase setup required" or "Could not start app" |
| User message | `Text` (body) | Friendly explanation; permission-denied gets custom copy |
| Dev command box | `Container` + monospace `Text` | Shows `dart run flutterfire configure` (debug builds) |
| Technical detail | Red `Text` | Raw error (debug only) |

---

### 2. Auth loading screen

| | |
|---|---|
| **File** | `lib/app/auth_gate.dart` — class `_LoadingScreen` |
| **Purpose** | Placeholder while checking Firebase auth state or profile completion |
| **How built** | `Scaffold` + centered `CircularProgressIndicator` (green) |

---

## Onboarding (4 steps)

### Shell: Onboarding flow

| | |
|---|---|
| **File** | `lib/features/onboarding/screens/onboarding_flow_screen.dart` |
| **Purpose** | Wraps all 4 onboarding steps; tracks progress; saves profile on finish |
| **How built** | `BlocBuilder<OnboardingCubit>` + `IndexedStack` (one step visible) + `AppBar` with `LinearProgressIndicator` |
| **State** | `OnboardingCubit` / `OnboardingState` — current step, name, age, city, gender, sports, club, photo |
| **On complete** | Calls `UserRepository.saveProfile()` + `LocationService.getCurrentPosition()` → `pushReplacement` to `HomeShell` |

| Element | Widget | Purpose |
|---------|--------|---------|
| AppBar title | `Text` "KhelKhiladi" | Brand |
| Back button | `IconButton` | Steps 2–4 only; `OnboardingCubit.previousStep()` |
| Progress bar | `LinearProgressIndicator` | Visual step indicator (4 steps) |

---

### Step 1: Email authentication

| | |
|---|---|
| **File** | `lib/features/onboarding/screens/email_auth_screen.dart` |
| **Purpose** | Sign up or sign in with email/password |
| **How built** | `StatefulWidget` + `Form` + `TextFormField`s; calls `AuthService` |
| **On success** | Callback `onSuccess` → next onboarding step |

| Element | Widget | Purpose |
|---------|--------|---------|
| Headline | `Text` | "Create account" / "Sign in" |
| Email field | `TextFormField` | Validated email |
| Password field | `TextFormField` (obscured) | Min 6 chars |
| Confirm password | `TextFormField` | Sign-up only; must match |
| Forgot password? | `TextButton` | Sends reset email via `AuthService` |
| Error / info | `Text` (red/green) | Auth errors or reset confirmation |
| Primary CTA | `FilledButton` | Submit sign-up or sign-in |
| Mode toggle | `TextButton` | Switch between sign-up and sign-in |

---

### Step 2: Profile details

| | |
|---|---|
| **File** | `lib/features/onboarding/screens/profile_details_screen.dart` |
| **Purpose** | Collect name, age, city, gender, profile photo |
| **How built** | `StatefulWidget` + `Form`; writes to `OnboardingCubit`; uses `ProfilePhotoPicker` |
| **Photo upload** | On continue, bytes uploaded via `ImageUploadService` → URL stored in cubit |

| Element | Widget | Purpose |
|---------|--------|---------|
| Photo picker | `ProfilePhotoPicker` | Gallery image, compressed |
| Full name | `TextFormField` | Required |
| Age | `TextFormField` (number) | Required, valid range |
| City | `DropdownButtonFormField` | From `kCities` |
| Gender | `DropdownButtonFormField` | From `kGenders` |
| Continue | `FilledButton` | Validates + `onNext` |

---

### Step 3: Sport selection

| | |
|---|---|
| **File** | `lib/features/onboarding/screens/sport_selection_screen.dart` |
| **Purpose** | User picks up to 3 sports with skill level each |
| **How built** | `StatefulWidget` + `BlocBuilder`; custom `_SportCard` and `_SportPicker` widgets |
| **Data** | `OnboardingCubit.addSport()`, `updateSportSkill()`, `removeSport()` |

| Element | Widget | Purpose |
|---------|--------|---------|
| Sport card | `Card` (`_SportCard`) | Shows sport name, remove button, skill slider |
| Skill slider | `Slider` (3 divisions) | Beginner / Intermediate / Advanced |
| Add sport | `DropdownButton` (`_SportPicker`) | Pick from remaining `kSports` |
| Continue | `FilledButton` | Disabled until ≥1 sport selected |

---

### Step 4: Privacy & club

| | |
|---|---|
| **File** | `lib/features/onboarding/screens/privacy_club_screen.dart` |
| **Purpose** | Women-only visibility toggle + club affiliation |
| **How built** | `StatefulWidget` + `BlocBuilder`; finishes onboarding via parent callback |

| Element | Widget | Purpose |
|---------|--------|---------|
| Women-only card | `Card` + `Switch` | Female users only — hide profile from men |
| Club dropdown | `DropdownButtonFormField` | From `kClubs` |
| Finish setup | `FilledButton` | Triggers profile save in parent |

---

## Main app shell

### Home shell

| | |
|---|---|
| **File** | `lib/app/home_shell.dart` |
| **Purpose** | Post-onboarding container: bottom nav, banners, test mode FAB |
| **How built** | `StatefulWidget` + `IndexedStack` (preserves tab state) + `NavigationBar` (Material 3) |
| **Tabs** | 0 = Discover, 1 = Matches |

| Element | Widget | Purpose |
|---------|--------|---------|
| Email verification banner | `MaterialBanner` | Prompt unverified users to verify email |
| Resend | `TextButton` | `AuthService.sendEmailVerification()` |
| Refresh | `TextButton` | `AuthService.reloadUser()` |
| Test mode banner | Orange `Container` | Visible when test mode on |
| Tab content | `IndexedStack` | `DeckScreen` / `MatchesScreen` (keyed by test mode) |
| Bottom nav | `NavigationBar` | Discover + Matches |
| Test mode FAB | `FloatingActionButton.small` | Admin only (`isTestAdminEmail`) |
| FCM deep link | `initState` post-frame | Opens `ChatScreen` if notification tapped |

**Exported widget:** `HomeSettingsButton` — settings `IconButton` pushed from Discover/Matches AppBars.

---

## Discover tab

### Deck screen

| | |
|---|---|
| **File** | `lib/features/deck/screens/deck_screen.dart` |
| **Purpose** | Core swipe-to-match experience |
| **How built** | `BlocProvider<DeckCubit>` → `_DeckView` (`StatefulWidget`) + `BlocConsumer` |
| **Data** | `DeckRepository` queries Firestore for nearby compatible players |
| **Swipe** | `flutter_card_swiper` `CardSwiper`; right = like, left = pass |
| **Match** | `BlocConsumer` listener shows match dialog when `state.matchWith` set |

#### AppBar actions

| Button | Icon | Action |
|--------|------|--------|
| Filters | `Icons.tune` | Opens filters bottom sheet |
| Refresh | `Icons.refresh` | `DeckCubit.refreshDeck()` |
| Settings | `HomeSettingsButton` | → Settings |

#### Body states

| State | UI | Purpose |
|------|-----|---------|
| Loading | Center `CircularProgressIndicator` | Fetching deck |
| Error | Error text + Retry `FilledButton` | Network/permission failure |
| Empty (loading more) | Spinner | Pagination in progress |
| Empty (no players) | Inbox icon + message + Refresh | No one in range |
| Location error | Full-screen location UI | GPS off / denied — Open settings |
| Location warning | `MaterialBanner` | Degraded distance (city-based) |
| Has cards | `CardSwiper` + action buttons | Active swiping |

#### Active deck elements

| Element | Widget | Purpose |
|---------|--------|---------|
| Swipe cards | `CardSwiper` → `PlayerSwipeCard` | Player profiles |
| Tap card | `GestureDetector` | Opens `showPlayerDetailSheet()` |
| Pass button | `_ActionButton` (red X circle) | Programmatic left swipe |
| Like button | `_ActionButton` (green heart circle) | Programmatic right swipe |
| Pull to refresh | `RefreshIndicator` | Reload deck |
| Load more | `onEnd` callback | Pagination when cards exhausted |

---

## Matches tab

### Matches screen

| | |
|---|---|
| **File** | `lib/features/matches/screens/matches_screen.dart` |
| **Purpose** | List of mutual matches; entry point to chat |
| **How built** | `StatelessWidget` + `StreamBuilder<List<MatchEntry>>` on `MatchesRepository` |
| **Navigation** | Tap row → `ChatScreen` |

| Element | Widget | Purpose |
|---------|--------|---------|
| AppBar | Title "Matches" + `HomeSettingsButton` | |
| Loading | `CircularProgressIndicator` | Initial Firestore load |
| Empty | Heart icon + "No matches yet" | No mutual likes |
| Match row | `ListTile`-style custom row | Avatar, name, "Tap to chat", report, chat icon |
| Avatar | `_MatchAvatar` (40px circle) | Photo or placeholder |
| Report | `ReportUserButton` | Flag user from list |
| Tap | `InkWell` / `onTap` | → Chat |

---

## Chat

### Chat screen

| | |
|---|---|
| **File** | `lib/features/chat/screens/chat_screen.dart` |
| **Purpose** | 1:1 messaging between matched users; match proposals |
| **How built** | `StatefulWidget`; `StreamBuilder` for messages + proposals; scroll pagination for older messages |
| **Gate** | Verifies users are matched (`_verifyMatch`) before showing chat |
| **Repositories** | `ChatRepository`, `BlockRepository` |

#### AppBar

| Element | Widget | Purpose |
|---------|--------|---------|
| Title | Other user's name | |
| Block | Red `IconButton` | Block user (confirmation dialog) |
| Report | `ReportUserButton` | Report sheet |
| Propose Match | `TextButton` + calendar icon | Opens `ProposeMatchSheet` |

#### Proposal banners (conditional)

| Banner | Class | Purpose |
|--------|-------|---------|
| Match scheduled | `_MatchScheduledBanner` | Accepted proposal — venue, date, time |
| Pending (received) | `_PendingProposalBanner` | Accept / Decline buttons |
| Proposal sent | `_ProposalSentBanner` | Waiting for response |

#### Message area

| Element | Widget | Purpose |
|---------|--------|---------|
| Loading | Full-screen spinner | Verifying match |
| Empty | Centered text | "No messages yet. Say hi!" |
| Messages | `ListView` of `_MessageBubble` | Left/right aligned bubbles |
| Load older | Top spinner on scroll up | `loadOlderMessages()` pagination |

#### Message bubble (`_MessageBubble`)

| Property | Value |
|----------|-------|
| Mine | Green background, right-aligned |
| Theirs | Dark surface, left-aligned |
| Shape | Rounded corners with tail on bottom corner |

#### Input bar (`_ChatInput`)

| Element | Widget | Purpose |
|---------|--------|---------|
| Text field | `TextField` | Message compose |
| Send | Green `IconButton` | `ChatRepository.sendMessage()` |

---

## Settings hub & sub-screens

### Settings screen

| | |
|---|---|
| **File** | `lib/features/settings/screens/settings_screen.dart` |
| **Purpose** | Account hub — profile, safety, sign out, delete |
| **How built** | `StatelessWidget` + `ListView` of `ListTile`s |

| Row | Icon | Navigates to | Purpose |
|-----|------|--------------|---------|
| My profile | `person_outline` | `ProfileScreen` | View own profile |
| Edit profile | `edit_outlined` | `EditProfileScreen` | Change details |
| Blocked users | `block_outlined` | `BlockedUsersScreen` | Manage blocks |
| Safety & guidelines | `shield_outlined` | `SafetyScreen` | Community rules |
| Admin moderation | `admin_panel_settings` | `AdminModerationScreen` | Admin email only |
| Sign out | `logout` (red) | — | `AuthService.signOut()` |
| Delete account | `delete_forever` (red) | Confirmation dialog | `UserRepository.deleteAccount()` |

---

### Profile screen (view)

| | |
|---|---|
| **File** | `lib/features/profile/screens/profile_screen.dart` |
| **Purpose** | Read-only view of current user's profile |
| **How built** | `StatefulWidget`; loads profile from `UserRepository` |

| Element | Purpose |
|---------|---------|
| Large avatar (112px) | Profile photo |
| Name + verified badge | Identity |
| Age • city | Basic info |
| Club (green) | Affiliation if not "None" |
| Info rows | Gender, women-only flag |
| Sport cards | Icon, name, skill per sport |
| Edit icon (AppBar) | → Edit profile |

---

### Edit profile screen

| | |
|---|---|
| **File** | `lib/features/profile/screens/edit_profile_screen.dart` |
| **Purpose** | Update profile fields and sports |
| **How built** | `StatefulWidget` + `Form`; mirrors onboarding fields |

| Element | Purpose |
|---------|---------|
| `ProfilePhotoPicker` | Change photo |
| Name, age, city, gender fields | Same as onboarding |
| Women-only `SwitchListTile` | Female only |
| Club dropdown | |
| Sports list | `ListTile` per sport + edit → skill `SimpleDialog` |
| Save changes `FilledButton` | `UserRepository.updateProfile()` |

---

### Blocked users screen

| | |
|---|---|
| **File** | `lib/features/settings/screens/blocked_users_screen.dart` |
| **Purpose** | List blocked users; unblock |
| **How built** | `StatefulWidget`; loads from `BlockRepository` |

| State | UI |
|-------|-----|
| Loading | Spinner |
| Empty | "No blocked users" |
| List | Name, city, Unblock `TextButton` |

---

### Safety & guidelines screen

| | |
|---|---|
| **File** | `lib/features/settings/screens/safety_screen.dart` |
| **Purpose** | Static community rules and reporting info |
| **How built** | `StatelessWidget` + scrollable `_Section` widgets |

| Section | Content |
|---------|---------|
| Community guidelines | Respect, show up, sports-focused |
| Reporting | How to report, what happens |
| Blocking | How to block |
| Footer | `support@khelkhiladi.app` |

---

### Admin moderation screen

| | |
|---|---|
| **File** | `lib/features/settings/screens/admin_moderation_screen.dart` |
| **Purpose** | Review flagged users (admin only) |
| **How built** | `StatefulWidget`; Firestore query for `flaggedForReview` users |
| **Actions** | `PopupMenuButton` — Clear flag, Mark/Remove verified |
| **Refresh** | Pull-to-refresh |

---

## Modals, sheets & dialogs

### Filters sheet (Discover)

| | |
|---|---|
| **File** | `lib/features/deck/screens/deck_screen.dart` — `_showFilters()` |
| **Purpose** | Filter deck by sport and max distance |
| **How built** | `showModalBottomSheet` + `StatefulBuilder` |

| Element | Purpose |
|---------|---------|
| Sport dropdown | "Any shared sport" or specific sport |
| Distance slider | 5–20 km via `DeckCubit.setMaxDistance()` |

---

### Match dialog

| | |
|---|---|
| **File** | `lib/features/deck/screens/deck_screen.dart` — `_showMatchOverlay()` |
| **Purpose** | Celebrate mutual like; offer chat or keep swiping |
| **How built** | `showDialog` with custom content |

| Element | Purpose |
|---------|---------|
| "It's a Match!" badge | Green pill |
| Matched avatar | 80×80 photo |
| Name + sport | Identity |
| Message `FilledButton` | → `ChatScreen` |
| Keep swiping `TextButton` | Dismiss dialog |

---

### Player detail sheet

| | |
|---|---|
| **File** | `lib/features/deck/widgets/player_detail_sheet.dart` — `showPlayerDetailSheet()` |
| **Purpose** | Expanded player info from deck tap |
| **How built** | `showModalBottomSheet` with drag handle |

| Element | Purpose |
|---------|---------|
| Name + verified badge | Identity |
| Report button | `ReportUserButton` |
| Skill, sport, club, distance | Details |
| Sport chips | All sports with icons |
| Block user `OutlinedButton` | Block + refresh deck |

---

### Propose match sheet

| | |
|---|---|
| **File** | `lib/features/chat/widgets/propose_match_sheet.dart` |
| **Purpose** | Propose venue, date, time for a real-world game |
| **How built** | `showModalBottomSheet`; native date/time pickers |

| Element | Purpose |
|---------|---------|
| Venue dropdown | From `kVenues` |
| Date `ListTile` | `showDatePicker` |
| Time `ListTile` | `showTimePicker` |
| Send proposal `FilledButton` | Writes to Firestore via `ChatRepository` |

---

### Report sheet

| | |
|---|---|
| **File** | `lib/features/report/widgets/report_user_button.dart` — `_openReportSheet()` |
| **Purpose** | Report harassment, no-show, etc. |
| **How built** | `showModalBottomSheet` + `StatefulBuilder` |
| **Used on** | Swipe card, detail sheet, matches list, chat |

| Element | Purpose |
|---------|---------|
| Reason dropdown | `kReportReasons` |
| Details field | Optional `TextField` (3 lines) |
| Submit `FilledButton` (red) | `ReportRepository.submitReport()` |

---

### Confirmation dialogs

| Dialog | File | Purpose |
|--------|------|---------|
| Block user? | `chat_screen.dart` | Confirm block before `BlockRepository` |
| Delete account? | `settings_screen.dart` | Irreversible account deletion |
| Skill picker | `edit_profile_screen.dart` | `SimpleDialog` — Beginner / Intermediate / Advanced |

---

## Reusable widgets

### ProfilePhotoPicker

| | |
|---|---|
| **File** | `lib/features/profile/widgets/profile_photo_picker.dart` |
| **Purpose** | Tap-to-pick profile photo from gallery |
| **How built** | `StatefulWidget`; `ImagePicker` + `compressPickedImage()`; shows `CircleAvatar` with camera badge |
| **Used on** | Onboarding step 2, Edit profile |

---

### PlayerSwipeCard

| | |
|---|---|
| **File** | `lib/features/deck/widgets/player_swipe_card.dart` |
| **Purpose** | Single discover card in the swipe deck |
| **How built** | `StatelessWidget`; `Stack` overlays on photo; `CachedNetworkImage` |
| **Overlays** | Skill badge (top-left), distance chip (top-right), sport chip (bottom), name row + report |

---

### ReportUserButton

| | |
|---|---|
| **File** | `lib/features/report/widgets/report_user_button.dart` |
| **Purpose** | Consistent report entry point anywhere a user is shown |
| **How built** | `TextButton.icon` (red flag) → opens report bottom sheet |

---

### sportIcon()

| | |
|---|---|
| **File** | `lib/features/deck/widgets/sport_icon.dart` |
| **Purpose** | Map sport name → Material icon for chips and profile |
| **How built** | Top-level function returning `Icon` widget |

---

### HomeSettingsButton

| | |
|---|---|
| **File** | `lib/app/home_shell.dart` |
| **Purpose** | Shared settings navigation from Discover and Matches AppBars |
| **How built** | `IconButton` → `Navigator.push(SettingsScreen)` |

---

### Internal deck helpers

| Widget | File | Purpose |
|--------|------|---------|
| `_ActionButton` | `deck_screen.dart` | Circular pass/like buttons |
| `_MatchAvatar` | `matches_screen.dart` | Small circular match photo |
| `_Section` | `safety_screen.dart` | Titled guideline block |
| `_SportCard` / `_SportPicker` | `sport_selection_screen.dart` | Onboarding sport UI |

---

## Data constants (dropdown options)

| Constant file | Values | Used on |
|---------------|--------|---------|
| `onboarding_constants.dart` → `kCities` | Karachi, Lahore, Islamabad, Rawalpindi | Profile, edit profile |
| `kSports` | Padel, Tennis, Squash, Snooker, Chess | Sport selection, deck filter |
| `kSkillLevels` | Beginner, Intermediate, Advanced | Sport cards, edit profile |
| `kClubs` | None, DHA Club, Karachi Gymkhana, … | Privacy step, edit profile |
| `kGenders` | male, female | Profile details |
| `report_constants.dart` → `kReportReasons` | Harassment, No-Show, Inappropriate Content, Other | Report sheet |
| `chat_constants.dart` → `kVenues` | Legends Arena, DHA Phase 6, … | Propose match sheet |

---

## Transient feedback (SnackBars)

SnackBars are used across the app (not separate screens):

| Trigger | Message (typical) |
|---------|-------------------|
| Email verification sent | "Verification email sent" |
| Password reset sent | Reset confirmation |
| Photo upload failed | Error from `ImageUploadService` |
| Block confirmed | "User blocked" |
| Report submitted | "Report submitted" |
| Chat send error | Error text |
| Profile save error | Error text |

---

## Screen count summary

| Category | Count | Files |
|----------|-------|-------|
| System | 2 | `main.dart`, `auth_gate.dart` |
| Onboarding | 4 steps + 1 shell | 5 files in `onboarding/screens/` |
| Main tabs | 2 | `deck_screen.dart`, `matches_screen.dart` |
| Chat | 1 | `chat_screen.dart` |
| Settings & profile | 6 | `settings`, `profile`, `edit_profile`, `blocked`, `safety`, `admin` |
| Shell | 1 | `home_shell.dart` |
| Modals/sheets | 6 | filters, match, detail, propose, report, test mode |
| Reusable widgets | 5 | photo picker, swipe card, report button, sport icon, settings button |

**Total distinct full-screen views: 16**  
**Total overlays/sheets/dialogs: 6+**  
**Total reusable UI components: 5 (+ internal helpers)**

---

## Redesign notes

When rebuilding UI from scratch, preserve these **behavioral contracts** even if visuals change:

1. **Auth gate logic** — unsigned → onboarding; incomplete profile → step 2; complete → home
2. **Deck swipe directions** — right = like, left = pass; match dialog on mutual like
3. **Chat gated on match** — only matched users can message
4. **Women-only visibility** — female-only privacy toggle affects discovery queries
5. **Report + block flows** — must remain accessible from card, detail, matches, chat
6. **Test mode** — admin FAB and orange banner are dev/demo features
7. **Location degradation** — app works with city-based distance if GPS denied

---

*Generated for KhelKhiladi UI redesign. Source: `lib/` Flutter codebase.*
