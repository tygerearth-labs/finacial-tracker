'use client'

import { useState, useEffect } from 'react'
import { useProfile } from '@/contexts/ProfileContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Download, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  FileText,
  Filter
} from 'lucide-react'

interface Transaksi {
  id: string
  tanggal: string
  jenis: string
  nominal: number
  deskripsi: string
  kategori: string
}

interface SavingsTarget {
  id: string
  nama: string
  target: number
  tercapai: number
  progress: number
  tanggalMulai: string
  tanggalTarget: string
  alokasiPersen: number
  isActive: boolean
}

interface ReportData {
  profile: {
    profilId: string
    periode: string
  }
  summary: {
    totalPemasukan: number
    totalPengeluaran: number
    saldo: number
    totalTargetTabungan: number
    totalTercapai: number
    progressTabungan: number
  }
  transactions: Transaksi[]
  savingsTargets: SavingsTarget[]
}

export default function Laporan() {
  const { activeProfile } = useProfile()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString())
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())

  const fetchReportData = async () => {
    if (!activeProfile) return
    
    setLoading(true)
    try {
      const params = new URLSearchParams({ 
        profilId: activeProfile.id,
        format: 'json'
      })
      
      if (filterPeriod === 'month') {
        params.append('bulan', (new Date().getMonth() + 1).toString())
        params.append('tahun', new Date().getFullYear().toString())
      } else if (filterPeriod === 'year') {
        params.append('tahun', new Date().getFullYear().toString())
      } else if (filterPeriod === 'custom' && filterMonth && filterYear) {
        params.append('bulan', filterMonth)
        params.append('tahun', filterYear)
      }

      const response = await fetch(`/api/reports?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReportData()
  }, [activeProfile, filterPeriod, filterMonth, filterYear])

  const handleExport = async () => {
    if (!activeProfile) return
    
    try {
      const params = new URLSearchParams({ 
        profilId: activeProfile.id,
        format: 'excel'
      })
      
      if (filterPeriod === 'month') {
        params.append('bulan', (new Date().getMonth() + 1).toString())
        params.append('tahun', new Date().getFullYear().toString())
      } else if (filterPeriod === 'year') {
        params.append('tahun', new Date().getFullYear().toString())
      } else if (filterPeriod === 'custom' && filterMonth && filterYear) {
        params.append('bulan', filterMonth)
        params.append('tahun', filterYear)
      }

      const response = await fetch(`/api/reports?${params}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `financial-report-${activeProfile.id}-${filterMonth || 'all'}-${filterYear || 'all'}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  if (!activeProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-200 mb-2">Tidak Ada Profil Aktif</h3>
          <p className="text-gray-400">Silakan pilih atau buat profil terlebih dahulu</p>
        </div>
      </div>
    )
  }

  if (loading || !reportData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Laporan</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-800 rounded animate-pulse mb-2"></div>
                <div className="h-8 bg-gray-800 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const { summary, transactions, savingsTargets } = reportData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Laporan Keuangan</h1>
          <p className="text-gray-400">Laporan lengkap untuk {activeProfile.nama}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-gray-200">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Periode" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">Semua Data</SelectItem>
              <SelectItem value="month">Bulan Ini</SelectItem>
              <SelectItem value="year">Tahun Ini</SelectItem>
              <SelectItem value="custom">Kustom</SelectItem>
            </SelectContent>
          </Select>
          
          {filterPeriod === 'custom' && (
            <>
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-gray-200">
                  <SelectValue placeholder="Bulan" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="1">Januari</SelectItem>
                  <SelectItem value="2">Februari</SelectItem>
                  <SelectItem value="3">Maret</SelectItem>
                  <SelectItem value="4">April</SelectItem>
                  <SelectItem value="5">Mei</SelectItem>
                  <SelectItem value="6">Juni</SelectItem>
                  <SelectItem value="7">Juli</SelectItem>
                  <SelectItem value="8">Agustus</SelectItem>
                  <SelectItem value="9">September</SelectItem>
                  <SelectItem value="10">Oktober</SelectItem>
                  <SelectItem value="11">November</SelectItem>
                  <SelectItem value="12">Desember</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-gray-200">
                  <SelectValue placeholder="Tahun" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
          
          <Button 
            variant="outline" 
            className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Rp {summary.totalPemasukan.toLocaleString('id-ID')}</div>
            <p className="text-xs text-green-400">Periode {reportData.profile.periode}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Rp {summary.totalPengeluaran.toLocaleString('id-ID')}</div>
            <p className="text-xs text-red-400">Periode {reportData.profile.periode}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Saldo Bersih</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Rp {summary.saldo.toLocaleString('id-ID')}</div>
            <p className="text-xs text-blue-400">Pemasukan - Pengeluaran</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Progress Tabungan</CardTitle>
            <Calendar className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{summary.progressTabungan.toFixed(1)}%</div>
            <p className="text-xs text-purple-400">Rp {summary.totalTercapai.toLocaleString('id-ID')} tercapai</p>
          </CardContent>
        </Card>
      </div>

      {/* Savings Targets Summary */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Target Tabungan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {savingsTargets.map((target) => (
              <div key={target.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-medium text-white">{target.nama}</h3>
                    <Badge variant={target.isActive ? "default" : "secondary"} className="text-xs">
                      {target.isActive ? 'Aktif' : 'Non-aktif'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>Target: Rp {target.target.toLocaleString('id-ID')}</span>
                    <span>Tercapai: Rp {target.tercapai.toLocaleString('id-ID')}</span>
                    <span>Alokasi: {target.alokasiPersen}%</span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(target.progress, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{target.progress.toFixed(1)}% tercapai</p>
                  </div>
                </div>
              </div>
            ))}
            {savingsTargets.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Belum ada target tabungan</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Detail Transaksi</CardTitle>
          <p className="text-sm text-gray-400">
            Total {transactions.length} transaksi untuk periode {reportData.profile.periode}
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Tanggal</TableHead>
                  <TableHead className="text-gray-300">Jenis</TableHead>
                  <TableHead className="text-gray-300">Kategori</TableHead>
                  <TableHead className="text-gray-300">Deskripsi</TableHead>
                  <TableHead className="text-gray-300 text-right">Nominal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="border-gray-700">
                    <TableCell className="text-gray-200">
                      {new Date(transaction.tanggal).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={transaction.jenis === 'MASUK' ? "default" : "secondary"}
                        className={transaction.jenis === 'MASUK' 
                          ? "bg-green-900 text-green-200" 
                          : "bg-red-900 text-red-200"
                        }
                      >
                        {transaction.jenis}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-200">{transaction.kategori}</TableCell>
                    <TableCell className="text-gray-200">{transaction.deskripsi || '-'}</TableCell>
                    <TableCell className={`text-right font-medium ${
                      transaction.jenis === 'MASUK' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.jenis === 'MASUK' ? '+' : '-'}Rp {transaction.nominal.toLocaleString('id-ID')}
                    </TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                      Belum ada transaksi untuk periode ini
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}