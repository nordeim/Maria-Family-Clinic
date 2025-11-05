/**
 * Accessibility Settings Component
 * Centralized accessibility control panel for Healthier SG
 */

"use client"

import React, { useState } from 'react'
import { Settings, Save, RotateCcw, Eye, Volume2, Keyboard, Type } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useAccessibility, useVisualAccessibility, useAudioAccessibility, useKeyboardAccessibility } from './provider'
import { HighContrastToggle, ColorBlindSupportToggle } from './high-contrast-toggle'
import { FontSizeAdjuster } from './font-size-adjuster'
import { VoiceNavigation } from './voice-navigation'
import { CulturalAdaptation } from './cultural-adaptation'
import { useI18n } from '@/lib/i18n/hook'
import { useScreenReader } from './screen-reader'

interface AccessibilitySettingsProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function AccessibilitySettings({ isOpen, onClose, className = '' }: AccessibilitySettingsProps) {
  const {
    preferences,
    resetToDefaults,
    getWCAGCompliance,
    enableTestMode,
    disableTestMode,
    isTestMode
  } = useAccessibility()
  
  const { announce } = useScreenReader()
  const { t, culturalContext, setCulturalContext } = useI18n()
  const [activeTab, setActiveTab] = useState('visual')
  
  if (!isOpen) return null
  
  const handleSaveSettings = () => {
    // Settings are automatically saved through the accessibility provider
    announce('Accessibility settings have been saved', 'polite')
    onClose()
  }
  
  const handleResetDefaults = () => {
    resetToDefaults()
    announce('Accessibility settings have been reset to defaults', 'assertive')
  }
  
  const toggleTestMode = () => {
    if (isTestMode) {
      disableTestMode()
      announce('Accessibility test mode disabled', 'polite')
    } else {
      enableTestMode()
      announce('Accessibility test mode enabled', 'assertive')
    }
  }
  
  const complianceLevel = getWCAGCompliance()
  const complianceColor = {
    'A': 'bg-yellow-500',
    'AA': 'bg-green-500',
    'AAA': 'bg-blue-500'
  }[complianceLevel]
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-4xl max-h-[90vh] overflow-hidden ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Accessibility Settings</span>
            </CardTitle>
            <CardDescription>
              Customize your accessibility preferences for the best experience
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">WCAG Compliance:</span>
              <div className={`w-3 h-3 rounded-full ${complianceColor}`} />
              <span className="text-sm font-medium">{complianceLevel}</span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="outline" size="sm" onClick={toggleTestMode}>
              {isTestMode ? 'Exit Test Mode' : 'Test Mode'}
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="visual" className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Visual</span>
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center space-x-2">
                <Volume2 className="h-4 w-4" />
                <span className="hidden sm:inline">Audio</span>
              </TabsTrigger>
              <TabsTrigger value="keyboard" className="flex items-center space-x-2">
                <Keyboard className="h-4 w-4" />
                <span className="hidden sm:inline">Keyboard</span>
              </TabsTrigger>
              <TabsTrigger value="cultural" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Cultural</span>
              </TabsTrigger>
              <TabsTrigger value="language" className="flex items-center space-x-2">
                <Type className="h-4 w-4" />
                <span className="hidden sm:inline">Language</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="visual" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-4">Visual Accessibility</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Adjust visual elements to improve readability and reduce eye strain
                  </p>
                </div>
                
                <div className="space-y-4">
                  <HighContrastToggle variant="settings" />
                  <FontSizeAdjuster variant="settings" />
                  <ColorBlindSupportToggle />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium">Motion and Animation</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Reduce Motion</p>
                      <p className="text-sm text-muted-foreground">
                        Minimize animations and transitions
                      </p>
                    </div>
                    <Button
                      variant={preferences.reduceMotion ? "default" : "outline"}
                      size="sm"
                      onClick={() => useAccessibility().toggleFeature('reduceMotion')}
                    >
                      {preferences.reduceMotion ? 'On' : 'Off'}
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium">Target Size</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Large Touch Targets</p>
                      <p className="text-sm text-muted-foreground">
                        Increase button and link sizes for easier interaction
                      </p>
                    </div>
                    <Button
                      variant={preferences.largeTargets ? "default" : "outline"}
                      size="sm"
                      onClick={() => useAccessibility().toggleFeature('largeTargets')}
                    >
                      {preferences.largeTargets ? 'On' : 'Off'}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="audio" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-4">Audio Accessibility</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure audio feedback and voice navigation features
                  </p>
                </div>
                
                <VoiceNavigation showSettings={true} />
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium">Audio Features</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Audio Descriptions</p>
                        <p className="text-sm text-muted-foreground">
                          Provide audio descriptions for visual content
                        </p>
                      </div>
                      <Button
                        variant={preferences.audioDescriptions ? "default" : "outline"}
                        size="sm"
                        onClick={() => useAccessibility().toggleFeature('audioDescriptions')}
                      >
                        {preferences.audioDescriptions ? 'On' : 'Off'}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Sound Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Play sounds for important events and alerts
                        </p>
                      </div>
                      <Button
                        variant={preferences.soundNotifications ? "default" : "outline"}
                        size="sm"
                        onClick={() => useAccessibility().toggleFeature('soundNotifications')}
                      >
                        {preferences.soundNotifications ? 'On' : 'Off'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="keyboard" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-4">Keyboard Navigation</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Customize keyboard navigation and focus management
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enhanced Keyboard Navigation</p>
                      <p className="text-sm text-muted-foreground">
                        Improve keyboard navigation experience
                      </p>
                    </div>
                    <Button
                      variant={preferences.keyboardNavigation ? "default" : "outline"}
                      size="sm"
                      onClick={() => useAccessibility().toggleFeature('keyboardNavigation')}
                    >
                      {preferences.keyboardNavigation ? 'On' : 'Off'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Skip Links</p>
                      <p className="text-sm text-muted-foreground">
                        Show skip links for efficient navigation
                      </p>
                    </div>
                    <Button
                      variant={preferences.skipLinks ? "default" : "outline"}
                      size="sm"
                      onClick={() => useAccessibility().toggleFeature('skipLinks')}
                    >
                      {preferences.skipLinks ? 'On' : 'Off'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Visible Focus Indicators</p>
                      <p className="text-sm text-muted-foreground">
                        Show clear focus indicators for keyboard users
                      </p>
                    </div>
                    <Button
                      variant={preferences.focusIndicator ? "default" : "outline"}
                      size="sm"
                      onClick={() => useAccessibility().toggleFeature('focusIndicator')}
                    >
                      {preferences.focusIndicator ? 'On' : 'Off'}
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium">Keyboard Shortcuts</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Toggle High Contrast</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + H</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Cycle Font Size</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + F</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Toggle Voice Navigation</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + V</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Open Accessibility Settings</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + A</kbd>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="cultural" className="space-y-6">
              <CulturalAdaptation
                culturalContext={culturalContext}
                onContextChange={setCulturalContext}
                showPreferences={true}
              />
            </TabsContent>
            
            <TabsContent value="language" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-4">Language & Translation</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Language preferences and cultural adaptation settings
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Current Language</h4>
                  <p className="text-sm text-muted-foreground">
                    Language switching is available in the header menu
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Translation Quality</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>English (Original)</span>
                      <span className="text-green-600">✓ Medical Reviewed</span>
                    </div>
                    <div className="flex justify-between">
                      <span>中文 (Chinese)</span>
                      <span className="text-blue-600">✓ Professionally Translated</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bahasa Melayu (Malay)</span>
                      <span className="text-blue-600">✓ Professionally Translated</span>
                    </div>
                    <div className="flex justify-between">
                      <span>தமிழ் (Tamil)</span>
                      <span className="text-blue-600">✓ Professionally Translated</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Cultural Adaptation</h4>
                  <p className="text-sm text-muted-foreground">
                    Content is automatically adapted based on your cultural preferences
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <Separator className="my-6" />
          
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleResetDefaults}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset to Defaults</span>
            </Button>
            
            <Button
              onClick={handleSaveSettings}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Accessibility Settings Trigger Component
interface AccessibilitySettingsTriggerProps {
  className?: string
}

export function AccessibilitySettingsTrigger({ className = '' }: AccessibilitySettingsTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { announce } = useScreenReader()
  const { t } = useI18n()
  
  const handleOpen = () => {
    setIsOpen(true)
    announce('Opening accessibility settings', 'polite')
  }
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className={`flex items-center space-x-2 ${className}`}
        aria-label="Accessibility Settings"
        title="Accessibility Settings"
      >
        <Settings className="h-4 w-4" />
        <span className="hidden sm:inline">Accessibility</span>
      </Button>
      
      <AccessibilitySettings
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}