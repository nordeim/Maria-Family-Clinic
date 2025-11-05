# Service Availability Tracking System - Integration Guide

## Overview

This guide provides comprehensive instructions for integrating and testing the Service Availability Tracking System in the Maria Family Clinic application.

## System Architecture

### Core Components

1. **Real-time Availability Tracker** (`use-availability-tracker.ts`)
   - WebSocket connections for live updates
   - Polling fallback for unsupported browsers
   - Optimistic UI updates
   - Conflict detection and resolution

2. **Wait Time Estimator** (`use-wait-time-estimator.ts`)
   - Historical data analysis
   - Real-time queue position calculation
   - Peak time detection and recommendations

3. **Conflict Resolution System** (`conflict-resolution.ts`)
   - Double booking detection
   - Automatic alternative slot suggestions
   - Priority-based resolution strategies

4. **Offline Caching** (`use-offline-availability-cache.ts`)
   - IndexedDB for persistent storage
   - Service Worker for background sync
   - Automatic cache invalidation

5. **Mobile Interface** (`mobile-availability-interface.tsx`)
   - Touch-friendly controls
   - Swipe gestures
   - Pull-to-refresh functionality

## Integration Steps

### 1. Environment Setup

```bash
# Install required dependencies
npm install @tanstack/react-query date-fns

# Ensure Service Worker is registered
# The service worker is already available at /public/sw-availability.js
```

### 2. Database Integration

The system integrates with existing Prisma schema:

```typescript
// Key models used:
// - Appointment: For booking conflicts and capacity calculation
// - Service: For service details and duration
// - Clinic: For operating hours and capacity
// - Doctor: For scheduling and availability
```

### 3. API Integration

The availability API is available at `/api/availability` with the following endpoints:

- **GET** `/api/availability?serviceId=X&clinicId=Y&includeCapacity=true`
  - Returns availability data with time slots, capacity, and wait times
  
- **POST** `/api/availability`
  - Books appointments with conflict resolution
  - Returns conflict information and alternatives if booking fails

### 4. WebSocket Integration

Real-time updates are handled through WebSocket connections:

```typescript
// Connect to real-time updates
const { isConnected, subscribeToUpdates } = useRealTimeAvailability();

// Subscribe to specific clinic/service updates
subscribeToUpdates({ 
  serviceId: 'service-1', 
  clinicId: 'clinic-1' 
});
```

### 5. Component Integration

Add the main availability components to your pages:

```tsx
// In your service detail page or availability section
import RealTimeAvailabilityDisplay from '@/components/service/availability/real-time-availability-display';
import TimeSlotBookingModal from '@/components/service/availability/time-slot-booking-modal';

export default function ServicePage({ serviceId }: { serviceId: string }) {
  const [showBookingModal, setShowBookingModal] = useState(false);

  return (
    <div>
      <RealTimeAvailabilityDisplay
        serviceId={serviceId}
        clinicId={selectedClinic}
        onBookAppointment={() => setShowBookingModal(true)}
      />
      
      {showBookingModal && (
        <TimeSlotBookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          serviceId={serviceId}
          onBooking={(slotId, details) => {
            // Handle booking
            setShowBookingModal(false);
          }}
        />
      )}
    </div>
  );
}
```

## Testing

### 1. Demo Pages

Navigate to `/availability-demo` to see all components in action:

- **Real-time Updates**: Live availability tracking
- **Booking Flow**: Complete booking process
- **Conflict Resolution**: Automatic conflict handling
- **Mobile Interface**: Touch-optimized experience
- **Offline Mode**: Cached data functionality
- **Notifications**: Push notification system

### 2. Test Runner

Access `/availability-test-runner` for automated testing:

```bash
# Run all tests
curl -X POST http://localhost:3000/availability-test-runner

# Test specific components
curl -X POST http://localhost:3000/availability-test-runner?category=booking
```

### 3. Manual Testing Scenarios

#### Scenario 1: Successful Booking
1. Open availability demo
2. Select a service and clinic
3. Choose an available time slot
4. Complete booking process
5. Verify confirmation and capacity update

#### Scenario 2: Conflict Resolution
1. Attempt to book the same slot from multiple browsers
2. Verify conflict detection
3. Check alternative slot suggestions
4. Confirm resolution options work

#### Scenario 3: Offline Functionality
1. Open availability page
2. Simulate going offline (disable network)
3. Verify cached data displays
4. Test offline booking queue
5. Go back online and verify sync

#### Scenario 4: Real-time Updates
1. Open availability demo in multiple tabs
2. Book an appointment in one tab
3. Verify real-time updates in other tabs
4. Check WebSocket connection status

## Configuration Options

### Service Worker Configuration

```typescript
// Customize service worker behavior
const serviceWorkerConfig = {
  enableOffline: true,
  enablePushNotifications: true,
  cacheTimeout: 300000, // 5 minutes
  maxCacheEntries: 100,
};
```

### Real-time Update Configuration

```typescript
// Configure WebSocket behavior
const wsConfig = {
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000,
};
```

### Cache Configuration

```typescript
// Customize caching behavior
const cacheConfig = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  maxEntries: 100,
  backgroundSync: true,
  compressionEnabled: true,
};
```

## Performance Optimization

### 1. Lazy Loading
```typescript
// Load availability components on demand
const AvailabilityDisplay = lazy(() => import('./availability/real-time-availability-display'));
```

### 2. Memoization
```typescript
// Memoize expensive calculations
const MemoizedCapacityCalculator = useMemo(() => {
  return calculateCapacity(clinicData, serviceData);
}, [clinicData, serviceData]);
```

### 3. Pagination
```tsx
// Paginate availability results for large datasets
const paginatedAvailability = useMemo(() => {
  return availabilityData.slice(0, itemsPerPage);
}, [availabilityData, currentPage]);
```

## Troubleshooting

### Common Issues

1. **WebSocket Connection Fails**
   - Check network connectivity
   - Verify WebSocket server is running
   - Check firewall/proxy settings

2. **Service Worker Not Caching**
   - Verify service worker is registered
   - Check browser console for errors
   - Ensure HTTPS in production

3. **High Memory Usage**
   - Monitor cache size and limits
   - Implement proper cleanup
   - Check for memory leaks in components

4. **Slow Updates**
   - Optimize update frequency
   - Reduce payload size
   - Implement debouncing

### Debug Mode

Enable debug logging:

```typescript
// In development
localStorage.setItem('availability-debug', 'true');

// Check logs in browser console
```

### Health Check Endpoints

```bash
# Check system health
curl http://localhost:3000/api/health/availability

# Test WebSocket connection
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost:3000/api/availability/ws
```

## Deployment

### Production Checklist

- [ ] Service Worker properly configured for production
- [ ] WebSocket server deployed and accessible
- [ ] Push notification service configured
- [ ] Cache limits configured appropriately
- [ ] Error monitoring implemented
- [ ] Performance monitoring enabled
- [ ] Load testing completed
- [ ] Security audit passed

### Environment Variables

```bash
# Required for production
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-domain.com/api/availability/ws
NEXT_PUBLIC_PUSH_NOTIFICATION_KEY=your-vapid-key
CACHE_TTL=3600000
MAX_CACHE_ENTRIES=1000
```

## Monitoring and Analytics

### Key Metrics to Monitor

1. **Availability Response Time**
2. **Cache Hit Rate**
3. **WebSocket Connection Success Rate**
4. **Booking Success Rate**
5. **Conflict Resolution Success Rate**

### Logging

```typescript
// Structured logging for debugging
console.log({
  component: 'availability-tracker',
  event: 'slot_booked',
  serviceId,
  clinicId,
  duration: Date.now() - startTime
});
```

## Future Enhancements

### Planned Features

1. **AI-Powered Wait Time Prediction**
2. **Advanced Capacity Optimization**
3. **Multi-tenant Support**
4. **Enhanced Analytics Dashboard**
5. **Integration with External Calendars**

### Migration Path

```typescript
// Version 2.0 Features
interface AvailabilityV2 {
  mlPrediction: boolean;
  crossClinicOptimization: boolean;
  advancedAnalytics: boolean;
}
```

## Support and Documentation

### Resources

- **API Documentation**: `/api/docs/availability`
- **Component Storybook**: `/storybook/availability`
- **Testing Guide**: `/docs/testing-availability`
- **Performance Benchmarks**: `/docs/performance-availability`

### Getting Help

1. Check the demo pages for examples
2. Review test runner output for diagnostics
3. Enable debug mode for detailed logging
4. Consult the troubleshooting section above

---

**Note**: This system is designed to integrate seamlessly with existing clinic management workflows while providing modern, real-time availability tracking capabilities.