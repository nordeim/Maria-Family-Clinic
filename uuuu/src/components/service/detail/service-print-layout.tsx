"use client";

import React, { useEffect } from 'react';
import { useServiceData } from '@/hooks/use-service-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PhoneIcon,
  ClockIcon,
  CalendarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ServicePrintLayoutProps {
  serviceId: string;
}

export function ServicePrintLayout({ serviceId }: ServicePrintLayoutProps) {
  const { data: service } = useServiceData('', '', 'en');

  useEffect(() => {
    // Hide screen-only elements when printing
    const hideElements = () => {
      const elements = document.querySelectorAll('.no-print');
      elements.forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
    };

    const showElements = () => {
      const elements = document.querySelectorAll('.no-print');
      elements.forEach(el => {
        (el as HTMLElement).style.display = '';
      });
    };

    // Hide elements when component mounts (for print preview)
    hideElements();

    return () => {
      // Restore elements when component unmounts
      showElements();
    };
  }, []);

  if (!service) return null;

  return (
    <div className="print-only print-layout p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {service.name} - Preparation Guide
        </h1>
        <div className="text-lg text-gray-700 mb-2">
          My Family Clinic - Singapore Healthcare Services
        </div>
        <div className="text-sm text-gray-600">
          Printed on: {new Date().toLocaleDateString('en-SG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      {/* Quick Reference */}
      <Card className="mb-6 border-2 border-blue-800">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-900 flex items-center space-x-2">
            <InformationCircleIcon className="h-5 w-5" />
            <span>Quick Reference</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-700">Service:</div>
              <div className="text-gray-900">{service.name}</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Typical Duration:</div>
              <div className="text-gray-900">{service.typicalDurationMinutes} minutes</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Complexity Level:</div>
              <div className="text-gray-900">{service.complexityLevel}</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Patient ID:</div>
              <div className="text-gray-900">________________</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card className="mb-6 border-2 border-red-800">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-red-900 flex items-center space-x-2">
            <PhoneIcon className="h-5 w-5" />
            <span>Emergency Contacts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-red-700">Medical Emergency:</div>
              <div className="text-lg font-bold text-red-900">Call 995</div>
            </div>
            <div>
              <div className="font-medium text-red-700">Clinic Helpline:</div>
              <div className="text-lg font-bold text-red-900">(65) 6789 1234</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preparation Checklist */}
      <Card className="mb-6 border-2 border-gray-800">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-gray-900 flex items-center space-x-2">
            <CheckCircleIcon className="h-5 w-5" />
            <span>Preparation Checklist</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-6">
            {/* Documents */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                Documents Required
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="checkbox-print"></div>
                  <span>Valid identification (NRIC/Passport/Driver's License)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="checkbox-print"></div>
                  <span>Insurance card or medical benefits letter</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="checkbox-print"></div>
                  <span>Referral letter (if applicable)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="checkbox-print"></div>
                  <span>Previous medical records or test results</span>
                </div>
              </div>
            </div>

            {/* Medications */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                Medication Guidelines
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="checkbox-print"></div>
                  <span>List all current medications and dosages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="checkbox-print"></div>
                  <span>Discontinue blood thinners as instructed (if applicable)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="checkbox-print"></div>
                  <span>Bring actual medication bottles for review</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="checkbox-print"></div>
                  <span>Follow fasting instructions (if required)</span>
                </div>
              </div>
            </div>

            {/* Day of Appointment */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                Day of Appointment
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="checkbox-print"></div>
                  <span>Arrive 15 minutes early for check-in</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="checkbox-print"></div>
                  <span>Wear comfortable, loose-fitting clothing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="checkbox-print"></div>
                  <span>Remove jewelry and accessories (if required)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="checkbox-print"></div>
                  <span>Arrange transportation if sedation is planned</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="mb-6 border-2 border-gray-800">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-gray-900 flex items-center space-x-2">
            <ClockIcon className="h-5 w-5" />
            <span>Preparation Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-700">2+ Weeks Before</div>
              <div className="text-gray-600 mt-1">
                • Schedule appointment<br />
                • Gather medical records<br />
                • Review insurance coverage
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-700">48 Hours Before</div>
              <div className="text-gray-600 mt-1">
                • Medication adjustments<br />
                • Lifestyle changes<br />
                • Final preparations
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Day of Service</div>
              <div className="text-gray-600 mt-1">
                • Follow final instructions<br />
                • Arrive early<br />
                • Bring all documents
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions for Doctor */}
      <Card className="mb-6 border-2 border-gray-800">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-gray-900 flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>Questions to Ask Your Doctor</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="checkbox-print"></div>
              <span>What are the risks and benefits of this procedure?</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="checkbox-print"></div>
              <span>What should I expect during recovery?</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="checkbox-print"></div>
              <span>What follow-up care will I need?</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="checkbox-print"></div>
              <span>When can I resume normal activities?</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="checkbox-print"></div>
              <span>What warning signs should I watch for?</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinic Information */}
      <Card className="mb-6 border-2 border-gray-800">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-gray-900 flex items-center space-x-2">
            <MapPinIcon className="h-5 w-5" />
            <span>Clinic Locations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 text-sm">
            <div className="border-b border-gray-200 pb-2">
              <div className="font-medium text-gray-700">My Family Clinic - Orchard</div>
              <div className="text-gray-600">123 Orchard Road, #03-15, Singapore 238858</div>
              <div className="text-gray-600">Tel: (65) 6789 1234</div>
            </div>
            <div className="border-b border-gray-200 pb-2">
              <div className="font-medium text-gray-700">My Family Clinic - Novena</div>
              <div className="text-gray-600">456 Novena Road, #02-08, Singapore 313843</div>
              <div className="text-gray-600">Tel: (65) 6789 5678</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">My Family Clinic - Woodlands</div>
              <div className="text-gray-600">789 Woodlands Drive 50, #B1-12, Singapore 733894</div>
              <div className="text-gray-600">Tel: (65) 6789 9876</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Disclaimer */}
      <Card className="mb-6 border-2 border-gray-400 bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-700">
              <div className="font-medium mb-2">Medical Disclaimer:</div>
              <p>
                This information is for educational purposes only and does not constitute medical advice. 
                Always consult with your healthcare provider for personalized medical guidance. 
                For emergency situations, call 995 immediately.
              </p>
              <p className="mt-2">
                The preparation requirements and timeline may vary based on your individual health 
                status and specific procedure. Follow all instructions provided by your healthcare team.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-gray-600 border-t border-gray-400 pt-4">
        <div className="mb-2">
          <strong>My Family Clinic</strong> - Singapore Healthcare Services
        </div>
        <div>
          Website: www.myfamilyclinic.com | Email: care@myfamilyclinic.com
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Document Version 1.0 | Generated: {new Date().toISOString()}
        </div>
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          .print-only {
            display: block !important;
          }
          
          .checkbox-print {
            width: 12px;
            height: 12px;
            border: 1px solid #000;
            display: inline-block;
            margin-right: 8px;
          }
          
          body {
            font-size: 12pt;
            line-height: 1.4;
          }
          
          .print-layout {
            margin: 0;
            padding: 0.5in;
          }
          
          .border-2 {
            border-width: 2px !important;
          }
          
          .border-gray-800 {
            border-color: #1f2937 !important;
          }
          
          .border-gray-400 {
            border-color: #9ca3af !important;
          }
        }
      `}</style>
    </div>
  );
}