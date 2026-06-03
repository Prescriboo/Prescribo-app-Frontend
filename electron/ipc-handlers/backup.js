const { ipcMain, dialog } = require('electron')
const fs = require('fs')
const path = require('path')
const os = require('os')
const http = require('http')
const { getBackendUrl } = require('./api')

const BACKUP_DIR = path.join(os.homedir(), '.prescribo', 'backups')

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

function downloadFile(urlPath, destPath) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, getBackendUrl())
    const file = fs.createWriteStream(destPath)
    const req = http.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Download failed: HTTP ${res.statusCode}`))
        return
      }
      res.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve(destPath)
      })
    })
    req.on('error', (err) => {
      fs.unlink(destPath, () => {})
      reject(err)
    })
    req.setTimeout(30000, () => {
      req.destroy()
      fs.unlink(destPath, () => {})
      reject(new Error('Download timeout'))
    })
  })
}

function uploadFile(urlPath, filePath) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, getBackendUrl())
    const boundary = '----PrescriboBoundary' + Date.now()
    const fileName = path.basename(filePath)
    const fileData = fs.readFileSync(filePath)

    const pre = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
      `Content-Type: application/x-sqlite3\r\n\r\n`
    )
    const post = Buffer.from(`\r\n--${boundary}--\r\n`)
    const body = Buffer.concat([pre, fileData, post])

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
      timeout: 30000,
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch {
          resolve(data)
        }
      })
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('Upload timeout')) })
    req.write(body)
    req.end()
  })
}

ipcMain.handle('backup:create', async () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = path.join(BACKUP_DIR, `prescribo_backup_${timestamp}.db`)
    await downloadFile('/api/backup/download', backupPath)
    console.log('[Backup] Created:', backupPath)
    return { success: true, path: backupPath }
  } catch (err) {
    console.error('[Backup] Create failed:', err.message)
    return { success: false, error: err.message }
  }
})

ipcMain.handle('backup:restore', async (event, filePath) => {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      return { success: false, error: 'File not found' }
    }
    const result = await uploadFile('/api/backup/restore', filePath)
    console.log('[Backup] Restored from:', filePath)
    return { success: true, ...result }
  } catch (err) {
    console.error('[Backup] Restore failed:', err.message)
    return { success: false, error: err.message }
  }
})

ipcMain.handle('backup:getPath', async () => {
  return BACKUP_DIR
})
