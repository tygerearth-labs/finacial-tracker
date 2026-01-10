'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Target,
  Calendar,
  DollarSign,
  TrendingUp,
  PiggyBank,
  CheckCircle,
  Clock
} from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'

interface TargetTabungan {
  id: string
  nama: string
  deskripsi?: string
  target: number
  tercapai: number
  tanggalMulai: string
  tanggalTarget: string
  alokasiPersen: number
  isActive: boolean
  profilId: string
  alokasiTabungan?: Array<{
    id: string
    nominal: number
    transaksiId: string
    targetTabunganId: string
    createdAt: string
  }>
}

export default function TargetTabunganPage() {
  const { activeProfile } = useProfile()
  const [targetTabungan, setTargetTabungan] = useState<TargetTabungan[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTarget, setEditingTarget] = useState<TargetTabungan | null>(null)
  
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    target: '',
    tanggalMulai: new Date().toISOString().split('T')[0],
    tanggalTarget: '',
    alokasiPersen: '10'
  })

  // Fetch data
  useEffect(() => {
    if (activeProfile) {
      fetchTargetTabungan()
    }
  }, [activeProfile])

  const fetchTargetTabungan = async () => {
    try {
      const response = await fetch(`/api/savings-targets?profilId=${activeProfile?.id}`)
      if (response.ok) {
        const data = await response.json()
        setTargetTabungan(data)
      }
    } catch (error) {
      console.error('Error fetching target tabungan:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nama || !formData.target || !formData.tanggalTarget) {
      alert('Mohon lengkapi semua field yang wajib diisi')
      return
    }

    try {
      const url = editingTarget 
        ? `/api/savings-targets/${editingTarget.id}`
        : '/api/savings-targets'
      
      const method = editingTarget ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          target: parseFloat(formData.target),
          alokasiPersen: parseFloat(formData.alokasiPersen),
          profilId: activeProfile?.id
        }),
      })

      if (response.ok) {
        fetchTargetTabungan()
        setIsAddDialogOpen(false)
        setEditingTarget(null)
        setFormData({
          nama: '',
          deskripsi: '',
          target: '',
          tanggalMulai: new Date().toISOString().split('T')[0],
          tanggalTarget: '',
          alokasiPersen: '10'
        })
      }
    } catch (error) {
      console.error('Error saving target tabungan:', error)
    }
  }

  const handleEdit = (item: TargetTabungan) => {
    setEditingTarget(item)
    setFormData({
      nama: item.nama,
      deskripsi: item.deskripsi || '',
      target: item.target.toString(),
      tanggalMulai: new Date(item.tanggalMulai).toISOString().split('T')[0],
      tanggalTarget: new Date(item.tanggalTarget).toISOString().split('T')[0],
      alokasiPersen: item.alokasiPersen.toString()
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus target tabungan ini?')) {
      try {
        const response = await fetch(`/api/savings-targets/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          fetchTargetTabungan()
        }
      } catch (error) {
        console.error('Error deleting target tabungan:', error)
      }
    }
  }

  const handleToggleActive = async (item: TargetTabungan) => {
    try {
      const response = await fetch(`/api/savings-targets/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !item.isActive
        }),
      })

      if (response.ok) {
        fetchTargetTabungan()
      }
    } catch (error) {
      console.error('Error toggling target tabungan:', error)
    }
  }

  const totalTarget = targetTabungan.reduce((sum, item) => sum + item.target, 0)
  const totalTercapai = targetTabungan.reduce((sum, item) => sum + item.tercapai, 0)
  const totalAlokasiPersen = targetTabungan
    .filter(item => item.isActive)
    .reduce((sum, item) => sum + item.alokasiPersen, 0)

  const getStatusBadge = (item: TargetTabungan) => {
    const progress = (item.tercapai / item.target) * 100
    const isExpired = new Date(item.tanggalTarget) < new Date()
    
    if (progress >= 100) {
      return <Badge className="bg-green-900 text-green-200"><CheckCircle className="h-3 w-3 mr-1" />Tercapai</Badge>
    } else if (isExpired) {
      return <Badge className="bg-red-900 text-red-200"><Clock className="h-3 w-3 mr-1" />Kadaluarsa</Badge>
    } else if (item.isActive) {
      return <Badge className="bg-blue-900 text-blue-200">Aktif</Badge>
    } else {
      return <Badge variant="secondary">Non-aktif</Badge>
    }
  }

  if (!activeProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Silakan pilih profil terlebih dahulu</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Target Tabungan</h1>
          <p className="text-gray-400">Kelola target tabungan dan alokasi otomatis</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gray-700 hover:bg-gray-600">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Target
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-gray-200">
            <DialogHeader>
              <DialogTitle>{editingTarget ? 'Edit Target Tabungan' : 'Tambah Target Tabungan'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Target *</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-gray-200"
                  placeholder="Masukkan nama target"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Textarea
                  id="deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-gray-200"
                  placeholder="Masukkan deskripsi (opsional)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target">Target Nominal *</Label>
                <Input
                  id="target"
                  type="number"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-gray-200"
                  placeholder="Masukkan target nominal"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tanggalMulai">Tanggal Mulai *</Label>
                  <Input
                    id="tanggalMulai"
                    type="date"
                    value={formData.tanggalMulai}
                    onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-gray-200"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tanggalTarget">Tanggal Target *</Label>
                  <Input
                    id="tanggalTarget"
                    type="date"
                    value={formData.tanggalTarget}
                    onChange={(e) => setFormData({ ...formData, tanggalTarget: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-gray-200"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alokasiPersen">Alokasi Otomatis (%)</Label>
                <Input
                  id="alokasiPersen"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.alokasiPersen}
                  onChange={(e) => setFormData({ ...formData, alokasiPersen: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-gray-200"
                  placeholder="Persentase alokasi dari kas masuk"
                />
                <p className="text-xs text-gray-400">
                  Total alokasi aktif saat ini: {totalAlokasiPersen}%
                </p>
              </div>
              
              <Button type="submit" className="w-full bg-gray-700 hover:bg-gray-600">
                {editingTarget ? 'Update' : 'Simpan'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Warning if total alokasi > 100 */}
      {totalAlokasiPersen > 100 && (
        <Card className="bg-red-900 border-red-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-200">
              <Target className="h-5 w-5" />
              <span className="font-medium">Peringatan:</span>
              <span>Total alokasi otomatis melebihi 100% ({totalAlokasiPersen}%)</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Target</CardTitle>
            <Target className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Rp {totalTarget.toLocaleString('id-ID')}</div>
            <p className="text-xs text-blue-400">{targetTabungan.length} target</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Tercapai</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Rp {totalTercapai.toLocaleString('id-ID')}</div>
            <p className="text-xs text-green-400">
              {totalTarget > 0 ? Math.round((totalTercapai / totalTarget) * 100) : 0}% keseluruhan
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Sisa Target</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              Rp {Math.max(0, totalTarget - totalTercapai).toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-orange-400">Belum tercapai</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Alokasi Aktif</CardTitle>
            <PiggyBank className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalAlokasiPersen}%</div>
            <p className="text-xs text-purple-400">Dari kas masuk</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Daftar Target Tabungan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Nama Target</TableHead>
                  <TableHead className="text-gray-300">Periode</TableHead>
                  <TableHead className="text-gray-300">Progress</TableHead>
                  <TableHead className="text-gray-300">Alokasi</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {targetTabungan.map((item) => {
                  const progress = Math.min((item.tercapai / item.target) * 100, 100)
                  const sisa = item.target - item.tercapai
                  
                  return (
                    <TableRow key={item.id} className="border-gray-700">
                      <TableCell>
                        <div>
                          <p className="text-white font-medium">{item.nama}</p>
                          {item.deskripsi && (
                            <p className="text-gray-400 text-sm">{item.deskripsi}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-200">
                        <div className="text-sm">
                          <p>{new Date(item.tanggalMulai).toLocaleDateString('id-ID')}</p>
                          <p className="text-gray-400">s/d</p>
                          <p>{new Date(item.tanggalTarget).toLocaleDateString('id-ID')}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Progress 
                            value={progress} 
                            className="h-2 bg-gray-700"
                          />
                          <div className="text-sm text-gray-200">
                            <p>Rp {item.tercapai.toLocaleString('id-ID')}</p>
                            <p className="text-gray-400">dari Rp {item.target.toLocaleString('id-ID')}</p>
                            <p className="text-xs text-gray-400">{progress.toFixed(1)}% tercapai</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-200">
                        {item.alokasiPersen > 0 ? (
                          <Badge variant="secondary" className="bg-purple-900 text-purple-200">
                            {item.alokasiPersen}%
                          </Badge>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(item)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleActive(item)}
                            className={`${
                              item.isActive 
                                ? 'text-green-400 hover:text-green-300' 
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {item.isActive ? '✓' : '○'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(item)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            
            {targetTabungan.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">Belum ada target tabungan</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}