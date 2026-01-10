import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MenuStore {
  menuTerlihat: {
    dashboard: boolean
    kasMasuk: boolean
    kasKeluar: boolean
    targetTabungan: boolean
    laporan: boolean
  }
  toggleMenu: (menu: keyof typeof menuTerlihat) => void
  setMenuVisibility: (menu: keyof typeof menuTerlihat, visible: boolean) => void
}

const menuAwal = {
  dashboard: true,
  kasMasuk: true,
  kasKeluar: true,
  targetTabungan: true,
  laporan: true
}

export const useMenuStore = create<MenuStore>()(
  persist(
    (set) => ({
      menuTerlihat: menuAwal,
      
      toggleMenu: (menu) => {
        set((state) => ({
          menuTerlihat: {
            ...state.menuTerlihat,
            [menu]: !state.menuTerlihat[menu]
          }
        }))
      },
      
      setMenuVisibility: (menu, visible) => {
        set((state) => ({
          menuTerlihat: {
            ...state.menuTerlihat,
            [menu]: visible
          }
        }))
      }
    }),
    {
      name: 'menu-storage',
    }
  )
)