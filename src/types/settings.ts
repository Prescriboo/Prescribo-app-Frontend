export interface ClinicSettings {
  clinicName: string
  doctorName: string
  doctorQual: string
  specialization: string
  regNo: string
  clinicAddressLine1: string
  clinicAddressLine2: string
  city: string
  state: string
  pincode: string
  country: string
  phone: string
  email: string
  website: string
  signature: string
  signatureImageDataUrl?: string
  sealImageDataUrl?: string
  defaultLanguage: string
}

export interface SecuritySettings {
  requirePin: boolean
  autoLock: boolean
  encryptData: boolean
}

export interface AppSettings {
  clinic: ClinicSettings
  security: SecuritySettings
  templateStyle: 'header-footer' | 'header-only'
  prescriptionFooterHtml: string
}
