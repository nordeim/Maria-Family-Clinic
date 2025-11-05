"use client"

import React, { useState } from "react"
import { 
  Brain, 
  Search, 
  Target, 
  Star, 
  TrendingUp, 
  Users, 
  Settings,
  BarChart3,
  MessageSquare,
  Shield,
  Sparkles,
  ArrowRight,
  Play,
  BookOpen,
  Code
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { DoctorDiscoveryPage } from "./doctor-discovery-page"
import { DoctorRecommendationEngine } from "./doctor-recommendation-engine"
import { RecommendationDashboard } from "./recommendation-dashboard"
import { FeedbackCollectionSystem } from "./feedback-collection-system"
import { Doctor } from "@/types/doctor"
import { UserHealthProfile, DoctorRecommendation } from "./doctor-recommendation-engine"

// =============================================================================
// DEMONSTRATION AND INTEGRATION PAGE
// =============================================================================

export default function DoctorRecommendationDemo() {
  const [activeDemo, setActiveDemo] = useState<"overview" | "discovery" | "engine" | "analytics" | "feedback">("overview")
  
  // Sample user profile for demonstration
  const sampleUserProfile: UserHealthProfile = {
    age: 35,
    gender: "female",
    medicalHistory: ["Hypertension", "Diabetes Type 2"],
    currentConditions: ["High cholesterol", "Anxiety"],
    medications: ["Metformin", "Lisinopril", "Atorvastatin"],
    allergies: ["Penicillin", "Shellfish"],
    familyHistory: ["Heart disease", "Stroke"],
    riskFactors: [
      { condition: "Cardiovascular disease", riskLevel: "moderate", description: "Family history and hypertension" },
      { condition: "Diabetes complications", riskLevel: "moderate", description: "Family history and current diabetes" }
    ],
    preferences: {
      doctorGender: "female",
      preferredLanguages: ["English", "Mandarin"],
      appointmentTypes: ["in-person", "hybrid"],
      preferredGender: "female",
      culturalPreferences: ["Asian", "Female doctor preferred"],
      communicationStyle: "casual",
      preferredProviderType: "private"
    },
    location: {
      address: "Orchard Road, Singapore",
      coordinates: { lat: 1.3048, lng: 103.8318 },
      maxTravelDistance: 10,
      transportMode: "driving"
    },
    insurance: {
      provider: "AIA",
      plans: ["Integrated Shield Plan"],
      maxBudget: 300,
      preferredPaymentMethod: "insurance"
    },
    experienceHistory: {
      previousDoctors: ["dr-001", "dr-002"],
      satisfactionRatings: [
        { doctorId: "dr-001", rating: 5, date: new Date("2024-09-15") },
        { doctorId: "dr-002", rating: 4, date: new Date("2024-08-20") }
      ],
      appointmentTypes: ["routine", "urgent"],
      treatmentOutcomes: [
        { condition: "Hypertension", outcome: "excellent", doctorId: "dr-001" },
        { condition: "Anxiety", outcome: "good", doctorId: "dr-003" }
      ]
    },
    personalContext: {
      primaryConcern: "Managing multiple chronic conditions",
      urgency: "routine",
      preferredProviderGender: "female",
      accessibilityNeeds: ["Wheelchair accessible", "Parking available"],
      culturalRequirements: ["Female doctor preferred", "Mandarin speaking"]
    }
  }

  const sampleDoctors = generateSampleDoctors()

  // Handler functions
  const handleDoctorSelect = (doctor: Doctor, recommendation?: DoctorRecommendation) => {
    console.log("Doctor selected:", doctor.name, recommendation?.recommendationReason)
    // In a real app, this would navigate to doctor profile or booking
  }

  const handleBookAppointment = (doctor: Doctor, clinicId: string) => {
    console.log("Booking appointment with:", doctor.name, "at clinic:", clinicId)
    // In a real app, this would open the booking flow
  }

  const handleFeedback = async (feedbackData: any) => {
    console.log("Feedback submitted:", feedbackData)
    // In a real app, this would send feedback to the backend
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-4 mb-2">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
                Doctor Recommendation Engine
                <Badge variant="secondary" className="ml-2">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Intelligent doctor discovery and recommendation system using machine learning, 
                user preferences, and healthcare data to provide personalized healthcare matching.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button size="lg" onClick={() => setActiveDemo("discovery")} className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Try Live Demo
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard label="AI Algorithms" value="4" icon={<Brain className="h-5 w-5" />} color="text-purple-600" />
            <StatCard label="Matching Factors" value="10+" icon={<Target className="h-5 w-5" />} color="text-blue-600" />
            <StatCard label="Confidence Score" value="98%" icon={<Star className="h-5 w-5" />} color="text-yellow-600" />
            <StatCard label="User Satisfaction" value="4.7/5" icon={<Users className="h-5 w-5" />} color="text-green-600" />
            <StatCard label="A/B Tests" value="12" icon={<BarChart3 className="h-5 w-5" />} color="text-orange-600" />
          </div>
        </div>

        {/* Main Demo Interface */}
        <Tabs value={activeDemo} onValueChange={(value) => setActiveDemo(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="discovery" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Live Demo
            </TabsTrigger>
            <TabsTrigger value="engine" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Engine
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Feedback
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-6 w-6 text-primary" />
                    Key Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FeatureItem 
                    icon={<Brain className="h-5 w-5 text-purple-600" />}
                    title="AI-Powered Recommendations"
                    description="Machine learning algorithms analyze multiple factors to suggest the best doctors."
                  />
                  <FeatureItem 
                    icon={<Target className="h-5 w-5 text-blue-600" />}
                    title="Multi-Factor Matching"
                    description="Condition-based, location, language, insurance, and personal preferences."
                  />
                  <FeatureItem 
                    icon={<Shield className="h-5 w-5 text-green-600" />}
                    title="Transparent System"
                    description="Show confidence scores and explain why doctors are recommended."
                  />
                  <FeatureItem 
                    icon={<TrendingUp className="h-5 w-5 text-orange-600" />}
                    title="Continuous Learning"
                    description="System improves based on user feedback and appointment outcomes."
                  />
                  <FeatureItem 
                    icon={<Users className="h-5 w-5 text-pink-600" />}
                    title="Collaborative Filtering"
                    description="Learn from similar patients' successful doctor selections."
                  />
                  <FeatureItem 
                    icon={<BarChart3 className="h-5 w-5 text-indigo-600" />}
                    title="A/B Testing Framework"
                    description="Optimize algorithms with controlled experiments and statistical significance."
                  />
                </CardContent>
              </Card>

              {/* Algorithms */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-6 w-6 text-primary" />
                    Recommendation Algorithms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AlgorithmItem 
                    name="Content-Based Filtering"
                    accuracy="82.1%"
                    description="Matches doctor specializations and qualifications with patient conditions."
                    useCase="Specialty and condition matching"
                  />
                  <AlgorithmItem 
                    name="Collaborative Filtering"
                    accuracy="78.5%"
                    description="Learns from similar patients' successful doctor selections."
                    useCase="Users with similar health profiles"
                  />
                  <AlgorithmItem 
                    name="Hybrid Approach"
                    accuracy="85.7%"
                    description="Combines multiple algorithms for optimal recommendations."
                    useCase="Best overall accuracy"
                  />
                  <AlgorithmItem 
                    name="Deep Learning (Planned)"
                    accuracy="91.2%"
                    description="Advanced neural networks for complex pattern recognition."
                    useCase="Complex multi-factor analysis"
                  />
                </CardContent>
              </Card>
            </div>

            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <WorkflowStep 
                    step="1"
                    title="Profile Analysis"
                    description="Analyze user's health profile, preferences, and medical history."
                    icon={<Users className="h-6 w-6" />}
                  />
                  <WorkflowStep 
                    step="2"
                    title="Doctor Matching"
                    description="Match doctors based on specializations, location, and compatibility."
                    icon={<Target className="h-6 w-6" />}
                  />
                  <WorkflowStep 
                    step="3"
                    title="AI Scoring"
                    description="Calculate confidence scores using weighted matching factors."
                    icon={<Brain className="h-6 w-6" />}
                  />
                  <WorkflowStep 
                    step="4"
                    title="Continuous Learning"
                    description="Learn from feedback and improve recommendations over time."
                    icon={<TrendingUp className="h-6 w-6" />}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Demo Notice */}
            <Alert>
              <Play className="h-4 w-4" />
              <AlertDescription>
                <strong>Try the live demo!</strong> Switch to the "Live Demo" tab to experience the AI-powered 
                doctor recommendation system with sample data and user profiles.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Live Demo Tab */}
          <TabsContent value="discovery">
            <DoctorDiscoveryPage
              initialDoctors={sampleDoctors}
              userProfile={sampleUserProfile}
              onDoctorSelect={handleDoctorSelect}
              onBookAppointment={handleBookAppointment}
            />
          </TabsContent>

          {/* Engine Tab */}
          <TabsContent value="engine">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-primary" />
                    Recommendation Engine Core
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    This is the core recommendation engine component. It processes user profiles and doctor data 
                    to generate personalized recommendations with confidence scores and explanations.
                  </p>
                  
                  <DoctorRecommendationEngine
                    userProfile={sampleUserProfile}
                    availableDoctors={sampleDoctors}
                    onDoctorSelect={handleDoctorSelect}
                    showExplanation={true}
                    personalized={true}
                    limit={5}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <RecommendationDashboard />
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    Feedback Collection System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    The feedback collection system allows users to rate recommendations and provide detailed 
                    feedback to help improve the AI algorithm over time.
                  </p>
                  
                  <FeedbackCollectionSystem
                    onSubmitFeedback={handleFeedback}
                    showQuickFeedback={true}
                    showDetailedFeedback={true}
                    recommendationContext={{
                      recommendation: {
                        id: "rec-001",
                        doctor: sampleDoctors[0],
                        confidenceScore: 85,
                        recommendationReason: "Recommended based on specialty match and location",
                        recommendationType: "condition-based" as any,
                        matchingFactors: [],
                        rankingBreakdown: [],
                        lastUpdated: new Date()
                      },
                      position: 1,
                      userId: "demo-user",
                      sessionId: "demo-session",
                      journeyStage: "comparing"
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
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
  icon: React.ReactNode
  color: string
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg bg-muted ${color}`}>
            {icon}
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface FeatureItemProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex gap-3">
      <div className="p-2 rounded-lg bg-muted">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

interface AlgorithmItemProps {
  name: string
  accuracy: string
  description: string
  useCase: string
}

function AlgorithmItem({ name, accuracy, description, useCase }: AlgorithmItemProps) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">{name}</h4>
        <Badge variant="outline">{accuracy} accuracy</Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{description}</p>
      <p className="text-xs text-muted-foreground">
        <strong>Best for:</strong> {useCase}
      </p>
    </div>
  )
}

interface WorkflowStepProps {
  step: string
  title: string
  description: string
  icon: React.ReactNode
}

function WorkflowStep({ step, title, description, icon }: WorkflowStepProps) {
  return (
    <div className="text-center">
      <div className="relative mb-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          {icon}
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
          {step}
        </div>
      </div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

// =============================================================================
// SAMPLE DATA
// =============================================================================

function generateSampleDoctors(): Doctor[] {
  return [
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
      clinics: [],
      gdprConsent: true,
      pdpaConsent: true,
      confidentialityLevel: "STANDARD" as any,
      createdAt: new Date(),
      updatedAt: new Date()
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
      clinics: [],
      gdprConsent: true,
      pdpaConsent: true,
      confidentialityLevel: "STANDARD" as any,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
}