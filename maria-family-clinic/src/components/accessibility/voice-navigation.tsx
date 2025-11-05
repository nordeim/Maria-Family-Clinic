/**
 * Voice Navigation Component
 * Provides voice-controlled navigation for accessibility
 */

"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useAccessibility } from './provider'
import { useI18n } from '@/lib/i18n/hook'

interface VoiceNavigationProps {
  commands?: VoiceCommand[]
  onCommand?: (command: VoiceCommand) => void
  showSettings?: boolean
  className?: string
}

interface VoiceCommand {
  phrase: string
  action: string
  description: string
  examples: string[]
}

const DEFAULT_COMMANDS: VoiceCommand[] = [
  {
    phrase: 'go to',
    action: 'navigate',
    description: 'Navigate to a specific page',
    examples: ['go to home', 'go to clinics', 'go to doctors', 'go to services']
  },
  {
    phrase: 'search for',
    action: 'search',
    description: 'Search for clinics, doctors, or services',
    examples: ['search for diabetes', 'search for heart specialist', 'search for clinic near me']
  },
  {
    phrase: 'book appointment',
    action: 'book',
    description: 'Start booking an appointment',
    examples: ['book appointment', 'book doctor appointment', 'book clinic appointment']
  },
  {
    phrase: 'show eligibility',
    action: 'eligibility',
    description: 'Check Healthier SG eligibility',
    examples: ['show eligibility', 'check if I am eligible', 'am I eligible for Healthier SG']
  },
  {
    phrase: 'change language',
    action: 'language',
    description: 'Change interface language',
    examples: ['change language to chinese', 'switch to malay', 'change to tamil']
  },
  {
    phrase: 'accessibility',
    action: 'accessibility',
    description: 'Open accessibility settings',
    examples: ['open accessibility', 'accessibility settings', 'show accessibility options']
  },
  {
    phrase: 'help',
    action: 'help',
    description: 'Show help and instructions',
    examples: ['help', 'show help', 'what can I say']
  },
  {
    phrase: 'repeat',
    action: 'repeat',
    description: 'Repeat last instruction',
    examples: ['repeat that', 'say again', 'repeat']
  }
]

export function VoiceNavigation({
  commands = DEFAULT_COMMANDS,
  onCommand,
  showSettings = true,
  className = ''
}: VoiceNavigationProps) {
  const { preferences, toggleFeature, announce } = useAccessibility()
  const { t, currentLanguage, formatDate, formatNumber } = useI18n()
  
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [lastCommand, setLastCommand] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  
  // Check for Web Speech API support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const speechSynthesis = window.speechSynthesis
      
      setIsSupported(!!(SpeechRecognition && speechSynthesis))
      
      if (SpeechRecognition && speechSynthesis) {
        const recognition = new SpeechRecognition()
        const synth = speechSynthesis
        
        // Configure speech recognition
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = getLanguageCode(currentLanguage)
        recognition.maxAlternatives = 1
        
        // Configure speech synthesis
        synth.lang = getLanguageCode(currentLanguage)
        synth.rate = preferences.speechSpeed
        synth.pitch = 1.0
        synth.volume = 0.8
        
        recognitionRef.current = recognition
        synthRef.current = synth
        
        recognition.onstart = () => {
          setIsListening(true)
          announce('Voice recognition started', 'polite')
        }
        
        recognition.onend = () => {
          setIsListening(false)
        }
        
        recognition.onresult = (event) => {
          const result = event.results[0]
          if (result) {
            const transcript = result[0].transcript.toLowerCase().trim()
            const confidence = result[0].confidence
            setConfidence(confidence)
            setLastCommand(transcript)
            
            processVoiceCommand(transcript, confidence)
          }
        }
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          announce(`Voice recognition error: ${event.error}`, 'assertive')
          setIsListening(false)
        }
      }
    }
  }, [currentLanguage, preferences.speechSpeed])
  
  const getLanguageCode = (lang: string): string => {
    const languageMap: Record<string, string> = {
      en: 'en-SG',
      zh: 'zh-SG',
      ms: 'ms-SG',
      ta: 'ta-SG'
    }
    return languageMap[lang] || 'en-SG'
  }
  
  const processVoiceCommand = (transcript: string, confidence: number) => {
    if (confidence < 0.7) {
      speak('I didn\'t understand that clearly. Please try again.')
      return
    }
    
    // Find matching command
    const command = commands.find(cmd => 
      transcript.includes(cmd.phrase) || 
      cmd.examples.some(example => transcript.includes(example))
    )
    
    if (command) {
      const voiceCommand = {
        phrase: transcript,
        action: command.action,
        description: command.description
      }
      
      announce(`Executing: ${command.description}`, 'assertive')
      onCommand?.(voiceCommand)
      
      // Execute specific actions
      executeCommand(command.action, transcript)
    } else {
      // General help response
      speak('Try saying "help" to see available commands.')
    }
  }
  
  const executeCommand = (action: string, transcript: string) => {
    switch (action) {
      case 'navigate':
        handleNavigation(transcript)
        break
      case 'search':
        handleSearch(transcript)
        break
      case 'book':
        handleBooking()
        break
      case 'eligibility':
        handleEligibility()
        break
      case 'language':
        handleLanguageChange(transcript)
        break
      case 'accessibility':
        handleAccessibility()
        break
      case 'help':
        showHelp()
        break
      case 'repeat':
        repeatLast()
        break
      default:
        speak('Command not recognized.')
    }
  }
  
  const handleNavigation = (transcript: string) => {
    if (transcript.includes('home')) {
      window.location.href = '/'
      speak('Navigating to home page')
    } else if (transcript.includes('clinic')) {
      window.location.href = '/clinics'
      speak('Navigating to clinics')
    } else if (transcript.includes('doctor')) {
      window.location.href = '/doctors'
      speak('Navigating to doctors')
    } else if (transcript.includes('service')) {
      window.location.href = '/services'
      speak('Navigating to services')
    } else {
      speak('Please specify where you want to go. Try "go to home", "go to clinics", or "go to doctors".')
    }
  }
  
  const handleSearch = (transcript: string) => {
    // Extract search query
    const searchQuery = transcript.replace('search for', '').trim()
    if (searchQuery) {
      // Navigate to search page with query
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
      speak(`Searching for ${searchQuery}`)
    } else {
      speak('Please specify what you want to search for.')
    }
  }
  
  const handleBooking = () => {
    window.location.href = '/book-appointment'
    speak('Opening appointment booking')
  }
  
  const handleEligibility = () => {
    window.location.href = '/eligibility-check'
    speak('Checking Healthier SG eligibility')
  }
  
  const handleLanguageChange = (transcript: string) => {
    if (transcript.includes('chinese') || transcript.includes('中文')) {
      // Language change would be handled by language selector
      speak('Changing language to Chinese')
    } else if (transcript.includes('malay')) {
      speak('Changing language to Malay')
    } else if (transcript.includes('tamil')) {
      speak('Changing language to Tamil')
    } else {
      speak('Say "change language to Chinese", "change language to Malay", or "change language to Tamil".')
    }
  }
  
  const handleAccessibility = () => {
    // This would open accessibility settings modal
    speak('Opening accessibility settings')
  }
  
  const showHelp = () => {
    const helpText = 'Available commands: ' + 
      commands.map(cmd => cmd.phrase).join(', ') + 
      '. Say "help" anytime to hear this list.'
    speak(helpText)
  }
  
  const repeatLast = () => {
    if (lastCommand) {
      speak(`You said: ${lastCommand}`)
    } else {
      speak('No previous command to repeat.')
    }
  }
  
  const speak = (text: string) => {
    if (synthRef.current && preferences.voiceNavigation) {
      // Cancel any ongoing speech
      synthRef.current.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = getLanguageCode(currentLanguage)
      utterance.rate = preferences.speechSpeed
      utterance.pitch = 1.0
      utterance.volume = 0.8
      
      synthRef.current.speak(utterance)
    }
  }
  
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start()
    }
  }
  
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }
  
  if (!isSupported) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        <p>Voice navigation is not supported in your browser.</p>
      </div>
    )
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Voice Control Button */}
      <div className="flex items-center space-x-3">
        <Button
          variant={isListening ? "default" : preferences.voiceNavigation ? "outline" : "secondary"}
          size="lg"
          onClick={isListening ? stopListening : startListening}
          disabled={!preferences.voiceNavigation}
          className="relative"
          aria-pressed={isListening}
          aria-label={isListening ? "Stop listening" : "Start voice navigation"}
        >
          {isListening ? (
            <Mic className="h-5 w-5 text-red-500" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
          {isListening && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </Button>
        
        <div className="flex-1">
          <p className="text-sm font-medium">
            {isListening 
              ? t('accessibility.listening', {}, { section: 'common', domain: 'accessibility', priority: 'medium', lastUpdated: '2025-01-01' })
              : preferences.voiceNavigation 
                ? t('accessibility.voiceReady', {}, { section: 'common', domain: 'accessibility', priority: 'medium', lastUpdated: '2025-01-01' })
                : t('accessibility.voiceDisabled', {}, { section: 'common', domain: 'accessibility', priority: 'medium', lastUpdated: '2025-01-01' })
            }
          </p>
          {lastCommand && (
            <p className="text-xs text-muted-foreground">
              {t('accessibility.lastCommand', {}, { section: 'common', domain: 'accessibility', priority: 'low', lastUpdated: '2025-01-01' })}: {lastCommand}
            </p>
          )}
        </div>
        
        {showSettings && (
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>
                {t('accessibility.voiceSettings', {}, { section: 'common', domain: 'accessibility', priority: 'medium', lastUpdated: '2025-01-01' })}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => toggleFeature('voiceNavigation')}>
                <Volume2 className="h-4 w-4 mr-2" />
                <div className="flex-1">
                  <p className="font-medium">Voice Navigation</p>
                  <p className="text-sm text-muted-foreground">
                    {preferences.voiceNavigation ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <Badge variant={preferences.voiceNavigation ? "default" : "outline"}>
                  {preferences.voiceNavigation ? 'ON' : 'OFF'}
                </Badge>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => toggleFeature('audioDescriptions')}>
                <Volume2 className="h-4 w-4 mr-2" />
                <div className="flex-1">
                  <p className="font-medium">Audio Descriptions</p>
                  <p className="text-sm text-muted-foreground">
                    {preferences.audioDescriptions ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <Badge variant={preferences.audioDescriptions ? "default" : "outline"}>
                  {preferences.audioDescriptions ? 'ON' : 'OFF'}
                </Badge>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <div className="p-3">
                <label className="text-sm font-medium">
                  Speech Speed: {preferences.speechSpeed.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={preferences.speechSpeed}
                  onChange={(e) => {
                    const speed = parseFloat(e.target.value)
                    // Update speech speed would be handled by accessibility provider
                  }}
                  className="w-full mt-2"
                />
              </div>
              
              <DropdownMenuSeparator />
              
              <div className="p-3">
                <p className="text-sm font-medium mb-2">
                  {t('accessibility.voiceCommands', {}, { section: 'common', domain: 'accessibility', priority: 'medium', lastUpdated: '2025-01-01' })}
                </p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>"go to clinics" - Navigate to clinics</p>
                  <p>"search for diabetes" - Search for health conditions</p>
                  <p>"book appointment" - Start booking process</p>
                  <p>"check eligibility" - Check Healthier SG eligibility</p>
                  <p>"change language" - Switch interface language</p>
                  <p>"help" - Show available commands</p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {/* Voice Status */}
      {isListening && (
        <div className="bg-accent p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">
              {t('accessibility.listeningForCommand', {}, { section: 'common', domain: 'accessibility', priority: 'medium', lastUpdated: '2025-01-01' })}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t('accessibility.sayHelpForCommands', {}, { section: 'common', domain: 'accessibility', priority: 'low', lastUpdated: '2025-01-01' })}
          </p>
        </div>
      )}
    </div>
  )
}

// Extend the Window interface to include speech recognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};