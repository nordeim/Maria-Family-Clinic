'use client'

export { ServiceSearchInput } from './service-search-input'
export { AdvancedServiceFilters } from './advanced-service-filters'
export { ServiceFilterChips } from './service-filter-chips'
export { SavedSearches } from './saved-searches'
export { ServiceSearchPage } from './service-search-page'
export { ServiceSearchResult, SearchResults } from './search-results'
export { MobileServiceSearch } from './mobile-service-search'

// Hook for advanced service search
export { useAdvancedServiceSearch } from '@/hooks/use-advanced-service-search'

// Types
export type {
  SearchFilters,
  ClinicSearchResult,
  SearchSuggestion,
  SavedSearch,
  SearchResultRanking,
  MedicalSpecialty,
  ServiceType,
  UrgencyLevel,
  ServiceDuration,
  ComplexityLevel,
  PatientType,
  InsuranceType,
  RankingCriteria,
  VoiceSearchResult,
  MedicalTermDictionary,
  SearchAlert,
  AdvancedSearchConfig,
  SearchEngine,
  SearchCache,
  SearchFilterChip
} from '@/types/search'