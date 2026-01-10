import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kategori = await db.kategoriPemasukan.findUnique({
      where: {
        id: params.id
      }
    })

    if (!kategori) {
      return NextResponse.json(
        { error: 'Kategori pemasukan not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(kategori)
  } catch (error) {
    console.error('Error fetching kategori pemasukan:', error)
    return NextResponse.json(
      { error: 'Failed to fetch kategori pemasukan' },
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

    const kategori = await db.kategoriPemasukan.update({
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
    console.error('Error updating kategori pemasukan:', error)
    return NextResponse.json(
      { error: 'Failed to update kategori pemasukan' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.kategoriPemasukan.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: 'Kategori pemasukan deleted successfully' })
  } catch (error) {
    console.error('Error deleting kategori pemasukan:', error)
    return NextResponse.json(
      { error: 'Failed to delete kategori pemasukan' },
      { status: 500 }
    )
  }
}