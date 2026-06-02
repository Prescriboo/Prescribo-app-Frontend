'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Frequency } from '@/types'
import { mastersApi } from '@/lib/api'

interface FrequencyState {
  items: Frequency[]
  _apiAvailable: boolean
  setApiAvailable: (available: boolean) => void
  addItem: (frequency: string) => Promise<void>
  updateItem: (id: number, frequency: string) => Promise<void>
  deleteItem: (id: number) => Promise<void>
  getFrequencyById: (id: number) => string
  syncFromApi: (apiItems: { id: number; frequency: string }[]) => void
}

export const useFrequencyStore = create<FrequencyState>()(
  persist(
    (set, get) => ({
      items: [],
      _apiAvailable: false,

      setApiAvailable: (available) => set({ _apiAvailable: available }),

      addItem: async (frequency) => {
        if (!frequency.trim()) return
        const state = get()
        const newItem: Frequency = {
          id: state.items.length + 1,
          frequency: frequency.trim(),
        }

        if (state._apiAvailable) {
          try {
            const created = await mastersApi.frequencies.create(frequency.trim())
            set((s) => ({ items: [...s.items, { id: created.id, frequency: created.frequency }] }))
            return
          } catch (e: any) {
            console.warn('API addFrequency failed, falling back to local:', e.message)
          }
        }

        set((s) => ({ items: [...s.items, newItem] }))
      },

      updateItem: async (id, frequency) => {
        if (!frequency.trim()) return
        const state = get()

        if (state._apiAvailable) {
          try {
            await mastersApi.frequencies.update(id, frequency.trim())
          } catch (e: any) {
            console.warn('API updateFrequency failed, falling back to local:', e.message)
          }
        }

        set((s) => ({
          items: s.items.map((item) => (item.id === id ? { ...item, frequency: frequency.trim() } : item)),
        }))
      },

      deleteItem: async (id) => {
        const state = get()

        if (state._apiAvailable) {
          try {
            await mastersApi.frequencies.remove(id)
          } catch (e: any) {
            console.warn('API deleteFrequency failed, falling back to local:', e.message)
          }
        }

        set((s) => ({
          items: s.items.filter((item) => item.id !== id),
        }))
      },

      getFrequencyById: (id) => {
        const item = get().items.find((i) => i.id === id)
        return item?.frequency || ''
      },

      syncFromApi: (apiItems) => {
        set({ items: (apiItems || []).map((f) => ({ id: f.id, frequency: f.frequency })) })
      },
    }),
    {
      name: 'prescribo-frequency-master',
    }
  )
)
