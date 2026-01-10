'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useProfile } from '@/contexts/ProfileContext'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  FileText,
  Menu
} from 'lucide-react'

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { activeProfile } = useProfile()

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
      href: '/'
    },
    {
      id: 'kasMasuk',
      label: 'Kas Masuk',
      icon: <TrendingUp className="h-4 w-4" />,
      href: '/kas-masuk'
    },
    {
      id: 'kasKeluar',
      label: 'Kas Keluar',
      icon: <TrendingDown className="h-4 w-4" />,
      href: '/kas-keluar'
    },
    {
      id: 'targetTabungan',
      label: 'Target Tabungan',
      icon: <Target className="h-4 w-4" />,
      href: '/target-tabungan'
    },
    {
      id: 'laporan',
      label: 'Laporan',
      icon: <FileText className="h-4 w-4" />,
      href: '/laporan'
    }
  ]

  const getActiveMenu = () => {
    if (pathname === '/' || pathname === '/dashboard') return 'dashboard'
    if (pathname === '/kas-masuk') return 'kasMasuk'
    if (pathname === '/kas-keluar') return 'kasKeluar'
    if (pathname === '/target-tabungan') return 'targetTabungan'
    if (pathname === '/laporan') return 'laporan'
    return 'dashboard'
  }

  const activeMenu = getActiveMenu()

  const handleNavigation = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  // Only show on mobile and when there's an active profile
  if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
    return null
  }

  if (!activeProfile) {
    return null
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden text-gray-400 hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-black border-gray-800 text-white w-64">
        <SheetHeader>
          <SheetTitle className="text-white">Menu</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeMenu === item.id ? "secondary" : "ghost"}
              className={`w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 ${
                activeMenu === item.id ? "bg-gray-800 text-white" : ""
              }`}
              onClick={() => handleNavigation(item.href)}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}