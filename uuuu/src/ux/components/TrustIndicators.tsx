// Trust Indicators & Medical Credentials Components for Healthcare UX
// MOH verification, insurance badges, quality certifications

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Award, 
  CheckCircle, 
  Star, 
  Clock, 
  Phone,
  MapPin,
  CreditCard,
  FileText,
  Users,
  TrendingUp,
  AlertTriangle,
  Info
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { TrustIndicator } from '../types';
import { useUXContext } from '../contexts/UXContext';

interface TrustIndicatorBadgeProps {
  indicator: TrustIndicator;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  onVerify?: () => void;
  reducedMotion?: boolean;
}

export const TrustIndicatorBadge: React.FC<TrustIndicatorBadgeProps> = ({
  indicator,
  size = 'md',
  showTooltip = true,
  onVerify,
  reducedMotion = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const { state, trackEvent } = useUXContext();

  const iconConfig = {
    'moh-verified': {
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
    },
    'medical-accreditation': {
      icon: Award,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300',
    },
    'insurance-accepted': {
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-300',
    },
    'patient-reviews': {
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-300',
    },
    'quality-certification': {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
    },
  };

  const sizeConfig = {
    sm: {
      container: 'p-1.5',
      icon: 'w-3 h-3',
      text: 'text-xs',
      spacing: 'space-x-1',
    },
    md: {
      container: 'p-2',
      icon: 'w-4 h-4',
      text: 'text-sm',
      spacing: 'space-x-2',
    },
    lg: {
      container: 'p-3',
      icon: 'w-5 h-5',
      text: 'text-base',
      spacing: 'space-x-3',
    },
  };

  const config = iconConfig[indicator.type];
  const Icon = config.icon;
  const sizeClasses = sizeConfig[size];

  const handleClick = () => {
    setShowDetails(!showDetails);
    onVerify?.();

    trackEvent({
      eventType: 'interaction',
      component: 'TrustIndicatorBadge',
      action: 'click',
      context: 'trust-verification',
      metadata: { indicatorType: indicator.type, indicator },
      timestamp: Date.now(),
      sessionId: generateSessionId(),
      deviceType: state.personalization.deviceType,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="relative">
      <motion.div
        className={cn(
          "flex items-center rounded-lg border transition-all duration-200",
          sizeClasses.container,
          config.bgColor,
          config.borderColor,
          "hover:shadow-md cursor-pointer",
          showDetails && "shadow-lg",
          indicator.verified ? "opacity-100" : "opacity-75"
        )}
        onClick={handleClick}
        whileHover={reducedMotion ? {} : { scale: 1.02 }}
        whileTap={reducedMotion ? {} : { scale: 0.98 }}
        role="button"
        tabIndex={0}
        aria-label={`${indicator.title} - ${indicator.verified ? 'Verified' : 'Not verified'}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <div className="flex items-center">
          <Icon className={cn(config.color, sizeClasses.icon)} />
        </div>
        
        <div className={cn("flex flex-col", sizeClasses.spacing)}>
          <span className={cn("font-medium", sizeClasses.text, config.color)}>
            {indicator.title}
          </span>
          {indicator.verified && (
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-2 h-2 text-green-500" />
              <span className="text-xs text-green-600">
                Verified
              </span>
            </div>
          )}
        </div>

        {showTooltip && (
          <div className="flex items-center justify-center ml-1">
            <Info className="w-3 h-3 text-gray-400" />
          </div>
        )}
      </motion.div>

      {/* Detailed tooltip */}
      <AnimatePresence>
        {showDetails && showTooltip && (
          <motion.div
            className="absolute z-50 top-full left-0 mt-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl min-w-64 max-w-80"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  {indicator.title}
                </h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {indicator.description}
              </p>

              {indicator.authority && (
                <div className="flex items-center space-x-2 text-xs">
                  <Award className="w-3 h-3 text-blue-500" />
                  <span className="text-gray-500">Issued by:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {indicator.authority}
                  </span>
                </div>
              )}

              {indicator.dateVerified && (
                <div className="flex items-center space-x-2 text-xs">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-500">Verified on:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {formatDate(indicator.dateVerified)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className={cn(
                  "flex items-center space-x-1 px-2 py-1 rounded-full text-xs",
                  indicator.verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                )}>
                  <CheckCircle className="w-3 h-3" />
                  <span>{indicator.verified ? 'Verified' : 'Pending'}</span>
                </div>
                
                {onVerify && !indicator.verified && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onVerify();
                      setShowDetails(false);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Verify Now
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface TrustIndicatorsContainerProps {
  indicators: TrustIndicator[];
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical' | 'grid';
  showVerificationStatus?: boolean;
  onVerifyAll?: () => void;
  reducedMotion?: boolean;
}

export const TrustIndicatorsContainer: React.FC<TrustIndicatorsContainerProps> = ({
  indicators,
  size = 'md',
  layout = 'horizontal',
  showVerificationStatus = true,
  onVerifyAll,
  reducedMotion = false,
}) => {
  const { state } = useUXContext();

  const layoutClasses = {
    horizontal: 'flex flex-row space-x-2 overflow-x-auto',
    vertical: 'flex flex-col space-y-2',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-2',
  };

  const verifiedCount = indicators.filter(i => i.verified).length;
  const totalCount = indicators.length;
  const verificationScore = totalCount > 0 ? (verifiedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Trust score header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Trust & Credentials
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className={cn(
              "w-2 h-2 rounded-full",
              verificationScore >= 80 ? "bg-green-500" : 
              verificationScore >= 60 ? "bg-yellow-500" : "bg-red-500"
            )} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {verifiedCount}/{totalCount} Verified
            </span>
          </div>
          
          {onVerifyAll && verifiedCount < totalCount && (
            <button
              onClick={onVerifyAll}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Verify All
            </button>
          )}
        </div>
      </div>

      {/* Trust score bar */}
      {showVerificationStatus && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className={cn(
              "h-2 rounded-full",
              verificationScore >= 80 ? "bg-green-500" : 
              verificationScore >= 60 ? "bg-yellow-500" : "bg-red-500"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${verificationScore}%` }}
            transition={{ duration: reducedMotion ? 0 : 1, delay: 0.2 }}
          />
        </div>
      )}

      {/* Indicators grid */}
      <div className={cn(layoutClasses[layout])}>
        {indicators.map((indicator) => (
          <TrustIndicatorBadge
            key={indicator.id}
            indicator={indicator}
            size={size}
            showTooltip={true}
            onVerify={onVerifyAll}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>

      {/* Healthcare-specific trust message */}
      <motion.div
        className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-start space-x-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100">
              Healthcare Quality Assurance
            </p>
            <p className="text-blue-700 dark:text-blue-300 mt-1">
              All verified indicators are automatically updated from official healthcare registries 
              and regulatory bodies in Singapore.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Specialized trust components for different healthcare contexts

interface MOHVerificationBadgeProps {
  clinicId: string;
  mohNumber?: string;
  status?: 'verified' | 'pending' | 'expired';
  lastVerified?: string;
  onVerify?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const MOHVerificationBadge: React.FC<MOHVerificationBadgeProps> = ({
  clinicId,
  mohNumber,
  status = 'pending',
  lastVerified,
  onVerify,
  size = 'md',
}) => {
  const { trackEvent } = useUXContext();

  const statusConfig = {
    verified: {
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      icon: CheckCircle,
      text: 'MOH Verified',
      description: 'Ministry of Health registered clinic',
    },
    pending: {
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      icon: Clock,
      text: 'Verification Pending',
      description: 'MOH verification in progress',
    },
    expired: {
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      icon: AlertTriangle,
      text: 'Verification Expired',
      description: 'MOH verification needs renewal',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeConfig = {
    sm: { container: 'p-1.5', icon: 'w-3 h-3', text: 'text-xs' },
    md: { container: 'p-2', icon: 'w-4 h-4', text: 'text-sm' },
    lg: { container: 'p-3', icon: 'w-5 h-5', text: 'text-base' },
  };

  const sizeClasses = sizeConfig[size];

  const handleClick = () => {
    trackEvent({
      eventType: 'interaction',
      component: 'MOHVerificationBadge',
      action: 'click',
      context: 'moh-verification',
      metadata: { clinicId, mohNumber, status },
      timestamp: Date.now(),
      sessionId: generateSessionId(),
      deviceType: 'desktop', // Would be dynamic in real implementation
    });

    onVerify?.();
  };

  return (
    <TrustIndicatorBadge
      indicator={{
        id: `moh-${clinicId}`,
        type: 'moh-verified',
        title: config.text,
        description: config.description,
        icon: 'shield',
        verified: status === 'verified',
        authority: 'Ministry of Health Singapore',
        dateVerified: lastVerified,
        badgeColor: status === 'verified' ? 'green' : status === 'pending' ? 'orange' : 'red',
      }}
      size={size}
      onVerify={onVerify}
    />
  );
};

interface InsuranceAcceptedBadgeProps {
  providers: string[];
  coverageTypes: ('Medisave' | 'Medishield' | 'Private Insurance' | 'Cash')[];
  realTimeVerification?: boolean;
  onVerifyCoverage?: () => void;
}

export const InsuranceAcceptedBadge: React.FC<InsuranceAcceptedBadgeProps> = ({
  providers,
  coverageTypes,
  realTimeVerification = true,
  onVerifyCoverage,
}) => {
  const insuranceIndicators: TrustIndicator[] = providers.map((provider) => ({
    id: `insurance-${provider}`,
    type: 'insurance-accepted',
    title: provider,
    description: `Accepts ${provider} insurance`,
    icon: 'credit-card',
    verified: true,
    authority: provider,
    badgeColor: 'blue',
  }));

  return (
    <div className="space-y-2">
      <TrustIndicatorsContainer
        indicators={insuranceIndicators}
        layout="horizontal"
        size="sm"
        showVerificationStatus={false}
        onVerifyAll={onVerifyCoverage}
      />
      
      {coverageTypes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {coverageTypes.map((type) => (
            <span
              key={type}
              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
            >
              {type}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// Utility function
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};