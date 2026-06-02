'use client'

import { create } from 'zustand'
import { Diagnosis } from '@/types'
import { autocompleteApi } from '@/lib/api'

interface DiagnosisState {
  items: Diagnosis[]
  _apiAvailable: boolean
  setApiAvailable: (available: boolean) => void
  addItem: (diagnosis: string) => Promise<void>
  updateItem: (id: number, diagnosis: string) => Promise<void>
  deleteItem: (id: number) => Promise<void>
  getDiagnosisById: (id: number) => string
  syncFromApi: (apiItems: { id: number; diagnosis: string }[]) => void
}

export const useDiagnosisStore = create<DiagnosisState>((set, get) => ({
      items: [],
      _apiAvailable: false,

      setApiAvailable: (available) => set({ _apiAvailable: available }),

      addItem: async (diagnosis) => {
        if (!diagnosis.trim()) return
        const state = get()
        const newItem: Diagnosis = {
          id: state.items.length + 1,
          diagnosis: diagnosis.trim(),
        }

        if (state._apiAvailable) {
          try {
            const created = await autocompleteApi.createDiagnosis(diagnosis.trim())
            set((s) => ({ items: [...s.items, { id: created.id, diagnosis: created.diagnosis }] }))
            return
          } catch (e: any) {
            console.warn('API createDiagnosis failed, falling back to local:', e.message)
          }
        }

        set((s) => ({ items: [...s.items, newItem] }))
      },

      updateItem: async (id, diagnosis) => {
        if (!diagnosis.trim()) return
        const state = get()
        set((s) => ({
          items: s.items.map((item) => (item.id === id ? { ...item, diagnosis: diagnosis.trim() } : item)),
        }))
      },

      deleteItem: async (id) => {
        const state = get()
        set((s) => ({
          items: s.items.filter((item) => item.id !== id),
        }))
      },

      getDiagnosisById: (id) => {
        const item = get().items.find((i) => i.id === id)
        return item?.diagnosis || ''
      },

      syncFromApi: (apiItems) => {
        set({ items: (apiItems || []).map((d) => ({ id: d.id, diagnosis: d.diagnosis })) })
      },
    }))
