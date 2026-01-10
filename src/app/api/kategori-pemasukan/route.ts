import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profilId = searchParams.get('profilId')

    const kategori = await db.kategoriPemasukan.findMany({
      where: {
        ...(profilId && { profilId })
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(kategori)
  } catch (error) {
    console.error('Error fetching kategori pemasukan:', error)
    return NextResponse.json(
      { error: 'Failed to fetch kategori pemasukan' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nama, deskripsi, warna, profilId } = body

    if (!nama || !profilId) {
      return NextResponse.json(
        { error: 'Nama and profilId are required' },
        { status: 400 }
      )
    }

    const kategori = await db.kategoriPemasukan.create({
      data: {
        nama,
        deskripsi: deskripsi || null,
        warna: warna || '#10b981',
        profilId
      }
    })

    return NextResponse.json(kategori, { status: 201 })
  } catch (error) {
    console.error('Error creating kategori pemasukan:', error)
    return NextResponse.json(
      { error: 'Failed to create kategori pemasukan' },
      { status: 500 }
    )
  }
}