/**
 * Font Size Adjuster Component
 * Provides text accessibility for users with visual impairments
 */

"use client"

import React from 'react'
import { Type, ZoomIn, ZoomOut } from 'lucide-react'
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
import type { AccessibilityPreferences } from './provider'

interface FontSizeAdjusterProps {
  variant?: 'slider' | 'buttons' | 'dropdown' | 'settings'
  showCurrentSize?: boolean
  className?: string
}

export function FontSizeAdjuster({
  variant = 'slider',
  showCurrentSize = true,
  className = ''
}: FontSizeAdjusterProps) {
  const { preferences, updatePreferences } = useAccessibility()
  const { announce } = useI18n()
  
  const sizeOptions = [
    { value: 'small' as const, label: 'Small', description: '14px', percentage: 90 },
    { value: 'medium' as const, label: 'Medium', description: '16px', percentage: 100 },
    { value: 'large' as const, label: 'Large', description: '18px', percentage: 110 },
    { value: 'extra-large' as const, label: 'Extra Large', description: '20px', percentage: 125 }
  ]
  
  const currentSize = sizeOptions.find(size => size.value === preferences.fontSize) || sizeOptions[1]
  
  const handleSizeChange = (size: AccessibilityPreferences['fontSize']) => {
    updatePreferences({ fontSize: size })
    announce(`Font size changed to ${size}`, 'polite')
  }
  
  const increaseFontSize = () => {
    const sizes = ['small', 'medium', 'large', 'extra-large'] as const
    const currentIndex = sizes.indexOf(preferences.fontSize)
    const nextIndex = Math.min(currentIndex + 1, sizes.length - 1)
    handleSizeChange(sizes[nextIndex])
  }
  
  const decreaseFontSize = () => {
    const sizes = ['small', 'medium', 'large', 'extra-large'] as const
    const currentIndex = sizes.indexOf(preferences.fontSize)
    const prevIndex = Math.max(currentIndex - 1, 0)
    handleSizeChange(sizes[prevIndex])
  }
  
  const renderSliderVariant = () => (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Type className="h-4 w-4" />
          <span className="font-medium">Font Size</span>
          {showCurrentSize && (
            <Badge variant="outline" className="text-xs">
              {currentSize.label}
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={decreaseFontSize}
            disabled={preferences.fontSize === 'small'}
            aria-label="Decrease font size"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={increaseFontSize}
            disabled={preferences.fontSize === 'extra-large'}
            aria-label="Increase font size"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {sizeOptions.map((size) => (
          <Button
            key={size.value}
            variant={preferences.fontSize === size.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleSizeChange(size.value)}
            className="flex-1"
            aria-pressed={preferences.fontSize === size.value}
          >
            {size.label}
          </Button>
        ))}
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p>Current size: {currentSize.description} ({currentSize.percentage}% of normal)</p>
      </div>
    </div>
  )
  
  const renderButtonsVariant = () => (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        variant="outline"
        size="icon"
        onClick={decreaseFontSize}
        disabled={preferences.fontSize === 'small'}
        aria-label="Decrease font size"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <Button
        variant={preferences.fontSize === 'extra-large' ? "default" : "outline"}
        size="sm"
        onClick={() => handleSizeChange('small')}
        aria-pressed={preferences.fontSize === 'small'}
      >
        A
      </Button>
      
      <Button
        variant={preferences.fontSize === 'medium' ? "default" : "outline"}
        size="sm"
        onClick={() => handleSizeChange('medium')}
        aria-pressed={preferences.fontSize === 'medium'}
      >
        A
      </Button>
      
      <Button
        variant={preferences.fontSize === 'large' ? "default" : "outline"}
        size="sm"
        onClick={() => handleSizeChange('large')}
        aria-pressed={preferences.fontSize === 'large'}
      >
        A
      </Button>
      
      <Button
        variant={preferences.fontSize === 'extra-large' ? "default" : "outline"}
        size="sm"
        onClick={() => handleSizeChange('extra-large')}
        aria-pressed={preferences.fontSize === 'extra-large'}
      >
        A
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={increaseFontSize}
        disabled={preferences.fontSize === 'extra-large'}
        aria-label="Increase font size"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
    </div>
  )
  
  const renderDropdownVariant = () => {
    const [isOpen, setIsOpen] = React.useState(false)
    
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`flex items-center space-x-2 ${className}`}
            aria-label="Font Size Settings"
          >
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">
              Font: {currentSize.label}
            </span>
            {showCurrentSize && (
              <Badge variant="outline" className="text-xs">
                {currentSize.percentage}%
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            Font Size Options
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sizeOptions.map((size) => (
            <DropdownMenuItem
              key={size.value}
              onClick={() => {
                handleSizeChange(size.value)
                setIsOpen(false)
              }}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <span 
                  className="font-medium"
                  style={{ fontSize: size.description }}
                >
                  {size.label}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {size.percentage}%
                </span>
                {preferences.fontSize === size.value && (
                  <Badge variant="default" className="text-xs">Current</Badge>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  
  const renderSettingsVariant = () => (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <Type className="h-5 w-5" />
        <h3 className="font-medium text-lg">
          {useI18n().t('common.fontSize', {}, { section: 'common', domain: 'common', priority: 'medium', lastUpdated: '2025-01-01' })}
        </h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {sizeOptions.map((size) => (
          <Button
            key={size.value}
            variant={preferences.fontSize === size.value ? "default" : "outline"}
            onClick={() => handleSizeChange(size.value)}
            className="flex flex-col items-center p-4 h-auto"
            aria-pressed={preferences.fontSize === size.value}
          >
            <span 
              className="font-medium mb-1"
              style={{ fontSize: size.description }}
            >
              {size.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {size.description} ({size.percentage}%)
            </span>
          </Button>
        ))}
      </div>
      
      <div className="bg-accent p-4 rounded-lg">
        <h4 className="font-medium mb-2">Preview</h4>
        <div 
          className="text-muted-foreground"
          style={{ fontSize: currentSize.description }}
        >
          <p className="font-medium mb-1">Sample Text</p>
          <p>This is how text will appear with the {currentSize.label} font size setting.</p>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p>
          <strong>Accessibility Tip:</strong> Increasing font size can help users with visual impairments 
          or those viewing content on small screens.
        </p>
      </div>
    </div>
  )
  
  switch (variant) {
    case 'buttons':
      return renderButtonsVariant()
    case 'dropdown':
      return renderDropdownVariant()
    case 'settings':
      return renderSettingsVariant()
    case 'slider':
    default:
      return renderSliderVariant()
  }
}