import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kategori = await db.kategoriPengeluaran.findUnique({
      where: {
        id: params.id
      }
    })

    if (!kategori) {
      return NextResponse.json(
        { error: 'Kategori pengeluaran not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(kategori)
  } catch (error) {
    console.error('Error fetching kategori pengeluaran:', error)
    return NextResponse.json(
      { error: 'Failed to fetch kategori pengeluaran' },
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
    const { nama, deskripsi, warna } = body

    const kategori = await db.kategoriPengeluaran.update({
      where: {
        id: params.id
      },
      data: {
        ...(nama && { nama }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(warna && { warna })
      }
    })

    return NextResponse.json(kategori)
  } catch (error) {
    console.error('Error updating kategori pengeluaran:', error)
    return NextResponse.json(
      { error: 'Failed to update kategori pengeluaran' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.kategoriPengeluaran.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: 'Kategori pengeluaran deleted successfully' })
  } catch (error) {
    console.error('Error deleting kategori pengeluaran:', error)
    return NextResponse.json(
      { error: 'Failed to delete kategori pengeluaran' },
      { status: 500 }
    )
  }
}