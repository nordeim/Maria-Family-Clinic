# Third-Party Service Integration Testing Suite

## Overview
Comprehensive testing of all external service integrations including payment gateways, communication services, government APIs, and healthcare provider systems.

## Test Categories

### 1. Payment Gateway Integration Testing

#### 1.1 Singapore Healthcare Payment Systems
```typescript
describe('Healthcare Payment Integration', () => {
  test('should process Medisave payments correctly', async () => {
    // Mock Medisave payment processing
    const medisavePayment = await paymentGateway.processMedisavePayment({
      patientId: 'patient-456',
      providerId: 'clinic-789',
      amount: 50.00, // SGD
      serviceType: 'consultation',
      medisaveAccount: 'MA123456789'
    });

    expect(medisavePayment.success).toBe(true);
    expect(medisavePayment.transactionId).toBeDefined();
    expect(medisavePayment.medisaveBalance).toBeDefined();
    expect(medisavePayment.confirmationCode).toMatch(/^MS\d{6}$/);
  });

  test('should handle Medishield integration', async () => {
    const medishieldClaim = await paymentGateway.processMedishieldClaim({
      patientId: 'patient-456',
      treatmentType: 'specialist-consultation',
      originalAmount: 150.00,
      deductibleAmount: 30.00,
      claimAmount: 120.00
    });

    expect(madishieldClaim.approved).toBe(true);
    expect(madishieldClaim.coveragePercentage).toBe(80);
    expect(madishieldClaim.claimReference).toMatch(/^MH\d{8}$/);
  });

  test('should integrate with healthcare billing systems', async () => {
    // Test integration with hospital/clinic billing systems
    const billingIntegration = await billingSystem.createInvoice({
      patientId: 'patient-456',
      clinicId: 'clinic-789',
      items: [
        { service: 'consultation', amount: 50.00 },
        { service: 'blood-test', amount: 30.00 }
      ],
      paymentMethod: 'medisave'
    });

    expect(billingIntegration.invoiceId).toBeDefined();
    expect(billingIntegration.totalAmount).toBe(80.00);
    expect(billingIntegration.paymentStatus).toBe('pending_medisave_verification');
  });
});
```

#### 1.2 Credit Card and Digital Wallet Integration
```typescript
describe('Digital Payment Integration', () => {
  test('should support Visa/Mastercard processing', async () => {
    const cardPayment = await paymentGateway.processCardPayment({
      patientId: 'patient-456',
      cardDetails: {
        number: '4111111111111111',
        expiryMonth: 12,
        expiryYear: 2025,
        cvv: '123'
      },
      amount: 25.00,
      currency: 'SGD',
      description: 'Clinic consultation fee'
    });

    expect(cardPayment.success).toBe(true);
    expect(cardPayment.authCode).toMatch(/^\d{6}$/);
    expect(cardPayment.transactionId).toBeDefined();
  });

  test('should integrate with PayNow and other digital wallets', async () => {
    const payNowPayment = await paymentGateway.processPayNowPayment({
      patientId: 'patient-456',
      amount: 45.00,
      reference: 'CLINIC-CONSULT-123456',
      description: 'General consultation fee'
    });

    expect(payNowPayment.qrCode).toBeDefined();
    expect(payNowPayment.paymentUrl).toMatch(/^https:\/\/.*paynow\.sg/);
    expect(payNowPayment.expiryTime).toBeDefined();
  });
});
```

### 2. SMS/Email Notification Integration Testing

#### 2.1 Healthcare Notification Services
```typescript
describe('Healthcare Notification Integration', () => {
  test('should send appointment reminders via SMS', async () => {
    const smsNotification = await notificationService.sendSMS({
      recipient: '+65-9123-4567',
      message: 'Reminder: You have a consultation with Dr. Sarah Tan tomorrow at 2:00 PM at HealthHub Clinic, 123 Orchard Road.',
      type: 'appointment_reminder',
      priority: 'high'
    });

    expect(smsNotification.messageId).toBeDefined();
    expect(smsNotification.status).toBe('delivered');
    expect(smsNotification.deliveryTime).toBeLessThan(30); // Under 30 seconds
  });

  test('should send appointment confirmations via email', async () => {
    const emailNotification = await notificationService.sendEmail({
      to: 'patient@email.com',
      subject: 'Appointment Confirmation - HealthHub Clinic',
      template: 'appointment_confirmation',
      data: {
        patientName: 'John Doe',
        doctorName: 'Dr. Sarah Tan',
        clinicName: 'HealthHub Clinic',
        appointmentDate: '2025-11-15',
        appointmentTime: '14:00',
        clinicAddress: '123 Orchard Road, Singapore',
        cancellationPolicy: '24 hours notice required'
      }
    });

    expect(emailNotification.messageId).toMatch(/^em_\w+$/);
    expect(emailNotification.status).toBe('sent');
    expect(emailNotification.opened).toBe(false); // Initially false
  });
});
```

#### 2.2 Emergency Alert Integration
```typescript
describe('Emergency Alert Integration', () => {
  test('should send emergency contact notifications', async () => {
    const emergencyAlert = await notificationService.sendEmergencyAlert({
      patientId: 'patient-456',
      emergencyType: 'medical_emergency',
      location: {
        lat: 1.3048,
        lng: 103.8318,
        address: 'HealthHub Clinic, 123 Orchard Road'
      },
      emergencyContacts: [
        { name: 'Jane Doe', phone: '+65-9876-5432', relation: 'spouse' },
        { name: 'Emergency Services', phone: '995', relation: 'emergency' }
      ],
      medicalInfo: {
        allergies: ['peanuts'],
        medications: ['insulin'],
        conditions: ['diabetes']
      }
    });

    expect(emergencyAlert.alertId).toBeDefined();
    expect(emergencyAlert.scdNotified).toBe(true);
    expect(emergencyAlert.contactsNotified).toBe(2);
  });
});
```

### 3. Government API Integration Testing

#### 3.1 Healthier SG Program Integration
```typescript
describe('Government API Integration', () => {
  test('should integrate with Healthier SG enrollment', async () => {
    const healthierSgEnrollment = await governmentAPI.enrollInHealthierSg({
      patientId: 'patient-456',
      nric: 'S1234567A',
      enrollmentType: 'chronic_disease_management',
      selectedClinic: 'clinic-789',
      selectedDoctor: 'doctor-123',
      healthGoals: [
        'blood_pressure_control',
        'diabetes_management',
        'weight_management'
      ]
    });

    expect(healthierSgEnrollment.enrollmentId).toMatch(/^HSG\d{8}$/);
    expect(healthierSgEnrollment.status).toBe('enrolled');
    expect(healthierSgEnrollment.governmentSubsidy).toBe(70); // 70% subsidy
  });

  test('should verify SingPass/MyInfo integration', async () => {
    const singPassVerification = await governmentAPI.verifySingPass({
      patientId: 'patient-456',
      singPassId: 'S1234567A',
      verificationPurpose: 'healthcare_registration'
    });

    expect(singPassVerification.verified).toBe(true);
    expect(singPassVerification.identityVerified).toBe(true);
    expect(singPassVerification.myInfoData).toEqual(expect.objectContaining({
      name: 'JOHN DOE',
      nric: 'S1234567A',
      dateOfBirth: expect.any(String),
      address: expect.objectContaining({
        street: expect.any(String),
        postalCode: expect.any(String)
      })
    }));
  });
});
```

#### 3.2 MOH Healthcare Registry Integration
```typescript
describe('MOH Healthcare Registry Integration', () => {
  test('should verify healthcare provider credentials', async () => {
    const providerVerification = await mohAPI.verifyHealthcareProvider({
      providerId: 'doctor-123',
      verificationType: 'medical_license'
    });

    expect(providerVerification.valid).toBe(true);
    expect(providerVerification.licenseNumber).toMatch(/^M\d{6}$/);
    expect(providerVerification.specializations).toContain('general-practice');
    expect(providerVerification.registrationStatus).toBe('active');
  });

  test('should integrate with national health records', async () => {
    const healthRecord = await mohAPI.getNationalHealthRecord({
      patientId: 'patient-456',
      nric: 'S1234567A',
      accessConsent: true,
      accessPurpose: 'clinical_care'
    });

    expect(healthRecord.patientConsent).toBe(true);
    expect(healthRecord.medicalHistory).toBeDefined();
    expect(healthRecord.vaccinationRecords).toBeDefined();
    expect(healthRecord.chronicConditions).toBeDefined();
  });
});
```

### 4. Healthcare Provider API Integration Testing

#### 4.1 Clinic Management System Integration
```typescript
describe('Healthcare Provider Integration', () => {
  test('should sync doctor availability across clinic networks', async () => {
    const availabilitySync = await clinicAPI.syncDoctorAvailability({
      doctorId: 'doctor-123',
      clinicNetwork: ['clinic-789', 'clinic-456', 'clinic-321'],
      syncDirection: 'bidirectional'
    });

    expect(availabilitySync.syncId).toBeDefined();
    expect(availabilitySync.clinicsUpdated).toBe(3);
    expect(availabilitySync.conflictsDetected).toBe(0);
  });

  test('should handle medical record format standardization', async () => {
    const recordIntegration = await medicalAPI.integratePatientRecord({
      patientId: 'patient-456',
      sourceSystems: ['clinic-789', 'hospital-abc', 'lab-xyz'],
      format: 'HL7_FHIR'
    });

    expect(recordIntegration.recordId).toBeDefined();
    expect(recordIntegration.format).toBe('HL7_FHIR');
    expect(recordIntegration.completenessScore).toBeGreaterThan(0.8);
    expect(recordIntegration.dataSources).toBe(3);
  });
});
```

#### 4.2 Laboratory and Diagnostic Service Integration
```typescript
describe('Diagnostic Service Integration', () => {
  test('should integrate with laboratory services', async () => {
    const labOrder = await diagnosticAPI.orderLaboratoryTests({
      patientId: 'patient-456',
      doctorId: 'doctor-123',
      tests: [
        { code: 'CBC', name: 'Complete Blood Count', urgent: false },
        { code: 'GLU', name: 'Fasting Glucose', urgent: false },
        { code: 'LIPID', name: 'Lipid Profile', urgent: false }
      ],
      clinicLocation: 'clinic-789'
    });

    expect(labOrder.orderId).toMatch(/^LAB\d{6}$/);
    expect(labOrder.testResults).toBeDefined();
    expect(labOrder.expectedResultsDate).toBeDefined();
    expect(labOrder.totalCost).toBeGreaterThan(0);
  });

  test('should handle imaging service integration', async () => {
    const imagingOrder = await diagnosticAPI.orderImaging({
      patientId: 'patient-456',
      doctorId: 'doctor-123',
      imagingType: 'chest_xray',
      urgency: 'routine',
      clinicReferral: true
    });

    expect(imagingOrder.appointmentId).toBeDefined();
    expect(imagingOrder.facilityId).toBeDefined();
    expect(imagingOrder.appointmentDate).toBeDefined();
    expect(imagingOrder.preparationInstructions).toBeDefined();
  });
});
```

### 5. Social Media Integration Testing

#### 5.1 WhatsApp Business API Integration
```typescript
describe('Social Media Integration', () => {
  test('should send WhatsApp appointment confirmations', async () => {
    const whatsappMessage = await whatsappAPI.sendMessage({
      to: '+65-9123-4567',
      templateName: 'appointment_confirmation',
      language: 'en',
      components: [
        {
          type: 'header',
          parameters: [{ type: 'text', text: 'Dr. Sarah Tan' }]
        },
        {
          type: 'body',
          parameters: [
            { type: 'text', text: 'John Doe' },
            { type: 'text', text: 'Nov 15, 2025' },
            { type: 'text', text: '2:00 PM' }
          ]
        }
      ]
    });

    expect(whatsappMessage.messageId).toBeDefined();
    expect(whatsappMessage.status).toBe('sent');
    expect(whatsappMessage.whatsappMessageId).toMatch(/^wamid\..+$/);
  });
});
```

## Integration Test Automation

### Mock Service Configuration
```typescript
// mockThirdPartyServices.ts
export class MockThirdPartyServices {
  private paymentGateway: MockPaymentGateway;
  private notificationService: MockNotificationService;
  private governmentAPI: MockGovernmentAPI;
  private healthcareProviderAPI: MockHealthcareProviderAPI;

  async setupMockServices() {
    // Setup mock payment gateway
    this.paymentGateway = new MockPaymentGateway({
      delay: 100, // 100ms response delay
      failureRate: 0.02, // 2% failure rate
      methods: ['medisave', 'medishield', 'credit_card', 'paynow']
    });

    // Setup mock notification service
    this.notificationService = new MockNotificationService({
      smsProviders: ['twilio', 'aws_sns'],
      emailProviders: ['ses', 'sendgrid'],
      deliveryRate: 0.95
    });

    // Setup mock government API
    this.governmentAPI = new MockGovernmentAPI({
      healthierSgEndpoint: true,
      singPassEndpoint: true,
      mohRegistryEndpoint: true
    });

    // Setup mock healthcare provider API
    this.healthcareProviderAPI = new MockHealthcareProviderAPI({
      clinicNetworks: ['HealthHub', 'Raffles Medical', 'Thomson ParentCraft'],
      labServices: ['Quest Diagnostics', 'Synnovate'],
      imagingServices: ['Radiology Center Singapore']
    });
  }

  async cleanupMockServices() {
    await Promise.all([
      this.paymentGateway.shutdown(),
      this.notificationService.shutdown(),
      this.governmentAPI.shutdown(),
      this.healthcareProviderAPI.shutdown()
    ]);
  }
}
```

### Integration Test Suite Runner
```typescript
// integration-test-runner.ts
describe('Complete Third-Party Integration Suite', () => {
  let mockServices: MockThirdPartyServices;

  beforeAll(async () => {
    mockServices = new MockThirdPartyServices();
    await mockServices.setupMockServices();
  });

  afterAll(async () => {
    await mockServices.cleanupMockServices();
  });

  test('should complete payment workflow integration', async () => {
    // 1. Patient books appointment
    const appointment = await appointmentAPI.book({
      doctorId: 'doctor-123',
      patientId: 'patient-456',
      date: '2025-11-15',
      timeSlot: '14:00-14:30'
    });

    // 2. Process Medisave payment
    const payment = await paymentGateway.processMedisavePayment({
      patientId: 'patient-456',
      appointmentId: appointment.id,
      amount: 50.00
    });

    expect(payment.success).toBe(true);

    // 3. Send confirmation notifications
    const smsConfirmation = await notificationService.sendSMS({
      to: '+65-9123-4567',
      message: `Appointment confirmed for ${appointment.date} at ${appointment.time}`
    });

    const emailConfirmation = await notificationService.sendEmail({
      to: 'patient@email.com',
      subject: 'Appointment Confirmation',
      template: 'appointment_booked'
    });

    expect(smsConfirmation.status).toBe('delivered');
    expect(emailConfirmation.status).toBe('sent');
  });

  test('should handle government API integration workflow', async () => {
    // 1. Verify patient identity via SingPass
    const identityVerification = await governmentAPI.verifySingPass({
      patientId: 'patient-456',
      singPassId: 'S1234567A'
    });

    expect(identityVerification.verified).toBe(true);

    // 2. Enroll in Healthier SG program
    const healthierSgEnrollment = await governmentAPI.enrollInHealthierSg({
      patientId: 'patient-456',
      nric: 'S1234567A',
      enrollmentType: 'preventive_care'
    });

    expect(healthierSgEnrollment.status).toBe('enrolled');

    // 3. Verify healthcare provider credentials
    const providerVerification = await mohAPI.verifyHealthcareProvider({
      doctorId: 'doctor-123'
    });

    expect(providerVerification.valid).toBe(true);
  });
});
```

### Performance and Reliability Testing

#### Load Testing for Third-Party Services
```typescript
describe('Third-Party Service Load Testing', () => {
  test('should handle high-volume payment processing', async () => {
    const concurrentPayments = Array.from({ length: 50 }, (_, i) =>
      paymentGateway.processPayment({
        patientId: `patient-${i}`,
        amount: 25.00 + i,
        method: i % 2 === 0 ? 'medisave' : 'credit_card'
      })
    );

    const results = await Promise.all(concurrentPayments);
    const successRate = results.filter(r => r.success).length / results.length;
    
    expect(successRate).toBeGreaterThan(0.95); // 95% success rate
  });

  test('should maintain notification delivery during peak hours', async () => {
    const peakHourNotifications = Array.from({ length: 100 }, (_, i) =>
      notificationService.sendSMS({
        to: `+65-9123-${String(i).padStart(4, '0')}`,
        message: `Reminder: Your appointment is in 1 hour`,
        priority: 'normal'
      })
    );

    const results = await Promise.all(peakHourNotifications);
    const deliveryRate = results.filter(r => r.status === 'delivered').length / results.length;
    
    expect(deliveryRate).toBeGreaterThan(0.90); // 90% delivery rate
  });
});
```