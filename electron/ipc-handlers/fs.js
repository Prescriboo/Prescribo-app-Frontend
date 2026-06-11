const { ipcMain, dialog } = require('electron')
const fs = require('fs')
const path = require('path')
const os = require('os')
const crypto = require('crypto')

// Safe path validation: prevent directory traversal and system file access
function isSafePath(filePath) {
  if (!filePath || typeof filePath !== 'string') return false
  // Block null bytes
  if (filePath.includes('\0')) return false
  // Resolve to absolute path
  const resolved = path.resolve(filePath)
  const home = os.homedir()
  const tmp = os.tmpdir()

  // Block paths with parent directory traversal after resolution
  if (resolved.includes('..')) return false

  // Block sensitive system directories
  const blockedPrefixes = [
    '/etc', '/usr', '/bin', '/sbin', '/lib', '/lib64',
    '/sys', '/proc', '/dev', '/boot', '/var/log',
    path.join(home, '.ssh'),
    path.join(home, '.gnupg'),
    path.join(home, '.aws'),
    path.join(home, '.kube'),
  ]
  for (const prefix of blockedPrefixes) {
    if (resolved.startsWith(prefix)) return false
  }

  // Allow only home directory, temp directory, and common document dirs
  const allowedPrefixes = [
    home,
    tmp,
    '/tmp',
    '/var/tmp',
  ]
  // On Windows, also allow standard drives
  if (process.platform === 'win32') {
    const matches = /^[A-Za-z]:[\\\/]/.test(resolved)
    if (!matches) return false
  }

  const isAllowed = allowedPrefixes.some((prefix) => resolved.startsWith(prefix))
  return isAllowed
}

ipcMain.handle('fs:readFile', async (event, filePath) => {
  try {
    if (!isSafePath(filePath)) {
      return { success: false, error: 'Access denied: unsafe path' }
    }
    const data = fs.readFileSync(filePath, 'utf-8')
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('fs:writeFile', async (event, filePath, data) => {
  try {
    if (!isSafePath(filePath)) {
      return { success: false, error: 'Access denied: unsafe path' }
    }
    fs.writeFileSync(filePath, data)
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('fs:selectFile', async (event, options = {}) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: options.filters || [{ name: 'All Files', extensions: ['*'] }],
  })

  if (result.canceled) return { cancelled: true }
  return { success: true, paths: result.filePaths }
})

ipcMain.handle('fs:selectDirectory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  })

  if (result.canceled) return { cancelled: true }
  return { success: true, path: result.filePaths[0] }
})

ipcMain.handle('os:homedir', async () => {
  return require('os').homedir()
})
