# Service-Clinic Integration System Documentation

## Overview
The Service-Clinic Integration System provides comprehensive cross-referencing and integration capabilities between healthcare services and clinics, enabling seamless patient booking experiences with real-time updates.

## 🎯 Core Features

### 1. **Find Clinics for Service** 
- Location-based filtering with radius search
- Insurance acceptance filtering (Medisave, Medishield, CHAS, Healthier SG)
- Rating and price range filtering
- Real-time availability status

### 2. **Service-Clinic Availability Matrix**
- Real-time slot availability across multiple clinics
- 30-second auto-refresh for live updates
- Visual availability indicators
- Conflict detection and resolution

### 3. **Service-Specific Clinic Filters**
- Doctor availability filtering
- Equipment availability
- Insurance coverage details
- CHAS tier compatibility
- Urgency level matching

### 4. **Service Reviews and Ratings**
- Verified review badges
- Multi-criteria ratings (quality, value, convenience)
- Clinic response system
- Review helpful voting

### 5. **Integrated Booking Workflows**
- Seamless appointment scheduling
- Real-time slot checking
- Optimistic updates for UI responsiveness
- Conflict prevention

### 6. **Service Packages and Bundles**
- Package comparison tools
- Savings calculator
- Validity period tracking
- Usage limits and restrictions

### 7. **Clinic Specializations and Expertise**
- Expertise level indicators (Basic → Pioneer)
- Certification display
- Performance metrics
- Success rate tracking

### 8. **Referral Workflows**
- Multi-step referral process
- Document upload support
- Status tracking
- Patient consent management

## 🏗️ Technical Architecture

### Database Models Added

#### `ServicePackage` & `ServicePackageItem`
```typescript
// Bundle offerings for related services
model ServicePackage {
  id: String
  name: String
  packagePrice: Float
  discountPercent: Float?
  validityPeriod: Int?
  items: ServicePackageItem[]
}
```

#### `ServiceReferral` & `ReferralDocument`
```typescript
// Cross-clinic referral system
model ServiceReferral {
  id: String
  referringClinicId: String
  referredClinicId: String
  referralType: ReferralType
  status: ReferralStatus
  clinicalNotes: String?
}
```

#### `ServiceExpertise` & `ExpertiseCertification`
```typescript
// Clinic specialization tracking
model ServiceExpertise {
  id: String
  clinicId: String
  serviceId: String
  expertiseLevel: ExpertiseLevel
  successRate: Float?
  certifications: ExpertiseCertification[]
}
```

### tRPC Integration Router
**Location**: `/src/server/api/routers/service-clinic-integration.ts`

**Key Procedures**:
- `findClinicsForService`: Service-clinic matching with filters
- `getAvailabilityMatrix`: Real-time availability across clinics
- `getServicePackages`: Package offerings with pricing
- `createReferral`: Multi-step referral creation
- `getClinicExpertise`: Specialization and certification data

### React Query Hooks
**Location**: `/src/hooks/use-service-clinic-integration.ts`

**Key Features**:
- Real-time data fetching with automatic refetching
- Optimistic updates for booking workflows
- Infinite scrolling for large datasets
- Error handling and retry logic

```typescript
// Usage example
const { data: availability } = useServiceAvailabilityMatrix(
  serviceId,
  { 
    location: { lat: 1.3521, lng: 103.8198, radius: 10 },
    rating: 4.0,
    availability: 'AVAILABLE'
  }
)
```

## 📱 Mobile Optimization

### Responsive Design
- Single-column layout for mobile
- Touch-friendly button sizes (44px minimum)
- Swipe gestures for tab navigation
- Optimized loading states

### Performance Features
- Lazy loading of clinic details
- Image optimization and compression
- Efficient pagination
- Offline capability preparation

### Component: `MobileServiceClinicIntegration`
```typescript
// Mobile-first integration component
<MobileServiceClinicIntegration
  serviceId="service-123"
  serviceName="General Consultation"
  onBooking={(data) => handleBooking(data)}
/>
```

## 🔄 Real-Time Updates

### Polling Strategy
- Availability matrix: 30-second intervals
- Clinic-specific data: 15-second intervals
- Package data: 2-minute intervals
- Expertise data: 5-minute intervals

### Cache Management
- Stale-while-revalidate pattern
- Optimistic updates with rollback
- Background refetching
- Cache invalidation on user actions

## 🔐 Security & Privacy

### Data Protection
- Patient consent for referrals
- Encrypted document storage
- Audit logging for all actions
- Role-based access control

### Verification System
- Verified booking badges
- Identity verification for reviews
- Clinic certification validation
- Document authenticity checks

## 🚀 Integration Points

### Phase 3 Appointment System
- Seamless appointment creation
- Conflict resolution
- Automated confirmations
- Cancellation workflows

### Phase 5 Google Maps
- Distance calculations
- Location-based filtering
- Visual clinic mapping
- Direction integration

### Payment Systems
- Medisave/Medishield integration
- CHAS subsidy handling
- Package payment processing
- Insurance verification

## 📊 Analytics & Metrics

### Key Performance Indicators
- Booking conversion rates
- Patient satisfaction scores
- Clinic response times
- Service utilization rates

### Business Intelligence
- Popular service combinations
- Peak booking times
- Geographic service gaps
- Referral success rates

## 🛠️ Implementation Guide

### 1. Basic Integration
```typescript
// Import integration system
import { ServiceClinicIntegration } from '@/components/service'

// Use in component
const IntegrationComponent = () => (
  <ServiceClinicIntegration.System
    serviceId="consultation-123"
    onBooking={handleBooking}
  />
)
```

### 2. Mobile-First Approach
```typescript
import { MobileServiceClinicIntegration } from '@/components/service'

const MobileView = () => (
  <MobileServiceClinicIntegration
    serviceId="consultation-123"
    serviceName="General Consultation"
    onBooking={handleBooking}
  />
)
```

### 3. Custom Hooks Usage
```typescript
import {
  useServiceAvailabilityMatrix,
  useClinicsForService,
  useIntegratedBooking
} from '@/hooks/use-service-clinic-integration'

const CustomComponent = () => {
  const { data: availability } = useServiceAvailabilityMatrix(serviceId)
  const bookAppointment = useIntegratedBooking()
  
  const handleBook = (clinicId: string, slot: string) => {
    bookAppointment.mutate({
      serviceId,
      clinicId,
      appointmentTime: slot
    })
  }
}
```

## 📈 Future Enhancements

### Planned Features
- AI-powered clinic recommendations
- Predictive availability modeling
- Automated referral matching
- Patient journey optimization
- Integration with wearable devices
- Telehealth appointment support

### Scalability Considerations
- Microservice architecture migration
- Event-driven architecture
- Message queue integration
- CDN for global performance
- Advanced caching strategies

## 🎨 UI/UX Guidelines

### Design Principles
- Mobile-first responsive design
- Accessibility compliance (WCAG 2.1)
- Consistent with existing design system
- Performance-optimized animations
- Clear visual hierarchy

### Component Library
- Built on shadcn/ui components
- Custom integration components
- Reusable hook patterns
- Consistent styling approach

## 🔍 Troubleshooting

### Common Issues
1. **Real-time updates not working**: Check React Query configuration
2. **Booking conflicts**: Verify appointment system integration
3. **Mobile layout issues**: Test responsive breakpoints
4. **Performance problems**: Review query optimization and caching

### Debug Mode
Enable debug logging in development:
```typescript
const DEBUG_MODE = process.env.NODE_ENV === 'development'
```

## 📝 API Reference

### tRPC Procedures
- `serviceClinicIntegration.findClinicsForService`
- `serviceClinicIntegration.getAvailabilityMatrix`
- `serviceClinicIntegration.createIntegratedBooking`
- `serviceClinicIntegration.createReferral`
- `serviceClinicIntegration.getServicePackages`

### React Hooks
- `useServiceAvailabilityMatrix`
- `useClinicsForService`
- `useServicePackages`
- `useCreateReferral`
- `useClinicExpertise`
- `useIntegratedBooking`

## 🤝 Contributing

### Development Setup
1. Run Prisma migrations: `npx prisma migrate dev`
2. Generate types: `npx prisma generate`
3. Start development server: `npm run dev`

### Code Standards
- TypeScript strict mode
- ESLint + Prettier configuration
- Component testing with Vitest
- Integration testing patterns

## 📞 Support

For technical support or feature requests, please refer to:
- API documentation in `/docs/api/`
- Component stories in Storybook
- Integration examples in `/examples/`
- Test files in `/tests/integration/`