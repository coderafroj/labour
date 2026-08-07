import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Loader2, HardHat } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate(location.state?.from || '/')
    } catch {
      setError('Email ya password galat hai')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 sm:px-6">
      <span className="flex h-12 w-12 items-center justify-center rounded bg-ink text-signal"><HardHat size={24} /></span>
      <h1 className="mt-3 font-display text-3xl font-bold text-ink">Wapas Aane Ka Swagat Hai</h1>
      <form onSubmit={handleSubmit} className="badge-card mt-6 w-full space-y-3 rounded-md p-6">
        <span className="badge-punch" />
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input" />
        <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input" />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded bg-signal py-3 text-sm font-semibold text-ink hover:bg-signal-deep disabled:opacity-60">
          {loading && <Loader2 size={16} className="animate-spin" />} Login Karo
        </button>
      </form>
      <p className="mt-4 text-sm text-steel">
        Account nahi hai? <Link to="/signup" className="font-semibold text-indigo underline">Signup karo</Link>
      </p>
      <style>{`.input { width: 100%; border: 1px solid var(--color-paper-line); border-radius: 4px; padding: 0.7rem 0.9rem; font-size: 0.875rem; outline: none; }
      .input:focus { border-color: var(--color-indigo); }`}</style>
    </div>
  )
}
