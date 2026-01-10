'use client'

import { useState, useEffect } from 'react'
import { useProfile } from '@/contexts/ProfileContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign,
  Calendar,
  Filter,
  Download,
  PiggyBank,
  AlertCircle
} from 'lucide-react'

interface DashboardData {
  summary: {
    totalPemasukan: number
    totalPengeluaran: number
    saldo: number
    totalTransaksi: number
    debtRatio: number
    savingsProgress: number
  }
  savingsTargets: Array<{
    id: string
    nama: string
    target: number
    tercapai: number
    progressPersen: number
    sisaHari: number
    isActive: boolean
  }>
  monthlyTrends: Array<{
    bulan: string
    pemasukan: number
    pengeluaran: number
    saldo: number
  }>
  kategori: {
    pemasukan: Array<{
      nama: string
      total: number
      count: number
      warna: string
    }>
    pengeluaran: Array<{
      nama: string
      total: number
      count: number
      warna: string
    }>
  }
  recentTransactions: Array<{
    id: string
    jenis: string
    nominal: number
    deskripsi: string
    tanggal: string
    kategoriPemasukan?: { nama: string }
    kategoriPengeluaran?: { nama: string }
  }>
}

export default function Home() {
  const { activeProfile } = useProfile()
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString())
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchDashboardData = async () => {
    if (!activeProfile) return
    
    setLoading(true)
    try {
      const params = new URLSearchParams({ profilId: activeProfile.id })
      
      if (filterPeriod === 'month') {
        params.append('bulan', (new Date().getMonth() + 1).toString())
        params.append('tahun', new Date().getFullYear().toString())
      } else if (filterPeriod === 'year') {
        params.append('tahun', new Date().getFullYear().toString())
      } else if (filterPeriod === 'custom' && filterMonth && filterYear) {
        params.append('bulan', filterMonth)
        params.append('tahun', filterYear)
      }

      const response = await fetch(`/api/dashboard?${params}`)
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
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
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-200 mb-2">Tidak Ada Profil Aktif</h3>
          <p className="text-gray-400">Silakan pilih atau buat profil terlebih dahulu</p>
        </div>
      </div>
    )
  }

  if (loading || !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
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

  const { summary, savingsTargets, monthlyTrends, kategori, recentTransactions } = dashboardData

  return (
    <div className="space-y-6">
      {/* Header dengan Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Ringkasan keuangan {activeProfile.nama}</p>
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
          
          <Button variant="outline" className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Kas Masuk</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Rp {summary.totalPemasukan.toLocaleString('id-ID')}</div>
            <p className="text-xs text-green-400">{summary.totalTransaksi} transaksi</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Kas Keluar</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Rp {summary.totalPengeluaran.toLocaleString('id-ID')}</div>
            <p className="text-xs text-red-400">{summary.debtRatio.toFixed(1)}% rasio</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Rp {summary.saldo.toLocaleString('id-ID')}</div>
            <p className="text-xs text-blue-400">Tersedia</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Rasio Kesehatan</CardTitle>
            <Target className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{(100 - summary.debtRatio).toFixed(1)}%</div>
            <p className="text-xs text-purple-400">Status: {summary.debtRatio < 50 ? 'Sehat' : 'Waspada'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart dan Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Arus Kas */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Arus Kas 6 Bulan Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 w-20">{trend.bulan}</span>
                  <div className="flex-1 mx-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${Math.min((trend.pemasukan / Math.max(...monthlyTrends.map(t => t.pemasukan))) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${Math.min((trend.pengeluaran / Math.max(...monthlyTrends.map(t => t.pengeluaran))) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-white w-16 text-right">Rp {trend.saldo.toLocaleString('id-ID')}</span>
                </div>
              ))}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-gray-400">Pemasukan</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-gray-400">Pengeluaran</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Progress Target Tabungan */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Target Tabungan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progress Keseluruhan</span>
                <span className="text-white">{summary.savingsProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(summary.savingsProgress, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {savingsTargets.slice(0, 3).map((target) => (
                <div key={target.id} className="border-l-2 border-blue-500 pl-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm text-white font-medium">{target.nama}</span>
                    <Badge variant={target.isActive ? "default" : "secondary"} className="text-xs">
                      {target.isActive ? 'Aktif' : 'Non-aktif'}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Rp {target.tercapai.toLocaleString('id-ID')} / Rp {target.target.toLocaleString('id-ID')}</span>
                    <span>{target.progressPersen.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full" 
                      style={{ width: `${Math.min(target.progressPersen, 100)}%` }}
                    />
                  </div>
                  {target.sisaHari > 0 && (
                    <p className="text-xs text-gray-500 mt-1">{target.sisaHari} hari lagi</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kategori Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Kategori Pemasukan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kategori.pemasukan.slice(0, 5).map((kat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: kat.warna }}
                    />
                    <span className="text-sm text-gray-300">{kat.nama}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white font-medium">Rp {kat.total.toLocaleString('id-ID')}</div>
                    <div className="text-xs text-gray-400">{kat.count} transaksi</div>
                  </div>
                </div>
              ))}
              {kategori.pemasukan.length === 0 && (
                <p className="text-center text-gray-400 py-4">Belum ada data pemasukan</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Kategori Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kategori.pengeluaran.slice(0, 5).map((kat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: kat.warna }}
                    />
                    <span className="text-sm text-gray-300">{kat.nama}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white font-medium">Rp {kat.total.toLocaleString('id-ID')}</div>
                    <div className="text-xs text-gray-400">{kat.count} transaksi</div>
                  </div>
                </div>
              ))}
              {kategori.pengeluaran.length === 0 && (
                <p className="text-center text-gray-400 py-4">Belum ada data pengeluaran</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rasio Hutang Piutang */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Rasio Keuangan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Rasio Pengeluaran</p>
              <p className="text-xl font-bold text-red-400">{summary.debtRatio.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">dari pemasukan</p>
            </div>
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Efisiensi</p>
              <p className="text-xl font-bold text-green-400">{(100 - summary.debtRatio).toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">sisa dari pemasukan</p>
            </div>
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Status Keuangan</p>
              <p className="text-xl font-bold text-blue-400">
                {summary.debtRatio < 30 ? 'Sehat' : summary.debtRatio < 50 ? 'Waspada' : 'Berbahaya'}
              </p>
              <Badge 
                variant="secondary" 
                className={`mt-1 ${
                  summary.debtRatio < 30 ? 'bg-green-900 text-green-200' : 
                  summary.debtRatio < 50 ? 'bg-yellow-900 text-yellow-200' : 
                  'bg-red-900 text-red-200'
                }`}
              >
                {summary.debtRatio < 30 ? 'Baik' : summary.debtRatio < 50 ? 'Cukup' : 'Buruk'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}