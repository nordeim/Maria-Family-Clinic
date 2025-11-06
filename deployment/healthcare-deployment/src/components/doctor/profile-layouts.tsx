import * as React from "react"
import { Grid, GridItem } from "@/components/ui/grid"
import { Separator } from "@/components/ui/separator"
import {
  DoctorProfileHeader,
  DoctorProfessionalInfo,
  DoctorCredentialsSection,
  DoctorClinicAffiliations,
  DoctorPatientInfo,
  DoctorTrustIndicators,
  DoctorInteractiveActions,
  DoctorReviewsSection
} from "@/components/doctor"

interface Doctor {
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

interface DoctorProfileLayoutProps {
  doctor: Doctor
  className?: string
}

export function DoctorProfileLayout({ doctor, className }: DoctorProfileLayoutProps) {
  return (
    <div className={`container mx-auto px-4 py-8 max-w-7xl ${className || ''}`}>
      <div className="space-y-8">
        {/* Main Profile Header */}
        <DoctorProfileHeader doctor={doctor} />
        
        {/* Main Content Grid */}
        <Grid className="grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Primary Content */}
          <GridItem className="lg:col-span-3 space-y-8">
            {/* Professional Information */}
            <DoctorProfessionalInfo doctor={doctor} />
            
            {/* Clinic Affiliations */}
            <DoctorClinicAffiliations doctor={doctor} />
            
            {/* Patient Care Information */}
            <DoctorPatientInfo doctor={doctor} />
            
            {/* Patient Reviews */}
            <DoctorReviewsSection doctor={doctor} />
          </GridItem>
          
          {/* Right Column - Secondary Content */}
          <GridItem className="lg:col-span-1 space-y-8">
            {/* Interactive Actions */}
            <DoctorInteractiveActions doctor={doctor} />
            
            {/* Trust Indicators */}
            <DoctorTrustIndicators doctor={doctor} />
          </GridItem>
        </Grid>

        {/* Full Width Credentials Section */}
        <Separator />
        <DoctorCredentialsSection doctor={doctor} />
      </div>
    </div>
  )
}

interface DoctorPrintLayoutProps {
  doctor: Doctor
  className?: string
}

export function DoctorPrintLayout({ doctor, className }: DoctorPrintLayoutProps) {
  return (
    <div className={`max-w-4xl mx-auto p-8 space-y-6 ${className || ''}`}>
      {/* Print Header */}
      <div className="text-center border-b-2 border-gray-300 pb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Dr. {doctor.firstName} {doctor.lastName}
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          {doctor.specialties.join(', ')}
        </p>
        {doctor.experience && (
          <p className="text-sm text-gray-500">
            {doctor.experience} years of experience
          </p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Printed on: {new Date().toLocaleDateString('en-SG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      {/* Professional Information */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
          Professional Information
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-700">Medical License</h3>
            <p className="text-sm text-gray-600">{doctor.medicalLicense}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">Verification Status</h3>
            <p className="text-sm text-gray-600">
              {doctor.isVerified ? 'Verified' : 'Pending Verification'}
              {doctor.verificationDate && (
                <span className="text-gray-400">
                  {' '}({doctor.verificationDate.toLocaleDateString()})
                </span>
              )}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">Specialties</h3>
            <p className="text-sm text-gray-600">{doctor.specialties.join(', ')}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">Languages</h3>
            <p className="text-sm text-gray-600">{doctor.languages.join(', ')}</p>
          </div>
          {doctor.rating && doctor.rating.count > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700">Patient Rating</h3>
              <p className="text-sm text-gray-600">
                {doctor.rating.average.toFixed(1)}/5.0 ({doctor.rating.count} reviews)
              </p>
            </div>
          )}
          {doctor.email && (
            <div>
              <h3 className="font-semibold text-gray-700">Email</h3>
              <p className="text-sm text-gray-600">{doctor.email}</p>
            </div>
          )}
        </div>

        {doctor.qualifications && doctor.qualifications.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Qualifications</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              {doctor.qualifications.map((qual, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{qual}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <Separator />

      {/* Biography/Description */}
      {(doctor.profile?.bio || doctor.profile?.description) && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
            About Dr. {doctor.lastName}
          </h2>
          <div className="text-sm text-gray-600 leading-relaxed">
            <p>{doctor.profile.bio || doctor.profile.description}</p>
          </div>
        </section>
      )}

      <Separator />

      {/* Clinic Affiliations */}
      {doctor.clinics && doctor.clinics.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
            Clinic Affiliations
          </h2>
          <div className="space-y-4">
            {doctor.clinics.map((clinic, index) => (
              <div key={clinic.id} className="border border-gray-200 p-4 rounded">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-700">{clinic.name}</h3>
                  {clinic.role && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {clinic.role}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{clinic.address}</p>
                {clinic.consultationFee && (
                  <p className="text-sm text-gray-600">
                    Consultation Fee: ${clinic.consultationFee.toFixed(2)} {clinic.currency || 'SGD'}
                  </p>
                )}
                {clinic.workingDays && clinic.workingDays.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Available: {clinic.workingDays.join(', ')}
                    {clinic.startTime && clinic.endTime && (
                      <span> ({clinic.startTime} - {clinic.endTime})</span>
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Print Footer */}
      <div className="text-center border-t border-gray-200 pt-6 mt-8">
        <p className="text-xs text-gray-400">
          This profile was generated from My Family Clinic system
        </p>
        <p className="text-xs text-gray-400">
          For the most current information, please visit our website or contact the clinic directly.
        </p>
      </div>
    </div>
  )
}