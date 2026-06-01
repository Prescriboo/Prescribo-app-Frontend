export interface MedicineHistoryEntry {
  id: number
  name: string
  fileName?: string
  fileType?: 'pdf' | 'docx'
  fileData?: string
  createdAt: string
}
