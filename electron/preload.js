const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  // App
  getVersion: () => ipcRenderer.invoke('app:version'),
  quit: () => ipcRenderer.invoke('app:quit'),
  getPlatform: () => ipcRenderer.invoke('app:platform'),

  // Window controls
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  },

  // API / Backend URL
  api: {
    getUrl: () => ipcRenderer.invoke('api:getUrl'),
    isReady: () => ipcRenderer.invoke('api:isReady'),
  },

  // Database (SQLite via FastAPI backend)
  db: {
    query: (sql, params) => ipcRenderer.invoke('db:query', sql, params),
    getPatients: () => ipcRenderer.invoke('db:getPatients'),
    getPatient: (id) => ipcRenderer.invoke('db:getPatient', id),
    addPatient: (data) => ipcRenderer.invoke('db:addPatient', data),
    updatePatient: (id, data) => ipcRenderer.invoke('db:updatePatient', id, data),
    getPrescriptions: () => ipcRenderer.invoke('db:getPrescriptions'),
    addPrescription: (data) => ipcRenderer.invoke('db:addPrescription', data),
    updatePrescription: (id, data) => ipcRenderer.invoke('db:updatePrescription', id, data),
    getTemplates: () => ipcRenderer.invoke('db:getTemplates'),
    getSettings: () => ipcRenderer.invoke('db:getSettings'),
    updateSettings: (data) => ipcRenderer.invoke('db:updateSettings', data),
  },

  // Print
  print: {
    toPDF: (htmlContent, options) => ipcRenderer.invoke('print:toPDF', htmlContent, options),
    toPrinter: (htmlContent, options) => ipcRenderer.invoke('print:toPrinter', htmlContent, options),
  },

  // Export
  export: {
    toCSV: (data, filename) => ipcRenderer.invoke('export:toCSV', data, filename),
    toPDF: (data, filename) => ipcRenderer.invoke('export:toPDF', data, filename),
    toJSON: (data, filename) => ipcRenderer.invoke('export:toJSON', data, filename),
  },

  // License
  license: {
    validate: (key) => ipcRenderer.invoke('license:validate', key),
    getInfo: () => ipcRenderer.invoke('license:getInfo'),
    activate: (key) => ipcRenderer.invoke('license:activate', key),
    onStatusChanged: (callback) => {
      const handler = (_event, status) => callback(status)
      ipcRenderer.on('license:status', handler)
      return () => ipcRenderer.removeListener('license:status', handler)
    },
  },

  // Backup
  backup: {
    create: () => ipcRenderer.invoke('backup:create'),
    restore: (filePath) => ipcRenderer.invoke('backup:restore', filePath),
    getPath: () => ipcRenderer.invoke('backup:getPath'),
  },

  // File system
  fs: {
    readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
    writeFile: (filePath, data) => ipcRenderer.invoke('fs:writeFile', filePath, data),
    selectFile: (options) => ipcRenderer.invoke('fs:selectFile', options),
    selectDirectory: () => ipcRenderer.invoke('fs:selectDirectory'),
  },

  // OS
  os: {
    platform: process.platform,
    homedir: () => ipcRenderer.invoke('os:homedir'),
  },

  // Auto-updater
  updater: {
    check: () => ipcRenderer.invoke('updater:check'),
    install: () => ipcRenderer.invoke('updater:install'),
    onChecking: (callback) => {
      const handler = (_event, data) => callback(data)
      ipcRenderer.on('updater:checking', handler)
      return () => ipcRenderer.removeListener('updater:checking', handler)
    },
    onAvailable: (callback) => {
      const handler = (_event, data) => callback(data)
      ipcRenderer.on('updater:available', handler)
      return () => ipcRenderer.removeListener('updater:available', handler)
    },
    onNotAvailable: (callback) => {
      const handler = (_event, data) => callback(data)
      ipcRenderer.on('updater:not-available', handler)
      return () => ipcRenderer.removeListener('updater:not-available', handler)
    },
    onProgress: (callback) => {
      const handler = (_event, data) => callback(data)
      ipcRenderer.on('updater:progress', handler)
      return () => ipcRenderer.removeListener('updater:progress', handler)
    },
    onDownloaded: (callback) => {
      const handler = (_event, data) => callback(data)
      ipcRenderer.on('updater:downloaded', handler)
      return () => ipcRenderer.removeListener('updater:downloaded', handler)
    },
    onError: (callback) => {
      const handler = (_event, data) => callback(data)
      ipcRenderer.on('updater:error', handler)
      return () => ipcRenderer.removeListener('updater:error', handler)
    },
  },
})
