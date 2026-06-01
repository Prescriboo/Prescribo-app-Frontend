export interface Prescription {
  id: number
  patientId: number
  patientName: string
  date: string
  diagnosis: string
  medicines: MedicineRow[]
  doctor: string
  updateHistory?: { date: string; medicines: MedicineRow[] }[]
}

export interface MedicineRow {
  name: string
  dose: string
  freq: string
  dur: string
  inst: string
}
