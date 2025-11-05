# API Reference Documentation

## Overview

This document provides comprehensive API documentation for the My Family Clinic healthcare management system. The API is built using tRPC (TypeScript RPC) and provides type-safe endpoints for managing clinics, doctors, appointments, services, and patient data.

## Base URL

```
Production: https://api.myfamilyclinic.sg
Staging: https://staging-api.myfamilyclinic.sg
Development: http://localhost:3000/api/trpc
```

## Authentication

The API uses NextAuth.js for authentication with support for multiple providers:

### Supported Auth Providers
- **Email/Password**: Traditional email and password authentication
- **Google OAuth**: Google sign-in integration
- **Apple Sign-In**: Apple ID authentication
- **Healthier SG MyInfo**: Singapore government MyInfo integration

### Authentication Headers

```typescript
// Protected endpoints require authentication
headers: {
  'Authorization': 'Bearer <access_token>',
  'Content-Type': 'application/json'
}

// Optional user context for personalized responses
headers: {
  'x-user-id': '<user_id>'
}
```

### Error Response Format

```typescript
{
  "error": {
    "code": "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "INTERNAL_ERROR",
    "message": "Human readable error message",
    "details": {
      "field": "field_name",
      "issue": "validation_issue"
    }
  }
}
```

---

## Router: Auth

### Purpose: Authentication and user management

### Endpoints

#### `auth.me`

**Type:** Protected Procedure

**Description:** Get current authenticated user information

**Request:**
```typescript
// No input required
```

**Response:**
```typescript
{
  id: string;
  email: string;
  name?: string;
  role: "PATIENT" | "DOCTOR" | "CLINIC_ADMIN" | "SYSTEM_ADMIN";
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    nric?: string;
    dateOfBirth?: string;
  };
  preferences?: {
    language: string;
    notifications: {
      email: boolean;
      sms: boolean;
    };
  };
}
```

#### `auth.updateProfile`

**Type:** Protected Procedure

**Description:** Update user profile information

**Request:**
```typescript
{
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  allergies?: string[];
  medicalConditions?: string[];
}
```

**Response:**
```typescript
{
  success: boolean;
  user: {
    id: string;
    profile: {
      // Updated profile data
    };
  };
}
```

---

## Router: Doctor

### Purpose: Doctor management and search functionality

### Endpoints

#### `doctor.getAll`

**Type:** Public Procedure

**Description:** Get paginated list of doctors with filtering options

**Request:**
```typescript
{
  page?: number;           // Default: 1
  limit?: number;          // Default: 10, Max: 50
  search?: string;         // Search by name or specialty
  specialties?: string[];  // Filter by specialties
  languages?: string[];    // Filter by languages
  clinicId?: string;       // Filter by clinic
  isActive?: boolean;      // Filter by active status
  isVerified?: boolean;    // Filter by verification status
  orderBy?: "name" | "specialty" | "experience" | "rating" | "createdAt";
  orderDirection?: "asc" | "desc";
}
```

**Response:**
```typescript
{
  data: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    specialties: string[];
    languages: string[];
    qualifications: string[];
    experience: number;
    isActive: boolean;
    isVerified: boolean;
    profile?: {
      bio?: string;
      photo?: string;
      description?: string;
    };
    clinics: Array<{
      id: string;
      name: string;
      address: string;
    }>;
    ratings?: Array<{
      rating: number;
      comment: string;
      createdAt: string;
    }>;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

#### `doctor.getById`

**Type:** Public Procedure

**Description:** Get detailed doctor information

**Request:**
```typescript
{
  id: string;
}
```

**Response:**
```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  medicalLicense: string;
  specialties: string[];
  languages: string[];
  qualifications: string[];
  experience: number;
  profile?: {
    bio?: string;
    photo?: string;
    description?: string;
  };
  clinics: Array<{
    id: string;
    name: string;
    address: string;
    role: "ATTENDING" | "CONSULTANT" | "VISITING";
  }>;
  availability: Array<{
    date: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
  ratings: Array<{
    rating: number;
    comment: string;
    patientName: string;
    createdAt: string;
  }>;
}
```

#### `doctor.search`

**Type:** Public Procedure

**Description:** Search doctors by specialty, location, or name

**Request:**
```typescript
{
  query: string;
  specialties?: string[];
  languages?: string[];
  location?: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  };
  availability?: {
    date: string;
    startTime?: string;
    endTime?: string;
  };
  limit?: number;
}
```

**Response:**
```typescript
{
  results: Array<{
    id: string;
    firstName: string;
    lastName: string;
    specialties: string[];
    languages: string[];
    experience: number;
    profile?: {
      photo?: string;
      bio?: string;
    };
    clinic: {
      id: string;
      name: string;
      address: string;
      distance: number;
    };
    nextAvailable: {
      date: string;
      startTime: string;
    };
    rating: number;
    reviewCount: number;
  }>;
  total: number;
  query: string;
}
```

---

## Router: Clinic

### Purpose: Clinic management and search functionality

### Endpoints

#### `clinic.getAll`

**Type:** Public Procedure

**Description:** Get paginated list of clinics with filtering

**Request:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isHealthierSgPartner?: boolean;
  languages?: string[];
  services?: string[];
  location?: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  };
  orderBy?: "name" | "distance" | "rating" | "createdAt";
  orderDirection?: "asc" | "desc";
}
```

**Response:**
```typescript
{
  data: Array<{
    id: string;
    name: string;
    description: string;
    address: string;
    postalCode: string;
    phone: string;
    email: string;
    website?: string;
    operatingHours: {
      [day: string]: {
        open: string;
        close: string;
        isOpen: boolean;
      };
    };
    languages: string[];
    facilities: string[];
    latitude: number;
    longitude: number;
    isActive: boolean;
    isHealthierSgPartner: boolean;
    rating: number;
    reviewCount: number;
    distance?: number; // If location filter used
  }>;
  pagination: {
    // Pagination info
  };
}
```

#### `clinic.getById`

**Type:** Public Procedure

**Description:** Get detailed clinic information

**Request:**
```typescript
{
  id: string;
}
```

**Response:**
```typescript
{
  id: string;
  name: string;
  description: string;
  address: string;
  postalCode: string;
  phone: string;
  email: string;
  website?: string;
  operatingHours: {
    // Detailed operating hours
  };
  facilities: string[];
  languages: string[];
  latitude: number;
  longitude: number;
  isActive: boolean;
  isHealthierSgPartner: boolean;
  accreditationStatus: string;
  establishedYear?: number;
  licenseNumber?: string;
  
  doctors: Array<{
    id: string;
    firstName: string;
    lastName: string;
    specialties: string[];
    profile?: {
      photo?: string;
      bio?: string;
    };
  }>;
  
  services: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    duration: number;
    isHealthierSgCovered: boolean;
  }>;
  
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    patientName: string;
    createdAt: string;
  }>;
}
```

---

## Router: Appointment

### Purpose: Appointment booking and management

### Endpoints

#### `appointment.getAll`

**Type:** Protected Procedure

**Description:** Get user's appointments with filtering

**Request:**
```typescript
{
  page?: number;
  limit?: number;
  status?: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  clinicId?: string;
  doctorId?: string;
  startDate?: string;
  endDate?: string;
  isUrgent?: boolean;
  orderBy?: "appointmentDate" | "createdAt" | "status";
  orderDirection?: "asc" | "desc";
}
```

**Response:**
```typescript
{
  data: Array<{
    id: string;
    appointmentDate: string;
    status: string;
    notes?: string;
    symptoms?: string;
    isUrgent: boolean;
    clinic: {
      id: string;
      name: string;
      address: string;
      phone: string;
    };
    doctor: {
      id: string;
      firstName: string;
      lastName: string;
      profile?: {
        photo?: string;
        bio?: string;
      };
    };
    service: {
      id: string;
      name: string;
      description: string;
      price: number;
      duration: number;
    };
  }>;
  pagination: {
    // Pagination info
  };
}
```

#### `appointment.create`

**Type:** Protected Procedure

**Description:** Create a new appointment

**Request:**
```typescript
{
  clinicId: string;
  doctorId: string;
  serviceId: string;
  appointmentDate: string;
  startTime: string;
  symptoms?: string;
  notes?: string;
  isUrgent?: boolean;
  preferredDoctor?: boolean;
}
```

**Response:**
```typescript
{
  id: string;
  appointmentDate: string;
  startTime: string;
  status: "PENDING";
  clinic: {
    id: string;
    name: string;
    address: string;
  };
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
  };
  service: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
  confirmationNumber: string;
  nextSteps: string[];
}
```

#### `appointment.updateStatus`

**Type:** Protected Procedure

**Description:** Update appointment status

**Request:**
```typescript
{
  id: string;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  cancellationReason?: string;
  notes?: string;
}
```

**Response:**
```typescript
{
  id: string;
  status: string;
  updatedAt: string;
  confirmationNumber: string;
}
```

---

## Router: Service

### Purpose: Medical service management and search

### Endpoints

#### `service.getAll`

**Type:** Public Procedure

**Description:** Get paginated list of services

**Request:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isHealthierSgCovered?: boolean;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  orderBy?: "name" | "price" | "category" | "duration";
  orderDirection?: "asc" | "desc";
}
```

**Response:**
```typescript
{
  data: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    subcategory?: string;
    price: number;
    priceRangeMin?: number;
    priceRangeMax?: number;
    duration: number;
    complexityLevel: "BASIC" | "INTERMEDIATE" | "ADVANCED" | "SPECIALIZED";
    urgencyLevel: "ROUTINE" | "URGENT" | "EMERGENCY";
    isHealthierSgCovered: boolean;
    isSubsidized: boolean;
    preparationRequired: string[];
    postCareInstructions: string[];
    tags: string[];
  }>;
  pagination: {
    // Pagination info
  };
}
```

#### `service.search`

**Type:** Public Procedure

**Description:** Search services with availability

**Request:**
```typescript
{
  query: string;
  category?: string;
  isHealthierSgCovered?: boolean;
  location?: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  };
  date?: string;
  maxPrice?: number;
  limit?: number;
}
```

**Response:**
```typescript
{
  results: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    duration: number;
    isHealthierSgCovered: boolean;
    
    availableClinics: Array<{
      id: string;
      name: string;
      address: string;
      distance: number;
      rating: number;
      nextAvailable: {
        date: string;
        startTime: string;
        doctor: {
          firstName: string;
          lastName: string;
        };
      };
    }>;
  }>;
  total: number;
  categories: string[];
}
```

---

## Router: Eligibility

### Purpose: Healthier SG eligibility assessment

### Endpoints

#### `eligibility.assess`

**Type:** Protected Procedure

**Description:** Assess user's Healthier SG eligibility

**Request:**
```typescript
{
  age: number;
  residencyStatus: string;
  medicalConditions?: string[];
  chronicConditions?: string[];
  smokingStatus?: string;
  exerciseFrequency?: string;
  familyHistory?: string[];
  currentMedications?: string[];
}
```

**Response:**
```typescript
{
  eligibilityStatus: "ELIGIBLE" | "NOT_ELIGIBLE" | "CONDITIONAL" | "PENDING";
  score: number;
  maxScore: number;
  percentage: number;
  
  criteria: Array<{
    name: string;
    status: "MET" | "NOT_MET" | "PARTIAL";
    points: number;
    maxPoints: number;
    details?: string;
  }>;
  
  recommendations: string[];
  nextSteps: string[];
  
  appealAvailable: boolean;
  appealDeadline?: string;
}
```

#### `eligibility.getAssessment`

**Type:** Protected Procedure

**Description:** Get user's eligibility assessment history

**Request:**
```typescript
{
  userId?: string;
}
```

**Response:**
```typescript
{
  assessments: Array<{
    id: string;
    assessmentDate: string;
    eligibilityStatus: string;
    score: number;
    criteria: Array<{
      name: string;
      status: string;
      points: number;
    }>;
  }>;
  currentStatus: {
    status: string;
    lastAssessment: string;
    expiresAt?: string;
  };
}
```

---

## Router: Analytics

### Purpose: Analytics and reporting data

### Endpoints

#### `analytics.dashboard`

**Type:** Protected Procedure

**Description:** Get dashboard analytics data

**Request:**
```typescript
{
  dateRange: {
    startDate: string;
    endDate: string;
  };
  metrics?: string[];
  granularity?: "hour" | "day" | "week" | "month";
}
```

**Response:**
```typescript
{
  overview: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    noShowRate: number;
    averageRating: number;
    totalPatients: number;
    newPatients: number;
  };
  
  trends: Array<{
    date: string;
    appointments: number;
    revenue: number;
    rating: number;
    newPatients: number;
  }>;
  
  topServices: Array<{
    serviceId: string;
    name: string;
    bookings: number;
    revenue: number;
  }>;
  
  doctorPerformance: Array<{
    doctorId: string;
    name: string;
    appointments: number;
    averageRating: number;
    patientSatisfaction: number;
  }>;
  
  clinicMetrics: {
    utilizationRate: number;
    averageWaitTime: number;
    patientRetention: number;
    revenueGrowth: number;
  };
}
```

#### `analytics.healthMetrics`

**Type:** Protected Procedure

**Description:** Get health program analytics

**Request:**
```typescript
{
  programType?: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  groupBy?: "clinic" | "doctor" | "service" | "month";
}
```

**Response:**
```typescript
{
  enrollmentMetrics: {
    totalEnrolled: number;
    activeParticipants: number;
    completionRate: number;
    dropoutRate: number;
  };
  
  healthOutcomes: Array<{
    metric: string;
    baseline: number;
    current: number;
    improvement: number;
    unit: string;
  }>;
  
  participationRates: Array<{
    category: string;
    enrolled: number;
    active: number;
    rate: number;
  }>;
  
  costAnalysis: {
    totalCost: number;
    costPerParticipant: number;
    costSavings: number;
    roi: number;
  };
}
```

---

## Router: Contact System

### Purpose: Contact form management and enquiry handling

### Endpoints

#### `contact.createEnquiry`

**Type:** Public Procedure

**Description:** Submit a contact form enquiry

**Request:**
```typescript
{
  categoryId: string;
  subject: string;
  message: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  preferredContactMethod?: "EMAIL" | "PHONE" | "SMS";
  urgencyLevel?: "ROUTINE" | "URGENT" | "EMERGENCY";
  relatedClinicId?: string;
  relatedDoctorId?: string;
  relatedServiceId?: string;
  privacyConsent: boolean;
  gdprConsent?: boolean;
  formData?: Record<string, any>;
}
```

**Response:**
```typescript
{
  referenceNumber: string;
  status: "SUBMITTED";
  estimatedResponseTime: string;
  nextSteps: string[];
  autoResponseSent: boolean;
  escalationRequired: boolean;
  assignedDepartment: string;
}
```

#### `contact.getEnquiryStatus`

**Type:** Public Procedure

**Description:** Check enquiry status by reference number

**Request:**
```typescript
{
  referenceNumber: string;
  email: string;
}
```

**Response:**
```typescript
{
  referenceNumber: string;
  status: string;
  priority: string;
  assignedAgent?: string;
  estimatedResolution: string;
  lastUpdate: string;
  history: Array<{
    timestamp: string;
    action: string;
    description: string;
    actor: string;
  }>;
}
```

#### `contact.getEnquiryHistory`

**Type:** Protected Procedure

**Description:** Get user's enquiry history

**Request:**
```typescript
{
  userId?: string;
  page?: number;
  limit?: number;
  status?: string;
  categoryId?: string;
}
```

**Response:**
```typescript
{
  enquiries: Array<{
    id: string;
    referenceNumber: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
    lastUpdate: string;
    assignedAgent?: string;
    category: {
      name: string;
      displayName: string;
    };
  }>;
  pagination: {
    // Pagination info
  };
  summary: {
    total: number;
    open: number;
    pending: number;
    resolved: number;
    averageResponseTime: number;
  };
}
```

---

## Data Models

### Common Response Types

#### PaginatedResponse

```typescript
{
  data: Array<T>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

#### Error Response

```typescript
{
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}
```

### Core Entities

#### User
```typescript
{
  id: string;
  email: string;
  name?: string;
  role: "PATIENT" | "DOCTOR" | "CLINIC_ADMIN" | "SYSTEM_ADMIN";
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
  preferences?: UserPreferences;
}
```

#### Doctor
```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  medicalLicense: string;
  specialties: string[];
  languages: string[];
  qualifications: string[];
  experience: number;
  isActive: boolean;
  isVerified: boolean;
  rating?: number;
  reviewCount: number;
  profile?: DoctorProfile;
  clinics: DoctorClinic[];
}
```

#### Clinic
```typescript
{
  id: string;
  name: string;
  description?: string;
  address: string;
  postalCode: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude: number;
  longitude: number;
  operatingHours: Record<string, OperatingHours>;
  facilities: string[];
  languages: string[];
  isActive: boolean;
  isHealthierSgPartner: boolean;
  rating?: number;
  reviewCount: number;
}
```

#### Appointment
```typescript
{
  id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  symptoms?: string;
  notes?: string;
  isUrgent: boolean;
  confirmationNumber: string;
  clinicId: string;
  doctorId: string;
  serviceId: string;
  patientId: string;
}
```

---

## Rate Limiting

### Limits by Endpoint Type

| Endpoint Type | Limit | Window |
|---------------|--------|--------|
| Public Read | 1000 requests | 1 hour |
| Authenticated | 500 requests | 1 hour |
| Write Operations | 100 requests | 1 hour |
| File Upload | 10 requests | 1 hour |
| Search | 50 requests | 1 hour |

### Rate Limit Headers

```typescript
// Rate limit headers included in all responses
{
  'X-RateLimit-Limit': '1000',
  'X-RateLimit-Remaining': '999',
  'X-RateLimit-Reset': '1634567890',
  'X-RateLimit-Window': '3600'
}
```

---

## WebSocket Subscriptions

### Real-time Updates

The API supports WebSocket subscriptions for real-time updates:

#### Appointment Updates
```typescript
// Subscribe to appointment status changes
subscription: {
  procedure: "appointment.onStatusChange";
  input: {
    appointmentId: string;
  };
}
```

#### Availability Updates
```typescript
// Subscribe to doctor availability changes
subscription: {
  procedure: "doctor.onAvailabilityChange";
  input: {
    doctorId: string;
    clinicId?: string;
  };
}
```

#### Enquiry Updates
```typescript
// Subscribe to contact form status updates
subscription: {
  procedure: "contact.onEnquiryUpdate";
  input: {
    enquiryId: string;
  };
}
```

---

## Testing

### API Testing Examples

#### cURL Examples

```bash
# Get doctors list
curl -X GET "http://localhost:3000/api/trpc/doctor.getAll" \
  -H "Content-Type: application/json" \
  -d '{"input": {"page": 1, "limit": 10}}'

# Create appointment (requires auth)
curl -X POST "http://localhost:3000/api/trpc/appointment.create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "input": {
      "clinicId": "clinic-uuid",
      "doctorId": "doctor-uuid",
      "serviceId": "service-uuid",
      "appointmentDate": "2025-11-10",
      "startTime": "14:00"
    }
  }'

# Submit contact form
curl -X POST "http://localhost:3000/api/trpc/contact.createEnquiry" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "categoryId": "general",
      "subject": "Appointment Inquiry",
      "message": "I would like to book an appointment",
      "contactName": "John Doe",
      "contactEmail": "john@example.com",
      "privacyConsent": true
    }
  }'
```

#### JavaScript/TypeScript Examples

```typescript
// Using tRPC client
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@/server/api/root';

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
      headers() {
        return {
          authorization: `Bearer ${token}`,
        };
      },
    }),
  ],
});

// Get doctors
const doctors = await client.doctor.getAll.query({
  page: 1,
  limit: 10,
  search: 'cardiology'
});

// Create appointment
const appointment = await client.appointment.create.mutate({
  clinicId: 'clinic-uuid',
  doctorId: 'doctor-uuid',
  serviceId: 'service-uuid',
  appointmentDate: '2025-11-10',
  startTime: '14:00'
});
```

---

## Best Practices

### API Usage Guidelines

1. **Pagination**: Always use pagination for list endpoints
2. **Filtering**: Use specific filters to reduce payload size
3. **Caching**: Implement client-side caching for frequently accessed data
4. **Error Handling**: Always check for error responses
5. **Rate Limiting**: Implement exponential backoff for rate-limited requests

### Data Validation

1. **Client-side**: Validate all inputs before sending
2. **Server-side**: All endpoints validate inputs using Zod schemas
3. **Type Safety**: Use generated types from tRPC for full type safety

### Security Considerations

1. **Authentication**: Required for all protected endpoints
2. **Authorization**: Role-based access control implemented
3. **Data Encryption**: Sensitive data encrypted at rest
4. **Audit Logging**: All actions logged for compliance

### Performance Optimization

1. **Database Indexing**: All query endpoints use optimized indexes
2. **Response Filtering**: Use `select` to minimize data transfer
3. **Caching**: Redis caching for frequently accessed data
4. **Connection Pooling**: Database connection pooling enabled

---

## Support and Troubleshooting

### Common Issues

#### Authentication Errors
- **401 Unauthorized**: Invalid or expired token
- **403 Forbidden**: Insufficient permissions
- **Solution**: Refresh token or check user permissions

#### Validation Errors
- **400 Bad Request**: Invalid input data
- **Solution**: Check request payload against schema

#### Rate Limiting
- **429 Too Many Requests**: Rate limit exceeded
- **Solution**: Implement exponential backoff

### Support Channels

- **API Support**: api-support@myfamilyclinic.sg
- **Documentation**: https://docs.myfamilyclinic.sg
- **Status Page**: https://status.myfamilyclinic.sg
- **Community**: https://community.myfamilyclinic.sg

---

*This API documentation is current as of November 2025. For the latest updates, please refer to our API changelog.*