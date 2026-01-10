'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  FileText,
  Eye,
  EyeOff,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  isVisible: boolean
  onToggle: () => void
  isActive?: boolean
  href: string
}

function SidebarItem({ icon, label, isVisible, onToggle, isActive, href }: SidebarItemProps) {
  const router = useRouter()

  const handleClick = () => {
    if (isVisible) {
      router.push(href)
    }
  }

  return (
    <div className="flex items-center justify-between group">
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "flex-1 justify-start text-gray-300 hover:text-white hover:bg-gray-800",
          !isVisible && "opacity-50 cursor-not-allowed",
          isActive && "bg-gray-800 text-white"
        )}
        onClick={handleClick}
        disabled={!isVisible}
      >
        {icon}
        <span className="ml-2">{label}</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-200"
        onClick={onToggle}
      >
        {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
      </Button>
    </div>
  )
}

interface SidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
      isVisible: true,
      href: '/'
    },
    {
      id: 'kasMasuk',
      label: 'Kas Masuk',
      icon: <TrendingUp className="h-4 w-4" />,
      isVisible: true,
      href: '/kas-masuk'
    },
    {
      id: 'kasKeluar',
      label: 'Kas Keluar',
      icon: <TrendingDown className="h-4 w-4" />,
      isVisible: true,
      href: '/kas-keluar'
    },
    {
      id: 'targetTabungan',
      label: 'Target Tabungan',
      icon: <Target className="h-4 w-4" />,
      isVisible: true,
      href: '/target-tabungan'
    },
    {
      id: 'laporan',
      label: 'Laporan',
      icon: <FileText className="h-4 w-4" />,
      isVisible: true,
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

  return (
    <Card className={cn(
      "bg-black border-gray-800 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-white">Menu</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="text-gray-400 hover:text-white"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="space-y-2">
          {menuItems.map((item) => (
            <div key={item.id}>
              {!isCollapsed ? (
                <SidebarItem
                  icon={item.icon}
                  label={item.label}
                  isVisible={item.isVisible}
                  onToggle={() => {}} // Remove toggle functionality for now
                  isActive={activeMenu === item.id}
                  href={item.href}
                />
              ) : (
                <Button
                  variant={activeMenu === item.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-center text-gray-300 hover:text-white hover:bg-gray-800",
                    !item.isVisible && "opacity-50 cursor-not-allowed",
                    activeMenu === item.id && "bg-gray-800 text-white"
                  )}
                  onClick={() => item.isVisible && router.push(item.href)}
                  disabled={!item.isVisible}
                  title={item.label}
                >
                  {item.icon}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}