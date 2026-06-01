export interface Prescription {
  id: number
  patientId: number
  patientName: string
  date: string
  diagnosis: string
  medicines: string[]
  doctor: string
  updateHistory?: { date: string; medicines: string[] }[]
}

export interface MedicineRow {
  name: string
  dose: string
  freq: string
  dur: string
  inst: string
}
