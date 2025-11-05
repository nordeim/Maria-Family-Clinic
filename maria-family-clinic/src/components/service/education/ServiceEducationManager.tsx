"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  DownloadIcon,
  QuestionMarkCircleIcon,
  VideoCameraIcon,
  UserGroupIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface EducationalContent {
  id: string;
  title: string;
  type: 'article' | 'video' | 'infographic' | 'checklist' | 'interactive' | 'virtual-walkthrough';
  category: 'overview' | 'preparation' | 'procedure' | 'recovery' | 'aftercare' | 'faq' | 'lifestyle';
  titleKey: string; // For translations
  contentKey: string; // For translations
  medicalAccuracy: 'verified' | 'review-pending' | 'needs-verification';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readTime?: number;
  duration?: number; // For videos
  languages: ('en' | 'zh' | 'ms' | 'ta')[];
  required: boolean;
  completed: boolean;
  lastUpdated: Date;
  verifiedBy?: string;
  tags: string[];
  successMetrics?: {
    comprehensionScore?: number;
    completionRate?: number;
    patientSatisfaction?: number;
  };
}

interface ServiceEducationManagerProps {
  serviceId: string;
  serviceName: string;
  category: string;
  patientId?: string;
  locale: string;
  onProgressUpdate?: (progress: EducationProgress) => void;
}

interface EducationProgress {
  totalSteps: number;
  completedSteps: number;
  currentStep: string;
  overallProgress: number;
  sectionProgress: {
    overview: number;
    preparation: number;
    procedure: number;
    recovery: number;
    aftercare: number;
  };
  timeSpent: number; // in minutes
  lastAccessed: Date;
  isComplete: boolean;
}

export function ServiceEducationManager({
  serviceId,
  serviceName,
  category,
  patientId,
  locale = 'en',
  onProgressUpdate
}: ServiceEducationManagerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [educationProgress, setEducationProgress] = useState<EducationProgress>({
    totalSteps: 0,
    completedSteps: 0,
    currentStep: 'overview',
    overallProgress: 0,
    sectionProgress: {
      overview: 0,
      preparation: 0,
      procedure: 0,
      recovery: 0,
      aftercare: 0
    },
    timeSpent: 0,
    lastAccessed: new Date(),
    isComplete: false
  });

  const [selectedLanguage, setSelectedLanguage] = useState(locale);
  const [viewedContent, setViewedContent] = useState<Set<string>>(new Set());

  // Comprehensive educational content database
  const educationalContent: EducationalContent[] = [
    // Overview Content
    {
      id: 'overview-intro',
      title: 'Understanding Your Procedure',
      type: 'article',
      category: 'overview',
      titleKey: 'education.overview.intro.title',
      contentKey: 'education.overview.intro.content',
      medicalAccuracy: 'verified',
      difficulty: 'beginner',
      readTime: 8,
      languages: ['en', 'zh', 'ms', 'ta'],
      required: true,
      completed: false,
      lastUpdated: new Date(),
      verifiedBy: 'Dr. Sarah Chen, MD',
      tags: ['basics', 'introduction', 'procedure-overview'],
      successMetrics: { comprehensionScore: 92, completionRate: 89 }
    },
    {
      id: 'overview-video',
      title: 'Procedure Overview Video',
      type: 'video',
      category: 'overview',
      titleKey: 'education.overview.video.title',
      contentKey: 'education.overview.video.content',
      medicalAccuracy: 'verified',
      difficulty: 'beginner',
      duration: 180,
      languages: ['en', 'zh', 'ms'],
      required: true,
      completed: false,
      lastUpdated: new Date(),
      verifiedBy: 'Medical Animation Team',
      tags: ['visual', 'animation', 'overview'],
      successMetrics: { completionRate: 94, patientSatisfaction: 4.8 }
    },
    {
      id: 'overview-walkthrough',
      title: 'Virtual Facility Tour',
      type: 'virtual-walkthrough',
      category: 'overview',
      titleKey: 'education.overview.walkthrough.title',
      contentKey: 'education.overview.walkthrough.content',
      medicalAccuracy: 'verified',
      difficulty: 'beginner',
      duration: 300,
      languages: ['en', 'zh'],
      required: false,
      completed: false,
      lastUpdated: new Date(),
      tags: ['virtual-tour', 'facility', 'familiarization']
    },

    // Preparation Content
    {
      id: 'prep-checklist',
      title: 'Complete Preparation Checklist',
      type: 'checklist',
      category: 'preparation',
      titleKey: 'education.preparation.checklist.title',
      contentKey: 'education.preparation.checklist.content',
      medicalAccuracy: 'verified',
      difficulty: 'intermediate',
      readTime: 12,
      languages: ['en', 'zh', 'ms', 'ta'],
      required: true,
      completed: false,
      lastUpdated: new Date(),
      verifiedBy: 'Nursing Team',
      tags: ['checklist', 'preparation', 'timeline'],
      successMetrics: { completionRate: 96, patientSatisfaction: 4.9 }
    },
    {
      id: 'prep-diet',
      title: 'Dietary Restrictions and Guidelines',
      type: 'article',
      category: 'preparation',
      titleKey: 'education.preparation.diet.title',
      contentKey: 'education.preparation.diet.content',
      medicalAccuracy: 'verified',
      difficulty: 'intermediate',
      readTime: 6,
      languages: ['en', 'zh', 'ms', 'ta'],
      required: true,
      completed: false,
      lastUpdated: new Date(),
      verifiedBy: 'Nutritionist Team',
      tags: ['diet', 'nutrition', 'restrictions'],
      successMetrics: { comprehensionScore: 88 }
    },
    {
      id: 'prep-medication',
      title: 'Medication Management Guide',
      type: 'article',
      category: 'preparation',
      titleKey: 'education.preparation.medication.title',
      contentKey: 'education.preparation.medication.content',
      medicalAccuracy: 'verified',
      difficulty: 'advanced',
      readTime: 10,
      languages: ['en', 'zh', 'ms'],
      required: true,
      completed: false,
      lastUpdated: new Date(),
      verifiedBy: 'Pharmacy Team',
      tags: ['medication', 'drug-interactions', 'timing']
    },

    // Procedure Content
    {
      id: 'proc-anatomy',
      title: 'Procedure Anatomy Visualization',
      type: 'infographic',
      category: 'procedure',
      titleKey: 'education.procedure.anatomy.title',
      contentKey: 'education.procedure.anatomy.content',
      medicalAccuracy: 'verified',
      difficulty: 'intermediate',
      readTime: 5,
      languages: ['en', 'zh', 'ms'],
      required: false,
      completed: false,
      lastUpdated: new Date(),
      verifiedBy: 'Anatomy Team',
      tags: ['anatomy', 'visualization', 'medical-diagram']
    },
    {
      id: 'proc-steps',
      title: 'Step-by-Step Procedure Walkthrough',
      type: 'interactive',
      category: 'procedure',
      titleKey: 'education.procedure.steps.title',
      contentKey: 'education.procedure.steps.content',
      medicalAccuracy: 'verified',
      difficulty: 'intermediate',
      duration: 480,
      languages: ['en', 'zh'],
      required: true,
      completed: false,
      lastUpdated: new Date(),
      verifiedBy: 'Dr. Michael Lim',
      tags: ['interactive', 'steps', 'detailed-procedure'],
      successMetrics: { completionRate: 91, patientSatisfaction: 4.7 }
    },

    // Recovery Content
    {
      id: 'recovery-timeline',
      title: 'Recovery Timeline and Milestones',
      type: 'article',
      category: 'recovery',
      titleKey: 'education.recovery.timeline.title',
      contentKey: 'education.recovery.timeline.content',
      medicalAccuracy: 'verified',
      difficulty: 'beginner',
      readTime: 8,
      languages: ['en', 'zh', 'ms', 'ta'],
      required: true,
      completed: false,
      lastUpdated: new Date(),
      verifiedBy: 'Recovery Team',
      tags: ['recovery', 'timeline', 'milestones'],
      successMetrics: { comprehensionScore: 90 }
    },
    {
      id: 'recovery-warning',
      title: 'Warning Signs and Emergency Protocols',
      type: 'article',
      category: 'recovery',
      titleKey: 'education.recovery.warning.title',
      contentKey: 'education.recovery.warning.content',
      medicalAccuracy: 'verified',
      difficulty: 'intermediate',
      readTime: 7,
      languages: ['en', 'zh', 'ms', 'ta'],
      required: true,
      completed: false,
      lastUpdated: new Date(),
      verifiedBy: 'Emergency Team',
      tags: ['emergency', 'warning-signs', 'safety'],
      successMetrics: { comprehensionScore: 95 }
    },

    // Aftercare Content
    {
      id: 'aftercare-instructions',
      title: 'Detailed Aftercare Instructions',
      type: 'checklist',
      category: 'aftercare',
      titleKey: 'education.aftercare.instructions.title',
      contentKey: 'education.aftercare.instructions.content',
      medicalAccuracy: 'verified',
      difficulty: 'intermediate',
      readTime: 15,
      languages: ['en', 'zh', 'ms', 'ta'],
      required: true,
      completed: false,
      lastUpdated: new Date(),
      verifiedBy: 'Aftercare Team',
      tags: ['aftercare', 'home-care', 'instructions'],
      successMetrics: { completionRate: 93 }
    },
    {
      id: 'aftercare-lifestyle',
      title: 'Lifestyle Modifications for Success',
      type: 'article',
      category: 'aftercare',
      titleKey: 'education.aftercare.lifestyle.title',
      contentKey: 'education.aftercare.lifestyle.content',
      medicalAccuracy: 'verified',
      difficulty: 'intermediate',
      readTime: 10,
      languages: ['en', 'zh', 'ms'],
      required: false,
      completed: false,
      lastUpdated: new Date(),
      verifiedBy: 'Lifestyle Medicine Team',
      tags: ['lifestyle', 'long-term-care', 'health'],
      successMetrics: { patientSatisfaction: 4.6 }
    },

    // FAQ Content
    {
      id: 'faq-common',
      title: 'Frequently Asked Questions',
      type: 'interactive',
      category: 'faq',
      titleKey: 'education.faq.common.title',
      contentKey: 'education.faq.common.content',
      medicalAccuracy: 'verified',
      difficulty: 'beginner',
      readTime: 8,
      languages: ['en', 'zh', 'ms', 'ta'],
      required: false,
      completed: false,
      lastUpdated: new Date(),
      verifiedBy: 'Patient Education Team',
      tags: ['faq', 'common-questions', 'general']
    },
    {
      id: 'faq-detailed',
      title: 'Detailed Q&A Session',
      type: 'video',
      category: 'faq',
      titleKey: 'education.faq.detailed.title',
      contentKey: 'education.faq.detailed.content',
      medicalAccuracy: 'verified',
      difficulty: 'intermediate',
      duration: 900,
      languages: ['en', 'zh'],
      required: false,
      completed: false,
      lastUpdated: new Date(),
      verifiedBy: 'Dr. Sarah Chen & Dr. Michael Lim',
      tags: ['video-qa', 'expert-answers', 'detailed']
    }
  ];

  const filterContentByCategory = (category: string) => {
    return educationalContent.filter(content => 
      content.category === category && 
      content.languages.includes(selectedLanguage as any)
    );
  };

  const markContentAsViewed = (contentId: string) => {
    const newViewedContent = new Set(viewedContent);
    newViewedContent.add(contentId);
    setViewedContent(newViewedContent);
    
    // Update progress
    updateProgress();
  };

  const updateProgress = () => {
    const requiredContent = educationalContent.filter(content => content.required);
    const completedRequired = requiredContent.filter(content => 
      viewedContent.has(content.id) || content.completed
    );

    const sectionProgress = {
      overview: calculateSectionProgress('overview'),
      preparation: calculateSectionProgress('preparation'),
      procedure: calculateSectionProgress('procedure'),
      recovery: calculateSectionProgress('recovery'),
      aftercare: calculateSectionProgress('aftercare')
    };

    const newProgress: EducationProgress = {
      totalSteps: requiredContent.length,
      completedSteps: completedRequired.length,
      currentStep: activeTab,
      overallProgress: (completedRequired.length / requiredContent.length) * 100,
      sectionProgress,
      timeSpent: educationProgress.timeSpent + 1,
      lastAccessed: new Date(),
      isComplete: completedRequired.length === requiredContent.length
    };

    setEducationProgress(newProgress);
    onProgressUpdate?.(newProgress);
  };

  const calculateSectionProgress = (category: string): number => {
    const sectionContent = educationalContent.filter(content => 
      content.category === category && content.required
    );
    const completedSectionContent = sectionContent.filter(content => 
      viewedContent.has(content.id) || content.completed
    );
    
    return sectionContent.length > 0 ? 
      (completedSectionContent.length / sectionContent.length) * 100 : 0;
  };

  const getTotalEstimatedTime = (): number => {
    return educationalContent
      .filter(content => content.required)
      .reduce((total, content) => {
        return total + (content.readTime || 0) + (content.duration ? Math.round(content.duration / 60) : 0);
      }, 0);
  };

  const getCompletedTime = (): number => {
    return Array.from(viewedContent)
      .map(id => educationalContent.find(c => c.id === id))
      .filter(Boolean)
      .reduce((total, content) => {
        return total + (content?.readTime || 0) + (content?.duration ? Math.round(content?.duration! / 60) : 0);
      }, 0);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return VideoCameraIcon;
      case 'article': return DocumentTextIcon;
      case 'infographic': return DocumentTextIcon;
      case 'checklist': return CheckCircleIcon;
      case 'interactive': return PlayIcon;
      case 'virtual-walkthrough': return UserGroupIcon;
      default: return BookOpenIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'text-purple-600 bg-purple-100';
      case 'article': return 'text-blue-600 bg-blue-100';
      case 'infographic': return 'text-green-600 bg-green-100';
      case 'checklist': return 'text-orange-600 bg-orange-100';
      case 'interactive': return 'text-pink-600 bg-pink-100';
      case 'virtual-walkthrough': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAccuracyBadge = (accuracy: string) => {
    switch (accuracy) {
      case 'verified':
        return <Badge className="text-xs bg-green-100 text-green-800">Medically Verified</Badge>;
      case 'review-pending':
        return <Badge className="text-xs bg-yellow-100 text-yellow-800">Under Review</Badge>;
      case 'needs-verification':
        return <Badge className="text-xs bg-red-100 text-red-800">Needs Review</Badge>;
      default:
        return null;
    }
  };

  const renderContentCard = (content: EducationalContent) => {
    const TypeIcon = getTypeIcon(content.type);
    const isViewed = viewedContent.has(content.id);
    
    return (
      <Card key={content.id} className={cn(
        "transition-all duration-200",
        isViewed && "border-green-200 bg-green-50/30",
        content.required && "ring-1 ring-blue-200"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex items-center space-x-2">
                <TypeIcon className={cn("h-5 w-5", getTypeColor(content.type).split(' ')[0])} />
                <h4 className="font-medium text-gray-900">{content.title}</h4>
                {getAccuracyBadge(content.medicalAccuracy)}
                {content.required && (
                  <Badge variant="outline" className="text-xs">Required</Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={cn(
                  "text-xs",
                  content.difficulty === 'beginner' && "bg-green-100 text-green-800",
                  content.difficulty === 'intermediate' && "bg-yellow-100 text-yellow-800",
                  content.difficulty === 'advanced' && "bg-red-100 text-red-800"
                )}>
                  {content.difficulty}
                </Badge>
                
                {content.readTime && (
                  <Badge variant="outline" className="text-xs">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    {content.readTime} min read
                  </Badge>
                )}
                
                {content.duration && (
                  <Badge variant="outline" className="text-xs">
                    <PlayIcon className="h-3 w-3 mr-1" />
                    {Math.round(content.duration / 60)} min
                  </Badge>
                )}

                <Badge variant="outline" className="text-xs">
                  <GlobeAltIcon className="h-3 w-3 mr-1" />
                  {selectedLanguage.toUpperCase()}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1">
                {content.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {content.verifiedBy && (
                <div className="text-xs text-gray-500">
                  Verified by: {content.verifiedBy}
                </div>
              )}

              {content.successMetrics && (
                <div className="text-xs text-gray-500">
                  Completion Rate: {content.successMetrics.completionRate}% | 
                  Satisfaction: {content.successMetrics.patientSatisfaction}/5
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-4">
              {isViewed && (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              )}
              
              <Button
                size="sm"
                variant={isViewed ? "outline" : "default"}
                onClick={() => markContentAsViewed(content.id)}
              >
                {isViewed ? 'Review' : 'Start'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpenIcon className="h-5 w-5 text-blue-500" />
              <span>Patient Education: {serviceName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="en">English</option>
                <option value="zh">中文</option>
                <option value="ms">Bahasa Melayu</option>
                <option value="ta">தமிழ்</option>
              </select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(educationProgress.overallProgress)}% Complete</span>
            </div>
            <Progress value={educationProgress.overallProgress} className="w-full" />
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              {Object.entries(educationProgress.sectionProgress).map(([section, progress]) => (
                <div key={section} className="space-y-2">
                  <div className="text-xs font-medium capitalize">{section}</div>
                  <Progress value={progress} className="w-full h-2" />
                  <div className="text-xs text-gray-500">{Math.round(progress)}%</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Time Spent: {getCompletedTime()} / {getTotalEstimatedTime()} minutes</span>
              <span>Last Accessed: {educationProgress.lastAccessed.toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b px-6 pt-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="preparation">Preparation</TabsTrigger>
                <TabsTrigger value="procedure">Procedure</TabsTrigger>
                <TabsTrigger value="recovery">Recovery</TabsTrigger>
                <TabsTrigger value="aftercare">Aftercare</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="overview" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Procedure Overview</h3>
                  <div className="text-sm text-gray-500">
                    {filterContentByCategory('overview').length} resources available
                  </div>
                </div>
                <div className="space-y-4">
                  {filterContentByCategory('overview').map(renderContentCard)}
                </div>
              </TabsContent>

              <TabsContent value="preparation" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Preparation Guidelines</h3>
                  <div className="text-sm text-gray-500">
                    {filterContentByCategory('preparation').length} resources available
                  </div>
                </div>
                <div className="space-y-4">
                  {filterContentByCategory('preparation').map(renderContentCard)}
                </div>
              </TabsContent>

              <TabsContent value="procedure" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Procedure Details</h3>
                  <div className="text-sm text-gray-500">
                    {filterContentByCategory('procedure').length} resources available
                  </div>
                </div>
                <div className="space-y-4">
                  {filterContentByCategory('procedure').map(renderContentCard)}
                </div>
              </TabsContent>

              <TabsContent value="recovery" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Recovery Process</h3>
                  <div className="text-sm text-gray-500">
                    {filterContentByCategory('recovery').length} resources available
                  </div>
                </div>
                <div className="space-y-4">
                  {filterContentByCategory('recovery').map(renderContentCard)}
                </div>
              </TabsContent>

              <TabsContent value="aftercare" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Aftercare Instructions</h3>
                  <div className="text-sm text-gray-500">
                    {filterContentByCategory('aftercare').length} resources available
                  </div>
                </div>
                <div className="space-y-4">
                  {filterContentByCategory('aftercare').map(renderContentCard)}
                </div>
              </TabsContent>

              <TabsContent value="faq" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Frequently Asked Questions</h3>
                  <div className="text-sm text-gray-500">
                    {filterContentByCategory('faq').length} resources available
                  </div>
                </div>
                <div className="space-y-4">
                  {filterContentByCategory('faq').map(renderContentCard)}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Support Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PhoneIcon className="h-5 w-5 text-green-500" />
            <span>Need Help?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <ChatBubbleLeftRightIcon className="h-5 w-5 mr-3 text-blue-500" />
              <div className="text-left">
                <div className="font-medium">Live Chat Support</div>
                <div className="text-sm text-gray-500">Get instant answers</div>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <PhoneIcon className="h-5 w-5 mr-3 text-green-500" />
              <div className="text-left">
                <div className="font-medium">24/7 Nurse Hotline</div>
                <div className="text-sm text-gray-500">(65) 6789 1234</div>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <DownloadIcon className="h-5 w-5 mr-3 text-orange-500" />
              <div className="text-left">
                <div className="font-medium">Download All Guides</div>
                <div className="text-sm text-gray-500">PDF package</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}