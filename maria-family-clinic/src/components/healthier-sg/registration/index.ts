// Registration Workflow Components

// Main Registration Wizard
export { RegistrationWizard } from './RegistrationWizard'

// Registration Step Components
export { RegistrationStepPersonalInfo } from './steps/RegistrationStepPersonalInfo'
export { RegistrationStepIdentity } from './steps/RegistrationStepIdentity'
export { RegistrationStepConsent } from './steps/RegistrationStepConsent'
export { RegistrationStepDocuments } from './steps/RegistrationStepDocuments'
export { RegistrationStepGoals } from './steps/RegistrationStepGoals'
export { RegistrationStepReview } from './steps/RegistrationStepReview'
export { RegistrationStepConfirmation } from './steps/RegistrationStepConfirmation'

// Supporting Components
export { ConsentForm } from './ConsentForm'
export { RegistrationStatus } from './RegistrationStatus'
export { DocumentUpload } from './DocumentUpload'
export { NotificationCenter } from './NotificationCenter'
export { RegistrationDashboard } from './RegistrationDashboard'
export { SupportRequest } from './SupportRequest'

// Types
export * from '../types/registration'