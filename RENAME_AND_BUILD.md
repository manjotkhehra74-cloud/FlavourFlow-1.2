# Rename & Build Guide — Pulse HR

The visible product name is already **Pulse HR**. This file shows how to:
1. Rename the outer folder on your own computer (optional).
2. Build a real installable Android **APK** with EAS.

## 1. Folder rename (on your laptop)

Arena keeps this workspace at `FlavourFlow-1.2/` because the session is bound to it.
On your own machine you can rename it freely:

```bash
# from the parent directory
mv FlavourFlow-1.2 PulseHR
cd PulseHR
```

Then reinstall deps (folder name doesn't affect the app itself):

```bash
cd server && npm install
cd ../mobile && npm install
```

## 2. Change the name again later (if needed)

These are the only places the product name lives:

| File | Key |
|------|-----|
| `mobile/app.json` | `expo.name`, `expo.slug`, `ios.bundleIdentifier`, `android.package` |
| `mobile/package.json` | `name` |
| `mobile/src/screens/LoginScreen.js` | brand text |
| `server/src/db/seed.js` | demo emails (`@pulsehr.app`) |
| `README.md` | headings |
| Android bundle id | `com.pulsehr.app` (change in `app.json` if you want a different one) |

After changing `app.json`, re-run seed only if you changed emails:

```bash
cd server && rm -rf data && npm run seed
```

## 3. Build an Android APK (EAS — no Android Studio needed)

You need a free **Expo account** (https://expo.dev/signup).

```bash
cd mobile

# one-time setup
npm install -g eas-cli
eas login
eas build:configure        # chooses project, creates project ID

# build the APK (cloud build — ~5–10 min)
eas build -p android --profile preview
```

When the build finishes, the terminal prints a **download URL**. Open that
URL on your Android phone and install the APK.

> `eas.json` already contains a `preview` profile that builds an APK and points
> the app at `http://10.0.2.2:4000/api` (the Android emulator alias for
> `localhost`). For a real phone, replace it with your backend's public URL,
> e.g. `https://api.yourdomain.com/api`.

### Testing on a real phone before deploying the backend

Run the backend on your laptop and make sure phone + laptop are on the same Wi-Fi.
Find your laptop's LAN IP (e.g. `192.168.1.42`) and run the app like this:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.42:4000/api npx expo start
```

Then scan the QR with **Expo Go**.

## 4. Brand assets

- App icon: `mobile/assets/icon.png` (1024×1024, deep green + P + ECG pulse)
- Adaptive icon: `mobile/assets/adaptive-icon.png`
- Splash: `mobile/assets/splash.png`

Replace these PNGs with your own artwork at 1024×1024, then re-run the EAS build.

## 5. Demo logins

| Role | Email | Password |
|------|-------|----------|
| Manager | `akshay@pulsehr.app` | `password` |
| Employee | `deepak.c@pulsehr.app` | `password` |
