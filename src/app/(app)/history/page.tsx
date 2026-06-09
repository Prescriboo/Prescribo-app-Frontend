'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { usePatientStore } from '@/stores/patient-store'
import { usePrescriptionStore } from '@/stores/prescription-store'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Download, Eye, RotateCcw, Search, Trash2 } from 'lucide-react'
import PrescriptionPaper from '@/components/prescription/PrescriptionPaper'

export default function HistoryPage() {
  const router = useRouter()
  const { prescriptions, deletePrescription, paperSize } = usePrescriptionStore()
  const { getPatient } = usePatientStore()
  const { addToast } = useUIStore()
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [printingRx, setPrintingRx] = useState<typeof prescriptions[0] | null>(null)

  const handleDownloadPdf = async (rxId: number, patientName: string) => {
    const rx = prescriptions.find((r) => r.id === rxId)
    if (!rx) return
    setPrintingRx(rx)
    await new Promise((resolve) => requestAnimationFrame(resolve))

    const originalTitle = document.title
    document.title = patientName ? `${patientName} - Prescription` : 'Prescription'

    const style = document.createElement('style')
    style.id = 'pdf-injected-style'
    style.innerHTML = `
      @page { size: ${paperSize.toLowerCase()}; margin: 10mm; }
      body * { visibility: hidden; }
      .print-area, .print-area * { visibility: visible; }
      .print-area { position: absolute !important; left: 0 !important; top: 0 !important; width: 100%; }
      .no-print { display: none !important; }
    `
    document.head.appendChild(style)

    try {
      const result = await window.electron.print.toPDF('', { pageSize: paperSize })
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
      const s = document.getElementById('pdf-injected-style')
      if (s) document.head.removeChild(s)
      document.title = originalTitle
      setPrintingRx(null)
    }
  }

  const filtered = search
    ? prescriptions.filter(
        (r) =>
          r.patientName.toLowerCase().includes(search.toLowerCase()) ||
          r.diagnosis.toLowerCase().includes(search.toLowerCase())
      )
    : prescriptions

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-5 flex-wrap gap-4">
        <h1 className="text-xl font-extrabold text-slate-900">Prescription History</h1>
        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative flex items-center gap-2.5 bg-white border border-border rounded-xl px-3 py-2 focus-within:border-primary-light focus-within:ring-3 focus-within:ring-primary-100 transition-all">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <Input
              type="text"
              className="bg-transparent border-none shadow-none focus-visible:ring-0 focus-visible:border-none px-0 py-0 text-sm w-48 text-slate-900 placeholder:text-slate-400"
              placeholder="Search prescriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => addToast('Exporting history...', 'info')}>
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>
      <div className="mx-6 bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg">
                <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Date</th>
                <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Patient</th>
                <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Age</th>
                <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Gender</th>
                <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Place</th>
                <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Diagnosis</th>
                <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Medicines</th>
                <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Doctor</th>
                <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-400">
                    No prescriptions found. Create a new prescription to see it here.
                  </td>
                </tr>
              ) : (
                filtered.map((rx) => {
                  const p = getPatient(rx.patientId)
                  return (
                    <tr
                      key={rx.id}
                      className="hover:bg-slate-50 transition-all cursor-pointer"
                      onClick={() => router.push(`/prescriptions?view=${rx.id}`)}
                    >
                      <td className="px-4 py-3.5 text-sm border-b border-slate-50">{rx.date}</td>
                      <td className="px-4 py-3.5 text-sm border-b border-slate-50">
                        <strong>{rx.patientName}</strong>
                      </td>
                      <td className="px-4 py-3.5 text-sm border-b border-slate-50">{p?.age ?? '-'}</td>
                      <td className="px-4 py-3.5 text-sm border-b border-slate-50">{p?.gender ?? '-'}</td>
                      <td className="px-4 py-3.5 text-sm border-b border-slate-50">{p?.place ?? '-'}</td>
                      <td className="px-4 py-3.5 text-sm border-b border-slate-50">{rx.diagnosis}</td>
                      <td className="px-4 py-3.5 text-sm border-b border-slate-50">
                        {rx.medicines.map((m) => m.name).join(', ')}
                      </td>
                      <td className="px-4 py-3.5 text-sm border-b border-slate-50">{rx.doctor}</td>
                      <td className="px-4 py-3.5 text-sm border-b border-slate-50">
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all"
                            onClick={() => router.push(`/prescriptions?view=${rx.id}`)}
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all"
                            onClick={() => router.push(`/prescriptions?represcribe=${rx.id}`)}
                            title="Represcribe"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all"
                            title="Download PDF"
                            onClick={() => handleDownloadPdf(rx.id, rx.patientName)}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-danger-50 hover:text-danger transition-all"
                            title="Delete"
                            onClick={() => setDeleteId(rx.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Prescription"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (deleteId == null) return
                await deletePrescription(deleteId)
                addToast('Prescription deleted', 'info')
                setDeleteId(null)
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete this prescription? This action cannot be undone.
        </p>
      </Modal>

      {printingRx &&
        createPortal(
          <div className="print-area" style={{ position: 'absolute', left: '-9999px', top: 0 }}>
            <PrescriptionPaper
              data={printingRx}
              patient={getPatient(printingRx.patientId)}
              paperSize={paperSize}
              mode="print"
            />
          </div>,
          document.body
        )}
    </div>
  )
}
