// Personalization & AI Enhancement Components for Healthcare UX
// Smart recommendations, behavioral adaptation, and health goal tracking

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Calendar, 
  Heart, 
  Star, 
  Award,
  Clock,
  MapPin,
  Users,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Bell,
  Settings,
  Zap,
  Activity,
  BookOpen,
  Filter
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUXContext } from '../contexts/UXContext';
import { AIRecommendation, PersonalizationData, HealthGoal } from '../types';

interface PersonalizationEngineProps {
  userId: string;
  onRecommendationUpdate: (recommendations: AIRecommendation[]) => void;
  onPersonalizationUpdate: (data: Partial<PersonalizationData>) => void;
  children: React.ReactNode;
}

export const PersonalizationEngine: React.FC<PersonalizationEngineProps> = ({
  userId,
  onRecommendationUpdate,
  onPersonalizationUpdate,
  children,
}) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [behavioralData, setBehavioralData] = useState({
    lastInteractions: [] as any[],
    preferences: {},
    usagePatterns: {},
    healthTrends: {},
  });
  const { state, trackEvent } = useUXContext();

  // Process user behavior and generate recommendations
  const processUserBehavior = useCallback(async () => {
    setIsProcessing(true);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate contextual recommendations based on user data
      const generatedRecommendations = generateAIRecommendations(
        state.personalization,
        behavioralData,
        userId
      );

      setRecommendations(generatedRecommendations);
      onRecommendationUpdate(generatedRecommendations);

      trackEvent({
        eventType: 'interaction',
        component: 'PersonalizationEngine',
        action: 'generateRecommendations',
        context: 'ai-personalization',
        metadata: { 
          userId,
          recommendationsCount: generatedRecommendations.length,
          behavioralData,
        },
        timestamp: Date.now(),
        sessionId: generateSessionId(),
        deviceType: state.personalization.deviceType,
      });

    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [state.personalization, behavioralData, userId, onRecommendationUpdate, trackEvent]);

  // Track user interactions for behavioral adaptation
  const trackInteraction = useCallback((interaction: {
    type: string;
    context: string;
    data: any;
    timestamp: number;
  }) => {
    setBehavioralData(prev => ({
      ...prev,
      lastInteractions: [
        ...prev.lastInteractions.slice(-99), // Keep last 100 interactions
        interaction,
      ],
    }));

    // Update preferences based on interaction
    updatePreferences(interaction);
  }, []);

  // Update user preferences based on interactions
  const updatePreferences = useCallback((interaction: any) => {
    const newPreferences = { ...behavioralData.preferences };

    switch (interaction.context) {
      case 'clinic-search':
        // Track preferred clinic types and locations
        if (interaction.data.clinicType) {
          newPreferences.preferredClinicTypes = [
            ...(newPreferences.preferredClinicTypes || []),
            interaction.data.clinicType,
          ];
        }
        break;

      case 'appointment-booking':
        // Track preferred times and doctors
        if (interaction.data.timeSlot) {
          newPreferences.preferredTimeSlots = [
            ...(newPreferences.preferredTimeSlots || []),
            interaction.data.timeSlot,
          ];
        }
        break;

      case 'medical-search':
        // Track medical interests and conditions
        if (interaction.data.condition) {
          newPreferences.medicalInterests = [
            ...(newPreferences.medicalInterests || []),
            interaction.data.condition,
          ];
        }
        break;
    }

    setBehavioralData(prev => ({
      ...prev,
      preferences: newPreferences,
    }));

    // Update personalization data
    onPersonalizationUpdate({
      preferences: newPreferences,
    });
  }, [behavioralData.preferences, onPersonalizationUpdate]);

  // Generate initial recommendations
  useEffect(() => {
    if (userId) {
      processUserBehavior();
    }
  }, [userId, processUserBehavior]);

  // Periodic recommendation updates
  useEffect(() => {
    const interval = setInterval(processUserBehavior, 5 * 60 * 1000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [processUserBehavior]);

  return (
    <PersonalizationContext.Provider
      value={{
        recommendations,
        isProcessing,
        behavioralData,
        trackInteraction,
        processUserBehavior,
      }}
    >
      {children}
      
      {/* AI Processing indicator */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 flex items-center space-x-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <motion.div
              className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Personalizing your experience...
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Analyzing your healthcare preferences
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PersonalizationContext.Provider>
  );
};

// Context for personalization data
const PersonalizationContext = React.createContext<{
  recommendations: AIRecommendation[];
  isProcessing: boolean;
  behavioralData: any;
  trackInteraction: (interaction: any) => void;
  processUserBehavior: () => void;
} | null>(null);

export const usePersonalization = () => {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error('usePersonalization must be used within PersonalizationEngine');
  }
  return context;
};

// AI Recommendation display component
interface AIRecommendationCardProps {
  recommendation: AIRecommendation;
  onAccept?: () => void;
  onDismiss?: () => void;
  onLearnMore?: () => void;
  size?: 'sm' | 'md' | 'lg';
  reducedMotion?: boolean;
}

export const AIRecommendationCard: React.FC<AIRecommendationCardProps> = ({
  recommendation,
  onAccept,
  onDismiss,
  onLearnMore,
  size = 'md',
  reducedMotion = false,
}) => {
  const { trackEvent } = useUXContext();

  const handleAccept = () => {
    onAccept?.();
    trackEvent({
      eventType: 'interaction',
      component: 'AIRecommendationCard',
      action: 'acceptRecommendation',
      context: 'ai-personalization',
      metadata: { recommendation },
      timestamp: Date.now(),
      sessionId: generateSessionId(),
      deviceType: 'desktop', // Would be dynamic
    });
  };

  const handleDismiss = () => {
    onDismiss?.();
    trackEvent({
      eventType: 'interaction',
      component: 'AIRecommendationCard',
      action: 'dismissRecommendation',
      context: 'ai-personalization',
      metadata: { recommendation },
      timestamp: Date.now(),
      sessionId: generateSessionId(),
      deviceType: 'desktop',
    });
  };

  const typeConfig = {
    clinic: { icon: MapPin, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    doctor: { icon: Users, color: 'text-green-600', bgColor: 'bg-green-50' },
    service: { icon: Heart, color: 'text-red-600', bgColor: 'bg-red-50' },
    'health-goal': { icon: Target, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    appointment: { icon: Calendar, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  };

  const config = typeConfig[recommendation.type];
  const Icon = config.icon;

  const sizeConfig = {
    sm: { padding: 'p-3', iconSize: 16, text: 'text-sm' },
    md: { padding: 'p-4', iconSize: 20, text: 'text-base' },
    lg: { padding: 'p-6', iconSize: 24, text: 'text-lg' },
  };

  const sizeClasses = sizeConfig[size];

  const confidenceColor = recommendation.confidence >= 0.8 ? 'text-green-600' :
                         recommendation.confidence >= 0.6 ? 'text-yellow-600' : 'text-red-600';

  return (
    <motion.div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm",
        config.bgColor,
        sizeClasses.padding
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={reducedMotion ? {} : { scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-start space-x-3">
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          config.bgColor
        )}>
          <Icon className={config.color} size={sizeClasses.iconSize} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className={cn("font-semibold text-gray-900 dark:text-gray-100", sizeClasses.text)}>
              {recommendation.title}
            </h3>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className={cn("text-sm font-medium", confidenceColor)}>
                {Math.round(recommendation.confidence * 100)}%
              </span>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-3">
            {recommendation.description}
          </p>

          {recommendation.reasoning.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Why this is recommended:
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {recommendation.reasoning.slice(0, 2).map((reason, index) => (
                  <li key={index} className="flex items-start space-x-1">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <motion.button
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                onClick={handleAccept}
                whileHover={reducedMotion ? {} : { scale: 1.05 }}
                whileTap={reducedMotion ? {} : { scale: 0.95 }}
              >
                {recommendations.actions.primary}
              </motion.button>
              
              {onLearnMore && (
                <motion.button
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  onClick={onLearnMore}
                  whileHover={reducedMotion ? {} : { scale: 1.05 }}
                  whileTap={reducedMotion ? {} : { scale: 0.95 }}
                >
                  Learn More
                </motion.button>
              )}
            </div>

            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Dismiss recommendation"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Health goal tracking component
interface HealthGoalTrackerProps {
  goals: HealthGoal[];
  onGoalUpdate: (goalId: string, progress: number) => void;
  onGoalCreate: (goal: Omit<HealthGoal, 'id'>) => void;
  onGoalDelete: (goalId: string) => void;
}

export const HealthGoalTracker: React.FC<HealthGoalTrackerProps> = ({
  goals,
  onGoalUpdate,
  onGoalCreate,
  onGoalDelete,
}) => {
  const [activeGoal, setActiveGoal] = useState<string | null>(null);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const { trackEvent } = useUXContext();

  const getGoalIcon = (category: HealthGoal['category']) => {
    const icons = {
      'preventive': Shield,
      'chronic-care': Heart,
      'mental-health': Brain,
      'fitness': Activity,
      'nutrition': Target,
    };
    return icons[category];
  };

  const getGoalColor = (category: HealthGoal['category']) => {
    const colors = {
      'preventive': 'text-green-600',
      'chronic-care': 'text-red-600',
      'mental-health': 'text-purple-600',
      'fitness': 'text-blue-600',
      'nutrition': 'text-orange-600',
    };
    return colors[category];
  };

  const handleGoalProgress = (goalId: string, newProgress: number) => {
    onGoalUpdate(goalId, newProgress);
    
    // Track milestone achievements
    if (newProgress >= 100) {
      trackEvent({
        eventType: 'interaction',
        component: 'HealthGoalTracker',
        action: 'goalAchieved',
        context: 'health-goals',
        metadata: { goalId, progress: newProgress },
        timestamp: Date.now(),
        sessionId: generateSessionId(),
        deviceType: 'desktop',
      });
    }
  };

  const activeGoals = goals.filter(goal => goal.progress < 100);
  const completedGoals = goals.filter(goal => goal.progress >= 100);

  return (
    <div className="space-y-6">
      {/* Goals overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900 dark:text-blue-100">
              Active Goals
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">{activeGoals.length}</p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-900 dark:text-green-100">
              Completed
            </span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-2">{completedGoals.length}</p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-900 dark:text-purple-100">
              Success Rate
            </span>
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-2">
            {goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Active goals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Active Health Goals
          </h3>
          <button
            onClick={() => setShowCreateGoal(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Goal
          </button>
        </div>

        <div className="space-y-3">
          {activeGoals.map((goal) => {
            const Icon = getGoalIcon(goal.category);
            const colorClass = getGoalColor(goal.category);

            return (
              <motion.div
                key={goal.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                layout
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Icon className={colorClass} size={20} />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {goal.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {goal.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {goal.progress}/{goal.target} {goal.unit}
                    </span>
                    <button
                      onClick={() => setActiveGoal(activeGoal === goal.id ? null : goal.id)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <Settings size={16} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{Math.round((goal.progress / goal.target) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      className={cn("h-2 rounded-full", colorClass.replace('text-', 'bg-'))}
                      initial={{ width: 0 }}
                      animate={{ width: `${(goal.progress / goal.target) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {goal.incentives && goal.incentives.length > 0 && (
                      <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <Award className="w-3 h-3" />
                        <span>{goal.incentives[0].description}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleGoalProgress(goal.id, goal.progress + 1)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md hover:bg-blue-200 transition-colors"
                    >
                      +1 {goal.unit}
                    </button>
                    
                    <button
                      onClick={() => onGoalDelete(goal.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-md hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Reminder info */}
                {goal.reminders.length > 0 && (
                  <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500">
                    <Bell className="w-3 h-3" />
                    <span>
                      Reminder: {goal.reminders[0].frequency} - {goal.reminders[0].message}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Completed goals */}
      {completedGoals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Completed Goals
          </h3>
          
          <div className="space-y-2">
            {completedGoals.map((goal) => {
              const Icon = getGoalIcon(goal.category);
              const colorClass = getGoalColor(goal.category);

              return (
                <div
                  key={goal.id}
                  className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3"
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <h4 className="font-medium text-green-900 dark:text-green-100">
                        {goal.title}
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Completed on {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <Award className="w-5 h-5 text-yellow-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// AI-powered recommendation generation
const generateAIRecommendations = (
  personalization: PersonalizationData,
  behavioralData: any,
  userId: string
): AIRecommendation[] => {
  const recommendations: AIRecommendation[] = [];

  // Location-based clinic recommendations
  if (personalization.location) {
    recommendations.push({
      id: `nearby-clinic-${userId}`,
      type: 'clinic',
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
        location: `${personalization.location.latitude},${personalization.location.longitude}`,
        preferences: personalization.preferences,
      },
      actions: {
        primary: 'View Clinics',
        secondary: ['Get Directions', 'Call Clinic'],
      },
    });
  }

  // Preventive care recommendations
  if (personalization.userType === 'patient') {
    recommendations.push({
      id: `preventive-care-${userId}`,
      type: 'health-goal',
      title: 'Preventive Care Reminder',
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
        insurance: personalization.insuranceProvider,
      },
      actions: {
        primary: 'Book Screening',
        secondary: ['Learn More', 'Check Coverage'],
      },
    });
  }

  // Health goal recommendations
  if (personalization.healthGoals && personalization.healthGoals.length > 0) {
    const primaryGoal = personalization.healthGoals[0];
    recommendations.push({
      id: `health-goal-${userId}`,
      type: 'health-goal',
      title: `Focus on ${primaryGoal}`,
      description: `Based on your goal to ${primaryGoal}, here are specific steps you can take this week.`,
      confidence: 0.82,
      reasoning: [
        'Aligns with your stated health goals',
        'Evidence-based approach',
        'Sustainable lifestyle change',
        'Trackable progress milestones',
      ],
      context: {
        healthGoals: personalization.healthGoals,
      },
      actions: {
        primary: 'Set Goal',
        secondary: ['Track Progress', 'Get Tips'],
      },
    });
  }

  return recommendations;
};

// Utility function
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};