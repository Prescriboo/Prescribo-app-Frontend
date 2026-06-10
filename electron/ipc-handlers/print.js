const { ipcMain, dialog, BrowserWindow } = require('electron')
const fs = require('fs')

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))
  ])
}

ipcMain.handle('print:toPDF', async (event, htmlContent, options = {}) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win) return { success: false, error: 'No window found' }

  const { filePath } = await dialog.showSaveDialog(win, {
    defaultPath: `prescription-${Date.now()}.pdf`,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  })

  if (!filePath) return { cancelled: true }

  let targetWin = win
  let createdWin = null
  if (htmlContent && typeof htmlContent === 'string') {
    createdWin = new BrowserWindow({ show: false, width: 800, height: 600 })
    await createdWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)
    // Give the hidden window a moment to load and apply stylesheets
    await new Promise((resolve) => setTimeout(resolve, 500))
    targetWin = createdWin
  }

  // Small delay after dialog dismissal to let the window settle
  await new Promise((resolve) => setTimeout(resolve, 300))

  try {
    const pdfOptions = {
      pageSize: options.pageSize || 'A4',
      margins: { marginType: 'none' },
      printBackground: true,
    }
    const data = await withTimeout(
      targetWin.webContents.printToPDF(pdfOptions),
      15000,
      'PDF generation timed out after 15 seconds'
    )
    fs.writeFileSync(filePath, data)
    return { success: true, path: filePath }
  } catch (err) {
    console.error('[PrintToPDF] Error:', err)
    return { success: false, error: err.message }
  } finally {
    if (createdWin) createdWin.destroy()
  }
})

ipcMain.handle('print:toPrinter', async (event, htmlContent, options = {}) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win) return { success: false, error: 'No window found' }

  let targetWin = win
  let createdWin = null
  if (htmlContent && typeof htmlContent === 'string') {
    createdWin = new BrowserWindow({ show: false, width: 800, height: 600 })
    await createdWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)
    await new Promise((resolve) => setTimeout(resolve, 500))
    targetWin = createdWin
  }

  try {
    await targetWin.webContents.print({
      silent: false,
      printBackground: true,
      ...options,
    })
    return { success: true }
  } catch (err) {
    console.error('[PrintToPrinter] Error:', err)
    return { success: false, error: err.message }
  } finally {
    if (createdWin) createdWin.destroy()
  }
})
