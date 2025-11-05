import { Suspense } from 'react';
import { Metadata } from 'next';
import { ServiceDetailHeader } from '@/components/service/service-detail-header';
import { ServiceOverviewSection } from '@/components/service/service-overview-section';
import { ServiceProcessFlow } from '@/components/service/service-process-flow';
import { ServicePreparationSection } from '@/components/service/service-preparation-section';
import { ServicePricingSection } from '@/components/service/service-pricing-section';
import { ServiceAvailabilitySection } from '@/components/service/service-availability-section';
import { ServiceAlternativesSection } from '@/components/service/service-alternatives-section';
import { ServiceMedicalInfoSection } from '@/components/service/service-medical-info-section';
import { ServiceClinicAvailability } from '@/components/service/service-clinic-availability';
import { ServiceActionsSection } from '@/components/service/service-actions-section';
import { ServiceReviewsSection } from '@/components/service/service-reviews-section';
import { ServiceBreadcrumbs } from '@/components/service/service-breadcrumbs';
import { LoadingSkeleton } from '@/components/ui/loading-skeletons';
import { ErrorBoundary } from '@/components/error-boundary';

interface ServiceDetailPageProps {
  params: {
    serviceId: string;
  };
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  // In a real app, fetch service data here
  const service = {
    name: 'Service',
    description: 'Medical service description',
    category: 'Healthcare',
  };

  return {
    title: `${service.name} | My Family Clinic`,
    description: service.description,
    openGraph: {
      title: `${service.name} | My Family Clinic`,
      description: service.description,
      type: 'article',
      section: service.category,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${service.name} | My Family Clinic`,
      description: service.description,
    },
  };
}

export default function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <ErrorBoundary>
          <ServiceBreadcrumbs serviceId={params.serviceId} />
          
          <div className="space-y-8">
            {/* Service Header */}
            <Suspense fallback={<LoadingSkeleton className="h-48 w-full" />}>
              <ServiceDetailHeader serviceId={params.serviceId} />
            </Suspense>

            {/* Service Overview */}
            <Suspense fallback={<LoadingSkeleton className="h-64 w-full" />}>
              <ServiceOverviewSection serviceId={params.serviceId} />
            </Suspense>

            {/* Medical Information */}
            <Suspense fallback={<LoadingSkeleton className="h-72 w-full" />}>
              <ServiceMedicalInfoSection serviceId={params.serviceId} />
            </Suspense>

            {/* Process Flow */}
            <Suspense fallback={<LoadingSkeleton className="h-80 w-full" />}>
              <ServiceProcessFlow serviceId={params.serviceId} />
            </Suspense>

            {/* Preparation Checklist */}
            <Suspense fallback={<LoadingSkeleton className="h-96 w-full" />}>
              <ServicePreparationSection serviceId={params.serviceId} />
            </Suspense>

            {/* Pricing and Insurance */}
            <Suspense fallback={<LoadingSkeleton className="h-64 w-full" />}>
              <ServicePricingSection serviceId={params.serviceId} />
            </Suspense>

            {/* Service Availability */}
            <Suspense fallback={<LoadingSkeleton className="h-72 w-full" />}>
              <ServiceAvailabilitySection serviceId={params.serviceId} />
            </Suspense>

            {/* Clinic Availability */}
            <Suspense fallback={<LoadingSkeleton className="h-96 w-full" />}>
              <ServiceClinicAvailability serviceId={params.serviceId} />
            </Suspense>

            {/* Alternative Services */}
            <Suspense fallback={<LoadingSkeleton className="h-72 w-full" />}>
              <ServiceAlternativesSection serviceId={params.serviceId} />
            </Suspense>

            {/* Service Reviews */}
            <Suspense fallback={<LoadingSkeleton className="h-64 w-full" />}>
              <ServiceReviewsSection serviceId={params.serviceId} />
            </Suspense>

            {/* Action Buttons */}
            <Suspense fallback={<LoadingSkeleton className="h-32 w-full" />}>
              <ServiceActionsSection serviceId={params.serviceId} />
            </Suspense>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}