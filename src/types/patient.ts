export interface Patient {
  id: number
  name: string
  age: number | string
  gender: string
  place: string
  email: string
  allergies: string
  conditions: string
  lastVisit: string
  status: 'Active' | 'Inactive'
  visits: number
  rxCount: number
}
