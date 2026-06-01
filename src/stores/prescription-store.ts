'use client'

import { create } from 'zustand'
import { Prescription, MedicineRow } from '@/types'
import { DEMO_PRESCRIPTIONS } from '@/lib/constants'

interface PrescriptionState {
  prescriptions: Prescription[]
  currentRx: {
    patientName: string
    patientAge: string
    patientPhone: string
    date: string
    complaint: string
    diagnosis: string
    notes: string
    medicines: MedicineRow[]
  }
  editingRxId: number | null
  paperSize: 'A4' | 'A5'
  addPrescription: (rx: Omit<Prescription, 'id' | 'updateHistory'>) => Prescription
  updatePrescription: (id: number, newMedicines: string[], newDate: string) => void
  getPatientPrescriptions: (patientId: number) => Prescription[]
  setCurrentRx: (data: Partial<PrescriptionState['currentRx']>) => void
  resetCurrentRx: () => void
  setEditingRxId: (id: number | null) => void
  setPaperSize: (size: 'A4' | 'A5') => void
  addMedicineRow: (medicine?: Partial<MedicineRow>) => void
  removeMedicineRow: (index: number) => void
  updateMedicineRow: (index: number, data: Partial<MedicineRow>) => void
}

const defaultRx = {
  patientName: '',
  patientAge: '',
  patientPhone: '',
  date: new Date().toISOString().split('T')[0],
  complaint: '',
  diagnosis: '',
  notes: '',
  medicines: [{ name: '', dose: '', freq: '', dur: '', inst: '' }],
}

export const usePrescriptionStore = create<PrescriptionState>((set, get) => ({
  prescriptions: DEMO_PRESCRIPTIONS.map(rx => ({ ...rx, updateHistory: [] })),
  currentRx: { ...defaultRx },
  editingRxId: null,
  paperSize: 'A5',

  addPrescription: (rx) => {
    const newRx: Prescription = { id: get().prescriptions.length + 1, ...rx, updateHistory: [] }
    set((state) => ({ prescriptions: [newRx, ...state.prescriptions] }))
    return newRx
  },

  updatePrescription: (id, newMedicines, newDate) => {
    set((state) => ({
      prescriptions: state.prescriptions.map((r) => {
        if (r.id !== id) return r
        const history = r.updateHistory || []
        return {
          ...r,
          medicines: [...r.medicines, ...newMedicines],
          date: newDate,
          updateHistory: [
            ...history,
            { date: newDate, medicines: newMedicines }
          ]
        }
      }),
    }))
  },

  getPatientPrescriptions: (patientId) =>
    get()
      .prescriptions.filter((r) => r.patientId === patientId)
      .sort((a, b) => b.id - a.id),

  setCurrentRx: (data) =>
    set((state) => ({ currentRx: { ...state.currentRx, ...data } })),

  resetCurrentRx: () => set({ currentRx: { ...defaultRx }, editingRxId: null }),

  setEditingRxId: (id) => set({ editingRxId: id }),

  setPaperSize: (size) => set({ paperSize: size }),

  addMedicineRow: (medicine = {}) =>
    set((state) => ({
      currentRx: {
        ...state.currentRx,
        medicines: [...state.currentRx.medicines, { name: '', dose: '', freq: '', dur: '', inst: '', ...medicine }],
      },
    })),

  removeMedicineRow: (index) =>
    set((state) => ({
      currentRx: {
        ...state.currentRx,
        medicines: state.currentRx.medicines.filter((_, i) => i !== index),
      },
    })),

  updateMedicineRow: (index, data) =>
    set((state) => ({
      currentRx: {
        ...state.currentRx,
        medicines: state.currentRx.medicines.map((m, i) => (i === index ? { ...m, ...data } : m)),
      },
    })),
}))
