'use client'

import { create } from 'zustand'

const STORAGE_KEY = 'prescribo_onboarding_v1'

interface StorageState {
  hasCompleted: boolean
  hasSkipped: boolean
  wizardCompleted: boolean
}

function loadFromStorage(): StorageState {
  if (typeof window === 'undefined') {
    return { hasCompleted: false, hasSkipped: false, wizardCompleted: false }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return { hasCompleted: false, hasSkipped: false, wizardCompleted: false }
}

function saveToStorage(state: StorageState) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export interface OnboardingState {
  isActive: boolean
  showWizard: boolean
  currentStep: number
  hasCompleted: boolean
  hasSkipped: boolean
  wizardCompleted: boolean

  startWizard: () => void
  completeWizard: () => void
  startTour: () => void
  nextStep: () => void
  prevStep: () => void
  skipTour: () => void
  finishTour: () => void
  restartTour: () => void
}

export const TOTAL_STEPS = 8

export const useOnboardingStore = create<OnboardingState>((set, get) => {
  const stored = loadFromStorage()

  return {
    isActive: false,
    showWizard: false,
    currentStep: 0,
    hasCompleted: stored.hasCompleted,
    hasSkipped: stored.hasSkipped,
    wizardCompleted: stored.wizardCompleted,

    startWizard: () => {
      set({ showWizard: true })
    },

    completeWizard: () => {
      const next = { ...get(), showWizard: false, wizardCompleted: true }
      set(next)
      saveToStorage({ hasCompleted: next.hasCompleted, hasSkipped: next.hasSkipped, wizardCompleted: next.wizardCompleted })
    },

    startTour: () => {
      set({ isActive: true, currentStep: 0, showWizard: false })
    },

    nextStep: () => {
      const { currentStep } = get()
      if (currentStep < TOTAL_STEPS - 1) {
        set({ currentStep: currentStep + 1 })
      } else {
        get().finishTour()
      }
    },

    prevStep: () => {
      const { currentStep } = get()
      if (currentStep > 0) {
        set({ currentStep: currentStep - 1 })
      }
    },

    skipTour: () => {
      const next = { ...get(), isActive: false, hasSkipped: true }
      set(next)
      saveToStorage({ hasCompleted: next.hasCompleted, hasSkipped: next.hasSkipped, wizardCompleted: next.wizardCompleted })
    },

    finishTour: () => {
      const next = { ...get(), isActive: false, hasCompleted: true, currentStep: 0 }
      set(next)
      saveToStorage({ hasCompleted: next.hasCompleted, hasSkipped: next.hasSkipped, wizardCompleted: next.wizardCompleted })
    },

    restartTour: () => {
      set({ isActive: true, currentStep: 0, hasCompleted: false, hasSkipped: false, showWizard: false })
    },
  }
})
