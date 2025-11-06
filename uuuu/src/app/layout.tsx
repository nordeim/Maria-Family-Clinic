import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import { TRPCReactProvider } from "@/lib/trpc/client"
import { ErrorBoundary } from "@/components/error-boundary"
import { SkipLink, ScreenReaderAnnouncements, useScreenReader, useHighContrast } from "@/components/accessibility/screen-reader"
import { AccessibilityControls } from "@/components/mobile/mobile-ui"
import { AccessibilityProvider } from "@/components/accessibility/provider"
import { 
  WCAGComplianceChecker,
  HealthcareScreenReaderOptimization,
  HealthcareKeyboardNavigation,
  HealthcareVoiceNavigation,
  HealthcareMultiLanguageAccessibility,
  HealthcareCognitiveAccessibility,
  AccessibilityTestRunner,
  AccessibilityValidationFramework
} from "@/accessibility"
import { Toaster } from "sonner"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "My Family Clinic - Singapore Primary Care Network",
  description: "Find doctors, book appointments, and manage your healthcare journey in Singapore's comprehensive primary care network.",
  keywords: ["Singapore healthcare", "primary care", "clinic finder", "doctor appointments", "Healthier SG"],
  authors: [{ name: "My Family Clinic" }],
  creator: "My Family Clinic",
  publisher: "My Family Clinic",
  openGraph: {
    title: "My Family Clinic - Singapore Primary Care Network",
    description: "Find doctors, book appointments, and manage your healthcare journey in Singapore's comprehensive primary care network.",
    url: "https://myfamilyclinic.sg",
    siteName: "My Family Clinic",
    locale: "en_SG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Family Clinic - Singapore Primary Care Network",
    description: "Find doctors, book appointments, and manage your healthcare journey in Singapore's comprehensive primary care network.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { announce, currentAnnouncement } = useScreenReader()

  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-gray-50`}
      >
        {/* Comprehensive Accessibility Framework Integration */}
        <AccessibilityProvider>
          <WCAGComplianceChecker />
          <HealthcareMultiLanguageAccessibility />
          <HealthcareCognitiveAccessibility />
          <AccessibilityTestRunner />
          <AccessibilityValidationFramework />

          {/* Skip Links for Accessibility */}
          <SkipLink href="#main-content">Skip to main content</SkipLink>
          <SkipLink href="#search">Skip to search</SkipLink>
          <SkipLink href="#navigation">Skip to navigation</SkipLink>

          {/* Accessibility Controls */}
          <div className="fixed top-4 right-4 z-50">
            <AccessibilityControls />
          </div>

          <ErrorBoundary
            fallbackRender={({ error, resetErrorBoundary }: any) => (
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md mx-auto p-6">
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                      <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h1 className="mt-4 text-lg font-medium text-gray-900">Something went wrong</h1>
                    <p className="mt-2 text-sm text-gray-600">
                      We're sorry, but something unexpected happened. Please try refreshing the page.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => {
                          announce("Retrying application load")
                          resetErrorBoundary()
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[44px] touch-manipulation"
                      >
                        Try again
                      </button>
                    </div>
                    {process.env.NODE_ENV === 'development' && (
                      <details className="mt-4 text-left">
                        <summary className="cursor-pointer text-sm font-medium text-gray-700">
                          Error details (development only)
                        </summary>
                        <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                          {error.message}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            )}
          >
            <TRPCReactProvider>
              <SessionProvider>
                <main id="main-content" className="min-h-full" role="main">
                  {children}
                </main>
                
                <Toaster 
                  position="top-right" 
                  richColors 
                  expand={false}
                  visibleToasts={4}
                  duration={4000}
                  closeButton
                  toastOptions={{
                    style: {
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      color: '#374151',
                    },
                  }}
                />

                {/* Enhanced Screen Reader Announcements */}
                <ScreenReaderAnnouncements announcements={[]} currentAnnouncement={currentAnnouncement} />
              </SessionProvider>
            </TRPCReactProvider>
          </ErrorBoundary>
        </AccessibilityProvider>
      </body>
    </html>
  )
}
