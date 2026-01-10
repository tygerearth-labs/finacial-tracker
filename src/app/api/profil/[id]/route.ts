import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profil = await db.profil.findUnique({
      where: {
        id: params.id
      }
    })

    if (!profil) {
      return NextResponse.json(
        { error: 'Profil not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(profil)
  } catch (error) {
    console.error('Error fetching profil:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profil' },
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
    const { nama, deskripsi, isActive } = body

    // Jika mengubah profil menjadi active, set profil lain menjadi non-active
    if (isActive) {
      await db.profil.updateMany({
        where: { 
          id: { not: params.id },
          isActive: true 
        },
        data: { isActive: false }
      })
    }

    const profil = await db.profil.update({
      where: {
        id: params.id
      },
      data: {
        ...(nama && { nama }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json(profil)
  } catch (error) {
    console.error('Error updating profil:', error)
    return NextResponse.json(
      { error: 'Failed to update profil' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.profil.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: 'Profil deleted successfully' })
  } catch (error) {
    console.error('Error deleting profil:', error)
    return NextResponse.json(
      { error: 'Failed to delete profil' },
      { status: 500 }
    )
  }
}