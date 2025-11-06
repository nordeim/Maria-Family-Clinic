/**
 * Language Selector Component for Healthier SG
 * Supports Singapore's 4 official languages with cultural adaptation
 */

"use client"

import React, { useState } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { useI18n, useLanguage } from '@/lib/i18n/hook'
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/lib/i18n/config'
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

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'icon-only'
  showNativeNames?: boolean
  showQualityIndicator?: boolean
  onLanguageChange?: (language: LanguageCode) => void
  className?: string
}

export function LanguageSelector({
  variant = 'default',
  showNativeNames = true,
  showQualityIndicator = true,
  onLanguageChange,
  className = ''
}: LanguageSelectorProps) {
  const { currentLanguage, setLanguage, getTranslationQuality } = useLanguage()
  const { t, culturalContext } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  
  const handleLanguageChange = (languageCode: LanguageCode) => {
    setLanguage(languageCode)
    onLanguageChange?.(languageCode)
    setIsOpen(false)
  }
  
  const getQualityBadge = (languageCode: LanguageCode) => {
    if (!showQualityIndicator) return null
    
    const quality = getTranslationQuality('', languageCode) // This would be calculated per translation
    const colorMap = {
      'machine': 'secondary',
      'professional': 'default',
      'medical-review': 'default'
    } as const
    
    const labelMap = {
      'machine': t('accessibility.machineTranslated', {}, { section: 'common', domain: 'accessibility', priority: 'low', lastUpdated: '2025-01-01' }),
      'professional': t('accessibility.professionallyTranslated', {}, { section: 'common', domain: 'accessibility', priority: 'low', lastUpdated: '2025-01-01' }),
      'medical-review': t('accessibility.medicalReviewed', {}, { section: 'common', domain: 'accessibility', priority: 'low', lastUpdated: '2025-01-01' })
    }
    
    return (
      <Badge variant={colorMap[quality]} className="ml-2 text-xs">
        {labelMap[quality]}
      </Badge>
    )
  }
  
  const renderLanguageItem = (languageCode: LanguageCode) => {
    const language = SUPPORTED_LANGUAGES[languageCode]
    const isSelected = languageCode === currentLanguage
    
    return (
      <DropdownMenuItem
        key={languageCode}
        onClick={() => handleLanguageChange(languageCode)}
        className={`
          flex items-center justify-between p-3 cursor-pointer
          ${isSelected ? 'bg-accent text-accent-foreground' : ''}
          hover:bg-accent hover:text-accent-foreground
        `}
        aria-selected={isSelected}
        role="option"
      >
        <div className="flex items-center space-x-3">
          <span className="text-xl" role="img" aria-label={language.name}>
            {language.flag}
          </span>
          <div className="flex flex-col">
            <span className="font-medium">
              {showNativeNames ? language.nativeName : language.name}
            </span>
            {!showNativeNames && (
              <span className="text-sm text-muted-foreground">
                {language.nativeName}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getQualityBadge(languageCode)}
          {isSelected && (
            <div className="w-2 h-2 bg-primary rounded-full" aria-label="Currently selected" />
          )}
        </div>
      </DropdownMenuItem>
    )
  }
  
  if (variant === 'icon-only') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={`relative ${className}`}
            aria-label={t('common.language', {}, { section: 'common', domain: 'common', priority: 'medium', lastUpdated: '2025-01-01' })}
            title={t('common.language', {}, { section: 'common', domain: 'common', priority: 'medium', lastUpdated: '2025-01-01' })}
          >
            <Globe className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
              {SUPPORTED_LANGUAGES[currentLanguage].flag}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            {t('common.language', {}, { section: 'common', domain: 'common', priority: 'medium', lastUpdated: '2025-01-01' })}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.keys(SUPPORTED_LANGUAGES).map(renderLanguageItem)}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  
  if (variant === 'compact') {
    const currentLang = SUPPORTED_LANGUAGES[currentLanguage]
    
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`flex items-center space-x-2 ${className}`}
            aria-label={t('common.language', {}, { section: 'common', domain: 'common', priority: 'medium', lastUpdated: '2025-01-01' })}
          >
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium">
              {currentLang.nativeName}
            </span>
            <span className="text-lg">
              {currentLang.flag}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            {t('common.language', {}, { section: 'common', domain: 'common', priority: 'medium', lastUpdated: '2025-01-01' })}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.keys(SUPPORTED_LANGUAGES).map(renderLanguageItem)}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  
  // Default variant
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-between ${className}`}
          aria-label={t('common.language', {}, { section: 'common', domain: 'common', priority: 'medium', lastUpdated: '2025-01-01' })}
        >
          <div className="flex items-center space-x-3">
            <Globe className="h-4 w-4" />
            <span className="font-medium">
              {t('common.language', {}, { section: 'common', domain: 'common', priority: 'medium', lastUpdated: '2025-01-01' })}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              {SUPPORTED_LANGUAGES[currentLanguage].nativeName}
            </span>
            <span className="text-lg">
              {SUPPORTED_LANGUAGES[currentLanguage].flag}
            </span>
            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>
          {t('common.language', {}, { section: 'common', domain: 'common', priority: 'medium', lastUpdated: '2025-01-01' })}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.keys(SUPPORTED_LANGUAGES).map(renderLanguageItem)}
        <DropdownMenuSeparator />
        <div className="p-3 text-sm text-muted-foreground">
          <p>
            {t('accessibility.languageSupport', {}, { section: 'common', domain: 'accessibility', priority: 'low', lastUpdated: '2025-01-01' })}
          </p>
          {culturalContext.culturalGroup !== 'mixed' && (
            <p className="mt-1">
              {t('accessibility.culturalAdaptation', {}, { section: 'common', domain: 'accessibility', priority: 'low', lastUpdated: '2025-01-01' })}
            </p>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Cultural Context Selector for more granular cultural adaptation
interface CulturalContextSelectorProps {
  onContextChange?: (context: any) => void
  className?: string
}

export function CulturalContextSelector({
  onContextChange,
  className = ''
}: CulturalContextSelectorProps) {
  const { culturalContext, setCulturalContext } = useI18n()
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  
  const culturalOptions = [
    { 
      value: 'chinese', 
      label: '华人文化', 
      flag: '🇨🇳',
      description: 'Traditional Chinese health beliefs and practices'
    },
    { 
      value: 'malay', 
      label: 'Budaya Melayu', 
      flag: '🇲🇾',
      description: 'Malay Islamic health considerations'
    },
    { 
      value: 'indian', 
      label: 'தமிழ் பண்பாடு', 
      flag: '🇮🇳',
      description: 'Indian cultural health practices'
    },
    { 
      value: 'mixed', 
      label: 'Mixed Heritage', 
      flag: '🌏',
      description: 'Multiple cultural influences'
    },
    { 
      value: 'western', 
      label: 'Western Culture', 
      flag: '🌍',
      description: 'Western medical approaches'
    }
  ]
  
  const handleContextChange = (newContext: any) => {
    setCulturalContext(newContext)
    onContextChange?.(newContext)
  }
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-between ${className}`}
          aria-label="Cultural Context"
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">🌏</span>
            <span className="font-medium">
              Cultural Context
            </span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>
          Cultural Health Preferences
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {culturalOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleContextChange({
              ...culturalContext,
              culturalGroup: option.value
            })}
            className="flex flex-col items-start p-4 cursor-pointer"
          >
            <div className="flex items-center space-x-3 w-full">
              <span className="text-xl">{option.flag}</span>
              <span className="font-medium">{option.label}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {option.description}
            </p>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="p-3 text-sm text-muted-foreground">
          <p>
            Cultural context helps adapt health information to your background and preferences.
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}