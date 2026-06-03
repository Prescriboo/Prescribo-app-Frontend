'use client'

let _apiBaseUrl: string | null = null

export function setApiBaseUrl(url: string) {
  _apiBaseUrl = url
}

export async function getApiBaseUrl(): Promise<string> {
  if (_apiBaseUrl) return _apiBaseUrl

  // In browser (dev mode or if backend is manually running)
  if (typeof window !== 'undefined') {
    // Check if Electron exposed a backend URL
    const electronUrl = (window as any).electron?.api?.getUrl?.()
    if (electronUrl) {
      const resolved = await Promise.resolve(electronUrl)
      if (resolved) {
        _apiBaseUrl = resolved
        return resolved
      }
    }
  }

  // Fallback to environment variable or default
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
}

export async function getApiUrl(path: string): Promise<string> {
  const base = await getApiBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}

export interface ApiHealth {
  status: 'ok' | 'error' | 'offline'
  service?: string
  version?: string
  error?: string
}

export async function checkApiHealth(): Promise<ApiHealth> {
  try {
    const res = await fetch(await getApiUrl('/health'), {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) {
      return { status: 'error', error: `HTTP ${res.status}` }
    }
    const data = await res.json()
    return {
      status: data.status === 'ok' ? 'ok' : 'error',
      service: data.service,
      version: data.version,
    }
  } catch (err: any) {
    return { status: 'offline', error: err.message || 'Backend unreachable' }
  }
}

export function isElectron(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).electron
}
