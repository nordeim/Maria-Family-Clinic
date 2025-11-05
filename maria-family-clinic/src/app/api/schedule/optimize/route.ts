import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface OptimizationParams {
  priority: 'efficiency' | 'patient-satisfaction' | 'utilization' | 'distance'
  constraints: {
    maxTravelTime?: number
    minBreakTime?: number
    preferredClinics?: string[]
    avoidClinics?: string[]
  }
  objectives: Array<{
    metric: string
    weight: number
    target?: number
  }>
}

interface ScheduleOptimization {
  optimizationScore: number
  improvements: Array<{
    metric: string
    current: number
    optimized: number
    impact: string
  }>
  recommendations: Array<{
    type: 'schedule' | 'route' | 'coverage' | 'partnership'
    priority: 'low' | 'medium' | 'high'
    description: string
    implementation: string
    expectedBenefit: string
  }>
  implementationPlan: {
    phase: number
    changes: Array<{
      doctorId: string
      clinicId: string
      action: string
      timeline: string
    }>
  }
}

export async function POST(request: NextRequest) {
  try {
    const params: OptimizationParams = await request.json()

    // Get all doctors with their schedules
    const doctors = await prisma.doctor.findMany({
      where: { isActive: true },
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
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
          }
        }
      }
    })

    let optimizationScore = 0
    const improvements: Array<{
      metric: string
      current: number
      optimized: number
      impact: string
    }> = []
    const recommendations: ScheduleOptimization['recommendations'] = []
    const implementationChanges: Array<{
      doctorId: string
      clinicId: string
      action: string
      timeline: string
    }> = []

    // Analyze current state
    let totalUtilization = 0
    let totalConflicts = 0
    let totalDistance = 0
    let totalScheduleEfficiency = 0

    for (const doctor of doctors) {
      for (const doctorClinic of doctor.clinics) {
        const schedules = doctorClinic.schedules
        const availabilities = doctor.availabilities.filter(a => a.clinicId === doctorClinic.clinicId)
        
        // Calculate utilization
        const weeklyHours = schedules.reduce((total, schedule) => {
          const start = new Date(`2000-01-01 ${schedule.startTime}`)
          const end = new Date(`2000-01-01 ${schedule.endTime}`)
          return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        }, 0)
        
        const utilizationRate = Math.min((weeklyHours / 40) * 100, 100) // Assuming 40-hour week
        totalUtilization += utilizationRate

        // Calculate schedule efficiency
        const efficiency = availabilities.length > 0 ? 
          Math.min((availabilities.length / 20) * 100, 100) : 0
        totalScheduleEfficiency += efficiency

        // Count conflicts (simplified)
        const conflicts = Math.floor(Math.random() * 3) // Placeholder
        totalConflicts += conflicts

        // Distance optimization
        if (doctor.clinics.length > 1) {
          totalDistance += doctor.clinics.length * 15 // Average 15km between clinics
        }
      }
    }

    const averageUtilization = doctors.length > 0 ? totalUtilization / (doctors.length * doctor.clinics.length || 1) : 0
    const averageEfficiency = doctors.length > 0 ? totalScheduleEfficiency / doctors.length : 0

    // Generate optimization recommendations based on priority
    switch (params.priority) {
      case 'efficiency':
        if (averageUtilization < 70) {
          improvements.push({
            metric: 'Schedule Utilization',
            current: Math.round(averageUtilization),
            optimized: Math.round(Math.min(averageUtilization * 1.2, 95)),
            impact: 'Better resource utilization'
          })
          
          recommendations.push({
            type: 'schedule',
            priority: 'high',
            description: 'Increase doctor availability during peak hours',
            implementation: 'Add 2-3 additional time slots per day',
            expectedBenefit: '20% increase in patient capacity'
          })

          implementationChanges.push({
            doctorId: 'all',
            clinicId: 'all',
            action: 'extend_schedules',
            timeline: '2 weeks'
          })
        }
        
        if (totalConflicts > 0) {
          recommendations.push({
            type: 'coverage',
            priority: 'high',
            description: 'Resolve scheduling conflicts through better coordination',
            implementation: 'Implement conflict detection system',
            expectedBenefit: 'Eliminate double-booking issues'
          })
        }
        break

      case 'patient-satisfaction':
        if (averageEfficiency < 80) {
          improvements.push({
            metric: 'Patient Access',
            current: Math.round(averageEfficiency),
            optimized: Math.round(Math.min(averageEfficiency * 1.15, 98)),
            impact: 'Reduced wait times'
          })
          
          recommendations.push({
            type: 'schedule',
            priority: 'high',
            description: 'Optimize appointment slots for better patient flow',
            implementation: 'Adjust slot duration and buffer times',
            expectedBenefit: '15% reduction in wait times'
          })
        }
        break

      case 'utilization':
        if (averageUtilization < 85) {
          improvements.push({
            metric: 'Overall Utilization',
            current: Math.round(averageUtilization),
            optimized: Math.round(Math.min(averageUtilization * 1.25, 95)),
            impact: 'Better resource allocation'
          })
          
          recommendations.push({
            type: 'coverage',
            priority: 'high',
            description: 'Balance workload across all doctors and clinics',
            implementation: 'Redistribute appointments based on capacity',
            expectedBenefit: '25% improvement in resource utilization'
          })
        }
        break

      case 'distance':
        if (totalDistance > 100) {
          improvements.push({
            metric: 'Travel Distance',
            current: Math.round(totalDistance),
            optimized: Math.round(totalDistance * 0.7),
            impact: 'Reduced travel time and costs'
          })
          
          recommendations.push({
            type: 'route',
            priority: 'medium',
            description: 'Optimize clinic assignments to minimize travel',
            implementation: 'Group nearby clinics for same doctors',
            expectedBenefit: '30% reduction in travel time'
          })
        }
        break
    }

    // Partnership recommendations
    recommendations.push({
      type: 'partnership',
      priority: 'medium',
      description: 'Establish referral partnerships for better coverage',
      implementation: 'Create formal partnership agreements',
      expectedBenefit: 'Improved patient care continuity'
    })

    // Calculate overall optimization score
    optimizationScore = (
      (averageUtilization * 0.3) +
      (averageEfficiency * 0.25) +
      ((100 - totalConflicts) * 0.2) +
      (Math.max(0, 100 - totalDistance) * 0.15) +
      (90 * 0.1) // Partnership score
    )

    const scheduleOptimization: ScheduleOptimization = {
      optimizationScore: Math.round(optimizationScore * 100) / 100,
      improvements,
      recommendations,
      implementationPlan: {
        phase: 1,
        changes: implementationChanges
      }
    }

    return NextResponse.json(scheduleOptimization)

  } catch (error) {
    console.error('Schedule optimization error:', error)
    return NextResponse.json(
      { error: 'Failed to optimize schedule' },
      { status: 500 }
    )
  }
}