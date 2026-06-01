'use client'

import { create } from 'zustand'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

interface UIState {
  sidebarCollapsed: boolean
  toasts: Toast[]
  toggleSidebar: () => void
  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarCollapsed: false,
  toasts: [],

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  addToast: (message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9)
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => get().removeToast(id), 3000)
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
