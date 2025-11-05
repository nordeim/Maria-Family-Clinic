/**
 * Healthcare Performance Load Testing Scenarios
 * Sub-Phase 11.5: Performance & Load Testing
 * Comprehensive load testing scenarios for healthcare platform
 */

import { LoadTestConfig, LoadTestScenario, LoadTestResult } from '../types'

export interface HealthcareLoadTestScenario {
  name: string
  description: string
  concurrentUsers: number
  duration: string
  description: string
  workflows: Array<{
    name: string
    weight: number // Percentage of users using this workflow
    steps: Array<{
      action: string
      endpoint?: string
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
      expectedResponseTime: number
      critical: boolean
    }>
  }>
  peakUsage?: {
    description: string
    userMultiplier: number
    duration: string
  }
}

export interface HealthcareLoadTestEnvironment {
  name: string
  baseUrl: string
  concurrentUsers: number
  duration: string
  description: string
  scenarios: HealthcareLoadTestScenario[]
  thresholds: {
    responseTime: {
      critical: number // <500ms for emergency
      important: number // <1s for healthcare workflows
      standard: number // <2s for regular workflows
    }
    errorRate: {
      critical: number // <0.1% for critical workflows
      important: number // <0.5% for important workflows
      standard: number // <1% for standard workflows
    }
    throughput: number // requests per second minimum
  }
}

export class HealthcareLoadTestScenarios {
  private environments: HealthcareLoadTestEnvironment[]

  constructor() {
    this.environments = this.initializeTestEnvironments()
  }

  private initializeTestEnvironments(): HealthcareLoadTestEnvironment[] {
    return [
      {
        name: 'development',
        baseUrl: 'http://localhost:3000',
        concurrentUsers: 50,
        duration: '5m',
        description: 'Development environment testing with limited load',
        scenarios: this.getDevelopmentScenarios(),
        thresholds: {
          responseTime: { critical: 1000, important: 2000, standard: 5000 },
          errorRate: { critical: 0.5, important: 1.0, standard: 2.0 },
          throughput: 20
        }
      },
      {
        name: 'staging',
        baseUrl: 'https://staging.myfamilyclinic.com',
        concurrentUsers: 500,
        duration: '15m',
        description: 'Staging environment comprehensive testing',
        scenarios: this.getStagingScenarios(),
        thresholds: {
          responseTime: { critical: 500, important: 1000, standard: 2000 },
          errorRate: { critical: 0.1, important: 0.5, standard: 1.0 },
          throughput: 100
        }
      },
      {
        name: 'production',
        baseUrl: 'https://myfamilyclinic.com',
        concurrentUsers: 1000,
        duration: '30m',
        description: 'Production environment full-scale testing',
        scenarios: this.getProductionScenarios(),
        thresholds: {
          responseTime: { critical: 500, important: 1000, standard: 2000 },
          errorRate: { critical: 0.05, important: 0.1, standard: 0.5 },
          throughput: 200
        }
      },
      {
        name: 'stress-testing',
        baseUrl: 'https://myfamilyclinic.com',
        concurrentUsers: 5000,
        duration: '60m',
        description: 'Stress testing to identify breaking points',
        scenarios: this.getStressTestScenarios(),
        thresholds: {
          responseTime: { critical: 1000, important: 2000, standard: 5000 },
          errorRate: { critical: 1.0, important: 2.0, standard: 5.0 },
          throughput: 50
        }
      }
    ]
  }

  private getDevelopmentScenarios(): HealthcareLoadTestScenario[] {
    return [
      {
        name: 'basic-patient-journey',
        description: 'Basic patient journey testing',
        concurrentUsers: 25,
        duration: '3m',
        workflows: [
          {
            name: 'clinic-search',
            weight: 60,
            steps: [
              {
                action: 'Navigate to homepage',
                endpoint: '/',
                method: 'GET',
                expectedResponseTime: 2000,
                critical: false
              },
              {
                action: 'Search for clinics by location',
                endpoint: '/api/clinics/search',
                method: 'GET',
                expectedResponseTime: 1000,
                critical: false
              },
              {
                action: 'View clinic details',
                endpoint: '/api/clinics/{clinicId}',
                method: 'GET',
                expectedResponseTime: 800,
                critical: false
              }
            ]
          },
          {
            name: 'doctor-search',
            weight: 40,
            steps: [
              {
                action: 'Navigate to doctor search',
                endpoint: '/doctors',
                method: 'GET',
                expectedResponseTime: 1500,
                critical: false
              },
              {
                action: 'Search doctors by specialty',
                endpoint: '/api/doctors/search',
                method: 'GET',
                expectedResponseTime: 1000,
                critical: false
              },
              {
                action: 'View doctor profile',
                endpoint: '/api/doctors/{doctorId}',
                method: 'GET',
                expectedResponseTime: 800,
                critical: false
              }
            ]
          }
        ]
      }
    ]
  }

  private getStagingScenarios(): HealthcareLoadTestScenario[] {
    return [
      {
        name: 'peak-appointment-booking',
        description: 'Peak appointment booking scenario (flu season)',
        concurrentUsers: 200,
        duration: '10m',
        workflows: [
          {
            name: 'appointment-booking',
            weight: 70,
            steps: [
              {
                action: 'Navigate to appointment booking',
                endpoint: '/appointments/book',
                method: 'GET',
                expectedResponseTime: 1500,
                critical: true
              },
              {
                action: 'Search available doctors',
                endpoint: '/api/doctors/available',
                method: 'GET',
                expectedResponseTime: 800,
                critical: true
              },
              {
                action: 'Check clinic availability',
                endpoint: '/api/clinics/{clinicId}/availability',
                method: 'GET',
                expectedResponseTime: 500,
                critical: true
              },
              {
                action: 'Submit appointment booking',
                endpoint: '/api/appointments',
                method: 'POST',
                expectedResponseTime: 1000,
                critical: true
              },
              {
                action: 'Receive confirmation',
                endpoint: '/appointments/confirmation',
                method: 'GET',
                expectedResponseTime: 800,
                critical: true
              }
            ]
          },
          {
            name: 'clinic-information',
            weight: 30,
            steps: [
              {
                action: 'View clinic information',
                endpoint: '/clinics/{clinicId}',
                method: 'GET',
                expectedResponseTime: 1200,
                critical: false
              },
              {
                action: 'Get clinic contact information',
                endpoint: '/api/clinics/{clinicId}/contact',
                method: 'GET',
                expectedResponseTime: 600,
                critical: false
              }
            ]
          }
        ]
      },
      {
        name: 'emergency-contact-system',
        description: 'Emergency contact system under load',
        concurrentUsers: 100,
        duration: '5m',
        workflows: [
          {
            name: 'emergency-contact',
            weight: 100,
            steps: [
              {
                action: 'Emergency contact request',
                endpoint: '/api/emergency/contact',
                method: 'POST',
                expectedResponseTime: 300,
                critical: true
              },
              {
                action: 'Emergency response dispatch',
                endpoint: '/api/emergency/dispatch',
                method: 'POST',
                expectedResponseTime: 200,
                critical: true
              },
              {
                action: 'Emergency confirmation',
                endpoint: '/emergency/confirmation',
                method: 'GET',
                expectedResponseTime: 400,
                critical: true
              }
            ]
          }
        ]
      },
      {
        name: 'healthier-sg-enrollment',
        description: 'Healthier SG program enrollment peak',
        concurrentUsers: 150,
        duration: '8m',
        workflows: [
          {
            name: 'healthier-sg-enrollment',
            weight: 100,
            steps: [
              {
                action: 'Navigate to Healthier SG',
                endpoint: '/healthier-sg',
                method: 'GET',
                expectedResponseTime: 1200,
                critical: false
              },
              {
                action: 'Check eligibility',
                endpoint: '/api/healthier-sg/eligibility',
                method: 'POST',
                expectedResponseTime: 800,
                critical: false
              },
              {
                action: 'Submit enrollment',
                endpoint: '/api/healthier-sg/enroll',
                method: 'POST',
                expectedResponseTime: 1500,
                critical: false
              },
              {
                action: 'Receive enrollment confirmation',
                endpoint: '/healthier-sg/confirmation',
                method: 'GET',
                expectedResponseTime: 1000,
                critical: false
              }
            ]
          }
        ]
      }
    ]
  }

  private getProductionScenarios(): HealthcareLoadTestScenario[] {
    return [
      {
        name: 'emergency-crisis-scenario',
        description: 'Emergency clinic search during crisis (500+ concurrent users)',
        concurrentUsers: 500,
        duration: '15m',
        peakUsage: {
          description: 'Emergency surge during health crisis',
          userMultiplier: 3,
          duration: '5m'
        },
        workflows: [
          {
            name: 'emergency-clinic-search',
            weight: 60,
            steps: [
              {
                action: 'Emergency clinic search',
                endpoint: '/api/emergency/clinics/search',
                method: 'GET',
                expectedResponseTime: 200,
                critical: true
              },
              {
                action: 'Real-time availability check',
                endpoint: '/api/emergency/availability',
                method: 'GET',
                expectedResponseTime: 100,
                critical: true
              },
              {
                action: 'Emergency contact',
                endpoint: '/api/emergency/contact',
                method: 'POST',
                expectedResponseTime: 300,
                critical: true
              },
              {
                action: 'Get emergency directions',
                endpoint: '/api/emergency/directions',
                method: 'GET',
                expectedResponseTime: 500,
                critical: true
              }
            ]
          },
          {
            name: 'urgent-care-booking',
            weight: 40,
            steps: [
              {
                action: 'Urgent care search',
                endpoint: '/api/urgent-care/search',
                method: 'GET',
                expectedResponseTime: 300,
                critical: true
              },
              {
                action: 'Book urgent appointment',
                endpoint: '/api/appointments/urgent',
                method: 'POST',
                expectedResponseTime: 500,
                critical: true
              }
            ]
          }
        ]
      },
      {
        name: 'flu-season-appointments',
        description: 'Doctor appointment booking during flu season (300+ concurrent users)',
        concurrentUsers: 300,
        duration: '20m',
        workflows: [
          {
            name: 'flu-season-booking',
            weight: 80,
            steps: [
              {
                action: 'Navigate to flu vaccination booking',
                endpoint: '/appointments/flu-vaccination',
                method: 'GET',
                expectedResponseTime: 1200,
                critical: true
              },
              {
                action: 'Check vaccination availability',
                endpoint: '/api/vaccinations/availability',
                method: 'GET',
                expectedResponseTime: 800,
                critical: true
              },
              {
                action: 'Book flu vaccination',
                endpoint: '/api/vaccinations/book',
                method: 'POST',
                expectedResponseTime: 1000,
                critical: true
              },
              {
                action: 'Receive booking confirmation',
                endpoint: '/appointments/confirmation',
                method: 'GET',
                expectedResponseTime: 600,
                critical: true
              }
            ]
          },
          {
            name: 'general-consultation',
            weight: 20,
            steps: [
              {
                action: 'Book general consultation',
                endpoint: '/api/appointments/consultation',
                method: 'POST',
                expectedResponseTime: 1200,
                critical: false
              }
            ]
          }
        ]
      },
      {
        name: 'healthier-sg-peak-enrollment',
        description: 'Healthier SG program enrollment peak usage (200+ concurrent users)',
        concurrentUsers: 200,
        duration: '25m',
        workflows: [
          {
            name: 'healthier-sg-enrollment',
            weight: 100,
            steps: [
              {
                action: 'Access Healthier SG portal',
                endpoint: '/healthier-sg/portal',
                method: 'GET',
                expectedResponseTime: 1000,
                critical: false
              },
              {
                action: 'Verify participant eligibility',
                endpoint: '/api/healthier-sg/verify',
                method: 'POST',
                expectedResponseTime: 800,
                critical: false
              },
              {
                action: 'Submit enrollment application',
                endpoint: '/api/healthier-sg/apply',
                method: 'POST',
                expectedResponseTime: 1500,
                critical: false
              },
              {
                action: 'Receive enrollment confirmation',
                endpoint: '/healthier-sg/confirmation',
                method: 'GET',
                expectedResponseTime: 1000,
                critical: false
              },
              {
                action: 'Access program dashboard',
                endpoint: '/healthier-sg/dashboard',
                method: 'GET',
                expectedResponseTime: 1200,
                critical: false
              }
            ]
          }
        ]
      },
      {
        name: 'medical-data-processing',
        description: 'Medical data processing for bulk clinic updates',
        concurrentUsers: 100,
        duration: '30m',
        workflows: [
          {
            name: 'bulk-data-update',
            weight: 100,
            steps: [
              {
                action: 'Initiate bulk clinic update',
                endpoint: '/api/admin/bulk-update',
                method: 'POST',
                expectedResponseTime: 2000,
                critical: false
              },
              {
                action: 'Process clinic data in batches',
                endpoint: '/api/admin/bulk-process',
                method: 'POST',
                expectedResponseTime: 3000,
                critical: false
              },
              {
                action: 'Get update status',
                endpoint: '/api/admin/bulk-status',
                method: 'GET',
                expectedResponseTime: 500,
                critical: false
              }
            ]
          }
        ]
      }
    ]
  }

  private getStressTestScenarios(): HealthcareLoadTestScenario[] {
    return [
      {
        name: 'maximum-capacity-test',
        description: 'Test system at maximum capacity',
        concurrentUsers: 5000,
        duration: '45m',
        workflows: [
          {
            name: 'mixed-workflows',
            weight: 100,
            steps: [
              {
                action: 'Random healthcare workflow',
                endpoint: '/api/{workflow}',
                method: 'GET',
                expectedResponseTime: 5000,
                critical: false
              }
            ]
          }
        ]
      },
      {
        name: 'breaking-point-test',
        description: 'Identify system breaking point',
        concurrentUsers: 10000,
        duration: '30m',
        workflows: [
          {
            name: 'simple-endpoint-test',
            weight: 100,
            steps: [
              {
                action: 'Ping health check',
                endpoint: '/api/health',
                method: 'GET',
                expectedResponseTime: 10000,
                critical: false
              }
            ]
          }
        ]
      }
    ]
  }

  /**
   * Get all test environments
   */
  getEnvironments(): HealthcareLoadTestEnvironment[] {
    return this.environments
  }

  /**
   * Get specific environment by name
   */
  getEnvironment(name: string): HealthcareLoadTestEnvironment | undefined {
    return this.environments.find(env => env.name === name)
  }

  /**
   * Generate k6 script for specific scenario
   */
  generateK6Script(environment: string, scenarioName: string): string {
    const env = this.getEnvironment(environment)
    if (!env) {
      throw new Error(`Environment ${environment} not found`)
    }

    const scenario = env.scenarios.find(s => s.name === scenarioName)
    if (!scenario) {
      throw new Error(`Scenario ${scenarioName} not found in environment ${environment}`)
    }

    return this.createK6Script(env, scenario)
  }

  private createK6Script(env: HealthcareLoadTestEnvironment, scenario: HealthcareLoadTestScenario): string {
    const k6Script = `
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { SharedArray } from 'k6/data';

// Custom metrics for healthcare workflows
const appointmentBookingSuccess = new Rate('appointment_booking_success');
const emergencyContactSuccess = new Rate('emergency_contact_success');
const doctorSearchSuccess = new Rate('doctor_search_success');
const clinicDiscoverySuccess = new Rate('clinic_discovery_success');
const healthcareWorkflowErrors = new Counter('healthcare_workflow_errors');

// Performance trends
const appointmentBookingTime = new Trend('appointment_booking_time');
const emergencyResponseTime = new Trend('emergency_response_time');
const doctorSearchTime = new Trend('doctor_search_time');
const clinicDiscoveryTime = new Trend('clinic_discovery_time');

// Load test configuration
export const options = {
  stages: [
    { duration: '2m', target: ${scenario.concurrentUsers * 0.5} }, // Ramp up
    { duration: '${scenario.duration}', target: ${scenario.concurrentUsers} }, // Sustained load
    ${scenario.peakUsage ? 
      `{ duration: '${scenario.peakUsage.duration}', target: ${scenario.concurrentUsers * scenario.peakUsage.userMultiplier} },` : 
      ''
    }
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<${env.thresholds.responseTime.standard}', 'p(99)<${env.thresholds.responseTime.standard * 2}'],
    http_req_failed: ['rate<${env.thresholds.errorRate.standard / 100}'],
    appointment_booking_success: ['rate>${1 - (env.thresholds.errorRate.important / 100)}'],
    emergency_contact_success: ['rate>${1 - (env.thresholds.errorRate.critical / 100)}'],
    doctor_search_success: ['rate>0.98'],
    clinic_discovery_success: ['rate>0.97'],
  },
};

// Healthcare test data
const patientProfiles = new SharedArray('patient_profiles', function() {
  return [
    ${this.generatePatientTestData()}
  ];
});

const doctorProfiles = new SharedArray('doctor_profiles', function() {
  return [
    ${this.generateDoctorTestData()}
  ];
});

const clinicData = new SharedArray('clinic_data', function() {
  return [
    ${this.generateClinicTestData()}
  ];
});

// Main test function
export default function() {
  const baseUrl = '${env.baseUrl}';
  const userData = patientProfiles[Math.floor(Math.random() * patientProfiles.length)];
  
  // Weighted workflow selection
  const workflowSelection = Math.random() * 100;
  ${scenario.workflows.map((workflow, index) => `
  if (workflowSelection <= ${scenario.workflows.slice(0, index + 1).reduce((sum, w) => sum + w.weight, 0)}) {
    ${workflow.name}Workflow(baseUrl, userData);
  }
  `).join('')}
  
  // Think time to simulate realistic user behavior
  sleep(Math.random() * 3 + 1); // 1-4 seconds
}

${this.generateWorkflowFunctions(scenario.workflows, env)}

// Setup function
export function setup() {
  console.log('Setting up healthcare load test: ${scenario.name}');
  console.log('Environment: ${env.name}');
  console.log('Concurrent Users: ${scenario.concurrentUsers}');
  console.log('Duration: ${scenario.duration}');
  
  return {
    environment: '${env.name}',
    scenario: '${scenario.name}',
    baseUrl: '${env.baseUrl}',
    totalUsers: ${scenario.concurrentUsers},
    patientProfiles: patientProfiles.length,
    doctorProfiles: doctorProfiles.length,
    clinicData: clinicData.length,
  };
}

// Teardown function
export function teardown(data) {
  console.log('Healthcare load test completed');
  console.log('Environment:', data.environment);
  console.log('Scenario:', data.scenario);
  console.log('Total Users:', data.totalUsers);
  
  return {
    environment: data.environment,
    scenario: data.scenario,
    testDate: new Date().toISOString(),
    patientProfiles: data.patientProfiles,
    doctorProfiles: data.doctorProfiles,
    clinicData: data.clinicData,
  };
}
    `

    return k6Script.trim()
  }

  private generatePatientTestData(): string {
    return `
    { patientId: 'P001', age: 35, language: 'en', medicalHistory: 'diabetes', postalCode: '018956' },
    { patientId: 'P002', age: 28, language: 'zh', medicalHistory: 'hypertension', postalCode: '049145' },
    { patientId: 'P003', age: 45, language: 'ms', medicalHistory: 'asthma', postalCode: '129888' },
    { patientId: 'P004', age: 52, language: 'ta', medicalHistory: 'arthritis', postalCode: '138567' },
    { patientId: 'P005', age: 31, language: 'en', medicalHistory: 'pregnancy', postalCode: '018956' },
    { patientId: 'P006', age: 42, language: 'zh', medicalHistory: 'hypertension', postalCode: '049145' },
    { patientId: 'P007', age: 29, language: 'ms', medicalHistory: 'none', postalCode: '129888' },
    { patientId: 'P008', age: 55, language: 'ta', medicalHistory: 'diabetes', postalCode: '138567' },
    { patientId: 'P009', age: 38, language: 'en', medicalHistory: 'asthma', postalCode: '018956' },
    { patientId: 'P010', age: 33, language: 'zh', medicalHistory: 'none', postalCode: '049145' },`
  }

  private generateDoctorTestData(): string {
    return `
    { id: 'D001', name: 'Dr. Sarah Lim', specialization: 'General Practice', location: 'central', availability: true, rating: 4.8 },
    { id: 'D002', name: 'Dr. Michael Wong', specialization: 'Cardiology', location: 'north', availability: true, rating: 4.9 },
    { id: 'D003', name: 'Dr. Priya Sharma', specialization: 'Dermatology', location: 'east', availability: true, rating: 4.7 },
    { id: 'D004', name: 'Dr. James Tan', specialization: 'Pediatrics', location: 'west', availability: false, rating: 4.6 },
    { id: 'D005', name: 'Dr. Li Wei', specialization: 'Orthopedics', location: 'central', availability: true, rating: 4.8 },`
  }

  private generateClinicTestData(): string {
    return `
    { id: 'C001', name: 'Central Medical Clinic', postalCode: '018956', type: 'general', services: ['consultation', 'vaccination'], phone: '+65-6123-4567' },
    { id: 'C002', name: 'North Heart Centre', postalCode: '049145', type: 'specialist', services: ['cardiology', 'ecg'], phone: '+65-6234-5678' },
    { id: 'C003', name: 'East Family Clinic', postalCode: '129888', type: 'general', services: ['consultation', 'lab-tests'], phone: '+65-6345-6789' },
    { id: 'C004', name: 'West Emergency Centre', postalCode: '138567', type: 'emergency', services: ['emergency', 'trauma'], phone: '+65-6456-7890' },
    { id: 'C005', name: 'Central Family Health', postalCode: '018956', type: 'family', services: ['consultation', 'pediatrics'], phone: '+65-6567-8901' },`
  }

  private generateWorkflowFunctions(workflows: any[], env: HealthcareLoadTestEnvironment): string {
    return workflows.map(workflow => `
// ${workflow.name} workflow
function ${workflow.name}Workflow(baseUrl, userData) {
  const startTime = Date.now();
  let success = true;

  ${workflow.steps.map((step, stepIndex) => `
  try {
    // Step ${stepIndex + 1}: ${step.action}
    const response${stepIndex} = http.${step.method.toLowerCase()}(\`\${baseUrl}${step.endpoint}\`${step.method === 'POST' ? `, JSON.stringify(${this.generatePayloadForStep(workflow.name, stepIndex)}), { headers: { 'Content-Type': 'application/json' } }` : ''});
    
    const check${stepIndex} = check(response${stepIndex}, {
      '${step.action.toLowerCase()} status is 200': (r) => r.status === 200,
      '${step.action.toLowerCase()} response time < ${step.expectedResponseTime}ms': (r) => r.timings.duration < ${step.expectedResponseTime},
    });
    
    if (!check${stepIndex}) {
      success = false;
      healthcareWorkflowErrors.add(1);
    }
    
    sleep(Math.random() * 2 + 1); // 1-3 seconds between steps
    
  } catch (error) {
    console.error('Error in ${step.action}:', error);
    success = false;
    healthcareWorkflowErrors.add(1);
  }
  `).join('')}

  const endTime = Date.now();
  const totalTime = endTime - startTime;

  // Update success metrics
  ${workflow.name === 'appointment-booking' ? 'appointmentBookingSuccess.add(success);' : 
    workflow.name === 'emergency-contact' ? 'emergencyContactSuccess.add(success);' :
    workflow.name === 'doctor-search' ? 'doctorSearchSuccess.add(success);' :
    workflow.name === 'clinic-discovery' ? 'clinicDiscoverySuccess.add(success);' : ''}

  // Update timing metrics
  ${workflow.name === 'appointment-booking' ? 'appointmentBookingTime.add(totalTime);' :
    workflow.name === 'emergency-contact' ? 'emergencyResponseTime.add(totalTime);' :
    workflow.name === 'doctor-search' ? 'doctorSearchTime.add(totalTime);' :
    workflow.name === 'clinic-discovery' ? 'clinicDiscoveryTime.add(totalTime);' : ''}
}
    `).join('\n\n')
  }

  private generatePayloadForStep(workflowName: string, stepIndex: number): string {
    const payloads = {
      'appointment-booking': [
        '{ patientId: userData.patientId, serviceType: "consultation" }',
        '{ date: "2024-01-15", time: "10:00" }',
        '{ doctorId: "D001", clinicId: "C001", notes: "Regular checkup" }',
        '{ confirm: true, patientInfo: userData }'
      ],
      'emergency-contact': [
        '{ urgency: "critical", symptoms: "chest pain", patientId: userData.patientId }',
        '{ action: "dispatch", nearestClinic: "C004" }',
        '{ confirmed: true }'
      ],
      'healthier-sg-enrollment': [
        '{ participantId: userData.patientId, language: userData.language }',
        '{ eligibilityStatus: "eligible", medicalHistory: userData.medicalHistory }',
        '{ enrollmentData: { goals: ["health-improvement"], preferences: userData } }',
        '{ confirmEnrollment: true }'
      ]
    }

    const workflowPayloads = payloads[workflowName as keyof typeof payloads]
    return workflowPayloads ? workflowPayloads[stepIndex] || '{}' : '{}'
  }

  /**
   * Get performance benchmarks for healthcare scenarios
   */
  getPerformanceBenchmarks(): Record<string, any> {
    return {
      'Emergency Services': {
        description: 'Critical emergency response workflows',
        responseTime: { critical: 500, warning: 1000 },
        errorRate: { critical: 0.05, warning: 0.1 },
        concurrentUsers: { warning: 1000, critical: 5000 }
      },
      'Appointment Booking': {
        description: 'Healthcare appointment scheduling',
        responseTime: { critical: 1000, warning: 2000 },
        errorRate: { critical: 0.1, warning: 0.5 },
        concurrentUsers: { warning: 500, critical: 2000 }
      },
      'Doctor Search': {
        description: 'Healthcare provider discovery',
        responseTime: { critical: 800, warning: 1500 },
        errorRate: { critical: 0.05, warning: 0.2 },
        concurrentUsers: { warning: 800, critical: 3000 }
      },
      'Clinic Discovery': {
        description: 'Healthcare facility location services',
        responseTime: { critical: 1200, warning: 2500 },
        errorRate: { critical: 0.1, warning: 0.3 },
        concurrentUsers: { warning: 600, critical: 2500 }
      },
      'Healthier SG Enrollment': {
        description: 'Government health program enrollment',
        responseTime: { critical: 1500, warning: 3000 },
        errorRate: { critical: 0.2, warning: 0.5 },
        concurrentUsers: { warning: 300, critical: 1000 }
      }
    }
  }
}

export { HealthcareLoadTestScenarios }
export type { HealthcareLoadTestScenario, HealthcareLoadTestEnvironment }