import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Profil {
  id: string
  nama: string
  deskripsi?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ProfilStore {
  profilAktif: Profil | null
  semuaProfil: Profil[]
  setProfilAktif: (profil: Profil | null) => void
  setSemuaProfil: (profil: Profil[]) => void
  tambahProfil: (profil: Profil) => void
  updateProfil: (id: string, profil: Partial<Profil>) => void
  hapusProfil: (id: string) => void
}

export const useProfilStore = create<ProfilStore>()(
  persist(
    (set, get) => ({
      profilAktif: null,
      semuaProfil: [],
      
      setProfilAktif: (profil) => {
        set({ profilAktif: profil })
      },
      
      setSemuaProfil: (profil) => {
        set({ semuaProfil: profil })
        // Set profil aktif jika belum ada
        const { profilAktif } = get()
        if (!profilAktif && profil.length > 0) {
          const activeProfil = profil.find(p => p.isActive) || profil[0]
          set({ profilAktif: activeProfil })
        }
      },
      
      tambahProfil: (profil) => {
        const { semuaProfil } = get()
        const updatedProfil = [...semuaProfil, profil]
        set({ semuaProfil: updatedProfil })
      },
      
      updateProfil: (id: string, updatedProfil: Partial<Profil>) => {
        const { semuaProfil, profilAktif } = get()
        const updatedList = semuaProfil.map(p => 
          p.id === id ? { ...p, ...updatedProfil } : p
        )
        set({ 
          semuaProfil: updatedList,
          profilAktif: profilAktif?.id === id ? { ...profilAktif, ...updatedProfil } : profilAktif
        })
      },
      
      hapusProfil: (id: string) => {
        const { semuaProfil, profilAktif } = get()
        const updatedList = semuaProfil.filter(p => p.id !== id)
        const newActiveProfil = profilAktif?.id === id 
          ? (updatedList.length > 0 ? updatedList[0] : null)
          : profilAktif
        
        set({ 
          semuaProfil: updatedList,
          profilAktif: newActiveProfil
        })
      }
    }),
    {
      name: 'profil-storage',
    }
  )
)