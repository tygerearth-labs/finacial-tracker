import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profilId = searchParams.get('profilId')
    const bulan = searchParams.get('bulan')
    const tahun = searchParams.get('tahun')

    if (!profilId) {
      return NextResponse.json({ error: 'ProfilId is required' }, { status: 400 })
    }

    const whereClause: any = { profilId }
    
    if (bulan && tahun) {
      const startDate = new Date(parseInt(tahun), parseInt(bulan) - 1, 1)
      const endDate = new Date(parseInt(tahun), parseInt(bulan), 0)
      whereClause.tanggal = {
        gte: startDate,
        lte: endDate
      }
    }

    // Get all transactions for the profile
    const transactions = await db.transaksi.findMany({
      where: whereClause,
      include: {
        kategoriPemasukan: true,
        kategoriPengeluaran: true
      },
      orderBy: { tanggal: 'desc' }
    })

    // Calculate basic metrics
    const totalPemasukan = transactions
      .filter(t => t.jenis === 'MASUK')
      .reduce((sum, t) => sum + t.nominal, 0)

    const totalPengeluaran = transactions
      .filter(t => t.jenis === 'KELUAR')
      .reduce((sum, t) => sum + t.nominal, 0)

    const saldo = totalPemasukan - totalPengeluaran

    // Get savings targets
    const savingsTargets = await db.targetTabungan.findMany({
      where: { profilId },
      include: {
        alokasiTabungan: true
      }
    })

    const totalTarget = savingsTargets.reduce((sum, target) => sum + target.target, 0)
    const totalTercapai = savingsTargets.reduce((sum, target) => sum + target.tercapai, 0)
    const savingsProgress = totalTarget > 0 ? (totalTercapai / totalTarget) * 100 : 0

    // Calculate debt ratio (if we had debt data, for now using pengeluaran as proxy)
    const debtRatio = totalPemasukan > 0 ? (totalPengeluaran / totalPemasukan) * 100 : 0

    // Get monthly trends (last 6 months)
    const monthlyTrends = []
    const currentDate = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1)
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      const monthTransactions = await db.transaksi.findMany({
        where: {
          profilId,
          tanggal: {
            gte: startDate,
            lte: endDate
          }
        }
      })

      const monthPemasukan = monthTransactions
        .filter(t => t.jenis === 'MASUK')
        .reduce((sum, t) => sum + t.nominal, 0)

      const monthPengeluaran = monthTransactions
        .filter(t => t.jenis === 'KELUAR')
        .reduce((sum, t) => sum + t.nominal, 0)

      monthlyTrends.push({
        bulan: date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        pemasukan: monthPemasukan,
        pengeluaran: monthPengeluaran,
        saldo: monthPemasukan - monthPengeluaran
      })
    }

    // Get category breakdown
    const kategoriPemasukan = await db.kategoriPemasukan.findMany({
      where: { profilId },
      include: {
        transaksi: {
          where: whereClause
        }
      }
    })

    const kategoriPengeluaran = await db.kategoriPengeluaran.findMany({
      where: { profilId },
      include: {
        transaksi: {
          where: whereClause
        }
      }
    })

    const pemasukanByKategori = kategoriPemasukan.map(kategori => ({
      nama: kategori.nama,
      warna: kategori.warna,
      total: kategori.transaksi.reduce((sum, t) => sum + t.nominal, 0),
      count: kategori.transaksi.length
    })).filter(k => k.total > 0)

    const pengeluaranByKategori = kategoriPengeluaran.map(kategori => ({
      nama: kategori.nama,
      warna: kategori.warna,
      total: kategori.transaksi.reduce((sum, t) => sum + t.nominal, 0),
      count: kategori.transaksi.length
    })).filter(k => k.total > 0)

    // Recent transactions
    const recentTransactions = transactions.slice(0, 10)

    const dashboardData = {
      summary: {
        totalPemasukan,
        totalPengeluaran,
        saldo,
        totalTransaksi: transactions.length,
        debtRatio,
        savingsProgress
      },
      savingsTargets: savingsTargets.map(target => ({
        ...target,
        progressPersen: target.target > 0 ? (target.tercapai / target.target) * 100 : 0,
        sisaHari: Math.ceil((new Date(target.tanggalTarget).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      })),
      monthlyTrends,
      kategori: {
        pemasukan: pemasukanByKategori,
        pengeluaran: pengeluaranByKategori
      },
      recentTransactions
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}