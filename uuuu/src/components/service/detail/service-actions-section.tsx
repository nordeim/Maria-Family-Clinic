"use client";

import React, { useState } from 'react';
import { useServiceData } from '@/hooks/use-service-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  MapPinIcon,
  PrinterIcon,
  ShareIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ServiceActionsSectionProps {
  category: string;
  serviceSlug: string;
  locale: string;
}

export function ServiceActionsSection({ category, serviceSlug, locale }: ServiceActionsSectionProps) {
  const { data: service, isLoading } = useServiceData(category, serviceSlug, locale);
  const [isShared, setIsShared] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-32 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!service) return null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${service.name} | My Family Clinic`,
          text: service.patientFriendlyDescription || service.description,
          url: window.location.href,
        });
        setIsShared(true);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      setIsShared(true);
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    // In a real app, this would save to user's favorites
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmergencyCall = () => {
    window.location.href = 'tel:995';
  };

  const handleGeneralInquiry = () => {
    window.location.href = 'tel:+6567891234';
  };

  const handleLiveChat = () => {
    // Open chat widget or navigate to chat page
    console.log('Open live chat');
  };

  return (
    <div id="booking" className="space-y-6">
      {/* Primary Action - Book Appointment */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
            <span>Ready to Book Your {service.name}?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-blue-800">
              Schedule your appointment at one of our convenient locations across Singapore.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="flex-1 bg-blue-600 hover:bg-blue-700">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Book Appointment Online
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="flex-1"
                onClick={handleGeneralInquiry}
              >
                <PhoneIcon className="h-5 w-5 mr-2" />
                Call to Book: (65) 6789 1234
              </Button>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-blue-700">
              <div className="flex items-center space-x-1">
                <ClockIcon className="h-4 w-4" />
                <span>Available 7 days a week</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPinIcon className="h-4 w-4" />
                <span>3 locations across Singapore</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Actions */}
      <Card>
        <CardHeader>
          <CardTitle>More Ways to Get Help</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Live Chat */}
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={handleLiveChat}
            >
              <ChatBubbleLeftIcon className="h-6 w-6 text-green-600" />
              <div className="text-center">
                <div className="font-medium text-sm">Live Chat</div>
                <div className="text-xs text-gray-600">Instant support</div>
              </div>
            </Button>

            {/* Emergency Contact */}
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 border-red-200 hover:bg-red-50"
              onClick={handleEmergencyCall}
            >
              <PhoneIcon className="h-6 w-6 text-red-600" />
              <div className="text-center">
                <div className="font-medium text-sm text-red-700">Emergency</div>
                <div className="text-xs text-red-600">Call 995</div>
              </div>
            </Button>

            {/* Print Preparation */}
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={handlePrint}
            >
              <PrinterIcon className="h-6 w-6 text-blue-600" />
              <div className="text-center">
                <div className="font-medium text-sm">Print Guide</div>
                <div className="text-xs text-gray-600">Preparation checklist</div>
              </div>
            </Button>

            {/* Share */}
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={handleShare}
            >
              <ShareIcon className="h-6 w-6 text-purple-600" />
              <div className="text-center">
                <div className="font-medium text-sm">
                  {isShared ? 'Shared!' : 'Share'}
                </div>
                <div className="text-xs text-gray-600">Share with others</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">General Inquiries</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="h-4 w-4 text-gray-500" />
                  <span>(65) 6789 1234</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>📧</span>
                  <span>care@myfamilyclinic.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-gray-500" />
                  <span>Mon-Fri: 8AM-8PM, Sat-Sun: 9AM-5PM</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">After Hours Support</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="h-4 w-4 text-blue-500" />
                  <span>24/7 Nurse Hotline: 1800-CARE-NOW</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🚨</span>
                  <span>Emergency: 995</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ChatBubbleLeftIcon className="h-4 w-4 text-green-500" />
                  <span>Live Chat: Available 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Insurance Verification */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <CreditCardIcon className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="font-medium text-blue-800 mb-1">Insurance Verification</h4>
              <p className="text-sm text-blue-600 mb-3">
                Check your coverage and benefits before your appointment.
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Verify Coverage
              </Button>
            </div>

            {/* Find Location */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <MapPinIcon className="h-8 w-8 text-green-600 mb-2" />
              <h4 className="font-medium text-green-800 mb-1">Find a Location</h4>
              <p className="text-sm text-green-600 mb-3">
                Locate the nearest clinic with availability for your appointment.
              </p>
              <Button size="sm" variant="outline" className="w-full">
                View Locations
              </Button>
            </div>

            {/* Save Service */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <HeartIcon className={cn(
                "h-8 w-8 mb-2",
                isFavorited ? "text-purple-600 fill-current" : "text-purple-600"
              )} />
              <h4 className="font-medium text-purple-800 mb-1">
                {isFavorited ? 'Saved to Favorites' : 'Save Service'}
              </h4>
              <p className="text-sm text-purple-600 mb-3">
                Save this service to your favorites for quick access later.
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={handleFavorite}
              >
                {isFavorited ? 'Remove' : 'Save'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Reminders */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-amber-800">
                Important Reminders Before Your Appointment
              </h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Review the preparation checklist 24-48 hours before your visit</li>
                <li>• Bring valid identification and insurance information</li>
                <li>• Arrive 15-30 minutes early for check-in</li>
                <li>• Bring a list of current medications</li>
                <li>• Contact us if you develop symptoms before your appointment</li>
              </ul>
              
              <div className="mt-3 p-2 bg-amber-100 rounded">
                <div className="flex items-center space-x-2 text-xs text-amber-700">
                  <InformationCircleIcon className="h-3 w-3" />
                  <span>
                    <strong>Medical Emergency:</strong> If you are experiencing a medical emergency, 
                    call 995 immediately or go to the nearest A&E department.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Types */}
      <Card>
        <CardHeader>
          <CardTitle>Different Ways to Book</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Standard Booking</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>Choose your preferred date and time</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>Select from available clinic locations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>Confirmation within 2 hours</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>Free appointment changes up to 24 hours</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Same-Day Service</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Call our urgent booking line</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Based on availability</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Limited time slots daily</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Same rates as standard booking</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}