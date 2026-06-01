'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Duration } from '@/types'

interface DurationState {
  items: Duration[]
  addItem: (duration: string) => void
  updateItem: (id: number, duration: string) => void
  deleteItem: (id: number) => void
  getDurationById: (id: number) => string
}

export const useDurationStore = create<DurationState>()(
  persist(
    (set, get) => ({
      items: [
        { id: 1, duration: '1 day' },
        { id: 2, duration: '3 days' },
        { id: 3, duration: '5 days' },
        { id: 4, duration: '7 days' },
        { id: 5, duration: '10 days' },
        { id: 6, duration: '14 days' },
        { id: 7, duration: '1 month' },
        { id: 8, duration: '2 months' },
        { id: 9, duration: '3 months' },
        { id: 10, duration: '6 months' },
        { id: 11, duration: '1 year' },
        { id: 12, duration: 'As directed' },
      ],

      addItem: (duration) => {
        if (!duration.trim()) return
        const newItem: Duration = {
          id: get().items.length + 1,
          duration: duration.trim(),
        }
        set((state) => ({ items: [...state.items, newItem] }))
      },

      updateItem: (id, duration) => {
        if (!duration.trim()) return
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, duration: duration.trim() } : item)),
        }))
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      getDurationById: (id) => {
        const item = get().items.find((i) => i.id === id)
        return item?.duration || ''
      },
    }),
    {
      name: 'prescribo-duration-master',
    }
  )
)
