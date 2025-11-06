import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { ContactType, ContactFormData } from '@/lib/validations/contact-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

// Form state types
interface FormState {
  currentStep: number;
  totalSteps: number;
  formType: ContactType | null;
  formData: Partial<ContactFormData>;
  isSubmitting: boolean;
  errors: Record<string, string>;
  autoSaveEnabled: boolean;
  lastSaved: Date | null;
  sessionId: string;
  isDirty: boolean;
  hasUnsavedChanges: boolean;
}

type FormAction = 
  | { type: 'SET_FORM_TYPE'; payload: ContactType }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'UPDATE_FORM_DATA'; payload: Partial<ContactFormData> }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'RESET_FORM' }
  | { type: 'LOAD_SAVED_DATA'; payload: Partial<ContactFormData> }
  | { type: 'SET_AUTO_SAVE'; payload: boolean }
  | { type: 'SET_LAST_SAVED'; payload: Date }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'SET_HAS_UNSAVED'; payload: boolean };

const initialState: FormState = {
  currentStep: 0,
  totalSteps: 0,
  formType: null,
  formData: {},
  isSubmitting: false,
  errors: {},
  autoSaveEnabled: true,
  lastSaved: null,
  sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  isDirty: false,
  hasUnsavedChanges: false,
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FORM_TYPE':
      const formType = action.payload;
      const maxSteps = getFormMaxSteps(formType);
      return {
        ...state,
        formType,
        totalSteps: maxSteps,
        currentStep: 0,
        formData: { ...state.formData, contactType: formType },
        isDirty: true,
      };
    
    case 'SET_STEP':
      return {
        ...state,
        currentStep: Math.max(0, Math.min(action.payload, state.totalSteps - 1)),
      };
    
    case 'UPDATE_FORM_DATA':
      const newFormData = { ...state.formData, ...action.payload };
      return {
        ...state,
        formData: newFormData,
        isDirty: true,
        hasUnsavedChanges: true,
      };
    
    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.payload,
      };
    
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {},
      };
    
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload,
      };
    
    case 'RESET_FORM':
      return {
        ...initialState,
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        autoSaveEnabled: state.autoSaveEnabled,
      };
    
    case 'LOAD_SAVED_DATA':
      return {
        ...state,
        formData: action.payload,
        isDirty: false,
        hasUnsavedChanges: false,
      };
    
    case 'SET_AUTO_SAVE':
      return {
        ...state,
        autoSaveEnabled: action.payload,
      };
    
    case 'SET_LAST_SAVED':
      return {
        ...state,
        lastSaved: action.payload,
        hasUnsavedChanges: false,
      };
    
    case 'SET_DIRTY':
      return {
        ...state,
        isDirty: action.payload,
      };
    
    case 'SET_HAS_UNSAVED':
      return {
        ...state,
        hasUnsavedChanges: action.payload,
      };
    
    default:
      return state;
  }
}

// Helper function to get max steps for form type
function getFormMaxSteps(formType: ContactType): number {
  switch (formType) {
    case 'appointment':
      return 4;
    case 'medical':
      return 4;
    case 'general':
    case 'billing':
    case 'feedback':
      return 3;
    default:
      return 3;
  }
}

// Context type
interface ContactFormContextType {
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
  // Actions
  setFormType: (type: ContactType) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<ContactFormData>) => void;
  setErrors: (errors: Record<string, string>) => void;
  clearErrors: () => void;
  setSubmitting: (submitting: boolean) => void;
  resetForm: () => void;
  enableAutoSave: () => void;
  disableAutoSave: () => void;
  // Computed
  isFirstStep: boolean;
  isLastStep: boolean;
  progress: number;
  canProceedToNext: boolean;
  hasRequiredFields: boolean;
  nextStepLabel: string;
}

// Context
const ContactFormContext = createContext<ContactFormContextType | null>(null);

// Provider component
interface ContactFormProviderProps {
  children: React.ReactNode;
  initialFormType?: ContactType;
  autoSaveEnabled?: boolean;
  onFormTypeChange?: (type: ContactType) => void;
}

export function ContactFormProvider({ 
  children, 
  initialFormType, 
  autoSaveEnabled = true,
  onFormTypeChange 
}: ContactFormProviderProps) {
  const [state, dispatch] = useReducer(formReducer, {
    ...initialState,
    autoSaveEnabled,
    ...(initialFormType && { formType: initialFormType, totalSteps: getFormMaxSteps(initialFormType) }),
  });

  // Auto-save functionality
  const { mutate: saveFormData, isPending: isSaving } = useMutation({
    mutationFn: async (data: { formType: string; currentStep: number; formData: any; sessionId: string }) => {
      const response = await fetch('/api/contact/autosave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          lastSaved: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error('Failed to save form data');
      return response.json();
    },
    onSuccess: (data) => {
      dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });
      toast.success('Form auto-saved successfully');
    },
    onError: (error) => {
      console.error('Auto-save failed:', error);
      // Don't show error toast to user for auto-save failures
    },
  });

  // Auto-save effect
  useEffect(() => {
    if (!state.autoSaveEnabled || !state.isDirty || !state.formType) return;

    const timeoutId = setTimeout(() => {
      if (state.hasUnsavedChanges) {
        saveFormData({
          formType: state.formType,
          currentStep: state.currentStep,
          formData: state.formData,
          sessionId: state.sessionId,
        });
      }
    }, 2000); // Save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [state.formData, state.currentStep, state.isDirty, state.hasUnsavedChanges]);

  // Load saved data on mount
  useQuery({
    queryKey: ['contact-form-autosave', state.sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/contact/autosave/${state.sessionId}`);
      if (!response.ok) return null;
      return response.json();
    },
    onSuccess: (data) => {
      if (data) {
        dispatch({ type: 'LOAD_SAVED_DATA', payload: data.formData });
      }
    },
  });

  // Form type change handler
  useEffect(() => {
    if (state.formType && onFormTypeChange) {
      onFormTypeChange(state.formType);
    }
  }, [state.formType, onFormTypeChange]);

  // Actions
  const setFormType = useCallback((type: ContactType) => {
    dispatch({ type: 'SET_FORM_TYPE', payload: type });
  }, []);

  const setStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const nextStep = useCallback(() => {
    if (state.currentStep < state.totalSteps - 1) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep + 1 });
    }
  }, [state.currentStep, state.totalSteps]);

  const prevStep = useCallback(() => {
    if (state.currentStep > 0) {
      dispatch({ type: 'SET_STEP', payload: state.currentStep - 1 });
    }
  }, [state.currentStep]);

  const updateFormData = useCallback((data: Partial<ContactFormData>) => {
    dispatch({ type: 'UPDATE_FORM_DATA', payload: data });
  }, []);

  const setErrors = useCallback((errors: Record<string, string>) => {
    dispatch({ type: 'SET_ERRORS', payload: errors });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  const setSubmitting = useCallback((submitting: boolean) => {
    dispatch({ type: 'SET_SUBMITTING', payload: submitting });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  const enableAutoSave = useCallback(() => {
    dispatch({ type: 'SET_AUTO_SAVE', payload: true });
  }, []);

  const disableAutoSave = useCallback(() => {
    dispatch({ type: 'SET_AUTO_SAVE', payload: false });
  }, []);

  // Computed values
  const isFirstStep = state.currentStep === 0;
  const isLastStep = state.currentStep === state.totalSteps - 1;
  const progress = state.totalSteps > 0 ? (state.currentStep / (state.totalSteps - 1)) * 100 : 0;
  
  // Simple validation check - in a real implementation, you'd use Zod schemas
  const canProceedToNext = Object.keys(state.errors).length === 0;
  const hasRequiredFields = true; // This would be computed based on current step requirements

  const getNextStepLabel = () => {
    if (isLastStep) return 'Submit';
    if (state.currentStep === 0) return 'Continue';
    return 'Next';
  };

  const contextValue: ContactFormContextType = {
    state,
    dispatch,
    setFormType,
    setStep,
    nextStep,
    prevStep,
    updateFormData,
    setErrors,
    clearErrors,
    setSubmitting,
    resetForm,
    enableAutoSave,
    disableAutoSave,
    isFirstStep,
    isLastStep,
    progress,
    canProceedToNext,
    hasRequiredFields,
    nextStepLabel: getNextStepLabel(),
  };

  return (
    <ContactFormContext.Provider value={contextValue}>
      {children}
    </ContactFormContext.Provider>
  );
}

// Hook to use the context
export function useContactForm() {
  const context = useContext(ContactFormContext);
  if (!context) {
    throw new Error('useContactForm must be used within a ContactFormProvider');
  }
  return context;
}

// Utility hook for form pre-filling
export function useFormPrefill() {
  const { state, updateFormData } = useContactForm();

  const prefillFromUserProfile = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/profile`);
      if (!response.ok) return;
      
      const userData = await response.json();
      const formData = {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        preferredContact: userData.preferredContact || 'email',
        preferredLanguage: userData.preferredLanguage || 'english',
        isNewPatient: userData.isNewPatient !== false,
      };
      
      updateFormData(formData);
    } catch (error) {
      console.error('Failed to prefill user data:', error);
    }
  }, [updateFormData]);

  const prefillFromUrlParams = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const formData: Partial<ContactFormData> = {};
    
    // Extract common form fields from URL
    ['firstName', 'lastName', 'email', 'phone', 'doctorName', 'clinicName'].forEach(field => {
      const value = urlParams.get(field);
      if (value) {
        formData[field as keyof ContactFormData] = value;
      }
    });
    
    if (Object.keys(formData).length > 0) {
      updateFormData(formData);
    }
  }, [updateFormData]);

  const prefillFromPreviousInteraction = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/interactions`);
      if (!response.ok) return;
      
      const interactions = await response.json();
      if (interactions.length > 0) {
        const lastInteraction = interactions[interactions.length - 1];
        const formData = {
          firstName: lastInteraction.userName?.split(' ')[0] || '',
          lastName: lastInteraction.userName?.split(' ').slice(1).join(' ') || '',
          email: lastInteraction.userEmail || '',
          phone: lastInteraction.userPhone || '',
        };
        
        updateFormData(formData);
      }
    } catch (error) {
      console.error('Failed to prefill from previous interactions:', error);
    }
  }, [updateFormData]);

  return {
    prefillFromUserProfile,
    prefillFromUrlParams,
    prefillFromPreviousInteraction,
  };
}