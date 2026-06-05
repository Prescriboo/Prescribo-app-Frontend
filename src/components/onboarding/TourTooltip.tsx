'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useOnboardingStore, TOTAL_STEPS } from '@/stores/onboarding-store'
import { ChevronLeft, ChevronRight, SkipForward, CheckCircle2 } from 'lucide-react'

export const TOUR_STEPS: { title: string; description: string }[] = [
  {
    title: 'Navigation Sidebar',
    description: 'Switch between Dashboard, Patients, Prescriptions, Templates, History, and Settings with a single click. Everything is organized for fast access.',
  },
  {
    title: 'Dashboard Overview',
    description: 'See your total patients, prescriptions written, templates, and daily stats at a glance. Your clinic pulse — in real time.',
  },
  {
    title: 'Quick Actions',
    description: 'Start a new prescription, add a patient, browse templates, or open settings — all from the dashboard shortcuts.',
  },
  {
    title: 'Prescription Builder',
    description: 'Fill patient info, clinical details, vitals, and medicines in a clean, structured form. Everything syncs to the live preview.',
  },
  {
    title: 'Smart Medicine Input',
    description: 'Type a few characters and get intelligent autocomplete for medicine names, dosages, frequencies, and durations. Saves time and reduces errors.',
  },
  {
    title: 'Live Preview',
    description: 'See exactly how your prescription will look when printed. Switch between A4 and A5 sizes instantly. No surprises at the printer.',
  },
  {
    title: 'Global Search',
    description: 'Quickly find patients, prescriptions, and history with the powerful search bar. Hit Ctrl+K from anywhere.',
  },
  {
    title: 'Settings & Profile',
    description: 'Customize your clinic profile, security, prescription footer, backups, and license from the Settings panel.',
  },
]

interface Props {
  targetRect: DOMRect | null
}

export default function TourTooltip({ targetRect }: Props) {
  const { currentStep, nextStep, prevStep, skipTour, finishTour } = useOnboardingStore()
  const step = TOUR_STEPS[currentStep]
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })

  const computePosition = useCallback(() => {
    if (!targetRect || !tooltipRef.current) return
    const tooltip = tooltipRef.current.getBoundingClientRect()
    const gap = 16
    const pad = 12

    let top: number
    let left: number

    // Try bottom
    if (targetRect.bottom + gap + tooltip.height <= window.innerHeight - pad) {
      top = targetRect.bottom + gap
    } else if (targetRect.top - gap - tooltip.height >= pad) {
      top = targetRect.top - gap - tooltip.height
    } else {
      top = pad
    }

    // Center horizontally if possible
    left = targetRect.left + targetRect.width / 2 - tooltip.width / 2
    if (left < pad) left = pad
    if (left + tooltip.width > window.innerWidth - pad) left = window.innerWidth - tooltip.width - pad

    setPos({ top, left })
  }, [targetRect])

  useEffect(() => {
    computePosition()
    const id = setInterval(computePosition, 300)
    return () => clearInterval(id)
  }, [computePosition, currentStep])

  if (!step) return null

  return (
    <div
      ref={tooltipRef}
      className="fixed z-[100] w-[360px] max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 p-5 transition-all duration-300"
      style={{ top: pos.top, left: pos.left }}
    >
      {/* Step dots */}
      <div className="flex items-center gap-1.5 mb-3">
        {TOUR_STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentStep
                ? 'w-6 bg-primary'
                : i < currentStep
                ? 'w-1.5 bg-primary/40'
                : 'w-1.5 bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
        <span className="ml-auto text-[0.65rem] font-bold text-slate-400">
          {currentStep + 1} / {TOTAL_STEPS}
        </span>
      </div>

      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">{step.title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{step.description}</p>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={skipTour}
          className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition flex items-center gap-1"
        >
          <SkipForward size={12} /> Skip
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={14} />
          </button>

          {currentStep === TOTAL_STEPS - 1 ? (
            <button
              onClick={finishTour}
              className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition flex items-center gap-1.5"
            >
              <CheckCircle2 size={13} /> Finish
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition flex items-center gap-1.5"
            >
              Next <ChevronRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
