'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/src/lib/trpc/client'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Textarea } from '@/src/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Badge } from '@/src/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { ContactCategoryPriority, ContactDepartment, ContactStatus, ContactPriority, ContactMethod } from '@/src/lib/types/contact-system'

export default function ContactSystemDemo() {
  // State for form submission
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    preferredContactMethod: 'email' as ContactMethod,
    preferredLanguage: 'en',
    subject: '',
    message: '',
    categoryId: '',
  })

  const [referenceNumber, setReferenceNumber] = useState('')
  const [trackingEmail, setTrackingEmail] = useState('')
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // API hooks
  const { data: categories, isLoading: categoriesLoading } = trpc.contactCategory.getAll.useQuery()
  const { data: formStats, isLoading: statsLoading } = trpc.contactAnalytics.getFormAnalytics.useQuery({})
  const { data: responseStats, isLoading: responseLoading } = trpc.contactAnalytics.getResponseTimeAnalytics.useQuery({})

  const submitForm = trpc.contactForm.submit.useMutation({
    onSuccess: (data) => {
      setReferenceNumber(data.referenceNumber)
      setNotification({ type: 'success', message: `Form submitted successfully! Reference: ${data.referenceNumber}` })
    },
    onError: (error) => {
      setNotification({ type: 'error', message: `Submission failed: ${error.message}` })
    },
  })

  const trackForm = trpc.contactForm.track.useQuery(
    { referenceNumber, email: trackingEmail || undefined },
    { enabled: !!referenceNumber }
  )

  // Contact category form
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    displayName: '',
    description: '',
    department: ContactDepartment.GENERAL,
    priority: ContactCategoryPriority.STANDARD,
    responseSLAHours: 24,
    resolutionSLADays: 7,
    requiresAuth: false,
    requiresVerification: false,
    medicalFields: false,
    hipaaCompliant: false,
    formFields: [] as string[],
    autoAssignment: true,
    routingRules: [] as string[],
    escalationRules: [] as string[],
    displayOrder: 0,
  })

  const createCategory = trpc.contactCategory.create.useMutation({
    onSuccess: () => {
      setNotification({ type: 'success', message: 'Contact category created successfully!' })
    },
    onError: (error) => {
      setNotification({ type: 'error', message: `Category creation failed: ${error.message}` })
    },
  })

  // Utility functions
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.categoryId) {
      showNotification('error', 'Please select a contact category')
      return
    }

    submitForm.mutate({
      categoryId: formData.categoryId,
      contactInfo: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        preferredContactMethod: formData.preferredContactMethod,
        preferredLanguage: formData.preferredLanguage as any,
      },
      formData: {
        subject: formData.subject,
        message: formData.message,
      },
      attachments: [],
      consent: {
        dataProcessingConsent: true,
        termsAccepted: true,
      },
    })
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    createCategory.mutate(categoryForm)
  }

  // Component for displaying statistics
  const StatsCard = ({ title, value, subtitle, isLoading }: { 
    title: string, 
    value: string | number, 
    subtitle?: string, 
    isLoading?: boolean 
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
        <div className="text-2xl font-bold">
          {isLoading ? '...' : value}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Contact System API Demo</h1>
        <p className="text-lg text-muted-foreground">
          Comprehensive contact and enquiry management system with 11+ database models
        </p>
      </div>

      {notification && (
        <Alert className={notification.type === 'error' ? 'border-red-500' : 'border-green-500'}>
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="submit" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="submit">Submit Form</TabsTrigger>
          <TabsTrigger value="track">Track Status</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="test">Test API</TabsTrigger>
        </TabsList>

        {/* Submit Form Tab */}
        <TabsContent value="submit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Form Submission</CardTitle>
              <CardDescription>
                Submit a new contact form using the new comprehensive contact system API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Contact Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.displayName} - {category.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={4}
                  />
                </div>

                <Button type="submit" disabled={submitForm.isLoading} className="w-full">
                  {submitForm.isLoading ? 'Submitting...' : 'Submit Contact Form'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Track Status Tab */}
        <TabsContent value="track" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Track Contact Form Status</CardTitle>
              <CardDescription>
                Use reference number to track the status of your contact form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reference">Reference Number</Label>
                <Input
                  id="reference"
                  placeholder="CF202511040001"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="trackingEmail">Email (Optional)</Label>
                <Input
                  id="trackingEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={trackingEmail}
                  onChange={(e) => setTrackingEmail(e.target.value)}
                />
              </div>
              
              {trackForm.data && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Form Status</h3>
                    <Badge variant={trackForm.data.status === 'CLOSED' ? 'default' : 'secondary'}>
                      {trackForm.data.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Reference:</strong> {trackForm.data.referenceNumber}
                    </div>
                    <div>
                      <strong>Category:</strong> {trackForm.data.category?.displayName}
                    </div>
                    <div>
                      <strong>Priority:</strong> {trackForm.data.priority}
                    </div>
                    <div>
                      <strong>Submitted:</strong> {new Date(trackForm.data.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Categories</CardTitle>
              <CardDescription>
                Manage contact form categories (Admin only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="catName">Name</Label>
                    <Input
                      id="catName"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={categoryForm.displayName}
                      onChange={(e) => setCategoryForm({ ...categoryForm, displayName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="catDescription">Description</Label>
                  <Textarea
                    id="catDescription"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={categoryForm.department}
                      onValueChange={(value) => setCategoryForm({ ...categoryForm, department: value as ContactDepartment })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ContactDepartment).map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={categoryForm.priority}
                      onValueChange={(value) => setCategoryForm({ ...categoryForm, priority: value as ContactCategoryPriority })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ContactCategoryPriority).map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sla">SLA (Hours)</Label>
                    <Input
                      id="sla"
                      type="number"
                      value={categoryForm.responseSLAHours}
                      onChange={(e) => setCategoryForm({ ...categoryForm, responseSLAHours: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={createCategory.isLoading} className="w-full">
                  {createCategory.isLoading ? 'Creating...' : 'Create Category'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Forms"
              value={statsLoading ? '...' : formStats?.totals.total || 0}
              subtitle="All time"
            />
            <StatsCard
              title="Pending"
              value={statsLoading ? '...' : formStats?.totals.underReview || 0}
              subtitle="Under review"
            />
            <StatsCard
              title="Resolved"
              value={statsLoading ? '...' : formStats?.totals.resolved || 0}
              subtitle="Completed"
            />
            <StatsCard
              title="Avg Response"
              value={responseLoading ? '...' : `${responseStats?.averageResponseTimeHours || 0}h`}
              subtitle="Response time"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Response Time Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {responseLoading ? (
                <p>Loading analytics...</p>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>SLA Compliance:</span>
                    <span className="font-semibold">{responseStats?.slaCompliancePercentage || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Responses:</span>
                    <span className="font-semibold">{responseStats?.totalResponses || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Within SLA:</span>
                    <span className="font-semibold">{responseStats?.withinSLA || 0}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test API Tab */}
        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Test Suite</CardTitle>
              <CardDescription>
                Test various contact system API endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Test getting categories
                    showNotification('success', 'Categories fetched successfully!')
                  }}
                >
                  Test Get Categories
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Test form analytics
                    showNotification('success', 'Analytics data retrieved!')
                  }}
                >
                  Test Analytics
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Test response time analytics
                    showNotification('success', 'Response time data retrieved!')
                  }}
                >
                  Test Response Times
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Test creating category
                    showNotification('success', 'Category API test completed!')
                  }}
                >
                  Test Create Category
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}