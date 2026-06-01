'use client'

import { create } from 'zustand'
import { Patient } from '@/types'
import { DEMO_PATIENTS } from '@/lib/constants'

interface PatientState {
  patients: Patient[]
  currentPatientId: number | null
  addPatient: (patient: Omit<Patient, 'id' | 'lastVisit' | 'status' | 'visits' | 'rxCount'>) => Patient
  updatePatient: (id: number, data: Partial<Patient>) => void
  setCurrentPatient: (id: number | null) => void
  getPatient: (id: number) => Patient | undefined
  searchPatients: (query: string) => Patient[]
}

export const usePatientStore = create<PatientState>((set, get) => ({
  patients: DEMO_PATIENTS,
  currentPatientId: null,

  addPatient: (patientData) => {
    const newPatient: Patient = {
      id: get().patients.length + 1,
      ...patientData,
      lastVisit: 'Just now',
      status: 'Active',
      visits: 0,
      rxCount: 0,
    }
    set((state) => ({ patients: [newPatient, ...state.patients] }))
    return newPatient
  },

  updatePatient: (id, data) => {
    set((state) => ({
      patients: state.patients.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }))
  },

  setCurrentPatient: (id) => set({ currentPatientId: id }),

  getPatient: (id) => get().patients.find((p) => p.id === id),

  searchPatients: (query) => {
    const term = query.toLowerCase()
    return get().patients.filter(
      (p) => p.name.toLowerCase().includes(term) || p.phone.includes(term)
    )
  },
}))
