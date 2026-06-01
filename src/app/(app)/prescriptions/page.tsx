import { Suspense } from 'react'
import PrescriptionsClientPage from './prescriptions-client'

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400">Loading...</div>}>
      <PrescriptionsClientPage />
    </Suspense>
  )
}
