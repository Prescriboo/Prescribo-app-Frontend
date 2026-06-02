'use client'

import { useRouter } from 'next/navigation'
import { useTemplateStore } from '@/stores/template-store'
import { usePrescriptionStore } from '@/stores/prescription-store'
import { useUIStore } from '@/stores/ui-store'
import { FileText } from 'lucide-react'

export default function TemplatesPage() {
  const router = useRouter()
  const { templates, selectTemplate } = useTemplateStore()
  const { setCurrentRx, addMedicineRow, resetCurrentRx } = usePrescriptionStore()
  const { addToast } = useUIStore()

  const handleSelect = (id: number) => {
    const t = templates.find(x => x.id === id)
    if (!t) return
    selectTemplate(id)
    resetCurrentRx()
    setCurrentRx({ diagnosis: t.name })
    t.medicines.forEach(m => addMedicineRow({ name: m }))
    addToast(`Template "${t.name}" loaded`, 'success')
    setTimeout(() => router.push('/prescriptions'), 400)
  }

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-5 flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Prescription Templates</h1>
          <p className="text-xs text-slate-400 mt-0.5">Pre-configured templates for quick prescription generation</p>
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5 px-6 pb-6">
        {templates.length === 0 ? (
          <div className="col-span-full py-8 text-center text-sm text-slate-400">No templates available. Templates can be added via the API or settings.</div>
        ) : (
          templates.map(t => (
            <div
              key={t.id}
              className="bg-white border-2 border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary-light hover:-translate-y-1 hover:shadow-lg transition-all relative"
              onClick={() => handleSelect(t.id)}
            >
              <div className="h-[140px] bg-gradient-to-br from-primary-50 to-teal-50 flex items-center justify-center relative">
                <FileText className="w-16 h-16 opacity-25 text-primary" />
                {t.tags.map(tag => <span key={tag} className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-primary text-white text-[0.65rem] font-extrabold rounded-full uppercase tracking-wider">{tag}</span>)}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold mb-1">{t.name}</h3>
                <p className="text-xs text-slate-400">{t.desc}</p>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {t.medicines.slice(0, 3).map(m => <span key={m} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary border border-blue-100">{m}</span>)}
                  {t.medicines.length > 3 && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary border border-blue-100">+{t.medicines.length - 3}</span>}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-primary font-semibold">Click to use template &rarr;</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
