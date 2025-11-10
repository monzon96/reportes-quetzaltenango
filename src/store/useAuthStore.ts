import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  userRole: 'user' | 'admin' | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
  fetchUserRole: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userRole: null,
  loading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({ user: session?.user ?? null })
      
      if (session?.user) {
        await get().fetchUserRole()
      }
      
      set({ loading: false })

      supabase.auth.onAuthStateChange(async (_event, session) => {
        set({ user: session?.user ?? null })
        if (session?.user) {
          await get().fetchUserRole()
        } else {
          set({ userRole: null })
        }
      })
    } catch (error) {
      console.error('Error initializing auth:', error)
      set({ loading: false })
    }
  },

  fetchUserRole: async () => {
  try {
    const { user } = get()
    console.log('🔍 Fetching role for user:', user?.email)
    
    if (!user) {
      console.log('❌ No user found')
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('📊 Profile data:', data)
    console.log('⚠️ Error:', error)

    if (error) throw error

    console.log('✅ Setting role to:', data.role)
    set({ userRole: data.role as 'user' | 'admin' })
  } catch (error) {
    console.error('💥 Error fetching user role:', error)
    set({ userRole: 'user' })
  }
},

  signUp: async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  },

  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    set({ user: null, userRole: null })
  },
}))