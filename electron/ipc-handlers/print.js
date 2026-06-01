const { ipcMain, dialog } = require('electron')
const fs = require('fs')
const path = require('path')

ipcMain.handle('print:toPDF', async (event, htmlContent, options = {}) => {
  const { filePath } = await dialog.showSaveDialog({
    defaultPath: `prescription-${Date.now()}.pdf`,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  })

  if (!filePath) return { cancelled: true }

  // TODO: Use electron's printToPDF or a library like puppeteer
  // For now, save HTML as a placeholder
  fs.writeFileSync(filePath.replace('.pdf', '.html'), htmlContent)

  return { success: true, path: filePath }
})

ipcMain.handle('print:toPrinter', async (event, htmlContent, options = {}) => {
  // TODO: Use electron's webContents.print()
  // This would be called from the renderer via window.electron.print.toPrinter()
  console.log('Print to printer requested')
  return { success: true }
})
