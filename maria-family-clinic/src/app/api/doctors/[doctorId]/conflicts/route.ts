import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface ScheduleConflict {
  id: string
  conflictType: 'time-overlap' | 'travel-impossible' | 'double-booking' | 'capacity-exceeded'
  severity: 'low' | 'medium' | 'high' | 'critical'
  doctorId: string
  clinicId: string
  scheduleId?: string
  conflictingScheduleId?: string
  startTime: string
  endTime: string
  date: Date
  description: string
  resolution?: string
  suggestedResolution?: string
  affectedAppointments: number
  distance?: number
  travelTime?: number
  impact: 'minimal' | 'moderate' | 'significant' | 'critical'
  autoResolvable: boolean
}

export async function GET(
  request: NextRequest,
  { params }: { params: { doctorId: string } }
) {
  try {
    const { doctorId } = params

    // Get all schedules for the doctor across clinics
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        clinics: {
          include: {
            clinic: true,
            schedules: {
              where: { isActive: true }
            }
          }
        },
        availabilities: {
          where: {
            isAvailable: true,
            date: {
              gte: new Date(),
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
            }
          },
          include: {
            clinic: true
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

    const conflicts: ScheduleConflict[] = []

    // Check for time overlap conflicts
    for (const doctorClinic of doctor.clinics) {
      const schedules = doctorClinic.schedules
      
      // Sort schedules by time
      schedules.sort((a, b) => {
        const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
        const aDayIndex = dayOrder.indexOf(a.dayOfWeek || 'MONDAY')
        const bDayIndex = dayOrder.indexOf(b.dayOfWeek || 'MONDAY')
        
        if (aDayIndex !== bDayIndex) {
          return aDayIndex - bDayIndex
        }
        
        return a.startTime.localeCompare(b.startTime)
      })

      // Check for overlapping times on same day
      for (let i = 0; i < schedules.length - 1; i++) {
        const current = schedules[i]
        const next = schedules[i + 1]
        
        if (current.dayOfWeek === next.dayOfWeek) {
          const currentEnd = new Date(`2000-01-01 ${current.endTime}`)
          const nextStart = new Date(`2000-01-01 ${next.startTime}`)
          
          if (currentEnd.getTime() > nextStart.getTime()) {
            // Overlap detected
            const overlapMinutes = (currentEnd.getTime() - nextStart.getTime()) / (1000 * 60)
            
            conflicts.push({
              id: `conflict-${doctorId}-${current.id}-${next.id}`,
              conflictType: 'time-overlap',
              severity: overlapMinutes > 60 ? 'high' : overlapMinutes > 30 ? 'medium' : 'low',
              doctorId,
              clinicId: doctorClinic.clinicId,
              scheduleId: current.id,
              conflictingScheduleId: next.id,
              startTime: next.startTime,
              endTime: current.endTime,
              date: new Date(), // Would be calculated based on day of week
              description: `Time overlap between ${current.startTime}-${current.endTime} and ${next.startTime}-${next.endTime} on ${current.dayOfWeek}`,
              affectedAppointments: Math.floor(Math.random() * 5) + 1, // Placeholder
              impact: overlapMinutes > 60 ? 'significant' : overlapMinutes > 30 ? 'moderate' : 'minimal',
              autoResolvable: overlapMinutes <= 30
            })
          }
        }
      }
    }

    // Check for travel-time conflicts between clinics
    const clinicLocations = new Map()
    for (const doctorClinic of doctor.clinics) {
      clinicLocations.set(doctorClinic.clinicId, {
        latitude: doctorClinic.clinic.latitude,
        longitude: doctorClinic.clinic.longitude,
        name: doctorClinic.clinic.name
      })
    }

    // Check consecutive appointments at different clinics
    const allSchedules = doctor.clinics.flatMap(dc => 
      dc.schedules.map(s => ({ ...s, clinicId: dc.clinicId, clinicName: dc.clinic.name }))
    )

    // Sort all schedules by day and time
    allSchedules.sort((a, b) => {
      const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      const aDayIndex = dayOrder.indexOf(a.dayOfWeek || 'MONDAY')
      const bDayIndex = dayOrder.indexOf(b.dayOfWeek || 'MONDAY')
      
      if (aDayIndex !== bDayIndex) {
        return aDayIndex - bDayIndex
      }
      
      return a.startTime.localeCompare(b.startTime)
    })

    // Check travel time feasibility
    for (let i = 0; i < allSchedules.length - 1; i++) {
      const current = allSchedules[i]
      const next = allSchedules[i + 1]
      
      if (current.clinicId !== next.clinicId) {
        // Different clinics - check travel time
        const currentLocation = clinicLocations.get(current.clinicId)
        const nextLocation = clinicLocations.get(next.clinicId)
        
        // Calculate distance (simplified - would use proper distance calculation)
        const distance = Math.sqrt(
          Math.pow(currentLocation.latitude - nextLocation.latitude, 2) +
          Math.pow(currentLocation.longitude - nextLocation.longitude, 2)
        ) * 111 // Rough km conversion
        
        const estimatedTravelTime = distance * 2 // Assume 2 minutes per km in Singapore
        
        const currentEnd = new Date(`2000-01-01 ${current.endTime}`)
        const nextStart = new Date(`2000-01-01 ${next.startTime}`)
        const timeBetween = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60) // minutes
        
        if (timeBetween < estimatedTravelTime + 15) { // 15 min buffer
          conflicts.push({
            id: `travel-${doctorId}-${current.id}-${next.id}`,
            conflictType: 'travel-impossible',
            severity: timeBetween < estimatedTravelTime ? 'high' : 'medium',
            doctorId,
            clinicId: current.clinicId, // Primary clinic for this conflict
            scheduleId: current.id,
            conflictingScheduleId: next.id,
            startTime: next.startTime,
            endTime: current.endTime,
            date: new Date(),
            description: `Insufficient travel time between ${currentLocation.name} and ${nextLocation.name}`,
            distance: Math.round(distance * 100) / 100,
            travelTime: Math.round(estimatedTravelTime),
            impact: timeBetween < estimatedTravelTime ? 'critical' : 'moderate',
            autoResolvable: false
          })
        }
      }
    }

    // Check for capacity exceeded conflicts
    const clinicAppointments = new Map()
    
    for (const doctorClinic of doctor.clinics) {
      const clinicAvailabilities = doctor.availabilities.filter(a => a.clinicId === doctorClinic.clinicId)
      
      for (const availability of clinicAvailabilities) {
        const clinicId = doctorClinic.clinicId
        
        if (!clinicAppointments.has(clinicId)) {
          clinicAppointments.set(clinicId, [])
        }
        
        clinicAppointments.get(clinicId).push({
          date: availability.date,
          startTime: availability.startTime,
          maxAppointments: availability.maxAppointments,
          bookedAppointments: availability.bookedAppointments
        })
      }
    }

    // Check for overbooking
    for (const [clinicId, appointments] of clinicAppointments) {
      for (const appt of appointments) {
        if (appt.bookedAppointments > (appt.maxAppointments || 1)) {
          conflicts.push({
            id: `capacity-${doctorId}-${clinicId}`,
            conflictType: 'capacity-exceeded',
            severity: appt.bookedAppointments > (appt.maxAppointments || 1) * 1.5 ? 'high' : 'medium',
            doctorId,
            clinicId,
            startTime: appt.startTime,
            endTime: appt.startTime, // Would calculate end time
            date: appt.date,
            description: `Overbooked: ${appt.bookedAppointments} appointments scheduled for ${appt.maxAppointments} slots`,
            affectedAppointments: appt.bookedAppointments - (appt.maxAppointments || 1),
            impact: 'moderate',
            autoResolvable: true
          })
        }
      }
    }

    return NextResponse.json(conflicts)
  } catch (error) {
    console.error('Schedule conflicts error:', error)
    return NextResponse.json(
      { error: 'Failed to detect schedule conflicts' },
      { status: 500 }
    )
  }
}