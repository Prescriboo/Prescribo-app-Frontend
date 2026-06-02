'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Patient } from '@/types'
import { patientsApi } from '@/lib/api'

interface PatientState {
  patients: Patient[]
  currentPatientId: number | null
  _apiAvailable: boolean
  setApiAvailable: (available: boolean) => void
  addPatient: (patient: Omit<Patient, 'id' | 'lastVisit' | 'status' | 'visits' | 'rxCount'>) => Promise<Patient>
  updatePatient: (id: number, data: Partial<Patient>) => Promise<void>
  deletePatient: (id: number) => Promise<void>
  setCurrentPatient: (id: number | null) => void
  getPatient: (id: number) => Patient | undefined
  searchPatients: (query: string) => Patient[]
  syncFromApi: (apiPatients: any[]) => void
}

function mapApiPatient(p: any): Patient {
  return {
    id: p.id,
    name: p.name,
    age: p.age ?? '',
    gender: p.gender || '',
    place: p.address || '',
    email: p.email || '',
    allergies: p.allergies || '',
    conditions: p.chronic_conditions || '',
    lastVisit: p.last_visit_date
      ? new Date(p.last_visit_date).toLocaleDateString()
      : 'Just now',
    status: (p.status === 'Active' ? 'Active' : 'Inactive') as 'Active' | 'Inactive',
    visits: p.visit_count || 0,
    rxCount: 0,
  }
}

export const usePatientStore = create<PatientState>()(
  persist(
    (set, get) => ({
      patients: [],
      currentPatientId: null,
      _apiAvailable: false,

      setApiAvailable: (available) => set({ _apiAvailable: available }),

      addPatient: async (patientData) => {
        const state = get()
        const newPatient: Patient = {
          id: state.patients.length + 1,
          ...patientData,
          lastVisit: 'Just now',
          status: 'Active',
          visits: 0,
          rxCount: 0,
        }

        if (state._apiAvailable) {
          try {
            const created = await patientsApi.create({
              name: patientData.name,
              age: typeof patientData.age === 'string' ? parseInt(patientData.age) || undefined : patientData.age,
              gender: patientData.gender,
              address: patientData.place,
              email: patientData.email,
              allergies: patientData.allergies,
              chronic_conditions: patientData.conditions,
              status: 'Active',
            })
            const mapped = mapApiPatient(created)
            set((s) => ({ patients: [mapped, ...s.patients] }))
            return mapped
          } catch (e: any) {
            console.warn('API addPatient failed, falling back to local:', e.message)
          }
        }

        set((s) => ({ patients: [newPatient, ...s.patients] }))
        return newPatient
      },

      updatePatient: async (id, data) => {
        const state = get()

        if (state._apiAvailable) {
          try {
            await patientsApi.update(id, {
              name: data.name,
              age: typeof data.age === 'string' ? parseInt(data.age) || undefined : data.age,
              gender: data.gender,
              address: data.place,
              email: data.email,
              allergies: data.allergies,
              chronic_conditions: data.conditions,
              status: data.status,
            })
          } catch (e: any) {
            console.warn('API updatePatient failed, falling back to local:', e.message)
          }
        }

        set((s) => ({
          patients: s.patients.map((p) => (p.id === id ? { ...p, ...data } : p)),
        }))
      },

      deletePatient: async (id) => {
        const state = get()

        if (state._apiAvailable) {
          try {
            await patientsApi.remove(id)
          } catch (e: any) {
            console.warn('API deletePatient failed, falling back to local:', e.message)
          }
        }

        set((s) => ({
          patients: s.patients.filter((p) => p.id !== id),
        }))
      },

      setCurrentPatient: (id) => set({ currentPatientId: id }),

      getPatient: (id) => get().patients.find((p) => p.id === id),

      searchPatients: (query) => {
        const term = query.toLowerCase()
        return get().patients.filter(
          (p) => p.name.toLowerCase().includes(term) || p.place.includes(term)
        )
      },

      syncFromApi: (apiPatients) => {
        set({ patients: (apiPatients || []).map(mapApiPatient) })
      },
    }),
    {
      name: 'prescribo-patients',
      partialize: (state) => ({ patients: state.patients, currentPatientId: state.currentPatientId } as any),
    }
  )
)
