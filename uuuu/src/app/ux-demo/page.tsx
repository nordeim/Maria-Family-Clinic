// UX System Demo Page for My Family Clinic Healthcare Platform
// Comprehensive demonstration of all UX features and micro-interactions

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Stethoscope, 
  Calendar, 
  Phone, 
  MapPin, 
  Shield,
  Star,
  Settings,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Download,
  User,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Brain,
  Target,
  TrendingUp
} from 'lucide-react';

// Import UX components
import { 
  UXProvider,
  HealthcareSkeleton,
  HealthcareLoadingSpinner,
  ProgressiveLoading,
  MicroInteractionWrapper,
  TrustIndicatorsContainer,
  MOHVerificationBadge,
  InsuranceAcceptedBadge,
  TouchTarget,
  SwipeNavigation,
  VoiceNavigation,
  OfflineManager,
  AIRecommendationCard,
  HealthGoalTracker,
  AppointmentBookingWorkflow,
  useAccessibility,
  useTrustIndicators,
  usePersonalization,
  useVoiceNavigation,
  useOfflineManager,
  UX_FEATURES,
  HEALTHCARE_CONSTANTS,
} from '../../ux';

export default function UXDemoPage() {
  const [currentDemo, setCurrentDemo] = useState<string>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [offlineActions, setOfflineActions] = useState<string[]>([]);

  // UX hooks
  const { 
    fontSize, 
    highContrast, 
    reducedMotion,
    increaseFontSize,
    decreaseFontSize,
    toggleHighContrast,
    toggleReducedMotion,
  } = useAccessibility();

  const { 
    indicators, 
    trustScore, 
    verifyAll, 
    addIndicator 
  } = useTrustIndicators([
    {
      id: 'moh-verified-1',
      type: 'moh-verified',
      title: 'MOH Verified Clinic',
      description: 'Verified by Ministry of Health Singapore',
      icon: 'shield',
      verified: true,
      authority: 'Ministry of Health Singapore',
      dateVerified: '2025-11-01',
      badgeColor: 'green',
    },
    {
      id: 'insurance-1',
      type: 'insurance-accepted',
      title: 'Insurance Accepted',
      description: 'Accepts major Singapore insurance providers',
      icon: 'credit-card',
      verified: true,
      badgeColor: 'blue',
    },
    {
      id: 'reviews-1',
      type: 'patient-reviews',
      title: 'Patient Reviews',
      description: '4.8/5 stars from 150+ reviews',
      icon: 'star',
      verified: true,
      badgeColor: 'yellow',
    },
  ]);

  const { 
    personalizationLevel, 
    userJourney,
    getPersonalizationSuggestions,
  } = usePersonalization();

  const {
    isSupported: voiceSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    clearTranscript,
  } = useVoiceNavigation(true);

  const {
    isOnline,
    offlineQueue,
    syncStatus,
    addToOfflineQueue,
    syncOfflineQueue,
  } = useOfflineManager();

  const [healthGoals, setHealthGoals] = useState([
    {
      id: 'goal-1',
      title: 'Annual Health Screening',
      description: 'Complete yearly health check-up',
      category: 'preventive' as const,
      progress: 60,
      target: 100,
      unit: '%',
      reminders: [
        {
          frequency: 'monthly' as const,
          message: 'Schedule your annual screening',
        },
      ],
      medicalRelevance: ['preventive-care', 'early-detection'],
    },
  ]);

  const demoSections = [
    { id: 'overview', title: 'System Overview', icon: Info },
    { id: 'loading', title: 'Loading States', icon: Clock },
    { id: 'micro-interactions', title: 'Micro-Interactions', icon: Heart },
    { id: 'trust-indicators', title: 'Trust Indicators', icon: Shield },
    { id: 'mobile-optimization', title: 'Mobile Features', icon: Settings },
    { id: 'personalization', title: 'AI & Personalization', icon: Brain },
    { id: 'health-goals', title: 'Health Goals', icon: Target },
    { id: 'workflow', title: 'Booking Workflow', icon: Calendar },
    { id: 'voice-navigation', title: 'Voice Navigation', icon: Volume2 },
    { id: 'offline-mode', title: 'Offline Features', icon: Wifi },
  ];

  const handleOfflineAction = (action: string, data: any) => {
    setOfflineActions(prev => [...prev, `${action}: ${JSON.stringify(data)}`]);
  };

  const handleSyncComplete = (success: boolean, errors?: string[]) => {
    console.log('Sync complete:', success, errors);
  };

  const handleVoiceCommand = (command: string, confidence: number) => {
    console.log('Voice command:', command, confidence);
    
    // Demo: Navigate based on voice commands
    const demoCommands: Record<string, string> = {
      'loading': 'loading',
      'micro interactions': 'micro-interactions',
      'trust': 'trust-indicators',
      'mobile': 'mobile-optimization',
      'personalization': 'personalization',
      'health goals': 'health-goals',
      'workflow': 'workflow',
      'voice': 'voice-navigation',
      'offline': 'offline-mode',
    };

    const matchedDemo = Object.entries(demoCommands).find(([key]) => 
      command.toLowerCase().includes(key)
    );

    if (matchedDemo) {
      setCurrentDemo(matchedDemo[1]);
    }
  };

  const handleVoiceStateChange = (isListening: boolean, error?: string) => {
    if (error) {
      console.error('Voice error:', error);
    }
  };

  return (
    <UXProvider
      userId="demo-user-123"
      enablePersonalization={true}
      enableOfflineMode={true}
      enableVoiceNavigation={true}
      enableAnalytics={true}
      medicalContext="demo"
    >
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Heart className="w-8 h-8 text-blue-600" />
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    My Family Clinic UX Demo
                  </h1>
                </div>
                
                {/* System status indicators */}
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isOnline ? "bg-green-500" : "bg-red-500"
                  )} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Voice navigation toggle */}
              <div className="flex items-center space-x-4">
                <TouchTarget
                  size={44}
                  onTouchStart={() => isListening ? stopListening() : startListening()}
                  className={cn(
                    "rounded-full p-2 transition-colors",
                    isListening ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                  )}
                  ariaLabel={isListening ? "Stop voice recognition" : "Start voice recognition"}
                  role="button"
                  medicalContext="voice-navigation"
                >
                  {isListening ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </TouchTarget>

                {/* Accessibility controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={decreaseFontSize}
                    className="p-2 text-gray-600 hover:text-gray-800"
                    aria-label="Decrease font size"
                  >
                    A-
                  </button>
                  <button
                    onClick={increaseFontSize}
                    className="p-2 text-gray-600 hover:text-gray-800"
                    aria-label="Increase font size"
                  >
                    A+
                  </button>
                  <button
                    onClick={toggleHighContrast}
                    className={cn(
                      "p-2 rounded",
                      highContrast ? "bg-yellow-100 text-yellow-800" : "text-gray-600"
                    )}
                    aria-label="Toggle high contrast"
                  >
                    HC
                  </button>
                  <button
                    onClick={toggleReducedMotion}
                    className={cn(
                      "p-2 rounded",
                      reducedMotion ? "bg-purple-100 text-purple-800" : "text-gray-600"
                    )}
                    aria-label="Toggle reduced motion"
                  >
                    RM
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Demo Sections
                </h2>
                <nav className="space-y-2">
                  {demoSections.map((section) => {
                    const Icon = section.icon;
                    const isActive = currentDemo === section.id;
                    
                    return (
                      <MicroInteractionWrapper
                        key={section.id}
                        config={{
                          id: `nav-${section.id}`,
                          type: 'click',
                          duration: 200,
                          easing: 'easeOut',
                          healthcareContext: 'general',
                          hapticFeedback: true,
                          voiceAnnouncement: `Navigate to ${section.title}`,
                        }}
                        onClick={() => setCurrentDemo(section.id)}
                        className={cn(
                          "w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left",
                          isActive 
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        )}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{section.title}</span>
                      </MicroInteractionWrapper>
                    );
                  })}
                </nav>

                {/* System stats */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    System Status
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Personalization:</span>
                      <span className="font-medium text-green-600">{personalizationLevel}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Trust Score:</span>
                      <span className="font-medium text-blue-600">{Math.round(trustScore)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Offline Queue:</span>
                      <span className="font-medium text-orange-600">{offlineQueue.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentDemo}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentDemo === 'overview' && <OverviewDemo />}
                  {currentDemo === 'loading' && <LoadingDemo />}
                  {currentDemo === 'micro-interactions' && <MicroInteractionsDemo />}
                  {currentDemo === 'trust-indicators' && <TrustIndicatorsDemo indicators={indicators} trustScore={trustScore} />}
                  {currentDemo === 'mobile-optimization' && <MobileOptimizationDemo />}
                  {currentDemo === 'personalization' && <PersonalizationDemo />}
                  {currentDemo === 'health-goals' && (
                    <HealthGoalDemo 
                      goals={healthGoals}
                      onGoalUpdate={(id, progress) => {
                        setHealthGoals(prev => prev.map(goal => 
                          goal.id === id ? { ...goal, progress } : goal
                        ));
                      }}
                      onGoalCreate={(goal) => {
                        const newGoal = { ...goal, id: `goal-${Date.now()}` };
                        setHealthGoals(prev => [...prev, newGoal]);
                      }}
                      onGoalDelete={(id) => {
                        setHealthGoals(prev => prev.filter(goal => goal.id !== id));
                      }}
                    />
                  )}
                  {currentDemo === 'workflow' && <WorkflowDemo />}
                  {currentDemo === 'voice-navigation' && (
                    <VoiceNavigationDemo
                      isSupported={voiceSupported}
                      isListening={isListening}
                      transcript={transcript}
                      onStartListening={startListening}
                      onStopListening={stopListening}
                      onClearTranscript={clearTranscript}
                    />
                  )}
                  {currentDemo === 'offline-mode' && (
                    <OfflineDemo
                      isOnline={isOnline}
                      offlineQueue={offlineQueue}
                      syncStatus={syncStatus}
                      onAddOfflineAction={addToOfflineQueue}
                      onSync={syncOfflineQueue}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </UXProvider>
  );
}

// Demo components
const OverviewDemo: React.FC = () => {
  const features = [
    { name: 'Micro-Interactions', description: 'Healthcare-specific hover effects and animations', enabled: UX_FEATURES.MICRO_INTERACTIONS },
    { name: 'Trust Indicators', description: 'MOH verification and medical credentials', enabled: UX_FEATURES.TRUST_INDICATORS },
    { name: 'Mobile Optimization', description: 'Touch targets and offline functionality', enabled: UX_FEATURES.MOBILE_OPTIMIZATION },
    { name: 'Personalization', description: 'AI-powered recommendations and behavioral adaptation', enabled: UX_FEATURES.PERSONALIZATION },
    { name: 'Voice Navigation', description: 'Voice commands for accessibility', enabled: UX_FEATURES.VOICE_NAVIGATION },
    { name: 'Health Goals', description: 'Goal tracking and progress monitoring', enabled: UX_FEATURES.HEALTH_GOALS },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          UX System Overview
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Comprehensive User Experience optimization system for healthcare platforms, 
          featuring micro-interactions, accessibility, mobile-first design, and AI-powered personalization.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className={cn(
                "w-2 h-2 rounded-full mt-2",
                feature.enabled ? "bg-green-500" : "bg-gray-400"
              )} />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {feature.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Healthcare-Specific Features
              </h4>
              <ul className="mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Medical terminology explanations with progressive disclosure</li>
                <li>• Emergency and urgent care UX patterns</li>
                <li>• Insurance integration with real-time verification</li>
                <li>• Cultural sensitivity in healthcare communication</li>
                <li>• Mobile-first touch optimization (44px minimum targets)</li>
                <li>• Voice navigation for accessibility compliance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingDemo: React.FC = () => {
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Loading clinic information...',
    'Checking doctor availability...',
    'Verifying insurance coverage...',
    'Preparing appointment options...',
  ];

  useEffect(() => {
    const timer = setTimeout(() => setShowSkeleton(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Loading States & Skeleton Screens
        </h2>

        <div className="space-y-8">
          {/* Skeleton screens */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Skeleton Loading
            </h3>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setShowSkeleton(!showSkeleton)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showSkeleton ? 'Hide Skeleton' : 'Show Skeleton'}
              </button>
            </div>
            
            {showSkeleton ? (
              <div className="space-y-4">
                <HealthcareSkeleton type="clinic-card" />
                <HealthcareSkeleton type="doctor-card" />
                <HealthcareSkeleton type="appointment-slot" />
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                Skeleton hidden - showing actual content
              </div>
            )}
          </div>

          {/* Healthcare-specific loading spinners */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Healthcare Loading Spinners
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <HealthcareLoadingSpinner
                context="appointment"
                message="Booking your appointment..."
                showProgress={true}
                progress={75}
              />
              <HealthcareLoadingSpinner
                context="search"
                message="Finding nearby clinics..."
                showProgress={true}
                progress={60}
              />
            </div>
          </div>

          {/* Progressive loading */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Progressive Loading Steps
            </h3>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setCurrentStep((prev) => (prev + 1) % (steps.length + 1))}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Next Step ({currentStep}/{steps.length})
              </button>
            </div>
            
            <ProgressiveLoading
              steps={steps}
              currentStep={currentStep}
              context="appointment"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const MicroInteractionsDemo: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Micro-Interactions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Healthcare card micro-interactions */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Healthcare Card Interactions
            </h3>
            <MicroInteractionWrapper
              config={{
                id: 'clinic-card-demo',
                type: 'hover',
                duration: 200,
                easing: 'easeOut',
                healthcareContext: 'appointment',
                hapticFeedback: true,
                voiceAnnouncement: 'Clinic information card',
              }}
              className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer"
            >
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    Singapore General Hospital
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    24/7 Emergency Services
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      MOH Verified
                    </span>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      Open 24/7
                    </span>
                  </div>
                </div>
              </div>
            </MicroInteractionWrapper>
          </div>

          {/* Touch targets */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Touch Targets (44px minimum)
            </h3>
            <div className="space-y-3">
              <TouchTarget
                size={44}
                onTouchStart={() => console.log('Emergency call initiated')}
                className="w-full bg-red-600 text-white rounded-lg flex items-center justify-center font-medium"
                hapticFeedback={true}
                ariaLabel="Call emergency services"
                medicalContext="emergency"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Emergency (995)
              </TouchTarget>

              <TouchTarget
                size={44}
                onTouchStart={() => console.log('Book appointment')}
                className="w-full bg-blue-600 text-white rounded-lg flex items-center justify-center font-medium"
                hapticFeedback={true}
                ariaLabel="Book appointment"
                medicalContext="appointment"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Appointment
              </TouchTarget>

              <TouchTarget
                size={44}
                onTouchStart={() => console.log('View location')}
                className="w-full bg-green-600 text-white rounded-lg flex items-center justify-center font-medium"
                hapticFeedback={true}
                ariaLabel="View clinic location"
                medicalContext="location"
              >
                <MapPin className="w-5 h-5 mr-2" />
                View Location
              </TouchTarget>
            </div>
          </div>
        </div>

        {/* Medical info interaction */}
        <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Medical Information with Progressive Disclosure
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            Click on medical terms to learn more: 
            <span className="ml-2">
              <MedicalInfoMicroInteraction
                medicalTerm="hypertension"
                explanation="High blood pressure that may lead to serious health complications if not managed properly."
                sensitive={false}
              />
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

const MedicalInfoMicroInteraction: React.FC<{
  medicalTerm: string;
  explanation: string;
  sensitive?: boolean;
}> = ({ medicalTerm, explanation, sensitive = false }) => {
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <MicroInteractionWrapper
      config={{
        id: `medical-term-${medicalTerm}`,
        type: 'click',
        duration: 200,
        easing: 'easeOut',
        healthcareContext: 'medical',
        hapticFeedback: true,
        voiceAnnouncement: sensitive ? 'Medical information' : `Medical term: ${medicalTerm}`,
      }}
      onClick={() => setShowExplanation(!showExplanation)}
      className="underline decoration-dotted decoration-blue-500 hover:decoration-solid cursor-help"
    >
      {medicalTerm}
      
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            className="absolute z-10 top-full left-0 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-w-xs"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
          >
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {explanation}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowExplanation(false);
              }}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </MicroInteractionWrapper>
  );
};

const TrustIndicatorsDemo: React.FC<{
  indicators: any[];
  trustScore: number;
}> = ({ indicators, trustScore }) => {
  const [mohStatus, setMohStatus] = useState<'verified' | 'pending' | 'expired'>('verified');

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Trust Indicators & Medical Credentials
        </h2>

        <div className="space-y-6">
          {/* Trust score overview */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Overall Trust Score
              </h3>
              <span className="text-2xl font-bold text-blue-600">
                {Math.round(trustScore)}%
              </span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <motion.div
                className="h-2 bg-blue-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${trustScore}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          {/* Trust indicators container */}
          <TrustIndicatorsContainer
            indicators={indicators}
            layout="grid"
            size="md"
            showVerificationStatus={true}
          />

          {/* MOH verification badge */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              MOH Verification Status
            </h3>
            <MOHVerificationBadge
              clinicId="sgh-001"
              mohNumber="MOH2025001"
              status={mohStatus}
              lastVerified="2025-11-01"
              onVerify={() => setMohStatus('verified')}
            />
            
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => setMohStatus('verified')}
                className={cn(
                  "px-3 py-1 text-sm rounded",
                  mohStatus === 'verified' 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                Verified
              </button>
              <button
                onClick={() => setMohStatus('pending')}
                className={cn(
                  "px-3 py-1 text-sm rounded",
                  mohStatus === 'pending' 
                    ? "bg-yellow-100 text-yellow-800" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                Pending
              </button>
              <button
                onClick={() => setMohStatus('expired')}
                className={cn(
                  "px-3 py-1 text-sm rounded",
                  mohStatus === 'expired' 
                    ? "bg-red-100 text-red-800" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                Expired
              </button>
            </div>
          </div>

          {/* Insurance acceptance */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Insurance Coverage
            </h3>
            <InsuranceAcceptedBadge
              providers={['AIA', 'Prudential', 'NTUC Income', 'Great Eastern']}
              coverageTypes={['Medisave', 'MediShield', 'Private Insurance', 'Cash']}
              realTimeVerification={true}
              onVerifyCoverage={() => console.log('Verifying insurance coverage...')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileOptimizationDemo: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Mobile-First Optimizations
        </h2>

        <div className="space-y-6">
          {/* Touch targets demonstration */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Healthcare Touch Targets (44px minimum)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <TouchTarget
                size={44}
                className="bg-blue-500 text-white rounded-lg flex items-center justify-center font-medium"
                hapticFeedback={true}
                ariaLabel="Emergency services"
                medicalContext="emergency"
              >
                <Phone size={20} />
              </TouchTarget>
              
              <TouchTarget
                size={44}
                className="bg-green-500 text-white rounded-lg flex items-center justify-center font-medium"
                hapticFeedback={true}
                ariaLabel="Find clinic"
                medicalContext="search"
              >
                <MapPin size={20} />
              </TouchTarget>
              
              <TouchTarget
                size={44}
                className="bg-purple-500 text-white rounded-lg flex items-center justify-center font-medium"
                hapticFeedback={true}
                ariaLabel="Book appointment"
                medicalContext="appointment"
              >
                <Calendar size={20} />
              </TouchTarget>
              
              <TouchTarget
                size={44}
                className="bg-orange-500 text-white rounded-lg flex items-center justify-center font-medium"
                hapticFeedback={true}
                ariaLabel="Medical records"
                medicalContext="medical-info"
              >
                <FileText size={20} />
              </TouchTarget>
            </div>
          </div>

          {/* Swipe navigation demo */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Swipe Navigation (Mobile)
            </h3>
            <SwipeNavigation
              onSwipeLeft={() => console.log('Swiped left')}
              onSwipeRight={() => console.log('Swiped right')}
              onSwipeUp={() => console.log('Swiped up')}
              onSwipeDown={() => console.log('Swiped down')}
              className="bg-gray-100 dark:bg-gray-700 rounded-lg h-32 flex items-center justify-center"
            >
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Swipe in any direction
                </p>
                <div className="flex justify-center space-x-4 text-2xl">
                  <span>←</span>
                  <span>↑</span>
                  <span>↓</span>
                  <span>→</span>
                </div>
              </div>
            </SwipeNavigation>
          </div>
        </div>
      </div>
    </div>
  );
};

const PersonalizationDemo: React.FC = () => {
  const recommendations = [
    {
      id: 'rec-1',
      type: 'clinic' as const,
      title: 'Clinic Near You',
      description: 'Based on your location, here are highly-rated clinics nearby that match your preferences.',
      confidence: 0.85,
      reasoning: [
        'Within 2km of your location',
        'Highly rated by patients',
        'Accepts your insurance',
        'Open during your preferred hours',
      ],
      context: {
        location: 'Singapore',
      },
      actions: {
        primary: 'View Clinics',
        secondary: ['Get Directions', 'Call Clinic'],
      },
    },
    {
      id: 'rec-2',
      type: 'health-goal' as const,
      title: 'Annual Health Screening',
      description: 'It\'s time for your annual health screening. Early detection can prevent serious conditions.',
      confidence: 0.78,
      reasoning: [
        'Annual screening due',
        'Age-appropriate preventive care',
        'Insurance covers screening',
        'Early detection reduces treatment costs',
      ],
      context: {
        medicalCondition: 'preventive-care',
      },
      actions: {
        primary: 'Book Screening',
        secondary: ['Learn More', 'Check Coverage'],
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          AI-Powered Personalization
        </h2>

        <div className="space-y-6">
          {/* AI Recommendations */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-600" />
              Smart Recommendations
            </h3>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <AIRecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onAccept={() => console.log('Accepted:', rec.title)}
                  onDismiss={() => console.log('Dismissed:', rec.id)}
                  size="md"
                />
              ))}
            </div>
          </div>

          {/* Behavioral adaptation stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900 dark:text-blue-100">
                  Personalization Level
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-2">78%</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Based on your interactions
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900 dark:text-green-100">
                  Recommendations
                </span>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-2">{recommendations.length}</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Personalized for you
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900 dark:text-purple-100">
                  Health Goals
                </span>
              </div>
              <p className="text-2xl font-bold text-purple-600 mt-2">3</p>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Active tracking
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HealthGoalDemo: React.FC<{
  goals: any[];
  onGoalUpdate: (id: string, progress: number) => void;
  onGoalCreate: (goal: any) => void;
  onGoalDelete: (id: string) => void;
}> = ({ goals, onGoalUpdate, onGoalCreate, onGoalDelete }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Health Goal Tracking
        </h2>

        <HealthGoalTracker
          goals={goals}
          onGoalUpdate={onGoalUpdate}
          onGoalCreate={onGoalCreate}
          onGoalDelete={onGoalDelete}
        />
      </div>
    </div>
  );
};

const WorkflowDemo: React.FC = () => {
  const [showWorkflow, setShowWorkflow] = useState(false);

  const handleComplete = (data: any) => {
    console.log('Booking completed:', data);
    setShowWorkflow(false);
  };

  const handleCancel = () => {
    setShowWorkflow(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Healthcare Workflow UX
        </h2>

        {!showWorkflow ? (
          <div className="text-center">
            <button
              onClick={() => setShowWorkflow(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Appointment Booking Workflow
            </button>
          </div>
        ) : (
          <AppointmentBookingWorkflow
            clinicId="clinic-demo-001"
            doctorId="doctor-demo-001"
            serviceId="service-demo-001"
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

const VoiceNavigationDemo: React.FC<{
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  onStartListening: () => void;
  onStopListening: () => void;
  onClearTranscript: () => void;
}> = ({ isSupported, isListening, transcript, onStartListening, onStopListening, onClearTranscript }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Voice Navigation
        </h2>

        <div className="space-y-6">
          {/* Voice controls */}
          <div className="flex items-center space-x-4">
            <TouchTarget
              size={60}
              onTouchStart={() => isListening ? onStopListening() : onStartListening()}
              className={cn(
                "rounded-full transition-colors",
                isListening 
                  ? "bg-red-500 text-white animate-pulse" 
                  : "bg-blue-500 text-white hover:bg-blue-600"
              )}
              hapticFeedback={true}
              ariaLabel={isListening ? "Stop voice recognition" : "Start voice recognition"}
              medicalContext="voice-navigation"
            >
              {isListening ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </TouchTarget>

            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {isSupported ? 'Voice navigation supported' : 'Voice navigation not supported'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isListening ? 'Listening for commands...' : 'Tap to start voice recognition'}
              </p>
            </div>

            {transcript && (
              <TouchTarget
                size={44}
                onTouchStart={onClearTranscript}
                className="bg-gray-500 text-white rounded-lg px-3"
                ariaLabel="Clear transcript"
              >
                Clear
              </TouchTarget>
            )}
          </div>

          {/* Voice commands help */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Available Voice Commands
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>• "Book appointment"</div>
              <div>• "Find clinic"</div>
              <div>• "Call emergency"</div>
              <div>• "Search doctor"</div>
              <div>• "Go back"</div>
              <div>• "Next step"</div>
              <div>• "Confirm booking"</div>
              <div>• "Cancel appointment"</div>
            </div>
          </div>

          {/* Transcript display */}
          {transcript && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Last Command:
              </h3>
              <p className="text-gray-700 dark:text-gray-300 italic">"{transcript}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OfflineDemo: React.FC<{
  isOnline: boolean;
  offlineQueue: any[];
  syncStatus: string;
  onAddOfflineAction: (action: string, data: any) => void;
  onSync: () => void;
}> = ({ isOnline, offlineQueue, syncStatus, onAddOfflineAction, onSync }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Offline Functionality
        </h2>

        <div className="space-y-6">
          {/* Network status */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {isOnline ? (
                <Wifi className="w-6 h-6 text-green-600" />
              ) : (
                <WifiOff className="w-6 h-6 text-red-600" />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {isOnline ? 'Online' : 'Offline Mode'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isOnline ? 'All features available' : 'Some features cached for offline use'}
                </p>
              </div>
            </div>
          </div>

          {/* Offline actions demo */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Test Offline Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <TouchTarget
                size={44}
                onTouchStart={() => onAddOfflineAction('book-appointment', {
                  clinicId: 'demo-clinic',
                  date: new Date().toISOString(),
                  patientId: 'demo-patient'
                })}
                className="bg-blue-500 text-white rounded-lg flex items-center justify-center font-medium text-sm"
                hapticFeedback={true}
                ariaLabel="Book appointment offline"
              >
                Book Offline
              </TouchTarget>

              <TouchTarget
                size={44}
                onTouchStart={() => onAddOfflineAction('submit-contact', {
                  name: 'Demo User',
                  message: 'Test offline message'
                })}
                className="bg-green-500 text-white rounded-lg flex items-center justify-center font-medium text-sm"
                hapticFeedback={true}
                ariaLabel="Submit contact form offline"
              >
                Contact Offline
              </TouchTarget>
            </div>
          </div>

          {/* Sync status */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Sync Queue
              </h3>
              <TouchTarget
                size={44}
                onTouchStart={onSync}
                className="bg-purple-500 text-white rounded-lg px-3 text-sm font-medium"
                disabled={offlineQueue.length === 0}
                hapticFeedback={true}
                ariaLabel="Sync offline actions"
              >
                Sync ({offlineQueue.length})
              </TouchTarget>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Items in queue: {offlineQueue.length}
              </div>
              
              {syncStatus === 'syncing' && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <motion.div
                    className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="text-sm">Syncing...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility function
const cn = (...inputs: any[]) => {
  return inputs.filter(Boolean).join(' ');
};