const { app, BrowserWindow, ipcMain, dialog, shell, screen } = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')
const http = require('http')
const crypto = require('crypto')

// Global error logging (catches main process crashes in packaged builds)
process.on('uncaughtException', (err) => {
  console.error('[MainProcess] Uncaught exception:', err)
})
process.on('unhandledRejection', (reason) => {
  console.error('[MainProcess] Unhandled rejection:', reason)
})

// AppImage/Linux sandbox fix: disable Chromium sandbox when packaged.
// The app loads only local files, so this is safe and prevents crashes
// on distros that don't support unprivileged user namespaces.
if (process.platform === 'linux' && app.isPackaged) {
  app.commandLine.appendSwitch('no-sandbox')
  app.commandLine.appendSwitch('disable-setuid-sandbox')
  app.disableHardwareAcceleration()
}

// Windows: disable hardware acceleration to prevent GPU driver crashes.
// Electron 35 + certain Windows GPU drivers cause renderer crashes after
// the splash screen. This is a common, safe workaround.
if (process.platform === 'win32' && app.isPackaged) {
  app.disableHardwareAcceleration()
}

// Generate a secure local API token to prevent other processes from accessing the backend
function generateApiToken() {
  return crypto.randomBytes(32).toString('hex')
}
let apiToken = generateApiToken()

function getApiToken() {
  return apiToken
}

// IPC Handlers
require('./ipc-handlers/api')
require('./ipc-handlers/database')
require('./ipc-handlers/print')
require('./ipc-handlers/export')
require('./ipc-handlers/license')
require('./ipc-handlers/backup')
require('./ipc-handlers/fs')

const { startBackend, stopBackend } = require('./backend-spawner')
const { setBackendUrl, getBackendUrl, setApiToken } = require('./ipc-handlers/api')
const { initAutoUpdater, stopAutoUpdater } = require('./auto-updater')
const { startStaticServer } = require('./static-server')

let mainWindow
let splashWindow
let licenseGuardianInterval = null
let staticServer = null
let staticServerUrl = null

const isDev = !app.isPackaged
const isMac = process.platform === 'darwin'

// Window state persistence
const windowStatePath = path.join(os.homedir(), '.prescribo', 'window-state.json')

function getWindowState() {
  try {
    if (fs.existsSync(windowStatePath)) {
      return JSON.parse(fs.readFileSync(windowStatePath, 'utf-8'))
    }
  } catch (e) {}
  return { width: 1400, height: 900, x: undefined, y: undefined, maximized: false }
}

function saveWindowState() {
  if (!mainWindow) return
  const bounds = mainWindow.getBounds()
  const state = {
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    maximized: mainWindow.isMaximized(),
  }
  try {
    fs.mkdirSync(path.dirname(windowStatePath), { recursive: true })
    fs.writeFileSync(windowStatePath, JSON.stringify(state))
  } catch (e) {}
}

// ===================== LICENSE GUARDIAN =====================
function apiGet(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, getBackendUrl())
    const req = http.get(url, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try { resolve(JSON.parse(data)) } catch { resolve(data) }
      })
    })
    req.on('error', reject)
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')) })
  })
}

function apiPost(path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, getBackendUrl())
    const postData = JSON.stringify(body)
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: 15000,
    }
    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try { resolve(JSON.parse(data)) } catch { resolve(data) }
      })
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
    req.write(postData)
    req.end()
  })
}

async function checkAndRefreshLicense() {
  try {
    const status = await apiGet('/api/auth/status')
    // Push status to renderer regardless
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('license:status', status)
    }

    // Auto-refresh if access expired but refresh still valid
    if (status.access_expired && !status.refresh_expired && !status.grace_expired) {
      console.log('[LicenseGuardian] Access token expired, refreshing...')
      try {
        await apiPost('/api/auth/refresh', {})
        const refreshed = await apiGet('/api/auth/status')
        console.log('[LicenseGuardian] Token refresh successful')
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('license:status', refreshed)
        }
      } catch (refreshErr) {
        console.warn('[LicenseGuardian] Token refresh failed:', refreshErr.message)
      }
    }

    return status
  } catch (err) {
    console.warn('[LicenseGuardian] Status check failed:', err.message)
    return null
  }
}

function startLicenseGuardian() {
  if (licenseGuardianInterval) return
  console.log('[LicenseGuardian] Starting...')
  // Check immediately on start
  checkAndRefreshLicense()
  // Then every 30 minutes
  licenseGuardianInterval = setInterval(checkAndRefreshLicense, 30 * 60 * 1000)
}

function stopLicenseGuardian() {
  if (licenseGuardianInterval) {
    clearInterval(licenseGuardianInterval)
    licenseGuardianInterval = null
    console.log('[LicenseGuardian] Stopped')
  }
}

// ===================== SPLASH SCREEN =====================
function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 480,
    height: 320,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    movable: true,
    skipTaskbar: true,
    show: false,
    icon: path.join(__dirname, '../resources/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  const splashHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 480px; height: 320px;
      background: linear-gradient(135deg, #1d4ed8 0%, #14b8a6 100%);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      font-family: 'Segoe UI', system-ui, sans-serif;
      border-radius: 16px;
      overflow: hidden;
      -webkit-app-region: drag;
    }
    .logo {
      width: 64px; height: 64px;
      background: white; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    }
    .logo svg { width: 36px; height: 36px; }
    h1 {
      color: white; font-size: 28px; font-weight: 800;
      letter-spacing: 1px; margin-bottom: 6px;
      text-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .subtitle {
      color: rgba(255,255,255,0.85); font-size: 13px;
      font-weight: 500; margin-bottom: 30px;
    }
    .loader {
      width: 180px; height: 3px;
      background: rgba(255,255,255,0.25);
      border-radius: 3px; overflow: hidden;
    }
    .loader-bar {
      width: 0%; height: 100%;
      background: white; border-radius: 3px;
      animation: load 1.8s ease-in-out infinite;
    }
    @keyframes load {
      0% { width: 0%; margin-left: 0%; }
      50% { width: 60%; margin-left: 20%; }
      100% { width: 0%; margin-left: 100%; }
    }
    .version {
      position: absolute; bottom: 16px;
      color: rgba(255,255,255,0.6); font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="logo">
    <svg viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
    </svg>
  </div>
  <h1>Prescribo</h1>
  <div class="subtitle">Desktop Prescription Generator</div>
  <div class="loader"><div class="loader-bar"></div></div>
  <div class="version">v${app.getVersion()}</div>
</body>
</html>`

  splashWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(splashHtml))
  splashWindow.center()
  splashWindow.show()

  // Splash will be closed when mainWindow is ready (see createMainWindow)
}

// ===================== MAIN WINDOW =====================
function createMainWindow() {
  const state = getWindowState()
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenW, height: screenH } = primaryDisplay.workAreaSize

  // Center if no saved position
  let x = state.x
  let y = state.y
  if (x === undefined || y === undefined) {
    x = Math.round((screenW - state.width) / 2)
    y = Math.round((screenH - state.height) / 2)
  }

  mainWindow = new BrowserWindow({
    width: state.width,
    height: state.height,
    x,
    y,
    minWidth: 1024,
    minHeight: 700,
    title: 'Prescribo',
    // Frameless on Windows/Linux for custom titlebar; native on macOS
    frame: isMac,
    titleBarStyle: isMac ? 'hiddenInset' : undefined,
    backgroundColor: '#f8fafc',
    show: false,
    icon: path.join(__dirname, '../resources/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // On Linux packaged builds the Chromium sandbox is disabled at the
      // command-line level; keep the renderer sandbox off to avoid SIGTRAP
      // crashes on distros without unprivileged user namespaces.
      sandbox: !(process.platform === 'linux' && app.isPackaged),
      spellcheck: false,
    },
    // Rounded corners on macOS
    vibrancy: isMac ? 'sidebar' : undefined,
    transparent: false,
  })

  // Load app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    if (staticServerUrl) {
      const url = `${staticServerUrl}/index.html`
      console.log('[MainWindow] Loading from static server:', url)
      mainWindow.loadURL(url)
    } else {
      // Fallback to file protocol (will have RSC navigation issues)
      const indexPath = path.join(__dirname, '../dist/index.html')
      console.warn('[MainWindow] Static server not available, falling back to file://')
      console.log('[MainWindow] Loading:', indexPath)
      mainWindow.loadFile(indexPath)
    }

    // Block DevTools in production
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })
  }

  // DEBUG: forward renderer console errors to main process log
  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    const levels = ['debug', 'log', 'warn', 'error']
    console.log(`[Renderer:${levels[level] || level}] ${sourceId}:${line} ${message}`)
  })

  // DEBUG: catch load failures
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('[MainWindow] Failed to load:', errorCode, errorDescription)
  })

  // DEBUG: catch renderer crashes
  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    console.error('[MainWindow] Renderer process gone:', details.reason, details.exitCode)
  })

  // Uncomment for production debugging:
  // mainWindow.webContents.openDevTools({ mode: 'detach' })

  // Show when ready and dismiss splash
  mainWindow.once('ready-to-show', () => {
    // Close splash before showing main window to avoid visual overlap
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close()
      splashWindow = null
    }
    if (state.maximized) mainWindow.maximize()
    mainWindow.show()
    mainWindow.focus()
    // Initialize auto-updater after window is shown
    initAutoUpdater(mainWindow)
  })

  // Fallback: if ready-to-show never fires (e.g. load failure), show anyway
  const showFallback = setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible() && !mainWindow.isDestroyed()) {
      console.warn('[MainWindow] ready-to-show never fired, showing window anyway')
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close()
        splashWindow = null
      }
      mainWindow.show()
      mainWindow.focus()
      initAutoUpdater(mainWindow)
    }
  }, 8000)
  mainWindow.once('ready-to-show', () => clearTimeout(showFallback))

  // Save state on changes
  mainWindow.on('resize', saveWindowState)
  mainWindow.on('move', saveWindowState)
  mainWindow.on('maximize', saveWindowState)
  mainWindow.on('unmaximize', saveWindowState)

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Block DevTools keyboard shortcuts in production
  if (!isDev) {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      const isDevToolsShortcut =
        (input.key === 'F12') ||
        (input.control && input.shift && input.key.toLowerCase() === 'i') ||
        (input.meta && input.alt && input.key.toLowerCase() === 'i')
      if (isDevToolsShortcut) {
        event.preventDefault()
      }
    })
  }

  // Prevent navigation away from app (allow our static server)
  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (staticServerUrl && url.startsWith(staticServerUrl)) return
    if (url.startsWith('http://localhost') || url.startsWith('file://')) return
    e.preventDefault()
    shell.openExternal(url)
  })

  // Exit confirmation with backup prompt
  let isQuitting = false
  mainWindow.on('close', async (e) => {
    if (isQuitting) return
    e.preventDefault()

    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: 'question',
      buttons: ['Take Backup & Exit', 'Exit Without Backup', 'Cancel'],
      defaultId: 0,
      cancelId: 2,
      title: 'Exit Prescribo',
      message: 'Are you sure you want to exit?',
      detail: 'Would you like to take an offline backup before closing?',
      icon: path.join(__dirname, '../resources/icon.png'),
    })

    if (choice === 2) {
      // Cancel - do nothing
      return
    }

    if (choice === 0) {
      // Take Backup & Exit
      try {
        const { downloadFile } = require('./ipc-handlers/backup')
        const BACKUP_DIR = path.join(os.homedir(), '.prescribo', 'backups')
        if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true })
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const backupPath = path.join(BACKUP_DIR, `prescribo_backup_${timestamp}.db`)
        await downloadFile('/api/backup/download', backupPath)
        console.log('[Exit] Backup saved to:', backupPath)
      } catch (err) {
        console.error('[Exit] Backup failed:', err.message)
        const proceed = dialog.showMessageBoxSync(mainWindow, {
          type: 'warning',
          buttons: ['Exit Anyway', 'Cancel'],
          defaultId: 1,
          cancelId: 1,
          title: 'Backup Failed',
          message: 'Could not create backup.',
          detail: err.message,
        })
        if (proceed === 1) return
      }
    }

    // Exit
    isQuitting = true
    saveWindowState()
    mainWindow.destroy()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// ===================== APP LIFECYCLE =====================
app.whenReady().then(async () => {
  createSplashWindow()

  // Start Python backend in production; in dev it may already be running
  if (!isDev) {
    const appDir = path.dirname(__dirname)
    const port = await startBackend(appDir, apiToken)
    if (port) {
      setBackendUrl(`http://127.0.0.1:${port}`)
      setApiToken(apiToken)
    }

    // Start a tiny HTTP server to serve the Next.js static export.
    // This avoids Next.js App Router client-side navigation issues
    // with the file:// protocol (RSC payload fetches fail on file://).
    const distPath = path.join(__dirname, '../dist')
    const STATIC_SERVER_PORT = 3010
    try {
      const result = await startStaticServer(distPath, STATIC_SERVER_PORT)
      staticServer = result.server
      staticServerUrl = result.url
    } catch (err) {
      console.warn(`[StaticServer] Port ${STATIC_SERVER_PORT} unavailable, falling back to random port:`, err.message)
      try {
        const result = await startStaticServer(distPath, 0)
        staticServer = result.server
        staticServerUrl = result.url
      } catch (fallbackErr) {
        console.error('[StaticServer] Failed to start:', fallbackErr.message)
      }
    }
  } else {
    // In dev, assume backend is on default port or set by env
    setBackendUrl(process.env.API_URL || 'http://127.0.0.1:8000')
  }

  // Create main window immediately so app doesn't quit when splash closes.
  // (The splash window auto-closes after 2.5s; if mainWindow isn't created
  // by then, window-all-closed fires and the app quits on Linux.)
  createMainWindow()

  // Wait a moment for backend to be fully ready, then start license guardian
  setTimeout(() => {
    startLicenseGuardian()
  }, 2000)
})

app.on('window-all-closed', () => {
  if (!isMac) app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})

// macOS: hide instead of quit
app.on('before-quit', () => {
  console.log('[App] before-quit fired')
  saveWindowState()
  stopLicenseGuardian()
  stopBackend()
  stopAutoUpdater()
  if (staticServer) {
    console.log('[StaticServer] Shutting down...')
    staticServer.close()
    staticServer = null
  }
})

app.on('will-quit', (event) => {
  console.log('[App] will-quit fired')
})

// Online/offline awareness
app.on('ready', () => {
  // Electron doesn't have a global online event, but we can use system network events
  // For now, we rely on the periodic guardian check
})

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock()
console.log('[App] Single instance lock acquired:', gotTheLock)
if (!gotTheLock) {
  console.warn('[App] Another instance is running. Quitting.')
  app.quit()
} else {
  app.on('second-instance', () => {
    console.log('[App] Second instance detected. Focusing existing window.')
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// ===================== IPC HANDLERS (Window Controls) =====================
ipcMain.handle('window:minimize', () => {
  if (mainWindow) mainWindow.minimize()
})

ipcMain.handle('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  }
})

ipcMain.handle('window:close', () => {
  if (mainWindow) mainWindow.close()
})

ipcMain.handle('window:isMaximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false
})

ipcMain.handle('app:version', () => app.getVersion())
ipcMain.handle('app:quit', () => app.quit())
ipcMain.handle('app:platform', () => process.platform)
