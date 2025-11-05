"use client";

import React, { useState, useEffect } from 'react';
import { useServiceData } from '@/hooks/use-service-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronDownIcon, 
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  PillIcon,
  HeartIcon,
  CalendarIcon,
  ClockIcon,
  PrinterIcon,
  DownloadIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ServicePreparationSectionProps {
  category: string;
  serviceSlug: string;
  locale: string;
}

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  description?: string;
  isRequired: boolean;
  timeline?: string;
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
}

interface PreparationCategory {
  key: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  description: string;
}

export function ServicePreparationSection({ category, serviceSlug, locale }: ServicePreparationSectionProps) {
  const { data: service, isLoading } = useServiceData(category, serviceSlug, locale);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['preparation']));

  // Load saved checklist state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`checklist-${category}-${serviceSlug}`);
    if (saved) {
      setCompletedItems(new Set(JSON.parse(saved)));
    }
  }, [category, serviceSlug]);

  // Save checklist state to localStorage
  useEffect(() => {
    localStorage.setItem(
      `checklist-${category}-${serviceSlug}`, 
      JSON.stringify(Array.from(completedItems))
    );
  }, [completedItems, category, serviceSlug]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-96 bg-gray-200 rounded" />
      </div>
    );
  }

  if (!service) return null;

  // Comprehensive preparation checklist
  const checklistItems: ChecklistItem[] = service.checklistItems || [
    // General Preparation (1-2 weeks before)
    {
      id: '1',
      category: 'preparation',
      item: 'Schedule your appointment',
      description: 'Book your consultation and confirm appointment date and time',
      isRequired: true,
      timeline: '2 weeks before',
      priority: 'high'
    },
    {
      id: '2',
      category: 'preparation',
      item: 'Gather current medications',
      description: 'List all medications, supplements, and dosages you are currently taking',
      isRequired: true,
      timeline: '1 week before',
      priority: 'high'
    },
    {
      id: '3',
      category: 'preparation',
      item: 'Collect medical records',
      description: 'Gather previous test results, imaging reports, and medical history documents',
      isRequired: false,
      timeline: '1 week before',
      priority: 'medium'
    },
    {
      id: '4',
      category: 'preparation',
      item: 'Insurance verification',
      description: 'Confirm your insurance coverage and obtain any necessary pre-authorization',
      isRequired: true,
      timeline: '3-5 days before',
      priority: 'high'
    },

    // Documents (1 week before)
    {
      id: '5',
      category: 'documents',
      item: 'Valid identification document',
      description: 'NRIC, passport, or driver\'s license (must be valid and current)',
      isRequired: true,
      timeline: '2 days before',
      priority: 'high'
    },
    {
      id: '6',
      category: 'documents',
      item: 'Insurance card or letter',
      description: 'Current insurance information for coverage verification',
      isRequired: true,
      timeline: '2 days before',
      priority: 'high'
    },
    {
      id: '7',
      category: 'documents',
      item: 'Referral letter',
      description: 'Bring referral letter if you were referred by another healthcare provider',
      isRequired: false,
      timeline: '1 day before',
      priority: 'medium'
    },
    {
      id: '8',
      category: 'documents',
      item: 'Medical history form',
      description: 'Complete and bring the pre-visit medical history questionnaire',
      isRequired: true,
      timeline: '1 day before',
      priority: 'high'
    },

    // Medications (48 hours before)
    {
      id: '9',
      category: 'medications',
      item: 'Review medication instructions',
      description: 'Check with your doctor about which medications to continue or discontinue',
      isRequired: true,
      timeline: '48 hours before',
      priority: 'high'
    },
    {
      id: '10',
      category: 'medications',
      item: 'Discontinue blood thinners',
      description: 'If instructed, stop blood-thinning medications as directed by your doctor',
      isRequired: service.requiresAnticoagulantAdjustment || false,
      timeline: '48-72 hours before',
      priority: 'high'
    },
    {
      id: '11',
      category: 'medications',
      item: 'Bring actual medication bottles',
      description: 'Bring all current medication bottles for healthcare provider review',
      isRequired: false,
      timeline: 'Day of appointment',
      priority: 'medium'
    },

    // Lifestyle (24-48 hours before)
    {
      id: '12',
      category: 'lifestyle',
      item: 'Avoid alcohol consumption',
      description: 'Refrain from alcohol for 24-48 hours before your procedure',
      isRequired: service.requiresAlcoholAvoidance || false,
      timeline: '24-48 hours before',
      priority: 'high'
    },
    {
      id: '13',
      category: 'lifestyle',
      item: 'Stop smoking',
      description: 'Avoid smoking for at least 24 hours before your appointment',
      isRequired: service.requiresSmokingCessation || false,
      timeline: '24 hours before',
      priority: 'high'
    },
    {
      id: '14',
      category: 'lifestyle',
      item: 'Arrange transportation',
      description: 'Plan for someone to drive you home if sedation is involved',
      isRequired: service.requiresSedation || false,
      timeline: '1 day before',
      priority: 'high'
    },

    // Day of Appointment
    {
      id: '15',
      category: 'day-of',
      item: 'Follow fasting instructions',
      description: 'Do not eat or drink if instructed (typically 6-8 hours before)',
      isRequired: service.requiresFasting || false,
      timeline: 'Day of appointment',
      priority: 'high'
    },
    {
      id: '16',
      category: 'day-of',
      item: 'Wear comfortable clothing',
      description: 'Choose loose-fitting, easily removable clothing and avoid jewelry',
      isRequired: true,
      timeline: 'Day of appointment',
      priority: 'medium'
    },
    {
      id: '17',
      category: 'day-of',
      item: 'Arrive early',
      description: 'Arrive 15-30 minutes early for check-in and registration',
      isRequired: true,
      timeline: 'Day of appointment',
      priority: 'high'
    },
    {
      id: '18',
      category: 'day-of',
      item: 'Remove nail polish',
      description: 'Remove nail polish from at least one finger (for monitoring equipment)',
      isRequired: service.requiresNailPolishRemoval || false,
      timeline: 'Day of appointment',
      priority: 'medium'
    }
  ];

  const requiredItems = checklistItems.filter(item => item.isRequired);
  const completedRequiredItems = checklistItems.filter(item => item.isRequired && completedItems.has(item.id));
  
  const overallProgress = requiredItems.length > 0 
    ? Math.round((completedRequiredItems.length / requiredItems.length) * 100)
    : 0;

  const categories: PreparationCategory[] = [
    {
      key: 'preparation',
      name: 'General Preparation',
      icon: ClipboardDocumentListIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Initial steps to prepare for your appointment'
    },
    {
      key: 'documents',
      name: 'Documents Required',
      icon: DocumentTextIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Identification and paperwork needed'
    },
    {
      key: 'medications',
      name: 'Medication Management',
      icon: PillIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Instructions for medication adjustments'
    },
    {
      key: 'lifestyle',
      name: 'Lifestyle Changes',
      icon: HeartIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Dietary and lifestyle modifications'
    },
    {
      key: 'day-of',
      name: 'Day of Appointment',
      icon: CalendarIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Final preparations on the day of your visit'
    }
  ];

  const toggleItem = (itemId: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId);
    } else {
      newCompleted.add(itemId);
    }
    setCompletedItems(newCompleted);
  };

  const toggleCategory = (categoryKey: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryKey)) {
      newExpanded.delete(categoryKey);
    } else {
      newExpanded.add(categoryKey);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryProgress = (categoryKey: string) => {
    const categoryItems = checklistItems.filter(item => item.category === categoryKey);
    const requiredCategoryItems = categoryItems.filter(item => item.isRequired);
    const completedCategoryItems = requiredCategoryItems.filter(item => completedItems.has(item.id));
    
    return requiredCategoryItems.length > 0 
      ? Math.round((completedCategoryItems.length / requiredCategoryItems.length) * 100)
      : 0;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-700 bg-red-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'low': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const printChecklist = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${service.name} - Preparation Checklist</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .checklist-item { margin: 8px 0; display: flex; align-items: center; }
            .checkbox { width: 15px; height: 15px; border: 1px solid #000; margin-right: 10px; }
            .priority { font-size: 10px; padding: 2px 6px; border-radius: 3px; margin-left: 10px; }
            .required { background: #ffe6e6; }
            .optional { background: #f0f0f0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${service.name} - Preparation Checklist</h1>
            <p>My Family Clinic - Singapore</p>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
          </div>
          ${categories.map(category => {
            const categoryItems = checklistItems.filter(item => item.category === category.key);
            return `
              <div class="section">
                <h2>${category.name}</h2>
                ${categoryItems.map(item => `
                  <div class="checklist-item">
                    <div class="checkbox"></div>
                    <span class="${item.isRequired ? 'required' : 'optional'}">${item.item}</span>
                    <span class="priority ${getPriorityColor(item.priority)}">${item.priority.toUpperCase()}</span>
                    ${item.timeline && `<small style="margin-left: 10px; color: #666;">(${item.timeline})</small>`}
                  </div>
                  ${item.description ? `<small style="margin-left: 25px; color: #666;">${item.description}</small>` : ''}
                `).join('')}
              </div>
            `;
          }).join('')}
          <div style="margin-top: 30px; font-size: 12px; color: #666;">
            <strong>Important:</strong> This checklist is for preparation guidance only. 
            Always follow your healthcare provider's specific instructions. 
            Contact us at (65) 6789 1234 if you have any questions.
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div id="preparation" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClipboardDocumentListIcon className="h-5 w-5 text-blue-500" />
            <span>Preparation Checklist</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Complete checklist to ensure you're ready for your {service.name}
          </p>
          
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Overall Progress</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{completedRequiredItems.length} of {requiredItems.length} completed</span>
                <Badge variant={overallProgress === 100 ? "default" : "secondary"}>
                  {overallProgress}% Complete
                </Badge>
              </div>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={printChecklist}
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2"
              >
                <PrinterIcon className="h-4 w-4" />
                <span>Print Checklist</span>
              </Button>
              
              <Button 
                onClick={() => {
                  const data = {
                    service: service.name,
                    timestamp: new Date().toISOString(),
                    completedItems: Array.from(completedItems),
                    progress: overallProgress
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${service.name}-checklist-progress.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2"
              >
                <DownloadIcon className="h-4 w-4" />
                <span>Save Progress</span>
              </Button>
              
              <Button 
                onClick={() => setCompletedItems(new Set(checklistItems.map(item => item.id)))}
                variant="outline" 
                size="sm"
              >
                Mark All Complete
              </Button>
              
              <Button 
                onClick={() => setCompletedItems(new Set())}
                variant="ghost" 
                size="sm"
              >
                Reset All
              </Button>
            </div>

            {/* Timeline Overview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <ClockIcon className="h-4 w-4" />
                <span>Preparation Timeline</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 bg-white rounded border">
                  <div className="font-medium text-gray-700">2+ Weeks Before</div>
                  <div className="text-gray-600 mt-1">Initial preparation</div>
                </div>
                <div className="text-center p-3 bg-white rounded border">
                  <div className="font-medium text-gray-700">1 Week Before</div>
                  <div className="text-gray-600 mt-1">Document gathering</div>
                </div>
                <div className="text-center p-3 bg-white rounded border">
                  <div className="font-medium text-gray-700">48 Hours Before</div>
                  <div className="text-gray-600 mt-1">Lifestyle adjustments</div>
                </div>
                <div className="text-center p-3 bg-white rounded border">
                  <div className="font-medium text-gray-700">Day Of</div>
                  <div className="text-gray-600 mt-1">Final preparations</div>
                </div>
              </div>
            </div>

            {/* Checklist Categories */}
            {categories.map((category) => {
              const categoryItems = checklistItems.filter(item => item.category === category.key);
              if (categoryItems.length === 0) return null;

              const categoryProgress = getCategoryProgress(category.key);
              const isExpanded = expandedCategories.has(category.key);
              const requiredCount = categoryItems.filter(item => item.isRequired).length;
              const completedCount = categoryItems.filter(item => item.isRequired && completedItems.has(item.id)).length;

              return (
                <Collapsible
                  key={category.key}
                  open={isExpanded}
                  onOpenChange={() => toggleCategory(category.key)}
                >
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${category.bgColor}`}>
                              <category.icon className={`h-4 w-4 ${category.color}`} />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{category.name}</h3>
                              <p className="text-sm text-gray-600">{category.description}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-gray-500">
                                  {completedCount} of {requiredCount} required items
                                </span>
                                <div className="text-xs text-blue-600">{categoryProgress}% complete</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${categoryProgress}%` }}
                              />
                            </div>
                            <ChevronDownIcon 
                              className={`h-4 w-4 text-gray-400 transition-transform ${
                                isExpanded ? 'rotate-180' : ''
                              }`} 
                            />
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="border-t border-gray-200 p-4 space-y-3">
                        {categoryItems.map((item) => (
                          <div key={item.id} className="flex items-start space-x-3">
                            <Checkbox
                              id={item.id}
                              checked={completedItems.has(item.id)}
                              onCheckedChange={() => toggleItem(item.id)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center space-x-2">
                                <label
                                  htmlFor={item.id}
                                  className={`text-sm font-medium cursor-pointer ${
                                    completedItems.has(item.id) 
                                      ? 'line-through text-gray-500' 
                                      : 'text-gray-900'
                                  }`}
                                >
                                  {item.item}
                                </label>
                                
                                <Badge 
                                  variant={item.isRequired ? "destructive" : "outline"} 
                                  className="text-xs px-1 py-0"
                                >
                                  {item.isRequired ? "Required" : "Optional"}
                                </Badge>
                                
                                <Badge 
                                  className={cn("text-xs px-1 py-0", getPriorityColor(item.priority))}
                                >
                                  {item.priority.toUpperCase()}
                                </Badge>
                              </div>
                              
                              {item.description && (
                                <p className="text-sm text-gray-600">
                                  {item.description}
                                </p>
                              )}
                              
                              {item.timeline && (
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <ClockIcon className="h-3 w-3" />
                                  <span>{item.timeline}</span>
                                </div>
                              )}
                            </div>
                            
                            {completedItems.has(item.id) && (
                              <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            )}
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}

            {/* Important Reminders */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2 flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span>Important Reminders</span>
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Contact your doctor immediately if you develop fever, illness, or symptoms before your appointment</li>
                <li>• Follow all medication instructions exactly as prescribed - don't stop medications without doctor approval</li>
                <li>• Bring a list of questions you want to ask your healthcare provider</li>
                <li>• Arrive 15-30 minutes early to complete registration and any additional paperwork</li>
                <li>• If you're bringing someone for support, they should arrive with you</li>
                <li>• For emergencies, call 995 or go to the nearest emergency department</li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Need Help?</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                <div>
                  <div className="font-medium">General Questions:</div>
                  <div>Tel: (65) 6789 1234</div>
                  <div>Email: care@myfamilyclinic.com</div>
                </div>
                <div>
                  <div className="font-medium">Emergency:</div>
                  <div>Call 995 or go to nearest A&E</div>
                  <div>Available 24/7</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}