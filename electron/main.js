const { app, BrowserWindow, ipcMain, dialog, shell, screen } = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')

// IPC Handlers
require('./ipc-handlers/database')
require('./ipc-handlers/print')
require('./ipc-handlers/export')
require('./ipc-handlers/license')
require('./ipc-handlers/backup')
require('./ipc-handlers/fs')

let mainWindow
let splashWindow

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

  // Fade out after delay
  setTimeout(() => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close()
      splashWindow = null
    }
  }, 2500)
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
    titleBarStyle: isMac ? 'hiddenInset' : 'hidden',
    backgroundColor: '#f8fafc',
    show: false,
    icon: path.join(__dirname, '../resources/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
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
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Show when ready
  mainWindow.once('ready-to-show', () => {
    if (state.maximized) mainWindow.maximize()
    mainWindow.show()
    mainWindow.focus()
  })

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

  // Prevent navigation away from app
  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
      e.preventDefault()
      shell.openExternal(url)
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// ===================== APP LIFECYCLE =====================
app.whenReady().then(() => {
  createSplashWindow()
  setTimeout(createMainWindow, 800)
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
  saveWindowState()
})

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
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
