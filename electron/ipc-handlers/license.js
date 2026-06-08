const { ipcMain } = require('electron')
const http = require('http')
const os = require('os')
const { getBackendUrl } = require('./api')

function apiGet(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, getBackendUrl())
    const req = http.get(url, (res) => {
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
    req.setTimeout(10000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
  })
}

function apiPost(path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, getBackendUrl())
    const postData = JSON.stringify(body)
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: 10000,
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
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
    req.write(postData)
    req.end()
  })
}

ipcMain.handle('license:validate', async (event, key) => {
  try {
    const state = await apiGet('/api/auth/state')
    return { valid: state.is_activated && state.license_key === key, state }
  } catch (err) {
    return { valid: false, error: err.message }
  }
})

ipcMain.handle('license:getInfo', async () => {
  try {
    return await apiGet('/api/auth/state')
  } catch (err) {
    return { is_activated: false, error: err.message }
  }
})

ipcMain.handle('license:activate', async (event, key) => {
  try {
    const machineId = await apiGet('/api/auth/machine-id')
    const result = await apiPost('/api/auth/activate', {
      license_key: key,
      machine_id: machineId.machine_id,
      device_name: os.hostname(),
    })
    return { success: true, ...result }
  } catch (err) {
    return { success: false, error: err.message }
  }
})
