"use client"

import React, { useState, useEffect, useMemo } from "react"
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Star, 
  Brain, 
  Target, 
  Sparkles,
  TrendingUp,
  Award,
  Users,
  Settings,
  RefreshCw,
  Grid3X3,
  List,
  SlidersHorizontal,
  Heart,
  Shield,
  DollarSign,
  Languages,
  Calendar,
  Eye,
  ArrowUpDown
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { DoctorRecommendationEngine } from "./doctor-recommendation-engine"
import { RecommendationDashboard } from "./recommendation-dashboard"
import { FeedbackCollectionSystem, FeedbackAnalyticsDashboard } from "./feedback-collection-system"
import { DoctorSearchFilters } from "@/components/search/doctor-search-filters"
import { EnhancedDoctorCard } from "@/components/healthcare/enhanced-doctor-card"
import { Doctor, DoctorClinic } from "@/types/doctor"
import { UserHealthProfile, DoctorRecommendation } from "./doctor-recommendation-engine"

// =============================================================================
// MAIN DOCTOR DISCOVERY PAGE
// =============================================================================

interface DoctorDiscoveryPageProps {
  initialDoctors?: Doctor[]
  userProfile?: UserHealthProfile
  onDoctorSelect?: (doctor: Doctor, recommendation?: DoctorRecommendation) => void
  onBookAppointment?: (doctor: Doctor, clinicId: string) => void
}

export function DoctorDiscoveryPage({
  initialDoctors = generateDummyDoctors(),
  userProfile,
  onDoctorSelect,
  onBookAppointment
}: DoctorDiscoveryPageProps) {
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>(initialDoctors)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFilters, setSearchFilters] = useState({})
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("relevance")
  const [loading, setLoading] = useState(false)
  
  // Recommendation system state
  const [recommendations, setRecommendations] = useState<DoctorRecommendation[]>([])
  const [recommendationMode, setRecommendationMode] = useState<"ai" | "search" | "hybrid">("ai")
  const [personalized, setPersonalized] = useState(true)
  const [showExplanations, setShowExplanations] = useState(true)
  const [confidenceThreshold, setConfidenceThreshold] = useState(50)
  
  // Feedback and analytics
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [feedbackMode, setFeedbackMode] = useState(false)
  const [sessionId] = useState(() => generateSessionId())
  const [userId] = useState(() => generateUserId())

  // Refresh doctors data
  const handleRefreshDoctors = async () => {
    setLoading(true)
    try {
      // Simulate API call to refresh doctor data
      await new Promise(resolve => setTimeout(resolve, 1000))
      setAvailableDoctors(generateDummyDoctors(true)) // Fresh data
    } catch (error) {
      console.error("Failed to refresh doctors:", error)
    } finally {
      setLoading(false)
    }
  }

  // Handle recommendation feedback
  const handleFeedback = async (feedback: any) => {
    try {
      // In a real app, this would send feedback to your backend
      console.log("Feedback submitted:", feedback)
      
      // Simulate storing feedback
      await new Promise(resolve => setTimeout(resolve, 300))
    } catch (error) {
      console.error("Failed to submit feedback:", error)
    }
  }

  // Handle doctor selection
  const handleDoctorSelect = (doctor: Doctor, recommendation?: DoctorRecommendation) => {
    onDoctorSelect?.(doctor, recommendation)
    
    // Track recommendation success
    if (recommendation) {
      handleFeedback({
        recommendationId: recommendation.doctor.id,
        doctorId: doctor.id,
        feedback: "viewed",
        timestamp: new Date(),
        context: { recommendationType: recommendation.recommendationType }
      })
    }
  }

  // Filter and sort doctors based on search and filters
  const filteredAndSortedDoctors = useMemo(() => {
    let filtered = availableDoctors

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialties.some(s => s.toLowerCase().includes(query)) ||
        doctor.languages.some(l => l.toLowerCase().includes(query))
      )
    }

    // Apply additional filters
    if (searchFilters) {
      // This would integrate with actual filter logic
    }

    // Sort doctors
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        case "experience":
          return (b.experienceYears || 0) - (a.experienceYears || 0)
        case "distance":
          // This would calculate actual distance
          return 0 // Placeholder
        case "availability":
          // This would sort by next available appointment
          return 0 // Placeholder
        default:
          return 0 // Keep original order for relevance
      }
    })

    return sorted
  }, [availableDoctors, searchQuery, searchFilters, sortBy])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                Doctor Discovery & Recommendations
              </h1>
              <p className="text-muted-foreground mt-2">
                AI-powered doctor discovery with personalized recommendations based on your health profile
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setFeedbackMode(!feedbackMode)}
              >
                <Target className="h-4 w-4 mr-2" />
                Feedback
              </Button>
              
              <Button
                variant="outline"
                onClick={handleRefreshDoctors}
                disabled={loading}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Available Doctors"
              value={availableDoctors.length}
              icon={<Users className="h-5 w-5" />}
              color="text-blue-600"
            />
            <StatCard
              label="AI Recommendations"
              value={recommendations.length}
              icon={<Brain className="h-5 w-5" />}
              color="text-purple-600"
            />
            <StatCard
              label="Personalization"
              value={personalized ? "On" : "Off"}
              icon={<Sparkles className="h-5 w-5" />}
              color="text-green-600"
            />
            <StatCard
              label="Confidence Avg"
              value={recommendations.length > 0 ? 
                Math.round(recommendations.reduce((sum, r) => sum + r.confidenceScore, 0) / recommendations.length) 
                : 0
              }
              unit="%"
              icon={<Target className="h-5 w-5" />}
              color="text-orange-600"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Search & Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Doctors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, specialty, or condition..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="rating">Patient Rating</SelectItem>
                    <SelectItem value="experience">Experience</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="availability">Availability</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DoctorSearchFilters
                  onFiltersChange={setSearchFilters}
                  compact
                />
              </CardContent>
            </Card>

            {/* AI Recommendation Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="personalized">Personalized Mode</Label>
                  <Switch
                    id="personalized"
                    checked={personalized}
                    onCheckedChange={setPersonalized}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="explanations">Show Explanations</Label>
                  <Switch
                    id="explanations"
                    checked={showExplanations}
                    onCheckedChange={setShowExplanations}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Confidence Threshold</Label>
                  <Select
                    value={confidenceThreshold.toString()}
                    onValueChange={(value) => setConfidenceThreshold(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20% (More Results)</SelectItem>
                      <SelectItem value="50">50% (Balanced)</SelectItem>
                      <SelectItem value="70">70% (High Quality)</SelectItem>
                      <SelectItem value="90">90% (Very High Quality)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Recommendation Mode</Label>
                  <Select
                    value={recommendationMode}
                    onValueChange={(value) => setRecommendationMode(value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai">AI-Powered</SelectItem>
                      <SelectItem value="search">Search-Based</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabbed Interface */}
            <Tabs defaultValue="recommendations" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="recommendations" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Recommendations
                </TabsTrigger>
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search Results
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Popular & Trending
                </TabsTrigger>
              </TabsList>

              {/* AI Recommendations Tab */}
              <TabsContent value="recommendations" className="space-y-6">
                <DoctorRecommendationEngine
                  userProfile={personalized ? userProfile : undefined}
                  availableDoctors={availableDoctors}
                  onDoctorSelect={handleDoctorSelect}
                  onProvideFeedback={(doctorId, feedback, comment) => 
                    handleFeedback({ doctorId, feedback, comment, timestamp: new Date() })
                  }
                  showExplanation={showExplanations}
                  personalized={personalized}
                  limit={15}
                />
                
                {/* Quick Feedback */}
                {feedbackMode && (
                  <Alert>
                    <Target className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Help us improve!</strong> Your feedback on recommendations helps us learn and provide better suggestions.
                      Rate recommendations as helpful or not helpful to train our AI system.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              {/* Search Results Tab */}
              <TabsContent value="search" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Search Results ({filteredAndSortedDoctors.length})
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    {searchQuery ? `Results for "${searchQuery}"` : "All doctors"}
                  </div>
                </div>

                {filteredAndSortedDoctors.length > 0 ? (
                  <div className={cn(
                    viewMode === "grid" 
                      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
                      : "space-y-4"
                  )}>
                    {filteredAndSortedDoctors.map((doctor) => (
                      <EnhancedDoctorCard
                        key={doctor.id}
                        doctor={doctor}
                        showRecommendationBadge={recommendationMode !== "search"}
                        onSelect={() => handleDoctorSelect(doctor)}
                        onBookAppointment={(clinicId) => onBookAppointment?.(doctor, clinicId)}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">No doctors found</h3>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search criteria or filters
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Trending Tab */}
              <TabsContent value="trending" className="space-y-6">
                <TrendingDoctorsSection
                  doctors={availableDoctors}
                  onDoctorSelect={handleDoctorSelect}
                  onBookAppointment={onBookAppointment}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Analytics Dashboard (Modal/Side Panel) */}
        {showAnalytics && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Recommendation Analytics</h2>
                  <Button variant="outline" onClick={() => setShowAnalytics(false)}>
                    Close
                  </Button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto h-[calc(90vh-80px)]">
                <RecommendationDashboard />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  icon: React.ReactNode
  color: string
}

function StatCard({ label, value, unit = "", icon, color }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={cn("p-2 rounded-lg bg-muted", color)}>
            {icon}
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold">{value}{unit}</div>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface TrendingDoctorsSectionProps {
  doctors: Doctor[]
  onDoctorSelect: (doctor: Doctor, recommendation?: DoctorRecommendation) => void
  onBookAppointment?: (doctor: Doctor, clinicId: string) => void
}

function TrendingDoctorsSection({ doctors, onDoctorSelect, onBookAppointment }: TrendingDoctorsSectionProps) {
  // Mock trending logic - in real app, this would come from analytics
  const trendingDoctors = doctors
    .filter(d => d.rating && d.rating >= 4.0)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 6)

  const newDoctors = doctors
    .filter(d => d.experienceYears && d.experienceYears <= 5)
    .slice(0, 4)

  const expertDoctors = doctors
    .filter(d => d.experienceYears && d.experienceYears >= 20)
    .slice(0, 4)

  return (
    <div className="space-y-8">
      {/* Top Rated */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Top Rated Doctors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingDoctors.map((doctor) => (
            <EnhancedDoctorCard
              key={doctor.id}
              doctor={doctor}
              showRecommendationBadge
              onSelect={() => onDoctorSelect(doctor)}
              onBookAppointment={(clinicId) => onBookAppointment?.(doctor, clinicId)}
              badge="⭐ Highly Rated"
            />
          ))}
        </div>
      </div>

      {/* New to Singapore */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          New to Singapore
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {newDoctors.map((doctor) => (
            <EnhancedDoctorCard
              key={doctor.id}
              doctor={doctor}
              showRecommendationBadge
              onSelect={() => onDoctorSelect(doctor)}
              onBookAppointment={(clinicId) => onBookAppointment?.(doctor, clinicId)}
              badge="🆕 New Doctor"
              compact
            />
          ))}
        </div>
      </div>

      {/* Expert Level */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-500" />
          Highly Experienced Experts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {expertDoctors.map((doctor) => (
            <EnhancedDoctorCard
              key={doctor.id}
              doctor={doctor}
              showRecommendationBadge
              onSelect={() => onDoctorSelect(doctor)}
              onBookAppointment={(clinicId) => onBookAppointment?.(doctor, clinicId)}
              badge="🏆 Expert Level"
              compact
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// DUMMY DATA HELPERS
// =============================================================================

function generateDummyDoctors(fresh = false): Doctor[] {
  const baseDoctors: Partial<Doctor>[] = [
    {
      id: "dr-001",
      name: "Dr. Sarah Lim",
      email: "sarah.lim@familyclinic.sg",
      phone: "+65 6123 4567",
      medicalLicense: "MCR123456",
      specialties: ["Family Medicine", "Internal Medicine"],
      languages: ["English", "Mandarin", "Malay"],
      qualifications: ["MBBS (Singapore)", "MCFP", "GDPM"],
      experienceYears: 12,
      bio: "Experienced family physician with special interest in preventive care and chronic disease management.",
      profileImage: "/images/doctors/dr-sarah-lim.jpg",
      consultationFee: 120,
      currency: "SGD",
      isActive: true,
      isVerified: true,
      rating: 4.6,
      reviewCount: 156,
      patientSatisfaction: 4.7,
      totalAppointments: 2340,
      specializationPopularity: 0.85,
      languagePreference: { English: 60, Mandarin: 30, Malay: 10 },
      cmePoints: 45,
      emergencyAvailability: false,
      clinics: []
    },
    {
      id: "dr-002",
      name: "Dr. Michael Chen",
      email: "michael.chen@heartcenter.sg",
      phone: "+65 6234 5678",
      medicalLicense: "MCR234567",
      specialties: ["Cardiology", "Interventional Cardiology"],
      languages: ["English", "Mandarin"],
      qualifications: ["MBBS (Singapore)", "MRCP (UK)", "FACC", "FSCAI"],
      experienceYears: 18,
      bio: "Leading cardiologist specializing in coronary interventions and heart failure management.",
      profileImage: "/images/doctors/dr-michael-chen.jpg",
      consultationFee: 250,
      currency: "SGD",
      isActive: true,
      isVerified: true,
      rating: 4.8,
      reviewCount: 89,
      patientSatisfaction: 4.9,
      totalAppointments: 1200,
      specializationPopularity: 0.92,
      languagePreference: { English: 70, Mandarin: 30 },
      cmePoints: 38,
      emergencyAvailability: true,
      clinics: []
    },
    {
      id: "dr-003",
      name: "Dr. Priya Sharma",
      email: "priya.sharma@skincenter.sg",
      phone: "+65 6345 6789",
      medicalLicense: "MCR345678",
      specialties: ["Dermatology", "Aesthetic Medicine"],
      languages: ["English", "Hindi", "Tamil"],
      qualifications: ["MBBS (India)", "MRCP (UK)", "FRCP (Dermatology)", "Certificate in Aesthetic Medicine"],
      experienceYears: 8,
      bio: "Board-certified dermatologist with expertise in both medical and cosmetic dermatology.",
      profileImage: "/images/doctors/dr-priya-sharma.jpg",
      consultationFee: 180,
      currency: "SGD",
      isActive: true,
      isVerified: true,
      rating: 4.5,
      reviewCount: 234,
      patientSatisfaction: 4.6,
      totalAppointments: 1890,
      specializationPopularity: 0.78,
      languagePreference: { English: 50, Hindi: 30, Tamil: 20 },
      cmePoints: 32,
      emergencyAvailability: false,
      clinics: []
    }
  ]

  // Add more variety for demo
  const additionalDoctors: Partial<Doctor>[] = [
    {
      id: "dr-004",
      name: "Dr. James Wilson",
      specialties: ["Pediatrics"],
      languages: ["English"],
      experienceYears: 15,
      rating: 4.7,
      reviewCount: 178,
      consultationFee: 150,
      isActive: true,
      isVerified: true
    },
    {
      id: "dr-005",
      name: "Dr. Li Wei",
      specialties: ["Orthopedics", "Sports Medicine"],
      languages: ["English", "Mandarin"],
      experienceYears: 22,
      rating: 4.9,
      reviewCount: 92,
      consultationFee: 200,
      isActive: true,
      isVerified: true
    },
    {
      id: "dr-006",
      name: "Dr. Fatima Al-Zahra",
      specialties: ["Psychiatry", "Mental Health"],
      languages: ["English", "Arabic"],
      experienceYears: 10,
      rating: 4.4,
      reviewCount: 145,
      consultationFee: 220,
      isActive: true,
      isVerified: true
    }
  ]

  const allDoctors = [...baseDoctors, ...additionalDoctors]
  
  return allDoctors.map((doctor, index) => ({
    id: doctor.id || `dr-${String(index + 1).padStart(3, '0')}`,
    name: doctor.name || `Dr. Doctor ${index + 1}`,
    email: doctor.email || `doctor${index + 1}@clinic.sg`,
    phone: doctor.phone || `+65 6${String(index + 100).padStart(7, '0')}`,
    medicalLicense: doctor.medicalLicense || `MCR${String(100000 + index)}`,
    specialties: doctor.specialties || ["General Practice"],
    languages: doctor.languages || ["English"],
    qualifications: doctor.qualifications || ["MBBS"],
    experienceYears: doctor.experienceYears || 5 + index,
    bio: doctor.bio || "Experienced healthcare professional dedicated to patient care.",
    profileImage: doctor.profileImage,
    consultationFee: doctor.consultationFee || 100 + index * 20,
    currency: "SGD",
    isActive: true,
    isVerified: true,
    rating: doctor.rating || 4.0 + Math.random(),
    reviewCount: doctor.reviewCount || 50 + Math.floor(Math.random() * 200),
    patientSatisfaction: doctor.patientSatisfaction || 4.0 + Math.random(),
    totalAppointments: doctor.totalAppointments || 500 + Math.floor(Math.random() * 2000),
    specializationPopularity: doctor.specializationPopularity || Math.random(),
    languagePreference: doctor.languagePreference || { English: 100 },
    cmePoints: doctor.cmePoints || 20 + Math.floor(Math.random() * 30),
    emergencyAvailability: doctor.emergencyAvailability || false,
    clinics: doctor.clinics || [],
    gdprConsent: true,
    pdpaConsent: true,
    confidentialityLevel: "STANDARD" as any,
    createdAt: new Date(),
    updatedAt: new Date(),
    reviewCount: doctor.reviewCount || 50
  })) as Doctor[]
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generateUserId(): string {
  return `user_${Math.random().toString(36).substr(2, 9)}`
}

export type { DoctorDiscoveryPageProps }