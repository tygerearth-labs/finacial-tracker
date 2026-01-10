import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { nama, deskripsi, warna, jenis } = await request.json()
    
    if (!jenis) {
      return NextResponse.json({ error: 'Jenis is required' }, { status: 400 })
    }

    let category
    if (jenis === 'MASUK') {
      category = await db.kategoriPemasukan.update({
        where: { id: params.id },
        data: {
          ...(nama && { nama }),
          ...(deskripsi !== undefined && { deskripsi }),
          ...(warna && { warna })
        }
      })
    } else {
      category = await db.kategoriPengeluaran.update({
        where: { id: params.id },
        data: {
          ...(nama && { nama }),
          ...(deskripsi !== undefined && { deskripsi }),
          ...(warna && { warna })
        }
      })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const jenis = searchParams.get('jenis')

    if (!jenis) {
      return NextResponse.json({ error: 'Jenis is required' }, { status: 400 })
    }

    if (jenis === 'MASUK') {
      await db.kategoriPemasukan.delete({
        where: { id: params.id }
      })
    } else {
      await db.kategoriPengeluaran.delete({
        where: { id: params.id }
      })
    }

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}