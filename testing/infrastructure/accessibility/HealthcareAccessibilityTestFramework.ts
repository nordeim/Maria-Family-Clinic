/**
 * Healthcare Accessibility Testing Framework
 * WCAG 2.2 AA compliance testing for My Family Clinic healthcare platform
 */

export interface AccessibilityTestConfig {
  name: string
  standard: 'WCAG21AA' | 'WCAG22AA' | 'Section508'
  level: 'A' | 'AA' | 'AAA'
  scope: AccessibilityScope
  tests: AccessibilityTest[]
  healthcare: HealthcareAccessibilityConfig
  multilingual: MultilingualConfig
  device: DeviceConfig
  reporting: AccessibilityReportConfig
}

export interface AccessibilityScope {
  pages: string[]
  components: AccessibilityComponent[]
  features: AccessibilityFeature[]
  languages: ('en' | 'zh' | 'ms' | 'ta')[]
  viewport: {
    desktop: ViewportConfig
    tablet: ViewportConfig
    mobile: ViewportConfig
  }
}

export interface AccessibilityComponent {
  name: string
  selector: string
  type: 'form' | 'navigation' | 'content' | 'interactive' | 'media'
  critical: boolean
  tests: string[] // Test categories to run
}

export interface AccessibilityFeature {
  name: string
  category: 'patient_portal' | 'appointment_booking' | 'medical_records' | 'doctor_interface' | 'admin_panel'
  accessibilityRequirements: AccessibilityRequirement[]
  assistiveTechnology: AssistiveTechnology[]
}

export interface AccessibilityRequirement {
  guideline: string
  successCriteria: string[]
  description: string
  testable: boolean
}

export interface AssistiveTechnology {
  name: 'screen_reader' | 'keyboard_only' | 'voice_control' | 'switch_device' | 'magnifier'
  priority: 'high' | 'medium' | 'low'
  testing: boolean
}

export interface AccessibilityTest {
  id: string
  name: string
  category: 'perceivable' | 'operable' | 'understandable' | 'robust'
  wcagCriteria: string[]
  severity: 'critical' | 'serious' | 'moderate' | 'minor'
  description: string
  healthcareContext: string
  testProcedure: AccessibilityTestProcedure
  remediation: string
  priority: number
}

export interface AccessibilityTestProcedure {
  steps: TestStep[]
  expectedResults: ExpectedResult[]
  violations: ViolationDefinition[]
}

export interface TestStep {
  action: string
  parameters: Record<string, any>
  assistiveTechnology?: string
  description: string
}

export interface ExpectedResult {
  condition: string
  description: string
  passCriteria: string
}

export interface ViolationDefinition {
  condition: string
  description: string
  impact: 'critical' | 'serious' | 'moderate' | 'minor'
  fixPriority: 'immediate' | 'high' | 'medium' | 'low'
}

export interface HealthcareAccessibilityConfig {
  emergencyAccessibility: boolean
  medicalTermAccessibility: boolean
  prescriptionAccessibility: boolean
  appointmentAccessibility: boolean
  consentAccessibility: boolean
  multiLanguageSupport: boolean
  culturalAccessibility: boolean
  healthLiteracySupport: boolean
}

export interface MultilingualConfig {
  enabled: boolean
  defaultLanguage: 'en' | 'zh' | 'ms' | 'ta'
  languages: LanguageConfig[]
  textDirection: 'ltr' | 'rtl'
  fontSupport: FontConfig[]
}

export interface LanguageConfig {
  code: 'en' | 'zh' | 'ms' | 'ta'
  name: string
  nativeName: string
  fontFamily: string
  fontSize: number
  lineHeight: number
  accessibility: {
    screenReaderSupport: boolean
    highContrastSupport: boolean
    reducedMotionSupport: boolean
  }
}

export interface FontConfig {
  family: string
  purpose: 'body' | 'heading' | 'code' | 'medical'
  sizes: number[]
  accessibility: {
    dyslexiaFriendly: boolean
    highContrastReadable: boolean
  }
}

export interface DeviceConfig {
  desktop: {
    resolution: string
    browser: string[]
    assistiveTechnology: string[]
  }
  tablet: {
    resolution: string
    orientation: ('portrait' | 'landscape')[]
    touchAccessibility: boolean
  }
  mobile: {
    resolution: string
    orientation: ('portrait' | 'landscape')[]
    voiceControl: boolean
    switchControl: boolean
  }
}

export interface ViewportConfig {
  width: number
  height: number
  pixelRatio: number
  touchTarget: number
  zoom: number
}

export interface AccessibilityReportConfig {
  format: ('json' | 'html' | 'pdf' | 'csv')[]
  includeViolations: boolean
  includeRecommendations: boolean
  includeHealthcareContext: boolean
  includeComplianceMatrix: boolean
  includeRemediation: boolean
  outputDir: string
  severity: 'all' | 'critical' | 'serious' | 'moderate'
}

export class HealthcareAccessibilityTestFramework {
  private static instance: HealthcareAccessibilityTestFramework
  private configs = new Map<string, AccessibilityTestConfig>()
  private testResults = new Map<string, AccessibilityTestResult>()

  public static getInstance(): HealthcareAccessibilityTestFramework {
    if (!HealthcareAccessibilityTestFramework.instance) {
      HealthcareAccessibilityTestFramework.instance = new HealthcareAccessibilityTestFramework()
    }
    return HealthcareAccessibilityTestFramework.instance
  }

  // WCAG 2.2 AA Comprehensive Test Configuration
  public createWCAG22AAComprehensiveTest(): AccessibilityTestConfig {
    return {
      name: 'wcag22aa-comprehensive',
      standard: 'WCAG22AA',
      level: 'AA',
      scope: {
        pages: [
          '/',
          '/patients/dashboard',
          '/patients/profile',
          '/patients/appointments',
          '/patients/medical-records',
          '/patients/healthier-sg',
          '/patients/pdpa-consent',
          '/doctors/dashboard',
          '/doctors/patients',
          '/doctors/appointments',
          '/doctors/prescriptions',
          '/admin/dashboard',
          '/admin/reports'
        ],
        components: [
          {
            name: 'Patient Registration Form',
            selector: '[data-testid="patient-registration-form"]',
            type: 'form',
            critical: true,
            tests: ['form-labels', 'error-messages', 'field-validation', 'keyboard-navigation']
          },
          {
            name: 'Appointment Booking',
            selector: '[data-testid="appointment-booking"]',
            type: 'form',
            critical: true,
            tests: ['date-picker', 'time-slot', 'calendar-navigation', 'screen-reader']
          },
          {
            name: 'Medical Records Viewer',
            selector: '[data-testid="medical-records"]',
            type: 'content',
            critical: true,
            tests: ['heading-structure', 'table-accessibility', 'medical-terminology', 'print-friend']
          },
          {
            name: 'Navigation Menu',
            selector: '[data-testid="main-navigation"]',
            type: 'navigation',
            critical: true,
            tests: ['skip-links', 'navigation-menu', 'breadcrumb', 'focus-management']
          },
          {
            name: 'PDPA Consent Form',
            selector: '[data-testid="pdpa-consent"]',
            type: 'form',
            critical: true,
            tests: ['consent-clarity', 'legal-text', 'confirmation', 'withdrawal']
          },
          {
            name: 'Healthier SG Integration',
            selector: '[data-testid="healthier-sg"]',
            type: 'content',
            critical: false,
            tests: ['health-terminology', 'goal-setting', 'progress-tracking']
          }
        ],
        features: [
          {
            name: 'Patient Portal',
            category: 'patient_portal',
            accessibilityRequirements: [
              {
                guideline: '1.3.1 Info and Relationships',
                successCriteria: ['1.3.1-1', '1.3.1-2'],
                description: 'Healthcare information must be properly structured and semantic',
                testable: true
              },
              {
                guideline: '3.1 Readable',
                successCriteria: ['3.1.1', '3.1.2', '3.1.3'],
                description: 'Medical content must be readable and understandable',
                testable: true
              }
            ],
            assistiveTechnology: [
              {
                name: 'screen_reader',
                priority: 'high',
                testing: true
              },
              {
                name: 'keyboard_only',
                priority: 'high',
                testing: true
              },
              {
                name: 'voice_control',
                priority: 'medium',
                testing: true
              }
            ]
          },
          {
            name: 'Appointment Booking System',
            category: 'appointment_booking',
            accessibilityRequirements: [
              {
                guideline: '2.1 Keyboard Accessible',
                successCriteria: ['2.1.1', '2.1.2'],
                description: 'All appointment booking must be keyboard accessible',
                testable: true
              },
              {
                guideline: '2.5 Target Size',
                successCriteria: ['2.5.3', '2.5.4', '2.5.5'],
                description: 'Appointment buttons must be properly sized for accessibility',
                testable: true
              }
            ],
            assistiveTechnology: [
              {
                name: 'screen_reader',
                priority: 'high',
                testing: true
              },
              {
                name: 'switch_device',
                priority: 'high',
                testing: true
              }
            ]
          }
        ],
        languages: ['en', 'zh', 'ms', 'ta'],
        viewport: {
          desktop: { width: 1920, height: 1080, pixelRatio: 1, touchTarget: 44, zoom: 1 },
          tablet: { width: 768, height: 1024, pixelRatio: 2, touchTarget: 44, zoom: 1 },
          mobile: { width: 375, height: 667, pixelRatio: 2, touchTarget: 44, zoom: 1 }
        }
      },
      tests: [
        // Perceivable Tests
        {
          id: '1.1.1',
          name: 'Non-text Content',
          category: 'perceivable',
          wcagCriteria: ['1.1.1'],
          severity: 'critical',
          description: 'All non-text content must have alternative text',
          healthcareContext: 'Medical images, prescription icons, and health diagrams must have descriptive alt text',
          testProcedure: {
            steps: [
              {
                action: 'analyze_images',
                parameters: { selector: 'img' },
                description: 'Find all images on healthcare pages'
              },
              {
                action: 'check_alt_attributes',
                parameters: { selector: 'img' },
                description: 'Verify each image has appropriate alt text'
              },
              {
                action: 'validate_alt_content',
                parameters: { selector: 'img' },
                description: 'Check alt text describes medical content appropriately'
              }
            ],
            expectedResults: [
              {
                condition: 'All images have descriptive alt text',
                description: 'Every image including medical icons must have meaningful alt text',
                passCriteria: '100% of images have appropriate alt attributes'
              }
            ],
            violations: [
              {
                condition: 'Images missing alt text',
                description: 'Medical images without alt text prevent screen reader users from understanding content',
                impact: 'critical',
                fixPriority: 'immediate'
              },
              {
                condition: 'Alt text too generic',
                description: 'Generic alt text like "image" does not convey medical information',
                impact: 'serious',
                fixPriority: 'high'
              }
            ]
          },
          remediation: 'Add descriptive alt text to all images, especially medical content and prescription information',
          priority: 1
        },
        {
          id: '1.3.1',
          name: 'Info and Relationships',
          category: 'perceivable',
          wcagCriteria: ['1.3.1'],
          severity: 'critical',
          description: 'Information and relationships must be programmatically determined',
          healthcareContext: 'Medical records, appointment schedules, and patient data must be properly structured',
          testProcedure: {
            steps: [
              {
                action: 'check_heading_structure',
                parameters: { selector: 'h1,h2,h3,h4,h5,h6' },
                description: 'Verify proper heading hierarchy in medical content'
              },
              {
                action: 'validate_table_structure',
                parameters: { selector: 'table' },
                description: 'Check tables have proper headers and structure'
              },
              {
                action: 'analyze_form_structure',
                parameters: { selector: 'form' },
                description: 'Validate form labels and groupings'
              }
            ],
            expectedResults: [
              {
                condition: 'Proper semantic HTML structure',
                description: 'Medical content must use proper heading hierarchy and semantic elements',
                passCriteria: 'All medical pages have logical heading structure (h1>h2>h3)'
              }
            ],
            violations: [
              {
                condition: 'Improper heading hierarchy',
                description: 'Skipped heading levels confuse screen reader navigation',
                impact: 'serious',
                fixPriority: 'high'
              },
              {
                condition: 'Tables without headers',
                description: 'Medical data tables must have proper header cells',
                impact: 'critical',
                fixPriority: 'immediate'
              }
            ]
          },
          remediation: 'Use proper semantic HTML, heading hierarchy, and table headers for medical data',
          priority: 1
        },
        {
          id: '1.4.3',
          name: 'Contrast (Minimum)',
          category: 'perceivable',
          wcagCriteria: ['1.4.3'],
          severity: 'serious',
          description: 'Text must have minimum 4.5:1 contrast ratio',
          healthcareContext: 'Medical information, prescription text, and health warnings must be clearly visible',
          testProcedure: {
            steps: [
              {
                action: 'measure_contrast_ratio',
                parameters: { selector: 'body', property: 'color' },
                description: 'Check contrast ratios of medical text'
              },
              {
                action: 'test_high_contrast_mode',
                parameters: {},
                description: 'Test compatibility with high contrast mode'
              },
              {
                action: 'validate_medical_warnings',
                parameters: { selector: '.warning, .alert' },
                description: 'Ensure medical warnings have sufficient contrast'
              }
            ],
            expectedResults: [
              {
                condition: 'Text contrast meets 4.5:1 minimum',
                description: 'All medical text including warnings must meet contrast requirements',
                passCriteria: '100% of text elements meet contrast ratios'
              }
            ],
            violations: [
              {
                condition: 'Low contrast text',
                description: 'Poor contrast makes medical information hard to read',
                impact: 'serious',
                fixPriority: 'high'
              }
            ]
          },
          remediation: 'Ensure all text meets WCAG contrast requirements, especially medical warnings',
          priority: 3
        },
        {
          id: '1.4.11',
          name: 'Non-text Contrast',
          category: 'perceivable',
          wcagCriteria: ['1.4.11'],
          severity: 'serious',
          description: 'Non-text elements must have minimum 3:1 contrast',
          healthcareContext: 'Form controls, buttons, and medical interface elements must be distinguishable',
          testProcedure: {
            steps: [
              {
                action: 'check_button_contrast',
                parameters: { selector: 'button, .btn' },
                description: 'Verify button and control contrast ratios'
              },
              {
                action: 'test_form_control_visibility',
                parameters: { selector: 'input, select, textarea' },
                description: 'Check form control visibility and borders'
              }
            ],
            expectedResults: [
              {
                condition: 'Non-text elements have sufficient contrast',
                description: 'Medical interface controls must be clearly distinguishable',
                passCriteria: 'All interactive elements meet 3:1 contrast ratio'
              }
            ],
            violations: [
              {
                condition: 'Low contrast form controls',
                description: 'Poor contrast on medical form controls affects usability',
                impact: 'serious',
                fixPriority: 'high'
              }
            ]
          },
          remediation: 'Ensure all interactive elements meet non-text contrast requirements',
          priority: 3
        },
        {
          id: '1.4.13',
          name: 'Content on Hover or Focus',
          category: 'perceivable',
          wcagCriteria: ['1.4.13'],
          severity: 'moderate',
          description: 'Content must be dismissible, hoverable, and persistent',
          healthcareContext: 'Medical tooltips and additional information must be accessible',
          testProcedure: {
            steps: [
              {
                action: 'test_tooltip_accessibility',
                parameters: { selector: '[title], [aria-describedby]' },
                description: 'Check tooltip accessibility and keyboard interaction'
              },
              {
                action: 'validate_dismissible_content',
                parameters: { selector: '.tooltip, .popover' },
                description: 'Verify content can be dismissed properly'
              }
            ],
            expectedResults: [
              {
                condition: 'Tooltip content is accessible',
                description: 'Medical information tooltips must be accessible via keyboard',
                passCriteria: 'All tooltips can be accessed and dismissed with keyboard'
              }
            ],
            violations: [
              {
                condition: 'Tooltip not keyboard accessible',
                description: 'Medical information tooltips must work with keyboard navigation',
                impact: 'moderate',
                fixPriority: 'medium'
              }
            ]
          },
          remediation: 'Make all tooltip content keyboard accessible and dismissible',
          priority: 5
        },
        // Operable Tests
        {
          id: '2.1.1',
          name: 'Keyboard',
          category: 'operable',
          wcagCriteria: ['2.1.1'],
          severity: 'critical',
          description: 'All functionality must be available via keyboard',
          healthcareContext: 'Patient portal, appointment booking, and medical record access must work with keyboard only',
          testProcedure: {
            steps: [
              {
                action: 'keyboard_navigation_test',
                parameters: { selector: 'body' },
                description: 'Test complete keyboard navigation through healthcare portal'
              },
              {
                action: 'test_form_interaction',
                parameters: { selector: 'form' },
                description: 'Verify all form fields are keyboard accessible'
              },
              {
                action: 'test_appointment_booking',
                parameters: { selector: '[data-testid="appointment-booking"]' },
                description: 'Test appointment booking interface with keyboard only'
              }
            ],
            expectedResults: [
              {
                condition: 'Complete keyboard accessibility',
                description: 'All healthcare functions must work with keyboard only navigation',
                passCriteria: '100% of functionality accessible via keyboard'
              }
            ],
            violations: [
              {
                condition: 'Keyboard trap',
                description: 'Users cannot navigate away from healthcare interface sections',
                impact: 'critical',
                fixPriority: 'immediate'
              },
              {
                condition: 'Custom controls not keyboard accessible',
                description: 'Medical interface custom controls must support keyboard',
                impact: 'serious',
                fixPriority: 'high'
              }
            ]
          },
          remediation: 'Implement keyboard accessibility for all healthcare functions',
          priority: 1
        },
        {
          id: '2.1.2',
          name: 'No Keyboard Trap',
          category: 'operable',
          wcagCriteria: ['2.1.2'],
          severity: 'critical',
          description: 'No keyboard trap for any component',
          healthcareContext: 'Modal dialogs, calendars, and medical forms must allow keyboard exit',
          testProcedure: {
            steps: [
              {
                action: 'test_modal_keyboard_trap',
                parameters: { selector: '[role="dialog"], .modal' },
                description: 'Test modal dialogs for keyboard traps'
              },
              {
                action: 'test_calendar_keyboard',
                parameters: { selector: '.calendar, [role="grid"]' },
                description: 'Test appointment calendar keyboard navigation'
              }
            ],
            expectedResults: [
              {
                condition: 'No keyboard traps anywhere',
                description: 'All healthcare interface elements must allow keyboard exit',
                passCriteria: 'All modals and interactive elements have escape routes'
              }
            ],
            violations: [
              {
                condition: 'Modal keyboard trap',
                description: 'Cannot escape modal dialogs in healthcare interface',
                impact: 'critical',
                fixPriority: 'immediate'
              }
            ]
          },
          remediation: 'Add escape routes and focus management to all interactive elements',
          priority: 1
        },
        {
          id: '2.4.1',
          name: 'Bypass Blocks',
          category: 'operable',
          wcagCriteria: ['2.4.1'],
          severity: 'serious',
          description: 'Skip links must be provided to bypass navigation',
          healthcareContext: 'Quick access to medical content bypassing navigation menus',
          testProcedure: {
            steps: [
              {
                action: 'test_skip_links',
                parameters: { selector: 'a[href^="#"]' },
                description: 'Check for skip links at page start'
              },
              {
                action: 'validate_skip_functionality',
                parameters: { selector: '.skip-link' },
                description: 'Verify skip links work correctly'
              }
            ],
            expectedResults: [
              {
                condition: 'Skip links present and functional',
                description: 'Skip links allow quick access to medical content',
                passCriteria: 'Skip links present and navigate to main content'
              }
            ],
            violations: [
              {
                condition: 'Missing skip links',
                description: 'No way to bypass navigation to medical content',
                impact: 'serious',
                fixPriority: 'high'
              }
            ]
          },
          remediation: 'Add skip links to bypass navigation to main content',
          priority: 4
        },
        {
          id: '2.4.2',
          name: 'Page Titled',
          category: 'operable',
          wcagCriteria: ['2.4.2'],
          severity: 'serious',
          description: 'Pages must have descriptive titles',
          healthcareContext: 'Medical pages must have clear, descriptive titles for easy identification',
          testProcedure: {
            steps: [
              {
                action: 'check_page_titles',
                parameters: { selector: 'title' },
                description: 'Verify all pages have descriptive titles'
              },
              {
                action: 'validate_medical_titles',
                parameters: { selector: 'title' },
                description: 'Check medical pages have context-appropriate titles'
              }
            ],
            expectedResults: [
              {
                condition: 'Descriptive page titles',
                description: 'Medical page titles must clearly identify page purpose',
                passCriteria: 'All medical pages have descriptive, unique titles'
              }
            ],
            violations: [
              {
                condition: 'Generic page titles',
                description: 'Medical pages must have specific, descriptive titles',
                impact: 'serious',
                fixPriority: 'high'
              }
            ]
          },
          remediation: 'Add descriptive, unique titles to all medical pages',
          priority: 4
        },
        {
          id: '2.4.3',
          name: 'Focus Order',
          category: 'operable',
          wcagCriteria: ['2.4.3'],
          severity: 'serious',
          description: 'Focus order must be logical and intuitive',
          healthcareContext: 'Medical forms and interfaces must have logical tab order',
          testProcedure: {
            steps: [
              {
                action: 'test_focus_order',
                parameters: { selector: 'body' },
                description: 'Test tab order through medical forms'
              },
              {
                action: 'validate_form_focus',
                parameters: { selector: 'form' },
                description: 'Check medical form focus sequence'
              }
            ],
            expectedResults: [
              {
                condition: 'Logical focus order',
                description: 'Medical form focus order follows visual layout',
                passCriteria: 'Focus moves logically through medical forms'
              }
            ],
            violations: [
              {
                condition: 'Jumbled focus order',
                description: 'Medical forms focus order confuses users',
                impact: 'serious',
                fixPriority: 'high'
              }
            ]
          },
          remediation: 'Ensure focus order follows logical sequence in medical forms',
          priority: 4
        },
        {
          id: '2.4.6',
          name: 'Headings and Labels',
          category: 'operable',
          wcagCriteria: ['2.4.6'],
          severity: 'serious',
          description: 'Headings and labels must describe topic or purpose',
          healthcareContext: 'Medical section headings and form labels must clearly describe content',
          testProcedure: {
            steps: [
              {
                action: 'check_heading_clarity',
                parameters: { selector: 'h1,h2,h3,h4,h5,h6' },
                description: 'Verify medical section headings are descriptive'
              },
              {
                action: 'validate_form_labels',
                parameters: { selector: 'label' },
                description: 'Check medical form labels are clear and descriptive'
              }
            ],
            expectedResults: [
              {
                condition: 'Clear headings and labels',
                description: 'Medical headings and labels must clearly describe content',
                passCriteria: 'All medical headings and labels are descriptive'
              }
            ],
            violations: [
              {
                condition: 'Unclear medical headings',
                description: 'Medical section headings must clearly indicate content',
                impact: 'serious',
                fixPriority: 'high'
              }
            ]
          },
          remediation: 'Create clear, descriptive headings and labels for medical content',
          priority: 4
        },
        {
          id: '2.4.7',
          name: 'Focus Visible',
          category: 'operable',
          wcagCriteria: ['2.4.7'],
          severity: 'serious',
          description: 'Focus must be visible on all interactive elements',
          healthcareContext: 'Medical interface focus indicators must be clearly visible',
          testProcedure: {
            steps: [
              {
                action: 'test_focus_visibility',
                parameters: { selector: 'button, input, a, select, textarea' },
                description: 'Check focus indicators on medical interface elements'
              },
              {
                action: 'validate_focus_contrast',
                parameters: { selector: '*:focus' },
                description: 'Verify focus indicators have sufficient contrast'
              }
            ],
            expectedResults: [
              {
                condition: 'Visible focus indicators',
                description: 'All medical interface elements must show clear focus',
                passCriteria: '100% of interactive elements have visible focus'
              }
            ],
            violations: [
              {
                condition: 'Invisible focus indicators',
                description: 'Cannot see where focus is in medical interface',
                impact: 'serious',
                fixPriority: 'high'
              }
            ]
          },
          remediation: 'Ensure all interactive elements have visible focus indicators',
          priority: 4
        },
        // Understandable Tests
        {
          id: '3.1.1',
          name: 'Language of Page',
          category: 'understandable',
          wcagCriteria: ['3.1.1'],
          severity: 'serious',
          description: 'Language of page must be programmatically determined',
          healthcareContext: 'Multi-language healthcare content must specify language',
          testProcedure: {
            steps: [
              {
                action: 'check_page_language',
                parameters: { selector: 'html' },
                description: 'Verify language attribute on html element'
              },
              {
                action: 'test_multilingual_content',
                parameters: { selector: '[lang]' },
                description: 'Check language attributes on multilingual content'
              }
            ],
            expectedResults: [
              {
                condition: 'Language properly declared',
                description: 'Healthcare content language must be properly specified',
                passCriteria: 'html lang attribute matches content language'
              }
            ],
            violations: [
              {
                condition: 'Missing language declaration',
                description: 'Multi-language healthcare content must specify language',
                impact: 'serious',
                fixPriority: 'high'
              }
            ]
          },
          remediation: 'Add lang attributes to HTML and multilingual healthcare content',
          priority: 4
        },
        {
          id: '3.2.1',
          name: 'On Focus',
          category: 'understandable',
          wcagCriteria: ['3.2.1'],
          severity: 'moderate',
          description: 'Context must not change on focus',
          healthcareContext: 'Medical interface focus should not cause unexpected changes',
          testProcedure: {
            steps: [
              {
                action: 'test_focus_stability',
                parameters: { selector: 'input, button, a' },
                description: 'Check focus events do not cause context changes'
              },
              {
                action: 'validate_medical_form_focus',
                parameters: { selector: 'form input' },
                description: 'Test medical form focus stability'
              }
            ],
            expectedResults: [
              {
                condition: 'Stable focus behavior',
                description: 'Focus changes should not cause unexpected context changes',
                passCriteria: 'Focus events do not trigger context changes'
              }
            ],
            violations: [
              {
                condition: 'Context changes on focus',
                description: 'Medical interface focus causing unexpected changes',
                impact: 'moderate',
                fixPriority: 'medium'
              }
            ]
          },
          remediation: 'Ensure focus events do not cause unexpected context changes',
          priority: 6
        },
        {
          id: '3.2.2',
          name: 'On Input',
          category: 'understandable',
          wcagCriteria: ['3.2.2'],
          severity: 'moderate',
          description: 'Context must not change on input',
          healthcareContext: 'Medical form inputs should not cause unexpected changes',
          testProcedure: {
            steps: [
              {
                action: 'test_input_stability',
                parameters: { selector: 'input, select, textarea' },
                description: 'Check input changes do not cause context changes'
              },
              {
                action: 'validate_medical_input_focus',
                parameters: { selector: 'form input' },
                description: 'Test medical input stability'
              }
            ],
            expectedResults: [
              {
                condition: 'Stable input behavior',
                description: 'Input changes should not cause unexpected context changes',
                passCriteria: 'Input events do not trigger context changes'
              }
            ],
            violations: [
              {
                condition: 'Context changes on input',
                description: 'Medical form inputs causing unexpected changes',
                impact: 'moderate',
                fixPriority: 'medium'
              }
            ]
          },
          remediation: 'Ensure input events do not cause unexpected context changes',
          priority: 6
        },
        {
          id: '3.3.1',
          name: 'Error Identification',
          category: 'understandable',
          wcagCriteria: ['3.3.1'],
          severity: 'serious',
          description: 'Errors must be clearly identified',
          healthcareContext: 'Medical form errors must be clearly identified and described',
          testProcedure: {
            steps: [
              {
                action: 'test_form_errors',
                parameters: { selector: 'form' },
                description: 'Test error identification in medical forms'
              },
              {
                action: 'validate_error_messaging',
                parameters: { selector: '.error, [aria-invalid]' },
                description: 'Check error message clarity and specificity'
              }
            ],
            expectedResults: [
              {
                condition: 'Clear error identification',
                description: 'Medical form errors must be clearly identified',
                passCriteria: 'All errors are programmatically identified and described'
              }
            ],
            violations: [
              {
                condition: 'Unclear error messages',
                description: 'Medical form errors must be specific and actionable',
                impact: 'serious',
                fixPriority: 'high'
              }
            ]
          },
          remediation: 'Implement clear, specific error identification for medical forms',
          priority: 3
        },
        {
          id: '3.3.2',
          name: 'Labels or Instructions',
          category: 'understandable',
          wcagCriteria: ['3.3.2'],
          severity: 'serious',
          description: 'Labels or instructions must be provided',
          healthcareContext: 'Medical form fields must have clear labels and instructions',
          testProcedure: {
            steps: [
              {
                action: 'check_form_labels',
                parameters: { selector: 'input, select, textarea' },
                description: 'Verify all medical form fields have labels'
              },
              {
                action: 'validate_instructions',
                parameters: { selector: 'input[type="date"], input[type="time"]' },
                description: 'Check date/time inputs have clear instructions'
              }
            ],
            expectedResults: [
              {
                condition: 'Complete form labeling',
                description: 'All medical form fields must have clear labels',
                passCriteria: 'All medical form fields have associated labels'
              }
            ],
            violations: [
              {
                condition: 'Missing form labels',
                description: 'Medical form fields must have clear labels',
                impact: 'serious',
                fixPriority: 'high'
              }
            ]
          },
          remediation: 'Add clear labels and instructions to all medical form fields',
          priority: 3
        },
        // Robust Tests
        {
          id: '4.1.2',
          name: 'Name, Role, Value',
          category: 'robust',
          wcagCriteria: ['4.1.2'],
          severity: 'serious',
          description: 'Custom controls must have proper name, role, and value',
          healthcareContext: 'Custom medical interface controls must be properly labeled for assistive technology',
          testProcedure: {
            steps: [
              {
                action: 'check_custom_controls',
                parameters: { selector: '[role], [aria-*]' },
                description: 'Verify custom medical interface controls have ARIA attributes'
              },
              {
                action: 'validate_control_accessibility',
                parameters: { selector: '.custom-control' },
                description: 'Check custom controls are properly exposed to assistive technology'
              }
            ],
            expectedResults: [
              {
                condition: 'Proper ARIA implementation',
                description: 'Custom medical controls must have proper name, role, value',
                passCriteria: 'All custom controls have appropriate ARIA attributes'
              }
            ],
            violations: [
              {
                condition: 'Missing ARIA attributes',
                description: 'Custom medical controls must be properly labeled',
                impact: 'serious',
                fixPriority: 'high'
              }
            ]
          },
          remediation: 'Implement proper ARIA attributes for custom medical interface controls',
          priority: 4
        }
      ],
      healthcare: {
        emergencyAccessibility: true,
        medicalTermAccessibility: true,
        prescriptionAccessibility: true,
        appointmentAccessibility: true,
        consentAccessibility: true,
        multiLanguageSupport: true,
        culturalAccessibility: true,
        healthLiteracySupport: true
      },
      multilingual: {
        enabled: true,
        defaultLanguage: 'en',
        languages: [
          {
            code: 'en',
            name: 'English',
            nativeName: 'English',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: 16,
            lineHeight: 1.5,
            accessibility: {
              screenReaderSupport: true,
              highContrastSupport: true,
              reducedMotionSupport: true
            }
          },
          {
            code: 'zh',
            name: 'Chinese',
            nativeName: '中文',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: 16,
            lineHeight: 1.6,
            accessibility: {
              screenReaderSupport: true,
              highContrastSupport: true,
              reducedMotionSupport: true
            }
          },
          {
            code: 'ms',
            name: 'Malay',
            nativeName: 'Bahasa Melayu',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: 16,
            lineHeight: 1.5,
            accessibility: {
              screenReaderSupport: true,
              highContrastSupport: true,
              reducedMotionSupport: true
            }
          },
          {
            code: 'ta',
            name: 'Tamil',
            nativeName: 'தமிழ்',
            fontFamily: 'Noto Sans Tamil, system-ui, sans-serif',
            fontSize: 16,
            lineHeight: 1.6,
            accessibility: {
              screenReaderSupport: true,
              highContrastSupport: true,
              reducedMotionSupport: true
            }
          }
        ],
        textDirection: 'ltr',
        fontSupport: [
          {
            family: 'system-ui, -apple-system, sans-serif',
            purpose: 'body',
            sizes: [14, 16, 18, 20, 24],
            accessibility: {
              dyslexiaFriendly: true,
              highContrastReadable: true
            }
          },
          {
            family: 'Noto Sans Tamil',
            purpose: 'medical',
            sizes: [16, 18, 20, 24],
            accessibility: {
              dyslexiaFriendly: false,
              highContrastReadable: true
            }
          }
        ]
      },
      device: {
        desktop: {
          resolution: '1920x1080',
          browser: ['Chrome', 'Firefox', 'Safari', 'Edge'],
          assistiveTechnology: ['NVDA', 'JAWS', 'VoiceOver']
        },
        tablet: {
          resolution: '768x1024',
          orientation: ['portrait', 'landscape'],
          touchAccessibility: true
        },
        mobile: {
          resolution: '375x667',
          orientation: ['portrait', 'landscape'],
          voiceControl: true,
          switchControl: true
        }
      },
      reporting: {
        format: ['json', 'html', 'pdf'],
        includeViolations: true,
        includeRecommendations: true,
        includeHealthcareContext: true,
        includeComplianceMatrix: true,
        includeRemediation: true,
        outputDir: './test-results/accessibility',
        severity: 'all'
      }
    }
  }

  // Test execution methods
  public async runAccessibilityTest(config: AccessibilityTestConfig): Promise<AccessibilityTestResult> {
    console.log(`♿ Starting accessibility test: ${config.name}`)
    console.log(`   Standard: ${config.standard}`)
    console.log(`   Level: ${config.level}`)
    console.log(`   Tests: ${config.tests.length}`)
    
    const startTime = Date.now()
    const results: AccessibilityTestExecution[] = []
    let overallCompliance = true
    
    for (const test of config.tests) {
      console.log(`   Running test: ${test.name}`)
      
      const testResult = await this.executeAccessibilityTest(test)
      results.push(testResult)
      
      if (testResult.status === 'failed') {
        overallCompliance = false
      }
      
      if (test.severity === 'critical' && testResult.status === 'failed') {
        console.error(`   ❌ CRITICAL ACCESSIBILITY ISSUE: ${test.name}`)
      }
    }
    
    // Generate compliance report
    const complianceMatrix = await this.generateComplianceMatrix(config, results)
    
    const result: AccessibilityTestResult = {
      config,
      startTime: new Date(startTime),
      endTime: new Date(),
      duration: (Date.now() - startTime) / 1000,
      tests: results,
      overallCompliance,
      complianceMatrix,
      reportPaths: [],
      summary: {
        totalTests: results.length,
        passedTests: results.filter(r => r.status === 'passed').length,
        failedTests: results.filter(r => r.status === 'failed').length,
        criticalIssues: results.filter(r => r.test.severity === 'critical' && r.status === 'failed').length,
        wcagCompliance: this.calculateWCAGCompliance(results)
      }
    }
    
    // Generate reports
    result.reportPaths = await this.generateAccessibilityReports(config, result)
    
    console.log(`✅ Accessibility test completed: ${config.name}`)
    console.log(`   WCAG Compliance: ${result.summary.wcagCompliance}%`)
    console.log(`   Tests Passed: ${result.summary.passedTests}/${result.summary.totalTests}`)
    
    this.testResults.set(config.name, result)
    return result
  }

  private async executeAccessibilityTest(test: AccessibilityTest): Promise<AccessibilityTestExecution> {
    const startTime = Date.now()
    const stepResults: AccessibilityTestStepResult[] = []
    
    try {
      for (const step of test.testProcedure.steps) {
        const stepResult = await this.executeAccessibilityStep(step)
        stepResults.push(stepResult)
        
        if (!stepResult.passed) {
          break // Stop on first failure
        }
      }
      
      const allStepsPassed = stepResults.every(r => r.passed)
      
      return {
        test,
        status: allStepsPassed ? 'passed' : 'failed',
        duration: (Date.now() - startTime) / 1000,
        stepResults,
        violations: allStepsPassed ? [] : stepResults
          .filter(r => !r.passed)
          .map(r => ({
            description: r.issue || 'Accessibility violation detected',
            impact: test.severity,
            wcagCriteria: test.wcagCriteria,
            remediation: test.remediation
          }))
      }
      
    } catch (error) {
      return {
        test,
        status: 'failed',
        duration: (Date.now() - startTime) / 1000,
        stepResults,
        violations: [{
          description: error instanceof Error ? error.message : 'Test execution failed',
          impact: test.severity,
          wcagCriteria: test.wcagCriteria,
          remediation: test.remediation
        }]
      }
    }
  }

  private async executeAccessibilityStep(step: TestStep): Promise<AccessibilityTestStepResult> {
    // Mock implementation - would execute actual accessibility tests
    const result: AccessibilityTestStepResult = {
      action: step.action,
      passed: Math.random() > 0.1, // 90% pass rate for simulation
      details: '',
      issue: null
    }
    
    if (!result.passed) {
      result.issue = `Accessibility issue detected in ${step.description}`
    }
    
    return result
  }

  private async generateComplianceMatrix(
    config: AccessibilityTestConfig, 
    results: AccessibilityTestExecution[]
  ): Promise<AccessibilityComplianceMatrix> {
    const matrix: AccessibilityComplianceMatrix = {
      wcag22aa: {
        perceivable: { passed: 0, total: 0 },
        operable: { passed: 0, total: 0 },
        understandable: { passed: 0, total: 0 },
        robust: { passed: 0, total: 0 }
      },
      healthcare: {
        emergencyAccessibility: false,
        medicalTermAccessibility: false,
        prescriptionAccessibility: false,
        appointmentAccessibility: false,
        consentAccessibility: false,
        multiLanguageSupport: false,
        culturalAccessibility: false,
        healthLiteracySupport: false
      },
      multilingual: {
        english: { passed: 0, total: 0 },
        chinese: { passed: 0, total: 0 },
        malay: { passed: 0, total: 0 },
        tamil: { passed: 0, total: 0 }
      }
    }
    
    // Mock implementation - would calculate actual compliance
    for (const result of results) {
      if (result.status === 'passed') {
        const category = result.test.category
        if (category in matrix.wcag22aa) {
          matrix.wcag22aa[category as keyof typeof matrix.wcag22aa].passed++
          matrix.wcag22aa[category as keyof typeof matrix.wcag22aa].total++
        }
      }
    }
    
    return matrix
  }

  private calculateWCAGCompliance(results: AccessibilityTestExecution[]): number {
    const passedTests = results.filter(r => r.status === 'passed').length
    return Math.round((passedTests / results.length) * 100)
  }

  private async generateAccessibilityReports(
    config: AccessibilityTestConfig, 
    result: AccessibilityTestResult
  ): Promise<string[]> {
    const reportPaths: string[] = []
    
    for (const format of config.reporting.format) {
      const path = `${config.reporting.outputDir}/${config.name}.${format}`
      reportPaths.push(path)
      
      // Mock report generation
      if (format === 'json') {
        await this.generateJSONAccessibilityReport(config, result, path)
      } else if (format === 'html') {
        await this.generateHTMLAccessibilityReport(config, result, path)
      } else if (format === 'pdf') {
        await this.generatePDFAccessibilityReport(config, result, path)
      }
    }
    
    return reportPaths
  }

  private async generateJSONAccessibilityReport(
    config: AccessibilityTestConfig, 
    result: AccessibilityTestResult, 
    path: string
  ): Promise<void> {
    const report = {
      testName: config.name,
      standard: config.standard,
      level: config.level,
      timestamp: new Date().toISOString(),
      duration: result.duration,
      overallCompliance: result.overallCompliance,
      summary: result.summary,
      tests: result.tests,
      complianceMatrix: result.complianceMatrix
    }
    
    console.log(`📄 Generated accessibility report: ${path}`)
  }

  private async generateHTMLAccessibilityReport(
    config: AccessibilityTestConfig, 
    result: AccessibilityTestResult, 
    path: string
  ): Promise<void> {
    console.log(`📄 Generated HTML accessibility report: ${path}`)
  }

  private async generatePDFAccessibilityReport(
    config: AccessibilityTestConfig, 
    result: AccessibilityTestResult, 
    path: string
  ): Promise<void> {
    console.log(`📄 Generated PDF accessibility report: ${path}`)
  }

  // Configuration management
  public setConfig(name: string, config: AccessibilityTestConfig): void {
    this.configs.set(name, config)
  }

  public getConfig(name: string): AccessibilityTestConfig | undefined {
    return this.configs.get(name)
  }

  public getResult(name: string): AccessibilityTestResult | undefined {
    return this.testResults.get(name)
  }

  public listConfigs(): string[] {
    return Array.from(this.configs.keys())
  }
}

// Result interfaces
export interface AccessibilityTestResult {
  config: AccessibilityTestConfig
  startTime: Date
  endTime: Date
  duration: number
  tests: AccessibilityTestExecution[]
  overallCompliance: boolean
  complianceMatrix: AccessibilityComplianceMatrix
  reportPaths: string[]
  summary: AccessibilityTestSummary
}

export interface AccessibilityTestExecution {
  test: AccessibilityTest
  status: 'passed' | 'failed'
  duration: number
  stepResults: AccessibilityTestStepResult[]
  violations: AccessibilityViolation[]
}

export interface AccessibilityTestStepResult {
  action: string
  passed: boolean
  details: string
  issue: string | null
}

export interface AccessibilityViolation {
  description: string
  impact: 'critical' | 'serious' | 'moderate' | 'minor'
  wcagCriteria: string[]
  remediation: string
}

export interface AccessibilityComplianceMatrix {
  wcag22aa: {
    perceivable: { passed: number, total: number }
    operable: { passed: number, total: number }
    understandable: { passed: number, total: number }
    robust: { passed: number, total: number }
  }
  healthcare: {
    [key: string]: boolean
  }
  multilingual: {
    [language: string]: { passed: number, total: number }
  }
}

export interface AccessibilityTestSummary {
  totalTests: number
  passedTests: number
  failedTests: number
  criticalIssues: number
  wcagCompliance: number
}

// Export singleton instance
export const accessibilityTestFramework = HealthcareAccessibilityTestFramework.getInstance()