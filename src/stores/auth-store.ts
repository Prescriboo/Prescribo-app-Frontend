'use client'

import { create } from 'zustand'

interface AuthState {
  isActivated: boolean
  licenseKey: string
  pin: string
  hasPin: boolean
  demoMode: boolean
  activate: (key: string) => void
  skipActivation: () => void
  setPin: (pin: string) => void
  skipPin: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
      isActivated: false,
      licenseKey: '',
      pin: '',
      hasPin: false,
      demoMode: false,
      activate: (key) => set({ isActivated: true, licenseKey: key, demoMode: false }),
      skipActivation: () => set({ isActivated: true, demoMode: true }),
      setPin: (pin) => set({ pin, hasPin: true }),
      skipPin: () => set({ hasPin: false }),
      logout: () => set({ isActivated: false, licenseKey: '', pin: '', hasPin: false, demoMode: false }),
    }))
