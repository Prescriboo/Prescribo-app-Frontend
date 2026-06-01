export interface ClinicSettings {
  clinicName: string
  doctorName: string
  doctorQual: string
  regNo: string
  address: string
  signature: string
}

export interface SecuritySettings {
  requirePin: boolean
  autoLock: boolean
  encryptData: boolean
}

export interface AppSettings {
  clinic: ClinicSettings
  security: SecuritySettings
}
