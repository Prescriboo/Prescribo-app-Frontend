'use client'

import { create } from 'zustand'
import { PatientHistoryEntry } from '@/types'
import { patientHistoryApi } from '@/lib/api'

interface PatientHistoryState {
  entries: PatientHistoryEntry[]
  _apiAvailable: boolean
  setApiAvailable: (available: boolean) => void
  addEntry: (entry: Omit<PatientHistoryEntry, 'id' | 'createdAt'>) => Promise<void>
  updateEntry: (id: number, data: Partial<PatientHistoryEntry>) => Promise<void>
  deleteEntry: (id: number) => Promise<void>
  searchEntries: (query: string) => PatientHistoryEntry[]
  syncFromApi: (apiItems: {
    id: number
    patient_id: number
    medicine_name: string
    dosage?: string
    frequency?: string
    duration?: string
    prescribed_at?: string
    instructions?: string
  }[]) => void
}

export const usePatientHistoryStore = create<PatientHistoryState>((set, get) => ({
      entries: [],
      _apiAvailable: false,

      setApiAvailable: (available) => set({ _apiAvailable: available }),

      addEntry: async (entryData) => {
        const state = get()
        const newEntry: PatientHistoryEntry = {
          id: state.entries.length + 1,
          ...entryData,
          createdAt: new Date().toISOString().split('T')[0],
        }

        if (state._apiAvailable && entryData.patient_id) {
          try {
            const created = await patientHistoryApi.create({
              patient_id: entryData.patient_id,
              medicine_name: entryData.medicineName,
              dosage: entryData.dosage,
              frequency: entryData.frequency,
              duration: entryData.duration,
              prescribed_at: entryData.date,
              instructions: [entryData.diagnosis, entryData.notes].filter(Boolean).join(' - '),
            })
            set((s) => ({
              entries: [{
                id: created.id,
                patient_id: created.patient_id,
                patientName: entryData.patientName,
                medicineName: created.medicine_name,
                dosageId: entryData.dosageId,
                frequencyId: entryData.frequencyId,
                durationId: entryData.durationId,
                dosage: created.dosage || entryData.dosage,
                frequency: created.frequency || entryData.frequency,
                duration: created.duration || entryData.duration,
                date: created.prescribed_at ? created.prescribed_at.split('T')[0] : entryData.date,
                diagnosis: entryData.diagnosis,
                notes: entryData.notes,
                createdAt: new Date().toISOString().split('T')[0],
              }, ...s.entries],
            }))
            return
          } catch (e: any) {
            console.warn('API createPatientHistory failed, falling back to local:', e.message)
          }
        }

        set((s) => ({ entries: [newEntry, ...s.entries] }))
      },

      updateEntry: async (id, data) => {
        const state = get()
        const existing = state.entries.find((e) => e.id === id)

        if (state._apiAvailable && existing?.patient_id) {
          try {
            const payload: any = {}
            if (data.medicineName !== undefined) payload.medicine_name = data.medicineName
            if (data.dosage !== undefined) payload.dosage = data.dosage
            if (data.frequency !== undefined) payload.frequency = data.frequency
            if (data.duration !== undefined) payload.duration = data.duration
            if (data.date !== undefined) payload.prescribed_at = data.date
            if (data.diagnosis !== undefined || data.notes !== undefined) {
              payload.instructions = [data.diagnosis ?? existing.diagnosis, data.notes ?? existing.notes].filter(Boolean).join(' - ')
            }
            if (Object.keys(payload).length > 0) {
              await patientHistoryApi.update(id, payload)
            }
          } catch (e: any) {
            console.warn('API updatePatientHistory failed, falling back to local:', e.message)
          }
        }

        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, ...data } : e)),
        }))
      },

      deleteEntry: async (id) => {
        const state = get()

        if (state._apiAvailable) {
          try {
            await patientHistoryApi.remove(id)
          } catch (e: any) {
            console.warn('API deletePatientHistory failed, falling back to local:', e.message)
          }
        }

        set((s) => ({
          entries: s.entries.filter((e) => e.id !== id),
        }))
      },

      searchEntries: (query) => {
        const term = query.toLowerCase()
        return get().entries.filter(
          (e) =>
            e.patientName.toLowerCase().includes(term) ||
            e.medicineName.toLowerCase().includes(term) ||
            e.diagnosis.toLowerCase().includes(term)
        )
      },

      syncFromApi: (apiItems) => {
        set({
          entries: (apiItems || []).map((item) => ({
            id: item.id,
            patient_id: item.patient_id,
            patientName: '', // Will be resolved by UI from patient store
            medicineName: item.medicine_name,
            dosageId: 0,
            frequencyId: 0,
            durationId: 0,
            dosage: item.dosage || '',
            frequency: item.frequency || '',
            duration: item.duration || '',
            date: item.prescribed_at ? item.prescribed_at.split('T')[0] : '',
            diagnosis: item.instructions || '',
            notes: '',
            createdAt: item.prescribed_at ? item.prescribed_at.split('T')[0] : new Date().toISOString().split('T')[0],
          })),
        })
      },
    }))
