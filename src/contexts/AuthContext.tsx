import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { AuthUser } from '@/types'

export interface SignUpExtraData {
  category?: string
  headline?: string
  businessName?: string
  lookingFor?: string
}

export interface SignUpResult {
  user: any
  session: any
  error: Error | null
  emailConfirmationRequired: boolean
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: 'student' | 'business_owner',
    extraData?: SignUpExtraData
  ) => Promise<SignUpResult>
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
   * If the profile doesn't exist yet (e.g. database trigger didn't run),
   * safely create it so the user can continue smoothly.
   */
  const fetchProfile = async (authUser: any): Promise<AuthUser | null> => {
    if (!authUser?.id) return null

    try {
      // 1. Try reading from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, avatar_url, onboarding_completed')
        .eq('id', authUser.id)
        .maybeSingle()

      if (data) {
        return {
          id: data.id,
          email: data.email,
          role: data.role as 'student' | 'business_owner' | 'admin',
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          onboarding_completed: data.onboarding_completed ?? false,
        }
      }

      // 2. If row not found in profiles, attempt to create it
      const meta = authUser.user_metadata || {}
      const role = meta.role === 'business_owner' ? 'business_owner' : 'student'
      const fullName = meta.full_name || authUser.email?.split('@')[0] || 'User'

      const { data: created } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          email: authUser.email,
          full_name: fullName,
          role: role,
          onboarding_completed: false,
        })
        .select('id, email, full_name, role, avatar_url, onboarding_completed')
        .maybeSingle()

      if (created) {
        return {
          id: created.id,
          email: created.email,
          role: created.role as 'student' | 'business_owner' | 'admin',
          full_name: created.full_name,
          avatar_url: created.avatar_url,
          onboarding_completed: created.onboarding_completed ?? false,
        }
      }

      // 3. Fallback user object if database is temporarily unreachable
      return {
        id: authUser.id,
        email: authUser.email || '',
        role: role,
        full_name: fullName,
        avatar_url: null,
        onboarding_completed: false,
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
    // Safety timeout: ensure loading screen is dismissed within 1s even on slow connections
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(timer)
      if (session?.user) {
        const profile = await fetchProfile(session.user)
        saveUser(profile)
      } else {
        saveUser(null)
      }
      setIsLoading(false)
    }).catch(err => {
      clearTimeout(timer)
      console.warn('Auth getSession warning:', err)
      setIsLoading(false)
    })

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
    role: 'student' | 'business_owner',
    extraData?: SignUpExtraData
  ): Promise<SignUpResult> => {
    const safeRole: 'student' | 'business_owner' =
      role === 'business_owner' ? 'business_owner' : 'student'

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: safeRole,
          category: extraData?.category || '',
          headline: extraData?.headline || '',
          business_name: extraData?.businessName || '',
          looking_for: extraData?.lookingFor || '',
        },
      },
    })

    if (error) {
      return { user: null, session: null, error, emailConfirmationRequired: false }
    }

    const emailConfirmationRequired = !data?.session && !!data?.user

    if (data?.session && data?.user) {
      const profile = await fetchProfile(data.user)
      saveUser(profile)

      // Initialize category and role records if possible
      if (safeRole === 'student' && extraData?.category) {
        try {
          await supabase.from('student_profiles').upsert({
            user_id: data.user.id,
            headline: extraData.headline || `${extraData.category} Enthusiast`,
            experience_level: 'fresher',
          })
        } catch (e) {
          console.warn('Initial student profile notice:', e)
        }
      } else if (safeRole === 'business_owner' && extraData?.businessName) {
        try {
          const slug = extraData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6)
          await supabase.from('business_profiles').upsert({
            user_id: data.user.id,
            business_name: extraData.businessName,
            owner_name: fullName,
            slug,
            category: extraData.category || '',
            looking_for: extraData.lookingFor ? [extraData.lookingFor] : [],
            verification_status: 'verified',
          })
        } catch (e) {
          console.warn('Initial business profile notice:', e)
        }
      }
    }

    return {
      user: data?.user || null,
      session: data?.session || null,
      error: null,
      emailConfirmationRequired,
    }
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
