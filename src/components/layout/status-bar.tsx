'use client'

import { useAuthStore } from '@/stores/auth-store'
import { Wifi, WifiOff, Database, ShieldCheck, Clock } from 'lucide-react'

export function StatusBar() {
  const { demoMode } = useAuthStore()

  return (
    <div className="h-[32px] bg-white border-t border-border flex items-center justify-between px-4 flex-shrink-0 text-[11px] text-slate-500">
      {/* Left: Status indicators */}
      <div className="flex items-center gap-4">
        {/* Ready status */}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="font-medium text-slate-600">Ready</span>
        </div>

        <div className="w-px h-3.5 bg-border" />

        {/* Database status */}
        <div className="flex items-center gap-1.5">
          <Database className="w-3 h-3 text-primary" />
          <span>Local Database: Connected</span>
        </div>
      </div>

      {/* Right: More info */}
      <div className="flex items-center gap-4">
        {/* Online/Offline */}
        <div className="flex items-center gap-1.5">
          {demoMode ? (
            <>
              <WifiOff className="w-3 h-3 text-warning" />
              <span className="text-warning font-medium">Offline Mode</span>
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
          <span className="font-mono">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  )
}
