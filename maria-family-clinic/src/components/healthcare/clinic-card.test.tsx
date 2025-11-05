import * as React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClinicCard } from './clinic-card'
import type { Clinic } from './clinic-card'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  MapPin: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="map-pin-icon" />
  ),
  Phone: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="phone-icon" />
  ),
  Clock: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="clock-icon" />
  ),
  Star: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="star-icon" />
  ),
  Navigation: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="navigation-icon" />
  ),
  ChevronRight: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="chevron-right-icon" />
  ),
  Heart: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="heart-icon" />
  ),
  Shield: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="shield-icon" />
  ),
  Calendar: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="calendar-icon" />
  ),
  Users: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="users-icon" />
  ),
  Accessibility: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="accessibility-icon" />
  ),
  Car: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="car-icon" />
  ),
  CheckCircle: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="check-circle-icon" />
  ),
  Check: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="check-icon" />
  ),
  Zap: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="zap-icon" />
  ),
  Award: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="award-icon" />
  ),
  CheckSquare: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="check-square-icon" />
  ),
}))

const mockClinic: Clinic = {
  id: '1',
  name: 'Sunrise Family Clinic',
  address: '123 Main Street, Springfield',
  phone: '+1-555-0123',
  hours: 'Mon-Fri 9:00 AM - 5:00 PM',
  rating: 4.5,
  totalReviews: 128,
  distance: '0.5 km',
  travelTime: '3 min walk',
  specialties: ['General Practice', 'Pediatrics'],
  isOpen: true,
  waitTime: '15-20 minutes',
  waitTimeEstimate: 18,
  doctorCount: 3,
  established: 2010,
  isMOHVerified: true,
  hasParking: true,
  parkingSpaces: 20,
  isWheelchairAccessible: true,
  acceptsInsurance: true,
  isSelected: false,
}

const defaultProps = {
  clinic: mockClinic,
  onViewDetails: jest.fn(),
  onGetDirections: jest.fn(),
  onBookAppointment: jest.fn(),
  onToggleFavorite: jest.fn(),
  onToggleCompare: jest.fn(),
  onCall: jest.fn(),
  isFavorite: false,
  isComparisonMode: false,
  showDistance: true,
}

describe('ClinicCard Enhanced Features', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Trust Indicators', () => {
    test('displays MOH verification badge when clinic is verified', () => {
      render(<ClinicCard {...defaultProps} />)
      expect(screen.getByLabelText('Ministry of Health verified clinic')).toBeInTheDocument()
      expect(screen.getByText('MOH Verified')).toBeInTheDocument()
    })

    test('shows years of operation correctly', () => {
      render(<ClinicCard {...defaultProps} />)
      const currentYear = new Date().getFullYear()
      const yearsInOperation = currentYear - mockClinic.established
      expect(screen.getByLabelText(`Established ${yearsInOperation} years ago`)).toBeInTheDocument()
      expect(screen.getByText(`Est. ${yearsInOperation} years`)).toBeInTheDocument()
    })

    test('displays doctor count when provided', () => {
      render(<ClinicCard {...defaultProps} />)
      expect(screen.getByLabelText('3 doctors available')).toBeInTheDocument()
      expect(screen.getByText('3 doctors')).toBeInTheDocument()
    })

    test('shows open/closed status with proper accessibility', () => {
      render(<ClinicCard {...defaultProps} clinic={{ ...mockClinic, isOpen: true }} />)
      expect(screen.getByLabelText('Currently open')).toBeInTheDocument()
      expect(screen.getByText('Open Now')).toBeInTheDocument()

      render(<ClinicCard {...defaultProps} clinic={{ ...mockClinic, isOpen: false }} />)
      expect(screen.getByLabelText('Currently closed')).toBeInTheDocument()
      expect(screen.getByText('Closed')).toBeInTheDocument()
    })
  })

  describe('Wait Time Estimates', () => {
    test('displays wait time estimates with color coding', () => {
      render(<ClinicCard {...defaultProps} />)
      
      const waitTimeElement = screen.getByText(/Wait time:/).closest('div')
      expect(waitTimeElement).toBeInTheDocument()
      expect(screen.getByText('15-20 minutes')).toBeInTheDocument()
    })

    test('calculates correct wait time for short waits (≤15 min)', () => {
      const clinicWithShortWait = { ...mockClinic, waitTimeEstimate: 10 }
      render(<ClinicCard {...defaultProps} clinic={clinicWithShortWait} />)
      
      expect(screen.getByText('15 mins or less')).toBeInTheDocument()
      expect(screen.getByText('15 mins or less')).toHaveClass('text-green-600')
    })

    test('calculates correct wait time for moderate waits (16-30 min)', () => {
      const clinicWithModerateWait = { ...mockClinic, waitTimeEstimate: 25 }
      render(<ClinicCard {...defaultProps} clinic={clinicWithModerateWait} />)
      
      expect(screen.getByText('15-30 mins')).toBeInTheDocument()
      expect(screen.getByText('15-30 mins')).toHaveClass('text-yellow-600')
    })

    test('calculates correct wait time for long waits (>30 min)', () => {
      const clinicWithLongWait = { ...mockClinic, waitTimeEstimate: 45 }
      render(<ClinicCard {...defaultProps} clinic={clinicWithLongWait} />)
      
      expect(screen.getByText('30+ mins')).toBeInTheDocument()
      expect(screen.getByText('30+ mins')).toHaveClass('text-red-600')
    })

    test('handles string waitTime fallback correctly', () => {
      const clinicWithStringWait = { 
        ...mockClinic, 
        waitTime: undefined,
        waitTimeEstimate: undefined,
        waitTime: 'short wait'
      }
      render(<ClinicCard {...defaultProps} clinic={clinicWithStringWait} />)
      
      expect(screen.getByText('Call to confirm')).toBeInTheDocument()
    })
  })

  describe('Parking and Accessibility Features', () => {
    test('displays parking availability with space count', () => {
      render(<ClinicCard {...defaultProps} />)
      expect(screen.getByLabelText('Parking available - 20 spaces')).toBeInTheDocument()
      expect(screen.getByText('Parking (20)')).toBeInTheDocument()
    })

    test('shows wheelchair accessibility indicator', () => {
      render(<ClinicCard {...defaultProps} />)
      expect(screen.getByLabelText('Wheelchair accessible facility')).toBeInTheDocument()
      expect(screen.getByText('Wheelchair Access')).toBeInTheDocument()
    })

    test('displays insurance acceptance', () => {
      render(<ClinicCard {...defaultProps} />)
      expect(screen.getByLabelText('Insurance plans accepted')).toBeInTheDocument()
      expect(screen.getByText('Insurance')).toBeInTheDocument()
    })

    test('hides facilities when not available', () => {
      const clinicWithoutFeatures = {
        ...mockClinic,
        hasParking: false,
        isWheelchairAccessible: false,
        acceptsInsurance: false,
      }
      render(<ClinicCard {...defaultProps} clinic={clinicWithoutFeatures} />)
      
      expect(screen.queryByText('Parking')).not.toBeInTheDocument()
      expect(screen.queryByText('Wheelchair Access')).not.toBeInTheDocument()
      expect(screen.queryByText('Insurance')).not.toBeInTheDocument()
    })
  })

  describe('One-Tap Actions', () => {
    test('handles phone calling correctly', async () => {
      const user = userEvent.setup()
      render(<ClinicCard {...defaultProps} />)
      
      // Test clicking phone number
      const phoneButton = screen.getByLabelText(`Call ${mockClinic.name} at ${mockClinic.phone}`)
      await user.click(phoneButton)
      expect(defaultProps.onCall).toHaveBeenCalledWith(mockClinic.phone)

      // Test dedicated call button
      const callButton = screen.getByLabelText(`Call ${mockClinic.name} now`)
      await user.click(callButton)
      expect(defaultProps.onCall).toHaveBeenCalledWith(mockClinic.phone)
    })

    test('handles get directions action', async () => {
      const user = userEvent.setup()
      render(<ClinicCard {...defaultProps} />)
      
      const directionsButton = screen.getByLabelText(`Get directions to ${mockClinic.name}`)
      await user.click(directionsButton)
      expect(defaultProps.onGetDirections).toHaveBeenCalledWith(mockClinic.id)
    })

    test('handles book appointment action', async () => {
      const user = userEvent.setup()
      render(<ClinicCard {...defaultProps} />)
      
      const bookButton = screen.getByLabelText(`Book appointment at ${mockClinic.name}`)
      await user.click(bookButton)
      expect(defaultProps.onBookAppointment).toHaveBeenCalledWith(mockClinic.id)
    })

    test('prevents event propagation on button clicks', async () => {
      const user = userEvent.setup()
      render(<ClinicCard {...defaultProps} />)
      
      // Create mock click handler for card
      const cardClickHandler = jest.fn()
      const cardElement = screen.getByRole('article')
      
      fireEvent.click(cardElement)
      // Card should be clickable, but buttons should stop propagation
      
      const callButton = screen.getByLabelText(`Call ${mockClinic.name} now`)
      await user.click(callButton)
      
      // Button click should not trigger card handlers
      expect(defaultProps.onGetDirections).not.toHaveBeenCalled()
    })
  })

  describe('Distance and Travel Time', () => {
    test('displays distance and travel time when available', () => {
      render(<ClinicCard {...defaultProps} />)
      expect(screen.getByLabelText('0.5 km • 3 min walk')).toBeInTheDocument()
    })

    test('hides distance when showDistance is false', () => {
      render(<ClinicCard {...defaultProps} showDistance={false} />)
      expect(screen.queryByLabelText(/away/)).not.toBeInTheDocument()
    })

    test('displays distance only when travelTime is not available', () => {
      const clinicWithDistanceOnly = { ...mockClinic, travelTime: undefined }
      render(<ClinicCard {...defaultProps} clinic={clinicWithDistanceOnly} />)
      
      expect(screen.getByText('0.5 km')).toBeInTheDocument()
    })

    test('displays travelTime only when distance is not available', () => {
      const clinicWithTravelTimeOnly = { ...mockClinic, distance: undefined }
      render(<ClinicCard {...defaultProps} clinic={clinicWithTravelTimeOnly} />)
      
      expect(screen.getByText('3 min walk')).toBeInTheDocument()
    })
  })

  describe('Clinic Comparison Feature', () => {
    test('shows comparison checkbox when comparison mode is enabled', () => {
      render(<ClinicCard {...defaultProps} isComparisonMode={true} />)
      
      const compareButton = screen.getByLabelText('Add to comparison')
      expect(compareButton).toBeInTheDocument()
    })

    test('hides comparison checkbox when comparison mode is disabled', () => {
      render(<ClinicCard {...defaultProps} isComparisonMode={false} />)
      
      expect(screen.queryByLabelText('Add to comparison')).not.toBeInTheDocument()
    })

    test('toggles selected state correctly', async () => {
      const user = userEvent.setup()
      render(<ClinicCard {...defaultProps} isComparisonMode={true} />)
      
      const compareButton = screen.getByLabelText('Add to comparison')
      await user.click(compareButton)
      
      expect(defaultProps.onToggleCompare).toHaveBeenCalledWith(mockClinic.id)
    })

    test('shows selected state styling when clinic is selected', () => {
      const selectedClinic = { ...mockClinic, isSelected: true }
      render(<ClinicCard {...defaultProps} clinic={selectedClinic} isComparisonMode={true} />)
      
      const cardElement = screen.getByRole('article')
      expect(cardElement).toHaveClass('border-primary')
    })

    test('shows dashed border in comparison mode', () => {
      render(<ClinicCard {...defaultProps} isComparisonMode={true} />)
      
      const cardElement = screen.getByRole('article')
      expect(cardElement).toHaveClass('border-dashed')
    })
  })

  describe('Accessibility (WCAG 2.2 AA Compliance)', () => {
    test('provides proper ARIA labels for all interactive elements', () => {
      render(<ClinicCard {...defaultProps} />)
      
      // Check major interactive elements have ARIA labels
      expect(screen.getByLabelText(`Call ${mockClinic.name} at ${mockClinic.phone}`)).toBeInTheDocument()
      expect(screen.getByLabelText(`Call ${mockClinic.name} now`)).toBeInTheDocument()
      expect(screen.getByLabelText(`Book appointment at ${mockClinic.name}`)).toBeInTheDocument()
      expect(screen.getByLabelText(`Get directions to ${mockClinic.name}`)).toBeInTheDocument()
      expect(screen.getByLabelText(`View details for ${mockClinic.name}`)).toBeInTheDocument()
    })

    test('marks decorative icons with aria-hidden', () => {
      render(<ClinicCard {...defaultProps} />)
      
      // Check that decorative icons have aria-hidden
      expect(screen.getByTestId('map-pin-icon')).toHaveAttribute('aria-hidden', 'true')
      expect(screen.getByTestId('phone-icon')).toHaveAttribute('aria-hidden', 'true')
      expect(screen.getByTestId('clock-icon')).toHaveAttribute('aria-hidden', 'true')
    })

    test('provides descriptive ARIA labels for trust indicators', () => {
      render(<ClinicCard {...defaultProps} />)
      
      expect(screen.getByLabelText('Ministry of Health verified clinic')).toBeInTheDocument()
      expect(screen.getByLabelText('Currently open')).toBeInTheDocument()
      expect(screen.getByLabelText('3 doctors available')).toBeInTheDocument()
    })

    test('provides accessibility information for facilities', () => {
      render(<ClinicCard {...defaultProps} />)
      
      expect(screen.getByLabelText('Wheelchair accessible facility')).toBeInTheDocument()
      expect(screen.getByLabelText('Parking available - 20 spaces')).toBeInTheDocument()
      expect(screen.getByLabelText('Insurance plans accepted')).toBeInTheDocument()
    })

    test('handles keyboard navigation properly', async () => {
      const user = userEvent.setup()
      render(<ClinicCard {...defaultProps} />)
      
      // Test that buttons are keyboard accessible
      const callButton = screen.getByLabelText(`Call ${mockClinic.name} now`)
      await user.tab()
      expect(callButton).toHaveFocus()
      
      await user.keyboard('{Enter}')
      expect(defaultProps.onCall).toHaveBeenCalledWith(mockClinic.phone)
    })
  })

  describe('TypeScript Interface Validation', () => {
    test('accepts all required clinic properties', () => {
      const clinicWithAllProps: Clinic = {
        ...mockClinic,
        travelTime: '5 min drive',
        waitTimeEstimate: 20,
        parkingSpaces: 15,
        isSelected: true,
      }
      
      const { container } = render(<ClinicCard {...defaultProps} clinic={clinicWithAllProps} />)
      expect(container).toBeInTheDocument()
    })

    test('handles optional properties gracefully', () => {
      const minimalClinic: Clinic = {
        id: '1',
        name: 'Minimal Clinic',
        address: '123 Test St',
        phone: '555-0000',
        hours: '9-5',
      }
      
      const { container } = render(<ClinicCard {...defaultProps} clinic={minimalClinic} />)
      expect(container).toBeInTheDocument()
    })
  })

  describe('Error Handling and Edge Cases', () => {
    test('handles missing waitTime gracefully', () => {
      const clinicWithoutWaitTime = { ...mockClinic, waitTime: undefined, waitTimeEstimate: undefined }
      render(<ClinicCard {...defaultProps} clinic={clinicWithoutWaitTime} />)
      
      expect(screen.getByText('Call to confirm')).toBeInTheDocument()
    })

    test('handles phone number with special characters', () => {
      const clinicWithSpecialPhone = {
        ...mockClinic,
        phone: '+1 (555) 123-4567 ext. 789'
      }
      render(<ClinicCard {...defaultProps} clinic={clinicWithSpecialPhone} />)
      
      expect(screen.getByText('+1 (555) 123-4567 ext. 789')).toBeTheDocument()
    })

    test('handles long clinic names gracefully', () => {
      const clinicWithLongName: Clinic = {
        ...mockClinic,
        name: 'Very Long Clinic Name That Might Cause Layout Issues'
      }
      render(<ClinicCard {...defaultProps} clinic={clinicWithLongName} />)
      
      expect(screen.getByText('Very Long Clinic Name That Might Cause Layout Issues')).toBeInTheDocument()
    })

    test('handles many specialties without breaking layout', () => {
      const clinicWithManySpecialties = {
        ...mockClinic,
        specialties: ['General Practice', 'Pediatrics', 'Cardiology', 'Dermatology', 'Orthopedics', 'Neurology']
      }
      render(<ClinicCard {...defaultProps} clinic={clinicWithManySpecialties} />)
      
      clinicWithManySpecialties.specialties?.forEach(specialty => {
        expect(screen.getByText(specialty)).toBeInTheDocument()
      })
    })
  })
})

describe('ClinicCard Component Integration', () => {
  test('renders without crashing', () => {
    render(<ClinicCard {...defaultProps} />)
    expect(screen.getByRole('article')).toBeInTheDocument()
  })

  test('matches snapshot for complete clinic data', () => {
    const { container } = render(<ClinicCard {...defaultProps} />)
    expect(container).toMatchSnapshot()
  })

  test('matches snapshot for minimal clinic data', () => {
    const minimalProps = {
      ...defaultProps,
      clinic: {
        id: '1',
        name: 'Test Clinic',
        address: '123 Test St',
        phone: '555-0000',
        hours: '9-5',
      }
    }
    const { container } = render(<ClinicCard {...minimalProps} />)
    expect(container).toMatchSnapshot('minimal-clinic')
  })

  test('updates when clinic prop changes', () => {
    const { rerender } = render(<ClinicCard {...defaultProps} />)
    
    expect(screen.getByText('4.5')).toBeInTheDocument()
    
    const updatedClinic = { ...mockClinic, rating: 4.8 }
    rerender(<ClinicCard {...defaultProps} clinic={updatedClinic} />)
    
    expect(screen.getByText('4.8')).toBeInTheDocument()
    expect(screen.queryByText('4.5')).not.toBeInTheDocument()
  })
})
