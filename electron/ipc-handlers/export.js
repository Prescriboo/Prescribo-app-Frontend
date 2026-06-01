const { ipcMain, dialog } = require('electron')
const fs = require('fs')

ipcMain.handle('export:toCSV', async (event, data, filename) => {
  const { filePath } = await dialog.showSaveDialog({
    defaultPath: filename || `export-${Date.now()}.csv`,
    filters: [{ name: 'CSV', extensions: ['csv'] }],
  })

  if (!filePath) return { cancelled: true }

  // Simple CSV conversion
  const headers = Object.keys(data[0] || {}).join(',')
  const rows = data.map(row => Object.values(row).join(',')).join('\n')
  fs.writeFileSync(filePath, `${headers}\n${rows}`)

  return { success: true, path: filePath }
})

ipcMain.handle('export:toPDF', async (event, data, filename) => {
  const { filePath } = await dialog.showSaveDialog({
    defaultPath: filename || `export-${Date.now()}.pdf`,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  })

  if (!filePath) return { cancelled: true }

  return { success: true, path: filePath }
})

ipcMain.handle('export:toJSON', async (event, data, filename) => {
  const { filePath } = await dialog.showSaveDialog({
    defaultPath: filename || `export-${Date.now()}.json`,
    filters: [{ name: 'JSON', extensions: ['json'] }],
  })

  if (!filePath) return { cancelled: true }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

  return { success: true, path: filePath }
})
