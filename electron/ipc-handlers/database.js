const { ipcMain } = require('electron')
const { getBackendUrl, getApiToken } = require('./api')

const BASE = () => getBackendUrl() || 'http://127.0.0.1:8000'

async function apiFetch(path, options = {}) {
  const url = `${BASE()}${path}`
  const token = getApiToken()
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'X-API-Token': token } : {}),
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  if (res.status === 204) return { success: true }
  return res.json()
}

// Legacy IPC handlers - now proxy to FastAPI backend
ipcMain.handle('db:query', async (event, sql, params) => {
  console.log('DB Query (deprecated):', sql, params)
  return { success: true, rows: [] }
})

ipcMain.handle('db:getPatients', async () => {
  try {
    return await apiFetch('/api/patients')
  } catch (err) {
    console.error('db:getPatients error:', err.message)
    return []
  }
})

ipcMain.handle('db:getPatient', async (event, id) => {
  try {
    return await apiFetch(`/api/patients/${id}`)
  } catch (err) {
    console.error('db:getPatient error:', err.message)
    return null
  }
})

ipcMain.handle('db:addPatient', async (event, data) => {
  try {
    return await apiFetch('/api/patients', { method: 'POST', body: JSON.stringify(data) })
  } catch (err) {
    console.error('db:addPatient error:', err.message)
    return { id: Date.now(), ...data }
  }
})

ipcMain.handle('db:updatePatient', async (event, id, data) => {
  try {
    return await apiFetch(`/api/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  } catch (err) {
    console.error('db:updatePatient error:', err.message)
    return { success: true }
  }
})

ipcMain.handle('db:getPrescriptions', async () => {
  try {
    return await apiFetch('/api/prescriptions')
  } catch (err) {
    console.error('db:getPrescriptions error:', err.message)
    return []
  }
})

ipcMain.handle('db:addPrescription', async (event, data) => {
  try {
    return await apiFetch('/api/prescriptions', { method: 'POST', body: JSON.stringify(data) })
  } catch (err) {
    console.error('db:addPrescription error:', err.message)
    return { id: Date.now(), ...data }
  }
})

ipcMain.handle('db:updatePrescription', async (event, id, data) => {
  try {
    return await apiFetch(`/api/prescriptions/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  } catch (err) {
    console.error('db:updatePrescription error:', err.message)
    return { success: true }
  }
})

ipcMain.handle('db:getTemplates', async () => {
  try {
    return await apiFetch('/api/templates')
  } catch (err) {
    console.error('db:getTemplates error:', err.message)
    return []
  }
})

ipcMain.handle('db:getSettings', async () => {
  try {
    const [doctor, clinic, security] = await Promise.all([
      apiFetch('/api/settings/doctor-profile').catch(() => null),
      apiFetch('/api/settings/clinic').catch(() => null),
      apiFetch('/api/settings/security').catch(() => null),
    ])
    return { doctor, clinic, security }
  } catch (err) {
    console.error('db:getSettings error:', err.message)
    return {}
  }
})

ipcMain.handle('db:updateSettings', async (event, data) => {
  try {
    const promises = []
    if (data.doctor) promises.push(apiFetch('/api/settings/doctor-profile', { method: 'PUT', body: JSON.stringify(data.doctor) }))
    if (data.clinic) promises.push(apiFetch('/api/settings/clinic', { method: 'PUT', body: JSON.stringify(data.clinic) }))
    if (data.security) promises.push(apiFetch('/api/settings/security', { method: 'PUT', body: JSON.stringify(data.security) }))
    await Promise.all(promises)
    return { success: true }
  } catch (err) {
    console.error('db:updateSettings error:', err.message)
    return { success: false, error: err.message }
  }
})
