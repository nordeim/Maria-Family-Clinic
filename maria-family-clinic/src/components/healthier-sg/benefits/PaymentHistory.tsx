"use client"

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { trpc } from '@/trpc/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Download,
  Filter,
  Search,
  CreditCard,
  Wallet,
  Building2,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Receipt,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface PaymentTransaction {
  id: string
  type: 'benefit' | 'screening' | 'consultation' | 'medication' | 'reimbursement' | 'incentive'
  description: string
  amount: number
  paymentMethod: 'medisave' | 'cash' | 'chc' | 'nets' | 'credit_card' | 'bank_transfer'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  date: Date
  referenceNumber: string
  category: string
  clinicName?: string
  doctorName?: string
  receiptUrl?: string
  reimbursementFor?: string
  benefitType?: string
  incentiveDescription?: string
}

interface PaymentSummary {
  totalSpent: number
  totalReimbursed: number
  totalBenefits: number
  totalIncentives: number
  pendingAmount: number
  monthlyAverage: number
}

export default function PaymentHistory() {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [view, setView] = useState<'transactions' | 'summary' | 'receipts'>('transactions')

  // Mock transaction data
  const [transactions] = useState<PaymentTransaction[]>([
    {
      id: '1',
      type: 'benefit',
      description: 'Healthier SG Tier Benefits - Enhanced Plan',
      amount: 600,
      paymentMethod: 'medisave',
      status: 'completed',
      date: new Date('2025-10-15'),
      referenceNumber: 'BEN20251015001',
      category: 'Benefits',
      benefitType: 'Tier Benefits'
    },
    {
      id: '2',
      type: 'screening',
      description: 'Annual Health Check-up',
      amount: 150,
      paymentMethod: 'medisave',
      status: 'completed',
      date: new Date('2025-10-10'),
      referenceNumber: 'SCR20251010001',
      category: 'Health Screening',
      clinicName: 'My Family Clinic',
      doctorName: 'Dr. Sarah Tan',
      receiptUrl: '/receipts/screening-001.pdf'
    },
    {
      id: '3',
      type: 'incentive',
      description: 'Health Goal Achievement Reward - Weight Management',
      amount: 200,
      paymentMethod: 'bank_transfer',
      status: 'completed',
      date: new Date('2025-10-05'),
      referenceNumber: 'INC20251005001',
      category: 'Incentives',
      incentiveDescription: 'Achieved 10kg weight loss target'
    },
    {
      id: '4',
      type: 'consultation',
      description: 'Follow-up Consultation - Diabetes Management',
      amount: 75,
      paymentMethod: 'medisave',
      status: 'completed',
      date: new Date('2025-09-28'),
      referenceNumber: 'CON20250928001',
      category: 'Consultation',
      clinicName: 'My Family Clinic',
      doctorName: 'Dr. Michael Lim',
      receiptUrl: '/receipts/consultation-001.pdf'
    },
    {
      id: '5',
      type: 'medication',
      description: 'Diabetes Medication - Metformin',
      amount: 45,
      paymentMethod: 'medisave',
      status: 'completed',
      date: new Date('2025-09-25'),
      referenceNumber: 'MED20250925001',
      category: 'Medication',
      receiptUrl: '/receipts/medication-001.pdf'
    },
    {
      id: '6',
      type: 'reimbursement',
      description: 'Health Screening Reimbursement - Vision Test',
      amount: 80,
      paymentMethod: 'bank_transfer',
      status: 'pending',
      date: new Date('2025-09-20'),
      referenceNumber: 'REI20250920001',
      category: 'Reimbursement',
      reimbursementFor: 'Vision screening at private clinic'
    },
    {
      id: '7',
      type: 'benefit',
      description: 'Community Health Program Bonus',
      amount: 150,
      paymentMethod: 'medisave',
      status: 'completed',
      date: new Date('2025-09-15'),
      referenceNumber: 'BEN20250915001',
      category: 'Benefits',
      benefitType: 'Community Bonus'
    },
    {
      id: '8',
      type: 'incentive',
      description: 'Health Education Course Completion',
      amount: 100,
      paymentMethod: 'medisave',
      status: 'completed',
      date: new Date('2025-09-10'),
      referenceNumber: 'INC20250910001',
      category: 'Incentives',
      incentiveDescription: 'Completed "Healthy Living" course'
    }
  ])

  const getPaymentMethodIcon = (method: string) => {
    const icons = {
      medisave: <Wallet className="h-4 w-4" />,
      cash: <DollarSign className="h-4 w-4" />,
      chc: <Building2 className="h-4 w-4" />,
      nets: <CreditCard className="h-4 w-4" />,
      credit_card: <CreditCard className="h-4 w-4" />,
      bank_transfer: <ArrowUpRight className="h-4 w-4" />
    }
    return icons[method as keyof typeof icons] || <CreditCard className="h-4 w-4" />
  }

  const getPaymentMethodName = (method: string) => {
    const names = {
      medisave: 'Medisave',
      cash: 'Cash',
      chc: 'CHC',
      nets: 'NETS',
      credit_card: 'Credit Card',
      bank_transfer: 'Bank Transfer'
    }
    return names[method as keyof typeof names] || method
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      completed: 'text-green-600 bg-green-100',
      failed: 'text-red-600 bg-red-100',
      refunded: 'text-gray-600 bg-gray-100'
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <Clock className="h-4 w-4" />,
      completed: <CheckCircle className="h-4 w-4" />,
      failed: <XCircle className="h-4 w-4" />,
      refunded: <ArrowDownLeft className="h-4 w-4" />
    }
    return icons[status as keyof typeof icons] || <Clock className="h-4 w-4" />
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      benefit: <Wallet className="h-4 w-4" />,
      screening: <FileText className="h-4 w-4" />,
      consultation: <Receipt className="h-4 w-4" />,
      medication: <Building2 className="h-4 w-4" />,
      reimbursement: <ArrowDownLeft className="h-4 w-4" />,
      incentive: <ArrowUpRight className="h-4 w-4" />
    }
    return icons[type as keyof typeof icons] || <FileText className="h-4 w-4" />
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || transaction.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getPaymentSummary = (): PaymentSummary => {
    const now = new Date()
    const thisYear = transactions.filter(t => t.date.getFullYear() === now.getFullYear())
    
    const totalSpent = thisYear
      .filter(t => t.type !== 'reimbursement' && t.type !== 'incentive' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalReimbursed = thisYear
      .filter(t => t.type === 'reimbursement' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalBenefits = thisYear
      .filter(t => t.type === 'benefit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalIncentives = thisYear
      .filter(t => t.type === 'incentive' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const pendingAmount = transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const monthlyAverage = totalSpent / 12

    return {
      totalSpent,
      totalReimbursed,
      totalBenefits,
      totalIncentives,
      pendingAmount,
      monthlyAverage
    }
  }

  const summary = getPaymentSummary()
  const categories = Array.from(new Set(transactions.map(t => t.category)))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>
            View and manage all your healthcare payments, benefits, and transactions
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                <p className="text-xl font-bold text-red-600">${summary.totalSpent}</p>
              </div>
              <ArrowDownLeft className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Benefits</p>
                <p className="text-xl font-bold text-green-600">${summary.totalBenefits}</p>
              </div>
              <Wallet className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Incentives</p>
                <p className="text-xl font-bold text-blue-600">${summary.totalIncentives}</p>
              </div>
              <ArrowUpRight className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reimbursed</p>
                <p className="text-xl font-bold text-purple-600">${summary.totalReimbursed}</p>
              </div>
              <ArrowDownLeft className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-orange-600">${summary.pendingAmount}</p>
              </div>
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Avg</p>
                <p className="text-xl font-bold text-gray-600">${summary.monthlyAverage.toFixed(0)}</p>
              </div>
              <Calendar className="h-6 w-6 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={view} onValueChange={(value: any) => setView(value)} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="receipts">Receipts</TabsTrigger>
          </TabsList>
          
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export History
          </Button>
        </div>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="text-sm">
                          {format(transaction.date, 'PP')}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-xs text-muted-foreground">
                            Ref: {transaction.referenceNumber}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(transaction.type)}
                          <span className="text-sm capitalize">{transaction.type}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(transaction.paymentMethod)}
                          <span className="text-sm">{getPaymentMethodName(transaction.paymentMethod)}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <span className={cn(
                          "font-medium",
                          transaction.type === 'benefit' || transaction.type === 'incentive' || transaction.type === 'reimbursement' 
                            ? "text-green-600" 
                            : "text-red-600"
                        )}>
                          {transaction.type === 'benefit' || transaction.type === 'incentive' || transaction.type === 'reimbursement' ? '+' : '-'}
                          ${transaction.amount}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={cn("text-xs", getStatusColor(transaction.status))}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(transaction.status)}
                            <span>{transaction.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <FileText className="h-4 w-4" />
                          </Button>
                          {transaction.receiptUrl && (
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredTransactions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found matching your criteria
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map(category => {
                    const categoryTotal = transactions
                      .filter(t => t.category === category && t.status === 'completed')
                      .reduce((sum, t) => sum + t.amount, 0)
                    const percentage = summary.totalSpent > 0 ? (categoryTotal / summary.totalSpent) * 100 : 0
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{category}</span>
                          <span>${categoryTotal} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 6 }, (_, i) => {
                    const month = new Date()
                    month.setMonth(month.getMonth() - i)
                    const monthName = format(month, 'MMM yyyy')
                    const monthTotal = transactions
                      .filter(t => 
                        t.date.getMonth() === month.getMonth() && 
                        t.date.getFullYear() === month.getFullYear() &&
                        t.status === 'completed'
                      )
                      .reduce((sum, t) => sum + t.amount, 0)
                    
                    return (
                      <div key={monthName} className="flex justify-between items-center">
                        <span className="text-sm">{monthName}</span>
                        <span className="font-medium">${monthTotal}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Receipts Tab */}
        <TabsContent value="receipts" className="space-y-4">
          <div className="grid gap-4">
            {transactions.filter(t => t.receiptUrl).map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{transaction.description}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(transaction.date, 'PPP')} • {transaction.referenceNumber}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">${transaction.amount}</span>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}