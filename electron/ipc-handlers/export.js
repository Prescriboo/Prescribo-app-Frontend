const { ipcMain, dialog, BrowserWindow } = require('electron')
const fs = require('fs')

function escapeHtml(text) {
  if (text == null) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

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
  const parent = BrowserWindow.fromWebContents(event.sender)

  const { filePath } = await dialog.showSaveDialog(parent, {
    defaultPath: filename || `export-${Date.now()}.pdf`,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  })

  if (!filePath) return { cancelled: true }

  let html = ''
  if (typeof data === 'string') {
    html = data
  } else if (Array.isArray(data) && data.length > 0) {
    const headers = Object.keys(data[0])
      .map((h) => `<th style="border:1px solid #ccc;padding:4px;">${escapeHtml(h)}</th>`)
      .join('')
    const rows = data
      .map((row) =>
        Object.values(row)
          .map((v) => `<td style="border:1px solid #ccc;padding:4px;">${escapeHtml(v)}</td>`)
          .join('')
      )
      .map((r) => `<tr>${r}</tr>`)
      .join('')
    html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><table style="border-collapse:collapse;width:100%;"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></body></html>`
  } else {
    html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><pre>${JSON.stringify(data, null, 2)}</pre></body></html>`
  }

  const hiddenWin = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,
  })

  try {
    await hiddenWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
    const pdfData = await hiddenWin.webContents.printToPDF({
      pageSize: 'A4',
      margins: { marginType: 'default' },
      printBackground: true,
    })
    fs.writeFileSync(filePath, pdfData)
    return { success: true, path: filePath }
  } catch (err) {
    console.error('[ExportToPDF] Error:', err)
    return { success: false, error: err.message }
  } finally {
    hiddenWin.destroy()
  }
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
