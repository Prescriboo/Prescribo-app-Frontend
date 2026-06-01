'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Diagnosis } from '@/types'

interface DiagnosisState {
  items: Diagnosis[]
  addItem: (diagnosis: string) => void
  updateItem: (id: number, diagnosis: string) => void
  deleteItem: (id: number) => void
  getDiagnosisById: (id: number) => string
}

export const useDiagnosisStore = create<DiagnosisState>()(
  persist(
    (set, get) => ({
      items: [
        { id: 1, diagnosis: 'Upper Respiratory Tract Infection' },
        { id: 2, diagnosis: 'Viral Fever' },
        { id: 3, diagnosis: 'Acute Gastroenteritis' },
        { id: 4, diagnosis: 'Tension Headache' },
        { id: 5, diagnosis: 'Migraine' },
        { id: 6, diagnosis: 'Hypertension' },
        { id: 7, diagnosis: 'Type 2 Diabetes Mellitus' },
        { id: 8, diagnosis: 'Acute Bronchitis' },
        { id: 9, diagnosis: 'Allergic Rhinitis' },
        { id: 10, diagnosis: 'Gastroesophageal Reflux Disease' },
        { id: 11, diagnosis: 'Urinary Tract Infection' },
        { id: 12, diagnosis: 'Dyspepsia' },
      ],

      addItem: (diagnosis) => {
        if (!diagnosis.trim()) return
        const newItem: Diagnosis = {
          id: get().items.length + 1,
          diagnosis: diagnosis.trim(),
        }
        set((state) => ({ items: [...state.items, newItem] }))
      },

      updateItem: (id, diagnosis) => {
        if (!diagnosis.trim()) return
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, diagnosis: diagnosis.trim() } : item)),
        }))
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      getDiagnosisById: (id) => {
        const item = get().items.find((i) => i.id === id)
        return item?.diagnosis || ''
      },
    }),
    {
      name: 'prescribo-diagnosis-master',
    }
  )
)
