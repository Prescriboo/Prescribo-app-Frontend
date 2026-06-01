'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: string
}

export function Modal({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-[500px]' }: ModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[rgba(15,23,42,0.5)] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(
          'bg-white rounded-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]',
          maxWidth
        )}
        style={{ animation: 'modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-bg flex items-center justify-center text-lg text-slate-500 hover:bg-border hover:text-slate-900 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2.5 px-6 py-3.5 border-t border-border sticky bottom-0 bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
