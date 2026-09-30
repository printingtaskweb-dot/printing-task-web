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
}

const AuthContext = createContext<AuthContextType | null>(null)
const LOCAL_STORAGE_KEY = 'skillbridge_auth_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (!cached) return null
      const parsed = JSON.parse(cached) as AuthUser
      // Never restore a demo user from cache
      if (parsed?.id?.startsWith('demo-')) return null
      return parsed
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

  /**
   * Fetch the user's profile from the database.
   * Role is ALWAYS read from the database — never from auth metadata.
   * This prevents any client-side manipulation of role.
   */
  const fetchProfile = async (authUser: any): Promise<AuthUser | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, avatar_url, onboarding_completed')
        .eq('id', authUser.id)
        .maybeSingle()

      if (error || !data) return null

      // Role comes ONLY from DB, never from metadata
      return {
        id: data.id,
        email: data.email,
        role: data.role as 'student' | 'business_owner' | 'admin',
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        onboarding_completed: data.onboarding_completed ?? false,
      }
    } catch {
      return null
    }
  }

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const profile = await fetchProfile(session.user)
      saveUser(profile)
    } else {
      saveUser(null)
    }
  }

  useEffect(() => {
    // Session check on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user)
        saveUser(profile)
      } else {
        saveUser(null)
      }
      setIsLoading(false)
    })

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (
        (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') &&
        session?.user
      ) {
        const profile = await fetchProfile(session.user)
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
      const profile = await fetchProfile(data.user)
      saveUser(profile)
    }
    return { error }
  }

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'student' | 'business_owner'
  ) => {
    // Only 'student' or 'business_owner' can be passed here.
    // 'admin' role can only be granted via database SQL — never via signup.
    const safeRole: 'student' | 'business_owner' =
      role === 'business_owner' ? 'business_owner' : 'student'

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: safeRole,
        },
      },
    })
    if (data?.user) {
      const profile = await fetchProfile(data.user)
      saveUser(profile)
    }
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    saveUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
