const { ipcMain, dialog } = require('electron')
const fs = require('fs')
const path = require('path')
const os = require('os')

const BACKUP_DIR = path.join(os.homedir(), '.prescribo', 'backups')

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

ipcMain.handle('backup:create', async () => {
  // TODO: Backup SQLite database file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}.db`)

  // Placeholder: copy current DB file
  // fs.copyFileSync(DB_PATH, backupPath)

  console.log('Backup created:', backupPath)
  return { success: true, path: backupPath }
})

ipcMain.handle('backup:restore', async (event, filePath) => {
  // TODO: Restore SQLite database from backup file
  console.log('Restore from:', filePath)
  return { success: true }
})

ipcMain.handle('backup:getPath', async () => {
  return BACKUP_DIR
})
