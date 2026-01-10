import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const profiles = await db.profil.findMany({
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json(profiles)
  } catch (error) {
    console.error('Error fetching profiles:', error)
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nama, deskripsi, isActive = false } = await request.json()
    
    if (!nama) {
      return NextResponse.json({ error: 'Nama is required' }, { status: 400 })
    }

    const profile = await db.profil.create({
      data: {
        nama,
        deskripsi,
        isActive
      }
    })

    return NextResponse.json(profile, { status: 201 })
  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }
}