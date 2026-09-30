import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { AuthUser } from '@/types'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName: string, role: 'student' | 'business_owner') => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  setDemoUser: (role: 'student' | 'business_owner' | 'admin') => void
}

const AuthContext = createContext<AuthContextType | null>(null)
const LOCAL_STORAGE_KEY = 'skillbridge_auth_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(true)

  const saveUser = (u: AuthUser | null) => {
    setUser(u)
    if (u) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(u))
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    }
  }

  const fetchOrCreateProfile = async (authUser: any): Promise<AuthUser> => {
    const meta = authUser.user_metadata || {}
    const role = meta.role || 'student'
    const fullName = meta.full_name || authUser.email?.split('@')[0] || 'User'

    try {
      // 1. Try to fetch existing profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

      if (data) {
        return {
          id: data.id,
          email: data.email,
          role: data.role,
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          onboarding_completed: data.onboarding_completed ?? false,
        }
      }

      // 2. If no profile exists, create one via upsert
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          email: authUser.email,
          full_name: fullName,
          role: role as any,
          onboarding_completed: false,
        })
        .select()
        .single()

      if (newProfile) {
        return {
          id: newProfile.id,
          email: newProfile.email,
          role: newProfile.role,
          full_name: newProfile.full_name,
          avatar_url: newProfile.avatar_url,
          onboarding_completed: newProfile.onboarding_completed ?? false,
        }
      }
    } catch (err) {
      console.warn('Profile sync fallback:', err)
    }

    // 3. Fallback to auth session metadata if DB fails
    return {
      id: authUser.id,
      email: authUser.email || '',
      role: role as 'student' | 'business_owner' | 'admin',
      full_name: fullName,
      avatar_url: null,
      onboarding_completed: true,
    }
  }

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const profile = await fetchOrCreateProfile(session.user)
      saveUser(profile)
    } else if (!user?.id.startsWith('demo-')) {
      saveUser(null)
    }
  }

  useEffect(() => {
    // Session check on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchOrCreateProfile(session.user)
        saveUser(profile)
      } else if (!user?.id.startsWith('demo-')) {
        saveUser(null)
      }
      setIsLoading(false)
    })

    // Auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && session?.user) {
        const profile = await fetchOrCreateProfile(session.user)
        saveUser(profile)
      } else if (event === 'SIGNED_OUT') {
        saveUser(null)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (data?.user) {
      const profile = await fetchOrCreateProfile(data.user)
      saveUser(profile)
    }
    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string, role: 'student' | 'business_owner') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    })
    if (data?.user) {
      const profile = await fetchOrCreateProfile(data.user)
      saveUser(profile)
    }
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    saveUser(null)
  }

  // Demo user helper for instant local testing
  const setDemoUser = (role: 'student' | 'business_owner' | 'admin') => {
    const demo: AuthUser = {
      id: `demo-${role}-123`,
      email: `demo.${role}@skillbridge.com`,
      role,
      full_name: role === 'student' ? 'Alex Rivera (Demo)' : role === 'business_owner' ? 'Sarah Jenkins (Demo)' : 'System Admin (Demo)',
      avatar_url: null,
      onboarding_completed: true,
    }
    saveUser(demo)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, refreshUser, setDemoUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
