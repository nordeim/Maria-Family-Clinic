import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { doctorId: string } }
) {
  try {
    const { doctorId } = params

    // Get doctor with all clinic relationships
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        clinics: {
          include: {
            clinic: {
              select: {
                id: true,
                name: true,
                address: true,
                phone: true
              }
            }
          }
        },
        schedules: {
          include: {
            doctorClinic: {
              include: {
                clinic: {
                  select: {
                    id: true,
                    name: true,
                    address: true
                  }
                }
              }
            }
          }
        },
        availabilities: {
          include: {
            clinic: {
              select: {
                id: true,
                name: true,
                address: true
              }
            }
          }
        }
      }
    })

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    // Calculate schedule data for each clinic
    const scheduleData = []
    let totalAppointments = 0
    let totalConflicts = 0
    let totalTravelTime = 0

    for (const doctorClinic of doctor.clinics) {
      const clinic = doctorClinic.clinic
      
      // Get schedules for this clinic
      const clinicSchedules = doctor.schedules.filter(s => s.doctorClinicId === doctorClinic.id)
      
      // Get availabilities for this clinic
      const clinicAvailabilities = doctor.availabilities.filter(a => a.clinicId === clinic.id)
      
      // Calculate appointments for this clinic (placeholder - would need actual appointment data)
      const clinicAppointments = 0 // await prisma.doctorAppointment.count({...})
      
      // Calculate utilization rate
      const maxWeeklyHours = 40
      const actualHours = clinicSchedules.reduce((total, schedule) => {
        const start = new Date(`2000-01-01 ${schedule.startTime}`)
        const end = new Date(`2000-01-01 ${schedule.endTime}`)
        return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      }, 0)
      
      const utilizationRate = maxWeeklyHours > 0 ? (actualHours / maxWeeklyHours) * 100 : 0
      
      // Calculate efficiency (placeholder)
      const efficiency = clinicAvailabilities.length > 0 ? 85 + Math.random() * 10 : 50
      
      // Detect conflicts for this clinic
      const clinicConflicts = [] // Would be calculated based on overlapping times
      totalConflicts += clinicConflicts.length

      scheduleData.push({
        clinicId: clinic.id,
        clinicName: clinic.name,
        schedules: clinicSchedules,
        availabilities: clinicAvailabilities,
        conflicts: clinicConflicts,
        totalAppointments: clinicAppointments,
        utilizationRate: Math.round(utilizationRate * 100) / 100,
        efficiency: Math.round(efficiency * 100) / 100
      })

      totalAppointments += clinicAppointments
    }

    // Calculate overall metrics
    const overallUtilization = scheduleData.length > 0
      ? scheduleData.reduce((sum, s) => sum + s.utilizationRate, 0) / scheduleData.length
      : 0

    // Calculate travel time (placeholder - would use actual distance calculation)
    totalTravelTime = 0 // Would calculate based on actual clinic locations

    const multiClinicSchedule = {
      doctor: {
        id: doctor.id,
        name: doctor.name,
        specialties: doctor.specialties
      },
      schedules: scheduleData,
      overallUtilization: Math.round(overallUtilization * 100) / 100,
      conflictCount: totalConflicts,
      travelTimeToday: totalTravelTime,
      efficiency: Math.round((overallUtilization * 0.7 + 15) * 100) / 100 // Weighted efficiency
    }

    return NextResponse.json(multiClinicSchedule)
  } catch (error) {
    console.error('Multi-clinic schedule error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch multi-clinic schedule' },
      { status: 500 }
    )
  }
}