"use client"

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { trpc } from '@/trpc/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy,
  Award,
  Star,
  Crown,
  Gem,
  Target,
  Heart,
  Activity,
  Apple,
  Calendar,
  Users,
  BookOpen,
  Zap,
  Lock,
  Gift,
  Share,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
  category: 'health_screening' | 'activity' | 'nutrition' | 'education' | 'community' | 'consistency' | 'milestone'
  reward: number
  unlockedAt?: Date
  progress?: number
  target?: number
  isUnlocked: boolean
  badgeColor: string
  bgGradient: string
  requirements: string[]
  benefits: string[]
  nextTier?: string
}

interface RewardLevel {
  level: number
  title: string
  icon: React.ReactNode
  color: string
  requiredPoints: number
  unlocked: boolean
  rewards: string[]
}

export default function RewardsGallery() {
  const { data: session } = useSession()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Mock achievement data
  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Health Guardian',
      description: 'Complete your first comprehensive health screening',
      icon: <Heart className="h-6 w-6" />,
      rarity: 'common',
      category: 'health_screening',
      reward: 50,
      unlockedAt: new Date('2025-10-15'),
      isUnlocked: true,
      badgeColor: 'text-blue-600 bg-blue-100',
      bgGradient: 'bg-gradient-to-br from-blue-400 to-blue-600',
      requirements: ['Complete health screening', 'Receive results'],
      benefits: ['$50 benefit', 'Health report', 'Priority booking'],
      nextTier: 'Health Master'
    },
    {
      id: '2',
      title: 'Walking Champion',
      description: 'Walk 10,000 steps daily for 7 consecutive days',
      icon: <Activity className="h-6 w-6" />,
      rarity: 'rare',
      category: 'activity',
      reward: 150,
      unlockedAt: new Date('2025-10-08'),
      isUnlocked: true,
      badgeColor: 'text-green-600 bg-green-100',
      bgGradient: 'bg-gradient-to-br from-green-400 to-green-600',
      requirements: ['Daily step tracking', '7-day streak'],
      benefits: ['$150 benefit', 'Activity tracker', 'Fitness consultation'],
      nextTier: 'Marathon Master'
    },
    {
      id: '3',
      title: 'Nutrition Expert',
      description: 'Track balanced meals for 30 consecutive days',
      icon: <Apple className="h-6 w-6" />,
      rarity: 'epic',
      category: 'nutrition',
      reward: 300,
      progress: 23,
      target: 30,
      isUnlocked: false,
      badgeColor: 'text-purple-600 bg-purple-100',
      bgGradient: 'bg-gradient-to-br from-purple-400 to-purple-600',
      requirements: ['Meal logging', '30-day consistency', 'Nutritional balance'],
      benefits: ['$300 benefit', 'Nutrition consultation', 'Meal planning'],
      nextTier: 'Diet Master'
    },
    {
      id: '4',
      title: 'Community Champion',
      description: 'Participate in 5 community health events',
      icon: <Users className="h-6 w-6" />,
      rarity: 'legendary',
      category: 'community',
      reward: 500,
      progress: 3,
      target: 5,
      isUnlocked: false,
      badgeColor: 'text-orange-600 bg-orange-100',
      bgGradient: 'bg-gradient-to-br from-orange-400 to-red-500',
      requirements: ['Community participation', 'Event attendance', 'Peer engagement'],
      benefits: ['$500 benefit', 'Community leader status', 'Special events access'],
      nextTier: 'Community Legend'
    },
    {
      id: '5',
      title: 'Education Master',
      description: 'Complete 3 certified health education courses',
      icon: <BookOpen className="h-6 w-6" />,
      rarity: 'epic',
      category: 'education',
      reward: 400,
      unlockedAt: new Date('2025-09-20'),
      isUnlocked: true,
      badgeColor: 'text-indigo-600 bg-indigo-100',
      bgGradient: 'bg-gradient-to-br from-indigo-400 to-purple-500',
      requirements: ['Course completion', 'Quiz passing', 'Certificate earning'],
      benefits: ['$400 benefit', 'Health knowledge', 'Teaching opportunities'],
      nextTier: 'Health Scholar'
    },
    {
      id: '6',
      title: 'Consistency King',
      description: 'Maintain 6-month health goal streak',
      icon: <Calendar className="h-6 w-6" />,
      rarity: 'mythic',
      category: 'consistency',
      reward: 1000,
      progress: 4,
      target: 6,
      isUnlocked: false,
      badgeColor: 'text-yellow-600 bg-yellow-100',
      bgGradient: 'bg-gradient-to-br from-yellow-400 to-orange-500',
      requirements: ['6-month consistency', 'No missed days', 'Goal progression'],
      benefits: ['$1000 benefit', 'Lifetime status', 'Exclusive rewards'],
      nextTier: 'Health Legend'
    }
  ])

  // Mock reward levels
  const [rewardLevels] = useState<RewardLevel[]>([
    {
      level: 1,
      title: 'Health Seeker',
      icon: <Target className="h-5 w-5" />,
      color: 'text-gray-600',
      requiredPoints: 0,
      unlocked: true,
      rewards: ['Basic benefits', 'Screening discounts']
    },
    {
      level: 2,
      title: 'Health Enthusiast',
      icon: <Star className="h-5 w-5" />,
      color: 'text-blue-600',
      requiredPoints: 200,
      unlocked: true,
      rewards: ['Enhanced benefits', 'Priority scheduling']
    },
    {
      level: 3,
      title: 'Health Champion',
      icon: <Award className="h-5 w-5" />,
      color: 'text-purple-600',
      requiredPoints: 500,
      unlocked: false,
      rewards: ['Premium benefits', 'Personal coaching']
    },
    {
      level: 4,
      title: 'Health Master',
      icon: <Crown className="h-5 w-5" />,
      color: 'text-yellow-600',
      requiredPoints: 1000,
      unlocked: false,
      rewards: ['Elite status', 'Exclusive events']
    },
    {
      level: 5,
      title: 'Health Legend',
      icon: <Gem className="h-5 w-5" />,
      color: 'text-red-600',
      requiredPoints: 2000,
      unlocked: false,
      rewards: ['Legendary status', 'All benefits unlocked']
    }
  ])

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-600 bg-gray-100',
      rare: 'text-blue-600 bg-blue-100',
      epic: 'text-purple-600 bg-purple-100',
      legendary: 'text-orange-600 bg-orange-100',
      mythic: 'text-red-600 bg-red-100'
    }
    return colors[rarity as keyof typeof colors] || colors.common
  }

  const getRarityBorder = (rarity: string) => {
    const borders = {
      common: 'border-gray-300',
      rare: 'border-blue-300',
      epic: 'border-purple-300',
      legendary: 'border-orange-300',
      mythic: 'border-red-300'
    }
    return borders[rarity as keyof typeof borders] || borders.common
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      health_screening: <Heart className="h-4 w-4" />,
      activity: <Activity className="h-4 w-4" />,
      nutrition: <Apple className="h-4 w-4" />,
      education: <BookOpen className="h-4 w-4" />,
      community: <Users className="h-4 w-4" />,
      consistency: <Calendar className="h-4 w-4" />,
      milestone: <Trophy className="h-4 w-4" />
    }
    return icons[category as keyof typeof icons] || <Trophy className="h-4 w-4" />
  }

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(achievement => achievement.category === selectedCategory)

  const categories = Array.from(new Set(achievements.map(a => a.category)))
  const unlockedCount = achievements.filter(a => a.isUnlocked).length
  const totalPoints = achievements.filter(a => a.isUnlocked).reduce((sum, a) => sum + a.reward, 0)
  const currentLevel = rewardLevels.find(level => !level.unlocked)?.level - 1 || rewardLevels.length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Rewards Gallery
          </CardTitle>
          <CardDescription>
            Showcase your health achievements and unlock exclusive rewards
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Achievements</p>
                <p className="text-2xl font-bold text-blue-600">{unlockedCount}/{achievements.length}</p>
              </div>
              <Trophy className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold text-green-600">{totalPoints}</p>
              </div>
              <Star className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Level</p>
                <p className="text-2xl font-bold text-purple-600">{currentLevel}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Next Reward</p>
                <p className="text-2xl font-bold text-orange-600">$100</p>
              </div>
              <Gift className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="levels">Reward Levels</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          {/* Category Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('all')}
                >
                  All
                </Button>
                {categories.map(category => (
                  <Button
                    key={category}
                    size="sm"
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                  >
                    {getCategoryIcon(category)}
                    <span className="ml-1">{category.replace('_', ' ')}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements Grid */}
          <div className={cn(
            "grid gap-4",
            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            {filteredAchievements.map((achievement) => (
              <Card 
                key={achievement.id} 
                className={cn(
                  "overflow-hidden transition-all duration-200 hover:shadow-lg",
                  achievement.isUnlocked ? 'border-2' : 'opacity-75',
                  getRarityBorder(achievement.rarity)
                )}
              >
                <div className={cn("relative p-6 text-white", achievement.bgGradient)}>
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-white/20 text-white border-white/30">
                      {achievement.rarity.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-full">
                        {achievement.isUnlocked ? achievement.icon : <Lock className="h-6 w-6" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{achievement.title}</h3>
                        <p className="text-sm text-white/80">{achievement.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        <span className="font-medium">{achievement.reward} points</span>
                      </div>
                      {achievement.nextTier && (
                        <div className="text-xs text-white/80">
                          Next: {achievement.nextTier}
                        </div>
                      )}
                    </div>

                    {!achievement.isUnlocked && achievement.progress !== undefined && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.target}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress! / achievement.target!) * 100} 
                          className="h-2 bg-white/20"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Requirements:</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {achievement.requirements.map((req, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="h-1 w-1 bg-muted-foreground rounded-full" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Benefits:</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {achievement.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Zap className="h-3 w-3 text-yellow-600" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        {achievement.isUnlocked ? 'Share' : 'View Details'}
                      </Button>
                      {achievement.isUnlocked && (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reward Levels Tab */}
        <TabsContent value="levels" className="space-y-4">
          <div className="space-y-4">
            {rewardLevels.map((level, index) => (
              <Card 
                key={level.level} 
                className={cn(
                  "overflow-hidden",
                  level.unlocked ? "border-green-200 bg-green-50/50" : "border-gray-200"
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "p-4 rounded-full",
                      level.unlocked ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                    )}>
                      {level.icon}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-xl">Level {level.level}</h3>
                        <h4 className="font-semibold text-lg">{level.title}</h4>
                        {level.unlocked && (
                          <Badge className="bg-green-100 text-green-700">Unlocked</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        Requires {level.requiredPoints} points
                      </p>
                      
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Rewards:</h4>
                        <div className="flex flex-wrap gap-2">
                          {level.rewards.map((reward, rewardIndex) => (
                            <Badge key={rewardIndex} variant="outline" className="text-xs">
                              {reward}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {!level.unlocked && index < rewardLevels.length - 1 && (
                      <div className="text-right text-sm text-muted-foreground">
                        <div>Next level</div>
                        <div className="font-medium">
                          {rewardLevels[index + 1].requiredPoints - level.requiredPoints} points needed
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Community Leaderboard</CardTitle>
              <CardDescription>
                See how you rank against other Healthier SG participants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { rank: 1, name: 'You', points: totalPoints, isCurrentUser: true },
                  { rank: 2, name: 'Sarah L.', points: totalPoints - 150, isCurrentUser: false },
                  { rank: 3, name: 'Michael T.', points: totalPoints - 280, isCurrentUser: false },
                  { rank: 4, name: 'Jennifer W.', points: totalPoints - 420, isCurrentUser: false },
                  { rank: 5, name: 'David C.', points: totalPoints - 580, isCurrentUser: false }
                ].map((user) => (
                  <div 
                    key={user.rank} 
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg",
                      user.isCurrentUser ? "bg-blue-50 border-2 border-blue-200" : "bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                      user.rank === 1 ? "bg-yellow-100 text-yellow-700" :
                      user.rank === 2 ? "bg-gray-100 text-gray-700" :
                      user.rank === 3 ? "bg-orange-100 text-orange-700" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {user.rank}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.name}</span>
                        {user.isCurrentUser && <Badge className="bg-blue-100 text-blue-700">You</Badge>}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold">{user.points} points</div>
                      {user.rank === 1 && <Trophy className="h-4 w-4 text-yellow-600 ml-auto" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}