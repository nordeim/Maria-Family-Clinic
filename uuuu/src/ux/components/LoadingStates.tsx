// Enhanced Loading States & Skeleton Screens for Healthcare UX
// Progressive loading with healthcare-specific messaging

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Heart, Stethoscope, Calendar, MapPin, Phone, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';

interface HealthcareSkeletonProps {
  type: 'clinic-card' | 'doctor-card' | 'appointment-slot' | 'medical-info' | 'review' | 'contact';
  animate?: boolean;
  reducedMotion?: boolean;
}

export const HealthcareSkeleton: React.FC<HealthcareSkeletonProps> = ({
  type,
  animate = true,
  reducedMotion = false,
}) => {
  const shimmerAnimation = {
    initial: { opacity: 0.3 },
    animate: animate ? {
      opacity: [0.3, 0.7, 0.3],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    } : { opacity: 0.7 },
  };

  const CardSkeleton = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4",
      className
    )}>
      <div className="animate-pulse space-y-3">
        {children}
      </div>
    </div>
  );

  switch (type) {
    case 'clinic-card':
      return (
        <CardSkeleton>
          <div className="flex items-start space-x-3">
            <div className={cn(
              "w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-lg",
              reducedMotion ? "" : "animate-pulse"
            )} />
            <div className="flex-1 space-y-2">
              <div className={cn(
                "h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4",
                reducedMotion ? "" : "animate-pulse"
              )} />
              <div className={cn(
                "h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2",
                reducedMotion ? "" : "animate-pulse"
              )} />
              <div className={cn(
                "h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3",
                reducedMotion ? "" : "animate-pulse"
              )} />
            </div>
          </div>
          <div className="flex space-x-2 mt-3">
            <div className={cn(
              "h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-16",
              reducedMotion ? "" : "animate-pulse"
            )} />
            <div className={cn(
              "h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-20",
              reducedMotion ? "" : "animate-pulse"
            )} />
          </div>
        </CardSkeleton>
      );

    case 'doctor-card':
      return (
        <CardSkeleton>
          <div className="flex items-center space-x-3">
            <div className={cn(
              "w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full",
              reducedMotion ? "" : "animate-pulse"
            )} />
            <div className="flex-1 space-y-2">
              <div className={cn(
                "h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4",
                reducedMotion ? "" : "animate-pulse"
              )} />
              <div className={cn(
                "h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2",
                reducedMotion ? "" : "animate-pulse"
              )} />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <div className={cn(
              "h-3 bg-gray-300 dark:bg-gray-600 rounded",
              reducedMotion ? "" : "animate-pulse"
            )} />
            <div className={cn(
              "h-3 bg-gray-300 dark:bg-gray-600 rounded w-4/5",
              reducedMotion ? "" : "animate-pulse"
            )} />
          </div>
        </CardSkeleton>
      );

    case 'appointment-slot':
      return (
        <CardSkeleton className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div className={cn(
                "h-4 bg-gray-300 dark:bg-gray-600 rounded w-20",
                reducedMotion ? "" : "animate-pulse"
              )} />
            </div>
            <div className={cn(
              "h-6 bg-gray-300 dark:bg-gray-600 rounded w-16",
              reducedMotion ? "" : "animate-pulse"
            )} />
          </div>
        </CardSkeleton>
      );

    case 'medical-info':
      return (
        <CardSkeleton>
          <div className="flex items-start space-x-3">
            <div className={cn(
              "w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full",
              reducedMotion ? "" : "animate-pulse"
            )} />
            <div className="flex-1 space-y-3">
              <div className={cn(
                "h-4 bg-gray-300 dark:bg-gray-600 rounded w-full",
                reducedMotion ? "" : "animate-pulse"
              )} />
              <div className={cn(
                "h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4",
                reducedMotion ? "" : "animate-pulse"
              )} />
              <div className={cn(
                "h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2",
                reducedMotion ? "" : "animate-pulse"
              )} />
            </div>
          </div>
        </CardSkeleton>
      );

    case 'review':
      return (
        <CardSkeleton className="p-3">
          <div className="flex items-start space-x-3">
            <div className={cn(
              "w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full",
              reducedMotion ? "" : "animate-pulse"
            )} />
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "h-3 bg-gray-300 dark:bg-gray-600 rounded w-24",
                  reducedMotion ? "" : "animate-pulse"
                )} />
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded",
                        reducedMotion ? "" : "animate-pulse"
                      )}
                    />
                  ))}
                </div>
              </div>
              <div className={cn(
                "h-3 bg-gray-300 dark:bg-gray-600 rounded w-full",
                reducedMotion ? "" : "animate-pulse"
              )} />
              <div className={cn(
                "h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3",
                reducedMotion ? "" : "animate-pulse"
              )} />
            </div>
          </div>
        </CardSkeleton>
      );

    case 'contact':
      return (
        <CardSkeleton className="p-3">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <div className={cn(
                "h-4 bg-gray-300 dark:bg-gray-600 rounded w-32",
                reducedMotion ? "" : "animate-pulse"
              )} />
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div className={cn(
                "h-4 bg-gray-300 dark:bg-gray-600 rounded w-40",
                reducedMotion ? "" : "animate-pulse"
              )} />
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <div className={cn(
                "h-4 bg-gray-300 dark:bg-gray-600 rounded w-28",
                reducedMotion ? "" : "animate-pulse"
              )} />
            </div>
          </div>
        </CardSkeleton>
      );

    default:
      return <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-24 rounded" />;
  }
};

interface HealthcareLoadingSpinnerProps {
  context: 'appointment' | 'search' | 'verification' | 'payment' | 'medical-info' | 'emergency';
  message?: string;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  estimatedTime?: number;
  reducedMotion?: boolean;
}

export const HealthcareLoadingSpinner: React.FC<HealthcareLoadingSpinnerProps> = ({
  context,
  message,
  progress,
  size = 'md',
  showProgress = false,
  estimatedTime,
  reducedMotion = false,
}) => {
  const contextConfig = {
    appointment: {
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      defaultMessage: 'Booking your appointment...',
    },
    search: {
      icon: Stethoscope,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      defaultMessage: 'Finding the best healthcare options...',
    },
    verification: {
      icon: Heart,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      defaultMessage: 'Verifying your information securely...',
    },
    payment: {
      icon: FileText,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      defaultMessage: 'Processing your payment...',
    },
    'medical-info': {
      icon: FileText,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      defaultMessage: 'Loading medical information...',
    },
    emergency: {
      icon: Phone,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      defaultMessage: 'Connecting to emergency services...',
      urgent: true,
    },
  };

  const config = contextConfig[context];
  const Icon = config.icon;

  const sizeConfig = {
    sm: { spinner: 16, icon: 16, text: 'text-sm' },
    md: { spinner: 24, icon: 20, text: 'text-base' },
    lg: { spinner: 32, icon: 24, text: 'text-lg' },
  };

  const { spinner, icon, text } = sizeConfig[size];

  const formatEstimatedTime = (seconds?: number) => {
    if (!seconds) return '';
    if (seconds < 60) return `${seconds}s remaining`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s remaining` : `${minutes}m remaining`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex flex-col items-center justify-center p-6 rounded-lg",
        config.bgColor,
        reducedMotion ? "" : "transition-all duration-300"
      )}
    >
      <motion.div
        animate={reducedMotion ? {} : { rotate: 360 }}
        transition={reducedMotion ? {} : {
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
        className={cn(
          "relative flex items-center justify-center",
          `w-${spinner/4} h-${spinner/4}`
        )}
      >
        <Icon 
          className={cn(config.color)} 
          size={icon} 
        />
        {!reducedMotion && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-current opacity-20"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>

      <motion.p 
        className={cn("mt-4 text-center font-medium text-gray-700 dark:text-gray-300", text)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {message || config.defaultMessage}
      </motion.p>

      {showProgress && progress !== undefined && (
        <motion.div 
          className="mt-4 w-full max-w-xs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className={cn("h-2 rounded-full", config.color.replace('text-', 'bg-'))}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}

      {estimatedTime && (
        <motion.p 
          className="mt-2 text-xs text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {formatEstimatedTime(estimatedTime)}
        </motion.p>
      )}
    </motion.div>
  );
};

interface ProgressiveLoadingProps {
  steps: string[];
  currentStep: number;
  context: 'appointment' | 'registration' | 'insurance-verification' | 'medical-history';
  reducedMotion?: boolean;
}

export const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({
  steps,
  currentStep,
  context,
  reducedMotion = false,
}) => {
  const contextColors = {
    appointment: 'border-blue-500 bg-blue-50',
    registration: 'border-green-500 bg-green-50',
    'insurance-verification': 'border-purple-500 bg-purple-50',
    'medical-history': 'border-red-500 bg-red-50',
  };

  const colorClass = contextColors[context];

  return (
    <div className={cn("p-6 rounded-lg border-2", colorClass)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Setting up your {context.replace('-', ' ')}...
        </h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className={cn(
              "flex items-center space-x-3 p-3 rounded-lg transition-all duration-300",
              index === currentStep && "bg-white dark:bg-gray-800 shadow-sm",
              index < currentStep && "opacity-60",
            )}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: index <= currentStep ? 1 : 0.6, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300",
              index < currentStep && "bg-green-500 text-white",
              index === currentStep && "bg-blue-500 text-white",
              index > currentStep && "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400",
              reducedMotion ? "" : "animate-pulse"
            )}>
              {index < currentStep ? (
                <motion.svg 
                  className="w-4 h-4" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </motion.svg>
              ) : index === currentStep ? (
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={reducedMotion ? {} : { scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span className={cn(
              "flex-1 text-sm transition-all duration-300",
              index <= currentStep ? "text-gray-800 dark:text-gray-200" : "text-gray-500 dark:text-gray-400",
              index === currentStep && "font-medium"
            )}>
              {step}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};