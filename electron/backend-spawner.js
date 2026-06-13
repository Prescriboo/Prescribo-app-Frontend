const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
const os = require('os')
const http = require('http')

let backendProcess = null
let backendPort = null

function findAvailablePort(startPort = 8000) {
  return new Promise((resolve, reject) => {
    const server = require('net').createServer()
    server.listen(startPort, () => {
      const port = server.address().port
      server.close(() => resolve(port))
    })
    server.on('error', () => {
      // Port in use, try next
      resolve(findAvailablePort(startPort + 1))
    })
  })
}

function waitForBackend(port, maxRetries = 30, interval = 500) {
  return new Promise((resolve, reject) => {
    let attempts = 0
    const check = () => {
      attempts++
      const req = http.get(`http://127.0.0.1:${port}/health`, (res) => {
        if (res.statusCode === 200) {
          resolve(true)
        } else if (attempts < maxRetries) {
          setTimeout(check, interval)
        } else {
          reject(new Error(`Backend health check failed after ${maxRetries} attempts`))
        }
      })
      req.on('error', () => {
        if (attempts < maxRetries) {
          setTimeout(check, interval)
        } else {
          reject(new Error(`Backend not responding after ${maxRetries} attempts`))
        }
      })
      req.setTimeout(interval, () => {
        req.destroy()
        if (attempts < maxRetries) {
          setTimeout(check, interval)
        } else {
          reject(new Error(`Backend connection timeout after ${maxRetries} attempts`))
        }
      })
    }
    check()
  })
}

async function startBackend(appDir, token) {
  if (backendProcess) {
    console.log('[Backend] Already running on port', backendPort)
    return backendPort
  }

  const port = await findAvailablePort(8000)
  backendPort = port

  // Detect backend path
  const possiblePaths = [
    path.join(appDir, '..', 'prescribo-app-backend', 'main.py'),
    path.join(appDir, '..', 'prescribo-app-backend', 'app', 'main.py'),
    path.join(appDir, 'prescribo-app-backend', 'main.py'),
    path.join(process.cwd(), 'prescribo-app-backend', 'main.py'),
  ]

  let backendPath = possiblePaths.find((p) => fs.existsSync(p))

  // Also look for a bundled executable
  // electron-builder copies to 'prescribo-app-backend'
  const exePaths = [
    path.join(appDir, '..', 'prescribo-app-backend', 'prescribo-backend'),
    path.join(appDir, 'prescribo-app-backend', 'prescribo-backend'),
    path.join(appDir, '..', 'prescribo-app-backend', 'prescribo-backend.exe'),
    path.join(appDir, 'prescribo-app-backend', 'prescribo-backend.exe'),
  ]
  const exePath = exePaths.find((p) => fs.existsSync(p))

  if (exePath) {
    // Ensure the backend has a writable working directory. Inside a packaged
    // macOS .app bundle the default cwd is read-only, which breaks endpoints
    // that need to write local state (e.g. demo mode, SQLite, backups).
    const dataDir = path.join(os.homedir(), '.prescribo')
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }
    } catch (err) {
      console.warn('[Backend] Could not create data directory:', dataDir, err.message)
    }

    console.log('[Backend] Starting bundled executable:', exePath, 'on port', port, 'cwd:', dataDir)
    backendProcess = spawn(exePath, [], {
      cwd: dataDir,
      env: { ...process.env, PORT: String(port), API_TOKEN: token || '' },
      detached: false,
    })
  } else if (backendPath) {
    // Find Python executable
    const pythonCmds = [
      'python3',
      'python',
      process.platform === 'win32' ? 'py' : null,
    ].filter(Boolean)

    let pythonCmd = null
    for (const cmd of pythonCmds) {
      try {
        const result = require('child_process').execSync(`${cmd} --version`, { encoding: 'utf8', stdio: 'pipe' })
        if (result.includes('Python 3')) {
          pythonCmd = cmd
          break
        }
      } catch {}
    }

    if (!pythonCmd) {
      console.warn('[Backend] Python 3 not found. Backend will not be auto-started.')
      return null
    }

    // Check for virtual environment
    const venvPaths = [
      path.join(path.dirname(backendPath), 'venv', 'bin', 'python'),
      path.join(path.dirname(backendPath), 'venv', 'Scripts', 'python.exe'),
      path.join(path.dirname(backendPath), '.venv', 'bin', 'python'),
      path.join(path.dirname(backendPath), '.venv', 'Scripts', 'python.exe'),
    ]
    const venvPython = venvPaths.find((p) => fs.existsSync(p))
    if (venvPython) {
      pythonCmd = venvPython
    }

    console.log('[Backend] Starting Python backend:', backendPath, 'on port', port, 'using', pythonCmd)
    backendProcess = spawn(pythonCmd, [backendPath], {
      cwd: path.dirname(backendPath),
      env: { ...process.env, PORT: String(port), API_TOKEN: token || '' },
      detached: false,
    })
  } else {
    console.warn('[Backend] Backend path not found. Searched:', possiblePaths)
    return null
  }

  backendProcess.stdout.on('data', (data) => {
    console.log('[Backend]', data.toString().trim())
  })

  backendProcess.stderr.on('data', (data) => {
    console.error('[Backend]', data.toString().trim())
  })

  backendProcess.on('close', (code) => {
    console.log('[Backend] Process exited with code', code)
    backendProcess = null
    backendPort = null
  })

  // Wait for health check
  try {
    await waitForBackend(port, 40, 500)
    console.log('[Backend] Health check passed on port', port)
    return port
  } catch (err) {
    console.error('[Backend] Failed to start:', err.message)
    if (backendProcess) {
      backendProcess.kill()
      backendProcess = null
    }
    backendPort = null
    return null
  }
}

function stopBackend() {
  if (backendProcess) {
    console.log('[Backend] Stopping process on port', backendPort)
    backendProcess.kill()
    backendProcess = null
    backendPort = null
  }
}

module.exports = { startBackend, stopBackend, getBackendPort: () => backendPort }
