import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const targetTabungan = await db.targetTabungan.findUnique({
      where: {
        id: params.id
      },
      include: {
        alokasiTabungan: {
          include: {
            transaksi: true
          }
        }
      }
    })

    if (!targetTabungan) {
      return NextResponse.json(
        { error: 'Target tabungan not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(targetTabungan)
  } catch (error) {
    console.error('Error fetching target tabungan:', error)
    return NextResponse.json(
      { error: 'Failed to fetch target tabungan' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { 
      nama, 
      deskripsi, 
      target, 
      tanggalMulai, 
      tanggalTarget, 
      alokasiPersen, 
      isActive 
    } = body

    const targetTabungan = await db.targetTabungan.update({
      where: {
        id: params.id
      },
      data: {
        ...(nama && { nama }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(target && { target: parseFloat(target) }),
        ...(tanggalMulai && { tanggalMulai: new Date(tanggalMulai) }),
        ...(tanggalTarget && { tanggalTarget: new Date(tanggalTarget) }),
        ...(alokasiPersen !== undefined && { alokasiPersen: parseFloat(alokasiPersen) }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json(targetTabungan)
  } catch (error) {
    console.error('Error updating target tabungan:', error)
    return NextResponse.json(
      { error: 'Failed to update target tabungan' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.targetTabungan.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: 'Target tabungan deleted successfully' })
  } catch (error) {
    console.error('Error deleting target tabungan:', error)
    return NextResponse.json(
      { error: 'Failed to delete target tabungan' },
      { status: 500 }
    )
  }
}