import { useState, useEffect } from 'react'
import { Models } from 'react-native-appwrite'
import { authService } from '@/services/auth'

/**
 * Custom hook for managing authentication state
 * Provides current user and auth status
 */
export function useAuth() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setLoading(true)
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      setError(null)
    } catch (err: any) {
      console.error('Auth check error:', err)
      setError(err.message)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await authService.signOut()
      setUser(null)
    } catch (err: any) {
      console.error('Sign out error:', err)
      throw err
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signOut,
    refreshAuth: checkAuth,
  }
}
