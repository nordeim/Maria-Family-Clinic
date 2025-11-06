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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"
import {
  Search,
  Route,
  Star,
  MapPin,
  Clock,
  Users,
  Award,
  Phone,
  Mail,
  Building,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Zap,
  Brain,
  Target,
  Globe,
  Calendar,
  Filter,
  ArrowRight,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Doctor, DoctorClinic, DoctorAvailability, Clinic } from "@/types/doctor"

interface IntelligentDoctorAssignmentProps {
  clinicId?: string
  className?: string
}

interface AssignmentCriteria {
  specialtyRequired: string[]
  urgencyLevel: 'routine' | 'urgent' | 'emergency' | 'same-day'
  preferredLanguages: string[]
  patientAge?: number
  patientGender?: 'male' | 'female' | 'other'
  medicalComplexity: 'simple' | 'moderate' | 'complex' | 'specialized'
  location?: string
  appointmentType: 'in-person' | 'telehealth' | 'emergency'
  maxDistance?: number // km
  maxWaitTime?: number // hours
  insuranceRequirements?: string[]
  specialNeeds?: string[]
}

interface DoctorAssignment {
  doctor: Doctor
  clinic: Clinic
  doctorClinic: DoctorClinic
  availability: DoctorAvailability
  assignmentScore: number
  assignmentReasons: string[]
  estimatedWaitTime: number
  consultationFee: number
  distance: number
  languageMatch: number // percentage
  specialtyMatch: number // percentage
  complexityMatch: number // percentage
  availabilityScore: number
  partnershipBonus: number
  isRecommended: boolean
  alternatives: DoctorAssignment[]
}

export function IntelligentDoctorAssignment({ 
  clinicId, 
  className 
}: IntelligentDoctorAssignmentProps) {
  const [criteria, setCriteria] = React.useState<AssignmentCriteria>({
    specialtyRequired: [],
    urgencyLevel: 'routine',
    preferredLanguages: ['English'],
    medicalComplexity: 'simple',
    appointmentType: 'in-person',
  })
  
  const [assignments, setAssignments] = React.useState<DoctorAssignment[]>([])
  const [loading, setLoading] = React.useState(false)
  const [selectedAssignment, setSelectedAssignment] = React.useState<DoctorAssignment | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeTab, setActiveTab] = React.useState("search")

  // Mock specialties for the select component
  const availableSpecialties = [
    'Family Medicine', 'Internal Medicine', 'Cardiology', 'Dermatology',
    'Endocrinology', 'Gastroenterology', 'Neurology', 'Oncology',
    'Orthopedics', 'Pediatrics', 'Psychiatry', 'Radiology'
  ]

  const availableLanguages = [
    'English', 'Mandarin', 'Malay', 'Tamil', 'Cantonese', 'Hokkien'
  ]

  // Intelligent doctor matching algorithm
  const findBestMatches = React.useCallback(async () => {
    setLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock doctor assignments - in real app this would call the intelligent matching API
    const mockAssignments: DoctorAssignment[] = [
      {
        doctor: {
          id: "1",
          name: "Dr. Sarah Chen",
          email: "sarah.chen@clinic.sg",
          phone: "+65 9123 4567",
          medicalLicense: "ML123456",
          specialties: ["Family Medicine", "Internal Medicine"],
          languages: ["English", "Mandarin"],
          qualifications: ["MBBS", "MCGP"],
          experienceYears: 8,
          bio: "Experienced family physician",
          isActive: true,
          isVerified: true,
          rating: 4.8,
          reviewCount: 127,
          patientSatisfaction: 4.6,
          totalAppointments: 1847,
          currency: "SGD",
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
          emergencyAvailability: true,
          cmePoints: 120,
          achievements: [],
          awards: [],
          publications: [],
          researchInterests: [],
          specializations: [],
          boardCertifications: [],
          professionalMemberships: [],
          careerHighlights: [],
          previousPositions: [],
          profileImage: undefined,
          consultationFee: 60,
          verificationDate: undefined,
          verificationNotes: undefined,
          appointmentCompletionRate: undefined,
          specializationPopularity: undefined,
          languagePreference: {},
          dataRetentionPeriod: undefined,
          preferredContactMethod: undefined,
          communicationPreferences: {
            emailNotifications: true,
            smsReminders: true,
            phoneCalls: false,
            emergencyOnly: false
          },
          emergencyContact: undefined,
          emergencyPhone: undefined,
          lastCMEUpdate: undefined,
          professionalDevelopment: [],
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
          auditLogs: []
        },
        clinic: {
          id: "clinic1",
          name: "Central Family Clinic",
          address: "123 Main Street, Singapore 123456",
          postalCode: "123456",
          phone: "+65 6234 5678",
          email: "info@centralfamily.sg",
          website: "https://centralfamily.sg",
          latitude: 1.3521,
          longitude: 103.8198,
          location: {} as any,
          operatingHours: {},
          facilities: ["Wheelchair Access", "Parking"],
          accreditationStatus: "verified",
          emergencyPhone: undefined,
          afterHoursPhone: undefined,
          establishedYear: 2010,
          licenseNumber: undefined,
          licenseExpiry: undefined,
          isActive: true,
          isVerified: true,
          rating: 4.6,
          reviewCount: 234,
          createdAt: new Date(),
          updatedAt: new Date(),
          services: [],
          languages: [],
          doctors: [],
          enquiries: [],
          operatingHoursDays: [],
          reviews: [],
          availabilities: [],
          doctorAvailabilities: [],
          serviceExpertise: [],
          referringClinics: [],
          referredClinics: []
        },
        doctorClinic: {
          id: "rel1",
          doctorId: "1",
          clinicId: "clinic1",
          role: "ATTENDING",
          capacity: "FULL_TIME",
          isPrimary: true,
          workingDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
          startTime: "09:00",
          endTime: "17:00",
          clinicSpecializations: ["Family Medicine"],
          primaryServices: ["General Consultation"],
          consultationFee: 60,
          consultationDuration: 30,
          emergencyConsultationFee: 80,
          clinicRating: 4.8,
          clinicReviewCount: 89,
          clinicPatientCount: 542,
          appointmentTypes: [],
          walkInAllowed: true,
          advanceBookingDays: 14,
          acceptedInsurance: ["Medisave", "CHAS"],
          medisaveAccepted: true,
          chasAccepted: true,
          verificationStatus: "VERIFIED",
          verificationDate: new Date(),
          verificationNotes: undefined,
          startDate: new Date(),
          endDate: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        availability: {
          id: "av1",
          doctorId: "1",
          clinicId: "clinic1",
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
          notes: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        assignmentScore: 95,
        assignmentReasons: [
          "Perfect specialty match for general consultation",
          "Available today within 2 hours",
          "Speaks preferred languages (English, Mandarin)",
          "High patient satisfaction (4.6/5)",
          "Preferred partner clinic"
        ],
        estimatedWaitTime: 1.5,
        consultationFee: 60,
        distance: 2.3,
        languageMatch: 100,
        specialtyMatch: 100,
        complexityMatch: 100,
        availabilityScore: 95,
        partnershipBonus: 10,
        isRecommended: true,
        alternatives: []
      },
      // Add more mock assignments...
    ]
    
    setAssignments(mockAssignments)
    setLoading(false)
  }, [criteria])

  const handleSearch = () => {
    findBestMatches()
  }

  const handleCriteriaChange = (field: keyof AssignmentCriteria, value: any) => {
    setCriteria(prev => ({ ...prev, [field]: value }))
  }

  const addSpecialty = (specialty: string) => {
    if (!criteria.specialtyRequired.includes(specialty)) {
      handleCriteriaChange('specialtyRequired', [...criteria.specialtyRequired, specialty])
    }
  }

  const removeSpecialty = (specialty: string) => {
    handleCriteriaChange('specialtyRequired', criteria.specialtyRequired.filter(s => s !== specialty))
  }

  const addLanguage = (language: string) => {
    if (!criteria.preferredLanguages.includes(language)) {
      handleCriteriaChange('preferredLanguages', [...criteria.preferredLanguages, language])
    }
  }

  const removeLanguage = (language: string) => {
    handleCriteriaChange('preferredLanguages', criteria.preferredLanguages.filter(l => l !== language))
  }

  const renderAssignmentCard = (assignment: DoctorAssignment) => {
    return (
      <Card key={assignment.doctor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="space-y-2">
              <CardTitle className="text-xl leading-tight flex items-center gap-2">
                {assignment.doctor.name}
                {assignment.isRecommended && (
                  <Badge variant="default" className="text-xs">
                    <Brain className="h-3 w-3 mr-1" />
                    AI Recommended
                  </Badge>
                )}
              </CardTitle>
              <div className="flex flex-wrap gap-1">
                {assignment.doctor.specialties.map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              {/* Assignment Score */}
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-lg font-bold">{assignment.assignmentScore}%</span>
                <span className="text-xs text-muted-foreground">match</span>
              </div>
              
              {/* Rating */}
              {assignment.doctor.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{assignment.doctor.rating}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Clinic</div>
              <div className="font-semibold">{assignment.clinic.name}</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Wait Time</div>
              <div className="font-semibold flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {assignment.estimatedWaitTime}h
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Fee</div>
              <div className="font-semibold">S${assignment.consultationFee}</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Distance</div>
              <div className="font-semibold flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {assignment.distance}km
              </div>
            </div>
          </div>

          <Separator />

          {/* Match Indicators */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Match Quality
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Language Match</span>
                  <span>{assignment.languageMatch}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${assignment.languageMatch}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Specialty Match</span>
                  <span>{assignment.specialtyMatch}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${assignment.specialtyMatch}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Availability</span>
                  <span>{assignment.availabilityScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${assignment.availabilityScore}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Complexity Fit</span>
                  <span>{assignment.complexityMatch}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full" 
                    style={{ width: `${assignment.complexityMatch}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Assignment Reasons */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Why This Match
            </h4>
            <ul className="space-y-1">
              {assignment.assignmentReasons.slice(0, 3).map((reason, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Languages */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Languages</h4>
            <div className="flex flex-wrap gap-1">
              {assignment.doctor.languages.map((language, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  {language}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button 
              className="flex-1" 
              onClick={() => setSelectedAssignment(assignment)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
            <Button variant="outline" size="sm">
              View Details
            </Button>
            <Button variant="ghost" size="sm">
              <ArrowRight className="h-4 w-4 mr-2" />
              Next Option
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Intelligent Doctor Assignment & Routing
          <Badge variant="outline" className="ml-auto">
            AI-Powered Matching
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">Smart Search</TabsTrigger>
            <TabsTrigger value="criteria">Search Criteria</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                Our AI analyzes specialty match, language preferences, availability, distance, and patient complexity 
                to recommend the best doctors for your needs.
              </AlertDescription>
            </Alert>

            {/* Quick Search */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Describe your medical need (e.g., 'chest pain', 'skin rash', 'diabetes check-up')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Find Best Doctors
                </Button>
                
                <Button variant="outline" onClick={() => setActiveTab("criteria")}>
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Search
                </Button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="space-y-4">
              <h3 className="font-semibold">Quick Filters</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Urgency</label>
                  <Select 
                    value={criteria.urgencyLevel} 
                    onValueChange={(value) => handleCriteriaChange('urgencyLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="same-day">Same Day</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Complexity</label>
                  <Select 
                    value={criteria.medicalComplexity} 
                    onValueChange={(value) => handleCriteriaChange('medicalComplexity', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="complex">Complex</SelectItem>
                      <SelectItem value="specialized">Specialized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Appointment Type</label>
                  <Select 
                    value={criteria.appointmentType} 
                    onValueChange={(value) => handleCriteriaChange('appointmentType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-person">In-Person</SelectItem>
                      <SelectItem value="telehealth">Telehealth</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="criteria" className="space-y-4">
            <div className="space-y-4">
              {/* Required Specialties */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Required Specialties</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {criteria.specialtyRequired.map((specialty) => (
                    <Badge key={specialty} variant="default" className="cursor-pointer" onClick={() => removeSpecialty(specialty)}>
                      {specialty} ×
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={addSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add specialty..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSpecialties
                      .filter(s => !criteria.specialtyRequired.includes(s))
                      .map(specialty => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              {/* Preferred Languages */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Preferred Languages</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {criteria.preferredLanguages.map((language) => (
                    <Badge key={language} variant="outline" className="cursor-pointer" onClick={() => removeLanguage(language)}>
                      {language} ×
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={addLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add language..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages
                      .filter(l => !criteria.preferredLanguages.includes(l))
                      .map(language => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              {/* Patient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Patient Age (Optional)</label>
                  <Input
                    type="number"
                    placeholder="Age"
                    value={criteria.patientAge || ''}
                    onChange={(e) => handleCriteriaChange('patientAge', parseInt(e.target.value) || undefined)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Patient Gender (Optional)</label>
                  <Select 
                    value={criteria.patientGender || ''} 
                    onValueChange={(value) => handleCriteriaChange('patientGender', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Distance (km)</label>
                  <Input
                    type="number"
                    placeholder="Distance limit"
                    value={criteria.maxDistance || ''}
                    onChange={(e) => handleCriteriaChange('maxDistance', parseInt(e.target.value) || undefined)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Wait Time (hours)</label>
                  <Input
                    type="number"
                    placeholder="Wait time limit"
                    value={criteria.maxWaitTime || ''}
                    onChange={(e) => handleCriteriaChange('maxWaitTime', parseInt(e.target.value) || undefined)}
                  />
                </div>
              </div>

              <Button onClick={handleSearch} disabled={loading} className="w-full">
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Find Best Matches
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Finding the best doctor matches...</span>
                </div>
              </div>
            ) : (
              <>
                {assignments.length > 0 && (
                  <>
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Found {assignments.length} doctors matching your criteria. 
                        Showing recommendations in order of best match.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-6">
                      {assignments.map(renderAssignmentCard)}
                    </div>
                  </>
                )}

                {assignments.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No doctors found matching your criteria. Try adjusting your search parameters.
                    </p>
                    <Button variant="outline" onClick={() => setActiveTab("search")}>
                      Adjust Search
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}