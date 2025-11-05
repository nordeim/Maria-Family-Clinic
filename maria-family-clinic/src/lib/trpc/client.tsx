'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink, loggerLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server'
import superjson from 'superjson'
import { useState } from 'react'

import { type AppRouter } from '@/server/api/root'

/**
 * This is the client-side tRPC instance.
 *
 * @see https://trpc.io/docs/client
 */
export const trpc = createTRPCReact<AppRouter>()

/**
 * Get router type definitions for inference.
 */
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>

/**
 * This extends the built-in types to include types from your tRPC router.
 * Useful for form validation using Zod.
 */
export type AppRouterTypes = {
  clinic: {
    getAll: {
      input: {
        page?: number
        limit?: number
        search?: string
        isActive?: boolean
        isHealthierSgPartner?: boolean
        languages?: string[]
        services?: string[]
        location?: {
          latitude: number
          longitude: number
          radiusKm: number
        }
        orderBy?: 'name' | 'distance' | 'rating' | 'createdAt'
        orderDirection?: 'asc' | 'desc'
      }
      output: {
        data: Array<{
          id: string
          name: string
          description: string
          address: string
          phone: string
          email: string
          languages: string[]
          isActive: boolean
          isHealthierSgPartner: boolean
          doctors?: Array<{
            id: string
            firstName: string
            lastName: string
            specialties: string[]
          }>
          services?: Array<{
            id: string
            name: string
            description: string
            price: number
          }>
          distance?: number | null
        }>
        pagination: {
          page: number
          limit: number
          total: number
          totalPages: number
          hasNextPage: boolean
          hasPreviousPage: boolean
        }
      }
    }
    getById: {
      input: { id: string }
      output: {
        id: string
        name: string
        description: string
        address: string
        phone: string
        email: string
        operatingHours: Record<string, string>
        languages: string[]
        isActive: boolean
        isHealthierSgPartner: boolean
      }
    }
    getNearby: {
      input: {
        latitude: number
        longitude: number
        radiusKm?: number
        limit?: number
        services?: string[]
        isActive?: boolean
      }
      output: Array<{
        id: string
        name: string
        address: string
        phone: string
        distance: number
        isActive: boolean
      }>
    }
  }
  doctor: {
    getAll: {
      input: {
        page?: number
        limit?: number
        search?: string
        specialties?: string[]
        languages?: string[]
        clinicId?: string
        isActive?: boolean
        isVerified?: boolean
        orderBy?: 'name' | 'specialty' | 'experience' | 'rating' | 'createdAt'
        orderDirection?: 'asc' | 'desc'
      }
      output: {
        data: Array<{
          id: string
          firstName: string
          lastName: string
          specialties: string[]
          languages: string[]
          isActive: boolean
          isVerified: boolean
          clinics?: Array<{
            id: string
            name: string
          }>
        }>
        pagination: {
          page: number
          limit: number
          total: number
          totalPages: number
          hasNextPage: boolean
          hasPreviousPage: boolean
        }
      }
    }
    getById: {
      input: { id: string }
      output: {
        id: string
        firstName: string
        lastName: string
        specialties: string[]
        languages: string[]
        qualifications: string
        experience: number
        isActive: boolean
        profile?: {
          bio: string
          photo?: string
        }
      }
    }
  }
  appointment: {
    create: {
      input: {
        clinicId: string
        doctorId: string
        serviceId: string
        appointmentDate: Date
        symptoms?: string
        notes?: string
        isUrgent?: boolean
      }
      output: {
        id: string
        appointmentDate: Date
        status: string
        clinic: {
          name: string
        }
        doctor: {
          firstName: string
          lastName: string
        }
        service: {
          name: string
        }
      }
    }
  }
  enquiry: {
    create: {
      input: {
        name: string
        email: string
        phone?: string
        subject: string
        message: string
        type: 'GENERAL' | 'APPOINTMENT' | 'HEALTHIER_SG' | 'COMPLAINT' | 'FEEDBACK' | 'TECHNICAL'
        clinicId?: string
        patientId?: string
      }
      output: {
        id: string
        status: string
        createdAt: Date
      }
    }
  }
}

/**
 * Provider component for tRPC and React Query.
 */
export function TRPCReactProvider(props: {
  children: React.ReactNode
  headers?: Headers
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors
              if (error?.data?.httpStatus >= 400 && error?.data?.httpStatus < 500) {
                return false
              }
              return failureCount < 3
            },
          },
          mutations: {
            retry: false,
          },
        },
      }),
  )

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === 'development' ||
            (op.direction === 'down' && op.result instanceof Error),
        }),
        httpBatchLink({
          url: '/api/trpc',
          headers() {
            const heads = new Map(props.headers)
            heads.set('x-trpc-source', 'nextjs-react')
            return Object.fromEntries(heads)
          },
          transformer: superjson,
        }),
      ],
    }),
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}

/**
 * Helper hooks for common patterns
 * Note: Commented out due to type incompatibilities - use tRPC utils directly
 */
/*
export function useOptimisticUpdate<TData>(
  queryKey: string[],
  updateFn: (oldData: TData | undefined) => TData | undefined,
) {
  const queryClient = trpc.useContext()
  
  return {
    mutateOptimistic: () => {
      queryClient.setQueryData(queryKey, (oldData: TData | undefined) => {
        return updateFn(oldData)
      })
    },
  }
}

export function usePrefetchQuery<TInput, TOutput>(
  queryFn: (input: TInput) => Promise<TOutput>,
  queryKey: string[],
) {
  const queryClient = trpc.useContext()
  
  return {
    prefetch: (input: TInput) => {
      return queryClient.prefetchQuery({
        queryKey,
        queryFn: () => queryFn(input),
        staleTime: 5 * 60 * 1000,
      })
    },
  }
}
*/