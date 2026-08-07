import { useEffect, useState, useCallback } from 'react'
import { account, teams, ID } from '../lib/appwrite'
import { ADMIN_TEAM_ID } from '../lib/constants'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const me = await account.get().catch(() => null)
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
    try {
      await account.deleteSession('current')
    } catch {
      // Ignore if session is already deleted
    }
    setUser(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, signup, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}
