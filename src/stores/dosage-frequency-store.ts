'use client'

import { create } from 'zustand'
import { DosageFrequencyEntry } from '@/types'

interface DosageFrequencyState {
  entries: DosageFrequencyEntry[]
  addEntry: (entry: Omit<DosageFrequencyEntry, 'id' | 'createdAt'>) => void
  updateEntry: (id: number, data: Partial<DosageFrequencyEntry>) => void
  deleteEntry: (id: number) => void
  searchEntries: (query: string) => DosageFrequencyEntry[]
}

export const useDosageFrequencyStore = create<DosageFrequencyState>((set, get) => ({
      entries: [],

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
    }))
