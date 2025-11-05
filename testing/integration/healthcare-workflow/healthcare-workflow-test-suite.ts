# Healthcare Workflow Integration Testing Suite

## Overview
Comprehensive testing for healthcare-specific workflows including clinic appointment booking, doctor availability synchronization, Healthier SG program integration, and emergency contact systems.

## Test Categories

### 1. Clinic Appointment Booking Integration

#### 1.1 Complete User Journey Integration
```typescript
describe('Complete Healthcare Workflow Integration', () => {
  test('should complete full clinic search to booking workflow', async () => {
    // Step 1: User searches for clinic
    const clinicSearch = await clinicSearchAPI.search({
      location: { lat: 1.3521, lng: 103.8198 },
      radius: 5,
      searchQuery: 'general practice',
      filters: {
        specialties: ['general-practice'],
        availability: 'today',
        languages: ['english', 'mandarin']
      }
    });

    expect(clinicSearch.results.length).toBeGreaterThan(0);
    expect(clinicSearch.results[0]).toEqual(expect.objectContaining({
      doctorId: expect.any(String),
      doctorName: expect.any(String),
      clinicName: expect.any(String),
      clinicAddress: expect.any(String),
      specialties: expect.arrayContaining(['general-practice']),
      distance: expect.any(Number)
    }));

    // Step 2: User selects doctor and views availability
    const doctorAvailability = await doctorAPI.getAvailability({
      doctorId: clinicSearch.results[0].doctorId,
      dateRange: {
        start: '2025-11-15',
        end: '2025-11-22'
      }
    });

    expect(doctorAvailability.availableSlots.length).toBeGreaterThan(0);
    expect(doctorAvailability.availableSlots[0]).toEqual(expect.objectContaining({
      date: expect.any(String),
      timeSlots: expect.arrayContaining([
        expect.objectContaining({
          start: expect.any(String),
          end: expect.any(String),
          available: true,
          appointmentType: 'consultation'
        })
      ])
    }));

    // Step 3: User books appointment
    const appointmentBooking = await appointmentAPI.book({
      doctorId: clinicSearch.results[0].doctorId,
      patientId: 'patient-456',
      selectedSlot: {
        date: '2025-11-15',
        start: '14:00',
        end: '14:30'
      },
      appointmentType: 'consultation',
      chiefComplaint: 'Annual health check-up',
      preferredLanguage: 'english'
    });

    expect(appointmentBooking.bookingStatus).toBe('confirmed');
    expect(appointmentBooking.appointmentId).toMatch(/^APT\d{8}$/);
    expect(appointmentBooking.confirmationCode).toBeDefined();

    // Step 4: Verify database consistency
    const appointmentRecord = await database.getAppointment(appointmentBooking.appointmentId);
    expect(appointmentRecord.status).toBe('confirmed');
    expect(appointmentRecord.patientId).toBe('patient-456');
    expect(appointmentRecord.doctorId).toBe(clinicSearch.results[0].doctorId);

    // Step 5: Verify real-time notifications
    const notifications = await notificationAPI.getPatientNotifications('patient-456');
    const appointmentNotification = notifications.find(n => 
      n.type === 'appointment_confirmation' && 
      n.appointmentId === appointmentBooking.appointmentId
    );
    expect(appointmentNotification).toBeDefined();
  });
});
```

#### 1.2 Multi-Clinic Network Integration
```typescript
describe('Multi-Clinic Network Integration', () => {
  test('should synchronize availability across clinic networks', async () => {
    const doctorId = 'doctor-123';
    const clinicNetwork = ['clinic-abc', 'clinic-def', 'clinic-ghi'];

    // Get availability from primary clinic
    const primaryAvailability = await doctorAPI.getAvailability({
      doctorId,
      clinicId: 'clinic-abc',
      date: '2025-11-15'
    });

    // Verify availability is consistent across network
    for (const clinicId of clinicNetwork) {
      const clinicAvailability = await doctorAPI.getAvailability({
        doctorId,
        clinicId,
        date: '2025-11-15'
      });

      expect(clinicAvailability.availableSlots).toEqual(primaryAvailability.availableSlots);
      expect(clinicAvailability.syncStatus).toBe('synchronized');
    }

    // Test booking at different clinic locations
    const networkBooking = await appointmentAPI.bookAtNetwork({
      doctorId,
      preferredClinic: 'clinic-abc',
      fallbackClinics: ['clinic-def', 'clinic-ghi'],
      date: '2025-11-15',
      timeSlot: '15:00-15:30',
      appointmentType: 'follow-up'
    });

    expect(networkBooking.bookingStatus).toBe('confirmed');
    expect(networkBooking.bookedClinicId).toBeDefined();
    expect(['clinic-abc', 'clinic-def', 'clinic-ghi']).toContain(networkBooking.bookedClinicId);
  });
});
```

### 2. Doctor Availability Synchronization Integration

#### 2.1 Real-time Availability Updates
```typescript
describe('Doctor Availability Synchronization', () => {
  test('should update availability in real-time across all platforms', async () => {
    const doctorId = 'doctor-456';
    
    // Initial availability check
    const initialAvailability = await doctorAPI.getAvailability({
      doctorId,
      date: '2025-11-15'
    });

    const initialSlotCount = initialAvailability.availableSlots.length;

    // Simulate another user booking a slot
    const otherUserBooking = await appointmentAPI.book({
      doctorId,
      patientId: 'patient-789',
      selectedSlot: {
        date: '2025-11-15',
        start: '10:00',
        end: '10:30'
      }
    });

    expect(otherUserBooking.bookingStatus).toBe('confirmed');

    // Verify real-time availability update
    const updatedAvailability = await doctorAPI.getAvailability({
      doctorId,
      date: '2025-11-15'
    });

    expect(updatedAvailability.availableSlots.length).toBe(initialSlotCount - 1);
    
    // Verify the booked slot is no longer available
    const bookedSlot = updatedAvailability.availableSlots.find(slot => 
      slot.start === '10:00' && slot.end === '10:30'
    );
    expect(bookedSlot.available).toBe(false);
  });
});
```

#### 2.2 Complex Scheduling Integration
```typescript
describe('Complex Scheduling Integration', () => {
  test('should handle complex scheduling scenarios', async () => {
    const doctorId = 'doctor-789';

    // Test double-booking prevention
    const slot10AM = {
      date: '2025-11-15',
      start: '10:00',
      end: '10:30'
    };

    // First booking
    const booking1 = await appointmentAPI.book({
      doctorId,
      patientId: 'patient-111',
      selectedSlot: slot10AM
    });

    expect(booking1.bookingStatus).toBe('confirmed');

    // Attempt second booking for same slot
    const booking2 = await appointmentAPI.book({
      doctorId,
      patientId: 'patient-222',
      selectedSlot: slot10AM
    });

    expect(booking2.bookingStatus).toBe('failed');
    expect(booking2.error).toContain('Slot already booked');

    // Test appointment modification
    const modification = await appointmentAPI.modify({
      appointmentId: booking1.appointmentId,
      newSlot: {
        date: '2025-11-15',
        start: '11:00',
        end: '11:30'
      }
    });

    expect(modification.status).toBe('success');
    
    // Verify slot availability changes
    const availabilityAfterModification = await doctorAPI.getAvailability({
      doctorId,
      date: '2025-11-15'
    });

    expect(availabilityAfterModification.availableSlots.find(slot => 
      slot.start === '10:00' && slot.end === '10:30'
    ).available).toBe(true);

    expect(availabilityAfterModification.availableSlots.find(slot => 
      slot.start === '11:00' && slot.end === '11:30'
    ).available).toBe(false);
  });
});
```

### 3. Healthier SG Program Integration Testing

#### 3.1 Government Service Integration
```typescript
describe('Healthier SG Program Integration', () => {
  test('should complete Healthier SG enrollment workflow', async () => {
    // Step 1: Verify patient eligibility
    const eligibilityCheck = await governmentAPI.checkHealthierSgEligibility({
      patientId: 'patient-456',
      nric: 'S1234567A',
      eligibilityFactors: {
        age: 40,
        chronicConditions: ['hypertension'],
        residencyStatus: 'citizen',
        incomeLevel: 'middle'
      }
    });

    expect(eligibilityCheck.eligible).toBe(true);
    expect(eligibilityCheck.subsidyLevel).toBe('enhanced');
    expect(eligibilityCheck.enrollmentType).toBe('chronic_disease_management');

    // Step 2: Select healthcare provider
    const providerSelection = await governmentAPI.selectHealthierSgProvider({
      patientId: 'patient-456',
      providerType: 'clinic',
      selectedProvider: 'clinic-789',
      selectedDoctor: 'doctor-123',
      servicesRequired: [
        'chronic_disease_management',
        'preventive_care',
        'health_screening'
      ]
    });

    expect(providerSelection.status).toBe('approved');
    expect(providerSelection.providerConfirmed).toBe(true);
    expect(providerSelection.subsidyConfirmation).toBe('confirmed');

    // Step 3: Enroll in Healthier SG
    const enrollment = await governmentAPI.enrollInHealthierSg({
      patientId: 'patient-456',
      nric: 'S1234567A',
      enrollmentId: 'HSG2025001',
      providerDetails: {
        clinicId: 'clinic-789',
        doctorId: 'doctor-123',
        services: providerSelection.servicesRequired
      },
      healthGoals: [
        'blood_pressure_control',
        'diabetes_management',
        'weight_management'
      ]
    });

    expect(enrollment.enrollmentId).toMatch(/^HSG\d{8}$/);
    expect(enrollment.status).toBe('active');
    expect(enrollment.subsidyStartDate).toBeDefined();
    expect(enrollment.firstVisitDue).toBeDefined();
  });
});
```

#### 3.2 Healthier SG Appointment Integration
```typescript
describe('Healthier SG Appointment Integration', () => {
  test('should integrate Healthier SG benefits with appointment booking', async () => {
    const patientId = 'patient-456';
    
    // Verify Healthier SG enrollment
    const healthierSgStatus = await governmentAPI.getHealthierSgStatus(patientId);
    expect(healthierSgStatus.enrolled).toBe(true);
    expect(healthierSgStatus.activeServices).toContain('chronic_disease_management');

    // Book Healthier SG consultation
    const sgAppointment = await appointmentAPI.bookHealthierSgAppointment({
      patientId,
      doctorId: 'doctor-123',
      serviceType: 'chronic_disease_management',
      consultationType: 'follow_up',
      governmentSubsidy: true
    });

    expect(sgAppointment.subsidyApplied).toBe(true);
    expect(sgAppointment.patientCopay).toBe(30); // 30% patient pays
    expect(sgAppointment.governmentSubsidy).toBe(70); // 70% government pays
    expect(sgAppointment.healthierSgVisit).toBe(true);

    // Verify billing integration
    const billingRecord = await billingAPI.getAppointmentBilling(sgAppointment.appointmentId);
    expect(billingRecord.medisaveDeduction).toBeDefined();
    expect(billingRecord.governmentSubsidy).toBe(sgAppointment.governmentSubsidy);
    expect(billingRecord.totalCost).toBeGreaterThan(sgAppointment.patientCopay);
  });
});
```

### 4. Emergency Contact System Integration

#### 4.1 Emergency Response Integration
```typescript
describe('Emergency Contact System Integration', () => {
  test('should integrate with emergency services', async () => {
    const emergencyScenario = {
      patientId: 'patient-456',
      emergencyType: 'medical_emergency',
      location: {
        lat: 1.3048,
        lng: 103.8318,
        address: '123 Orchard Road, Singapore'
      },
      medicalInfo: {
        allergies: ['penicillin', 'peanuts'],
        medications: ['insulin', 'lisinopril'],
        conditions: ['diabetes', 'hypertension'],
        bloodType: 'O+',
        emergencyContact: 'Jane Doe (+65-9876-5432)'
      },
      symptoms: ['chest pain', 'difficulty breathing', 'sweating']
    };

    // Step 1: Send immediate emergency alert
    const emergencyAlert = await emergencyAPI.sendEmergencyAlert({
      patientId: emergencyScenario.patientId,
      alertType: 'medical_emergency',
      severity: 'critical',
      location: emergencyScenario.location,
      medicalInfo: emergencyScenario.medicalInfo,
      symptoms: emergencyScenario.symptoms
    });

    expect(emergencyAlert.alertId).toBeDefined();
    expect(emergencyAlert.scdNotified).toBe(true);
    expect(emergencyAlert.estimatedResponseTime).toBeLessThan(8); // Under 8 minutes

    // Step 2: Contact emergency contacts
    const contactNotifications = await emergencyAPI.notifyEmergencyContacts({
      patientId: emergencyScenario.patientId,
      emergencyType: 'medical_emergency',
      location: emergencyScenario.location,
      contactInfo: {
        name: 'Jane Doe',
        relation: 'spouse',
        phone: '+65-9876-5432'
      }
    });

    expect(contactNotifications.contactsNotified).toBe(1);
    expect(contactNotifications.contactConfirmed).toBe(true);

    // Step 3: Notify nearest hospitals
    const hospitalNotifications = await emergencyAPI.notifyNearestHospitals({
      location: emergencyScenario.location,
      medicalInfo: emergencyScenario.medicalInfo,
      estimatedArrivalTime: 10 // minutes
    });

    expect(hospitalNotifications.hospitalsNotified).toBeGreaterThan(1);
    expect(hospitalNotifications.nearestHospital).toBeDefined();
    expect(hospitalNotifications.bedAvailabilityConfirmed).toBe(true);
  });
});
```

#### 4.2 Emergency Contact Management Integration
```typescript
describe('Emergency Contact Management Integration', () => {
  test('should manage emergency contacts across all platforms', async () => {
    const patientId = 'patient-456';

    // Add emergency contacts
    const newContacts = await emergencyAPI.addEmergencyContacts(patientId, [
      {
        name: 'Jane Doe',
        relationship: 'spouse',
        phone: '+65-9876-5432',
        email: 'jane.doe@email.com',
        priority: 'primary',
        medicalAuthority: true
      },
      {
        name: 'John Doe Jr.',
        relationship: 'child',
        phone: '+65-9123-4567',
        priority: 'secondary'
      }
    ]);

    expect(newContacts.contactsAdded).toBe(2);

    // Verify cross-platform synchronization
    const mobileContacts = await emergencyAPI.getEmergencyContacts(patientId, 'mobile');
    const desktopContacts = await emergencyAPI.getEmergencyContacts(patientId, 'desktop');

    expect(mobileContacts).toEqual(desktopContacts);
    expect(mobileContacts.length).toBe(2);

    // Test emergency contact access during emergency
    const emergencyAccess = await emergencyAPI.accessEmergencyContacts({
      patientId,
      emergencyType: 'medical_emergency',
      accessingService: 'SCDF',
      authorizationCode: 'EMERGENCY-2025'
    });

    expect(emergencyAccess.accessGranted).toBe(true);
    expect(emergencyAccess.contactsProvided).toBe(2);
    expect(emergencyAccess.medicalInfoShared).toBe(true);
  });
});
```

### 5. Service Catalog Integration

#### 5.1 Healthcare Service Management
```typescript
describe('Healthcare Service Catalog Integration', () => {
  test('should integrate with comprehensive service catalog', async () => {
    // Get available healthcare services
    const serviceCatalog = await serviceAPI.getHealthcareServices({
      location: { lat: 1.3521, lng: 103.8198 },
      patientProfile: {
        age: 45,
        chronicConditions: ['hypertension'],
        insuranceType: 'medisave'
      }
    });

    expect(serviceCatalog.services.length).toBeGreaterThan(10);
    expect(serviceCatalog.services).toEqual(expect.arrayContaining([
      expect.objectContaining({
        serviceId: expect.any(String),
        serviceName: expect.any(String),
        category: expect.any(String),
        description: expect.any(String),
        price: expect.objectContaining({
          basePrice: expect.any(Number),
          medisaveEligible: expect.any(Boolean),
          subsidyApplied: expect.any(Number)
        }),
        availability: expect.objectContaining({
          doctorsAvailable: expect.any(Number),
          estimatedWaitTime: expect.any(Number)
        })
      })
    ]));

    // Test service filtering and search
    const filteredServices = await serviceAPI.searchServices({
      query: 'cardiology consultation',
      category: 'specialist',
      location: { lat: 1.3521, lng: 103.8198 },
      filters: {
        insuranceAccepted: ['medisave', 'medishield'],
        languages: ['english', 'mandarin'],
        availability: 'next_7_days'
      }
    });

    expect(filteredServices.results.length).toBeGreaterThan(0);
    expect(filteredServices.results.every(service => 
      service.category === 'specialist' && 
      service.serviceName.toLowerCase().includes('cardiolog')
    )).toBe(true);
  });
});
```

#### 5.2 Insurance Integration with Services
```typescript
describe('Insurance and Service Integration', () => {
  test('should properly integrate insurance with service bookings', async () => {
    const patientId = 'patient-456';
    const serviceId = 'cardiology-consultation-001';

    // Get service with insurance breakdown
    const serviceWithInsurance = await serviceAPI.getServiceWithInsurance({
      patientId,
      serviceId,
      insuranceProviders: ['medisave', 'medishield', 'private_insurance']
    });

    expect(serviceWithInsurance.pricing).toEqual(expect.objectContaining({
      basePrice: 150.00,
      medisaveCoverage: 105.00, // 70%
      medishieldCoverage: 45.00, // 30%
      patientOutOfPocket: 0.00,
      totalCoverage: 150.00
    }));

    // Book service with insurance
    const insuredBooking = await appointmentAPI.bookWithInsurance({
      patientId,
      serviceId,
      doctorId: 'doctor-cardio-123',
      insuranceType: 'medisave',
      preferredDate: '2025-11-20'
    });

    expect(insuredBooking.bookingStatus).toBe('confirmed');
    expect(insuredBooking.insuranceApproved).toBe(true);
    expect(insuredBooking.patientPaymentRequired).toBe(false);

    // Verify billing reflects insurance coverage
    const billingDetails = await billingAPI.getServiceBilling(insuredBooking.serviceId);
    expect(billingDetails.medisaveCharged).toBe(105.00);
    expect(billingDetails.medishieldCharged).toBe(45.00);
    expect(billingDetails.patientCharged).toBe(0.00);
  });
});
```

### 6. Multi-language Content Integration

#### 6.1 Multilingual Healthcare Content
```typescript
describe('Multilingual Healthcare Content Integration', () => {
  test('should deliver appropriate content in different languages', async () => {
    const languages = ['english', 'mandarin', 'malay', 'tamil'];
    
    for (const language of languages) {
      // Get clinic search results in specific language
      const searchResults = await clinicSearchAPI.search({
        location: { lat: 1.3521, lng: 103.8198 },
        query: 'general practice',
        language: language
      });

      expect(searchResults.contentLanguage).toBe(language);
      expect(searchResults.results.length).toBeGreaterThan(0);

      // Verify doctor information is translated
      const doctorInfo = searchResults.results[0];
      expect(doctorInfo.doctorName).toBeDefined();
      expect(doctorInfo.clinicName).toBeDefined();
      expect(doctorInfo.specialties).toBeDefined();

      // Verify appointment booking works in different languages
      const appointmentBooking = await appointmentAPI.book({
        doctorId: doctorInfo.doctorId,
        patientId: 'patient-456',
        selectedSlot: {
          date: '2025-11-15',
          start: '14:00',
          end: '14:30'
        },
        language: language
      });

      expect(appointmentBooking.confirmationMessage[language]).toBeDefined();
      expect(appointmentBooking.reminderSchedule[language]).toBeDefined();
    }
  });
});
```

#### 6.2 Cultural Healthcare Preferences Integration
```typescript
describe('Cultural Healthcare Preferences Integration', () => {
  test('should respect cultural healthcare preferences', async () => {
    const patientId = 'patient-456';
    
    // Set patient cultural preferences
    const culturalPreferences = await patientAPI.setCulturalPreferences(patientId, {
      preferredLanguages: ['mandarin', 'english'],
      dietaryRestrictions: ['halal'],
      culturalConsiderations: ['gender_preference_doctor'],
      preferredPractices: ['traditional_medicine_integration']
    });

    expect(culturalPreferences.preferencesSet).toBe(true);

    // Search for doctors with cultural considerations
    const culturallyAppropriateDoctors = await doctorAPI.searchWithCulturalPreferences({
      location: { lat: 1.3521, lng: 103.8198 },
      specialty: 'general-practice',
      culturalPreferences: culturalPreferences.preferences
    });

    expect(culturallyAppropriateDoctors.results.length).toBeGreaterThan(0);
    
    // Verify doctors meet cultural preferences
    const recommendedDoctor = culturallyAppropriateDoctors.results[0];
    expect(recommendedDoctor.languagesSpoken).toEqual(expect.arrayContaining(['mandarin', 'english']));
    expect(recommendedDoctor.culturalCompetency).toBe('certified');
    
    // Book appointment considering cultural preferences
    const culturalBooking = await appointmentAPI.bookWithCulturalConsiderations({
      patientId,
      doctorId: recommendedDoctor.doctorId,
      culturalRequirements: culturalPreferences.preferences,
      preferredDate: '2025-11-15'
    });

    expect(culturalBooking.respectsCulturalPreferences).toBe(true);
    expect(culturalBooking.preferredDoctorGender).toBeDefined();
  });
});
```

### 7. Healthcare Analytics Integration

#### 7.1 Clinical Data Analytics Integration
```typescript
describe('Healthcare Analytics Integration', () => {
  test('should track and analyze healthcare workflow events', async () => {
    // Track complete patient journey
    const journeyTracking = await analyticsAPI.trackHealthcareJourney({
      patientId: 'patient-456',
      journeySteps: [
        'search_initiated',
        'doctor_selected',
        'availability_checked',
        'appointment_booked',
        'payment_completed',
        'appointment_confirmed'
      ],
      contextualData: {
        searchQuery: 'cardiology consultation',
        location: { lat: 1.3521, lng: 103.8198 },
        deviceType: 'mobile',
        appointmentType: 'specialist_consultation'
      }
    });

    expect(journeyTracking.trackingId).toBeDefined();
    expect(journeyTracking.journeyCompleted).toBe(true);
    expect(journeyTracking.totalJourneyTime).toBeLessThan(300); // Under 5 minutes

    // Analyze healthcare metrics
    const healthcareMetrics = await analyticsAPI.getHealthcareMetrics({
      timeframe: 'monthly',
      metrics: [
        'appointment_completion_rate',
        'search_to_booking_conversion',
        'no_show_rate',
        'patient_satisfaction_score'
      ]
    });

    expect(healthcareMetrics.appointmentCompletionRate).toBeGreaterThan(0.85);
    expect(healthcareMetrics.searchToBookingConversion).toBeGreaterThan(0.15);
    expect(healthcareMetrics.noShowRate).toBeLessThan(0.1);
    expect(healthcareMetrics.patientSatisfactionScore).toBeGreaterThan(4.0);
  });
});
```

### 8. Integration Test Automation Scripts

#### 8.1 Healthcare Workflow Automation
```typescript
// healthcare-workflow-automation.ts
export class HealthcareWorkflowTester {
  async runCompleteWorkflowTests() {
    const workflows = [
      'clinic_search_to_booking',
      'healthier_sg_enrollment',
      'emergency_contact_flow',
      'insurance_integration',
      'multilingual_booking'
    ];

    const results = [];

    for (const workflow of workflows) {
      const result = await this.testWorkflow(workflow);
      results.push({
        workflow,
        success: result.success,
        duration: result.duration,
        issues: result.issues || []
      });
    }

    return results;
  }

  private async testWorkflow(workflow: string) {
    const startTime = Date.now();
    
    try {
      switch (workflow) {
        case 'clinic_search_to_booking':
          return await this.testClinicSearchToBookingWorkflow();
        case 'healthier_sg_enrollment':
          return await this.testHealthierSgEnrollmentWorkflow();
        case 'emergency_contact_flow':
          return await this.testEmergencyContactWorkflow();
        default:
          throw new Error(`Unknown workflow: ${workflow}`);
      }
    } catch (error) {
      return {
        success: false,
        duration: Date.now() - startTime,
        issues: [error.message]
      };
    }
  }

  private async testClinicSearchToBookingWorkflow() {
    const startTime = Date.now();
    
    // Simulate complete user journey
    const searchResults = await clinicSearchAPI.search({
      location: { lat: 1.3521, lng: 103.8198 },
      query: 'general practice'
    });

    const doctor = searchResults.results[0];
    const availability = await doctorAPI.getAvailability(doctor.doctorId);
    const booking = await appointmentAPI.book({
      doctorId: doctor.doctorId,
      patientId: 'patient-test',
      selectedSlot: availability.availableSlots[0]
    });

    return {
      success: booking.bookingStatus === 'confirmed',
      duration: Date.now() - startTime
    };
  }

  private async testHealthierSgEnrollmentWorkflow() {
    const startTime = Date.now();
    
    const eligibility = await governmentAPI.checkHealthierSgEligibility({
      patientId: 'patient-test',
      nric: 'S1234567A'
    });

    const enrollment = await governmentAPI.enrollInHealthierSg({
      patientId: 'patient-test',
      nric: 'S1234567A',
      enrollmentType: 'chronic_disease_management'
    });

    return {
      success: enrollment.status === 'active',
      duration: Date.now() - startTime
    };
  }
}
```