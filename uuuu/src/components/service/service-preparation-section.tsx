"use client";

import React, { useState, useEffect } from 'react';
import { useService, useServiceChecklists } from '@/hooks/use-service';
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
  ClockIcon
} from '@heroicons/react/24/outline';

interface ServicePreparationSectionProps {
  serviceId: string;
}

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  description?: string;
  isRequired: boolean;
  completed?: boolean;
}

export function ServicePreparationSection({ serviceId }: ServicePreparationSectionProps) {
  const { data: service, isLoading } = useService(serviceId);
  const { data: checklistItems, isLoading: checklistLoading } = useServiceChecklists(serviceId);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['preparation']));

  if (isLoading || checklistLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-96 bg-gray-200 rounded" />
      </div>
    );
  }

  // Default checklist if no items from API
  const defaultChecklistItems: ChecklistItem[] = [
    // Preparation items
    {
      id: '1',
      category: 'preparation',
      item: 'Fast for specified hours if required',
      description: 'Do not eat or drink for the recommended time before your appointment',
      isRequired: true,
    },
    {
      id: '2',
      category: 'preparation',
      item: 'Prepare your medication list',
      description: 'List all current medications, supplements, and dosages',
      isRequired: true,
    },
    {
      id: '3',
      category: 'preparation',
      item: 'Gather relevant medical records',
      description: 'Bring previous test results, imaging reports, and medical history',
      isRequired: false,
    },

    // Documents
    {
      id: '4',
      category: 'documents',
      item: 'Valid identification document',
      description: 'NRIC, passport, or driver\'s license',
      isRequired: true,
    },
    {
      id: '5',
      category: 'documents',
      item: 'Insurance card or letter',
      description: 'Bring your insurance information for coverage verification',
      isRequired: false,
    },
    {
      id: '6',
      category: 'documents',
      item: 'Referral letter (if applicable)',
      description: 'Bring referral letter if referred by another doctor',
      isRequired: false,
    },

    // Medications
    {
      id: '7',
      category: 'medications',
      item: 'Discontinue certain medications',
      description: 'Some medications may need to be stopped before the procedure',
      isRequired: true,
    },
    {
      id: '8',
      category: 'medications',
      item: 'Bring current medications',
      description: 'Bring actual medication bottles for review',
      isRequired: false,
    },

    // Lifestyle
    {
      id: '9',
      category: 'lifestyle',
      item: 'Avoid alcohol and tobacco',
      description: 'Refrain from alcohol and smoking for 24-48 hours before procedure',
      isRequired: true,
    },
    {
      id: '10',
      category: 'lifestyle',
      item: 'Arrange transportation',
      description: 'Plan for someone to drive you home if sedation is involved',
      isRequired: false,
    },
  ];

  const items = checklistItems || defaultChecklistItems;
  const requiredItems = items.filter(item => item.isRequired);
  const completedRequiredItems = items.filter(item => item.isRequired && completedItems.has(item.id));
  
  const completionPercentage = requiredItems.length > 0 
    ? Math.round((completedRequiredItems.length / requiredItems.length) * 100)
    : 0;

  const categories = [
    {
      key: 'preparation',
      name: 'General Preparation',
      icon: ClipboardDocumentListIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      key: 'documents',
      name: 'Documents',
      icon: DocumentTextIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      key: 'medications',
      name: 'Medications',
      icon: PillIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      key: 'lifestyle',
      name: 'Lifestyle',
      icon: HeartIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
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
    const categoryItems = items.filter(item => item.category === categoryKey);
    const requiredCategoryItems = categoryItems.filter(item => item.isRequired);
    const completedCategoryItems = requiredCategoryItems.filter(item => completedItems.has(item.id));
    
    return requiredCategoryItems.length > 0 
      ? Math.round((completedCategoryItems.length / requiredCategoryItems.length) * 100)
      : 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ClipboardDocumentListIcon className="h-5 w-5 text-blue-500" />
          <span>Preparation Checklist</span>
        </CardTitle>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-medium">{completionPercentage}% Complete</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Quick Timeline */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <ClockIcon className="h-4 w-4" />
              <span>Timeline</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-700">1 Week Before</div>
                <div className="text-gray-600">Schedule appointment, gather documents</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">24-48 Hours Before</div>
                <div className="text-gray-600">Medication adjustments, lifestyle changes</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Day of Service</div>
                <div className="text-gray-600">Follow final instructions, arrive early</div>
              </div>
            </div>
          </div>

          {/* Checklist Categories */}
          {categories.map((category) => {
            const categoryItems = items.filter(item => item.category === category.key);
            if (categoryItems.length === 0) return null;

            const categoryProgress = getCategoryProgress(category.key);
            const isExpanded = expandedCategories.has(category.key);

            return (
              <Collapsible
                key={category.key}
                open={isExpanded}
                onOpenChange={() => toggleCategory(category.key)}
              >
                <div className="border border-gray-200 rounded-lg">
                  <CollapsibleTrigger asChild>
                    <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${category.bgColor}`}>
                            <category.icon className={`h-4 w-4 ${category.color}`} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{category.name}</h3>
                            <p className="text-sm text-gray-600">
                              {categoryItems.filter(item => item.isRequired).length} required items
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {categoryProgress}% Complete
                            </div>
                            <Progress value={categoryProgress} className="h-1 w-16" />
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
                              {item.isRequired && (
                                <Badge variant="destructive" className="text-xs px-1 py-0">
                                  Required
                                </Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600">
                                {item.description}
                              </p>
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

          {/* Warnings and Reminders */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2 flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span>Important Reminders</span>
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Contact your doctor if you develop any symptoms before your appointment</li>
              <li>• Follow all medication instructions carefully</li>
              <li>• Bring a list of questions you want to ask your healthcare provider</li>
              <li>• Arrive 15 minutes early for check-in processes</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <Button 
              onClick={() => setCompletedItems(new Set(items.map(item => item.id)))}
              variant="outline"
              className="flex-1"
            >
              Mark All Complete
            </Button>
            <Button 
              onClick={() => {
                const incompleteItems = items.filter(item => item.isRequired && !completedItems.has(item.id));
                if (incompleteItems.length > 0) {
                  alert(`Please complete ${incompleteItems.length} required items before proceeding.`);
                }
              }}
              className="flex-1"
            >
              Continue to Booking
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}