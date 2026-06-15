const { autoUpdater } = require('electron-updater')
const { ipcMain, dialog, app, shell } = require('electron')

// Auto-updater configuration
// Requires GitHub releases with proper publish config in electron-builder.yml
//
// SAFETY GUARD: We NEVER auto-download or auto-install updates.
// Instead we notify the user and let them choose.
// This prevents:
//   - macOS code signature failures on unsigned builds
//   - Windows permission issues during silent installs
//   - Users being caught off-guard by automatic restarts

let mainWindow = null
let updateCheckInterval = null
let installCallbacks = null
const isMac = process.platform === 'darwin'

// How often to check for updates (in production) - 30 minutes
const UPDATE_CHECK_INTERVAL_MS = 30 * 60 * 1000

function sendStatusToWindow(status, data = {}) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('updater:' + status, data)
  }
}

// IPC handlers - always registered so the renderer never gets
// "No handler registered for 'updater:check'"
ipcMain.handle('updater:check', async () => {
  if (!app.isPackaged || process.env.NODE_ENV === 'development') {
    return { success: false, error: 'Updater not available in development mode' }
  }
  try {
    const result = await autoUpdater.checkForUpdates()
    return { success: true, updateInfo: result?.updateInfo || null }
  } catch (err) {
    console.error('[AutoUpdater] Manual check failed:', err.message)
    return { success: false, error: err.message }
  }
})

ipcMain.handle('updater:download', async () => {
  if (!app.isPackaged) {
    return { success: false, error: 'Not in packaged app' }
  }
  // On macOS we skip electron-updater download and open the website instead
  if (isMac) {
    const downloadUrl = `https://www.prescribo.co/download`
    shell.openExternal(downloadUrl)
    return { success: true, manual: true }
  }
  try {
    await autoUpdater.downloadUpdate()
    return { success: true }
  } catch (err) {
    console.error('[AutoUpdater] Download failed:', err.message)
    return { success: false, error: err.message }
  }
})

ipcMain.handle('updater:install', () => {
  if (!app.isPackaged || process.env.NODE_ENV === 'development') {
    console.log('[AutoUpdater] Install skipped - development mode')
    return
  }
  if (isMac) {
    // Unsigned macOS apps cannot auto-install. Open the website download page instead.
    const downloadUrl = `https://www.prescribo.co/download`
    shell.openExternal(downloadUrl)
    return
  }
  // Tell the main process this is an update-driven quit so the custom close
  // dialog does not block the installer from launching.
  if (installCallbacks && installCallbacks.onInstall) {
    installCallbacks.onInstall()
  }
  autoUpdater.quitAndInstall(false, true)
})

function initAutoUpdater(window, callbacks = null) {
  mainWindow = window
  installCallbacks = callbacks

  // Don't check for updates in development
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    console.log('[AutoUpdater] Skipping - development mode')
    return
  }

  // CRITICAL: Never auto-download. We notify the user and let them choose.
  autoUpdater.autoDownload = false

  // Periodic checks
  updateCheckInterval = setInterval(() => {
    checkForUpdates()
  }, UPDATE_CHECK_INTERVAL_MS)

  // Event handlers
  autoUpdater.on('checking-for-update', () => {
    console.log('[AutoUpdater] Checking for update...')
    sendStatusToWindow('checking')
  })

  autoUpdater.on('update-available', (info) => {
    console.log('[AutoUpdater] Update available:', info.version)
    sendStatusToWindow('available', {
      version: info.version,
      releaseDate: info.releaseDate,
    })
  })

  autoUpdater.on('update-not-available', (info) => {
    console.log('[AutoUpdater] No update available. Current:', info.version)
    sendStatusToWindow('not-available', { version: info.version })
  })

  autoUpdater.on('error', (err) => {
    console.error('[AutoUpdater] Error:', err.message)
    sendStatusToWindow('error', { message: err.message })
  })

  autoUpdater.on('download-progress', (progressObj) => {
    const percent = Math.round(progressObj.percent)
    console.log(`[AutoUpdater] Download progress: ${percent}%`)
    sendStatusToWindow('progress', {
      percent,
      bytesPerSecond: progressObj.bytesPerSecond,
      transferred: progressObj.transferred,
      total: progressObj.total,
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    console.log('[AutoUpdater] Update downloaded:', info.version)
    sendStatusToWindow('downloaded', {
      version: info.version,
      releaseDate: info.releaseDate,
    })
  })
}

function checkForUpdates() {
  if (!app.isPackaged) {
    console.log('[AutoUpdater] Skipping check - not packaged')
    return
  }
  autoUpdater.checkForUpdates().catch((err) => {
    console.error('[AutoUpdater] Check failed:', err.message)
  })
}

function stopAutoUpdater() {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval)
    updateCheckInterval = null
  }
}

module.exports = { initAutoUpdater, checkForUpdates, stopAutoUpdater }
