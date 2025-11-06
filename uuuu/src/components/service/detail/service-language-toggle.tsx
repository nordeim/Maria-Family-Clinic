"use client";

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  ChevronDownIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ServiceLanguageToggleProps {
  locale: string;
  serviceSlug: string;
}

const SUPPORTED_LOCALES = {
  en: { name: 'English', flag: '🇬🇧' },
  zh: { name: '中文', flag: '🇸🇬' },
  ms: { name: 'Bahasa', flag: '🇸🇬' },
  ta: { name: 'தமிழ்', flag: '🇸🇬' },
};

export function ServiceLanguageToggle({ locale, serviceSlug }: ServiceLanguageToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Extract category from current path
  const pathSegments = pathname.split('/');
  const category = pathSegments[2]; // /services/[category]/[serviceSlug]

  const handleLocaleChange = (newLocale: string) => {
    // Update URL to include locale prefix
    const currentSegments = pathname.split('/');
    currentSegments[1] = newLocale; // Replace 'services' with 'en/services' etc.
    const newPath = currentSegments.join('/');
    
    router.push(newPath);
    setIsOpen(false);
  };

  const currentLocale = SUPPORTED_LOCALES[locale as keyof typeof SUPPORTED_LOCALES] || SUPPORTED_LOCALES.en;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2"
        aria-label="Change language"
      >
        <LanguageIcon className="h-4 w-4" />
        <span className="text-sm font-medium">{currentLocale.flag}</span>
        <span className="hidden sm:inline text-sm">{currentLocale.name}</span>
        <ChevronDownIcon 
          className={cn(
            "h-3 w-3 transition-transform",
            isOpen ? "rotate-180" : ""
          )}
        />
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
            <div className="py-1">
              {Object.entries(SUPPORTED_LOCALES).map(([code, lang]) => (
                <button
                  key={code}
                  onClick={() => handleLocaleChange(code)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-2 text-sm text-left hover:bg-gray-50",
                    locale === code ? "bg-blue-50 text-blue-700" : "text-gray-700"
                  )}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                  {locale === code && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
            <div className="border-t border-gray-200 p-3 bg-gray-50">
              <p className="text-xs text-gray-600">
                Content automatically translated for {currentLocale.name} speakers. 
                Medical accuracy verified by healthcare professionals.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}