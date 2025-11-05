import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { trpc } from "@/lib/trpc/client"
import { LoadingSkeleton } from "@/components/ui/loading-skeletons"
import { ErrorBoundary } from "@/components/error-boundary"
import { 
  DoctorProfileHeader, 
  DoctorProfessionalInfo, 
  DoctorCredentialsSection,
  DoctorClinicAffiliations,
  DoctorPatientInfo,
  DoctorTrustIndicators,
  DoctorInteractiveActions,
  DoctorReviewsSection,
  DoctorMobileLayout
} from "@/components/doctor"
import { 
  DoctorProfileLayout,
  DoctorPrintLayout 
} from "@/components/doctor/profile-layouts"
import { Button } from "@/components/ui/button"
import { Share, Printer, BookOpen } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const doctor = await trpc.doctor.getById.query({ id: params.id })
    
    return {
      title: `Dr. ${doctor.firstName} ${doctor.lastName} - ${doctor.specialties.join(', ')} | My Family Clinic`,
      description: `Book appointment with Dr. ${doctor.firstName} ${doctor.lastName}. ${doctor.specialties.join(', ')} specialist with ${doctor.experience} years of experience.`,
      openGraph: {
        title: `Dr. ${doctor.firstName} ${doctor.lastName} - Healthcare Professional`,
        description: doctor.profile?.description || `Meet Dr. ${doctor.firstName} ${doctor.lastName}, ${doctor.specialties.join(', ')} specialist at My Family Clinic.`,
        images: doctor.profile?.photo ? [doctor.profile.photo] : [],
        type: "profile",
      },
    }
  } catch (error) {
    return {
      title: "Doctor Profile - My Family Clinic",
      description: "View doctor profiles and book appointments at My Family Clinic.",
    }
  }
}

// Loading skeleton for doctor profile
function DoctorProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <LoadingSkeleton className="h-8 w-1/3 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <LoadingSkeleton className="h-32 rounded-lg" />
          <LoadingSkeleton className="h-48 rounded-lg" />
          <LoadingSkeleton className="h-64 rounded-lg" />
        </div>
        <div className="space-y-6">
          <LoadingSkeleton className="h-24 rounded-lg" />
          <LoadingSkeleton className="h-32 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// Not found component
function DoctorNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Doctor Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The doctor you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <a href="/doctors">Browse All Doctors</a>
        </Button>
      </div>
    </div>
  )
}

// Share dialog component
function ShareDialog({ doctor }: { doctor: any }) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = `Dr. ${doctor.firstName} ${doctor.lastName} - ${doctor.specialties.join(', ')}`
  const shareText = `Meet Dr. ${doctor.firstName} ${doctor.lastName}, ${doctor.specialties.join(', ')} specialist at My Family Clinic. Book your appointment today.`

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
      } catch (error) {
        console.log("Share cancelled")
      }
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      // You could add a toast notification here
      console.log("Link copied to clipboard")
    } catch (error) {
      console.error("Failed to copy link")
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Doctor Profile</DialogTitle>
          <DialogDescription>
            Share this doctor's profile with others
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Button 
            onClick={handleNativeShare} 
            className="w-full justify-start"
            variant="outline"
          >
            <Share className="h-4 w-4 mr-2" />
            Share via...
          </Button>
          <Button 
            onClick={handleCopyLink} 
            className="w-full justify-start"
            variant="outline"
          >
            <Share className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Print functionality
function PrintButton({ doctor }: { doctor: any }) {
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Dr. ${doctor.firstName} ${doctor.lastName} - Profile</title>
          <style>
            body { font-family: system-ui, sans-serif; margin: 20px; }
            .header { border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section h3 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Dr. ${doctor.firstName} ${doctor.lastName}</h1>
            <p><strong>Specialties:</strong> ${doctor.specialties.join(', ')}</p>
            <p><strong>Experience:</strong> ${doctor.experience} years</p>
            <p><strong>Languages:</strong> ${doctor.languages.join(', ')}</p>
          </div>
          <div class="section">
            <h3>Professional Information</h3>
            <p><strong>Qualifications:</strong> ${doctor.qualifications || 'Not specified'}</p>
            <p><strong>Medical License:</strong> ${doctor.medicalLicense}</p>
            ${doctor.profile?.bio ? `<p><strong>Biography:</strong> ${doctor.profile.bio}</p>` : ''}
          </div>
          ${doctor.profile?.description ? `
            <div class="section">
              <h3>Description</h3>
              <p>${doctor.profile.description}</p>
            </div>
          ` : ''}
          <div class="section">
            <h3>Contact Information</h3>
            <p><strong>Email:</strong> ${doctor.email || 'Not available'}</p>
            <p><strong>Phone:</strong> ${doctor.phone || 'Not available'}</p>
          </div>
          <div class="section">
            <h3>Clinic Affiliations</h3>
            ${doctor.clinics.map((clinic: any) => `
              <div>
                <p><strong>${clinic.name}</strong></p>
                <p>${clinic.address}</p>
              </div>
            `).join('')}
          </div>
          <div class="section">
            <h3>Print Date</h3>
            <p>${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handlePrint}>
      <Printer className="h-4 w-4 mr-2" />
      Print Profile
    </Button>
  )
}

// Main doctor profile page component
export default function DoctorProfilePage({ params }: { params: { id: string } }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<DoctorProfileSkeleton />}>
        <DoctorProfileContent doctorId={params.id} />
      </Suspense>
    </ErrorBoundary>
  )
}

// Doctor profile content component
function DoctorProfileContent({ doctorId }: { doctorId: string }) {
  const { data: doctor, isLoading, error } = trpc.doctor.getById.useQuery({ id: doctorId })

  if (isLoading) {
    return <DoctorProfileSkeleton />
  }

  if (error) {
    console.error('Doctor profile error:', error)
    if (error.code === 'NOT_FOUND') {
      return <DoctorNotFound />
    }
    throw error
  }

  if (!doctor) {
    return <DoctorNotFound />
  }

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <DoctorProfileLayout doctor={doctor} />
      </div>
      
      {/* Mobile Layout */}
      <div className="md:hidden">
        <DoctorMobileLayout doctor={doctor} />
      </div>

      {/* Print Layout - Hidden on screen */}
      <div className="hidden">
        <DoctorPrintLayout doctor={doctor} />
      </div>
    </>
  )
}