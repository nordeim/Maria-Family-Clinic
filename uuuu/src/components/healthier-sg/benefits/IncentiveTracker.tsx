"use client"

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { trpc } from '@/trpc/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, 
  Target, 
  Calendar, 
  Activity, 
  Heart, 
  Apple, 
  TrendingUp,
  Award,
  Gift,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MilestoneProgress {
  id: string
  title: string
  description: string
  category: 'health_screening' | 'activity' | 'nutrition' | 'education' | 'community'
  target: number
  current: number
  unit: string
  reward: number
  deadline?: string
  status: 'pending' | 'in_progress' | 'completed' | 'expired'
  icon: React.ReactNode
  color: string
}

interface Achievement {
  id: string
  title: string
  description: string
  earnedDate: string
  reward: number
  category: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  icon: React.ReactNode
}

export default function IncentiveTracker() {
  const { data: session } = useSession()
  
  // Mock data for milestone progress
  const [milestones] = useState<MilestoneProgress[]>([
    {
      id: '1',
      title: 'Complete Annual Health Screening',
      description: 'Get your comprehensive health check-up',
      category: 'health_screening',
      target: 1,
      current: 0,
      unit: 'screening',
      reward: 200,
      deadline: '2025-12-31',
      status: 'pending',
      icon: <Heart className="h-5 w-5" />,
      color: 'bg-red-500'
    },
    {
      id: '2',
      title: '7-Day Activity Streak',
      description: 'Maintain daily physical activity for a week',
      category: 'activity',
      target: 7,
      current: 3,
      unit: 'days',
      reward: 150,
      status: 'in_progress',
      icon: <Activity className="h-5 w-5" />,
      color: 'bg-blue-500'
    },
    {
      id: '3',
      title: 'Balanced Meals This Month',
      description: 'Track 20 balanced meals this month',
      category: 'nutrition',
      target: 20,
      current: 12,
      unit: 'meals',
      reward: 100,
      deadline: '2025-11-30',
      status: 'in_progress',
      icon: <Apple className="h-5 w-5" />,
      color: 'bg-green-500'
    },
    {
      id: '4',
      title: 'Health Education Course',
      description: 'Complete a certified health education program',
      category: 'education',
      target: 1,
      current: 1,
      unit: 'course',
      reward: 175,
      status: 'completed',
      icon: <Award className="h-5 w-5" />,
      color: 'bg-purple-500'
    },
    {
      id: '5',
      title: 'Community Health Event',
      description: 'Participate in community health activities',
      category: 'community',
      target: 3,
      current: 1,
      unit: 'events',
      reward: 125,
      deadline: '2025-12-15',
      status: 'in_progress',
      icon: <Target className="h-5 w-5" />,
      color: 'bg-orange-500'
    }
  ])

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Health Screening',
      description: 'Completed your first Healthier SG screening',
      earnedDate: '2024-10-15',
      reward: 50,
      category: 'Health Screening',
      rarity: 'common',
      icon: <Heart className="h-4 w-4" />
    },
    {
      id: '2',
      title: 'Nutrition Master',
      description: 'Tracked meals for 30 consecutive days',
      earnedDate: '2024-09-22',
      reward: 200,
      category: 'Nutrition',
      rarity: 'rare',
      icon: <Apple className="h-4 w-4" />
    },
    {
      id: '3',
      title: 'Community Champion',
      description: 'Participated in 5+ community health events',
      earnedDate: '2024-08-10',
      reward: 300,
      category: 'Community',
      rarity: 'epic',
      icon: <Trophy className="h-4 w-4" />
    },
    {
      id: '4',
      title: 'Health Guardian',
      description: 'Consistently maintained health goals for 6 months',
      earnedDate: '2024-07-05',
      reward: 500,
      category: 'Consistency',
      rarity: 'legendary',
      icon: <Star className="h-4 w-4" />
    }
  ])

  const getCategoryIcon = (category: string) => {
    const icons = {
      health_screening: <Heart className="h-4 w-4" />,
      activity: <Activity className="h-4 w-4" />,
      nutrition: <Apple className="h-4 w-4" />,
      education: <Award className="h-4 w-4" />,
      community: <Target className="h-4 w-4" />
    }
    return icons[category as keyof typeof icons] || <Target className="h-4 w-4" />
  }

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-600 bg-gray-100',
      rare: 'text-blue-600 bg-blue-100',
      epic: 'text-purple-600 bg-purple-100',
      legendary: 'text-yellow-600 bg-yellow-100'
    }
    return colors[rarity as keyof typeof colors] || colors.common
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-muted-foreground bg-muted',
      in_progress: 'text-blue-600 bg-blue-100',
      completed: 'text-green-600 bg-green-100',
      expired: 'text-red-600 bg-red-100'
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getTotalEarned = () => {
    return achievements.reduce((total, achievement) => total + achievement.reward, 0)
  }

  const getTotalPotential = () => {
    return milestones.reduce((total, milestone) => {
      if (milestone.status === 'in_progress' || milestone.status === 'pending') {
        return total + milestone.reward
      }
      return total
    }, 0)
  }

  const getCategoryProgress = (category: string) => {
    const categoryMilestones = milestones.filter(m => m.category === category)
    const completed = categoryMilestones.filter(m => m.status === 'completed').length
    const total = categoryMilestones.length
    return total > 0 ? (completed / total) * 100 : 0
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Incentive Tracker
          </CardTitle>
          <CardDescription>
            Track your progress toward health milestones and earn rewards
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold text-green-600">${getTotalEarned()}</p>
              </div>
              <Gift className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Potential</p>
                <p className="text-2xl font-bold text-blue-600">${getTotalPotential()}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Goals</p>
                <p className="text-2xl font-bold text-orange-600">
                  {milestones.filter(m => m.status === 'in_progress').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Achievements</p>
                <p className="text-2xl font-bold text-purple-600">{achievements.length}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="milestones" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="milestones">Active Milestones</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="progress">Category Progress</TabsTrigger>
        </TabsList>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-4">
          <div className="grid gap-4">
            {milestones.map((milestone) => (
              <Card key={milestone.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={cn("p-2 rounded-full text-white", milestone.color)}>
                        {milestone.icon}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{milestone.title}</h3>
                          <Badge className={cn("text-xs", getStatusColor(milestone.status))}>
                            {formatStatus(milestone.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress: {milestone.current} / {milestone.target} {milestone.unit}</span>
                            <span className="font-medium">${milestone.reward} reward</span>
                          </div>
                          <Progress 
                            value={(milestone.current / milestone.target) * 100} 
                            className="h-2"
                          />
                        </div>

                        {milestone.deadline && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Deadline: {new Date(milestone.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {milestone.status === 'completed' && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Milestone completed! ${milestone.reward} reward claimed
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {milestone.status === 'in_progress' && (
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      {milestone.current / milestone.target >= 0.8 && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Claim Reward
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <Badge className={cn("text-xs", getRarityColor(achievement.rarity))}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            Earned: {new Date(achievement.earnedDate).toLocaleDateString()}
                          </span>
                          <span className="font-medium text-green-600">
                            +${achievement.reward}
                          </span>
                        </div>
                        <Badge variant="outline">{achievement.category}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Category Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {['health_screening', 'activity', 'nutrition', 'education', 'community'].map((category) => {
              const progress = getCategoryProgress(category)
              const categoryMilestones = milestones.filter(m => m.category === category)
              const completed = categoryMilestones.filter(m => m.status === 'completed').length
              
              return (
                <Card key={category}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(category)}
                        <h3 className="font-semibold capitalize">
                          {category.replace('_', ' ')} Milestones
                        </h3>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{completed} / {categoryMilestones.length} completed</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        {categoryMilestones.map((milestone) => (
                          <div 
                            key={milestone.id} 
                            className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                          >
                            <span className="truncate">{milestone.title}</span>
                            <div className="flex items-center gap-2">
                              {milestone.status === 'completed' ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : milestone.status === 'in_progress' ? (
                                <Clock className="h-4 w-4 text-blue-600" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                              )}
                              <span className="text-muted-foreground">${milestone.reward}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}