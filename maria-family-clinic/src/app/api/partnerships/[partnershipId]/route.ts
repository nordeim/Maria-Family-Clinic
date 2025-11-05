import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { partnershipId: string } }
) {
  try {
    const { partnershipId } = params
    const updates = await request.json()

    // Update partnership
    const updatedPartnership = await prisma.clinicPartnership.update({
      where: { id: partnershipId },
      data: {
        priority: updates.priority?.toUpperCase(),
        specialty: updates.specialty,
        specialties: updates.specialties,
        terms: updates.terms,
        referralFeePercentage: updates.referralFeePercentage,
        minimumReferrals: updates.minimumReferrals,
        maximumReferrals: updates.maximumReferrals,
        collaborationRequirements: updates.collaborationRequirements,
        effectiveTo: updates.effectiveTo,
        notes: updates.notes,
        updatedAt: new Date()
      },
      include: {
        primaryClinic: {
          select: {
            id: true,
            name: true
          }
        },
        partnerClinic: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Partnership updated successfully',
      partnership: updatedPartnership
    })

  } catch (error) {
    console.error('Partnership update error:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Partnership not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update partnership' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { partnershipId: string } }
) {
  try {
    const { partnershipId } = params

    // Soft delete by setting end date
    await prisma.clinicPartnership.update({
      where: { id: partnershipId },
      data: {
        effectiveTo: new Date(),
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Partnership terminated successfully'
    })

  } catch (error) {
    console.error('Partnership termination error:', error)
    return NextResponse.json(
      { error: 'Failed to terminate partnership' },
      { status: 500 }
    )
  }
}