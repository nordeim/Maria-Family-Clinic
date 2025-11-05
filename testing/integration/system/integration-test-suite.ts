# System Integration Testing Suite

## Overview
Validates seamless integration between all core system components: tRPC API, Supabase database, Google Maps API, healthcare services, and analytics system.

## Test Categories

### 1. tRPC API Integration Testing

#### 1.1 API Contract Validation
```typescript
// Test: API Contract Consistency
describe('tRPC API Contract Integration', () => {
  test('should validate all API endpoints contract consistency', async () => {
    // Validate doctor search API contract
    const doctorSearchSchema = {
      input: z.object({
        query: z.string(),
        location: z.object({
          lat: z.number(),
          lng: z.number()
        }),
        specialties: z.array(z.string()),
        availability: z.object({
          date: z.string(),
          timeSlots: z.array(z.object({
            start: z.string(),
            end: z.string()
          }))
        })
      }),
      output: z.object({
        doctors: z.array(z.object({
          id: z.string(),
          name: z.string(),
          specialties: z.array(z.string()),
          clinic: z.object({
            name: z.string(),
            location: z.object({
              lat: z.number(),
              lng: z.number()
            }),
            address: z.string()
          }),
          availability: z.array(z.object({
            date: z.string(),
            timeSlots: z.array(z.object({
              start: z.string(),
              end: z.string()
            }))
          }))
        }))
      })
    };
    
    // Test contract validation
    expect(contractValidation).toBeValid();
  });

  test('should handle API versioning compatibility', async () => {
    // Test v1 to v2 API migration compatibility
    const versionCompatibility = {
      'v1': {
        endpoints: ['doctor.search', 'clinic.find', 'appointment.book'],
        backwardCompatible: true
      },
      'v2': {
        endpoints: ['doctor.search', 'clinic.find', 'appointment.book', 'healthierSg.enroll'],
        backwardCompatible: false
      }
    };
    
    expect(versionCompatibility.v1.endpoints).toBeSubsetOf(versionCompatibility.v2.endpoints);
  });
});
```

#### 1.2 API Error Handling Integration
```typescript
describe('tRPC API Error Handling Integration', () => {
  test('should handle database connection failures gracefully', async () => {
    const dbError = new DatabaseConnectionError('Connection timeout');
    const response = await handleApiError(dbError);
    
    expect(response.status).toBe(503);
    expect(response.error).toMatch(/Service temporarily unavailable/);
    expect(response.retryable).toBe(true);
  });

  test('should handle validation errors with proper formatting', async () => {
    const validationError = new ZodValidationError('Invalid input data');
    const response = await handleApiError(validationError);
    
    expect(response.status).toBe(400);
    expect(response.error).toMatch(/Validation failed/);
    expect(response.details).toBeDefined();
  });
});
```

### 2. Supabase Database Integration Testing

#### 2.1 Database Connection and Query Integration
```typescript
describe('Supabase Database Integration', () => {
  test('should establish secure database connections', async () => {
    const connection = await supabase.connect();
    expect(connection.authenticated).toBe(true);
    expect(connection.secure).toBe(true);
    
    // Test connection pooling
    const poolStatus = await supabase.getConnectionPoolStatus();
    expect(poolStatus.active).toBeLessThan(poolStatus.max);
  });

  test('should execute complex queries with proper transaction handling', async () => {
    // Test appointment booking transaction
    const appointmentTransaction = await supabase.rpc('book_appointment', {
      doctor_id: 'doctor-123',
      patient_id: 'patient-456',
      appointment_date: '2025-11-15',
      time_slot: '10:00-10:30'
    });
    
    expect(appointmentTransaction.data).toBeDefined();
    expect(appointmentTransaction.data.appointment_id).toBeDefined();
    expect(appointmentTransaction.data.status).toBe('confirmed');
  });
});
```

#### 2.2 Real-time Data Synchronization
```typescript
describe('Real-time Database Integration', () => {
  test('should sync doctor availability changes in real-time', async () => {
    const availabilityChannel = supabase
      .channel('doctor_availability')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'doctor_availability'
      }, (payload) => {
        expect(payload.new.availability).toBeDefined();
      });

    await availabilityChannel.subscribe();
    
    // Simulate availability update
    await supabase
      .from('doctor_availability')
      .update({ 
        available_slots: ['11:00-11:30', '14:00-14:30'] 
      })
      .eq('doctor_id', 'doctor-123');
  });
});
```

### 3. Google Maps API Integration Testing

#### 3.1 Location Services Integration
```typescript
describe('Google Maps API Integration', () => {
  test('should validate geocoding accuracy for Singapore locations', async () => {
    const singaporeLocations = [
      { address: 'Orchard Road, Singapore', expectedLat: 1.3048, expectedLng: 103.8318 },
      { address: 'Marina Bay, Singapore', expectedLat: 1.2834, expectedLng: 103.8607 },
      { address: 'Sentosa, Singapore', expectedLat: 1.2494, expectedLng: 103.8303 }
    ];

    for (const location of singaporeLocations) {
      const geocoded = await mapsService.geocode(location.address);
      expect(Math.abs(geocoded.lat - location.expectedLat)).toBeLessThan(0.01);
      expect(Math.abs(geocoded.lng - location.expectedLng)).toBeLessThan(0.01);
    }
  });

  test('should calculate accurate distances for clinic searches', async () => {
    const userLocation = { lat: 1.3521, lng: 103.8198 }; // Singapore center
    const clinics = [
      { id: 'clinic-1', lat: 1.3048, lng: 103.8318, name: 'Orchard Clinic' },
      { id: 'clinic-2', lat: 1.2834, lng: 103.8607, name: 'Marina Bay Clinic' }
    ];

    const distances = await Promise.all(
      clinics.map(clinic => mapsService.calculateDistance(userLocation, clinic))
    );

    expect(distances[0].distance).toBeLessThan(10); // Within 10km
    expect(distances[1].distance).toBeLessThan(15); // Within 15km
  });
});
```

### 4. Healthcare Service Integration Testing

#### 4.1 Clinic Management System Integration
```typescript
describe('Healthcare Service Integration', () => {
  test('should integrate with clinic management systems', async () => {
    // Mock clinic management system API
    const clinicSystem = new ClinicManagementSystem('test-clinic-api');
    
    // Test doctor availability sync
    const availability = await clinicSystem.getDoctorAvailability('doctor-123');
    expect(availability).toEqual(expect.arrayContaining([
      expect.objectContaining({
        date: expect.any(String),
        timeSlots: expect.arrayContaining([
          expect.objectContaining({
            start: expect.any(String),
            end: expect.any(String),
            available: expect.any(Boolean)
          })
        ])
      })
    ]));
  });

  test('should sync medical record formats', async () => {
    // Test medical record integration
    const medicalRecord = await medicalSystem.getPatientRecord('patient-456');
    
    expect(medicalRecord).toMatchObject({
      patientId: 'patient-456',
      allergies: expect.arrayContaining([expect.any(String)]),
      medications: expect.arrayContaining([expect.any(Object)]),
      medicalHistory: expect.arrayContaining([expect.any(Object)])
    });
  });
});
```

### 5. Analytics System Integration Testing

#### 5.1 Real-time Analytics Integration
```typescript
describe('Analytics System Integration', () => {
  test('should track healthcare workflow events accurately', async () => {
    // Track clinic search journey
    await analytics.track('clinic_search_initiated', {
      userId: 'user-789',
      location: { lat: 1.3521, lng: 103.8198 },
      searchCriteria: { specialties: ['cardiology'], radius: 5 }
    });

    // Track appointment booking
    await analytics.track('appointment_booked', {
      userId: 'user-789',
      doctorId: 'doctor-123',
      clinicId: 'clinic-456',
      appointmentDate: '2025-11-15',
      timeSlot: '10:00-10:30'
    });

    // Verify analytics data
    const searchEvents = await analytics.getEvents('clinic_search_initiated');
    const bookingEvents = await analytics.getEvents('appointment_booked');
    
    expect(searchEvents.length).toBeGreaterThan(0);
    expect(bookingEvents.length).toBeGreaterThan(0);
  });

  test('should maintain healthcare data privacy in analytics', async () => {
    // Ensure no PHI in analytics
    const event = await analytics.track('appointment_completed', {
      appointmentId: 'apt-123',
      doctorId: 'doctor-456',
      // Intentionally exclude sensitive medical data
    });

    expect(event.patientData).toBeUndefined();
    expect(event.medicalDetails).toBeUndefined();
  });
});
```

## Integration Test Suite Execution

### Test Runner Configuration
```typescript
// integration.test.ts
describe('Complete System Integration', () => {
  beforeAll(async () => {
    // Setup test environment
    await setupTestEnvironment();
    await migrateTestDatabase();
    await startMockServices();
  });

  afterAll(async () => {
    // Cleanup test environment
    await cleanupTestEnvironment();
    await stopMockServices();
  });

  test('should complete full healthcare workflow integration', async () => {
    // 1. User searches for clinic
    const searchResults = await doctorSearchAPI.search({
      location: { lat: 1.3521, lng: 103.8198 },
      specialties: ['general-practice']
    });

    // 2. User selects doctor and checks availability
    const availability = await doctorAPI.getAvailability('doctor-123');
    expect(availability.length).toBeGreaterThan(0);

    // 3. User books appointment
    const booking = await appointmentAPI.book({
      doctorId: 'doctor-123',
      patientId: 'patient-456',
      date: '2025-11-15',
      timeSlot: '10:00-10:30'
    });

    // 4. Verify database consistency
    const appointmentRecord = await database.getAppointment(booking.appointmentId);
    expect(appointmentRecord.status).toBe('confirmed');

    // 5. Verify analytics tracking
    const analyticsEvents = await analytics.getEvents('appointment_booked');
    expect(analyticsEvents).toContainEqual(
      expect.objectContaining({ appointmentId: booking.appointmentId })
    );
  });
});
```

## Test Data and Mocking

### Healthcare Test Data
```typescript
// mockHealthcareData.ts
export const mockHealthcareData = {
  doctors: [
    {
      id: 'doctor-123',
      name: 'Dr. Sarah Tan',
      specialties: ['general-practice', 'family-medicine'],
      clinic: {
        name: 'HealthHub Clinic',
        address: '123 Orchard Road, Singapore',
        location: { lat: 1.3048, lng: 103.8318 }
      },
      availability: [
        {
          date: '2025-11-15',
          timeSlots: [
            { start: '09:00', end: '09:30', available: true },
            { start: '10:00', end: '10:30', available: false },
            { start: '11:00', end: '11:30', available: true }
          ]
        }
      ]
    }
  ],
  clinics: [
    {
      id: 'clinic-456',
      name: 'HealthHub Clinic',
      address: '123 Orchard Road, Singapore',
      location: { lat: 1.3048, lng: 103.8318 },
      services: ['general-practice', 'dental', 'pediatrics'],
      contact: {
        phone: '+65-6234-5678',
        email: 'contact@healthhub.sg'
      }
    }
  ],
  patients: [
    {
      id: 'patient-456',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+65-9123-4567',
      healthInfo: {
        allergies: ['peanuts'],
        medications: ['lisinopril'],
        conditions: ['hypertension']
      }
    }
  ]
};
```

## Performance Integration Tests

### Load Testing Integration
```typescript
describe('System Integration Performance', () => {
  test('should handle concurrent doctor search requests', async () => {
    const concurrentSearches = Array.from({ length: 100 }, (_, i) =>
      doctorSearchAPI.search({ 
        location: { lat: 1.3521, lng: 103.8198 },
        specialties: ['general-practice'],
        requestId: `req-${i}`
      })
    );

    const results = await Promise.all(concurrentSearches);
    
    // All requests should complete successfully
    expect(results.every(result => result.success)).toBe(true);
    
    // Response times should be acceptable
    const responseTimes = results.map(result => result.responseTime);
    const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    expect(averageResponseTime).toBeLessThan(1000); // Under 1 second
  });
});
```

## Security Integration Tests

### API Security Integration
```typescript
describe('System Security Integration', () => {
  test('should enforce API rate limiting', async () => {
    const rapidRequests = Array.from({ length: 200 }, (_, i) =>
      doctorSearchAPI.search({ 
        location: { lat: 1.3521, lng: 103.8198 },
        requestId: `rapid-${i}`
      })
    );

    const results = await Promise.all(rapidRequests);
    const rateLimitedResponses = results.filter(result => result.status === 429);
    
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });

  test('should validate healthcare data encryption', async () => {
    const sensitiveData = {
      patientId: 'patient-456',
      medicalRecords: 'Sensitive medical information',
      allergies: 'Critical allergy information'
    };

    const encrypted = await securityService.encrypt(sensitiveData);
    expect(encrypted).not.toContain('patient-456');
    expect(encrypted).not.toContain('Sensitive medical information');
    
    const decrypted = await securityService.decrypt(encrypted);
    expect(decrypted).toEqual(sensitiveData);
  });
});
```