import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = await db.transaksi.findUnique({
      where: { id: params.id },
      include: {
        kategoriPemasukan: true,
        kategoriPengeluaran: true,
        profil: true,
        alokasiTabungan: true
      }
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { 
      jenis, 
      nominal, 
      deskripsi, 
      tanggal, 
      kategoriPemasukanId, 
      kategoriPengeluaranId 
    } = await request.json()
    
    const transaction = await db.transaksi.update({
      where: { id: params.id },
      data: {
        ...(jenis && { jenis }),
        ...(nominal && { nominal: parseFloat(nominal) }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(tanggal && { tanggal: new Date(tanggal) }),
        ...(kategoriPemasukanId !== undefined && { kategoriPemasukanId }),
        ...(kategoriPengeluaranId !== undefined && { kategoriPengeluaranId })
      },
      include: {
        kategoriPemasukan: true,
        kategoriPengeluaran: true,
        profil: true
      }
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete related allocations first
    await db.alokasiTabungan.deleteMany({
      where: { transaksiId: params.id }
    })

    // Delete the transaction
    await db.transaksi.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
  }
}