import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transaksi = await db.transaksi.findUnique({
      where: {
        id: params.id
      },
      include: {
        kategoriPemasukan: true,
        kategoriPengeluaran: true,
        alokasiTabungan: {
          include: {
            targetTabungan: true
          }
        }
      }
    })

    if (!transaksi) {
      return NextResponse.json(
        { error: 'Transaksi not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(transaksi)
  } catch (error) {
    console.error('Error fetching transaksi:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaksi' },
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
      jenis, 
      nominal, 
      deskripsi, 
      tanggal, 
      kategoriPemasukanId, 
      kategoriPengeluaranId 
    } = body

    // Get old transaksi for comparison
    const oldTransaksi = await db.transaksi.findUnique({
      where: { id: params.id },
      include: { alokasiTabungan: true }
    })

    if (!oldTransaksi) {
      return NextResponse.json(
        { error: 'Transaksi not found' },
        { status: 404 }
      )
    }

    // Update transaksi
    const transaksi = await db.transaksi.update({
      where: {
        id: params.id
      },
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
        kategoriPengeluaran: true
      }
    })

    // If jenis changed to/from MASUK or nominal changed, update alokasi tabungan
    if (oldTransaksi.jenis === 'MASUK' && (jenis === 'KELUAR' || (nominal && nominal !== oldTransaksi.nominal))) {
      // Delete old alokasi
      await db.alokasiTabungan.deleteMany({
        where: { transaksiId: params.id }
      })

      // Update target tabungan tercapai
      for (const alokasi of oldTransaksi.alokasiTabungan) {
        await db.targetTabungan.update({
          where: { id: alokasi.targetTabunganId },
          data: {
            tercapai: {
              decrement: alokasi.nominal
            }
          }
        })
      }

      // If still MASUK and nominal changed, create new alokasi
      if (jenis !== 'KELUAR' && nominal && nominal !== oldTransaksi.nominal) {
        const targetTabungan = await db.targetTabungan.findMany({
          where: {
            profilId: oldTransaksi.profilId,
            isActive: true,
            alokasiPersen: { gt: 0 }
          }
        })

        for (const target of targetTabungan) {
          const alokasiNominal = (parseFloat(nominal) * target.alokasiPersen) / 100
          
          await db.alokasiTabungan.create({
            data: {
              nominal: alokasiNominal,
              transaksiId: transaksi.id,
              targetTabunganId: target.id,
              profilId: oldTransaksi.profilId
            }
          })

          await db.targetTabungan.update({
            where: { id: target.id },
            data: {
              tercapai: {
                increment: alokasiNominal
              }
            }
          })
        }
      }
    }

    return NextResponse.json(transaksi)
  } catch (error) {
    console.error('Error updating transaksi:', error)
    return NextResponse.json(
      { error: 'Failed to update transaksi' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get transaksi with alokasi before deleting
    const transaksi = await db.transaksi.findUnique({
      where: { id: params.id },
      include: { alokasiTabungan: true }
    })

    if (!transaksi) {
      return NextResponse.json(
        { error: 'Transaksi not found' },
        { status: 404 }
      )
    }

    // Update target tabungan tercapai (decrement)
    if (transaksi.jenis === 'MASUK') {
      for (const alokasi of transaksi.alokasiTabungan) {
        await db.targetTabungan.update({
          where: { id: alokasi.targetTabunganId },
          data: {
            tercapai: {
              decrement: alokasi.nominal
            }
          }
        })
      }
    }

    // Delete transaksi (this will cascade delete alokasiTabungan)
    await db.transaksi.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: 'Transaksi deleted successfully' })
  } catch (error) {
    console.error('Error deleting transaksi:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaksi' },
      { status: 500 }
    )
  }
}