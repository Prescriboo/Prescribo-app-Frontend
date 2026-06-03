'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { usePatientStore } from '@/stores/patient-store'
import { usePrescriptionStore } from '@/stores/prescription-store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, UserPlus, LayoutTemplate, Settings, TrendingUp, FileText, AlertCircle, Zap } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { demoMode } = useAuthStore()
  const { patients } = usePatientStore()
  const { prescriptions } = usePrescriptionStore()

  const stats = [
    { label: 'Total Patients', value: patients.length.toLocaleString(), change: '', icon: TrendingUp, color: 'text-success' },
    { label: 'Prescriptions', value: prescriptions.length.toLocaleString(), change: '', icon: FileText, color: 'text-success' },
    // { label: 'Revenue', value: '-', change: '', icon: TrendingUp, color: 'text-slate-400' },
    // { label: 'Pending', value: '-', change: '', icon: AlertCircle, color: 'text-slate-400' },
  ]

  const recent = prescriptions.slice(0, 4)

  return (
    <div className="p-6">
      {demoMode && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-800">You're in Demo Mode</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Demo expires in 7 days. Activate a license key to unlock full features.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold flex-shrink-0"
            onClick={() => router.push('/activate')}
          >
            Activate License
          </Button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-5 mb-5">
        {stats.map((stat, i) => (
          <Card key={i} className="p-5 hover:-translate-y-1 hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary to-teal opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{stat.label}</div>
            <div className="text-2xl font-extrabold text-slate-900">{stat.value}</div>
            <div className={`text-xs font-semibold mt-1 flex items-center gap-1 ${stat.color}`}>
              <stat.icon className="w-3 h-3" /> {stat.change}
            </div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-900">Recent Prescriptions</span>
            <Button variant="ghost" className="text-sm text-primary font-semibold hover:underline" onClick={() => router.push('/history')}>
              View All &rarr;
            </Button>
          </div>
          <div>
            {recent.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">No prescriptions yet. Create your first prescription to see it here.</div>
            ) : (
              recent.map((rx) => (
                <div
                  key={rx.id}
                  className="flex items-center justify-between py-3.5 border-b border-slate-50 hover:pl-1 transition-all cursor-pointer"
                  onClick={() => router.push(`/prescriptions?view=${rx.id}`)}
                >
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{rx.patientName}</h4>
                    <p className="text-xs text-slate-400">{rx.medicines.slice(0, 2).map(m => m.name).join(' + ')}</p>
                  </div>
                  <span className="text-xs text-slate-500 font-medium flex-shrink-0 ml-4">{rx.date}</span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-900">Quick Actions</span>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <QuickAction icon={<Plus className="w-5 h-5" />} label="New Prescription" onClick={() => router.push('/prescriptions')} />
            <QuickAction icon={<UserPlus className="w-5 h-5" />} label="Add Patient" onClick={() => router.push('/patients')} />
            <QuickAction icon={<LayoutTemplate className="w-5 h-5" />} label="Templates" onClick={() => router.push('/templates')} />
            <QuickAction icon={<Settings className="w-5 h-5" />} label="Settings" onClick={() => router.push('/settings')} />
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      className="flex flex-col items-center gap-2 p-5 bg-bg border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-primary-50 hover:-translate-y-0.5 transition-all text-center"
      onClick={onClick}
    >
      <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary-light to-teal text-white flex items-center justify-center text-lg">
        {icon}
      </div>
      <span className="text-xs font-semibold text-slate-900">{label}</span>
    </button>
  )
}
