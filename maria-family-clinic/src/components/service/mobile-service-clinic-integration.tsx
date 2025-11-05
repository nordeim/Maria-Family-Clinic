import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  MapPin, 
  Clock, 
  Star, 
  Phone, 
  Mail, 
  Calendar,
  Package,
  Users,
  ArrowRight,
  Filter,
  Search,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Hooks for integration functionality
import {
  useServiceAvailabilityMatrix,
  useClinicsForService,
  useServicePackages,
  useCreateReferral,
  useClinicExpertise,
  useSubmitReview,
  useRealTimeUpdates
} from '@/hooks/use-service-clinic-integration'

interface MobileServiceClinicIntegrationProps {
  serviceId: string
  serviceName: string
  onBooking?: (data: any) => void
  className?: string
}

export function MobileServiceClinicIntegration({
  serviceId,
  serviceName,
  onBooking,
  className
}: MobileServiceClinicIntegrationProps) {
  const [activeTab, setActiveTab] = useState('availability')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<any>({})
  const [referralDialogOpen, setReferralDialogOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)

  // Real-time updates
  const { refreshAvailability } = useRealTimeUpdates(true)

  // Data fetching
  const { data: availabilityMatrix, isLoading: availabilityLoading, refetch: refetchAvailability } = 
    useServiceAvailabilityMatrix(serviceId, selectedFilters)
  
  const { data: packages, isLoading: packagesLoading } = useServicePackages({
    serviceId,
    ...selectedFilters
  })
  
  const { data: expertise } = useClinicExpertise({
    serviceId,
    ...selectedFilters
  })

  // Actions
  const createReferral = useCreateReferral()
  const submitReview = useSubmitReview()

  // Auto-refresh availability every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAvailability()
    }, 30000)
    return () => clearInterval(interval)
  }, [refreshAvailability])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Trigger search with new query
  }

  const handleBooking = (clinicId: string, date: string, time: string) => {
    if (onBooking) {
      onBooking({
        serviceId,
        clinicId,
        appointmentDate: date,
        appointmentTime: time
      })
    }
  }

  const handleReferral = (data: any) => {
    createReferral.mutate({
      ...data,
      serviceId,
    }, {
      onSuccess: () => {
        setReferralDialogOpen(false)
      }
    })
  }

  const handleReview = (data: any) => {
    submitReview.mutate({
      ...data,
      serviceId,
    }, {
      onSuccess: () => {
        setReviewDialogOpen(false)
      }
    })
  }

  // Mobile-first responsive design
  return (
    <div className={cn('w-full max-w-sm mx-auto bg-white', className)}>
      <Card className="shadow-lg border-0 rounded-lg">
        <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            {serviceName}
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Find clinics, check availability, and book services
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Mobile-optimized tab navigation */}
            <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
              <TabsTrigger value="availability" className="text-xs">Availability</TabsTrigger>
              <TabsTrigger value="packages" className="text-xs">Packages</TabsTrigger>
              <TabsTrigger value="referral" className="text-xs">Referral</TabsTrigger>
              <TabsTrigger value="reviews" className="text-xs">Reviews</TabsTrigger>
            </TabsList>

            {/* Availability Tab */}
            <TabsContent value="availability" className="mt-0 space-y-3 p-4">
              {/* Search and Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search clinics..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchAvailability()}
                    className="h-8 px-3"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Refresh
                  </Button>
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                </div>
              </div>

              {/* Clinic List */}
              <div className="space-y-3">
                {availabilityLoading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : availabilityMatrix?.clinics?.length > 0 ? (
                  availabilityMatrix.clinics.map((clinic: any) => (
                    <Card key={clinic.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Clinic Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 text-sm">{clinic.name}</h3>
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-600">{clinic.distance}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-medium">{clinic.rating}</span>
                              <span className="text-xs text-gray-500">({clinic.reviewCount})</span>
                            </div>
                          </div>

                          {/* Availability Status */}
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={clinic.availability?.status === 'AVAILABLE' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {clinic.availability?.status}
                            </Badge>
                            <span className="text-xs text-gray-600">
                              {clinic.availability?.nextAvailable}
                            </span>
                          </div>

                          {/* Quick Actions */}
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleBooking(clinic.id, 'today', '10:00')}
                              className="h-8 text-xs"
                              disabled={clinic.availability?.status !== 'AVAILABLE'}
                            >
                              Book Now
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                            >
                              <Phone className="w-3 h-3 mr-1" />
                              Call
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No clinics available</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Packages Tab */}
            <TabsContent value="packages" className="mt-0 space-y-3 p-4">
              <div className="space-y-3">
                {packagesLoading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : packages?.length > 0 ? (
                  packages.map((pkg: any) => (
                    <Card key={pkg.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 text-sm">{pkg.name}</h3>
                              <p className="text-xs text-gray-600 mt-1">{pkg.description}</p>
                            </div>
                            {pkg.discountPercent && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                -{pkg.discountPercent}%
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-lg font-semibold text-gray-900">
                                ${pkg.packagePrice}
                              </span>
                              {pkg.originalPrice && (
                                <span className="text-sm text-gray-500 line-through ml-2">
                                  ${pkg.originalPrice}
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-600">Save</div>
                              <div className="text-sm font-medium text-green-600">
                                ${pkg.discountAmount || 0}
                              </div>
                            </div>
                          </div>

                          <Button
                            className="w-full h-8 text-xs"
                            onClick={() => handleBooking(pkg.clinicId, 'today', '10:00')}
                          >
                            Book Package
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No packages available</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Referral Tab */}
            <TabsContent value="referral" className="mt-0 space-y-3 p-4">
              <div className="space-y-4">
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-medium text-gray-900 mb-2">Referral Services</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Need specialized care? Get referrals to the best clinics for your needs.
                  </p>
                </div>

                <Dialog open={referralDialogOpen} onOpenChange={setReferralDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full h-10">
                      Create Referral
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-lg">Create Referral</DialogTitle>
                      <DialogDescription>
                        Refer this service to another clinic or specialist
                      </DialogDescription>
                    </DialogHeader>
                    <ReferralForm onSubmit={handleReferral} isLoading={createReferral.isPending} />
                  </DialogContent>
                </Dialog>

                {/* Expertise Display */}
                {expertise?.length > 0 && (
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Expertise Levels</h4>
                      <div className="space-y-2">
                        {expertise.slice(0, 3).map((exp: any) => (
                          <div key={exp.id} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{exp.clinicName}</span>
                            <Badge variant="outline" className="text-xs">
                              {exp.expertiseLevel}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-0 space-y-3 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Reviews & Ratings</h3>
                  <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        Write Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-lg">Write a Review</DialogTitle>
                        <DialogDescription>
                          Share your experience with this service
                        </DialogDescription>
                      </DialogHeader>
                      <ReviewForm onSubmit={handleReview} isLoading={submitReview.isPending} />
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Review Summary */}
                <Card className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-lg">4.8</span>
                        <span className="text-sm text-gray-600">(127 reviews)</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-8">5★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <span className="text-sm text-gray-600">95</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-8">4★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                        <span className="text-sm text-gray-600">19</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Reviews */}
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs text-gray-600">U</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium">User Name</div>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-gray-600">5.0</span>
                                <Badge variant="secondary" className="text-xs ml-1">
                                  Verified
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">2 days ago</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          Great service and professional staff. Highly recommended for this type of treatment.
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Referral Form Component
interface ReferralFormProps {
  onSubmit: (data: any) => void
  isLoading: boolean
}

function ReferralForm({ onSubmit, isLoading }: ReferralFormProps) {
  const [formData, setFormData] = useState({
    referringClinicId: '',
    referredClinicId: '',
    urgencyLevel: 'ROUTINE',
    clinicalNotes: '',
    preferredDate: '',
    specialRequests: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="urgency">Urgency Level</Label>
        <select
          id="urgency"
          value={formData.urgencyLevel}
          onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
          required
        >
          <option value="ROUTINE">Routine</option>
          <option value="URGENT">Urgent</option>
          <option value="SAME_DAY">Same Day</option>
          <option value="EMERGENCY">Emergency</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clinicalNotes">Clinical Notes</Label>
        <Textarea
          id="clinicalNotes"
          value={formData.clinicalNotes}
          onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
          placeholder="Provide relevant clinical information..."
          className="text-sm"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredDate">Preferred Date</Label>
        <Input
          id="preferredDate"
          type="date"
          value={formData.preferredDate}
          onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
          className="text-sm"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Referral'}
        </Button>
      </div>
    </form>
  )
}

// Review Form Component
interface ReviewFormProps {
  onSubmit: (data: any) => void
  isLoading: boolean
}

function ReviewForm({ onSubmit, isLoading }: ReviewFormProps) {
  const [formData, setFormData] = useState({
    clinicId: '',
    rating: 5,
    review: '',
    isVerified: true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="rating">Rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              className={cn(
                'p-1',
                star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
              )}
            >
              <Star className="w-6 h-6 fill-current" />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="review">Review</Label>
        <Textarea
          id="review"
          value={formData.review}
          onChange={(e) => setFormData({ ...formData, review: e.target.value })}
          placeholder="Share your experience..."
          className="text-sm"
          rows={4}
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="verified"
          checked={formData.isVerified}
          onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="verified" className="text-sm">
          I confirm this review is based on actual experience
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  )
}