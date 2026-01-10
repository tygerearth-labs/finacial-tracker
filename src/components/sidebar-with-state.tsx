'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'

export function SidebarWithState() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Sidebar
      activeMenu={activeMenu}
      onMenuChange={setActiveMenu}
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
    />
  );
}