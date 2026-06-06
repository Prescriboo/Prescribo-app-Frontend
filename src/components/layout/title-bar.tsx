'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Minus, Square, X, Maximize2 } from 'lucide-react'

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)
  const [platform, setPlatform] = useState('win32')
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).electron) {
      (window as any).electron.getPlatform().then((p: string) => setPlatform(p))
      ;(window as any).electron.window.isMaximized().then((m: boolean) => setIsMaximized(m))
    }
  }, [])

  // macOS uses native titlebar
  if (platform === 'darwin') return null

  const handleMinimize = () => {
    if ((window as any).electron) (window as any).electron.window.minimize()
  }

  const handleMaximize = async () => {
    if ((window as any).electron) {
      await (window as any).electron.window.maximize()
      const m = await (window as any).electron.window.isMaximized()
      setIsMaximized(m)
    }
  }

  const handleClose = () => {
    if ((window as any).electron) (window as any).electron.window.close()
  }

  const isActive = (route: string) => pathname === route || pathname.startsWith(route + '/')

  return (
    <div
      className="h-[38px] bg-[#0f172a] flex items-center justify-between select-none flex-shrink-0"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left: App branding */}
      <div className="flex items-center gap-3 px-4 h-full" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <img src="/app_icon_512.png" alt="Prescribo" className="w-5 h-5 rounded flex-shrink-0" />
        <span className="text-[13px] font-semibold text-white/90 tracking-wide">Prescribo</span>
        <span className="text-[10px] font-medium text-white/40 bg-white/10 px-1.5 py-0.5 rounded">v2.4.1</span>
      </div>

      {/* Center: draggable */}
      <div className="flex-1 h-full" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />

      {/* Right: tool icons + window controls */}
      <div className="flex items-center h-full" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        {/* Functional tool icons */}
        <div className="flex items-center gap-0.5 mr-1">
          {/* Dashboard / Grid View */}
          <button
            onClick={() => router.push('/dashboard')}
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded transition-all',
              isActive('/dashboard')
                ? 'text-white bg-white/15'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            )}
            title="Dashboard"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          </button>

          {/* New Prescription */}
          <button
            onClick={() => router.push('/prescriptions')}
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded transition-all',
              isActive('/prescriptions')
                ? 'text-white bg-white/15'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            )}
            title="New Prescription"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12h6m-3-3v6" strokeLinecap="round"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
          </button>

          {/* Templates */}
          <button
            onClick={() => router.push('/templates')}
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded transition-all',
              isActive('/templates')
                ? 'text-white bg-white/15'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            )}
            title="Templates"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="M3 14h7v7H3z"/></svg>
          </button>

          {/* Patients */}
          <button
            onClick={() => router.push('/patients')}
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded transition-all',
              isActive('/patients')
                ? 'text-white bg-white/15'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            )}
            title="Patients"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          </button>

          {/* History */}
          <button
            onClick={() => router.push('/history')}
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded transition-all',
              isActive('/history')
                ? 'text-white bg-white/15'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            )}
            title="History"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </button>

          <div className="w-px h-4 bg-white/10 mx-1" />

          {/* Settings */}
          <button
            onClick={() => router.push('/settings')}
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded transition-all',
              isActive('/settings')
                ? 'text-white bg-white/15'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            )}
            title="Settings"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          </button>
        </div>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Window controls */}
        <button
          onClick={handleMinimize}
          className="w-[40px] h-full flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-[40px] h-full flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? <Maximize2 className="w-3 h-3" /> : <Square className="w-3 h-3" />}
        </button>
        <button
          onClick={handleClose}
          className="w-[40px] h-full flex items-center justify-center text-white/50 hover:text-white hover:bg-[#ef4444] transition-colors"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
