'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppSettings } from '@/types'

const defaultSettings: AppSettings = {
  clinic: {
    clinicName: 'City Health Clinic',
    doctorName: 'Dr. David Smith',
    doctorQual: 'MBBS, MD (Internal Medicine)',
    regNo: 'Reg. No: 12345 | MCI',
    address: '123 Medical Center Rd, Bangalore - 560001',
    signature: 'Dr. Smith',
  },
  security: {
    requirePin: true,
    autoLock: true,
    encryptData: true,
  },
}

interface SettingsState extends AppSettings {
  updateClinic: (data: Partial<AppSettings['clinic']>) => void
  updateSecurity: (data: Partial<AppSettings['security']>) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      updateClinic: (data) =>
        set((state) => ({ clinic: { ...state.clinic, ...data } })),
      updateSecurity: (data) =>
        set((state) => ({ security: { ...state.security, ...data } })),
    }),
    {
      name: 'prescribo-settings',
    }
  )
)
