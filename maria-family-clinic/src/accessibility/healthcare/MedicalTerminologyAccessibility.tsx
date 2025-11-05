/**
 * Medical Terminology Accessibility System
 * Provides comprehensive accessibility support for medical terms and healthcare jargon
 */

"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useScreenReader } from '@/components/accessibility/screen-reader'

export interface MedicalTerm {
  id: string
  term: string
  pronunciation?: string
  definition: string
  category: string
  synonyms?: string[]
  examples?: string[]
  complexity: 'basic' | 'intermediate' | 'advanced'
  languages?: {
    zh?: string
    ms?: string
    ta?: string
  }
}

export interface MedicalTermAccessProps {
  children: React.ReactNode
  term: string
  medicalData?: MedicalTerm
  className?: string
  showPronunciation?: boolean
  showDefinition?: boolean
  autoPlay?: boolean
  language?: 'en' | 'zh' | 'ms' | 'ta'
}

export class MedicalTerminologyManager {
  private static instance: MedicalTerminologyManager
  private terms: Map<string, MedicalTerm> = new Map()
  private glossaryElements: Set<HTMLElement> = new Set()

  public static getInstance(): MedicalTerminologyManager {
    if (!MedicalTerminologyManager.instance) {
      MedicalTerminologyManager.instance = new MedicalTerminologyManager()
    }
    return MedicalTerminologyManager.instance
  }

  /**
   * Register medical terminology
   */
  registerTerm(term: MedicalTerm) {
    this.terms.set(term.term.toLowerCase(), term)
  }

  /**
   * Get medical term data
   */
  getTermData(term: string): MedicalTerm | null {
    const normalizedTerm = term.toLowerCase().trim()
    
    // Direct match
    if (this.terms.has(normalizedTerm)) {
      return this.terms.get(normalizedTerm)!
    }
    
    // Check synonyms
    for (const [key, termData] of this.terms.entries()) {
      if (termData.synonyms?.some(synonym => 
        synonym.toLowerCase() === normalizedTerm
      )) {
        return termData
      }
    }
    
    return null
  }

  /**
   * Search medical terms
   */
  searchTerms(query: string, category?: string): MedicalTerm[] {
    const normalizedQuery = query.toLowerCase().trim()
    const results: MedicalTerm[] = []

    for (const term of this.terms.values()) {
      const matchesTerm = term.term.toLowerCase().includes(normalizedQuery) ||
        term.definition.toLowerCase().includes(normalizedQuery) ||
        term.synonyms?.some(synonym => synonym.toLowerCase().includes(normalizedQuery))

      const matchesCategory = !category || term.category === category

      if (matchesTerm && matchesCategory) {
        results.push(term)
      }
    }

    return results.sort((a, b) => a.term.localeCompare(b.term))
  }

  /**
   * Get all terms by category
   */
  getTermsByCategory(category: string): MedicalTerm[] {
    return Array.from(this.terms.values()).filter(term => 
      term.category === category
    )
  }

  /**
   * Get terms by complexity
   */
  getTermsByComplexity(complexity: MedicalTerm['complexity']): MedicalTerm[] {
    return Array.from(this.terms.values()).filter(term => 
      term.complexity === complexity
    )
  }

  /**
   * Convert medical term to accessible format
   */
  toAccessibleFormat(term: string, language: string = 'en'): string {
    const termData = this.getTermData(term)
    if (!termData) return term

    const translations = termData.languages
    const translation = translations?.[language as keyof typeof translations]

    if (translation && language !== 'en') {
      return `${term} (${translation})`
    }

    return term
  }

  /**
   * Generate pronunciation for medical term
   */
  generatePronunciation(term: string): string {
    const termData = this.getTermData(term)
    if (termData?.pronunciation) {
      return termData.pronunciation
    }

    // Fallback to phonetic spelling
    return this.generatePhoneticSpelling(term)
  }

  /**
   * Generate simple phonetic spelling for complex terms
   */
  private generatePhoneticSpelling(term: string): string {
    const phoneticMap: Record<string, string> = {
      'ae': 'EE',
      'oe': 'EE',
      'tion': 'SHUN',
      'sion': 'ZHUN',
      'ia': 'EE-AH',
      'ph': 'F',
      'gh': 'G',
      'q': 'K',
      'x': 'KS',
      'z': 'Z'
    }

    let phonetic = term.toLowerCase()
    
    Object.entries(phoneticMap).forEach(([letter, sound]) => {
      const regex = new RegExp(letter, 'gi')
      phonetic = phonetic.replace(regex, sound)
    })

    return phonetic
  }

  /**
   * Add medical term accessibility markup
   */
  addMedicalTermMarkup(element: HTMLElement, term: string) {
    const termData = this.getTermData(term)
    if (!termData) return

    element.setAttribute('data-medical-term', term)
    element.setAttribute('data-term-id', termData.id)
    element.setAttribute('data-term-definition', termData.definition)
    
    if (termData.pronunciation) {
      element.setAttribute('data-pronunciation', termData.pronunciation)
    }

    if (termData.complexity) {
      element.setAttribute('data-complexity', termData.complexity)
    }

    // Add ARIA attributes for screen readers
    element.setAttribute('aria-describedby', `${termData.id}-definition`)
    
    this.glossaryElements.add(element)
  }

  /**
   * Remove medical term markup
   */
  removeMedicalTermMarkup(element: HTMLElement) {
    element.removeAttribute('data-medical-term')
    element.removeAttribute('data-term-id')
    element.removeAttribute('data-term-definition')
    element.removeAttribute('data-pronunciation')
    element.removeAttribute('data-complexity')
    element.removeAttribute('aria-describedby')
    
    this.glossaryElements.delete(element)
  }

  /**
   * Get all registered medical terms
   */
  getAllTerms(): MedicalTerm[] {
    return Array.from(this.terms.values())
  }

  /**
   * Initialize with common healthcare terms
   */
  initializeCommonTerms() {
    const commonTerms: MedicalTerm[] = [
      // Basic terms
      {
        id: 'hypertension',
        term: 'Hypertension',
        pronunciation: 'high-per-ten-shun',
        definition: 'High blood pressure, a condition where the force of blood against artery walls is too high',
        category: 'cardiovascular',
        synonyms: ['High blood pressure', 'High BP'],
        complexity: 'basic',
        languages: {
          zh: '高血压',
          ms: 'Tekanan darah tinggi',
          ta: 'அதிக இரத்த அழுத்தம்'
        }
      },
      {
        id: 'diabetes',
        term: 'Diabetes',
        pronunciation: 'die-ah-bee-teez',
        definition: 'A chronic condition that affects how the body processes blood sugar (glucose)',
        category: 'endocrine',
        synonyms: ['Diabetes mellitus', 'High blood sugar'],
        complexity: 'basic',
        languages: {
          zh: '糖尿病',
          ms: 'Diabetes',
          ta: 'நீரிழிவு'
        }
      },
      {
        id: 'appointment',
        term: 'Appointment',
        pronunciation: 'ah-point-ment',
        definition: 'A scheduled meeting between a patient and healthcare provider',
        category: 'general',
        synonyms: ['Visit', 'Consultation'],
        complexity: 'basic',
        languages: {
          zh: '预约',
          ms: 'Temu janji',
          ta: 'சந்திப்பு'
        }
      },
      {
        id: 'prescription',
        term: 'Prescription',
        pronunciation: 'prih-skrip-shun',
        definition: 'A written instruction from a doctor authorizing the preparation and use of a medicine',
        category: 'medication',
        synonyms: ['Medication order', 'Rx'],
        complexity: 'intermediate',
        languages: {
          zh: '处方',
          ms: 'Preskripsi',
          ta: 'மருந்துச்சீட்டு'
        }
      },
      // Intermediate terms
      {
        id: 'cardiovascular',
        term: 'Cardiovascular',
        pronunciation: 'card-ee-oh-vas-kyoo-ler',
        definition: 'Relating to the heart and blood vessels',
        category: 'anatomy',
        synonyms: ['Heart and blood vessel', 'Circulatory'],
        complexity: 'intermediate',
        languages: {
          zh: '心血管',
          ms: 'Kardiovaskular',
          ta: 'இதயம் மற்றும் இரத்த நாளங்கள்'
        }
      },
      {
        id: 'diagnosis',
        term: 'Diagnosis',
        pronunciation: 'die-ag-no-sis',
        definition: 'The identification of the nature of an illness or problem',
        category: 'medical-process',
        synonyms: ['Medical identification', 'Assessment'],
        complexity: 'intermediate',
        languages: {
          zh: '诊断',
          ms: 'Diagnosa',
          ta: 'நோய் கண்டறிதல்'
        }
      },
      // Advanced terms
      {
        id: 'contraindication',
        term: 'Contraindication',
        pronunciation: 'kon-tra-in-di-ka-shun',
        definition: 'A specific situation in which a particular treatment should not be used because it may be harmful',
        category: 'medication',
        synonyms: ['Treatment restriction', 'Warning'],
        complexity: 'advanced',
        languages: {
          zh: '禁忌症',
          ms: 'Kontraindikasi',
          ta: 'எதிர் சுட்டிக்கை'
        }
      },
      {
        id: 'prognosis',
        term: 'Prognosis',
        pronunciation: 'prog-no-sis',
        definition: 'A prediction of the likely course of a disease or ailment',
        category: 'medical-process',
        synonyms: ['Expected outcome', 'Forecast'],
        complexity: 'advanced',
        languages: {
          zh: '预后',
          ms: 'Prognosis',
          ta: 'முன்னறிவிப்பு'
        }
      }
    ]

    commonTerms.forEach(term => this.registerTerm(term))
  }
}

/**
 * Accessible Medical Term Component
 */
export function MedicalTermAccess({
  children,
  term,
  medicalData,
  className = '',
  showPronunciation = true,
  showDefinition = false,
  autoPlay = false,
  language = 'en'
}: MedicalTermAccessProps) {
  const [isExpanded, setIsExpanded] = useState(showDefinition)
  const [isPlaying, setIsPlaying] = useState(false)
  const { announce } = useScreenReader()
  const manager = MedicalTerminologyManager.getInstance()
  const audioRef = useRef<HTMLAudioElement>(null)

  const termData = medicalData || manager.getTermData(term)

  useEffect(() => {
    if (autoPlay && termData?.pronunciation) {
      playPronunciation()
    }
  }, [autoPlay, termData])

  const playPronunciation = () => {
    if (!termData?.pronunciation || !audioRef.current) return

    setIsPlaying(true)
    
    // Create speech synthesis for pronunciation
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(termData.pronunciation)
      utterance.lang = 'en-US'
      utterance.rate = 0.7
      utterance.pitch = 0.8
      
      utterance.onend = () => {
        setIsPlaying(false)
        announce(`Pronunciation of ${term} completed`)
      }
      
      speechSynthesis.speak(utterance)
    }
  }

  const handleTermClick = () => {
    if (showDefinition) {
      setIsExpanded(!isExpanded)
      announce(`${isExpanded ? 'Collapsed' : 'Expanded'} definition for ${term}`)
    }
    
    if (showPronunciation) {
      playPronunciation()
      announce(`Playing pronunciation for ${term}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleTermClick()
    }
  }

  if (!termData) {
    // Render without medical term formatting if no data found
    return <span className={className}>{children}</span>
  }

  return (
    <span className={`medical-term ${className}`}>
      <button
        type="button"
        className="medical-term-trigger"
        onClick={handleTermClick}
        onKeyDown={handleKeyDown}
        data-medical-term={term}
        data-term-id={termData.id}
        data-term-definition={termData.definition}
        data-pronunciation={termData.pronunciation}
        aria-describedby={`${termData.id}-definition`}
        aria-expanded={isExpanded}
        aria-haspopup={showDefinition ? 'dialog' : undefined}
      >
        {children}
        {showPronunciation && termData.pronunciation && (
          <span className="pronunciation-indicator" aria-label={`Pronunciation: ${termData.pronunciation}`}>
            🔊
          </span>
        )}
      </button>

      {showDefinition && (
        <div
          id={`${termData.id}-definition`}
          className={`medical-term-definition ${isExpanded ? 'expanded' : 'collapsed'}`}
          role="dialog"
          aria-label={`Definition for ${term}`}
        >
          <div className="definition-content">
            <h4 className="term-title">{term}</h4>
            
            {termData.pronunciation && (
              <div className="pronunciation-section">
                <strong>Pronunciation:</strong>
                <span className="pronunciation-text">{termData.pronunciation}</span>
                <button
                  type="button"
                  className="play-pronunciation-btn"
                  onClick={playPronunciation}
                  disabled={isPlaying}
                  aria-label={`Play pronunciation of ${term}`}
                >
                  {isPlaying ? '🔊 Playing...' : '🔊 Play'}
                </button>
              </div>
            )}
            
            <div className="definition-text">
              <strong>Definition:</strong>
              <p>{termData.definition}</p>
            </div>

            {termData.synonyms && termData.synonyms.length > 0 && (
              <div className="synonyms-section">
                <strong>Also known as:</strong>
                <ul>
                  {termData.synonyms.map((synonym, index) => (
                    <li key={index}>{synonym}</li>
                  ))}
                </ul>
              </div>
            )}

            {termData.examples && termData.examples.length > 0 && (
              <div className="examples-section">
                <strong>Examples:</strong>
                <ul>
                  {termData.examples.map((example, index) => (
                    <li key={index}>{example}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="term-meta">
              <span className="complexity-badge" data-complexity={termData.complexity}>
                {termData.complexity} level
              </span>
              <span className="category-badge">{termData.category}</span>
            </div>

            {termData.languages && Object.keys(termData.languages).length > 0 && (
              <div className="translations-section">
                <strong>Translations:</strong>
                <div className="translation-list">
                  {Object.entries(termData.languages).map(([lang, translation]) => (
                    <div key={lang} className="translation-item">
                      <span className="lang-code">{lang.toUpperCase()}:</span>
                      <span className="translation-text">{translation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="close-definition-btn"
            onClick={() => setIsExpanded(false)}
            aria-label="Close definition"
          >
            ✕
          </button>
        </div>
      )}

      <audio
        ref={audioRef}
        data-pronunciation-audio={termData.pronunciation}
        style={{ display: 'none' }}
      />
    </span>
  )
}

/**
 * Medical Term Glossary Component
 */
export function MedicalGlossary({ 
  category,
  complexity,
  searchQuery = '',
  language = 'en'
}: {
  category?: string
  complexity?: MedicalTerm['complexity']
  searchQuery?: string
  language?: 'en' | 'zh' | 'ms' | 'ta'
}) {
  const manager = MedicalTerminologyManager.getInstance()
  const [terms, setTerms] = useState<MedicalTerm[]>([])

  useEffect(() => {
    let filteredTerms = manager.getAllTerms()

    if (category) {
      filteredTerms = manager.getTermsByCategory(category)
    }

    if (complexity) {
      filteredTerms = filteredTerms.filter(term => term.complexity === complexity)
    }

    if (searchQuery) {
      filteredTerms = manager.searchTerms(searchQuery, category)
    }

    setTerms(filteredTerms)
  }, [manager, category, complexity, searchQuery])

  return (
    <div className="medical-glossary" role="region" aria-label="Medical terminology glossary">
      <h2>Medical Glossary</h2>
      
      {terms.length === 0 ? (
        <p>No medical terms found.</p>
      ) : (
        <div className="glossary-grid">
          {terms.map(term => (
            <div key={term.id} className="glossary-term-card">
              <h3 className="term-name">
                <MedicalTermAccess term={term.term} medicalData={term}>
                  {manager.toAccessibleFormat(term.term, language)}
                </MedicalTermAccess>
              </h3>
              
              {term.pronunciation && (
                <div className="pronunciation">
                  <strong>Pronunciation:</strong> {term.pronunciation}
                </div>
              )}
              
              <div className="definition">
                <strong>Definition:</strong> {term.definition}
              </div>

              {term.synonyms && term.synonyms.length > 0 && (
                <div className="synonyms">
                  <strong>Also known as:</strong> {term.synonyms.join(', ')}
                </div>
              )}

              <div className="meta">
                <span className="complexity" data-complexity={term.complexity}>
                  {term.complexity} level
                </span>
                <span className="category">{term.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Initialize common medical terms on module load
if (typeof window !== 'undefined') {
  MedicalTerminologyManager.getInstance().initializeCommonTerms()
}