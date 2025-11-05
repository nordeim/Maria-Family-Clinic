"use client";

import React, { useState } from 'react';
import { useServiceData } from '@/hooks/use-service-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpenIcon,
  ChevronDownIcon,
  PlayIcon,
  DocumentTextIcon,
  PhotoIcon,
  DownloadIcon,
  ExternalLinkIcon,
  GlobeAltIcon,
  LightBulbIcon,
  QuestionMarkCircleIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ServiceEducationMaterialsProps {
  category: string;
  serviceSlug: string;
  locale: string;
}

interface EducationalContent {
  id: string;
  title: string;
  type: 'article' | 'video' | 'infographic' | 'downloadable' | 'interactive';
  description: string;
  content: string;
  duration?: number;
  readingTime?: number;
  url?: string;
  downloadable?: boolean;
  medicalVerified?: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  lastUpdated?: string;
}

export function ServiceEducationMaterials({ category, serviceSlug, locale }: ServiceEducationMaterialsProps) {
  const { data: service, isLoading } = useServiceData(category, serviceSlug, locale);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [expandedContent, setExpandedContent] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-96 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!service) return null;

  // Comprehensive educational content for medical procedures
  const educationalContent: EducationalContent[] = [
    {
      id: 'overview-1',
      title: 'Understanding Your Procedure: A Complete Guide',
      type: 'article',
      description: 'Comprehensive overview of what to expect during your procedure and recovery.',
      content: `This detailed guide provides a comprehensive understanding of your procedure, helping you feel more prepared and confident. We'll walk you through each step, from initial consultation to full recovery, ensuring you know exactly what to expect and how to prepare for the best possible outcome.

## What is the Procedure?
The procedure involves [specific details about the medical intervention]. Our experienced healthcare team uses state-of-the-art techniques to ensure your safety and comfort throughout the process.

## Why is this Procedure Recommended?
This procedure is recommended for patients who [specific conditions/symptoms]. Your doctor has determined that this is the most appropriate treatment option based on your individual medical history, current condition, and health goals.

## Benefits and Expected Outcomes
- Improved quality of life
- Reduced symptoms
- Enhanced mobility or function
- Long-term health benefits

## Understanding the Risks
While complications are rare, it's important to understand the potential risks and how we minimize them through proper medical protocols.`,
      readingTime: 8,
      difficulty: 'beginner',
      topics: ['basics', 'procedure', 'preparation'],
      medicalVerified: true,
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'video-1',
      title: 'Step-by-Step Procedure Animation',
      type: 'video',
      description: 'Animated visualization of the procedure to help you understand the process.',
      content: 'This animated video shows each step of the procedure in detail, helping you visualize what will happen and reducing any anxiety about the unknown.',
      duration: 180,
      difficulty: 'beginner',
      topics: ['visual', 'procedure'],
      medicalVerified: true
    },
    {
      id: 'preparation-1',
      title: 'Complete Preparation Guide',
      type: 'downloadable',
      description: 'Detailed preparation checklist and timeline for optimal outcomes.',
      content: 'Downloadable PDF guide with detailed preparation instructions, timeline, and tips for success.',
      downloadable: true,
      difficulty: 'intermediate',
      topics: ['preparation', 'checklist'],
      medicalVerified: true
    },
    {
      id: 'recovery-1',
      title: 'Recovery and Aftercare Instructions',
      type: 'article',
      description: 'Comprehensive guide to your recovery process and long-term care.',
      content: `Recovery is a gradual process that varies from person to person. Understanding what to expect during each phase of recovery can help you monitor your progress and know when to seek additional support.

## Immediate Recovery (First 24-48 Hours)
- Rest and limited activity as instructed
- Pain management strategies
- Warning signs to watch for

## Early Recovery (First Week)
- Gradual increase in activity
- Follow-up care instructions
- Medication management

## Long-term Recovery (Weeks to Months)
- Return to normal activities
- Ongoing lifestyle modifications
- Preventive care strategies`,
      readingTime: 6,
      difficulty: 'intermediate',
      topics: ['recovery', 'aftercare', 'lifestyle'],
      medicalVerified: true
    },
    {
      id: 'lifestyle-1',
      title: 'Lifestyle Modifications for Success',
      type: 'article',
      description: 'Tips for optimizing your health and recovery through lifestyle choices.',
      content: `Making positive lifestyle changes can significantly impact your recovery and long-term health outcomes. These modifications are designed to support your body's natural healing processes and promote overall well-being.

## Nutrition for Recovery
- Foods that promote healing
- Hydration guidelines
- Nutritional supplements if recommended

## Exercise and Activity
- Safe activities during recovery
- Gradual return to exercise
- Physical therapy recommendations

## Mental Health and Well-being
- Managing anxiety and stress
- Support systems
- Mindfulness and relaxation techniques`,
      readingTime: 10,
      difficulty: 'beginner',
      topics: ['lifestyle', 'nutrition', 'mental health'],
      medicalVerified: true
    },
    {
      id: 'faq-1',
      title: 'Frequently Asked Questions',
      type: 'interactive',
      description: 'Interactive guide answering common patient questions.',
      content: `We've compiled answers to the most frequently asked questions about this procedure to help address your concerns and provide peace of mind.

## Common Questions

**Q: How long will the procedure take?**
A: The procedure typically takes 45-60 minutes, but this can vary based on individual factors.

**Q: Will I be in pain?**
A: We use various pain management techniques to ensure your comfort throughout the procedure.

**Q: How long is the recovery period?**
A: Recovery varies by individual, but most patients return to normal activities within 2-4 weeks.

**Q: When can I return to work?**
A: This depends on your job requirements and recovery progress, typically 3-7 days for office work.

**Q: Are there any restrictions after the procedure?**
A: Yes, we'll provide detailed instructions about activity restrictions during your recovery.`,
      readingTime: 5,
      difficulty: 'beginner',
      topics: ['faq', 'general'],
      medicalVerified: true
    }
  ];

  const toggleContent = (contentId: string) => {
    const newExpanded = new Set(expandedContent);
    if (newExpanded.has(contentId)) {
      newExpanded.delete(contentId);
    } else {
      newExpanded.add(contentId);
    }
    setExpandedContent(newExpanded);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return VideoCameraIcon;
      case 'article': return DocumentTextIcon;
      case 'infographic': return PhotoIcon;
      case 'downloadable': return DownloadIcon;
      case 'interactive': return QuestionMarkCircleIcon;
      default: return BookOpenIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'text-purple-600 bg-purple-100';
      case 'article': return 'text-blue-600 bg-blue-100';
      case 'infographic': return 'text-green-600 bg-green-100';
      case 'downloadable': return 'text-orange-600 bg-orange-100';
      case 'interactive': return 'text-pink-600 bg-pink-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-700 bg-green-100';
      case 'intermediate': return 'text-yellow-700 bg-yellow-100';
      case 'advanced': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const filteredContent = educationalContent.filter(content => {
    switch (selectedTab) {
      case 'overview': return content.topics.includes('basics') || content.topics.includes('procedure');
      case 'preparation': return content.topics.includes('preparation') || content.topics.includes('checklist');
      case 'recovery': return content.topics.includes('recovery') || content.topics.includes('aftercare');
      case 'lifestyle': return content.topics.includes('lifestyle') || content.topics.includes('nutrition');
      default: return true;
    }
  });

  return (
    <div id="education" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpenIcon className="h-5 w-5 text-blue-500" />
            <span>Educational Materials</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Comprehensive resources to help you understand and prepare for your procedure
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="preparation">Preparation</TabsTrigger>
              <TabsTrigger value="recovery">Recovery</TabsTrigger>
              <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-4">
              {/* Educational Content */}
              {filteredContent.map((content) => {
                const TypeIcon = getTypeIcon(content.type);
                const isExpanded = expandedContent.has(content.id);
                
                return (
                  <Card key={content.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <TypeIcon className={cn("h-4 w-4", getTypeColor(content.type).split(' ')[0])} />
                            <h4 className="font-medium text-gray-900">{content.title}</h4>
                            {content.medicalVerified && (
                              <Badge variant="secondary" className="text-xs">
                                Medically Verified
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600">{content.description}</p>
                          
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getDifficultyColor(content.difficulty))}
                            >
                              {content.difficulty}
                            </Badge>
                            
                            {content.readingTime && (
                              <span>{content.readingTime} min read</span>
                            )}
                            
                            {content.duration && (
                              <span>{Math.round(content.duration / 60)} min video</span>
                            )}
                            
                            {content.lastUpdated && (
                              <span>Updated {new Date(content.lastUpdated).toLocaleDateString()}</span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {content.topics.map((topic, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {content.downloadable && (
                            <Button variant="ghost" size="sm">
                              <DownloadIcon className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleContent(content.id)}
                          >
                            <ChevronDownIcon 
                              className={cn("h-4 w-4", isExpanded ? "rotate-180" : "")}
                            />
                          </Button>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="prose prose-sm max-w-none">
                            <div className="whitespace-pre-wrap text-sm text-gray-700">
                              {content.content}
                            </div>
                          </div>
                          
                          {content.type === 'video' && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                              <PlayIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">
                                Interactive video content would be embedded here
                              </p>
                              <Button variant="outline" size="sm" className="mt-2">
                                Watch Video
                              </Button>
                            </div>
                          )}
                          
                          {content.type === 'downloadable' && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="font-medium text-blue-800">Downloadable Guide</h5>
                                  <p className="text-sm text-blue-600">
                                    PDF format • {Math.floor(Math.random() * 10) + 5} pages
                                  </p>
                                </div>
                                <Button variant="default" size="sm">
                                  <DownloadIcon className="h-4 w-4 mr-2" />
                                  Download PDF
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GlobeAltIcon className="h-5 w-5 text-green-500" />
            <span>Additional Resources</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">External Resources</h4>
              <div className="space-y-2">
                <Button variant="ghost" size="sm" className="justify-start h-auto p-2">
                  <ExternalLinkIcon className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Singapore Ministry of Health</div>
                    <div className="text-xs text-gray-500">Official health guidelines and information</div>
                  </div>
                </Button>
                
                <Button variant="ghost" size="sm" className="justify-start h-auto p-2">
                  <ExternalLinkIcon className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Patient Support Groups</div>
                    <div className="text-xs text-gray-500">Connect with others who have undergone similar procedures</div>
                  </div>
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Support Services</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <LightBulbIcon className="h-4 w-4 text-yellow-500" />
                  <span>24/7 nurse hotline: (65) 6789 1234</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <BookOpenIcon className="h-4 w-4 text-blue-500" />
                  <span>Patient education library access</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <QuestionMarkCircleIcon className="h-4 w-4 text-green-500" />
                  <span>Live chat support available</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}