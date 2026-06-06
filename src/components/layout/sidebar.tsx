'use client'

import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { NAV_ITEMS } from '@/lib/constants'
import {
  LayoutGrid, Users, FileText, LayoutTemplate, Clock, Settings,
  HelpCircle, ChevronLeft, ChevronRight
} from 'lucide-react'

const icons: Record<string, React.ReactNode> = {
  LayoutGrid: <LayoutGrid className="w-5 h-5 flex-shrink-0" />,
  Users: <Users className="w-5 h-5 flex-shrink-0" />,
  FileText: <FileText className="w-5 h-5 flex-shrink-0" />,
  LayoutTemplate: <LayoutTemplate className="w-5 h-5 flex-shrink-0" />,
  Clock: <Clock className="w-5 h-5 flex-shrink-0" />,
  HelpCircle: <HelpCircle className="w-5 h-5 flex-shrink-0" />,
  Settings: <Settings className="w-5 h-5 flex-shrink-0" />,
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { demoMode } = useAuthStore()

  const currentView = pathname.split('/')[1] || 'dashboard'

  return (
    <aside
      className={cn(
        'h-full bg-white border-r border-border flex flex-col p-3 relative flex-shrink-0 transition-all duration-300',
        sidebarCollapsed ? 'w-[72px] items-center' : 'w-1/4 min-w-[220px] max-w-[280px]'
      )}
    >
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-3 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow cursor-pointer z-10 hover:scale-110 transition-transform border-2 border-white"
      >
        {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      <div className={cn('flex items-center justify-center mb-6 p-2 min-h-[60px] transition-all', sidebarCollapsed ? '' : 'justify-center')}>
        <svg
          className={cn('h-auto transition-all', sidebarCollapsed ? 'w-11' : 'w-[140px]')}
          viewBox="0 0 200 60"
          fill="none"
        >
          <rect x="5" y="15" width="40" height="40" rx="8" fill="url(#g3)" />
          <path d="M15 25h20M15 35h20M15 45h12" stroke="white" strokeWidth="3" strokeLinecap="round" />
          {!sidebarCollapsed && (
            <text x="55" y="42" fontSize="28" fontWeight="800" fill="#1e3a8a">Prescribo</text>
          )}
          <defs>
            <linearGradient id="g3" x1="5" y1="15" x2="45" y2="55">
              <stop stopColor="#1d4ed8" />
              <stop offset="1" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <nav className="flex flex-col gap-0.5 flex-1 w-full" data-tour-step="sidebar">
        {NAV_ITEMS.map((item) => {
          const isActive = currentView === item.id
          return (
            <button
              key={item.id}
              data-tour-step={item.id === 'settings' ? 'settings' : undefined}
              onClick={() => router.push(`/${item.id}`)}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-lg cursor-pointer transition-all text-sm font-medium w-full',
                isActive
                  ? 'bg-gradient-to-r from-primary-50 to-teal-50 text-primary font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              {icons[item.icon]}
              {!sidebarCollapsed && <span className="transition-all">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {!sidebarCollapsed && (
        <div className="mt-auto pt-4 border-t border-border text-center">
          <div className="text-[0.7rem] text-slate-400 font-medium">Prescribo v1.0.0</div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.75rem] font-bold mt-2 border ${demoMode ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-success-50 text-success border-green-200'}`}>
            <CheckCircle className="w-3 h-3" />
            {demoMode ? 'Demo Mode' : 'Pro License'}
          </div>
          {demoMode && (
            <button
              onClick={() => router.push('/activate')}
              className="block mx-auto mt-2 text-xs font-semibold text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              Activate License →
            </button>
          )}
          <div className="text-[0.7rem] text-slate-400 mt-1.5">Last sync: Just now</div>
        </div>
      )}
    </aside>
  )
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
