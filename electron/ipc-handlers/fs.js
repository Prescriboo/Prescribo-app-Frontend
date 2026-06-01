const { ipcMain, dialog } = require('electron')
const fs = require('fs')

ipcMain.handle('fs:readFile', async (event, filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8')
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('fs:writeFile', async (event, filePath, data) => {
  try {
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
