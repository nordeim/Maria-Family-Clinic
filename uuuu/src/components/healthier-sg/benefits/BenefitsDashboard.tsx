import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Award, 
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Settings,
  Phone,
  Mail
} from 'lucide-react'
import { trpc } from '@/lib/trpc'
import { format } from 'date-fns'

interface BenefitsDashboardProps {
  userId?: string
}

export function BenefitsDashboard({ userId }: BenefitsDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview')
  
  // Fetch benefits summary data
  const { 
    data: benefitsData, 
    isLoading, 
    error,
    refetch 
  } = trpc.healthierSg.getBenefitsSummary.useQuery(
    {},
    {
      enabled: true,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  // Fetch screening reminders
  const { 
    data: screeningData 
  } = trpc.healthierSg.getScreeningReminders.useQuery({
    includeUpcoming: true,
    includeOverdue: true,
    includeRecommendations: true,
  })

  // Calculate benefits utilization percentage
  const utilizationPercent = benefitsData?.summary?.usage?.monthlyUsagePercent || 0
  const balance = benefitsData?.summary?.account?.balance || 0
  const tier = benefitsData?.summary?.account?.tier || 'BASIC'

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PREMIUM': return 'bg-purple-500'
      case 'ENHANCED': return 'bg-blue-500'
      default: return 'bg-green-500'
    }
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'PREMIUM': return 'secondary'
      case 'ENHANCED': return 'default'
      default: return 'outline'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Benefits Dashboard</CardTitle>
            <CardDescription>Loading your benefits information...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load benefits data. Please try again.
        </AlertDescription>
        <Button onClick={() => refetch()} className="mt-2">
          Retry
        </Button>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Account Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                My Benefits Dashboard
              </CardTitle>
              <CardDescription>
                Manage your Healthier SG benefits and track your healthcare savings
              </CardDescription>
            </div>
            <Badge variant={getTierBadgeColor(tier)} className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              {tier} Tier
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Current Balance */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Current Balance</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                ${balance.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">
                Available for healthcare expenses
              </div>
            </div>

            {/* Monthly Usage */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Monthly Usage</span>
              </div>
              <div className="text-2xl font-bold">
                ${benefitsData?.summary?.usage?.monthlyUsed?.toFixed(2) || '0.00'}
              </div>
              <Progress value={utilizationPercent} className="h-2" />
              <div className="text-xs text-gray-500">
                {utilizationPercent.toFixed(1)}% of ${benefitsData?.summary?.usage?.monthlyLimit || 200} limit
              </div>
            </div>

            {/* Total Earned */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Total Earned</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                ${benefitsData?.summary?.account?.totalEarned?.toFixed(2) || '0.00'}
              </div>
              <div className="text-xs text-gray-500">
                Lifetime benefits earned
              </div>
            </div>

            {/* Compliance Score */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Compliance</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {benefitsData?.summary?.usage?.complianceScore || 0}%
              </div>
              <div className="text-xs text-gray-500">
                Eligibility compliance score
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts and Recommendations */}
      {benefitsData?.alerts && benefitsData.alerts.length > 0 && (
        <div className="space-y-2">
          {benefitsData.alerts.map((alert, index) => (
            <Alert key={index}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{alert.title}:</strong> {alert.message}
                {alert.action && (
                  <Button variant="link" className="p-0 h-auto ml-2">
                    {alert.action}
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="screenings">Screenings</TabsTrigger>
          <TabsTrigger value="incentives">Incentives</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Health Screening
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Benefit Claim
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  View Payment History
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Update Benefits Settings
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {benefitsData?.summary?.activity?.recentTransactions?.length > 0 ? (
                  <div className="space-y-3">
                    {benefitsData.summary.activity.recentTransactions.slice(0, 3).map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-gray-500">
                            {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                          </div>
                        </div>
                        <Badge variant={transaction.amount > 0 ? 'default' : 'secondary'}>
                          ${Math.abs(transaction.amount).toFixed(2)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No recent transactions
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          {benefitsData?.recommendations && benefitsData.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personalized Recommendations</CardTitle>
                <CardDescription>
                  Based on your benefits usage and health profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {benefitsData.recommendations.map((recommendation, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{recommendation.title}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {recommendation.description}
                          </div>
                        </div>
                        <Badge variant={recommendation.priority === 'HIGH' ? 'destructive' : 'secondary'}>
                          {recommendation.priority}
                        </Badge>
                      </div>
                      <Button variant="link" className="p-0 h-auto mt-2">
                        {recommendation.action}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Recent benefit transactions and payment history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {benefitsData?.summary?.activity?.recentTransactions?.length > 0 ? (
                <div className="space-y-3">
                  {benefitsData.summary.activity.recentTransactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')} • {transaction.transactionType}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}${transaction.amount.toFixed(2)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No transactions found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Screenings Tab */}
        <TabsContent value="screenings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upcoming Screenings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Screenings</CardTitle>
              </CardHeader>
              <CardContent>
                {screeningData?.reminders?.upcoming?.length > 0 ? (
                  <div className="space-y-3">
                    {screeningData.reminders.upcoming.map((screening) => (
                      <div key={screening.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{screening.name}</div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(screening.scheduledDate), 'MMM dd, yyyy')} • 
                              {screening.daysUntil === 0 ? ' Today' : 
                               screening.daysUntil === 1 ? ' Tomorrow' : 
                               ` in ${screening.daysUntil} days`}
                            </div>
                          </div>
                          <Badge variant="default">{screening.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No upcoming screenings
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Overdue Screenings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Overdue Screenings</CardTitle>
              </CardHeader>
              <CardContent>
                {screeningData?.reminders?.overdue?.length > 0 ? (
                  <div className="space-y-3">
                    {screeningData.reminders.overdue.map((screening) => (
                      <div key={screening.id} className="border rounded-lg p-3 border-red-200 bg-red-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{screening.name}</div>
                            <div className="text-sm text-red-600">
                              {screening.daysOverdue} days overdue
                            </div>
                          </div>
                          <Badge variant="destructive">Overdue</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No overdue screenings
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommended Screenings */}
          {screeningData?.reminders?.recommended?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommended Screenings</CardTitle>
                <CardDescription>
                  Screenings recommended based on your age and health profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {screeningData.reminders.recommended.slice(0, 4).map((recommendation, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{recommendation.name}</div>
                          <div className="text-sm text-gray-500">
                            {recommendation.description}
                          </div>
                        </div>
                        <Badge variant={recommendation.priority === 'HIGH' ? 'destructive' : 'secondary'}>
                          {recommendation.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Incentives Tab */}
        <TabsContent value="incentives" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Earned Incentives</CardTitle>
              <CardDescription>
                Health milestones and rewards you've earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              {benefitsData?.summary?.activity?.recentIncentives?.length > 0 ? (
                <div className="space-y-3">
                  {benefitsData.summary.activity.recentIncentives.map((incentive, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-yellow-500" />
                        <div>
                          <div className="font-medium">{incentive.incentiveName}</div>
                          <div className="text-sm text-gray-500">
                            Earned {format(new Date(incentive.earnedDate), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          +${incentive.rewardValue}
                        </div>
                        {incentive.expiresAt && (
                          <div className="text-xs text-gray-500">
                            Expires {format(new Date(incentive.expiresAt), 'MMM dd')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No incentives earned yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact Support */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Need Help?</div>
              <div className="text-sm text-gray-600">
                Contact our benefits support team
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Call Support
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}