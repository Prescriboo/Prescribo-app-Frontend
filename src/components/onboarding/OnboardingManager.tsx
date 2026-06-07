'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { useAuthStore } from '@/stores/auth-store'
import { useSettingsStore } from '@/stores/settings-store'
import SetupWizard from './SetupWizard'
import TourOverlay from './TourOverlay'
import TourTooltip, { TOUR_STEPS } from './TourTooltip'

const STEP_SELECTORS: string[] = [
  '[data-tour-step="sidebar"]',
  '[data-tour-step="stats"]',
  '[data-tour-step="quick-action"]',
  '[data-tour-step="rx-builder"]',
  '[data-tour-step="medicines"]',
  '[data-tour-step="preview"]',
  '[data-tour-step="topbar-search"]',
  '[data-tour-step="settings"]',
]

const STEP_ROUTES: (string | undefined)[] = [
  undefined,    // sidebar - always visible
  '/dashboard', // stats
  '/dashboard', // quick-action
  '/prescriptions', // rx-builder
  '/prescriptions', // medicines
  '/prescriptions', // preview
  undefined,    // topbar-search - always visible
  '/settings',  // settings
]

export default function OnboardingManager() {
  const { isActive, currentStep, wizardCompleted, hasCompleted, hasSkipped, finishTour, completeWizard } = useOnboardingStore()
  const { demoMode } = useAuthStore()
  const { clinic } = useSettingsStore()
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // If clinic profile already has data, consider onboarding done (handles cleared localStorage)
  const hasClinicProfile = Boolean(clinic?.doctorName?.trim() && clinic?.clinicName?.trim())

  // Auto-mark complete if profile exists but onboarding state was lost
  useEffect(() => {
    if (hasClinicProfile && !hasCompleted && !hasSkipped) {
      completeWizard()
      finishTour()
    }
  }, [hasClinicProfile, hasCompleted, hasSkipped, completeWizard, finishTour])

  // Auto-start wizard on first mount if not completed
  useEffect(() => {
    if (!wizardCompleted && !hasCompleted && !hasSkipped && !hasClinicProfile && !demoMode) {
      const store = useOnboardingStore.getState()
      const timer = setTimeout(() => store.startWizard(), 600)
      return () => clearTimeout(timer)
    }
  }, [wizardCompleted, hasCompleted, hasSkipped, hasClinicProfile, demoMode])

  // Auto-navigate to the correct route for the current tour step
  useEffect(() => {
    if (!isActive) return
    const targetRoute = STEP_ROUTES[currentStep]
    if (targetRoute && pathname !== targetRoute) {
      router.push(targetRoute)
    }
  }, [isActive, currentStep, pathname, router])

  // Scroll target into view when step changes
  useEffect(() => {
    if (!isActive) return
    const selector = STEP_SELECTORS[currentStep]
    if (!selector) return
    const el = document.querySelector(selector)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    }
  }, [isActive, currentStep])

  const handlePositionReady = useCallback((rect: DOMRect) => {
    setTargetRect(rect)
  }, [])

  // Skip onboarding entirely in demo mode
  if (demoMode) return null

  // Don't show anything if already completed, skipped, or profile already exists
  if (hasCompleted || hasSkipped || hasClinicProfile) return null

  if (!isActive && !wizardCompleted) {
    return <SetupWizard />
  }

  if (!isActive) return null

  const selector = STEP_SELECTORS[currentStep]

  return (
    <>
      <SetupWizard />
      {selector && (
        <>
          <TourOverlay
            targetSelector={selector}
            onPositionReady={handlePositionReady}
          />
          <TourTooltip targetRect={targetRect} />
        </>
      )}
    </>
  )
}
