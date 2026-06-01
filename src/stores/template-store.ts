'use client'

import { create } from 'zustand'
import { Template } from '@/types'
import { DEMO_TEMPLATES } from '@/lib/constants'

interface TemplateState {
  templates: Template[]
  selectedTemplate: number | null
  addTemplate: (template: Omit<Template, 'id'>) => void
  selectTemplate: (id: number | null) => void
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  templates: DEMO_TEMPLATES,
  selectedTemplate: null,

  addTemplate: (templateData) => {
    const newTemplate: Template = {
      id: get().templates.length + 1,
      ...templateData,
    }
    set((state) => ({ templates: [...state.templates, newTemplate] }))
  },

  selectTemplate: (id) => set({ selectedTemplate: id }),
}))
