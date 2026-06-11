'use client'

import { cn } from '@/lib/utils'
import { sanitizeHtml } from '@/lib/sanitize-html'
import { useSettingsStore } from '@/stores/settings-store'
import { MedicineRow } from '@/types'
import { Clock } from 'lucide-react'

interface PrescriptionPaperProps {
  data: {
    patientName: string
    date?: string
    patientAge?: string
    patientGender?: string
    patientPlace?: string
    complaint?: string
    diagnosis?: string
    notes?: string
    doctor?: string
    medicines: MedicineRow[]
    updateHistory?: { date: string; medicines: MedicineRow[] }[]
  }
  patient?: {
    age?: number | string
    gender?: string
    place?: string
  }
  paperSize: 'A4' | 'A5'
  mode?: 'print' | 'preview'
  className?: string
  showWatermark?: boolean
}

export default function PrescriptionPaper({
  data,
  patient,
  paperSize,
  mode = 'print',
  className,
  showWatermark = true,
}: PrescriptionPaperProps) {
  const { clinic, templateStyle, prescriptionFooterHtml } = useSettingsStore()

  const isPrint = mode === 'print'

  const containerClasses = isPrint
    ? cn(
        'bg-white border border-gray-300 rounded shadow-xl relative flex flex-col',
        paperSize === 'A4' ? 'w-[210mm] min-h-[297mm]' : 'w-[148mm] min-h-[210mm]'
      )
    : cn(
        'bg-white border border-gray-300 rounded shadow-xl relative flex-shrink-0 mx-auto flex flex-col',
        paperSize === 'A4' ? 'w-[380px] min-h-[537px]' : 'w-[380px] min-h-[380px]'
      )

  const headerPadding = isPrint ? 'p-6 pt-8 pb-3 mb-3' : 'p-4 pt-5 pb-2 mb-2'
  const contentPadding = isPrint ? 'px-6' : 'px-4'
  const sigPadding = isPrint ? 'px-6' : 'px-4'
  const footerPadding = isPrint ? 'px-6 pb-6' : 'px-4 pb-4'
  const sigWidth = isPrint ? 'w-[120px]' : 'w-[100px]'
  const sigTextSize = isPrint ? 'text-[1rem]' : 'text-[0.9rem]'
  const clinicNameSize = isPrint ? 'text-[1.05rem]' : 'text-[0.95rem]'

  const age = patient?.age ?? data.patientAge ?? '-'
  const gender = patient?.gender ?? data.patientGender ?? '-'
  const place = patient?.place ?? data.patientPlace ?? '-'

  const originalMeds = data.medicines.filter((m) => m.name.trim())
  const history = data.updateHistory || []

  return (
    <div className={cn(containerClasses, className)}>
      {showWatermark && <div className="paper-watermark">PRESCRIBO</div>}

      <div className="flex-1">
        <div className={cn('text-center border-b-[2.5px] border-primary', headerPadding)}>
          <div className={cn('font-extrabold text-primary-dark tracking-wide', clinicNameSize)}>
            {clinic.clinicName}
          </div>
          <div className="text-sm font-semibold text-slate-900 mt-0.5">{clinic.doctorName}</div>
          <div className="text-[0.7rem] text-slate-500 mt-0.5">{clinic.doctorQual}</div>
          {clinic.specialization && (
            <div className="text-[0.7rem] text-slate-500 mt-0.5">{clinic.specialization}</div>
          )}
          {[
            clinic.clinicAddressLine1,
            clinic.clinicAddressLine2,
            clinic.city,
            clinic.state,
            clinic.pincode,
          ]
            .filter(Boolean)
            .join(', ') && (
            <div className="text-[0.7rem] text-slate-500 mt-0.5">
              {[
                clinic.clinicAddressLine1,
                clinic.clinicAddressLine2,
                clinic.city,
                clinic.state,
                clinic.pincode,
              ]
                .filter(Boolean)
                .join(', ')}
            </div>
          )}
        </div>

        <div className={cn('text-[0.8rem] leading-relaxed text-slate-900', contentPadding)}>
          <div className="flex justify-between mb-1.5 gap-2 flex-wrap">
            <div className="flex gap-1">
              <span className="font-bold text-slate-500 text-[0.7rem]">Name:</span>{' '}
              <span className="font-medium">{data.patientName}</span>
            </div>
            <div className="flex gap-1">
              <span className="font-bold text-slate-500 text-[0.7rem]">Date:</span>{' '}
              <span className="font-medium">{data.date || '-'}</span>
            </div>
          </div>
          <div className="flex justify-between mb-1.5 gap-2 flex-wrap">
            <div className="flex gap-1">
              <span className="font-bold text-slate-500 text-[0.7rem]">Age:</span>{' '}
              <span className="font-medium">{age}</span>
            </div>
            <div className="flex gap-1">
              <span className="font-bold text-slate-500 text-[0.7rem]">Sex:</span>{' '}
              <span className="font-medium">{gender}</span>
            </div>
          </div>
          <div className="flex justify-between mb-1.5 gap-2 flex-wrap">
            {place && place !== '-' && (
              <div className="flex gap-1">
                <span className="font-bold text-slate-500 text-[0.7rem]">Place:</span>{' '}
                <span className="font-medium">{place}</span>
              </div>
            )}
            {data.doctor && (
              <div className="flex gap-1">
                <span className="font-bold text-slate-500 text-[0.7rem]">Doctor:</span>{' '}
                <span className="font-medium">{data.doctor}</span>
              </div>
            )}
          </div>

          <div className="my-2 py-1.5 border-t border-b border-gray-200">
            {data.complaint && (
              <>
                <span className="font-bold text-slate-500 text-[0.7rem]">Complaint:</span>{' '}
                <span>{data.complaint}</span>
                <br />
              </>
            )}
            <span className="font-bold text-slate-500 text-[0.7rem]">Diagnosis:</span>{' '}
            <span className="font-medium">{data.diagnosis}</span>
          </div>

          {/* Medicines Table */}
          <div className="mt-3">
            <div className="grid grid-cols-[16px_1.5fr_1fr_1fr_1fr_1.2fr] gap-1 text-[0.6rem] font-bold text-slate-500 uppercase tracking-wider border-b border-gray-200 pb-1 mb-1">
              <div>No</div>
              <div>Name</div>
              <div>Dosage</div>
              <div>Frequency</div>
              <div>Duration</div>
              <div>Instruction</div>
            </div>

            {originalMeds.map((med, i) => (
              <div
                key={`orig-${i}`}
                className="grid grid-cols-[16px_1.5fr_1fr_1fr_1fr_1.2fr] gap-1 text-[0.7rem] py-1 border-b border-dashed border-gray-200"
              >
                <div className="font-extrabold text-slate-500">{i + 1}</div>
                <div className="font-semibold">{med.name}</div>
                <div>{med.dose || '-'}</div>
                <div>{med.freq || '-'}</div>
                <div>{med.dur || '-'}</div>
                <div className="italic text-slate-400">{med.inst || '-'}</div>
              </div>
            ))}

            {history.map((update, idx) => {
              const startIndex =
                originalMeds.length +
                history.slice(0, idx).reduce((sum, h) => sum + h.medicines.length, 0)
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
                    <div
                      key={`upd-${idx}-${mi}`}
                      className="grid grid-cols-[16px_1.5fr_1fr_1fr_1fr_1.2fr] gap-1 text-[0.7rem] py-1 border-b border-dashed border-gray-200"
                    >
                      <div className="font-extrabold text-slate-500">{startIndex + mi + 1}</div>
                      <div className="font-semibold">{med.name}</div>
                      <div>{med.dose || '-'}</div>
                      <div>{med.freq || '-'}</div>
                      <div>{med.dur || '-'}</div>
                      <div className="italic text-slate-400">{med.inst || '-'}</div>
                    </div>
                  ))}
                </div>
              )
            })}

            {originalMeds.length === 0 && history.length === 0 && (
              <div className="text-slate-400 text-[0.75rem] py-3">No medicines added yet</div>
            )}
          </div>

          {data.notes && (
            <div className="mt-2 text-[0.75rem]">
              <span className="font-bold text-slate-500">Advice:</span> <span>{data.notes}</span>
            </div>
          )}
        </div>
      </div>

      {templateStyle === 'header-footer' && (
        <>
          <div className={cn('pb-2 flex items-end', sigPadding, clinic.sealImageDataUrl ? 'justify-between' : 'justify-end')}>
            {clinic.sealImageDataUrl && (
              <div className="text-center">
                <img
                  src={clinic.sealImageDataUrl}
                  alt="Seal"
                  className={cn('object-contain mx-auto', isPrint ? 'h-20' : 'h-16')}
                />
                <div className={cn('border-t border-slate-900 pt-0.5 text-[0.65rem]', sigWidth)}>
                  Seal
                </div>
              </div>
            )}
            <div className="text-center">
              {clinic.signatureImageDataUrl ? (
                <img
                  src={clinic.signatureImageDataUrl}
                  alt="Signature"
                  className={cn('object-contain mx-auto', isPrint ? 'h-12' : 'h-10')}
                />
              ) : (
                <div className={cn('font-[cursive] text-primary-dark mb-0.5', sigTextSize)}>
                  {clinic.signature}
                </div>
              )}
              <div className={cn('border-t border-slate-900 pt-0.5 text-[0.65rem]', sigWidth)}>
                Signature
              </div>
            </div>
          </div>
          <div className={cn('mt-auto', isPrint ? 'pt-3' : 'pt-2', footerPadding)}>
            <div
              className="border-t border-gray-200 pt-2 text-center text-[0.6rem] text-slate-500 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(prescriptionFooterHtml) }}
            />
          </div>
        </>
      )}

      {templateStyle === 'header-only' && (
        <div className={cn('mt-auto flex items-end', footerPadding, clinic.sealImageDataUrl ? 'justify-between' : 'justify-end')}>
          {clinic.sealImageDataUrl && (
            <div className="text-center">
              <img
                src={clinic.sealImageDataUrl}
                alt="Seal"
                className={cn('object-contain mx-auto', isPrint ? 'h-20' : 'h-16')}
              />
              <div className={cn('border-t border-slate-900 pt-0.5 text-[0.65rem]', sigWidth)}>
                Seal
              </div>
            </div>
          )}
          <div className="text-center">
            {clinic.signatureImageDataUrl ? (
              <img
                src={clinic.signatureImageDataUrl}
                alt="Signature"
                className={cn('object-contain mx-auto', isPrint ? 'h-12' : 'h-10')}
              />
            ) : (
              <div className={cn('font-[cursive] text-primary-dark mb-0.5', sigTextSize)}>
                {clinic.signature}
              </div>
            )}
            <div className={cn('border-t border-slate-900 pt-0.5 text-[0.65rem]', sigWidth)}>
              Signature
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
