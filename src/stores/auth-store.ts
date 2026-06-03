'use client'

import { create } from 'zustand'
import { authApi } from '@/lib/api'

interface AuthState {
  isActivated: boolean
  licenseKey: string
  pin: string
  hasPin: boolean
  demoMode: boolean
  hydrated: boolean
  activate: (key: string) => Promise<void>
  skipActivation: () => Promise<void>
  setPin: (pin: string) => Promise<void>
  skipPin: () => Promise<void>
  logout: () => Promise<void>
  hydrateFromApi: (state: {
    is_activated?: boolean
    license_key?: string
    pin?: string
    has_pin?: boolean
    demo_mode?: boolean
  }) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isActivated: false,
  licenseKey: '',
  pin: '',
  hasPin: false,
  demoMode: false,
  hydrated: false,

  activate: async (key) => {
    // Call backend to activate with cloud API
    const result = await authApi.activate(key)
    set({
      isActivated: result.is_activated,
      licenseKey: result.license_key || key,
      demoMode: result.demo_mode || false,
      hasPin: result.has_pin || false,
    })
  },

  skipActivation: async () => {
    // Activate demo mode via backend
    const result = await authApi.demo()
    set({
      isActivated: result.is_activated,
      licenseKey: result.license_key || '',
      demoMode: result.demo_mode || true,
      hasPin: result.has_pin || false,
    })
  },

  setPin: async (pin) => {
    await authApi.setPin(pin)
    set({ pin, hasPin: true })
  },

  skipPin: async () => {
    await authApi.skipPin()
    set({ hasPin: false })
  },

  logout: async () => {
    await authApi.logout()
    set({ isActivated: false, licenseKey: '', pin: '', hasPin: false, demoMode: false, hydrated: true })
  },

  hydrateFromApi: (apiState) => set({
    isActivated: apiState.is_activated ?? false,
    licenseKey: apiState.license_key ?? '',
    pin: apiState.pin ?? '',
    hasPin: apiState.has_pin ?? false,
    demoMode: apiState.demo_mode ?? false,
    hydrated: true,
  }),
}))
