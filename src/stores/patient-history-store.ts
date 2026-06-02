'use client'

import { create } from 'zustand'
import { PatientHistoryEntry } from '@/types'

interface PatientHistoryState {
  entries: PatientHistoryEntry[]
  addEntry: (entry: Omit<PatientHistoryEntry, 'id' | 'createdAt'>) => void
  updateEntry: (id: number, data: Partial<PatientHistoryEntry>) => void
  deleteEntry: (id: number) => void
  searchEntries: (query: string) => PatientHistoryEntry[]
}

export const usePatientHistoryStore = create<PatientHistoryState>((set, get) => ({
      entries: [],

      addEntry: (entryData) => {
        const newEntry: PatientHistoryEntry = {
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
          (e) =>
            e.patientName.toLowerCase().includes(term) ||
            e.medicineName.toLowerCase().includes(term) ||
            e.diagnosis.toLowerCase().includes(term)
        )
      },
    }))
