'use client'

import { create } from 'zustand'
import { Dosage } from '@/types'
import { mastersApi } from '@/lib/api'

interface DosageState {
  items: Dosage[]
  _apiAvailable: boolean
  setApiAvailable: (available: boolean) => void
  addItem: (dosage: string) => Promise<void>
  updateItem: (id: number, dosage: string) => Promise<void>
  deleteItem: (id: number) => Promise<void>
  getDosageById: (id: number) => string
  clearAll: () => void
      syncFromApi: (apiItems: { id: number; dosage: string }[]) => void
}

export const useDosageStore = create<DosageState>((set, get) => ({
      items: [],
      _apiAvailable: false,

      setApiAvailable: (available) => set({ _apiAvailable: available }),

      addItem: async (dosage) => {
        if (!dosage.trim()) return
        const state = get()
        const newItem: Dosage = {
          id: state.items.length + 1,
          dosage: dosage.trim(),
        }

        if (state._apiAvailable) {
          try {
            const created = await mastersApi.dosages.create(dosage.trim())
            set((s) => ({ items: [...s.items, { id: created.id, dosage: created.dosage }] }))
            return
          } catch (e: any) {
            console.warn('API addDosage failed, falling back to local:', e.message)
          }
        }

        set((s) => ({ items: [...s.items, newItem] }))
      },

      updateItem: async (id, dosage) => {
        if (!dosage.trim()) return
        const state = get()

        if (state._apiAvailable) {
          try {
            await mastersApi.dosages.update(id, dosage.trim())
          } catch (e: any) {
            console.warn('API updateDosage failed, falling back to local:', e.message)
          }
        }

        set((s) => ({
          items: s.items.map((item) => (item.id === id ? { ...item, dosage: dosage.trim() } : item)),
        }))
      },

      deleteItem: async (id) => {
        const state = get()

        if (state._apiAvailable) {
          try {
            await mastersApi.dosages.remove(id)
          } catch (e: any) {
            console.warn('API deleteDosage failed, falling back to local:', e.message)
          }
        }

        set((s) => ({
          items: s.items.filter((item) => item.id !== id),
        }))
      },

      getDosageById: (id) => {
        const item = get().items.find((i) => i.id === id)
        return item?.dosage || ''
      },

      clearAll: () => set({ items: [] }),

      syncFromApi: (apiItems) => {
        set({ items: (apiItems || []).map((d) => ({ id: d.id, dosage: d.dosage })) })
      },
    }))
