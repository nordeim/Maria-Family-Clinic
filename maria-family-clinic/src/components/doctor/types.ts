// Doctor interface for consistent typing across components
export interface Doctor {
  id: string
  firstName: string
  lastName: string
  specialties: string[]
  languages: string[]
  experience?: number
  rating?: {
    average: number
    count: number
  }
  profile?: {
    photo?: string
    bio?: string
    description?: string
  }
  medicalLicense: string
  isVerified: boolean
  verificationDate?: Date
  email?: string
  phone?: string
  qualifications?: string[]
  clinics: Array<{
    id: string
    name: string
    address: string
    role?: string
    workingDays?: string[]
    startTime?: string
    endTime?: string
    consultationFee?: number
    currency?: string
  }>
}

// Component prop interfaces
export interface DoctorProfileHeaderProps {
  doctor: Doctor
  className?: string
}

export interface DoctorProfessionalInfoProps {
  doctor: Doctor
  className?: string
}

export interface DoctorCredentialsSectionProps {
  doctor: Doctor
  className?: string
}

export interface DoctorClinicAffiliationsProps {
  doctor: Doctor
  className?: string
}

export interface DoctorPatientInfoProps {
  doctor: Doctor
  className?: string
}

export interface DoctorTrustIndicatorsProps {
  doctor: Doctor
  className?: string
}

export interface DoctorInteractiveActionsProps {
  doctor: Doctor
  className?: string
}

export interface DoctorReviewsSectionProps {
  doctor: Doctor
  className?: string
}

export interface DoctorMobileLayoutProps {
  doctor: Doctor
  className?: string
}

export interface DoctorProfileLayoutProps {
  doctor: Doctor
  className?: string
}

export interface DoctorPrintLayoutProps {
  doctor: Doctor
  className?: string
}