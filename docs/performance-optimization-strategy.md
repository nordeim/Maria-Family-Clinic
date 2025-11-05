# Performance Optimization Strategy: My Family Clinic Website

## Executive Summary
This performance optimization strategy ensures the My Family Clinic website delivers exceptional user experience through fast loading times, smooth interactions, and efficient resource utilization. The strategy focuses on Core Web Vitals optimization, healthcare-specific performance requirements, and continuous monitoring.

## Performance Targets

### Core Web Vitals Goals
```typescript
interface PerformanceTargets {
  coreWebVitals: {
    lcp: number;        // Largest Contentful Paint
    fid: number;        // First Input Delay
    cls: number;        // Cumulative Layout Shift
    inp: number;        // Interaction to Next Paint (WCAG 2.2)
  };
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  customMetrics: {
    ttfb: number;       // Time to First Byte
    fcp: number;        // First Contentful Paint
    tti: number;        // Time to Interactive
    speedIndex: number;
    totalBlockingTime: number;
  };
}

const performanceTargets: PerformanceTargets = {
  coreWebVitals: {
    lcp: 2500,          // 2.5 seconds (Good)
    fid: 100,           // 100 milliseconds (Good)
    cls: 0.1,           // 0.1 (Good)
    inp: 200,           // 200 milliseconds (Good)
  },
  lighthouse: {
    performance: 90,     // 90+ score
    accessibility: 95,   // 95+ score
    bestPractices: 90,   // 90+ score
    seo: 90,            // 90+ score
  },
  customMetrics: {
    ttfb: 800,          // 800 milliseconds
    fcp: 1800,          // 1.8 seconds
    tti: 3800,          // 3.8 seconds
    speedIndex: 3400,   // 3.4 seconds
    totalBlockingTime: 200, // 200 milliseconds
  },
};
```

### Healthcare-Specific Performance Requirements
```typescript
interface HealthcarePerformanceRequirements {
  clinicSearch: {
    geolocationTimeout: number;
    searchResultsLoadTime: number;
    mapInteractionDelay: number;
  };
  emergencyInformation: {
    criticalInfoLoadTime: number;
    emergencyContactDisplayTime: number;
  };
  forms: {
    enquirySubmissionTime: number;
    formValidationDelay: number;
    autoSaveInterval: number;
  };
  accessibility: {
    screenReaderResponseTime: number;
    keyboardNavigationDelay: number;
    focusIndicatorDelay: number;
  };
}

const healthcareRequirements: HealthcarePerformanceRequirements = {
  clinicSearch: {
    geolocationTimeout: 5000,      // 5 seconds max for geolocation
    searchResultsLoadTime: 2000,   // 2 seconds for search results
    mapInteractionDelay: 100,      // 100ms for map interactions
  },
  emergencyInformation: {
    criticalInfoLoadTime: 1000,    // 1 second for emergency info
    emergencyContactDisplayTime: 500, // 500ms for emergency contacts
  },
  forms: {
    enquirySubmissionTime: 3000,   // 3 seconds for form submission
    formValidationDelay: 300,      // 300ms for validation feedback
    autoSaveInterval: 30000,       // 30 seconds for auto-save
  },
  accessibility: {
    screenReaderResponseTime: 100,  // 100ms for screen reader updates
    keyboardNavigationDelay: 50,    // 50ms for keyboard navigation
    focusIndicatorDelay: 0,         // Immediate focus indicators
  },
};
```

## Frontend Performance Optimization

### 1. Next.js App Router Optimization
```typescript
// next.config.js - Production optimizations
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Experimental features for performance
  experimental: {
    ppr: true,                    // Partial Prerendering
    reactCompiler: true,          // React Compiler
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['supabase.co', 'res.cloudinary.com'],
    minimumCacheTTL: 31536000,    // 1 year cache
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compression
  compress: true,
  
  // Bundle optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analyzer in development
    if (!dev && !isServer) {
      config.plugins.push(
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 1,
        })
      );
    }

    // Optimize SVG loading
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // Static optimization
  trailingSlash: false,
  generateEtags: true,
  
  // Security headers that also improve performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=3600',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 2. Component-Level Optimizations
```typescript
// Optimized clinic card component
import { memo, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

interface ClinicCardProps {
  clinic: Clinic;
  distance?: number;
  onSelect: (clinic: Clinic) => void;
}

export const ClinicCard = memo<ClinicCardProps>(({ clinic, distance, onSelect }) => {
  // Memoize expensive calculations
  const formattedDistance = useMemo(() => {
    return distance ? `${distance.toFixed(1)} km away` : null;
  }, [distance]);

  const operatingStatus = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    const todayHours = clinic.operatingHours?.[currentDay];
    if (!todayHours) return 'Closed';
    
    if (currentTime >= todayHours.open && currentTime <= todayHours.close) {
      return 'Open';
    }
    return 'Closed';
  }, [clinic.operatingHours]);

  return (
    <Card 
      className="clinic-card cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={() => onSelect(clinic)}
      role="button"
      tabIndex={0}
      aria-label={`${clinic.name} clinic card`}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {clinic.imageUrl && (
            <div className="flex-shrink-0">
              <Image
                src={clinic.imageUrl}
                alt={`${clinic.name} exterior`}
                width={80}
                height={80}
                className="rounded-lg object-cover"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/..."
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {clinic.name}
            </h3>
            
            <p className="text-sm text-gray-600 line-clamp-2">
              {clinic.address}
            </p>
            
            <div className="mt-2 flex items-center space-x-4">
              {formattedDistance && (
                <span className="text-sm text-gray-500">
                  {formattedDistance}
                </span>
              )}
              
              <span className={`text-sm font-medium ${
                operatingStatus === 'Open' 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {operatingStatus}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ClinicCard.displayName = 'ClinicCard';

// Virtualized list for large datasets
import { FixedSizeList as List } from 'react-window';

interface VirtualizedClinicListProps {
  clinics: Clinic[];
  onSelect: (clinic: Clinic) => void;
}

export function VirtualizedClinicList({ clinics, onSelect }: VirtualizedClinicListProps) {
  const itemHeight = 120; // Fixed height for each clinic card
  const containerHeight = Math.min(600, clinics.length * itemHeight);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <ClinicCard 
        clinic={clinics[index]} 
        onSelect={onSelect}
      />
    </div>
  );

  return (
    <List
      height={containerHeight}
      itemCount={clinics.length}
      itemSize={itemHeight}
      overscanCount={5}
    >
      {Row}
    </List>
  );
}
```

### 3. Image Optimization Strategy
```typescript
// Advanced image optimization utility
export class ImageOptimizer {
  private static readonly BREAKPOINTS = [640, 768, 1024, 1280, 1536];
  
  static generateSrcSet(src: string, sizes: number[]): string {
    return sizes
      .map(size => `${this.getOptimizedUrl(src, size)} ${size}w`)
      .join(', ');
  }
  
  static getOptimizedUrl(src: string, width: number, quality = 80): string {
    // Use Next.js Image Optimization API
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
  }
  
  static getSizes(breakpoints: { [key: string]: string }): string {
    return Object.entries(breakpoints)
      .map(([breakpoint, size]) => `(max-width: ${breakpoint}px) ${size}`)
      .join(', ');
  }
  
  static async preloadCriticalImages(images: string[]): Promise<void> {
    const preloadPromises = images.map(src => {
      return new Promise<void>((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        link.onload = () => resolve();
        link.onerror = () => reject();
        document.head.appendChild(link);
      });
    });
    
    await Promise.allSettled(preloadPromises);
  }
}

// Responsive image component with WebP/AVIF support
interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  sizes = '100vw',
}: OptimizedImageProps) {
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const avifSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.avif');

  return (
    <picture>
      <source srcSet={avifSrc} type="image/avif" />
      <source srcSet={webpSrc} type="image/webp" />
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={className}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/..."
      />
    </picture>
  );
}
```

### 4. Code Splitting & Lazy Loading
```typescript
// Dynamic imports for code splitting
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load map component (heavy dependency)
const ClinicMap = dynamic(() => import('../components/ClinicMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
      <span className="text-gray-500">Loading map...</span>
    </div>
  ),
});

// Lazy load chart components
const AnalyticsChart = dynamic(() => import('../components/AnalyticsChart'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />,
});

// Feature-based code splitting
const AdminPanel = dynamic(() => import('../components/AdminPanel'), {
  ssr: false,
});

// Route-based code splitting with preloading
export function ClinicSearchPage() {
  // Preload next likely page
  useEffect(() => {
    const timer = setTimeout(() => {
      import('../pages/clinic/[id]');
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <Suspense fallback={<ClinicSearchSkeleton />}>
        <ClinicSearch />
      </Suspense>
      
      <Suspense fallback={<MapSkeleton />}>
        <ClinicMap />
      </Suspense>
    </div>
  );
}

// Progressive loading strategy
export function useProgressiveLoading<T>(
  dataLoader: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await dataLoader();
        
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();
    
    return () => {
      cancelled = true;
    };
  }, dependencies);

  return { data, loading, error };
}
```

## Backend Performance Optimization

### 1. Database Query Optimization
```sql
-- Optimized queries with proper indexing
-- Clinic search with geospatial optimization
EXPLAIN ANALYZE
SELECT 
  c.id,
  c.name,
  c.address,
  c.phone,
  c.operating_hours,
  ST_Distance(c.location, ST_Point($1, $2)) as distance
FROM clinics c
WHERE ST_DWithin(c.location, ST_Point($1, $2), $3)
  AND c.status = 'ACTIVE'
ORDER BY distance
LIMIT 20;

-- Composite indexes for performance
CREATE INDEX CONCURRENTLY idx_clinics_status_location_gist 
ON clinics USING GIST (location, status) 
WHERE status = 'ACTIVE';

CREATE INDEX CONCURRENTLY idx_service_clinics_performance
ON service_clinics (service_id, clinic_id, available, waiting_time_minutes)
WHERE available = true;

-- Materialized view for complex aggregations
CREATE MATERIALIZED VIEW clinic_analytics AS
SELECT 
  c.id as clinic_id,
  c.name,
  COUNT(e.id) as total_enquiries,
  AVG(sc.waiting_time_minutes) as avg_waiting_time,
  COUNT(DISTINCT sc.service_id) as services_count
FROM clinics c
LEFT JOIN enquiries e ON e.clinic_id = c.id AND e.created_at >= NOW() - INTERVAL '30 days'
LEFT JOIN service_clinics sc ON sc.clinic_id = c.id AND sc.available = true
WHERE c.status = 'ACTIVE'
GROUP BY c.id, c.name;

-- Refresh strategy for materialized view
CREATE OR REPLACE FUNCTION refresh_clinic_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY clinic_analytics;
END;
$$ LANGUAGE plpgsql;

-- Schedule regular refresh
SELECT cron.schedule('refresh-analytics', '0 */6 * * *', 'SELECT refresh_clinic_analytics();');
```

### 2. API Response Optimization
```typescript
// tRPC with caching and optimization
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cached procedure wrapper
function cachedProcedure<TInput, TOutput>(
  procedure: any,
  cacheKeyFn: (input: TInput) => string,
  ttlSeconds: number = 300
) {
  return procedure.use(async ({ input, next }: any) => {
    const cacheKey = cacheKeyFn(input);
    
    // Try to get from cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return { data: JSON.parse(cached) };
    }
    
    // Execute procedure
    const result = await next();
    
    // Cache successful results
    if (result.ok) {
      await redis.setex(cacheKey, ttlSeconds, JSON.stringify(result.data));
    }
    
    return result;
  });
}

// Optimized clinic router
export const clinicRouter = createTRPCRouter({
  searchNearby: cachedProcedure(
    publicProcedure,
    (input: { lat: number; lng: number; radius: number; services?: string[] }) => 
      `clinics:nearby:${input.lat}:${input.lng}:${input.radius}:${input.services?.join(',')}`,
    300 // 5 minutes cache
  )
    .input(z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      radius: z.number().min(100).max(50000).default(5000),
      services: z.array(z.string()).optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ input, ctx }) => {
      const { lat, lng, radius, services, limit } = input;
      
      try {
        // Use raw SQL for optimized geospatial query
        const query = `
          SELECT 
            c.id,
            c.name,
            c.address,
            c.phone,
            c.operating_hours,
            c.amenities,
            COALESCE(ca.avg_waiting_time, 30) as avg_waiting_time,
            ST_Distance(c.location, ST_Point($1, $2)) / 1000 as distance_km,
            json_agg(DISTINCT s.name) FILTER (WHERE s.id IS NOT NULL) as services
          FROM clinics c
          LEFT JOIN clinic_analytics ca ON ca.clinic_id = c.id
          LEFT JOIN service_clinics sc ON sc.clinic_id = c.id AND sc.available = true
          LEFT JOIN services s ON s.id = sc.service_id
          WHERE ST_DWithin(c.location, ST_Point($1, $2), $3)
            AND c.status = 'ACTIVE'
            ${services?.length ? 'AND s.id = ANY($5)' : ''}
          GROUP BY c.id, ca.avg_waiting_time
          ORDER BY distance_km
          LIMIT $4
        `;
        
        const params = services?.length 
          ? [lng, lat, radius, limit, services]
          : [lng, lat, radius, limit];
          
        const clinics = await ctx.db.$queryRawUnsafe(query, ...params);
        
        return clinics;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search clinics',
          cause: error,
        });
      }
    }),

  // Optimized clinic details with minimal data fetching
  getById: cachedProcedure(
    publicProcedure,
    (input: { id: string }) => `clinic:${input.id}`,
    600 // 10 minutes cache
  )
    .input(z.object({
      id: z.string().cuid(),
    }))
    .query(async ({ input, ctx }) => {
      const clinic = await ctx.db.clinic.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          address: true,
          phone: true,
          email: true,
          website: true,
          operatingHours: true,
          amenities: true,
          imageUrls: true,
          description: true,
          // Use select to fetch only needed data
          servicesClinics: {
            where: { available: true },
            select: {
              waitingTimeMinutes: true,
              service: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  description: true,
                },
              },
            },
          },
          doctorsClinics: {
            where: {
              doctor: { status: 'ACTIVE' },
            },
            select: {
              isPrimaryClinic: true,
              doctor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  title: true,
                  specialties: true,
                  languages: true,
                },
              },
            },
          },
        },
      });
      
      if (!clinic) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Clinic not found',
        });
      }
      
      return clinic;
    }),
});
```

### 3. Database Connection Optimization
```typescript
// Optimized Prisma configuration
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

// Connection pooling configuration
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

// Query optimization middleware
db.$use(async (params, next) => {
  const before = Date.now();
  
  const result = await next(params);
  
  const after = Date.now();
  const queryTime = after - before;
  
  // Log slow queries
  if (queryTime > 1000) {
    console.warn(`Slow query detected: ${params.model}.${params.action} took ${queryTime}ms`);
  }
  
  return result;
});

// Connection health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}
```

## Monitoring & Analytics

### 1. Real User Monitoring (RUM)
```typescript
// Performance monitoring service
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private observer: PerformanceObserver | null = null;
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  initialize() {
    if (typeof window === 'undefined') return;
    
    // Observe Core Web Vitals
    this.observeWebVitals();
    
    // Observe navigation timing
    this.observeNavigationTiming();
    
    // Observe resource timing
    this.observeResourceTiming();
    
    // Monitor long tasks
    this.observeLongTasks();
  }
  
  private observeWebVitals() {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(this.sendMetric.bind(this));
      getFID(this.sendMetric.bind(this));
      getFCP(this.sendMetric.bind(this));
      getLCP(this.sendMetric.bind(this));
      getTTFB(this.sendMetric.bind(this));
    });
  }
  
  private observeNavigationTiming() {
    if (!window.PerformanceObserver) return;
    
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          
          this.sendMetric({
            name: 'navigation',
            value: navEntry.loadEventEnd - navEntry.navigationStart,
            details: {
              dns: navEntry.domainLookupEnd - navEntry.domainLookupStart,
              tcp: navEntry.connectEnd - navEntry.connectStart,
              ttfb: navEntry.responseStart - navEntry.requestStart,
              download: navEntry.responseEnd - navEntry.responseStart,
              domProcessing: navEntry.domContentLoadedEventEnd - navEntry.responseEnd,
            },
          });
        }
      }
    });
    
    this.observer.observe({ entryTypes: ['navigation'] });
  }
  
  private observeResourceTiming() {
    if (!window.PerformanceObserver) return;
    
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resourceEntry = entry as PerformanceResourceTiming;
        
        // Monitor critical resources
        if (this.isCriticalResource(resourceEntry.name)) {
          this.sendMetric({
            name: 'resource-timing',
            value: resourceEntry.responseEnd - resourceEntry.startTime,
            details: {
              resource: resourceEntry.name,
              size: resourceEntry.transferSize,
              type: this.getResourceType(resourceEntry.name),
            },
          });
        }
      }
    });
    
    resourceObserver.observe({ entryTypes: ['resource'] });
  }
  
  private observeLongTasks() {
    if (!window.PerformanceObserver) return;
    
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.sendMetric({
          name: 'long-task',
          value: entry.duration,
          details: {
            startTime: entry.startTime,
            attribution: (entry as any).attribution,
          },
        });
      }
    });
    
    longTaskObserver.observe({ entryTypes: ['longtask'] });
  }
  
  private sendMetric(metric: any) {
    // Send to analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.value),
        custom_parameter_1: metric.details ? JSON.stringify(metric.details) : undefined,
      });
    }
    
    // Send to custom monitoring endpoint
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...metric,
        url: window.location.pathname,
        userAgent: navigator.userAgent,
        connection: (navigator as any).connection,
        timestamp: Date.now(),
      }),
    }).catch(console.error);
  }
  
  private isCriticalResource(url: string): boolean {
    return url.includes('/api/') || 
           url.includes('.css') || 
           url.includes('.js') ||
           url.includes('/images/critical/');
  }
  
  private getResourceType(url: string): string {
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.js')) return 'script';
    if (url.includes('/api/')) return 'api';
    if (url.match(/\.(jpg|jpeg|png|webp|avif|svg)$/)) return 'image';
    return 'other';
  }
}
```

### 2. Performance Dashboard
```typescript
// Performance analytics API
export const performanceRouter = createTRPCRouter({
  getMetrics: protectedProcedure
    .input(z.object({
      timeRange: z.enum(['1h', '24h', '7d', '30d']).default('24h'),
      metricType: z.enum(['all', 'web-vitals', 'navigation', 'resources']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { timeRange, metricType } = input;
      
      const timeRangeMs = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      }[timeRange];
      
      const startTime = new Date(Date.now() - timeRangeMs);
      
      const metrics = await ctx.db.performanceMetric.findMany({
        where: {
          createdAt: { gte: startTime },
          ...(metricType && metricType !== 'all' && { type: metricType }),
        },
        orderBy: { createdAt: 'desc' },
      });
      
      return {
        metrics,
        summary: this.calculateMetricsSummary(metrics),
        trends: this.calculateTrends(metrics),
      };
    }),

  getPageMetrics: protectedProcedure
    .input(z.object({
      path: z.string(),
      timeRange: z.enum(['1h', '24h', '7d', '30d']).default('24h'),
    }))
    .query(async ({ input, ctx }) => {
      // Get page-specific performance metrics
    }),
});

// Performance optimization recommendations
export class PerformanceOptimizer {
  static analyzeMetrics(metrics: PerformanceMetric[]): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    
    // Analyze LCP
    const lcpMetrics = metrics.filter(m => m.name === 'LCP');
    const avgLCP = lcpMetrics.reduce((sum, m) => sum + m.value, 0) / lcpMetrics.length;
    
    if (avgLCP > 2500) {
      recommendations.push({
        type: 'lcp-optimization',
        priority: 'high',
        title: 'Optimize Largest Contentful Paint',
        description: `Average LCP is ${avgLCP.toFixed(0)}ms, target is <2500ms`,
        suggestions: [
          'Optimize hero images with WebP/AVIF formats',
          'Implement image preloading for above-the-fold content',
          'Reduce server response times',
          'Use CDN for static assets',
        ],
      });
    }
    
    // Analyze CLS
    const clsMetrics = metrics.filter(m => m.name === 'CLS');
    const avgCLS = clsMetrics.reduce((sum, m) => sum + m.value, 0) / clsMetrics.length;
    
    if (avgCLS > 0.1) {
      recommendations.push({
        type: 'cls-optimization',
        priority: 'medium',
        title: 'Reduce Cumulative Layout Shift',
        description: `Average CLS is ${avgCLS.toFixed(3)}, target is <0.1`,
        suggestions: [
          'Add dimensions to images and videos',
          'Reserve space for dynamic content',
          'Avoid inserting content above existing content',
          'Use transform animations instead of layout-triggering properties',
        ],
      });
    }
    
    // Analyze long tasks
    const longTasks = metrics.filter(m => m.name === 'long-task');
    if (longTasks.length > 10) {
      recommendations.push({
        type: 'javascript-optimization',
        priority: 'high',
        title: 'Reduce JavaScript Execution Time',
        description: `Found ${longTasks.length} long tasks affecting interactivity`,
        suggestions: [
          'Break up long-running JavaScript tasks',
          'Use code splitting to reduce bundle size',
          'Implement lazy loading for non-critical features',
          'Consider using Web Workers for heavy computations',
        ],
      });
    }
    
    return recommendations;
  }
}
```

This comprehensive performance optimization strategy ensures the My Family Clinic website delivers exceptional user experience through systematic optimization of all performance aspects, from Core Web Vitals to healthcare-specific requirements.