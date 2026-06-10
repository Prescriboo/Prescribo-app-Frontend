'use client'

import { useEffect, useState, useRef } from 'react'
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
import { useMedicineHistoryStore } from '@/stores/medicine-history-store'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MultiAutocompleteInput } from '@/components/ui/multi-autocomplete-input'
import { SingleAutocompleteInput } from '@/components/ui/single-autocomplete-input'
import { Modal } from '@/components/ui/modal'
import { RotateCcw, Save, Plus, Trash2, ArrowLeft, Printer, Pencil, Clock, FileText, FileDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import PrescriptionPaper from '@/components/prescription/PrescriptionPaper'

export default function PrescriptionsClientPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { patients, getPatient, addPatient } = usePatientStore()
  const { prescriptions, currentRx, setCurrentRx, addMedicineRow, removeMedicineRow, updateMedicineRow, addPrescription, updatePrescription, resetCurrentRx, setEditingRxId, editingRxId, paperSize, setPaperSize } = usePrescriptionStore()
  const { clinic, templateStyle, prescriptionFooterHtml } = useSettingsStore()
  const { items: dosages } = useDosageStore()
  const { items: frequencies } = useFrequencyStore()
  const { items: durations } = useDurationStore()
  const { items: complaints } = useComplaintStore()
  const { entries: medicineList } = useMedicineHistoryStore()
  const { items: diagnoses } = useDiagnosisStore()
  const { addToast } = useUIStore()

  const patientId = searchParams.get('patient')
  const represcribeId = searchParams.get('represcribe')
  const viewId = searchParams.get('view')
  const updateId = searchParams.get('update')

  const [viewMode, setViewMode] = useState(false)
  const [viewRx, setViewRx] = useState<typeof prescriptions[0] | null>(null)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [savedRxId, setSavedRxId] = useState<number | null>(null)
  const autoPrintTriggeredRef = useRef(false)
  const previousMedicinesRef = useRef<typeof currentRx.medicines>([])

  const focusNextField = () => {
    const fields = Array.from(document.querySelectorAll('[data-enter-nav]')) as HTMLElement[]
    const active = document.activeElement
    const currentIndex = fields.findIndex(f => f === active || f.contains(active))
    const next = fields[currentIndex + 1]
    if (next) {
      const inner = next.querySelector('input, textarea, select') as HTMLElement | null
      ;(inner || next)?.focus()
    }
  }

  const handleEnterKey = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      focusNextField()
    }
  }

  const handleMedicineInstKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (rowIndex === currentRx.medicines.length - 1) {
        addMedicineRow()
        requestAnimationFrame(() => {
          const nameInputs = document.querySelectorAll('[data-medicine-name]')
          const last = nameInputs[nameInputs.length - 1] as HTMLElement | null
          last?.focus()
        })
      } else {
        focusNextField()
      }
    }
  }

  // Handle view mode
  useEffect(() => {
    autoPrintTriggeredRef.current = false
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
        const history = rx.updateHistory || []
        const latestMedicines = history.length > 0 ? history[history.length - 1].medicines : rx.medicines
        previousMedicinesRef.current = latestMedicines.map(m => ({ ...m }))
        setCurrentRx({
          patientName: rx.patientName,
          patientAge: p ? String(p.age) : '',
          patientGender: p?.gender || '',
          patientPlace: p?.place || '',
          date: new Date().toISOString().split('T')[0],
          complaint: '',
          diagnosis: rx.diagnosis,
          notes: '',
          medicines: latestMedicines.map(m => ({ ...m })),
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
          patientAge: String(p.age),
          patientGender: p.gender,
          patientPlace: p.place,
        })
      }
    }
    if (represcribeId && !viewMode && !updateId) {
      addToast('Represcribe loaded', 'info')
    }
  }, [patientId, represcribeId, viewMode, updateId])

  const handleSave = async () => {
    if (!currentRx.patientName.trim()) { addToast('Please enter patient name', 'error'); return }
    const meds = currentRx.medicines.filter(m => m.name.trim())
    if (meds.length === 0) { addToast('Please add at least one medicine', 'error'); return }

    if (editingRxId) {
      const previous = previousMedicinesRef.current
      const newMedicines = meds.filter(m =>
        !previous.some(pm => pm.name === m.name && pm.dose === m.dose && pm.freq === m.freq && pm.dur === m.dur && pm.inst === m.inst)
      )
      if (newMedicines.length === 0) {
        addToast('No new medicines to add', 'error')
        return
      }
      await updatePrescription(editingRxId, newMedicines, meds, currentRx.date || new Date().toISOString().split('T')[0])
      addToast('Prescription updated with new medicines!', 'success')
      setTimeout(() => { resetCurrentRx(); router.push('/history') }, 500)
      return
    }

    let p = patients.find(x => x.name.toLowerCase() === currentRx.patientName.toLowerCase())
    if (!p) {
      p = await addPatient({
        name: currentRx.patientName,
        age: currentRx.patientAge || '-',
        gender: currentRx.patientGender || '-',
        place: currentRx.patientPlace || '-',
        email: '',
        allergies: '',
        conditions: '',
      })
    }

    const savedRx = await addPrescription({
      patientId: p.id,
      patientName: p.name,
      date: currentRx.date || new Date().toISOString().split('T')[0],
      diagnosis: currentRx.diagnosis || '',
      medicines: meds,
      doctor: clinic.doctorName,
    })

    addToast('Prescription saved successfully!', 'success')
    setSavedRxId(savedRx.id)
    setTimeout(() => { setShowPrintModal(true) }, 300)
  }

  const handlePrint = () => {
    const originalTitle = document.title
    const patientName = viewMode && viewRx ? viewRx.patientName : currentRx.patientName
    document.title = patientName ? `${patientName} - Prescription` : 'Prescription'

    const style = document.createElement('style')
    style.id = 'print-injected-style'
    style.innerHTML = `
      @page { size: ${paperSize.toLowerCase()}; margin: 10mm; }
      body * { visibility: hidden; }
      .print-area, .print-area * { visibility: visible; }
      .print-area { position: absolute; left: 0; top: 0; width: 100%; }
      .no-print { display: none !important; }
    `
    document.head.appendChild(style)
    window.print()
    const s = document.getElementById('print-injected-style')
    if (s) document.head.removeChild(s)

    document.title = originalTitle
  }

  const handleSavePdf = async () => {
    const rx = viewMode && viewRx ? viewRx : currentRx
    const originalTitle = document.title
    const patientName = rx.patientName
    document.title = patientName ? `${patientName} - Prescription` : 'Prescription'

    const printArea = document.querySelector('.print-area') as HTMLElement | null
    if (!printArea) {
      addToast('Nothing to print', 'error')
      document.title = originalTitle
      return
    }

    const clone = printArea.cloneNode(true) as HTMLElement
    clone.style.left = ''
    clone.style.top = ''
    clone.style.position = ''

    const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .map((link) => `<link rel="stylesheet" href="${(link as HTMLLinkElement).href}">`)
      .join('')

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  ${cssLinks}
  <style>
    body { margin: 0; padding: 0; background: white; }
    @page { size: ${paperSize.toLowerCase()}; margin: 10mm; }
    .print-area { position: absolute; left: 0; top: 0; }
  </style>
</head>
<body>
  ${clone.outerHTML}
</body>
</html>
    `.trim()

    try {
      const result = await window.electron.print.toPDF(html, { pageSize: paperSize })
      if (result.success) {
        addToast(`PDF saved: ${result.path}`, 'success')
      } else if (result.cancelled) {
        // no-op
      } else {
        addToast(result.error || 'Failed to save PDF', 'error')
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to save PDF', 'error')
    } finally {
      document.title = originalTitle
    }
  }

  // Auto-print / auto-PDF when redirected from Save & Print modal
  useEffect(() => {
    if (!viewMode || !viewRx) return
    if (autoPrintTriggeredRef.current) return
    const autoPrint = searchParams.get('autoPrint')
    const autoPdf = searchParams.get('autoPdf')
    if (autoPrint === '1' || autoPdf === '1') {
      autoPrintTriggeredRef.current = true
      const timer = setTimeout(() => {
        if (autoPrint === '1') handlePrint()
        else handleSavePdf()
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [viewMode, viewRx, searchParams])

  const paperClasses = paperSize === 'A4'
    ? 'w-[210mm] min-h-[297mm]'
    : 'w-[148mm] min-h-[210mm]'


  // ===================== VIEW MODE =====================
  if (viewMode && viewRx) {
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
          <PrescriptionPaper
            data={viewRx}
            patient={getPatient(viewRx.patientId)}
            paperSize={paperSize}
            mode="print"
            className="print-area"
          />
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

        <Card data-tour-step="rx-builder" title="Patient Information" icon={<UserIcon />}>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col gap-1.5" data-enter-nav>
              <label className="text-xs font-semibold text-slate-500">Patient Name</label>
              <Input list="patient-list" value={currentRx.patientName} onChange={e => setCurrentRx({ patientName: e.target.value })} onKeyDown={handleEnterKey} placeholder="Search or enter name" readOnly={!!editingRxId} />
              <datalist id="patient-list">
                {patients.map(p => <option key={p.id} value={p.name} />)}
              </datalist>
            </div>
            <div className="flex flex-col gap-1.5" data-enter-nav>
              <label className="text-xs font-semibold text-slate-500">Age</label>
              <Input type="text" value={currentRx.patientAge} onChange={e => setCurrentRx({ patientAge: e.target.value })} onKeyDown={handleEnterKey} placeholder="e.g. 45" readOnly={!!editingRxId} />
            </div>
            <div className="flex flex-col gap-1.5" data-enter-nav>
              <label className="text-xs font-semibold text-slate-500">Sex</label>
              <select value={currentRx.patientGender} onChange={e => setCurrentRx({ patientGender: e.target.value })} onKeyDown={handleEnterKey} disabled={!!editingRxId} className="flex w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm shadow-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary-100 disabled:bg-slate-50 disabled:text-slate-500">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5" data-enter-nav>
              <label className="text-xs font-semibold text-slate-500">Place</label>
              <Input value={currentRx.patientPlace} onChange={e => setCurrentRx({ patientPlace: e.target.value })} onKeyDown={handleEnterKey} placeholder="e.g. Bangalore" readOnly={!!editingRxId} />
            </div>
            <div className="flex flex-col gap-1.5" data-enter-nav>
              <label className="text-xs font-semibold text-slate-500">Date</label>
              <Input type="date" value={currentRx.date} readOnly className="bg-slate-50 text-slate-500" />
            </div>
          </div>
        </Card>

        <Card title="Clinical Details" icon={<FileTextIcon />}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5" data-enter-nav>
              <label className="text-xs font-semibold text-slate-500">Chief Complaint</label>
              <MultiAutocompleteInput
                value={currentRx.complaint}
                onChange={val => setCurrentRx({ complaint: val })}
                options={complaints.map(c => c.complaint)}
                placeholder="e.g. Fever, cough since 3 days"
                onPressEnter={focusNextField}
              />
            </div>
            <div className="flex flex-col gap-1.5" data-enter-nav>
              <label className="text-xs font-semibold text-slate-500">Diagnosis</label>
              <MultiAutocompleteInput
                value={currentRx.diagnosis}
                onChange={val => setCurrentRx({ diagnosis: val })}
                options={diagnoses.map(d => d.diagnosis)}
                placeholder="e.g. Upper Respiratory Tract Infection"
                readOnly={!!editingRxId}
                onPressEnter={focusNextField}
              />
            </div>
            <div className="flex flex-col gap-1.5" data-enter-nav>
              <label className="text-xs font-semibold text-slate-500">Notes / Advice</label>
              <Textarea value={currentRx.notes} onChange={e => setCurrentRx({ notes: e.target.value })} onKeyDown={handleEnterKey} placeholder="Diet advice, follow up, etc." />
            </div>
          </div>
        </Card>

        <div data-tour-step="medicines" className="bg-white border border-border rounded-xl p-5 shadow-sm mb-5">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
            <PillIcon /> Medicines
          </div>
          <div className="flex flex-col gap-2">
            {currentRx.medicines.map((med, i) => (
              <div key={i} className="grid grid-cols-[2fr_1.5fr_1.5fr_1.5fr_2fr_36px] gap-1.5 items-center p-2.5 bg-bg rounded-md border border-border">
                <SingleAutocompleteInput
                  className="px-2 py-1.5 text-sm"
                  placeholder="Medicine name"
                  value={med.name}
                  onChange={val => updateMedicineRow(i, { name: val })}
                  options={medicineList.map(m => m.name)}
                  onPressEnter={focusNextField}
                  data-medicine-name
                  data-enter-nav
                />
                <select
                  className="px-2 py-1.5 border border-border rounded text-sm outline-none focus:border-primary bg-white min-w-0"
                  value={med.dose}
                  onChange={e => updateMedicineRow(i, { dose: e.target.value })}
                  onKeyDown={handleEnterKey}
                  data-enter-nav
                >
                  <option value="">Dosage</option>
                  {dosages.map(d => <option key={d.id} value={d.dosage}>{d.dosage}</option>)}
                </select>
                <select
                  className="px-2 py-1.5 border border-border rounded text-sm outline-none focus:border-primary bg-white min-w-0"
                  value={med.freq}
                  onChange={e => updateMedicineRow(i, { freq: e.target.value })}
                  onKeyDown={handleEnterKey}
                  data-enter-nav
                >
                  <option value="">Frequency</option>
                  {frequencies.map(f => <option key={f.id} value={f.frequency}>{f.frequency}</option>)}
                </select>
                <select
                  className="px-2 py-1.5 border border-border rounded text-sm outline-none focus:border-primary bg-white min-w-0"
                  value={med.dur}
                  onChange={e => updateMedicineRow(i, { dur: e.target.value })}
                  onKeyDown={handleEnterKey}
                  data-enter-nav
                >
                  <option value="">Duration</option>
                  {durations.map(d => <option key={d.id} value={d.duration}>{d.duration}</option>)}
                </select>
                <Input
                  className="px-2 py-1.5 text-sm"
                  placeholder="Instructions"
                  value={med.inst}
                  onChange={e => updateMedicineRow(i, { inst: e.target.value })}
                  onKeyDown={e => handleMedicineInstKeyDown(e, i)}
                  data-enter-nav
                />
                <button className="w-7 h-7 rounded bg-danger-50 text-danger flex items-center justify-center text-base hover:bg-danger hover:text-white transition-all" onClick={() => removeMedicineRow(i)}><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-2 text-primary border-dashed border-primary-light bg-primary-50 hover:bg-primary-100" onClick={() => addMedicineRow()}>
            <Plus className="w-4 h-4" /> Add Medicine
          </Button>
        </div>
      </div>

      <div data-tour-step="preview" className="w-[420px] bg-white border-l border-border p-5 overflow-y-auto flex-shrink-0">
        <div className="flex items-center justify-between w-full max-w-[380px] mb-3 mx-auto">
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

        <PrescriptionPaper
          data={currentRx}
          paperSize={paperSize}
          mode="preview"
        />

        <div className="flex gap-2.5 mt-4 w-full max-w-[380px] mx-auto">
          <Button variant="outline" className="flex-1" onClick={() => { resetCurrentRx(); addToast('Form reset', 'info') }}>
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
          <Button className="flex-1" onClick={handleSave}>
            <Save className="w-4 h-4" /> {editingRxId ? 'Update Prescription' : 'Save & Print'}
          </Button>
        </div>
      </div>

      {/* Save & Print Modal */}
      <Modal
        isOpen={showPrintModal}
        onClose={() => {
          setShowPrintModal(false)
          resetCurrentRx()
          router.push('/history')
        }}
        title="Prescription Saved"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setShowPrintModal(false)
                resetCurrentRx()
                router.push('/history')
              }}
            >
              Done
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (savedRxId) {
                  setShowPrintModal(false)
                  router.push(`/prescriptions?view=${savedRxId}&autoPdf=1`)
                }
              }}
            >
              <FileDown className="w-4 h-4 mr-1.5" /> Save as PDF
            </Button>
            <Button
              onClick={() => {
                if (savedRxId) {
                  setShowPrintModal(false)
                  router.push(`/prescriptions?view=${savedRxId}&autoPrint=1`)
                }
              }}
            >
              <Printer className="w-4 h-4 mr-1.5" /> Print
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">What would you like to do with this prescription?</p>
      </Modal>
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
