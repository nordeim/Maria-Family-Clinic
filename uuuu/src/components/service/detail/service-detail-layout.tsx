"use client";

import React, { useState, useEffect } from 'react';
import { useServiceData } from '@/hooks/use-service-data';
import { ServiceNavigation } from './service-navigation';
import { ServiceLanguageToggle } from './service-language-toggle';
import { ServicePrintButton } from './service-print-button';
import { cn } from '@/lib/utils';

interface ServiceDetailLayoutProps {
  children: React.ReactNode;
  category: string;
  serviceSlug: string;
  locale: string;
  serviceData?: any;
}

export function ServiceDetailLayout({ 
  children, 
  category, 
  serviceSlug, 
  locale,
  serviceData 
}: ServiceDetailLayoutProps) {
  const [activeSection, setActiveSection] = useState('overview');
  const [showStickyNav, setShowStickyNav] = useState(false);

  // Handle scrollspy for navigation
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowStickyNav(scrollPosition > 200);

      // Update active section based on scroll position
      const sections = ['overview', 'medical-info', 'process', 'preparation', 'education', 'pricing', 'availability', 'alternatives', 'faq', 'reviews'];
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  return (
    <div className="service-detail-layout">
      {/* Sticky Navigation Bar */}
      <div className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm transition-transform duration-300",
        showStickyNav ? "translate-y-0" : "-translate-y-full"
      )}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="font-semibold text-gray-900 truncate max-w-xs">
                {serviceData?.name || 'Service Details'}
              </h1>
              <ServiceLanguageToggle locale={locale} serviceSlug={serviceSlug} />
            </div>
            <div className="flex items-center space-x-2">
              <ServicePrintButton serviceSlug={serviceSlug} />
              <button 
                onClick={() => scrollToSection('booking')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Side Navigation */}
      <aside className="hidden lg:block fixed left-0 top-20 w-64 h-[calc(100vh-5rem)] overflow-y-auto bg-white border-r border-gray-200">
        <div className="p-4">
          <ServiceNavigation 
            activeSection={activeSection}
            onSectionClick={scrollToSection}
            category={category}
            serviceSlug={serviceSlug}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="sticky top-20 bg-white border-b border-gray-200 lg:hidden">
          <div className="p-4">
            <ServiceNavigation 
              activeSection={activeSection}
              onSectionClick={scrollToSection}
              category={category}
              serviceSlug={serviceSlug}
              isMobile
            />
          </div>
        </div>
        
        <div className={cn(
          "service-content transition-all duration-300",
          showStickyNav ? "pt-4" : "pt-0"
        )}>
          {children}
        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <button 
        onClick={() => scrollToSection('booking')}
        className="lg:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 z-40"
        aria-label="Book this service"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </button>
    </div>
  );
}