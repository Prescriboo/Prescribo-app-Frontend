'use client'

import { useState, useRef } from 'react'
import { useSettingsStore } from '@/stores/settings-store'
import { useAuthStore } from '@/stores/auth-store'
import { useMedicineHistoryStore } from '@/stores/medicine-history-store'
import { useDosageFrequencyStore } from '@/stores/dosage-frequency-store'
import { usePatientHistoryStore } from '@/stores/patient-history-store'
import { useDosageStore } from '@/stores/dosage-store'
import { useFrequencyStore } from '@/stores/frequency-store'
import { useDurationStore } from '@/stores/duration-store'
import { useComplaintStore } from '@/stores/complaint-store'
import { useDiagnosisStore } from '@/stores/diagnosis-store'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Building, Shield, Pill, Database, KeyRound,
  Search, Plus, Trash2, Pencil, X, FileText, Download,
  ListChecks, Clock, Calendar, UserRound, LayoutTemplate
} from 'lucide-react'

const tabs = [
  { id: 'clinic', label: 'Clinic Profile', icon: Building },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'medicine-history', label: 'Medicine History', icon: Pill },
  { id: 'master-data', label: 'Master Data', icon: ListChecks },
  { id: 'patient-history', label: 'Patient History', icon: UserRound },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'backup', label: 'Backup & Sync', icon: Database },
  { id: 'license', label: 'License', icon: KeyRound },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('clinic')
  const { clinic, security, updateClinic, updateSecurity } = useSettingsStore()
  const { licenseKey, demoMode } = useAuthStore()
  const { addToast } = useUIStore()

  return (
    <div className="flex h-full">
      <div className="w-[240px] bg-white border-r border-border p-5 overflow-y-auto flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 flex items-center gap-2',
              activeTab === tab.id
                ? 'bg-primary-50 text-primary font-bold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 overflow-y-auto min-w-0">
        {activeTab === 'clinic' && <ClinicTab clinic={clinic} updateClinic={updateClinic} addToast={addToast} />}
        {activeTab === 'security' && <SecurityTab security={security} updateSecurity={updateSecurity} addToast={addToast} />}
        {activeTab === 'medicine-history' && <MedicineHistoryTab />}
        {activeTab === 'master-data' && <MasterDataTab />}
        {activeTab === 'patient-history' && <PatientHistoryTab />}
        {activeTab === 'templates' && <TemplatesTab addToast={addToast} />}
        {activeTab === 'backup' && <BackupTab addToast={addToast} />}
        {activeTab === 'license' && <LicenseTab licenseKey={licenseKey} demoMode={demoMode} addToast={addToast} />}
      </div>
    </div>
  )
}

/* ===================== CLINIC TAB ===================== */
function ClinicTab({ clinic, updateClinic, addToast }: any) {
  return (
    <div className="bg-white border border-border rounded-xl p-5 mb-5 shadow-sm max-w-[680px]">
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-900">
        <Building className="w-[18px] h-[18px]" /> Clinic Information
      </h3>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500">Clinic Name</label>
          <Input value={clinic.clinicName} onChange={(e) => updateClinic({ clinicName: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Doctor Name</label>
            <Input value={clinic.doctorName} onChange={(e) => updateClinic({ doctorName: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Qualifications</label>
            <Input value={clinic.doctorQual} onChange={(e) => updateClinic({ doctorQual: e.target.value })} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500">Registration Number</label>
          <Input value={clinic.regNo} onChange={(e) => updateClinic({ regNo: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500">Clinic Address</label>
          <Textarea value={clinic.address} onChange={(e) => updateClinic({ address: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500">Signature Text</label>
          <Input value={clinic.signature} onChange={(e) => updateClinic({ signature: e.target.value })} />
        </div>
      </div>
      <Button className="mt-4" onClick={() => addToast('Clinic settings updated', 'success')}>
        Save Changes
      </Button>
    </div>
  )
}

/* ===================== SECURITY TAB ===================== */
function SecurityTab({ security, updateSecurity, addToast }: any) {
  return (
    <>
      <div className="bg-white border border-border rounded-xl p-5 mb-5 shadow-sm max-w-[680px]">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-900">
          <Shield className="w-[18px] h-[18px]" /> Security Settings
        </h3>
        <ToggleItem label="Require PIN on startup" desc="Ask for 4-digit PIN every time app opens" checked={security.requirePin} onChange={() => updateSecurity({ requirePin: !security.requirePin })} />
        <ToggleItem label="Auto-lock after inactivity" desc="Lock the app after 5 minutes of inactivity" checked={security.autoLock} onChange={() => updateSecurity({ autoLock: !security.autoLock })} />
        <ToggleItem label="Encrypt patient data" desc="All patient records are encrypted at rest" checked={security.encryptData} onChange={() => updateSecurity({ encryptData: !security.encryptData })} />
      </div>
      <div className="bg-white border border-border rounded-xl p-5 shadow-sm max-w-[680px]">
        <h3 className="text-sm font-bold mb-4 text-slate-900">Change PIN</h3>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-500">Current PIN</label><Input type="password" maxLength={4} placeholder="****" /></div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-500">New PIN</label><Input type="password" maxLength={4} placeholder="****" /></div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-500">Confirm New PIN</label><Input type="password" maxLength={4} placeholder="****" /></div>
        </div>
        <Button className="mt-4" onClick={() => addToast('PIN updated successfully', 'success')}>Update PIN</Button>
      </div>
    </>
  )
}

/* ===================== MEDICINE HISTORY TAB (Names + File Upload) ===================== */
function MedicineHistoryTab() {
  const { entries, addEntry, updateEntry, deleteEntry, searchEntries } = useMedicineHistoryStore()
  const { addToast } = useUIStore()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileType, setFileType] = useState<'pdf' | 'docx'>('pdf')
  const [fileData, setFileData] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = search ? searchEntries(search) : entries

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'pdf' && ext !== 'docx') {
      addToast('Only PDF and DOCX files are allowed', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setFileName(file.name)
      setFileType(ext as 'pdf' | 'docx')
      setFileData(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const openAdd = () => {
    setEditingId(null); setName(''); setFileName(''); setFileType('pdf'); setFileData(''); setShowModal(true)
  }
  const openEdit = (id: number) => {
    const e = entries.find(x => x.id === id)
    if (!e) return
    setEditingId(id); setName(e.name); setFileName(e.fileName || ''); setFileType(e.fileType || 'pdf'); setFileData(e.fileData || ''); setShowModal(true)
  }
  const handleSave = () => {
    if (!name.trim()) { addToast('Please enter medicine name', 'error'); return }
    const file = fileName ? { fileName, fileType, fileData } : undefined
    if (editingId) {
      updateEntry(editingId, name, file)
      addToast('Medicine updated', 'success')
    } else {
      addEntry(name, file)
      addToast('Medicine added', 'success')
    }
    setShowModal(false)
  }
  const handleDelete = (id: number) => { deleteEntry(id); addToast('Medicine deleted', 'info') }

  return (
    <div className="max-w-[800px]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900"><Pill className="w-[18px] h-[18px]" /> Medicine History</h3>
          <p className="text-xs text-slate-400 mt-0.5">Master list of medicines with optional reference documents</p>
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add Medicine</Button>
      </div>
      <div className="flex items-center gap-2.5 bg-bg border border-border rounded-xl px-4 py-2 w-full max-w-sm mb-4">
        <Search className="w-[18px] h-[18px] text-slate-400" />
        <Input className="bg-transparent border-none shadow-none focus-visible:ring-0 px-0 py-0 text-sm w-full" placeholder="Search medicines..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead><tr className="bg-bg">
            <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Medicine Name</th>
            <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Reference Doc</th>
            <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Added On</th>
            <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.length > 0 ? filtered.map(e => (
              <tr key={e.id} className="hover:bg-slate-50 transition-all">
                <td className="px-4 py-3.5 text-sm border-b border-slate-50 font-semibold">{e.name}</td>
                <td className="px-4 py-3.5 text-sm border-b border-slate-50">
                  {e.fileName ? (
                    <div className="flex items-center gap-2">
                      <FileText className={cn("w-4 h-4", e.fileType === 'pdf' ? 'text-danger' : 'text-primary')} />
                      <span className="text-xs text-slate-600 truncate max-w-[120px]">{e.fileName}</span>
                      <Badge variant={e.fileType === 'pdf' ? 'danger' : 'default'} className="text-[0.65rem]">{e.fileType?.toUpperCase()}</Badge>
                    </div>
                  ) : <span className="text-xs text-slate-400">-</span>}
                </td>
                <td className="px-4 py-3.5 text-sm border-b border-slate-50 text-slate-400">{e.createdAt}</td>
                <td className="px-4 py-3.5 text-sm border-b border-slate-50">
                  <div className="flex gap-1">
                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all" onClick={() => openEdit(e.id)} title="Edit"><Pencil className="w-4 h-4" /></button>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-danger-50 hover:text-danger transition-all" onClick={() => handleDelete(e.id)} title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">No medicines found. Click "Add Medicine" to create one.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Medicine' : 'Add Medicine'} footer={<><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSave}>{editingId ? 'Update' : 'Save'}</Button></>}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Medicine Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Amoxicillin" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Reference Document (PDF or DOCX)</label>
            <div className="flex items-center gap-2">
              <input type="file" ref={fileInputRef} accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-shrink-0"><Download className="w-4 h-4" /> Choose File</Button>
              {fileName ? (
                <div className="flex items-center gap-2 bg-bg px-3 py-2 rounded-md border border-border flex-1 min-w-0">
                  <FileText className={cn("w-4 h-4", fileType === 'pdf' ? 'text-danger' : 'text-primary')} />
                  <span className="text-sm text-slate-700 truncate">{fileName}</span>
                  <button className="ml-auto text-slate-400 hover:text-danger" onClick={() => { setFileName(''); setFileType('pdf'); setFileData('') }}><X className="w-4 h-4" /></button>
                </div>
              ) : <span className="text-xs text-slate-400">No file selected</span>}
            </div>
            <p className="text-xs text-slate-400">Upload a reference document (PDF/DOCX) for this medicine</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}

/* ===================== MASTER DATA TAB (Dosage, Frequency, Duration) ===================== */
function MasterDataTab() {
  const { items: dosages, addItem: addDosage, updateItem: updateDosage, deleteItem: deleteDosage } = useDosageStore()
  const { items: frequencies, addItem: addFreq, updateItem: updateFreq, deleteItem: deleteFreq } = useFrequencyStore()
  const { items: durations, addItem: addDur, updateItem: updateDur, deleteItem: deleteDur } = useDurationStore()
  const { items: complaints, addItem: addComplaint, updateItem: updateComplaint, deleteItem: deleteComplaint } = useComplaintStore()
  const { items: diagnoses, addItem: addDiagnosis, updateItem: updateDiagnosis, deleteItem: deleteDiagnosis } = useDiagnosisStore()
  const { addToast } = useUIStore()
  const [activeSubTab, setActiveSubTab] = useState<'dosage' | 'frequency' | 'duration' | 'complaint' | 'diagnosis'>('dosage')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [value, setValue] = useState('')

  const config = {
    dosage: { label: 'Dosage', items: dosages, add: addDosage, update: updateDosage, delete: deleteDosage, placeholder: 'e.g. 500mg', key: 'dosage' as const },
    frequency: { label: 'Frequency', items: frequencies, add: addFreq, update: updateFreq, delete: deleteFreq, placeholder: 'e.g. 3 times daily', key: 'frequency' as const },
    duration: { label: 'Duration', items: durations, add: addDur, update: updateDur, delete: deleteDur, placeholder: 'e.g. 7 days', key: 'duration' as const },
    complaint: { label: 'Chief Complaint', items: complaints, add: addComplaint, update: updateComplaint, delete: deleteComplaint, placeholder: 'e.g. Fever, cough since 3 days', key: 'complaint' as const },
    diagnosis: { label: 'Diagnosis', items: diagnoses, add: addDiagnosis, update: updateDiagnosis, delete: deleteDiagnosis, placeholder: 'e.g. Upper Respiratory Tract Infection', key: 'diagnosis' as const },
  }

  const current = config[activeSubTab]

  const openAdd = () => { setEditingId(null); setValue(''); setShowModal(true) }
  const openEdit = (id: number) => {
    const item = current.items.find(x => x.id === id)
    if (!item) return
    setEditingId(id)
    setValue((item as any)[config[activeSubTab].key])
    setShowModal(true)
  }
  const handleSave = () => {
    if (!value.trim()) { addToast(`Please enter ${current.label.toLowerCase()}`, 'error'); return }
    if (editingId) {
      current.update(editingId, value)
      addToast(`${current.label} updated`, 'success')
    } else {
      current.add(value)
      addToast(`${current.label} added`, 'success')
    }
    setShowModal(false)
  }
  const handleDelete = (id: number) => {
    current.delete(id)
    addToast(`${current.label} deleted`, 'info')
  }

  return (
    <div className="max-w-[700px]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900"><ListChecks className="w-[18px] h-[18px]" /> Master Data</h3>
          <p className="text-xs text-slate-400 mt-0.5">Manage dosage, frequency, duration, chief complaints and diagnosis master lists</p>
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add {current.label}</Button>
      </div>

      <div className="flex gap-1 mb-4 bg-bg p-1 rounded-lg border border-border w-fit">
        {(['dosage', 'frequency', 'duration', 'complaint', 'diagnosis'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveSubTab(t)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize',
              activeSubTab === t ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead><tr className="bg-bg">
            <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">{current.label}</th>
            <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Actions</th>
          </tr></thead>
          <tbody>
            {current.items.length > 0 ? current.items.map(item => {
              const label = (item as any)[current.key]
              return (
                <tr key={item.id} className="hover:bg-slate-50 transition-all">
                  <td className="px-4 py-3.5 text-sm border-b border-slate-50 font-semibold">{label}</td>
                  <td className="px-4 py-3.5 text-sm border-b border-slate-50">
                    <div className="flex gap-1">
                      <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all" onClick={() => openEdit(item.id)} title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-danger-50 hover:text-danger transition-all" onClick={() => handleDelete(item.id)} title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )
            }) : (
              <tr><td colSpan={2} className="px-4 py-8 text-center text-sm text-slate-400">No {current.label.toLowerCase()} entries found. Click "Add {current.label}" to create one.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? `Edit ${current.label}` : `Add ${current.label}`} footer={<><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSave}>{editingId ? 'Update' : 'Save'}</Button></>}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">{current.label} *</label>
            <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={current.placeholder} />
          </div>
        </div>
      </Modal>
    </div>
  )
}

/* ===================== PATIENT HISTORY TAB (with dropdowns) ===================== */
function PatientHistoryTab() {
  const { entries, addEntry, updateEntry, deleteEntry, searchEntries } = usePatientHistoryStore()
  const { items: dosages } = useDosageStore()
  const { items: frequencies } = useFrequencyStore()
  const { items: durations } = useDurationStore()
  const { addToast } = useUIStore()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ patientName: '', medicineName: '', dosageId: 0, frequencyId: 0, durationId: 0, date: '', diagnosis: '', notes: '' })

  const filtered = search ? searchEntries(search) : entries

  const openAdd = () => {
    setEditingId(null)
    setForm({ patientName: '', medicineName: '', dosageId: dosages[0]?.id || 0, frequencyId: frequencies[0]?.id || 0, durationId: durations[0]?.id || 0, date: new Date().toISOString().split('T')[0], diagnosis: '', notes: '' })
    setShowModal(true)
  }
  const openEdit = (id: number) => {
    const e = entries.find(x => x.id === id)
    if (!e) return
    setEditingId(id)
    setForm({ patientName: e.patientName, medicineName: e.medicineName, dosageId: e.dosageId, frequencyId: e.frequencyId, durationId: e.durationId, date: e.date, diagnosis: e.diagnosis, notes: e.notes || '' })
    setShowModal(true)
  }
  const handleSave = () => {
    if (!form.patientName.trim()) { addToast('Please enter patient name', 'error'); return }
    if (!form.medicineName.trim()) { addToast('Please enter medicine name', 'error'); return }
    if (!form.date.trim()) { addToast('Please enter date', 'error'); return }
    if (editingId) { updateEntry(editingId, { ...form }); addToast('Patient history updated', 'success') }
    else { addEntry({ ...form }); addToast('Patient history added', 'success') }
    setShowModal(false)
  }
  const handleDelete = (id: number) => { deleteEntry(id); addToast('Patient history deleted', 'info') }

  const getLabel = (items: any[], id: number, key: string) => {
    const item = items.find(i => i.id === id)
    return item ? (item as any)[key] : '-'
  }

  return (
    <div className="max-w-[1000px]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900"><UserRound className="w-[18px] h-[18px]" /> Patient History</h3>
          <p className="text-xs text-slate-400 mt-0.5">Track medicine history per patient with dosage details from master lists</p>
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add Record</Button>
      </div>
      <div className="flex items-center gap-2.5 bg-bg border border-border rounded-xl px-4 py-2 w-full max-w-sm mb-4">
        <Search className="w-[18px] h-[18px] text-slate-400" />
        <Input className="bg-transparent border-none shadow-none focus-visible:ring-0 px-0 py-0 text-sm w-full" placeholder="Search patients or medicines..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead><tr className="bg-bg">
            <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Patient</th>
            <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Medicine</th>
            <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Dosage</th>
            <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Frequency</th>
            <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Duration</th>
            <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Date</th>
            <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Diagnosis</th>
            <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.length > 0 ? filtered.map(e => (
              <tr key={e.id} className="hover:bg-slate-50 transition-all">
                <td className="px-4 py-3.5 text-sm border-b border-slate-50 font-semibold">{e.patientName}</td>
                <td className="px-4 py-3.5 text-sm border-b border-slate-50">{e.medicineName}</td>
                <td className="px-4 py-3.5 text-sm border-b border-slate-50">{getLabel(dosages, e.dosageId, 'dosage')}</td>
                <td className="px-4 py-3.5 text-sm border-b border-slate-50">{getLabel(frequencies, e.frequencyId, 'frequency')}</td>
                <td className="px-4 py-3.5 text-sm border-b border-slate-50">{getLabel(durations, e.durationId, 'duration')}</td>
                <td className="px-4 py-3.5 text-sm border-b border-slate-50 text-slate-500">{e.date}</td>
                <td className="px-4 py-3.5 text-sm border-b border-slate-50 max-w-[140px] truncate">{e.diagnosis}</td>
                <td className="px-4 py-3.5 text-sm border-b border-slate-50">
                  <div className="flex gap-1">
                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all" onClick={() => openEdit(e.id)} title="Edit"><Pencil className="w-4 h-4" /></button>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-danger-50 hover:text-danger transition-all" onClick={() => handleDelete(e.id)} title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400">No patient history records found. Click "Add Record" to create one.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Patient History' : 'Add Patient History'} footer={<><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSave}>{editingId ? 'Update' : 'Save'}</Button></>}>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-500">Patient Name *</label><Input value={form.patientName} onChange={(e) => setForm({...form, patientName: e.target.value})} placeholder="e.g. Rajesh Kumar" /></div>
            <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-500">Date *</label><Input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} /></div>
          </div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-500">Medicine Name *</label><Input value={form.medicineName} onChange={(e) => setForm({...form, medicineName: e.target.value})} placeholder="e.g. Amoxicillin" /></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Dosage *</label>
              <select className="flex w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm shadow-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary-100" value={form.dosageId} onChange={(e) => setForm({...form, dosageId: Number(e.target.value)})}>
                {dosages.map(d => <option key={d.id} value={d.id}>{d.dosage}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Frequency *</label>
              <select className="flex w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm shadow-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary-100" value={form.frequencyId} onChange={(e) => setForm({...form, frequencyId: Number(e.target.value)})}>
                {frequencies.map(f => <option key={f.id} value={f.id}>{f.frequency}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Duration *</label>
              <select className="flex w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm shadow-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary-100" value={form.durationId} onChange={(e) => setForm({...form, durationId: Number(e.target.value)})}>
                {durations.map(d => <option key={d.id} value={d.id}>{d.duration}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-500">Diagnosis</label><Input value={form.diagnosis} onChange={(e) => setForm({...form, diagnosis: e.target.value})} placeholder="e.g. Upper Respiratory Tract Infection" /></div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-500">Notes</label><Textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} placeholder="Additional notes..." rows={3} /></div>
        </div>
      </Modal>
    </div>
  )
}

/* ===================== TEMPLATES TAB ===================== */
function TemplatesTab({ addToast }: any) {
  return (
    <div className="bg-white border border-border rounded-xl p-5 shadow-sm max-w-[680px]">
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-900">
        <LayoutTemplate className="w-[18px] h-[18px]" /> Default Template Preferences
      </h3>
      <ToggleItem label="Auto-apply last template" desc="Automatically select the last used template" checked={false} onChange={() => {}} />
      <ToggleItem label="Show generic names" desc="Display generic medicine names on prescriptions" checked={true} onChange={() => {}} />
    </div>
  )
}

/* ===================== BACKUP TAB ===================== */
function BackupTab({ addToast }: any) {
  return (
    <div className="bg-white border border-border rounded-xl p-5 shadow-sm max-w-[680px]">
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-900">
        <Database className="w-[18px] h-[18px]" /> Backup & Sync
      </h3>
      <ToggleItem label="Auto-backup to cloud" desc="Automatically backup data every 24 hours" checked={true} onChange={() => {}} />
      <ToggleItem label="Sync across devices" desc="Keep data synchronized on all your devices" checked={true} onChange={() => {}} />
      <div className="mt-4 flex gap-2">
        <Button onClick={() => addToast('Backup started...', 'info')}>Backup Now</Button>
        <Button variant="outline" onClick={() => addToast('Restore feature coming soon', 'info')}>Restore</Button>
      </div>
    </div>
  )
}

/* ===================== LICENSE TAB ===================== */
function LicenseTab({ licenseKey, demoMode, addToast }: any) {
  return (
    <div className="bg-white border border-border rounded-xl p-5 shadow-sm max-w-[680px]">
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-900">
        <KeyRound className="w-[18px] h-[18px]" /> License Information
      </h3>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500">License Key</label>
          <Input value={demoMode ? 'DEMO-MODE-XXXX' : licenseKey || 'PR-ABCD-1234-EFGH'} readOnly className="bg-slate-50 text-slate-500" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500">Plan</label>
          <Input value={demoMode ? 'Demo (14 days)' : 'Professional (Annual)'} readOnly className="bg-slate-50 text-slate-500" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500">Expires On</label>
          <Input value="December 31, 2026" readOnly className="bg-slate-50 text-slate-500" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={() => addToast('License validated successfully', 'success')}>Verify License</Button>
        <Button variant="outline" onClick={() => addToast('Contact support for renewal', 'info')}>Renew License</Button>
      </div>
    </div>
  )
}

/* ===================== TOGGLE ITEM ===================== */
function ToggleItem({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-50 gap-4">
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-semibold mb-0.5">{label}</h4>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
      <button className={cn('toggle flex-shrink-0', checked && 'active')} onClick={onChange} />
    </div>
  )
}
