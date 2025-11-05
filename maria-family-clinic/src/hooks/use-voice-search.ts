import { useState, useCallback, useRef, useEffect } from 'react'
import { medicalTermRecognizer } from '@/lib/medical-terms'
import { VOICE_SEARCH_COMMANDS, VOICE_CONFIDENCE_THRESHOLDS } from '@/lib/medical-terms'
import { VoiceSearchResult, VoiceSearchSupported } from '@/types/search'

interface UseVoiceSearchOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
  onResult?: (transcript: string, confidence: number) => void
  onError?: (error: string) => void
  onStart?: () => void
  onEnd?: () => void
  onMedicalTermsRecognized?: (terms: string[]) => void
  onCommandRecognized?: (command: string, value?: string) => void
}

export function useVoiceSearch(options: UseVoiceSearchOptions = {}) {
  const {
    language = 'en-SG',
    continuous = false,
    interimResults = true,
    maxAlternatives = 1,
    onResult,
    onError,
    onStart,
    onEnd,
    onMedicalTermsRecognized,
    onCommandRecognized
  } = options

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState("")

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check if speech recognition is supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition
      
      setIsSupported(!!SpeechRecognition)
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const processVoiceResult = useCallback((text: string, confidenceLevel: number): VoiceSearchResult => {
    const normalizedText = text.toLowerCase().trim()
    
    // Recognize medical terms
    const medicalRecognition = medicalTermRecognizer.recognizeTerms(text)
    
    // Check for voice commands
    let commandRecognized = false
    for (const [command, value] of Object.entries(VOICE_SEARCH_COMMANDS)) {
      if (normalizedText.includes(command.toLowerCase())) {
        commandRecognized = true
        onCommandRecognized?.(command, value)
        break
      }
    }

    // Analyze confidence and quality
    const needsCorrection = confidenceLevel < VOICE_CONFIDENCE_THRESHOLDS.MIN_ACCEPTABLE
    const highConfidence = confidenceLevel >= VOICE_CONFIDENCE_THRESHOLDS.HIGH_CONFIDENCE

    // Get suggestions for correction if needed
    let suggestion: string | undefined
    if (needsCorrection && medicalRecognition.recognizedTerms.length === 0) {
      // Try to get medical term suggestions
      const suggestions = medicalTermRecognizer.getSuggestions(text, 3)
      if (suggestions.length > 0) {
        suggestion = suggestions[0]
      }
    }

    // Notify about recognized medical terms
    if (medicalRecognition.recognizedTerms.length > 0) {
      onMedicalTermsRecognized?.(medicalRecognition.recognizedTerms)
    }

    return {
      recognizedText: text,
      confidence: confidenceLevel,
      medicalTermsRecognized: medicalRecognition.recognizedTerms,
      needsCorrection,
      suggestion
    }
  }, [onMedicalTermsRecognized, onCommandRecognized])

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      const errorMsg = "Voice search is not supported in this browser"
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    if (isListening) {
      return // Already listening
    }

    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.lang = language
    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.maxAlternatives = maxAlternatives

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      setTranscript("")
      setInterimTranscript("")
      onStart?.()
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ""
      let finalConfidence = 0
      let interimText = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
          finalConfidence = result[0].confidence || 0
        } else {
          interimText += result[0].transcript
        }
      }

      if (interimText) {
        setInterimTranscript(interimText)
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript)
        setConfidence(finalConfidence)
        
        // Process the voice result for medical terms and commands
        const voiceResult = processVoiceResult(finalTranscript.trim(), finalConfidence)
        
        // Call the original onResult callback
        onResult?.(finalTranscript, finalConfidence)
      }
    }

    recognition.onerror = (event: any) => {
      let errorMsg = event.error || "Voice recognition error"
      
      // Handle specific errors
      switch (event.error) {
        case 'no-speech':
          errorMsg = 'No speech detected. Please try again.'
          break
        case 'audio-capture':
          errorMsg = 'Microphone access denied or not available.'
          break
        case 'not-allowed':
          errorMsg = 'Microphone access denied. Please allow microphone access and try again.'
          break
        case 'network':
          errorMsg = 'Network error occurred. Please check your connection and try again.'
          break
        default:
          break
      }
      
      setError(errorMsg)
      setIsListening(false)
      onError?.(errorMsg)
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript("")
      onEnd?.()
    }

    try {
      recognition.start()
      
      // Set timeout for continuous listening
      if (!continuous) {
        timeoutRef.current = setTimeout(() => {
          recognition.stop()
        }, 10000) // 10 second timeout
      }
    } catch (err) {
      const errorMsg = "Failed to start speech recognition"
      setError(errorMsg)
      setIsListening(false)
      onError?.(errorMsg)
    }

    return () => recognition.stop()
  }, [isSupported, isListening, language, continuous, interimResults, maxAlternatives, 
      onResult, onError, onStart, onEnd, processVoiceResult])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
    setInterimTranscript("")
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [isListening])

  const abortListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.abort()
    }
    setIsListening(false)
    setInterimTranscript("")
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [isListening])

  const resetTranscript = useCallback(() => {
    setTranscript("")
    setConfidence(0)
    setInterimTranscript("")
    setError(null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isListening,
    transcript,
    interimTranscript,
    confidence,
    error,
    isSupported,
    startListening,
    stopListening,
    abortListening,
    resetTranscript,
    clearError,
    processVoiceResult
  }
}

// Hook for medical voice search
export function useMedicalVoiceSearch() {
  const [recognizedTerms, setRecognizedTerms] = useState<string[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [urgencyLevel, setUrgencyLevel] = useState<string | null>(null)

  const {
    isListening,
    isSupported,
    error,
    transcript,
    startListening,
    stopListening,
    processVoiceResult
  } = useVoiceSearch({
    onMedicalTermsRecognized: (terms) => {
      setRecognizedTerms(terms)
      
      // Extract specialties from medical terms
      const extractedSpecialties = terms.map(term => {
        const termData = medicalTermRecognizer.getRelatedTerms(term)
        return termData.specialty
      }).filter(Boolean)
      
      setSpecialties([...new Set(extractedSpecialties)])
      
      // Check for urgency indicators
      const hasUrgency = terms.some(term => {
        const urgencyLevels = ['emergency', 'urgent', 'pain', 'severe', 'acute']
        return urgencyLevels.some(indicator => term.toLowerCase().includes(indicator))
      })
      
      if (hasUrgency) {
        setUrgencyLevel('urgent')
      }
    }
  })

  const resetRecognizedData = useCallback(() => {
    setRecognizedTerms([])
    setSpecialties([])
    setUrgencyLevel(null)
  }, [])

  return {
    isListening,
    isSupported,
    error,
    transcript,
    recognizedTerms,
    specialties,
    urgencyLevel,
    startListening,
    stopListening,
    processVoiceResult,
    resetRecognizedData
  }
}

// Hook for voice command processing
export function useVoiceCommands() {
  const [command, setCommand] = useState<string | null>(null)
  const [commandValue, setCommandValue] = useState<string | null>(null)

  const handleCommand = useCallback((recognizedCommand: string, value?: string) => {
    setCommand(recognizedCommand)
    setCommandValue(value || null)
    
    // Process common medical voice commands
    switch (recognizedCommand) {
      case 'emergency':
        // Auto-set urgent filters
        console.log('Emergency mode activated')
        break
      case 'find':
      case 'search for':
        // Trigger search for the following terms
        console.log(`Searching for: ${value}`)
        break
      case 'clear filters':
        // Clear all active filters
        console.log('Clearing all filters')
        break
      case 'show results':
        // Display search results
        console.log('Showing search results')
        break
      default:
        break
    }
  }, [])

  const clearCommand = useCallback(() => {
    setCommand(null)
    setCommandValue(null)
  }, [])

  return {
    command,
    commandValue,
    handleCommand,
    clearCommand
  }
}

export default useVoiceSearch