'use client'

import { create } from 'zustand'
import { DosageFrequencyEntry } from '@/types'
import { mastersApi } from '@/lib/api'

interface DosageFrequencyState {
  entries: DosageFrequencyEntry[]
  _apiAvailable: boolean
  setApiAvailable: (available: boolean) => void
  addEntry: (entry: Omit<DosageFrequencyEntry, 'id' | 'createdAt'>) => Promise<void>
  updateEntry: (id: number, data: Partial<DosageFrequencyEntry>) => Promise<void>
  deleteEntry: (id: number) => Promise<void>
  searchEntries: (query: string) => DosageFrequencyEntry[]
  clearAll: () => void
      syncFromApi: (apiItems: {
    id: number
    medicine_name: string
    dosage_id: number
    frequency_id: number
    duration_id: number
    notes?: string
    created_at?: string
    dosage?: string
    frequency?: string
    duration?: string
  }[]) => void
}

export const useDosageFrequencyStore = create<DosageFrequencyState>((set, get) => ({
      entries: [],
      _apiAvailable: false,

      setApiAvailable: (available) => set({ _apiAvailable: available }),

      addEntry: async (entryData) => {
        const state = get()
        const newEntry: DosageFrequencyEntry = {
          id: state.entries.length + 1,
          ...entryData,
          createdAt: new Date().toISOString().split('T')[0],
        }

        if (state._apiAvailable) {
          try {
            const created = await mastersApi.dosageFrequency.create({
              medicine_name: entryData.medicineName,
              dosage_id: entryData.dosageId,
              frequency_id: entryData.frequencyId,
              duration_id: entryData.durationId,
              notes: entryData.notes,
            })
            set((s) => ({
              entries: [...s.entries, {
                id: created.id,
                medicineName: created.medicine_name,
                dosageId: created.dosage_id,
                frequencyId: created.frequency_id,
                durationId: created.duration_id,
                notes: created.notes,
                createdAt: created.created_at ? created.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
              }],
            }))
            return
          } catch (e: any) {
            console.warn('API createDosageFrequency failed, falling back to local:', e.message)
          }
        }

        set((s) => ({ entries: [...s.entries, newEntry] }))
      },

      updateEntry: async (id, data) => {
        const state = get()

        if (state._apiAvailable) {
          try {
            const payload: any = {}
            if (data.medicineName !== undefined) payload.medicine_name = data.medicineName
            if (data.dosageId !== undefined) payload.dosage_id = data.dosageId
            if (data.frequencyId !== undefined) payload.frequency_id = data.frequencyId
            if (data.durationId !== undefined) payload.duration_id = data.durationId
            if (data.notes !== undefined) payload.notes = data.notes
            await mastersApi.dosageFrequency.update(id, payload)
          } catch (e: any) {
            console.warn('API updateDosageFrequency failed, falling back to local:', e.message)
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
            await mastersApi.dosageFrequency.remove(id)
          } catch (e: any) {
            console.warn('API deleteDosageFrequency failed, falling back to local:', e.message)
          }
        }

        set((s) => ({
          entries: s.entries.filter((e) => e.id !== id),
        }))
      },

      searchEntries: (query) => {
        const term = query.toLowerCase()
        return get().entries.filter((e) => e.medicineName.toLowerCase().includes(term))
      },

      clearAll: () => set({ entries: [] }),

      syncFromApi: (apiItems) => {
        set({
          entries: (apiItems || []).map((e) => ({
            id: e.id,
            medicineName: e.medicine_name,
            dosageId: e.dosage_id,
            frequencyId: e.frequency_id,
            durationId: e.duration_id,
            notes: e.notes || '',
            createdAt: e.created_at ? e.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          })),
        })
      },
    }))
