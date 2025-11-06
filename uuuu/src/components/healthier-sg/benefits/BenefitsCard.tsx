"use client"

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { trpc } from '@/trpc/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Wallet, 
  TrendingUp, 
  Calendar, 
  Gift, 
  Clock,
  CheckCircle,
  DollarSign,
  Target,
  Award,
  Bell,
  ChevronRight,
  Share,
  QrCode
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BenefitsCardProps {
  compact?: boolean
  showActions?: boolean
  onViewDetails?: () => void
}

interface BenefitsOverview {
  currentTier: 'BASIC' | 'ENHANCED' | 'PREMIUM'
  tierBenefits: number
  totalEarned: number
  totalAvailable: number
  nextPayout: string
  progressToNextTier: number
  nextTier: 'ENHANCED' | 'PREMIUM' | null
  activeIncentives: number
  expiringBenefits: number
  recentTransactions: Array<{
    type: 'earned' | 'spent' | 'pending'
    amount: number
    description: string
    date: string
  }>
}

export default function BenefitsCard({ 
  compact = false, 
  showActions = true,
  onViewDetails 
}: BenefitsCardProps) {
  const { data: session } = useSession()
  const [isFlipped, setIsFlipped] = useState(false)

  // Mock data for benefits overview
  const benefitsOverview: BenefitsOverview = {
    currentTier: 'ENHANCED',
    tierBenefits: 600,
    totalEarned: 1245,
    totalAvailable: 450,
    nextPayout: '2025-11-15',
    progressToNextTier: 65,
    nextTier: 'PREMIUM',
    activeIncentives: 3,
    expiringBenefits: 75
  }

  const getTierColor = (tier: string) => {
    const colors = {
      BASIC: 'from-blue-400 to-blue-600',
      ENHANCED: 'from-purple-400 to-purple-600',
      PREMIUM: 'from-yellow-400 to-orange-500'
    }
    return colors[tier as keyof typeof colors] || colors.BASIC
  }

  const getTierGradient = (tier: string) => {
    return `bg-gradient-to-br ${getTierColor(tier)}`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (type: string) => {
    const colors = {
      earned: 'text-green-600',
      spent: 'text-red-600',
      pending: 'text-yellow-600'
    }
    return colors[type as keyof typeof colors] || 'text-gray-600'
  }

  const getStatusIcon = (type: string) => {
    const icons = {
      earned: <CheckCircle className="h-3 w-3" />,
      spent: <DollarSign className="h-3 w-3" />,
      pending: <Clock className="h-3 w-3" />
    }
    return icons[type as keyof typeof icons] || <Clock className="h-3 w-3" />
  }

  if (compact) {
    // Compact version for mobile/widgets
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-green-600" />
                <span className="font-medium">Healthier SG Benefits</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {benefitsOverview.currentTier}
              </Badge>
            </div>

            {/* Balance */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(benefitsOverview.totalAvailable)}
              </div>
              <div className="text-xs text-muted-foreground">Available Balance</div>
            </div>

            {/* Progress to next tier */}
            {benefitsOverview.nextTier && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Progress to {benefitsOverview.nextTier}</span>
                  <span>{benefitsOverview.progressToNextTier}%</span>
                </div>
                <Progress value={benefitsOverview.progressToNextTier} className="h-2" />
              </div>
            )}

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-sm font-semibold">{benefitsOverview.activeIncentives}</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
              <div>
                <div className="text-sm font-semibold">{formatCurrency(benefitsOverview.totalEarned)}</div>
                <div className="text-xs text-muted-foreground">Earned</div>
              </div>
              <div>
                <div className="text-sm font-semibold">{formatCurrency(benefitsOverview.expiringBenefits)}</div>
                <div className="text-xs text-muted-foreground">Expiring</div>
              </div>
            </div>

            {showActions && (
              <Button size="sm" className="w-full" onClick={onViewDetails}>
                View Details
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Full version
  return (
    <div className="space-y-4">
      {/* Main Benefits Card */}
      <Card className="overflow-hidden">
        <div className={cn("relative", getTierGradient(benefitsOverview.currentTier))}>
          <div className="absolute inset-0 bg-black/10" />
          <CardContent className="relative p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="h-6 w-6" />
                  Healthier SG Benefits
                </CardTitle>
                <CardDescription className="text-white/80 mt-1">
                  Your healthcare benefits and rewards
                </CardDescription>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-white hover:bg-white/20"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <QrCode className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-white hover:bg-white/20"
                >
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                  {formatCurrency(benefitsOverview.totalAvailable)}
                </span>
                <Badge className="bg-white/20 text-white border-white/30">
                  {benefitsOverview.currentTier} Tier
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-white/80">Total Earned</div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(benefitsOverview.totalEarned)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-white/80">Next Payout</div>
                  <div className="text-lg font-semibold">
                    {new Date(benefitsOverview.nextPayout).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Progress to Next Tier */}
      {benefitsOverview.nextTier && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Progress to {benefitsOverview.nextTier} Tier</span>
                  <span className="text-sm text-muted-foreground">
                    {benefitsOverview.progressToNextTier}% complete
                  </span>
                </div>
                <Progress value={benefitsOverview.progressToNextTier} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Earn {formatCurrency(1000 - benefitsOverview.totalEarned)} more to reach {benefitsOverview.nextTier}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="p-3 bg-green-100 rounded-full mx-auto w-fit">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-semibold">{benefitsOverview.activeIncentives}</div>
                <div className="text-sm text-muted-foreground">Active Goals</div>
              </div>
              <Button size="sm" variant="outline" className="w-full">
                Track Progress
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="p-3 bg-purple-100 rounded-full mx-auto w-fit">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-semibold">{formatCurrency(benefitsOverview.expiringBenefits)}</div>
                <div className="text-sm text-muted-foreground">Expiring Soon</div>
              </div>
              <Button size="sm" variant="outline" className="w-full">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <Button size="sm" variant="ghost">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {benefitsOverview.recentTransactions.map((transaction, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("p-1 rounded-full", 
                  transaction.type === 'earned' ? 'bg-green-100 text-green-600' :
                  transaction.type === 'spent' ? 'bg-red-100 text-red-600' :
                  'bg-yellow-100 text-yellow-600'
                )}>
                  {getStatusIcon(transaction.type)}
                </div>
                <div>
                  <div className="text-sm font-medium">{transaction.description}</div>
                  <div className="text-xs text-muted-foreground">{transaction.date}</div>
                </div>
              </div>
              <div className={cn("font-medium", getStatusColor(transaction.type))}>
                {transaction.type === 'earned' ? '+' : transaction.type === 'spent' ? '-' : ''}
                {formatCurrency(transaction.amount)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* QR Code Back */}
      {isFlipped && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="p-4 bg-gray-100 rounded-lg">
                <QrCode className="h-32 w-32 mx-auto text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold">Share Your Benefits</h3>
                <p className="text-sm text-muted-foreground">
                  Show this QR code to healthcare providers
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                <div>Card: {benefitsOverview.currentTier} Tier</div>
                <div>Balance: {formatCurrency(benefitsOverview.totalAvailable)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      {showActions && (
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={onViewDetails}>
            <Bell className="h-4 w-4 mr-2" />
            View All Benefits
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Screening
          </Button>
        </div>
      )}
    </div>
  )
}