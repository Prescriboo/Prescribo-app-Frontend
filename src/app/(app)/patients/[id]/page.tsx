import PatientDetailPage from './patient-detail'

export function generateStaticParams() {
  return [{ id: '1' }]
}

export default function Page() {
  return <PatientDetailPage />
}
