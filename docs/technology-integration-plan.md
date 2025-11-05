# Technology Integration Plan: My Family Clinic Website

## Executive Summary
This technology integration plan provides a comprehensive strategy for integrating all components of the technology stack to create a cohesive, high-performance healthcare website. The plan ensures seamless interoperability between Next.js 15, shadcn/ui, Tailwind CSS v4, Prisma, Supabase, NextAuth 5, tRPC 11, and TanStack React Query 5.

## Technology Stack Overview

### Frontend Stack Integration
```
Next.js 15 App Router (Framework)
├── React 18 (UI Library)
├── TypeScript 5.3+ (Language)
├── Tailwind CSS v4 (Styling)
├── shadcn/ui (Component Library)
├── TanStack React Query 5 (State Management)
├── React Hook Form (Form Management)
├── Zod (Schema Validation)
└── Framer Motion (Animations)
```

### Backend Stack Integration
```
tRPC 11 (API Layer)
├── NextAuth 5 (Authentication)
├── Prisma ORM (Database Access)
├── Zod (Schema Validation)
├── Supabase (Backend Services)
│   ├── PostgreSQL + PostGIS
│   ├── Storage
│   ├── Auth
│   └── Edge Functions
└── Node.js Runtime
```

## Phase 1: Frontend Foundation Integration

### Next.js 15 App Router Configuration
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
    serverComponentsExternalPackages: ['@prisma/client'],
    ppr: true, // Partial Prerendering
  },
  
  // Performance optimizations
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['supabase.co', 'googleusercontent.com'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },
  
  // Bundle optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle splitting
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups.framework = {
        chunks: 'all',
        name: 'framework',
        test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
        priority: 40,
        enforce: true,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
```

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/styles/*": ["./src/styles/*"],
      "@/server/*": ["./src/server/*"]
    },
    "target": "ES2017",
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitAny": true,
    "exactOptionalPropertyTypes": true
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### Tailwind CSS v4 Integration
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  theme: {
    extend: {
      // Healthcare-specific color palette
      colors: {
        // Primary healthcare colors
        medical: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        
        // Trust and reliability colors
        trust: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        
        // Status colors for healthcare
        status: {
          available: '#10b981',
          busy: '#f59e0b',
          unavailable: '#ef4444',
          emergency: '#dc2626',
        },
      },
      
      // Typography scale
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        mono: ['JetBrains Mono', ...fontFamily.mono],
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      
      // Spacing scale optimized for healthcare UI
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Animation for micro-interactions
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      
      // Box shadows for depth
      boxShadow: {
        'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px 0 rgba(0, 0, 0, 0.12)',
        'large': '0 8px 32px 0 rgba(0, 0, 0, 0.16)',
      },
    },
  },
  
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-animate'),
  ],
};

export default config;
```

### shadcn/ui Component Integration
```typescript
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}

// src/lib/utils.ts - Enhanced utility functions
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Healthcare-specific utility functions
export function formatPhoneNumber(phone: string): string {
  // Format Singapore phone numbers
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{4})(\d{4})$/);
  if (match) {
    return `${match[1]} ${match[2]}`;
  }
  return phone;
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Haversine formula for distance calculation
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}
```

## Phase 2: Backend Infrastructure Integration

### Prisma Integration with PostGIS
```typescript
// prisma/schema.prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [postgis]
}

// Enhanced Clinic model with PostGIS
model Clinic {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  description     String?
  location        String   // PostGIS POINT
  address         String
  postalCode      String
  phone           String?
  email           String?
  website         String?
  operatingHours  Json?
  amenities       String[]
  imageUrls       String[]
  status          ClinicStatus @default(ACTIVE)
  
  // Relationships
  servicesClinics ServiceClinic[]
  doctorsClinics  DoctorClinic[]
  enquiries       Enquiry[]
  
  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Indexes for performance
  @@index([location], map: "idx_clinic_location_gist", type: Gist)
  @@index([status, location], map: "idx_clinic_status_location")
  @@index([name], map: "idx_clinic_name_trgm", type: Gin)
  @@index([postalCode], map: "idx_clinic_postal")
}

// Geospatial query helpers
model ClinicDistance {
  clinicId String
  distance Float
  
  @@map("clinic_distances")
}
```

### Supabase Integration Configuration
```typescript
// lib/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side Supabase client
export const supabase: SupabaseClient<Database> = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Server-side Supabase client (for admin operations)
export const supabaseAdmin: SupabaseClient<Database> = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// PostGIS utility functions
export class GeospatialService {
  constructor(private client: SupabaseClient<Database>) {}
  
  async findClinicsNearby(
    latitude: number,
    longitude: number,
    radiusKm: number = 5
  ) {
    const { data, error } = await this.client.rpc('find_nearby_clinics', {
      lat: latitude,
      lng: longitude,
      radius_km: radiusKm,
    });
    
    if (error) throw error;
    return data;
  }
  
  async calculateDistance(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number
  ): Promise<number> {
    const { data, error } = await this.client.rpc('calculate_distance', {
      lat1: fromLat,
      lng1: fromLng,
      lat2: toLat,
      lng2: toLng,
    });
    
    if (error) throw error;
    return data;
  }
}

// Database functions for PostGIS operations
/*
-- SQL functions to be created in Supabase

CREATE OR REPLACE FUNCTION find_nearby_clinics(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 5
)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  address TEXT,
  distance_km DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.address,
    ST_Distance(
      ST_Point(lng, lat)::geography,
      ST_Point(
        ST_X(c.location::geometry),
        ST_Y(c.location::geometry)
      )::geography
    ) / 1000 AS distance_km
  FROM clinics c
  WHERE ST_DWithin(
    ST_Point(lng, lat)::geography,
    ST_Point(
      ST_X(c.location::geometry),
      ST_Y(c.location::geometry)
    )::geography,
    radius_km * 1000
  )
  AND c.status = 'ACTIVE'
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DOUBLE PRECISION,
  lng1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lng2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
BEGIN
  RETURN ST_Distance(
    ST_Point(lng1, lat1)::geography,
    ST_Point(lng2, lat2)::geography
  ) / 1000; -- Return distance in kilometers
END;
$$ LANGUAGE plpgsql;
*/
```

### tRPC 11 Integration
```typescript
// server/api/root.ts
import { createTRPCRouter } from '@/server/api/trpc';
import { clinicRouter } from './routers/clinic';
import { serviceRouter } from './routers/service';
import { doctorRouter } from './routers/doctor';
import { enquiryRouter } from './routers/enquiry';
import { analyticsRouter } from './routers/analytics';

export const appRouter = createTRPCRouter({
  clinic: clinicRouter,
  service: serviceRouter,
  doctor: doctorRouter,
  enquiry: enquiryRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;

// server/api/trpc.ts
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { type Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/server/auth';
import { db } from '@/server/db';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { TRPCError, initTRPC } from '@trpc/server';

interface CreateContextOptions {
  session: Session | null;
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    db,
  };
};

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;
  const session = await getServerSession(req, res, authOptions);
  
  return createInnerTRPCContext({
    session,
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Middleware for logging and monitoring
const loggingMiddleware = t.middleware(async ({ path, type, next, ctx }) => {
  const start = Date.now();
  
  const result = await next({
    ctx: {
      ...ctx,
      // Add request metadata
      requestId: crypto.randomUUID(),
      startTime: start,
    },
  });
  
  const durationMs = Date.now() - start;
  
  // Log API calls
  console.log(`${type.toUpperCase()} ${path} - ${durationMs}ms`);
  
  // Send to monitoring service
  if (durationMs > 1000) {
    console.warn(`Slow query detected: ${path} took ${durationMs}ms`);
  }
  
  return result;
});

// Middleware for authentication
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

// Middleware for admin authentication
const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user || ctx.session.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure.use(loggingMiddleware);
export const protectedProcedure = t.procedure
  .use(loggingMiddleware)
  .use(enforceUserIsAuthed);
export const adminProcedure = t.procedure
  .use(loggingMiddleware)
  .use(enforceUserIsAdmin);
```

### NextAuth 5 Integration
```typescript
// auth.config.ts
import { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { loginSchema } from '@/lib/validations/auth';
import { getUserByEmail, verifyPassword } from '@/lib/auth';

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    
    Credentials({
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials);
        
        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          const user = await getUserByEmail(email);
          
          if (!user || !user.password) return null;
          
          const passwordsMatch = await verifyPassword(password, user.password);
          
          if (passwordsMatch) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }
        }
        
        return null;
      },
    }),
  ],
  
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  
  session: { strategy: 'jwt' },
  
  events: {
    async signIn({ user, account, profile }) {
      // Log successful sign-in
      console.log(`User ${user.email} signed in`);
      
      // Track analytics
      await trackEvent('user_signin', {
        userId: user.id,
        provider: account?.provider,
      });
    },
    
    async signOut({ session }) {
      // Log sign-out
      console.log(`User signed out`);
    },
  },
} satisfies NextAuthConfig;

// auth.ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@/server/db';
import authConfig from './auth.config';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  ...authConfig,
});
```

## Phase 3: State Management Integration

### TanStack React Query Integration
```typescript
// providers/query-provider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Healthcare data should be fresh
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 1,
        onError: (error) => {
          console.error('Mutation error:', error);
          // Toast notification for user
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

// Custom hooks for clinic data
// hooks/use-clinics.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/trpc/react';
import type { Clinic, ClinicSearchParams } from '@/types/clinic';

export function useClinicsNearby(params: ClinicSearchParams) {
  return useQuery({
    queryKey: ['clinics', 'nearby', params],
    queryFn: () => api.clinic.searchNearby.query(params),
    enabled: !!(params.latitude && params.longitude),
    staleTime: 2 * 60 * 1000, // 2 minutes for location-based data
    placeholderData: [],
  });
}

export function useClinicDetails(clinicId: string) {
  return useQuery({
    queryKey: ['clinic', clinicId],
    queryFn: () => api.clinic.getById.query({ id: clinicId }),
    enabled: !!clinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes for clinic details
  });
}

export function useCreateEnquiry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.enquiry.create.mutate,
    onSuccess: (data) => {
      // Invalidate and refetch enquiries
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      
      // Add the new enquiry to the cache optimistically
      queryClient.setQueryData(['enquiry', data.id], data);
      
      // Show success message
      toast.success('Enquiry submitted successfully!');
    },
    onError: (error) => {
      console.error('Failed to create enquiry:', error);
      toast.error('Failed to submit enquiry. Please try again.');
    },
  });
}
```

### Form Integration with React Hook Form
```typescript
// hooks/use-form-with-schema.ts
import { useForm, type UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ZodSchema, type z } from 'zod';

export function useFormWithSchema<T extends ZodSchema>(
  schema: T,
  options?: Omit<UseFormProps<z.infer<T>>, 'resolver'>
) {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    ...options,
  });
}

// components/forms/enquiry-form.tsx
'use client';

import { useState } from 'react';
import { useFormWithSchema } from '@/hooks/use-form-with-schema';
import { createEnquirySchema } from '@/lib/validations/enquiry';
import { useCreateEnquiry } from '@/hooks/use-enquiries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send } from 'lucide-react';

interface EnquiryFormProps {
  clinicId?: string;
  serviceId?: string;
}

export function EnquiryForm({ clinicId, serviceId }: EnquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useFormWithSchema(createEnquirySchema, {
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      topic: 'GENERAL',
      message: '',
      clinicId: clinicId || '',
      serviceId: serviceId || '',
    },
  });
  
  const createEnquiryMutation = useCreateEnquiry();
  
  const onSubmit = async (data: z.infer<typeof createEnquirySchema>) => {
    setIsSubmitting(true);
    
    try {
      await createEnquiryMutation.mutateAsync(data);
      form.reset();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
        <CardDescription>
          Send us your enquiry and we'll get back to you as soon as possible.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your full name"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel"
                      placeholder="Enter your phone number"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enquiry Topic</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select enquiry topic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GENERAL">General Enquiry</SelectItem>
                      <SelectItem value="APPOINTMENT">Book Appointment</SelectItem>
                      <SelectItem value="HEALTHIER_SG">Healthier SG Programme</SelectItem>
                      <SelectItem value="SERVICES">Services Information</SelectItem>
                      <SelectItem value="FEEDBACK">Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us how we can help you..."
                      className="min-h-[100px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || !form.formState.isValid}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Enquiry
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
```

## Phase 4: Development Workflow Integration

### ESLint & Prettier Configuration
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        "prefer": "type-imports",
        "fixStyle": "inline-type-imports"
      }
    ],
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/require-await": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}

// .prettierrc.json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 80,
  "endOfLine": "lf",
  "arrowParens": "always",
  "bracketSpacing": true,
  "jsxSingleQuote": false,
  "quoteProps": "as-needed"
}
```

### Testing Infrastructure
```typescript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
    '!src/app/globals.css',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

module.exports = createJestConfig(customJestConfig);

// jest.setup.js
import '@testing-library/jest-dom';
import { server } from './src/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));
```

This comprehensive technology integration plan ensures all components work together seamlessly to create a high-performance, accessible, and maintainable healthcare website.