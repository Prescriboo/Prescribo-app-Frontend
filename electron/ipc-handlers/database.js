const { ipcMain } = require('electron')

// These handlers will connect to your FastAPI SQLite backend
// For now they return demo data or pass through to the API

ipcMain.handle('db:query', async (event, sql, params) => {
  // TODO: Connect to FastAPI backend
  console.log('DB Query:', sql, params)
  return { success: true, rows: [] }
})

ipcMain.handle('db:getPatients', async () => {
  // TODO: Fetch from FastAPI /patients endpoint
  return []
})

ipcMain.handle('db:getPatient', async (event, id) => {
  // TODO: Fetch from FastAPI /patients/{id}
  return null
})

ipcMain.handle('db:addPatient', async (event, data) => {
  // TODO: POST to FastAPI /patients
  console.log('Add Patient:', data)
  return { id: 1, ...data }
})

ipcMain.handle('db:updatePatient', async (event, id, data) => {
  // TODO: PUT to FastAPI /patients/{id}
  console.log('Update Patient:', id, data)
  return { success: true }
})

ipcMain.handle('db:getPrescriptions', async () => {
  // TODO: Fetch from FastAPI /prescriptions
  return []
})

ipcMain.handle('db:addPrescription', async (event, data) => {
  // TODO: POST to FastAPI /prescriptions
  console.log('Add Prescription:', data)
  return { id: 1, ...data }
})

ipcMain.handle('db:updatePrescription', async (event, id, data) => {
  // TODO: PUT to FastAPI /prescriptions/{id}
  console.log('Update Prescription:', id, data)
  return { success: true }
})

ipcMain.handle('db:getTemplates', async () => {
  // TODO: Fetch from FastAPI /templates
  return []
})

ipcMain.handle('db:getSettings', async () => {
  // TODO: Fetch from FastAPI /settings
  return {}
})

ipcMain.handle('db:updateSettings', async (event, data) => {
  // TODO: PUT to FastAPI /settings
  console.log('Update Settings:', data)
  return { success: true }
})
