import { createTRPCRouter } from './trpc'
import { clinicRouter } from './routers/clinic'
import { doctorRouter } from './routers/doctor'
import { serviceRouter } from './routers/service'
import { serviceTaxonomyRouter } from './routers/service-taxonomy'
import { appointmentRouter } from './routers/appointment'
import { enquiryRouter } from './routers/enquiry'
import { userRouter } from './routers/user'
import { auditRouter } from './routers/audit'
import { analyticsRouter } from './routers/analytics'
import { healthierSgRouter } from './routers/healthier-sg'
import { serviceClinicIntegrationRouter } from './routers/service-clinic-integration'
import { medicalExpertiseRouter } from './routers/medicalExpertise'
import { doctorClinicIntegrationRouter } from './routers/doctor-clinic-integration'
import { doctorAssignmentRouter } from './routers/doctor-assignment'
import { doctorScheduleRouter } from './routers/doctor-schedule'
import { clinicPartnershipRouter } from './routers/clinic-partnership'
import { eligibilityRouter } from './routers/eligibility'
import { integrationRouter } from './routers/integration'
import { contactCategoryRouter, contactFormRouter, contactEnquiryRouter, contactAnalyticsRouter } from './routers/contact-system'
import { clinicContactIntegrationRouter } from './routers/clinic-contact-integration'
import { 
  contactIntegrationRouter, 
  contactHistoryRouter, 
  contactPreferencesRouter, 
  contactNotificationsRouter, 
  crossSystemIntegrationRouter 
} from './routers/contact-integration'
import { privacyComplianceRouter } from '../routers/privacy-compliance'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  clinic: clinicRouter,
  doctor: doctorRouter,
  service: serviceRouter,
  serviceTaxonomy: serviceTaxonomyRouter,
  appointment: appointmentRouter,
  enquiry: enquiryRouter,
  user: userRouter,
  audit: auditRouter,
  analytics: analyticsRouter,
  healthierSg: healthierSgRouter,
  serviceClinicIntegration: serviceClinicIntegrationRouter,
  medicalExpertise: medicalExpertiseRouter,
  doctorClinicIntegration: doctorClinicIntegrationRouter,
  doctorAssignment: doctorAssignmentRouter,
  doctorSchedule: doctorScheduleRouter,
  clinicPartnership: clinicPartnershipRouter,
  eligibility: eligibilityRouter,
  integration: integrationRouter,
  // Contact System APIs
  contactCategory: contactCategoryRouter,
  contactForm: contactFormRouter,
  contactEnquiry: contactEnquiryRouter,
  contactAnalytics: contactAnalyticsRouter,
  // Clinic Contact Integration
  clinicContactIntegration: clinicContactIntegrationRouter,
  // Contact Integration APIs
  contactIntegration: contactIntegrationRouter,
  contactHistory: contactHistoryRouter,
  contactPreferences: contactPreferencesRouter,
  contactNotifications: contactNotificationsRouter,
  crossSystemIntegration: crossSystemIntegrationRouter,
  // Privacy & Compliance Framework
  privacyCompliance: privacyComplianceRouter,
})

// Export type definition of API
export type AppRouter = typeof appRouter