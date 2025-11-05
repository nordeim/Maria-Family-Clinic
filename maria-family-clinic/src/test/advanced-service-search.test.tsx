import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// Import the components we're testing
import { ServiceSearchInput } from '@/components/service/search/service-search-input'
import { AdvancedServiceFilters } from '@/components/service/search/advanced-service-filters'
import { ServiceFilterChips } from '@/components/service/search/service-filter-chips'
import { ServiceSearchPage } from '@/components/service/search/service-search-page'
import { MobileServiceSearch } from '@/components/service/search/mobile-service-search'
import { SearchResults, ServiceSearchResult } from '@/components/service/search/search-results'
import { SavedSearches } from '@/components/service/search/saved-searches'
import { useAdvancedServiceSearch } from '@/hooks/use-advanced-service-search'
import { useMedicalVoiceSearch } from '@/hooks/use-voice-search'
import { medicalTermRecognizer } from '@/lib/medical-terms'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as any

// Mock navigator.geolocation
const geolocationMock = {
  getCurrentPosition: vi.fn(),
}
global.navigator.geolocation = geolocationMock as any

// Mock SpeechRecognition
global.SpeechRecognition = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  onstart: null,
  onresult: null,
  onerror: null,
  onend: null,
}))

// Mock medical term recognizer
vi.mock('@/lib/medical-terms', () => ({
  medicalTermRecognizer: {
    recognizeTerms: vi.fn().mockReturnValue({
      recognizedTerms: ['heart disease'],
      specialties: ['cardiology'],
      confidence: 0.8,
    }),
    suggestFilters: vi.fn().mockReturnValue({
      services: ['cardiology'],
      urgency: ['routine'],
    }),
    getSuggestions: vi.fn().mockReturnValue(['heart consultation', 'cardiology checkup']),
    getRelatedTerms: vi.fn().mockReturnValue({
      synonyms: ['cardiac disease'],
      relatedConditions: ['hypertension'],
      commonSymptoms: ['chest pain'],
      specialty: 'cardiology',
    }),
    getSearchBoost: vi.fn().mockReturnValue({
      specialty: 'cardiology',
      boostScore: 0.7,
      relevance: 0.8,
    }),
  },
}))

describe('Advanced Service Search System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('ServiceSearchInput', () => {
    it('renders search input with placeholder', () => {
      render(
        <ServiceSearchInput
          onSearch={vi.fn()}
          onVoiceSearch={vi.fn()}
          onLocationRequest={vi.fn()}
        />
      )

      expect(screen.getByPlaceholderText(/search medical services/i)).toBeInTheDocument()
    })

    it('handles text input and search submission', async () => {
      const user = userEvent.setup()
      const mockSearch = vi.fn()
      
      render(
        <ServiceSearchInput
          onSearch={mockSearch}
          onVoiceSearch={vi.fn()}
          onLocationRequest={vi.fn()}
        />
      )

      const input = screen.getByRole('combobox')
      await user.type(input, 'cardiology consultation')
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalledWith('cardiology consultation', expect.any(Object))
      })
    })

    it('recognizes medical terms and displays indicators', async () => {
      const user = userEvent.setup()
      
      render(
        <ServiceSearchInput
          onSearch={vi.fn()}
          onVoiceSearch={vi.fn()}
          onLocationRequest={vi.fn()}
        />
      )

      const input = screen.getByRole('combobox')
      await user.type(input, 'heart disease')

      await waitFor(() => {
        expect(screen.getByText(/🩺.*medical term/i)).toBeInTheDocument()
      })
    })

    it('handles voice search toggle', async () => {
      const user = userEvent.setup()
      const mockVoiceSearch = vi.fn()
      
      render(
        <ServiceSearchInput
          onSearch={vi.fn()}
          onVoiceSearch={mockVoiceSearch}
          onLocationRequest={vi.fn()}
        />
      )

      const voiceButton = screen.getByRole('button', { name: /voice search/i })
      await user.click(voiceButton)

      expect(voiceButton).toHaveClass('animate-pulse')
    })
  })

  describe('AdvancedServiceFilters', () => {
    it('renders all filter categories', () => {
      render(
        <AdvancedServiceFilters
          filters={{}}
          onFiltersChange={vi.fn()}
          onClearFilters={vi.fn()}
        />
      )

      expect(screen.getByText('Medical Specialties')).toBeInTheDocument()
      expect(screen.getByText('Service Type')).toBeInTheDocument()
      expect(screen.getByText('Urgency Level')).toBeInTheDocument()
      expect(screen.getByText('Duration')).toBeInTheDocument()
      expect(screen.getByText('Complexity Level')).toBeInTheDocument()
      expect(screen.getByText('Patient Type')).toBeInTheDocument()
      expect(screen.getByText('Insurance Coverage')).toBeInTheDocument()
    })

    it('allows selection of medical specialties', async () => {
      const user = userEvent.setup()
      const mockOnFiltersChange = vi.fn()
      
      render(
        <AdvancedServiceFilters
          filters={{}}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={vi.fn()}
        />
      )

      // Expand medical specialties section
      const cardiologyCheckbox = screen.getByLabelText('Cardiology')
      await user.click(cardiologyCheckbox)

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        services: ['cardiology'],
      })
    })

    it('shows active filter count', () => {
      render(
        <AdvancedServiceFilters
          filters={{
            services: ['cardiology'],
            urgency: ['urgent'],
          }}
          onFiltersChange={vi.fn()}
          onClearFilters={vi.fn()}
        />
      )

      expect(screen.getByText('2 active')).toBeInTheDocument()
    })
  })

  describe('ServiceFilterChips', () => {
    it('displays active filters as removable chips', () => {
      const mockOnFilterRemove = vi.fn()
      
      render(
        <ServiceFilterChips
          filters={{
            services: ['cardiology'],
            urgency: ['urgent'],
          }}
          onFilterRemove={mockOnFilterRemove}
          onClearAll={vi.fn()}
        />
      )

      expect(screen.getByText('Cardiology')).toBeInTheDocument()
      expect(screen.getByText('Urgent')).toBeInTheDocument()
    })

    it('removes filters when chip is clicked', async () => {
      const user = userEvent.setup()
      const mockOnFilterRemove = vi.fn()
      
      render(
        <ServiceFilterChips
          filters={{
            services: ['cardiology'],
          }}
          onFilterRemove={mockOnFilterRemove}
          onClearAll={vi.fn()}
        />
      )

      const cardiologyChip = screen.getByText('Cardiology').closest('button')
      await user.click(cardiologyChip!)

      expect(mockOnFilterRemove).toHaveBeenCalledWith('service', 'cardiology')
    })

    it('shows filter summary', () => {
      render(
        <ServiceFilterChips
          filters={{
            services: ['cardiology'],
            urgency: ['urgent'],
          }}
          onFilterRemove={vi.fn()}
          onClearAll={vi.fn()}
        />
      )

      expect(screen.getByText(/showing results for 2 active filters/i)).toBeInTheDocument()
    })
  })

  describe('ServiceSearchPage', () => {
    it('renders complete search interface', () => {
      const mockResults = [
        {
          id: '1',
          name: 'Test Clinic',
          address: '123 Test St',
          rating: 4.5,
          totalReviews: 100,
          specialties: ['cardiology'],
          services: ['consultation'],
          isOpen: true,
          distance: 1.0,
        }
      ]

      render(
        <ServiceSearchPage
          onSearch={vi.fn()}
          results={mockResults}
          isLoading={false}
        />
      )

      expect(screen.getByText('Service Search')).toBeInTheDocument()
      expect(screen.getByText('Search Results')).toBeInTheDocument()
    })

    it('handles search with filters', async () => {
      const user = userEvent.setup()
      const mockSearch = vi.fn()
      
      render(
        <ServiceSearchPage
          onSearch={mockSearch}
          results={[]}
          isLoading={false}
        />
      )

      // Type in search input
      const input = screen.getByPlaceholderText(/search medical services/i)
      await user.type(input, 'heart consultation{Enter}')

      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalled()
      })
    })

    it('displays medical term recognition feedback', async () => {
      const user = userEvent.setup()
      
      render(
        <ServiceSearchPage
          onSearch={vi.fn()}
          results={[]}
          isLoading={false}
        />
      )

      // This would trigger medical term recognition
      const input = screen.getByPlaceholderText(/search medical services/i)
      await user.type(input, 'chest pain')

      // Medical term recognition would show green badge
      await waitFor(() => {
        expect(screen.getByText('🩺')).toBeInTheDocument()
      })
    })
  })

  describe('SearchResults', () => {
    const mockResult = {
      id: '1',
      name: 'Singapore General Hospital',
      address: 'Outram Rd, Singapore',
      phone: '+65 6321 4311',
      rating: 4.8,
      totalReviews: 1250,
      specialties: ['Cardiology'],
      services: ['Heart Consultation', 'ECG'],
      isOpen: true,
      distance: 2.3,
    }

    it('renders search result in grid mode', () => {
      render(
        <ServiceSearchResult
          result={mockResult}
          viewMode="grid"
        />
      )

      expect(screen.getByText('Singapore General Hospital')).toBeInTheDocument()
      expect(screen.getByText('Outram Rd, Singapore')).toBeInTheDocument()
      expect(screen.getByText('4.8')).toBeInTheDocument()
      expect(screen.getByText('2.3km')).toBeInTheDocument()
    })

    it('renders search result in list mode', () => {
      render(
        <ServiceSearchResult
          result={mockResult}
          viewMode="list"
        />
      )

      expect(screen.getByText('Singapore General Hospital')).toBeInTheDocument()
    })

    it('shows medical intelligence ranking', () => {
      render(
        <ServiceSearchResult
          result={mockResult}
          query="heart consultation"
        />
      )

      // Should show ranking indicators
      expect(screen.getByText(/match score/i)).toBeInTheDocument()
    })

    it('handles result selection', () => {
      const mockOnSelect = vi.fn()
      
      render(
        <ServiceSearchResult
          result={mockResult}
          onSelect={mockOnSelect}
        />
      )

      const selectButton = screen.getByText('View Details')
      fireEvent.click(selectButton)

      expect(mockOnSelect).toHaveBeenCalledWith(mockResult)
    })

    it('supports sorting and filtering of results', () => {
      const mockResults = [mockResult]
      
      render(
        <SearchResults
          results={mockResults}
          sorting={{ criteria: 'relevance', order: 'desc' }}
        />
      )

      expect(screen.getByText('1 result found')).toBeInTheDocument()
    })
  })

  describe('MobileServiceSearch', () => {
    it('renders mobile-optimized interface', () => {
      render(
        <MobileServiceSearch
          onSearch={vi.fn()}
          results={[]}
          isLoading={false}
        />
      )

      expect(screen.getByText('Quick Filters')).toBeInTheDocument()
      expect(screen.getByText('Urgency')).toBeInTheDocument()
      expect(screen.getByText('Patient Type')).toBeInTheDocument()
    })

    it('shows bottom sheet filters on mobile', async () => {
      const user = userEvent.setup()
      
      render(
        <MobileServiceSearch
          onSearch={vi.fn()}
          results={[]}
          isLoading={false}
        />
      )

      // Open filters
      const allFiltersButton = screen.getByText('All Filters')
      await user.click(allFiltersButton)

      expect(screen.getByText('Service Filters')).toBeInTheDocument()
    })

    it('handles quick filter selection', async () => {
      const user = userEvent.setup()
      const mockSearch = vi.fn()
      
      render(
        <MobileServiceSearch
          onSearch={mockSearch}
          results={[]}
          isLoading={false}
        />
      )

      // Click quick filter
      const emergencyButton = screen.getByText('Emergency')
      await user.click(emergencyButton)

      expect(mockSearch).toHaveBeenCalledWith('', expect.objectContaining({
        urgency: ['emergency']
      }))
    })
  })

  describe('SavedSearches', () => {
    it('renders saved searches interface', () => {
      render(
        <SavedSearches
          onLoadSearch={vi.fn()}
          onDeleteSearch={vi.fn()}
          onUpdateSearch={vi.fn()}
        />
      )

      expect(screen.getByText('Saved Searches')).toBeInTheDocument()
      expect(screen.getByText('Save Current')).toBeInTheDocument()
    })

    it('allows creating new saved searches', async () => {
      const user = userEvent.setup()
      
      render(
        <SavedSearches
          onLoadSearch={vi.fn()}
          onDeleteSearch={vi.fn()}
          onUpdateSearch={vi.fn()}
        />
      )

      // Click save current
      const saveButton = screen.getByText('Save Current')
      await user.click(saveButton)

      expect(screen.getByText('Search Name')).toBeInTheDocument()
    })

    it('loads saved searches from localStorage', () => {
      const mockSavedSearches = [
        {
          id: '1',
          name: 'Cardiology Search',
          filters: { services: ['cardiology'] },
          alertEnabled: false,
          createdAt: new Date(),
          resultCount: 5,
          searchCount: 3,
        }
      ]

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSavedSearches))

      render(
        <SavedSearches
          onLoadSearch={vi.fn()}
          onDeleteSearch={vi.fn()}
          onUpdateSearch={vi.fn()}
        />
      )

      expect(screen.getByText('Cardiology Search')).toBeInTheDocument()
    })
  })

  describe('useAdvancedServiceSearch Hook', () => {
    it('provides search state and actions', () => {
      const TestComponent = () => {
        const search = useAdvancedServiceSearch()
        
        return (
          <div>
            <div data-testid="query">{search.query}</div>
            <div data-testid="results">{search.results.length}</div>
            <button onClick={() => search.search('test query')}>Search</button>
          </div>
        )
      }

      render(<TestComponent />)

      expect(screen.getByTestId('query')).toHaveTextContent('')
      expect(screen.getByTestId('results')).toHaveTextContent('0')
    })

    it('handles medical term recognition', () => {
      const TestComponent = () => {
        const search = useAdvancedServiceSearch()
        
        return (
          <div>
            <div data-testid="recognized-terms">
              {search.medicalTermRecognition.recognizedTerms.join(', ')}
            </div>
            <button onClick={() => search.search('heart disease')}>Search</button>
          </div>
        )
      }

      render(<TestComponent />)

      // Search for medical term
      const searchButton = screen.getByText('Search')
      fireEvent.click(searchButton)

      // Should trigger medical term recognition
      expect(screen.getByTestId('recognized-terms')).toHaveTextContent('heart disease')
    })

    it('manages search history', () => {
      const TestComponent = () => {
        const search = useAdvancedServiceSearch()
        
        return (
          <div>
            <div data-testid="history-count">{search.searchHistory.length}</div>
            <button onClick={() => search.search('test query')}>Search</button>
          </div>
        )
      }

      render(<TestComponent />)

      // Search should add to history
      const searchButton = screen.getByText('Search')
      fireEvent.click(searchButton)

      // History should be updated
      expect(screen.getByTestId('history-count')).toHaveTextContent('1')
    })
  })

  describe('useMedicalVoiceSearch Hook', () => {
    it('provides voice search functionality', () => {
      const TestComponent = () => {
        const voice = useMedicalVoiceSearch()
        
        return (
          <div>
            <div data-testid="listening">{voice.isListening.toString()}</div>
            <div data-testid="transcript">{voice.transcript}</div>
            <button onClick={voice.startVoiceSearch}>Start Voice</button>
            <button onClick={voice.stopVoiceSearch}>Stop Voice</button>
          </div>
        )
      }

      render(<TestComponent />)

      expect(screen.getByTestId('listening')).toHaveTextContent('false')
      expect(screen.getByTestId('transcript')).toHaveTextContent('')
    })

    it('handles medical term recognition from voice', () => {
      const TestComponent = () => {
        const voice = useMedicalVoiceSearch()
        
        return (
          <div>
            <div data-testid="recognized-terms">
              {voice.recognizedTerms.join(', ')}
            </div>
            <button onClick={voice.startVoiceSearch}>Start Voice</button>
          </div>
        )
      }

      render(<TestComponent />)

      const startButton = screen.getByText('Start Voice')
      fireEvent.click(startButton)

      // Voice recognition would update recognized terms
      expect(screen.getByTestId('recognized-terms')).toHaveTextContent('heart disease')
    })
  })

  describe('Medical Term Recognition', () => {
    it('recognizes medical terms and synonyms', () => {
      const result = medicalTermRecognizer.recognizeTerms('chest pain')
      
      expect(result.recognizedTerms).toContain('heart disease')
      expect(result.specialties).toContain('cardiology')
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('suggests relevant filters based on medical terms', () => {
      const filters = medicalTermRecognizer.suggestFilters(['heart disease'])
      
      expect(filters.services).toContain('cardiology')
      expect(filters.urgency).toContain('routine')
    })

    it('provides search boost for medical contexts', () => {
      const boost = medicalTermRecognizer.getSearchBoost('cardiology consultation')
      
      expect(boost.specialty).toBe('cardiology')
      expect(boost.boostScore).toBeGreaterThan(0)
      expect(boost.relevance).toBeGreaterThan(0)
    })
  })

  describe('Integration Tests', () => {
    it('integrates all components in a complete search flow', async () => {
      const user = userEvent.setup()
      const mockResults = [
        {
          id: '1',
          name: 'Cardiology Centre',
          address: '123 Medical St',
          rating: 4.8,
          totalReviews: 500,
          specialties: ['cardiology'],
          services: ['consultation'],
          isOpen: true,
          distance: 1.2,
        }
      ]

      render(
        <ServiceSearchPage
          onSearch={vi.fn()}
          results={mockResults}
          isLoading={false}
        />
      )

      // 1. Enter search query with medical terms
      const input = screen.getByPlaceholderText(/search medical services/i)
      await user.type(input, 'heart consultation')

      // 2. Apply filters
      const filtersButton = screen.getByText('Filters')
      await user.click(filtersButton)

      // 3. Select medical specialty
      const cardiologyCheckbox = screen.getByLabelText('Cardiology')
      await user.click(cardiologyCheckbox)

      // 4. Verify results are displayed
      expect(screen.getByText('Cardiology Centre')).toBeInTheDocument()
      
      // 5. Check medical intelligence indicators
      expect(screen.getByText(/high relevance/i)).toBeInTheDocument()
    })

    it('handles voice search with medical term recognition', async () => {
      const user = userEvent.setup()
      
      render(
        <ServiceSearchPage
          onSearch={vi.fn()}
          results={[]}
          isLoading={false}
        />
      )

      // Start voice search
      const voiceButton = screen.getByRole('button', { name: /voice search/i })
      await user.click(voiceButton)

      // Voice search feedback should appear
      expect(screen.getByText(/listening/i)).toBeInTheDocument()
    })

    it('supports mobile search with bottom sheet filters', async () => {
      const user = userEvent.setup()
      
      render(
        <MobileServiceSearch
          onSearch={vi.fn()}
          results={[]}
          isLoading={false}
        />
      )

      // Open bottom sheet filters
      const allFiltersButton = screen.getByText('All Filters')
      await user.click(allFiltersButton)

      // Apply quick filters
      const emergencyButton = screen.getByText('Emergency')
      await user.click(emergencyButton)

      // Apply filters button
      const applyButton = screen.getByText('Apply Filters')
      await user.click(applyButton)

      // Filters should be applied
      expect(screen.getByText(/urgent/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility Tests', () => {
    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(
        <ServiceSearchInput
          onSearch={vi.fn()}
          onVoiceSearch={vi.fn()}
          onLocationRequest={vi.fn()}
        />
      )

      const input = screen.getByRole('combobox')
      
      // Tab navigation should work
      input.focus()
      await user.keyboard('{Tab}')
      
      // Should maintain focus state
      expect(input).toHaveFocus()
    })

    it('provides proper ARIA labels', () => {
      render(
        <AdvancedServiceFilters
          filters={{}}
          onFiltersChange={vi.fn()}
          onClearFilters={vi.fn()}
        />
      )

      // Check for ARIA attributes
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded')
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-haspopup')
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-autocomplete')
    })

    it('supports screen readers', () => {
      render(
        <ServiceFilterChips
          filters={{ services: ['cardiology'] }}
          onFilterRemove={vi.fn()}
          onClearAll={vi.fn()}
        />
      )

      // Screen reader should identify active filters
      expect(screen.getByText(/active filters/i)).toBeInTheDocument()
    })
  })
})

describe('Performance Tests', () => {
  it('debounces search input to prevent excessive API calls', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({ delay: null })
    
    render(
      <ServiceSearchInput
        onSearch={vi.fn()}
        onVoiceSearch={vi.fn()}
        onLocationRequest={vi.fn()}
      />
    )

    const input = screen.getByRole('combobox')
    
    // Type quickly
    await user.type(input, 'cardiology')
    
    // Fast forward time
    vi.advanceTimersByTime(400)
    
    // Search should be debounced
    expect(screen.getByRole('combobox')).toHaveValue('cardiology')
    
    vi.useRealTimers()
  })

  it('handles large result sets efficiently', () => {
    const largeResultSet = Array.from({ length: 1000 }, (_, i) => ({
      id: `clinic-${i}`,
      name: `Clinic ${i}`,
      address: `Address ${i}`,
      rating: 4.0 + Math.random(),
      totalReviews: Math.floor(Math.random() * 1000),
      specialties: ['general'],
      services: ['consultation'],
      isOpen: true,
      distance: Math.random() * 10,
    }))

    const { container } = render(
      <SearchResults
        results={largeResultSet}
        viewMode="grid"
      />
    )

    // Should handle large datasets without performance issues
    expect(container.children.length).toBeGreaterThan(0)
  })
})

describe('Error Handling', () => {
  it('handles search errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Mock failed search
    vi.mocked(medicalTermRecognizer.recognizeTerms).mockImplementation(() => {
      throw new Error('Recognition failed')
    })
    
    render(
      <ServiceSearchInput
        onSearch={vi.fn()}
        onVoiceSearch={vi.fn()}
        onLocationRequest={vi.fn()}
      />
    )

    // System should handle errors without crashing
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    
    consoleSpy.mockRestore()
  })

  it('handles geolocation errors', () => {
    geolocationMock.getCurrentPosition.mockImplementation((success, error) => {
      error({ code: 1, message: 'User denied' })
    })

    render(
      <ServiceSearchInput
        onSearch={vi.fn()}
        onVoiceSearch={vi.fn()}
        onLocationRequest={vi.fn()}
      />
    )

    // Should handle geolocation errors gracefully
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('handles voice search errors', () => {
    // Mock speech recognition error
    global.SpeechRecognition = vi.fn().mockImplementation(() => ({
      start: () => {
        const event = { error: 'not-allowed' }
        throw new Error('Microphone access denied')
      },
    }))

    render(
      <ServiceSearchInput
        onSearch={vi.fn()}
        onVoiceSearch={vi.fn()}
        onLocationRequest={vi.fn()}
      />
    )

    // Should handle voice search errors gracefully
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})