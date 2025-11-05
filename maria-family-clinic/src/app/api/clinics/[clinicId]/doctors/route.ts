import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface DoctorFilters {
  specialty?: string
  language?: string
  capacity?: 'FULL_TIME' | 'PART_TIME' | 'VISITING' | 'LOCUM'
  status?: 'active' | 'inactive' | 'available'
  rating?: number
  search?: string
}

interface ClinicDoctorData {
  doctors: Array<{
    doctor: any
    clinicRelation: any
    availability: any[]
    performance: any
    partnership?: any
  }>
  totalCount: number
  filters: DoctorFilters
}

export async function GET(
  request: NextRequest,
  { params }: { params: { clinicId: string } }
) {
  try {
    const { clinicId } = params
    const { searchParams } = new URL(request.url)
    
    // Parse filters from query parameters
    const filters: DoctorFilters = {
      specialty: searchParams.get('specialty') || undefined,
      language: searchParams.get('language') || undefined,
      capacity: (searchParams.get('capacity') as any) || undefined,
      status: (searchParams.get('status') as any) || undefined,
      rating: searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined,
      search: searchParams.get('search') || undefined
    }

    // Build where clause for doctor queries
    const doctorWhereClause: any = {
      isActive: filters.status !== 'inactive'
    }

    if (filters.specialty) {
      doctorWhereClause.specialties = {
        hasSome: [filters.specialty]
      }
    }

    if (filters.language) {
      doctorWhereClause.languages = {
        hasSome: [filters.language]
      }
    }

    if (filters.rating) {
      doctorWhereClause.rating = {
        gte: filters.rating
      }
    }

    if (filters.search) {
      doctorWhereClause.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { bio: { contains: filters.search, mode: 'insensitive' } },
        { specialties: { hasSome: [filters.search] } }
      ]
    }

    // Get doctors with their clinic relationships and availability
    const doctors = await prisma.doctor.findMany({
      where: doctorWhereClause,
      include: {
        clinics: {
          where: {
            clinicId: clinicId,
            verificationStatus: 'VERIFIED'
          },
          include: {
            clinic: {
              select: {
                id: true,
                name: true,
                address: true
              }
            }
          }
        },
        availabilities: {
          where: {
            clinicId: clinicId,
            isAvailable: true,
            date: { gte: new Date() }
          },
          orderBy: { date: 'asc' },
          take: 10
        },
        specialtiesRel: true
      },
      orderBy: [
        { rating: 'desc' },
        { name: 'asc' }
      ]
    })

    // Filter out doctors without clinic relationship
    const clinicDoctors = doctors.filter(doctor => doctor.clinics.length > 0)

    // Apply capacity filter if specified
    let filteredDoctors = clinicDoctors
    if (filters.capacity) {
      filteredDoctors = clinicDoctors.filter(doctor => {
        const doctorClinic = doctor.clinics[0]
        return doctorClinic?.capacity === filters.capacity
      })
    }

    // Generate performance data and transform response
    const transformedDoctors = await Promise.all(filteredDoctors.map(async (doctor) => {
      const doctorClinic = doctor.clinics[0]
      
      // Calculate performance metrics (simplified)
      const totalAppointments = await prisma.doctorAppointment.count({
        where: { doctorId: doctor.id }
      })
      
      const completedAppointments = await prisma.doctorAppointment.count({
        where: { 
          doctorId: doctor.id,
          status: 'COMPLETED'
        }
      })

      const completionRate = totalAppointments > 0 ? 
        (completedAppointments / totalAppointments) * 100 : 0

      // Generate mock performance data
      const performance = {
        totalAppointments,
        completionRate: Math.round(completionRate * 100) / 100,
        patientSatisfaction: doctor.rating || 0,
        responseTime: Math.round(Math.random() * 24 + 2), // 2-26 hours
        ratingTrend: Array.from({ length: 6 }, (_, i) => ({
          month: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000)
            .toLocaleDateString('en-US', { month: 'short' }),
          rating: Math.round((doctor.rating || 0 + (Math.random() - 0.5) * 0.2) * 10) / 10
        })),
        monthlyStats: Array.from({ length: 6 }, (_, i) => ({
          month: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000)
            .toLocaleDateString('en-US', { month: 'short' }),
          appointments: Math.floor(Math.random() * 50 + 20),
          satisfaction: Math.round((4.0 + Math.random() * 0.8) * 10) / 10
        }))
      }

      // Check for partnership (simplified)
      const partnership = Math.random() > 0.7 ? {
        status: 'preferred',
        level: 'gold'
      } : undefined

      return {
        doctor,
        clinicRelation: doctorClinic,
        availability: doctor.availabilities,
        performance,
        partnership
      }
    }))

    const response: ClinicDoctorData = {
      doctors: transformedDoctors,
      totalCount: transformedDoctors.length,
      filters
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Clinic doctors fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clinic doctors' },
      { status: 500 }
    )
  }
}