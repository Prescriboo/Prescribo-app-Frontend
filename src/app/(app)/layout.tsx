'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { TopBar } from '@/components/layout/top-bar'
import { TitleBar } from '@/components/layout/title-bar'
import { StatusBar } from '@/components/layout/status-bar'
import { LicenseLockScreen } from '@/components/layout/license-lock-screen'
import { ToastContainer } from '@/components/ui/toast'
import UpdateNotification from '@/components/update-notification'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Top: Dark titlebar (Electron only) */}
      <TitleBar />

      {/* Middle: Sidebar + Content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-bg">
          <TopBar />
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
        <ToastContainer />
      </div>

      {/* Bottom: Status bar */}
      <StatusBar />

      {/* Auto-update notification */}
      <UpdateNotification />

      {/* License lock overlay */}
      <LicenseLockScreen />
    </div>
  )
}
