import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { DoctorSearch } from '@/components/healthcare/doctor-search'
import { DoctorProfile } from '@/components/healthcare/doctor-profile'
import { DoctorCard } from '@/components/healthcare/doctor-card'
import { AdvancedSearchFilters } from '@/components/healthcare/advanced-search-filters'
import { DoctorReviewSystem } from '@/components/healthcare/review-system'
import { TrustIndicators } from '@/components/healthcare/trust-indicators'

expect.extend(toHaveNoViolations)

// Mock doctor data for accessibility testing
const mockDoctor = {
  id: 'doc_001',
  name: 'Dr. Sarah Chen',
  specialty: 'Cardiology',
  subSpecialties: ['Interventional Cardiology', 'Heart Failure'],
  qualifications: [
    { degree: 'MBBS', institution: 'National University of Singapore', year: 2015 }
  ],
  experience: 8,
  languages: ['English', 'Mandarin', 'Malay'],
  bio: 'Experienced cardiologist specializing in interventional procedures and heart failure management.',
  clinicId: 'clinic_001',
  clinic: {
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
    { date: '2025-11-05', time: '09:00', available: true }
  ],
  consultationFees: { consultation: 120, followUp: 80, procedure: 300 },
  telemedicineAvailable: true,
  waitingTime: 15
}

const mockReview = {
  id: 'review_001',
  doctorId: 'doc_001',
  patientName: 'John Doe',
  rating: 5,
  title: 'Excellent care and professional service',
  comment: 'Dr. Chen provided exceptional care during my cardiology consultation.',
  date: '2025-10-15',
  helpful: 12,
  verified: true
}

describe('WCAG 2.2 AA Accessibility Testing', () => {
  describe('Keyboard Navigation', () => {
    it('should be keyboard accessible for doctor search', async () => {
      const user = userEvent.setup()
      render(<DoctorSearch />)
      
      const searchInput = screen.getByPlaceholderText('Search doctors, specialties, conditions...')
      
      // Test tab navigation to search input
      await user.tab()
      expect(searchInput).toHaveFocus()
      
      // Test typing and form submission
      await user.type(searchInput, 'cardiologist')
      expect(searchInput).toHaveValue('cardiologist')
      
      await user.keyboard('{Enter}')
      expect(searchInput).toHaveValue('cardiologist')
    })

    it('should support keyboard navigation for doctor cards', async () => {
      const user = userEvent.setup()
      render(<DoctorCard doctor={mockDoctor} />)
      
      const doctorCard = screen.getByTestId('doctor-card')
      
      // Test that doctor card is focusable
      doctorCard.focus()
      expect(doctorCard).toHaveFocus()
      
      // Test that card is properly marked as clickable/focusable
      expect(doctorCard).toHaveAttribute('tabindex', '0')
    })

    it('should support keyboard navigation for advanced filters', async () => {
      const user = userEvent.setup()
      render(<AdvancedSearchFilters />)
      
      const specialtyFilter = screen.getByLabelText('Specialty')
      const locationFilter = screen.getByLabelText('Location')
      const ratingFilter = screen.getByLabelText('Minimum Rating')
      
      // Test tab navigation through filters
      await user.tab() // Focus search
      await user.tab() // Focus specialty
      expect(specialtyFilter).toHaveFocus()
      
      await user.tab() // Focus location
      expect(locationFilter).toHaveFocus()
      
      await user.tab() // Focus rating
      expect(ratingFilter).toHaveFocus()
    })

    it('should support keyboard activation for buttons and links', async () => {
      const user = userEvent.setup()
      const mockClickHandler = vi.fn()
      
      render(
        <div>
          <button onClick={mockClickHandler} data-testid="book-appointment">
            Book Appointment
          </button>
          <a href="/doctor/doc_001" data-testid="view-profile">
            View Profile
          </a>
        </div>
      )
      
      const bookButton = screen.getByTestId('book-appointment')
      const viewLink = screen.getByTestId('view-profile')
      
      // Test button activation with Enter key
      bookButton.focus()
      await user.keyboard('{Enter}')
      expect(mockClickHandler).toHaveBeenCalledTimes(1)
      
      // Test link activation with Enter key
      viewLink.focus()
      await user.keyboard('{Enter}')
      // Link navigation would be handled by browser
      expect(viewLink).toHaveAttribute('href')
    })

    it('should handle keyboard shortcuts for common actions', async () => {
      const user = userEvent.setup()
      const mockKeyboardHandler = vi.fn()
      
      render(
        <div onKeyDown={mockKeyboardHandler}>
          <DoctorSearch />
        </div>
      )
      
      const searchInput = screen.getByPlaceholderText('Search doctors, specialties, conditions...')
      searchInput.focus()
      
      // Test escape key to clear search
      await user.keyboard('{Escape}')
      expect(mockKeyboardHandler).toHaveBeenCalled()
    })

    it('should support keyboard navigation for doctor profile', async () => {
      const user = userEvent.setup()
      render(<DoctorProfile doctor={mockDoctor} />)
      
      // Test navigation through profile sections
      const profile = screen.getByTestId('doctor-profile')
      const profileImage = screen.getByTestId('doctor-profile-image')
      const profileInfo = screen.getByTestId('doctor-profile-info')
      
      // All major sections should be focusable
      expect(profile).toHaveAttribute('tabindex', '-1') // Landmark element
      expect(profileImage).toHaveAttribute('tabindex', '0')
      expect(profileInfo).toHaveAttribute('tabindex', '0')
    })
  })

  describe('Screen Reader Compatibility', () => {
    it('should provide proper ARIA labels for doctor profiles', () => {
      render(<DoctorProfile doctor={mockDoctor} />)
      
      // Check for proper ARIA landmarks
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('article')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      
      // Check for ARIA labels on doctor information
      expect(screen.getByLabelText('Doctor Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Specialty')).toBeInTheDocument()
      expect(screen.getByLabelText('Experience')).toBeInTheDocument()
      expect(screen.getByLabelText('Rating')).toBeInTheDocument()
      expect(screen.getByLabelText('Consultation Fee')).toBeInTheDocument()
    })

    it('should provide descriptive alt text for doctor images', () => {
      render(<DoctorProfile doctor={mockDoctor} />)
      
      const doctorImage = screen.getByTestId('doctor-profile-image')
      
      // Should have descriptive alt text
      expect(doctorImage).toHaveAttribute('alt', expect.stringContaining('Dr. Sarah Chen'))
      expect(doctorImage).toHaveAttribute('alt', expect.stringContaining('Cardiologist'))
      expect(doctorImage).toHaveAttribute('alt', expect.stringContaining('Heart Care Medical Centre'))
    })

    it('should provide ARIA labels for rating system', () => {
      render(<DoctorProfile doctor={mockDoctor} />)
      
      const ratingElement = screen.getByLabelText('Rating: 4.8 out of 5 stars')
      expect(ratingElement).toBeInTheDocument()
      
      // Should have proper ARIA attributes for screen readers
      expect(ratingElement).toHaveAttribute('aria-label')
      expect(ratingElement).toHaveAttribute('role')
    })

    it('should provide ARIA labels for verification badges', () => {
      render(<DoctorProfile doctor={mockDoctor} />)
      
      // Check verification badge accessibility
      const mcrBadge = screen.getByTestId('verification-badge-mcr')
      const spcBadge = screen.getByTestId('verification-badge-spc')
      
      expect(mcrBadge).toHaveAttribute('aria-label', 'MCR Verified')
      expect(spcBadge).toHaveAttribute('aria-label', 'SPC Verified')
      expect(mcrBadge).toHaveAttribute('title')
      expect(spcBadge).toHaveAttribute('title')
    })

    it('should provide ARIA labels for availability and booking', () => {
      render(<DoctorProfile doctor={mockDoctor} />)
      
      // Check availability accessibility
      expect(screen.getByLabelText('Available appointment slots')).toBeInTheDocument()
      expect(screen.getByLabelText('Telemedicine available')).toBeInTheDocument()
      expect(screen.getByLabelText('Book appointment for November 5, 2025 at 9:00 AM')).toBeInTheDocument()
    })

    it('should provide proper heading hierarchy', () => {
      render(<DoctorProfile doctor={mockDoctor} />)
      
      // Check heading structure
      const headings = screen.getAllByRole('heading')
      expect(headings[0]).toHaveAttribute('level', '1') // Doctor name
      expect(headings[1]).toHaveAttribute('level', '2') // Specialty
      expect(headings[2]).toHaveAttribute('level', '2') // Clinic information
      expect(headings[3]).toHaveAttribute('level', '2') // Availability
    })

    it('should provide ARIA labels for search results', async () => {
      render(
        <div>
          <DoctorSearch />
          <div role="search" aria-label="Search results">
            <DoctorCard doctor={mockDoctor} />
          </div>
        </div>
      )
      
      // Check search result accessibility
      expect(screen.getByRole('search')).toBeInTheDocument()
      expect(screen.getByLabelText('Search results')).toBeInTheDocument()
      expect(screen.getByLabelText('Search result 1 of 1')).toBeInTheDocument()
    })

    it('should provide ARIA labels for review system', () => {
      render(<DoctorReviewSystem reviews={[mockReview]} doctorId="doc_001" />)
      
      // Check review accessibility
      expect(screen.getByLabelText('Patient reviews and ratings')).toBeInTheDocument()
      expect(screen.getByLabelText(`Review by ${mockReview.patientName}`)).toBeInTheDocument()
      expect(screen.getByLabelText(`Rating: ${mockReview.rating} out of 5 stars`)).toBeInTheDocument()
    })
  })

  describe('Color Contrast and Visual Accessibility', () => {
    it('should meet WCAG AA color contrast ratios', async () => {
      const { container } = render(<DoctorProfile doctor={mockDoctor} />)
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      })
      expect(results).toHaveNoViolations()
    })

    it('should not rely solely on color for information', () => {
      render(<DoctorProfile doctor={mockDoctor} />)
      
      // Verification badges should have icons, not just color
      const mcrBadge = screen.getByTestId('verification-badge-mcr')
      expect(mcrBadge).toContainElement(screen.getByTestId('mcr-verified-icon'))
      
      // Rating should have text alternatives, not just color
      const ratingElement = screen.getByLabelText('Rating: 4.8 out of 5 stars')
      expect(ratingElement).toHaveTextContent('4.8')
      
      // Availability should have text, not just color
      const availabilityElement = screen.getByLabelText('Available appointment slots')
      expect(availabilityElement).toHaveTextContent()
    })

    it('should provide sufficient color contrast for text on backgrounds', async () => {
      const { container } = render(
        <div>
          <DoctorCard doctor={mockDoctor} />
        </div>
      )
      
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
          'color-contrast-enhanced': { enabled: true }
        }
      })
      expect(results).toHaveNoViolations()
    })

    it('should support high contrast mode', () => {
      render(<DoctorProfile doctor={mockDoctor} />)
      
      // Elements should maintain visibility in high contrast
      const profileImage = screen.getByTestId('doctor-profile-image')
      expect(profileImage).toHaveClass('high-contrast-compatible')
      
      const rating = screen.getByLabelText('Rating: 4.8 out of 5 stars')
      expect(rating).toHaveClass('high-contrast-compatible')
    })

    it('should not use color as the sole means of conveying information', () => {
      render(
        <div>
          <TrustIndicators 
            verified={true} 
            experienceYears={8} 
            rating={4.8}
            reviewCount={156}
          />
        </div>
      )
      
      // Verification should have text indicators
      expect(screen.getByText('Verified')).toBeInTheDocument()
      expect(screen.getByText('8 years experience')).toBeInTheDocument()
      expect(screen.getByText('4.8')).toBeInTheDocument()
      expect(screen.getByText('(156 reviews)')).toBeInTheDocument()
    })
  })

  describe('Alternative Text for Images and Content', () => {
    it('should provide comprehensive alt text for doctor profile images', () => {
      render(<DoctorProfile doctor={mockDoctor} />)
      
      const profileImage = screen.getByTestId('doctor-profile-image')
      const altText = profileImage.getAttribute('alt') || ''
      
      // Alt text should include doctor name
      expect(altText).toContain('Dr. Sarah Chen')
      // Alt text should include specialty
      expect(altText).toContain('Cardiology')
      // Alt text should be descriptive
      expect(altText.length).toBeGreaterThan(20)
    })

    it('should provide alt text for clinic logos and images', () => {
      render(<DoctorProfile doctor={mockDoctor} />)
      
      const clinicLogo = screen.getByTestId('clinic-logo')
      expect(clinicLogo).toHaveAttribute('alt', 'Heart Care Medical Centre logo')
      
      const clinicImage = screen.getByTestId('clinic-image')
      expect(clinicImage).toHaveAttribute('alt', 'Heart Care Medical Centre - exterior view')
    })

    it('should provide descriptive text for verification badges', () => {
      render(<DoctorProfile doctor={mockDoctor} />)
      
      // Each badge should have alt text or descriptive title
      const mcrBadge = screen.getByTestId('verification-badge-mcr')
      expect(mcrBadge).toHaveAttribute('title', 'MCR Verified - Singapore Medical Council')
      
      const spcBadge = screen.getByTestId('verification-badge-spc')
      expect(spcBadge).toHaveAttribute('title', 'SPC Verified - Singapore Pharmacy Council')
    })

    it('should provide alternative content for non-text content', () => {
      render(
        <div>
          <TrustIndicators 
            verified={true}
            experienceYears={8}
            rating={4.8}
            reviewCount={156}
            mcrVerified={true}
            spcVerified={true}
          />
        </div>
      )
      
      // Charts and graphs should have alternative descriptions
      const ratingChart = screen.getByTestId('rating-chart')
      expect(ratingChart).toHaveAttribute('aria-describedby')
      
      // Progress bars should have alternative text
      const experienceBar = screen.getByTestId('experience-bar')
      expect(experienceBar).toHaveAttribute('aria-label', '8 years of experience')
    })

    it('should provide captions for videos and audio content', () => {
      render(
        <div>
          <video controls aria-describedby="video-description">
            <track kind="captions" src="/captions/doctor-intro.vtt" />
          </video>
          <div id="video-description">
            Dr. Sarah Chen introduces herself and explains her cardiology practice
          </div>
        </div>
      )
      
      const video = screen.getByRole('video')
      expect(video).toHaveAttribute('aria-describedby', 'video-description')
    })
  })

  describe('Focus Management and Visible Focus', () => {
    it('should have visible focus indicators', () => {
      render(<DoctorCard doctor={mockDoctor} />)
      
      const doctorCard = screen.getByTestId('doctor-card')
      
      // Test focus styles
      doctorCard.focus()
      
      // Focus should be visible (implementation-dependent, but should have focus style)
      expect(doctorCard).toHaveClass(expect.stringContaining('focus') || expect.stringContaining(':focus'))
    })

    it('should manage focus during modal interactions', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <button data-testid="open-modal">View Profile</button>
          <div role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden>
            <h2 id="modal-title">Doctor Profile</h2>
            <button data-testid="close-modal">Close</button>
          </div>
        </div>
      )
      
      const openButton = screen.getByTestId('open-modal')
      
      // Click to open modal
      await user.click(openButton)
      
      // Focus should move to modal
      const modal = screen.getByRole('dialog')
      expect(modal).not.toHaveAttribute('hidden')
      
      // Close button should be focused
      const closeButton = screen.getByTestId('close-modal')
      expect(closeButton).toHaveFocus()
    })

    it('should trap focus within modals and dialogs', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <h2 id="modal-title">Book Appointment</h2>
            <button>Cancel</button>
            <button>Confirm</button>
          </div>
        </div>
      )
      
      const modal = screen.getByRole('dialog')
      const cancelButton = screen.getByText('Cancel')
      const confirmButton = screen.getByText('Confirm')
      
      // Focus should cycle within modal
      cancelButton.focus()
      expect(cancelButton).toHaveFocus()
      
      await user.tab()
      expect(confirmButton).toHaveFocus()
      
      await user.tab()
      // Should cycle back to first element
      expect(cancelButton).toHaveFocus()
    })

    it('should restore focus after modal closure', async () => {
      const user = userEvent.setup()
      const handleClose = vi.fn()
      
      render(
        <div>
          <button data-testid="open-modal" onClick={() => {}}>Book Appointment</button>
          <div role="dialog" aria-modal="true" aria-labelledby="modal-title" onClose={handleClose}>
            <h2 id="modal-title">Appointment Booking</h2>
            <button data-testid="close-modal">Close</button>
          </div>
        </div>
      )
      
      const openButton = screen.getByTestId('open-modal')
      const closeButton = screen.getByTestId('close-modal')
      
      // Open modal
      await user.click(openButton)
      expect(screen.getByRole('dialog')).not.toHaveAttribute('hidden')
      
      // Close modal
      await user.click(closeButton)
      
      // Focus should return to triggering element
      expect(openButton).toHaveFocus()
      expect(handleClose).toHaveBeenCalled()
    })
  })

  describe('Form Accessibility', () => {
    it('should have properly labeled form inputs', () => {
      render(
        <div>
          <label htmlFor="doctor-search">Search for doctors</label>
          <input id="doctor-search" type="text" placeholder="Search doctors, specialties..." />
          
          <label htmlFor="specialty-filter">Specialty</label>
          <select id="specialty-filter">
            <option value="">All Specialties</option>
            <option value="cardiology">Cardiology</option>
          </select>
        </div>
      )
      
      expect(screen.getByLabelText('Search for doctors')).toBeInTheDocument()
      expect(screen.getByLabelText('Specialty')).toBeInTheDocument()
    })

    it('should provide error messages with proper ARIA attributes', () => {
      render(
        <div>
          <label htmlFor="booking-date">Appointment Date</label>
          <input 
            id="booking-date" 
            type="date" 
            aria-describedby="date-error"
            aria-invalid="true"
          />
          <div id="date-error" role="alert">
            Please select a valid appointment date
          </div>
        </div>
      )
      
      const dateInput = screen.getByLabelText('Appointment Date')
      expect(dateInput).toHaveAttribute('aria-invalid', 'true')
      expect(dateInput).toHaveAttribute('aria-describedby', 'date-error')
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('should provide help text and instructions', () => {
      render(
        <div>
          <label htmlFor="doctor-search">Search doctors</label>
          <input 
            id="doctor-search" 
            type="text" 
            aria-describedby="search-help"
            placeholder="Enter doctor name, specialty, or condition"
          />
          <div id="search-help">
            You can search by doctor name, medical specialty, or health condition
          </div>
        </div>
      )
      
      const searchInput = screen.getByLabelText('Search doctors')
      expect(searchInput).toHaveAttribute('aria-describedby', 'search-help')
    })

    it('should support autocomplete and suggestions', () => {
      render(
        <div>
          <label htmlFor="doctor-search">Search doctors</label>
          <input 
            id="doctor-search" 
            type="text" 
            autoComplete="off"
            role="combobox"
            aria-expanded="false"
            aria-haspopup="listbox"
          />
          <ul role="listbox" aria-label="Search suggestions">
            <li role="option">Cardiologist</li>
            <li role="option">Dermatologist</li>
          </ul>
        </div>
      )
      
      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      expect(screen.getByRole('option')).toBeInTheDocument()
    })
  })

  describe('Comprehensive Accessibility Testing', () => {
    it('DoctorSearch component should have no accessibility violations', async () => {
      const { container } = render(<DoctorSearch />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('DoctorProfile component should have no accessibility violations', async () => {
      const { container } = render(<DoctorProfile doctor={mockDoctor} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('DoctorCard component should have no accessibility violations', async () => {
      const { container } = render(<DoctorCard doctor={mockDoctor} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('AdvancedSearchFilters component should have no accessibility violations', async () => {
      const { container } = render(<AdvancedSearchFilters />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('Complete doctor discovery workflow should be accessible', async () => {
      const { container } = render(
        <div>
          <DoctorSearch />
          <AdvancedSearchFilters />
          <div>
            <DoctorCard doctor={mockDoctor} />
          </div>
        </div>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('Trust indicators should be accessible', async () => {
      const { container } = render(
        <TrustIndicators 
          verified={true}
          experienceYears={8}
          rating={4.8}
          reviewCount={156}
          mcrVerified={true}
          spcVerified={true}
        />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('Review system should be accessible', async () => {
      const { container } = render(
        <DoctorReviewSystem reviews={[mockReview]} doctorId="doc_001" />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Mobile Accessibility', () => {
    it('should support touch targets of appropriate size', () => {
      render(<DoctorCard doctor={mockDoctor} />)
      
      const doctorCard = screen.getByTestId('doctor-card')
      
      // Touch targets should be at least 44px (Apple guidelines) or 48px (Material Design)
      const computedStyle = window.getComputedStyle(doctorCard)
      const height = parseInt(computedStyle.height)
      const width = parseInt(computedStyle.width)
      
      expect(height).toBeGreaterThanOrEqual(44)
      expect(width).toBeGreaterThanOrEqual(44)
    })

    it('should support zoom up to 200% without horizontal scrolling', () => {
      render(<DoctorProfile doctor={mockDoctor} />)
      
      const profile = screen.getByTestId('doctor-profile')
      
      // At 200% zoom, content should not cause horizontal scrolling
      expect(profile.scrollWidth).toBeLessThanOrEqual(profile.clientWidth * 2)
    })

    it('should maintain accessibility on small screens', async () => {
      // Mock small screen
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      })
      
      const { container } = render(<DoctorProfile doctor={mockDoctor} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})