import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ServiceDetailLayout } from '@/components/service/detail/service-detail-layout';
import { ServiceDetailHeader } from '@/components/service/detail/service-detail-header';
import { ServiceOverviewSection } from '@/components/service/detail/service-overview-section';
import { ServiceProcessFlow } from '@/components/service/detail/service-process-flow';
import { ServicePreparationSection } from '@/components/service/detail/service-preparation-section';
import { ServicePricingSection } from '@/components/service/detail/service-pricing-section';
import { ServiceAvailabilitySection } from '@/components/service/detail/service-availability-section';
import { ServiceMedicalInfoSection } from '@/components/service/detail/service-medical-info-section';
import { ServiceClinicAvailability } from '@/components/service/detail/service-clinic-availability';
import { ServiceAlternativesSection } from '@/components/service/detail/service-alternatives-section';
import { ServiceEducationMaterials } from '@/components/service/detail/service-education-materials';
import { ServiceFAQSection } from '@/components/service/detail/service-faq-section';
import { ServiceReviewsSection } from '@/components/service/detail/service-reviews-section';
import { ServiceActionsSection } from '@/components/service/detail/service-actions-section';
import { ServiceBreadcrumbs } from '@/components/service/detail/service-breadcrumbs';
import { ServicePrintLayout } from '@/components/service/detail/service-print-layout';
import { LoadingSkeleton } from '@/components/ui/loading-skeletons';
import { ErrorBoundary } from '@/components/error-boundary';

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const { category, serviceSlug } = params;
  
  // In a real app, fetch service data here
  const service = await getServiceData(category, serviceSlug);
  
  if (!service) {
    return {
      title: 'Service Not Found | My Family Clinic',
      description: 'The requested service could not be found.',
    };
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: service.name,
    description: service.description,
    url: `https://myfamilyclinic.com/services/${category}/${serviceSlug}`,
    medicalSpecialty: service.specialty,
    bodyLocation: service.bodyLocation,
    preparation: service.preparationInstructions,
    followup: service.followUpInstructions,
    procedureType: service.procedureType,
    numberOfSteps: service.processSteps?.length || 0,
    doctor: {
      '@type': 'MedicalOrganization',
      name: service.provider || 'My Family Clinic',
      medicalSpecialty: service.specialty,
    },
  };

  return {
    title: `${service.name} - ${service.category} | My Family Clinic`,
    description: service.patientFriendlyDescription || service.description,
    keywords: [...service.tags, service.specialty, service.category].join(', '),
    openGraph: {
      title: `${service.name} | My Family Clinic`,
      description: service.patientFriendlyDescription || service.description,
      type: 'article',
      section: service.category,
      url: `https://myfamilyclinic.com/services/${category}/${serviceSlug}`,
      images: service.images?.map(img => ({ url: img.url, alt: img.alt })) || [],
      medicalSpecialty: service.specialty,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${service.name} | My Family Clinic`,
      description: service.patientFriendlyDescription || service.description,
    },
    other: {
      'script:type': 'application/ld+json',
      'script:content': JSON.stringify(structuredData),
    },
    alternates: {
      canonical: `https://myfamilyclinic.com/services/${category}/${serviceSlug}`,
      languages: {
        'en': `/en/services/${category}/${serviceSlug}`,
        'zh': `/zh/services/${category}/${serviceSlug}`,
        'ms': `/ms/services/${category}/${serviceSlug}`,
        'ta': `/ta/services/${category}/${serviceSlug}`,
      },
    },
  };
}

interface ServiceDetailPageProps {
  params: {
    category: string;
    serviceSlug: string;
    locale?: string;
  };
}

// Mock function - replace with actual data fetching
async function getServiceData(category: string, serviceSlug: string) {
  // This would fetch from your API/database
  // For now, return null to trigger 404 or mock data
  return null;
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { category, serviceSlug, locale = 'en' } = params;
  
  // In a real app, fetch service data here
  const service = await getServiceData(category, serviceSlug);
  
  if (!service) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Print-only content (hidden on screen) */}
        <style jsx global>{`
          @media print {
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            body { font-size: 12pt; }
            .print-layout { margin: 0; padding: 0; }
          }
          
          @media screen {
            .print-only { display: none !important; }
            .print-layout { display: block; }
          }
        `}</style>

        <ServicePrintLayout serviceId={`${category}-${serviceSlug}`} />

        <div className="container mx-auto px-4 py-6 no-print">
          <ServiceBreadcrumbs 
            category={category} 
            serviceSlug={serviceSlug} 
            locale={locale}
          />
          
          <div className="space-y-8">
            {/* Service Header */}
            <Suspense fallback={<LoadingSkeleton className="h-48 w-full" />}>
              <ServiceDetailHeader 
                category={category} 
                serviceSlug={serviceSlug} 
                locale={locale}
              />
            </Suspense>

            {/* Service Overview */}
            <Suspense fallback={<LoadingSkeleton className="h-64 w-full" />}>
              <ServiceOverviewSection 
                category={category} 
                serviceSlug={serviceSlug} 
                locale={locale}
              />
            </Suspense>

            {/* Medical Information */}
            <Suspense fallback={<LoadingSkeleton className="h-72 w-full" />}>
              <ServiceMedicalInfoSection 
                category={category} 
                serviceSlug={serviceSlug} 
                locale={locale}
              />
            </Suspense>

            {/* Process Flow */}
            <Suspense fallback={<LoadingSkeleton className="h-80 w-full" />}>
              <ServiceProcessFlow 
                category={category} 
                serviceSlug={serviceSlug} 
                locale={locale}
              />
            </Suspense>

            {/* Preparation Checklist */}
            <Suspense fallback={<LoadingSkeleton className="h-96 w-full" />}>
              <ServicePreparationSection 
                category={category} 
                serviceSlug={serviceSlug} 
                locale={locale}
              />
            </Suspense>

            {/* Education Materials */}
            <Suspense fallback={<LoadingSkeleton className="h-72 w-full" />}>
              <ServiceEducationMaterials 
                category={category} 
                serviceSlug={serviceSlug} 
                locale={locale}
              />
            </Suspense>

            {/* Pricing and Insurance */}
            <Suspense fallback={<LoadingSkeleton className="h-64 w-full" />}>
              <ServicePricingSection 
                category={category} 
                serviceSlug={serviceSlug} 
                locale={locale}
              />
            </Suspense>

            {/* Service Availability */}
            <Suspense fallback={<LoadingSkeleton className="h-72 w-full" />}>
              <ServiceAvailabilitySection 
                category={category} 
                serviceSlug={serviceSlug} 
                locale={locale}
              />
            </Suspense>

            {/* Clinic Availability */}
            <Suspense fallback={<LoadingSkeleton className="h-96 w-full" />}>
              <ServiceClinicAvailability 
                category={category} 
                serviceSlug={serviceSlug} 
                locale={locale}
              />
            </Suspense>

            {/* Alternative Services */}
            <Suspense fallback={<LoadingSkeleton className="h-72 w-full" />}>
              <ServiceAlternativesSection 
                category={category} 
                serviceSlug={serviceSlug} 
                locale={locale}
              />
            </Suspense>

            {/* FAQ */}
            <Suspense fallback={<LoadingSkeleton className="h-64 w-full" />}>
              <ServiceFAQSection 
                category={category} 
                serviceSlug={serviceSlug} 
                locale={locale}
              />
            </Suspense>

            {/* Service Reviews */}
            <Suspense fallback={<LoadingSkeleton className="h-64 w-full" />}>
              <ServiceReviewsSection 
                category={category} 
                serviceSlug={serviceSlug} 
                locale={locale}
              />
            </Suspense>

            {/* Action Buttons */}
            <Suspense fallback={<LoadingSkeleton className="h-32 w-full" />}>
              <ServiceActionsSection 
                category={category} 
                serviceSlug={serviceSlug} 
                locale={locale}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

// Generate static params for common services (prerendering optimization)
export async function generateStaticParams() {
  // This would fetch from your database
  // For now, return empty array - would generate for popular services
  return [];
}