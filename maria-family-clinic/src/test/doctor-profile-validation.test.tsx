import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { DoctorProfile } from '@/components/healthcare/doctor-profile'
import { DoctorCard } from '@/components/healthcare/doctor-card'
import { EnhancedDoctorCard } from '@/components/healthcare/enhanced-doctor-card'

expect.extend(toHaveNoViolations)

// Mock doctor data for testing
const mockDoctor = {
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
    phone: '+65-6123-4567'
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
    { date: '2025-11-05', time: '09:00', available: true },
    { date: '2025-11-05', time: '10:30', available: true },
    { date: '2025-11-06', time: '14:00', available: true }
  ],
  consultationFees: {
    consultation: 120,
    followUp: 80,
    procedure: 300
  },
  telemedicineAvailable: true,
  waitingTime: 15
}

const mockIncompleteDoctor = {
  ...mockDoctor,
  bio: '',
  qualifications: [],
  profileImage: null
}

describe('Doctor Profile Validation', () => {
  describe('Profile Accuracy Tests', () => {
    it('should display complete doctor information correctly', () => {
      render(<DoctorProfile doctor={mockDoctor} />)
      
      expect(screen.getByText('Dr. Sarah Chen')).toBeInTheDocument()
      expect(screen.getByText('Cardiology')).toBeInTheDocument()
      expect(screen.getByText('8 years experience')).toBeInTheDocument()
      expect(screen.getByText('Heart Care Medical Centre')).toBeInTheDocument()
      expect(screen.getByText('4.8')).toBeInTheDocument()
      expect(screen.getByText('(156 reviews)')).toBeInTheDocument()
    })

    it('should display all qualification degrees', () => {
      render(<DoctorProfile doctor={mockDoctor} />)
      
      expect(screen.getByText('MBBS, NUS, 2015')).toBeInTheDocument()
      expect(screen.getByText('MD, Harvard, 2019')).toBeInTheDocument()
      expect(screen.getByText('FACC, ACC, 2022')).toBeInTheDocument()
    })

    it('should display specialties and subspecialties', () => {
      render(<DoctorProfile doctor={mockDoctor} />)
      
      expect(screen.getByText('Interventional Cardiology')).toBeInTheDocument()
      expect(screen.getByText('Heart Failure')).toBeInTheDocument()
    })

    it('should display languages spoken', () => {
      render(<DoctorProfile doctor={mockDoctor} />)
      
      expect(screen.getByText('English, Mandarin, Malay')).toBeInTheDocument()
    })
  })

  describe('Profile Completeness Validation', () => {
    it('should handle incomplete doctor profiles gracefully', () => {
      render(<DoctorProfile doctor={mockIncompleteDoctor} />)
      
      expect(screen.getByText('Dr. Sarah Chen')).toBeInTheDocument()
      expect(screen.getByText('No bio available')).toBeInTheDocument()
    })

    it('should validate required fields are present', () => {
      const incompleteProfile = { ...mockIncompleteDoctor, name: '', specialty: '' }
      
      expect(() => {
        render(<DoctorProfile doctor={incompleteProfile} />)
      }).not.toThrow()
    })

    it('should handle missing profile image', () => {
      render(<DoctorProfile doctor={{ ...mockIncompleteDoctor, profileImage: null }} />)
      
      expect(screen.getByTestId('doctor-profile-image')).toBeInTheDocument()
    })
  })

  describe('Medical Credential Validation', () => {
    it('should display verification badges when credentials are verified', () => {
      render(<DoctorProfile doctor={mockDoctor} />)
      
      expect(screen.getByTestId('verification-badge-mcr')).toBeInTheDocument()
      expect(screen.getByTestId('verification-badge-spc')).toBeInTheDocument()
      expect(screen.getByTestId('verification-badge-board')).toBeInTheDocument()
      expect(screen.getByTestId('verification-badge-experience')).toBeInTheDocument()
    })

    it('should validate MCR number format (Singapore format)', () => {
      const doctorWithMCR = { ...mockDoctor, mcrNumber: 'M12345A' }
      render(<DoctorProfile doctor={doctorWithMCR} />)
      
      expect(screen.getByText(/MCR: M12345A/)).toBeInTheDocument()
    })

    it('should validate board certification details', () => {
      const doctorWithBoardCert = {
        ...mockDoctor,
        boardCertifications: [
          { board: 'American Board of Cardiology', certified: true, year: 2020 }
        ]
      }
      render(<DoctorProfile doctor={doctorWithBoardCert} />)
      
      expect(screen.getByText('American Board of Cardiology (2020)')).toBeInTheDocument()
    })
  })

  describe('Profile Information Display and Formatting', () => {
    it('should format consultation fees correctly', () => {
      render(<DoctorProfile doctor={mockDoctor} />)
      
      expect(screen.getByText('$120')).toBeInTheDocument()
      expect(screen.getByText('$80')).toBeInTheDocument()
      expect(screen.getByText('$300')).toBeInTheDocument()
    })

    it('should format waiting time appropriately', () => {
      render(<DoctorProfile doctor={mockDoctor} />)
      
      expect(screen.getByText('15 min wait')).toBeInTheDocument()
    })

    it('should display availability slots correctly', () => {
      render(<DoctorProfile doctor={mockDoctor} />)
      
      expect(screen.getByText('Nov 5, 9:00 AM')).toBeInTheDocument()
      expect(screen.getByText('Nov 5, 10:30 AM')).toBeInTheDocument()
      expect(screen.getByText('Nov 6, 2:00 PM')).toBeInTheDocument()
    })

    it('should indicate telemedicine availability', () => {
      render(<DoctorProfile doctor={mockDoctor} />)
      
      expect(screen.getByTestId('telemedicine-available')).toBeInTheDocument()
    })
  })

  describe('Profile Image Optimization and Loading', () => {
    it('should optimize profile images for different screen sizes', async () => {
      const { container } = render(<DoctorProfile doctor={mockDoctor} />)
      
      const img = container.querySelector('img[alt*="Dr. Sarah Chen"]')
      expect(img).toHaveAttribute('loading', 'lazy')
      expect(img).toHaveAttribute('decoding', 'async')
    })

    it('should provide responsive image sizes', () => {
      const { container } = render(<DoctorProfile doctor={mockDoctor} />)
      
      const img = container.querySelector('img[alt*="Dr. Sarah Chen"]')
      expect(img).toHaveAttribute('sizes')
    })

    it('should handle image loading errors gracefully', async () => {
      render(<DoctorProfile doctor={mockDoctor} />)
      
      const img = screen.getByTestId('doctor-profile-image')
      expect(img).toBeInTheDocument()
      
      // Test error handling
      fireEvent.error(img)
      
      await waitFor(() => {
        expect(screen.getByTestId('image-fallback')).toBeInTheDocument()
      })
    })
  })

  describe('Doctor Card Component Validation', () => {
    it('DoctorCard should display essential information', () => {
      render(<DoctorCard doctor={mockDoctor} />)
      
      expect(screen.getByText('Dr. Sarah Chen')).toBeInTheDocument()
      expect(screen.getByText('Cardiology')).toBeInTheDocument()
      expect(screen.getByText('4.8')).toBeInTheDocument()
    })

    it('EnhancedDoctorCard should include additional details', () => {
      render(<EnhancedDoctorCard doctor={mockDoctor} />)
      
      expect(screen.getByText('Dr. Sarah Chen')).toBeInTheDocument()
      expect(screen.getByText('Heart Care Medical Centre')).toBeInTheDocument()
      expect(screen.getByText('Available Today')).toBeInTheDocument()
    })
  })

  describe('Performance Validation', () => {
    it('should render doctor profiles within acceptable time', async () => {
      const startTime = performance.now()
      
      render(<DoctorProfile doctor={mockDoctor} />)
      
      await waitFor(() => {
        expect(screen.getByText('Dr. Sarah Chen')).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(100) // Should render within 100ms
    })

    it('should handle multiple doctor profiles efficiently', async () => {
      const doctors = Array.from({ length: 50 }, (_, i) => ({
        ...mockDoctor,
        id: `doc_${i}`,
        name: `Dr. Doctor ${i}`
      }))
      
      const startTime = performance.now()
      
      render(
        <div>
          {doctors.map(doctor => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )
      
      await waitFor(() => {
        expect(screen.getByText('Dr. Doctor 0')).toBeInTheDocument()
        expect(screen.getByText('Dr. Doctor 49')).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(500) // Should render 50 cards within 500ms
    })
  })

  describe('Accessibility for Doctor Profiles', () => {
    it('DoctorProfile should have no accessibility violations', async () => {
      const { container } = render(<DoctorProfile doctor={mockDoctor} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('DoctorCard should be keyboard navigable', async () => {
      const { container } = render(<DoctorCard doctor={mockDoctor} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('Should have proper semantic markup for doctor information', () => {
      render(<DoctorProfile doctor={mockDoctor} />)
      
      // Check for semantic HTML elements
      expect(screen.getByRole('article')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })
  })
})