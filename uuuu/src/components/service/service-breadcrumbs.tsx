"use client";

import React from 'react';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useService } from '@/hooks/use-service';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ServiceBreadcrumbsProps {
  serviceId: string;
}

export function ServiceBreadcrumbs({ serviceId }: ServiceBreadcrumbsProps) {
  const { data: service, isLoading } = useService(serviceId);

  if (isLoading || !service) {
    return (
      <nav aria-label="Loading breadcrumbs..." className="py-4">
        <div className="animate-pulse flex space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-16" />
          ))}
        </div>
      </nav>
    );
  }

  const breadcrumbs = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Services', href: '/services', icon: null },
    { name: service.category, href: `/services?category=${service.category}`, icon: null },
    { name: service.name, href: `/services/${serviceId}`, icon: null, current: true },
  ];

  return (
    <nav
      aria-label="Breadcrumb"
      className="py-4 border-b border-gray-200"
    >
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={breadcrumb.name} className="flex items-center">
              {index > 0 && (
                <ChevronRightIcon
                  className="h-4 w-4 text-gray-400 mr-2"
                  aria-hidden="true"
                />
              )}
              
              {breadcrumb.icon && (
                <breadcrumb.icon
                  className="h-4 w-4 text-gray-400 mr-2"
                  aria-hidden="true"
                />
              )}
              
              {isLast ? (
                <span
                  className={cn(
                    "font-medium",
                    isLast ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {breadcrumb.name}
                </span>
              ) : (
                <Link
                  href={breadcrumb.href}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {breadcrumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}