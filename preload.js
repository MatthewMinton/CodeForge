/**
 * preload.js — Security bridge between Electron's main process and the renderer.
 *
 * contextIsolation: true means the renderer has NO access to Node.js APIs.
 * This file runs in a privileged context and exposes ONLY what we explicitly allow
 * via contextBridge. This is the correct Electron security model.
 */
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {

  // Anthropic API (key lives in main process, never exposed to renderer)
  callAnthropic: (body) => ipcRenderer.invoke('api:anthropic', body),

  // Settings — API key management
  getKeyStatus:  ()         => ipcRenderer.invoke('settings:getKeyStatus'),
  saveApiKey:    (key)      => ipcRenderer.invoke('settings:saveKey', key),
  clearApiKey:   ()         => ipcRenderer.invoke('settings:clearKey'),

  // Persistent store (replaces localStorage — survives reinstalls)
  storeGet:      (key)      => ipcRenderer.invoke('store:get', key),
  storeSet:      (key, val) => ipcRenderer.invoke('store:set', key, val),
  storeDelete:   (key)      => ipcRenderer.invoke('store:delete', key),

  // App info
  getVersion:    ()         => ipcRenderer.invoke('app:version'),

  // Platform info (for UI adjustments)
  platform: process.platform,   // 'win32' | 'darwin' | 'linux'
})
