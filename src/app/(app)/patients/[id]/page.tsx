import PatientDetailPage from './patient-detail'

export function generateStaticParams() {
  return [{ id: '_placeholder' }]
}

export default function Page() {
  return <PatientDetailPage />
}
