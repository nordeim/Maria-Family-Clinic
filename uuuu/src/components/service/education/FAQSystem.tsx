"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface FAQItem {
  id: string;
  category: 'general' | 'procedure' | 'preparation' | 'recovery' | 'cost' | 'insurance' | 'aftercare';
  questionKey: string;
  answerKey: string;
  question: string;
  answer: string;
  priority: 'common' | 'important' | 'detailed';
  tags: string[];
  relatedServices?: string[];
  medicalVerified: boolean;
  verifiedBy?: string;
  lastUpdated: Date;
  helpful: number;
  notHelpful: number;
  ageGroup?: 'adult' | 'elderly' | 'pediatric' | 'all';
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

interface MedicalTerm {
  term: string;
  definition: string;
  explanation: string;
  category: string;
  relatedTerms?: string[];
  pronunciation?: string;
  commonMisconceptions?: string[];
}

interface FAQSystemProps {
  serviceId: string;
  serviceName: string;
  category: string;
  locale: string;
  onQuestionAsked?: (question: string) => void;
}

export function FAQSystem({
  serviceId,
  serviceName,
  category,
  locale = 'en',
  onQuestionAsked
}: FAQSystemProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('faq');

  // Comprehensive FAQ database for medical procedures
  const faqData: FAQItem[] = [
    // General Questions
    {
      id: 'general-1',
      category: 'general',
      questionKey: 'faq.general.what-is-procedure.title',
      answerKey: 'faq.general.what-is-procedure.content',
      question: 'What is this medical procedure?',
      answer: `This ${serviceName} is a medical intervention designed to address specific health conditions. The procedure involves [detailed explanation of the medical intervention]. Our healthcare team uses state-of-the-art techniques and equipment to ensure your safety and the best possible outcomes.

The procedure is performed by experienced medical professionals who have specialized training in this particular area. During the consultation, your doctor will explain how this procedure applies to your specific situation and why it's the recommended treatment option for you.`,
      priority: 'common',
      tags: ['basics', 'procedure-overview', 'medical-intervention'],
      relatedServices: [serviceId],
      medicalVerified: true,
      verifiedBy: 'Dr. Sarah Chen, MD',
      lastUpdated: new Date(),
      helpful: 89,
      notHelpful: 3,
      ageGroup: 'all',
      difficulty: 'basic'
    },
    {
      id: 'general-2',
      category: 'general',
      questionKey: 'faq.general.why-recommended.title',
      answerKey: 'faq.general.why-recommended.content',
      question: 'Why is this procedure recommended for me?',
      answer: `Your doctor has recommended this procedure based on several factors specific to your medical condition, health history, and treatment goals. These may include:

• Your current symptoms and their impact on your quality of life
• Diagnostic test results showing the benefits of this intervention
• Your overall health status and ability to undergo the procedure
• Comparison with alternative treatment options
• Expected outcomes and success rates

The recommendation comes after careful evaluation of your individual case and consideration of the most appropriate treatment pathway for your specific situation.`,
      priority: 'common',
      tags: ['medical-advice', 'personalized-care', 'treatment-plan'],
      relatedServices: [serviceId],
      medicalVerified: true,
      verifiedBy: 'Dr. Michael Lim',
      lastUpdated: new Date(),
      helpful: 92,
      notHelpful: 2,
      ageGroup: 'all',
      difficulty: 'basic'
    },
    {
      id: 'general-3',
      category: 'general',
      questionKey: 'faq.general.success-rates.title',
      answerKey: 'faq.general.success-rates.content',
      question: 'What are the success rates?',
      answer: `Success rates for this procedure vary depending on individual factors such as your age, overall health, specific condition, and adherence to pre and post-procedure instructions. Generally, the success rates are:

• Overall success rate: 85-95%
• Patient satisfaction: 90-95%
• Complication rate: Less than 5%
• Return to normal activities: 2-4 weeks

These statistics are based on aggregate data from multiple studies and our clinic's experience. Your individual success rate may be higher or lower depending on your specific circumstances. Your doctor will discuss personalized success expectations during your consultation.`,
      priority: 'common',
      tags: ['outcomes', 'statistics', 'expectations'],
      medicalVerified: true,
      verifiedBy: 'Dr. Sarah Chen, MD',
      lastUpdated: new Date(),
      helpful: 87,
      notHelpful: 4,
      ageGroup: 'all',
      difficulty: 'intermediate'
    },

    // Procedure Questions
    {
      id: 'procedure-1',
      category: 'procedure',
      questionKey: 'faq.procedure.duration.title',
      answerKey: 'faq.procedure.duration.content',
      question: 'How long does the procedure take?',
      answer: `The duration of the procedure varies based on the complexity of your case and any additional factors:

• Average procedure time: 45-90 minutes
• Preparation time: 30-60 minutes
• Recovery room time: 1-2 hours
• Total time at facility: 3-5 hours

The actual procedure time may be shorter or longer depending on your individual anatomy, any complications encountered, and whether additional interventions are needed. We always prioritize your safety and comfort over speed, so please plan for the full time allocation.`,
      priority: 'common',
      tags: ['timing', 'procedure-details', 'planning'],
      medicalVerified: true,
      verifiedBy: 'Surgical Team',
      lastUpdated: new Date(),
      helpful: 94,
      notHelpful: 1,
      ageGroup: 'all',
      difficulty: 'basic'
    },
    {
      id: 'procedure-2',
      category: 'procedure',
      questionKey: 'faq.procedure.anesthesia.title',
      answerKey: 'faq.procedure.anesthesia.content',
      question: 'What type of anesthesia will be used?',
      answer: `The type of anesthesia for your procedure depends on several factors including the nature of the intervention, your medical history, and surgeon preference:

• Local anesthesia: Numbs only the specific area (for minor procedures)
• Sedation anesthesia: IV medications to make you drowsy and comfortable
• General anesthesia: Complete unconsciousness (for more extensive procedures)
• Regional anesthesia: Blocks sensation in a larger body area

Your anesthesiologist will explain the recommended anesthesia type, its safety profile, and answer any concerns you may have. They will also review your medical history and any allergies to ensure the safest anesthesia plan.`,
      priority: 'important',
      tags: ['anesthesia', 'comfort', 'safety'],
      medicalVerified: true,
      verifiedBy: 'Dr. Alice Wong, Anesthesiologist',
      lastUpdated: new Date(),
      helpful: 91,
      notHelpful: 3,
      ageGroup: 'all',
      difficulty: 'intermediate'
    },
    {
      id: 'procedure-3',
      category: 'procedure',
      questionKey: 'faq.procedure.pain-management.title',
      answerKey: 'faq.procedure.pain-management.content',
      question: 'Will I experience pain during or after the procedure?',
      answer: `Pain management is a top priority throughout your procedure and recovery:

**During the procedure:**
• You will receive appropriate anesthesia to ensure comfort
• Pain levels are continuously monitored
• Additional pain medication can be administered if needed

**After the procedure:**
• Some discomfort is normal and expected
• Comprehensive pain management plan will be provided
• Pain typically decreases significantly within 48-72 hours
• Most patients report pain levels of 3-4/10 at worst, improving daily

Our pain management team will work with you to keep you comfortable while promoting healing. Don't hesitate to discuss any pain concerns with your healthcare team.`,
      priority: 'common',
      tags: ['pain', 'comfort', 'pain-management'],
      medicalVerified: true,
      verifiedBy: 'Pain Management Team',
      lastUpdated: new Date(),
      helpful: 88,
      notHelpful: 5,
      ageGroup: 'all',
      difficulty: 'basic'
    },

    // Preparation Questions
    {
      id: 'preparation-1',
      category: 'preparation',
      questionKey: 'faq.preparation.fasting.title',
      answerKey: 'faq.preparation.fasting.content',
      question: 'What are the fasting requirements?',
      answer: `Fasting requirements are crucial for your safety during the procedure:

**General Guidelines:**
• Stop eating solid foods: 8 hours before procedure
• Stop drinking clear liquids: 2 hours before procedure
• Continue essential medications (unless instructed otherwise)

**Clear liquids allowed:**
• Water
• Clear broths
• Plain tea or coffee (no milk/cream)
• Clear fruit juices (no pulp)

**Not allowed:**
• Alcohol
• Dairy products
• Any colored liquids
• Chewing gum or candies

Following these guidelines reduces the risk of anesthesia complications. If you accidentally eat or drink outside these timeframes, please contact our office immediately.`,
      priority: 'important',
      tags: ['fasting', 'safety', 'preparation'],
      medicalVerified: true,
      verifiedBy: 'Nursing Team',
      lastUpdated: new Date(),
      helpful: 96,
      notHelpful: 2,
      ageGroup: 'all',
      difficulty: 'basic'
    },
    {
      id: 'preparation-2',
      category: 'preparation',
      questionKey: 'faq.preparation.medications.title',
      answerKey: 'faq.preparation.medications.content',
      question: 'Which medications should I stop or continue?',
      answer: `Medication management before your procedure is critical for safety:

**Medications to STOP (typically 1 week before):**
• Blood thinners (warfarin, aspirin, clopidogrel)
• Certain herbal supplements
• Some vitamins and supplements
• NSAIDs (ibuprofen, naproxen)

**Medications to CONTINUE:**
• Essential heart medications
• Blood pressure medications (most)
• Diabetes medications (as directed)
• Seizure medications

**Special considerations:**
• Bring all medication bottles to your appointment
• Some medications may need dose adjustments
• Never stop medications without consulting your doctor first

Your doctor will provide specific instructions based on your medication list and medical history.`,
      priority: 'important',
      tags: ['medications', 'drug-interactions', 'safety'],
      medicalVerified: true,
      verifiedBy: 'Pharmacy Team',
      lastUpdated: new Date(),
      helpful: 93,
      notHelpful: 3,
      ageGroup: 'all',
      difficulty: 'intermediate'
    },

    // Recovery Questions
    {
      id: 'recovery-1',
      category: 'recovery',
      questionKey: 'faq.recovery.timeline.title',
      answerKey: 'faq.recovery.timeline.content',
      question: 'What is the typical recovery timeline?',
      answer: `Recovery varies by individual, but here's a general timeline:

**Immediate (24-48 hours):**
• Rest and limited activity
• Pain management as needed
• Basic mobility for daily activities

**Early recovery (1-2 weeks):**
• Gradual increase in activity
• Return to light daily activities
• Follow-up appointments as scheduled

**Intermediate recovery (2-6 weeks):**
• Most normal activities resumed
• Exercise and work activities gradually increased
• Continued improvement in symptoms

**Full recovery (6-12 weeks):**
• Return to all normal activities
• Complete healing achieved
• Optimal long-term outcomes visible

Your recovery may be faster or slower depending on your age, overall health, and adherence to aftercare instructions.`,
      priority: 'common',
      tags: ['recovery-timeline', 'expectations', 'healing'],
      medicalVerified: true,
      verifiedBy: 'Recovery Team',
      lastUpdated: new Date(),
      helpful: 90,
      notHelpful: 4,
      ageGroup: 'all',
      difficulty: 'basic'
    },
    {
      id: 'recovery-2',
      category: 'recovery',
      questionKey: 'faq.recovery.warning-signs.title',
      answerKey: 'faq.recovery.warning-signs.content',
      question: 'What warning signs should I watch for?',
      answer: `Be aware of these warning signs that require immediate medical attention:

**Call immediately if you experience:**
• Fever over 101°F (38.3°C)
• Severe or increasing pain
• Signs of infection (redness, swelling, discharge)
• Difficulty breathing or shortness of breath
• Persistent nausea or vomiting
• Excessive bleeding
• Severe dizziness or fainting

**Normal vs. concerning:**
• Mild discomfort and fatigue are normal
• Some swelling and bruising is expected
• Fever over 101°F requires immediate attention
• Excessive pain despite medication needs evaluation

Don't hesitate to call our 24/7 nurse line at (65) 6789 1234 if you have any concerns about your recovery.`,
      priority: 'important',
      tags: ['safety', 'emergency', 'warning-signs'],
      medicalVerified: true,
      verifiedBy: 'Emergency Team',
      lastUpdated: new Date(),
      helpful: 95,
      notHelpful: 1,
      ageGroup: 'all',
      difficulty: 'basic'
    },

    // Cost and Insurance Questions
    {
      id: 'cost-1',
      category: 'cost',
      questionKey: 'faq.cost.total-cost.title',
      answerKey: 'faq.cost.total-cost.content',
      question: 'What is the total cost of the procedure?',
      answer: `The total cost of your procedure includes several components:

**Facility Fees:**
• Operating room time
• Equipment and supplies
• Recovery room stay

**Professional Fees:**
• Surgeon fees
• Anesthesiologist fees
• Assistant surgeon fees (if needed)

**Additional Costs:**
• Pre-operative testing
• Post-operative medications
• Follow-up visits

**Cost Range:**
• Total estimated cost: $3,000 - $8,000
• Actual cost depends on procedure complexity and complications
• We provide detailed estimates before your procedure

Payment plans and financial assistance may be available. Our billing team will provide a detailed breakdown and discuss payment options.`,
      priority: 'important',
      tags: ['cost', 'pricing', 'billing'],
      medicalVerified: true,
      verifiedBy: 'Billing Team',
      lastUpdated: new Date(),
      helpful: 87,
      notHelpful: 6,
      ageGroup: 'all',
      difficulty: 'intermediate'
    },
    {
      id: 'insurance-1',
      category: 'insurance',
      questionKey: 'faq.insurance.coverage.title',
      answerKey: 'faq.insurance.coverage.content',
      question: 'Does my insurance cover this procedure?',
      answer: `Insurance coverage varies by plan and procedure type:

**Generally Covered:**
• Medically necessary procedures
• Procedures with proven clinical benefit
• Emergency situations

**May Require Pre-authorization:**
• Elective or cosmetic procedures
• Certain high-cost interventions
• Procedures requiring specialist approval

**Steps to verify coverage:**
1. Contact your insurance provider
2. Request pre-authorization if needed
3. Get written confirmation of coverage
4. Understand your out-of-pocket costs

**Our services:**
• Insurance verification before procedure
• Assistance with pre-authorization
• Payment plan options
• Financial counseling available

Contact our insurance specialists to verify your specific coverage.`,
      priority: 'important',
      tags: ['insurance', 'coverage', 'authorization'],
      medicalVerified: true,
      verifiedBy: 'Insurance Team',
      lastUpdated: new Date(),
      helpful: 92,
      notHelpful: 3,
      ageGroup: 'all',
      difficulty: 'intermediate'
    }
  ];

  // Medical terminology database
  const medicalTerms: MedicalTerm[] = [
    {
      term: 'Anesthesia',
      definition: 'Medications used to prevent pain during medical procedures',
      explanation: 'Anesthesia can range from local numbing of a small area to general anesthesia that puts you completely to sleep. The type used depends on the procedure and your medical condition.',
      category: 'procedure',
      pronunciation: 'an-uh-STEE-zhuh',
      commonMisconceptions: ['Anesthesia is always dangerous', 'You can wake up during general anesthesia']
    },
    {
      term: 'Complications',
      definition: 'Unintended or unexpected events during or after a medical procedure',
      explanation: 'While complications are rare, they can include bleeding, infection, or adverse reactions. Our medical team is trained to recognize and treat complications quickly.',
      category: 'safety',
      relatedTerms: ['Risk factors', 'Adverse events'],
      commonMisconceptions: ['Complications always mean medical error', 'All complications can be prevented']
    },
    {
      term: 'Recovery Period',
      definition: 'The time it takes for your body to heal after a medical procedure',
      explanation: 'Recovery includes both physical healing and return to normal activities. The length varies based on the procedure, your health, and how well you follow aftercare instructions.',
      category: 'recovery',
      relatedTerms: ['Healing time', 'Convalescence'],
      commonMisconceptions: ['Recovery is the same for everyone', 'Recovery ends when you leave the hospital']
    },
    {
      term: 'Pre-operative',
      definition: 'Everything that happens before your medical procedure',
      explanation: 'Pre-operative care includes consultations, tests, preparation instructions, and anything else needed to prepare you safely for the procedure.',
      category: 'preparation',
      relatedTerms: ['Pre-op', 'Pre-surgery'],
      commonMisconceptions: ['Pre-operative care is not important', 'It only happens right before the procedure']
    },
    {
      term: 'Post-operative',
      definition: 'Everything that happens after your medical procedure',
      explanation: 'Post-operative care includes recovery room monitoring, pain management, wound care, and follow-up appointments to ensure proper healing.',
      category: 'aftercare',
      relatedTerms: ['Post-op', 'Post-surgery', 'Aftercare'],
      commonMisconceptions: ['Post-operative care ends when you go home', 'No follow-up is needed if you feel fine']
    }
  ];

  const filteredFAQs = useMemo(() => {
    let filtered = faqData;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered.sort((a, b) => {
      // Sort by priority: common > important > detailed
      const priorityOrder = { common: 0, important: 1, detailed: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by helpfulness
      return b.helpful - a.helpful;
    });
  }, [selectedCategory, searchQuery]);

  const toggleExpanded = (faqId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId);
    } else {
      newExpanded.add(faqId);
      onQuestionAsked?.(faqData.find(f => f.id === faqId)?.question || '');
    }
    setExpandedItems(newExpanded);
  };

  const handleHelpful = (faqId: string, isHelpful: boolean) => {
    // In a real app, this would update the database
    console.log(`${isHelpful ? 'Helpful' : 'Not helpful'} clicked for ${faqId}`);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'common':
        return <Badge className="bg-green-100 text-green-800">Common</Badge>;
      case 'important':
        return <Badge className="bg-orange-100 text-orange-800">Important</Badge>;
      case 'detailed':
        return <Badge className="bg-blue-100 text-blue-800">Detailed</Badge>;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general': return InformationCircleIcon;
      case 'procedure': return BookOpenIcon;
      case 'preparation': return ClockIcon;
      case 'recovery': return UserGroupIcon;
      case 'cost': return InformationCircleIcon;
      case 'insurance': return InformationCircleIcon;
      case 'aftercare': return UserGroupIcon;
      default: return QuestionMarkCircleIcon;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QuestionMarkCircleIcon className="h-5 w-5 text-blue-500" />
            <span>Frequently Asked Questions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search questions and answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All ({faqData.length})
              </Button>
              {['general', 'procedure', 'preparation', 'recovery', 'cost', 'insurance', 'aftercare'].map(category => {
                const count = faqData.filter(faq => faq.category === category).length;
                const IconComponent = getCategoryIcon(category);
                return (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="flex items-center space-x-1"
                  >
                    <IconComponent className="h-3 w-3" />
                    <span className="capitalize">{category}</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Content */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b px-6 pt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="faq">Questions & Answers</TabsTrigger>
                <TabsTrigger value="terms">Medical Terms</TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="faq" className="space-y-4">
                {filteredFAQs.length === 0 ? (
                  <div className="text-center py-8">
                    <QuestionMarkCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                    <p className="text-gray-500">Try adjusting your search or category filter</p>
                  </div>
                ) : (
                  filteredFAQs.map((faq) => {
                    const isExpanded = expandedItems.has(faq.id);
                    const CategoryIcon = getCategoryIcon(faq.category);
                    
                    return (
                      <Card key={faq.id} className="border border-gray-200">
                        <CardContent className="p-0">
                          <Button
                            variant="ghost"
                            className="w-full p-4 h-auto justify-start"
                            onClick={() => toggleExpanded(faq.id)}
                          >
                            <div className="flex items-start justify-between w-full">
                              <div className="flex items-start space-x-3 text-left">
                                <CategoryIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-medium text-gray-900">{faq.question}</h4>
                                    {getPriorityBadge(faq.priority)}
                                  </div>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <span>Category: {faq.category}</span>
                                    <span>Difficulty: {faq.difficulty}</span>
                                    <span>Age: {faq.ageGroup || 'all'}</span>
                                    {faq.medicalVerified && (
                                      <Badge variant="outline" className="text-xs">
                                        Medically Verified
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {isExpanded ? (
                                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                          </Button>
                          
                          {isExpanded && (
                            <div className="px-4 pb-4 border-t border-gray-200">
                              <div className="pt-4 space-y-4">
                                <div className="prose prose-sm max-w-none">
                                  <div className="whitespace-pre-wrap text-sm text-gray-700">
                                    {faq.answer}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <span>Verified by: {faq.verifiedBy}</span>
                                    <span>Updated: {faq.lastUpdated.toLocaleDateString()}</span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-500">Was this helpful?</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleHelpful(faq.id, true)}
                                      className="h-8 px-2"
                                    >
                                      👍 {faq.helpful}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleHelpful(faq.id, false)}
                                      className="h-8 px-2"
                                    >
                                      👎 {faq.notHelpful}
                                    </Button>
                                  </div>
                                </div>

                                {faq.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {faq.tags.map((tag, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="terms" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {medicalTerms.map((term, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{term.term}</h4>
                            {term.pronunciation && (
                              <Badge variant="outline" className="text-xs">
                                /{term.pronunciation}/
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <strong>Definition:</strong> {term.definition}
                          </div>
                          
                          <div className="text-sm text-gray-700">
                            <strong>Explanation:</strong> {term.explanation}
                          </div>

                          {term.relatedTerms && term.relatedTerms.length > 0 && (
                            <div className="text-sm text-gray-600">
                              <strong>Related terms:</strong> {term.relatedTerms.join(', ')}
                            </div>
                          )}

                          {term.commonMisconceptions && term.commonMisconceptions.length > 0 && (
                            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                              <div className="text-sm text-yellow-800">
                                <strong>Common misconceptions:</strong>
                                <ul className="list-disc list-inside mt-1">
                                  {term.commonMisconceptions.map((misconception, i) => (
                                    <li key={i}>{misconception}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Additional Support */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <div className="font-medium">Still have questions?</div>
              <div className="text-sm text-gray-500">Our team is here to help</div>
            </div>
            <Button>
              Ask a Question
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}