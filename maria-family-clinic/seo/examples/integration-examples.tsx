/**
 * SEO Integration Examples for My Family Clinic
 * Practical implementation examples for integrating SEO into Next.js pages
 */

import { 
  SEOProvider,
  StructuredDataProvider,
  LocalSEO,
  HealthcareSEO,
  MultiLanguageSEO,
  SEOMonitoringDashboard,
  KeywordResearch,
  SocialMediaOptimization
} from '@/seo/components/seo-components'
import { useSEO, useLocalSEO, useHealthcareSEO, useMultiLanguageSEO } from '@/seo/components/seo-components'

// =============================================================================
// HOMEPAGE SEO IMPLEMENTATION
// =============================================================================

export const HomePageSEO = () => {
  const homepageData = {
    title: 'My Family Clinic - Singapore Primary Care Network',
    description: 'Find doctors, book appointments, and manage your healthcare journey in Singapore\'s comprehensive primary care network. Healthier SG enrolled.',
    keywords: ['Singapore healthcare', 'clinic finder', 'doctor appointments', 'Healthier SG'],
    specialties: ['General Practice', 'Family Medicine', 'Internal Medicine'],
    location: 'Singapore',
    clinics: [
      {
        name: 'Marina Bay Medical Centre',
        address: { addressLocality: 'Marina Bay' },
        rating: 4.8,
        reviewCount: 150
      },
      {
        name: 'Orchard Health Centre', 
        address: { addressLocality: 'Orchard' },
        rating: 4.7,
        reviewCount: 200
      }
    ]
  }

  return (
    <SEOProvider 
      type="homepage" 
      data={homepageData}
      language="en"
    >
      <StructuredDataProvider 
        schemaType="Organization"
        data={{
          name: 'My Family Clinic',
          description: 'Singapore\'s premier primary care network',
          url: 'https://myfamilyclinic.sg',
          medicalSpecialty: homepageData.specialties
        }}
      >
        <MultiLanguageSEO 
          currentPath="/"
          currentLanguage="en"
        >
          <LocalSEO 
            clinicData={homepageData.clinics[0]}
            location="Singapore"
          >
            <HomepageContent />
          </LocalSEO>
        </MultiLanguageSEO>
      </StructuredDataProvider>
    </SEOProvider>
  )
}

const HomepageContent = () => {
  const { metadata } = useSEO()
  
  return (
    <main>
      <h1>{metadata?.title}</h1>
      <p>{metadata?.description}</p>
      {/* Homepage content */}
    </main>
  )
}

// =============================================================================
// DOCTOR PROFILE PAGE SEO
// =============================================================================

export const DoctorProfileSEO = ({ doctor }: { doctor: any }) => {
  return (
    <SEOProvider 
      type="doctor" 
      data={doctor}
      language="en"
    >
      <StructuredDataProvider 
        schemaType="Doctor"
        data={doctor}
        validateSchema={true}
      >
        <MultiLanguageSEO 
          currentPath={`/doctors/${doctor.slug}`}
          currentLanguage="en"
        >
          <HealthcareSEO 
            doctorData={doctor}
            specialty={doctor.specialties?.[0]}
            includeEmergencyInfo={false}
          >
            <SocialMediaOptimization
              title={`Dr. ${doctor.name} - ${doctor.specialties?.[0]} Singapore`}
              description={`Consult Dr. ${doctor.name}, ${doctor.specialties?.[0]} with ${doctor.experienceYears}+ years experience. Book appointment today.`}
              image={doctor.profileImage}
              url={`https://myfamilyclinic.sg/doctors/${doctor.slug}`}
            />
            <DoctorProfileContent doctor={doctor} />
          </HealthcareSEO>
        </MultiLanguageSEO>
      </StructuredDataProvider>
    </SEOProvider>
  )
}

const DoctorProfileContent = ({ doctor }: { doctor: any }) => {
  const { metadata } = useSEO()
  const { medicalKeywords } = useHealthcareSEO()
  
  return (
    <article>
      <header>
        <h1>Dr. {doctor.name}</h1>
        <p>{doctor.bio}</p>
      </header>
      
      <section>
        <h2>Specializations</h2>
        <ul>
          {doctor.specialties?.map((specialty: string) => (
            <li key={specialty}>{specialty}</li>
          ))}
        </ul>
      </section>
      
      <section>
        <h2>Experience & Credentials</h2>
        <p>Experience: {doctor.experienceYears} years</p>
        <p>Qualifications: {doctor.qualifications?.join(', ')}</p>
      </section>
      
      {/* SEO keywords for internal tracking */}
      <div data-seo-keywords={medicalKeywords.join(',')} hidden />
    </article>
  )
}

// =============================================================================
// CLINIC PAGE SEO
// =============================================================================

export const ClinicPageSEO = ({ clinic, location }: { clinic: any, location: string }) => {
  const clinicData = {
    ...clinic,
    address: {
      ...clinic.address,
      addressLocality: location
    }
  }

  return (
    <SEOProvider 
      type="clinic" 
      data={clinicData}
      language="en"
    >
      <StructuredDataProvider 
        schemaType="Clinic"
        data={clinicData}
      >
        <MultiLanguageSEO 
          currentPath={`/clinics/${clinic.slug}`}
          currentLanguage="en"
        >
          <LocalSEO 
            clinicData={clinicData}
            location={location}
            enableOptimization={true}
          >
            <SocialMediaOptimization
              title={`${clinic.name} - Healthcare Services in ${location}`}
              description={`Visit ${clinic.name} for comprehensive healthcare services in ${location}. Professional medical care with Healthier SG enrollment.`}
              image={clinic.images?.[0]}
              url={`https://myfamilyclinic.sg/clinics/${clinic.slug}`}
            />
            <ClinicPageContent clinic={clinicData} location={location} />
          </LocalSEO>
        </MultiLanguageSEO>
      </StructuredDataProvider>
    </SEOProvider>
  )
}

const ClinicPageContent = ({ clinic, location }: { clinic: any, location: string }) => {
  const { metadata } = useSEO()
  const { localData, localKeywords } = useLocalSEO()
  
  return (
    <main>
      <header>
        <h1>{clinic.name}</h1>
        <p>Located in {location}</p>
        <p>{clinic.description}</p>
      </header>
      
      <section>
        <h2>Contact Information</h2>
        <p>Address: {clinic.address.streetAddress}, {clinic.address.addressLocality}</p>
        <p>Phone: {clinic.phone}</p>
        <p>Hours: Monday-Friday 8AM-5PM, Saturday 8AM-12PM</p>
      </section>
      
      <section>
        <h2>Services Available</h2>
        <ul>
          {clinic.services?.map((service: any) => (
            <li key={service.id}>{service.name}</li>
          ))}
        </ul>
      </section>
      
      {/* Local SEO data for tracking */}
      <div 
        data-local-keywords={localKeywords.join(',')} 
        data-location-optimized={localData ? 'true' : 'false'}
        hidden
      />
    </main>
  )
}

// =============================================================================
// SERVICE PAGE SEO
// =============================================================================

export const ServicePageSEO = ({ service }: { service: any }) => {
  const serviceData = {
    ...service,
    category: {
      name: service.categoryName || 'General Healthcare'
    }
  }

  return (
    <SEOProvider 
      type="service" 
      data={serviceData}
      language="en"
    >
      <StructuredDataProvider 
        schemaType="Service"
        data={serviceData}
      >
        <MultiLanguageSEO 
          currentPath={`/services/${service.slug}`}
          currentLanguage="en"
        >
          <HealthcareSEO 
            specialty={service.category?.name}
            content={service.description}
            includeEmergencyInfo={service.urgentCare}
          >
            <ServicePageContent service={serviceData} />
          </HealthcareSEO>
        </MultiLanguageSEO>
      </StructuredDataProvider>
    </SEOProvider>
  )
}

const ServicePageContent = ({ service }: { service: any }) => {
  const { metadata } = useSEO()
  const { contentValidation } = useHealthcareSEO()
  
  return (
    <article>
      <header>
        <h1>{service.name}</h1>
        <p>{service.description}</p>
      </header>
      
      {service.urgentCare && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
          <h2 className="text-red-800 font-semibold">Emergency Service</h2>
          <p className="text-red-700">This service is available for urgent medical needs. Call 995 for immediate assistance.</p>
        </div>
      )}
      
      <section>
        <h2>About This Service</h2>
        <div dangerouslySetInnerHTML={{ __html: service.fullDescription }} />
      </section>
      
      <section>
        <h2>Conditions Treated</h2>
        <ul>
          {service.conditions?.map((condition: any) => (
            <li key={condition.id}>{condition.name}</li>
          ))}
        </ul>
      </section>
      
      <section>
        <h2>What to Expect</h2>
        <p>{service.procedureDescription}</p>
      </section>
      
      {/* Medical content validation indicator */}
      {contentValidation && (
        <div 
          data-medical-compliance={contentValidation.medicalCompliance ? 'true' : 'false'}
          data-content-score={contentValidation.isOptimized ? 'high' : 'needs-improvement'}
          hidden
        />
      )}
    </article>
  )
}

// =============================================================================
// HEALTHIER SG PROGRAM PAGE SEO
// =============================================================================

export const HealthierSGPageSEO = () => {
  const healthierSGData = {
    title: 'Healthier SG Program - My Family Clinic Singapore',
    description: 'Join Singapore\'s Healthier SG program for preventive healthcare. Enroll with My Family Clinic for comprehensive health screening and chronic disease management.',
    programInfo: {
      eligibility: 'All Singapore residents aged 40 and above',
      benefits: ['Free health screening', 'Chronic disease management', 'Personal health plan'],
      enrollment: 'Available at all My Family Clinic locations'
    }
  }

  return (
    <SEOProvider 
      type="page" 
      data={healthierSGData}
      language="en"
    >
      <StructuredDataProvider 
        schemaType="LocalBusiness"
        data={{
          name: 'My Family Clinic - Healthier SG Program',
          description: 'Healthier SG enrollment and healthcare services',
          medicalSpecialty: ['Preventive Care', 'Chronic Disease Management'],
          hasCredential: ['Healthier SG Enrolled', 'MOH Licensed', 'CHAS Accredited']
        }}
      >
        <MultiLanguageSEO 
          currentPath="/healthier-sg"
          currentLanguage="en"
        >
          <HealthcareSEO 
            includeEmergencyInfo={false}
          >
            <HealthierSGContent />
          </HealthcareSEO>
        </MultiLanguageSEO>
      </StructuredDataProvider>
    </SEOProvider>
  )
}

const HealthierSGContent = () => {
  const { metadata } = useSEO()
  const { healthierSGKeywords } = useHealthcareSEO()
  
  return (
    <main>
      <header>
        <h1>Healthier SG Program</h1>
        <p>Singapore's national health program for preventive care and healthy living</p>
      </header>
      
      <section>
        <h2>What is Healthier SG?</h2>
        <p>Healthier SG is a national health program designed to help Singapore residents aged 40 and above take proactive steps towards better health through personalized health plans, regular health screening, and chronic disease management.</p>
      </section>
      
      <section>
        <h2>Benefits of Healthier SG</h2>
        <ul>
          <li>Free comprehensive health screening</li>
          <li>Personalized health plan from your family doctor</li>
          <li>Chronic disease management and monitoring</li>
          <li>Health coaching and lifestyle guidance</li>
          <li>Subsidized healthcare services</li>
        </ul>
      </section>
      
      <section>
        <h2>How to Enroll</h2>
        <ol>
          <li>Visit any My Family Clinic location</li>
          <li>Bring your NRIC or FIN card</li>
          <li>Complete the enrollment form</li>
          <li>Schedule your first health screening</li>
        </ol>
      </section>
      
      {/* Healthier SG keywords for SEO tracking */}
      <div data-healthier-sg-keywords={healthierSGKeywords.join(',')} hidden />
    </main>
  )
}

// =============================================================================
// LOCATION-BASED CLINIC LISTING SEO
// =============================================================================

export const LocationClinicsSEO = ({ location }: { location: string }) => {
  const locationData = {
    name: `Healthcare Clinics in ${location}`,
    description: `Find the best healthcare clinics and doctors in ${location}, Singapore. Book appointments, health screening, and medical consultations.`,
    location: location,
    clinics: [] // Would be fetched from API
  }

  return (
    <SEOProvider 
      type="location" 
      data={location}
      language="en"
    >
      <StructuredDataProvider 
        schemaType="LocalBusiness"
        data={{
          name: `Healthcare Services ${location}`,
          description: `Healthcare clinics and medical services in ${location}, Singapore`,
          address: {
            addressLocality: location,
            addressCountry: 'SG'
          },
          medicalSpecialty: ['General Practice', 'Family Medicine']
        }}
      >
        <MultiLanguageSEO 
          currentPath={`/clinics/${location.toLowerCase().replace(' ', '-')}`}
          currentLanguage="en"
        >
          <LocalSEO 
            clinicData={{
              name: `Clinics in ${location}`,
              address: { addressLocality: location }
            }}
            location={location}
            enableOptimization={true}
          >
            <LocationClinicsContent location={location} />
          </LocalSEO>
        </MultiLanguageSEO>
      </StructuredDataProvider>
    </SEOProvider>
  )
}

const LocationClinicsContent = ({ location }: { location: string }) => {
  const { metadata } = useSEO()
  const { localKeywords } = useLocalSEO()
  
  return (
    <main>
      <header>
        <h1>Healthcare Clinics in {location}</h1>
        <p>Find the best doctors and medical services in {location}, Singapore</p>
      </header>
      
      <section>
        <h2>Why Choose Healthcare in {location}?</h2>
        <p>{location} offers excellent healthcare facilities with easy access to specialists, comprehensive medical services, and Healthier SG program enrollment.</p>
      </section>
      
      <section>
        <h2>Available Services</h2>
        <ul>
          <li>General Practice consultations</li>
          <li>Health screening and check-ups</li>
          <li>Chronic disease management</li>
          <li>Specialist referrals</li>
          <li>Emergency care</li>
        </ul>
      </section>
      
      {/* Local SEO keywords */}
      <div data-local-keywords={localKeywords.join(',')} hidden />
    </main>
  )
}

// =============================================================================
// SEO MONITORING DASHBOARD COMPONENT
// =============================================================================

export const SEOManagementDashboard = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">SEO Management Dashboard</h1>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Data
        </button>
      </div>
      
      {/* Compact SEO Overview */}
      <SEOMonitoringDashboard compact={true} />
      
      {/* Full SEO Performance Dashboard */}
      <SEOMonitoringDashboard 
        showAdvancedMetrics={true}
        refreshInterval={300000} // 5 minutes
      />
      
      {/* Keyword Research for Content Optimization */}
      <KeywordResearchExample />
    </div>
  )
}

const KeywordResearchExample = () => {
  const sampleContent = `
    Heart disease prevention is crucial for maintaining cardiovascular health. 
    Regular check-ups with your cardiologist can help detect early signs of heart problems. 
    Lifestyle changes including diet, exercise, and stress management are key to preventing heart disease.
    Singapore residents can benefit from comprehensive health screening programs.
  `
  
  const targetKeywords = [
    'heart disease',
    'cardiologist singapore', 
    'cardiovascular health',
    'health screening singapore',
    'preventive care'
  ]
  
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Keyword Research & Content Optimization</h2>
      <KeywordResearch 
        content={sampleContent}
        targetKeywords={targetKeywords}
        showDensityAnalysis={true}
        showOpportunities={true}
      />
    </div>
  )
}

// =============================================================================
// MULTI-LANGUAGE PAGE EXAMPLE
// =============================================================================

export const MultiLanguagePageExample = ({ language }: { language: string }) => {
  const { 
    supportedLanguages, 
    currentLanguage, 
    generateHreflangTags,
    switchLanguage 
  } = useMultiLanguageSEO()
  
  const currentPath = `/clinics/marina-bay`
  
  React.useEffect(() => {
    generateHreflangTags(currentPath, language)
  }, [currentPath, language, generateHreflangTags])
  
  return (
    <div>
      <nav className="mb-6">
        <div className="flex space-x-4">
          {supportedLanguages.map(lang => (
            <button
              key={lang}
              onClick={() => switchLanguage(lang)}
              className={`px-3 py-1 rounded ${
                currentLanguage === lang 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>
      
      <div>
        <h1>Marina Bay Medical Centre</h1>
        <p>Current language: {currentLanguage}</p>
        <p>Available in: {supportedLanguages.join(', ')}</p>
      </div>
    </div>
  )
}

// =============================================================================
// ERROR BOUNDARY FOR SEO COMPONENTS
// =============================================================================

export class SEOErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('SEO Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            SEO Components Error
          </h2>
          <p className="text-gray-600 mb-4">
            There was an error loading SEO components. 
            The page will still function normally.
          </p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}