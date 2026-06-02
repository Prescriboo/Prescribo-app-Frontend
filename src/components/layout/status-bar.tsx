'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useApiSync } from '@/hooks/use-api-sync'
import { Wifi, WifiOff, Database, ShieldCheck, Clock, RefreshCw } from 'lucide-react'

export function StatusBar() {
  const { demoMode } = useAuthStore()
  const { status, backendVersion, refresh } = useApiSync()
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  const isConnected = status === 'connected'

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
              onClick={refresh}
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
          <ShieldCheck className="w-3 h-3 text-primary" />
          <span>{demoMode ? 'Demo expires in 14 days' : 'Token expires in 6 days'}</span>
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
