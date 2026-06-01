'use client'

import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[2000] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle className="w-[18px] h-[18px] text-success" />,
          error: <XCircle className="w-[18px] h-[18px] text-danger" />,
          warning: <AlertTriangle className="w-[18px] h-[18px] text-warning" />,
          info: <Info className="w-[18px] h-[18px] text-primary" />,
        }

        const borders = {
          success: 'border-l-success',
          error: 'border-l-danger',
          warning: 'border-l-warning',
          info: 'border-l-primary',
        }

        return (
          <div
            key={toast.id}
            className={cn(
              'bg-white border border-border border-l-4 rounded-lg px-5 py-3.5 shadow-lg flex items-center gap-2.5 min-w-[280px] max-w-[400px] pointer-events-auto text-sm animate-in slide-in-from-right',
              borders[toast.type]
            )}
          >
            {icons[toast.type]}
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-auto text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
