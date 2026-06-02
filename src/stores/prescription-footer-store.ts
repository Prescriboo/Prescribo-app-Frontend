'use client'

import { create } from 'zustand'
import { PrescriptionFooterLine } from '@/types'

interface PrescriptionFooterState {
  items: PrescriptionFooterLine[]
  addItem: (label: string, value: string) => void
  updateItem: (id: number, label: string, value: string) => void
  deleteItem: (id: number) => void
}

export const usePrescriptionFooterStore = create<PrescriptionFooterState>((set, get) => ({
      items: [],

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
    }))
