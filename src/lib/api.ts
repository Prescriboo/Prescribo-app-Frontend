import { getApiUrl } from './api-config'

// ============================================================
// HTTP helpers
// ============================================================

async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(getApiUrl(path), {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

function get<T>(path: string) {
  return http<T>(path, { method: 'GET' })
}

function post<T>(path: string, body: unknown) {
  return http<T>(path, { method: 'POST', body: JSON.stringify(body) })
}

function put<T>(path: string, body: unknown) {
  return http<T>(path, { method: 'PUT', body: JSON.stringify(body) })
}

function del<T>(path: string) {
  return http<T>(path, { method: 'DELETE' })
}

function postForm<T>(path: string, formData: FormData) {
  // Let browser set Content-Type with multipart boundary
  return http<T>(path, { method: 'POST', body: formData, headers: {} })
}

// ============================================================
// Types (mirroring backend schemas)
// ============================================================

export interface PatientCreate {
  name: string
  age?: number
  age_unit?: string
  gender?: string
  blood_group?: string
  phone?: string
  email?: string
  address?: string
  allergies?: string
  chronic_conditions?: string
  current_medications?: string
  status?: string
}

export interface PatientUpdate extends Partial<PatientCreate> {}

export interface ApiPatient {
  id: number
  name: string
  age?: number
  age_unit?: string
  gender?: string
  blood_group?: string
  phone?: string
  email?: string
  address?: string
  allergies?: string
  chronic_conditions?: string
  current_medications?: string
  first_visit_date?: string
  last_visit_date?: string
  visit_count?: number
  is_favorite?: boolean
  status?: string
  created_at?: string
  updated_at?: string
}

export interface PrescriptionMedicineRow {
  medicine_name: string
  generic_name?: string
  brand_name?: string
  dosage?: string
  dosage_form?: string
  frequency?: string
  frequency_custom?: string
  duration?: string
  duration_days?: number
  instructions?: string
  route?: string
  display_order?: number
  drug_db_id?: string
}

export interface PrescriptionCreate {
  patient_id: number
  patient_name?: string
  prescription_number?: string
  prescription_date?: string
  chief_complaints?: string
  diagnosis: string
  diagnosis_icd10?: string
  examination_findings?: string
  special_instructions?: string
  follow_up_date?: string
  follow_up_notes?: string
  template_id?: number
  template_used?: string
  status?: string
  paper_size?: string
  medicine_rows: PrescriptionMedicineRow[]
}

export interface PrescriptionUpdate extends Partial<PrescriptionCreate> {}

export interface ApiPrescription {
  id: number
  patient_id: number
  patient_name?: string
  prescription_number?: string
  prescription_date?: string
  chief_complaints?: string
  diagnosis: string
  diagnosis_icd10?: string
  examination_findings?: string
  special_instructions?: string
  follow_up_date?: string
  follow_up_notes?: string
  template_id?: number
  template_used?: string
  status?: string
  is_deleted?: boolean
  original_id?: number
  version_number?: number
  paper_size?: string
  printed_at?: string
  exported_pdf_path?: string
  created_at?: string
  updated_at?: string
  medicine_rows: PrescriptionMedicineRow[]
}

export interface PrescriptionListItem {
  id: number
  patient_id: number
  patient_name?: string
  prescription_number?: string
  prescription_date?: string
  diagnosis?: string
  medicine_count: number
  status?: string
}

export interface DoctorProfile {
  id: number
  full_name: string
  qualifications?: string
  registration_number?: string
  specialization?: string
  clinic_name?: string
  clinic_address_line1?: string
  clinic_address_line2?: string
  city?: string
  state?: string
  pincode?: string
  country?: string
  phone?: string
  email?: string
  website?: string
  signature_text?: string
  default_template_id?: number
  default_language?: string
  created_at?: string
  updated_at?: string
}

export interface ClinicSettings {
  id?: number
  working_days?: string
  morning_hours?: string
  evening_hours?: string
  default_followup_days?: number
  default_medicine_duration?: number
  default_paper_size?: string
  print_header_on_every?: boolean
  print_watermark?: string
  enable_medicine_db?: boolean
  enable_vitals_tracking?: boolean
  backup_interval_days?: number
  last_backup_at?: string
  updated_at?: string
}

export interface SecuritySettings {
  id?: number
  pin_enabled?: boolean
  pin_hash?: string
  pin_last_changed?: string
  pin_attempts_remaining?: number
  pin_lockout_until?: string
  auto_lock_timeout_min?: number
  lock_on_minimize?: boolean
  backup_encryption_enabled?: boolean
  backup_key_derivation?: string
  last_active_at?: string
  created_at?: string
}

export interface AppSetting {
  setting_key: string
  setting_value?: string
  setting_type?: string
  description?: string
  updated_at?: string
}

export interface TemplateItem {
  id: number
  code: string
  name: string
  description?: string
  source?: string
  size?: string
  orientation?: string
  layout_json: string
  primary_color?: string
  font_family?: string
  font_size_pt?: number
  header_style?: string
  show_logo?: boolean
  show_signature?: boolean
  show_watermark?: boolean
  show_reg_number?: boolean
  show_qualifications?: boolean
  is_default?: boolean
  is_active?: boolean
  version?: number
  parent_template_id?: number
  created_at?: string
  updated_at?: string
}

export interface DosageItem { id: number; dosage: string }
export interface FrequencyItem { id: number; frequency: string }
export interface DurationItem { id: number; duration: string; duration_days?: number }
export interface MedicineNameItem { id: number; name: string; file_name?: string; file_type?: string; created_at?: string }

export interface AuthState {
  is_activated: boolean
  license_key: string
  pin: string
  has_pin: boolean
  demo_mode: boolean
}

export interface LicenceStatus {
  valid: boolean
  access_expired?: boolean
  refresh_expired?: boolean
  grace_expired?: boolean
  days_until_lock?: number
  message: string
}

export interface BackupStatus {
  last_backup_at?: string
  next_backup_due?: string
  db_path: string
  db_size_bytes: number
}

export interface ActivityLogEntry {
  id: number
  event_type: string
  entity_type?: string
  entity_id?: number
  patient_id?: number
  prescription_id?: number
  template_id?: number
  description?: string
  user_context?: string
  session_id?: string
  ip_address?: string
  created_at?: string
}

// ============================================================
// PATIENTS
// ============================================================

export const patientsApi = {
  list: (search?: string) =>
    get<ApiPatient[]>(`/api/patients${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  get: (id: number) => get<ApiPatient>(`/api/patients/${id}`),
  create: (data: PatientCreate) => post<ApiPatient>('/api/patients', data),
  update: (id: number, data: PatientUpdate) => put<ApiPatient>(`/api/patients/${id}`, data),
  remove: (id: number) => del<{ message: string }>(`/api/patients/${id}`),
}

// ============================================================
// PRESCRIPTIONS
// ============================================================

export const prescriptionsApi = {
  list: (params?: { patient_id?: number; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.patient_id) qs.set('patient_id', String(params.patient_id))
    if (params?.search) qs.set('search', params.search)
    const query = qs.toString()
    return get<PrescriptionListItem[]>(`/api/prescriptions${query ? '?' + query : ''}`)
  },
  get: (id: number) => get<ApiPrescription>(`/api/prescriptions/${id}`),
  create: (data: PrescriptionCreate) => post<ApiPrescription>('/api/prescriptions', data),
  update: (id: number, data: PrescriptionUpdate) => put<ApiPrescription>(`/api/prescriptions/${id}`, data),
  remove: (id: number) => del<{ message: string }>(`/api/prescriptions/${id}`),
  byPatient: (patientId: number) => get<ApiPrescription[]>(`/api/prescriptions/patient/${patientId}`),
}

// ============================================================
// AUTOCOMPLETE / HISTORY
// ============================================================

export const autocompleteApi = {
  medicines: (search?: string) =>
    get<{ id: number; medicine_name: string }[]>(`/api/autocomplete/medicines${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  createMedicine: (name: string) =>
    post<{ id: number; medicine_name: string }>('/api/autocomplete/medicines', { medicine_name: name }),
  bulkUploadMedicines: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return postForm<{ inserted: number; skipped: number; names: string[] }>('/api/autocomplete/medicines/bulk-upload', formData)
  },
  deleteMedicine: (id: number) =>
    del<{ message: string }>(`/api/autocomplete/medicines/${id}`),
  bulkDeleteMedicines: (ids: number[]) =>
    post<{ deleted: number }>('/api/autocomplete/medicines/bulk-delete', { ids }),
  dosages: () => get<{ id: number; dosage: string }[]>('/api/autocomplete/dosages'),
  frequencies: () => get<{ id: number; frequency: string }[]>('/api/autocomplete/frequencies'),
  durations: () => get<{ id: number; duration: string; duration_days?: number }[]>('/api/autocomplete/durations'),
  chiefComplaints: (search?: string) =>
    get<{ id: number; chief_complaints: string }[]>(`/api/autocomplete/chief-complaints${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  createChiefComplaint: (text: string) =>
    post<{ id: number; chief_complaints: string }>('/api/autocomplete/chief-complaints', { chief_complaints: text }),
  diagnosis: (search?: string) =>
    get<{ id: number; diagnosis: string }[]>(`/api/autocomplete/diagnosis${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  createDiagnosis: (text: string) =>
    post<{ id: number; diagnosis: string }>('/api/autocomplete/diagnosis', { diagnosis: text }),
}

// ============================================================
// MASTERS (seeded tables with CRUD)
// ============================================================

export const mastersApi = {
  dosages: {
    list: () => get<DosageItem[]>('/api/masters/dosages'),
    create: (dosage: string) => post<DosageItem>('/api/masters/dosages', { dosage }),
    update: (id: number, dosage: string) => put<DosageItem>(`/api/masters/dosages/${id}`, { dosage }),
    remove: (id: number) => del<{ message: string }>(`/api/masters/dosages/${id}`),
  },
  frequencies: {
    list: () => get<FrequencyItem[]>('/api/masters/frequencies'),
    create: (frequency: string) => post<FrequencyItem>('/api/masters/frequencies', { frequency }),
    update: (id: number, frequency: string) => put<FrequencyItem>(`/api/masters/frequencies/${id}`, { frequency }),
    remove: (id: number) => del<{ message: string }>(`/api/masters/frequencies/${id}`),
  },
  durations: {
    list: () => get<DurationItem[]>('/api/masters/durations'),
    create: (duration: string) => post<DurationItem>('/api/masters/durations', { duration }),
    update: (id: number, duration: string) => put<DurationItem>(`/api/masters/durations/${id}`, { duration }),
    remove: (id: number) => del<{ message: string }>(`/api/masters/durations/${id}`),
  },
  medicineNames: {
    list: (search?: string) =>
      get<MedicineNameItem[]>(`/api/masters/medicine-names${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    create: (name: string) => post<MedicineNameItem>('/api/masters/medicine-names', { name }),
    update: (id: number, name: string) => put<MedicineNameItem>(`/api/masters/medicine-names/${id}`, { name }),
    remove: (id: number) => del<{ message: string }>(`/api/masters/medicine-names/${id}`),
  },
}

// ============================================================
// SETTINGS
// ============================================================

export const settingsApi = {
  doctorProfile: {
    get: () => get<DoctorProfile>('/api/settings/doctor-profile'),
    update: (data: Partial<DoctorProfile>) => put<DoctorProfile>('/api/settings/doctor-profile', data),
  },
  clinic: {
    get: () => get<ClinicSettings>('/api/settings/clinic'),
    update: (data: Partial<ClinicSettings>) => put<ClinicSettings>('/api/settings/clinic', data),
  },
  security: {
    get: () => get<SecuritySettings>('/api/settings/security'),
    update: (data: Partial<SecuritySettings>) => put<SecuritySettings>('/api/settings/security', data),
  },
  app: {
    list: () => get<AppSetting[]>('/api/settings/app'),
    get: (key: string) => get<AppSetting>(`/api/settings/app/${key}`),
    set: (key: string, value: string, type?: string) =>
      put<AppSetting>(`/api/settings/app/${key}`, { setting_value: value, setting_type: type || 'string' }),
    remove: (key: string) => del<{ message: string }>(`/api/settings/app/${key}`),
  },
}

// ============================================================
// TEMPLATES
// ============================================================

export const templatesApi = {
  list: () => get<TemplateItem[]>('/api/templates'),
  get: (id: number) => get<TemplateItem>(`/api/templates/${id}`),
  create: (data: Omit<TemplateItem, 'id' | 'created_at' | 'updated_at'>) => post<TemplateItem>('/api/templates', data),
  update: (id: number, data: Partial<TemplateItem>) => put<TemplateItem>(`/api/templates/${id}`, data),
  remove: (id: number) => del<{ message: string }>(`/api/templates/${id}`),
}

// ============================================================
// AUTH
// ============================================================

export const authApi = {
  state: () => get<AuthState>('/api/auth/state'),
  activate: (licenseKey: string, machineId?: string) =>
    post<AuthState>('/api/auth/activate', { license_key: licenseKey, machine_id: machineId }),
  demo: () => post<AuthState>('/api/auth/demo', {}),
  setPin: (pin: string) => post<AuthState>('/api/auth/pin', { pin }),
  verifyPin: (pin: string) => post<{ valid: boolean; message: string }>('/api/auth/verify-pin', { pin }),
  skipPin: () => post<AuthState>('/api/auth/skip-pin', {}),
  logout: () => post<{ message: string }>('/api/auth/logout', {}),
  status: () => get<LicenceStatus>('/api/auth/status'),
  machineId: () => get<{ machine_id: string }>('/api/auth/machine-id'),
}

// ============================================================
// PRINT
// ============================================================

export const printApi = {
  toPdf: (prescriptionId: number, templateId?: number, paperSize?: string) =>
    post<Blob>('/api/print/pdf', { prescription_id: prescriptionId, template_id: templateId, paper_size: paperSize }),
  preview: (prescriptionId: number) =>
    get<{
      prescription: {
        id: number; patient_name: string; prescription_date?: string
        diagnosis: string; chief_complaints?: string; notes?: string; doctor?: string
        medicines: { name: string; dosage?: string; frequency?: string; duration?: string; instructions?: string }[]
      }
      doctor: { name?: string; qualification?: string; registration_no?: string; clinic_name?: string; address?: string }
    }>(`/api/print/prescription/${prescriptionId}/preview`),
}

// ============================================================
// BACKUP
// ============================================================

export const backupApi = {
  status: () => get<BackupStatus>('/api/backup/status'),
  download: () => get<Blob>('/api/backup/download'),
  downloadCompressed: () => get<Blob>('/api/backup/download-compressed'),
  markUploaded: () => post<{ message: string; timestamp: string }>('/api/backup/mark-uploaded', {}),
}

// ============================================================
// ACTIVITY
// ============================================================

export const activityApi = {
  log: (data: {
    event_type: string
    entity_type?: string
    entity_id?: number
    patient_id?: number
    prescription_id?: number
    template_id?: number
    description?: string
    user_context?: string
  }) => post<ActivityLogEntry>('/api/activity', data),
  list: (params?: { event_type?: string; patient_id?: number; prescription_id?: number; skip?: number; limit?: number }) => {
    const qs = new URLSearchParams()
    if (params?.event_type) qs.set('event_type', params.event_type)
    if (params?.patient_id) qs.set('patient_id', String(params.patient_id))
    if (params?.prescription_id) qs.set('prescription_id', String(params.prescription_id))
    if (params?.skip !== undefined) qs.set('skip', String(params.skip))
    if (params?.limit !== undefined) qs.set('limit', String(params.limit))
    const query = qs.toString()
    return get<ActivityLogEntry[]>(`/api/activity${query ? '?' + query : ''}`)
  },
}

// ============================================================
// VITALS
// ============================================================

export interface PatientVital {
  id: number
  patient_id: number
  prescription_id?: number
  weight_kg?: number
  height_cm?: number
  temperature_c?: number
  blood_pressure_sys?: number
  blood_pressure_dia?: number
  pulse_bpm?: number
  spo2_percent?: number
  respiratory_rate?: number
  notes?: string
  recorded_at?: string
}

export interface PatientVitalCreate {
  patient_id: number
  prescription_id?: number
  weight_kg?: number
  height_cm?: number
  temperature_c?: number
  blood_pressure_sys?: number
  blood_pressure_dia?: number
  pulse_bpm?: number
  spo2_percent?: number
  respiratory_rate?: number
  notes?: string
}

export const vitalsApi = {
  list: (params?: { patient_id?: number; prescription_id?: number }) => {
    const qs = new URLSearchParams()
    if (params?.patient_id) qs.set('patient_id', String(params.patient_id))
    if (params?.prescription_id) qs.set('prescription_id', String(params.prescription_id))
    const query = qs.toString()
    return get<PatientVital[]>(`/api/vitals${query ? '?' + query : ''}`)
  },
  create: (data: PatientVitalCreate) => post<PatientVital>('/api/vitals', data),
  update: (id: number, data: Partial<PatientVitalCreate>) => put<PatientVital>(`/api/vitals/${id}`, data),
  remove: (id: number) => del<{ message: string }>(`/api/vitals/${id}`),
}

// ============================================================
// PATIENT HISTORY (medicine history per patient)
// ============================================================

export interface PatientHistoryEntry {
  id: number
  patient_id: number
  prescription_id?: number
  medicine_name: string
  generic_name?: string
  brand_name?: string
  dosage?: string
  frequency?: string
  duration?: string
  instructions?: string
  route?: string
  prescribed_at?: string
}

export const patientHistoryApi = {
  list: (params?: { patient_id?: number; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.patient_id) qs.set('patient_id', String(params.patient_id))
    if (params?.search) qs.set('search', params.search)
    const query = qs.toString()
    return get<PatientHistoryEntry[]>(`/api/patient-history${query ? '?' + query : ''}`)
  },
}
