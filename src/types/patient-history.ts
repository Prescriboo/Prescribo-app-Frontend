export interface PatientHistoryEntry {
  id: number
  patient_id?: number
  patientName: string
  medicineName: string
  dosageId: number
  frequencyId: number
  durationId: number
  dosage?: string
  frequency?: string
  duration?: string
  date: string
  diagnosis: string
  notes?: string
  createdAt: string
}
