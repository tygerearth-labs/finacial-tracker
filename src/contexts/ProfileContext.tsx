'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Profil } from '@prisma/client'

interface ProfileContextType {
  profiles: Profil[]
  activeProfile: Profil | null
  loading: boolean
  setActiveProfile: (profile: Profil | null) => void
  refreshProfiles: () => Promise<void>
  addProfile: (profile: Omit<Profil, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateProfile: (id: string, profile: Partial<Profil>) => Promise<void>
  deleteProfile: (id: string) => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

// Session management key
const ACTIVE_PROFILE_KEY = 'financial-tracker-active-profile'

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profil[]>([])
  const [activeProfile, setActiveProfileState] = useState<Profil | null>(null)
  const [loading, setLoading] = useState(true)

  // Load active profile from session on mount
  useEffect(() => {
    const loadActiveProfileFromSession = () => {
      if (typeof window !== 'undefined') {
        try {
          const savedProfileId = localStorage.getItem(ACTIVE_PROFILE_KEY)
          if (savedProfileId) {
            return savedProfileId
          }
        } catch (error) {
          console.error('Error loading active profile from session:', error)
        }
      }
      return null
    }

    const initializeProfiles = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/profiles')
        if (response.ok) {
          const data = await response.json()
          setProfiles(data)
          
          // Try to load active profile from session
          const savedProfileId = loadActiveProfileFromSession()
          
          if (savedProfileId) {
            // Find the profile in the loaded profiles
            const savedProfile = data.find((p: Profil) => p.id === savedProfileId)
            if (savedProfile) {
              setActiveProfileState(savedProfile)
              // Update active status in database
              await fetch(`/api/profiles/${savedProfile.id}/activate`, {
                method: 'PATCH'
              })
              return
            }
          }
          
          // Set active profile if none exists and there are profiles
          if (data.length > 0) {
            const active = data.find((p: Profil) => p.isActive) || data[0]
            setActiveProfileState(active)
            saveActiveProfileToSession(active.id)
          }
        }
      } catch (error) {
        console.error('Error fetching profiles:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeProfiles()
  }, [])

  const saveActiveProfileToSession = (profileId: string) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ACTIVE_PROFILE_KEY, profileId)
      } catch (error) {
        console.error('Error saving active profile to session:', error)
      }
    }
  }

  const clearActiveProfileFromSession = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(ACTIVE_PROFILE_KEY)
      } catch (error) {
        console.error('Error clearing active profile from session:', error)
      }
    }
  }

  const setActiveProfile = async (profile: Profil | null) => {
    setActiveProfileState(profile)
    
    if (profile) {
      // Save to session
      saveActiveProfileToSession(profile.id)
      
      // Update active status in database
      try {
        await fetch(`/api/profiles/${profile.id}/activate`, {
          method: 'PATCH'
        })
        await refreshProfiles()
      } catch (error) {
        console.error('Error setting active profile:', error)
      }
    } else {
      // Clear from session
      clearActiveProfileFromSession()
    }
  }

  const refreshProfiles = async () => {
    try {
      const response = await fetch('/api/profiles')
      if (response.ok) {
        const data = await response.json()
        setProfiles(data)
        
        // Maintain active profile if it still exists
        if (activeProfile) {
          const stillExists = data.find((p: Profil) => p.id === activeProfile.id)
          if (!stillExists) {
            // Active profile was deleted, clear session and set new active
            clearActiveProfileFromSession()
            if (data.length > 0) {
              const newActive = data.find((p: Profil) => p.isActive) || data[0]
              setActiveProfileState(newActive)
              saveActiveProfileToSession(newActive.id)
            } else {
              setActiveProfileState(null)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profiles:', error)
    }
  }

  const addProfile = async (profile: Omit<Profil, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      if (response.ok) {
        await refreshProfiles()
      }
    } catch (error) {
      console.error('Error adding profile:', error)
    }
  }

  const updateProfile = async (id: string, profile: Partial<Profil>) => {
    try {
      const response = await fetch(`/api/profiles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      if (response.ok) {
        await refreshProfiles()
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const deleteProfile = async (id: string) => {
    try {
      const response = await fetch(`/api/profiles/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        // Clear from session if this was the active profile
        if (activeProfile?.id === id) {
          clearActiveProfileFromSession()
          setActiveProfileState(null)
        }
        await refreshProfiles()
      }
    } catch (error) {
      console.error('Error deleting profile:', error)
    }
  }

  return (
    <ProfileContext.Provider value={{
      profiles,
      activeProfile,
      loading,
      setActiveProfile,
      refreshProfiles,
      addProfile,
      updateProfile,
      deleteProfile
    }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}