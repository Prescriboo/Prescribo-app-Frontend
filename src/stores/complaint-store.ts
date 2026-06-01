'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Complaint } from '@/types'

interface ComplaintState {
  items: Complaint[]
  addItem: (complaint: string) => void
  updateItem: (id: number, complaint: string) => void
  deleteItem: (id: number) => void
  getComplaintById: (id: number) => string
}

export const useComplaintStore = create<ComplaintState>()(
  persist(
    (set, get) => ({
      items: [
        { id: 1, complaint: 'Fever' },
        { id: 2, complaint: 'Cough' },
        { id: 3, complaint: 'Cold' },
        { id: 4, complaint: 'Headache' },
        { id: 5, complaint: 'Body ache' },
        { id: 6, complaint: 'Sore throat' },
        { id: 7, complaint: 'Chest pain' },
        { id: 8, complaint: 'Shortness of breath' },
        { id: 9, complaint: 'Abdominal pain' },
        { id: 10, complaint: 'Nausea / Vomiting' },
        { id: 11, complaint: 'Diarrhoea' },
        { id: 12, complaint: 'Constipation' },
      ],

      addItem: (complaint) => {
        if (!complaint.trim()) return
        const newItem: Complaint = {
          id: get().items.length + 1,
          complaint: complaint.trim(),
        }
        set((state) => ({ items: [...state.items, newItem] }))
      },

      updateItem: (id, complaint) => {
        if (!complaint.trim()) return
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, complaint: complaint.trim() } : item)),
        }))
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      getComplaintById: (id) => {
        const item = get().items.find((i) => i.id === id)
        return item?.complaint || ''
      },
    }),
    {
      name: 'prescribo-complaint-master',
    }
  )
)
