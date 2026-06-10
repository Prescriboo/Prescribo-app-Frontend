'use client'

import { create } from 'zustand'
import { authApi } from '@/lib/api'

interface AuthState {
  isActivated: boolean
  licenseKey: string
  pin: string
  hasPin: boolean
  demoMode: boolean
  trialPrescriptionsUsed: number
  trialMaxPrescriptions: number
  trialExpired: boolean
  trialDaysRemaining: number | null
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
    trial_prescriptions_used?: number
    trial_max_prescriptions?: number
    trial_expired?: boolean
    trial_days_remaining?: number
  }) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isActivated: false,
  licenseKey: '',
  pin: '',
  hasPin: false,
  demoMode: false,
  trialPrescriptionsUsed: 0,
  trialMaxPrescriptions: 10,
  trialExpired: false,
  trialDaysRemaining: null,
  hydrated: false,

  activate: async (key) => {
    // Call backend to activate with cloud API
    const result = await authApi.activate(key)
    set({
      isActivated: result.is_activated,
      licenseKey: result.license_key || key,
      demoMode: result.demo_mode || false,
      hasPin: result.has_pin || false,
      trialExpired: result.trial_expired || false,
      trialPrescriptionsUsed: result.trial_prescriptions_used || 0,
      trialDaysRemaining: result.trial_days_remaining ?? null,
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
      trialExpired: result.trial_expired || false,
      trialPrescriptionsUsed: result.trial_prescriptions_used || 0,
      trialDaysRemaining: result.trial_days_remaining ?? null,
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
    set({ isActivated: false, licenseKey: '', pin: '', hasPin: false, demoMode: false, trialExpired: false, trialPrescriptionsUsed: 0, trialDaysRemaining: null, hydrated: true })
  },

  hydrateFromApi: (apiState) => set({
    isActivated: apiState.is_activated ?? false,
    licenseKey: apiState.license_key ?? '',
    pin: apiState.pin ?? '',
    hasPin: apiState.has_pin ?? false,
    demoMode: apiState.demo_mode ?? false,
    trialExpired: apiState.trial_expired ?? false,
    trialPrescriptionsUsed: apiState.trial_prescriptions_used ?? 0,
    trialMaxPrescriptions: apiState.trial_max_prescriptions ?? 10,
    trialDaysRemaining: apiState.trial_days_remaining ?? null,
    hydrated: true,
  }),
}))
