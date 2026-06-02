'use client'

import { create } from 'zustand'
import { Prescription, MedicineRow } from '@/types'
import { prescriptionsApi } from '@/lib/api'

interface PrescriptionState {
  prescriptions: Prescription[]
  currentRx: {
    patientName: string
    patientAge: string
    patientGender: string
    patientPlace: string
    date: string
    complaint: string
    diagnosis: string
    notes: string
    medicines: MedicineRow[]
  }
  editingRxId: number | null
  paperSize: 'A4' | 'A5'
  _apiAvailable: boolean
  setApiAvailable: (available: boolean) => void
  addPrescription: (rx: Omit<Prescription, 'id' | 'updateHistory'> & { complaint?: string; notes?: string }) => Promise<Prescription>
  updatePrescription: (id: number, addedMedicines: MedicineRow[], allMedicines: MedicineRow[], newDate: string) => Promise<void>
  deletePrescription: (id: number) => Promise<void>
  getPatientPrescriptions: (patientId: number) => Prescription[]
  setCurrentRx: (data: Partial<PrescriptionState['currentRx']>) => void
  resetCurrentRx: () => void
  setEditingRxId: (id: number | null) => void
  setPaperSize: (size: 'A4' | 'A5') => void
  addMedicineRow: (medicine?: Partial<MedicineRow>) => void
  removeMedicineRow: (index: number) => void
  updateMedicineRow: (index: number, data: Partial<MedicineRow>) => void
  syncFromApi: (apiRx: any[]) => void
}

function mapApiPrescription(r: any): Prescription {
  return {
    id: r.id,
    patientId: r.patient_id,
    patientName: r.patient_name || '',
    date: r.prescription_date || r.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    diagnosis: r.diagnosis || '',
    medicines: (r.medicine_rows || []).map((m: any) => ({
      name: m.medicine_name,
      dose: m.dosage || '',
      freq: m.frequency || '',
      dur: m.duration || '',
      inst: m.instructions || '',
    })),
    doctor: r.doctor_name || '',
    updateHistory: (r.update_history || []).map((h: any) => ({
      date: h.date,
      medicines: (h.medicines || []).map((m: any) => ({
        name: m.name || m.medicine_name || '',
        dose: m.dose || m.dosage || '',
        freq: m.freq || m.frequency || '',
        dur: m.dur || m.duration || '',
        inst: m.inst || m.instructions || '',
      })),
    })),
  }
}

const defaultRx = {
  patientName: '',
  patientAge: '',
  patientGender: '',
  patientPlace: '',
  date: new Date().toISOString().split('T')[0],
  complaint: '',
  diagnosis: '',
  notes: '',
  medicines: [{ name: '', dose: '', freq: '', dur: '', inst: '' }],
}

export const usePrescriptionStore = create<PrescriptionState>((set, get) => ({
      prescriptions: [],
      currentRx: { ...defaultRx },
      editingRxId: null,
      paperSize: 'A5',
      _apiAvailable: false,

      setApiAvailable: (available) => set({ _apiAvailable: available }),

      addPrescription: async (rx) => {
        const state = get()
        const newRx: Prescription = {
          id: state.prescriptions.length + 1,
          ...rx,
          updateHistory: [],
        }

        if (state._apiAvailable && rx.patientId) {
          try {
            const created = await prescriptionsApi.create({
              patient_id: rx.patientId,
              patient_name: rx.patientName,
              prescription_date: rx.date,
              chief_complaints: rx.complaint,
              diagnosis: rx.diagnosis,
              special_instructions: rx.notes,
              paper_size: state.paperSize,
              medicine_rows: rx.medicines.map((m, i) => ({
                medicine_name: m.name,
                dosage: m.dose,
                frequency: m.freq,
                duration: m.dur,
                instructions: m.inst,
                display_order: i,
              })),
            })
            const mapped = mapApiPrescription(created)
            set((s) => ({ prescriptions: [mapped, ...s.prescriptions] }))
            return mapped
          } catch (e: any) {
            console.warn('API addPrescription failed, falling back to local:', e.message)
          }
        }

        set((s) => ({ prescriptions: [newRx, ...s.prescriptions] }))
        return newRx
      },

      updatePrescription: async (id, addedMedicines, allMedicines, newDate) => {
        const state = get()
        const existing = state.prescriptions.find((r) => r.id === id)
        const newHistoryEntry = { date: newDate, medicines: addedMedicines }
        const updatedHistory = [...(existing?.updateHistory || []), newHistoryEntry]

        if (state._apiAvailable && existing) {
          try {
            await prescriptionsApi.update(id, {
              prescription_date: newDate,
              medicine_rows: allMedicines.map((m, i) => ({
                medicine_name: m.name,
                dosage: m.dose,
                frequency: m.freq,
                duration: m.dur,
                instructions: m.inst,
                display_order: i,
              })),
              update_history: updatedHistory.map((h) => ({
                date: h.date,
                medicines: h.medicines.map((m) => ({
                  name: m.name,
                  dose: m.dose,
                  freq: m.freq,
                  dur: m.dur,
                  inst: m.inst,
                })),
              })),
            })
          } catch (e: any) {
            console.warn('API updatePrescription failed, falling back to local:', e.message)
          }
        }

        set((s) => ({
          prescriptions: s.prescriptions.map((r) => {
            if (r.id !== id) return r
            return {
              ...r,
              date: newDate,
              updateHistory: updatedHistory,
            }
          }),
        }))
      },

      deletePrescription: async (id) => {
        const state = get()

        if (state._apiAvailable) {
          try {
            await prescriptionsApi.remove(id)
          } catch (e: any) {
            console.warn('API deletePrescription failed, falling back to local:', e.message)
          }
        }

        set((s) => ({
          prescriptions: s.prescriptions.filter((r) => r.id !== id),
        }))
      },

      getPatientPrescriptions: (patientId) =>
        get()
          .prescriptions.filter((r) => r.patientId === patientId)
          .sort((a, b) => b.id - a.id),

      setCurrentRx: (data) =>
        set((state) => ({ currentRx: { ...state.currentRx, ...data } })),

      resetCurrentRx: () => set({ currentRx: { ...defaultRx, date: new Date().toISOString().split('T')[0] }, editingRxId: null }),

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

      syncFromApi: (apiRx) => {
        set({ prescriptions: (apiRx || []).map(mapApiPrescription) })
      },
    }))
