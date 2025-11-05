import { 
  VoiceProvider, 
  MessageType, 
  MessageSentiment, 
  DeviceType 
} from '../lib/types/multi-channel-contact'

// Voice-to-Text Service for Accessibility
export class VoiceToTextService {
  private recognition: SpeechRecognition | null = null
  private synthesis: SpeechSynthesis
  private isListening: boolean = false
  private currentConfig: VoiceConfig
  
  constructor(config: VoiceConfig) {
    this.synthesis = window.speechSynthesis
    this.currentConfig = config
    this.initializeRecognition()
  }
  
  private initializeRecognition() {
    // Check for browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported')
      return
    }
    
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    this.recognition = new SpeechRecognition()
    
    // Configure recognition settings
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = this.currentConfig.defaultLanguage
    this.recognition.maxAlternatives = 1
    
    // Add medical vocabulary if configured
    if (this.currentConfig.medicalVocabulary.length > 0) {
      // Note: In a real implementation, you'd use a custom grammar or add words to browser's dictionary
      console.log('Medical vocabulary loaded:', this.currentConfig.medicalVocabulary)
    }
  }
  
  /**
   * Start speech recognition
   */
  async startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: SpeechRecognitionError) => void,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<boolean> {
    if (!this.recognition) {
      onError({ 
        error: 'not_supported', 
        message: 'Speech recognition not supported' 
      } as SpeechRecognitionError)
      return false
    }
    
    if (this.isListening) {
      console.warn('Already listening')
      return false
    }
    
    try {
      this.recognition.onstart = () => {
        this.isListening = true
        onStart?.()
      }
      
      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          const confidence = event.results[i][0].confidence
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        if (finalTranscript) {
          onResult(finalTranscript, true)
        } else if (interimTranscript) {
          onResult(interimTranscript, false)
        }
      }
      
      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        this.isListening = false
        onError(event)
      }
      
      this.recognition.onend = () => {
        this.isListening = false
        onEnd?.()
      }
      
      this.recognition.start()
      return true
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      return false
    }
  }
  
  /**
   * Stop speech recognition
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
  }
  
  /**
   * Convert text to speech
   */
  speakText(
    text: string, 
    options: TextToSpeechOptions = {}
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'))
        return
      }
      
      // Cancel any ongoing speech
      this.synthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      
      // Configure utterance
      utterance.lang = options.language || this.currentConfig.defaultLanguage
      utterance.rate = options.rate || 1.0
      utterance.pitch = options.pitch || 1.0
      utterance.volume = options.volume || 1.0
      
      // Try to find a suitable voice
      const voices = this.synthesis.getVoices()
      if (voices.length > 0) {
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith(utterance.lang) && 
          voice.name.toLowerCase().includes('female')
        ) || voices.find(voice => voice.lang.startsWith(utterance.lang)) || voices[0]
        
        utterance.voice = preferredVoice
      }
      
      utterance.onend = () => resolve()
      utterance.onerror = (error) => reject(error)
      
      this.synthesis.speak(utterance)
    })
  }
  
  /**
   * Analyze speech confidence and sentiment
   */
  analyzeSpeech(
    transcript: string, 
    confidence: number
  ): SpeechAnalysis {
    const analysis: SpeechAnalysis = {
      transcript,
      confidence,
      sentiment: this.analyzeSentiment(transcript),
      language: this.detectLanguage(transcript),
      medicalKeywords: this.extractMedicalKeywords(transcript),
      urgency: this.assessUrgency(transcript),
      isQuestion: this.isQuestion(transcript),
      isEmergency: this.isEmergency(transcript)
    }
    
    return analysis
  }
  
  /**
   * Process voice message for healthcare context
   */
  async processVoiceMessage(
    audioBlob: Blob,
    context: HealthcareContext
  ): Promise<VoiceMessageResult> {
    try {
      // Convert audio to text (in real implementation, this would use a service like Google Speech-to-Text)
      const transcript = await this.transcribeAudio(audioBlob)
      
      // Analyze the speech
      const analysis = this.analyzeSpeech(transcript, 0.8) // Mock confidence
      
      // Extract healthcare-specific information
      const healthInfo = this.extractHealthInformation(transcript, context)
      
      return {
        transcript,
        analysis,
        healthInfo,
        recommendations: this.generateRecommendations(analysis, healthInfo),
        actionRequired: this.determineActionRequired(analysis, healthInfo)
      }
    } catch (error) {
      console.error('Error processing voice message:', error)
      throw error
    }
  }
  
  private analyzeSentiment(text: string): MessageSentiment {
    const positiveWords = ['good', 'great', 'better', 'improved', 'thank', 'appreciate']
    const negativeWords = ['bad', 'worse', 'terrible', 'pain', 'suffer', 'emergency', 'urgent']
    const urgentWords = ['emergency', 'urgent', 'immediately', 'critical', 'severe']
    
    const lowerText = text.toLowerCase()
    
    if (urgentWords.some(word => lowerText.includes(word))) {
      return MessageSentiment.VERY_NEGATIVE
    }
    
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length
    
    if (negativeCount > positiveCount) {
      return MessageSentiment.NEGATIVE
    } else if (positiveCount > negativeCount) {
      return MessageSentiment.POSITIVE
    }
    
    return MessageSentiment.NEUTRAL
  }
  
  private detectLanguage(text: string): string {
    // Simple language detection based on common words
    const englishWords = ['hello', 'appointment', 'doctor', 'clinic', 'help']
    const chineseWords = ['你好', '预约', '医生', '诊所', '帮助']
    const malayWords = ['hello', 'appointment', 'doktor', 'klinik', 'bantuan']
    
    const lowerText = text.toLowerCase()
    
    if (chineseWords.some(word => lowerText.includes(word))) return 'zh-CN'
    if (malayWords.some(word => lowerText.includes(word))) return 'ms-MY'
    
    return 'en-SG' // Default to Singapore English
  }
  
  private extractMedicalKeywords(text: string): string[] {
    const medicalTerms = [
      'fever', 'cough', 'pain', 'headache', 'stomach ache', 'sore throat',
      'diabetes', 'hypertension', 'heart', 'lung', 'liver', 'kidney',
      'medication', 'prescription', 'treatment', 'diagnosis', 'symptom',
      'blood pressure', 'sugar level', 'cholesterol', 'vaccination'
    ]
    
    const lowerText = text.toLowerCase()
    return medicalTerms.filter(term => lowerText.includes(term))
  }
  
  private assessUrgency(text: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalWords = ['emergency', 'severe', 'chest pain', 'difficulty breathing', 'unconscious']
    const highWords = ['urgent', 'asap', 'pain', 'fever', 'sick']
    const mediumWords = ['appointment', 'consultation', 'checkup', 'screening']
    
    const lowerText = text.toLowerCase()
    
    if (criticalWords.some(word => lowerText.includes(word))) return 'critical'
    if (highWords.some(word => lowerText.includes(word))) return 'high'
    if (mediumWords.some(word => lowerText.includes(word))) return 'medium'
    
    return 'low'
  }
  
  private isQuestion(text: string): boolean {
    const questionWords = ['what', 'when', 'where', 'how', 'why', 'which', 'who', '?']
    const lowerText = text.toLowerCase()
    
    return questionWords.some(word => lowerText.includes(word)) || text.includes('?')
  }
  
  private isEmergency(text: string): boolean {
    const emergencyWords = [
      'emergency', 'chest pain', 'difficulty breathing', 'unconscious',
      'severe bleeding', 'stroke', 'heart attack', 'seizure',
      'broken bone', 'head injury', 'overdose', 'suicide'
    ]
    
    const lowerText = text.toLowerCase()
    return emergencyWords.some(word => lowerText.includes(word))
  }
  
  private extractHealthInformation(
    text: string, 
    context: HealthcareContext
  ): HealthInformation {
    return {
      symptoms: this.extractMedicalKeywords(text),
      medications: this.extractMedications(text),
      conditions: this.extractConditions(text),
      allergies: this.extractAllergies(text),
      severity: this.assessUrgency(text),
      bodyParts: this.extractBodyParts(text),
      timeframes: this.extractTimeframes(text)
    }
  }
  
  private extractMedications(text: string): string[] {
    // Mock medication extraction
    const medicationPatterns = [
      /taking (.+?)(?:\s|$|\.|,)/gi,
      /medication (.+?)(?:\s|$|\.|,)/gi,
      /prescribed (.+?)(?:\s|$|\.|,)/gi
    ]
    
    const medications: string[] = []
    medicationPatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        medications.push(...matches.map(match => match.trim()))
      }
    })
    
    return medications
  }
  
  private extractConditions(text: string): string[] {
    // Mock condition extraction
    const conditions = [
      'diabetes', 'hypertension', 'asthma', 'heart disease', 'depression',
      'anxiety', 'arthritis', 'migraine', 'allergies'
    ]
    
    const lowerText = text.toLowerCase()
    return conditions.filter(condition => lowerText.includes(condition))
  }
  
  private extractAllergies(text: string): string[] {
    // Mock allergy extraction
    const allergyPatterns = [
      /allergic to (.+?)(?:\s|$|\.|,)/gi,
      /allergy (.+?)(?:\s|$|\.|,)/gi
    ]
    
    const allergies: string[] = []
    allergyPatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        allergies.push(...matches.map(match => match.trim()))
      }
    })
    
    return allergies
  }
  
  private extractBodyParts(text: string): string[] {
    const bodyParts = [
      'head', 'chest', 'back', 'stomach', 'arm', 'leg', 'hand', 'foot',
      'heart', 'lung', 'liver', 'kidney', 'brain', 'throat', 'eye', 'ear'
    ]
    
    const lowerText = text.toLowerCase()
    return bodyParts.filter(part => lowerText.includes(part))
  }
  
  private extractTimeframes(text: string): string[] {
    const timeframePatterns = [
      /(\d+\s*(?:days?|weeks?|months?|years?))/gi,
      /(today|yesterday|tomorrow)/gi,
      /(morning|afternoon|evening|night)/gi
    ]
    
    const timeframes: string[] = []
    timeframePatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        timeframes.push(...matches.map(match => match.trim()))
      }
    })
    
    return timeframes
  }
  
  private generateRecommendations(
    analysis: SpeechAnalysis, 
    healthInfo: HealthInformation
  ): string[] {
    const recommendations: string[] = []
    
    if (analysis.isEmergency) {
      recommendations.push('URGENT: This appears to be a medical emergency. Call 995 immediately.')
    } else if (healthInfo.severity === 'high') {
      recommendations.push('This seems urgent. Consider same-day appointment.')
    } else if (healthInfo.symptoms.length > 0) {
      recommendations.push('Medical symptoms detected. Recommend consultation with healthcare provider.')
    }
    
    if (healthInfo.medications.length > 0) {
      recommendations.push('Medication information noted. Bring medication list to appointment.')
    }
    
    if (healthInfo.allergies.length > 0) {
      recommendations.push('Allergy information noted. Ensure allergy alerts are updated.')
    }
    
    return recommendations
  }
  
  private determineActionRequired(
    analysis: SpeechAnalysis, 
    healthInfo: HealthInformation
  ): 'none' | 'callback' | 'appointment' | 'emergency' {
    if (analysis.isEmergency) {
      return 'emergency'
    } else if (healthInfo.severity === 'critical' || healthInfo.severity === 'high') {
      return 'appointment'
    } else if (healthInfo.symptoms.length > 0) {
      return 'callback'
    }
    
    return 'none'
  }
  
  private async transcribeAudio(audioBlob: Blob): Promise<string> {
    // Mock transcription - in real implementation, this would call a speech-to-text service
    return "Hello, I would like to book an appointment. I'm experiencing some chest pain and feel very unwell."
  }
  
  /**
   * Get available voices for text-to-speech
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices().filter(voice => 
      voice.lang.startsWith('en') || 
      voice.lang.startsWith('zh') || 
      voice.lang.startsWith('ms')
    )
  }
  
  /**
   * Check if voice service is available
   */
  isServiceAvailable(): boolean {
    return !!(this.recognition || this.synthesis)
  }
  
  /**
   * Get current listening status
   */
  getStatus(): VoiceServiceStatus {
    return {
      isListening: this.isListening,
      isSpeaking: this.synthesis.speaking,
      isAvailable: this.isServiceAvailable(),
      supportedLanguages: this.currentConfig.supportedLanguages
    }
  }
}

// Supporting interfaces and types

interface VoiceConfig {
  name: string
  provider: VoiceProvider
  isActive: boolean
  apiEndpoint?: string
  supportedLanguages: string[]
  defaultLanguage: string
  medicalVocabulary: string[]
  confidenceThreshold: number
  enablePunctuation: boolean
  enableSentiment: boolean
}

interface SpeechAnalysis {
  transcript: string
  confidence: number
  sentiment: MessageSentiment
  language: string
  medicalKeywords: string[]
  urgency: 'low' | 'medium' | 'high' | 'critical'
  isQuestion: boolean
  isEmergency: boolean
}

interface HealthcareContext {
  patientId?: string
  clinicId?: string
  doctorId?: string
  serviceType?: string
  medicalHistory?: string[]
  currentMedications?: string[]
  allergies?: string[]
}

interface HealthInformation {
  symptoms: string[]
  medications: string[]
  conditions: string[]
  allergies: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  bodyParts: string[]
  timeframes: string[]
}

interface VoiceMessageResult {
  transcript: string
  analysis: SpeechAnalysis
  healthInfo: HealthInformation
  recommendations: string[]
  actionRequired: 'none' | 'callback' | 'appointment' | 'emergency'
}

interface TextToSpeechOptions {
  language?: string
  rate?: number
  pitch?: number
  volume?: number
  voice?: SpeechSynthesisVoice
}

interface VoiceServiceStatus {
  isListening: boolean
  isSpeaking: boolean
  isAvailable: boolean
  supportedLanguages: string[]
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognitionError {
  error: string
  message: string
}

// Export singleton instance
export const voiceToTextService = new VoiceToTextService({
  name: 'default',
  provider: VoiceProvider.GOOGLE,
  isActive: true,
  supportedLanguages: ['en-SG', 'zh-CN', 'ms-MY'],
  defaultLanguage: 'en-SG',
  medicalVocabulary: ['fever', 'cough', 'headache', 'diabetes', 'hypertension'],
  confidenceThreshold: 0.7,
  enablePunctuation: true,
  enableSentiment: true
})
