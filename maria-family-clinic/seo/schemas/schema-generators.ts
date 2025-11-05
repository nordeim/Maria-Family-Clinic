/**
 * Schema.org Structured Data Generators for My Family Clinic
 * Healthcare-specific schema implementations for Singapore healthcare platform
 */

import { 
  DoctorSEO, 
  ClinicSEO, 
  MedicalServiceSEO, 
  LocalBusinessSEO,
  StructuredData 
} from '../types/seo.types'
import { SEO_CONFIG } from '../config/seo.config'

// =============================================================================
// BASE SCHEMA GENERATOR
// =============================================================================

export abstract class BaseSchemaGenerator {
  protected config = SEO_CONFIG.structuredData

  protected addContext(data: any): any {
    return {
      '@context': this.config.context,
      ...data
    }
  }

  protected validateData(data: any): boolean {
    return data && typeof data === 'object'
  }

  protected formatPrice(price?: number, currency: string = 'SGD'): string {
    if (!price) return ''
    return `${price.toFixed(2)} ${currency}`
  }

  protected formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toISOString()
  }
}

// =============================================================================
// DOCTOR SCHEMA GENERATOR
// =============================================================================

export class DoctorSchemaGenerator extends BaseSchemaGenerator {
  generateDoctorSchema(doctor: any): DoctorSEO {
    if (!this.validateData(doctor)) {
      throw new Error('Invalid doctor data for schema generation')
    }

    const schema: DoctorSEO = this.addContext({
      '@type': 'Physician',
      name: doctor.name,
      description: doctor.bio || '',
      image: doctor.profileImage ? `${this.config.baseUrl}${doctor.profileImage}` : undefined,
      url: doctor.slug ? `${this.config.baseUrl}/doctors/${doctor.slug}` : undefined,
      telephone: doctor.phone || '+65-6123-4567',
      medicalSpecialty: doctor.specialties || [],
      qualification: doctor.qualifications || [],
      affiliation: doctor.clinics?.map((clinic: any) => ({
        '@type': 'Organization',
        name: clinic.clinic?.name || clinic.name,
        url: clinic.clinic?.slug ? `${this.config.baseUrl}/clinics/${clinic.clinic.slug}` : undefined
      })) || [],
      workLocation: doctor.clinics?.map((clinic: any) => ({
        '@type': 'MedicalClinic',
        name: clinic.clinic?.name || clinic.name,
        address: clinic.clinic?.address ? this.formatAddress(clinic.clinic.address) : undefined,
        telephone: clinic.clinic?.phone || '+65-6123-4567'
      })) || [],
      patientReview: this.generatePatientReviews(doctor.reviews),
      aggregateRating: doctor.reviewCount > 0 ? {
        '@type': 'AggregateRating',
        ratingValue: doctor.rating || 0,
        reviewCount: doctor.reviewCount,
        bestRating: 5,
        worstRating: 1
      } : undefined,
      medicalCondition: this.generateMedicalConditions(doctor.specialties),
      medicalTherapy: this.generateMedicalTherapies(doctor.specialties),
      medicalDegree: doctor.qualifications?.find((q: string) => q.includes('MD') || q.includes('MBBS')) || 'Doctor of Medicine',
      worksFor: {
        '@type': 'Organization',
        name: 'My Family Clinic'
      },
      alumniOf: doctor.medicalSchool ? {
        '@type': 'CollegeOrUniversity',
        name: doctor.medicalSchool
      } : undefined
    })

    return schema
  }

  private formatAddress(address: any): any {
    if (!address) return undefined
    
    return {
      '@type': 'PostalAddress',
      streetAddress: address.streetAddress || address.address || '',
      addressLocality: address.addressLocality || address.city || '',
      addressRegion: address.addressRegion || address.state || '',
      postalCode: address.postalCode || '',
      addressCountry: address.addressCountry || 'SG'
    }
  }

  private generatePatientReviews(reviews?: any[]): any[] | undefined {
    if (!reviews || reviews.length === 0) return undefined

    return reviews.slice(0, 10).map((review: any) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.userName || 'Anonymous Patient'
      },
      datePublished: this.formatDate(review.createdAt),
      reviewBody: review.comment || review.content || '',
      reviewRating: {
        '@type': 'Rating',
        bestRating: 5,
        worstRating: 1,
        ratingValue: review.rating || 5
      }
    }))
  }

  private generateMedicalConditions(specialties?: string[]): any[] | undefined {
    if (!specialties) return undefined

    const conditions: Record<string, string> = {
      'Cardiology': 'Cardiovascular Disease',
      'Dermatology': 'Skin Disease',
      'Endocrinology': 'Endocrine System Disease',
      'Gastroenterology': 'Digestive System Disease',
      'Neurology': 'Nervous System Disease',
      'Oncology': 'Cancer',
      'Psychiatry': 'Mental Health Disorder',
      'Pulmonology': 'Respiratory System Disease',
      'Rheumatology': 'Autoimmune Disease',
      'Urology': 'Genitourinary System Disease'
    }

    return specialties
      .filter(specialty => conditions[specialty])
      .map(specialty => ({
        '@type': 'MedicalCondition',
        name: conditions[specialty],
        associatedAnatomy: {
          '@type': 'AnatomicalSystem',
          name: this.getAssociatedAnatomy(specialty)
        }
      }))
  }

  private getAssociatedAnatomy(specialty: string): string {
    const anatomyMap: Record<string, string> = {
      'Cardiology': 'Cardiovascular System',
      'Dermatology': 'Skin',
      'Endocrinology': 'Endocrine System',
      'Gastroenterology': 'Digestive System',
      'Neurology': 'Nervous System',
      'Oncology': 'Tissues',
      'Psychiatry': 'Mind',
      'Pulmonology': 'Respiratory System',
      'Rheumatology': 'Musculoskeletal System',
      'Urology': 'Genitourinary System'
    }

    return anatomyMap[specialty] || 'Body'
  }

  private generateMedicalTherapies(specialties?: string[]): any[] | undefined {
    if (!specialties) return undefined

    return specialties.map(specialty => ({
      '@type': 'TherapeuticProcedure',
      name: `${specialty} Consultation`,
      description: `Professional consultation in ${specialty}`
    }))
  }
}

// =============================================================================
// CLINIC SCHEMA GENERATOR
// =============================================================================

export class ClinicSchemaGenerator extends BaseSchemaGenerator {
  generateClinicSchema(clinic: any): ClinicSEO {
    if (!this.validateData(clinic)) {
      throw new Error('Invalid clinic data for schema generation')
    }

    const schema: ClinicSEO = this.addContext({
      '@type': 'MedicalClinic',
      name: clinic.name,
      description: clinic.description || 'Healthcare clinic providing comprehensive medical services.',
      url: `${this.config.baseUrl}/clinics/${clinic.slug}`,
      telephone: clinic.phone || '+65-6123-4567',
      email: clinic.email || 'info@myfamilyclinic.sg',
      address: this.formatClinicAddress(clinic),
      geo: clinic.latitude && clinic.longitude ? {
        '@type': 'GeoCoordinates',
        latitude: clinic.latitude,
        longitude: clinic.longitude
      } : undefined,
      openingHours: this.generateOpeningHours(clinic.openingHours),
      serviceArea: clinic.serviceArea ? this.generateServiceArea(clinic.serviceArea) : undefined,
      medicalSpecialty: clinic.specialties || ['General Practice'],
      hasOfferCatalog: this.generateOfferCatalog(clinic.services),
      paymentAccepted: ['Cash', 'NETS', 'Credit Card', 'PayNow', 'Medisave'],
      priceRange: '$$',
      amenities: clinic.amenities || [
        'Wheelchair Accessible',
        'Parking Available',
        'Air Conditioning',
        'Patient Waiting Area'
      ],
      images: clinic.images?.map((img: string) => `${this.config.baseUrl}${img}`) || [
        `${this.config.baseUrl}/images/clinics/default.jpg`
      ],
      review: this.generateClinicReviews(clinic.reviews),
      aggregateRating: clinic.reviewCount > 0 ? {
        '@type': 'AggregateRating',
        ratingValue: clinic.rating || 0,
        reviewCount: clinic.reviewCount,
        bestRating: 5,
        worstRating: 1
      } : undefined,
      hasCredential: [
        'MOH Licensed',
        'CHAS Accredited',
        'Healthier SG Enrolled'
      ],
      staff: this.generateStaffInfo(clinic.doctors),
      servicesProvided: this.generateServicesList(clinic.services)
    })

    return schema
  }

  private formatClinicAddress(clinic: any): any {
    if (!clinic.address) return undefined

    return {
      '@type': 'PostalAddress',
      streetAddress: clinic.address.streetAddress || clinic.address.address || '',
      addressLocality: clinic.address.addressLocality || clinic.address.city || '',
      addressRegion: clinic.address.addressRegion || 'Singapore',
      postalCode: clinic.address.postalCode || '',
      addressCountry: 'SG'
    }
  }

  private generateOpeningHours(openingHours?: any[]): any[] | undefined {
    if (!openingHours || openingHours.length === 0) {
      // Default Singapore healthcare hours
      return [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:00',
          closes: '17:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Saturday',
          opens: '08:00',
          closes: '12:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Sunday',
          closes: 'Closed'
        }
      ]
    }

    return openingHours.map((hours: any) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hours.dayOfWeek,
      opens: hours.opens,
      closes: hours.closes,
      validFrom: hours.validFrom ? this.formatDate(hours.validFrom) : undefined,
      validThrough: hours.validThrough ? this.formatDate(hours.validThrough) : undefined
    }))
  }

  private generateServiceArea(serviceArea?: any[]): any[] {
    if (!serviceArea || serviceArea.length === 0) {
      return [
        {
          '@type': 'GeoCircle',
          geoMidpoint: {
            '@type': 'GeoCoordinates',
            latitude: 1.3521,
            longitude: 103.8198
          },
          geoRadius: '25000'
        }
      ]
    }

    return serviceArea.map((area: any) => ({
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: area.latitude,
        longitude: area.longitude
      },
      geoRadius: area.radius || '10000'
    }))
  }

  private generateOfferCatalog(services?: any[]): any {
    if (!services || services.length === 0) return undefined

    return {
      '@type': 'OfferCatalog',
      name: 'Healthcare Services',
      itemListElement: services.slice(0, 20).map((service: any, index: number) => ({
        '@type': 'Offer',
        position: index + 1,
        itemOffered: {
          '@type': 'MedicalService',
          name: service.name,
          description: service.description || '',
          medicalSpecialty: service.category?.name || 'General Practice'
        },
        price: service.price ? this.formatPrice(service.price) : undefined,
        priceCurrency: 'SGD'
      }))
    }
  }

  private generateClinicReviews(reviews?: any[]): any[] | undefined {
    if (!reviews || reviews.length === 0) return undefined

    return reviews.slice(0, 10).map((review: any) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.userName || 'Anonymous Patient'
      },
      datePublished: this.formatDate(review.createdAt),
      reviewBody: review.comment || review.content || '',
      reviewRating: {
        '@type': 'Rating',
        bestRating: 5,
        worstRating: 1,
        ratingValue: review.rating || 5
      }
    }))
  }

  private generateStaffInfo(doctors?: any[]): any[] | undefined {
    if (!doctors || doctors.length === 0) return undefined

    return doctors.map((doctor: any) => ({
      '@type': 'Person',
      name: doctor.name,
      jobTitle: 'Medical Doctor',
      worksFor: {
        '@type': 'MedicalClinic',
        name: 'My Family Clinic'
      },
      medicalSpecialty: doctor.specialties || []
    }))
  }

  private generateServicesList(services?: any[]): string[] {
    if (!services || services.length === 0) return ['General Medical Care']

    return services.map((service: any) => service.name).slice(0, 10)
  }
}

// =============================================================================
// MEDICAL SERVICE SCHEMA GENERATOR
// =============================================================================

export class MedicalServiceSchemaGenerator extends BaseSchemaGenerator {
  generateMedicalServiceSchema(service: any, clinic?: any): MedicalServiceSEO {
    if (!this.validateData(service)) {
      throw new Error('Invalid service data for schema generation')
    }

    const schema: MedicalServiceSEO = this.addContext({
      '@type': 'MedicalService',
      name: service.name,
      description: service.description || '',
      url: service.slug ? `${this.config.baseUrl}/services/${service.slug}` : undefined,
      provider: clinic ? this.formatClinicProvider(clinic) : undefined,
      medicalSpecialty: service.category?.name || 'General Practice',
      areaServed: {
        '@type': 'Country',
        name: 'Singapore',
        sameAs: 'https://en.wikipedia.org/wiki/Singapore'
      },
      audience: {
        '@type': 'Audience',
        audienceType: service.targetAudience || 'General Public'
      },
      serviceType: service.category?.htCategory || 'Healthcare Service',
      relevantSpecialty: service.specialties || [service.category?.name],
      bodyLocation: service.bodyLocation ? {
        '@type': 'AnatomicalSystem',
        name: service.bodyLocation
      } : undefined,
      hasOfferCatalog: this.generateServiceOfferCatalog(service),
      fee: service.price ? {
        '@type': 'PriceSpecification',
        price: service.price,
        priceCurrency: 'SGD',
        valueAddedTaxIncluded: true
      } : undefined,
      availableChannel: {
        '@type': 'ServiceChannel',
        name: 'In-Person Consultation',
        serviceUrl: service.slug ? `${this.config.baseUrl}/services/${service.slug}` : undefined
      },
      medicalSpecialty: service.category?.name || 'General Practice',
      healthcareCondition: service.conditions?.map((condition: any) => ({
        '@type': 'MedicalCondition',
        name: condition.name
      })),
      contraindication: service.contraindications,
      preparation: service.preparationInstructions,
      followup: service.followupInstructions
    })

    return schema
  }

  private formatClinicProvider(clinic: any): any {
    return {
      '@type': 'MedicalClinic',
      name: clinic.name,
      address: clinic.address ? {
        '@type': 'PostalAddress',
        streetAddress: clinic.address.streetAddress || '',
        addressLocality: clinic.address.addressLocality || '',
        addressRegion: clinic.address.addressRegion || 'Singapore',
        postalCode: clinic.address.postalCode || '',
        addressCountry: 'SG'
      } : undefined,
      telephone: clinic.phone || '+65-6123-4567'
    }
  }

  private generateServiceOfferCatalog(service: any): any {
    if (!service.pricingTiers || service.pricingTiers.length === 0) return undefined

    return {
      '@type': 'OfferCatalog',
      name: `${service.name} Pricing Options`,
      itemListElement: service.pricingTiers.map((tier: any, index: number) => ({
        '@type': 'Offer',
        position: index + 1,
        name: tier.name,
        price: tier.price ? this.formatPrice(tier.price) : undefined,
        priceCurrency: 'SGD',
        availability: tier.availability || 'https://schema.org/InStock',
        validFrom: tier.validFrom ? this.formatDate(tier.validFrom) : undefined,
        validThrough: tier.validThrough ? this.formatDate(tier.validThrough) : undefined
      }))
    }
  }
}

// =============================================================================
// LOCAL BUSINESS SCHEMA GENERATOR
// =============================================================================

export class LocalBusinessSchemaGenerator extends BaseSchemaGenerator {
  generateLocalBusinessSchema(clinic: any): LocalBusinessSEO {
    if (!this.validateData(clinic)) {
      throw new Error('Invalid clinic data for local business schema generation')
    }

    const schema: LocalBusinessSEO = {
      name: clinic.name,
      description: clinic.description || 'Healthcare clinic in Singapore.',
      url: `${this.config.baseUrl}/clinics/${clinic.slug}`,
      telephone: clinic.phone || '+65-6123-4567',
      address: {
        streetAddress: clinic.address?.streetAddress || '',
        addressLocality: clinic.address?.addressLocality || 'Singapore',
        addressRegion: clinic.address?.addressRegion || 'Singapore',
        postalCode: clinic.address?.postalCode || '',
        addressCountry: 'SG'
      },
      geo: clinic.latitude && clinic.longitude ? {
        latitude: clinic.latitude,
        longitude: clinic.longitude
      } : undefined,
      openingHours: this.generateOpeningHours(clinic.openingHours),
      serviceArea: clinic.serviceArea ? this.generateServiceAreas(clinic.serviceArea) : undefined,
      priceRange: clinic.priceRange || '$$',
      paymentAccepted: ['Cash', 'NETS', 'Credit Card', 'PayNow', 'Medisave'],
      currenciesAccepted: ['SGD'],
      images: clinic.images?.map((img: string) => `${this.config.baseUrl}${img}`) || [],
      reviews: this.generateBusinessReviews(clinic.reviews),
      aggregateRating: clinic.reviewCount > 0 ? {
        '@type': 'AggregateRating',
        ratingValue: clinic.rating || 0,
        reviewCount: clinic.reviewCount
      } : undefined
    }

    return schema
  }

  private generateOpeningHours(openingHours?: any[]): OpeningHours[] | undefined {
    if (!openingHours || openingHours.length === 0) return undefined

    return openingHours.map((hours: any) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hours.dayOfWeek,
      opens: hours.opens,
      closes: hours.closes,
      validFrom: hours.validFrom ? this.formatDate(hours.validFrom) : undefined,
      validThrough: hours.validThrough ? this.formatDate(hours.validThrough) : undefined
    }))
  }

  private generateServiceAreas(serviceArea?: any[]): { type: string; name: string }[] {
    if (!serviceArea || serviceArea.length === 0) {
      return [
        { type: 'Country', name: 'Singapore' }
      ]
    }

    return serviceArea.map((area: any) => ({
      type: area.type || 'Country',
      name: area.name || 'Singapore'
    }))
  }

  private generateBusinessReviews(reviews?: any[]): Review[] | undefined {
    if (!reviews || reviews.length === 0) return undefined

    return reviews.slice(0, 10).map((review: any) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.userName || 'Anonymous Patient'
      },
      datePublished: this.formatDate(review.createdAt),
      reviewBody: review.comment || review.content || '',
      reviewRating: {
        '@type': 'Rating',
        bestRating: 5,
        worstRating: 1,
        ratingValue: review.rating || 5
      }
    }))
  }
}

// =============================================================================
// SCHEMA FACTORY
// =============================================================================

export class SchemaFactory {
  private doctorGenerator = new DoctorSchemaGenerator()
  private clinicGenerator = new ClinicSchemaGenerator()
  private serviceGenerator = new MedicalServiceSchemaGenerator()
  private localBusinessGenerator = new LocalBusinessSchemaGenerator()

  createSchema(type: string, data: any): StructuredData {
    switch (type.toLowerCase()) {
      case 'doctor':
        return this.doctorGenerator.generateDoctorSchema(data)
      case 'clinic':
        return this.clinicGenerator.generateClinicSchema(data)
      case 'service':
        return this.serviceGenerator.generateMedicalServiceSchema(data)
      case 'localbusiness':
        return this.localBusinessGenerator.generateLocalBusinessSchema(data)
      default:
        throw new Error(`Unsupported schema type: ${type}`)
    }
  }

  createMultipleSchemas(type: string, dataArray: any[]): StructuredData[] {
    return dataArray.map(data => this.createSchema(type, data))
  }
}

export const schemaFactory = new SchemaFactory()