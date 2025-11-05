import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface Specialty {
  id: string
  name: string
  subSpecialties: string[]
  doctorCount: number
  demandLevel: 'low' | 'medium' | 'high' | 'critical'
}

export async function GET() {
  try {
    // Get all specialties from doctors
    const doctors = await prisma.doctor.findMany({
      where: { isActive: true },
      include: {
        specialtiesRel: true
      }
    })

    // Aggregate specialty data
    const specialtyMap = new Map<string, {
      name: string
      subSpecialties: Set<string>
      doctorCount: number
      doctors: string[]
    }>()

    for (const doctor of doctors) {
      // Add from doctor.specialties array
      for (const specialty of doctor.specialties) {
        if (!specialtyMap.has(specialty)) {
          specialtyMap.set(specialty, {
            name: specialty,
            subSpecialties: new Set(),
            doctorCount: 0,
            doctors: []
          })
        }
        
        const specialtyData = specialtyMap.get(specialty)!
        specialtyData.doctorCount++
        if (!specialtyData.doctors.includes(doctor.id)) {
          specialtyData.doctors.push(doctor.id)
        }
      }

      // Add from doctor.specializations array
      for (const specialization of doctor.specializations) {
        if (!specialtyMap.has(specialization)) {
          specialtyMap.set(specialization, {
            name: specialization,
            subSpecialties: new Set(),
            doctorCount: 0,
            doctors: []
          })
        }
        
        const specialtyData = specialtyMap.get(specialization)!
        specialtyData.doctorCount++
        if (!specialtyData.doctors.includes(doctor.id)) {
          specialtyData.doctors.push(doctor.id)
        }
      }

      // Add from doctorSpecialty relationships
      for (const doctorSpecialty of doctor.specialtiesRel) {
        const specialty = doctorSpecialty.specialty
        
        if (!specialtyMap.has(specialty)) {
          specialtyMap.set(specialty, {
            name: specialty,
            subSpecialties: new Set(),
            doctorCount: 0,
            doctors: []
          })
        }
        
        const specialtyData = specialtyMap.get(specialty)!
        specialtyData.doctorCount++
        
        // Add sub-specialties
        for (const subSpecialty of doctorSpecialty.subSpecialties) {
          specialtyData.subSpecialties.add(subSpecialty)
        }
        
        if (!specialtyData.doctors.includes(doctor.id)) {
          specialtyData.doctors.push(doctor.id)
        }
      }
    }

    // Convert to array and calculate demand levels
    const specialties: Specialty[] = Array.from(specialtyMap.values()).map(specialtyData => {
      const totalDoctors = specialtyData.doctorCount
      
      // Calculate demand level based on doctor count vs typical demand
      // In a real system, this would be based on patient demand data
      let demandLevel: 'low' | 'medium' | 'high' | 'critical'
      
      if (totalDoctors < 5) {
        demandLevel = 'critical' // Very few doctors available
      } else if (totalDoctors < 10) {
        demandLevel = 'high' // Limited doctors
      } else if (totalDoctors < 20) {
        demandLevel = 'medium' // Moderate availability
      } else {
        demandLevel = 'low' // Good availability
      }

      return {
        id: specialtyData.name.toLowerCase().replace(/\s+/g, '-'),
        name: specialtyData.name,
        subSpecialties: Array.from(specialtyData.subSpecialties),
        doctorCount: totalDoctors,
        demandLevel
      }
    })

    // Sort by demand level and doctor count
    specialties.sort((a, b) => {
      const demandOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      const demandDiff = demandOrder[b.demandLevel] - demandOrder[a.demandLevel]
      
      if (demandDiff !== 0) {
        return demandDiff
      }
      
      return b.doctorCount - a.doctorCount
    })

    return NextResponse.json(specialties)

  } catch (error) {
    console.error('Specialties fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch specialties' },
      { status: 500 }
    )
  }
}