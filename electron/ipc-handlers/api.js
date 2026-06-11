const { ipcMain } = require('electron')

let backendUrl = null
let backendReady = false
let apiToken = null

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

function setApiToken(token) {
  apiToken = token
}

ipcMain.handle('api:getUrl', () => {
  return backendUrl
})

ipcMain.handle('api:isReady', () => {
  return backendReady
})

ipcMain.handle('api:getToken', () => {
  return apiToken
})

function getApiToken() {
  return apiToken
}

module.exports = { setBackendUrl, getBackendUrl, isBackendReady, setApiToken, getApiToken }
