// Contact Form Components
export { ContactFormContainer, QuickContactForm } from './contact-form-container';
export { ContactFormProvider, useContactForm, useFormPrefill } from './contact-form-provider';
export { ContactFormWizard } from './contact-form-wizard';
export { FormErrorBoundary, FormErrorFallback, useFormErrorHandler, withFormErrorBoundary } from './form-error-boundary';
export { MobileContactForm, MobileStepIndicator } from './mobile-contact-form';

// Form Step Components
export { FormContactTypeStep } from './steps/form-contact-type-step';
export { FormBasicInfoStep } from './steps/form-basic-info-step';
export { FormDetailsStep } from './steps/form-details-step';
export { FormAttachmentsStep } from './steps/form-attachments-step';
export { FormReviewSubmitStep } from './steps/form-review-submit-step';
export { FormConfirmationStep } from './steps/form-confirmation-step';

// File Upload Components
export { FileUploadZone, FilePreview, FileList } from './file-upload-components';
export { validateFiles, processFiles } from './file-upload-components';

// Validation Types
export type {
  ContactFormData,
  AppointmentRequestData,
  GeneralInquiryData,
  MedicalQuestionData,
  BillingInquiryData,
  FeedbackData,
  FileUploadData,
  AutoSaveData,
  ContactType,
} from '@/lib/validations/contact-form';

export {
  contactFormSchema,
  appointmentRequestSchema,
  generalInquirySchema,
  medicalQuestionSchema,
  billingInquirySchema,
  feedbackSchema,
  fileUploadSchema,
  autoSaveSchema,
  CONTACT_TYPES,
} from '@/lib/validations/contact-form';