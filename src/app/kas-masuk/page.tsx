'use client'

import { useState, useEffect } from 'react'
import { useProfile } from '@/contexts/ProfileContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Tag,
  X
} from 'lucide-react'

interface KategoriPemasukan {
  id: string
  nama: string
  deskripsi?: string
  warna: string
  _count: { transaksi: number }
}

interface Transaksi {
  id: string
  jenis: string
  nominal: number
  deskripsi?: string
  tanggal: string
  kategoriPemasukan?: { nama: string; warna: string }
}

export default function KasMasuk() {
  const { activeProfile } = useProfile()
  const [transactions, setTransactions] = useState<Transaksi[]>([])
  const [categories, setCategories] = useState<KategoriPemasukan[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaksi | null>(null)
  const [editingCategory, setEditingCategory] = useState<KategoriPemasukan | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    nominal: '',
    deskripsi: '',
    tanggal: new Date().toISOString().split('T')[0],
    kategoriPemasukanId: ''
  })

  const [categoryForm, setCategoryForm] = useState({
    nama: '',
    deskripsi: '',
    warna: '#10b981'
  })

  const fetchTransactions = async () => {
    if (!activeProfile) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/transactions?profilId=${activeProfile.id}&jenis=MASUK`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    if (!activeProfile) return
    
    try {
      const response = await fetch(`/api/categories?profilId=${activeProfile.id}&jenis=MASUK`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    if (activeProfile) {
      fetchTransactions()
      fetchCategories()
    }
  }, [activeProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeProfile || !formData.nominal || !formData.kategoriPemasukanId) return

    try {
      const url = editingTransaction 
        ? `/api/transactions/${editingTransaction.id}`
        : '/api/transactions'
      
      const method = editingTransaction ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenis: 'MASUK',
          nominal: formData.nominal,
          deskripsi: formData.deskripsi,
          tanggal: formData.tanggal,
          kategoriPemasukanId: formData.kategoriPemasukanId,
          profilId: activeProfile.id
        })
      })

      if (response.ok) {
        setFormData({
          nominal: '',
          deskripsi: '',
          tanggal: new Date().toISOString().split('T')[0],
          kategoriPemasukanId: ''
        })
        setShowAddForm(false)
        setEditingTransaction(null)
        fetchTransactions()
      }
    } catch (error) {
      console.error('Error saving transaction:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchTransactions()
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  const handleEdit = (transaction: Transaksi) => {
    setEditingTransaction(transaction)
    setFormData({
      nominal: transaction.nominal.toString(),
      deskripsi: transaction.deskripsi || '',
      tanggal: new Date(transaction.tanggal).toISOString().split('T')[0],
      kategoriPemasukanId: transaction.kategoriPemasukan?.id || ''
    })
    setShowAddForm(true)
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeProfile || !categoryForm.nama) return

    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}?jenis=MASUK`
        : '/api/categories'
      
      const method = editingCategory ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: categoryForm.nama,
          deskripsi: categoryForm.deskripsi,
          warna: categoryForm.warna,
          profilId: activeProfile.id,
          jenis: 'MASUK'
        })
      })

      if (response.ok) {
        setCategoryForm({ nama: '', deskripsi: '', warna: '#10b981' })
        setShowCategoryForm(false)
        setEditingCategory(null)
        fetchCategories()
      }
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini? Semua transaksi terkait akan kehilangan kategori.')) return

    try {
      const response = await fetch(`/api/categories/${id}?jenis=MASUK`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchCategories()
        fetchTransactions()
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const handleEditCategory = (category: KategoriPemasukan) => {
    setEditingCategory(category)
    setCategoryForm({
      nama: category.nama,
      deskripsi: category.deskripsi || '',
      warna: category.warna
    })
    setShowCategoryForm(true)
  }

  const totalPemasukan = transactions.reduce((sum, t) => sum + t.nominal, 0)

  if (!activeProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-200 mb-2">Tidak Ada Profil Aktif</h3>
          <p className="text-gray-400">Silakan pilih atau buat profil terlebih dahulu</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Kas Masuk</h1>
          <p className="text-gray-400">Catat semua pemasukan Anda</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700">
                <Tag className="h-4 w-4 mr-2" />
                Kategori
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-gray-200">
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'Edit Kategori' : 'Tambah Kategori Pemasukan'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <Label htmlFor="namaKategori">Nama Kategori</Label>
                  <Input
                    id="namaKategori"
                    value={categoryForm.nama}
                    onChange={(e) => setCategoryForm({ ...categoryForm, nama: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-gray-200"
                    placeholder="Masukkan nama kategori"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="deskripsiKategori">Deskripsi</Label>
                  <Textarea
                    id="deskripsiKategori"
                    value={categoryForm.deskripsi}
                    onChange={(e) => setCategoryForm({ ...categoryForm, deskripsi: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-gray-200"
                    placeholder="Masukkan deskripsi (opsional)"
                  />
                </div>
                <div>
                  <Label htmlFor="warna">Warna</Label>
                  <Input
                    id="warna"
                    type="color"
                    value={categoryForm.warna}
                    onChange={(e) => setCategoryForm({ ...categoryForm, warna: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-gray-200 h-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                    {editingCategory ? 'Update' : 'Tambah'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowCategoryForm(false)
                      setEditingCategory(null)
                      setCategoryForm({ nama: '', deskripsi: '', warna: '#10b981' })
                    }}
                    className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pemasukan
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-gray-200">
              <DialogHeader>
                <DialogTitle>{editingTransaction ? 'Edit' : 'Tambah'} Pemasukan</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nominal">Nominal</Label>
                  <Input
                    id="nominal"
                    type="number"
                    value={formData.nominal}
                    onChange={(e) => setFormData({ ...formData, nominal: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-gray-200"
                    placeholder="Masukkan nominal"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="kategori">Kategori</Label>
                  <Select value={formData.kategoriPemasukanId} onValueChange={(value) => setFormData({ ...formData, kategoriPemasukanId: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-200">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {categories.map((kategori) => (
                        <SelectItem key={kategori.id} value={kategori.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: kategori.warna }} />
                            {kategori.nama}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tanggal">Tanggal</Label>
                  <Input
                    id="tanggal"
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-gray-200"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="deskripsi">Deskripsi</Label>
                  <Textarea
                    id="deskripsi"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-gray-200"
                    placeholder="Masukkan deskripsi (opsional)"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                    {editingTransaction ? 'Update' : 'Simpan'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingTransaction(null)
                      setFormData({
                        nominal: '',
                        deskripsi: '',
                        tanggal: new Date().toISOString().split('T')[0],
                        kategoriPemasukanId: ''
                      })
                    }}
                    className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Rp {totalPemasukan.toLocaleString('id-ID')}</div>
            <p className="text-xs text-green-400">{transactions.length} transaksi</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Jumlah Kategori</CardTitle>
            <Tag className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{categories.length}</div>
            <p className="text-xs text-blue-400">Aktif</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Rata-rata</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              Rp {transactions.length > 0 ? Math.round(totalPemasukan / transactions.length).toLocaleString('id-ID') : 0}
            </div>
            <p className="text-xs text-purple-400">per transaksi</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Management */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Kategori Pemasukan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((kategori) => (
              <div key={kategori.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: kategori.warna }} />
                  <div>
                    <p className="text-sm font-medium text-white">{kategori.nama}</p>
                    <p className="text-xs text-gray-400">{kategori._count.transaksi} transaksi</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditCategory(kategori)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteCategory(kategori.id)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="col-span-full text-center py-8">
                <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Belum ada kategori</p>
                <p className="text-sm text-gray-500">Tambah kategori untuk mengelompokkan pemasukan</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Riwayat Pemasukan</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-32 animate-pulse"></div>
                    <div className="h-3 bg-gray-700 rounded w-24 animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-20 animate-pulse"></div>
                    <div className="h-3 bg-gray-700 rounded w-16 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {transaction.kategoriPemasukan && (
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: transaction.kategoriPemasukan.warna }} />
                      )}
                      <p className="text-sm font-medium text-white">
                        {transaction.deskripsi || 'Tanpa deskripsi'}
                      </p>
                      {transaction.kategoriPemasukan && (
                        <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                          {transaction.kategoriPemasukan.nama}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(transaction.tanggal).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-400">
                        +Rp {transaction.nominal.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(transaction)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(transaction.id)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Belum ada transaksi pemasukan</p>
                  <p className="text-sm text-gray-500">Tambah pemasukan pertama Anda</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}