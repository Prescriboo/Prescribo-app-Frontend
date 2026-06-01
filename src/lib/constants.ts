export const APP_VERSION = '2.4.1'

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutGrid' },
  { id: 'patients', label: 'Patients', icon: 'Users' },
  { id: 'prescriptions', label: 'New Prescription', icon: 'FileText' },
  { id: 'templates', label: 'Templates', icon: 'LayoutTemplate' },
  { id: 'history', label: 'History', icon: 'Clock' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
]

import { Patient, Prescription, Template } from '@/types'

export const DEMO_PATIENTS: Patient[] = [
  { id: 1, name: 'Rajesh Kumar', age: 42, gender: 'Male', phone: '+91 98765 43210', email: '', allergies: 'Penicillin', conditions: 'Hypertension, Diabetes Type 2', lastVisit: 'Today', status: 'Active', visits: 12, rxCount: 8 },
  { id: 2, name: 'Priya Sharma', age: 35, gender: 'Female', phone: '+91 98765 43211', email: '', allergies: '', conditions: 'Hypothyroidism', lastVisit: 'Yesterday', status: 'Active', visits: 8, rxCount: 5 },
  { id: 3, name: 'Amit Patel', age: 28, gender: 'Male', phone: '+91 98765 43212', email: '', allergies: 'Sulfa', conditions: '', lastVisit: '2 days ago', status: 'Active', visits: 5, rxCount: 3 },
  { id: 4, name: 'Sunita Devi', age: 56, gender: 'Female', phone: '+91 98765 43213', email: '', allergies: '', conditions: 'Arthritis', lastVisit: '3 days ago', status: 'Active', visits: 20, rxCount: 15 },
  { id: 5, name: 'Vikram Singh', age: 31, gender: 'Male', phone: '+91 98765 43214', email: '', allergies: 'Aspirin', conditions: 'Asthma', lastVisit: '1 week ago', status: 'Inactive', visits: 3, rxCount: 2 },
  { id: 6, name: 'Anita Rao', age: 45, gender: 'Female', phone: '+91 98765 43215', email: '', allergies: '', conditions: 'Migraine', lastVisit: '1 week ago', status: 'Active', visits: 10, rxCount: 7 },
]

export const DEMO_PRESCRIPTIONS: Prescription[] = [
  { id: 1, patientId: 1, patientName: 'Rajesh Kumar', date: '2026-05-24', diagnosis: 'Upper Respiratory Tract Infection', medicines: [{ name: 'Amoxicillin 500mg', dose: '', freq: '', dur: '', inst: '' }, { name: 'Paracetamol 650mg', dose: '', freq: '', dur: '', inst: '' }, { name: 'Cetirizine 10mg', dose: '', freq: '', dur: '', inst: '' }], doctor: 'Dr. David Smith' },
  { id: 2, patientId: 2, patientName: 'Priya Sharma', date: '2026-05-23', diagnosis: 'Type 2 Diabetes Follow-up', medicines: [{ name: 'Metformin 500mg', dose: '', freq: '', dur: '', inst: '' }, { name: 'Atorvastatin 10mg', dose: '', freq: '', dur: '', inst: '' }], doctor: 'Dr. David Smith' },
  { id: 3, patientId: 3, patientName: 'Amit Patel', date: '2026-05-22', diagnosis: 'Allergic Rhinitis', medicines: [{ name: 'Cetirizine 10mg', dose: '', freq: '', dur: '', inst: '' }, { name: 'Montelukast 10mg', dose: '', freq: '', dur: '', inst: '' }], doctor: 'Dr. David Smith' },
  { id: 4, patientId: 4, patientName: 'Sunita Devi', date: '2026-05-21', diagnosis: 'GERD', medicines: [{ name: 'Omeprazole 20mg', dose: '', freq: '', dur: '', inst: '' }, { name: 'Domperidone 10mg', dose: '', freq: '', dur: '', inst: '' }], doctor: 'Dr. David Smith' },
  { id: 5, patientId: 1, patientName: 'Rajesh Kumar', date: '2026-05-15', diagnosis: 'Hypertension Follow-up', medicines: [{ name: 'Amlodipine 5mg', dose: '', freq: '', dur: '', inst: '' }, { name: 'Losartan 50mg', dose: '', freq: '', dur: '', inst: '' }], doctor: 'Dr. David Smith' },
  { id: 6, patientId: 6, patientName: 'Anita Rao', date: '2026-05-20', diagnosis: 'Migraine', medicines: [{ name: 'Sumatriptan 50mg', dose: '', freq: '', dur: '', inst: '' }, { name: 'Prochlorperazine 5mg', dose: '', freq: '', dur: '', inst: '' }], doctor: 'Dr. David Smith' },
]

export const DEMO_TEMPLATES: Template[] = [
  { id: 1, name: 'Fever & Cold', desc: 'Common viral fever treatment', tags: ['General'], medicines: ['Paracetamol 500mg', 'Cetirizine 10mg', 'Vitamin C 500mg'] },
  { id: 2, name: 'Diabetes Follow-up', desc: 'Type 2 diabetes management', tags: ['Chronic'], medicines: ['Metformin 500mg', 'Glimepiride 1mg'] },
  { id: 3, name: 'Hypertension', desc: 'BP control prescription', tags: ['Chronic'], medicines: ['Amlodipine 5mg', 'Losartan 50mg'] },
  { id: 4, name: 'Gastritis', desc: 'Acidity and gastritis relief', tags: ['General'], medicines: ['Omeprazole 20mg', 'Domperidone 10mg'] },
  { id: 5, name: 'Allergy', desc: 'Allergic rhinitis treatment', tags: ['General'], medicines: ['Cetirizine 10mg', 'Montelukast 10mg'] },
  { id: 6, name: 'Pain Management', desc: 'Muscle pain and inflammation', tags: ['Ortho'], medicines: ['Diclofenac 50mg', 'Chlorzoxazone 250mg'] },
]
