'use client'

import { useState, useEffect } from 'react'
import { useProfile } from '@/contexts/ProfileContext'
import { Sidebar } from '@/components/sidebar'

interface AppWrapperProps {
  children: React.ReactNode
}

export function AppWrapper({ children }: AppWrapperProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { activeProfile } = useProfile()

  // Show sidebar only on desktop and when there's an active profile
  const [showSidebar, setShowSidebar] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024
      setShowSidebar(activeProfile && isDesktop)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [activeProfile])

  return (
    <div className="flex flex-1">
      {showSidebar && (
        <Sidebar 
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      )}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}