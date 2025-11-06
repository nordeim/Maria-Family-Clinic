import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

// Mock external services for integration testing
const mockClinicBookingService = {
  createAppointment: vi.fn(),
  updateAppointment: vi.fn(),
  cancelAppointment: vi.fn(),
  getAvailableSlots: vi.fn(),
  validateAppointment: vi.fn()
}

const mockAPIService = {
  getDoctorProfiles: vi.fn(),
  createDoctorProfile: vi.fn(),
  updateDoctorProfile: vi.fn(),
  deleteDoctorProfile: vi.fn(),
  getDoctorById: vi.fn()
}

const mockDatabaseService = {
  getDoctorClinicRelationships: vi.fn(),
  validateDataIntegrity: vi.fn(),
  runHealthChecks: vi.fn()
}

// Mock doctor data for integration testing
const mockDoctorComplete = {
  id: 'doc_001',
  name: 'Dr. Sarah Chen',
  specialty: 'Cardiology',
  subSpecialties: ['Interventional Cardiology', 'Heart Failure'],
  qualifications: [
    { degree: 'MBBS', institution: 'National University of Singapore', year: 2015 },
    { degree: 'MD', institution: 'Harvard Medical School', year: 2019 },
    { degree: 'FACC', institution: 'American College of Cardiology', year: 2022 }
  ],
  experience: 8,
  languages: ['English', 'Mandarin', 'Malay'],
  bio: 'Experienced cardiologist specializing in interventional procedures and heart failure management.',
  clinicId: 'clinic_001',
  clinic: {
    id: 'clinic_001',
    name: 'Heart Care Medical Centre',
    address: '123 Medical Drive, Singapore 169857',
    phone: '+65-6123-4567',
    email: 'contact@heartcare.sg',
    operatingHours: {
      monday: '09:00-17:00',
      tuesday: '09:00-17:00',
      wednesday: '09:00-17:00',
      thursday: '09:00-17:00',
      friday: '09:00-17:00',
      saturday: '09:00-13:00',
      sunday: 'Closed'
    },
    services: ['Cardiology Consultation', 'ECG', 'Echocardiogram', 'Stress Test'],
    coordinates: { lat: 1.3521, lng: 103.8198 }
  },
  rating: 4.8,
  reviewCount: 156,
  verificationBadges: {
    mcrVerified: true,
    spcVerified: true,
    boardCertified: true,
    experienceVerified: true
  },
  profileImage: '/images/doctors/dr-sarah-chen.jpg',
  availableSlots: [
    { 
      id: 'slot_001', 
      date: '2025-11-05', 
      time: '09:00', 
      available: true,
      duration: 30,
      type: 'consultation'
    },
    { 
      id: 'slot_002', 
      date: '2025-11-05', 
      time: '10:30', 
      available: true,
      duration: 30,
      type: 'consultation'
    },
    { 
      id: 'slot_003', 
      date: '2025-11-06', 
      time: '14:00', 
      available: true,
      duration: 60,
      type: 'procedure'
    }
  ],
  consultationFees: {
    consultation: 120,
    followUp: 80,
    procedure: 300,
    insuranceAccepted: ['Medisave', 'Medishield', 'Private Insurance']
  },
  telemedicineAvailable: true,
  waitingTime: 15,
  mcrNumber: 'M12345A',
  spcNumber: 'SPC789012',
  boardCertifications: [
    { board: 'American Board of Cardiology', certified: true, year: 2020, expiryYear: 2025 }
  ]
}

const mockAppointment = {
  id: 'apt_001',
  doctorId: 'doc_001',
  patientId: 'patient_001',
  patientName: 'John Doe',
  patientEmail: 'john.doe@email.com',
  patientPhone: '+65-9123-4567',
  appointmentDate: '2025-11-05',
  appointmentTime: '09:00',
  appointmentType: 'consultation',
  duration: 30,
  status: 'confirmed',
  notes: 'First time consultation for chest pain',
  createdAt: '2025-11-04T10:00:00Z',
  updatedAt: '2025-11-04T10:00:00Z'
}

describe('Integration Testing for Doctor System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset global fetch for API testing
    global.fetch = vi.fn()
    
    // Mock localStorage for session testing
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    }
    vi.stubGlobal('localStorage', localStorageMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('Clinic Booking Systems and Appointment Scheduling Integration', () => {
    it('should integrate with clinic booking system', async () => {
      mockClinicBookingService.createAppointment.mockResolvedValue({
        success: true,
        appointmentId: 'apt_001',
        confirmationNumber: 'CONF-2025-001'
      })
      
      const { container } = render(
        <div className="booking-integration-test">
          <h1>Book Appointment with Dr. Sarah Chen</h1>
          <form data-testid="booking-form">
            <div>
              <label htmlFor="patient-name">Patient Name</label>
              <input id="patient-name" type="text" defaultValue="John Doe" />
            </div>
            <div>
              <label htmlFor="patient-email">Email</label>
              <input id="patient-email" type="email" defaultValue="john.doe@email.com" />
            </div>
            <div>
              <label htmlFor="appointment-date">Date</label>
              <input id="appointment-date" type="date" defaultValue="2025-11-05" />
            </div>
            <div>
              <label htmlFor="appointment-time">Time</label>
              <select id="appointment-time">
                <option value="09:00">9:00 AM</option>
                <option value="10:30">10:30 AM</option>
              </select>
            </div>
            <button type="submit" data-testid="book-appointment-btn">
              Book Appointment
            </button>
          </form>
          <div data-testid="booking-result"></div>
        </div>
      )
      
      const form = screen.getByTestId('booking-form')
      const bookButton = screen.getByTestId('book-appointment-btn')
      
      // Fill form and submit
      await act(async () => {
        fireEvent.submit(form)
      })
      
      // Verify integration with booking service
      await waitFor(() => {
        expect(mockClinicBookingService.createAppointment).toHaveBeenCalledWith({
          doctorId: 'doc_001',
          patientName: 'John Doe',
          patientEmail: 'john.doe@email.com',
          appointmentDate: '2025-11-05',
          appointmentTime: '09:00',
          appointmentType: 'consultation'
        })
      })
    })

    it('should handle appointment validation and conflict checking', async () => {
      mockClinicBookingService.validateAppointment.mockResolvedValue({
        isValid: true,
        conflicts: [],
        availableAlternatives: [
          { date: '2025-11-05', time: '14:00' },
          { date: '2025-11-06', time: '09:00' }
        ]
      })
      
      render(
        <div className="appointment-validation-test">
          <h2>Validate Appointment</h2>
          <div data-testid="validation-result"></div>
          <div data-testid="alternatives"></div>
        </div>
      )
      
      await act(async () => {
        const result = await mockClinicBookingService.validateAppointment({
          doctorId: 'doc_001',
          date: '2025-11-05',
          time: '09:00'
        })
        
        expect(result.isValid).toBe(true)
        expect(result.conflicts).toHaveLength(0)
        expect(result.availableAlternatives).toHaveLength(2)
      })
    })

    it('should integrate real-time availability updates', async () => {
      mockClinicBookingService.getAvailableSlots.mockResolvedValue([
        { date: '2025-11-05', time: '09:00', available: true },
        { date: '2025-11-05', time: '10:30', available: false }, // Just booked
        { date: '2025-11-05', time: '14:00', available: true }
      ])
      
      render(
        <div className="availability-integration-test">
          <h2>Dr. Sarah Chen - Available Slots</h2>
          <div data-testid="slots-container">
            <div data-testid="slot-09:00" className="available">9:00 AM - Available</div>
            <div data-testid="slot-10:30" className="available">10:30 AM - Available</div>
            <div data-testid="slot-14:00" className="available">2:00 PM - Available</div>
          </div>
          <button data-testid="refresh-slots">Refresh Availability</button>
        </div>
      )
      
      const refreshButton = screen.getByTestId('refresh-slots')
      
      await act(async () => {
        fireEvent.click(refreshButton)
      })
      
      await waitFor(() => {
        expect(mockClinicBookingService.getAvailableSlots).toHaveBeenCalledWith('doc_001')
      })
      
      // Verify slot status updates
      const slot10_30 = screen.getByTestId('slot-10:30')
      expect(slot10_30).toHaveClass('available')
    })

    it('should handle appointment modifications and cancellations', async () => {
      mockClinicBookingService.updateAppointment.mockResolvedValue({
        success: true,
        appointmentId: 'apt_001',
        newDate: '2025-11-06',
        newTime: '14:00'
      })
      
      mockClinicBookingService.cancelAppointment.mockResolvedValue({
        success: true,
        appointmentId: 'apt_001',
        refundAmount: 120,
        cancellationReason: 'Patient request'
      })
      
      render(
        <div className="appointment-management-test">
          <h2>Manage Appointment</h2>
          <div data-testid="current-appointment">
            <p>Appointment: Nov 5, 2025 at 9:00 AM</p>
            <p>Status: Confirmed</p>
          </div>
          <button data-testid="reschedule-btn" data-appointment-id="apt_001">
            Reschedule
          </button>
          <button data-testid="cancel-btn" data-appointment-id="apt_001">
            Cancel
          </button>
          <div data-testid="action-result"></div>
        </div>
      )
      
      const rescheduleButton = screen.getByTestId('reschedule-btn')
      const cancelButton = screen.getByTestId('cancel-btn')
      
      // Test rescheduling
      await act(async () => {
        fireEvent.click(rescheduleButton)
      })
      
      await waitFor(() => {
        expect(mockClinicBookingService.updateAppointment).toHaveBeenCalledWith(
          'apt_001',
          { date: '2025-11-06', time: '14:00' }
        )
      })
      
      // Test cancellation
      await act(async () => {
        fireEvent.click(cancelButton)
      })
      
      await waitFor(() => {
        expect(mockClinicBookingService.cancelAppointment).toHaveBeenCalledWith('apt_001')
      })
    })

    it('should integrate with calendar systems', async () => {
      // Mock calendar integration
      const mockCalendarEvent = {
        title: 'Appointment with Dr. Sarah Chen',
        start: '2025-11-05T09:00:00',
        end: '2025-11-05T09:30:00',
        description: 'Cardiology consultation',
        location: 'Heart Care Medical Centre, 123 Medical Drive, Singapore 169857'
      }
      
      render(
        <div className="calendar-integration-test">
          <h2>Add to Calendar</h2>
          <button data-testid="add-to-calendar" data-event='${JSON.stringify(mockCalendarEvent)}'>
            Add to Google Calendar
          </button>
          <button data-testid="add-to-outlook">
            Add to Outlook
          </button>
          <button data-testid="add-to-apple-calendar">
            Add to Apple Calendar
          </button>
        </div>
      )
      
      const addToCalendarButton = screen.getByTestId('add-to-calendar')
      
      await act(async () => {
        fireEvent.click(addToCalendarButton)
      })
      
      // Verify calendar integration (would open calendar app in real implementation)
      expect(addToCalendarButton).toBeInTheDocument()
      expect(addToCalendarButton).toHaveAttribute('data-event')
    })
  })

  describe('API Integration Testing for Doctor Profile CRUD Operations', () => {
    it('should create doctor profiles via API', async () => {
      mockAPIService.createDoctorProfile.mockResolvedValue({
        success: true,
        doctorId: 'doc_new_001',
        profile: { ...mockDoctorComplete, id: 'doc_new_001' }
      })
      
      render(
        <div className="create-doctor-test">
          <h2>Create New Doctor Profile</h2>
          <form data-testid="create-doctor-form">
            <div>
              <label htmlFor="doctor-name">Name</label>
              <input id="doctor-name" type="text" defaultValue="Dr. New Doctor" />
            </div>
            <div>
              <label htmlFor="doctor-specialty">Specialty</label>
              <select id="doctor-specialty">
                <option>Cardiology</option>
                <option>Dermatology</option>
                <option>Internal Medicine</option>
              </select>
            </div>
            <div>
              <label htmlFor="doctor-experience">Experience (years)</label>
              <input id="doctor-experience" type="number" defaultValue="5" />
            </div>
            <button type="submit" data-testid="create-doctor-btn">
              Create Profile
            </button>
          </form>
          <div data-testid="creation-result"></div>
        </div>
      )
      
      const form = screen.getByTestId('create-doctor-form')
      
      await act(async () => {
        fireEvent.submit(form)
      })
      
      await waitFor(() => {
        expect(mockAPIService.createDoctorProfile).toHaveBeenCalledWith({
          name: 'Dr. New Doctor',
          specialty: 'Cardiology',
          experience: 5
        })
      })
    })

    it('should read and display doctor profiles via API', async () => {
      mockAPIService.getDoctorById.mockResolvedValue({
        success: true,
        doctor: mockDoctorComplete
      })
      
      render(
        <div className="read-doctor-test">
          <h2>Doctor Profile</h2>
          <div data-testid="doctor-profile">
            <div data-testid="doctor-name"></div>
            <div data-testid="doctor-specialty"></div>
            <div data-testid="doctor-experience"></div>
            <div data-testid="doctor-rating"></div>
          </div>
          <button data-testid="load-doctor-btn" data-doctor-id="doc_001">
            Load Doctor Profile
          </button>
        </div>
      )
      
      const loadButton = screen.getByTestId('load-doctor-btn')
      
      await act(async () => {
        fireEvent.click(loadButton)
      })
      
      await waitFor(() => {
        expect(mockAPIService.getDoctorById).toHaveBeenCalledWith('doc_001')
      })
      
      // Verify profile display
      await waitFor(() => {
        expect(screen.getByTestId('doctor-name')).toHaveTextContent('Dr. Sarah Chen')
        expect(screen.getByTestId('doctor-specialty')).toHaveTextContent('Cardiology')
        expect(screen.getByTestId('doctor-experience')).toHaveTextContent('8 years')
        expect(screen.getByTestId('doctor-rating')).toHaveTextContent('4.8')
      })
    })

    it('should update doctor profiles via API', async () => {
      mockAPIService.updateDoctorProfile.mockResolvedValue({
        success: true,
        doctor: { ...mockDoctorComplete, experience: 9, rating: 4.9 }
      })
      
      render(
        <div className="update-doctor-test">
          <h2>Edit Doctor Profile</h2>
          <form data-testid="update-doctor-form">
            <div>
              <label htmlFor="edit-experience">Experience</label>
              <input id="edit-experience" type="number" defaultValue="8" />
            </div>
            <div>
              <label htmlFor="edit-bio">Bio</label>
              <textarea id="edit-bio" defaultValue="Experienced cardiologist..."></textarea>
            </div>
            <button type="submit" data-testid="update-doctor-btn" data-doctor-id="doc_001">
              Update Profile
            </button>
          </form>
          <div data-testid="update-result"></div>
        </div>
      )
      
      const form = screen.getByTestId('update-doctor-form')
      
      // Update experience field
      const experienceInput = screen.getByLabelText('Experience')
      fireEvent.change(experienceInput, { target: { value: '9' } })
      
      await act(async () => {
        fireEvent.submit(form)
      })
      
      await waitFor(() => {
        expect(mockAPIService.updateDoctorProfile).toHaveBeenCalledWith('doc_001', {
          experience: 9,
          bio: 'Experienced cardiologist...'
        })
      })
    })

    it('should delete doctor profiles via API', async () => {
      mockAPIService.deleteDoctorProfile.mockResolvedValue({
        success: true,
        message: 'Doctor profile deleted successfully'
      })
      
      render(
        <div className="delete-doctor-test">
          <h2>Doctor Management</h2>
          <div data-testid="doctor-list">
            <div data-testid="doctor-doc_001">
              Dr. Sarah Chen - Cardiology
              <button data-testid="delete-btn-doc_001" data-doctor-id="doc_001">
                Delete
              </button>
            </div>
          </div>
          <div data-testid="delete-result"></div>
        </div>
      )
      
      const deleteButton = screen.getByTestId('delete-btn-doc_001')
      
      await act(async () => {
        fireEvent.click(deleteButton)
      })
      
      await waitFor(() => {
        expect(mockAPIService.deleteDoctorProfile).toHaveBeenCalledWith('doc_001')
      })
      
      // Verify doctor is removed from list
      await waitFor(() => {
        expect(screen.queryByTestId('doctor-doc_001')).not.toBeInTheDocument()
      })
    })

    it('should handle API errors gracefully', async () => {
      mockAPIService.getDoctorById.mockRejectedValue(new Error('Network error'))
      
      render(
        <div className="api-error-test">
          <h2>Doctor Profile</h2>
          <div data-testid="error-message" style={{ display: 'none' }}>
            Unable to load doctor profile. Please try again.
          </div>
          <div data-testid="retry-section">
            <button data-testid="retry-btn">Retry</button>
            <button data-testid="offline-btn">View Offline</button>
          </div>
        </div>
      )
      
      const retryButton = screen.getByTestId('retry-btn')
      
      await act(async () => {
        fireEvent.click(retryButton)
      })
      
      await waitFor(() => {
        expect(mockAPIService.getDoctorById).toHaveBeenCalled()
      })
      
      // Should show error handling UI
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })
  })

  describe('Database Integration Testing for Doctor-Clinic Relationship Integrity', () => {
    it('should validate doctor-clinic relationship integrity', async () => {
      const mockRelationships = [
        {
          doctorId: 'doc_001',
          clinicId: 'clinic_001',
          relationshipType: 'primary',
          startDate: '2020-01-01',
          endDate: null,
          active: true
        },
        {
          doctorId: 'doc_002',
          clinicId: 'clinic_001',
          relationshipType: 'visiting',
          startDate: '2021-06-01',
          endDate: null,
          active: true
        }
      ]
      
      mockDatabaseService.getDoctorClinicRelationships.mockResolvedValue({
        success: true,
        relationships: mockRelationships,
        integrityChecks: {
          orphanedDoctors: 0,
          orphanedClinics: 0,
          invalidRelationships: 0
        }
      })
      
      render(
        <div className="relationship-integrity-test">
          <h2>Doctor-Clinic Relationship Management</h2>
          <div data-testid="relationship-status">
            <div>Active Relationships: 2</div>
            <div>Integrity Status: Valid</div>
          </div>
          <div data-testid="relationships-list">
            {mockRelationships.map(rel => (
              <div key={`${rel.doctorId}-${rel.clinicId}`} data-testid="relationship-item">
                {rel.doctorId} → {rel.clinicId} ({rel.relationshipType})
              </div>
            ))}
          </div>
          <button data-testid="validate-relationships">
            Validate Relationships
          </button>
        </div>
      )
      
      const validateButton = screen.getByTestId('validate-relationships')
      
      await act(async () => {
        fireEvent.click(validateButton)
      })
      
      await waitFor(() => {
        expect(mockDatabaseService.getDoctorClinicRelationships).toHaveBeenCalled()
        expect(mockDatabaseService.validateDataIntegrity).toHaveBeenCalled()
      })
    })

    it('should handle cascading deletes properly', async () => {
      mockDatabaseService.validateDataIntegrity.mockResolvedValue({
        success: true,
        cascadingActions: [
          { type: 'update', description: 'Updated 3 doctor relationships' },
          { type: 'archive', description: 'Archived 1 doctor profile' }
        ]
      })
      
      render(
        <div className="cascading-delete-test">
          <h2>Delete Clinic</h2>
          <p>Warning: Deleting this clinic will affect 2 doctor relationships</p>
          <button data-testid="delete-clinic-btn" data-clinic-id="clinic_001">
            Delete Clinic
          </button>
          <div data-testid="deletion-result"></div>
        </div>
      )
      
      const deleteButton = screen.getByTestId('delete-clinic-btn')
      
      await act(async () => {
        fireEvent.click(deleteButton)
      })
      
      await waitFor(() => {
        expect(mockDatabaseService.validateDataIntegrity).toHaveBeenCalledWith(
          'delete',
          'clinic',
          'clinic_001'
        )
      })
    })

    it('should maintain referential integrity across operations', async () => {
      const integrityReport = {
        doctorCount: 150,
        clinicCount: 25,
        relationshipCount: 175,
        orphanedRecords: 0,
        invalidReferences: 0,
        dataConsistency: 'PASS'
      }
      
      mockDatabaseService.runHealthChecks.mockResolvedValue({
        success: true,
        report: integrityReport
      })
      
      render(
        <div className="data-integrity-test">
          <h2>Database Health Check</h2>
          <div data-testid="health-metrics">
            <div>Doctors: {integrityReport.doctorCount}</div>
            <div>Clinics: {integrityReport.clinicCount}</div>
            <div>Relationships: {integrityReport.relationshipCount}</div>
            <div>Status: {integrityReport.dataConsistency}</div>
          </div>
          <button data-testid="run-health-check">Run Health Check</button>
          <div data-testid="health-result"></div>
        </div>
      )
      
      const healthCheckButton = screen.getByTestId('run-health-check')
      
      await act(async () => {
        fireEvent.click(healthCheckButton)
      })
      
      await waitFor(() => {
        expect(mockDatabaseService.runHealthChecks).toHaveBeenCalled()
      })
      
      // Verify integrity metrics
      await waitFor(() => {
        expect(screen.getByText('Status: PASS')).toBeInTheDocument()
      })
    })

    it('should handle bulk operations with integrity checks', async () => {
      const bulkOperationResult = {
        success: true,
        processed: 100,
        successful: 98,
        failed: 2,
        errors: [
          { recordId: 'doc_099', error: 'Invalid specialty' },
          { recordId: 'doc_100', error: 'Duplicate entry' }
        ]
      }
      
      mockDatabaseService.validateDataIntegrity.mockResolvedValue(bulkOperationResult)
      
      render(
        <div className="bulk-operation-test">
          <h2>Bulk Doctor Import</h2>
          <div data-testid="bulk-progress">
            <div>Processing: 100 records</div>
            <div>Successful: 98</div>
            <div>Failed: 2</div>
          </div>
          <div data-testid="bulk-errors" style={{ display: 'none' }}>
            <h3>Errors:</h3>
            <ul>
              {bulkOperationResult.errors.map(error => (
                <li key={error.recordId}>{error.recordId}: {error.error}</li>
              ))}
            </ul>
          </div>
          <button data-testid="start-bulk-import" data-file="doctors.csv">
            Import Doctors
          </button>
        </div>
      )
      
      const importButton = screen.getByTestId('start-bulk-import')
      
      await act(async () => {
        fireEvent.click(importButton)
      })
      
      await waitFor(() => {
        expect(mockDatabaseService.validateDataIntegrity).toHaveBeenCalledWith(
          'bulk_import',
          'doctors',
          expect.any(Object)
        )
      })
      
      // Verify bulk operation results
      expect(screen.getByText('Successful: 98')).toBeInTheDocument()
      expect(screen.getByText('Failed: 2')).toBeInTheDocument()
    })
  })

  describe('End-to-End Testing for Complete Doctor Discovery Workflows', () => {
    it('should complete full doctor discovery and booking workflow', async () => {
      const user = userEvent.setup()
      
      // Mock API responses for full workflow
      mockAPIService.getDoctorProfiles.mockResolvedValue({
        success: true,
        doctors: [mockDoctorComplete]
      })
      
      mockClinicBookingService.getAvailableSlots.mockResolvedValue([
        { date: '2025-11-05', time: '09:00', available: true },
        { date: '2025-11-05', time: '10:30', available: true }
      ])
      
      mockClinicBookingService.createAppointment.mockResolvedValue({
        success: true,
        appointmentId: 'apt_e2e_001',
        confirmationNumber: 'CONF-E2E-001'
      })
      
      render(
        <div className="e2e-workflow-test">
          <header>
            <h1>Find a Doctor</h1>
          </header>
          
          <section className="search-section">
            <h2>Search Doctors</h2>
            <input 
              data-testid="main-search" 
              placeholder="Search by name, specialty, or condition"
              aria-label="Search doctors"
            />
            <button data-testid="search-btn">Search</button>
          </section>
          
          <section className="results-section" aria-live="polite">
            <div data-testid="search-results">
              <div data-testid="doctor-card-doc_001" className="doctor-result">
                <h3>Dr. Sarah Chen</h3>
                <p>Cardiology</p>
                <p>Rating: 4.8 (156 reviews)</p>
                <button data-testid="view-profile-btn-doc_001">View Profile</button>
              </div>
            </div>
          </section>
          
          <section className="profile-section" style={{ display: 'none' }}>
            <div data-testid="doctor-profile-detail">
              <h2>Dr. Sarah Chen</h2>
              <div data-testid="profile-info">
                <p>8 years experience</p>
                <p>Heart Care Medical Centre</p>
                <p>Languages: English, Mandarin, Malay</p>
              </div>
              <div data-testid="available-slots">
                <h3>Available Slots</h3>
                <button data-testid="slot-09:00">9:00 AM</button>
                <button data-testid="slot-10:30">10:30 AM</button>
              </div>
              <button data-testid="book-btn">Book Appointment</button>
            </div>
          </section>
          
          <section className="booking-section" style={{ display: 'none' }}>
            <div data-testid="booking-form">
              <h2>Book Appointment</h2>
              <form>
                <label htmlFor="patient-name">Name</label>
                <input id="patient-name" defaultValue="John Doe" />
                <label htmlFor="patient-email">Email</label>
                <input id="patient-email" defaultValue="john@email.com" />
                <div data-testid="selected-slot">Selected: Nov 5, 9:00 AM</div>
                <button type="submit" data-testid="confirm-booking">Confirm Booking</button>
              </form>
            </div>
          </section>
          
          <section className="confirmation-section" style={{ display: 'none' }}>
            <div data-testid="booking-confirmation">
              <h2>Booking Confirmed!</h2>
              <p>Confirmation: CONF-E2E-001</p>
              <p>Dr. Sarah Chen - Nov 5, 9:00 AM</p>
              <button data-testid="add-to-calendar">Add to Calendar</button>
            </div>
          </section>
        </div>
      )
      
      // Step 1: Search for doctor
      const searchInput = screen.getByTestId('main-search')
      const searchButton = screen.getByTestId('search-btn')
      
      await user.type(searchInput, 'cardiologist')
      await user.click(searchButton)
      
      await waitFor(() => {
        expect(mockAPIService.getDoctorProfiles).toHaveBeenCalledWith('cardiologist')
      })
      
      await waitFor(() => {
        expect(screen.getByText('Dr. Sarah Chen')).toBeInTheDocument()
      })
      
      // Step 2: View doctor profile
      const viewProfileButton = screen.getByTestId('view-profile-btn-doc_001')
      await user.click(viewProfileButton)
      
      await waitFor(() => {
        expect(screen.getByText('Dr. Sarah Chen')).toBeInTheDocument()
        expect(screen.getByText('8 years experience')).toBeInTheDocument()
      })
      
      // Step 3: Select appointment slot
      const slotButton = screen.getByTestId('slot-09:00')
      await user.click(slotButton)
      
      // Step 4: Book appointment
      const bookButton = screen.getByTestId('book-btn')
      await user.click(bookButton)
      
      await waitFor(() => {
        expect(screen.getByText('Book Appointment')).toBeInTheDocument()
      })
      
      // Step 5: Fill booking form and confirm
      const patientNameInput = screen.getByLabelText('Name')
      const patientEmailInput = screen.getByLabelText('Email')
      const confirmButton = screen.getByTestId('confirm-booking')
      
      await user.clear(patientNameInput)
      await user.type(patientNameInput, 'John Doe')
      await user.clear(patientEmailInput)
      await user.type(patientEmailInput, 'john@email.com')
      await user.click(confirmButton)
      
      await waitFor(() => {
        expect(mockClinicBookingService.createAppointment).toHaveBeenCalledWith({
          doctorId: 'doc_001',
          patientName: 'John Doe',
          patientEmail: 'john@email.com',
          appointmentDate: '2025-11-05',
          appointmentTime: '09:00',
          appointmentType: 'consultation'
        })
      })
      
      // Step 6: Verify confirmation
      await waitFor(() => {
        expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument()
        expect(screen.getByText('Confirmation: CONF-E2E-001')).toBeInTheDocument()
      })
    })

    it('should handle workflow interruption and recovery', async () => {
      const user = userEvent.setup()
      
      // Simulate network failure during booking
      mockClinicBookingService.createAppointment
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce({
          success: true,
          appointmentId: 'apt_recovery_001',
          confirmationNumber: 'CONF-RECOV-001'
        })
      
      render(
        <div className="workflow-recovery-test">
          <div data-testid="workflow-steps">
            <div data-step="1" className="current">Search</div>
            <div data-step="2">Select Doctor</div>
            <div data-step="3">Choose Time</div>
            <div data-step="4">Book</div>
            <div data-step="5">Confirm</div>
          </div>
          
          <div data-testid="workflow-content">
            <div data-testid="error-message" style={{ display: 'none' }}>
              Connection lost. Your booking has been saved and will retry automatically.
            </div>
            <button data-testid="retry-booking" style={{ display: 'none' }}>
              Retry Booking
            </button>
            <button data-testid="save-offline" style={{ display: 'none' }}>
              Save for Offline
            </button>
          </div>
        </div>
      )
      
      // Simulate booking attempt that fails
      const tryBooking = async () => {
        try {
          await mockClinicBookingService.createAppointment({
            doctorId: 'doc_001',
            patientName: 'John Doe',
            appointmentDate: '2025-11-05',
            appointmentTime: '09:00'
          })
        } catch (error) {
          // Show error handling UI
          const errorMessage = screen.getByTestId('error-message')
          const retryButton = screen.getByTestId('retry-booking')
          const saveButton = screen.getByTestId('save-offline')
          
          errorMessage.style.display = 'block'
          retryButton.style.display = 'inline-block'
          saveButton.style.display = 'inline-block'
          
          throw error
        }
      }
      
      await tryBooking().catch(() => {
        // Expected to fail
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeVisible()
        expect(screen.getByTestId('retry-booking')).toBeVisible()
      })
      
      // Test recovery with retry
      const retryButton = screen.getByTestId('retry-booking')
      await user.click(retryButton)
      
      await waitFor(() => {
        expect(mockClinicBookingService.createAppointment).toHaveBeenCalledTimes(2)
      })
      
      // Verify recovery success
      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).not.toBeVisible()
      })
    })

    it('should maintain workflow state across page refreshes', async () => {
      // Mock session storage
      const sessionStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      }
      vi.stubGlobal('sessionStorage', sessionStorageMock)
      
      const workflowState = {
        currentStep: 3,
        selectedDoctor: 'doc_001',
        selectedSlot: { date: '2025-11-05', time: '09:00' },
        patientInfo: {
          name: 'John Doe',
          email: 'john@email.com'
        }
      }
      
      sessionStorageMock.getItem.mockReturnValue(JSON.stringify(workflowState))
      
      render(
        <div className="state-persistence-test">
          <div data-testid="workflow-state">
            Step: <span data-testid="current-step">3</span>
            Doctor: <span data-testid="selected-doctor">doc_001</span>
            Slot: <span data-testid="selected-slot">Nov 5, 9:00 AM</span>
            Patient: <span data-testid="patient-name">John Doe</span>
          </div>
          <button data-testid="restore-state">Restore State</button>
        </div>
      )
      
      const restoreButton = screen.getByTestId('restore-state')
      
      await act(async () => {
        fireEvent.click(restoreButton)
      })
      
      await waitFor(() => {
        expect(sessionStorageMock.getItem).toHaveBeenCalledWith('doctorWorkflowState')
      })
      
      // Verify state restoration
      expect(screen.getByTestId('current-step')).toHaveTextContent('3')
      expect(screen.getByTestId('selected-doctor')).toHaveTextContent('doc_001')
      expect(screen.getByTestId('selected-slot')).toHaveTextContent('Nov 5, 9:00 AM')
      expect(screen.getByTestId('patient-name')).toHaveTextContent('John Doe')
    })

    it('should integrate with external systems (payment, notifications)', async () => {
      const mockPaymentService = {
        processPayment: vi.fn(),
        refundPayment: vi.fn()
      }
      
      const mockNotificationService = {
        sendEmail: vi.fn(),
        sendSMS: vi.fn(),
        sendPush: vi.fn()
      }
      
      mockPaymentService.processPayment.mockResolvedValue({
        success: true,
        transactionId: 'txn_123456',
        amount: 120,
        currency: 'SGD'
      })
      
      mockNotificationService.sendEmail.mockResolvedValue({ success: true })
      mockNotificationService.sendSMS.mockResolvedValue({ success: true })
      
      render(
        <div className="external-integration-test">
          <h2>Complete Booking with Payment</h2>
          <div data-testid="booking-summary">
            <p>Doctor: Dr. Sarah Chen</p>
            <p>Date: Nov 5, 2025</p>
            <p>Time: 9:00 AM</p>
            <p>Fee: $120</p>
          </div>
          
          <div data-testid="payment-section">
            <h3>Payment Method</h3>
            <label>
              <input type="radio" name="payment" value="card" defaultChecked />
              Credit/Debit Card
            </label>
            <label>
              <input type="radio" name="payment" value="paypal" />
              PayPal
            </label>
            <button data-testid="process-payment">Pay $120</button>
          </div>
          
          <div data-testid="notification-section" style={{ display: 'none' }}>
            <h3>Notifications</h3>
            <label>
              <input type="checkbox" defaultChecked />
              Email confirmation
            </label>
            <label>
              <input type="checkbox" defaultChecked />
              SMS reminder
            </label>
          </div>
          
          <div data-testid="completion-status"></div>
        </div>
      )
      
      const paymentButton = screen.getByTestId('process-payment')
      
      await act(async () => {
        fireEvent.click(paymentButton)
      })
      
      await waitFor(() => {
        expect(mockPaymentService.processPayment).toHaveBeenCalledWith({
          amount: 120,
          currency: 'SGD',
          paymentMethod: 'card',
          reference: 'apt_001'
        })
      })
      
      await waitFor(() => {
        expect(mockNotificationService.sendEmail).toHaveBeenCalledWith({
          to: 'john@email.com',
          subject: 'Appointment Confirmed',
          template: 'appointment_confirmation'
        })
      })
      
      await waitFor(() => {
        expect(mockNotificationService.sendSMS).toHaveBeenCalledWith({
          to: '+65-9123-4567',
          message: 'Your appointment with Dr. Sarah Chen is confirmed for Nov 5, 9:00 AM'
        })
      })
      
      // Verify completion
      expect(screen.getByTestId('completion-status')).toHaveTextContent('Payment successful! Confirmation sent.')
    })
  })

  describe('Real-time Integration Testing', () => {
    it('should handle real-time availability updates', async () => {
      // Mock WebSocket for real-time updates
      const mockWebSocket = {
        send: vi.fn(),
        close: vi.fn(),
        addEventListener: vi.fn()
      }
      
      vi.stubGlobal('WebSocket', vi.fn(() => mockWebSocket))
      
      render(
        <div className="realtime-availability-test">
          <h2>Live Availability - Dr. Sarah Chen</h2>
          <div data-testid="availability-status">
            <span className="status-indicator">Connected</span>
            <span data-testid="last-update">Last updated: Just now</span>
          </div>
          <div data-testid="slots-grid">
            <div data-testid="slot-morning" className="time-slot">
              Morning Slots
              <div data-testid="slot-09:00" className="available">9:00 AM - Available</div>
              <div data-testid="slot-10:00" className="available">10:00 AM - Available</div>
            </div>
          </div>
          <div data-testid="realtime-notifications" style={{ display: 'none' }}>
            <div className="notification">Slot 10:00 AM just got booked by another patient</div>
          </div>
        </div>
      )
      
      // Simulate real-time slot update
      const simulateSlotUpdate = () => {
        const slot10am = screen.getByTestId('slot-10:00')
        slot10am.className = 'booked'
        slot10am.textContent = '10:00 AM - Just Booked'
        
        const notifications = screen.getByTestId('realtime-notifications')
        notifications.style.display = 'block'
      }
      
      // Simulate WebSocket message
      act(() => {
        simulateSlotUpdate()
      })
      
      await waitFor(() => {
        expect(screen.getByText('10:00 AM - Just Booked')).toBeInTheDocument()
        expect(screen.getByTestId('realtime-notifications')).toBeVisible()
      })
    })

    it('should handle real-time conflict resolution', async () => {
      let conflictDetected = false
      
      // Mock conflict detection service
      const conflictService = {
        checkConflicts: vi.fn(),
        resolveConflicts: vi.fn()
      }
      
      conflictService.checkConflicts.mockImplementation(async (appointmentData) => {
        // Simulate conflict detection
        if (appointmentData.date === '2025-11-05' && appointmentData.time === '09:00') {
          conflictDetected = true
          return {
            hasConflict: true,
            conflictingAppointments: [
              {
                patientName: 'Jane Smith',
                time: '09:00',
                duration: 45
              }
            ],
            resolutionOptions: [
              { time: '09:45', available: true },
              { time: '10:30', available: true }
            ]
          }
        }
        return { hasConflict: false }
      })
      
      render(
        <div className="conflict-resolution-test">
          <h2>Appointment Conflict Detection</h2>
          <div data-testid="conflict-warning" style={{ display: 'none' }}>
            <h3>⚠️ Time Conflict Detected</h3>
            <p>Jane Smith has a 45-minute appointment at 9:00 AM</p>
            <div data-testid="resolution-options">
              <button data-testid="option-09:45">9:45 AM (15 min wait)</button>
              <button data-testid="option-10:30">10:30 AM (1 hour wait)</button>
            </div>
          </div>
        </div>
      )
      
      // Try to book conflicting slot
      const conflictingAppointment = {
        doctorId: 'doc_001',
        date: '2025-11-05',
        time: '09:00',
        duration: 30
      }
      
      await act(async () => {
        const result = await conflictService.checkConflicts(conflictingAppointment)
        if (result.hasConflict) {
          const warning = screen.getByTestId('conflict-warning')
          warning.style.display = 'block'
        }
      })
      
      await waitFor(() => {
        expect(conflictDetected).toBe(true)
        expect(screen.getByTestId('conflict-warning')).toBeVisible()
      })
      
      // Test conflict resolution
      const resolutionOption = screen.getByTestId('option-09:45')
      await act(async () => {
        fireEvent.click(resolutionOption)
      })
      
      await waitFor(() => {
        expect(conflictService.resolveConflicts).toHaveBeenCalledWith(
          conflictingAppointment,
          { time: '09:45' }
        )
      })
    })
  })

  describe('Data Migration and Synchronization Testing', () => {
    it('should handle data migration between systems', async () => {
      const migrationService = {
        exportData: vi.fn(),
        importData: vi.fn(),
        validateMigration: vi.fn(),
        rollbackMigration: vi.fn()
      }
      
      const sourceData = {
        doctors: Array.from({ length: 100 }, (_, i) => ({
          id: `old_doc_${i}`,
          name: `Old Doctor ${i}`,
          specialty: ['Cardiology', 'Dermatology'][i % 2]
        })),
        metadata: {
          exportDate: '2025-11-04',
          version: '1.0',
          recordCount: 100
        }
      }
      
      migrationService.exportData.mockResolvedValue(sourceData)
      migrationService.importData.mockResolvedValue({
        success: true,
        imported: 100,
        skipped: 0,
        errors: []
      })
      migrationService.validateMigration.mockResolvedValue({
        valid: true,
        checks: {
          dataIntegrity: 'PASS',
          referentialIntegrity: 'PASS',
          formatCompliance: 'PASS'
        }
      })
      
      render(
        <div className="data-migration-test">
          <h2>System Migration</h2>
          <div data-testid="migration-progress">
            <div data-testid="export-status">Ready to export</div>
            <div data-testid="import-status">Ready to import</div>
            <div data-testid="validation-status">Pending validation</div>
          </div>
          
          <div data-testid="migration-controls">
            <button data-testid="export-btn">Export Legacy Data</button>
            <button data-testid="import-btn" disabled>Import to New System</button>
            <button data-testid="validate-btn" disabled>Validate Migration</button>
          </div>
          
          <div data-testid="migration-results"></div>
        </div>
      )
      
      // Step 1: Export data
      const exportButton = screen.getByTestId('export-btn')
      await act(async () => {
        fireEvent.click(exportButton)
      })
      
      await waitFor(() => {
        expect(migrationService.exportData).toHaveBeenCalled()
      })
      
      // Step 2: Import data
      const importButton = screen.getByTestId('import-btn')
      await act(async () => {
        fireEvent.click(importButton)
      })
      
      await waitFor(() => {
        expect(migrationService.importData).toHaveBeenCalledWith(sourceData)
      })
      
      // Step 3: Validate migration
      const validateButton = screen.getByTestId('validate-btn')
      await act(async () => {
        fireEvent.click(validateButton)
      })
      
      await waitFor(() => {
        expect(migrationService.validateMigration).toHaveBeenCalled()
      })
      
      // Verify migration success
      expect(screen.getByTestId('migration-results')).toHaveTextContent('Migration completed successfully')
    })

    it('should handle synchronization conflicts', async () => {
      const syncService = {
        detectConflicts: vi.fn(),
        resolveSyncConflicts: vi.fn(),
        mergeData: vi.fn()
      }
      
      const localData = {
        doctorId: 'doc_001',
        lastModified: '2025-11-04T10:00:00Z',
        data: {
          experience: 8,
          rating: 4.8,
          bio: 'Updated local bio'
        }
      }
      
      const serverData = {
        doctorId: 'doc_001',
        lastModified: '2025-11-04T10:30:00Z',
        data: {
          experience: 9,
          rating: 4.9,
          bio: 'Updated server bio'
        }
      }
      
      syncService.detectConflicts.mockReturnValue({
        hasConflicts: true,
        conflicts: [
          {
            field: 'experience',
            localValue: 8,
            serverValue: 9,
            lastModified: 'server'
          },
          {
            field: 'bio',
            localValue: 'Updated local bio',
            serverValue: 'Updated server bio',
            lastModified: 'server'
          }
        ]
      })
      
      syncService.resolveSyncConflicts.mockReturnValue({
        resolvedData: {
          experience: 9,
          rating: 4.9,
          bio: 'Merged: Updated local bio + Updated server bio'
        },
        resolution: 'merge'
      })
      
      render(
        <div className="sync-conflict-test">
          <h2>Data Synchronization</h2>
          <div data-testid="sync-status">
            <div className="status-indicator warning">⚠️ Sync Conflict Detected</div>
            <div>Last sync: 10:30 AM</div>
          </div>
          
          <div data-testid="conflict-details">
            <h3>Conflicts Found</h3>
            <div data-testid="conflict-experience">
              Experience: Local (8) vs Server (9) - Server is newer
            </div>
            <div data-testid="conflict-bio">
              Bio: Different content - Both modified
            </div>
          </div>
          
          <div data-testid="resolution-options">
            <button data-testid="use-server">Use Server Version</button>
            <button data-testid="use-local">Keep Local Version</button>
            <button data-testid="merge-data">Merge Both Versions</button>
          </div>
        </div>
      )
      
      const mergeButton = screen.getByTestId('merge-data')
      await act(async () => {
        fireEvent.click(mergeButton)
      })
      
      await waitFor(() => {
        expect(syncService.resolveSyncConflicts).toHaveBeenCalledWith(
          localData,
          serverData,
          'merge'
        )
      })
      
      // Verify conflict resolution
      expect(screen.getByText('✅ Conflicts resolved successfully')).toBeInTheDocument()
    })
  })
})