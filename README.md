# Prescribo Desktop — Next.js Frontend

A modern desktop prescription management app built with **Next.js 15**, **React 19**, **Tailwind CSS**, and **Zustand** for state management.

> **Note:** This is the frontend-only version. The SQLite database backend is handled separately by your FastAPI server.

---

## Project Structure

```
prescribo-nextjs/
├── public/
│   └── logo.svg
├── src/
│   ├── app/
│   │   ├── (auth)/                 # Auth routes (no sidebar)
│   │   │   ├── activate/page.tsx   # License activation
│   │   │   ├── pin/page.tsx        # PIN lock screen
│   │   │   └── layout.tsx          # Auth layout wrapper
│   │   ├── (app)/                  # Main app routes (with sidebar)
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── patients/page.tsx
│   │   │   ├── patients/[id]/page.tsx
│   │   │   ├── prescriptions/page.tsx
│   │   │   ├── templates/page.tsx
│   │   │   ├── history/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── layout.tsx          # App shell (sidebar + topbar)
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Entry redirect
│   │   └── globals.css             # Global styles + animations
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   └── top-bar.tsx
│   │   └── ui/                     # Reusable UI components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── textarea.tsx
│   │       ├── badge.tsx
│   │       ├── card.tsx
│   │       ├── modal.tsx
│   │       └── toast.tsx
│   ├── stores/                     # Zustand state management
│   │   ├── auth-store.ts           # License + PIN state
│   │   ├── patient-store.ts        # Patient CRUD
│   │   ├── prescription-store.ts   # Rx builder + history
│   │   ├── template-store.ts       # Template management
│   │   ├── settings-store.ts       # Clinic + security settings
│   │   └── ui-store.ts             # Sidebar + toasts
│   ├── types/                      # TypeScript interfaces
│   │   ├── patient.ts
│   │   ├── prescription.ts
│   │   ├── template.ts
│   │   ├── settings.ts
│   │   └── index.ts
│   ├── lib/
│   │   ├── utils.ts                # cn() + helpers
│   │   └── constants.ts            # Demo data + nav items
│   └── hooks/                      # (empty — ready for custom hooks)
├── package.json
├── tsconfig.json
├── next.config.js                  # output: 'export'
├── tailwind.config.ts
└── postcss.config.js
```

---

## Key Features

| Feature | Description |
|---------|-------------|
| **License Activation** | PR-XXXX-XXXX-XXXX key validation with demo mode fallback |
| **PIN Lock** | 4-digit PIN pad for app security |
| **Dashboard** | Stats cards, recent prescriptions, quick actions |
| **Patients** | Full CRUD table, detail view with timeline, allergies/conditions |
| **Prescription Builder** | Live A5 preview, medicine rows, auto-fill from patient/template |
| **Templates** | Grid view, one-click apply to prescription builder |
| **History** | Searchable table, detail modal, export |
| **Settings** | Clinic profile, security toggles, backup, license info |

---

## Package.json Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.0",
    "lucide-react": "^0.460.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "class-variance-authority": "^0.7.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.0",
    "@radix-ui/react-select": "^2.1.0",
    "date-fns": "^4.0.0"
  }
}
```

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Build for production (static export)
npm run build
```

The build output goes to `dist/` (configured in `next.config.js` with `output: 'export'`).

---

## Integration with FastAPI Backend

Since you're building the SQLite backend with FastAPI, here's how to wire it up:

### 1. Create an API client layer

Create `src/lib/api.ts`:

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
```

### 2. Replace demo data in stores

In `src/stores/patient-store.ts`, replace `DEMO_PATIENTS` with API calls:

```typescript
import { apiFetch } from '@/lib/api'

// In your store actions:
async fetchPatients() {
  const data = await apiFetch('/patients')
  set({ patients: data })
}

async addPatient(patientData) {
  const data = await apiFetch('/patients', {
    method: 'POST',
    body: JSON.stringify(patientData),
  })
  set((state) => ({ patients: [data, ...state.patients] }))
  return data
}
```

### 3. IPC Bridge (for Electron)

If wrapping in Electron, use `window.electron` via preload script instead of direct `fetch`:

```typescript
// src/lib/api.ts (Electron version)
export async function apiFetch(path: string, options?: RequestInit) {
  if (typeof window !== 'undefined' && (window as any).electron) {
    return (window as any).electron.invoke('api-call', { path, options })
  }
  // Fallback for web dev
  const res = await fetch(`http://localhost:8000${path}`, options)
  return res.json()
}
```

---

## State Management (Zustand)

All state is managed via Zustand stores with **persist middleware** for auth and settings:

| Store | Persists? | Purpose |
|-------|-----------|---------|
| `auth-store` | ✅ | License key, PIN, demo mode |
| `patient-store` | ❌ | Patient list (fetch from API) |
| `prescription-store` | ❌ | Rx builder + history |
| `template-store` | ❌ | Templates |
| `settings-store` | ✅ | Clinic info, security toggles |
| `ui-store` | ❌ | Sidebar collapse, toast queue |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+1`–`Ctrl+6` | Navigate to Dashboard, Patients, Prescriptions, Templates, History, Settings |
| `Ctrl+K` | Focus global search |
| `Esc` | Close modals |

---

## Next Steps

1. **Connect FastAPI endpoints** — Replace demo data with real API calls
2. **Add Electron wrapper** — Use `next export` output in Electron main process
3. **Add print functionality** — Use `window.print()` or Electron's `webContents.print()`
4. **Add offline support** — Cache API responses with service workers

---

Built for modern medical practice management. 🏥
