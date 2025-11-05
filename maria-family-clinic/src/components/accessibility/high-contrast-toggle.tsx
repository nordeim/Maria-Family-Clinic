/**
 * High Contrast Toggle Component
 * Provides visual accessibility for users with visual impairments
 */

"use client"

import React from 'react'
import { Contrast, Eye } from 'lucide-react'
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

interface HighContrastToggleProps {
  variant?: 'toggle' | 'dropdown' | 'settings'
  showIndicator?: boolean
  className?: string
}

export function HighContrastToggle({
  variant = 'toggle',
  showIndicator = true,
  className = ''
}: HighContrastToggleProps) {
  const { preferences, toggleFeature } = useAccessibility()
  const { t, announce } = useI18n()
  
  const handleToggle = () => {
    toggleFeature('highContrast')
    announce(
      preferences.highContrast 
        ? t('accessibility.highContrastDisabled', {}, { section: 'common', domain: 'accessibility', priority: 'medium', lastUpdated: '2025-01-01' })
        : t('accessibility.highContrastEnabled', {}, { section: 'common', domain: 'accessibility', priority: 'medium', lastUpdated: '2025-01-01' }),
      'assertive'
    )
  }
  
  const renderToggleVariant = () => (
    <Button
      variant={preferences.highContrast ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      className={`relative ${className}`}
      aria-pressed={preferences.highContrast}
      aria-label={t('common.highContrast', {}, { section: 'common', domain: 'common', priority: 'medium', lastUpdated: '2025-01-01' })}
    >
      <Eye className="h-4 w-4" />
      {showIndicator && (
        <Badge 
          variant={preferences.highContrast ? "secondary" : "outline"} 
          className="absolute -top-1 -right-1 text-xs px-1 py-0"
        >
          HC
        </Badge>
      )}
    </Button>
  )
  
  const renderDropdownVariant = () => {
    const [isOpen, setIsOpen] = React.useState(false)
    
    const contrastOptions = [
      {
        value: 'normal',
        label: 'Normal Contrast',
        description: 'Standard color scheme for most users',
        icon: '👁️'
      },
      {
        value: 'high',
        label: 'High Contrast',
        description: 'Enhanced contrast for better visibility',
        icon: '🖤'
      },
      {
        value: 'dark',
        label: 'Dark Mode',
        description: 'Dark background with light text',
        icon: '🌙'
      },
      {
        value: 'light',
        label: 'Light Mode',
        description: 'Light background with dark text',
        icon: '☀️'
      }
    ]
    
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`flex items-center space-x-2 ${className}`}
            aria-label={t('common.highContrast', {}, { section: 'common', domain: 'common', priority: 'medium', lastUpdated: '2025-01-01' })}
          >
            <Contrast className="h-4 w-4" />
            <span className="hidden sm:inline">
              {preferences.highContrast ? 'High Contrast' : 'Normal Contrast'}
            </span>
            {showIndicator && preferences.highContrast && (
              <Badge variant="default" className="text-xs">ON</Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            Visual Accessibility
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {contrastOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => {
                if (option.value === 'high') {
                  toggleFeature('highContrast')
                }
                setIsOpen(false)
              }}
              className="flex flex-col items-start p-3 cursor-pointer"
            >
              <div className="flex items-center space-x-2 w-full">
                <span className="text-lg">{option.icon}</span>
                <span className="font-medium">{option.label}</span>
                {option.value === 'high' && preferences.highContrast && (
                  <Badge variant="default" className="ml-auto text-xs">Active</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {option.description}
              </p>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  
  const renderSettingsVariant = () => (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Contrast className="h-4 w-4" />
          <span className="font-medium">
            {t('common.highContrast', {}, { section: 'common', domain: 'common', priority: 'medium', lastUpdated: '2025-01-01' })}
          </span>
        </div>
        <Button
          variant={preferences.highContrast ? "default" : "outline"}
          size="sm"
          onClick={handleToggle}
          aria-pressed={preferences.highContrast}
        >
          {preferences.highContrast ? 'On' : 'Off'}
        </Button>
      </div>
      {preferences.highContrast && (
        <div className="text-sm text-muted-foreground bg-accent p-3 rounded-md">
          <p>
            <strong>High contrast mode is enabled.</strong> This improves visibility by increasing color contrast and using more distinct visual patterns.
          </p>
        </div>
      )}
    </div>
  )
  
  switch (variant) {
    case 'dropdown':
      return renderDropdownVariant()
    case 'settings':
      return renderSettingsVariant()
    case 'toggle':
    default:
      return renderToggleVariant()
  }
}

// Color Blind Support Toggle
interface ColorBlindSupportToggleProps {
  className?: string
}

export function ColorBlindSupportToggle({ className = '' }: ColorBlindSupportToggleProps) {
  const { preferences, updatePreferences, announce } = useAccessibility()
  const { t } = useI18n()
  
  const supportTypes = [
    {
      value: 'none' as const,
      label: 'No Support',
      description: 'Standard colors',
      icon: '🎨'
    },
    {
      value: 'deuteranopia' as const,
      label: 'Deuteranopia',
      description: 'Red-green colorblindness (6% of males)',
      icon: '🟢'
    },
    {
      value: 'protanopia' as const,
      label: 'Protanopia',
      description: 'Red colorblindness (2% of population)',
      icon: '🔴'
    },
    {
      value: 'tritanopia' as const,
      label: 'Tritanopia',
      description: 'Blue-yellow colorblindness (rare)',
      icon: '🔵'
    }
  ]
  
  const handleTypeChange = (type: typeof preferences.colorBlindSupport) => {
    updatePreferences({ colorBlindSupport: type })
    announce(
      type === 'none' 
        ? t('accessibility.colorBlindSupportDisabled', {}, { section: 'common', domain: 'accessibility', priority: 'medium', lastUpdated: '2025-01-01' })
        : t('accessibility.colorBlindSupportEnabled', { type }, { section: 'common', domain: 'accessibility', priority: 'medium', lastUpdated: '2025-01-01' }),
      'polite'
    )
  }
  
  const currentSupport = supportTypes.find(s => s.value === preferences.colorBlindSupport) || supportTypes[0]
  
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center space-x-2">
        <span className="text-lg">🎨</span>
        <span className="font-medium">Color Accessibility</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {supportTypes.map((type) => (
          <Button
            key={type.value}
            variant={preferences.colorBlindSupport === type.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleTypeChange(type.value)}
            className="flex flex-col items-center p-3 h-auto"
            aria-pressed={preferences.colorBlindSupport === type.value}
          >
            <span className="text-xl mb-1">{type.icon}</span>
            <span className="text-xs font-medium text-center">{type.label}</span>
          </Button>
        ))}
      </div>
      
      <div className="text-sm text-muted-foreground bg-accent p-3 rounded-md">
        <p>
          <strong>Current: {currentSupport.label}</strong>
        </p>
        <p className="mt-1">{currentSupport.description}</p>
      </div>
    </div>
  )
}