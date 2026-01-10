'use client'

import { useState } from 'react'
import { useProfile } from '@/contexts/ProfileContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, Settings, Plus, LogOut, ChevronDown, CheckCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MobileNavigation } from '@/components/mobile-navigation'

export function Navbar() {
  const { profiles, activeProfile, setActiveProfile, addProfile, loading } = useProfile()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newProfil, setNewProfil] = useState({ nama: '', deskripsi: '' })

  const handleAddProfil = async () => {
    if (newProfil.nama.trim()) {
      await addProfile({
        nama: newProfil.nama,
        deskripsi: newProfil.deskripsi,
        isActive: false
      })
      setNewProfil({ nama: '', deskripsi: '' })
      setIsAddDialogOpen(false)
    }
  }

  const handleSelectProfil = (profil: any) => {
    setActiveProfile(profil)
  }

  if (loading) {
    return (
      <nav className="bg-black border-b border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white">Financial Tracker</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gray-800 rounded-full animate-pulse"></div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-black border-b border-gray-800 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <MobileNavigation />
          <h1 className="text-xl font-bold text-white">Financial Tracker</h1>
          {activeProfile && (
            <Badge variant="secondary" className="bg-green-900 text-green-200 border-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              Sesi Aktif
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {activeProfile && (
            <div className="hidden sm:block">
              <Badge variant="secondary" className="bg-gray-800 text-gray-200">
                {activeProfile.nama}
              </Badge>
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 bg-gray-700">
                  <AvatarFallback className="text-gray-200">
                    {activeProfile ? (
                      activeProfile.nama.charAt(0).toUpperCase()
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="absolute -bottom-1 -right-1 h-3 w-3 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700" align="end" forceMount>
              <DropdownMenuLabel className="text-gray-200">Profil Saya</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              
              {profiles.map((profil) => (
                <DropdownMenuItem
                  key={profil.id}
                  onClick={() => handleSelectProfil(profil)}
                  className={`text-gray-200 hover:bg-gray-800 cursor-pointer ${
                    activeProfile?.id === profil.id ? 'bg-gray-800' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Avatar className="h-6 w-6 bg-gray-700">
                      <AvatarFallback className="text-xs text-gray-200">
                        {profil.nama.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{profil.nama}</p>
                        {activeProfile?.id === profil.id && (
                          <CheckCircle className="h-3 w-3 text-green-400" />
                        )}
                      </div>
                      {profil.deskripsi && (
                        <p className="text-xs text-gray-400">{profil.deskripsi}</p>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator className="bg-gray-700" />
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <DropdownMenuItem 
                    className="text-gray-200 hover:bg-gray-800 cursor-pointer"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Profil
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 text-gray-200">
                  <DialogHeader>
                    <DialogTitle>Tambah Profil Baru</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nama">Nama Profil</Label>
                      <Input
                        id="nama"
                        value={newProfil.nama}
                        onChange={(e) => setNewProfil({ ...newProfil, nama: e.target.value })}
                        className="bg-gray-800 border-gray-600 text-gray-200"
                        placeholder="Masukkan nama profil"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deskripsi">Deskripsi</Label>
                      <Textarea
                        id="deskripsi"
                        value={newProfil.deskripsi}
                        onChange={(e) => setNewProfil({ ...newProfil, deskripsi: e.target.value })}
                        className="bg-gray-800 border-gray-600 text-gray-200"
                        placeholder="Masukkan deskripsi profil (opsional)"
                      />
                    </div>
                    <Button onClick={handleAddProfil} className="w-full bg-gray-700 hover:bg-gray-600">
                      Tambah Profil
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <DropdownMenuItem className="text-gray-200 hover:bg-gray-800">
                <Settings className="mr-2 h-4 w-4" />
                Pengaturan
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-gray-700" />
              
              <DropdownMenuItem className="text-gray-200 hover:bg-gray-800">
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}