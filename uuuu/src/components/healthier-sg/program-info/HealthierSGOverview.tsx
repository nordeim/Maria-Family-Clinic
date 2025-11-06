// Healthier SG Program Overview Component
// Comprehensive program summary with key information

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle2, 
  Users, 
  Heart, 
  Shield, 
  Clock, 
  ArrowRight, 
  Star,
  TrendingUp,
  Award,
  Globe,
  Calendar,
  MapPin,
  Phone
} from 'lucide-react'
import { ProgramOverviewContent, ProgramInfoComponentProps } from './types'

// Mock data - would be replaced with actual API call
const mockOverviewContent: ProgramOverviewContent = {
  id: 'overview-001',
  title: 'Healthier SG: Your Journey to Better Health',
  subtitle: 'Singapore\'s national health programme designed to help every Singaporean take control of their health',
  description: 'Healthier SG is Singapore\'s flagship preventive care programme that empowers citizens and permanent residents to work with their family doctors to improve their health through personalized health plans, screenings, and ongoing support.',
  heroSection: {
    title: 'Take Control of Your Health Today',
    subtitle: 'Join over 2.4 million Singaporeans in the Healthier SG programme',
    callToAction: {
      text: 'Check Your Eligibility',
      href: '/healthier-sg/eligibility',
      primary: true
    },
    image: {
      src: '/images/healthier-sg/hero-banner.jpg',
      alt: 'Happy families participating in Healthier SG programme',
      caption: 'Building healthier communities together'
    }
  },
  keyFeatures: [
    {
      title: 'Free Health Screening',
      description: 'Comprehensive health screening for chronic conditions and early detection of health issues',
      icon: 'heart-pulse',
      benefits: [
        'Early detection saves lives',
        'No out-of-pocket costs for eligible participants',
        'Personalized health risk assessment'
      ]
    },
    {
      title: 'Personalized Health Plans',
      description: 'Work with your family doctor to create a tailored health improvement plan',
      icon: 'user-md',
      benefits: [
        'Customized to your health goals',
        'Regular check-ins and adjustments',
        'Support for lifestyle changes'
      ]
    },
    {
      title: 'Government Subsidies',
      description: 'Significant cost savings on healthcare services and medications',
      icon: 'dollar-sign',
      benefits: [
        'Up to 90% subsidy on consultations',
        'Medisave-friendly chronic disease management',
        'Free vaccinations and screenings'
      ]
    },
    {
      title: 'Comprehensive Care',
      description: 'Holistic approach to health covering prevention, treatment, and ongoing management',
      icon: 'shield-check',
      benefits: [
        'Coordination between specialists',
        'Integrated care for chronic conditions',
        'Mental health support included'
      ]
    }
  ],
  statistics: [
    {
      value: '2.4M+',
      label: 'Active Participants',
      description: 'Singapore residents actively managing their health',
      source: 'MOH Data 2025'
    },
    {
      value: '92%',
      label: 'Satisfaction Rate',
      description: 'Participants satisfied with the programme',
      source: 'Healthier SG Survey 2025'
    },
    {
      value: '85%',
      label: 'Health Improvement',
      description: 'Participants reported improved health outcomes',
      source: 'Healthier SG Impact Study 2025'
    },
    {
      value: '$2,400',
      label: 'Average Annual Savings',
      description: 'Average healthcare cost savings per participant',
      source: 'Healthier SG Cost Analysis 2025'
    }
  ],
  testimonials: [
    {
      quote: 'Healthier SG helped me manage my diabetes effectively. My blood sugar is now under control, and I feel much healthier!',
      author: {
        name: 'Lim Ah Lian',
        age: 58,
        occupation: 'Retired Teacher',
        image: '/images/testimonials/lal.jpg'
      },
      programOutcome: 'Diabetes management and lifestyle improvement'
    },
    {
      quote: 'The free screening caught my high blood pressure early. Now I have a health plan that works with my busy schedule.',
      author: {
        name: 'Raj Kumar',
        age: 42,
        occupation: 'IT Professional',
        image: '/images/testimonials/rk.jpg'
      },
      programOutcome: 'Hypertension control and work-life balance'
    }
  ],
  nextSteps: [
    {
      title: 'Check Your Eligibility',
      description: 'Find out if you qualify for Healthier SG benefits',
      action: {
        text: 'Start Eligibility Check',
        href: '/healthier-sg/eligibility'
      }
    },
    {
      title: 'Find a Participating Clinic',
      description: 'Discover healthier SG accredited clinics near you',
      action: {
        text: 'Search Clinics',
        href: '/clinics'
      }
    },
    {
      title: 'Learn About Benefits',
      description: 'Understand all available subsidies and healthcare benefits',
      action: {
        text: 'View Benefits',
        href: '/healthier-sg/benefits'
      }
    }
  ]
}

export const HealthierSGOverview: React.FC<ProgramInfoComponentProps> = ({
  className = '',
  language = 'en',
  userType = 'citizen',
  isMobile = false,
  showGovernmentDisclaimer = true,
  enableAnalytics = true
}) => {
  const [content, setContent] = useState<ProgramOverviewContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState(language)

  useEffect(() => {
    // Simulate API call to fetch program overview content
    const loadContent = async () => {
      setLoading(true)
      // In real implementation, this would fetch from API
      await new Promise(resolve => setTimeout(resolve, 500))
      setContent(mockOverviewContent)
      setLoading(false)
    }

    loadContent()

    // Track page view for analytics
    if (enableAnalytics) {
      console.log('Analytics: Healthier SG Overview page viewed', {
        language: selectedLanguage,
        userType,
        timestamp: new Date().toISOString()
      })
    }
  }, [selectedLanguage, userType, enableAnalytics])

  if (loading) {
    return (
      <div className={`container mx-auto p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className={`container mx-auto p-6 ${className}`}>
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Unavailable</h2>
            <p className="text-gray-600 mb-4">
              We're currently updating our Healthier SG information. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {content.heroSection.title}
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {content.heroSection.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100"
                asChild
              >
                <a href={content.heroSection.callToAction.href}>
                  {content.heroSection.callToAction.text}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
                asChild
              >
                <a href="#benefits">Learn More</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {content.statistics.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="benefits" className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Programme Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover how Healthier SG empowers you to take control of your health with comprehensive support and benefits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.keyFeatures.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    {feature.icon === 'heart-pulse' && <Heart className="h-6 w-6 text-blue-600" />}
                    {feature.icon === 'user-md' && <Users className="h-6 w-6 text-blue-600" />}
                    {feature.icon === 'dollar-sign' && <Shield className="h-6 w-6 text-blue-600" />}
                    {feature.icon === 'shield-check' && <CheckCircle2 className="h-6 w-6 text-blue-600" />}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Programme Description */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              About Healthier SG
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed text-center mb-8">
              {content.description}
            </p>

            {/* Progress indicators for programme participation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Enroll</h3>
                <p className="text-gray-600">Complete your health assessment and choose your family doctor</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Get Screened</h3>
                <p className="text-gray-600">Receive comprehensive health screening and personalized care plan</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Improve Health</h3>
                <p className="text-gray-600">Follow your health plan with ongoing support and monitoring</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Preview */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-lg text-gray-600">
              Real stories from Singaporeans who transformed their health with Healthier SG
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {content.testimonials.map((testimonial, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {testimonial.author.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <blockquote className="text-gray-700 mb-4 italic">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="text-sm text-gray-600">
                        <div className="font-semibold">{testimonial.author.name}</div>
                        <div>Age {testimonial.author.age} • {testimonial.author.occupation}</div>
                        {testimonial.programOutcome && (
                          <Badge variant="secondary" className="mt-2">
                            {testimonial.programOutcome}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <a href="/healthier-sg/success-stories">
                Read More Success Stories
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-gray-600">
              Take the first step towards better health with these simple actions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {content.nextSteps.map((step, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <Button asChild>
                    <a href={step.action.href}>
                      {step.action.text}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Government Disclaimer */}
      {showGovernmentDisclaimer && (
        <section className="py-8 bg-gray-100 border-t">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Shield className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Official Government Information</span>
              </div>
              <p className="text-sm text-gray-600">
                This information is provided by the Ministry of Health (MOH), Singapore. 
                For the most current programme details and eligibility criteria, please visit{' '}
                <a href="https://www.moh.gov.sg" className="text-blue-600 hover:underline">
                  moh.gov.sg
                </a>
                {' '}or call our hotline at 1800-850-8000.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  Singapore Government
                </span>
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Last updated: November 4, 2025
                </span>
                <span className="flex items-center">
                  <Globe className="h-3 w-3 mr-1" />
                  Available in 4 languages
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Language Toggle */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="bg-white rounded-lg shadow-lg border p-2 flex space-x-1">
          <Button
            size="sm"
            variant={selectedLanguage === 'en' ? 'default' : 'ghost'}
            onClick={() => setSelectedLanguage('en')}
            className="px-3 py-1"
          >
            EN
          </Button>
          <Button
            size="sm"
            variant={selectedLanguage === 'zh' ? 'default' : 'ghost'}
            onClick={() => setSelectedLanguage('zh')}
            className="px-3 py-1"
          >
            中文
          </Button>
          <Button
            size="sm"
            variant={selectedLanguage === 'ms' ? 'default' : 'ghost'}
            onClick={() => setSelectedLanguage('ms')}
            className="px-3 py-1"
          >
            MS
          </Button>
          <Button
            size="sm"
            variant={selectedLanguage === 'ta' ? 'default' : 'ghost'}
            onClick={() => setSelectedLanguage('ta')}
            className="px-3 py-1"
          >
            தமிழ்
          </Button>
        </div>
      </div>
    </div>
  )
}