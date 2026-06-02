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
    specialization: '',
    regNo: '',
    clinicAddressLine1: '',
    clinicAddressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    phone: '',
    email: '',
    website: '',
    signature: '',
    defaultLanguage: 'en',
  },
  security: {
    requirePin: false,
    autoLock: false,
    encryptData: false,
  },
  templateStyle: 'header-footer',
  prescriptionFooterHtml: '',
}

interface SettingsState extends AppSettings {
  _apiAvailable: boolean
  setApiAvailable: (available: boolean) => void
  updateClinic: (data: Partial<AppSettings['clinic']>) => Promise<void>
  updateSecurity: (data: Partial<AppSettings['security']>) => Promise<void>
  updateTemplateStyle: (style: AppSettings['templateStyle']) => void
  updatePrescriptionFooterHtml: (html: string) => Promise<void>
  syncFromApi: (doctorProfile: any, appSettings?: any[]) => void
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
              specialization: updated.specialization,
              registration_number: updated.regNo,
              clinic_name: updated.clinicName,
              clinic_address_line1: updated.clinicAddressLine1,
              clinic_address_line2: updated.clinicAddressLine2,
              city: updated.city,
              state: updated.state,
              pincode: updated.pincode,
              country: updated.country,
              phone: updated.phone,
              email: updated.email,
              website: updated.website,
              default_language: updated.defaultLanguage,
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

      updatePrescriptionFooterHtml: async (html) => {
        const state = get()
        if (state._apiAvailable) {
          try {
            await settingsApi.app.set('prescription_footer_html', html, 'text')
          } catch (e: any) {
            console.warn('API updatePrescriptionFooterHtml failed, falling back to local:', e.message)
          }
        }
        set({ prescriptionFooterHtml: html })
      },

      syncFromApi: (doctorProfile, appSettings) => {
        const updates: Partial<SettingsState> = {}
        if (doctorProfile) {
          updates.clinic = {
            ...get().clinic,
            clinicName: doctorProfile.clinic_name || get().clinic.clinicName,
            doctorName: doctorProfile.full_name || get().clinic.doctorName,
            doctorQual: doctorProfile.qualifications || get().clinic.doctorQual,
            specialization: doctorProfile.specialization || get().clinic.specialization,
            regNo: doctorProfile.registration_number || get().clinic.regNo,
            clinicAddressLine1: doctorProfile.clinic_address_line1 || get().clinic.clinicAddressLine1,
            clinicAddressLine2: doctorProfile.clinic_address_line2 || get().clinic.clinicAddressLine2,
            city: doctorProfile.city || get().clinic.city,
            state: doctorProfile.state || get().clinic.state,
            pincode: doctorProfile.pincode || get().clinic.pincode,
            country: doctorProfile.country || get().clinic.country,
            phone: doctorProfile.phone || get().clinic.phone,
            email: doctorProfile.email || get().clinic.email,
            website: doctorProfile.website || get().clinic.website,
            signature: doctorProfile.full_name || get().clinic.signature,
            defaultLanguage: doctorProfile.default_language || get().clinic.defaultLanguage,
          }
        }
        if (appSettings) {
          const footerSetting = appSettings.find((s: any) => s.setting_key === 'prescription_footer_html')
          if (footerSetting) {
            updates.prescriptionFooterHtml = footerSetting.setting_value || ''
          }
        }
        if (Object.keys(updates).length > 0) {
          set(updates)
        }
      },
    }),
    {
      name: 'prescribo-settings',
    }
  )
)
