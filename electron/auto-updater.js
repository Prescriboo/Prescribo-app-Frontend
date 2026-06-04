const { autoUpdater } = require('electron-updater')
const { ipcMain, dialog, app } = require('electron')

// Auto-updater configuration
// Requires GitHub releases with proper publish config in electron-builder.yml
// macOS NOTE: Auto-updates require code-signed builds. Unsigned macOS apps
// will fail silently or show an error. Use CSC_IDENTITY_AUTO_DISCOVERY=false
// in dev, but sign for production macOS distribution.

let mainWindow = null
let updateCheckInterval = null

// How often to check for updates (in production) — 30 minutes
const UPDATE_CHECK_INTERVAL_MS = 30 * 60 * 1000

function sendStatusToWindow(status, data = {}) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('updater:' + status, data)
  }
}

// IPC handlers — always registered so the renderer never gets
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

ipcMain.handle('updater:install', () => {
  if (!app.isPackaged || process.env.NODE_ENV === 'development') {
    console.log('[AutoUpdater] Install skipped — development mode')
    return
  }
  autoUpdater.quitAndInstall(false, true)
})

function initAutoUpdater(window) {
  mainWindow = window

  // Don't check for updates in development
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    console.log('[AutoUpdater] Skipping — development mode')
    return
  }

  // Optional: force check on start (disabled by default — uncomment if desired)
  // checkForUpdates()

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

    // Show native dialog prompting user to restart
    dialog
      .showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Ready',
        message: `Prescribo ${info.version} is ready to install.`,
        detail: 'The update has been downloaded. Restart the app to apply it.',
        buttons: ['Restart Now', 'Later'],
        defaultId: 0,
        cancelId: 1,
      })
      .then(({ response }) => {
        if (response === 0) {
          autoUpdater.quitAndInstall(false, true)
        }
      })
  })
}

function checkForUpdates() {
  if (!app.isPackaged) {
    console.log('[AutoUpdater] Skipping check — not packaged')
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
