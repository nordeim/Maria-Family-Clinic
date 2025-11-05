# Contact & Enquiry Management System Architecture
## Sub-Phase 9.1: Comprehensive Database Design & Implementation Guide

### Executive Summary

The Contact & Enquiry Management System provides a comprehensive foundation for handling all patient and user communications within the healthcare platform. This system integrates seamlessly with existing clinic, doctor, and service data to provide personalized, efficient, and compliant contact management.

### System Overview

The contact system consists of 11 core models with 85+ fields designed to handle:

- **Contact Form Categories**: General, Appointment, Healthier SG, Urgent, Technical Support
- **Enquiry Status Tracking**: New → Under Review → Assigned → In Progress → Resolved → Closed
- **Contact Routing & Assignment**: Automatic routing based on category, urgency, and expertise
- **Contact History & Communication Trail**: Complete audit trail for compliance
- **Analytics & Performance Tracking**: Real-time metrics and reporting
- **Healthcare Compliance**: PDPA, GDPR, and medical data protection

---

## Database Architecture

### Core Models & Relationships

#### 1. ContactCategory
**Purpose**: Defines different types of contact forms and their characteristics
```sql
- id: String (Primary Key)
- name: String (Unique) - 'general', 'appointment', 'healthier_sg', 'urgent', 'technical_support'
- displayName: String
- description: Text
- priority: ContactCategoryPriority (LOW, STANDARD, HIGH, URGENT, CRITICAL)
- department: ContactDepartment (GENERAL, APPOINTMENTS, HEALTHIER_SG, etc.)
- responseSLAHours: Int (Target response time)
- resolutionSLADays: Int (Target resolution time)
- formFields: JSON (Required form fields)
- validationRules: JSON (Category-specific validation)
- autoResponse: Boolean (Send automatic confirmation)
- routingRules: JSON (Automatic routing rules)
```

#### 2. ContactForm
**Purpose**: Main contact form submission with healthcare-specific fields
```sql
- id: String (Primary Key)
- referenceNumber: String (Unique) - Auto-generated CF{YYYYMMDD}{0001}
- categoryId: String (Foreign Key → ContactCategory)
- userId: String? (Foreign Key → User) - Registered user
- clinicId: String? (Foreign Key → Clinic) - Related clinic
- doctorId: String? (Foreign Key → Doctor) - Related doctor
- serviceId: String? (Foreign Key → Service) - Related service
- contactName: String
- contactEmail: String
- contactPhone: String?
- subject: String
- message: Text
- formData: JSON (All form field values)
- medicalInformation: Text? (Healthcare-specific info)
- urgencyLevel: UrgencyLevel (ROUTINE, HIGH, URGENT, etc.)
- appointmentUrgency: AppointmentUrgency (STANDARD, PRIORITY, URGENT, etc.)
- privacyConsent: Boolean
- gdprConsent: Boolean
- pdpaConsent: Boolean
- status: ContactStatus (SUBMITTED, UNDER_REVIEW, RESOLVED, etc.)
- priority: ContactPriority (LOW, NORMAL, HIGH, URGENT, CRITICAL)
- responseDue: DateTime?
- firstResponseTime: Int? (Minutes to first response)
```

#### 3. Enquiry
**Purpose**: Detailed enquiry management with workflow tracking
```sql
- id: String (Primary Key)
- contactFormId: String? (Unique → ContactForm)
- enquiryNumber: String (Unique) - Auto-generated ENQ{YYYYMMDD}{0001}
- categoryId: String (Foreign Key → ContactCategory)
- userId: String? (Foreign Key → User)
- clinicId: String? (Foreign Key → Clinic)
- doctorId: String? (Foreign Key → Doctor)
- serviceId: String? (Foreign Key → Service)
- title: String
- description: Text
- enquiryType: EnquiryType (INFORMATIONAL, COMPLAINT, COMPLIMENT, etc.)
- status: EnquiryStatus (NEW, UNDER_REVIEW, ASSIGNED, etc.)
- priority: EnquiryPriority (LOW, NORMAL, HIGH, URGENT, CRITICAL)
- urgencyLevel: UrgencyLevel
- businessImpact: BusinessImpact (LOW, MEDIUM, HIGH, CRITICAL)
- assignedAgentId: String?
- assignedTeam: ContactTeam
- department: ContactDepartment
- medicalReview: Boolean (Requires medical review)
- complianceReview: Boolean (Requires compliance review)
- customerSatisfaction: Int? (1-5 rating)
- slaBreached: Boolean
- escalationCount: Int
- requiresFollowUp: Boolean
- followUpDate: DateTime?
- workflowStage: String (intake, investigation, resolution, closure)
- externalReference: String? (External system reference)
- integrationStatus: IntegrationSyncStatus
```

#### 4. ContactAssignment
**Purpose**: Assignment management with skill-based routing
```sql
- id: String (Primary Key)
- enquiryId: String (Foreign Key → Enquiry)
- assigneeType: AssigneeType (AGENT, TEAM, DEPARTMENT, SPECIALIST)
- assigneeId: String? (Agent/team/department ID)
- assigneeName: String
- assignedBy: String (User ID)
- assignmentMethod: AssignmentMethod (MANUAL, AUTO_ROUND_ROBIN, AUTO_SKILL_BASED)
- skillMatch: JSON (Skills matching data)
- status: AssignmentStatus (ACTIVE, ACCEPTED, DECLINED, etc.)
- isReassignment: Boolean
- previousAssignee: String?
- assignmentScore: Float? (How well assignment matches requirements)
- responseTime: Int? (Minutes to first response)
- resolutionTime: Int? (Minutes to resolution)
```

#### 5. ContactHistory
**Purpose**: Complete audit trail for compliance and tracking
```sql
- id: String (Primary Key)
- enquiryId: String (Foreign Key → Enquiry)
- actionType: ContactActionType (CREATED, ASSIGNED, STATUS_CHANGED, etc.)
- actorType: ActorType (USER, AGENT, SUPERVISOR, SYSTEM, AUTOMATION)
- actorId: String? (ID of who performed the action)
- actorName: String
- fieldChanged: String? (Field that was changed)
- oldValue: Text?
- newValue: Text?
- communicationType: CommunicationType (EMAIL, PHONE_CALL, SMS, etc.)
- messageContent: Text?
- messageDirection: MessageDirection (INBOUND, OUTBOUND, INTERNAL)
- medicalRecord: Boolean
- containsPHI: Boolean (Protected Health Information)
- auditTrail: Boolean
- metadata: JSON
- tags: String[]
```

#### 6. ContactResponse
**Purpose**: Communication responses with quality tracking
```sql
- id: String (Primary Key)
- enquiryId: String (Foreign Key → Enquiry)
- responseType: ResponseType (INITIAL_RESPONSE, FOLLOW_UP, RESOLUTION, etc.)
- senderType: SenderType (AGENT, SUPERVISOR, SYSTEM, AUTOMATION)
- senderId: String?
- senderName: String
- recipientName: String
- recipientEmail: String
- channel: CommunicationChannel (EMAIL, SMS, PHONE, CHAT, etc.)
- content: Text
- status: ResponseStatus (DRAFT, SENT, DELIVERED, READ, etc.)
- satisfactionRating: Int? (1-5 rating from recipient)
- qualityScore: Float? (Internal quality assessment)
- responseTime: Int? (Minutes from enquiry to response)
- templateUsed: String?
- autoGenerated: Boolean
- medicalAdvice: Boolean
- disclaimerRequired: Boolean
- complianceChecked: Boolean
- requiresFollowUp: Boolean
- followUpDate: DateTime?
```

#### 7. ContactRouting
**Purpose**: Automatic routing rules and assignment logic
```sql
- id: String (Primary Key)
- name: String (Unique)
- displayName: String
- isActive: Boolean
- priority: Int (Lower number = higher priority)
- categoryId: String? (Specific category, null for all)
- criteria: JSON (Conditions for routing)
- weight: Float (Rule weight)
- targetType: RoutingTargetType (AGENT, TEAM, DEPARTMENT, SPECIALIST)
- targetId: String?
- targetName: String
- routingMethod: RoutingMethod (DIRECT, ROUND_ROBIN, SKILL_BASED, etc.)
- skillRequirements: JSON (Required skills)
- checkAvailability: Boolean
- maxWorkload: Int? (Maximum concurrent enquiries)
- fallbackEnabled: Boolean
- usageCount: Int
- successRate: Float?
- avgResponseTime: Int?
```

#### 8. ContactEscalation
**Purpose**: Escalation management with SLA tracking
```sql
- id: String (Primary Key)
- enquiryId: String (Foreign Key → Enquiry)
- escalationType: EscalationType (SLA_BREACH, CUSTOMER_REQUEST, COMPLEXITY, etc.)
- escalationReason: Text
- triggeredBy: Text
- fromLevel: EscalationLevel (L1_AGENT, L2_SUPERVISOR, L3_SPECIALIST, etc.)
- toLevel: EscalationLevel
- triggeredAt: DateTime
- triggeredByUser: String?
- escalatedToUser: String?
- escalatedToTeam: String?
- status: EscalationStatus (ACTIVE, IN_PROGRESS, RESOLVED, etc.)
- customerNotified: Boolean
- slaImpact: JSON (SLA impact data)
- autoTriggered: Boolean
- automationRule: String?
```

#### 9. ContactFormAnalytics
**Purpose**: Form submission analytics and user experience metrics
```sql
- id: String (Primary Key)
- contactFormId: String (Unique → ContactForm)
- submissionTime: Int (Seconds to complete form)
- fieldCompletionTime: JSON (Time per field)
- userSatisfaction: Float? (1-5 rating from user)
- errorCount: Int
- correctionCount: Int (How many times user corrected data)
- deviceType: DeviceType (DESKTOP, MOBILE, TABLET)
- browserType: String
- referralSource: String
- messageSentiment: SentimentScore (VERY_NEGATIVE to VERY_POSITIVE)
- urgencyDetected: Boolean
- spamScore: Float?
- apiResponseTime: Int? (Milliseconds)
- processingTime: Int? (Total processing time)
- testVariant: String? (A/B test variant)
```

#### 10. ContactEnquiryAnalytics
**Purpose**: Enquiry resolution analytics and performance tracking
```sql
- id: String (Primary Key)
- enquiryId: String (Unique → Enquiry)
- totalResolutionTime: Int? (Total minutes to resolution)
- firstResponseTime: Int? (Minutes to first response)
- followUpCount: Int (Number of follow-ups needed)
- communicationCount: Int (Total communications)
- customerSatisfaction: Float? (1-5 rating)
- agentSatisfaction: Float? (Agent self-rating)
- qualityScore: Float? (Internal quality assessment)
- resolutionEfficiency: Float? (Score based on time vs complexity)
- escalationRate: Float? (Whether escalation was needed)
- handlingCost: Float? (Estimated cost to handle)
- resolved: Boolean
- customerRetained: Boolean?
- repeatContact: Boolean (Customer contacted again)
- lessonsLearned: Text
- improvementSuggestions: Text
```

#### 11. Supporting Models
- **ContactTemplate**: Auto-response templates and message templates
- **ContactKnowledgeBase**: Knowledge base articles for agent assistance
- **ContactFormTemplate**: Reusable form configurations

---

## Contact Form Categories

### 1. General Enquiries
```javascript
{
  name: 'general',
  displayName: 'General Enquiries',
  priority: 'STANDARD',
  department: 'GENERAL',
  responseSLAHours: 24,
  resolutionSLADays: 7,
  formFields: [
    { name: 'subject', required: true, type: 'text' },
    { name: 'message', required: true, type: 'textarea' },
    { name: 'preferredLanguage', type: 'select', options: ['en', 'zh', 'ms', 'ta'] }
  ],
  autoResponse: true
}
```

### 2. Appointment Related
```javascript
{
  name: 'appointment',
  displayName: 'Appointment Related',
  priority: 'HIGH',
  department: 'APPOINTMENTS',
  responseSLAHours: 4,
  resolutionSLADays: 2,
  formFields: [
    { name: 'clinicId', type: 'select', required: true },
    { name: 'preferredDate', type: 'date', required: true },
    { name: 'preferredTime', type: 'select', required: true },
    { name: 'serviceType', type: 'select', required: true },
    { name: 'urgency', type: 'select', options: ['standard', 'priority', 'urgent'] }
  ],
  routingRules: [
    { condition: { urgency: 'urgent' }, target: 'EMERGENCY_RESPONSE' },
    { condition: { serviceType: 'Healthier SG' }, target: 'HEALTHIER_SG_SPECIALISTS' }
  ]
}
```

### 3. Healthier SG Program
```javascript
{
  name: 'healthier_sg',
  displayName: 'Healthier SG Program',
  priority: 'HIGH',
  department: 'HEALTHIER_SG',
  requiresAuth: true,
  requiresVerification: true,
  responseSLAHours: 8,
  resolutionSLADays: 3,
  medicalFields: true,
  requiresConsent: true,
  hipaaCompliant: true,
  formFields: [
    { name: 'nric', type: 'text', required: true },
    { name: 'eligibilityStatus', type: 'select' },
    { name: 'programComponent', type: 'select' },
    { name: 'medicalConditions', type: 'checkbox' },
    { name: 'consent', type: 'checkbox', required: true }
  ]
}
```

### 4. Urgent Care
```javascript
{
  name: 'urgent',
  displayName: 'Urgent Care',
  priority: 'URGENT',
  department: 'EMERGENCY',
  responseSLAHours: 1,
  resolutionSLADays: 1,
  requiresVerification: true,
  formFields: [
    { name: 'symptoms', type: 'textarea', required: true },
    { name: 'severity', type: 'select', required: true },
    { name: 'duration', type: 'select', required: true },
    { name: 'contactPhone', type: 'phone', required: true }
  ],
  escalationRules: [
    { trigger: 'severity:critical', escalateTo: 'EMERGENCY', immediate: true }
  ]
}
```

### 5. Technical Support
```javascript
{
  name: 'technical_support',
  displayName: 'Technical Support',
  priority: 'NORMAL',
  department: 'TECHNICAL_SUPPORT',
  responseSLAHours: 8,
  resolutionSLADays: 5,
  formFields: [
    { name: 'issueCategory', type: 'select', required: true },
    { name: 'browserType', type: 'select' },
    { name: 'deviceType', type: 'select' },
    { name: 'stepsToReproduce', type: 'textarea', required: true },
    { name: 'screenshot', type: 'file' }
  ]
}
```

---

## Contact Routing & Assignment Logic

### Routing Criteria
```javascript
// Automatic routing based on multiple factors
const routingCriteria = {
  category: {
    'appointment': { team: 'APPOINTMENT_TEAM', priority: 'HIGH' },
    'healthier_sg': { team: 'HEALTHIER_SG_SPECIALISTS', priority: 'HIGH' },
    'urgent': { team: 'EMERGENCY_RESPONSE', priority: 'URGENT' },
    'technical_support': { team: 'TECHNICAL_SUPPORT', priority: 'NORMAL' }
  },
  urgency: {
    'CRITICAL': { team: 'EMERGENCY_RESPONSE', immediate: true },
    'URGENT': { team: 'ESCALATION_TEAM', priority: 'HIGH' },
    'HIGH': { team: 'SPECIALIST', priority: 'HIGH' }
  },
  medicalReview: {
    true: { team: 'MEDICAL_CONSULTANTS', requiresVerification: true }
  },
  businessHours: {
    afterHours: { team: 'EMERGENCY_RESPONSE', fallback: true }
  }
}
```

### Assignment Methods
1. **Manual Assignment**: Direct assignment by supervisor
2. **Round Robin**: Equal distribution among available agents
3. **Skill-based**: Assignment based on agent expertise and language
4. **Load Balanced**: Assignment to agent with lowest current workload
5. **Specialist Routing**: Direct routing to specialized teams
6. **Geographic**: Assignment based on user location/clinic proximity

---

## Enquiry Status Workflow

### Status Flow
```
NEW → UNDER_REVIEW → ASSIGNED → IN_PROGRESS → 
WAITING_CUSTOMER → PENDING_RESOLUTION → RESOLVED → CLOSED
     ↓              ↓              ↓
 ESCALATED ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
```

### Status Definitions
- **NEW**: Fresh enquiry, not yet reviewed
- **UNDER_REVIEW**: Being analyzed and categorized
- **ASSIGNED**: Assigned to specific agent/team
- **IN_PROGRESS**: Actively being worked on
- **WAITING_CUSTOMER**: Awaiting customer response
- **WAITING_INTERNAL**: Awaiting internal resources/information
- **PENDING_RESOLUTION**: Final resolution steps in progress
- **RESOLVED**: Issue resolved, awaiting customer confirmation
- **CLOSED**: Confirmed resolved and case closed
- **ESCALATED**: Escalated to higher level/team
- **CANCELLED**: Enquiry cancelled (duplicate, invalid, etc.)

### Workflow Automation
```javascript
const workflowRules = {
  onCreate: [
    { action: 'autoAssign', condition: { category: 'urgent' } },
    { action: 'sendAcknowledgment', condition: { autoResponse: true } },
    { action: 'checkSpam', condition: { source: 'web_form' } }
  ],
  onAssignment: [
    { action: 'notifyAgent', condition: { priority: 'high' } },
    { action: 'updateResponseDue', condition: { sla: 'strict' } },
    { action: 'logAssignment', condition: {} }
  ],
  onStatusChange: [
    { action: 'checkEscalation', condition: { status: 'overdue' } },
    { action: 'notifyCustomer', condition: { status: 'resolved' } },
    { action: 'logStatusChange', condition: {} }
  ]
}
```

---

## Integration with Existing Healthcare Data

### User Integration
```typescript
interface ContactFormWithUser extends ContactForm {
  user: User & {
    profile: UserProfile;
    preferences: UserPreferences;
    eligibilityAssessments: EligibilityAssessment[];
  };
}
```

### Clinic Integration
```typescript
interface ContactFormWithClinic extends ContactForm {
  clinic: Clinic & {
    services: ClinicService[];
    languages: ClinicLanguage[];
    operatingHours: OperatingHours[];
  };
}
```

### Doctor Integration
```typescript
interface EnquiryWithDoctor extends Enquiry {
  doctor: Doctor & {
    specialties: DoctorSpecialty[];
    clinics: DoctorClinic[];
    availability: DoctorAvailability[];
  };
}
```

### Service Integration
```typescript
interface ContactFormWithService extends ContactForm {
  service: Service & {
    category: ServiceCategory;
    clinics: ClinicService[];
    pricing: ServicePricingStructure[];
  };
}
```

---

## Analytics & Performance Tracking

### Key Performance Indicators (KPIs)
```javascript
const contactKPIs = {
  // Response Metrics
  firstResponseTime: 'Average time to first response',
  resolutionTime: 'Average time to resolution',
  responseRate: 'Percentage of enquiries responded to within SLA',
  
  // Quality Metrics
  customerSatisfaction: 'Average satisfaction rating (1-5)',
  firstContactResolution: 'Percentage resolved in first interaction',
  escalationRate: 'Percentage of enquiries requiring escalation',
  
  // Volume Metrics
  contactFormVolume: 'Number of contact forms by category',
  enquiryVolume: 'Number of enquiries by status and priority',
  agentWorkload: 'Current workload per agent/team',
  
  // Business Impact
  businessImpact: 'Distribution of business impact levels',
  repeatContact: 'Percentage of customers contacting again',
  customerRetention: 'Retention rate after contact resolution'
}
```

### Dashboard Views
1. **Contact Form Stats View**
   - Forms by category, status, priority
   - Submission time analytics
   - User satisfaction trends
   - Device/browser analytics

2. **Enquiry Resolution Metrics View**
   - Resolution time by category
   - SLA compliance rates
   - Escalation patterns
   - Follow-up requirements

3. **Agent Performance View**
   - Workload distribution
   - Response time performance
   - Customer satisfaction scores
   - Resolution efficiency

---

## Healthcare Compliance & Security

### Data Protection Measures
1. **Personal Data Protection Act (PDPA) Compliance**
   - Explicit consent collection
   - Data minimization principles
   - Purpose limitation
   - Retention period enforcement

2. **General Data Protection Regulation (GDPR) Compliance**
   - Right to access
   - Right to rectification
   - Right to erasure
   - Data portability

3. **Healthcare-Specific Security**
   - Protected Health Information (PHI) handling
   - Medical record audit trails
   - HIPAA compliance features
   - Encryption for sensitive data

### Privacy Controls
```sql
-- Row Level Security (RLS) policies for multi-tenant access
CREATE POLICY contact_forms_user_access ON contact_forms
  FOR ALL TO authenticated_user
  USING (
    user_id = auth.uid() OR 
    assigned_agent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('supervisor', 'admin', 'manager')
    )
  );

-- Audit logging for sensitive operations
CREATE OR REPLACE FUNCTION log_contact_access()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'SELECT' AND OLD.contains_phi = true THEN
    INSERT INTO contact_histories (
      enquiry_id, action_type, actor_type, actor_id, 
      field_changed, metadata
    ) VALUES (
      NEW.id, 'ACCESSED'::contact_action_type, 
      'USER'::actor_type, auth.uid(),
      'contains_phi', jsonb_build_object(
        'table', TG_TABLE_NAME,
        'timestamp', now()
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Implementation Guide

### 1. Database Migration
```bash
# Apply the contact system migration
npx prisma migrate deploy --name contact_system_comprehensive_schema

# Generate Prisma client with new models
npx prisma generate

# Seed initial data
npx prisma db seed
```

### 2. API Endpoints Structure
```
/api/contact/
├── categories/           # Contact categories
│   ├── GET    /          # List categories
│   ├── POST   /          # Create category
│   ├── GET    /:id       # Get category
│   └── PUT    /:id       # Update category
├── forms/               # Contact forms
│   ├── GET    /          # List forms with filtering
│   ├── POST   /          # Create form
│   ├── GET    /:id       # Get form
│   └── PUT    /:id       # Update form
├── enquiries/           # Enquiries
│   ├── GET    /          # List enquiries
│   ├── POST   /          # Create enquiry
│   ├── GET    /:id       # Get enquiry
│   ├── PUT    /:id       # Update enquiry
│   └── POST   /:id/assign # Assign enquiry
├── assignments/         # Assignments
│   ├── GET    /          # List assignments
│   ├── POST   /          # Create assignment
│   └── PUT    /:id       # Update assignment
├── responses/           # Responses
│   ├── GET    /enquiry/:id # Get enquiry responses
│   ├── POST   /          # Create response
│   └── PUT    /:id       # Update response
├── routing/             # Routing rules
│   ├── GET    /          # List routing rules
│   ├── POST   /          # Create rule
│   └── PUT    /:id       # Update rule
├── analytics/           # Analytics
│   ├── GET    /forms     # Form analytics
│   ├── GET    /enquiries # Enquiry analytics
│   └── GET    /dashboard # Dashboard stats
└── templates/           # Templates
    ├── GET    /          # List templates
    ├── POST   /          # Create template
    └── GET    /:id       # Get template
```

### 3. Frontend Components Structure
```
/src/components/contact/
├── ContactForm.tsx           # Main contact form component
├── ContactFormField.tsx      # Reusable form field
├── ContactCategorySelector.tsx # Category selection
├── ContactSubmission.tsx     # Submission confirmation
├── EnquiryList.tsx           # Enquiry listing
├── EnquiryDetail.tsx         # Enquiry detail view
├── EnquiryAssignment.tsx     # Assignment interface
├── ContactResponse.tsx       # Response interface
├── ContactHistory.tsx        # History timeline
├── ContactAnalytics.tsx      # Analytics dashboard
└── ContactTemplates.tsx      # Template management
```

### 4. Business Logic Services
```typescript
// ContactFormService.ts
class ContactFormService {
  async createForm(data: CreateContactFormDto): Promise<ContactForm> {
    // 1. Validate form data
    // 2. Check for duplicates
    // 3. Apply spam filtering
    // 4. Generate reference number
    // 5. Auto-assign if needed
    // 6. Send auto-response
    // 7. Create analytics record
  }

  async updateForm(id: string, data: UpdateContactFormDto): Promise<ContactForm> {
    // 1. Check permissions
    // 2. Log changes
    // 3. Update analytics
    // 4. Trigger workflow if status changed
  }
}

// EnquiryService.ts
class EnquiryService {
  async createEnquiry(data: CreateEnquiryDto): Promise<Enquiry> {
    // 1. Generate enquiry number
    // 2. Auto-assign based on routing rules
    // 3. Set up workflow
    // 4. Create initial history entry
  }

  async assignEnquiry(enquiryId: string, assignment: ContactAssignmentDto): Promise<ContactAssignment> {
    // 1. Check assignee availability
    // 2. Update workload
    // 3. Log assignment
    // 4. Notify assignee
  }
}

// RoutingService.ts
class RoutingService {
  async routeContactForm(contactForm: ContactForm): Promise<ContactAssignment> {
    // 1. Apply routing rules
    // 2. Check agent availability
    // 3. Consider load balancing
    // 4. Check skill requirements
    // 5. Assign to best match
  }
}
```

### 5. Database Indexes Strategy
```sql
-- Contact form queries
CREATE INDEX CONCURRENTLY contact_forms_status_priority_created_idx 
  ON contact_forms(status, priority, created_at);

CREATE INDEX CONCURRENTLY contact_forms_category_status_created_idx 
  ON contact_forms(category_id, status, created_at);

-- Enquiry resolution queries
CREATE INDEX CONCURRENTLY enquiries_status_assigned_agent_resolved_idx 
  ON enquiries(status, assigned_agent_id, resolved_at);

CREATE INDEX CONCURRENTLY enquiries_category_priority_created_idx 
  ON enquiries(category_id, priority, created_at);

-- Healthcare integration queries
CREATE INDEX CONCURRENTLY enquiries_clinic_doctor_service_created_idx 
  ON enquiries(clinic_id, doctor_id, service_id, created_at);

-- Assignment queries
CREATE INDEX CONCURRENTLY contact_assignments_assignee_status_created_idx 
  ON contact_assignments(assignee_type, assignee_id, status, created_at);

-- Analytics queries
CREATE INDEX CONCURRENTLY contact_form_analytics_submission_time_user_satisfaction_idx 
  ON contact_form_analytics(submission_time, user_satisfaction);

CREATE INDEX CONCURRENTLY contact_enquiry_analytics_resolution_time_satisfaction_idx 
  ON contact_enquiry_analytics(total_resolution_time, customer_satisfaction);
```

---

## Performance Optimization

### Query Optimization
1. **Composite Indexes**: Optimized for common multi-column queries
2. **Partial Indexes**: For status-based filtering
3. **Materialized Views**: For heavy analytics queries
4. **Connection Pooling**: Database connection management
5. **Caching Strategy**: Redis for frequently accessed data

### Caching Layers
```typescript
// Contact category caching
const categoryCache = new Map<string, ContactCategory>();

// Agent availability caching
const agentAvailabilityCache = new Map<string, AgentStatus>();

// Routing rules caching
const routingRulesCache: ContactRouting[] = [];
```

### Real-time Updates
```typescript
// WebSocket updates for real-time status changes
const contactSocket = io('/contact');

contactSocket.on('enquiry:assigned', (data) => {
  // Update UI in real-time
  updateEnquiryStatus(data.enquiryId, data.assignment);
});

contactSocket.on('response:created', (data) => {
  // Add response to enquiry thread
  addResponseToThread(data.enquiryId, data.response);
});
```

---

## Testing Strategy

### Unit Tests
- Form validation logic
- Routing algorithm
- Assignment rules
- Analytics calculations
- Consent handling

### Integration Tests
- Contact form submission flow
- Enquiry resolution workflow
- Email/SMS notification delivery
- Healthcare data integration
- Multi-tenant access control

### Performance Tests
- Concurrent form submissions
- Large volume enquiry processing
- Database query performance
- Real-time notification latency

### Compliance Tests
- PDPA consent validation
- Data retention enforcement
- Audit trail completeness
- PHI access controls

---

## Monitoring & Alerting

### Key Metrics
- Contact form submission rate
- Enquiry resolution time
- SLA compliance rate
- Customer satisfaction scores
- Agent workload distribution
- System error rates

### Alerts
```typescript
// SLA breach alerts
if (enquiry.resolutionTime > enquiry.slaDeadline) {
  alertManager.sendAlert({
    type: 'sla_breach',
    severity: 'high',
    enquiryId: enquiry.id,
    assignee: enquiry.assignedAgentId,
    manager: enquiry.supervisorId
  });
}

// High volume alerts
if (dailyContactVolume > threshold) {
  alertManager.sendAlert({
    type: 'high_volume',
    volume: dailyContactVolume,
    category: 'general',
    action: 'scale_up_agents'
  });
}
```

---

## Future Enhancements

### AI/ML Integration
- Intelligent sentiment analysis
- Automatic categorization
- Predictive routing
- Response time optimization
- Customer satisfaction prediction

### Advanced Features
- Multi-language support expansion
- Video call integration
- Chatbot integration
- Advanced analytics dashboard
- Mobile app optimization

### Healthcare Integration
- Electronic Health Record (EHR) integration
- Appointment scheduling integration
- Medical history integration
- Insurance verification
- Prescription integration

---

## Conclusion

The Contact & Enquiry Management System provides a robust, scalable, and compliant foundation for handling all patient and user communications within the healthcare platform. With 11 core models, comprehensive workflows, and tight integration with existing healthcare data, this system ensures efficient, personalized, and secure contact management that meets both operational and regulatory requirements.

The system is designed for:
- **Scalability**: Handle high volumes of contact forms and enquiries
- **Compliance**: Meet PDPA, GDPR, and healthcare regulations
- **Efficiency**: Automate routing, assignment, and response processes
- **Analytics**: Provide comprehensive insights into contact performance
- **Integration**: Seamlessly work with existing clinic, doctor, and service data
- **Security**: Protect sensitive healthcare information with appropriate access controls

This architecture ensures the platform can effectively manage patient communications while maintaining the highest standards of privacy, security, and service quality.
