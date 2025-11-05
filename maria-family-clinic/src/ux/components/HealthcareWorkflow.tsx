// Healthcare Workflow UX Components for My Family Clinic
// Streamlined appointment booking and patient journey optimization

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Star,
  Heart,
  Shield,
  CreditCard,
  Bell,
  MessageCircle,
  Upload,
  Download,
  Timer,
  Users,
  Award,
  TrendingUp
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUXContext } from '../contexts/UXContext';
import { HealthcareWorkflowStep, LoadingState } from '../types';
import { HealthcareLoadingSpinner, ProgressiveLoading } from './LoadingStates';

interface AppointmentBookingWorkflowProps {
  clinicId: string;
  doctorId?: string;
  serviceId?: string;
  initialStep?: number;
  onComplete: (bookingData: any) => void;
  onCancel: () => void;
  reducedMotion?: boolean;
}

export const AppointmentBookingWorkflow: React.FC<AppointmentBookingWorkflowProps> = ({
  clinicId,
  doctorId,
  serviceId,
  initialStep = 0,
  onComplete,
  onCancel,
  reducedMotion = false,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [bookingData, setBookingData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { state, trackEvent } = useUXContext();

  const workflowSteps: HealthcareWorkflowStep[] = [
    {
      id: 'visit-type',
      title: 'Visit Type',
      description: 'What brings you to the clinic today?',
      isCompleted: false,
      isActive: true,
      estimatedTime: 1,
      medicalContext: 'visit-classification',
      prerequisites: [],
      nextSteps: ['time-slot', 'patient-info'],
    },
    {
      id: 'time-slot',
      title: 'Choose Time',
      description: 'Select your preferred appointment time',
      isCompleted: false,
      isActive: false,
      estimatedTime: 2,
      medicalContext: 'scheduling',
      prerequisites: ['visit-type'],
      nextSteps: ['patient-info', 'special-requirements'],
    },
    {
      id: 'patient-info',
      title: 'Patient Information',
      description: 'Confirm your personal details',
      isCompleted: false,
      isActive: false,
      estimatedTime: 3,
      medicalContext: 'patient-registration',
      prerequisites: ['time-slot'],
      nextSteps: ['insurance', 'payment'],
    },
    {
      id: 'insurance',
      title: 'Insurance & Payment',
      description: 'Payment method and insurance information',
      isCompleted: false,
      isActive: false,
      estimatedTime: 2,
      medicalContext: 'financial-processing',
      prerequisites: ['patient-info'],
      nextSteps: ['confirmation'],
    },
    {
      id: 'confirmation',
      title: 'Confirmation',
      description: 'Review and confirm your appointment',
      isCompleted: false,
      isActive: false,
      estimatedTime: 1,
      medicalContext: 'appointment-finalization',
      prerequisites: ['insurance'],
      nextSteps: [],
    },
  ];

  const handleStepComplete = useCallback((stepId: string, stepData: any) => {
    setBookingData(prev => ({
      ...prev,
      [stepId]: stepData,
    }));

    // Mark step as completed
    const updatedSteps = workflowSteps.map(step =>
      step.id === stepId ? { ...step, isCompleted: true } : step
    );

    // Move to next step
    const currentIndex = updatedSteps.findIndex(step => step.id === stepId);
    if (currentIndex < updatedSteps.length - 1) {
      setCurrentStep(currentIndex + 1);
      updatedSteps[currentIndex + 1].isActive = true;
    }

    trackEvent({
      eventType: 'interaction',
      component: 'AppointmentBookingWorkflow',
      action: 'stepComplete',
      context: 'appointment-booking',
      metadata: { stepId, stepData, currentStep: currentIndex + 1 },
      timestamp: Date.now(),
      sessionId: generateSessionId(),
      deviceType: state.personalization.deviceType,
      healthcareContext: 'appointment',
    });
  }, [trackEvent, state.personalization.deviceType]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      
      trackEvent({
        eventType: 'interaction',
        component: 'AppointmentBookingWorkflow',
        action: 'stepBack',
        context: 'appointment-booking',
        metadata: { currentStep, targetStep: currentStep - 1 },
        timestamp: Date.now(),
        sessionId: generateSessionId(),
        deviceType: state.personalization.deviceType,
      });
    }
  }, [currentStep, trackEvent, state.personalization.deviceType]);

  const handleNext = useCallback(() => {
    if (currentStep < workflowSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      
      trackEvent({
        eventType: 'interaction',
        component: 'AppointmentBookingWorkflow',
        action: 'stepNext',
        context: 'appointment-booking',
        metadata: { currentStep, targetStep: currentStep + 1 },
        timestamp: Date.now(),
        sessionId: generateSessionId(),
        deviceType: state.personalization.deviceType,
      });
    }
  }, [currentStep, workflowSteps.length, trackEvent, state.personalization.deviceType]);

  const handleComplete = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate booking API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      trackEvent({
        eventType: 'conversion',
        component: 'AppointmentBookingWorkflow',
        action: 'bookingComplete',
        context: 'appointment-booking',
        metadata: { bookingData, totalSteps: workflowSteps.length },
        timestamp: Date.now(),
        sessionId: generateSessionId(),
        deviceType: state.personalization.deviceType,
        healthcareContext: 'appointment',
      });

      onComplete(bookingData);
    } catch (err) {
      const errorMessage = 'Failed to complete booking. Please try again.';
      setError(errorMessage);
      
      trackEvent({
        eventType: 'error',
        component: 'AppointmentBookingWorkflow',
        action: 'bookingError',
        context: 'appointment-booking',
        metadata: { error: err, bookingData },
        timestamp: Date.now(),
        sessionId: generateSessionId(),
        deviceType: state.personalization.deviceType,
        healthcareContext: 'appointment',
      });
    } finally {
      setIsLoading(false);
    }
  }, [bookingData, trackEvent, state.personalization.deviceType, onComplete]);

  const getStepIcon = (step: HealthcareWorkflowStep) => {
    const icons = {
      'visit-type': User,
      'time-slot': Clock,
      'patient-info': FileText,
      'insurance': CreditCard,
      'confirmation': CheckCircle,
    };
    return icons[step.id as keyof typeof icons] || CheckCircle;
  };

  const getStepColor = (step: HealthcareWorkflowStep) => {
    if (step.isCompleted) return 'text-green-600 bg-green-100 border-green-300';
    if (step.isActive) return 'text-blue-600 bg-blue-100 border-blue-300';
    return 'text-gray-400 bg-gray-100 border-gray-300';
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Book Appointment
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-2"
            aria-label="Cancel booking"
          >
            ×
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          {workflowSteps.map((step, index) => {
            const Icon = getStepIcon(step);
            return (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200",
                  getStepColor(step)
                )}>
                  {step.isCompleted ? (
                    <CheckCircle size={20} />
                  ) : (
                    <Icon size={20} />
                  )}
                </div>
                
                {index < workflowSteps.length - 1 && (
                  <div className={cn(
                    "w-16 h-0.5 mx-2 transition-all duration-200",
                    step.isCompleted ? "bg-green-300" : "bg-gray-300"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Current step info */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {workflowSteps[currentStep]?.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {workflowSteps[currentStep]?.description}
          </p>
          <div className="flex items-center justify-center space-x-4 mt-2 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Timer className="w-4 h-4" />
              <span>~{workflowSteps[currentStep]?.estimatedTime} min</span>
            </div>
            <span>Step {currentStep + 1} of {workflowSteps.length}</span>
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="p-6 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: reducedMotion ? 0 : 0.3 }}
          >
            {currentStep === 0 && (
              <VisitTypeStep
                onComplete={(data) => handleStepComplete('visit-type', data)}
                reducedMotion={reducedMotion}
              />
            )}
            {currentStep === 1 && (
              <TimeSlotStep
                clinicId={clinicId}
                doctorId={doctorId}
                serviceId={serviceId}
                visitType={bookingData['visit-type']?.type}
                onComplete={(data) => handleStepComplete('time-slot', data)}
                reducedMotion={reducedMotion}
              />
            )}
            {currentStep === 2 && (
              <PatientInfoStep
                onComplete={(data) => handleStepComplete('patient-info', data)}
                reducedMotion={reducedMotion}
              />
            )}
            {currentStep === 3 && (
              <InsurancePaymentStep
                onComplete={(data) => handleStepComplete('insurance', data)}
                reducedMotion={reducedMotion}
              />
            )}
            {currentStep === 4 && (
              <ConfirmationStep
                bookingData={bookingData}
                onComplete={handleComplete}
                isLoading={isLoading}
                error={error}
                reducedMotion={reducedMotion}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors",
              currentStep === 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            )}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <div className="text-sm text-gray-500">
            {workflowSteps.filter(step => step.isCompleted).length} of {workflowSteps.length} completed
          </div>

          {currentStep < workflowSteps.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle size={16} />
              <span>Ready to Complete</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Individual step components

interface VisitTypeStepProps {
  onComplete: (data: any) => void;
  reducedMotion?: boolean;
}

const VisitTypeStep: React.FC<VisitTypeStepProps> = ({ onComplete, reducedMotion = false }) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const visitTypes = [
    {
      id: 'routine-checkup',
      title: 'Routine Checkup',
      description: 'Regular health maintenance visit',
      icon: Heart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      estimatedTime: '30 min',
      medicalUrgency: 'routine',
    },
    {
      id: 'follow-up',
      title: 'Follow-up',
      description: 'Follow-up on previous treatment',
      icon: ArrowRight,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      estimatedTime: '20 min',
      medicalUrgency: 'routine',
    },
    {
      id: 'urgent-care',
      title: 'Urgent Care',
      description: 'Non-emergency but urgent medical concern',
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      estimatedTime: '45 min',
      medicalUrgency: 'urgent',
    },
    {
      id: 'specialist-referral',
      title: 'Specialist Referral',
      description: 'Specialist consultation or referral',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      estimatedTime: '60 min',
      medicalUrgency: 'routine',
    },
  ];

  const handleComplete = () => {
    if (!selectedType) return;

    const visitType = visitTypes.find(type => type.id === selectedType);
    onComplete({
      type: selectedType,
      title: visitType?.title,
      estimatedTime: visitType?.estimatedTime,
      medicalUrgency: visitType?.medicalUrgency,
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-600 dark:text-gray-400">
        Please select the type of visit to help us provide the best care and appropriate scheduling.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visitTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;

          return (
            <motion.button
              key={type.id}
              className={cn(
                "p-4 rounded-lg border-2 text-left transition-all duration-200",
                isSelected
                  ? `${type.bgColor} border-current ${type.color}`
                  : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300"
              )}
              onClick={() => setSelectedType(type.id)}
              whileHover={reducedMotion ? {} : { scale: 1.02 }}
              whileTap={reducedMotion ? {} : { scale: 0.98 }}
            >
              <div className="flex items-start space-x-3">
                <Icon className={isSelected ? type.color : "text-gray-400"} size={24} />
                <div className="flex-1">
                  <h3 className={cn(
                    "font-semibold mb-1",
                    isSelected ? type.color : "text-gray-900 dark:text-gray-100"
                  )}>
                    {type.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {type.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{type.estimatedTime}</span>
                    <span className={cn(
                      "px-2 py-1 rounded-full",
                      type.medicalUrgency === 'urgent' 
                        ? "bg-orange-100 text-orange-700" 
                        : "bg-blue-100 text-blue-700"
                    )}>
                      {type.medicalUrgency}
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleComplete}
          disabled={!selectedType}
          className={cn(
            "px-6 py-2 rounded-lg font-medium transition-colors",
            selectedType
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          )}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

interface TimeSlotStepProps {
  clinicId: string;
  doctorId?: string;
  serviceId?: string;
  visitType?: string;
  onComplete: (data: any) => void;
  reducedMotion?: boolean;
}

const TimeSlotStep: React.FC<TimeSlotStepProps> = ({
  clinicId,
  doctorId,
  serviceId,
  visitType,
  onComplete,
  reducedMotion = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock available time slots
  const mockSlots = [
    { id: '1', date: '2025-11-06', time: '09:00', doctor: 'Dr. Smith', available: true, waitTime: 0 },
    { id: '2', date: '2025-11-06', time: '09:30', doctor: 'Dr. Smith', available: true, waitTime: 5 },
    { id: '3', date: '2025-11-06', time: '10:00', doctor: 'Dr. Johnson', available: true, waitTime: 0 },
    { id: '4', date: '2025-11-06', time: '10:30', doctor: 'Dr. Johnson', available: false, waitTime: 15 },
    { id: '5', date: '2025-11-07', time: '14:00', doctor: 'Dr. Lee', available: true, waitTime: 0 },
    { id: '6', date: '2025-11-07', time: '14:30', doctor: 'Dr. Lee', available: true, waitTime: 10 },
  ];

  const dates = [
    { date: '2025-11-06', day: 'Tomorrow', label: 'Thu, Nov 6' },
    { date: '2025-11-07', day: 'Friday', label: 'Fri, Nov 7' },
    { date: '2025-11-08', day: 'Saturday', label: 'Sat, Nov 8' },
  ];

  useEffect(() => {
    // Filter slots by visit type urgency
    const urgencyMultiplier = visitType === 'urgent-care' ? 2 : 1;
    const filteredSlots = mockSlots.filter(slot => 
      slot.available && (!doctorId || slot.available)
    ).slice(0, 6 * urgencyMultiplier);
    
    setAvailableSlots(filteredSlots);
  }, [clinicId, doctorId, serviceId, visitType]);

  const handleComplete = () => {
    if (!selectedDate || !selectedTime) return;

    const slot = availableSlots.find(s => s.date === selectedDate && s.time === selectedTime);
    onComplete({
      date: selectedDate,
      time: selectedTime,
      doctor: slot?.doctor,
      waitTime: slot?.waitTime,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Select Date & Time
        </h3>
        
        {/* Date selection */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {dates.map((dateOption) => (
            <button
              key={dateOption.date}
              className={cn(
                "p-3 rounded-lg border-2 text-center transition-all duration-200",
                selectedDate === dateOption.date
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
              )}
              onClick={() => setSelectedDate(dateOption.date)}
            >
              <div className="font-medium">{dateOption.day}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {dateOption.label}
              </div>
            </button>
          ))}
        </div>

        {/* Time slots */}
        {selectedDate && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Available Times
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableSlots
                .filter(slot => slot.date === selectedDate)
                .map((slot) => (
                  <button
                    key={slot.id}
                    className={cn(
                      "p-3 rounded-lg border text-center transition-all duration-200",
                      selectedTime === `${slot.date}-${slot.time}`
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300",
                      !slot.available && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => slot.available && setSelectedTime(`${slot.date}-${slot.time}`)}
                    disabled={!slot.available}
                  >
                    <div className="font-medium">{slot.time}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {slot.doctor}
                    </div>
                    {slot.waitTime > 0 && (
                      <div className="text-xs text-orange-600 mt-1">
                        {slot.waitTime} min wait
                      </div>
                    )}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleComplete}
          disabled={!selectedDate || !selectedTime}
          className={cn(
            "px-6 py-2 rounded-lg font-medium transition-colors",
            selectedDate && selectedTime
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          )}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

interface PatientInfoStepProps {
  onComplete: (data: any) => void;
  reducedMotion?: boolean;
}

const PatientInfoStep: React.FC<PatientInfoStepProps> = ({ onComplete, reducedMotion = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    icNumber: '',
    dateOfBirth: '',
    gender: '',
    allergies: '',
    medications: '',
    emergencyContact: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.icNumber.trim()) newErrors.icNumber = 'IC number is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleComplete = () => {
    if (validateForm()) {
      onComplete(formData);
    }
  };

  const inputClass = (field: string) => cn(
    "w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600",
    errors[field] 
      ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
      : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Patient Information
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className={inputClass('name')}
            placeholder="Enter your full name"
          />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className={inputClass('phone')}
            placeholder="+65 9123 4567"
          />
          {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className={inputClass('email')}
            placeholder="your.email@example.com"
          />
          {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            IC Number *
          </label>
          <input
            type="text"
            value={formData.icNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, icNumber: e.target.value }))}
            className={inputClass('icNumber')}
            placeholder="S1234567A"
          />
          {errors.icNumber && <p className="text-red-600 text-xs mt-1">{errors.icNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date of Birth *
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
            className={inputClass('dateOfBirth')}
          />
          {errors.dateOfBirth && <p className="text-red-600 text-xs mt-1">{errors.dateOfBirth}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Gender *
          </label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
            className={inputClass('gender')}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
          {errors.gender && <p className="text-red-600 text-xs mt-1">{errors.gender}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Known Allergies
          </label>
          <textarea
            value={formData.allergies}
            onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
            rows={3}
            placeholder="List any known allergies"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Current Medications
          </label>
          <textarea
            value={formData.medications}
            onChange={(e) => setFormData(prev => ({ ...prev, medications: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
            rows={3}
            placeholder="List any current medications"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Emergency Contact
        </label>
        <input
          type="text"
          value={formData.emergencyContact}
          onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
          className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
          placeholder="Name and phone number"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleComplete}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

interface InsurancePaymentStepProps {
  onComplete: (data: any) => void;
  reducedMotion?: boolean;
}

const InsurancePaymentStep: React.FC<InsurancePaymentStepProps> = ({ onComplete, reducedMotion = false }) => {
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [insuranceProvider, setInsuranceProvider] = useState<string>('');
  const [policyNumber, setPolicyNumber] = useState<string>('');

  const paymentMethods = [
    {
      id: 'medisave',
      title: 'Medisave',
      description: 'Use your Medisave account',
      icon: Shield,
      color: 'text-blue-600',
    },
    {
      id: 'medishield',
      title: 'MediShield Life',
      description: 'Use your MediShield coverage',
      icon: Shield,
      color: 'text-green-600',
    },
    {
      id: 'private-insurance',
      title: 'Private Insurance',
      description: 'Private health insurance',
      icon: CreditCard,
      color: 'text-purple-600',
    },
    {
      id: 'cash',
      title: 'Cash Payment',
      description: 'Pay at the clinic',
      icon: FileText,
      color: 'text-gray-600',
    },
  ];

  const handleComplete = () => {
    onComplete({
      paymentMethod: selectedPayment,
      insuranceProvider,
      policyNumber,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Payment & Insurance
        </h3>
        
        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedPayment === method.id;

            return (
              <button
                key={method.id}
                className={cn(
                  "w-full p-4 rounded-lg border-2 text-left transition-all duration-200",
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                )}
                onClick={() => setSelectedPayment(method.id)}
              >
                <div className="flex items-start space-x-3">
                  <Icon className={isSelected ? method.color : "text-gray-400"} size={24} />
                  <div>
                    <h4 className={cn(
                      "font-medium mb-1",
                      isSelected ? method.color : "text-gray-900 dark:text-gray-100"
                    )}>
                      {method.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {method.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedPayment === 'private-insurance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Insurance Provider
            </label>
            <select
              value={insuranceProvider}
              onChange={(e) => setInsuranceProvider(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Select provider</option>
              <option value="aia">AIA</option>
              <option value="prudential">Prudential</option>
              <option value="ntuc">NTUC Income</option>
              <option value="great-eastern">Great Eastern</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Policy Number
            </label>
            <input
              type="text"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="Enter policy number"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleComplete}
          disabled={!selectedPayment}
          className={cn(
            "px-6 py-2 rounded-lg font-medium transition-colors",
            selectedPayment
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          )}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

interface ConfirmationStepProps {
  bookingData: any;
  onComplete: () => void;
  isLoading: boolean;
  error: string | null;
  reducedMotion?: boolean;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  bookingData,
  onComplete,
  isLoading,
  error,
  reducedMotion = false,
}) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-SG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Review Your Appointment
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please review your appointment details before confirming
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-start">
          <span className="font-medium text-gray-700 dark:text-gray-300">Visit Type:</span>
          <span className="text-gray-900 dark:text-gray-100">
            {bookingData['visit-type']?.title}
          </span>
        </div>

        <div className="flex justify-between items-start">
          <span className="font-medium text-gray-700 dark:text-gray-300">Date & Time:</span>
          <span className="text-gray-900 dark:text-gray-100">
            {formatDate(bookingData['time-slot']?.date)} at {bookingData['time-slot']?.time}
          </span>
        </div>

        <div className="flex justify-between items-start">
          <span className="font-medium text-gray-700 dark:text-gray-300">Doctor:</span>
          <span className="text-gray-900 dark:text-gray-100">
            {bookingData['time-slot']?.doctor}
          </span>
        </div>

        <div className="flex justify-between items-start">
          <span className="font-medium text-gray-700 dark:text-gray-300">Patient:</span>
          <span className="text-gray-900 dark:text-gray-100">
            {bookingData['patient-info']?.name}
          </span>
        </div>

        <div className="flex justify-between items-start">
          <span className="font-medium text-gray-700 dark:text-gray-300">Payment:</span>
          <span className="text-gray-900 dark:text-gray-100 capitalize">
            {bookingData['insurance']?.paymentMethod?.replace('-', ' ')}
          </span>
        </div>

        {bookingData['time-slot']?.waitTime > 0 && (
          <div className="flex justify-between items-start">
            <span className="font-medium text-gray-700 dark:text-gray-300">Estimated Wait:</span>
            <span className="text-orange-600">
              {bookingData['time-slot'].waitTime} minutes
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              What to Expect
            </p>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1">
              <li>• You'll receive a confirmation SMS and email</li>
              <li>• Please arrive 15 minutes early for check-in</li>
              <li>• Bring your IC and insurance card (if applicable)</li>
              <li>• You can cancel or reschedule up to 24 hours before</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onComplete}
          disabled={isLoading}
          className={cn(
            "px-8 py-3 rounded-lg font-medium transition-colors",
            isLoading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          )}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span>Booking...</span>
            </div>
          ) : (
            'Confirm Appointment'
          )}
        </button>
      </div>
    </div>
  );
};

// Utility function
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};