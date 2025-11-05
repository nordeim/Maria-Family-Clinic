import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Calendar, Clock, MapPin, User, Phone, Mail, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '~/lib/utils';

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  services: {
    serviceId: string;
    serviceName: string;
    originalPrice: number;
    packagePrice: number;
    clinicName: string;
  }[];
  totalOriginalPrice: number;
  totalPackagePrice: number;
  savings: number;
  savingsPercentage: number;
  validityPeriod: number; // days
  maxBookings: number;
  currentBookings: number;
  isHealthierSGCovered: boolean;
  restrictions: string[];
  benefits: string[];
}

interface ServiceBookingWorkflowProps {
  serviceId: string;
  serviceName: string;
  clinicId: string;
  clinicName: string;
  packages?: ServicePackage[];
  availableTimeSlots: {
    date: string;
    time: string;
    duration: number;
    doctorName: string;
    isEmergency: boolean;
    price: number;
    capacity: number;
    availableSlots: number;
  }[];
  onConfirmBooking: (bookingData: BookingData) => void;
  onCancel: () => void;
  className?: string;
}

interface BookingData {
  selectedPackageId?: string;
  selectedSlot: {
    date: string;
    time: string;
    doctorName: string;
  };
  patientInfo: {
    name: string;
    email: string;
    phone: string;
    nric?: string;
    dateOfBirth?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
    medicalConditions: string[];
    allergies: string[];
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    isHealthierSG: boolean;
  };
  preferences: {
    preferredLanguage: string;
    reminderMethod: 'email' | 'sms' | 'both';
    specialRequests?: string;
  };
  paymentMethod: 'cash' | 'card' | 'insurance' | 'healthier_sg';
}

export function ServiceBookingWorkflow({
  serviceId,
  serviceName,
  clinicId,
  clinicName,
  packages = [],
  availableTimeSlots,
  onConfirmBooking,
  onCancel,
  className
}: ServiceBookingWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<'package' | 'time' | 'patient' | 'confirm'>('package');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string;
    time: string;
    doctorName: string;
  } | null>(null);
  const [patientInfo, setPatientInfo] = useState<BookingData['patientInfo']>({
    name: '',
    email: '',
    phone: '',
    medicalConditions: [],
    allergies: []
  });
  const [insuranceInfo, setInsuranceInfo] = useState<BookingData['insuranceInfo']>();
  const [preferences, setPreferences] = useState<BookingData['preferences']>({
    preferredLanguage: 'en',
    reminderMethod: 'email'
  });
  const [paymentMethod, setPaymentMethod] = useState<BookingData['paymentMethod']>('cash');

  const selectedPackage = packages.find(p => p.id === selectedPackageId);
  const selectedSlotData = availableTimeSlots.find(slot => 
    slot.date === selectedSlot?.date && slot.time === selectedSlot?.time
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return `S$${price.toFixed(2)}`;
  };

  const getTotalPrice = () => {
    if (selectedPackage) return selectedPackage.totalPackagePrice;
    if (selectedSlotData) return selectedSlotData.price;
    return 0;
  };

  const handleConfirm = () => {
    if (!selectedSlot) return;

    const bookingData: BookingData = {
      selectedPackageId: selectedPackageId || undefined,
      selectedSlot,
      patientInfo,
      insuranceInfo,
      preferences,
      paymentMethod
    };

    onConfirmBooking(bookingData);
  };

  const renderPackageSelection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Choose Service Package</h3>
        <Button variant="outline" onClick={() => setSelectedPackageId('')}>
          Individual Service
        </Button>
      </div>

      {/* Individual Service Option */}
      {availableTimeSlots.length > 0 && (
        <Card 
          className={cn(
            "cursor-pointer transition-all",
            selectedPackageId === '' ? "border-blue-500 bg-blue-50" : "hover:border-gray-300"
          )}
          onClick={() => setSelectedPackageId('')}
        >
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{serviceName} - Individual Service</h4>
                <p className="text-sm text-gray-600">Single appointment booking</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">
                  {formatPrice(availableTimeSlots[0]?.price || 0)}
                </div>
                {availableTimeSlots.length > 0 && (
                  <p className="text-sm text-gray-500">
                    From {availableTimeSlots[0].time}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Packages */}
      {packages.map((pkg) => (
        <Card 
          key={pkg.id}
          className={cn(
            "cursor-pointer transition-all",
            selectedPackageId === pkg.id ? "border-blue-500 bg-blue-50" : "hover:border-gray-300"
          )}
          onClick={() => setSelectedPackageId(pkg.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{pkg.name}</CardTitle>
              <div className="flex items-center gap-2">
                {pkg.isHealthierSGCovered && (
                  <Badge className="bg-green-100 text-green-800">
                    Healthier SG
                  </Badge>
                )}
                <Badge variant="destructive">
                  Save {pkg.savingsPercentage}%
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">{pkg.description}</p>
            
            <div className="space-y-2">
              {pkg.services.map((service, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{service.serviceName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 line-through">
                      {formatPrice(service.originalPrice)}
                    </span>
                    <span className="font-medium">
                      {formatPrice(service.packagePrice)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total Package Price:</span>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {formatPrice(pkg.totalPackagePrice)}
                  </div>
                  <div className="text-sm text-green-600">
                    Save {formatPrice(pkg.savings)}
                  </div>
                </div>
              </div>
            </div>

            {pkg.benefits.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mb-1">Package Benefits:</h5>
                <ul className="text-xs text-gray-600 space-y-1">
                  {pkg.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-xs text-gray-500">
              Valid for {pkg.validityPeriod} days • {pkg.currentBookings}/{pkg.maxBookings} bookings used
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTimeSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Choose Time Slot</h3>
      
      <div className="grid gap-3">
        {availableTimeSlots.map((slot, index) => {
          const isSelected = selectedSlot?.date === slot.date && selectedSlot?.time === slot.time;
          const isEmergency = slot.isEmergency;
          const isLimited = slot.availableSlots <= 3;
          
          return (
            <Card 
              key={index}
              className={cn(
                "cursor-pointer transition-all",
                isSelected ? "border-blue-500 bg-blue-50" : "hover:border-gray-300",
                isEmergency && "border-red-200 bg-red-50"
              )}
              onClick={() => setSelectedSlot({
                date: slot.date,
                time: slot.time,
                doctorName: slot.doctorName
              })}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {formatDate(slot.date)} at {slot.time}
                      </span>
                      {isEmergency && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Emergency
                        </Badge>
                      )}
                      {isLimited && (
                        <Badge variant="outline" className="text-xs text-orange-600">
                          Only {slot.availableSlots} left
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Dr. {slot.doctorName}</span>
                      <span>{Math.floor(slot.duration / 60)}h {slot.duration % 60}m</span>
                      <span>{slot.availableSlots}/{slot.capacity} available</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatPrice(slot.price)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderPatientInfo = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Patient Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={patientInfo.name}
            onChange={(e) => setPatientInfo(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={patientInfo.email}
            onChange={(e) => setPatientInfo(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={patientInfo.phone}
            onChange={(e) => setPatientInfo(prev => ({ ...prev, phone: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="nric">NRIC (Optional)</Label>
          <Input
            id="nric"
            value={patientInfo.nric || ''}
            onChange={(e) => setPatientInfo(prev => ({ ...prev, nric: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={patientInfo.dateOfBirth || ''}
            onChange={(e) => setPatientInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select value={patientInfo.gender || ''} onValueChange={(value: any) => setPatientInfo(prev => ({ ...prev, gender: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
              <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Insurance Information */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Insurance Information (Optional)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="insurance-provider">Insurance Provider</Label>
            <Input
              id="insurance-provider"
              placeholder="e.g., AIA, NTUC, Great Eastern"
              value={insuranceInfo?.provider || ''}
              onChange={(e) => setInsuranceInfo(prev => ({ ...prev, provider: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="policy-number">Policy Number</Label>
            <Input
              id="policy-number"
              value={insuranceInfo?.policyNumber || ''}
              onChange={(e) => setInsuranceInfo(prev => ({ ...prev, policyNumber: e.target.value }))}
            />
          </div>
        </div>
        
        <div className="mt-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={insuranceInfo?.isHealthierSG || false}
              onChange={(e) => setInsuranceInfo(prev => ({ ...prev, isHealthierSG: e.target.checked }))}
            />
            <span className="text-sm">Using Healthier SG coverage</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderConfirmation = () => {
    const totalPrice = getTotalPrice();
    const finalPrice = insuranceInfo?.isHealthierSG ? 0 : totalPrice;
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Confirm Your Booking</h3>
        
        {/* Booking Summary */}
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Service:</span>
                <span>{serviceName}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Clinic:</span>
                <span>{clinicName}</span>
              </div>
              
              {selectedPackage && (
                <div className="flex justify-between">
                  <span className="font-medium">Package:</span>
                  <span>{selectedPackage.name}</span>
                </div>
              )}
              
              {selectedSlot && (
                <div className="flex justify-between">
                  <span className="font-medium">Appointment:</span>
                  <span>
                    {formatDate(selectedSlot.date)} at {selectedSlot.time}
                    <br />
                    <span className="text-sm text-gray-500">
                      Dr. {selectedSlot.doctorName}
                    </span>
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="font-medium">Patient:</span>
                <span>{patientInfo.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Contact:</span>
                <span>
                  {patientInfo.email}
                  <br />
                  {patientInfo.phone}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
          <CardContent className="pt-4">
            <h4 className="font-medium mb-3">Payment Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Service Fee:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              
              {insuranceInfo?.isHealthierSG && (
                <div className="flex justify-between text-green-600">
                  <span>Healthier SG Coverage:</span>
                  <span>-{formatPrice(totalPrice)}</span>
                </div>
              )}
              
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>Total Amount:</span>
                <span>{formatPrice(finalPrice)}</span>
              </div>
              
              <div className="text-sm text-gray-600">
                Payment Method: {paymentMethod.toUpperCase()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {['package', 'time', 'patient', 'confirm'].map((step, index) => {
          const isActive = currentStep === step;
          const isCompleted = ['package', 'time', 'patient'].indexOf(currentStep) > 
                             ['package', 'time', 'patient'].indexOf(step);
          
          return (
            <div key={step} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                isActive ? "bg-blue-600 text-white" :
                isCompleted ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"
              )}>
                {index + 1}
              </div>
              {index < 3 && (
                <div className={cn(
                  "w-16 h-1 mx-2",
                  isCompleted ? "bg-green-600" : "bg-gray-300"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 'package' && renderPackageSelection()}
          {currentStep === 'time' && renderTimeSelection()}
          {currentStep === 'patient' && renderPatientInfo()}
          {currentStep === 'confirm' && renderConfirmation()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => {
            if (currentStep === 'time') setCurrentStep('package');
            else if (currentStep === 'patient') setCurrentStep('time');
            else if (currentStep === 'confirm') setCurrentStep('patient');
            else onCancel();
          }}
        >
          Back
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          
          {currentStep === 'package' && (
            <Button 
              onClick={() => setCurrentStep('time')}
              disabled={!selectedSlot && availableTimeSlots.length > 0}
            >
              Next
            </Button>
          )}
          
          {currentStep === 'time' && (
            <Button 
              onClick={() => setCurrentStep('patient')}
              disabled={!selectedSlot}
            >
              Next
            </Button>
          )}
          
          {currentStep === 'patient' && (
            <Button 
              onClick={() => setCurrentStep('confirm')}
              disabled={!patientInfo.name || !patientInfo.email || !patientInfo.phone}
            >
              Review
            </Button>
          )}
          
          {currentStep === 'confirm' && (
            <Button onClick={handleConfirm}>
              Confirm Booking
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}