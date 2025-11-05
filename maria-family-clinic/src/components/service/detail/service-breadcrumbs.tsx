"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ServiceBreadcrumbsProps {
  category: string;
  serviceSlug: string;
  locale: string;
}

export function ServiceBreadcrumbs({ category, serviceSlug, locale }: ServiceBreadcrumbsProps) {
  const pathname = usePathname();

  // Parse category and service name for display
  const categoryDisplayName = category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const serviceDisplayName = serviceSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const breadcrumbs = [
    {
      label: 'Home',
      href: `/${locale}`,
    },
    {
      label: 'Services',
      href: `/${locale}/services`,
    },
    {
      label: categoryDisplayName,
      href: `/${locale}/services/${category}`,
    },
    {
      label: serviceDisplayName,
      href: pathname,
      current: true,
    },
  ];

  return (
    <div className="mb-6">
      <Breadcrumbs className="text-sm">
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={item.href}>
            {index > 0 && (
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            )}
            {item.current ? (
              <span 
                className="text-gray-900 font-medium"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </Breadcrumbs>
    </div>
  );
}