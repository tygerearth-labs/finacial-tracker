import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const target = await db.targetTabungan.findUnique({
      where: { id: params.id },
      include: {
        alokasiTabungan: {
          include: {
            transaksi: true
          },
          orderBy: { createdAt: 'desc' }
        },
        profil: true
      }
    })

    if (!target) {
      return NextResponse.json({ error: 'Savings target not found' }, { status: 404 })
    }

    // Calculate additional metrics
    const targetWithMetrics = {
      ...target,
      progressPersen: target.target > 0 ? (target.tercapai / target.target) * 100 : 0,
      sisaHari: Math.ceil((new Date(target.tanggalTarget).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      totalAlokasi: target.alokasiTabungan.reduce((sum, alokasi) => sum + alokasi.nominal, 0)
    }

    return NextResponse.json(targetWithMetrics)
  } catch (error) {
    console.error('Error fetching savings target:', error)
    return NextResponse.json({ error: 'Failed to fetch savings target' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { 
      nama, 
      deskripsi, 
      target, 
      tanggalMulai, 
      tanggalTarget, 
      alokasiPersen, 
      isActive 
    } = await request.json()
    
    const savingsTarget = await db.targetTabungan.update({
      where: { id: params.id },
      data: {
        ...(nama && { nama }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(target && { target: parseFloat(target) }),
        ...(tanggalMulai && { tanggalMulai: new Date(tanggalMulai) }),
        ...(tanggalTarget && { tanggalTarget: new Date(tanggalTarget) }),
        ...(alokasiPersen !== undefined && { alokasiPersen: parseFloat(alokasiPersen) }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        alokasiTabungan: true
      }
    })

    return NextResponse.json(savingsTarget)
  } catch (error) {
    console.error('Error updating savings target:', error)
    return NextResponse.json({ error: 'Failed to update savings target' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete related allocations first
    await db.alokasiTabungan.deleteMany({
      where: { targetTabunganId: params.id }
    })

    // Delete the savings target
    await db.targetTabungan.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Savings target deleted successfully' })
  } catch (error) {
    console.error('Error deleting savings target:', error)
    return NextResponse.json({ error: 'Failed to delete savings target' }, { status: 500 })
  }
}