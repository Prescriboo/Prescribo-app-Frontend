'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { usePatientStore } from '@/stores/patient-store'
import { usePrescriptionStore } from '@/stores/prescription-store'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { getInitials } from '@/lib/utils'
import { Plus, ArrowLeft, Trash2 } from 'lucide-react'

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getPatient } = usePatientStore()
  const { getPatientPrescriptions, deletePrescription } = usePrescriptionStore()
  const { addToast } = useUIStore()
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const patient = getPatient(Number(params.id))
  if (!patient) return <div className="p-6">Patient not found</div>

  const prescriptions = getPatientPrescriptions(patient.id)

  const handlePrescribe = () => {
    router.push(`/prescriptions?patient=${patient.id}`)
  }

  return (
    <div className="flex h-full">
      <div className="w-[280px] h-full bg-white border-r border-border p-8 flex flex-col items-center text-center overflow-y-auto flex-shrink-0">
        <div className="w-[90px] h-[90px] rounded-full bg-gradient-to-br from-primary-light to-teal text-white flex items-center justify-center text-4xl font-extrabold mb-4 shadow-md">
          {getInitials(patient.name)}
        </div>
        <div className="text-lg font-bold mb-1">{patient.name}</div>
        <div className="text-sm text-slate-400 leading-relaxed mb-5">{patient.age} yrs {patient.gender}<br/>{patient.place}</div>
        <div className="grid grid-cols-2 gap-3 w-full mb-5">
          <div className="bg-bg p-3.5 rounded-lg border border-border">
            <div className="text-2xl font-extrabold text-primary">{patient.visits}</div>
            <div className="text-[0.7rem] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Visits</div>
          </div>
          <div className="bg-bg p-3.5 rounded-lg border border-border">
            <div className="text-2xl font-extrabold text-primary">{patient.rxCount}</div>
            <div className="text-[0.7rem] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Rx</div>
          </div>
        </div>
        <div className="w-full mb-4 text-left">
          <div className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider mb-2">Allergies</div>
          <div className="flex flex-wrap gap-1.5">
            {patient.allergies
              ? patient.allergies.split(',').map(a => <Badge key={a} variant="danger">{a.trim()}</Badge>)
              : <Badge variant="success">None</Badge>
            }
          </div>
        </div>
        <div className="w-full mb-4 text-left">
          <div className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider mb-2">Conditions</div>
          <div className="flex flex-wrap gap-1.5">
            {patient.conditions
              ? patient.conditions.split(',').map(c => <Badge key={c} variant="default">{c.trim()}</Badge>)
              : <Badge variant="success">None</Badge>
            }
          </div>
        </div>
        <Button className="w-full mt-2" onClick={handlePrescribe}>
          <Plus className="w-4 h-4" /> New Prescription
        </Button>
        <Button variant="outline" className="w-full mt-2" onClick={() => router.push('/patients')}>
          <ArrowLeft className="w-4 h-4" /> Back to List
        </Button>
      </div>
      <div className="flex-1 p-6 overflow-y-auto min-w-0">
        <h3 className="text-base font-bold mb-4 text-slate-900">Prescription History</h3>
        <div className="relative pl-7 timeline">
          {prescriptions.length > 0 ? prescriptions.map(rx => (
            <div key={rx.id} className="timeline-item relative mb-5 bg-white border border-border rounded-lg p-4 hover:border-primary-light hover:shadow-sm transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex-1 cursor-pointer" onClick={() => router.push(`/prescriptions?view=${rx.id}`)}>
                  <div className="text-xs text-slate-400 font-bold mb-1 tracking-wide">{rx.date}</div>
                  <div><h4 className="text-sm font-bold mb-0.5">{rx.diagnosis}</h4><p className="text-xs text-slate-500">{rx.medicines.map(m => m.name).join(', ')}</p></div>
                  <div className="flex flex-wrap gap-1.5 mt-2">{rx.medicines.map(m => <Badge key={m.name} variant="default">{m.name}</Badge>)}</div>
                </div>
                <button
                  className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-bold text-white bg-danger hover:bg-red-600 transition-all flex-shrink-0 ml-2 shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteId(rx.id)
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          )) : <p className="text-slate-400 text-sm">No prescription history yet.</p>}
        </div>
        <h3 className="text-base font-bold mt-6 mb-4 text-slate-900">Quick Represcribe</h3>
        <div className="grid grid-cols-3 gap-3.5">
          {prescriptions.slice(0, 3).map(rx => (
            <div key={rx.id} className="bg-white border border-border rounded-lg p-4 cursor-pointer hover:border-primary-light hover:shadow-sm hover:-translate-y-0.5 transition-all" onClick={() => router.push(`/prescriptions?view=${rx.id}`)}>
              <div className="font-bold text-sm mb-1">{rx.diagnosis}</div>
              <div className="text-xs text-slate-400">{rx.date}</div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Prescription"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={async () => {
              if (deleteId == null) return
              await deletePrescription(deleteId)
              addToast('Prescription deleted', 'info')
              setDeleteId(null)
            }}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">Are you sure you want to delete this prescription? This action cannot be undone.</p>
      </Modal>
    </div>
  )
}
