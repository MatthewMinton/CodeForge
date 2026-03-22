# CodeForge

An interactive code learning platform for Python and JavaScript, built with Electron. Runs as a native desktop app on Windows and Mac with no browser or internet connection required for core functionality.

Lessons cover Beginner through Expert levels across two languages (168 total), with a built-in code runner, test evaluation, and optional AI hints powered by the Anthropic API.

---

## Installation

See [INSTALL.md](INSTALL.md) for complete step-by-step instructions covering all three setup paths:

- Running via Node.js server (simplest, no Electron)
- Running in Electron development mode (native window, requires Node.js)
- Building a standalone installer (no dependencies for end users)

---

## Quick start

```bash
git clone https://github.com/yourusername/codeforge.git
cd codeforge
npm install
npm start
```

---

## Requirements

- Node.js 18 or later
- npm 9 or later

---

## Building installers

### Windows

```bash
npm run build:win
```

Output: `dist/Setup-CodeForge-1.0.0.exe`

### Mac

```bash
npm run build:mac
```

Output: `dist/CodeForge-1.0.0.dmg`

Building for Mac requires running on a Mac. Building for Windows can be done on any platform.

---

## API key setup

AI hints are powered by the Anthropic API. To enable them:

1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. Open the app and click **Settings** in the sidebar
3. Paste your key and click **Save**

The key is encrypted using your operating system's keychain (`safeStorage`) and never stored in plain text. It costs roughly $0.001 per hint at current pricing. All other features work without a key.

---

## Adding new languages

Place a language JSON file in the `curriculum/` folder next to the app and restart. The new language appears in the sidebar automatically without rebuilding the installer.

Languages currently embedded:

| Language | Lessons | Stages |
|----------|---------|--------|
| Python | 86 | Beginner, Intermediate, Practical, Advanced, Expert |
| JavaScript | 82 | Beginner, Intermediate, Practical, Advanced, Expert |

Languages in development: TypeScript, SQL, Rust.

---

## Data storage

| Data | Location |
|------|----------|
| Progress and XP | App data folder via electron-store |
| Notes | App data folder via electron-store |
| API key | OS keychain via safeStorage |
| Curriculum | Embedded in index.html, optionally extended by curriculum/ folder |

Progress persists across app updates.

---

## Project structure

```
codeforge/
  main.js         Electron main process — window management, IPC handlers, API proxy
  preload.js      Context bridge — exposes a safe, limited API to the renderer
  index.html      The full application with curriculum embedded at build time
  package.json    Dependencies and electron-builder configuration
  assets/         App icons
  curriculum/     Optional external curriculum files (JSON, not tracked by git)
  dist/           Built installers (generated, not tracked by git)
```

---

## How it works

Electron runs two processes. The main process (`main.js`) has full Node.js access and handles the Anthropic API calls, key storage, and persistent data. The renderer process (`index.html`) is a sandboxed browser context with no direct Node.js access. Communication between them goes through a tightly controlled IPC bridge (`preload.js`), which means the API key is never accessible from the JavaScript that renders the UI.

---

## About this project

CodeForge was designed and built entirely through prompt engineering using [Claude](https://claude.ai) (Anthropic). The curriculum, application architecture, code, tests, and all supporting documentation were generated through an iterative conversation with Claude Sonnet. No code was written by hand.

This project demonstrates what is possible when prompt engineering is treated as a serious engineering discipline rather than a shortcut. The full curriculum — 168 lessons across two languages with real theory, working solutions, and verified expected outputs — was built, tested, and debugged entirely within that workflow.

---

## License

MIT
