import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profilId = searchParams.get('profilId')
    const bulan = searchParams.get('bulan')
    const tahun = searchParams.get('tahun')
    const format = searchParams.get('format') // 'json' or 'excel'

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

    // Get transactions with categories
    const transactions = await db.transaksi.findMany({
      where: whereClause,
      include: {
        kategoriPemasukan: true,
        kategoriPengeluaran: true
      },
      orderBy: { tanggal: 'desc' }
    })

    // Get savings targets
    const savingsTargets = await db.targetTabungan.findMany({
      where: { profilId },
      include: {
        alokasiTabungan: {
          include: {
            transaksi: true
          }
        }
      }
    })

    // Get categories
    const kategoriPemasukan = await db.kategoriPemasukan.findMany({
      where: { profilId }
    })

    const kategoriPengeluaran = await db.kategoriPengeluaran.findMany({
      where: { profilId }
    })

    // Calculate summary
    const totalPemasukan = transactions
      .filter(t => t.jenis === 'MASUK')
      .reduce((sum, t) => sum + t.nominal, 0)

    const totalPengeluaran = transactions
      .filter(t => t.jenis === 'KELUAR')
      .reduce((sum, t) => sum + t.nominal, 0)

    const totalTarget = savingsTargets.reduce((sum, target) => sum + target.target, 0)
    const totalTercapai = savingsTargets.reduce((sum, target) => sum + target.tercapai, 0)

    const reportData = {
      profile: {
        profilId,
        periode: bulan && tahun ? `${bulan}/${tahun}` : 'Semua Data'
      },
      summary: {
        totalPemasukan,
        totalPengeluaran,
        saldo: totalPemasukan - totalPengeluaran,
        totalTargetTabungan: totalTarget,
        totalTercapai: totalTercapai,
        progressTabungan: totalTarget > 0 ? (totalTercapai / totalTarget) * 100 : 0
      },
      transactions: transactions.map(t => ({
        id: t.id,
        tanggal: t.tanggal,
        jenis: t.jenis,
        nominal: t.nominal,
        deskripsi: t.deskripsi,
        kategori: t.jenis === 'MASUK' 
          ? t.kategoriPemasukan?.nama || '-'
          : t.kategoriPengeluaran?.nama || '-'
      })),
      savingsTargets: savingsTargets.map(target => ({
        id: target.id,
        nama: target.nama,
        deskripsi: target.deskripsi,
        target: target.target,
        tercapai: target.tercapai,
        progress: target.target > 0 ? (target.tercapai / target.target) * 100 : 0,
        tanggalMulai: target.tanggalMulai,
        tanggalTarget: target.tanggalTarget,
        alokasiPersen: target.alokasiPersen,
        isActive: target.isActive
      })),
      categories: {
        pemasukan: kategoriPemasukan,
        pengeluaran: kategoriPengeluaran
      }
    }

    if (format === 'excel') {
      // For Excel export, we'll create a CSV format that can be opened in Excel
      const csvData = generateCSV(reportData)
      
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="financial-report-${profilId}-${bulan || 'all'}-${tahun || 'all'}.csv"`
        }
      })
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}

function generateCSV(data: any): string {
  const headers = [
    'Tanggal',
    'Jenis',
    'Nominal',
    'Deskripsi',
    'Kategori'
  ]

  const rows = data.transactions.map((t: any) => [
    new Date(t.tanggal).toLocaleDateString('id-ID'),
    t.jenis,
    t.nominal.toString(),
    t.deskripsi || '',
    t.kategori
  ])

  const csvContent = [
    `Laporan Keuangan - ${data.profile.periode}`,
    '',
    'Ringkasan',
    'Total Pemasukan,' + data.summary.totalPemasukan,
    'Total Pengeluaran,' + data.summary.totalPengeluaran,
    'Saldo,' + data.summary.saldo,
    'Total Target Tabungan,' + data.summary.totalTargetTabungan,
    'Total Tercapai,' + data.summary.totalTercapai,
    'Progress Tabungan (%),' + data.summary.progressTabungan.toFixed(2),
    '',
    'Transaksi',
    headers.join(','),
    ...rows.map((row: string[]) => row.join(','))
  ].join('\n')

  return csvContent
}