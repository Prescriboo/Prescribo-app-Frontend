'use client'

import { create } from 'zustand'
import { Duration } from '@/types'
import { mastersApi } from '@/lib/api'

interface DurationState {
  items: Duration[]
  _apiAvailable: boolean
  setApiAvailable: (available: boolean) => void
  addItem: (duration: string) => Promise<void>
  updateItem: (id: number, duration: string) => Promise<void>
  deleteItem: (id: number) => Promise<void>
  getDurationById: (id: number) => string
  clearAll: () => void
      syncFromApi: (apiItems: { id: number; duration: string }[]) => void
}

export const useDurationStore = create<DurationState>((set, get) => ({
      items: [],
      _apiAvailable: false,

      setApiAvailable: (available) => set({ _apiAvailable: available }),

      addItem: async (duration) => {
        if (!duration.trim()) return
        const state = get()
        const newItem: Duration = {
          id: state.items.length + 1,
          duration: duration.trim(),
        }

        if (state._apiAvailable) {
          try {
            const created = await mastersApi.durations.create(duration.trim())
            set((s) => ({ items: [...s.items, { id: created.id, duration: created.duration }] }))
            return
          } catch (e: any) {
            console.warn('API addDuration failed, falling back to local:', e.message)
          }
        }

        set((s) => ({ items: [...s.items, newItem] }))
      },

      updateItem: async (id, duration) => {
        if (!duration.trim()) return
        const state = get()

        if (state._apiAvailable) {
          try {
            await mastersApi.durations.update(id, duration.trim())
          } catch (e: any) {
            console.warn('API updateDuration failed, falling back to local:', e.message)
          }
        }

        set((s) => ({
          items: s.items.map((item) => (item.id === id ? { ...item, duration: duration.trim() } : item)),
        }))
      },

      deleteItem: async (id) => {
        const state = get()

        if (state._apiAvailable) {
          try {
            await mastersApi.durations.remove(id)
          } catch (e: any) {
            console.warn('API deleteDuration failed, falling back to local:', e.message)
          }
        }

        set((s) => ({
          items: s.items.filter((item) => item.id !== id),
        }))
      },

      getDurationById: (id) => {
        const item = get().items.find((i) => i.id === id)
        return item?.duration || ''
      },

      clearAll: () => set({ items: [] }),

      syncFromApi: (apiItems) => {
        set({ items: (apiItems || []).map((d) => ({ id: d.id, duration: d.duration })) })
      },
    }))
