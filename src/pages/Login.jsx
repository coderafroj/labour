import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Loader2, HardHat } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { login, loginWithGoogle } = useAuth()
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

      <div className="badge-card mt-6 w-full space-y-4 rounded-md p-6">
        <span className="badge-punch" />

        <button
          type="button"
          onClick={loginWithGoogle}
          className="flex w-full items-center justify-center gap-3 rounded border border-paper-line bg-white py-3 text-sm font-semibold text-ink shadow-xs hover:bg-paper"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Google Se 1-Click Login Karo
        </button>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-paper-line" /></div>
          <span className="relative bg-white px-2 text-xs uppercase tracking-wider text-steel">Ya Email Se Login Karo</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input" />
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input" />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded bg-signal py-3 text-sm font-semibold text-ink hover:bg-signal-deep disabled:opacity-60">
            {loading && <Loader2 size={16} className="animate-spin" />} Login Karo
          </button>
        </form>
      </div>
      <p className="mt-4 text-sm text-steel">
        Account nahi hai? <Link to="/signup" className="font-semibold text-indigo underline">Signup karo</Link>
      </p>
      <style>{`.input { width: 100%; border: 1px solid var(--color-paper-line); border-radius: 4px; padding: 0.7rem 0.9rem; font-size: 0.875rem; outline: none; }
      .input:focus { border-color: var(--color-indigo); }`}</style>
    </div>
  )
}
