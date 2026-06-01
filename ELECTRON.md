# Prescribo Desktop — Electron Setup

This guide walks you through building the Prescribo desktop app using Electron.

---

## Architecture

```
┌─────────────────────────────────────────┐
│  Electron Main Process (Node.js)         │
│  ├── main.js                            │
│  ├── preload.js                         │
│  └── ipc-handlers/                      │
│       ├── database.js  → FastAPI API     │
│       ├── print.js     → PDF/Printer     │
│       ├── export.js    → CSV/PDF/JSON    │
│       ├── license.js   → License check   │
│       └── backup.js    → Auto-backup     │
├─────────────────────────────────────────┤
│  Next.js Frontend (Renderer)            │
│  ├── Built with `output: 'export'`    │
│  ├── Loaded from `dist/`                │
│  └── Uses `window.electron` API         │
└─────────────────────────────────────────┘
```

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Development Mode (with hot reload)

```bash
npm run electron:dev
```

This starts:
- Next.js dev server on `http://localhost:3000`
- Electron window that loads the dev server

### 3. Build for Production

```bash
npm run electron:build
```

This:
1. Builds Next.js static export to `dist/`
2. Packages Electron app to `release/`

### 4. Build for Specific Platform

```bash
# macOS
npm run dist -- --mac

# Windows
npm run dist -- --win

# Linux
npm run dist -- --linux
```

---

## Connecting to FastAPI Backend

Your FastAPI SQLite backend runs separately. The Electron app communicates with it via HTTP.

### Option A: FastAPI runs as separate process

```typescript
// In your Next.js components, use fetch:
const API_BASE = 'http://localhost:8000'

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, options)
  return res.json()
}
```

### Option B: FastAPI bundled with Electron (advanced)

Package your FastAPI app as an executable (using PyInstaller) and launch it from `main.js`:

```javascript
// electron/main.js
const { spawn } = require('child_process')

// Start FastAPI backend
const backend = spawn('./backend/prescribo-api', [], { detached: true })

app.on('before-quit', () => {
  backend.kill()
})
```

### Option C: Use IPC to proxy requests

```typescript
// In renderer (Next.js):
const patients = await window.electron.db.getPatients()

// In main process (electron/ipc-handlers/database.js):
ipcMain.handle('db:getPatients', async () => {
  const res = await fetch('http://localhost:8000/patients')
  return res.json()
})
```

---

## IPC API Reference

### `window.electron.db`
| Method | Params | Returns |
|--------|--------|---------|
| `getPatients()` | - | Patient[] |
| `getPatient(id)` | number | Patient |
| `addPatient(data)` | Patient | Patient |
| `updatePatient(id, data)` | number, Partial<Patient> | { success } |
| `getPrescriptions()` | - | Prescription[] |
| `addPrescription(data)` | Prescription | Prescription |
| `updatePrescription(id, data)` | number, Partial<Prescription> | { success } |
| `getTemplates()` | - | Template[] |
| `getSettings()` | - | Settings |
| `updateSettings(data)` | Partial<Settings> | { success } |

### `window.electron.print`
| Method | Params | Returns |
|--------|--------|---------|
| `toPDF(html, options)` | string, object | { path } |
| `toPrinter(html, options)` | string, object | { success } |

### `window.electron.export`
| Method | Params | Returns |
|--------|--------|---------|
| `toCSV(data, filename)` | any[], string | { path } |
| `toPDF(data, filename)` | any, string | { path } |
| `toJSON(data, filename)` | any, string | { path } |

### `window.electron.license`
| Method | Params | Returns |
|--------|--------|---------|
| `validate(key)` | string | { valid } |
| `getInfo()` | - | LicenseInfo |
| `activate(key)` | string | { success } |

### `window.electron.backup`
| Method | Params | Returns |
|--------|--------|---------|
| `create()` | - | { path } |
| `restore(filePath)` | string | { success } |
| `getPath()` | - | string |

### `window.electron.fs`
| Method | Params | Returns |
|--------|--------|---------|
| `readFile(path)` | string | { data } |
| `writeFile(path, data)` | string, string | { success } |
| `selectFile(options)` | object | { paths } |
| `selectDirectory()` | - | { path } |

---

## File Structure

```
prescribo-desktop/
├── electron/
│   ├── main.js              # Main process entry
│   ├── preload.js           # Secure bridge
│   └── ipc-handlers/
│       ├── database.js      # DB operations → FastAPI
│       ├── print.js         # Print to PDF/thermal
│       ├── export.js        # Export CSV/PDF/JSON
│       ├── license.js       # License validation
│       ├── backup.js        # Auto-backup
│       └── fs.js            # File system helpers
├── src/                     # Next.js frontend
│   ├── app/
│   ├── components/
│   ├── stores/
│   └── ...
├── dist/                    # Next.js static export
├── resources/               # App icons
│   ├── icon.icns
│   ├── icon.ico
│   └── icon.png
├── next.config.js           # output: 'export'
├── electron-builder.yml     # Packaging config
└── package.json
```

---

## Troubleshooting

### White screen after build
- Make sure `dist/index.html` exists after `npm run build`
- Check that `next.config.js` has `output: 'export'`

### IPC not working
- Ensure `contextIsolation: true` in `main.js`
- Check that `preload.js` is loading correctly
- Use `window.electron` not `require('electron')` in renderer

### Icons not showing
- Add real icon files to `resources/`
- Or remove icon references from `electron-builder.yml`

---

## Next Steps

1. **Add app icons** to `resources/` folder
2. **Connect FastAPI** endpoints in `ipc-handlers/database.js`
3. **Test print functionality** with real thermal printer
4. **Add auto-updater** using `electron-updater`
5. **Code sign** the app for distribution

---

Built with Electron + Next.js + FastAPI 🏥
