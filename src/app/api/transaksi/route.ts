import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profilId = searchParams.get('profilId')
    const jenis = searchParams.get('jenis') // 'MASUK' atau 'KELUAR'
    const bulan = searchParams.get('bulan')
    const tahun = searchParams.get('tahun')

    // Build where clause
    let whereClause: any = {}
    
    if (profilId) {
      whereClause.profilId = profilId
    }
    
    if (jenis) {
      whereClause.jenis = jenis
    }
    
    if (bulan && tahun) {
      const startDate = new Date(parseInt(tahun), parseInt(bulan) - 1, 1)
      const endDate = new Date(parseInt(tahun), parseInt(bulan), 0)
      
      whereClause.tanggal = {
        gte: startDate,
        lte: endDate
      }
    } else if (tahun) {
      const startDate = new Date(parseInt(tahun), 0, 1)
      const endDate = new Date(parseInt(tahun), 11, 31)
      
      whereClause.tanggal = {
        gte: startDate,
        lte: endDate
      }
    }

    const transaksi = await db.transaksi.findMany({
      where: whereClause,
      include: {
        kategoriPemasukan: true,
        kategoriPengeluaran: true
      },
      orderBy: {
        tanggal: 'desc'
      }
    })
    
    return NextResponse.json(transaksi)
  } catch (error) {
    console.error('Error fetching transaksi:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaksi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      jenis, 
      nominal, 
      deskripsi, 
      tanggal, 
      kategoriPemasukanId, 
      kategoriPengeluaranId, 
      profilId 
    } = body

    if (!jenis || !nominal || !tanggal || !profilId) {
      return NextResponse.json(
        { error: 'Jenis, nominal, tanggal, and profilId are required' },
        { status: 400 }
      )
    }

    if (jenis === 'MASUK' && !kategoriPemasukanId) {
      return NextResponse.json(
        { error: 'Kategori pemasukan is required for kas masuk' },
        { status: 400 }
      )
    }

    if (jenis === 'KELUAR' && !kategoriPengeluaranId) {
      return NextResponse.json(
        { error: 'Kategori pengeluaran is required for kas keluar' },
        { status: 400 }
      )
    }

    const transaksi = await db.transaksi.create({
      data: {
        jenis,
        nominal: parseFloat(nominal),
        deskripsi: deskripsi || null,
        tanggal: new Date(tanggal),
        kategoriPemasukanId: kategoriPemasukanId || null,
        kategoriPengeluaranId: kategoriPengeluaranId || null,
        profilId
      },
      include: {
        kategoriPemasukan: true,
        kategoriPengeluaran: true
      }
    })

    // Jika ini transaksi masuk, alokasikan ke target tabungan yang aktif
    if (jenis === 'MASUK') {
      const targetTabungan = await db.targetTabungan.findMany({
        where: {
          profilId,
          isActive: true,
          alokasiPersen: { gt: 0 }
        }
      })

      for (const target of targetTabungan) {
        const alokasiNominal = (nominal * target.alokasiPersen) / 100
        
        await db.alokasiTabungan.create({
          data: {
            nominal: alokasiNominal,
            transaksiId: transaksi.id,
            targetTabunganId: target.id,
            profilId
          }
        })

        // Update tercapai pada target tabungan
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

    return NextResponse.json(transaksi, { status: 201 })
  } catch (error) {
    console.error('Error creating transaksi:', error)
    return NextResponse.json(
      { error: 'Failed to create transaksi' },
      { status: 500 }
    )
  }
}