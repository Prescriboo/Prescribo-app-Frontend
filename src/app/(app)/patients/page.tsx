'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePatientStore } from '@/stores/patient-store'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Plus, Download, Eye, FilePlus, Search } from 'lucide-react'

export default function PatientsPage() {
  const router = useRouter()
  const { patients, addPatient } = usePatientStore()
  const { addToast } = useUIStore()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    name: '', age: '', gender: '', phone: '', email: '', allergies: '', conditions: ''
  })

  const filtered = search
    ? patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search))
    : patients

  const handleAdd = () => {
    if (!form.name.trim()) { addToast('Please enter patient name', 'error'); return }
    addPatient({
      name: form.name,
      age: form.age || '-',
      gender: form.gender || '-',
      phone: form.phone || '-',
      email: form.email,
      allergies: form.allergies,
      conditions: form.conditions,
    })
    addToast('Patient added successfully', 'success')
    setShowModal(false)
    setForm({ name: '', age: '', gender: '', phone: '', email: '', allergies: '', conditions: '' })
  }

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-5 flex-wrap gap-4">
        <h1 className="text-xl font-extrabold text-slate-900">Patients</h1>
        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative flex items-center gap-2.5 bg-white border border-border rounded-xl px-3 py-2 focus-within:border-primary-light focus-within:ring-3 focus-within:ring-primary-100 transition-all">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <Input
              type="text"
              className="bg-transparent border-none shadow-none focus-visible:ring-0 focus-visible:border-none px-0 py-0 text-sm w-48 text-slate-900 placeholder:text-slate-400"
              placeholder="Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => addToast('Export started...', 'info')}>
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" /> Add Patient
          </Button>
        </div>
      </div>
      <div className="mx-6 bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg">
                <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Patient</th>
                <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Age / Gender</th>
                <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Phone</th>
                <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Last Visit</th>
                <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Status</th>
                <th className="text-left px-4 py-3.5 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-all">
                  <td className="px-4 py-3.5 text-sm border-b border-slate-50"><strong>{p.name}</strong></td>
                  <td className="px-4 py-3.5 text-sm border-b border-slate-50">{p.age} / {p.gender}</td>
                  <td className="px-4 py-3.5 text-sm border-b border-slate-50">{p.phone}</td>
                  <td className="px-4 py-3.5 text-sm border-b border-slate-50">{p.lastVisit}</td>
                  <td className="px-4 py-3.5 text-sm border-b border-slate-50">
                    <Badge variant={p.status === 'Active' ? 'success' : 'warning'}>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3.5 text-sm border-b border-slate-50">
                    <div className="flex gap-1">
                      <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all" onClick={() => router.push(`/patients/${p.id}`)}><Eye className="w-4 h-4" /></button>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all" onClick={() => router.push(`/prescriptions?patient=${p.id}`)}><FilePlus className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Patient"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Save Patient</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Full Name *</label>
            <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Enter full name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Age</label>
              <Input type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} placeholder="Years" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">Gender</label>
              <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="flex w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm shadow-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary-100">
                <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Phone</label>
            <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 ..." />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Email</label>
            <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@example.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Allergies</label>
            <Input value={form.allergies} onChange={e => setForm({...form, allergies: e.target.value})} placeholder="e.g. Penicillin, Sulfa" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Medical Conditions</label>
            <Input value={form.conditions} onChange={e => setForm({...form, conditions: e.target.value})} placeholder="e.g. Diabetes, Hypertension" />
          </div>
        </div>
      </Modal>
    </div>
  )
}
