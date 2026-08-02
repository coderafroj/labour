import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { account, teams, ID } from '../lib/appwrite'
import { ADMIN_TEAM_ID } from '../lib/constants'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const me = await account.get()
      setUser(me)
      try {
        const memberships = await teams.listMemberships(ADMIN_TEAM_ID)
        setIsAdmin(memberships.memberships.some((m) => m.userId === me.$id && m.confirm))
      } catch {
        setIsAdmin(false)
      }
    } catch {
      setUser(null)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = async (email, password) => {
    await account.createEmailPasswordSession(email, password)
    await refresh()
  }

  const signup = async (name, email, password) => {
    await account.create(ID.unique(), email, password, name)
    await login(email, password)
  }

  const logout = async () => {
    await account.deleteSession('current')
    setUser(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, signup, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
