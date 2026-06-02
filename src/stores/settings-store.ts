'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppSettings } from '@/types'
import { settingsApi } from '@/lib/api'

const defaultSettings: AppSettings = {
  clinic: {
    clinicName: '',
    doctorName: '',
    doctorQual: '',
    regNo: '',
    address: '',
    signature: '',
  },
  security: {
    requirePin: false,
    autoLock: false,
    encryptData: false,
  },
  templateStyle: 'header-footer',
}

interface SettingsState extends AppSettings {
  _apiAvailable: boolean
  setApiAvailable: (available: boolean) => void
  updateClinic: (data: Partial<AppSettings['clinic']>) => Promise<void>
  updateSecurity: (data: Partial<AppSettings['security']>) => Promise<void>
  updateTemplateStyle: (style: AppSettings['templateStyle']) => void
  syncFromApi: (doctorProfile: any) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      _apiAvailable: false,

      setApiAvailable: (available) => set({ _apiAvailable: available }),

      updateClinic: async (data) => {
        const state = get()
        const updated = { ...state.clinic, ...data }

        if (state._apiAvailable) {
          try {
            await settingsApi.doctorProfile.update({
              full_name: updated.doctorName,
              qualifications: updated.doctorQual,
              registration_number: updated.regNo,
              clinic_name: updated.clinicName,
              clinic_address_line1: updated.address,
            })
          } catch (e: any) {
            console.warn('API updateClinic failed, falling back to local:', e.message)
          }
        }

        set({ clinic: updated })
      },

      updateSecurity: async (data) => {
        const state = get()
        const updated = { ...state.security, ...data }

        if (state._apiAvailable) {
          try {
            await settingsApi.security.update({
              pin_enabled: updated.requirePin,
              auto_lock_timeout_min: updated.autoLock ? 10 : 0,
              backup_encryption_enabled: updated.encryptData,
            })
          } catch (e: any) {
            console.warn('API updateSecurity failed, falling back to local:', e.message)
          }
        }

        set({ security: updated })
      },

      updateTemplateStyle: (style) => set({ templateStyle: style }),

      syncFromApi: (doctorProfile) => {
        if (!doctorProfile) return
        set((state) => ({
          clinic: {
            ...state.clinic,
            clinicName: doctorProfile.clinic_name || state.clinic.clinicName,
            doctorName: doctorProfile.full_name || state.clinic.doctorName,
            doctorQual: doctorProfile.qualifications || state.clinic.doctorQual,
            regNo: doctorProfile.registration_number || state.clinic.regNo,
            address: [doctorProfile.clinic_address_line1, doctorProfile.clinic_address_line2, doctorProfile.city, doctorProfile.state, doctorProfile.pincode]
              .filter(Boolean)
              .join(', ') || state.clinic.address,
            signature: doctorProfile.full_name || state.clinic.signature,
          },
        }))
      },
    }),
    {
      name: 'prescribo-settings',
    }
  )
)
