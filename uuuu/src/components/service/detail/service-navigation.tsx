"use client";

import React from 'react';
import { useTranslations } from '@/hooks/use-translations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  InformationCircleIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  ArrowPathIcon,
  QuestionMarkCircleIcon,
  StarIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ServiceNavigationProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  category: string;
  serviceSlug: string;
  isMobile?: boolean;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description?: string;
  badge?: string;
}

export function ServiceNavigation({ 
  activeSection, 
  onSectionClick, 
  category, 
  serviceSlug, 
  isMobile = false 
}: ServiceNavigationProps) {
  const { t } = useTranslations();

  const navigationItems: NavigationItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: InformationCircleIcon,
      description: 'Service details and what to expect',
    },
    {
      id: 'medical-info',
      label: 'Medical Information',
      icon: BookOpenIcon,
      description: 'Medical terminology and accuracy',
      badge: 'Verified',
    },
    {
      id: 'process',
      label: 'Process Flow',
      icon: ArrowPathIcon,
      description: 'Step-by-step procedure guide',
    },
    {
      id: 'preparation',
      label: 'Preparation',
      icon: ClipboardDocumentListIcon,
      description: 'Checklist and instructions',
    },
    {
      id: 'education',
      label: 'Education',
      icon: BookOpenIcon,
      description: 'Educational materials',
    },
    {
      id: 'pricing',
      label: 'Pricing & Insurance',
      icon: CurrencyDollarIcon,
      description: 'Costs and coverage options',
    },
    {
      id: 'availability',
      label: 'Availability',
      icon: MapPinIcon,
      description: 'Clinic locations and schedules',
    },
    {
      id: 'alternatives',
      label: 'Alternatives',
      icon: ArrowPathIcon,
      description: 'Related treatments',
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: QuestionMarkCircleIcon,
      description: 'Common questions',
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: StarIcon,
      description: 'Patient feedback',
    },
  ];

  const handleItemClick = (item: NavigationItem) => {
    onSectionClick(item.id);
    if (isMobile) {
      // Mobile menu might need to close after selection
    }
  };

  if (isMobile) {
    return (
      <div className="flex overflow-x-auto space-x-4 pb-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={cn(
                "flex flex-col items-center space-y-1 px-3 py-2 rounded-lg min-w-max text-xs",
                isActive 
                  ? "bg-blue-100 text-blue-700 border border-blue-200" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <nav className="service-navigation space-y-1">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">
          Service Navigation
        </h2>
        <div className="text-xs text-gray-600 capitalize">
          {category.replace('-', ' ')} • {serviceSlug.replace('-', ' ')}
        </div>
      </div>
      
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={cn(
              "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-left transition-all duration-200",
              isActive 
                ? "bg-blue-50 text-blue-700 border border-blue-200" 
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium truncate">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs px-1 py-0 flex-shrink-0">
                    {item.badge}
                  </Badge>
                )}
              </div>
              {item.description && (
                <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                  {item.description}
                </div>
              )}
            </div>
          </button>
        );
      })}
      
      {/* Quick Actions */}
      <div className="pt-4 mt-4 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-700 mb-2">
          Quick Actions
        </h3>
        <div className="space-y-1">
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start text-xs h-8"
            onClick={() => onSectionClick('booking')}
          >
            Book Appointment
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start text-xs h-8"
            onClick={() => onSectionClick('print-preparation')}
          >
            Print Checklist
          </Button>
        </div>
      </div>
    </nav>
  );
}