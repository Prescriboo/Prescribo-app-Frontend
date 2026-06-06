'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useOnboardingStore } from '@/stores/onboarding-store'
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
  const { isActive, currentStep, wizardCompleted, hasCompleted, hasSkipped } = useOnboardingStore()
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Auto-start wizard on first mount if not completed
  useEffect(() => {
    if (!wizardCompleted && !hasCompleted && !hasSkipped) {
      const store = useOnboardingStore.getState()
      const timer = setTimeout(() => store.startWizard(), 600)
      return () => clearTimeout(timer)
    }
  }, [wizardCompleted, hasCompleted, hasSkipped])

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

  if (!isActive && !wizardCompleted && !hasCompleted && !hasSkipped) {
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
