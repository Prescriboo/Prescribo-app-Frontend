'use client'

import { create } from 'zustand'
import { Complaint } from '@/types'
import { autocompleteApi } from '@/lib/api'

interface ComplaintState {
  items: Complaint[]
  _apiAvailable: boolean
  setApiAvailable: (available: boolean) => void
  addItem: (complaint: string) => Promise<void>
  updateItem: (id: number, complaint: string) => Promise<void>
  deleteItem: (id: number) => Promise<void>
  getComplaintById: (id: number) => string
  syncFromApi: (apiItems: { id: number; chief_complaints: string }[]) => void
}

export const useComplaintStore = create<ComplaintState>((set, get) => ({
      items: [],
      _apiAvailable: false,

      setApiAvailable: (available) => set({ _apiAvailable: available }),

      addItem: async (complaint) => {
        if (!complaint.trim()) return
        const state = get()
        const newItem: Complaint = {
          id: state.items.length + 1,
          complaint: complaint.trim(),
        }

        if (state._apiAvailable) {
          try {
            const created = await autocompleteApi.createChiefComplaint(complaint.trim())
            set((s) => ({ items: [...s.items, { id: created.id, complaint: created.chief_complaints }] }))
            return
          } catch (e: any) {
            console.warn('API createChiefComplaint failed, falling back to local:', e.message)
          }
        }

        set((s) => ({ items: [...s.items, newItem] }))
      },

      updateItem: async (id, complaint) => {
        if (!complaint.trim()) return
        const state = get()
        set((s) => ({
          items: s.items.map((item) => (item.id === id ? { ...item, complaint: complaint.trim() } : item)),
        }))
      },

      deleteItem: async (id) => {
        const state = get()
        set((s) => ({
          items: s.items.filter((item) => item.id !== id),
        }))
      },

      getComplaintById: (id) => {
        const item = get().items.find((i) => i.id === id)
        return item?.complaint || ''
      },

      syncFromApi: (apiItems) => {
        set({ items: (apiItems || []).map((c) => ({ id: c.id, complaint: c.chief_complaints })) })
      },
    }))
