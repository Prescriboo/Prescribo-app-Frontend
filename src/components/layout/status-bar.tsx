'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useApiSync } from '@/hooks/use-api-sync'
import { authApi } from '@/lib/api'
import { Wifi, WifiOff, Database, ShieldCheck, ShieldAlert, ShieldX, Clock, RefreshCw } from 'lucide-react'

export function StatusBar() {
  const router = useRouter()
  const { demoMode } = useAuthStore()
  const { status, backendVersion, refresh: refreshApi } = useApiSync()
  const [time, setTime] = useState<string>('')
  const [licenceStatus, setLicenceStatus] = useState<{
    valid: boolean
    access_expired?: boolean
    refresh_expired?: boolean
    grace_expired?: boolean
    days_until_lock?: number
    message: string
  } | null>(null)

  const fetchLicenceStatus = useCallback(async () => {
    try {
      const status = await authApi.status()
      setLicenceStatus(status)
      // Auto-refresh access token in background if expired but refresh still valid
      if (status.access_expired && !status.refresh_expired && !status.grace_expired) {
        try {
          await authApi.refresh()
          const refreshed = await authApi.status()
          setLicenceStatus(refreshed)
        } catch {
          // Refresh failed — status already shows the issue
        }
      }
    } catch {
      setLicenceStatus(null)
    }
  }, [])

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetchLicenceStatus()
    const interval = setInterval(fetchLicenceStatus, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [fetchLicenceStatus])

  // Subscribe to main-process license status push (Electron only)
  useEffect(() => {
    const electron = (window as any).electron
    if (!electron?.license?.onStatusChanged) return

    const unsubscribe = electron.license.onStatusChanged((status: any) => {
      if (status) {
        setLicenceStatus(status)
      }
    })
    return unsubscribe
  }, [])

  const isConnected = status === 'connected'

  const handleRefreshToken = async () => {
    try {
      await authApi.refresh()
      await fetchLicenceStatus()
    } catch (err: any) {
      // Refresh failed — status will show on next poll
    }
  }

  const getLicenseIcon = () => {
    if (demoMode) return <ShieldAlert className="w-3 h-3 text-warning" />
    if (!licenceStatus?.valid) return <ShieldX className="w-3 h-3 text-danger" />
    if (licenceStatus.refresh_expired) return <ShieldAlert className="w-3 h-3 text-warning" />
    if (licenceStatus.access_expired) return <ShieldAlert className="w-3 h-3 text-warning" />
    return <ShieldCheck className="w-3 h-3 text-success" />
  }

  const getLicenseText = () => {
    if (demoMode) return 'Demo active'
    if (!licenceStatus) return 'License active'
    if (!licenceStatus.valid) return licenceStatus.grace_expired ? 'License locked' : 'License issue'
    if (licenceStatus.refresh_expired && licenceStatus.days_until_lock !== undefined) {
      return `${licenceStatus.days_until_lock}d until lock`
    }
    if (licenceStatus.access_expired) return 'Token expired'
    return 'License active'
  }

  const getLicenseColor = () => {
    if (demoMode) return 'text-warning'
    if (!licenceStatus?.valid) return 'text-danger'
    if (licenceStatus.refresh_expired || licenceStatus.access_expired) return 'text-warning'
    return 'text-success'
  }

  return (
    <div className="h-[32px] bg-white border-t border-border flex items-center justify-between px-4 flex-shrink-0 text-[11px] text-slate-500">
      {/* Left: Status indicators */}
      <div className="flex items-center gap-4">
        {/* Ready status */}
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-success' : status === 'checking' ? 'bg-warning' : 'bg-slate-300'}`} />
          <span className="font-medium text-slate-600">
            {status === 'checking' ? 'Connecting...' : isConnected ? 'Ready' : 'Local Mode'}
          </span>
        </div>

        <div className="w-px h-3.5 bg-border" />

        {/* Database status */}
        <div className="flex items-center gap-1.5">
          <Database className={`w-3 h-3 ${isConnected ? 'text-primary' : 'text-slate-400'}`} />
          <span>{isConnected ? `API v${backendVersion || '2.5.0'}` : 'Local Storage'}</span>
        </div>

        {!isConnected && (
          <>
            <div className="w-px h-3.5 bg-border" />
            <button
              onClick={refreshApi}
              className="flex items-center gap-1 text-primary hover:underline cursor-pointer"
              title="Retry connection"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </>
        )}
      </div>

      {/* Right: More info */}
      <div className="flex items-center gap-4">
        {/* Online/Offline */}
        <div className="flex items-center gap-1.5">
          {demoMode || !isConnected ? (
            <>
              <WifiOff className={`w-3 h-3 ${demoMode ? 'text-warning' : 'text-slate-400'}`} />
              <span className={`font-medium ${demoMode ? 'text-warning' : 'text-slate-400'}`}>
                {demoMode ? 'Offline Mode' : 'Disconnected'}
              </span>
            </>
          ) : (
            <>
              <Wifi className="w-3 h-3 text-success" />
              <span className="text-success font-medium">Online</span>
            </>
          )}
        </div>

        <div className="w-px h-3.5 bg-border" />

        {/* License status */}
        <div className="flex items-center gap-1.5">
          {getLicenseIcon()}
          <span className={`${getLicenseColor()} font-medium`}>{getLicenseText()}</span>
          {demoMode && (
            <button
              onClick={() => router.push('/activate')}
              className="ml-1 text-primary hover:underline cursor-pointer flex items-center gap-0.5"
              title="Enter a real license key"
            >
              <span>Activate</span>
            </button>
          )}
          {licenceStatus?.access_expired && !licenceStatus?.grace_expired && (
            <button
              onClick={handleRefreshToken}
              className="ml-1 text-primary hover:underline cursor-pointer flex items-center gap-0.5"
              title="Renew license token"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Renew</span>
            </button>
          )}
        </div>

        <div className="w-px h-3.5 bg-border" />

        {/* Time */}
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-slate-400" />
          <span className="font-mono">{time || '--:--:--'}</span>
        </div>
      </div>
    </div>
  )
}
