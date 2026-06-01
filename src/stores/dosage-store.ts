'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Dosage } from '@/types'

interface DosageState {
  items: Dosage[]
  addItem: (dosage: string) => void
  updateItem: (id: number, dosage: string) => void
  deleteItem: (id: number) => void
  getDosageById: (id: number) => string
}

export const useDosageStore = create<DosageState>()(
  persist(
    (set, get) => ({
      items: [
        { id: 1, dosage: '250mg' },
        { id: 2, dosage: '500mg' },
        { id: 3, dosage: '650mg' },
        { id: 4, dosage: '1g' },
        { id: 5, dosage: '5mg' },
        { id: 6, dosage: '10mg' },
        { id: 7, dosage: '20mg' },
        { id: 8, dosage: '50mg' },
        { id: 9, dosage: '100mg' },
        { id: 10, dosage: '1ml' },
        { id: 11, dosage: '5ml' },
        { id: 12, dosage: '10ml' },
      ],

      addItem: (dosage) => {
        if (!dosage.trim()) return
        const newItem: Dosage = {
          id: get().items.length + 1,
          dosage: dosage.trim(),
        }
        set((state) => ({ items: [...state.items, newItem] }))
      },

      updateItem: (id, dosage) => {
        if (!dosage.trim()) return
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, dosage: dosage.trim() } : item)),
        }))
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      getDosageById: (id) => {
        const item = get().items.find((i) => i.id === id)
        return item?.dosage || ''
      },
    }),
    {
      name: 'prescribo-dosage-master',
    }
  )
)
