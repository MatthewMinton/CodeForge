const { app, BrowserWindow, ipcMain, safeStorage, shell, Menu, nativeTheme } = require('electron')
const Store = require('electron-store')
const path  = require('path')

// ── Persistent store (survives reinstalls, stored in app data folder) ────────
const store = new Store({
  name: 'codeforge-data',
  defaults: {
    progress:   null,
    apiKey:     null,   // encrypted via safeStorage
    windowBounds: { width: 1280, height: 800 },
  }
})

nativeTheme.themeSource = 'dark'

// ── Create main window ───────────────────────────────────────────────────────
function createWindow() {
  const { width, height } = store.get('windowBounds')

  const win = new BrowserWindow({
    width,
    height,
    minWidth:  900,
    minHeight: 600,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#080b14',
    icon: path.join(__dirname, 'assets',
      process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,    // security: no direct Node in renderer
      sandbox:          false,    // needed for preload
    },
    show: false,  // wait until ready to show (avoids flash)
  })

  // Save window size on close
  win.on('resize', () => {
    const [width, height] = win.getSize()
    store.set('windowBounds', { width, height })
  })

  // Show when ready
  win.once('ready-to-show', () => {
    win.show()
    if (process.env.NODE_ENV === 'development') {
      win.webContents.openDevTools()
    }
  })

  // Open external links in system browser, not Electron
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Suppress all confirm/alert/prompt dialogs from renderer
  // Electron shows these as native dialogs by default which is disruptive
  win.webContents.on('will-prevent-unload', e => e.preventDefault())

  // Handle any remaining dialog calls — return true (OK) silently
  const { dialog } = require('electron')
  win.webContents.executeJavaScript(`
    window.confirm = () => true;
    window.alert   = () => {};
    window.prompt  = () => null;
  `).catch(() => {})

  win.once('ready-to-show', () => {
    // Re-apply after page loads to override any late definitions
    win.webContents.executeJavaScript(`
      window.confirm = () => true;
      window.alert   = () => {};
      window.prompt  = () => null;
    `).catch(() => {})
  })

  win.loadFile('index.html')
  return win
}

// ── App menu ─────────────────────────────────────────────────────────────────
function buildMenu() {
  const template = [
    ...(process.platform === 'darwin' ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' },  { role: 'copy' }, { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        {
          label: 'Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          click: (_, win) => win?.webContents.toggleDevTools()
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(process.platform === 'darwin' ? [
          { type: 'separator' },
          { role: 'front' }
        ] : [
          { role: 'close' }
        ])
      ]
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

// ── IPC handlers ─────────────────────────────────────────────────────────────

// Anthropic API proxy — key never touches the renderer process
ipcMain.handle('api:anthropic', async (_, body) => {
  const encryptedKey = store.get('apiKey')
  if (!encryptedKey) {
    return { error: 'NO_KEY', message: 'API key not set. Go to Settings to add it.' }
  }

  let apiKey
  try {
    apiKey = safeStorage.decryptString(Buffer.from(encryptedKey, 'base64'))
  } catch {
    return { error: 'DECRYPT_FAILED', message: 'Could not decrypt API key.' }
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    })
    return await res.json()
  } catch (err) {
    return { error: 'FETCH_FAILED', message: err.message }
  }
})

// API key management
ipcMain.handle('settings:getKeyStatus', () => {
  const encrypted = store.get('apiKey')
  return { hasKey: !!encrypted }
})

ipcMain.handle('settings:saveKey', (_, plainKey) => {
  try {
    if (!plainKey || !plainKey.startsWith('sk-ant-')) {
      return { ok: false, error: 'Key must start with sk-ant-' }
    }
    const encrypted = safeStorage.encryptString(plainKey)
    store.set('apiKey', encrypted.toString('base64'))
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err.message }
  }
})

ipcMain.handle('settings:clearKey', () => {
  store.delete('apiKey')
  return { ok: true }
})

// Progress persistence (replaces localStorage for cross-reinstall survival)
ipcMain.handle('store:get', (_, key)      => store.get(key, null))
ipcMain.handle('store:set', (_, key, val) => { store.set(key, val); return true })
ipcMain.handle('store:delete', (_, key)   => { store.delete(key);    return true })

// App info
ipcMain.handle('app:version', () => app.getVersion())

// ── Lifecycle ────────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  buildMenu()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
