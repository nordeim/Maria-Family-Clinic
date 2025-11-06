import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Star,
  MapPin,
  Users,
  Award,
  Phone,
  Mail,
  Building,
  Activity,
  UserCheck,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Settings,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"
import { DoctorClinic, Doctor, DoctorAvailability } from "@/types/doctor"

interface ClinicDoctorManagementProps {
  clinicId: string
  clinicName: string
  className?: string
}

interface DoctorWithClinicDetails extends Doctor {
  clinicRelation: DoctorClinic
  availability: DoctorAvailability[]
  performance: {
    totalAppointments: number
    completionRate: number
    patientSatisfaction: number
    responseTime: number
  }
  partnership?: {
    isPreferred: boolean
    partnershipLevel: 'standard' | 'preferred' | 'exclusive'
    collaborationScore: number
    referralCount: number
  }
}

export function ClinicDoctorManagement({ 
  clinicId, 
  clinicName, 
  className 
}: ClinicDoctorManagementProps) {
  const [doctors, setDoctors] = React.useState<DoctorWithClinicDetails[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [specialtyFilter, setSpecialtyFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [capacityFilter, setCapacityFilter] = React.useState("all")
  const [activeTab, setActiveTab] = React.useState("overview")

  // Mock data - in real app this would come from API
  React.useEffect(() => {
    const fetchClinicDoctors = async () => {
      setLoading(true)
      
      // Mock doctors data
      const mockDoctors: DoctorWithClinicDetails[] = [
        {
          id: "1",
          name: "Dr. Sarah Chen",
          email: "sarah.chen@clinic.sg",
          phone: "+65 9123 4567",
          medicalLicense: "ML123456",
          specialties: ["Family Medicine", "Internal Medicine"],
          languages: ["English", "Mandarin", "Malay"],
          qualifications: ["MBBS", "MCGP"],
          experienceYears: 8,
          bio: "Experienced family physician with special interest in chronic disease management.",
          medicalSchool: "National University of Singapore",
          graduationYear: 2016,
          specializations: ["Diabetes Management", "Hypertension"],
          boardCertifications: ["Family Medicine Board"],
          professionalMemberships: ["Singapore Medical Association"],
          achievements: ["Best Family Doctor Award 2023"],
          awards: ["Excellent Service Award 2023"],
          publications: [],
          researchInterests: ["Preventive Medicine"],
          careerHighlights: [],
          previousPositions: [],
          profileImage: undefined,
          consultationFee: 60,
          currency: "SGD",
          isActive: true,
          isVerified: true,
          verificationDate: new Date("2024-01-15"),
          verificationNotes: "All credentials verified",
          rating: 4.8,
          reviewCount: 127,
          patientSatisfaction: 4.6,
          appointmentCompletionRate: 95.2,
          totalAppointments: 1847,
          specializationPopularity: 4.2,
          languagePreference: {"English": 60, "Mandarin": 30, "Malay": 10},
          privacySettings: {
            profileVisibility: "public",
            contactInfoVisible: "clinic-only",
            scheduleVisible: "clinic-only",
            availabilityVisible: true,
            reviewsVisible: true
          },
          gdprConsent: true,
          pdpaConsent: true,
          confidentialityLevel: "STANDARD",
          dataRetentionPeriod: 2555,
          preferredContactMethod: "email",
          communicationPreferences: {
            emailNotifications: true,
            smsReminders: true,
            phoneCalls: false,
            emergencyOnly: false
          },
          emergencyContact: "Emergency Contact",
          emergencyPhone: "+65 9123 4567",
          cmePoints: 120,
          lastCMEUpdate: new Date("2024-10-01"),
          professionalDevelopment: [],
          emergencyAvailability: true,
          onCallSchedule: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          clinics: [],
          specialtiesRel: [],
          availabilities: [],
          educationHistory: [],
          certifications: [],
          memberships: [],
          awardsRel: [],
          schedules: [],
          leaves: [],
          appointments: [],
          searchIndex: [],
          auditLogs: [],
          clinicRelation: {
            id: "rel1",
            doctorId: "1",
            clinicId: clinicId,
            role: "ATTENDING",
            capacity: "FULL_TIME",
            isPrimary: true,
            workingDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
            startTime: "09:00",
            endTime: "17:00",
            clinicSpecializations: ["Family Medicine", "Chronic Disease Management"],
            primaryServices: ["General Consultation", "Health Screening", "Chronic Disease Follow-up"],
            consultationFee: 60,
            consultationDuration: 30,
            emergencyConsultationFee: 80,
            clinicRating: 4.8,
            clinicReviewCount: 89,
            clinicPatientCount: 542,
            appointmentTypes: [
              { type: "Regular", duration: 30, description: "Standard consultation", isAvailable: true, advanceBookingRequired: false },
              { type: "Extended", duration: 45, description: "Extended consultation", isAvailable: true, advanceBookingRequired: true }
            ],
            walkInAllowed: true,
            advanceBookingDays: 14,
            acceptedInsurance: ["Medisave", "Medishield", "CHAS"],
            medisaveAccepted: true,
            chasAccepted: true,
            verificationStatus: "VERIFIED",
            verificationDate: new Date("2024-01-15"),
            verificationNotes: "All documents verified",
            startDate: new Date("2023-03-01"),
            createdAt: new Date(),
            updatedAt: new Date()
          },
          availability: [
            {
              id: "av1",
              doctorId: "1",
              clinicId: clinicId,
              date: new Date(),
              startTime: "09:00",
              endTime: "17:00",
              isAvailable: true,
              availabilityType: "REGULAR",
              appointmentType: "General Consultation",
              maxAppointments: 16,
              bookedAppointments: 8,
              availableSlots: 8,
              location: "Clinic Room 2",
              roomNumber: "R2",
              slotDuration: 30,
              breakDuration: 15,
              bufferTime: 10,
              isEmergency: false,
              isWalkIn: true,
              isTelehealth: false,
              ageRestrictions: {},
              genderRestrictions: [],
              conditionsJson: [],
              status: "ACTIVE",
              lastUpdated: new Date(),
              notes: "Available for walk-ins",
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ],
          performance: {
            totalAppointments: 1847,
            completionRate: 95.2,
            patientSatisfaction: 4.6,
            responseTime: 2.3
          },
          partnership: {
            isPreferred: true,
            partnershipLevel: "exclusive",
            collaborationScore: 95,
            referralCount: 23
          }
        }
        // Add more mock doctors...
      ]
      
      setDoctors(mockDoctors)
      setLoading(false)
    }

    fetchClinicDoctors()
  }, [clinicId])

  const filteredDoctors = React.useMemo(() => {
    return doctors.filter(doctor => {
      const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           doctor.specialties.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesSpecialty = specialtyFilter === "all" || 
                              doctor.specialties.includes(specialtyFilter)
      
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && doctor.isActive) ||
                           (statusFilter === "inactive" && !doctor.isActive) ||
                           (statusFilter === "available" && doctor.availability.some(a => a.isAvailable))
      
      const matchesCapacity = capacityFilter === "all" ||
                             doctor.clinicRelation.capacity === capacityFilter
      
      return matchesSearch && matchesSpecialty && matchesStatus && matchesCapacity
    })
  }, [doctors, searchQuery, specialtyFilter, statusFilter, capacityFilter])

  const getSpecialties = React.useMemo(() => {
    const allSpecialties = doctors.flatMap(d => d.specialties)
    return [...new Set(allSpecialties)].sort()
  }, [doctors])

  const renderDoctorCard = (doctor: DoctorWithClinicDetails) => {
    const isPreferred = doctor.partnership?.isPreferred || false
    
    return (
      <Card key={doctor.id} className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="space-y-2">
              <CardTitle className="text-xl leading-tight">
                <div className="flex items-center gap-2">
                  {doctor.name}
                  {isPreferred && (
                    <Badge variant="default" className="text-xs">
                      <Award className="h-3 w-3 mr-1" />
                      Preferred
                    </Badge>
                  )}
                </div>
              </CardTitle>
              <div className="flex flex-wrap gap-1">
                {doctor.specialties.map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              {/* Rating */}
              {doctor.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{doctor.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({doctor.reviewCount})
                  </span>
                </div>
              )}
              
              {/* Status */}
              <div className="flex items-center gap-2">
                {doctor.isActive ? (
                  <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-red-600 border-red-600">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Role and Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">Role</h4>
              <Badge variant="outline">
                {doctor.clinicRelation.role.replace('_', ' ')}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">Capacity</h4>
              <Badge variant="outline">
                {doctor.clinicRelation.capacity.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Schedule */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Schedule
            </h4>
            
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {doctor.clinicRelation.workingDays.map((day, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {day.charAt(0) + day.slice(1).toLowerCase()}
                  </Badge>
                ))}
              </div>
              
              {doctor.clinicRelation.startTime && doctor.clinicRelation.endTime && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {doctor.clinicRelation.startTime} - {doctor.clinicRelation.endTime}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Performance Metrics */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Performance
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Completion Rate</div>
                <div className="font-semibold">{doctor.performance.completionRate}%</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Patient Satisfaction</div>
                <div className="font-semibold">{doctor.performance.patientSatisfaction}/5.0</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Total Appointments</div>
                <div className="font-semibold">{doctor.performance.totalAppointments}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Response Time</div>
                <div className="font-semibold">{doctor.performance.responseTime}h</div>
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Languages</h4>
            <div className="flex flex-wrap gap-1">
              {doctor.languages.map((language, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {language}
                </Badge>
              ))}
            </div>
          </div>

          {/* Partnership Status */}
          {doctor.partnership && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground">Partnership</h4>
                <div className="flex items-center gap-2">
                  <Badge variant={doctor.partnership.partnershipLevel === 'exclusive' ? 'default' : 'secondary'}>
                    {doctor.partnership.partnershipLevel} Partner
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Score: {doctor.partnership.collaborationScore}%
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button className="flex-1" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              View Schedule
            </Button>
            <Button variant="outline" size="sm">
              <UserCheck className="h-4 w-4 mr-2" />
              Manage
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clinic Doctor Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {clinicName} - Doctor Management
          <Badge variant="outline" className="ml-auto">
            {filteredDoctors.length} doctor{filteredDoctors.length === 1 ? '' : 's'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search doctors by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {getSpecialties.map(specialty => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="available">Available Today</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={capacityFilter} onValueChange={setCapacityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by capacity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Capacities</SelectItem>
              <SelectItem value="FULL_TIME">Full-time</SelectItem>
              <SelectItem value="PART_TIME">Part-time</SelectItem>
              <SelectItem value="VISITING">Visiting</SelectItem>
              <SelectItem value="LOCUM">Locum</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{doctors.length}</div>
                  <div className="text-xs text-muted-foreground">Total Doctors</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {doctors.filter(d => d.isActive).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {doctors.filter(d => d.availability.some(a => a.isAvailable)).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Available Today</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {doctors.filter(d => d.partnership?.isPreferred).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Preferred Partners</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Doctor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDoctors.map(renderDoctorCard)}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No doctors found matching your criteria</p>
            <Button variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Doctor
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}