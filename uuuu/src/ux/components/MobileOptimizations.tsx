// Mobile-First Optimization Components for Healthcare UX
// Touch interactions, voice navigation, haptic feedback, and offline capabilities

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { 
  Phone, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Wifi,
  WifiOff,
  Download,
  Upload,
  Battery,
  BatteryLow,
  MapPin,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Home,
  Settings,
  Bell,
  MessageCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUXContext } from '../contexts/UXContext';
import { MobileOptimizationConfig, VoiceNavigationConfig } from '../types';

interface TouchTargetProps {
  children: React.ReactNode;
  size?: number; // Minimum 44px for healthcare elements
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  onTouchMove?: () => void;
  hapticFeedback?: boolean;
  hapticIntensity?: 'light' | 'medium' | 'strong';
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  role?: string;
  medicalContext?: string;
}

export const TouchTarget: React.FC<TouchTargetProps> = ({
  children,
  size = 44,
  onTouchStart,
  onTouchEnd,
  onTouchMove,
  hapticFeedback = true,
  hapticIntensity = 'medium',
  className,
  disabled = false,
  ariaLabel,
  role,
  medicalContext,
}) => {
  const { state, trackEvent } = useUXContext();
  const [isPressed, setIsPressed] = useState(false);

  const triggerHapticFeedback = useCallback((intensity: 'light' | 'medium' | 'strong') => {
    if (!hapticFeedback || state.personalization.deviceType !== 'mobile') return;

    const intensityMap = {
      light: 10,
      medium: 20,
      strong: 30,
    };

    if ('vibrate' in navigator) {
      navigator.vibrate(intensityMap[intensity]);
    }
  }, [hapticFeedback, state.personalization.deviceType]);

  const handleTouchStart = useCallback(() => {
    if (disabled) return;
    
    setIsPressed(true);
    triggerHapticFeedback(hapticIntensity);
    onTouchStart?.();

    trackEvent({
      eventType: 'interaction',
      component: 'TouchTarget',
      action: 'touchStart',
      context: medicalContext || 'general',
      metadata: { size, hapticIntensity },
      timestamp: Date.now(),
      sessionId: generateSessionId(),
      deviceType: state.personalization.deviceType,
    });
  }, [disabled, hapticIntensity, medicalContext, onTouchStart, size, state.personalization.deviceType, trackEvent, triggerHapticFeedback]);

  const handleTouchEnd = useCallback(() => {
    if (disabled) return;
    
    setIsPressed(false);
    onTouchEnd?.();
  }, [disabled, onTouchEnd]);

  const handleTouchMove = useCallback(() => {
    if (disabled) return;
    onTouchMove?.();
  }, [disabled, onTouchMove]);

  return (
    <motion.div
      className={cn(
        "select-none touch-manipulation",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      style={{ minWidth: size, minHeight: size }}
      animate={{
        scale: isPressed ? 0.95 : 1,
        transition: { type: "spring", stiffness: 400, damping: 30 },
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      aria-label={ariaLabel}
      role={role}
      tabIndex={disabled ? -1 : 0}
    >
      {children}
    </motion.div>
  );
};

// Swipe gesture component for navigation
interface SwipeNavigationProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export const SwipeNavigation: React.FC<SwipeNavigationProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  className,
  disabled = false,
}) => {
  const controls = useAnimation();
  const { trackEvent } = useUXContext();

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;

    const { offset, velocity } = info;
    const swipeThreshold = threshold;

    // Horizontal swipe
    if (Math.abs(offset.x) > swipeThreshold) {
      if (offset.x > 0 && onSwipeRight) {
        onSwipeRight();
        trackEvent({
          eventType: 'interaction',
          component: 'SwipeNavigation',
          action: 'swipeRight',
          context: 'navigation',
          metadata: { offset: offset.x, velocity: velocity.x },
          timestamp: Date.now(),
          sessionId: generateSessionId(),
          deviceType: 'mobile',
        });
      } else if (offset.x < 0 && onSwipeLeft) {
        onSwipeLeft();
        trackEvent({
          eventType: 'interaction',
          component: 'SwipeNavigation',
          action: 'swipeLeft',
          context: 'navigation',
          metadata: { offset: offset.x, velocity: velocity.x },
          timestamp: Date.now(),
          sessionId: generateSessionId(),
          deviceType: 'mobile',
        });
      }
    }

    // Vertical swipe
    if (Math.abs(offset.y) > swipeThreshold) {
      if (offset.y > 0 && onSwipeDown) {
        onSwipeDown();
        trackEvent({
          eventType: 'interaction',
          component: 'SwipeNavigation',
          action: 'swipeDown',
          context: 'navigation',
          metadata: { offset: offset.y, velocity: velocity.y },
          timestamp: Date.now(),
          sessionId: generateSessionId(),
          deviceType: 'mobile',
        });
      } else if (offset.y < 0 && onSwipeUp) {
        onSwipeUp();
        trackEvent({
          eventType: 'interaction',
          component: 'SwipeNavigation',
          action: 'swipeUp',
          context: 'navigation',
          metadata: { offset: offset.y, velocity: velocity.y },
          timestamp: Date.now(),
          sessionId: generateSessionId(),
          deviceType: 'mobile',
        });
      }
    }

    // Animate back to position
    controls.start({ x: 0, y: 0 });
  };

  return (
    <motion.div
      className={cn("touch-pan-y", disabled && "pointer-events-none", className)}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      animate={controls}
    >
      {children}
    </motion.div>
  );
};

// Voice navigation component
interface VoiceNavigationProps {
  config: VoiceNavigationConfig;
  onVoiceCommand: (command: string, confidence: number) => void;
  onStateChange: (isListening: boolean, error?: string) => void;
  className?: string;
  medicalCommands?: string[];
}

export const VoiceNavigation: React.FC<VoiceNavigationProps> = ({
  config,
  onVoiceCommand,
  onStateChange,
  className,
  medicalCommands = [],
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { trackEvent } = useUXContext();

  useEffect(() => {
    // Check for Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Voice navigation not supported');
      onStateChange(false, 'Voice navigation not supported');
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getLanguageCode(config.language);
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      onStateChange(true);
      
      trackEvent({
        eventType: 'interaction',
        component: 'VoiceNavigation',
        action: 'startListening',
        context: 'voice-navigation',
        metadata: { language: config.language, medicalCommands },
        timestamp: Date.now(),
        sessionId: generateSessionId(),
        deviceType: state.personalization.deviceType,
      });
    };

    recognition.onresult = (event) => {
      const results = Array.from(event.results);
      const lastResult = results[results.length - 1];
      
      if (lastResult.isFinal) {
        const command = lastResult[0].transcript.toLowerCase().trim();
        const confidence = lastResult[0].confidence || 0.8;
        
        setLastCommand(command);
        
        // Process medical commands
        const matchedCommand = medicalCommands.find(cmd => 
          command.includes(cmd.toLowerCase())
        );

        if (matchedCommand || confidence > 0.7) {
          onVoiceCommand(command, confidence);
          
          trackEvent({
            eventType: 'interaction',
            component: 'VoiceNavigation',
            action: 'voiceCommand',
            context: 'voice-navigation',
            metadata: { command, confidence, matchedCommand },
            timestamp: Date.now(),
            sessionId: generateSessionId(),
            deviceType: state.personalization.deviceType,
          });
        }
      }
    };

    recognition.onerror = (event) => {
      const errorMessage = `Voice recognition error: ${event.error}`;
      setError(errorMessage);
      setIsListening(false);
      onStateChange(false, errorMessage);
      
      trackEvent({
        eventType: 'error',
        component: 'VoiceNavigation',
        action: 'recognitionError',
        context: 'voice-navigation',
        metadata: { error: event.error },
        timestamp: Date.now(),
        sessionId: generateSessionId(),
        deviceType: state.personalization.deviceType,
      });
    };

    recognition.onend = () => {
      setIsListening(false);
      onStateChange(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [config.language, config.medicalTerms, medicalCommands, onStateChange, onVoiceCommand, state.personalization.deviceType, trackEvent]);

  const toggleListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setError(null);
      recognitionRef.current.start();
    }
  }, [isListening, isSupported]);

  const speakText = useCallback((text: string, priority = false) => {
    if (!config.enabled) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageCode(config.language);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    if (priority) {
      speechSynthesis.cancel(); // Cancel any ongoing speech
    }
    
    speechSynthesis.speak(utterance);
  }, [config.enabled, config.language]);

  if (!config.enabled) {
    return null;
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <TouchTarget
        size={44}
        onTouchStart={toggleListening}
        className={cn(
          "rounded-full transition-all duration-200",
          isListening 
            ? "bg-red-500 text-white animate-pulse" 
            : "bg-blue-500 text-white hover:bg-blue-600",
          error && "bg-red-500 hover:bg-red-600"
        )}
        ariaLabel={isListening ? "Stop voice recognition" : "Start voice recognition"}
        role="button"
        medicalContext="voice-navigation"
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      </TouchTarget>

      {/* Voice status indicator */}
      {isListening && (
        <motion.div
          className="flex items-center space-x-2 text-red-600"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm font-medium">Listening...</span>
        </motion.div>
      )}

      {/* Last command display */}
      {lastCommand && !isListening && (
        <motion.div
          className="flex items-center space-x-2 text-gray-600"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
        >
          <Volume2 size={16} />
          <span className="text-sm">"{lastCommand}"</span>
        </motion.div>
      )}

      {/* Error display */}
      {error && (
        <motion.div
          className="flex items-center space-x-2 text-red-600"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <VolumeX size={16} />
          <span className="text-sm">{error}</span>
        </motion.div>
      )}
    </div>
  );
};

// Offline capability component
interface OfflineManagerProps {
  enabled: boolean;
  cachedFeatures: string[];
  onOfflineAction: (action: string, data: any) => void;
  onSyncComplete: (success: boolean, errors?: string[]) => void;
  children: React.ReactNode;
}

export const OfflineManager: React.FC<OfflineManagerProps> = ({
  enabled,
  cachedFeatures,
  onOfflineAction,
  onSyncComplete,
  children,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [cacheStatus, setCacheStatus] = useState<'idle' | 'caching' | 'cached' | 'error'>('idle');
  const { trackEvent } = useUXContext();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineQueue();
      
      trackEvent({
        eventType: 'interaction',
        component: 'OfflineManager',
        action: 'online',
        context: 'connectivity',
        metadata: { queueLength: offlineQueue.length },
        timestamp: Date.now(),
        sessionId: generateSessionId(),
        deviceType: 'mobile',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      
      trackEvent({
        eventType: 'interaction',
        component: 'OfflineManager',
        action: 'offline',
        context: 'connectivity',
        metadata: {},
        timestamp: Date.now(),
        sessionId: generateSessionId(),
        deviceType: 'mobile',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue.length, trackEvent]);

  const syncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;

    setCacheStatus('syncing');
    const errors: string[] = [];

    for (const item of offlineQueue) {
      try {
        await onOfflineAction(item.type, item.data);
      } catch (error) {
        errors.push(`Failed to sync ${item.type}: ${error}`);
      }
    }

    setOfflineQueue([]);
    setCacheStatus('idle');
    onSyncComplete(errors.length === 0, errors);
  };

  const addToOfflineQueue = (type: string, data: any) => {
    if (isOnline) {
      onOfflineAction(type, data);
    } else {
      setOfflineQueue(prev => [...prev, { type, data }]);
    }
  };

  const getNetworkStatusIcon = () => {
    if (isOnline) {
      return <Wifi className="w-4 h-4 text-green-500" />;
    } else {
      return <WifiOff className="w-4 h-4 text-red-500" />;
    }
  };

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Network status indicator */}
      <div className="fixed top-4 right-4 z-50 flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-2">
        {getNetworkStatusIcon()}
        <span className="text-sm font-medium">
          {isOnline ? 'Online' : 'Offline'}
        </span>
        {offlineQueue.length > 0 && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
            {offlineQueue.length} queued
          </span>
        )}
      </div>

      {/* Sync indicator */}
      {cacheStatus === 'syncing' && (
        <motion.div
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center space-x-2 bg-blue-500 text-white rounded-lg shadow-lg px-4 py-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <motion.div
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span className="text-sm font-medium">Syncing offline data...</span>
        </motion.div>
      )}

      {/* Context provider for offline actions */}
      <OfflineContext.Provider value={{ addToOfflineQueue, isOnline }}>
        {children}
      </OfflineContext.Provider>
    </div>
  );
};

// Offline context for sharing offline capabilities
const OfflineContext = React.createContext<{
  addToOfflineQueue: (type: string, data: any) => void;
  isOnline: boolean;
} | null>(null);

export const useOfflineAction = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOfflineAction must be used within OfflineManager');
  }
  return context;
};

// Utility functions
const getLanguageCode = (language: string): string => {
  const languageMap = {
    en: 'en-SG',
    zh: 'zh-CN',
    ms: 'ms-MY',
    ta: 'ta-IN',
  };
  return languageMap[language as keyof typeof languageMap] || 'en-SG';
};

const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};