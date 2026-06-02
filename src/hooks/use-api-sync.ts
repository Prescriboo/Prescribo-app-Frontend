'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { checkApiHealth, isElectron, setApiBaseUrl, getApiBaseUrl } from '@/lib/api-config'
import { patientsApi, prescriptionsApi, settingsApi, autocompleteApi, mastersApi } from '@/lib/api'
import { usePatientStore } from '@/stores/patient-store'
import { usePrescriptionStore } from '@/stores/prescription-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useDosageStore } from '@/stores/dosage-store'
import { useFrequencyStore } from '@/stores/frequency-store'
import { useDurationStore } from '@/stores/duration-store'
import { useMedicineHistoryStore } from '@/stores/medicine-history-store'
import { useComplaintStore } from '@/stores/complaint-store'
import { useDiagnosisStore } from '@/stores/diagnosis-store'

export type ApiConnectionStatus = 'checking' | 'connected' | 'disconnected'

interface UseApiSyncReturn {
  status: ApiConnectionStatus
  backendVersion?: string
  lastError?: string
  refresh: () => Promise<void>
}

function mapApiPatient(p: any) {
  return {
    id: p.id,
    name: p.name,
    age: p.age || '',
    gender: p.gender || '',
    phone: p.phone || '',
    email: p.email || '',
    allergies: p.allergies || '',
    conditions: p.chronic_conditions || '',
    lastVisit: p.last_visit_date
      ? new Date(p.last_visit_date).toLocaleDateString()
      : 'Just now',
    status: (p.status === 'Active' ? 'Active' : 'Inactive') as 'Active' | 'Inactive',
    visits: p.visit_count || 0,
    rxCount: 0,
  }
}

function mapApiPrescription(r: any) {
  return {
    id: r.id,
    patientId: r.patient_id,
    patientName: r.patient_name || '',
    date: r.prescription_date || r.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    diagnosis: r.diagnosis || '',
    medicines: (r.medicine_rows || []).map((m: any) => ({
      name: m.medicine_name,
      dose: m.dosage || '',
      freq: m.frequency || '',
      dur: m.duration || '',
      inst: m.instructions || '',
    })),
    doctor: '',
    updateHistory: [] as { date: string; medicines: any[] }[],
  }
}

export function useApiSync(): UseApiSyncReturn {
  const [status, setStatus] = useState<ApiConnectionStatus>('checking')
  const [backendVersion, setBackendVersion] = useState<string>()
  const [lastError, setLastError] = useState<string>()
  const syncing = useRef(false)
  const initialSyncDone = useRef(false)

  const setAllApiAvailable = useCallback((available: boolean) => {
    usePatientStore.setState({ _apiAvailable: available })
    usePrescriptionStore.setState({ _apiAvailable: available })
    useSettingsStore.setState({ _apiAvailable: available })
    useDosageStore.setState({ _apiAvailable: available })
    useFrequencyStore.setState({ _apiAvailable: available })
    useDurationStore.setState({ _apiAvailable: available })
    useMedicineHistoryStore.setState({ _apiAvailable: available })
    useComplaintStore.setState({ _apiAvailable: available })
    useDiagnosisStore.setState({ _apiAvailable: available })
  }, [])

  const doSync = useCallback(async () => {
    if (syncing.current) return
    syncing.current = true
    setStatus('checking')

    try {
      if (isElectron()) {
        const electronUrl = await (window as any).electron?.api?.getUrl?.()
        if (electronUrl && electronUrl !== getApiBaseUrl()) {
          setApiBaseUrl(electronUrl)
        }
      }

      const health = await checkApiHealth()
      if (health.status !== 'ok') {
        setStatus('disconnected')
        setLastError(health.error)
        setAllApiAvailable(false)
        syncing.current = false
        return
      }

      setStatus('connected')
      setBackendVersion(health.version)
      setLastError(undefined)
      setAllApiAvailable(true)

      // Sync patients
      try {
        const apiPatients = await patientsApi.list()
        usePatientStore.setState({ patients: (apiPatients || []).map(mapApiPatient) })
      } catch (e: any) {
        console.warn('Sync patients failed:', e.message)
      }

      // Sync prescriptions (merge with local to preserve updateHistory)
      try {
        const apiRx = await prescriptionsApi.list()
        const currentPrescriptions = usePrescriptionStore.getState().prescriptions
        const merged = (apiRx || []).map((apiPrescription: any) => {
          const local = currentPrescriptions.find((p) => p.id === apiPrescription.id)
          if (local) {
            return {
              ...local,
              patientName: apiPrescription.patient_name || local.patientName,
              date: apiPrescription.prescription_date || local.date,
              diagnosis: apiPrescription.diagnosis || local.diagnosis,
            }
          }
          return mapApiPrescription(apiPrescription)
        })
        usePrescriptionStore.setState({ prescriptions: merged })
      } catch (e: any) {
        console.warn('Sync prescriptions failed:', e.message)
      }

      // Sync doctor profile
      try {
        const profile = await settingsApi.doctorProfile.get()
        if (profile) {
          useSettingsStore.getState().syncFromApi(profile)
        }
      } catch (e: any) {
        console.warn('Sync doctor profile failed:', e.message)
      }

      // Sync masters
      try {
        const [dosages, frequencies, durations] = await Promise.all([
          mastersApi.dosages.list(),
          mastersApi.frequencies.list(),
          mastersApi.durations.list(),
        ])
        useDosageStore.setState({ items: dosages || [] })
        useFrequencyStore.setState({ items: frequencies || [] })
        useDurationStore.setState({ items: durations || [] })
      } catch (e: any) {
        console.warn('Sync masters failed:', e.message)
      }

      // Sync autocomplete
      try {
        const [medicines, complaints, diagnoses] = await Promise.all([
          autocompleteApi.medicines(),
          autocompleteApi.chiefComplaints(),
          autocompleteApi.diagnosis(),
        ])
        useMedicineHistoryStore.setState({
          entries: (medicines || []).map((m) => ({
            id: m.id,
            name: m.medicine_name,
            createdAt: new Date().toISOString().split('T')[0],
          })),
        })
        useComplaintStore.setState({
          items: (complaints || []).map((c) => ({ id: c.id, complaint: c.chief_complaints })),
        })
        useDiagnosisStore.setState({
          items: (diagnoses || []).map((d) => ({ id: d.id, diagnosis: d.diagnosis })),
        })
      } catch (e: any) {
        console.warn('Sync autocomplete failed:', e.message)
      }
    } catch (err: any) {
      setStatus('disconnected')
      setLastError(err.message)
      setAllApiAvailable(false)
    } finally {
      syncing.current = false
    }
  }, [setAllApiAvailable])

  // Initial sync on mount
  useEffect(() => {
    if (!initialSyncDone.current) {
      initialSyncDone.current = true
      doSync()
    }
  }, [doSync])

  // Periodic reconnection check when disconnected
  useEffect(() => {
    if (status !== 'disconnected') return
    const interval = setInterval(() => {
      doSync()
    }, 30000)
    return () => clearInterval(interval)
  }, [status, doSync])

  return { status, backendVersion, lastError, refresh: doSync }
}
