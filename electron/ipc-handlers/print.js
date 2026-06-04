const { ipcMain, dialog, BrowserWindow } = require('electron')
const fs = require('fs')

ipcMain.handle('print:toPDF', async (event, _htmlContent, options = {}) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win) return { success: false, error: 'No window found' }

  const { filePath } = await dialog.showSaveDialog(win, {
    defaultPath: `prescription-${Date.now()}.pdf`,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  })

  if (!filePath) return { cancelled: true }

  try {
    const pdfOptions = {
      pageSize: options.pageSize || 'A4',
      margins: { marginType: 'none' },
      printBackground: true,
    }
    const data = await win.webContents.printToPDF(pdfOptions)
    fs.writeFileSync(filePath, data)
    return { success: true, path: filePath }
  } catch (err) {
    console.error('[PrintToPDF] Error:', err)
    return { success: false, error: err.message }
  }
})

ipcMain.handle('print:toPrinter', async (event, _htmlContent, options = {}) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win) return { success: false, error: 'No window found' }

  try {
    await win.webContents.print({
      silent: false,
      printBackground: true,
      ...options,
    })
    return { success: true }
  } catch (err) {
    console.error('[PrintToPrinter] Error:', err)
    return { success: false, error: err.message }
  }
})
