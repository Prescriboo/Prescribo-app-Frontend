'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { usePatientStore } from '@/stores/patient-store'
import { usePrescriptionStore } from '@/stores/prescription-store'
import { useUIStore } from '@/stores/ui-store'
import { Input } from '@/components/ui/input'
import { Bell, HelpCircle, Search } from 'lucide-react'

export function TopBar() {
  const router = useRouter()
  const { addToast } = useUIStore()
  const { patients } = usePatientStore()
  const { prescriptions } = usePrescriptionStore()
  const [search, setSearch] = useState('')
  const [showResults, setShowResults] = useState(false)

  const patientResults = search.length > 0
    ? patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 4)
    : []

  const prescriptionResults = search.length > 0
    ? prescriptions.filter(r =>
        r.patientName.toLowerCase().includes(search.toLowerCase()) ||
        r.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
        r.medicines.some(m => m.name.toLowerCase().includes(search.toLowerCase()))
      ).slice(0, 4)
    : []

  return (
    <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-border gap-4 flex-shrink-0 relative">
      <div className="relative flex items-center gap-2.5 bg-bg border border-border rounded-xl px-4 py-2 w-full max-w-sm focus-within:border-primary-light focus-within:ring-3 focus-within:ring-primary-100 transition-all">
        <Search className="w-[18px] h-[18px] text-slate-400 flex-shrink-0" />
        <Input
          type="text"
          className="bg-transparent border-none shadow-none focus-visible:ring-0 focus-visible:border-none px-0 py-0 text-sm w-full text-slate-900 placeholder:text-slate-400"
          placeholder="Search patients, prescriptions..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setShowResults(true) }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
        {showResults && (patientResults.length > 0 || prescriptionResults.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-50 py-1 max-h-80 overflow-y-auto">
            {patientResults.length > 0 && (
              <>
                <div className="px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">Patients</div>
                {patientResults.map(p => (
                  <button
                    key={`p-${p.id}`}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors"
                    onClick={() => { router.push(`/patients/${p.id}`); setSearch(''); setShowResults(false) }}
                  >
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.age} yrs {p.gender} | {p.place}</div>
                  </button>
                ))}
              </>
            )}
            {prescriptionResults.length > 0 && (
              <>
                <div className="px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 border-t border-slate-100">Prescriptions</div>
                {prescriptionResults.map(r => (
                  <button
                    key={`r-${r.id}`}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors"
                    onClick={() => { router.push(`/prescriptions?view=${r.id}`); setSearch(''); setShowResults(false) }}
                  >
                    <div className="font-semibold">{r.patientName}</div>
                    <div className="text-xs text-slate-400">{r.diagnosis} | {r.date} | {r.medicines.length} meds</div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
          onClick={() => addToast('No new notifications', 'info')}
        >
          <Bell className="w-[18px] h-[18px]" />
        </button>
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
          onClick={() => addToast('Help center coming soon', 'info')}
        >
          <HelpCircle className="w-[18px] h-[18px]" />
        </button>
        <div
          className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-teal text-white flex items-center justify-center font-bold text-xs cursor-pointer shadow-sm"
          onClick={() => router.push('/settings')}
        >
          DS
        </div>
      </div>
    </header>
  )
}
