import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const profil = await db.profil.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(profil)
  } catch (error) {
    console.error('Error fetching profil:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profil' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nama, deskripsi } = body

    if (!nama) {
      return NextResponse.json(
        { error: 'Nama is required' },
        { status: 400 }
      )
    }

    // Set semua profil lain menjadi non-active
    await db.profil.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    })

    const profil = await db.profil.create({
      data: {
        nama,
        deskripsi: deskripsi || null,
        isActive: true
      }
    })

    return NextResponse.json(profil, { status: 201 })
  } catch (error) {
    console.error('Error creating profil:', error)
    return NextResponse.json(
      { error: 'Failed to create profil' },
      { status: 500 }
    )
  }
}