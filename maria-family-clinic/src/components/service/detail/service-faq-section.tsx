"use client";

import React, { useState } from 'react';
import { useServiceData } from '@/hooks/use-service-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  SearchIcon,
  ChatBubbleLeftIcon,
  PhoneIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ServiceFAQSectionProps {
  category: string;
  serviceSlug: string;
  locale: string;
}

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
  isPopular?: boolean;
  lastUpdated: string;
  relatedQuestions?: string[];
}

export function ServiceFAQSection({ category, serviceSlug, locale }: ServiceFAQSectionProps) {
  const { data: service, isLoading } = useServiceData(category, serviceSlug, locale);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-96 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!service) return null;

  // Comprehensive FAQ data for medical procedures
  const faqData: FAQItem[] = [
    {
      id: 'faq-1',
      category: 'preparation',
      question: 'What should I do before my appointment?',
      answer: `Before your appointment, please:

• Complete any required forms online or bring them with you
• Gather your medical history and current medication list
• Bring valid identification and insurance information
• Follow any specific preparation instructions given during booking
• Arrive 15-30 minutes early for check-in

If you have any questions about preparation, contact our clinic at least 24 hours before your appointment.`,
      tags: ['preparation', 'appointment', 'forms'],
      isPopular: true,
      lastUpdated: '2024-10-15',
      relatedQuestions: ['faq-2', 'faq-3']
    },
    {
      id: 'faq-2',
      category: 'preparation',
      question: 'What documents do I need to bring?',
      answer: `Please bring the following documents:

**Required:**
• Valid Singapore ID (NRIC, passport, or driver's license)
• Insurance card or medical benefits information

**Recommended:**
• Referral letter (if you were referred by another doctor)
• Previous medical records or test results
• List of current medications and dosages
• Emergency contact information

**Optional:**
• Employment pass or work permit (for foreign workers)
• Company insurance documentation`,
      tags: ['documents', 'id', 'insurance'],
      lastUpdated: '2024-10-15'
    },
    {
      id: 'faq-3',
      category: 'preparation',
      question: 'How do I prepare for the procedure?',
      answer: `Preparation depends on your specific procedure. Your doctor will provide detailed instructions, but common preparations include:

**General Preparation:**
• Follow medication instructions carefully
• Arrange transportation if sedation is planned
• Wear comfortable, loose-fitting clothing
• Remove jewelry and accessories

**Dietary Restrictions:**
• Some procedures require fasting (no food/drink for 6-8 hours)
• Others may require avoiding certain foods or supplements
• Always follow your doctor's specific instructions

**Lifestyle Changes:**
• Avoid alcohol for 24-48 hours before procedure
• Stop smoking if advised
• Maintain good hygiene`,
      tags: ['procedure', 'fasting', 'medication'],
      isPopular: true,
      lastUpdated: '2024-10-15'
    },
    {
      id: 'faq-4',
      category: 'procedure',
      question: 'What happens during the procedure?',
      answer: `The procedure experience varies by service type, but here's what to expect:

**Before the Procedure:**
• Check-in and registration (15-30 minutes)
• Meeting with your healthcare team
• Review of preparation and consent forms
• Any final preparations or measurements

**During the Procedure:**
• Positioned comfortably for the procedure
• Continuous monitoring of vital signs
• Local anesthesia if required (you'll be awake but comfortable)
• Procedure time varies (15 minutes to 2+ hours depending on complexity)

**After the Procedure:**
• Brief recovery period for monitoring
• Post-procedure instructions
• Scheduling of follow-up appointments
• Discharge when stable`,
      tags: ['procedure', 'what to expect', 'duration'],
      isPopular: true,
      lastUpdated: '2024-10-15'
    },
    {
      id: 'faq-5',
      category: 'procedure',
      question: 'Will the procedure be painful?',
      answer: `Pain management is a priority throughout your procedure:

**During the Procedure:**
• Local anesthesia numbs the treatment area
• Sedation options available for comfort
• Your comfort level is monitored continuously
• Pain medication can be adjusted as needed

**After the Procedure:**
• Some discomfort is normal and expected
• Pain medication prescribed as appropriate
• Ice packs or other comfort measures available
• 24/7 hotline available for pain concerns

**Managing Expectations:**
• Pain levels vary by individual and procedure
• Most patients report minimal to moderate discomfort
• Serious pain is rare and would be addressed immediately
• Your comfort is our primary concern`,
      tags: ['pain', 'anesthesia', 'comfort'],
      lastUpdated: '2024-10-15'
    },
    {
      id: 'faq-6',
      category: 'recovery',
      question: 'What is the recovery process like?',
      answer: `Recovery varies by procedure but generally follows this timeline:

**Immediate Recovery (0-24 hours):**
• Rest and limited activity as instructed
• Ice application if recommended
• Take prescribed medications as directed
• Watch for warning signs (listed in your instructions)

**Early Recovery (1-7 days):**
• Gradual increase in activity
• Return to light daily activities
• Follow-up appointment or phone call
• Monitor symptoms and healing progress

**Full Recovery (1-8 weeks):**
• Return to normal activities
• Continued improvement in comfort and function
• Possible physical therapy or rehabilitation
• Long-term follow-up as recommended

**Recovery Support:**
• 24/7 nurse hotline for questions
• Detailed written instructions
• Follow-up appointments scheduled
• Access to care team during business hours`,
      tags: ['recovery', 'timeline', 'follow-up'],
      isPopular: true,
      lastUpdated: '2024-10-15'
    },
    {
      id: 'faq-7',
      category: 'recovery',
      question: 'What are the warning signs I should watch for?',
      answer: `Contact your doctor immediately if you experience:

**Call 995 (Emergency) for:**
• Severe chest pain or difficulty breathing
• Heavy bleeding that doesn't stop with pressure
• Loss of consciousness or severe confusion
• Signs of severe allergic reaction

**Call Clinic (During Business Hours) for:**
• Fever over 38.5°C (101.3°F)
• Increased pain not relieved by prescribed medication
• Signs of infection (redness, warmth, pus, unusual swelling)
• Unusual drainage or discharge
• Nausea or vomiting that persists

**Call After-Hours Line for:**
• Questions about medications
• Concerns about symptoms
• Need for advice about activity restrictions
• Scheduling urgent follow-up

Your specific procedure may have additional warning signs outlined in your written instructions.`,
      tags: ['warning signs', 'emergency', 'complications'],
      isPopular: true,
      lastUpdated: '2024-10-15'
    },
    {
      id: 'faq-8',
      category: 'costs',
      question: 'How much does the procedure cost?',
      answer: `Costs vary based on several factors:

**Base Procedure Cost:**
• Consultation fee: SGD 120-180
• Procedure fees: SGD 800-3,000 (varies by complexity)
• Follow-up care included in most packages

**Additional Costs (if needed):**
• Diagnostic tests or imaging
• Medications prescribed
• Specialized equipment or implants
• Extended recovery monitoring

**Insurance Coverage:**
• Many procedures covered by Medisave or Medishield
• Private insurance coverage varies
• Corporate insurance may provide full coverage
• Self-pay options available with payment plans

**Cost Assistance:**
• Payment plans available (0% interest)
• Financial counseling services
• Estimate provided before procedure
• No hidden fees policy`,
      tags: ['cost', 'pricing', 'insurance'],
      lastUpdated: '2024-10-15'
    },
    {
      id: 'faq-9',
      category: 'general',
      question: 'How do I know if this procedure is right for me?',
      answer: `The decision for any medical procedure should be made with your healthcare provider:

**Evaluation Process:**
• Complete medical history and physical examination
• Review of symptoms and their impact on your life
• Discussion of treatment goals and expectations
• Consideration of your preferences and values
• Assessment of risks and benefits

**Factors to Consider:**
• Severity of your condition
• Impact on quality of life
• Response to previous treatments
• Overall health and fitness level
• Personal preferences and concerns

**Second Opinion Options:**
• Encouraged for major procedures
• Covered by most insurance plans
• Additional consultation with specialist available
• Can help confirm the best treatment approach

**Your Role in Decision-Making:**
• Ask questions about all options
• Understand risks and benefits
• Consider your lifestyle and values
• Take time to make informed decisions
• Involve family members if desired`,
      tags: ['decision making', 'second opinion', 'treatment planning'],
      isPopular: true,
      lastUpdated: '2024-10-15'
    },
    {
      id: 'faq-10',
      category: 'general',
      question: 'Can I bring someone with me to the appointment?',
      answer: `Support persons are welcome and often helpful:

**Who Can Come:**
• Family members or close friends
• Caregivers or support persons
• Interpreters (if needed for language barriers)
• Spouse or partner for major procedures

**Benefits of Having Support:**
• Emotional support and comfort
• Help remember information and instructions
• Assistance with transportation if needed
• Second set of ears for important discussions

**Arrangements:**
• Limit to 1-2 people for privacy and space
• Inform us if you need special accommodations
• Support persons should arrive with you
• Children may need arrangements (no childcare provided)

**Virtual Support Options:**
• Video calls during consultation (if needed)
• Text messaging during procedure wait times
• Photo updates with your permission
• Phone calls for support and updates

Your comfort and peace of mind are important to us.`,
      tags: ['support', 'family', 'companion'],
      lastUpdated: '2024-10-15'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Questions', count: faqData.length },
    { id: 'preparation', name: 'Preparation', count: faqData.filter(f => f.category === 'preparation').length },
    { id: 'procedure', name: 'During Procedure', count: faqData.filter(f => f.category === 'procedure').length },
    { id: 'recovery', name: 'Recovery', count: faqData.filter(f => f.category === 'recovery').length },
    { id: 'costs', name: 'Costs & Insurance', count: faqData.filter(f => f.category === 'costs').length },
    { id: 'general', name: 'General', count: faqData.filter(f => f.category === 'general').length },
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const popularFAQs = faqData.filter(faq => faq.isPopular);

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  return (
    <div id="faq" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QuestionMarkCircleIcon className="h-5 w-5 text-blue-500" />
            <span>Frequently Asked Questions</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Find answers to common questions about your {service.name}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="space-y-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="text-xs"
                  >
                    {category.name} ({category.count})
                  </Button>
                ))}
              </div>
            </div>

            {/* Popular Questions */}
            {selectedCategory === 'all' && !searchTerm && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                  <LightBulbIcon className="h-4 w-4 text-yellow-500" />
                  <span>Most Popular Questions</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {popularFAQs.map((faq) => (
                    <Button
                      key={faq.id}
                      variant="ghost"
                      size="sm"
                      className="h-auto p-3 text-left justify-start"
                      onClick={() => toggleFAQ(faq.id)}
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">{faq.question}</div>
                        <Badge variant="secondary" className="text-xs">
                          Popular
                        </Badge>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ List */}
            <div className="space-y-3">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <QuestionMarkCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p>No questions found matching your search.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                filteredFAQs.map((faq) => {
                  const isExpanded = expandedFAQ === faq.id;
                  
                  return (
                    <Card key={faq.id} className="border border-gray-200">
                      <Collapsible open={isExpanded} onOpenChange={() => toggleFAQ(faq.id)}>
                        <CollapsibleTrigger asChild>
                          <div className="p-4 cursor-pointer hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center space-x-2">
                                  <h4 className="text-sm font-medium text-gray-900">{faq.question}</h4>
                                  {faq.isPopular && (
                                    <Badge variant="default" className="text-xs bg-yellow-500">
                                      Popular
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {faq.category}
                                  </Badge>
                                </div>
                                
                                <div className="flex flex-wrap gap-1">
                                  {faq.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                
                                <div className="text-xs text-gray-500">
                                  Last updated: {new Date(faq.lastUpdated).toLocaleDateString()}
                                </div>
                              </div>
                              
                              <ChevronDownIcon 
                                className={cn(
                                  "h-4 w-4 text-gray-400 transition-transform ml-4",
                                  isExpanded ? "rotate-180" : ""
                                )}
                              />
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <div className="px-4 pb-4 border-t border-gray-200">
                            <div className="pt-3 prose prose-sm max-w-none">
                              <div className="whitespace-pre-wrap text-sm text-gray-700">
                                {faq.answer}
                              </div>
                            </div>
                            
                            {faq.relatedQuestions && faq.relatedQuestions.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-gray-200">
                                <h5 className="text-sm font-medium text-gray-900 mb-2">Related Questions</h5>
                                <div className="space-y-1">
                                  {faq.relatedQuestions.map((relatedId) => {
                                    const relatedFAQ = faqData.find(f => f.id === relatedId);
                                    return relatedFAQ ? (
                                      <Button
                                        key={relatedId}
                                        variant="ghost"
                                        size="sm"
                                        className="p-0 h-auto text-blue-600 hover:text-blue-800"
                                        onClick={() => toggleFAQ(relatedId)}
                                      >
                                        {relatedFAQ.question}
                                      </Button>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact and Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ChatBubbleLeftIcon className="h-5 w-5 text-green-500" />
            <span>Still Have Questions?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <PhoneIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-blue-800 mb-1">Call Us</h4>
              <p className="text-sm text-blue-600 mb-2">(65) 6789 1234</p>
              <p className="text-xs text-blue-500">Available 8 AM - 8 PM daily</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <ChatBubbleLeftIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-800 mb-1">Live Chat</h4>
              <p className="text-sm text-green-600 mb-2">Chat with our team</p>
              <p className="text-xs text-green-500">Instant responses</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <ClockIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-purple-800 mb-1">After Hours</h4>
              <p className="text-sm text-purple-600 mb-2">24/7 Nurse Hotline</p>
              <p className="text-xs text-purple-500">For urgent questions</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-amber-800 mb-1">
                  Medical Emergencies
                </h4>
                <p className="text-sm text-amber-700">
                  For medical emergencies, call 995 immediately or go to the nearest emergency department. 
                  Do not wait for answers to online questions during emergencies.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}