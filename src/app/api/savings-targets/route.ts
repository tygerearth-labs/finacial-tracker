import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profilId = searchParams.get('profilId')

    if (!profilId) {
      return NextResponse.json({ error: 'ProfilId is required' }, { status: 400 })
    }

    const targets = await db.targetTabungan.findMany({
      where: { profilId },
      include: {
        alokasiTabungan: {
          include: {
            transaksi: true
          }
        },
        _count: {
          select: { alokasiTabungan: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate progress percentage for each target
    const targetsWithProgress = targets.map(target => ({
      ...target,
      progressPersen: target.target > 0 ? (target.tercapai / target.target) * 100 : 0,
      sisaHari: Math.ceil((new Date(target.tanggalTarget).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }))

    return NextResponse.json(targetsWithProgress)
  } catch (error) {
    console.error('Error fetching savings targets:', error)
    return NextResponse.json({ error: 'Failed to fetch savings targets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      nama, 
      deskripsi, 
      target, 
      tanggalMulai, 
      tanggalTarget, 
      alokasiPersen, 
      profilId 
    } = await request.json()
    
    if (!nama || !target || !tanggalMulai || !tanggalTarget || !profilId) {
      return NextResponse.json({ 
        error: 'Nama, target, tanggalMulai, tanggalTarget, and profilId are required' 
      }, { status: 400 })
    }

    const savingsTarget = await db.targetTabungan.create({
      data: {
        nama,
        deskripsi,
        target: parseFloat(target),
        tercapai: 0,
        tanggalMulai: new Date(tanggalMulai),
        tanggalTarget: new Date(tanggalTarget),
        alokasiPersen: parseFloat(alokasiPersen) || 0,
        isActive: true,
        profilId
      },
      include: {
        alokasiTabungan: true
      }
    })

    return NextResponse.json(savingsTarget, { status: 201 })
  } catch (error) {
    console.error('Error creating savings target:', error)
    return NextResponse.json({ error: 'Failed to create savings target' }, { status: 500 })
  }
}