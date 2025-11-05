"use client"

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { trpc } from '@/trpc/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  DollarSign,
  Calendar,
  CreditCard,
  Shield,
  Users,
  FileText,
  ExternalLink,
  BookOpen,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FAQItem {
  id: string
  category: 'general' | 'benefits' | 'payments' | 'screening' | 'technical' | 'account'
  question: string
  answer: string
  tags: string[]
  lastUpdated: string
  popular?: boolean
  helpTopics?: string[]
}

interface ContactMethod {
  type: 'phone' | 'email' | 'chat' | 'web'
  name: string
  description: string
  icon: React.ReactNode
  availability: string
  action: string
  contact?: string
}

export default function BenefitsFAQ() {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  // Mock FAQ data
  const [faqItems] = useState<FAQItem[]>([
    {
      id: '1',
      category: 'general',
      question: 'What is Healthier SG?',
      answer: 'Healthier SG is Singapore\'s national health program designed to help residents achieve better health outcomes. It provides personalized health plans, regular screenings, and access to subsidized healthcare services. Participants earn benefits and incentives for completing health activities and achieving wellness goals.',
      tags: ['overview', 'program', 'singapore'],
      lastUpdated: '2025-10-01',
      popular: true,
      helpTopics: ['Getting Started', 'Program Benefits', 'Health Goals']
    },
    {
      id: '2',
      category: 'benefits',
      question: 'How do I qualify for Healthier SG benefits?',
      answer: 'To qualify for Healthier SG benefits, you must be: 1) A Singapore resident aged 18 and above, 2) Enrolled in the program with a participating clinic, 3) Have a valid NRIC or FIN, and 4) Complete your health profile. Benefits are tiered based on your participation level: Basic ($300/year), Enhanced ($600/year), or Premium ($1000/year).',
      tags: ['eligibility', 'qualification', 'enrollment'],
      lastUpdated: '2025-10-15',
      popular: true,
      helpTopics: ['Enrollment', 'Eligibility', 'Health Profile']
    },
    {
      id: '3',
      category: 'benefits',
      question: 'What are the different benefit tiers and how much can I earn?',
      answer: 'There are three benefit tiers: Basic ($300/year base benefits), Enhanced ($600/year), and Premium ($1000/year). You can earn additional incentives for health goal achievements, screening completions, community participation, and education courses. The maximum annual benefits can reach up to $2,000 depending on your activity level and goals.',
      tags: ['tiers', 'earning', 'amounts'],
      lastUpdated: '2025-10-10',
      popular: true,
      helpTopics: ['Benefit Calculation', 'Earning Incentives', 'Tier System']
    },
    {
      id: '4',
      category: 'payments',
      question: 'How are benefits paid out?',
      answer: 'Benefits are paid out through multiple methods: 1) Medisave account credits (most common), 2) Bank transfers for incentive rewards, 3) Direct payment for healthcare services, and 4) Community health program credits. Payments are processed monthly, with larger benefit payouts occurring quarterly.',
      tags: ['payments', 'medisave', 'bank transfer'],
      lastUpdated: '2025-09-28',
      helpTopics: ['Payment Methods', 'Medisave Integration', 'Processing Times']
    },
    {
      id: '5',
      category: 'payments',
      question: 'Can I use my Medisave for Healthier SG services?',
      answer: 'Yes, Medisave can be used for most Healthier SG services including health screenings, consultations, and approved treatments. The program helps you maximize your Medisave usage by providing additional benefits and subsidized rates. Your clinic can help determine what services are covered under your Medisave account.',
      tags: ['medisave', 'coverage', 'healthcare costs'],
      lastUpdated: '2025-10-05',
      helpTopics: ['Medisave Usage', 'Healthcare Coverage', 'Cost Savings']
    },
    {
      id: '6',
      category: 'screening',
      question: 'What health screenings are covered?',
      answer: 'Healthier SG covers comprehensive health screenings including: Annual health check-ups, Diabetes screening (blood glucose, HbA1c), Cardiovascular assessment (blood pressure, ECG), Cancer screenings (mammogram, colonoscopy for eligible ages), Vision and hearing tests, Bone density scans, and Mental health assessments. Frequency depends on your age and risk factors.',
      tags: ['screenings', 'health checks', 'coverage'],
      lastUpdated: '2025-10-12',
      popular: true,
      helpTopics: ['Screening Schedule', 'Age-specific Tests', 'Frequency Guidelines']
    },
    {
      id: '7',
      category: 'screening',
      question: 'How often should I get health screenings?',
      answer: 'Screening frequency depends on your age, health status, and risk factors: Adults 18-39: Annual basic screening; Adults 40-49: Annual comprehensive screening; Adults 50-64: Bi-annual comprehensive screening plus age-specific tests; Adults 65+: Annual screening with additional monitoring for chronic conditions. Your doctor will personalize your screening schedule.',
      tags: ['frequency', 'schedule', 'age groups'],
      lastUpdated: '2025-09-30',
      helpTopics: ['Personalized Schedule', 'Age Guidelines', 'Risk Assessment']
    },
    {
      id: '8',
      category: 'technical',
      question: 'How do I access my benefits account online?',
      answer: 'You can access your benefits account through: 1) The My Family Clinic mobile app, 2) Website login with SingPass, 3) HealthHub Singapore portal, or 4) Direct clinic system access. Your account shows real-time benefits balance, transaction history, upcoming appointments, and incentive tracking.',
      tags: ['access', 'login', 'digital platform'],
      lastUpdated: '2025-10-08',
      helpTopics: ['Digital Access', 'SingPass Login', 'Mobile App']
    },
    {
      id: '9',
      category: 'account',
      question: 'What happens to my benefits if I change clinics?',
      answer: 'Your benefits and health records transfer with you when you change clinics within the Healthier SG network. Your new clinic will have access to your complete health profile, screening history, and benefits record. Benefits continue uninterrupted during the transition. Simply notify your new clinic about your previous enrollment.',
      tags: ['clinic transfer', 'records', 'continuity'],
      lastUpdated: '2025-09-25',
      helpTopics: ['Clinic Network', 'Record Transfer', 'Continuity of Care']
    },
    {
      id: '10',
      category: 'benefits',
      question: 'Can family members share benefits?',
      answer: 'Yes, Healthier SG supports family sharing of benefits. Family members can pool their benefits for shared healthcare expenses, and parents can use their benefits for children under 18. The system automatically calculates family discounts and shared benefit allocations. Each family member maintains individual health goals while contributing to collective savings.',
      tags: ['family', 'sharing', 'children'],
      lastUpdated: '2025-10-03',
      helpTopics: ['Family Accounts', 'Benefit Sharing', 'Children Coverage']
    },
    {
      id: '11',
      category: 'general',
      question: 'How do I track my health goals and progress?',
      answer: 'Health goals and progress are tracked through: 1) The mobile app with daily logging, 2) Wearable device integration for activity data, 3) Clinic visits for clinical measurements, 4) Self-reported health activities, and 5) Automated tracking from healthcare providers. You can view real-time progress, milestone achievements, and earned incentives on your dashboard.',
      tags: ['tracking', 'goals', 'progress', 'monitoring'],
      lastUpdated: '2025-10-14',
      helpTopics: ['Goal Setting', 'Progress Monitoring', 'Device Integration']
    },
    {
      id: '12',
      category: 'account',
      question: 'What if I lose my benefits or they don\'t appear?',
      answer: 'If benefits are missing or delayed: 1) Check your transaction history for processing status, 2) Verify your bank details and Medisave account information, 3) Contact your clinic to confirm activity completion, 4) Use the in-app support chat for immediate assistance, or 5) Call our hotline at 1800-HEALTHIER. Most issues are resolved within 2-3 business days.',
      tags: ['missing benefits', 'troubleshooting', 'support'],
      lastUpdated: '2025-10-11',
      popular: true,
      helpTopics: ['Benefit Issues', 'Customer Support', 'Troubleshooting']
    }
  ])

  const contactMethods: ContactMethod[] = [
    {
      type: 'phone',
      name: '24/7 Hotline',
      description: 'Speak with a Healthier SG representative',
      icon: <Phone className="h-5 w-5" />,
      availability: '24/7',
      action: 'Call Now',
      contact: '1800-HEALTHIER'
    },
    {
      type: 'email',
      name: 'Email Support',
      description: 'Send detailed inquiries via email',
      icon: <Mail className="h-5 w-5" />,
      availability: 'Response within 24 hours',
      action: 'Send Email',
      contact: 'support@healthiersg.gov.sg'
    },
    {
      type: 'chat',
      name: 'Live Chat',
      description: 'Chat with our virtual assistant',
      icon: <MessageCircle className="h-5 w-5" />,
      availability: 'Mon-Fri 8AM-8PM',
      action: 'Start Chat'
    },
    {
      type: 'web',
      name: 'Online Portal',
      description: 'Access comprehensive help resources',
      icon: <FileText className="h-5 w-5" />,
      availability: 'Always available',
      action: 'Visit Portal'
    }
  ]

  const categories = [
    { id: 'all', name: 'All Topics', icon: <HelpCircle className="h-4 w-4" /> },
    { id: 'general', name: 'General', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'benefits', name: 'Benefits', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'payments', name: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'screening', name: 'Screenings', icon: <Shield className="h-4 w-4" /> },
    { id: 'technical', name: 'Technical', icon: <FileText className="h-4 w-4" /> },
    { id: 'account', name: 'Account', icon: <Users className="h-4 w-4" /> }
  ]

  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleItem = (itemId: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(itemId)) {
      newOpenItems.delete(itemId)
    } else {
      newOpenItems.add(itemId)
    }
    setOpenItems(newOpenItems)
  }

  const popularFAQs = faqItems.filter(item => item.popular)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Benefits FAQ
          </CardTitle>
          <CardDescription>
            Find answers to common questions about Healthier SG benefits and services
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search FAQ, benefits, payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category.id}
                size="sm"
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-1"
              >
                {category.icon}
                <span>{category.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Questions */}
      {searchTerm === '' && selectedCategory === 'all' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Questions</CardTitle>
            <CardDescription>
              Most frequently asked questions about Healthier SG benefits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {popularFAQs.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer"
                     onClick={() => toggleItem(item.id)}>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Popular</Badge>
                    <span className="font-medium">{item.question}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQ List */}
      <div className="space-y-4">
        {filteredFAQs.map(item => (
          <Card key={item.id} className="overflow-hidden">
            <Collapsible 
              open={openItems.has(item.id)}
              onOpenChange={() => toggleItem(item.id)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg text-left">{item.question}</CardTitle>
                        {item.popular && (
                          <Badge className="bg-orange-100 text-orange-700">Popular</Badge>
                        )}
                        <Badge variant="outline" className="text-xs capitalize">
                          {item.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Updated {new Date(item.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="ml-4">
                      {openItems.has(item.id) ? 
                        <ChevronUp className="h-5 w-5" /> : 
                        <ChevronDown className="h-5 w-5" />
                      }
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                  </div>
                  
                  {item.helpTopics && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">Related Help Topics:</h4>
                      <div className="flex flex-wrap gap-2">
                        {item.helpTopics.map(topic => (
                          <Button key={topic} size="sm" variant="outline" className="text-xs">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {topic}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {filteredFAQs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No results found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your search terms or browse by category
            </p>
            <Button variant="outline" onClick={() => {setSearchTerm(''); setSelectedCategory('all')}}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Still Need Help?</CardTitle>
          <CardDescription>
            Contact our support team for personalized assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactMethods.map(method => (
              <Card key={method.type} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center space-y-3">
                  <div className="p-3 bg-blue-100 rounded-full mx-auto w-fit text-blue-600">
                    {method.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{method.name}</h3>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs text-muted-foreground">{method.availability}</span>
                    </div>
                    {method.contact && (
                      <p className="text-xs font-medium text-blue-600 mt-1">{method.contact}</p>
                    )}
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    {method.action}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Benefits Calculator', icon: <DollarSign className="h-5 w-5" />, href: '/calculator' },
              { name: 'Screening Schedule', icon: <Calendar className="h-5 w-5" />, href: '/screenings' },
              { name: 'Payment History', icon: <CreditCard className="h-5 w-5" />, href: '/payments' },
              { name: 'Download App', icon: <FileText className="h-5 w-5" />, href: '/app' }
            ].map(link => (
              <Button key={link.name} variant="outline" className="h-auto p-4 flex-col gap-2">
                {link.icon}
                <span className="text-xs">{link.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}