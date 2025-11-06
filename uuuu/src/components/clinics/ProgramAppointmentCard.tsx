"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  FileText,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Shield,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface ProgramService {
  clinicServiceId: string
  serviceId: string
  serviceName: string
  serviceDescription: string
  category: string
  typicalDuration: number
  pricing: {
    basePrice?: number
    healthierSGPrice?: number
    savings?: number | null
    savingsPercentage?: number | null
  }
  bookingInfo: {
    appointmentRequired: boolean
    walkInAllowed: boolean
    isAvailable: boolean
  }
  capacity: {
    dailyLimit: number | null
    currentBookings: number | null
    available: number | null
    utilizationRate: number | null
  }
  upcomingAvailability: Array<{
    date: Date
    startTime: string
    endTime: string
    totalSlots: number
    bookedSlots: number
    availableSlots: number
  }>
}

interface ProgramAppointmentCardProps {
  clinicId: string
  clinicName: string
  services: ProgramService[]
  onBookAppointment: (appointmentData: ProgramAppointmentData) => void
  onRequestCallback?: () => void
  onCancel?: () => void
  className?: string
}

interface ProgramAppointmentData {
  clinicId: string
  serviceId: string
  serviceName: string
  appointmentDate: Date
  appointmentTime: string
  patientInfo: {
    name: string
    phone: string
    email: string
    nric?: string
    dateOfBirth?: Date
  }
  medicalInfo: {
    conditions: string[]
    medications: string[]
    allergies: string[]
    specialRequests?: string
  }
  insuranceInfo: {
    hasInsurance: boolean
    insuranceProvider?: string
    policyNumber?: string
    prefersHealthierSG: boolean
  }
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
}

export function ProgramAppointmentCard({
  clinicId,
  clinicName,
  services,
  onBookAppointment,
  onRequestCallback,
  onCancel,
  className
}: ProgramAppointmentCardProps) {
  const [selectedService, setSelectedService] = useState<ProgramService | null>(null)
  const [appointmentDate, setAppointmentDate] = useState<Date>()
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    email: '',
    nric: '',
    conditions: [] as string[],
    medications: [] as string[],
    allergies: [] as string[],
    specialRequests: '',
    hasInsurance: false,
    insuranceProvider: '',
    policyNumber: '',
    prefersHealthierSG: true,
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleArrayFieldChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof typeof prev] as string[]
      const newArray = checked 
        ? [...currentArray, value]
        : currentArray.filter(item => item !== value)
      return { ...prev, [field]: newArray }
    })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.patientName.trim()) newErrors.patientName = 'Patient name is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!selectedService) newErrors.service = 'Please select a service'
    if (!appointmentDate) newErrors.appointmentDate = 'Please select an appointment date'
    if (!selectedTimeSlot) newErrors.appointmentTime = 'Please select a time slot'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const appointmentData: ProgramAppointmentData = {
        clinicId,
        serviceId: selectedService!.serviceId,
        serviceName: selectedService!.serviceName,
        appointmentDate: appointmentDate!,
        appointmentTime: selectedTimeSlot,
        patientInfo: {
          name: formData.patientName,
          phone: formData.phone,
          email: formData.email,
          nric: formData.nric || undefined
        },
        medicalInfo: {
          conditions: formData.conditions,
          medications: formData.medications,
          allergies: formData.allergies,
          specialRequests: formData.specialRequests || undefined
        },
        insuranceInfo: {
          hasInsurance: formData.hasInsurance,
          insuranceProvider: formData.insuranceProvider || undefined,
          policyNumber: formData.policyNumber || undefined,
          prefersHealthierSG: formData.prefersHealthierSG
        },
        emergencyContact: formData.emergencyContactName && formData.emergencyContactPhone ? {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelationship
        } : undefined
      }

      await onBookAppointment(appointmentData)
    } catch (error) {
      console.error('Failed to book appointment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableSlots = selectedService?.upcomingAvailability
    .find(availability => 
      appointmentDate && 
      format(availability.date, 'yyyy-MM-dd') === format(appointmentDate, 'yyyy-MM-dd')
    )?.availableSlots || 0

  return (
    <Card className={cn("max-w-2xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Book Healthier SG Program Appointment
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Book an appointment at {clinicName} for Healthier SG program services
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Selection */}
          <div className="space-y-3">
            <Label>Select Healthier SG Service</Label>
            <div className="grid gap-3">
              {services.map((service) => (
                <div
                  key={service.clinicServiceId}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-colors",
                    selectedService?.clinicServiceId === service.clinicServiceId
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => setSelectedService(service)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{service.serviceName}</h4>
                      <p className="text-sm text-muted-foreground">{service.serviceDescription}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{service.typicalDuration} min</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {service.category}
                        </Badge>
                        {service.pricing.healthierSGPrice && (
                          <Badge className="text-xs bg-green-600">
                            <Shield className="h-3 w-3 mr-1" />
                            ${service.pricing.healthierSGPrice} Healthier SG
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {service.capacity.available !== null && (
                        <Badge 
                          variant={service.capacity.available > 0 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {service.capacity.available > 0 ? 
                            `${service.capacity.available} available` : 'Fully booked'
                          }
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.service && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.service}
              </p>
            )}
          </div>

          <Separator />

          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Appointment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !appointmentDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {appointmentDate ? format(appointmentDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={appointmentDate}
                    onSelect={setAppointmentDate}
                    disabled={(date) => date < new Date() || date.getDay() === 0}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.appointmentDate && (
                <p className="text-sm text-red-600">{errors.appointmentDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Time Slot</Label>
              <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {selectedService?.upcomingAvailability
                    .filter(availability => 
                      !appointmentDate || 
                      format(availability.date, 'yyyy-MM-dd') === format(appointmentDate, 'yyyy-MM-dd')
                    )
                    .map((availability, index) => (
                      <SelectItem 
                        key={index} 
                        value={`${availability.startTime}-${availability.endTime}`}
                        disabled={availability.availableSlots === 0}
                      >
                        {availability.startTime} - {availability.endTime} 
                        ({availability.availableSlots} slots available)
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              {errors.appointmentTime && (
                <p className="text-sm text-red-600">{errors.appointmentTime}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Patient Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">Full Name *</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => handleInputChange('patientName', e.target.value)}
                  placeholder="Enter full name"
                />
                {errors.patientName && (
                  <p className="text-sm text-red-600">{errors.patientName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+65 9123 4567"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="patient@email.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nric">NRIC (Optional)</Label>
                <Input
                  id="nric"
                  value={formData.nric}
                  onChange={(e) => handleInputChange('nric', e.target.value)}
                  placeholder="S1234567A"
                />
              </div>
            </div>
          </div>

          {/* Health Information */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Health Information
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Medical Conditions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Arthritis', 'Depression'].map((condition) => (
                    <div key={condition} className="flex items-center space-x-2">
                      <Checkbox
                        id={`condition-${condition}`}
                        checked={formData.conditions.includes(condition)}
                        onCheckedChange={(checked) => 
                          handleArrayFieldChange('conditions', condition, checked as boolean)
                        }
                      />
                      <Label htmlFor={`condition-${condition}`} className="text-sm">{condition}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="medications">Current Medications</Label>
                <Textarea
                  id="medications"
                  value={formData.medications.join(', ')}
                  onChange={(e) => handleInputChange('medications', e.target.value.split(',').map(m => m.trim()))}
                  placeholder="List your current medications (comma-separated)"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies.join(', ')}
                  onChange={(e) => handleInputChange('allergies', e.target.value.split(',').map(a => a.trim()))}
                  placeholder="List any allergies (comma-separated)"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequests">Special Requests or Notes</Label>
                <Textarea
                  id="specialRequests"
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  placeholder="Any special requirements or notes for the appointment"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Insurance and Payment */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Insurance & Payment
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasInsurance"
                  checked={formData.hasInsurance}
                  onCheckedChange={(checked) => handleInputChange('hasInsurance', checked)}
                />
                <Label htmlFor="hasInsurance">I have health insurance</Label>
              </div>

              {formData.hasInsurance && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                    <Input
                      id="insuranceProvider"
                      value={formData.insuranceProvider}
                      onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                      placeholder="e.g., AIA, Great Eastern"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policyNumber">Policy Number</Label>
                    <Input
                      id="policyNumber"
                      value={formData.policyNumber}
                      onChange={(e) => handleInputChange('policyNumber', e.target.value)}
                      placeholder="Policy number"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="prefersHealthierSG"
                  checked={formData.prefersHealthierSG}
                  onCheckedChange={(checked) => handleInputChange('prefersHealthierSG', checked)}
                />
                <Label htmlFor="prefersHealthierSG" className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-green-600" />
                  Prefer Healthier SG subsidized pricing
                </Label>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="font-medium">Emergency Contact (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Name</Label>
                <Input
                  id="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                  placeholder="Contact name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Phone</Label>
                <Input
                  id="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                  placeholder="+65 9123 4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                <Select value={formData.emergencyContactRelationship} onValueChange={(value) => handleInputChange('emergencyContactRelationship', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Appointment Summary */}
          {selectedService && appointmentDate && selectedTimeSlot && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Appointment Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium">{selectedService.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">{format(appointmentDate, 'PPP')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-medium">{selectedTimeSlot.replace('-', ' - ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{selectedService.typicalDuration} minutes</span>
                </div>
                {selectedService.pricing.healthierSGPrice && formData.prefersHealthierSG && (
                  <div className="flex justify-between text-green-700">
                    <span>Healthier SG Price:</span>
                    <span className="font-medium">${selectedService.pricing.healthierSGPrice}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Zap className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Book Appointment
                </>
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            {onRequestCallback && (
              <Button type="button" variant="secondary" onClick={onRequestCallback}>
                Request Callback
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export type { ProgramAppointmentData, ProgramService }