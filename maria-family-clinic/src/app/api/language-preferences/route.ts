import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface LanguagePreference {
  language: string
  speakers: number
  demand: 'low' | 'medium' | 'high'
  availability: number
}

export async function GET(request: NextRequest) {
  try {
    // Get all doctors and count language capabilities
    const doctors = await prisma.doctor.findMany({
      where: { isActive: true },
      include: {
        clinics: {
          where: { verificationStatus: 'VERIFIED' }
        }
      }
    })

    // Aggregate language data
    const languageMap = new Map<string, {
      speakers: number
      activeClinics: Set<string>
      demandLevel: number
    }>()

    for (const doctor of doctors) {
      for (const language of doctor.languages || []) {
        const lang = language.toLowerCase()
        
        if (!languageMap.has(lang)) {
          languageMap.set(lang, {
            speakers: 0,
            activeClinics: new Set(),
            demandLevel: 0
          })
        }
        
        const langData = languageMap.get(lang)!
        langData.speakers++
        
        // Add active clinics
        for (const clinic of doctor.clinics) {
          langData.activeClinics.add(clinic.clinicId)
        }
      }
    }

    // Get patient language preferences (simplified - would be from user data)
    const patientLanguages = ['english', 'mandarin', 'malay', 'tamil', 'cantonese']
    
    // Convert to preferences array
    const preferences: LanguagePreference[] = Array.from(languageMap.entries())
      .map(([language, data]) => {
        // Calculate demand based on doctor availability vs potential demand
        const totalDoctors = data.speakers
        const uniqueClinics = data.activeClinics.size
        
        // Estimate demand level
        let demand: 'low' | 'medium' | 'high'
        if (patientLanguages.includes(language)) {
          // Common languages have higher demand
          if (totalDoctors < 5) demand = 'high'
          else if (totalDoctors < 15) demand = 'medium'
          else demand = 'low'
        } else {
          // Less common languages
          if (totalDoctors < 2) demand = 'high'
          else if (totalDoctors < 8) demand = 'medium'
          else demand = 'low'
        }

        // Calculate availability as percentage of clinics supporting this language
        const totalClinics = 100 // Approximate total clinics in system
        const availability = Math.min((uniqueClinics / totalClinics) * 100, 100)

        return {
          language: language.charAt(0).toUpperCase() + language.slice(1),
          speakers: totalDoctors,
          demand,
          availability: Math.round(availability * 100) / 100
        }
      })
      .filter(pref => pref.speakers > 0)
      .sort((a, b) => {
        // Sort by demand level (high first) then by speakers count
        const demandOrder = { high: 3, medium: 2, low: 1 }
        const demandDiff = demandOrder[b.demand] - demandOrder[a.demand]
        
        if (demandDiff !== 0) {
          return demandDiff
        }
        
        return b.speakers - a.speakers
      })

    return NextResponse.json(preferences)

  } catch (error) {
    console.error('Language preferences fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch language preferences' },
      { status: 500 }
    )
  }
}