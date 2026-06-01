'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Frequency } from '@/types'

interface FrequencyState {
  items: Frequency[]
  addItem: (frequency: string) => void
  updateItem: (id: number, frequency: string) => void
  deleteItem: (id: number) => void
  getFrequencyById: (id: number) => string
}

export const useFrequencyStore = create<FrequencyState>()(
  persist(
    (set, get) => ({
      items: [
        { id: 1, frequency: 'Once daily' },
        { id: 2, frequency: 'Twice daily' },
        { id: 3, frequency: '3 times daily' },
        { id: 4, frequency: '4 times daily' },
        { id: 5, frequency: 'Every 6 hours' },
        { id: 6, frequency: 'Every 8 hours' },
        { id: 7, frequency: 'Every 12 hours' },
        { id: 8, frequency: 'As needed (SOS)' },
        { id: 9, frequency: 'Before meals' },
        { id: 10, frequency: 'After meals' },
        { id: 11, frequency: 'At bedtime' },
        { id: 12, frequency: 'Morning only' },
      ],

      addItem: (frequency) => {
        if (!frequency.trim()) return
        const newItem: Frequency = {
          id: get().items.length + 1,
          frequency: frequency.trim(),
        }
        set((state) => ({ items: [...state.items, newItem] }))
      },

      updateItem: (id, frequency) => {
        if (!frequency.trim()) return
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, frequency: frequency.trim() } : item)),
        }))
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      getFrequencyById: (id) => {
        const item = get().items.find((i) => i.id === id)
        return item?.frequency || ''
      },
    }),
    {
      name: 'prescribo-frequency-master',
    }
  )
)
