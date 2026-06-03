'use client'

import { useState, useRef, useEffect } from 'react'
import { useSettingsStore } from '@/stores/settings-store'
import { useAuthStore } from '@/stores/auth-store'
import { useMedicineHistoryStore } from '@/stores/medicine-history-store'
import { useDosageFrequencyStore } from '@/stores/dosage-frequency-store'
import { usePatientHistoryStore } from '@/stores/patient-history-store'
import { usePatientStore } from '@/stores/patient-store'
import { useDosageStore } from '@/stores/dosage-store'
import { useFrequencyStore } from '@/stores/frequency-store'
import { useDurationStore } from '@/stores/duration-store'
import { useComplaintStore } from '@/stores/complaint-store'
import { useDiagnosisStore } from '@/stores/diagnosis-store'

import { useUIStore } from '@/stores/ui-store'
import { autocompleteApi, backupApi, authApi, mastersApi, type AuthState, type LicenceStatus } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Building, Shield, Pill, Database, KeyRound,
  Search, Plus, Trash2, Trash, Pencil, X, FileText, Download, Save, Upload,
  ListChecks, Clock, Calendar, UserRound, LayoutTemplate, RefreshCw
} from 'lucide-react'

const tabs = [
  { id: 'clinic', label: 'Clinic Profile', icon: Building },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'medicine-history', label: 'Medicine History', icon: Pill },
  { id: 'master-data', label: 'Master Data', icon: ListChecks },
  { id: 'patient-history', label: 'Patient History', icon: UserRound },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'footer', label: 'Prescription Footer', icon: FileText },
  { id: 'backup', label: 'Backup & Sync', icon: Database },
  { id: 'license', label: 'License', icon: KeyRound },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('clinic')
  const { clinic, security, templateStyle, updateClinic, updateSecurity } = useSettingsStore()
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
        {activeTab === 'templates' && <TemplatesTab templateStyle={templateStyle} addToast={addToast} />}
        {activeTab === 'footer' && <FooterTab addToast={addToast} />}
        {activeTab === 'backup' && <BackupTab addToast={addToast} demoMode={demoMode} />}
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
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Specialization</label>
            <Input value={clinic.specialization} onChange={(e) => updateClinic({ specialization: e.target.value })} placeholder="e.g. Chest Physician" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Registration Number</label>
            <Input value={clinic.regNo} onChange={(e) => updateClinic({ regNo: e.target.value })} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500">Clinic Address Line 1</label>
          <Input value={clinic.clinicAddressLine1} onChange={(e) => updateClinic({ clinicAddressLine1: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500">Clinic Address Line 2</label>
          <Input value={clinic.clinicAddressLine2} onChange={(e) => updateClinic({ clinicAddressLine2: e.target.value })} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">City</label>
            <Input value={clinic.city} onChange={(e) => updateClinic({ city: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">State</label>
            <Input value={clinic.state} onChange={(e) => updateClinic({ state: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Pincode</label>
            <Input value={clinic.pincode} onChange={(e) => updateClinic({ pincode: e.target.value })} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500">Country</label>
          <Input value={clinic.country} onChange={(e) => updateClinic({ country: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Phone</label>
            <Input value={clinic.phone} onChange={(e) => updateClinic({ phone: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Email</label>
            <Input type="email" value={clinic.email} onChange={(e) => updateClinic({ email: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Website</label>
            <Input value={clinic.website} onChange={(e) => updateClinic({ website: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Default Language</label>
            <Input value={clinic.defaultLanguage} onChange={(e) => updateClinic({ defaultLanguage: e.target.value })} placeholder="e.g. en, ml" />
          </div>
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
  const { entries, addEntry, updateEntry, deleteEntry, deleteEntries, searchEntries, syncFromApi } = useMedicineHistoryStore()
  const { addToast } = useUIStore()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileType, setFileType] = useState<'pdf' | 'docx'>('pdf')
  const [fileData, setFileData] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Bulk upload state
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkFileName, setBulkFileName] = useState('')
  const [bulkFileType, setBulkFileType] = useState<'pdf' | 'docx'>('pdf')
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const bulkFileInputRef = useRef<HTMLInputElement>(null)

  // Bulk delete state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)

  const filtered = search ? searchEntries(search) : entries

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(e => e.id)))
    }
  }

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
  const handleSave = async () => {
    if (!name.trim()) { addToast('Please enter medicine name', 'error'); return }
    const file = fileName ? { fileName, fileType, fileData } : undefined
    if (editingId) {
      await updateEntry(editingId, name, file)
      addToast('Medicine updated', 'success')
    } else {
      await addEntry(name, file)
      addToast('Medicine added', 'success')
    }
    setShowModal(false)
  }

  // Bulk upload handlers
  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'pdf' && ext !== 'docx') {
      addToast('Only PDF and DOCX files are allowed', 'error')
      return
    }
    setBulkFile(file)
    setBulkFileName(file.name)
    setBulkFileType(ext as 'pdf' | 'docx')
  }

  const handleBulkUpload = async () => {
    if (!bulkFile) { addToast('Please select a file', 'error'); return }
    setBulkLoading(true)
    try {
      const res = await autocompleteApi.bulkUploadMedicines(bulkFile)
      addToast(`${res.inserted} medicines imported, ${res.skipped} skipped`, 'success')
      // Refresh list from API
      const medicines = await autocompleteApi.medicines()
      syncFromApi(medicines || [])
      setShowBulkModal(false)
      setBulkFile(null)
      setBulkFileName('')
      setBulkFileType('pdf')
    } catch (err: any) {
      addToast(err.message || 'Upload failed', 'error')
    } finally {
      setBulkLoading(false)
    }
  }

  // Delete handlers
  const handleDeleteConfirm = async () => {
    if (deleteId == null) return
    await deleteEntry(deleteId)
    addToast('Medicine deleted', 'info')
    setDeleteId(null)
  }

  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    await deleteEntries(ids)
    addToast(`${ids.length} medicines deleted`, 'info')
    setSelectedIds(new Set())
    setShowBulkDeleteModal(false)
  }

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length
  const someSelected = selectedIds.size > 0

  return (
    <div className="max-w-[800px]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900"><Pill className="w-[18px] h-[18px]" /> Medicine History</h3>
          <p className="text-xs text-slate-400 mt-0.5">Master list of medicines with optional reference documents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setShowBulkModal(true); setBulkFile(null); setBulkFileName(''); setBulkFileType('pdf'); }}>
            <Upload className="w-4 h-4" /> Bulk Upload
          </Button>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add Medicine</Button>
        </div>
      </div>
      <div className="flex items-center gap-2.5 bg-bg border border-border rounded-xl px-4 py-2 w-full max-w-sm mb-4">
        <Search className="w-[18px] h-[18px] text-slate-400" />
        <Input className="bg-transparent border-none shadow-none focus-visible:ring-0 px-0 py-0 text-sm w-full" placeholder="Search medicines..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {someSelected && (
        <div className="flex items-center gap-2 mb-3">
          <Button variant="danger" size="sm" onClick={() => setShowBulkDeleteModal(true)}>
            <Trash2 className="w-4 h-4" /> Delete Selected ({selectedIds.size})
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>Clear Selection</Button>
        </div>
      )}
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead><tr className="bg-bg">
            <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400 w-10">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                checked={allSelected}
                onChange={toggleSelectAll}
              />
            </th>
            <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Medicine Name</th>
            <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Reference Doc</th>
            <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Added On</th>
            <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.length > 0 ? filtered.map(e => (
              <tr key={e.id} className={cn("transition-all", selectedIds.has(e.id) ? "bg-primary-50" : "hover:bg-slate-50")}>
                <td className="px-4 py-3.5 border-b border-slate-50">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    checked={selectedIds.has(e.id)}
                    onChange={() => toggleSelect(e.id)}
                  />
                </td>
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
                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-danger-50 hover:text-danger transition-all" onClick={() => setDeleteId(e.id)} title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">No medicines found. Click "Add Medicine" to create one.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Add/Edit Modal */}
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
      {/* Bulk Upload Modal */}
      <Modal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} title="Bulk Upload Medicines" footer={
        <>
          <Button variant="ghost" onClick={() => setShowBulkModal(false)} disabled={bulkLoading}>Cancel</Button>
          <Button onClick={handleBulkUpload} disabled={bulkLoading || !bulkFile}>
            {bulkLoading ? 'Uploading...' : 'Upload'}
          </Button>
        </>
      }>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">
            Upload a PDF or DOCX file containing one medicine name per line. Duplicates will be skipped automatically.
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">File (PDF or DOCX)</label>
            <div className="flex items-center gap-2">
              <input type="file" ref={bulkFileInputRef} accept=".pdf,.docx" className="hidden" onChange={handleBulkFileChange} />
              <Button variant="outline" onClick={() => bulkFileInputRef.current?.click()} className="flex-shrink-0"><Upload className="w-4 h-4" /> Choose File</Button>
              {bulkFileName ? (
                <div className="flex items-center gap-2 bg-bg px-3 py-2 rounded-md border border-border flex-1 min-w-0">
                  <FileText className={cn("w-4 h-4", bulkFileType === 'pdf' ? 'text-danger' : 'text-primary')} />
                  <span className="text-sm text-slate-700 truncate">{bulkFileName}</span>
                  <button className="ml-auto text-slate-400 hover:text-danger" onClick={() => { setBulkFile(null); setBulkFileName(''); setBulkFileType('pdf') }}><X className="w-4 h-4" /></button>
                </div>
              ) : <span className="text-xs text-slate-400">No file selected</span>}
            </div>
          </div>
        </div>
      </Modal>
      {/* Single Delete Confirmation Modal */}
      <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Medicine" footer={
        <>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>Delete</Button>
        </>
      }>
        <p className="text-sm text-slate-600">Are you sure you want to delete this medicine? This action cannot be undone.</p>
      </Modal>
      {/* Bulk Delete Confirmation Modal */}
      <Modal isOpen={showBulkDeleteModal} onClose={() => setShowBulkDeleteModal(false)} title="Delete Selected Medicines" footer={
        <>
          <Button variant="ghost" onClick={() => setShowBulkDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleBulkDeleteConfirm}>Delete {selectedIds.size}</Button>
        </>
      }>
        <p className="text-sm text-slate-600">Are you sure you want to delete {selectedIds.size} selected medicine{selectedIds.size === 1 ? '' : 's'}? This action cannot be undone.</p>
      </Modal>
    </div>
  )
}

/* ===================== MASTER DATA TAB (Dosage, Frequency, Duration) ===================== */
function MasterDataTab() {
  const { items: dosages, addItem: addDosage, updateItem: updateDosage, deleteItem: deleteDosage, clearAll: clearDosages } = useDosageStore()
  const { items: frequencies, addItem: addFreq, updateItem: updateFreq, deleteItem: deleteFreq, clearAll: clearFrequencies } = useFrequencyStore()
  const { items: durations, addItem: addDur, updateItem: updateDur, deleteItem: deleteDur, clearAll: clearDurations } = useDurationStore()
  const { items: complaints, addItem: addComplaint, updateItem: updateComplaint, deleteItem: deleteComplaint, clearAll: clearComplaints } = useComplaintStore()
  const { items: diagnoses, addItem: addDiagnosis, updateItem: updateDiagnosis, deleteItem: deleteDiagnosis, clearAll: clearDiagnoses } = useDiagnosisStore()
  const { entries: medicineEntries, clearAll: clearMedicines } = useMedicineHistoryStore()
  const { entries: dfEntries, clearAll: clearDosageFreq } = useDosageFrequencyStore()
  const { addToast } = useUIStore()
  const [activeSubTab, setActiveSubTab] = useState<'dosage' | 'frequency' | 'duration' | 'complaint' | 'diagnosis'>('dosage')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [value, setValue] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearing, setClearing] = useState(false)

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
  const handleSave = async () => {
    if (!value.trim()) { addToast(`Please enter ${current.label.toLowerCase()}`, 'error'); return }
    if (editingId) {
      await current.update(editingId, value)
      addToast(`${current.label} updated`, 'success')
    } else {
      await current.add(value)
      addToast(`${current.label} added`, 'success')
    }
    setShowModal(false)
  }
  const handleDelete = async (id: number) => {
    await current.delete(id)
    addToast(`${current.label} deleted`, 'info')
  }

  const handleClearAll = async () => {
    setClearing(true)
    try {
      await mastersApi.flush()
      clearDosages()
      clearFrequencies()
      clearDurations()
      clearComplaints()
      clearDiagnoses()
      clearMedicines()
      clearDosageFreq()
      addToast('All master data cleared successfully', 'success')
    } catch (err: any) {
      addToast(err.message || 'Failed to clear master data', 'error')
    } finally {
      setClearing(false)
      setShowClearConfirm(false)
    }
  }

  const totalCount = dosages.length + frequencies.length + durations.length + complaints.length + diagnoses.length + medicineEntries.length + dfEntries.length

  return (
    <div className="max-w-[700px]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900"><ListChecks className="w-[18px] h-[18px]" /> Master Data</h3>
          <p className="text-xs text-slate-400 mt-0.5">Manage dosage, frequency, duration, chief complaints and diagnosis master lists</p>
        </div>
        <div className="flex gap-2">
          {totalCount > 0 && (
            <Button variant="outline" onClick={() => setShowClearConfirm(true)} className="text-danger border-danger/30 hover:bg-red-50 hover:text-danger">
              <Trash className="w-4 h-4" /> Clear All
            </Button>
          )}
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add {current.label}</Button>
        </div>
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

      {/* Clear All Confirmation */}
      <Modal isOpen={showClearConfirm} onClose={() => setShowClearConfirm(false)} title="Clear All Master Data?" footer={
        <>
          <Button variant="ghost" onClick={() => setShowClearConfirm(false)} disabled={clearing}>Cancel</Button>
          <Button variant="danger" onClick={handleClearAll} disabled={clearing}>
            {clearing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
            <span className="ml-2">{clearing ? 'Clearing...' : 'Clear All'}</span>
          </Button>
        </>
      }>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-slate-600">
            This will permanently delete all master data entries:
          </p>
          <ul className="text-sm text-slate-500 list-disc list-inside space-y-1">
            <li>Dosages ({dosages.length})</li>
            <li>Frequencies ({frequencies.length})</li>
            <li>Durations ({durations.length})</li>
            <li>Chief Complaints ({complaints.length})</li>
            <li>Diagnoses ({diagnoses.length})</li>
            <li>Medicine Names ({medicineEntries.length})</li>
            <li>Dosage-Frequency Entries ({dfEntries.length})</li>
          </ul>
          <p className="text-sm text-danger font-medium">This action cannot be undone.</p>
        </div>
      </Modal>
    </div>
  )
}

/* ===================== PATIENT HISTORY TAB (with dropdowns) ===================== */
function PatientHistoryTab() {
  const { entries, addEntry, updateEntry, deleteEntry, searchEntries, syncFromApi } = usePatientHistoryStore()
  const { patients } = usePatientStore()
  const { items: dosages } = useDosageStore()
  const { items: frequencies } = useFrequencyStore()
  const { items: durations } = useDurationStore()
  const { addToast } = useUIStore()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState({ patientId: 0, medicineName: '', dosageId: 0, frequencyId: 0, durationId: 0, date: '', diagnosis: '', notes: '' })

  const filtered = search ? searchEntries(search) : entries

  // Resolve patient name for API-loaded entries that don't have patientName cached
  const getPatientName = (entry: typeof entries[0]) => {
    if (entry.patientName) return entry.patientName
    const p = patients.find((pt) => pt.id === entry.patient_id)
    return p?.name || `Patient #${entry.patient_id}`
  }

  const getLabel = (items: any[], id: number, key: string) => {
    const item = items.find(i => i.id === id)
    return item ? (item as any)[key] : '-'
  }

  const openAdd = () => {
    setEditingId(null)
    setForm({ patientId: patients[0]?.id || 0, medicineName: '', dosageId: dosages[0]?.id || 0, frequencyId: frequencies[0]?.id || 0, durationId: durations[0]?.id || 0, date: new Date().toISOString().split('T')[0], diagnosis: '', notes: '' })
    setShowModal(true)
  }
  const openEdit = (id: number) => {
    const e = entries.find(x => x.id === id)
    if (!e) return
    setEditingId(id)
    setForm({ patientId: e.patient_id || patients.find(p => p.name === e.patientName)?.id || 0, medicineName: e.medicineName, dosageId: e.dosageId, frequencyId: e.frequencyId, durationId: e.durationId, date: e.date, diagnosis: e.diagnosis, notes: e.notes || '' })
    setShowModal(true)
  }
  const handleSave = async () => {
    const patient = patients.find(p => p.id === form.patientId)
    if (!patient) { addToast('Please select a patient', 'error'); return }
    if (!form.medicineName.trim()) { addToast('Please enter medicine name', 'error'); return }
    if (!form.date.trim()) { addToast('Please enter date', 'error'); return }

    const dosageText = getLabel(dosages, form.dosageId, 'dosage')
    const frequencyText = getLabel(frequencies, form.frequencyId, 'frequency')
    const durationText = getLabel(durations, form.durationId, 'duration')

    const payload = {
      patient_id: patient.id,
      patientName: patient.name,
      medicineName: form.medicineName.trim(),
      dosageId: form.dosageId,
      frequencyId: form.frequencyId,
      durationId: form.durationId,
      dosage: dosageText,
      frequency: frequencyText,
      duration: durationText,
      date: form.date,
      diagnosis: form.diagnosis,
      notes: form.notes,
    }

    if (editingId) {
      await updateEntry(editingId, payload)
      addToast('Patient history updated', 'success')
    } else {
      await addEntry(payload)
      addToast('Patient history added', 'success')
    }
    setShowModal(false)
  }
  const handleDeleteConfirm = async () => {
    if (deleteId == null) return
    await deleteEntry(deleteId)
    addToast('Patient history deleted', 'info')
    setDeleteId(null)
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
                <td className="px-4 py-3.5 text-sm border-b border-slate-50 font-semibold">{getPatientName(e)}</td>
                <td className="px-4 py-3.5 text-sm border-b border-slate-50">{e.medicineName}</td>
                <td className="px-4 py-3.5 text-sm border-b border-slate-50">{e.dosage || getLabel(dosages, e.dosageId, 'dosage')}</td>
                <td className="px-4 py-3.5 text-sm border-b border-slate-50">{e.frequency || getLabel(frequencies, e.frequencyId, 'frequency')}</td>
                <td className="px-4 py-3.5 text-sm border-b border-slate-50">{e.duration || getLabel(durations, e.durationId, 'duration')}</td>
                <td className="px-4 py-3.5 text-sm border-b border-slate-50 text-slate-500">{e.date}</td>
                <td className="px-4 py-3.5 text-sm border-b border-slate-50 max-w-[140px] truncate">{e.diagnosis}</td>
                <td className="px-4 py-3.5 text-sm border-b border-slate-50">
                  <div className="flex gap-1">
                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all" onClick={() => openEdit(e.id)} title="Edit"><Pencil className="w-4 h-4" /></button>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-danger-50 hover:text-danger transition-all" onClick={() => setDeleteId(e.id)} title="Delete"><Trash2 className="w-4 h-4" /></button>
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
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Patient *</label>
              <select className="flex w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm shadow-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary-100" value={form.patientId} onChange={(e) => setForm({...form, patientId: Number(e.target.value)})}>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
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
      <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Patient History" footer={
        <>
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>Delete</Button>
        </>
      }>
        <p className="text-sm text-slate-600">Are you sure you want to delete this patient history record? This action cannot be undone.</p>
      </Modal>
    </div>
  )
}

/* ===================== TEMPLATES TAB ===================== */
function TemplatesTab({ templateStyle, addToast }: any) {
  const { updateTemplateStyle } = useSettingsStore()
  return (
    <div className="bg-white border border-border rounded-xl p-5 shadow-sm max-w-[680px]">
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-900">
        <LayoutTemplate className="w-[18px] h-[18px]" /> Prescription Template Design
      </h3>
      <div className="flex flex-col gap-3 mb-5">
        <label className="text-xs font-semibold text-slate-500">Select Template</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => updateTemplateStyle('header-footer')}
            className={cn(
              'border rounded-lg p-4 text-left transition-all',
              templateStyle === 'header-footer'
                ? 'border-primary bg-primary-50 ring-1 ring-primary'
                : 'border-border hover:border-primary-light'
            )}
          >
            <div className="text-sm font-bold mb-1">Header + Footer</div>
            <div className="text-xs text-slate-400">Doctor details in header, consultation/address/phone in footer</div>
          </button>
          <button
            onClick={() => updateTemplateStyle('header-only')}
            className={cn(
              'border rounded-lg p-4 text-left transition-all',
              templateStyle === 'header-only'
                ? 'border-primary bg-primary-50 ring-1 ring-primary'
                : 'border-border hover:border-primary-light'
            )}
          >
            <div className="text-sm font-bold mb-1">Header Only</div>
            <div className="text-xs text-slate-400">Doctor details in header, no footer section</div>
          </button>
        </div>
      </div>
      <Button onClick={() => addToast('Template preference saved', 'success')}>Save Changes</Button>
    </div>
  )
}

/* ===================== FOOTER TAB ===================== */
function FooterTab({ addToast }: any) {
  const { prescriptionFooterHtml, updatePrescriptionFooterHtml } = useSettingsStore()
  const [html, setHtml] = useState(prescriptionFooterHtml)

  const handleSave = async () => {
    await updatePrescriptionFooterHtml(html)
    addToast('Prescription footer saved', 'success')
  }

  return (
    <div className="max-w-[700px]">
      <div className="mb-5">
        <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900"><FileText className="w-[18px] h-[18px]" /> Prescription Footer</h3>
        <p className="text-xs text-slate-400 mt-0.5">Enter HTML for the prescription footer. You can use inline styles for formatting.</p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500">Footer HTML</label>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder={'<div style="text-align:center;font-weight:bold;">DO NOT SUBSTITUTE MEDICINE</div>\n<div style="text-align:center;font-size:0.7rem;">Your address and contact info here</div>'}
            className="flex w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm shadow-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary-100 resize-y min-h-[200px] font-mono"
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}><Save className="w-4 h-4" /> Save Footer</Button>
        </div>
        {html && (
          <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 mb-2">Preview</div>
            <div className="border-t border-gray-200 pt-2 text-center text-[0.6rem] text-slate-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        )}
      </div>
    </div>
  )
}

/* ===================== BACKUP TAB ===================== */
function BackupTab({ addToast, demoMode }: { addToast: any; demoMode: boolean }) {
  const [status, setStatus] = useState<{
    last_backup_at?: string
    next_backup_due?: string
    db_path: string
    db_size_bytes: number
  } | null>(null)
  const [licenceStatus, setLicenceStatus] = useState<{
    valid: boolean
    grace_expired?: boolean
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const licenceLocked = !licenceStatus?.valid && !!licenceStatus?.grace_expired

  const fetchStatus = async () => {
    try {
      const [s, ls] = await Promise.all([
        backupApi.status().catch(() => null),
        authApi.status().catch(() => null),
      ])
      setStatus(s)
      setLicenceStatus(ls)
    } catch (err: any) {
      console.warn('Backup status failed:', err.message)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleBackup = async () => {
    setLoading(true)
    try {
      const electron = (window as any).electron
      if (electron?.backup?.create) {
        const result = await electron.backup.create()
        if (result.success) {
          addToast(`Backup saved to ${result.path}`, 'success')
          await fetchStatus()
        } else {
          addToast(result.error || 'Backup failed', 'error')
        }
      } else {
        addToast('Backup not available in browser mode', 'info')
      }
    } catch (err: any) {
      addToast(err.message || 'Backup failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async () => {
    const electron = (window as any).electron
    if (!electron?.fs?.selectFile) {
      addToast('Restore not available in browser mode', 'info')
      return
    }
    const result = await electron.fs.selectFile({
      filters: [{ name: 'SQLite Database', extensions: ['db'] }],
    })
    if (!result?.paths?.[0]) return

    setLoading(true)
    try {
      const res = await electron.backup.restore(result.paths[0])
      if (res.success) {
        addToast('Database restored successfully. Please restart the app.', 'success')
      } else {
        addToast(res.error || 'Restore failed', 'error')
      }
    } catch (err: any) {
      addToast(err.message || 'Restore failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="bg-white border border-border rounded-xl p-5 shadow-sm max-w-[680px]">
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-900">
        <Database className="w-[18px] h-[18px]" /> Backup & Sync
      </h3>

      {licenceLocked && (
        <div className="bg-danger-50 border border-danger/20 rounded-lg p-3 mb-4 text-sm text-danger">
          Backup is unavailable while your license is locked. Please renew your license.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs text-slate-500 mb-1">Database Size</div>
          <div className="text-sm font-semibold text-slate-900">{status ? formatBytes(status.db_size_bytes) : '—'}</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs text-slate-500 mb-1">Last Backup</div>
          <div className="text-sm font-semibold text-slate-900">
            {status?.last_backup_at ? new Date(status.last_backup_at).toLocaleString() : 'Never'}
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs text-slate-500 mb-1">Next Backup Due</div>
          <div className="text-sm font-semibold text-slate-900">
            {status?.next_backup_due ? new Date(status.next_backup_due).toLocaleDateString() : '—'}
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs text-slate-500 mb-1">Database Path</div>
          <div className="text-sm font-semibold text-slate-900 truncate" title={status?.db_path}>{status?.db_path ? status.db_path.split('/').pop() : '—'}</div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button onClick={handleBackup} disabled={loading || licenceLocked}>
          <Download className="w-4 h-4 mr-1.5" />
          {loading ? 'Working...' : 'Backup Now'}
        </Button>
        <Button variant="outline" onClick={handleRestore} disabled={loading || licenceLocked}>
          <Upload className="w-4 h-4 mr-1.5" />
          Restore
        </Button>
      </div>
    </div>
  )
}

/* ===================== LICENSE TAB ===================== */
function formatDate(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function daysUntil(iso?: string) {
  if (!iso) return null
  const diff = new Date(iso).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function maskKey(key: string) {
  if (!key || key.length < 12) return key
  return key.slice(0, 8) + '••••••••'
}

/* ===================== APP UPDATES SECTION ===================== */
function AppUpdatesSection({ addToast }: { addToast: any }) {
  const [updateState, setUpdateState] = useState<'idle' | 'checking' | 'available' | 'downloaded' | 'error'>('idle')
  const [updateVersion, setUpdateVersion] = useState('')
  const [isElectron, setIsElectron] = useState(false)

  useEffect(() => {
    setIsElectron(typeof window !== 'undefined' && !!window.electron)
  }, [])

  const handleCheck = async () => {
    if (!window.electron?.updater) {
      addToast('Auto-updater is not available', 'error')
      return
    }
    setUpdateState('checking')
    try {
      const result = await window.electron.updater.check()
      if (!result.success) {
        setUpdateState('error')
        addToast(result.error || 'Update check failed', 'error')
        return
      }
      if (result.updateInfo && result.updateInfo.version) {
        setUpdateVersion(result.updateInfo.version)
        setUpdateState('available')
        addToast(`Update ${result.updateInfo.version} available — downloading...`, 'success')
      } else {
        setUpdateState('idle')
        addToast('You are on the latest version', 'success')
      }
    } catch (err: any) {
      setUpdateState('error')
      addToast(err.message || 'Update check failed', 'error')
    }
  }

  const handleInstall = () => {
    if (window.electron?.updater) {
      window.electron.updater.install()
    }
  }

  if (!isElectron) {
    return (
      <div className="bg-slate-50 border border-border rounded-xl p-5">
        <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 mb-2">
          <Download className="w-[18px] h-[18px]" /> App Updates
        </h3>
        <p className="text-xs text-slate-500">
          Auto-updates are only available in the desktop app.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900">
          <Download className="w-[18px] h-[18px]" /> App Updates
        </h3>
        <Badge variant={updateState === 'available' || updateState === 'downloaded' ? 'warning' : 'default'}>
          {updateState === 'idle' && 'Up to date'}
          {updateState === 'checking' && 'Checking...'}
          {updateState === 'available' && `${updateVersion} available`}
          {updateState === 'downloaded' && 'Ready to install'}
          {updateState === 'error' && 'Check failed'}
        </Badge>
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Prescribo checks for updates automatically. You can also check manually below.
      </p>

      <div className="flex gap-2">
        {updateState === 'downloaded' ? (
          <Button size="sm" onClick={handleInstall}>
            <RefreshCw className="w-4 h-4" />
            <span className="ml-2">Restart to Update</span>
          </Button>
        ) : (
          <Button size="sm" onClick={handleCheck} disabled={updateState === 'checking'}>
            {updateState === 'checking' ? (
              <Clock className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="ml-2">{updateState === 'checking' ? 'Checking...' : 'Check for Updates'}</span>
          </Button>
        )}
      </div>
    </div>
  )
}

/* ===================== LICENSE TAB ===================== */
function LicenseTab({ licenseKey, demoMode, addToast }: { licenseKey: string; demoMode: boolean; addToast: any }) {
  const [state, setState] = useState<AuthState | null>(null)
  const [status, setStatus] = useState<LicenceStatus | null>(null)
  const [checking, setChecking] = useState(false)

  const fetchLicenseInfo = async () => {
    try {
      const [s, st] = await Promise.all([
        authApi.state(),
        authApi.status(),
      ])
      setState(s)
      setStatus(st)
    } catch (err: any) {
      addToast('Failed to fetch license info', 'error')
    }
  }

  useEffect(() => {
    fetchLicenseInfo()
  }, [])

  const handleVerify = async () => {
    setChecking(true)
    try {
      await fetchLicenseInfo()
      addToast(status?.valid ? 'License is valid' : 'License issue detected', status?.valid ? 'success' : 'warning')
    } finally {
      setChecking(false)
    }
  }

  const handleRenew = async () => {
    setChecking(true)
    try {
      await authApi.refresh()
      await fetchLicenseInfo()
      addToast('License renewed successfully', 'success')
    } catch (err: any) {
      addToast(err.message || 'Renewal failed', 'error')
    } finally {
      setChecking(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authApi.logout()
      window.location.reload()
    } catch {
      window.location.reload()
    }
  }

  const isLocked = !status?.valid && !!status?.grace_expired
  const displayKey = demoMode ? 'DEMO-MODE-XXXX' : maskKey(state?.license_key || licenseKey || '')
  const planLabel = state?.plan || (demoMode ? 'demo' : '')
  const planDisplay = planLabel === 'individual' ? 'Individual' : planLabel === 'clinic' ? 'Clinic' : planLabel === 'demo' ? 'Demo' : '—'
  const statusLabel = status?.status === 'revoked' ? 'Revoked' : isLocked ? 'Locked' : status?.grace_expired ? 'Grace Period' : status?.access_expired ? 'Token Expired' : status?.valid ? 'Active' : 'Inactive'
  const statusDot = status?.status === 'revoked' || isLocked ? 'bg-danger' : status?.access_expired || status?.refresh_expired ? 'bg-warning' : 'bg-success'
  const statusText = status?.status === 'revoked' || isLocked ? 'text-danger' : status?.access_expired || status?.refresh_expired ? 'text-warning' : 'text-success'
  const accessDays = daysUntil(status?.access_expires_at)
  const refreshDays = daysUntil(status?.refresh_expires_at)
  const graceDays = status?.days_until_lock

  return (
    <div className="space-y-5 max-w-[680px]">
      {/* Demo Banner */}
      {demoMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">Demo Mode Active</p>
            <p className="text-xs text-amber-700 mt-0.5">
              You are using a 7-day demo. Activate a license key to unlock full features and remove demo restrictions.
            </p>
            <Button size="sm" className="mt-2 bg-amber-600 hover:bg-amber-700 text-white" onClick={() => window.location.href = '/activate'}>
              Activate License
            </Button>
          </div>
        </div>
      )}

      {/* Revoked Banner */}
      {status?.status === 'revoked' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-800">License Revoked</p>
            <p className="text-xs text-red-700 mt-0.5">
              This license has been revoked by the administrator. Please contact support or enter a new license key.
            </p>
            <Button size="sm" variant="outline" className="mt-2 border-red-300 text-red-700 hover:bg-red-100" onClick={() => window.location.href = '/activate'}>
              Enter New License Key
            </Button>
          </div>
        </div>
      )}

      {/* Server Message Banner */}
      {status?.message && !status.valid && status.status !== 'revoked' && !demoMode && (
        <div className="bg-danger-50 border border-danger/20 rounded-xl p-4 text-sm text-danger">
          {status.message}
        </div>
      )}

      {/* Main License Card */}
      <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900">
            <KeyRound className="w-[18px] h-[18px]" /> License Information
          </h3>
          <Badge variant={demoMode ? 'warning' : status?.valid ? 'success' : 'danger'}>
            {planDisplay}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* License Key */}
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">License Key</label>
            <div className="flex gap-2">
              <Input value={displayKey} readOnly className="bg-slate-50 text-slate-600 font-mono text-sm flex-1" />
              <Button variant="outline" size="sm" className="flex-shrink-0" onClick={() => {
                navigator.clipboard.writeText(state?.license_key || licenseKey)
                addToast('License key copied', 'success')
              }} disabled={demoMode}>
                Copy
              </Button>
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Status</label>
            <div className="flex items-center gap-2 bg-slate-50 border border-border rounded-md px-3 py-2">
              <span className={`w-2.5 h-2.5 rounded-full ${statusDot}`} />
              <span className={`text-sm font-semibold ${statusText}`}>{statusLabel}</span>
              {graceDays !== undefined && graceDays !== null && (
                <span className="text-xs text-slate-400 ml-auto">{graceDays}d until lock</span>
              )}
            </div>
          </div>

          {/* Activation Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Activated On</label>
            <div className="bg-slate-50 border border-border rounded-md px-3 py-2 text-sm text-slate-600">
              {formatDate(state?.activated_at)}
            </div>
          </div>

          {/* Access Token Expiry */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Access Token Expires</label>
            <div className="bg-slate-50 border border-border rounded-md px-3 py-2 text-sm text-slate-600">
              {formatDate(status?.access_expires_at)}
              {accessDays !== null && accessDays <= 3 && accessDays >= 0 && (
                <span className="text-xs text-danger font-medium ml-2">({accessDays}d left)</span>
              )}
            </div>
          </div>

          {/* Refresh Token Expiry */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Refresh Token Expires</label>
            <div className="bg-slate-50 border border-border rounded-md px-3 py-2 text-sm text-slate-600">
              {formatDate(status?.refresh_expires_at)}
              {refreshDays !== null && refreshDays <= 7 && refreshDays >= 0 && (
                <span className="text-xs text-warning font-medium ml-2">({refreshDays}d left)</span>
              )}
            </div>
          </div>

          {/* Grace Period */}
          {status?.grace_period_until && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Grace Period Ends</label>
              <div className="bg-slate-50 border border-border rounded-md px-3 py-2 text-sm text-slate-600">
                {formatDate(status.grace_period_until)}
              </div>
            </div>
          )}

          {/* Machine ID */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Machine ID</label>
            <div className="bg-slate-50 border border-border rounded-md px-3 py-2 text-xs text-slate-400 font-mono truncate" title={state?.machine_id || status?.machine_id}>
              {(state?.machine_id || status?.machine_id || '—').slice(0, 16)}…
            </div>
          </div>

          {/* Last Refreshed */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Last Refreshed</label>
            <div className="bg-slate-50 border border-border rounded-md px-3 py-2 text-sm text-slate-600">
              {formatDate(state?.last_refreshed_at)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 pt-4 border-t border-border flex flex-wrap gap-2">
          <Button onClick={handleVerify} disabled={checking} size="sm">
            {checking ? <Clock className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            <span className="ml-2">Verify</span>
          </Button>
          <Button variant="outline" onClick={handleRenew} disabled={checking || demoMode} size="sm">
            <RefreshCw className="w-4 h-4" />
            <span className="ml-2">Renew</span>
          </Button>
          {!demoMode && (
            <Button variant="ghost" onClick={handleLogout} disabled={checking} size="sm" className="text-danger hover:bg-red-50 hover:text-red-700 ml-auto">
              <Trash2 className="w-4 h-4" />
              <span className="ml-2">Deactivate</span>
            </Button>
          )}
        </div>
      </div>

      {/* App Updates */}
      <AppUpdatesSection addToast={addToast} />
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
