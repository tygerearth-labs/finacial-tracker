import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profilId = searchParams.get('profilId')
    const jenis = searchParams.get('jenis')
    const bulan = searchParams.get('bulan')
    const tahun = searchParams.get('tahun')

    const whereClause: any = {}
    if (profilId) whereClause.profilId = profilId
    if (jenis) whereClause.jenis = jenis
    
    if (bulan && tahun) {
      const startDate = new Date(parseInt(tahun), parseInt(bulan) - 1, 1)
      const endDate = new Date(parseInt(tahun), parseInt(bulan), 0)
      whereClause.tanggal = {
        gte: startDate,
        lte: endDate
      }
    }

    const transactions = await db.transaksi.findMany({
      where: whereClause,
      include: {
        kategoriPemasukan: true,
        kategoriPengeluaran: true,
        profil: true
      },
      orderBy: { tanggal: 'desc' }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      jenis, 
      nominal, 
      deskripsi, 
      tanggal, 
      kategoriPemasukanId, 
      kategoriPengeluaranId, 
      profilId 
    } = await request.json()
    
    if (!jenis || !nominal || !tanggal || !profilId) {
      return NextResponse.json({ 
        error: 'Jenis, nominal, tanggal, and profilId are required' 
      }, { status: 400 })
    }

    if (jenis === 'MASUK' && !kategoriPemasukanId) {
      return NextResponse.json({ 
        error: 'Kategori pemasukan is required for MASUK transaction' 
      }, { status: 400 })
    }

    if (jenis === 'KELUAR' && !kategoriPengeluaranId) {
      return NextResponse.json({ 
        error: 'Kategori pengeluaran is required for KELUAR transaction' 
      }, { status: 400 })
    }

    const transaction = await db.transaksi.create({
      data: {
        jenis,
        nominal: parseFloat(nominal),
        deskripsi,
        tanggal: new Date(tanggal),
        kategoriPemasukanId: jenis === 'MASUK' ? kategoriPemasukanId : null,
        kategoriPengeluaranId: jenis === 'KELUAR' ? kategoriPengeluaranId : null,
        profilId
      },
      include: {
        kategoriPemasukan: true,
        kategoriPengeluaran: true,
        profil: true
      }
    })

    // Handle automatic allocation to savings targets for income transactions
    if (jenis === 'MASUK') {
      const activeTargets = await db.targetTabungan.findMany({
        where: {
          profilId,
          isActive: true,
          alokasiPersen: { gt: 0 }
        }
      })

      for (const target of activeTargets) {
        const alokasiNominal = (nominal * target.alokasiPersen) / 100
        if (alokasiNominal > 0) {
          await db.alokasiTabungan.create({
            data: {
              nominal: alokasiNominal,
              transaksiId: transaction.id,
              targetTabunganId: target.id,
              profilId
            }
          })

          // Update target tercapai
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

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}