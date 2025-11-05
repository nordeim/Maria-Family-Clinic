"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ClosedCaptionIcon,
  Cog6ToothIcon,
  ForwardIcon,
  BackwardIcon,
  ClockIcon,
  UserGroupIcon,
  EyeIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface VideoContent {
  id: string;
  title: string;
  description: string;
  type: 'procedure-animation' | 'virtual-walkthrough' | 'patient-testimonial' | 'expert-explanation' | 'step-by-step';
  duration: number; // in seconds
  languages: ('en' | 'zh' | 'ms' | 'ta')[];
  subtitles: {
    [key: string]: {
      available: boolean;
      languages: string[];
    };
  };
  quality: '720p' | '1080p' | '4k';
  size: number; // in MB
  thumbnailUrl?: string;
  videoUrl?: string;
  interactiveElements?: {
    timestamp: number;
    type: 'note' | 'pause' | 'quiz' | 'link';
    content: string;
  }[];
  accessibilityFeatures: {
    audioDescription?: boolean;
    signLanguage?: boolean;
    closedCaptions?: boolean;
    transcript?: boolean;
  };
  medicalVerified: boolean;
  verifiedBy?: string;
  createdDate: Date;
  viewCount: number;
  averageRating: number;
  tags: string[];
  targetAudience: 'patients' | 'families' | 'caregivers' | 'medical-students';
}

interface VideoPlayerProps {
  video: VideoContent;
  locale: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onInteraction?: (type: string, timestamp: number) => void;
}

interface VirtualWalkthroughProps {
  walkthroughId: string;
  title: string;
  steps: WalkthroughStep[];
  locale: string;
  onComplete?: () => void;
}

interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  panoramaUrl: string;
  hotspots: Hotspot[];
  navigation: {
    next?: string;
    previous?: string;
  };
  audioNarration?: {
    url: string;
    languages: string[];
  };
}

interface Hotspot {
  id: string;
  x: number; // percentage
  y: number; // percentage
  type: 'information' | 'equipment' | 'procedure' | 'safety';
  title: string;
  content: string;
  icon: string;
  interactionType: 'click' | 'hover' | 'auto';
}

interface VideoEducationCenterProps {
  serviceId: string;
  serviceName: string;
  locale: string;
  onVideoComplete?: (videoId: string) => void;
}

export function VideoEducationCenter({
  serviceId,
  serviceName,
  locale = 'en',
  onVideoComplete
}: VideoEducationCenterProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null);
  const [activeTab, setActiveTab] = useState('videos');
  const [playerSettings, setPlayerSettings] = useState({
    autoplay: false,
    subtitles: false,
    playbackSpeed: 1.0,
    quality: '1080p' as const,
    volume: 0.8
  });

  // Comprehensive video content database
  const videoContent: VideoContent[] = [
    {
      id: 'procedure-overview',
      title: `${serviceName}: Complete Procedure Overview`,
      description: 'Comprehensive visual guide showing the complete procedure from start to finish with medical explanations.',
      type: 'procedure-animation',
      duration: 420, // 7 minutes
      languages: ['en', 'zh', 'ms', 'ta'],
      subtitles: {
        en: { available: true, languages: ['en', 'zh'] },
        zh: { available: true, languages: ['zh', 'en'] },
        ms: { available: true, languages: ['ms', 'en'] },
        ta: { available: true, languages: ['ta', 'en'] }
      },
      quality: '1080p',
      size: 125, // MB
      thumbnailUrl: '/videos/thumbnails/procedure-overview.jpg',
      interactiveElements: [
        {
          timestamp: 120,
          type: 'pause',
          content: 'Important: This is where we check for patient comfort'
        },
        {
          timestamp: 240,
          type: 'note',
          content: 'Notice the specialized equipment being used here'
        }
      ],
      accessibilityFeatures: {
        closedCaptions: true,
        audioDescription: false,
        signLanguage: false,
        transcript: true
      },
      medicalVerified: true,
      verifiedBy: 'Dr. Sarah Chen, MD',
      createdDate: new Date(),
      viewCount: 2847,
      averageRating: 4.8,
      tags: ['overview', 'animation', 'medical-explanation'],
      targetAudience: 'patients'
    },
    {
      id: 'virtual-walkthrough',
      title: 'Virtual Tour of Our Medical Facility',
      description: 'Take a virtual tour of our modern medical facility to familiarize yourself with the environment.',
      type: 'virtual-walkthrough',
      duration: 180, // 3 minutes
      languages: ['en', 'zh'],
      subtitles: {
        en: { available: true, languages: ['en'] },
        zh: { available: true, languages: ['zh'] }
      },
      quality: '1080p',
      size: 89,
      thumbnailUrl: '/videos/thumbnails/facility-tour.jpg',
      interactiveElements: [
        {
          timestamp: 60,
          type: 'link',
          content: 'Learn more about our advanced equipment'
        }
      ],
      accessibilityFeatures: {
        closedCaptions: true,
        transcript: true
      },
      medicalVerified: true,
      createdDate: new Date(),
      viewCount: 1654,
      averageRating: 4.6,
      tags: ['facility', 'tour', 'familiarization'],
      targetAudience: 'patients'
    },
    {
      id: 'patient-testimonial',
      title: 'Patient Experience: John\'s Story',
      description: 'Hear from John about his experience with the procedure and recovery process.',
      type: 'patient-testimonial',
      duration: 300, // 5 minutes
      languages: ['en'],
      subtitles: {
        en: { available: true, languages: ['en'] }
      },
      quality: '1080p',
      size: 95,
      thumbnailUrl: '/videos/thumbnails/testimonial.jpg',
      accessibilityFeatures: {
        closedCaptions: true,
        transcript: true
      },
      medicalVerified: true,
      verifiedBy: 'Patient Education Team',
      createdDate: new Date(),
      viewCount: 1923,
      averageRating: 4.9,
      tags: ['testimonial', 'patient-experience', 'real-story'],
      targetAudience: 'patients'
    },
    {
      id: 'expert-explanation',
      title: 'Medical Expert Q&A Session',
      description: 'Detailed explanations from our medical experts addressing common patient concerns.',
      type: 'expert-explanation',
      duration: 900, // 15 minutes
      languages: ['en', 'zh'],
      subtitles: {
        en: { available: true, languages: ['en', 'zh'] },
        zh: { available: true, languages: ['zh', 'en'] }
      },
      quality: '1080p',
      size: 245,
      thumbnailUrl: '/videos/thumbnails/expert-qa.jpg',
      interactiveElements: [
        {
          timestamp: 180,
          type: 'quiz',
          content: 'Knowledge Check: What are the main benefits of this procedure?'
        },
        {
          timestamp: 540,
          type: 'pause',
          content: 'This is an important safety consideration'
        }
      ],
      accessibilityFeatures: {
        closedCaptions: true,
        transcript: true
      },
      medicalVerified: true,
      verifiedBy: 'Dr. Michael Lim & Dr. Sarah Chen',
      createdDate: new Date(),
      viewCount: 987,
      averageRating: 4.7,
      tags: ['expert', 'qa', 'medical-explanation', 'advanced'],
      targetAudience: 'patients'
    },
    {
      id: 'step-by-step',
      title: 'Step-by-Step: What Happens During Your Procedure',
      description: 'Detailed step-by-step breakdown of exactly what will happen during your procedure.',
      type: 'step-by-step',
      duration: 600, // 10 minutes
      languages: ['en', 'zh', 'ms'],
      subtitles: {
        en: { available: true, languages: ['en'] },
        zh: { available: true, languages: ['zh'] },
        ms: { available: true, languages: ['ms'] }
      },
      quality: '1080p',
      size: 156,
      thumbnailUrl: '/videos/thumbnails/step-by-step.jpg',
      interactiveElements: [
        {
          timestamp: 90,
          type: 'note',
          content: 'Step 1: Preparation phase begins'
        },
        {
          timestamp: 240,
          type: 'note',
          content: 'Step 2: Main procedure phase'
        },
        {
          timestamp: 420,
          type: 'note',
          content: 'Step 3: Recovery phase'
        }
      ],
      accessibilityFeatures: {
        closedCaptions: true,
        transcript: true
      },
      medicalVerified: true,
      verifiedBy: 'Surgical Team',
      createdDate: new Date(),
      viewCount: 2234,
      averageRating: 4.8,
      tags: ['step-by-step', 'procedure-detail', 'comprehensive'],
      targetAudience: 'patients'
    }
  ];

  const walkthroughSteps: WalkthroughStep[] = [
    {
      id: 'entrance',
      title: 'Main Entrance & Reception',
      description: 'Welcome to our modern medical facility. This is where you will check in for your appointment.',
      panoramaUrl: '/walkthrough/entrance.jpg',
      hotspots: [
        {
          id: 'reception-desk',
          x: 25,
          y: 60,
          type: 'information',
          title: 'Reception Desk',
          content: 'Please check in here with your ID and appointment confirmation.',
          icon: 'reception',
          interactionType: 'click'
        },
        {
          id: 'waiting-area',
          x: 75,
          y: 40,
          type: 'safety',
          title: 'Waiting Area',
          content: 'Comfortable seating area with WiFi and reading materials.',
          icon: 'seating',
          interactionType: 'hover'
        }
      ],
      navigation: {
        next: 'reception-waiting'
      }
    },
    {
      id: 'reception-waiting',
      title: 'Reception & Waiting Area',
      description: 'After check-in, you will wait here until called for your procedure.',
      panoramaUrl: '/walkthrough/waiting.jpg',
      hotspots: [
        {
          id: 'comfort-amenities',
          x: 40,
          y: 30,
          type: 'information',
          title: 'Patient Amenities',
          content: 'Free WiFi, charging stations, refreshments, and magazines available.',
          icon: 'amenities',
          interactionType: 'click'
        },
        {
          id: 'nurse-station',
          x: 80,
          y: 70,
          type: 'procedure',
          title: 'Nursing Station',
          content: 'Our nursing staff will call you from here when ready.',
          icon: 'nurse',
          interactionType: 'hover'
        }
      ],
      navigation: {
        previous: 'entrance',
        next: 'preparation-room'
      }
    },
    {
      id: 'preparation-room',
      title: 'Preparation Room',
      description: 'This is where you will be prepared for your procedure.',
      panoramaUrl: '/walkthrough/preparation.jpg',
      hotspots: [
        {
          id: 'changing-area',
          x: 20,
          y: 50,
          type: 'procedure',
          title: 'Changing Area',
          content: 'Private space to change into hospital gown if required.',
          icon: 'changing',
          interactionType: 'click'
        },
        {
          id: 'medical-equipment',
          x: 60,
          y: 30,
          type: 'equipment',
          title: 'Monitoring Equipment',
          content: 'State-of-the-art monitoring devices ensure your safety.',
          icon: 'monitor',
          interactionType: 'hover'
        },
        {
          id: 'comfort-items',
          x: 85,
          y: 65,
          type: 'safety',
          title: 'Patient Comfort',
          content: 'Warm blankets, pillows, and comfort items available.',
          icon: 'comfort',
          interactionType: 'click'
        }
      ],
      navigation: {
        previous: 'reception-waiting',
        next: 'procedure-room'
      }
    },
    {
      id: 'procedure-room',
      title: 'Procedure Room',
      description: 'This is where your procedure will take place.',
      panoramaUrl: '/walkthrough/procedure-room.jpg',
      hotspots: [
        {
          id: 'operating-table',
          x: 50,
          y: 40,
          type: 'procedure',
          title: 'Procedure Table',
          content: 'Adjustable table designed for your comfort and safety.',
          icon: 'table',
          interactionType: 'click'
        },
        {
          id: 'surgical-lights',
          x: 25,
          y: 15,
          type: 'equipment',
          title: 'Surgical Lighting',
          content: 'Advanced LED lighting system for optimal visibility.',
          icon: 'lights',
          interactionType: 'hover'
        },
        {
          id: 'monitor-systems',
          x: 80,
          y: 25,
          type: 'equipment',
          title: 'Monitoring Systems',
          content: 'Continuous monitoring of vital signs throughout procedure.',
          icon: 'monitor',
          interactionType: 'hover'
        },
        {
          id: 'safety-equipment',
          x: 15,
          y: 70,
          type: 'safety',
          title: 'Emergency Equipment',
          content: 'Full emergency equipment readily available for safety.',
          icon: 'emergency',
          interactionType: 'click'
        }
      ],
      navigation: {
        previous: 'preparation-room',
        next: 'recovery-room'
      }
    },
    {
      id: 'recovery-room',
      title: 'Recovery Room',
      description: 'You will recover here after your procedure before going home.',
      panoramaUrl: '/walkthrough/recovery.jpg',
      hotspots: [
        {
          id: 'recovery-beds',
          x: 30,
          y: 50,
          type: 'procedure',
          title: 'Recovery Beds',
          content: 'Comfortable beds with privacy curtains and call systems.',
          icon: 'bed',
          interactionType: 'click'
        },
        {
          id: 'nursing-station-recovery',
          x: 70,
          y: 30,
          type: 'procedure',
          title: 'Recovery Nursing Station',
          content: 'Dedicated staff to monitor your recovery progress.',
          icon: 'nurse',
          interactionType: 'hover'
        },
        {
          id: 'discharge-area',
          x: 90,
          y: 70,
          type: 'information',
          title: 'Discharge Area',
          content: 'When cleared, you will exit from this area with your care instructions.',
          icon: 'exit',
          interactionType: 'click'
        }
      ],
      navigation: {
        previous: 'procedure-room'
      }
    }
  ];

  const filterVideos = (type?: string) => {
    return videoContent.filter(video => {
      const languageMatch = video.languages.includes(locale as any);
      const typeMatch = type ? video.type === type : true;
      return languageMatch && typeMatch;
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'procedure-animation': return PlayIcon;
      case 'virtual-walkthrough': return UserGroupIcon;
      case 'patient-testimonial': return BookOpenIcon;
      case 'expert-explanation': return EyeIcon;
      case 'step-by-step': return BookOpenIcon;
      default: return PlayIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'procedure-animation': return 'text-purple-600 bg-purple-100';
      case 'virtual-walkthrough': return 'text-blue-600 bg-blue-100';
      case 'patient-testimonial': return 'text-green-600 bg-green-100';
      case 'expert-explanation': return 'text-orange-600 bg-orange-100';
      case 'step-by-step': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PlayIcon className="h-5 w-5 text-blue-500" />
              <span>Video Education Center</span>
            </div>
            <div className="flex items-center space-x-2">
              <select 
                value={locale} 
                className="text-sm border rounded px-2 py-1"
                onChange={(e) => {
                  // In a real app, this would trigger a locale change
                  console.log('Locale changed to:', e.target.value);
                }}
              >
                <option value="en">English</option>
                <option value="zh">中文</option>
                <option value="ms">Bahasa Melayu</option>
                <option value="ta">தமிழ்</option>
              </select>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Content Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b px-6 pt-6">
            <div className="flex space-x-1">
              <Button
                variant={activeTab === 'videos' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('videos')}
              >
                Educational Videos
              </Button>
              <Button
                variant={activeTab === 'walkthrough' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('walkthrough')}
              >
                Virtual Walkthrough
              </Button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'videos' && (
              <div className="space-y-6">
                {/* Video Categories */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedVideo(null)}
                  >
                    All Videos
                  </Button>
                  {['procedure-animation', 'virtual-walkthrough', 'patient-testimonial', 'expert-explanation', 'step-by-step'].map(type => {
                    const count = filterVideos(type).length;
                    const IconComponent = getTypeIcon(type);
                    return (
                      <Button
                        key={type}
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedVideo(null)}
                        className="flex items-center space-x-1"
                      >
                        <IconComponent className="h-3 w-3" />
                        <span className="capitalize">{type.replace('-', ' ')}</span>
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {count}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>

                {/* Video Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterVideos().map((video) => {
                    const TypeIcon = getTypeIcon(video.type);
                    
                    return (
                      <Card key={video.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="relative">
                              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                                {video.thumbnailUrl ? (
                                  <img 
                                    src={video.thumbnailUrl} 
                                    alt={video.title}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                ) : (
                                  <TypeIcon className="h-12 w-12 text-gray-400" />
                                )}
                                <Button
                                  size="sm"
                                  className="absolute inset-0 m-auto bg-black/50 hover:bg-black/70"
                                  onClick={() => setSelectedVideo(video)}
                                >
                                  <PlayIcon className="h-6 w-6" />
                                </Button>
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                  {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Badge className={cn("text-xs", getTypeColor(video.type))}>
                                  {video.type.replace('-', ' ')}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {video.quality}
                                </Badge>
                              </div>

                              <h4 className="font-medium text-gray-900 line-clamp-2">{video.title}</h4>
                              <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>

                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{video.viewCount} views</span>
                                <span>⭐ {video.averageRating}</span>
                              </div>

                              <div className="flex items-center space-x-1">
                                {video.languages.map(lang => (
                                  <Badge key={lang} variant="outline" className="text-xs">
                                    {lang.toUpperCase()}
                                  </Badge>
                                ))}
                              </div>

                              <div className="flex flex-wrap gap-1">
                                {video.tags.slice(0, 3).map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'walkthrough' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">Virtual Facility Tour</h3>
                  <p className="text-gray-600">Explore our modern medical facility through an interactive virtual tour</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {walkthroughSteps.map((step, index) => (
                    <Card 
                      key={step.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                            <img 
                              src={step.panoramaUrl} 
                              alt={step.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                Step {index + 1}
                              </Badge>
                            </div>
                            
                            <h4 className="font-medium text-gray-900">{step.title}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">{step.description}</p>
                            
                            <div className="flex items-center space-x-1">
                              {step.audioNarration && (
                                <Badge variant="secondary" className="text-xs">
                                  🔊 Audio Guide
                                </Badge>
                              )}
                              <Badge variant="secondary" className="text-xs">
                                📍 {step.hotspots.length} points
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="text-center">
                  <Button size="lg">
                    Start Interactive Tour
                    <UserGroupIcon className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Video Player Modal */}
      {selectedVideo && (
        <Card className="fixed inset-4 z-50 bg-white shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{selectedVideo.title}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedVideo(null)}
            >
              ✕
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Video Player Placeholder */}
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <PlayIcon className="h-16 w-16 mx-auto mb-4" />
                  <p>Video Player</p>
                  <p className="text-sm text-gray-300">{selectedVideo.title}</p>
                </div>
              </div>

              {/* Video Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <BackwardIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <PlayIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ForwardIcon className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <ClosedCaptionIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Cog6ToothIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Video Info */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{selectedVideo.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Duration: {Math.floor(selectedVideo.duration / 60)}:{String(selectedVideo.duration % 60).padStart(2, '0')}</span>
                  <span>Quality: {selectedVideo.quality}</span>
                  <span>Size: {selectedVideo.size}MB</span>
                  <span>Views: {selectedVideo.viewCount}</span>
                </div>
              </div>

              {/* Interactive Elements */}
              {selectedVideo.interactiveElements && selectedVideo.interactiveElements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Interactive Elements:</h4>
                  <div className="space-y-1">
                    {selectedVideo.interactiveElements.map((element, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <Badge variant="outline" className="text-xs">
                          {Math.floor(element.timestamp / 60)}:{String(element.timestamp % 60).padStart(2, '0')}
                        </Badge>
                        <span>{element.content}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}