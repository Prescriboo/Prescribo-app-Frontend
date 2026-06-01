export interface PatientHistoryEntry {
  id: number
  patientName: string
  medicineName: string
  dosageId: number
  frequencyId: number
  durationId: number
  date: string
  diagnosis: string
  notes?: string
  createdAt: string
}
