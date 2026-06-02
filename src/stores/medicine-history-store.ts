'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MedicineHistoryEntry } from '@/types'
import { autocompleteApi } from '@/lib/api'

interface MedicineHistoryState {
  entries: MedicineHistoryEntry[]
  _apiAvailable: boolean
  setApiAvailable: (available: boolean) => void
  addEntry: (name: string, file?: { fileName: string; fileType: 'pdf' | 'docx'; fileData: string }) => Promise<void>
  updateEntry: (id: number, name: string, file?: { fileName: string; fileType: 'pdf' | 'docx'; fileData: string }) => Promise<void>
  deleteEntry: (id: number) => void
  searchEntries: (query: string) => MedicineHistoryEntry[]
  syncFromApi: (apiItems: { id: number; medicine_name: string }[]) => void
}

export const useMedicineHistoryStore = create<MedicineHistoryState>()(
  persist(
    (set, get) => ({
      entries: [],
      _apiAvailable: false,

      setApiAvailable: (available) => set({ _apiAvailable: available }),

      addEntry: async (name, file) => {
        if (!name.trim()) return
        const state = get()
        const newEntry: MedicineHistoryEntry = {
          id: state.entries.length + 1,
          name: name.trim(),
          ...(file || {}),
          createdAt: new Date().toISOString().split('T')[0],
        }

        if (state._apiAvailable) {
          try {
            const created = await autocompleteApi.createMedicine(name.trim())
            set((s) => ({
              entries: [{ id: created.id, name: created.medicine_name, createdAt: new Date().toISOString().split('T')[0] }, ...s.entries],
            }))
            return
          } catch (e: any) {
            console.warn('API createMedicine failed, falling back to local:', e.message)
          }
        }

        set((s) => ({ entries: [newEntry, ...s.entries] }))
      },

      updateEntry: async (id, name, file) => {
        if (!name.trim()) return
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id
              ? { ...e, name: name.trim(), ...(file ? { fileName: file.fileName, fileType: file.fileType, fileData: file.fileData } : {}) }
              : e
          ),
        }))
      },

      deleteEntry: (id) => {
        set((s) => ({
          entries: s.entries.filter((e) => e.id !== id),
        }))
      },

      searchEntries: (query) => {
        const term = query.toLowerCase()
        return get().entries.filter((e) => e.name.toLowerCase().includes(term))
      },

      syncFromApi: (apiItems) => {
        set({
          entries: (apiItems || []).map((m) => ({
            id: m.id,
            name: m.medicine_name,
            createdAt: new Date().toISOString().split('T')[0],
          })),
        })
      },
    }),
    {
      name: 'prescribo-medicine-list',
    }
  )
)
