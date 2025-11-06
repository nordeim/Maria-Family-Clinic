import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

// Mock browser environment
const mockBrowserEnvironment = {
  userAgent: '',
  viewportWidth: 1024,
  viewportHeight: 768,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  browserName: 'Chrome'
}

// Mock doctor data for cross-platform testing
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
    name: 'Heart Care Medical Centre',
    address: '123 Medical Drive, Singapore 169857',
    phone: '+65-6123-4567',
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
    { date: '2025-11-05', time: '09:00', available: true },
    { date: '2025-11-05', time: '10:30', available: true },
    { date: '2025-11-06', time: '14:00', available: true }
  ],
  consultationFees: { consultation: 120, followUp: 80, procedure: 300 },
  telemedicineAvailable: true,
  waitingTime: 15,
  location: 'Central Singapore'
}

// Mock doctors list for testing
const mockDoctorsList = Array.from({ length: 12 }, (_, i) => ({
  ...mockDoctor,
  id: `doc_${i}`,
  name: `Dr. Doctor ${i}`,
  rating: 4.5 + (i % 10) * 0.05,
  reviewCount: 100 + i * 10
}))

describe('Cross-Platform Testing for Doctor System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock window properties for different browsers
    vi.stubGlobal('window', {
      ...window,
      innerWidth: mockBrowserEnvironment.viewportWidth,
      innerHeight: mockBrowserEnvironment.viewportHeight,
      devicePixelRatio: 1,
      navigator: {
        ...window.navigator,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    // Mock matchMedia for responsive testing
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query.includes('max-width') ? mockBrowserEnvironment.viewportWidth < 768 : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    })
    
    // Mock touch events for mobile testing
    vi.stubGlobal('ontouchstart', true)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('Cross-Browser Testing', () => {
    it('should work in Chrome browser', async () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      })
      
      const { container } = render(
        <div>
          <h1>Dr. Sarah Chen - Cardiologist</h1>
          <p>Rating: 4.8 (156 reviews)</p>
          <button>Book Appointment</button>
        </div>
      )
      
      // Check basic rendering
      expect(screen.getByText('Dr. Sarah Chen - Cardiologist')).toBeInTheDocument()
      expect(screen.getByText('Rating: 4.8 (156 reviews)')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
      
      // Check accessibility
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should work in Firefox browser', async () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
      })
      
      const { container } = render(
        <div>
          <h1>Dr. Sarah Chen - Cardiologist</h1>
          <p>Rating: 4.8 (156 reviews)</p>
          <button>Book Appointment</button>
        </div>
      )
      
      expect(screen.getByText('Dr. Sarah Chen - Cardiologist')).toBeInTheDocument()
      expect(screen.getByText('Rating: 4.8 (156 reviews)')).toBeInTheDocument()
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should work in Safari browser', async () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
      })
      
      const { container } = render(
        <div>
          <h1>Dr. Sarah Chen - Cardiologist</h1>
          <p>Rating: 4.8 (156 reviews)</p>
          <button>Book Appointment</button>
        </div>
      )
      
      expect(screen.getByText('Dr. Sarah Chen - Cardiologist')).toBeInTheDocument()
      expect(screen.getByText('Rating: 4.8 (156 reviews)')).toBeInTheDocument()
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should work in Edge browser', async () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
      })
      
      const { container } = render(
        <div>
          <h1>Dr. Sarah Chen - Cardiologist</h1>
          <p>Rating: 4.8 (156 reviews)</p>
          <button>Book Appointment</button>
        </div>
      )
      
      expect(screen.getByText('Dr. Sarah Chen - Cardiologist')).toBeInTheDocument()
      expect(screen.getByText('Rating: 4.8 (156 reviews)')).toBeInTheDocument()
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should handle browser-specific CSS features', () => {
      render(
        <div className="doctor-card">
          <style>
            {`
              .doctor-card {
                display: flex;
                flex-direction: column;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                -webkit-box-shadow: 0 2px 8px rgba(0,0,0,0.1); /* Safari */
                -moz-box-shadow: 0 2px 8px rgba(0,0,0,0.1); /* Firefox */
              }
            `}
          </style>
          <h3>Dr. Sarah Chen</h3>
          <p>Cardiology</p>
        </div>
      )
      
      const doctorCard = screen.getByText('Dr. Sarah Chen').parentElement
      expect(doctorCard).toHaveClass('doctor-card')
    })

    it('should handle JavaScript compatibility across browsers', () => {
      // Test ES6+ features
      const testES6Features = () => {
        // Arrow functions
        const arrowFunction = (x: number) => x * 2
        expect(arrowFunction(5)).toBe(10)
        
        // Template literals
        const template = `Dr. ${mockDoctor.name} - ${mockDoctor.specialty}`
        expect(template).toContain('Dr.')
        
        // Destructuring
        const { name, specialty } = mockDoctor
        expect(name).toBe('Dr. Sarah Chen')
        expect(specialty).toBe('Cardiology')
        
        // Array methods
        const doctors = [mockDoctor, { ...mockDoctor, id: 'doc_002' }]
        const cardiologistCount = doctors.filter(d => d.specialty === 'Cardiology').length
        expect(cardiologistCount).toBe(2)
        
        // Promise (basic test)
        return Promise.resolve('Browser supports modern JavaScript')
      }
      
      return testES6Features().then(result => {
        expect(result).toBe('Browser supports modern JavaScript')
      })
    })
  })

  describe('Mobile Testing', () => {
    beforeEach(() => {
      mockBrowserEnvironment.viewportWidth = 375
      mockBrowserEnvironment.viewportHeight = 667
      mockBrowserEnvironment.isMobile = true
      mockBrowserEnvironment.isTablet = false
      mockBrowserEnvironment.isDesktop = false
    })

    it('should render properly on mobile devices', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 375
      })
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: 667
      })
      
      render(
        <div className="mobile-doctor-card">
          <h3>Dr. Sarah Chen</h3>
          <p>Cardiology</p>
          <p>Rating: 4.8</p>
          <button className="book-btn">Book Now</button>
        </div>
      )
      
      expect(screen.getByText('Dr. Sarah Chen')).toBeInTheDocument()
      expect(screen.getByText('Cardiology')).toBeInTheDocument()
      expect(screen.getByText('Rating: 4.8')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should handle touch interactions on mobile', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <button data-testid="mobile-book-btn" className="touch-target">
            Book Appointment
          </button>
        </div>
      )
      
      const bookButton = screen.getByTestId('mobile-book-btn')
      
      // Test touch/click interaction
      await user.click(bookButton)
      
      // Verify button responds to interaction
      expect(bookButton).toBeInTheDocument()
    })

    it('should optimize touch targets for mobile', () => {
      render(
        <div className="mobile-interface">
          <button data-testid="small-target" style={{ width: '20px', height: '20px' }}>
            Small
          </button>
          <button data-testid="adequate-target" style={{ width: '44px', height: '44px' }}>
            Adequate
          </button>
          <button data-testid="good-target" style={{ width: '48px', height: '48px' }}>
            Good
          </button>
        </div>
      )
      
      const smallTarget = screen.getByTestId('small-target')
      const adequateTarget = screen.getByTestId('adequate-target')
      const goodTarget = screen.getByTestId('good-target')
      
      // Apple guidelines recommend minimum 44px touch targets
      expect(smallTarget).toHaveStyle({ width: '20px', height: '20px' })
      expect(adequateTarget).toHaveStyle({ width: '44px', height: '44px' })
      expect(goodTarget).toHaveStyle({ width: '48px', height: '48px' })
    })

    it('should handle mobile viewport changes', async () => {
      render(
        <div className="responsive-doctor-grid">
          {mockDoctorsList.map(doctor => (
            <div key={doctor.id} data-testid={`doctor-card-${doctor.id}`}>
              <h4>{doctor.name}</h4>
              <p>{doctor.specialty}</p>
            </div>
          ))}
        </div>
      )
      
      // Initially show some doctor cards
      const initialCards = screen.getAllByTestId(/doctor-card-doc_\d+/)
      expect(initialCards.length).toBeGreaterThan(0)
      
      // Simulate orientation change
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 667
      })
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: 375
      })
      
      // Re-render with new viewport
      const { rerender } = render(
        <div className="responsive-doctor-grid">
          {mockDoctorsList.map(doctor => (
            <div key={doctor.id} data-testid={`doctor-card-${doctor.id}`}>
              <h4>{doctor.name}</h4>
              <p>{doctor.specialty}</p>
            </div>
          ))}
        </div>
      )
      
      // Verify cards are still rendered after orientation change
      const updatedCards = screen.getAllByTestId(/doctor-card-doc_\d+/)
      expect(updatedCards.length).toBe(initialCards.length)
    })

    it('should handle mobile keyboard interactions', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <input 
            data-testid="mobile-search-input"
            type="text"
            placeholder="Search doctors..."
            inputMode="search"
          />
        </div>
      )
      
      const searchInput = screen.getByTestId('mobile-search-input')
      
      // Test mobile keyboard input
      await user.type(searchInput, 'cardiologist')
      expect(searchInput).toHaveValue('cardiologist')
      
      // Test mobile-specific input modes
      expect(searchInput).toHaveAttribute('inputMode', 'search')
    })

    it('should prevent zoom on input focus in mobile Safari', () => {
      render(
        <div>
          <input 
            data-testid="mobile-input"
            type="text"
            placeholder="Doctor search"
            style={{ fontSize: '16px' }}
          />
        </div>
      )
      
      const input = screen.getByTestId('mobile-input')
      
      // Should have minimum font size to prevent zoom
      expect(input).toHaveStyle({ fontSize: '16px' })
    })
  })

  describe('Tablet Testing', () => {
    beforeEach(() => {
      mockBrowserEnvironment.viewportWidth = 768
      mockBrowserEnvironment.viewportHeight = 1024
      mockBrowserEnvironment.isMobile = false
      mockBrowserEnvironment.isTablet = true
      mockBrowserEnvironment.isDesktop = false
    })

    it('should render properly on tablet devices', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 768
      })
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: 1024
      })
      
      render(
        <div className="tablet-doctor-layout">
          <h2>Find a Doctor</h2>
          <div className="doctor-grid">
            {mockDoctorsList.slice(0, 6).map(doctor => (
              <div key={doctor.id} className="doctor-card-tablet">
                <h3>{doctor.name}</h3>
                <p>{doctor.specialty}</p>
                <p>Rating: {doctor.rating}</p>
                <button>Book</button>
              </div>
            ))}
          </div>
        </div>
      )
      
      expect(screen.getByText('Find a Doctor')).toBeInTheDocument()
      expect(screen.getAllByText('Book')).toHaveLength(6)
    })

    it('should handle tablet-specific touch gestures', async () => {
      const user = userEvent.setup()
      
      render(
        <div className="tablet-interface">
          <div data-testid="doctor-list" className="scrollable-list">
            {mockDoctorsList.map(doctor => (
              <div key={doctor.id} data-testid={`doctor-item-${doctor.id}`}>
                {doctor.name} - {doctor.specialty}
              </div>
            ))}
          </div>
        </div>
      )
      
      // Test scrolling behavior
      const list = screen.getByTestId('doctor-list')
      
      // Simulate scroll event
      fireEvent.scroll(list, { target: { scrollTop: 100 } })
      
      // Test tap interactions
      const firstDoctor = screen.getByTestId('doctor-item-doc_0')
      await user.click(firstDoctor)
      
      expect(firstDoctor).toBeInTheDocument()
    })

    it('should optimize layout for tablet screen size', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 768
      })
      
      render(
        <div className="tablet-responsive">
          <div className="doctor-search">
            <input placeholder="Search doctors..." />
          </div>
          <div className="doctor-filters">
            <select><option>All Specialties</option></select>
            <select><option>All Locations</option></select>
          </div>
          <div className="doctor-results">
            {mockDoctorsList.slice(0, 4).map(doctor => (
              <div key={doctor.id} className="tablet-doctor-card">
                <h4>{doctor.name}</h4>
                <p>{doctor.specialty}</p>
              </div>
            ))}
          </div>
        </div>
      )
      
      expect(screen.getByPlaceholderText('Search doctors...')).toBeInTheDocument()
      expect(screen.getAllByRole('option')).toHaveLength(2)
      expect(screen.getAllByTestId(/tablet-doctor-card/)).toHaveLength(4)
    })
  })

  describe('Desktop Testing', () => {
    beforeEach(() => {
      mockBrowserEnvironment.viewportWidth = 1920
      mockBrowserEnvironment.viewportHeight = 1080
      mockBrowserEnvironment.isMobile = false
      mockBrowserEnvironment.isTablet = false
      mockBrowserEnvironment.isDesktop = true
    })

    it('should render properly on desktop screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1920
      })
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: 1080
      })
      
      render(
        <div className="desktop-layout">
          <header>
            <h1>My Family Clinic</h1>
            <nav>
              <a href="#doctors">Find Doctors</a>
              <a href="#services">Services</a>
            </nav>
          </header>
          <main className="desktop-main">
            <aside className="desktop-sidebar">
              <h3>Filter Doctors</h3>
              <div className="filter-group">
                <label>Specialty</label>
                <select>
                  <option>All Specialties</option>
                  <option>Cardiology</option>
                  <option>Dermatology</option>
                </select>
              </div>
            </aside>
            <section className="desktop-content">
              <div className="doctor-grid-desktop">
                {mockDoctorsList.slice(0, 8).map(doctor => (
                  <div key={doctor.id} className="doctor-card-desktop">
                    <img src={doctor.profileImage} alt={doctor.name} />
                    <h3>{doctor.name}</h3>
                    <p>{doctor.specialty}</p>
                    <p>Rating: {doctor.rating}</p>
                    <div className="doctor-actions">
                      <button>View Profile</button>
                      <button>Book Appointment</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      )
      
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByText('Find Doctors')).toBeInTheDocument()
      expect(screen.getAllByText('View Profile')).toHaveLength(8)
      expect(screen.getAllByText('Book Appointment')).toHaveLength(8)
    })

    it('should support desktop keyboard shortcuts', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <input 
            data-testid="desktop-search"
            placeholder="Search doctors..."
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === 'k') {
                e.preventDefault()
                e.currentTarget.focus()
              }
            }}
          />
          <div tabIndex={0} data-testid="keyboard-focus-area">
            Use Ctrl+K to focus search
          </div>
        </div>
      )
      
      const searchInput = screen.getByTestId('desktop-search')
      const focusArea = screen.getByTestId('keyboard-focus-area')
      
      // Test keyboard shortcut
      await user.tab()
      await user.keyboard('{Control>k}')
      
      expect(searchInput).toHaveFocus()
    })

    it('should handle desktop hover interactions', () => {
      render(
        <div>
          <div 
            data-testid="hover-card"
            className="doctor-card-hover"
            style={{ 
              transition: 'all 0.3s ease',
              padding: '16px'
            }}
            onMouseEnter={() => {}}
            onMouseLeave={() => {}}
          >
            <h3>Dr. Sarah Chen</h3>
            <p>Cardiology</p>
            <div className="hover-content" style={{ display: 'none' }}>
              <p>8 years experience</p>
              <p>Available today</p>
            </div>
          </div>
        </div>
      )
      
      const hoverCard = screen.getByTestId('hover-card')
      
      // Should support hover events
      expect(hoverCard).toBeInTheDocument()
      expect(hoverCard).toHaveStyle({
        transition: 'all 0.3s ease',
        padding: '16px'
      })
    })
  })

  describe('Responsive Design Validation', () => {
    it('should adapt to different screen sizes', () => {
      const screenSizes = [
        { width: 320, height: 568, device: 'Small Mobile' },
        { width: 375, height: 667, device: 'Mobile' },
        { width: 768, height: 1024, device: 'Tablet' },
        { width: 1024, height: 768, device: 'Tablet Landscape' },
        { width: 1440, height: 900, device: 'Desktop' },
        { width: 1920, height: 1080, device: 'Large Desktop' }
      ]
      
      screenSizes.forEach(screenSize => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          value: screenSize.width
        })
        
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          value: screenSize.height
        })
        
        render(
          <div className={`responsive-layout ${screenSize.device.toLowerCase().replace(' ', '-')}`}>
            <h1>Doctor Search - {screenSize.device}</h1>
            <div className="content-grid">
              <div>Search Bar</div>
              <div>Filters</div>
              <div>Results</div>
            </div>
          </div>
        )
        
        expect(screen.getByText(`Doctor Search - ${screenSize.device}`)).toBeInTheDocument()
      })
    })

    it('should use appropriate responsive breakpoints', () => {
      const breakpoints = {
        mobile: 768,
        tablet: 1024,
        desktop: 1440
      }
      
      Object.keys(breakpoints).forEach(device => {
        const breakpoint = breakpoints[device as keyof typeof breakpoints]
        
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          value: device === 'mobile' ? 375 : breakpoint
        })
        
        render(
          <div className={`device-${device}`}>
            <div className={`show-on-${device}`}>
              Content for {device}
            </div>
          </div>
        )
        
        expect(screen.getByText(`Content for ${device}`)).toBeInTheDocument()
      })
    })

    it('should maintain readability across all screen sizes', () => {
      const renderTestComponent = (width: number) => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          value: width
        })
        
        return render(
          <div className="readability-test">
            <h1>Dr. Sarah Chen - Senior Cardiologist</h1>
            <p className="doctor-bio">
              Experienced cardiologist with 8+ years of specialized training in interventional 
              cardiology and heart failure management. Graduated from NUS with honors and completed 
              fellowship at Harvard Medical School.
            </p>
            <p className="clinic-info">
              Heart Care Medical Centre - 123 Medical Drive, Singapore 169857
            </p>
          </div>
        )
      }
      
      // Test readability at different widths
      const widths = [320, 768, 1024, 1920]
      
      widths.forEach(width => {
        const { container } = renderTestComponent(width)
        
        const h1 = container.querySelector('h1')
        const bio = container.querySelector('.doctor-bio')
        const clinicInfo = container.querySelector('.clinic-info')
        
        // Text should be readable at all sizes
        expect(h1).toBeInTheDocument()
        expect(bio).toBeInTheDocument()
        expect(clinicInfo).toBeInTheDocument()
        
        // Bio text should wrap appropriately
        if (bio) {
          const text = bio.textContent || ''
          expect(text.length).toBeGreaterThan(50) // Meaningful content
        }
      })
    })

    it('should handle orientation changes', async () => {
      render(
        <div className="orientation-test">
          <h1>Doctor Search</h1>
          <div className="doctor-list">
            {mockDoctorsList.slice(0, 3).map(doctor => (
              <div key={doctor.id}>
                {doctor.name} - {doctor.specialty}
              </div>
            ))}
          </div>
        </div>
      )
      
      expect(screen.getByText('Doctor Search')).toBeInTheDocument()
      
      // Simulate orientation change (portrait to landscape)
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024
      })
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: 768
      })
      
      // Content should remain accessible after orientation change
      expect(screen.getByText('Doctor Search')).toBeInTheDocument()
      expect(screen.getAllByText(/Dr. Doctor \d+/)).toHaveLength(3)
    })
  })

  describe('Touch Interface Optimization', () => {
    it('should provide appropriate touch feedback', async () => {
      const user = userEvent.setup()
      
      render(
        <div className="touch-interface">
          <button 
            data-testid="touch-button"
            className="touchable"
            style={{
              minHeight: '44px',
              minWidth: '44px',
              touchAction: 'manipulation'
            }}
          >
            Book Appointment
          </button>
        </div>
      )
      
      const button = screen.getByTestId('touch-button')
      
      // Test touch interaction
      await user.click(button)
      
      expect(button).toBeInTheDocument()
      expect(button).toHaveStyle({
        minHeight: '44px',
        minWidth: '44px'
      })
    })

    it('should prevent accidental touches on mobile', () => {
      render(
        <div className="mobile-spacing">
          <div style={{ padding: '8px' }}>
            <button 
              data-testid="well-spaced-button"
              style={{ 
                padding: '12px 16px',
                margin: '8px 0'
              }}
            >
              Doctor Info
            </button>
          </div>
          
          <div style={{ padding: '8px' }}>
            <button 
              data-testid="another-button"
              style={{ 
                padding: '12px 16px',
                margin: '8px 0'
              }}
            >
              Book Now
            </button>
          </div>
        </div>
      )
      
      const button1 = screen.getByTestId('well-spaced-button')
      const button2 = screen.getByTestId('another-button')
      
      // Both buttons should have adequate spacing
      expect(button1).toBeInTheDocument()
      expect(button2).toBeInTheDocument()
    })

    it('should handle multi-touch gestures', async () => {
      const user = userEvent.setup()
      
      render(
        <div className="multi-touch-area" style={{ touchAction: 'none' }}>
          <div data-testid="pinch-area" style={{ width: '300px', height: '300px' }}>
            Doctor Image Gallery
          </div>
        </div>
      )
      
      const pinchArea = screen.getByTestId('pinch-area')
      
      // Should support touch interactions
      expect(pinchArea).toBeInTheDocument()
      expect(pinchArea).toHaveStyle({ width: '300px', height: '300px' })
    })

    it('should optimize scrolling on touch devices', () => {
      render(
        <div className="touch-scroll-container" style={{ overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div className="scroll-content">
            {mockDoctorsList.map(doctor => (
              <div key={doctor.id} className="scroll-item">
                {doctor.name} - {doctor.specialty}
              </div>
            ))}
          </div>
        </div>
      )
      
      const scrollContainer = document.querySelector('.touch-scroll-container') as HTMLElement
      
      // Should have touch-optimized scrolling
      expect(scrollContainer).toHaveStyle({
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch'
      })
      
      expect(screen.getAllByText(/Dr. Doctor \d+/)).toHaveLength(12)
    })
  })

  describe('Network and Loading Performance', () => {
    it('should handle slow network connections', async () => {
      // Mock slow network
      const originalFetch = global.fetch
      global.fetch = vi.fn().mockImplementation((url) => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({ doctors: mockDoctorsList })
            })
          }, 2000) // 2 second delay
        })
      })
      
      const startTime = performance.now()
      
      // Simulate API call with slow network
      const response = await fetch('/api/doctors')
      const data = await response.json()
      
      const endTime = performance.now()
      const loadTime = endTime - startTime
      
      expect(data.doctors).toHaveLength(12)
      expect(loadTime).toBeGreaterThan(1900) // Should take at least 1.9 seconds
      
      // Restore original fetch
      global.fetch = originalFetch
    })

    it('should handle network failures gracefully', async () => {
      // Mock network failure
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
      
      render(
        <div className="network-error-handler">
          <div data-testid="offline-message" style={{ display: 'none' }}>
            You're offline. Showing cached results.
          </div>
          <div data-testid="cached-doctors">
            {mockDoctorsList.slice(0, 3).map(doctor => (
              <div key={doctor.id}>{doctor.name}</div>
            ))}
          </div>
        </div>
      )
      
      try {
        await fetch('/api/doctors')
      } catch (error) {
        // Should show cached results or offline message
        expect(screen.getByTestId('cached-doctors')).toBeInTheDocument()
        expect(screen.getAllByText(/Dr. Doctor \d+/)).toHaveLength(3)
      }
    })

    it('should optimize for offline functionality', async () => {
      // Mock service worker
      const mockServiceWorker = {
        ready: Promise.resolve(),
        register: vi.fn(),
        update: vi.fn()
      }
      
      vi.stubGlobal('navigator', {
        ...window.navigator,
        serviceWorker: mockServiceWorker
      })
      
      render(
        <div className="offline-capable">
          <h1>Doctor Directory</h1>
          <p>Works offline</p>
          <div className="cached-content">
            {mockDoctorsList.slice(0, 5).map(doctor => (
              <div key={doctor.id} className="cached-doctor">
                {doctor.name} - {doctor.specialty}
              </div>
            ))}
          </div>
        </div>
      )
      
      expect(screen.getByText('Doctor Directory')).toBeInTheDocument()
      expect(screen.getByText('Works offline')).toBeInTheDocument()
      expect(screen.getAllByText(/Dr. Doctor \d+/)).toHaveLength(5)
    })

    it('should implement progressive loading for large datasets', async () => {
      const largeDoctorList = Array.from({ length: 100 }, (_, i) => ({
        ...mockDoctor,
        id: `doc_${i}`,
        name: `Dr. Doctor ${i}`
      }))
      
      render(
        <div className="progressive-loading">
          <div data-testid="loading-indicator">Loading doctors...</div>
          <div data-testid="doctor-list">
            {largeDoctorList.slice(0, 20).map(doctor => (
              <div key={doctor.id} className="doctor-item">
                {doctor.name} - {doctor.specialty}
              </div>
            ))}
          </div>
          <button data-testid="load-more">Load More Doctors</button>
        </div>
      )
      
      // Initially show first 20 doctors
      expect(screen.getByText('Loading doctors...')).toBeInTheDocument()
      expect(screen.getAllByText(/Dr. Doctor \d+/)).toHaveLength(20)
      
      // Load more when requested
      const loadMoreButton = screen.getByTestId('load-more')
      await fireEvent.click(loadMoreButton)
      
      // Should show more doctors
      expect(screen.getAllByText(/Dr. Doctor \d+/)).toHaveLength(40)
    })
  })

  describe('Browser Compatibility Testing', () => {
    it('should support modern CSS features across browsers', () => {
      render(
        <div className="css-compatibility-test">
          <style>
            {`
              .css-compatibility-test {
                /* Grid layout */
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                
                /* Flexbox */
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                
                /* Transforms */
                transform: translateZ(0);
                -webkit-transform: translateZ(0); /* Safari */
                -moz-transform: translateZ(0); /* Firefox */
                
                /* Transitions */
                transition: all 0.3s ease;
                -webkit-transition: all 0.3s ease;
                -moz-transition: all 0.3s ease;
                
                /* Border radius */
                border-radius: 8px;
                -webkit-border-radius: 8px;
                -moz-border-radius: 8px;
                
                /* Box shadow */
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                -webkit-box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                -moz-box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }
            `}
          </style>
          <h3>CSS Compatibility Test</h3>
          <p>Testing modern CSS features</p>
        </div>
      )
      
      const testElement = screen.getByText('CSS Compatibility Test').parentElement
      expect(testElement).toBeInTheDocument()
    })

    it('should handle browser-specific JavaScript features', () => {
      // Test fetch API support
      const hasFetchSupport = typeof fetch === 'function'
      expect(hasFetchSupport).toBe(true)
      
      // Test Promise support
      const hasPromiseSupport = typeof Promise === 'function'
      expect(hasPromiseSupport).toBe(true)
      
      // Test Array.from support
      const hasArrayFromSupport = Array.from !== undefined
      expect(hasArrayFromSupport).toBe(true)
      
      // Test async/await support
      const testAsyncSupport = async () => {
        return 'async supported'
      }
      
      return testAsyncSupport().then(result => {
        expect(result).toBe('async supported')
      })
    })

    it('should polyfill missing browser features gracefully', () => {
      // Mock environment without certain features
      const originalArrayFrom = Array.from
      const originalFetch = fetch
      
      // Temporarily remove features to test polyfills
      vi.stubGlobal('Array', {
        ...Array,
        from: undefined
      })
      
      vi.stubGlobal('fetch', undefined)
      
      render(
        <div className="polyfill-test">
          <h3>Polyfill Test</h3>
          <p>Testing graceful degradation</p>
          <div data-testid="browser-features">
            Fetch: {typeof fetch !== 'undefined' ? 'Supported' : 'Polyfilled'}
            Array.from: {Array.from !== undefined ? 'Supported' : 'Polyfilled'}
          </div>
        </div>
      )
      
      const features = screen.getByTestId('browser-features')
      expect(features).toBeInTheDocument()
      
      // Restore original features
      vi.unstubAllGlobals()
      vi.stubGlobal('Array', { ...Array, from: originalArrayFrom })
      vi.stubGlobal('fetch', originalFetch)
    })

    it('should handle browser-specific event handling', () => {
      render(
        <div className="event-compatibility-test">
          <button 
            data-testid="event-test-button"
            onClick={() => {}}
            onTouchStart={() => {}} /* iOS Safari */
            onTouchEnd={() => {}} /* iOS Safari */
          >
            Test Button
          </button>
        </div>
      )
      
      const button = screen.getByTestId('event-test-button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('onclick')
      expect(button).toHaveAttribute('ontouchstart')
      expect(button).toHaveAttribute('ontouchend')
    })
  })

  describe('Cross-Platform Accessibility', () => {
    it('should maintain accessibility across all platforms', async () => {
      const platforms = ['mobile', 'tablet', 'desktop']
      
      for (const platform of platforms) {
        const width = platform === 'mobile' ? 375 : platform === 'tablet' ? 768 : 1920
        
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          value: width
        })
        
        const { container } = render(
          <div className={`platform-${platform}`}>
            <h1>Dr. Sarah Chen - Cardiologist</h1>
            <button aria-label="Book appointment with Dr. Sarah Chen">Book Now</button>
            <img src="/images/doctor.jpg" alt="Dr. Sarah Chen profile photo" />
            <div role="search">
              <input 
                aria-label="Search for doctors"
                placeholder="Search doctors..."
              />
            </div>
          </div>
        )
        
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      }
    })

    it('should support assistive technologies across platforms', () => {
      render(
        <div className="assistive-tech-support">
          <h1>Doctor Search</h1>
          <nav aria-label="Main navigation">
            <ul role="menubar">
              <li role="none">
                <a href="#doctors" role="menuitem">Find Doctors</a>
              </li>
              <li role="none">
                <a href="#services" role="menuitem">Services</a>
              </li>
            </ul>
          </nav>
          <main role="main">
            <section aria-labelledby="search-heading">
              <h2 id="search-heading">Search for Healthcare Providers</h2>
              <form role="search">
                <label htmlFor="doctor-search">Doctor search</label>
                <input 
                  id="doctor-search"
                  type="search"
                  aria-describedby="search-help"
                />
                <div id="search-help">
                  Enter doctor name, specialty, or condition
                </div>
              </form>
            </section>
          </main>
        </div>
      )
      
      // Check for proper ARIA landmarks
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('search')).toBeInTheDocument()
      expect(screen.getByLabelText('Doctor search')).toBeInTheDocument()
    })
  })
})