'use client'

import { useState } from 'react'
import { useOnboardingStore } from '@/stores/onboarding-store'
import { useSettingsStore } from '@/stores/settings-store'
import { Building2, User, Stethoscope, ArrowRight, Sparkles } from 'lucide-react'

export default function SetupWizard() {
  const { showWizard, completeWizard, startTour } = useOnboardingStore()
  const { clinic, updateClinic } = useSettingsStore()

  const [clinicName, setClinicName] = useState('')
  const [doctorName, setDoctorName] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!showWizard) return null

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {}
    if (!clinicName.trim()) newErrors.clinic = 'Clinic name is required'
    if (!doctorName.trim()) newErrors.doctor = 'Doctor name is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    await updateClinic({
      clinicName: clinicName || clinic.clinicName,
      doctorName: doctorName || clinic.doctorName,
      specialization: specialization || clinic.specialization,
    })
    completeWizard()
    startTour()
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-teal px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Welcome to Prescribo</h2>
              <p className="text-xs text-white/80">Set up your clinic profile to get started</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            This helps us personalize your experience. You can update these anytime in Settings.
          </p>

          {/* Clinic Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Clinic Name *
            </label>
            <div className="relative">
              <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={clinicName}
                onChange={(e) => { setClinicName(e.target.value); setErrors({}) }}
                placeholder="e.g. City Care Clinic"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-2 focus:ring-primary-100 outline-none"
              />
            </div>
            {errors.clinic && <p className="text-xs text-red-500 mt-1">{errors.clinic}</p>}
          </div>

          {/* Doctor Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Doctor Name *
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={doctorName}
                onChange={(e) => { setDoctorName(e.target.value); setErrors({}) }}
                placeholder="e.g. Dr. Sharma"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-2 focus:ring-primary-100 outline-none"
              />
            </div>
            {errors.doctor && <p className="text-xs text-red-500 mt-1">{errors.doctor}</p>}
          </div>

          {/* Specialization */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Specialization
            </label>
            <div className="relative">
              <Stethoscope size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. General Physician"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-2 focus:ring-primary-100 outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition flex items-center justify-center gap-2 text-sm mt-2"
          >
            Start Product Tour <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
