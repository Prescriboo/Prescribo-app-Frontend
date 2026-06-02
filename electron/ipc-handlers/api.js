const { ipcMain } = require('electron')

let backendUrl = null
let backendReady = false

function setBackendUrl(url) {
  backendUrl = url
  backendReady = !!url
}

function getBackendUrl() {
  return backendUrl
}

function isBackendReady() {
  return backendReady
}

ipcMain.handle('api:getUrl', () => {
  return backendUrl
})

ipcMain.handle('api:isReady', () => {
  return backendReady
})

module.exports = { setBackendUrl, getBackendUrl, isBackendReady }
