// Healthier SG Success Stories Component
// Interactive testimonial carousel with detailed success stories

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ChevronLeft, 
  ChevronRight, 
  Quote,
  TrendingUp,
  Heart,
  Shield,
  Clock,
  Award,
  Play,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  ArrowRight,
  Star
} from 'lucide-react'
import { SuccessStory, ProgramInfoComponentProps } from './types'

// Mock success stories data
const mockSuccessStories: SuccessStory[] = [
  {
    id: 'story-001',
    title: 'From Diabetes Diagnosis to Health Transformation',
    subtitle: 'How Healthier SG helped Lim Ah Lian manage her diabetes and reclaim her life',
    story: {
      before: {
        healthConditions: ['Type 2 Diabetes', 'High Blood Pressure'],
        challenges: ['Difficulty managing blood sugar levels', 'Frequent fatigue', 'Weight gain', 'Limited energy for daily activities'],
        goals: ['Control diabetes naturally', 'Lose weight safely', 'Increase energy levels', 'Avoid medication if possible']
      },
      journey: [
        {
          phase: 'Initial Assessment',
          description: 'Comprehensive health screening revealed elevated HbA1c levels and blood pressure concerns',
          duration: 'Week 1',
          outcomes: ['Identified diabetes risk', 'Established baseline health metrics', 'Created personalized care plan']
        },
        {
          phase: 'Lifestyle Changes',
          description: 'Started working with a health coach to modify diet and exercise routine',
          duration: 'Months 1-3',
          outcomes: ['Adopted Mediterranean diet', 'Started walking program', 'Learned stress management']
        },
        {
          phase: 'Progress Monitoring',
          description: 'Regular check-ins with family doctor and health coaching sessions',
          duration: 'Months 3-6',
          outcomes: ['HbA1c levels improved', 'Blood pressure normalized', 'Weight loss of 8kg achieved']
        },
        {
          phase: 'Long-term Success',
          description: 'Maintained healthy lifestyle with ongoing support and monitoring',
          duration: 'Months 6+',
          outcomes: ['Diabetes in remission', 'Sustained weight loss', 'Improved quality of life']
        }
      ],
      after: {
        improvements: ['HbA1c reduced from 8.2% to 6.1%', 'Weight loss of 12kg', 'Blood pressure normalized', 'Increased energy and stamina'],
        achievements: ['No longer requires diabetes medication', 'Able to participate in family activities', 'Reduced healthcare costs by 70%'],
        newGoals: ['Maintain current health status', 'Support family members in health journey', 'Continue preventive care']
      }
    },
    participant: {
      name: 'Lim Ah Lian',
      age: 58,
      gender: 'F',
      occupation: 'Retired Teacher',
      location: 'Tampines, Singapore',
      image: '/images/success-stories/lal.jpg',
      anonymized: false
    },
    programDetails: {
      enrollmentDate: new Date('2024-03-15'),
      clinic: 'Tampines Family Clinic',
      doctor: 'Dr. Sarah Tan',
      duration: '12 months',
      milestones: [
        { date: new Date('2024-04-01'), description: 'First health plan created', measurableOutcome: 'BMI: 28.5' },
        { date: new Date('2024-06-01'), description: 'HbA1c improvement', measurableOutcome: 'HbA1c: 7.2%' },
        { date: new Date('2024-09-01'), description: 'Weight loss milestone', measurableOutcome: 'BMI: 24.8' },
        { date: new Date('2025-03-01'), description: 'Diabetes remission achieved', measurableOutcome: 'HbA1c: 6.1%' }
      ]
    },
    metrics: [
      { metric: 'HbA1c Level', before: '8.2%', after: '6.1%', improvement: '25.6% better', unit: '%' },
      { metric: 'Weight', before: '72kg', after: '60kg', improvement: '16.7% reduction', unit: 'kg' },
      { metric: 'BMI', before: '28.5', after: '23.8', improvement: '16.5% reduction', unit: '' },
      { metric: 'Blood Pressure', before: '150/95', after: '125/80', improvement: 'Normal range achieved', unit: 'mmHg' }
    ],
    media: [
      {
        type: 'VIDEO',
        url: '/videos/success-stories/lal-transformation.mp4',
        caption: 'Lim Ah Lian shares her Healthier SG journey',
        consent: true
      },
      {
        type: 'IMAGE',
        url: '/images/success-stories/lal-before-after.jpg',
        caption: 'Before and after photos showing transformation',
        consent: true
      }
    ],
    isPublished: true,
    consentDate: new Date('2025-01-15'),
    lastUpdated: new Date('2025-03-01')
  },
  {
    id: 'story-002',
    title: 'Managing High Blood Pressure in a Busy Career',
    subtitle: 'Raj Kumar\'s journey to better cardiovascular health while balancing work and family',
    story: {
      before: {
        healthConditions: ['Hypertension', 'High Cholesterol'],
        challenges: ['Stress from demanding job', 'Irregular eating patterns', 'No exercise routine', 'Family history of heart disease'],
        goals: ['Lower blood pressure naturally', 'Manage stress effectively', 'Improve cholesterol levels', 'Prevent heart disease']
      },
      journey: [
        {
          phase: 'Health Assessment',
          description: 'Comprehensive screening revealed cardiovascular risk factors',
          duration: 'Week 1',
          outcomes: ['Identified hypertension risk', 'Measured cholesterol levels', 'Stress level assessment completed']
        },
        {
          phase: 'Work-Life Balance',
          description: 'Implemented stress management techniques and exercise routine',
          duration: 'Months 1-2',
          outcomes: ['Started meditation practice', 'Joined company fitness program', 'Improved sleep quality']
        },
        {
          phase: 'Dietary Changes',
          description: 'Worked with nutritionist to modify eating habits',
          duration: 'Months 2-4',
          outcomes: ['Reduced sodium intake', 'Increased fiber consumption', 'Regular meal timing']
        },
        {
          phase: 'Cardiovascular Improvement',
          description: 'Continued monitoring and lifestyle adjustments',
          duration: 'Months 4-6',
          outcomes: ['Blood pressure normalized', 'Cholesterol levels improved', 'Stress levels reduced']
        }
      ],
      after: {
        improvements: ['Blood pressure: 150/95 to 125/80', 'Total cholesterol reduced by 40%', 'Stress levels significantly lower', 'Better work-life balance'],
        achievements: ['Off blood pressure medication', 'Improved career performance', 'More active with family', 'Reduced sick days'],
        newGoals: ['Maintain cardiovascular health', 'Mentor colleagues on health', 'Complete marathon']
      }
    },
    participant: {
      name: 'Raj Kumar',
      age: 42,
      gender: 'M',
      occupation: 'IT Professional',
      location: 'Jurong, Singapore',
      image: '/images/success-stories/rk.jpg',
      anonymized: false
    },
    programDetails: {
      enrollmentDate: new Date('2024-05-10'),
      clinic: 'Jurong Health Centre',
      doctor: 'Dr. Michael Chen',
      duration: '10 months',
      milestones: [
        { date: new Date('2024-06-01'), description: 'Exercise routine established', measurableOutcome: '3x weekly gym sessions' },
        { date: new Date('2024-08-01'), description: 'Blood pressure improvement', measurableOutcome: '140/85 mmHg' },
        { date: new Date('2024-11-01'), description: 'Medication reduced', measurableOutcome: '50% dose reduction' },
        { date: new Date('2025-03-01'), description: 'Target achieved', measurableOutcome: '125/80 mmHg' }
      ]
    },
    metrics: [
      { metric: 'Systolic BP', before: '150', after: '125', improvement: '16.7% reduction', unit: 'mmHg' },
      { metric: 'Diastolic BP', before: '95', after: '80', improvement: '15.8% reduction', unit: 'mmHg' },
      { metric: 'Total Cholesterol', before: '6.8', after: '4.1', improvement: '39.7% reduction', unit: 'mmol/L' },
      { metric: 'Stress Score', before: '8/10', after: '3/10', improvement: '62.5% reduction', unit: '/10' }
    ],
    media: [
      {
        type: 'AUDIO',
        url: '/audio/success-stories/rk-interview.mp3',
        caption: 'Raj discusses his approach to managing stress',
        consent: true
      }
    ],
    isPublished: true,
    consentDate: new Date('2025-02-20'),
    lastUpdated: new Date('2025-03-15')
  },
  {
    id: 'story-003',
    title: 'Senior\'s Journey to Healthy Aging',
    subtitle: 'How Mrs. Wong maintained independence and vitality through preventive care',
    story: {
      before: {
        healthConditions: ['Pre-diabetes', 'Arthritis', 'Osteoporosis risk'],
        challenges: ['Fear of falling', 'Limited mobility', 'Nutritional concerns', 'Social isolation'],
        goals: ['Prevent diabetes development', 'Maintain bone health', 'Stay independent', 'Stay socially active']
      },
      journey: [
        {
          phase: 'Comprehensive Assessment',
          description: 'Detailed health evaluation for seniors focusing on preventive care',
          duration: 'Week 1-2',
          outcomes: ['Bone density scan completed', 'Diabetes risk assessment', 'Functional mobility evaluation']
        },
        {
          phase: 'Mobility Improvement',
          description: 'Started gentle exercise program and physiotherapy',
          duration: 'Months 1-3',
          outcomes: ['Joint mobility improved', 'Balance exercises implemented', 'Fall prevention strategies']
        },
        {
          phase: 'Nutritional Support',
          description: 'Worked with dietitian for senior-specific nutrition needs',
          duration: 'Months 3-6',
          outcomes: ['Increased calcium intake', 'Protein optimization', 'Vitamin D supplementation']
        },
        {
          phase: 'Social Integration',
          description: 'Joined senior health programs and social activities',
          duration: 'Months 6+',
          outcomes: ['Community engagement', 'Peer support network', 'Continued learning']
        }
      ],
      after: {
        improvements: ['Bone density stabilized', 'Mobility significantly improved', 'Blood sugar normal', 'Social connections strengthened'],
        achievements: ['Remains fully independent', 'Active in community groups', 'Helps care for grandchildren', 'Reduced healthcare needs'],
        newGoals: ['Continue current health practices', 'Volunteer at community center', 'Pass on healthy habits to family']
      }
    },
    participant: {
      name: 'Mrs. Wong Mei Ling',
      age: 71,
      gender: 'F',
      occupation: 'Retired Nurse',
      location: 'Toa Payoh, Singapore',
      image: '/images/success-stories/mrs-wong.jpg',
      anonymized: false
    },
    programDetails: {
      enrollmentDate: new Date('2024-02-20'),
      clinic: 'Toa Payoh Polyclinic',
      doctor: 'Dr. Jennifer Lee',
      duration: '14 months',
      milestones: [
        { date: new Date('2024-03-01'), description: 'Bone density scan', measurableOutcome: 'T-score: -1.8' },
        { date: new Date('2024-06-01'), description: 'Exercise program established', measurableOutcome: '30min daily walking' },
        { date: new Date('2024-09-01'), description: 'Nutrition optimization', measurableOutcome: 'Calcium: 1200mg/day' },
        { date: new Date('2025-04-01'), description: 'Goals achieved', measurableOutcome: 'Independent living, T-score: -1.5' }
      ]
    },
    metrics: [
      { metric: 'Bone Density T-score', before: '-2.1', after: '-1.5', improvement: '28.6% improvement', unit: '' },
      { metric: 'HbA1c Level', before: '6.1%', after: '5.6%', improvement: '8.2% improvement', unit: '%' },
      { metric: 'Physical Function', before: '65%', after: '88%', improvement: '35.4% improvement', unit: 'capacity' },
      { metric: 'Fall Risk', before: 'Moderate', after: 'Low', improvement: 'Risk significantly reduced', unit: '' }
    ],
    media: [
      {
        type: 'IMAGE',
        url: '/images/success-stories/mrs-wong-community.jpg',
        caption: 'Mrs. Wong leading a senior health group',
        consent: true
      }
    ],
    isPublished: true,
    consentDate: new Date('2025-04-10'),
    lastUpdated: new Date('2025-04-15')
  }
]

export const SuccessStories: React.FC<ProgramInfoComponentProps> = ({
  className = '',
  language = 'en',
  userType = 'citizen',
  isMobile = false,
  showGovernmentDisclaimer = true,
  enableAnalytics = true
}) => {
  const [stories, setStories] = useState<SuccessStory[]>([])
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('stories')
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const loadStories = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      setStories(mockSuccessStories)
      setSelectedStory(mockSuccessStories[0])
      setLoading(false)
    }
    loadStories()
  }, [])

  const nextStory = () => {
    const nextIndex = (currentStoryIndex + 1) % stories.length
    setCurrentStoryIndex(nextIndex)
    setSelectedStory(stories[nextIndex])
  }

  const previousStory = () => {
    const prevIndex = currentStoryIndex === 0 ? stories.length - 1 : currentStoryIndex - 1
    setCurrentStoryIndex(prevIndex)
    setSelectedStory(stories[prevIndex])
  }

  const selectStory = (index: number) => {
    setCurrentStoryIndex(index)
    setSelectedStory(stories[index])
  }

  const getHealthConditionIcon = (condition: string) => {
    const conditionIcons = {
      'Diabetes': <Heart className="h-4 w-4" />,
      'Hypertension': <TrendingUp className="h-4 w-4" />,
      'Pre-diabetes': <Heart className="h-4 w-4" />,
      'Arthritis': <Shield className="h-4 w-4" />,
      'Osteoporosis risk': <Shield className="h-4 w-4" />
    }
    return conditionIcons[condition as keyof typeof conditionIcons] || <Heart className="h-4 w-4" />
  }

  const getMetricImprovement = (metric: any) => {
    if (metric.improvement.includes('%')) {
      const percentage = parseFloat(metric.improvement.split('%')[0])
      const isGood = percentage > 0
      return (
        <div className={`flex items-center ${isGood ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className={`h-4 w-4 mr-1 ${!isGood ? 'rotate-180' : ''}`} />
          {metric.improvement}
        </div>
      )
    }
    return <div className="text-green-600 font-medium">{metric.improvement}</div>
  }

  if (loading) {
    return (
      <div className={`container mx-auto p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Success Stories</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Real stories from Singaporeans who transformed their health with Healthier SG. 
            See how preventive care and personalized health plans can make a real difference.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="stories">Story Showcase</TabsTrigger>
            <TabsTrigger value="analytics">Impact Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="stories" className="mt-8">
            {/* Featured Story Carousel */}
            {selectedStory && (
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{selectedStory.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={previousStory}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-gray-500">
                        {currentStoryIndex + 1} of {stories.length}
                      </span>
                      <Button variant="outline" size="sm" onClick={nextStory}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Story Content */}
                    <div className="space-y-6">
                      {/* Participant Info */}
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={selectedStory.participant.image} />
                          <AvatarFallback>
                            {selectedStory.participant.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold">{selectedStory.participant.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Age {selectedStory.participant.age}</span>
                            <span>•</span>
                            <span>{selectedStory.participant.occupation}</span>
                            <span>•</span>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {selectedStory.participant.location}
                            </div>
                          </div>
                          <div className="mt-2">
                            <Badge variant="secondary">
                              <Calendar className="h-3 w-3 mr-1" />
                              {selectedStory.programDetails.duration} program
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Story Journey */}
                      <div>
                        <h4 className="font-semibold mb-4 flex items-center">
                          <Quote className="h-5 w-5 mr-2" />
                          Health Journey
                        </h4>
                        <div className="space-y-4">
                          {selectedStory.story.journey.map((phase, index) => (
                            <div key={index} className="border-l-2 border-blue-200 pl-4 pb-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium">{phase.phase}</h5>
                                <Badge variant="outline" className="text-xs">
                                  {phase.duration}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{phase.description}</p>
                              <ul className="text-xs text-gray-600 space-y-1">
                                {phase.outcomes.map((outcome, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <CheckCircle2 className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    {outcome}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Results */}
                      <div>
                        <h4 className="font-semibold mb-4 flex items-center">
                          <Award className="h-5 w-5 mr-2" />
                          Achievements & Results
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-green-800 mb-2">Health Improvements</h5>
                            <ul className="text-sm space-y-1">
                              {selectedStory.story.after.improvements.map((improvement, index) => (
                                <li key={index} className="flex items-start">
                                  <TrendingUp className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                  {improvement}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-blue-800 mb-2">Key Achievements</h5>
                            <ul className="text-sm space-y-1">
                              {selectedStory.story.after.achievements.map((achievement, index) => (
                                <li key={index} className="flex items-start">
                                  <Star className="h-3 w-3 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                  {achievement}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metrics & Media */}
                    <div className="space-y-6">
                      {/* Measurable Outcomes */}
                      <div>
                        <h4 className="font-semibold mb-4">Measurable Health Outcomes</h4>
                        <div className="space-y-4">
                          {selectedStory.metrics.map((metric, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="font-medium">{metric.metric}</div>
                                  <div className="text-sm text-gray-600">{metric.unit}</div>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4 mb-3">
                                <div className="text-center">
                                  <div className="text-sm text-gray-600">Before</div>
                                  <div className="font-semibold text-red-600">{metric.before}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm text-gray-600">After</div>
                                  <div className="font-semibold text-green-600">{metric.after}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm text-gray-600">Improvement</div>
                                  {getMetricImprovement(metric)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Media */}
                      {selectedStory.media.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-4">Media & Testimonials</h4>
                          <div className="space-y-3">
                            {selectedStory.media.map((media, index) => (
                              <div key={index} className="border rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center">
                                  {media.type === 'VIDEO' && <Play className="h-5 w-5 text-blue-600 mr-3" />}
                                  {media.type === 'IMAGE' && <Award className="h-5 w-5 text-green-600 mr-3" />}
                                  {media.type === 'AUDIO' && <Users className="h-5 w-5 text-purple-600 mr-3" />}
                                  <div>
                                    <div className="font-medium text-sm">{media.caption}</div>
                                    <div className="text-xs text-gray-500">{media.type}</div>
                                  </div>
                                </div>
                                <Button size="sm" variant="outline">
                                  View
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Program Details */}
                      <div>
                        <h4 className="font-semibold mb-4">Program Details</h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Clinic:</span>
                            <span className="text-sm font-medium">{selectedStory.programDetails.clinic}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Doctor:</span>
                            <span className="text-sm font-medium">{selectedStory.programDetails.doctor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Duration:</span>
                            <span className="text-sm font-medium">{selectedStory.programDetails.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Enrolled:</span>
                            <span className="text-sm font-medium">
                              {selectedStory.programDetails.enrollmentDate.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Story Navigation Dots */}
            <div className="flex justify-center space-x-2 mb-8">
              {stories.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentStoryIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  onClick={() => selectStory(index)}
                />
              ))}
            </div>

            {/* All Stories Grid */}
            <div>
              <h3 className="text-2xl font-bold mb-6">All Success Stories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map((story, index) => (
                  <Card 
                    key={story.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      index === currentStoryIndex ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => selectStory(index)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <Avatar className="h-12 w-12 mr-3">
                          <AvatarImage src={story.participant.image} />
                          <AvatarFallback>
                            {story.participant.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{story.participant.name}</h4>
                          <p className="text-sm text-gray-600">
                            Age {story.participant.age} • {story.participant.occupation}
                          </p>
                        </div>
                      </div>
                      
                      <h5 className="font-medium mb-2">{story.title}</h5>
                      <p className="text-sm text-gray-600 mb-4">{story.subtitle}</p>
                      
                      <div className="space-y-2 mb-4">
                        {story.story.before.healthConditions.slice(0, 2).map((condition, idx) => (
                          <div key={idx} className="flex items-center text-xs">
                            {getHealthConditionIcon(condition)}
                            <span className="ml-2">{condition}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">
                          {story.programDetails.duration}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {stories.reduce((sum, story) => sum + story.metrics.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Health Metrics Improved</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {Math.round(stories.reduce((sum, story) => sum + story.story.journey.length, 0) / stories.length * 10) / 10}
                  </div>
                  <div className="text-sm text-gray-600">Average Journey Length</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {Math.round(stories.reduce((sum, story) => {
                      const age = story.participant.age
                      return sum + (age >= 60 ? 1 : 0)
                    }, 0) / stories.length * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Senior Participants</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    100%
                  </div>
                  <div className="text-sm text-gray-600">Program Success Rate</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Success Factors Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Heart className="h-4 w-4 mr-2" />
                      Common Success Factors
                    </h4>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        Personalized health plans
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        Regular monitoring
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        Lifestyle modifications
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        Support from healthcare team
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Timeline Insights
                    </h4>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-start">
                        <Clock className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                        Initial improvements in 1-3 months
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                        Significant changes by 6 months
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                        Long-term success at 12+ months
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                        Sustained lifestyle changes
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Health Outcomes
                    </h4>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-start">
                        <TrendingUp className="h-4 w-4 text-purple-500 mr-2 mt-0.5" />
                        25-40% improvement in key metrics
                      </li>
                      <li className="flex items-start">
                        <TrendingUp className="h-4 w-4 text-purple-500 mr-2 mt-0.5" />
                        Reduced medication dependency
                      </li>
                      <li className="flex items-start">
                        <TrendingUp className="h-4 w-4 text-purple-500 mr-2 mt-0.5" />
                        Enhanced quality of life
                      </li>
                      <li className="flex items-start">
                        <TrendingUp className="h-4 w-4 text-purple-500 mr-2 mt-0.5" />
                        Lower healthcare costs
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Start Your Health Transformation?
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Join thousands of Singaporeans who have already improved their health with Healthier SG
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <a href="/healthier-sg/eligibility">
                    Check Your Eligibility
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="/clinics">
                    Find a Clinic Near You
                    <MapPin className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Government Disclaimer */}
      {showGovernmentDisclaimer && (
        <div className="mt-16 bg-gray-100 border-t">
          <div className="container mx-auto px-6 py-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Shield className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Success Stories Verified</span>
              </div>
              <p className="text-sm text-gray-600">
                All success stories are verified and published with participant consent. 
                Individual results may vary. For program details, please visit{' '}
                <a href="https://www.moh.gov.sg" className="text-blue-600 hover:underline">
                  moh.gov.sg
                </a>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}