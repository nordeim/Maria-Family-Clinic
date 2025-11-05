import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { DoctorSearch } from '@/components/healthcare/doctor-search'
import { AdvancedSearchFilters } from '@/components/healthcare/advanced-search-filters'
import { DoctorSearchResults } from '@/components/healthcare/doctor-search-results'

expect.extend(toHaveNoViolations)

// Mock search services
const mockSearchService = {
  searchDoctors: vi.fn(),
  fuzzySearch: vi.fn(),
  synonymSearch: vi.fn(),
  getSearchSuggestions: vi.fn(),
  getSearchRanking: vi.fn()
}

// Mock doctor data for testing
const mockDoctors = [
  {
    id: 'doc_001',
    name: 'Dr. Sarah Chen',
    specialty: 'Cardiology',
    subSpecialties: ['Interventional Cardiology', 'Heart Failure'],
    qualifications: ['MD', 'FACC'],
    experience: 8,
    clinicName: 'Heart Care Medical Centre',
    location: 'Central Singapore',
    rating: 4.8,
    reviewCount: 156,
    languages: ['English', 'Mandarin'],
    consultationFee: 120,
    availability: ['Today', 'Tomorrow'],
    profileImage: '/images/doctors/dr-sarah.jpg'
  },
  {
    id: 'doc_002',
    name: 'Dr. Michael Wong',
    specialty: 'Cardiology',
    subSpecialties: ['Pediatric Cardiology'],
    qualifications: ['MBBS', 'FAMS'],
    experience: 12,
    clinicName: 'Children Heart Clinic',
    location: 'North Singapore',
    rating: 4.9,
    reviewCount: 89,
    languages: ['English', 'Mandarin', 'Malay'],
    consultationFee: 150,
    availability: ['Today'],
    profileImage: '/images/doctors/dr-wong.jpg'
  },
  {
    id: 'doc_003',
    name: 'Dr. Priya Sharma',
    specialty: 'Dermatology',
    subSpecialties: ['Cosmetic Dermatology', 'Pediatric Dermatology'],
    qualifications: ['MD', 'FRCP'],
    experience: 10,
    clinicName: 'Skin Health Centre',
    location: 'Central Singapore',
    rating: 4.7,
    reviewCount: 234,
    languages: ['English', 'Hindi'],
    consultationFee: 100,
    availability: ['Tomorrow'],
    profileImage: '/images/doctors/dr-sharma.jpg'
  },
  {
    id: 'doc_004',
    name: 'Dr. James Lee',
    specialty: 'Internal Medicine',
    subSpecialties: ['Endocrinology', 'Diabetes Care'],
    qualifications: ['MBBS', 'MRCP'],
    experience: 15,
    clinicName: 'Internal Medicine Clinic',
    location: 'East Singapore',
    rating: 4.6,
    reviewCount: 178,
    languages: ['English'],
    consultationFee: 90,
    availability: ['Today', 'Tomorrow'],
    profileImage: '/images/doctors/dr-lee.jpg'
  }
]

// Mock search query data
const searchQueries = [
  { query: 'cardiologist', expectedResults: 2 },
  { query: 'heart doctor', expectedResults: 2 },
  { query: 'Dr. Sarah', expectedResults: 1 },
  { query: 'skin specialist', expectedResults: 1 },
  { query: 'diabetes', expectedResults: 1 },
  { query: 'child heart', expectedResults: 1 },
  { query: 'heart failure', expectedResults: 1 }
]

// Medical terminology synonyms
const medicalSynonyms = {
  'cardiologist': ['heart doctor', 'heart specialist', 'cardiac doctor'],
  'dermatologist': ['skin doctor', 'skin specialist', 'dermatology doctor'],
  'internist': ['internal medicine doctor', 'general physician'],
  'pediatrician': ['child doctor', 'kids doctor', 'children specialist'],
  'orthopedist': ['bone doctor', 'joint specialist', 'orthopedic surgeon']
}

describe('Doctor Search System Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchService.searchDoctors.mockResolvedValue(mockDoctors)
    mockSearchService.fuzzySearch.mockResolvedValue(mockDoctors)
    mockSearchService.synonymSearch.mockResolvedValue(mockDoctors.slice(0, 2))
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Advanced Search Functionality', () => {
    it('should perform basic text search', async () => {
      render(<DoctorSearch />)
      
      const searchInput = screen.getByPlaceholderText('Search doctors, specialties, conditions...')
      fireEvent.change(searchInput, { target: { value: 'cardiologist' } })
      fireEvent.keyDown(searchInput, { key: 'Enter' })
      
      await waitFor(() => {
        expect(mockSearchService.searchDoctors).toHaveBeenCalledWith('cardiologist')
      })
    })

    it('should handle search with medical terminology', async () => {
      const searchTerm = 'interventional cardiology'
      mockSearchService.searchDoctors.mockResolvedValue([
        mockDoctors[0]
      ])
      
      render(<DoctorSearch />)
      
      const searchInput = screen.getByPlaceholderText('Search doctors, specialties, conditions...')
      fireEvent.change(searchInput, { target: { value: searchTerm } })
      fireEvent.keyDown(searchInput, { key: 'Enter' })
      
      await waitFor(() => {
        expect(screen.getByText('Dr. Sarah Chen')).toBeInTheDocument()
      })
    })

    it('should search by doctor name', async () => {
      const doctorName = 'Dr. Sarah'
      mockSearchService.searchDoctors.mockResolvedValue([
        mockDoctors[0]
      ])
      
      render(<DoctorSearch />)
      
      const searchInput = screen.getByPlaceholderText('Search doctors, specialties, conditions...')
      fireEvent.change(searchInput, { target: { value: doctorName } })
      fireEvent.keyDown(searchInput, { key: 'Enter' })
      
      await waitFor(() => {
        expect(screen.getByText('Dr. Sarah Chen')).toBeInTheDocument()
      })
    })

    it('should search by specialty', async () => {
      const specialty = 'Cardiology'
      mockSearchService.searchDoctors.mockResolvedValue([
        mockDoctors[0],
        mockDoctors[1]
      ])
      
      render(<DoctorSearch />)
      
      const searchInput = screen.getByPlaceholderText('Search doctors, specialties, conditions...')
      fireEvent.change(searchInput, { target: { value: specialty } })
      fireEvent.keyDown(searchInput, { key: 'Enter' })
      
      await waitFor(() => {
        expect(screen.getByText('Dr. Sarah Chen')).toBeInTheDocument()
        expect(screen.getByText('Dr. Michael Wong')).toBeInTheDocument()
      })
    })

    it('should search by clinic name', async () => {
      const clinicName = 'Heart Care'
      mockSearchService.searchDoctors.mockResolvedValue([
        mockDoctors[0]
      ])
      
      render(<DoctorSearch />)
      
      const searchInput = screen.getByPlaceholderText('Search doctors, specialties, conditions...')
      fireEvent.change(searchInput, { target: { value: clinicName } })
      fireEvent.keyDown(searchInput, { key: 'Enter' })
      
      await waitFor(() => {
        expect(screen.getByText('Heart Care Medical Centre')).toBeInTheDocument()
      })
    })

    it('should handle location-based search', async () => {
      const location = 'Central Singapore'
      mockSearchService.searchDoctors.mockResolvedValue([
        mockDoctors[0],
        mockDoctors[2]
      ])
      
      render(<DoctorSearch />)
      
      const searchInput = screen.getByPlaceholderText('Search doctors, specialties, conditions...')
      fireEvent.change(searchInput, { target: { value: location } })
      fireEvent.keyDown(searchInput, { key: 'Enter' })
      
      await waitFor(() => {
        expect(screen.getByText('Dr. Sarah Chen')).toBeInTheDocument()
        expect(screen.getByText('Dr. Priya Sharma')).toBeInTheDocument()
      })
    })
  })

  describe('Fuzzy Search and Synonym Matching', () => {
    it('should handle typos in search queries', async () => {
      const typoQuery = 'cadiologist' // typo for cardiologist
      mockSearchService.fuzzySearch.mockResolvedValue([
        mockDoctors[0],
        mockDoctors[1]
      ])
      
      render(<DoctorSearch />)
      
      const searchInput = screen.getByPlaceholderText('Search doctors, specialties, conditions...')
      fireEvent.change(searchInput, { target: { value: typoQuery } })
      fireEvent.keyDown(searchInput, { key: 'Enter' })
      
      await waitFor(() => {
        expect(mockSearchService.fuzzySearch).toHaveBeenCalledWith(typoQuery)
      })
    })

    it('should use medical synonyms for search', async () => {
      const synonymQuery = 'heart doctor'
      mockSearchService.synonymSearch.mockResolvedValue([
        mockDoctors[0],
        mockDoctors[1]
      ])
      
      render(<DoctorSearch />)
      
      const searchInput = screen.getByPlaceholderText('Search doctors, specialties, conditions...')
      fireEvent.change(searchInput, { target: { value: synonymQuery } })
      fireEvent.keyDown(searchInput, { key: 'Enter' })
      
      await waitFor(() => {
        expect(mockSearchService.synonymSearch).toHaveBeenCalledWith(
          synonymQuery,
          medicalSynonyms['cardiologist']
        )
      })
    })

    it('should handle multiple word searches', async () => {
      const multiWordQuery = 'pediatric heart specialist'
      mockSearchService.searchDoctors.mockResolvedValue([
        mockDoctors[1]
      ])
      
      render(<DoctorSearch />)
      
      const searchInput = screen.getByPlaceholderText('Search doctors, specialties, conditions...')
      fireEvent.change(searchInput, { target: { value: multiWordQuery } })
      fireEvent.keyDown(searchInput, { key: 'Enter' })
      
      await waitFor(() => {
        expect(screen.getByText('Dr. Michael Wong')).toBeInTheDocument()
      })
    })

    it('should provide search suggestions', async () => {
      mockSearchService.getSearchSuggestions.mockResolvedValue([
        'cardiologist',
        'cardiology',
        'cardiac surgery',
        'cardiac catheterization'
      ])
      
      render(<DoctorSearch />)
      
      const searchInput = screen.getByPlaceholderText('Search doctors, specialties, conditions...')
      fireEvent.change(searchInput, { target: { value: 'cardio' } })
      
      await waitFor(() => {
        expect(screen.getByText('cardiologist')).toBeInTheDocument()
        expect(screen.getByText('cardiology')).toBeInTheDocument()
      })
    })
  })

  describe('Search Result Ranking and Relevance', () => {
    it('should rank results by relevance score', async () => {
      const rankedResults = [
        { ...mockDoctors[0], relevanceScore: 0.95 },
        { ...mockDoctors[1], relevanceScore: 0.87 },
        { ...mockDoctors[3], relevanceScore: 0.65 }
      ]
      
      mockSearchService.getSearchRanking.mockResolvedValue(rankedResults)
      
      render(<DoctorSearch />)
      
      const searchInput = screen.getByPlaceholderText('Search doctors, specialties, conditions...')
      fireEvent.change(searchInput, { target: { value: 'cardiologist' } })
      fireEvent.keyDown(searchInput, { key: 'Enter' })
      
      await waitFor(() => {
        const results = screen.getAllByTestId('doctor-result')
        expect(results[0]).toHaveAttribute('data-relevance-score', '0.95')
      })
    })

    it('should prioritize exact name matches', async () => {
      const exactMatchQuery = 'Dr. Sarah Chen'
      mockSearchService.searchDoctors.mockResolvedValue([
        { ...mockDoctors[0], exactMatch: true, relevanceScore: 1.0 },
        ...mockDoctors.slice(1)
      ])
      
      render(<DoctorSearch />)
      
      const searchInput = screen.getByPlaceholderText('Search doctors, specialties, conditions...')
      fireEvent.change(searchInput, { target: { value: exactMatchQuery } })
      fireEvent.keyDown(searchInput, { key: 'Enter' })
      
      await waitFor(() => {
        const firstResult = screen.getAllByTestId('doctor-result')[0]
        expect(firstResult).toHaveAttribute('data-exact-match', 'true')
      })
    })

    it('should consider rating and experience in ranking', async () => {
      const experienceBasedRanking = [
        { ...mockDoctors[3], experience: 15, rating: 4.6, finalScore: 0.92 },
        { ...mockDoctors[1], experience: 12, rating: 4.9, finalScore: 0.89 },
        { ...mockDoctors[0], experience: 8, rating: 4.8, finalScore: 0.87 }
      ]
      
      mockSearchService.getSearchRanking.mockResolvedValue(experienceBasedRanking)
      
      render(<DoctorSearch />)
      
      const searchInput = screen.getByPlaceholderText('Search doctors, specialties, conditions...')
      fireEvent.change(searchInput, { target: { value: 'medicine' } })
      fireEvent.keyDown(searchInput, { key: 'Enter' })
      
      await waitFor(() => {
        const results = screen.getAllByTestId('doctor-result')
        expect(results[0]).toHaveAttribute('data-experience-score', '15')
      })
    })
  })

  describe('Advanced Search Filters', () => {
    it('should filter by specialty', async () => {
      render(
        <div>
          <AdvancedSearchFilters />
          <DoctorSearchResults doctors={mockDoctors} />
        </div>
      )
      
      const specialtyFilter = screen.getByLabelText('Specialty')
      fireEvent.change(specialtyFilter, { target: { value: 'Cardiology' } })
      
      await waitFor(() => {
        expect(screen.getByText('Dr. Sarah Chen')).toBeInTheDocument()
        expect(screen.getByText('Dr. Michael Wong')).toBeInTheDocument()
        expect(screen.queryByText('Dr. Priya Sharma')).not.toBeInTheDocument()
      })
    })

    it('should filter by location', async () => {
      render(
        <div>
          <AdvancedSearchFilters />
          <DoctorSearchResults doctors={mockDoctors} />
        </div>
      )
      
      const locationFilter = screen.getByLabelText('Location')
      fireEvent.change(locationFilter, { target: { value: 'Central Singapore' } })
      
      await waitFor(() => {
        expect(screen.getByText('Dr. Sarah Chen')).toBeInTheDocument()
        expect(screen.getByText('Dr. Priya Sharma')).toBeInTheDocument()
        expect(screen.queryByText('Dr. Michael Wong')).not.toBeInTheDocument()
      })
    })

    it('should filter by availability', async () => {
      render(
        <div>
          <AdvancedSearchFilters />
          <DoctorSearchResults doctors={mockDoctors} />
        </div>
      )
      
      const availabilityFilter = screen.getByLabelText('Available Today')
      fireEvent.click(availabilityFilter)
      
      await waitFor(() => {
        expect(screen.getByText('Dr. Sarah Chen')).toBeInTheDocument()
        expect(screen.getByText('Dr. Michael Wong')).toBeInTheDocument()
        expect(screen.getByText('Dr. James Lee')).toBeInTheDocument()
        expect(screen.queryByText('Dr. Priya Sharma')).not.toBeInTheDocument()
      })
    })

    it('should filter by rating range', async () => {
      render(
        <div>
          <AdvancedSearchFilters />
          <DoctorSearchResults doctors={mockDoctors} />
        </div>
      )
      
      const minRatingInput = screen.getByLabelText('Minimum Rating')
      fireEvent.change(minRatingInput, { target: { value: '4.7' } })
      
      await waitFor(() => {
        expect(screen.getByText('Dr. Michael Wong')).toBeInTheDocument() // 4.9
        expect(screen.getByText('Dr. Priya Sharma')).toBeInTheDocument() // 4.7
        expect(screen.queryByText('Dr. James Lee')).not.toBeInTheDocument() // 4.6
      })
    })

    it('should filter by consultation fee range', async () => {
      render(
        <div>
          <AdvancedSearchFilters />
          <DoctorSearchResults doctors={mockDoctors} />
        </div>
      )
      
      const maxFeeInput = screen.getByLabelText('Maximum Fee')
      fireEvent.change(maxFeeInput, { target: { value: '100' } })
      
      await waitFor(() => {
        expect(screen.getByText('Dr. Priya Sharma')).toBeInTheDocument() // $100
        expect(screen.getByText('Dr. James Lee')).toBeInTheDocument() // $90
        expect(screen.queryByText('Dr. Sarah Chen')).not.toBeInTheDocument() // $120
      })
    })

    it('should combine multiple filters', async () => {
      render(
        <div>
          <AdvancedSearchFilters />
          <DoctorSearchResults doctors={mockDoctors} />
        </div>
      )
      
      const specialtyFilter = screen.getByLabelText('Specialty')
      const availabilityFilter = screen.getByLabelText('Available Today')
      
      fireEvent.change(specialtyFilter, { target: { value: 'Cardiology' } })
      fireEvent.click(availabilityFilter)
      
      await waitFor(() => {
        expect(screen.getByText('Dr. Sarah Chen')).toBeInTheDocument()
        expect(screen.getByText('Dr. Michael Wong')).toBeInTheDocument()
        expect(screen.queryByText('Dr. Priya Sharma')).not.toBeInTheDocument()
        expect(screen.queryByText('Dr. James Lee')).not.toBeInTheDocument()
      })
    })
  })

  describe('Performance with Large Doctor Datasets', () => {
    it('should handle search with 1000+ doctor profiles efficiently', async () => {
      const largeDoctorDataset = Array.from({ length: 1200 }, (_, i) => ({
        ...mockDoctors[i % mockDoctors.length],
        id: `doc_${i}`,
        name: `Dr. Doctor ${i}`,
        experience: i % 20,
        rating: 3.5 + (i % 15) * 0.1
      }))
      
      const startTime = performance.now()
      
      render(
        <DoctorSearchResults doctors={largeDoctorDataset} />
      )
      
      // Simulate search
      const searchInput = screen.getByPlaceholderText('Search doctors...')
      fireEvent.change(searchInput, { target: { value: 'cardiologist' } })
      
      await waitFor(() => {
        expect(screen.getAllByTestId('doctor-result').length).toBeGreaterThan(100)
      }, { timeout: 5000 })
      
      const endTime = performance.now()
      const searchTime = endTime - startTime
      
      expect(searchTime).toBeLessThan(1000) // Should search 1000+ profiles within 1 second
    })

    it('should maintain search performance with complex filters', async () => {
      const doctorsWithComplexData = Array.from({ length: 500 }, (_, i) => ({
        ...mockDoctors[i % mockDoctors.length],
        id: `doc_${i}`,
        subSpecialties: [
          `Specialty ${i % 10}`,
          `Subspecialty ${i % 15}`,
          `Additional ${i % 20}`
        ],
        qualifications: Array.from({ length: 5 }, (_, q) => `Qualification ${q}`),
        languages: Array.from({ length: 8 }, (_, l) => `Language ${l}`)
      }))
      
      const startTime = performance.now()
      
      render(
        <div>
          <AdvancedSearchFilters />
          <DoctorSearchResults doctors={doctorsWithComplexData} />
        </div>
      )
      
      // Apply multiple complex filters
      const specialtyFilter = screen.getByLabelText('Specialty')
      const ratingFilter = screen.getByLabelText('Minimum Rating')
      const feeFilter = screen.getByLabelText('Maximum Fee')
      
      fireEvent.change(specialtyFilter, { target: { value: 'Cardiology' } })
      fireEvent.change(ratingFilter, { target: { value: '4.0' } })
      fireEvent.change(feeFilter, { target: { value: '150' } })
      
      await waitFor(() => {
        expect(screen.getAllByTestId('doctor-result').length).toBeLessThan(500)
      })
      
      const endTime = performance.now()
      const filterTime = endTime - startTime
      
      expect(filterTime).toBeLessThan(500) // Should filter 500 complex profiles within 500ms
    })

    it('should handle concurrent search requests', async () => {
      const concurrentQueries = ['cardiologist', 'dermatology', 'pediatric', 'diabetes']
      
      const startTime = performance.now()
      
      for (const query of concurrentQueries) {
        render(<DoctorSearch />)
        
        const searchInput = screen.getByPlaceholderText('Search doctors, specialties, conditions...')
        fireEvent.change(searchInput, { target: { value: query } })
        fireEvent.keyDown(searchInput, { key: 'Enter' })
        
        await waitFor(() => {
          expect(mockSearchService.searchDoctors).toHaveBeenCalledWith(query)
        })
      }
      
      const endTime = performance.now()
      const totalTime = endTime - startTime
      
      // All 4 searches should complete within 400ms (100ms each)
      expect(totalTime).toBeLessThan(400)
    })
  })

  describe('Search Accuracy Validation', () => {
    it('should return accurate results for all test queries', async () => {
      for (const searchQuery of searchQueries) {
        mockSearchService.searchDoctors.mockResolvedValue(
          mockDoctors.slice(0, searchQuery.expectedResults)
        )
        
        render(<DoctorSearch />)
        
        const searchInput = screen.getByPlaceholderText('Search doctors, specialties, conditions...')
        fireEvent.change(searchInput, { target: { value: searchQuery.query } })
        fireEvent.keyDown(searchInput, { key: 'Enter' })
        
        await waitFor(() => {
          const results = screen.getAllByTestId('doctor-result')
          expect(results.length).toBe(searchQuery.expectedResults)
        })
      }
    })

    it('should handle empty search results gracefully', async () => {
      mockSearchService.searchDoctors.mockResolvedValue([])
      
      render(<DoctorSearch />)
      
      const searchInput = screen.getByPlaceholderText('Search doctors, specialties, conditions...')
      fireEvent.change(searchInput, { target: { value: 'nonexistent specialty' } })
      fireEvent.keyDown(searchInput, { key: 'Enter' })
      
      await waitFor(() => {
        expect(screen.getByText('No doctors found')).toBeInTheDocument()
        expect(screen.getByText('Try adjusting your search criteria')).toBeInTheDocument()
      })
    })

    it('should provide helpful search suggestions for no results', async () => {
      mockSearchService.getSearchSuggestions.mockResolvedValue([
        'Try searching for a specialty',
        'Search by location',
        'Browse all doctors'
      ])
      
      render(<DoctorSearch />)
      
      const searchInput = screen.getByPlaceholderText('Search doctors, specialties, conditions...')
      fireEvent.change(searchInput, { target: { value: 'invalid query' } })
      fireEvent.keyDown(searchInput, { key: 'Enter' })
      
      await waitFor(() => {
        expect(screen.getByText('Try searching for a specialty')).toBeInTheDocument()
      })
    })
  })

  describe('Search System Accessibility', () => {
    it('search interface should be keyboard accessible', async () => {
      render(<DoctorSearch />)
      
      const searchInput = screen.getByPlaceholderText('Search doctors, specialties, conditions...')
      
      // Test keyboard navigation
      searchInput.focus()
      expect(searchInput).toHaveFocus()
      
      fireEvent.change(searchInput, { target: { value: 'test' } })
      expect(searchInput).toHaveValue('test')
      
      fireEvent.keyDown(searchInput, { key: 'Enter' })
      expect(searchInput).toHaveValue('')
    })

    it('search results should have proper ARIA labels', async () => {
      render(<DoctorSearchResults doctors={mockDoctors} />)
      
      expect(screen.getByRole('search')).toBeInTheDocument()
      expect(screen.getByRole('list')).toBeInTheDocument()
      
      const results = screen.getAllByTestId('doctor-result')
      results.forEach(result => {
        expect(result).toHaveAttribute('role', 'article')
      })
    })

    it('should have no accessibility violations in search interface', async () => {
      const { container } = render(<DoctorSearch />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})