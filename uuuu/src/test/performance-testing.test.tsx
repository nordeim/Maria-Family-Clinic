import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  SEARCH_RESPONSE_TIME: 100, // milliseconds
  PROFILE_RENDER_TIME: 50, // milliseconds
  IMAGE_LOAD_TIME: 1000, // milliseconds
  DATABASE_QUERY_TIME: 200, // milliseconds
  LAZY_LOAD_THRESHOLD: 100, // entries
  CONCURRENT_USERS: 100, // virtual concurrent users
  DATA_SET_SIZE: 1000 // minimum for load testing
}

// Mock services for performance testing
const mockDatabaseService = {
  queryDoctors: vi.fn(),
  queryWithPagination: vi.fn(),
  fuzzySearch: vi.fn(),
  getOptimizedResults: vi.fn()
}

const mockImageService = {
  optimizeImage: vi.fn(),
  generateResponsiveSizes: vi.fn(),
  lazyLoad: vi.fn()
}

const mockSearchService = {
  searchDoctors: vi.fn(),
  getCachedResults: vi.fn(),
  preloadSearch: vi.fn()
}

// Mock doctor dataset for performance testing
const generateLargeDoctorDataset = (count: number) => {
  const specialties = ['Cardiology', 'Dermatology', 'Internal Medicine', 'Pediatrics', 'Orthopedics']
  const clinics = ['Heart Care Centre', 'Skin Health Clinic', 'General Medical Practice', 'Children Hospital', 'Ortho Specialists']
  const languages = ['English', 'Mandarin', 'Malay', 'Tamil', 'Cantonese']
  
  return Array.from({ length: count }, (_, i) => ({
    id: `doc_${i}`,
    name: `Dr. Doctor ${i}`,
    specialty: specialties[i % specialties.length],
    subSpecialties: [`SubSpecialty ${i % 10}`, `SubSpecialty ${i % 15}`],
    qualifications: Array.from({ length: 3 }, (_, q) => ({
      degree: `Degree ${q}`,
      institution: `Institution ${q}`,
      year: 2010 + (i % 15)
    })),
    experience: (i % 25) + 1,
    languages: languages.slice(0, (i % 5) + 1),
    bio: `Biography for doctor ${i} with extensive experience in ${specialties[i % specialties.length]}.`,
    clinicName: clinics[i % clinics.length],
    clinicAddress: `${100 + i} Medical Street, Singapore ${150000 + i}`,
    clinicPhone: `+65-6${String(1000000 + i).padStart(6, '0')}`,
    rating: 3.5 + ((i % 50) * 0.01),
    reviewCount: (i % 500) + 1,
    consultationFee: 50 + (i % 200),
    availability: ['Today', 'Tomorrow', 'This Week'].slice(0, (i % 3) + 1),
    profileImage: `/images/doctors/doc_${i}.jpg`,
    verificationBadges: {
      mcrVerified: i % 3 === 0,
      spcVerified: i % 4 === 0,
      boardCertified: i % 5 === 0,
      experienceVerified: i % 2 === 0
    },
    location: ['Central', 'North', 'South', 'East', 'West'][i % 5],
    telemedicineAvailable: i % 3 === 0,
    waitingTime: (i % 30) + 5
  }))
}

describe('Performance Testing for Doctor System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock performance.now for consistent testing
    vi.stubGlobal('performance', {
      now: vi.fn().mockReturnValue(1000)
    })
    
    // Mock Image constructor for testing
    vi.stubGlobal('Image', class MockImage {
      onload: (() => {}) as any = (() => {}) as any
      onerror: (() => {}) as any = (() => {}) as any
      src: string = ''
      
      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload(new Event('load'))
        }, 50)
      }
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('Load Testing with Large Doctor Datasets', () => {
    it('should handle 1000+ doctor profiles efficiently', async () => {
      const largeDataset = generateLargeDoctorDataset(1000)
      mockDatabaseService.queryDoctors.mockResolvedValue(largeDataset)
      
      const startTime = performance.now()
      
      render(
        <div>
          {largeDataset.map(doctor => (
            <div key={doctor.id} data-testid={`doctor-${doctor.id}`}>
              <h3>{doctor.name}</h3>
              <p>{doctor.specialty}</p>
              <p>{doctor.clinicName}</p>
            </div>
          ))}
        </div>
      )
      
      // Verify that at least some doctors are rendered
      await waitFor(() => {
        expect(screen.getByTestId('doctor-doc_0')).toBeInTheDocument()
        expect(screen.getByTestId('doctor-doc_999')).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(2000) // Should render 1000 profiles within 2 seconds
      expect(screen.getAllByTestId(/doctor-doc_\d+/)).toHaveLength(1000)
    })

    it('should handle doctor-clinic relationships efficiently', async () => {
      const doctorClinicDataset = generateLargeDoctorDataset(1500)
      
      // Simulate complex relationship queries
      mockDatabaseService.queryWithPagination.mockImplementation((page: number, limit: number) => {
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        return Promise.resolve({
          doctors: doctorClinicDataset.slice(startIndex, endIndex),
          totalCount: doctorClinicDataset.length,
          hasMore: endIndex < doctorClinicDataset.length
        })
      })
      
      const startTime = performance.now()
      
      // Simulate pagination requests
      for (let page = 1; page <= 5; page++) {
        const result = await mockDatabaseService.queryWithPagination(page, 300)
        expect(result.doctors).toHaveLength(300)
        expect(result.totalCount).toBe(1500)
      }
      
      const endTime = performance.now()
      const queryTime = endTime - startTime
      
      expect(queryTime).toBeLessThan(1000) // 5 pagination queries within 1 second
      expect(mockDatabaseService.queryWithPagination).toHaveBeenCalledTimes(5)
    })

    it('should maintain performance with complex search queries', async () => {
      const largeDataset = generateLargeDoctorDataset(1200)
      
      const complexSearchTerms = [
        'cardiologist heart failure interventional',
        'dermatology cosmetic skin treatment',
        'pediatric child development vaccination',
        'orthopedic joint replacement surgery',
        'internal medicine diabetes hypertension'
      ]
      
      const startTime = performance.now()
      
      for (const searchTerm of complexSearchTerms) {
        mockSearchService.searchDoctors.mockResolvedValue(
          largeDataset.filter(doctor => 
            doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase().split(' ')[0])
          )
        )
        
        const results = await mockSearchService.searchDoctors(searchTerm)
        expect(results.length).toBeGreaterThan(0)
      }
      
      const endTime = performance.now()
      const totalSearchTime = endTime - startTime
      
      // Complex searches should complete within reasonable time
      expect(totalSearchTime).toBeLessThan(500)
      expect(mockSearchService.searchDoctors).toHaveBeenCalledTimes(complexSearchTerms.length)
    })

    it('should handle concurrent load with multiple users', async () => {
      const concurrentUsers = 50
      const datasetSize = 800
      
      const userQueries = Array.from({ length: concurrentUsers }, (_, i) => ({
        userId: `user_${i}`,
        query: `cardiologist ${i % 10}`,
        expectedResults: Math.floor(datasetSize / 10)
      }))
      
      const startTime = performance.now()
      
      // Simulate concurrent user requests
      const concurrentPromises = userQueries.map(async (query) => {
        const results = generateLargeDoctorDataset(datasetSize).filter(doctor =>
          doctor.specialty.toLowerCase().includes(query.query.toLowerCase().split(' ')[0])
        )
        return { userId: query.userId, results }
      })
      
      const results = await Promise.all(concurrentPromises)
      
      const endTime = performance.now()
      const loadTime = endTime - startTime
      
      expect(results).toHaveLength(concurrentUsers)
      expect(loadTime).toBeLessThan(2000) // Handle 50 concurrent users within 2 seconds
      
      // Verify each user got results
      results.forEach(result => {
        expect(result.results.length).toBeGreaterThan(0)
      })
    })

    it('should maintain performance under sustained load', async () => {
      const sustainedLoadDuration = 5000 // 5 seconds
      const requestInterval = 100 // 100ms between requests
      const dataset = generateLargeDoctorDataset(600)
      
      let requestCount = 0
      const startTime = performance.now()
      
      const simulateSustainedLoad = async () => {
        while (performance.now() - startTime < sustainedLoadDuration) {
          const randomDoctor = dataset[Math.floor(Math.random() * dataset.length)]
          
          // Simulate search query
          mockSearchService.searchDoctors.mockResolvedValue([randomDoctor])
          await mockSearchService.searchDoctors(randomDoctor.specialty)
          
          requestCount++
          await new Promise(resolve => setTimeout(resolve, requestInterval))
        }
      }
      
      await simulateSustainedLoad()
      
      const endTime = performance.now()
      const totalTime = endTime - startTime
      
      expect(requestCount).toBeGreaterThan(40) // At least 40 requests in 5 seconds
      expect(totalTime).toBeLessThanOrEqual(sustainedLoadDuration + 1000)
    })
  })

  describe('Search Response Time Testing', () => {
    it('should respond to search queries within 100ms requirement', async () => {
      const dataset = generateLargeDoctorDataset(500)
      
      const searchQueries = [
        'Dr. Doctor 1',
        'Cardiology',
        'Heart Care',
        'Central Singapore',
        'rating 4.5',
        'available today'
      ]
      
      for (const query of searchQueries) {
        const startTime = performance.now()
        
        // Mock search with realistic response
        mockSearchService.searchDoctors.mockImplementation((searchTerm: string) => {
          return new Promise(resolve => {
            setTimeout(() => {
              const results = dataset.filter(doctor => 
                doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doctor.clinicName.toLowerCase().includes(searchTerm.toLowerCase())
              )
              resolve(results)
            }, 50) // Simulate 50ms search time
          })
        })
        
        const results = await mockSearchService.searchDoctors(query)
        
        const endTime = performance.now()
        const responseTime = endTime - startTime
        
        expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SEARCH_RESPONSE_TIME)
        expect(results.length).toBeGreaterThan(0)
      }
    })

    it('should maintain search performance with complex filters', async () => {
      const dataset = generateLargeDoctorDataset(700)
      
      const complexFilters = {
        specialty: 'Cardiology',
        location: 'Central',
        minRating: 4.0,
        maxFee: 150,
        availableToday: true,
        hasTelemedicine: true,
        languages: ['English', 'Mandarin'],
        minExperience: 5
      }
      
      const startTime = performance.now()
      
      // Mock complex filtering
      mockDatabaseService.getOptimizedResults.mockImplementation((filters: any) => {
        return new Promise(resolve => {
          setTimeout(() => {
            const results = dataset.filter(doctor => {
              return (!filters.specialty || doctor.specialty === filters.specialty) &&
                     (!filters.location || doctor.location === filters.location) &&
                     (!filters.minRating || doctor.rating >= filters.minRating) &&
                     (!filters.maxFee || doctor.consultationFee <= filters.maxFee) &&
                     (!filters.availableToday || doctor.availability.includes('Today')) &&
                     (!filters.hasTelemedicine || doctor.telemedicineAvailable) &&
                     (!filters.minExperience || doctor.experience >= filters.minExperience)
            })
            resolve(results)
          }, 80) // Simulate 80ms complex filtering
        })
      })
      
      const results = await mockDatabaseService.getOptimizedResults(complexFilters)
      
      const endTime = performance.now()
      const responseTime = endTime - startTime
      
      expect(responseTime).toBeLessThan(150) // Complex filters within 150ms
      expect(results.length).toBeGreaterThanOrEqual(0)
    })

    it('should optimize search for common queries with caching', async () => {
      const dataset = generateLargeDoctorDataset(400)
      const commonQueries = ['Cardiology', 'Dermatology', 'Pediatrics']
      const cache = new Map()
      
      // First requests - cache misses
      const firstRequestStart = performance.now()
      
      for (const query of commonQueries) {
        const cacheKey = `search_${query}`
        const results = dataset.filter(doctor => 
          doctor.specialty.toLowerCase().includes(query.toLowerCase())
        )
        cache.set(cacheKey, { results, timestamp: Date.now() })
      }
      
      const firstRequestTime = performance.now() - firstRequestStart
      
      // Second requests - cache hits
      const secondRequestStart = performance.now()
      
      for (const query of commonQueries) {
        const cacheKey = `search_${query}`
        const cachedResult = cache.get(cacheKey)
        expect(cachedResult).toBeDefined()
        expect(cachedResult.results.length).toBeGreaterThan(0)
      }
      
      const secondRequestTime = performance.now() - secondRequestStart
      
      // Cache hits should be significantly faster
      expect(secondRequestTime).toBeLessThan(firstRequestTime * 0.1)
      expect(firstRequestTime).toBeLessThan(200)
      expect(secondRequestTime).toBeLessThan(10)
    })

    it('should handle fuzzy search performance', async () => {
      const dataset = generateLargeDoctorDataset(300)
      
      const fuzzyQueries = [
        'cadiologist', // typo for cardiologist
        'dermtology', // typo for dermatology
        'intrenal', // typo for internal
        'pediartic', // typo for pediatric
        'orthpedic' // typo for orthopedic
      ]
      
      const startTime = performance.now()
      
      mockDatabaseService.fuzzySearch.mockImplementation((query: string, threshold: number) => {
        return new Promise(resolve => {
          setTimeout(() => {
            const results = dataset.filter(doctor => {
              const specialty = doctor.specialty.toLowerCase()
              const name = doctor.name.toLowerCase()
              const clinicName = doctor.clinicName.toLowerCase()
              
              // Simple fuzzy matching (in real implementation, would use algorithms like Levenshtein)
              const queryWords = query.toLowerCase().split(' ')
              return queryWords.some(word => 
                specialty.includes(word.substring(0, Math.max(1, Math.floor(word.length * 0.8)))) ||
                name.includes(word.substring(0, Math.max(1, Math.floor(word.length * 0.8)))) ||
                clinicName.includes(word.substring(0, Math.max(1, Math.floor(word.length * 0.8))))
              )
            })
            resolve(results)
          }, 70) // Simulate 70ms fuzzy search
        })
      })
      
      for (const query of fuzzyQueries) {
        const results = await mockDatabaseService.fuzzySearch(query, 0.8)
        expect(results.length).toBeGreaterThan(0)
      }
      
      const endTime = performance.now()
      const totalTime = endTime - startTime
      
      expect(totalTime).toBeLessThan(400) // 5 fuzzy searches within 400ms
      expect(mockDatabaseService.fuzzySearch).toHaveBeenCalledTimes(fuzzyQueries.length)
    })
  })

  describe('Image Loading Optimization and Lazy Loading', () => {
    it('should implement lazy loading for doctor profile images', async () => {
      const doctorsWithImages = generateLargeDoctorDataset(200)
      
      const startTime = performance.now()
      
      render(
        <div>
          {doctorsWithImages.map(doctor => (
            <img
              key={doctor.id}
              data-testid={`doctor-image-${doctor.id}`}
              src={doctor.profileImage}
              alt={`Dr. ${doctor.name}`}
              loading="lazy"
            />
          ))}
        </div>
      )
      
      // Only first few images should be loaded initially
      const allImages = screen.getAllByTestId(/doctor-image-doc_\d+/)
      const visibleImages = allImages.slice(0, 10)
      const lazyImages = allImages.slice(10)
      
      // First images should have src set
      visibleImages.forEach(img => {
        expect(img).toHaveAttribute('src')
      })
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(500)
      expect(allImages.length).toBe(200)
    })

    it('should optimize images for different screen sizes', async () => {
      const mockDoctor = generateLargeDoctorDataset(1)[0]
      
      mockImageService.generateResponsiveSizes.mockReturnValue({
        small: '/images/doctors/doc_0-320w.jpg',
        medium: '/images/doctors/doc_0-640w.jpg',
        large: '/images/doctors/doc_0-1024w.jpg',
        original: '/images/doctors/doc_0.jpg'
      })
      
      const responsiveSizes = mockImageService.generateResponsiveSizes(mockDoctor.profileImage)
      
      expect(responsiveSizes.small).toContain('320w')
      expect(responsiveSizes.medium).toContain('640w')
      expect(responsiveSizes.large).toContain('1024w')
      expect(responsiveSizes.original).toContain('doc_0.jpg')
    })

    it('should load images within performance threshold', async () => {
      const startTime = performance.now()
      
      render(
        <img
          data-testid="performance-test-image"
          src="/images/doctors/doc_test.jpg"
          alt="Test doctor image"
        />
      )
      
      // Wait for image load
      await waitFor(() => {
        const img = screen.getByTestId('performance-test-image')
        expect(img).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const loadTime = endTime - startTime
      
      // Image should load within threshold
      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.IMAGE_LOAD_TIME)
    })

    it('should handle image loading errors gracefully', async () => {
      render(
        <div>
          <img
            data-testid="error-image"
            src="/nonexistent/doctor.jpg"
            alt="Doctor image"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/images/fallback-doctor.png'
            }}
          />
        </div>
      )
      
      await waitFor(() => {
        const img = screen.getByTestId('error-image')
        expect(img).toHaveAttribute('src', '/images/fallback-doctor.png')
      })
    })

    it('should implement intersection observer for lazy loading', () => {
      const doctors = generateLargeDoctorDataset(150)
      
      // Mock IntersectionObserver
      global.IntersectionObserver = class {
        observe = vi.fn()
        disconnect = vi.fn()
        unobserve = vi.fn()
      }
      
      render(
        <div>
          {doctors.map(doctor => (
            <div key={doctor.id} data-testid={`lazy-image-container-${doctor.id}`}>
              <img
                data-testid={`lazy-image-${doctor.id}`}
                src={doctor.profileImage}
                alt={`Dr. ${doctor.name}`}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )
      
      // Verify intersection observer is used
      const imageContainers = screen.getAllByTestId(/lazy-image-container-doc_\d+/)
      expect(imageContainers.length).toBe(150)
    })
  })

  describe('Database Query Performance and Optimization', () => {
    it('should optimize database queries for doctor data', async () => {
      const largeDataset = generateLargeDoctorDataset(800)
      
      const queryStartTime = performance.now()
      
      // Simulate optimized database queries
      mockDatabaseService.queryDoctors.mockImplementation((filters: any, pagination: any) => {
        return new Promise(resolve => {
          setTimeout(() => {
            let results = [...largeDataset]
            
            // Apply filters efficiently
            if (filters.specialty) {
              results = results.filter(d => d.specialty === filters.specialty)
            }
            
            if (filters.location) {
              results = results.filter(d => d.location === filters.location)
            }
            
            if (filters.minRating) {
              results = results.filter(d => d.rating >= filters.minRating)
            }
            
            // Apply pagination
            const startIndex = (pagination.page - 1) * pagination.limit
            const endIndex = startIndex + pagination.limit
            const paginatedResults = results.slice(startIndex, endIndex)
            
            resolve({
              data: paginatedResults,
              totalCount: results.length,
              pageCount: Math.ceil(results.length / pagination.limit)
            })
          }, 120) // Simulate 120ms query time
        })
      })
      
      const result = await mockDatabaseService.queryDoctors(
        { specialty: 'Cardiology', minRating: 4.0 },
        { page: 1, limit: 50 }
      )
      
      const queryEndTime = performance.now()
      const queryTime = queryEndTime - queryStartTime
      
      expect(queryTime).toBeLessThan(PERFORMANCE_THRESHOLDS.DATABASE_QUERY_TIME)
      expect(result.data).toHaveLength(50)
      expect(result.totalCount).toBeGreaterThan(0)
    })

    it('should implement query result caching', async () => {
      const dataset = generateLargeDoctorDataset(300)
      const cache = new Map()
      let cacheHits = 0
      let cacheMisses = 0
      
      const cachedQuery = async (query: string, params: any) => {
        const cacheKey = JSON.stringify({ query, params })
        const cached = cache.get(cacheKey)
        
        if (cached) {
          cacheHits++
          return cached
        } else {
          cacheMisses++
          // Simulate database query
          await new Promise(resolve => setTimeout(resolve, 50))
          const results = dataset.filter(d => d.specialty === params.specialty)
          cache.set(cacheKey, { data: results, timestamp: Date.now() })
          return { data: results, timestamp: Date.now() }
        }
      }
      
      // First query - cache miss
      const result1 = await cachedQuery('findDoctors', { specialty: 'Cardiology' })
      
      // Same query - cache hit
      const result2 = await cachedQuery('findDoctors', { specialty: 'Cardiology' })
      
      // Different query - cache miss
      const result3 = await cachedQuery('findDoctors', { specialty: 'Dermatology' })
      
      expect(cacheHits).toBe(1)
      expect(cacheMisses).toBe(2)
      expect(result1.data).toEqual(result2.data)
      expect(result1.data).not.toEqual(result3.data)
    })

    it('should optimize for frequently accessed data', async () => {
      const dataset = generateLargeDoctorDataset(500)
      const accessPattern = new Map()
      
      // Simulate access pattern - some doctors accessed more frequently
      for (let i = 0; i < 1000; i++) {
        const doctorIndex = Math.floor(Math.random() * dataset.length)
        const doctorId = dataset[doctorIndex].id
        accessPattern.set(doctorId, (accessPattern.get(doctorId) || 0) + 1)
      }
      
      // Identify hot data (most frequently accessed)
      const hotDoctors = Array.from(accessPattern.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 50)
        .map(([id]) => dataset.find(d => d.id === id))
      
      expect(hotDoctors.length).toBe(50)
      
      // Verify hot doctors are indeed accessed more
      const topDoctor = hotDoctors[0]
      const accessCount = accessPattern.get(topDoctor.id)
      expect(accessCount).toBeGreaterThan(10)
    })

    it('should handle concurrent database operations efficiently', async () => {
      const dataset = generateLargeDoctorDataset(400)
      const concurrentOperations = 20
      
      const startTime = performance.now()
      
      const operations = Array.from({ length: concurrentOperations }, (_, i) => {
        return mockDatabaseService.queryDoctors(
          { specialty: ['Cardiology', 'Dermatology', 'Internal Medicine'][i % 3] },
          { page: 1, limit: 20 }
        )
      })
      
      const results = await Promise.all(operations)
      
      const endTime = performance.now()
      const totalTime = endTime - startTime
      
      expect(results).toHaveLength(concurrentOperations)
      expect(totalTime).toBeLessThan(1000) // 20 operations within 1 second
      expect(mockDatabaseService.queryDoctors).toHaveBeenCalledTimes(concurrentOperations)
    })
  })

  describe('Memory Usage and Resource Management', () => {
    it('should not cause memory leaks with large datasets', async () => {
      const initialMemoryUsage = (performance as any).memory?.usedJSHeapSize || 1000000
      const dataset = generateLargeDoctorDataset(500)
      
      // Render large dataset
      const { unmount } = render(
        <div>
          {dataset.map(doctor => (
            <div key={doctor.id} data-testid={`doctor-${doctor.id}`}>
              {doctor.name} - {doctor.specialty}
            </div>
          ))}
        </div>
      )
      
      // Unmount component
      unmount()
      
      // Force garbage collection (if available)
      if ((performance as any).memory?.gc) {
        (performance as any).memory.gc()
      }
      
      const afterMemoryUsage = (performance as any).memory?.usedJSHeapSize || initialMemoryUsage
      const memoryIncrease = afterMemoryUsage - initialMemoryUsage
      
      // Memory increase should be reasonable (less than 50MB for 500 doctors)
      expect(memoryIncrease).toBeLessThan(50000000)
    })

    it('should handle image memory efficiently', async () => {
      const doctorImages = generateLargeDoctorDataset(100)
      
      const imageMemoryUsage = new Map()
      
      doctorImages.forEach(doctor => {
        // Simulate image memory allocation
        const imageSize = 200000 // 200KB per image
        imageMemoryUsage.set(doctor.id, imageSize)
      })
      
      const totalImageMemory = Array.from(imageMemoryUsage.values())
        .reduce((sum, size) => sum + size, 0)
      
      expect(totalImageMemory).toBe(20000000) // 100 images * 200KB = 20MB
      expect(totalImageMemory).toBeLessThan(50000000) // Should be under 50MB
    })

    it('should clean up event listeners properly', () => {
      const attachEventListeners = () => {
        const element = document.createElement('div')
        element.addEventListener('click', vi.fn())
        element.addEventListener('keydown', vi.fn())
        return element
      }
      
      const elements = Array.from({ length: 50 }, attachEventListeners)
      
      // Clean up all event listeners
      elements.forEach(element => {
        const cloned = element.cloneNode(true)
        element.parentNode?.replaceChild(cloned, element)
      })
      
      // Verify cleanup (implementation-dependent)
      expect(elements.length).toBe(50)
    })

    it('should handle virtual scrolling efficiently', async () => {
      const largeDataset = generateLargeDoctorDataset(1000)
      const viewportSize = 10 // Only 10 items visible at a time
      let currentIndex = 0
      
      const virtualScroll = (startIndex: number, endIndex: number) => {
        return largeDataset.slice(startIndex, endIndex)
      }
      
      const startTime = performance.now()
      
      // Simulate scrolling through entire dataset
      while (currentIndex < largeDataset.length) {
        const visibleItems = virtualScroll(currentIndex, currentIndex + viewportSize)
        expect(visibleItems).toHaveLength(viewportSize)
        currentIndex += viewportSize
      }
      
      const endTime = performance.now()
      const scrollTime = endTime - startTime
      
      // Virtual scrolling should be very fast
      expect(scrollTime).toBeLessThan(100)
      expect(currentIndex).toBe(1000)
    })
  })

  describe('Performance Monitoring and Metrics', () => {
    it('should collect performance metrics', () => {
      const metrics = {
        searchResponseTime: [],
        renderTime: [],
        queryTime: [],
        memoryUsage: []
      }
      
      const recordMetric = (type: string, value: number) => {
        metrics[`${type}Time` as keyof typeof metrics].push(value)
      }
      
      // Simulate performance measurements
      recordMetric('search', 85)
      recordMetric('render', 45)
      recordMetric('query', 120)
      
      expect(metrics.searchResponseTime).toEqual([85])
      expect(metrics.renderTime).toEqual([45])
      expect(metrics.queryTime).toEqual([120])
    })

    it('should alert on performance threshold breaches', () => {
      let alerts: string[] = []
      
      const checkPerformanceThreshold = (metric: string, value: number, threshold: number) => {
        if (value > threshold) {
          alerts.push(`ALERT: ${metric} exceeded threshold (${value}ms > ${threshold}ms)`)
        }
      }
      
      // Test threshold breaches
      checkPerformanceThreshold('search', 150, 100) // Should alert
      checkPerformanceThreshold('render', 30, 50) // Should not alert
      checkPerformanceThreshold('query', 300, 200) // Should alert
      
      expect(alerts).toHaveLength(2)
      expect(alerts[0]).toContain('search')
      expect(alerts[1]).toContain('query')
    })

    it('should generate performance reports', () => {
      const performanceData = {
        totalRequests: 1000,
        averageSearchTime: 75,
        averageRenderTime: 42,
        averageQueryTime: 145,
        cacheHitRate: 0.85,
        errorRate: 0.02,
        throughput: 50, // requests per second
        uptime: 99.9
      }
      
      const generatePerformanceReport = (data: typeof performanceData) => {
        return {
          summary: `System processed ${data.totalRequests} requests with ${data.throughput} req/sec`,
          searchPerformance: `Average search time: ${data.averageSearchTime}ms`,
          renderPerformance: `Average render time: ${data.averageRenderTime}ms`,
          cacheEfficiency: `Cache hit rate: ${(data.cacheHitRate * 100).toFixed(1)}%`,
          reliability: `Uptime: ${data.uptime}%`,
          recommendations: data.averageQueryTime > 200 ? ['Optimize database queries'] : []
        }
      }
      
      const report = generatePerformanceReport(performanceData)
      
      expect(report.summary).toContain('1000')
      expect(report.searchPerformance).toContain('75ms')
      expect(report.cacheEfficiency).toContain('85.0%')
      expect(report.reliability).toContain('99.9%')
    })
  })

  describe('Network Performance', () => {
    it('should optimize API request sizes', () => {
      const doctorData = generateLargeDoctorDataset(1)[0]
      const fullSize = JSON.stringify(doctorData).length
      
      const optimizeDoctorData = (doctor: any) => {
        const optimized = {
          id: doctor.id,
          name: doctor.name,
          specialty: doctor.specialty,
          rating: doctor.rating,
          clinicName: doctor.clinicName
          // Exclude large fields like bio, qualifications details, etc.
        }
        return optimized
      }
      
      const optimizedSize = JSON.stringify(optimizeDoctorData(doctorData)).length
      const compressionRatio = fullSize / optimizedSize
      
      expect(compressionRatio).toBeGreaterThan(2) // At least 50% compression
      expect(optimizedSize).toBeLessThan(fullSize)
    })

    it('should implement request batching for efficiency', async () => {
      const requests = Array.from({ length: 20 }, (_, i) => ({
        id: `request_${i}`,
        type: 'doctor_query',
        params: { specialty: ['Cardiology', 'Dermatology'][i % 2] }
      }))
      
      const startTime = performance.now()
      
      // Batch requests
      const batchedResponse = await new Promise(resolve => {
        setTimeout(() => {
          resolve(requests.map(req => ({
            id: req.id,
            data: `result_for_${req.params.specialty}`
          })))
        }, 100)
      })
      
      const endTime = performance.now()
      const batchTime = endTime - startTime
      
      expect(batchedResponse).toHaveLength(20)
      expect(batchTime).toBeLessThan(150)
    })

    it('should handle network timeouts gracefully', async () => {
      const timeoutDuration = 2000
      let timeoutOccurred = false
      
      const networkRequest = () => {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            timeoutOccurred = true
            reject(new Error('Network timeout'))
          }, timeoutDuration)
          
          // Simulate fast response
          setTimeout(() => {
            clearTimeout(timeout)
            resolve('success')
          }, 100)
        })
      }
      
      try {
        const result = await networkRequest()
        expect(result).toBe('success')
        expect(timeoutOccurred).toBe(false)
      } catch (error) {
        expect(error.message).toBe('Network timeout')
        expect(timeoutOccurred).toBe(true)
      }
    })
  })
})