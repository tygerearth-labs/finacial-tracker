import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Set all profiles to inactive first
    await db.profil.updateMany({
      data: { isActive: false }
    })

    // Set the selected profile as active
    const profile = await db.profil.update({
      where: { id: params.id },
      data: { isActive: true }
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error activating profile:', error)
    return NextResponse.json({ error: 'Failed to activate profile' }, { status: 500 })
  }
}