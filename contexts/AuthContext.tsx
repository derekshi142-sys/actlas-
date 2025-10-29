'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '@/lib/firebase'
import { loadApiKeysFromFirestore } from '@/lib/apiKeysService'
import { 
  setOpenAIUserId, 
  loadApiKeyFromFirestore as loadOpenAIKey 
} from '@/lib/openai'
import { 
  setSerperUserId, 
  loadSerperKeyFromFirestore as loadSerperKey 
} from '@/lib/serper'
import { 
  setHotelBedsUserId, 
  loadHotelBedsCredentialsFromFirestore as loadHotelBedsCredentials 
} from '@/lib/hotelbeds'

interface AuthContextType {
  user: User | null
  loading: boolean
  signup: (email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signup: async () => {},
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      if (user) {
        // Set user IDs for all API key services
        setOpenAIUserId(user.uid)
        setSerperUserId(user.uid)
        setHotelBedsUserId(user.uid)
        
        // Load API keys from Firestore
        try {
          const apiKeys = await loadApiKeysFromFirestore(user.uid)
          if (apiKeys) {
            // Load each API key into its respective service
            loadOpenAIKey(apiKeys.openai)
            loadSerperKey(apiKeys.serper)
            loadHotelBedsCredentials(apiKeys.hotelbedsKey, apiKeys.hotelbedsSecret)
            console.log('✅ API keys loaded from Firestore and synced to localStorage')
          }
        } catch (error) {
          console.error('Error loading API keys from Firestore:', error)
        }
      } else {
        // Clear user IDs when logged out
        setOpenAIUserId(null)
        setSerperUserId(null)
        setHotelBedsUserId(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signup = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not configured')
    await createUserWithEmailAndPassword(auth, email, password)
  }

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not configured')
    await signInWithEmailAndPassword(auth, email, password)
  }

  const loginWithGoogle = async () => {
    if (!auth) throw new Error('Firebase not configured')
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const logout = async () => {
    if (!auth) throw new Error('Firebase not configured')
    await signOut(auth)
  }

  const value = {
    user,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

