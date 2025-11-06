'use client';

import React, { useState } from 'react';
import {
  HealthierSGOverview,
  BenefitExplanation,
  ProgramComparisonTool,
  SuccessStories,
  ProgramTimeline,
  FAQSection,
  ResourceDownload,
  ProgramNews,
  ProgramGuide,
  type ProgramOverviewData,
  type BenefitCategory,
  type ComparisonScheme,
  type SuccessStory,
  type TimelineMilestone,
  type FAQItem,
  type Resource,
  type NewsArticle,
  type GuideStep,
  Language,
  useEligibilityChecker,
  type EligibilityResult
} from '@/components/healthier-sg/program-info';

// Demo Page for Healthier SG Program Information Components
// This showcases all components with example data and integration

export default function ProgramInfoDemo() {
  const [selectedLanguage] = useState<Language>(Language.English);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Example program overview data
  const programOverview: ProgramOverviewData = {
    title: "Healthier SG - Singapore's Healthier Future",
    subtitle: "Comprehensive healthcare for every Singaporean",
    description: "Healthier SG is a national health programme that provides comprehensive, subsidised healthcare to all Singaporeans. Join us to get better health outcomes and peace of mind.",
    keyStats: {
      totalEnrollees: 1450000,
      avgSavings: 3200,
      satisfactionRate: 94.2,
      clinicsJoined: 1200
    },
    keyBenefits: [
      "Universal healthcare coverage",
      "Subsidised medical consultations",
      "Chronic disease management",
      "Preventive health screenings"
    ],
    enrollmentCTA: {
      primaryText: "Start Your Healthier SG Journey",
      secondaryText: "Join over 1.4 million Singaporeans",
      eligibilityCheckUrl: "/healthier-sg/eligibility-check"
    },
    programHighlights: [
      {
        title: "Comprehensive Coverage",
        description: "From preventive care to chronic disease management",
        icon: "medical-care"
      },
      {
        title: "Family-Friendly",
        description: "Healthcare for all ages from young to senior citizens",
        icon: "family"
      },
      {
        title: "Technology-Enabled",
        description: "Digital health records and convenient appointments",
        icon: "digital-health"
      },
      {
        title: "Affordable Care",
        description: "Subsidies and financial assistance available",
        icon: "affordable-care"
      }
    ]
  };

  // Example benefit categories data
  const benefitCategories: BenefitCategory[] = [
    {
      id: "primary-care",
      title: "Primary Care Services",
      description: "Your first point of contact for healthcare needs",
      icon: "doctor",
      benefits: [
        {
          title: "GP Consultations",
          description: "Subsidised visits to participating family clinics",
          subsidyAmount: 120,
          eligibility: "All Singaporeans",
          claimProcess: "Present NRIC/FIN at clinic",
          category: "primary-care"
        },
        {
          title: "Chronic Disease Management",
          description: "Regular monitoring and treatment for diabetes, hypertension, etc.",
          subsidyAmount: 300,
          eligibility: "Singaporeans 40+ with chronic conditions",
          claimProcess: "Auto-claimed through clinic system",
          category: "chronic-care"
        },
        {
          title: "Health Screenings",
          description: "Recommended health screenings based on age and risk factors",
          subsidyAmount: 200,
          eligibility: "Singaporeans 40+ every 3 years",
          claimProcess: "Book through clinic or HealthHub",
          category: "preventive-care"
        }
      ]
    },
    {
      id: "specialist-care",
      title: "Specialist & Hospital Care",
      description: "Access to specialist services when needed",
      icon: "hospital",
      benefits: [
        {
          title: "Specialist Outpatient Treatment",
          description: "Subsidised specialist consultations and treatments",
          subsidyAmount: 450,
          eligibility: "Singaporeans referred by GP",
          claimProcess: "Referral letter from participating clinic",
          category: "specialist-care"
        },
        {
          title: "Hospitalisation Coverage",
          description: "Financial protection for hospital stays",
          subsidyAmount: 2000,
          eligibility: "All Singaporeans",
          claimProcess: "Automatic deduction from bill",
          category: "hospital-care"
        }
      ]
    },
    {
      id: "wellness",
      title: "Health & Wellness",
      description: "Preventive care and health promotion programmes",
      icon: "wellness",
      benefits: [
        {
          title: "Vaccinations",
          description: "Recommended vaccinations for adults and children",
          subsidyAmount: 80,
          eligibility: "All Singaporeans",
          claimProcess: "Available at all participating clinics",
          category: "preventive-care"
        },
        {
          title: "Health Coaching",
          description: "Personalised health coaching and lifestyle programmes",
          subsidyAmount: 150,
          eligibility: "Singaporeans enrolled in programme",
          claimProcess: "Book through assigned clinic",
          category: "lifestyle"
        }
      ]
    }
  ];

  // Example comparison schemes data
  const comparisonSchemes: ComparisonScheme[] = [
    {
      id: "healthier-sg",
      name: "Healthier SG",
      description: "Comprehensive national healthcare programme",
      monthlyPremium: 25,
      annualLimit: 10000,
      coverageType: "Comprehensive",
      ageGroups: ["All ages"],
      keyFeatures: [
        "Universal coverage for all Singaporeans",
        "Integrated care with family doctors",
        "Chronic disease management",
        "Preventive health screenings"
      ],
      benefits: {
        gpConsultations: true,
        specialistReferrals: true,
        chronicCareManagement: true,
        healthScreenings: true,
        hospitalisation: true,
        medicationSubsidies: true
      },
      eligibility: "All Singaporeans",
      enrollmentFee: 0,
      additionalInfo: "No exclusions for pre-existing conditions"
    },
    {
      id: "chas",
      name: "CHAS",
      description: "Community Health Assist Scheme for outpatient care",
      monthlyPremium: 0,
      annualLimit: 1500,
      coverageType: "Outpatient Only",
      ageGroups: ["65+", "Pioneer Generation"],
      keyFeatures: [
        "Subsidised outpatient consultations",
        "Medication subsidies",
        "Dental care subsidies"
      ],
      benefits: {
        gpConsultations: true,
        specialistReferrals: false,
        chronicCareManagement: false,
        healthScreenings: false,
        hospitalisation: false,
        medicationSubsidies: true
      },
      eligibility: "Singaporeans 65+ or Pioneer Generation",
      enrollmentFee: 0,
      additionalInfo: "Focus on basic outpatient care"
    },
    {
      id: "merdeka",
      name: "Merdeka Generation Package",
      description: "Enhanced healthcare benefits for Merdeka Generation",
      monthlyPremium: 0,
      annualLimit: 2000,
      coverageType: "Enhanced Outpatient",
      ageGroups: ["60-64"],
      keyFeatures: [
        "Enhanced subsidies for outpatient care",
        "Additional medication subsidies",
        "Free health screenings",
        "Priority appointment slots"
      ],
      benefits: {
        gpConsultations: true,
        specialistReferrals: false,
        chronicCareManagement: true,
        healthScreenings: true,
        hospitalisation: false,
        medicationSubsidies: true
      },
      eligibility: "Singaporeans born 1959-1963",
      enrollmentFee: 0,
      additionalInfo: "Enhanced benefits for Merdeka Generation"
    },
    {
      id: "pg",
      name: "Pioneer Generation Package",
      description: "Comprehensive healthcare for Pioneer Generation",
      monthlyPremium: 0,
      annualLimit: 3000,
      coverageType: "Comprehensive",
      ageGroups: ["65+"],
      keyFeatures: [
        "Lifetime subsidies for outpatient care",
        "Enhanced medication subsidies",
        "Free annual health screenings",
        "Priority access to specialist care"
      ],
      benefits: {
        gpConsultations: true,
        specialistReferrals: true,
        chronicCareManagement: true,
        healthScreenings: true,
        hospitalisation: true,
        medicationSubsidies: true
      },
      eligibility: "Singaporeans born before 1950",
      enrollmentFee: 0,
      additionalInfo: "Lifetime healthcare subsidies"
    }
  ];

  // Example success stories data
  const successStories: SuccessStory[] = [
    {
      id: "story-1",
      title: "Managing Diabetes Successfully",
      patientName: "Mrs. Tan Sock Hoon",
      age: 65,
      condition: "Type 2 Diabetes",
      story: "Since joining Healthier SG, my diabetes is finally under control. The regular check-ups and health coaching have made all the difference. I feel healthier and more confident about my future.",
      outcomes: [
        "HbA1c reduced from 9.2% to 6.8%",
        "Weight loss of 8kg",
        "Reduced medication dosage",
        "Improved energy levels"
      ],
      timeframe: "12 months",
      clinicName: "Unity Family Clinic",
      benefitsReceived: ["Chronic Care Management", "Health Coaching", "Regular Screenings"],
      avatarUrl: "/images/testimonials/mrs-tan.jpg",
      featured: true,
      tags: ["diabetes", "senior-care", "chronic-care"]
    },
    {
      id: "story-2",
      title: "Early Detection Saved My Life",
      patientName: "Mr. David Lim",
      age: 52,
      condition: "High Blood Pressure",
      story: "The health screening through Healthier SG detected my high blood pressure early. Thanks to the programme's support, I've made lifestyle changes and my health has improved significantly.",
      outcomes: [
        "Blood pressure controlled",
        "Lifestyle modifications implemented",
        "Reduced cardiovascular risk",
        "Better quality of life"
      ],
      timeframe: "8 months",
      clinicName: "HealthFirst Medical Centre",
      benefitsReceived: ["Health Screenings", "Lifestyle Coaching", "Medication Subsidies"],
      avatarUrl: "/images/testimonials/mr-lim.jpg",
      featured: false,
      tags: ["hypertension", "mid-care", "preventive-care"]
    },
    {
      id: "story-3",
      title: "Family Healthcare Made Simple",
      patientName: "The Lee Family",
      age: 45,
      condition: "Family Health Management",
      story: "Having one programme that covers our whole family's healthcare needs has been wonderful. From my kids' vaccinations to my parents' chronic care management - everything is coordinated through our family clinic.",
      outcomes: [
        "Coordinated family healthcare",
        "All children up-to-date with vaccinations",
        "Parents' chronic conditions well-managed",
        "Significant cost savings"
      ],
      timeframe: "18 months",
      clinicName: "Unity Family Clinic",
      benefitsReceived: ["Family Care Coordination", "Vaccination Coverage", "Chronic Care"],
      avatarUrl: "/images/testimonials/lee-family.jpg",
      featured: true,
      tags: ["family-care", "comprehensive", "cost-effective"]
    }
  ];

  // Example timeline milestones data
  const timelineMilestones: TimelineMilestone[] = [
    {
      id: "milestone-1",
      title: "Initial Enrollment",
      description: "Complete eligibility check and select your family doctor",
      status: "completed",
      date: "2024-01-15",
      phase: "enrollment",
      requirements: [
        "Eligibility verification",
        "Clinic selection",
        "Initial health assessment"
      ],
      estimatedDuration: "2-4 weeks",
      nextAction: "Schedule first appointment"
    },
    {
      id: "milestone-2",
      title: "Health Assessment",
      description: "Comprehensive health screening and baseline measurements",
      status: "completed",
      date: "2024-02-01",
      phase: "assessment",
      requirements: [
        "Physical examination",
        "Blood tests",
        "Health risk assessment",
        "Baseline measurements"
      ],
      estimatedDuration: "1-2 hours",
      nextAction: "Review health plan"
    },
    {
      id: "milestone-3",
      title: "Personalised Health Plan",
      description: "Receive your customized health plan and goals",
      status: "active",
      date: "2024-02-10",
      phase: "planning",
      requirements: [
        "Health plan development",
        "Goal setting",
        "Resource allocation",
        "Timeline establishment"
      ],
      estimatedDuration: "Ongoing",
      nextAction: "Begin health plan implementation"
    },
    {
      id: "milestone-4",
      title: "Regular Monitoring",
      description: "Ongoing health monitoring and support",
      status: "upcoming",
      date: "2024-03-01",
      phase: "management",
      requirements: [
        "Regular check-ups",
        "Progress tracking",
        "Plan adjustments",
        "Support services"
      ],
      estimatedDuration: "Ongoing",
      nextAction: "Schedule quarterly review"
    },
    {
      id: "milestone-5",
      title: "Annual Review",
      description: "Comprehensive annual health review and plan update",
      status: "upcoming",
      date: "2025-02-01",
      phase: "review",
      requirements: [
        "Annual health screening",
        "Plan effectiveness review",
        "Goal assessment",
        "Next year planning"
      ],
      estimatedDuration: "Full day",
      nextAction: "Prepare for annual review"
    }
  ];

  // Example FAQ data
  const faqItems: FAQItem[] = [
    {
      id: "faq-1",
      question: "How do I check if I'm eligible for Healthier SG?",
      answer: "All Singaporeans are eligible for Healthier SG. You can use our eligibility checker tool or visit any participating clinic to confirm your enrollment eligibility.",
      category: "eligibility",
      tags: ["eligibility", "application", "singaporeans"],
      helpful: 245,
      notHelpful: 8,
      lastUpdated: "2024-01-15",
      relatedQuestions: ["faq-2", "faq-3"]
    },
    {
      id: "faq-2",
      question: "How much does Healthier SG cost?",
      answer: "Healthier SG is heavily subsidised by the government. Most services have co-payment fees that are affordable for all Singaporeans. Monthly premiums are subsidised based on your income level.",
      category: "costs",
      tags: ["costs", "subsidies", "premiums"],
      helpful: 189,
      notHelpful: 12,
      lastUpdated: "2024-01-10",
      relatedQuestions: ["faq-4", "faq-5"]
    },
    {
      id: "faq-3",
      question: "Can I choose my own doctor?",
      answer: "Yes! You can select any participating family clinic as your primary healthcare provider. This ensures continuity of care and builds a strong doctor-patient relationship.",
      category: "enrollment",
      tags: ["doctors", "clinics", "choice"],
      helpful: 167,
      notHelpful: 5,
      lastUpdated: "2024-01-12",
      relatedQuestions: ["faq-1", "faq-6"]
    },
    {
      id: "faq-4",
      question: "What health screenings are covered?",
      answer: "Healthier SG covers age-appropriate health screenings including diabetes, heart health, cancer screenings, and more. Specific screenings are recommended based on your age, gender, and risk factors.",
      category: "benefits",
      tags: ["screenings", "prevention", "health-checks"],
      helpful: 203,
      notHelpful: 7,
      lastUpdated: "2024-01-08",
      relatedQuestions: ["faq-2", "faq-7"]
    },
    {
      id: "faq-5",
      question: "How do I claim benefits?",
      answer: "Benefits are automatically claimed when you visit participating clinics. Simply present your NRIC/FIN, and the clinic will handle the claim processing on your behalf.",
      category: "claims",
      tags: ["claims", "process", "clinics"],
      helpful: 156,
      notHelpful: 3,
      lastUpdated: "2024-01-14",
      relatedQuestions: ["faq-2", "faq-8"]
    }
  ];

  // Example resources data
  const resources: Resource[] = [
    {
      id: "resource-1",
      title: "Healthier SG Enrollment Guide",
      description: "Complete step-by-step guide to enrolling in Healthier SG",
      type: "pdf",
      size: "2.4 MB",
      language: Language.English,
      category: "enrollment",
      url: "/resources/enrollment-guide.pdf",
      downloadCount: 15420,
      lastUpdated: "2024-01-15",
      tags: ["enrollment", "guide", "getting-started"],
      featured: true
    },
    {
      id: "resource-2",
      title: "Benefits and Subsidies Overview",
      description: "Detailed breakdown of all Healthier SG benefits and subsidies",
      type: "pdf",
      size: "3.1 MB",
      language: Language.English,
      category: "benefits",
      url: "/resources/benefits-overview.pdf",
      downloadCount: 12890,
      lastUpdated: "2024-01-10",
      tags: ["benefits", "subsidies", "financial"],
      featured: true
    },
    {
      id: "resource-3",
      title: "Health Screening Schedule",
      description: "Recommended health screening schedule by age group",
      type: "pdf",
      size: "1.8 MB",
      language: Language.English,
      category: "prevention",
      url: "/resources/screening-schedule.pdf",
      downloadCount: 9876,
      lastUpdated: "2024-01-12",
      tags: ["screenings", "prevention", "schedule"],
      featured: false
    },
    {
      id: "resource-4",
      title: "Chronic Disease Management Guide",
      description: "Comprehensive guide for managing chronic conditions",
      type: "pdf",
      size: "4.2 MB",
      language: Language.English,
      category: "chronic-care",
      url: "/resources/chronic-care-guide.pdf",
      downloadCount: 7234,
      lastUpdated: "2024-01-08",
      tags: ["chronic-care", "management", "conditions"],
      featured: false
    }
  ];

  // Example news articles data
  const newsArticles: NewsArticle[] = [
    {
      id: "news-1",
      title: "Healthier SG Reaches 1.4 Million Enrollees Milestone",
      summary: "Singapore's flagship healthcare programme celebrates major enrollment milestone as more citizens join for better health outcomes.",
      content: "Healthier SG has successfully enrolled over 1.4 million Singaporeans, representing a significant milestone in our national healthcare transformation journey...",
      category: "milestone",
      publishedDate: "2024-01-20",
      author: "MOH Communications",
      imageUrl: "/images/news/milestone-celebration.jpg",
      tags: ["milestone", "enrollment", "achievement"],
      readTime: 3,
      featured: true,
      bookmarked: false,
      shared: 245
    },
    {
      id: "news-2",
      title: "New Health Screening Guidelines Effective March 2024",
      summary: "Updated screening recommendations include enhanced diabetes and cardiovascular health assessments.",
      content: "The Ministry of Health has announced updated health screening guidelines that will take effect in March 2024, expanding coverage for...",
      category: "policy",
      publishedDate: "2024-01-18",
      author: "MOH Policy Team",
      imageUrl: "/images/news/screening-guidelines.jpg",
      tags: ["screening", "guidelines", "policy"],
      readTime: 4,
      featured: false,
      bookmarked: true,
      shared: 128
    },
    {
      id: "news-3",
      title: "Success Story: Community Health Transformation",
      summary: "How Tampines residents are benefiting from integrated healthcare through Healthier SG.",
      content: "The Tampores community has seen remarkable health improvements since the rollout of Healthier SG, with local clinics reporting...",
      category: "success-story",
      publishedDate: "2024-01-15",
      author: "Community Health Team",
      imageUrl: "/images/news/tampines-success.jpg",
      tags: ["community", "success", "transformation"],
      readTime: 5,
      featured: false,
      bookmarked: false,
      shared: 89
    },
    {
      id: "news-4",
      title: "Digital Health Records Now Available for All Enrollees",
      summary: "Comprehensive digital health records system launched to improve care coordination and patient experience.",
      content: "Healthier SG now offers comprehensive digital health records for all enrollees, enabling seamless information sharing between...",
      category: "technology",
      publishedDate: "2024-01-12",
      author: "Digital Health Division",
      imageUrl: "/images/news/digital-records.jpg",
      tags: ["digital", "health-records", "technology"],
      readTime: 4,
      featured: true,
      bookmarked: false,
      shared: 167
    }
  ];

  // Example guide steps data
  const guideSteps: GuideStep[] = [
    {
      id: "step-1",
      title: "Check Your Eligibility",
      description: "Verify if you're eligible for Healthier SG and understand your enrollment options",
      content: "All Singaporeans are eligible for Healthier SG. This step will help you understand your specific benefits and confirm your enrollment eligibility.",
      steps: [
        "Review your basic eligibility (Singaporean citizen or PR)",
        "Understand your age-based benefits",
        "Check if you have any chronic conditions",
        "Review your family's healthcare needs"
      ],
      estimatedTime: "10-15 minutes",
      requiredDocuments: ["NRIC/FIN", "Proof of address"],
      interactiveElements: [
        {
          type: "eligibility-checker",
          title: "Start Eligibility Check",
          action: "check-eligibility"
        },
        {
          type: "benefit-calculator",
          title: "Calculate Your Benefits",
          action: "calculate-benefits"
        }
      ],
      tips: [
        "Have your NRIC ready for verification",
        "Consider your family's healthcare needs",
        "Review current healthcare coverage"
      ],
      commonQuestions: [
        "What if I'm not a Singaporean citizen?",
        "Can my family members enroll separately?",
        "What about my existing health insurance?"
      ]
    },
    {
      id: "step-2",
      title: "Select Your Family Clinic",
      description: "Choose a participating family clinic that will be your primary healthcare provider",
      content: "Selecting the right family clinic is important for continuity of care. You can change your clinic later if needed.",
      steps: [
        "Search for participating clinics near your location",
        "Compare clinic services and specialities",
        "Check clinic ratings and patient reviews",
        "Schedule a preliminary visit if needed"
      ],
      estimatedTime: "15-20 minutes",
      requiredDocuments: ["Address proof", "Contact information"],
      interactiveElements: [
        {
          type: "clinic-finder",
          title: "Find Participating Clinics",
          action: "find-clinics"
        },
        {
          type: "appointment-booker",
          title: "Book Initial Consultation",
          action: "book-consultation"
        }
      ],
      tips: [
        "Consider clinic location and opening hours",
        "Check if clinic offers services you need",
        "Read patient reviews and ratings",
        "Verify clinic participates in Healthier SG"
      ],
      commonQuestions: [
        "Can I change my clinic later?",
        "What if my preferred clinic is full?",
        "Are all family doctors participating?"
      ]
    },
    {
      id: "step-3",
      title: "Complete Enrollment",
      description: "Finalize your Healthier SG enrollment and receive your membership details",
      content: "Once you've selected your clinic, you can complete the enrollment process and receive your Healthier SG membership information.",
      steps: [
        "Visit your selected clinic for enrollment",
        "Complete health assessment questionnaire",
        "Receive your Healthier SG card",
        "Set up access to digital health records"
      ],
      estimatedTime: "30-45 minutes",
      requiredDocuments: ["NRIC/FIN", "Address proof", "Bank account details"],
      interactiveElements: [
        {
          type: "health-assessment",
          title: "Complete Health Assessment",
          action: "health-assessment"
        },
        {
          type: "digital-setup",
          title: "Setup Digital Access",
          action: "digital-setup"
        }
      ],
      tips: [
        "Arrive early for your enrollment appointment",
        "Bring all required documents",
        "Ask questions about the programme",
        "Take notes on important information"
      ],
      commonQuestions: [
        "How long does enrollment take?",
        "What if I need to reschedule?",
        "When does coverage start?"
      ]
    },
    {
      id: "step-4",
      title: "Create Your Health Plan",
      description: "Work with your family doctor to develop a personalized health plan",
      content: "Your health plan is customized based on your health assessment, age, risk factors, and personal health goals.",
      steps: [
        "Review initial health assessment results",
        "Discuss health goals and priorities",
        "Create preventive care schedule",
        "Plan chronic condition management (if applicable)"
      ],
      estimatedTime: "45-60 minutes",
      requiredDocuments: ["Previous health records (if available)"],
      interactiveElements: [
        {
          type: "health-goals",
          title: "Set Health Goals",
          action: "set-goals"
        },
        {
          type: "screening-schedule",
          title: "Plan Screenings",
          action: "plan-screenings"
        }
      ],
      tips: [
        "Be honest about your health concerns",
        "Ask questions about recommended screenings",
        "Discuss lifestyle changes support",
        "Set realistic, achievable goals"
      ],
      commonQuestions: [
        "How often will my health plan be updated?",
        "What if my health situation changes?",
        "Can I get support for lifestyle changes?"
      ]
    },
    {
      id: "step-5",
      title: "Start Your Healthier SG Journey",
      description: "Begin your personalized healthcare programme with ongoing support and monitoring",
      content: "You're now ready to start your Healthier SG journey with regular check-ups, preventive care, and continuous health support.",
      steps: [
        "Schedule your first follow-up appointment",
        "Set up reminders for health screenings",
        "Access digital health records",
        "Join health education programmes (optional)"
      ],
      estimatedTime: "Ongoing",
      requiredDocuments: [],
      interactiveElements: [
        {
          type: "appointment-scheduler",
          title: "Schedule Next Visit",
          action: "schedule-next"
        },
        {
          type: "health-reminders",
          title: "Setup Reminders",
          action: "setup-reminders"
        }
      ],
      tips: [
        "Keep regular appointments with your doctor",
        "Stay up-to-date with recommended screenings",
        "Use digital tools for health tracking",
        "Engage with health education programmes"
      ],
      commonQuestions: [
        "How often should I visit my doctor?",
        "What if I need specialist care?",
        "How do I track my health progress?"
      ]
    }
  ];

  // Handle eligibility check integration
  const handleEligibilityCheck = async () => {
    try {
      // Simulate eligibility check
      const mockEligibilityResult: EligibilityResult = {
        isEligible: true,
        eligibilityLevel: "full",
        recommendedBenefits: [
          "Complete Healthier SG coverage",
          "Health screenings",
          "Chronic disease management"
        ],
        nextSteps: [
          "Select family clinic",
          "Complete enrollment",
          "Schedule health assessment"
        ],
        estimatedSavings: 2400
      };
      setEligibilityResult(mockEligibilityResult);
    } catch (error) {
      console.error('Eligibility check failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Healthier SG Demo</h1>
              </div>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                Component Showcase
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleEligibilityCheck}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Check Eligibility
              </button>
              <span className="text-sm text-gray-600">Selected Language: {selectedLanguage}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Eligibility Result Banner */}
      {eligibilityResult && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mx-4 mt-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                <strong>Eligibility Confirmed!</strong> You are eligible for Healthier SG with {eligibilityResult.eligibilityLevel} benefits.
                Estimated annual savings: ${eligibilityResult.estimatedSavings}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        
        {/* Program Overview Section */}
        <section className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Program Overview</h2>
            <p className="text-blue-100 mt-1">Comprehensive healthcare for all Singaporeans</p>
          </div>
          <div className="p-8">
            <HealthierSGOverview 
              data={programOverview}
              language={selectedLanguage}
              showEnrollmentCTA={true}
              onEligibilityCheck={handleEligibilityCheck}
            />
          </div>
        </section>

        {/* Benefits Explanation Section */}
        <section className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Benefits & Coverage</h2>
            <p className="text-green-100 mt-1">Detailed breakdown of your healthcare benefits</p>
          </div>
          <div className="p-8">
            <BenefitExplanation 
              benefitCategories={benefitCategories}
              language={selectedLanguage}
              showEligibilityChecker={true}
              onEligibilityCheck={handleEligibilityCheck}
            />
          </div>
        </section>

        {/* Program Comparison Section */}
        <section className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Compare Healthcare Schemes</h2>
            <p className="text-purple-100 mt-1">Find the right healthcare plan for you</p>
          </div>
          <div className="p-8">
            <ProgramComparisonTool 
              schemes={comparisonSchemes}
              language={selectedLanguage}
              showRecommendationEngine={true}
            />
          </div>
        </section>

        {/* Success Stories Section */}
        <section className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Success Stories</h2>
            <p className="text-orange-100 mt-1">Real stories from real people</p>
          </div>
          <div className="p-8">
            <SuccessStories 
              stories={successStories}
              language={selectedLanguage}
              showFiltering={true}
              autoPlay={false}
            />
          </div>
        </section>

        {/* Program Timeline Section */}
        <section className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-green-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Your Healthier SG Journey</h2>
            <p className="text-teal-100 mt-1">Track your progress through the program</p>
          </div>
          <div className="p-8">
            <ProgramTimeline 
              milestones={timelineMilestones}
              language={selectedLanguage}
              showProgressTracking={true}
              userMilestones={["milestone-1", "milestone-2", "milestone-3"]}
            />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
            <p className="text-indigo-100 mt-1">Find answers to common questions</p>
          </div>
          <div className="p-8">
            <FAQSection 
              faqItems={faqItems}
              language={selectedLanguage}
              showSearch={true}
              showCategories={true}
              enableVoting={true}
            />
          </div>
        </section>

        {/* Resources Section */}
        <section className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Downloadable Resources</h2>
            <p className="text-pink-100 mt-1">Guides, forms, and educational materials</p>
          </div>
          <div className="p-8">
            <ResourceDownload 
              resources={resources}
              language={selectedLanguage}
              showCategories={true}
              showSearch={true}
              enableDownloadTracking={true}
            />
          </div>
        </section>

        {/* Program News Section */}
        <section className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Latest News & Updates</h2>
            <p className="text-cyan-100 mt-1">Stay informed about program developments</p>
          </div>
          <div className="p-8">
            <ProgramNews 
              articles={newsArticles}
              language={selectedLanguage}
              showFiltering={true}
              showBookmarks={true}
              showSharing={true}
            />
          </div>
        </section>

        {/* Interactive Guide Section */}
        <section className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Interactive Program Guide</h2>
            <p className="text-emerald-100 mt-1">Step-by-step walkthrough of joining Healthier SG</p>
          </div>
          <div className="p-8">
            <ProgramGuide 
              steps={guideSteps}
              language={selectedLanguage}
              currentStep={currentStep}
              onStepChange={setCurrentStep}
              showProgress={true}
              allowStepNavigation={true}
            />
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Healthier SG</h3>
              <p className="text-gray-400">
                Comprehensive healthcare for every Singaporean. 
                Building a healthier nation together.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/healthier-sg/eligibility" className="hover:text-white">Check Eligibility</a></li>
                <li><a href="/healthier-sg/clinics" className="hover:text-white">Find Clinics</a></li>
                <li><a href="/healthier-sg/enroll" className="hover:text-white">Enroll Now</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/help" className="hover:text-white">Help Center</a></li>
                <li><a href="/contact" className="hover:text-white">Contact Us</a></li>
                <li><a href="/feedback" className="hover:text-white">Provide Feedback</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Ministry of Health Singapore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}