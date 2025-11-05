// Micro-Interactions Component for Healthcare UX
// Healthcare-specific hover effects, click feedback, and transitions

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { 
  Heart, 
  Stethoscope, 
  Calendar, 
  Phone, 
  MapPin, 
  FileText, 
  Shield, 
  Award,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUXContext } from '../contexts/UXContext';
import { MicroInteractionConfig, MicroInteractionState } from '../types';

interface MicroInteractionWrapperProps {
  children: React.ReactNode;
  config: MicroInteractionConfig;
  onClick?: () => void;
  onHover?: () => void;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  role?: string;
}

export const MicroInteractionWrapper: React.FC<MicroInteractionWrapperProps> = ({
  children,
  config,
  onClick,
  onHover,
  className,
  disabled = false,
  ariaLabel,
  role,
}) => {
  const { state, trackEvent } = useUXContext();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [interactionState, setInteractionState] = useState<MicroInteractionState>({
    isAnimating: false,
    isLoading: false,
    isError: false,
    isSuccess: false,
    progress: 0,
  });

  const handleMouseEnter = useCallback(() => {
    if (disabled || config.disabled) return;
    
    setIsHovered(true);
    onHover?.();
    
    // Healthcare-specific hover actions
    if (config.hapticFeedback && state.personalization.deviceType === 'mobile') {
      if ('vibrate' in navigator) {
        navigator.vibrate(10); // Light haptic feedback
      }
    }

    // Voice announcement for accessibility
    if (config.voiceAnnouncement && state.accessibility.voiceNavigation) {
      const utterance = new SpeechSynthesisUtterance(config.voiceAnnouncement);
      speechSynthesis.speak(utterance);
    }

    trackEvent({
      eventType: 'interaction',
      component: 'MicroInteractionWrapper',
      action: 'hover',
      context: config.healthcareContext || 'general',
      metadata: { config, isHovered: true },
      timestamp: Date.now(),
      sessionId: generateSessionId(),
      deviceType: state.personalization.deviceType,
      healthcareContext: config.healthcareContext,
    });
  }, [config, disabled, onHover, state.personalization.deviceType, state.accessibility.voiceNavigation]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsPressed(false);
  }, []);

  const handleMouseDown = useCallback(() => {
    if (disabled || config.disabled) return;
    setIsPressed(true);
  }, [config, disabled]);

  const handleMouseUp = useCallback(() => {
    if (disabled || config.disabled) return;
    setIsPressed(false);
    
    // Trigger haptic feedback on mobile
    if (config.hapticFeedback && state.personalization.deviceType === 'mobile') {
      if ('vibrate' in navigator) {
        navigator.vibrate(20); // Medium haptic feedback for click
      }
    }
  }, [config, state.personalization.deviceType]);

  const handleClick = useCallback(() => {
    if (disabled || config.disabled) return;
    
    setInteractionState(prev => ({ ...prev, isAnimating: true }));
    
    // Play click sound or haptic feedback
    if (config.hapticFeedback && state.personalization.deviceType === 'mobile') {
      if ('vibrate' in navigator) {
        navigator.vibrate(30); // Strong haptic feedback for action
      }
    }

    onClick?.();
    
    trackEvent({
      eventType: 'interaction',
      component: 'MicroInteractionWrapper',
      action: 'click',
      context: config.healthcareContext || 'general',
      metadata: { config },
      timestamp: Date.now(),
      sessionId: generateSessionId(),
      deviceType: state.personalization.deviceType,
      healthcareContext: config.healthcareContext,
    });

    // Reset animation state after completion
    setTimeout(() => {
      setInteractionState(prev => ({ ...prev, isAnimating: false }));
    }, config.duration);
  }, [config, disabled, onClick, state.personalization.deviceType]);

  const animationVariants = {
    hover: {
      scale: 1.02,
      y: -2,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 17,
        duration: state.accessibility.reducedMotion ? 0 : 0.2,
      },
    },
    pressed: {
      scale: 0.98,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 600,
        damping: 25,
        duration: state.accessibility.reducedMotion ? 0 : 0.1,
      },
    },
    default: {
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 17,
        duration: state.accessibility.reducedMotion ? 0 : 0.3,
      },
    },
  };

  const healthcareColorSchemes = {
    appointment: {
      hover: 'hover:border-blue-300 hover:shadow-blue-100',
      pressed: 'active:border-blue-400 active:shadow-blue-200',
      glow: 'shadow-blue-100',
    },
    medical: {
      hover: 'hover:border-red-300 hover:shadow-red-100',
      pressed: 'active:border-red-400 active:shadow-red-200',
      glow: 'shadow-red-100',
    },
    emergency: {
      hover: 'hover:border-red-400 hover:shadow-red-200',
      pressed: 'active:border-red-500 active:shadow-red-300',
      glow: 'shadow-red-200',
    },
    insurance: {
      hover: 'hover:border-green-300 hover:shadow-green-100',
      pressed: 'active:border-green-400 active:shadow-green-200',
      glow: 'shadow-green-100',
    },
  };

  const colorScheme = healthcareColorSchemes[config.healthcareContext as keyof typeof healthcareColorSchemes] || healthcareColorSchemes.medical;

  return (
    <motion.div
      className={cn(
        "relative cursor-pointer select-none transition-all duration-200",
        !disabled && !config.disabled && colorScheme.hover,
        !disabled && !config.disabled && colorScheme.pressed,
        isHovered && !state.accessibility.reducedMotion && colorScheme.glow,
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      variants={animationVariants}
      animate={
        isPressed ? "pressed" : 
        isHovered ? "hover" : 
        "default"
      }
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      aria-label={ariaLabel}
      role={role}
      tabIndex={disabled ? -1 : 0}
    >
      {children}
      
      {/* Healthcare-specific overlay effects */}
      <AnimatePresence>
        {isHovered && config.type === 'hover' && (
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: state.accessibility.reducedMotion ? 0 : 0.2 }}
          >
            {/* Medical-themed overlay */}
            {config.healthcareContext === 'appointment' && (
              <div className="absolute top-2 right-2">
                <Calendar className="w-4 h-4 text-blue-500" />
              </div>
            )}
            {config.healthcareContext === 'medical' && (
              <div className="absolute top-2 right-2">
                <Stethoscope className="w-4 h-4 text-red-500" />
              </div>
            )}
            {config.healthcareContext === 'emergency' && (
              <div className="absolute top-2 right-2">
                <Phone className="w-4 h-4 text-red-600" />
              </div>
            )}
            {config.healthcareContext === 'insurance' && (
              <div className="absolute top-2 right-2">
                <Shield className="w-4 h-4 text-green-500" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state indicator */}
      {interactionState.isLoading && (
        <motion.div
          className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 rounded-lg flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
            animate={state.accessibility.reducedMotion ? {} : { rotate: 360 }}
            transition={state.accessibility.reducedMotion ? {} : {
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>
      )}

      {/* Success feedback */}
      {interactionState.isSuccess && (
        <motion.div
          className="absolute inset-0 bg-green-50/90 dark:bg-green-900/90 rounded-lg flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <CheckCircle className="w-8 h-8 text-green-600" />
        </motion.div>
      )}

      {/* Error feedback */}
      {interactionState.isError && (
        <motion.div
          className="absolute inset-0 bg-red-50/90 dark:bg-red-900/90 rounded-lg flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <AlertCircle className="w-8 h-8 text-red-600" />
        </motion.div>
      )}
    </motion.div>
  );
};

// Specialized healthcare micro-interactions

interface AppointmentCardInteractionProps {
  children: React.ReactNode;
  onBookAppointment?: () => void;
  onViewDetails?: () => void;
  onCallClinic?: () => void;
  clinicName: string;
  reducedMotion?: boolean;
}

export const AppointmentCardMicroInteraction: React.FC<AppointmentCardInteractionProps> = ({
  children,
  onBookAppointment,
  onViewDetails,
  onCallClinic,
  clinicName,
  reducedMotion = false,
}) => {
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const actions = [
    {
      id: 'book',
      label: 'Book Appointment',
      icon: Calendar,
      onClick: onBookAppointment,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      id: 'view',
      label: 'View Details',
      icon: Info,
      onClick: onViewDetails,
      color: 'bg-gray-500 hover:bg-gray-600',
    },
    {
      id: 'call',
      label: 'Call Clinic',
      icon: Phone,
      onClick: onCallClinic,
      color: 'bg-green-500 hover:bg-green-600',
      urgent: true,
    },
  ];

  return (
    <MicroInteractionWrapper
      config={{
        id: 'appointment-card',
        type: 'hover',
        duration: 200,
        easing: 'easeOut',
        healthcareContext: 'appointment',
        hapticFeedback: true,
        voiceAnnouncement: `Appointment card for ${clinicName}`,
      }}
      className="group"
    >
      <div className="relative">
        {children}
        
        {/* Action buttons that appear on hover */}
        <AnimatePresence>
          {activeAction === null && (
            <motion.div
              className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex space-x-2">
                {actions.map((action) => (
                  <MicroInteractionWrapper
                    key={action.id}
                    config={{
                      id: action.id,
                      type: 'click',
                      duration: 150,
                      easing: 'easeOut',
                      healthcareContext: 'appointment',
                      hapticFeedback: true,
                      voiceAnnouncement: action.label,
                    }}
                    onClick={action.onClick}
                    className={cn(
                      "p-2 rounded-full text-white transition-colors",
                      action.color
                    )}
                  >
                    <action.icon size={16} />
                  </MicroInteractionWrapper>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MicroInteractionWrapper>
  );
};

interface MedicalInfoMicroInteractionProps {
  children: React.ReactNode;
  medicalTerm?: string;
  explanation?: string;
  onShowMore?: () => void;
  sensitive?: boolean;
}

export const MedicalInfoMicroInteraction: React.FC<MedicalInfoMicroInteractionProps> = ({
  children,
  medicalTerm,
  explanation,
  onShowMore,
  sensitive = false,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const handleTermClick = useCallback(() => {
    if (explanation) {
      setShowExplanation(true);
      onShowMore?.();
    }
  }, [explanation, onShowMore]);

  return (
    <div className="relative">
      {medicalTerm && (
        <MicroInteractionWrapper
          config={{
            id: 'medical-term',
            type: 'click',
            duration: 200,
            easing: 'easeOut',
            healthcareContext: 'medical',
            hapticFeedback: true,
            voiceAnnouncement: sensitive ? 'Medical information' : `Medical term: ${medicalTerm}`,
          }}
          onClick={handleTermClick}
          className="underline decoration-dotted decoration-blue-500 hover:decoration-solid cursor-help"
        >
          {medicalTerm}
        </MicroInteractionWrapper>
      )}
      
      <AnimatePresence>
        {showExplanation && explanation && (
          <motion.div
            className="absolute z-10 top-full left-0 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-w-xs"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {explanation}
            </p>
            <button
              onClick={() => setShowExplanation(false)}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {children}
    </div>
  );
};

// Utility function to generate session ID
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};