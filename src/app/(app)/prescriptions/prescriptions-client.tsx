'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { usePatientStore } from '@/stores/patient-store'
import { usePrescriptionStore } from '@/stores/prescription-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useDosageStore } from '@/stores/dosage-store'
import { useFrequencyStore } from '@/stores/frequency-store'
import { useDurationStore } from '@/stores/duration-store'
import { useComplaintStore } from '@/stores/complaint-store'
import { useDiagnosisStore } from '@/stores/diagnosis-store'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MultiAutocompleteInput } from '@/components/ui/multi-autocomplete-input'
import { RotateCcw, Save, Plus, Trash2, ArrowLeft, Printer, Pencil, Clock, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PrescriptionsClientPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { patients, getPatient } = usePatientStore()
  const { prescriptions, currentRx, setCurrentRx, addMedicineRow, removeMedicineRow, updateMedicineRow, addPrescription, updatePrescription, resetCurrentRx, setEditingRxId, editingRxId, paperSize, setPaperSize } = usePrescriptionStore()
  const { clinic } = useSettingsStore()
  const { items: dosages } = useDosageStore()
  const { items: frequencies } = useFrequencyStore()
  const { items: durations } = useDurationStore()
  const { items: complaints } = useComplaintStore()
  const { items: diagnoses } = useDiagnosisStore()
  const { addToast } = useUIStore()

  const patientId = searchParams.get('patient')
  const represcribeId = searchParams.get('represcribe')
  const viewId = searchParams.get('view')
  const updateId = searchParams.get('update')

  const [viewMode, setViewMode] = useState(false)
  const [viewRx, setViewRx] = useState<typeof prescriptions[0] | null>(null)

  // Handle view mode
  useEffect(() => {
    if (viewId) {
      const rx = prescriptions.find(r => r.id === Number(viewId))
      if (rx) {
        setViewRx(rx)
        setViewMode(true)
      }
    } else {
      setViewMode(false)
      setViewRx(null)
    }
  }, [viewId, prescriptions])

  // Handle update mode
  useEffect(() => {
    if (updateId) {
      const rx = prescriptions.find(r => r.id === Number(updateId))
      if (rx) {
        setEditingRxId(rx.id)
        const p = getPatient(rx.patientId)
        setCurrentRx({
          patientName: rx.patientName,
          patientAge: p ? `${p.age} / ${p.gender}` : '',
          patientPhone: p ? p.phone : '',
          date: new Date().toISOString().split('T')[0],
          complaint: '',
          diagnosis: rx.diagnosis,
          notes: '',
          medicines: rx.medicines.map(m => ({ name: m, dose: '', freq: '', dur: '', inst: '' })),
        })
        addToast('Loaded prescription for update. Add new medicines below.', 'info')
      }
    }
  }, [updateId])

  // Handle patient prefill
  useEffect(() => {
    if (patientId && !viewMode && !updateId) {
      const p = getPatient(Number(patientId))
      if (p) {
        setCurrentRx({
          patientName: p.name,
          patientAge: `${p.age} / ${p.gender}`,
          patientPhone: p.phone,
        })
      }
    }
    if (represcribeId && !viewMode && !updateId) {
      addToast('Represcribe loaded', 'info')
    }
  }, [patientId, represcribeId, viewMode, updateId])

  const handleSave = () => {
    if (!currentRx.patientName.trim()) { addToast('Please enter patient name', 'error'); return }
    const meds = currentRx.medicines.filter(m => m.name.trim())
    if (meds.length === 0) { addToast('Please add at least one medicine', 'error'); return }

    if (editingRxId) {
      const newMedicines = meds.map(m => m.name)
      updatePrescription(editingRxId, newMedicines, currentRx.date || new Date().toISOString().split('T')[0])
      addToast('Prescription updated with new medicines!', 'success')
      setTimeout(() => { resetCurrentRx(); router.push('/history') }, 500)
      return
    }

    let p = patients.find(x => x.name.toLowerCase() === currentRx.patientName.toLowerCase())
    if (!p) {
      p = { id: patients.length + 1, name: currentRx.patientName, age: '-', gender: '-', phone: currentRx.patientPhone || '-', email: '', allergies: '', conditions: '', lastVisit: 'Just now', status: 'Active', visits: 0, rxCount: 0 }
    }

    addPrescription({
      patientId: p.id,
      patientName: p.name,
      date: currentRx.date || new Date().toISOString().split('T')[0],
      diagnosis: currentRx.diagnosis || 'General',
      medicines: meds.map(m => m.name),
      doctor: clinic.doctorName,
    })

    addToast('Prescription saved successfully!', 'success')
    setTimeout(() => { resetCurrentRx(); router.push('/history') }, 500)
  }

  const handlePrint = () => {
    const style = document.createElement('style')
    style.innerHTML = `
      @page { size: ${paperSize.toLowerCase()}; margin: 10mm; }
      body * { visibility: hidden; }
      .print-area, .print-area * { visibility: visible; }
      .print-area { position: absolute; left: 0; top: 0; width: 100%; }
      .no-print { display: none !important; }
    `
    document.head.appendChild(style)
    window.print()
    document.head.removeChild(style)
  }

  const paperClasses = paperSize === 'A4'
    ? 'w-[210mm] min-h-[297mm]'
    : 'w-[148mm] min-h-[210mm]'

  // ===================== VIEW MODE =====================
  if (viewMode && viewRx) {
    const history = viewRx.updateHistory || []
    const originalCount = viewRx.medicines.length - history.reduce((sum, h) => sum + h.medicines.length, 0)

    return (
      <div className="flex h-full">
        <div className="flex-1 p-6 overflow-y-auto min-w-0 flex flex-col items-center">
          <div className="flex items-center justify-between w-full max-w-[800px] mb-4">
            <Button variant="outline" onClick={() => router.push('/history')}>
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div className="flex items-center gap-2">
              {/* Paper Size Toggle */}
              <div className="flex items-center gap-1 bg-bg border border-border rounded-lg p-0.5 mr-2">
                {(['A5', 'A4'] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => setPaperSize(size)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-xs font-semibold transition-all',
                      paperSize === size
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4" /> Print
              </Button>
              <Button onClick={() => router.push(`/prescriptions?update=${viewRx.id}`)}>
                <Pencil className="w-4 h-4" /> Update
              </Button>
            </div>
          </div>

          {/* Prescription Paper */}
          <div className={cn(
            "bg-white border border-gray-300 rounded shadow-xl relative print-area",
            paperClasses
          )}>
            <div className="paper-watermark">PRESCRIBO</div>

            <div className="text-center border-b-[2.5px] border-primary pb-3 mb-3 p-6 pt-8">
              <div className="text-[1.05rem] font-extrabold text-primary-dark tracking-wide">{clinic.clinicName}</div>
              <div className="text-sm font-semibold text-slate-900 mt-0.5">{clinic.doctorName}</div>
              <div className="text-[0.7rem] text-slate-500 mt-0.5">{clinic.doctorQual}</div>
              <div className="text-[0.65rem] text-slate-400 mt-0.5 font-medium">{clinic.regNo}</div>
              <div className="text-[0.65rem] text-slate-400 mt-0.5">{clinic.address}</div>
            </div>

            <div className="text-[0.8rem] leading-relaxed text-slate-900 px-6">
              <div className="flex justify-between mb-1.5 gap-2 flex-wrap">
                <div className="flex gap-1"><span className="font-bold text-slate-500 text-[0.7rem]">Name:</span> <span className="font-medium">{viewRx.patientName}</span></div>
                <div className="flex gap-1"><span className="font-bold text-slate-500 text-[0.7rem]">Date:</span> <span className="font-medium">{viewRx.date}</span></div>
              </div>
              <div className="flex justify-between mb-1.5 gap-2 flex-wrap">
                <div className="flex gap-1"><span className="font-bold text-slate-500 text-[0.7rem]">Doctor:</span> <span className="font-medium">{viewRx.doctor}</span></div>
              </div>
              <div className="my-2 py-1.5 border-t border-b border-gray-200">
                <span className="font-bold text-slate-500 text-[0.7rem]">Diagnosis:</span> <span className="font-medium">{viewRx.diagnosis}</span>
              </div>

              {/* Medicines with Timeline */}
              <div className="flex flex-col gap-2 mt-3">
                {viewRx.medicines.slice(0, originalCount).map((med, i) => (
                  <div key={`orig-${i}`} className="flex gap-2 pb-2 border-b border-dashed border-gray-200">
                    <div className="w-[20px] h-[20px] bg-primary text-white rounded-full flex items-center justify-center text-[0.7rem] font-extrabold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[0.8rem]">{med}</div>
                    </div>
                  </div>
                ))}

                {history.map((update, idx) => {
                  const startIndex = originalCount + history.slice(0, idx).reduce((sum, h) => sum + h.medicines.length, 0)
                  return (
                    <div key={`update-${idx}`}>
                      <div className="flex items-center gap-2 my-1.5 py-1 px-2 bg-teal-50/60 border border-teal-100/50 rounded">
                        <Clock className="w-3 h-3 text-teal flex-shrink-0" />
                        <div className="flex-1 min-w-0 flex items-center gap-1.5">
                          <span className="text-[0.7rem] font-semibold text-teal-dark">Updated {update.date}</span>
                          <span className="text-[0.6rem] text-slate-400">· {update.medicines.length} new</span>
                        </div>
                      </div>
                      {update.medicines.map((med, mi) => (
                        <div key={`upd-${idx}-${mi}`} className="flex gap-2 pb-1.5 border-b border-dashed border-gray-200">
                          <div className="w-[18px] h-[18px] bg-teal text-white rounded-full flex items-center justify-center text-[0.65rem] font-extrabold flex-shrink-0 mt-0.5">
                            {startIndex + mi + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-[0.8rem]">{med}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="absolute bottom-6 right-8 text-center">
              <div className="font-[cursive] text-[1rem] text-primary-dark mb-0.5">{clinic.signature}</div>
              <div className="border-t border-slate-900 pt-0.5 text-[0.65rem] w-[120px]">Signature</div>
            </div>
            <div className="absolute bottom-6 left-8 text-[0.6rem] text-slate-400 max-w-[180px] leading-snug">
              This prescription is generated digitally via Prescribo. Valid for 30 days.
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===================== BUILDER / UPDATE MODE =====================
  return (
    <div className="flex h-full">
      <div className="flex-1 p-6 overflow-y-auto min-w-0">
        {editingRxId && (
          <div className="bg-warning-50 border border-warning rounded-lg p-3 mb-4 flex items-center gap-2 text-sm text-warning">
            <Clock className="w-4 h-4" />
            <span><strong>Update Mode:</strong> Add new medicines below. Existing medicines are shown for reference. Only new entries will be saved.</span>
          </div>
        )}

        <Card title="Patient Information" icon={<UserIcon />}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Patient Name</label>
              <Input list="patient-list" value={currentRx.patientName} onChange={e => setCurrentRx({ patientName: e.target.value })} placeholder="Search or enter name" readOnly={!!editingRxId} />
              <datalist id="patient-list">
                {patients.map(p => <option key={p.id} value={p.name} />)}
              </datalist>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Age / Gender</label>
              <Input value={currentRx.patientAge} onChange={e => setCurrentRx({ patientAge: e.target.value })} placeholder="e.g. 45 / Male" readOnly={!!editingRxId} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Phone</label>
              <Input value={currentRx.patientPhone} onChange={e => setCurrentRx({ patientPhone: e.target.value })} placeholder="+91 ..." readOnly={!!editingRxId} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Date</label>
              <Input type="date" value={currentRx.date} onChange={e => setCurrentRx({ date: e.target.value })} />
            </div>
          </div>
        </Card>

        <Card title="Clinical Details" icon={<FileTextIcon />}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Chief Complaint</label>
              <MultiAutocompleteInput
                value={currentRx.complaint}
                onChange={val => setCurrentRx({ complaint: val })}
                options={complaints.map(c => c.complaint)}
                placeholder="e.g. Fever, cough since 3 days"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Diagnosis</label>
              <MultiAutocompleteInput
                value={currentRx.diagnosis}
                onChange={val => setCurrentRx({ diagnosis: val })}
                options={diagnoses.map(d => d.diagnosis)}
                placeholder="e.g. Upper Respiratory Tract Infection"
                readOnly={!!editingRxId}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Notes / Advice</label>
              <Textarea value={currentRx.notes} onChange={e => setCurrentRx({ notes: e.target.value })} placeholder="Diet advice, follow up, etc." />
            </div>
          </div>
        </Card>

        <div className="bg-white border border-border rounded-xl p-5 shadow-sm mb-5">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
            <PillIcon /> Medicines
          </div>
          <div className="flex flex-col gap-2">
            {currentRx.medicines.map((med, i) => (
              <div key={i} className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1.5fr_2fr_36px] gap-1.5 items-center p-2.5 bg-bg rounded-md border border-border">
                <Input className="px-2 py-1.5 text-sm" placeholder="Medicine name" value={med.name} onChange={e => updateMedicineRow(i, { name: e.target.value })} />
                <Input className="px-2 py-1.5 text-sm" placeholder="Dose" value={med.dose} onChange={e => updateMedicineRow(i, { dose: e.target.value })} />
                <select
                  className="px-2 py-1.5 border border-border rounded text-sm outline-none focus:border-primary bg-white min-w-0"
                  value={med.freq}
                  onChange={e => updateMedicineRow(i, { freq: e.target.value })}
                >
                  <option value="">Frequency</option>
                  {frequencies.map(f => <option key={f.id} value={f.frequency}>{f.frequency}</option>)}
                </select>
                <select
                  className="px-2 py-1.5 border border-border rounded text-sm outline-none focus:border-primary bg-white min-w-0"
                  value={med.dur}
                  onChange={e => updateMedicineRow(i, { dur: e.target.value })}
                >
                  <option value="">Duration</option>
                  {durations.map(d => <option key={d.id} value={d.duration}>{d.duration}</option>)}
                </select>
                <select
                  className="px-2 py-1.5 border border-border rounded text-sm outline-none focus:border-primary bg-white min-w-0"
                  value={med.dose}
                  onChange={e => updateMedicineRow(i, { dose: e.target.value })}
                >
                  <option value="">Dosage</option>
                  {dosages.map(d => <option key={d.id} value={d.dosage}>{d.dosage}</option>)}
                </select>
                <Input className="px-2 py-1.5 text-sm" placeholder="Instructions" value={med.inst} onChange={e => updateMedicineRow(i, { inst: e.target.value })} />
                <button className="w-7 h-7 rounded bg-danger-50 text-danger flex items-center justify-center text-base hover:bg-danger hover:text-white transition-all" onClick={() => removeMedicineRow(i)}><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-2 text-primary border-dashed border-primary-light bg-primary-50 hover:bg-primary-100" onClick={() => addMedicineRow()}>
            <Plus className="w-4 h-4" /> Add Medicine
          </Button>
        </div>
      </div>

      <div className="w-[420px] bg-white border-l border-border p-5 overflow-y-auto flex flex-col items-center flex-shrink-0">
        <div className="flex items-center justify-between w-full max-w-[380px] mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {editingRxId ? 'Update Preview' : 'Live Preview'}
          </span>
          {/* Paper Size Toggle */}
          <div className="flex items-center gap-1 bg-bg border border-border rounded-lg p-0.5">
            {(['A5', 'A4'] as const).map(size => (
              <button
                key={size}
                onClick={() => setPaperSize(size)}
                className={cn(
                  'px-2 py-1 rounded-md text-xs font-semibold transition-all',
                  paperSize === size
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className={cn(
          "bg-white border border-gray-300 rounded shadow-xl relative flex-shrink-0 overflow-hidden",
          paperSize === 'A4' ? 'w-[380px] min-h-[537px]' : 'w-[380px] min-h-[380px]'
        )}>
          <div className="paper-watermark">PRESCRIBO</div>
          <div className="text-center border-b-[2.5px] border-primary pb-2 mb-2 p-4 pt-5">
            <div className="text-[0.95rem] font-extrabold text-primary-dark tracking-wide">{clinic.clinicName}</div>
            <div className="text-sm font-semibold text-slate-900 mt-0.5">{clinic.doctorName}</div>
            <div className="text-[0.7rem] text-slate-500 mt-0.5">{clinic.doctorQual}</div>
            <div className="text-[0.65rem] text-slate-400 mt-0.5 font-medium">{clinic.regNo}</div>
            <div className="text-[0.65rem] text-slate-400 mt-0.5">{clinic.address}</div>
          </div>
          <div className="text-[0.8rem] leading-relaxed text-slate-900 px-4">
            <div className="flex justify-between mb-1 gap-2 flex-wrap">
              <div className="flex gap-1"><span className="font-bold text-slate-500 text-[0.7rem]">Name:</span> <span className="font-medium">{currentRx.patientName || '-'}</span></div>
              <div className="flex gap-1"><span className="font-bold text-slate-500 text-[0.7rem]">Date:</span> <span className="font-medium">{currentRx.date || '-'}</span></div>
            </div>
            <div className="flex justify-between mb-1 gap-2 flex-wrap">
              <div className="flex gap-1"><span className="font-bold text-slate-500 text-[0.7rem]">Age/Sex:</span> <span className="font-medium">{currentRx.patientAge || '-'}</span></div>
              <div className="flex gap-1"><span className="font-bold text-slate-500 text-[0.7rem]">Phone:</span> <span className="font-medium">{currentRx.patientPhone || '-'}</span></div>
            </div>
            <div className="my-2 py-1 border-t border-b border-gray-200">
              <span className="font-bold text-slate-500 text-[0.7rem]">Complaint:</span> <span>{currentRx.complaint || '-'}</span><br/>
              <span className="font-bold text-slate-500 text-[0.7rem]">Diagnosis:</span> <span>{currentRx.diagnosis || '-'}</span>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              {currentRx.medicines.filter(m => m.name).map((med, i) => (
                <div key={i} className="flex gap-2 pb-1.5 border-b border-dashed border-gray-200">
                  <div className="w-[18px] h-[18px] bg-primary text-white rounded-full flex items-center justify-center text-[0.65rem] font-extrabold flex-shrink-0 mt-0.5">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[0.8rem]">{med.name} {med.dose ? `(${med.dose})` : ''}</div>
                    <div className="text-[0.7rem] text-slate-500">{med.freq} {med.dur ? ` for ${med.dur}` : ''}</div>
                    {med.inst && <div className="text-[0.7rem] text-slate-400 italic mt-0.5">{med.inst}</div>}
                  </div>
                </div>
              ))}
              {currentRx.medicines.filter(m => m.name).length === 0 && <div className="text-slate-400 text-[0.75rem] py-3">No medicines added yet</div>}
            </div>
            <div className="mt-2 text-[0.75rem]">
              <span className="font-bold text-slate-500">Advice:</span> <span>{currentRx.notes || '-'}</span>
            </div>
          </div>
          <div className="absolute bottom-4 right-5 text-center">
            <div className="font-[cursive] text-[0.95rem] text-primary-dark mb-0.5">{clinic.signature}</div>
            <div className="border-t border-slate-900 pt-0.5 text-[0.65rem] w-[100px]">Signature</div>
          </div>
          <div className="absolute bottom-4 left-5 text-[0.6rem] text-slate-400 max-w-[140px] leading-snug">
            This prescription is generated digitally via Prescribo. Valid for 30 days.
          </div>
        </div>

        <div className="flex gap-2.5 mt-4 w-full max-w-[380px]">
          <Button variant="outline" className="flex-1" onClick={() => { resetCurrentRx(); addToast('Form reset', 'info') }}>
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
          <Button className="flex-1" onClick={handleSave}>
            <Save className="w-4 h-4" /> {editingRxId ? 'Update Prescription' : 'Save & Print'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-border rounded-xl p-5 mb-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">{icon} {title}</div>
      {children}
    </div>
  )
}

function UserIcon() { return <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> }
function FileTextIcon() { return <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> }
function PillIcon() { return <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg> }
