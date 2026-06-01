'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DosageFrequencyEntry } from '@/types'

interface DosageFrequencyState {
  entries: DosageFrequencyEntry[]
  addEntry: (entry: Omit<DosageFrequencyEntry, 'id' | 'createdAt'>) => void
  updateEntry: (id: number, data: Partial<DosageFrequencyEntry>) => void
  deleteEntry: (id: number) => void
  searchEntries: (query: string) => DosageFrequencyEntry[]
}

export const useDosageFrequencyStore = create<DosageFrequencyState>()(
  persist(
    (set, get) => ({
      entries: [
        { id: 1, medicineName: 'Amoxicillin', dosageId: 2, frequencyId: 3, durationId: 4, notes: 'Take after meals', createdAt: '2026-05-20' },
        { id: 2, medicineName: 'Metformin', dosageId: 2, frequencyId: 2, durationId: 7, notes: 'Take with breakfast and dinner', createdAt: '2026-05-18' },
        { id: 3, medicineName: 'Paracetamol', dosageId: 3, frequencyId: 5, durationId: 2, notes: 'As needed for fever', createdAt: '2026-05-15' },
      ],

      addEntry: (entryData) => {
        const newEntry: DosageFrequencyEntry = {
          id: get().entries.length + 1,
          ...entryData,
          createdAt: new Date().toISOString().split('T')[0],
        }
        set((state) => ({ entries: [newEntry, ...state.entries] }))
      },

      updateEntry: (id, data) => {
        set((state) => ({
          entries: state.entries.map((e) => (e.id === id ? { ...e, ...data } : e)),
        }))
      },

      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }))
      },

      searchEntries: (query) => {
        const term = query.toLowerCase()
        return get().entries.filter(
          (e) => e.medicineName.toLowerCase().includes(term)
        )
      },
    }),
    {
      name: 'prescribo-dosage-frequency',
    }
  )
)
