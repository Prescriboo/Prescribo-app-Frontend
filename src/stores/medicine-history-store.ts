'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MedicineHistoryEntry } from '@/types'

interface MedicineHistoryState {
  entries: MedicineHistoryEntry[]
  addEntry: (name: string, file?: { fileName: string; fileType: 'pdf' | 'docx'; fileData: string }) => void
  updateEntry: (id: number, name: string, file?: { fileName: string; fileType: 'pdf' | 'docx'; fileData: string }) => void
  deleteEntry: (id: number) => void
  searchEntries: (query: string) => MedicineHistoryEntry[]
}

export const useMedicineHistoryStore = create<MedicineHistoryState>()(
  persist(
    (set, get) => ({
      entries: [
        { id: 1, name: 'Amoxicillin', createdAt: '2026-05-20' },
        { id: 2, name: 'Metformin', createdAt: '2026-05-18' },
        { id: 3, name: 'Paracetamol', createdAt: '2026-05-15' },
        { id: 4, name: 'Omeprazole', createdAt: '2026-05-10' },
        { id: 5, name: 'Cetirizine', createdAt: '2026-05-08' },
      ],

      addEntry: (name, file) => {
        if (!name.trim()) return
        const newEntry: MedicineHistoryEntry = {
          id: get().entries.length + 1,
          name: name.trim(),
          ...(file || {}),
          createdAt: new Date().toISOString().split('T')[0],
        }
        set((state) => ({ entries: [newEntry, ...state.entries] }))
      },

      updateEntry: (id, name, file) => {
        if (!name.trim()) return
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id
              ? { ...e, name: name.trim(), ...(file ? { fileName: file.fileName, fileType: file.fileType, fileData: file.fileData } : {}) }
              : e
          ),
        }))
      },

      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }))
      },

      searchEntries: (query) => {
        const term = query.toLowerCase()
        return get().entries.filter((e) => e.name.toLowerCase().includes(term))
      },
    }),
    {
      name: 'prescribo-medicine-list',
    }
  )
)
