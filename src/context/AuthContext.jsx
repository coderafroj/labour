import { useEffect, useState, useCallback } from 'react'
import { account, teams, ID } from '../lib/appwrite'
import { ADMIN_TEAM_ID } from '../lib/constants'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true)
    try {
      // Check if returning from Google OAuth redirect with secret & userId in URL query params
      const urlParams = new URLSearchParams(window.location.search)
      const secret = urlParams.get('secret')
      const userId = urlParams.get('userId')

      let isOauth = false
      if (secret && userId) {
        isOauth = true
        try {
          // Create session locally using the OAuth secret and userId
          await account.createSession(userId, secret)
        } catch {
          // If session creation fails or session already exists, proceed to get()
        }
        // Clean secret and userId from address bar for security & cleanliness
        const cleanUrl = window.location.origin + window.location.pathname
        window.history.replaceState({}, document.title, cleanUrl)
      }

      let me = await account.get().catch(() => null)

      // Retry fallback for OAuth redirect session sync across domains
      if (!me && isOauth) {
        await new Promise((r) => setTimeout(r, 300))
        me = await account.get().catch(() => null)
      }

      if (!me) {
        setUser(null)
        setIsAdmin(false)
        return
      }
      setUser(me)

      let adminCheck = Boolean(me.labels?.includes('admin'))
      if (!adminCheck) {
        try {
          const myTeams = await teams.list()
          adminCheck = Boolean(myTeams.teams?.some((t) => t.$id === ADMIN_TEAM_ID))
        } catch {
          adminCheck = false
        }
      }
      setIsAdmin(adminCheck)
    } catch {
      setUser(null)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh(true)
  }, [refresh])

  const login = async (email, password) => {
    await account.createEmailPasswordSession(email, password)
    await refresh()
  }

  const loginWithGoogle = (redirectPath = '/dashboard') => {
    account.createOAuth2Session(
      'google',
      `${window.location.origin}${redirectPath}`,
      `${window.location.origin}/login`
    )
  }

  const signup = async (name, email, password) => {
    await account.create(ID.unique(), email, password, name)
    await login(email, password)
  }

  const logout = async () => {
    try {
      await account.deleteSession('current')
    } catch {
      // Ignore if session is already deleted
    }
    setUser(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, loginWithGoogle, signup, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}
