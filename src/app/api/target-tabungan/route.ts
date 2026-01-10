import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profilId = searchParams.get('profilId')
    const isActive = searchParams.get('isActive')

    let whereClause: any = {}
    
    if (profilId) {
      whereClause.profilId = profilId
    }
    
    if (isActive !== null && isActive !== undefined) {
      whereClause.isActive = isActive === 'true'
    }

    const targetTabungan = await db.targetTabungan.findMany({
      where: whereClause,
      include: {
        alokasiTabungan: {
          include: {
            transaksi: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(targetTabungan)
  } catch (error) {
    console.error('Error fetching target tabungan:', error)
    return NextResponse.json(
      { error: 'Failed to fetch target tabungan' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      nama, 
      deskripsi, 
      target, 
      tanggalMulai, 
      tanggalTarget, 
      alokasiPersen, 
      profilId 
    } = body

    if (!nama || !target || !tanggalMulai || !tanggalTarget || !profilId) {
      return NextResponse.json(
        { error: 'Nama, target, tanggalMulai, tanggalTarget, and profilId are required' },
        { status: 400 }
      )
    }

    const targetTabungan = await db.targetTabungan.create({
      data: {
        nama,
        deskripsi: deskripsi || null,
        target: parseFloat(target),
        tercapai: 0,
        tanggalMulai: new Date(tanggalMulai),
        tanggalTarget: new Date(tanggalTarget),
        alokasiPersen: parseFloat(alokasiPersen) || 0,
        isActive: true,
        profilId
      }
    })

    return NextResponse.json(targetTabungan, { status: 201 })
  } catch (error) {
    console.error('Error creating target tabungan:', error)
    return NextResponse.json(
      { error: 'Failed to create target tabungan' },
      { status: 500 }
    )
  }
}