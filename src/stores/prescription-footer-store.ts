'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PrescriptionFooterLine } from '@/types'

interface PrescriptionFooterState {
  items: PrescriptionFooterLine[]
  addItem: (label: string, value: string) => void
  updateItem: (id: number, label: string, value: string) => void
  deleteItem: (id: number) => void
}

export const usePrescriptionFooterStore = create<PrescriptionFooterState>()(
  persist(
    (set, get) => ({
      items: [
        { id: 1, label: 'Consultation', value: 'Mon-Sat: 9:00 AM - 6:00 PM' },
        { id: 2, label: 'Address', value: '123 Medical Center Rd, Bangalore - 560001' },
        { id: 3, label: 'Phone', value: '+91 98765 43210' },
      ],

      addItem: (label, value) => {
        if (!label.trim() || !value.trim()) return
        const newItem: PrescriptionFooterLine = {
          id: get().items.length + 1,
          label: label.trim(),
          value: value.trim(),
        }
        set((state) => ({ items: [...state.items, newItem] }))
      },

      updateItem: (id, label, value) => {
        if (!label.trim() || !value.trim()) return
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, label: label.trim(), value: value.trim() } : item
          ),
        }))
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },
    }),
    {
      name: 'prescribo-prescription-footer',
    }
  )
)
