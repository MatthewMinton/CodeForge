# CodeForge — Installation Guide

This guide covers three installation paths:

1. **Node.js server** — simplest, runs in your browser, requires Node.js
2. **Electron desktop app (development mode)** — runs as a native window, requires Node.js
3. **Electron desktop app (built installer)** — standalone .exe or .dmg, no Node.js required after building

All three paths require Node.js for the initial setup. Only path 3 produces something you can distribute to others who don't have Node.js installed.

---

## Step 1 — Install Node.js

You only need to do this once. If you already have Node.js installed, skip to Step 2.

### Windows

1. Go to **https://nodejs.org**
2. Click the button labeled **LTS** (Long Term Support) — not "Current"
3. Run the downloaded installer (`node-v20.x.x-x64.msi` or similar)
4. Click through the installer with all default settings. Make sure the checkbox for **"Add to PATH"** is checked — it should be by default.
5. When the installer finishes, open **PowerShell** (press Windows key, type `powershell`, press Enter)

Verify the installation worked by running:

```
node --version
npm --version
```

You should see output like:

```
v20.11.0
10.2.4
```

The exact numbers don't matter as long as Node is version 18 or higher. If you see an error like `'node' is not recognized`, close PowerShell and reopen it, then try again.

### Mac

1. Go to **https://nodejs.org**
2. Click the button labeled **LTS**
3. Run the downloaded installer (`node-v20.x.x.pkg` or similar)
4. Click through the installer with all default settings
5. Open **Terminal** (press Cmd+Space, type `terminal`, press Enter)

Verify the installation:

```
node --version
npm --version
```

You should see version numbers similar to above. If you see `command not found`, close Terminal and reopen it.

---

## Step 2 — Download the project files

### If cloning from GitHub

Open PowerShell (Windows) or Terminal (Mac) and run:

```
git clone https://github.com/yourusername/codeforge.git
cd codeforge
```

If you don't have git installed, you can install it from **https://git-scm.com** or download the files directly from GitHub using the green "Code" button and selecting "Download ZIP". Extract the ZIP and open a terminal in that folder.

### If downloading files manually

Create a folder somewhere on your computer. A good location is:

- Windows: `C:\Users\YourName\codeforge\`
- Mac: `/Users/YourName/codeforge/`

Place the project files in that folder. When you're done, the folder should contain at minimum:

```
codeforge/
  main.js
  preload.js
  package.json
  index.html
  README.md
  .gitignore
  assets/
    icon.svg
  curriculum/
```

---

## Path A — Running without Electron (Node.js server in browser)

This path uses a small Node.js server to handle the Anthropic API proxy and serves the app in your regular browser. It is the simplest way to get started.

**Files needed for this path:**

```
codeforge/
  server.js       (different from main.js — download from the releases page)
  package.json    (the server version — check that it lists express as a dependency)
  index.html
  .env            (you create this — see below)
```

Note: The server version of `package.json` is different from the Electron version. The server version lists `express`, `dotenv`, and `open` as dependencies. The Electron version lists `electron` and `electron-store`.

### Step A1 — Create the .env file

In your project folder, create a new file called `.env` (note: the filename starts with a dot and has no extension).

**Windows PowerShell:**

```powershell
New-Item -Path .env -ItemType File
notepad .env
```

**Mac Terminal:**

```bash
touch .env
open -e .env
```

In the file, add this single line:

```
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

Replace `sk-ant-api03-your-actual-key-here` with your real API key. Save the file and close the editor.

To get an API key:
1. Go to **https://console.anthropic.com**
2. Sign in or create an account
3. Click **API Keys** in the left sidebar
4. Click **Create Key**, give it a name, and copy the key immediately — it is only shown once

### Step A2 — Install dependencies

In your terminal, make sure you are in the project folder (use `cd codeforge` if you are not), then run:

```
npm install
```

You will see output like this (it may take 30–60 seconds):

```
added 87 packages, and audited 88 packages in 12s

4 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

The exact numbers will differ. As long as it says `found 0 vulnerabilities` at the end without any `ERR!` lines, the installation succeeded.

### Step A3 — Start the app

```
npm start
```

You should see:

```
  +---------------------------------+
  |                                 |
  |   CodeForge is running!         |
  |   http://localhost:3000         |
  |                                 |
  |   Press Ctrl+C to stop          |
  +---------------------------------+
```

Your browser should open automatically to `http://localhost:3000`. If it does not, open your browser manually and go to that address.

### Step A4 — Using the app

The curriculum loads automatically on first launch. Your progress and notes are saved to your browser's local storage and persist between sessions.

The AI hints use the API key from your `.env` file. If the key is missing or wrong, the hint button will show an error message instead of a hint.

To stop the server, go back to the terminal and press `Ctrl+C`.

### Running it again in the future

Every time you want to use CodeForge, open a terminal, navigate to your project folder, and run `npm start`. There is no need to run `npm install` again.

To make this easier on Windows, you can create a batch file. Create a new file called `start-codeforge.bat` in your project folder with these contents:

```bat
@echo off
cd /d "%~dp0"
npm start
pause
```

Double-clicking this file will launch CodeForge without needing to open a terminal manually.

---

## Path B — Running with Electron in development mode

This path opens CodeForge as a native desktop window rather than in your browser. It looks and behaves like a regular app but still requires Node.js to be installed.

This is the recommended way to use CodeForge day-to-day if you are comfortable with a terminal.

**Files needed for this path:**

```
codeforge/
  main.js
  preload.js
  package.json    (the Electron version — lists electron as a dependency)
  index.html
  assets/
    icon.svg
  curriculum/
```

There is no `.env` file for this path. The API key is entered through the Settings screen inside the app and stored in your OS keychain.

### Step B1 — Install dependencies

In your terminal, navigate to the project folder and run:

```
npm install
```

The output will be similar to Path A but will include Electron being downloaded, which is larger (approximately 80MB). The download may take a minute or two depending on your connection speed. This is normal.

```
added 142 packages, and audited 143 packages in 45s
```

### Step B2 — Start the app

```
npm start
```

A window titled **CodeForge** will open. The first launch will be slightly slower as the curriculum is seeded to local storage — subsequent launches will be instant.

### Step B3 — Add your API key

1. Click **Settings** in the left sidebar
2. In the **Anthropic API Key** section, paste your key into the input field
3. Click **Save**
4. Click **Test connection** to verify it is working

The key is encrypted by your operating system and stored in the keychain (Windows Credential Manager or Mac Keychain). It is never written to disk in plain text and never appears in any file in the project folder.

### Step B4 — Adding new language packs (optional)

When new language curricula are released (TypeScript, SQL, Rust), place the JSON file in the `curriculum/` folder inside your project directory and restart the app. The new language will appear in the sidebar automatically.

```
codeforge/
  curriculum/
    typescript.json   <-- place file here
    sql.json
    rust.json
```

### Running it again in the future

Navigate to the project folder in your terminal and run `npm start`.

---

## Path C — Building a standalone installer

This path produces a proper installer that does not require Node.js or any other software on the target machine. The result is a standard `.exe` installer on Windows or `.dmg` on Mac.

This path uses the same files as Path B. The only additional requirement is platform-specific icon files.

### Step C1 — Prepare app icons (recommended but not required)

Without icon files, the app will use a generic Electron icon. To use the CodeForge icon:

1. Open **https://cloudconvert.com/svg-to-ico**
2. Upload `assets/icon.svg`
3. Download the result and save it as `assets/icon.ico`
4. Open **https://cloudconvert.com/svg-to-icns** (Mac icon, do this on Mac)
5. Upload `assets/icon.svg`
6. Download the result and save it as `assets/icon.icns`

### Step C2 — Build the Windows installer

Run this from your project folder:

```
npm run build:win
```

This will take several minutes. You will see progress output as electron-builder packages the application. When it finishes:

```
  • building        target=nsis file=dist/Setup-CodeForge-1.0.0.exe
  • building        target=portable file=dist/CodeForge-1.0.0.exe
  • done
```

Your installer is at `dist/Setup-CodeForge-1.0.0.exe`.

**What the installer does:**
- Lets the user choose an installation directory (default is `C:\Program Files\CodeForge\`)
- Creates a Start Menu shortcut
- Creates a Desktop shortcut (optional during install)
- Adds an entry to Windows Add/Remove Programs
- Creates a standard uninstaller

To install on your own machine, just double-click the `.exe` file and follow the prompts. To distribute to others, send them this `.exe` file.

### Step C3 — Build the Mac installer (must be done on a Mac)

```
npm run build:mac
```

Output: `dist/CodeForge-1.0.0.dmg`

The `.dmg` is a standard Mac disk image. When opened, it shows a window with the app icon and an Applications folder shortcut — the user drags the app to Applications to install it.

### Step C4 — First launch of the installed app

When someone opens CodeForge for the first time after installing from the `.exe` or `.dmg`:

1. The app opens and automatically loads the curriculum (Python and JavaScript are embedded)
2. They click **Settings** in the sidebar
3. They paste their own Anthropic API key and click **Save**
4. Everything is ready to use

Their progress, notes, and API key are stored locally on their machine and persist across app updates.

### A note on code signing

For wide distribution, Windows and Mac apps should be code-signed. Without signing:

- Windows: SmartScreen will show a warning on first launch ("Windows protected your PC"). The user can click "More info" and then "Run anyway".
- Mac: Gatekeeper will block the app unless the user right-clicks it and selects "Open".

Code signing requires a paid certificate ($99/year for Apple Developer Program, ~$200-$400/year for a Windows code signing certificate). For personal use or sharing with people you know, signing is not necessary.

---

## Troubleshooting

### "npm is not recognized" or "node is not recognized"

Node.js is not installed or was not added to your PATH. Reinstall Node.js from nodejs.org, making sure the "Add to PATH" option is checked during installation. Close and reopen your terminal after installing.

### npm install fails with permission errors on Mac

Run the command with sudo:

```
sudo npm install
```

Enter your Mac password when prompted.

### The app window opens but shows a blank white screen

This usually means the HTML file could not be loaded. Make sure `index.html` is in the same folder as `main.js`. Check the terminal output for error messages.

### "Error: ENOENT: no such file or directory" during npm start

You are running `npm start` from the wrong folder. Use `cd` to navigate to the folder containing `package.json`.

### The AI hint shows "Add your API key in Settings"

Your API key has not been saved yet. Click **Settings** in the sidebar, paste your key, and click **Save**.

### Python lessons show "Python unavailable — check connection"

The Python runtime (Pyodide) loads from a CDN on first use and requires an internet connection. Once loaded it is cached. If you are offline, Python lessons will not be available until you reconnect.

---

## Summary

| Path | Requires | End result | Best for |
|------|----------|------------|----------|
| A — Node.js server | Node.js | Runs in browser | Quick setup, dev use |
| B — Electron dev mode | Node.js | Native app window | Day-to-day personal use |
| C — Built installer | Node.js (build only) | Standalone .exe/.dmg | Sharing with others |
