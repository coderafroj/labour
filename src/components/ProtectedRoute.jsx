import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Loader from './Loader'

export function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader label="Session check ho raha hai..." />
  if (!user) return <Navigate to="/login" replace />
  return children
}

export function RequireAdmin({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <Loader label="Session check ho raha hai..." />
  if (!user || !isAdmin) return <Navigate to="/" replace />
  return children
}
