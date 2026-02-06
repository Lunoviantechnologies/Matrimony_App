# Install MatrimonyApp on Your Phone (Testing)

Use this guide to build and install the app on your Android phone for testing. Your backend is already running on a server.

---

## 1. Prerequisites

- **Node.js 20+** installed on your PC
- **Android Studio** (or at least Android SDK + platform-tools)
- **USB cable** to connect your phone, or you can copy the APK to the phone later
- Your **backend server URL** (e.g. `https://api.yoursite.com` or `http://YOUR_SERVER_IP:8080`)

---

## 2. Point the App to Your Backend

The app talks to your backend using `BASE_URL` from a `.env` file.

1. In the **MatrimonyApp** folder, create a file named **`.env`** (no .example).
2. Add one line (replace with your real backend URL):

   ```env
   BASE_URL=https://your-actual-backend-server.com
   ```

   Examples:
   - Backend on a cloud server: `BASE_URL=https://api.yourdomain.com`
   - Backend on a VPS with port 8080: `BASE_URL=http://123.45.67.89:8080`
   - **No trailing slash.** Use `http` or `https` as your server uses.

3. Save the file.

---

## 3. Install Dependencies and Build the APK

Open a terminal in the **MatrimonyApp** folder and run:

```bash
cd c:\Users\yash\Desktop\Matrimony_app\MatrimonyApp
npm install
```

Then build a **debug APK** (good for testing; no Play Store signing needed):

```bash
cd android
.\gradlew.bat assembleDebug
cd ..
```

The APK will be created at:

```
MatrimonyApp\android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 4. Install on Your Phone

### Option A: USB (recommended)

1. On your phone: **Settings → Developer options** → turn on **USB debugging**.
   - If you don’t see Developer options: **Settings → About phone** → tap **Build number** 7 times.
2. Connect the phone to your PC with a USB cable.
3. On the PC, run (from **MatrimonyApp** folder):

   ```bash
   adb install android\app\build\outputs\apk\debug\app-debug.apk
   ```

   If `adb` is not in PATH, use the full path, e.g.  
   `C:\Users\yash\AppData\Local\Android\Sdk\platform-tools\adb install android\app\build\outputs\apk\debug\app-debug.apk`

### Option B: Copy APK to phone

1. Copy **`android\app\build\outputs\apk\debug\app-debug.apk`** to your phone (USB, Google Drive, email, etc.).
2. On the phone, open the APK file and tap **Install**.
3. If Android says “Install blocked”: enable **Install from unknown sources** (or “Install unknown apps”) for the app you used to open the file (e.g. Files or Chrome).

---

## 5. Run the App

Open **MatrimonyApp** on your phone. It will use the `BASE_URL` from `.env` to talk to your backend. Log in or register and test.

---

## 6. If You Change `.env` or Code

- After changing **`.env`**: you must **rebuild** the APK and reinstall:
  ```bash
  cd android
  .\gradlew.bat assembleDebug
  cd ..
  ```
  Then install again (Option A or B above).

- After changing **only JavaScript**: you can use **Metro** for faster iteration:
  1. On PC: `npm start` in MatrimonyApp folder.
  2. Connect phone and PC on same Wi‑Fi (or USB with `adb reverse`).
  3. Run `npx react-native run-android` to install and run the app; it will load JS from your PC.

---

## 7. Later: Play Store Release

For Play Store you will:

1. Create a **release keystore** and configure signing in `android/app/build.gradle`.
2. Set `BASE_URL` in `.env` to your **production** API URL.
3. Build a **release** bundle (AAB) or APK:  
   **Build → Generate Signed Bundle / APK** in Android Studio, or use `gradlew bundleRelease`.

Details are in `docs/02_MatrimonyApp_Mobile_App_Documentation.md` (Build & Release section).

---

## Quick checklist

- [ ] `.env` created with `BASE_URL=<your-backend-server-url>`
- [ ] `npm install` done in MatrimonyApp folder
- [ ] `.\gradlew.bat assembleDebug` run in `MatrimonyApp\android`
- [ ] APK installed on phone (USB or copy)
- [ ] Backend is reachable from the phone (same network or public URL)
