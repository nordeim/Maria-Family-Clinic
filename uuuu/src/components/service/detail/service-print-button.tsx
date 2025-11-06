"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { PrinterIcon } from '@heroicons/react/24/outline';

interface ServicePrintButtonProps {
  serviceSlug: string;
  section?: string;
  className?: string;
}

export function ServicePrintButton({ serviceSlug, section, className }: ServicePrintButtonProps) {
  const handlePrint = () => {
    // Create print-specific content
    const printContent = generatePrintContent(serviceSlug, section);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${serviceSlug.replace('-', ' ')} - Preparation Guide</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; font-size: 12pt; }
              .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
              .section { margin-bottom: 20px; page-break-inside: avoid; }
              .section-title { font-weight: bold; font-size: 14pt; margin-bottom: 10px; }
              .checklist { margin-left: 20px; }
              .checklist-item { margin-bottom: 8px; }
              .checkbox { width: 12px; height: 12px; border: 1px solid #000; display: inline-block; margin-right: 8px; }
              .important { background: #f0f0f0; padding: 10px; border: 1px solid #ccc; }
              .disclaimer { margin-top: 20px; font-size: 10pt; color: #666; }
              .contact { margin-top: 10px; font-size: 11pt; font-weight: bold; }
              .watermark { position: fixed; top: 0; right: 0; opacity: 0.1; font-size: 20pt; }
            }
            @media screen {
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              .screen-only { display: block; }
              .print-only { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${serviceSlug.replace('-', ' ')} - Preparation Guide</h1>
            <p>My Family Clinic - Singapore Healthcare Services</p>
            <p>Printed on: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="watermark">My Family Clinic</div>
          
          ${printContent}
          
          <div class="disclaimer">
            <strong>Medical Disclaimer:</strong> This information is for educational purposes only and does not constitute medical advice. Always consult with your healthcare provider for personalized medical guidance. For emergency situations, call 995.
            <br><br>
            <strong>Contact Information:</strong><br>
            My Family Clinic<br>
            Tel: (65) 6789 1234<br>
            Website: www.myfamilyclinic.com<br>
            Address: Singapore Healthcare Centre
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrint}
      className={`flex items-center space-x-2 ${className}`}
      aria-label="Print preparation checklist"
    >
      <PrinterIcon className="h-4 w-4" />
      <span className="hidden sm:inline">Print</span>
    </Button>
  );
}

function generatePrintContent(serviceSlug: string, section?: string): string {
  // This would typically fetch the actual service data
  // For now, return template content
  return `
    <div class="section">
      <div class="section-title">Pre-Appointment Preparation</div>
      <div class="important">
        <strong>Important:</strong> Please complete all required items marked with [Required]. 
        Contact us if you have questions about any preparation steps.
      </div>
    </div>

    <div class="section">
      <div class="section-title">Documents Required</div>
      <div class="checklist">
        <div class="checklist-item">
          <div class="checkbox"></div>
          Valid identification (NRIC/Passport/Driver's License)
        </div>
        <div class="checklist-item">
          <div class="checkbox"></div>
          Insurance card or medical benefits letter
        </div>
        <div class="checklist-item">
          <div class="checkbox"></div>
          Referral letter (if applicable)
        </div>
        <div class="checklist-item">
          <div class="checkbox"></div>
          Previous medical records or test results
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Medication Guidelines</div>
      <div class="checklist">
        <div class="checklist-item">
          <div class="checkbox"></div>
          List all current medications and dosages
        </div>
        <div class="checklist-item">
          <div class="checkbox"></div>
          Discontinue blood thinners as instructed (if applicable)
        </div>
        <div class="checklist-item">
          <div class="checkbox"></div>
          Bring actual medication bottles for review
        </div>
        <div class="checklist-item">
          <div class="checkbox"></div>
          Follow fasting instructions (if required)
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Day of Appointment</div>
      <div class="checklist">
        <div class="checklist-item">
          <div class="checkbox"></div>
          Arrive 15 minutes early for check-in
        </div>
        <div class="checklist-item">
          <div class="checkbox"></div>
          Wear comfortable, loose-fitting clothing
        </div>
        <div class="checklist-item">
          <div class="checkbox"></div>
          Remove jewelry and accessories (if required)
        </div>
        <div class="checklist-item">
          <div class="checkbox"></div>
          Arrange transportation if sedation is planned
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Questions to Ask Your Doctor</div>
      <div class="checklist">
        <div class="checklist-item">
          <div class="checkbox"></div>
          What are the risks and benefits of this procedure?
        </div>
        <div class="checklist-item">
          <div class="checkbox"></div>
          What should I expect during recovery?
        </div>
        <div class="checklist-item">
          <div class="checkbox"></div>
          What follow-up care will I need?
        </div>
        <div class="checklist-item">
          <div class="checkbox"></div>
          When can I resume normal activities?
        </div>
      </div>
    </div>
  `;
}