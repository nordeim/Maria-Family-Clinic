import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DoctorCard } from './doctor-card'
import userEvent from '@testing-library/user-event'

const mockDoctor = {
  id: '1',
  name: 'Sarah Smith',
  specialty: 'Cardiology',
  qualifications: 'MD, FACC',
  experience: '15 years',
  rating: 4.8,
  reviewCount: 245,
  availableSlots: ['Today 2:00 PM', 'Tomorrow 10:00 AM'],
  clinics: ['Main Clinic'],
  languages: ['English', 'Spanish'],
}

describe('DoctorCard', () => {
  it('renders doctor information correctly', () => {
    render(<DoctorCard doctor={mockDoctor} />)
    
    expect(screen.getByText(/Dr. Sarah Smith/i)).toBeInTheDocument()
    expect(screen.getByText(/Cardiology/i)).toBeInTheDocument()
    expect(screen.getByText(/MD, FACC/i)).toBeInTheDocument()
    expect(screen.getByText(/15 years experience/i)).toBeInTheDocument()
    expect(screen.getByText(/4.8/)).toBeInTheDocument()
  })

  it('displays available slots', () => {
    render(<DoctorCard doctor={mockDoctor} />)
    
    expect(screen.getByText(/Today 2:00 PM/i)).toBeInTheDocument()
    expect(screen.getByText(/Tomorrow 10:00 AM/i)).toBeInTheDocument()
  })

  it('displays clinics', () => {
    render(<DoctorCard doctor={mockDoctor} />)
    
    expect(screen.getByText(/Main Clinic/i)).toBeInTheDocument()
  })

  it('displays languages', () => {
    render(<DoctorCard doctor={mockDoctor} />)
    
    expect(screen.getByText(/English/i)).toBeInTheDocument()
    expect(screen.getByText(/Spanish/i)).toBeInTheDocument()
  })

  it('calls onBookAppointment when book button is clicked', async () => {
    const user = userEvent.setup()
    let bookedDoctorId = ''
    const handleBook = (id: string) => {
      bookedDoctorId = id
    }

    render(<DoctorCard doctor={mockDoctor} onBookAppointment={handleBook} />)
    
    const bookButton = screen.getByRole('button', { name: /book appointment/i })
    await user.click(bookButton)
    
    expect(bookedDoctorId).toBe('1')
  })

  it('calls onViewProfile when view profile button is clicked', async () => {
    const user = userEvent.setup()
    let viewedDoctorId = ''
    const handleView = (id: string) => {
      viewedDoctorId = id
    }

    render(
      <DoctorCard
        doctor={mockDoctor}
        onBookAppointment={() => {}}
        onViewProfile={handleView}
      />
    )
    
    const viewButton = screen.getByRole('button', { name: /view profile/i })
    await user.click(viewButton)
    
    expect(viewedDoctorId).toBe('1')
  })

  it('renders compact variant correctly', () => {
    render(<DoctorCard doctor={mockDoctor} compact />)
    
    expect(screen.getByText(/Dr. Sarah Smith/i)).toBeInTheDocument()
    expect(screen.queryByText(/15 years experience/i)).not.toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    const { container } = render(<DoctorCard doctor={mockDoctor} />)
    
    // Card should have proper structure
    expect(container.querySelector('[class*="group"]')).toBeInTheDocument()
    
    // Rating should be visible
    expect(screen.getByText(/4.8/)).toBeInTheDocument()
  })
})
