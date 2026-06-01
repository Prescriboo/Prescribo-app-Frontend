'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PatientHistoryEntry } from '@/types'

interface PatientHistoryState {
  entries: PatientHistoryEntry[]
  addEntry: (entry: Omit<PatientHistoryEntry, 'id' | 'createdAt'>) => void
  updateEntry: (id: number, data: Partial<PatientHistoryEntry>) => void
  deleteEntry: (id: number) => void
  searchEntries: (query: string) => PatientHistoryEntry[]
}

export const usePatientHistoryStore = create<PatientHistoryState>()(
  persist(
    (set, get) => ({
      entries: [
        { id: 1, patientName: 'Rajesh Kumar', medicineName: 'Amoxicillin', dosageId: 2, frequencyId: 3, durationId: 4, date: '2026-05-24', diagnosis: 'Upper Respiratory Tract Infection', notes: 'Complete full course', createdAt: '2026-05-24' },
        { id: 2, patientName: 'Priya Sharma', medicineName: 'Metformin', dosageId: 2, frequencyId: 2, durationId: 7, date: '2026-05-23', diagnosis: 'Type 2 Diabetes Follow-up', notes: 'Monitor blood sugar', createdAt: '2026-05-23' },
        { id: 3, patientName: 'Amit Patel', medicineName: 'Cetirizine', dosageId: 6, frequencyId: 1, durationId: 4, date: '2026-05-22', diagnosis: 'Allergic Rhinitis', notes: 'Take at bedtime', createdAt: '2026-05-22' },
      ],

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
    }),
    {
      name: 'prescribo-patient-history',
    }
  )
)
