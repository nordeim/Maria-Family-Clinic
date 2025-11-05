# SEO & Search Engine Optimization System
## My Family Clinic Healthcare Platform

Comprehensive SEO implementation for Singapore healthcare platform with technical SEO, healthcare-specific optimization, local SEO, and multi-language support.

## 🏥 Healthcare SEO Features

- **Technical SEO**: Meta tags, structured data, sitemaps, robots.txt
- **Healthcare-Specific**: Medical schemas, compliance, emergency care optimization
- **Local SEO**: Singapore location-based optimization, NAP consistency
- **Multi-Language**: 4 official Singapore languages (EN, ZH, MS, TA)
- **Performance Monitoring**: Real-time SEO analytics and tracking
- **Schema Markup**: Healthcare-specific structured data (Doctor, Clinic, Service)

## 📁 Directory Structure

```
seo/
├── components/           # React SEO components
├── services/            # SEO business logic services
├── utils/               # SEO utility functions
├── types/               # TypeScript type definitions
├── hooks/               # React SEO hooks
├── schemas/             # Schema.org generators
├── config/              # SEO configuration
├── analytics/           # SEO monitoring & analytics
└── api/                 # Next.js API routes
```

## 🚀 Quick Start

### 1. Basic SEO Implementation

```tsx
import { SEOProvider } from '@/seo/components/seo-components'

// Basic page SEO
export default function DoctorPage({ doctor }: { doctor: any }) {
  return (
    <SEOProvider 
      type="doctor" 
      data={doctor}
      language="en"
    >
      <div>
        <h1>Dr. {doctor.name}</h1>
        <p>{doctor.bio}</p>
      </div>
    </SEOProvider>
  )
}
```

### 2. Local SEO Optimization

```tsx
import { LocalSEO } from '@/seo/components/seo-components'

export default function ClinicPage({ clinic, location }) {
  return (
    <LocalSEO 
      clinicData={clinic}
      location={location}
      enableOptimization={true}
    >
      <div>
        <h1>{clinic.name}</h1>
        <p>Located in {location}</p>
      </div>
    </LocalSEO>
  )
}
```

### 3. Healthcare-Specific SEO

```tsx
import { HealthcareSEO } from '@/seo/components/seo-components'

export default function HealthContent({ doctor, content }) {
  return (
    <HealthcareSEO
      doctorData={doctor}
      specialty={doctor.specialties[0]}
      content={content}
      includeEmergencyInfo={true}
    >
      <article>
        <h1>Medical Information</h1>
        <div>{content}</div>
      </article>
    </HealthcareSEO>
  )
}
```

## 📊 SEO Hooks

### useSEO Hook
```tsx
import { useSEO } from '@/seo/hooks/seo-hooks'

function MyComponent() {
  const { metadata, updateMetadata, isLoading } = useSEO()
  
  const handleUpdateSEO = async () => {
    await updateMetadata('clinic', clinicData, 'en')
  }
  
  return (
    <div>
      <p>SEO Score: {metadata?.title ? 'Optimized' : 'Not Optimized'}</p>
      <button onClick={handleUpdateSEO}>Update SEO</button>
    </div>
  )
}
```

### useLocalSEO Hook
```tsx
import { useLocalSEO } from '@/seo/hooks/seo-hooks'

function LocalSEOComponent() {
  const { 
    localData, 
    localKeywords, 
    generateLocalSEO,
    getLocalKeywords 
  } = useLocalSEO()
  
  const optimizeForLocation = async (clinic, location) => {
    await generateLocalSEO(clinic, location)
  }
  
  return (
    <div>
      <p>Keywords: {localKeywords.join(', ')}</p>
    </div>
  )
}
```

### useSEOMonitoring Hook
```tsx
import { useSEOMonitoring } from '@/seo/hooks/seo-hooks'

function SEODashboard() {
  const { 
    analytics, 
    seoScore, 
    loadSEOAnalytics,
    loadTopKeywords 
  } = useSEOMonitoring()
  
  useEffect(() => {
    loadSEOAnalytics()
  }, [])
  
  return (
    <div>
      <h2>SEO Score: {seoScore?.overall}%</h2>
      <p>Organic Traffic: {analytics?.organicTraffic.sessions}</p>
    </div>
  )
}
```

## 🏗️ SEO Services

### CoreSEOService
```typescript
import { seoServices } from '@/seo/services/seo-services'

// Generate page metadata
const metadata = await seoServices.core.generatePageMetadata(
  'doctor', 
  doctorData, 
  'en'
)

// Generate structured data
const schema = await seoServices.schemaFactory.createSchema(
  'Doctor', 
  doctorData
)
```

### LocalSEOService
```typescript
// Generate local business data
const localData = await seoServices.local.generateLocalBusinessData(clinic)

// Get local keywords
const keywords = await seoServices.local.generateLocalKeywords('Marina Bay')

// Analyze local SEO performance
const performance = await seoServices.local.analyzeLocalSEO(clinics, queries)
```

### HealthcareSEOService
```typescript
// Generate medical keywords
const medicalKeywords = await seoServices.healthcare.generateMedicalKeywords(doctor)

// Generate Healthier SG keywords
const healthierSGKeywords = await seoServices.healthcare.generateHealthierSGKeywords()

// Validate medical content
const validation = await seoServices.healthcare.validateMedicalContent(content)
```

## 📈 SEO Analytics

### Performance Tracking
```typescript
import { seoAnalytics } from '@/seo/analytics/seo-analytics'

// Track keyword rankings
const tracker = seoAnalytics.performance.getInstance()
await tracker.updateKeywordRanking('clinic near me singapore', {
  keyword: 'clinic near me singapore',
  position: 3,
  searchVolume: 5000,
  trend: 'up'
})

// Get performance metrics
const metrics = await tracker.getPerformanceMetrics()
```

### Healthcare Content Analysis
```typescript
// Analyze medical content
const analysis = await seoAnalytics.healthcare.analyzeMedicalContentSEO({
  title: 'Heart Disease Prevention Guide',
  description: 'Learn about heart disease prevention',
  body: 'Content about cardiovascular health...',
  medicalTerms: ['heart disease', 'cardiovascular', 'prevention'],
  conditions: ['heart disease', 'hypertension']
})

console.log(analysis.score) // SEO score
console.log(analysis.recommendations) // Optimization suggestions
```

### Local SEO Analysis
```typescript
// Analyze local SEO performance
const localAnalysis = await seoAnalytics.local.analyzeLocalSEOPerformance(
  clinicData,
  competitorData
)

console.log(localAnalysis.score) // Local SEO score
console.log(localAnalysis.recommendations) // Improvement suggestions
```

## 🗺️ Sitemap Generation

### Generate Sitemaps
```typescript
import { sitemapUtils } from '@/seo/utils/sitemap-generator'

// Generate specific sitemap
const clinicEntries = await sitemapUtils.generator.generateSitemap('clinics')

// Generate all sitemaps
const allSitemaps = await sitemapUtils.generator.generateAllSitemaps()

// Format as XML
const xml = sitemapUtils.generator.formatSitemapXML(entries)
```

### API Usage
```bash
# Get sitemap index
GET /api/seo/sitemap

# Get specific sitemap
POST /api/seo/sitemap
{
  "type": "clinics"
}

# Get sitemap information
OPTIONS /api/seo/sitemap
```

## 🤖 Robots.txt Generation

### Generate Robots.txt
```typescript
import { robotsUtils } from '@/seo/utils/robots-generator'

// Generate production robots.txt
const robots = robotsUtils.generator.generateRobotsTxt()

// Generate emergency robots.txt
const emergency = robotsUtils.generator.generateEmergencyRobotsTxt()

// Validate robots configuration
const validation = robotsUtils.validator.validateRobotsRules(config)
```

### API Usage
```bash
# Get robots.txt
GET /api/seo/robots

# Validate robots configuration
POST /api/seo/robots
{
  "config": { ... }
}
```

## 🏥 Healthcare-Specific Features

### Medical Schema Markup
```typescript
// Doctor schema
const doctorSchema = await schemaFactory.createSchema('doctor', doctorData)
/*
{
  "@context": "https://schema.org",
  "@type": "Physician",
  "name": "Dr. Sarah Lim",
  "medicalSpecialty": ["General Practice"],
  "workLocation": { ... }
}
*/

// Clinic schema
const clinicSchema = await schemaFactory.createSchema('clinic', clinicData)
/*
{
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  "name": "Marina Bay Medical Centre",
  "address": { ... },
  "openingHours": [ ... ]
}
*/

// Service schema
const serviceSchema = await schemaFactory.createSchema('service', serviceData)
/*
{
  "@context": "https://schema.org",
  "@type": "MedicalService",
  "name": "Health Screening",
  "provider": { ... }
}
*/
```

### Local Business Optimization
```typescript
// Singapore-specific local SEO
const singaporeSEO = {
  location: {
    country: 'Singapore',
    region: 'Central Region',
    district: 'Marina Bay'
  },
  healthcareContext: {
    healthierSGProgram: true,
    subsidyEligibility: 'CHAS',
    mohGuidelines: 'Singapore Ministry of Health'
  }
}

// Generate local keywords
const localKeywords = LocalSEOHelper.generateLocalKeywords('Marina Bay')
/*
[
  "Marina Bay clinic",
  "Marina Bay GP", 
  "doctor Marina Bay",
  "healthcare Marina Bay"
]
*/
```

### Multi-Language SEO
```typescript
// 4 official Singapore languages
const languages = ['en', 'zh', 'ms', 'ta']

// Generate hreflang tags
const hreflangs = MultiLanguageSEOService.generateHreflangs('/clinics/marina-bay', 'en')
/*
[
  { hreflang: 'en-SG', href: 'https://myfamilyclinic.sg/clinics/marina-bay' },
  { hreflang: 'zh-SG', href: 'https://myfamilyclinic.sg/zh/clinics/marina-bay' }
]
*/

// Translate metadata
const translatedMeta = await MultiLanguageSEOService.translateSEOMetadata(
  metadata, 
  'en', 
  'zh'
)
```

## 📊 SEO Monitoring Dashboard

### Component Usage
```tsx
import { SEOMonitoringDashboard } from '@/seo/components/seo-components'

export default function SEODashboard() {
  return (
    <div>
      <h1>SEO Performance Dashboard</h1>
      
      {/* Compact view */}
      <SEOMonitoringDashboard compact={true} />
      
      {/* Full dashboard */}
      <SEOMonitoringDashboard 
        showAdvancedMetrics={true}
        refreshInterval={300000} // 5 minutes
      />
    </div>
  )
}
```

### API Monitoring
```bash
# Get SEO overview
GET /api/seo/analytics?action=overview

# Get keyword analytics
GET /api/seo/analytics?action=keywords&limit=50&specialty=cardiology

# Get local SEO analytics
GET /api/seo/analytics?action=local&location=marina-bay

# Get healthcare SEO analytics
GET /api/seo/analytics?action=healthcare&specialty=cardiology

# Update keyword ranking
POST /api/seo/analytics
{
  "action": "updateKeywordRanking",
  "data": {
    "keyword": "clinic near me singapore",
    "ranking": {
      "position": 3,
      "searchVolume": 5000,
      "trend": "up"
    }
  }
}
```

## 🔧 Configuration

### SEO Configuration
```typescript
// seo/config/seo.config.ts
export const SEO_CONFIG = {
  baseUrl: 'https://myfamilyclinic.sg',
  defaultLanguage: 'en',
  defaultTitle: 'My Family Clinic - Singapore Primary Care Network',
  companyName: 'My Family Clinic',
  supportedLanguages: ['en', 'zh', 'ms', 'ta'],
  // ... more config
}
```

### Healthcare-Specific Config
```typescript
export const HEALTHCARE_SEO_CONFIG = {
  specialties: [
    'General Practice', 'Cardiology', 'Dermatology',
    'Endocrinology', 'Neurology', 'Oncology'
  ],
  services: [
    'Health Screening', 'Vaccination', 'Chronic Disease Management',
    'Preventive Care', 'Emergency Care', 'Telemedicine'
  ]
}
```

### Singapore Local SEO Config
```typescript
export const SINGAPORE_SEO_CONFIG = {
  location: {
    country: 'Singapore',
    region: 'Central Region',
    districts: [ /* Singapore districts */ ]
  },
  healthcareContext: {
    mohGuidelines: 'Singapore Ministry of Health Guidelines',
    healthierSGProgram: true,
    subsidyEligibility: 'CHAS'
  }
}
```

## 📱 Mobile & Accessibility

### Mobile SEO Optimization
```typescript
// Mobile-specific optimizations
const mobileSEO = {
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  ampEnabled: true,
  pwaReady: true,
  coreWebVitals: {
    LCP: '< 2.5s',
    FID: '< 100ms', 
    CLS: '< 0.1'
  }
}
```

### Accessibility SEO
```typescript
// Accessibility features
const accessibilitySEO = {
  skipLinks: true,
  screenReaderSupport: true,
  highContrastSupport: true,
  ariaLabels: true,
  semanticHTML: true
}
```

## 🚨 Emergency Healthcare SEO

### Emergency Care Optimization
```typescript
// Emergency healthcare keywords
const emergencyKeywords = HealthcareSEOHelper.generateEmergencyCareKeywords()
/*
[
  'emergency healthcare',
  'urgent care Singapore', 
  'after hours clinic',
  'emergency appointment',
  'walk in clinic'
]
*/

// Emergency schema markup
const emergencySchema = {
  "@context": "https://schema.org",
  "@type": "EmergencyService",
  "name": "24/7 Emergency Healthcare",
  "availableService": "Emergency Medical Care",
  "openingHours": "24/7"
}
```

## 📈 Performance Targets

### Core Web Vitals
- LCP: < 2.5s (Largest Contentful Paint)
- FID: < 100ms (First Input Delay)
- CLS: < 0.1 (Cumulative Layout Shift)

### SEO Targets
- Organic Traffic Increase: 30%
- Keywords in Top 3: 25
- Keywords in Top 10: 100
- Keywords in Top 50: 500

### Local SEO Targets
- Local Pack Appearances: 50
- Average Local Rank: 3.5
- Review Response Rate: 90%

## 🛠️ Development

### Environment Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

### Testing SEO Implementation
```bash
# Test sitemap generation
npm run test:sitemap

# Test robots.txt generation
npm run test:robots

# Test SEO analytics
npm run test:analytics
```

### Monitoring & Debugging
```typescript
// Debug mode in development
const DEBUG_SEO = process.env.NODE_ENV === 'development'

if (DEBUG_SEO) {
  console.log('SEO metadata:', metadata)
  console.log('Structured data:', structuredData)
  console.log('Hreflang tags:', hreflangs)
}
```

## 🔍 SEO Best Practices

### Content Optimization
1. Use medical terminology appropriately
2. Include emergency contact information
3. Add medical disclaimers
4. Optimize for Healthier SG keywords
5. Create location-specific content

### Technical SEO
1. Implement proper schema markup
2. Use semantic HTML structure
3. Optimize Core Web Vitals
4. Ensure mobile-first design
5. Generate dynamic sitemaps

### Local SEO
1. Maintain NAP consistency
2. Optimize Google My Business
3. Encourage patient reviews
4. Create location-based landing pages
5. Build local citations

### Healthcare Compliance
1. Follow MOH guidelines
2. Include appropriate disclaimers
3. Maintain patient privacy
4. Provide accurate medical information
5. Include emergency contact details

## 📚 API Documentation

### Available Endpoints

#### Sitemap API
- `GET /api/seo/sitemap` - Sitemap index
- `POST /api/seo/sitemap` - Generate specific sitemap
- `OPTIONS /api/seo/sitemap` - Sitemap information

#### Robots API  
- `GET /api/seo/robots` - Robots.txt content
- `POST /api/seo/robots` - Validate robots configuration
- `PUT /api/seo/robots` - Generate robots configuration

#### Analytics API
- `GET /api/seo/analytics` - SEO overview
- `GET /api/seo/analytics?action=keywords` - Keyword analytics
- `GET /api/seo/analytics?action=local` - Local SEO analytics
- `GET /api/seo/analytics?action=healthcare` - Healthcare SEO analytics
- `POST /api/seo/analytics` - Update rankings, validate content

## 🎯 Success Metrics

### Healthcare SEO KPIs
- Medical content visibility
- Local pack appearances
- Healthier SG program enrollment traffic
- Emergency care search visibility
- Specialist page rankings

### Technical SEO KPIs
- Core Web Vitals scores
- Mobile page speed
- Structured data validation
- Indexing coverage
- Crawl health

### Business SEO KPIs
- Organic appointment bookings
- Local search visibility
- Multi-language content performance
- Patient review generation
- Healthcare program participation

---

This SEO system provides comprehensive search engine optimization specifically designed for Singapore healthcare platforms, with medical compliance, local market focus, and multi-language support for optimal search visibility and user experience.