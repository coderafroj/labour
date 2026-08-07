import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Loader2, HardHat } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signup(name, email, password)
      navigate(location.state?.from || '/')
    } catch (err) {
      setError(err.message || 'Signup nahi ho paya, dobara try karein')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 sm:px-6">
      <span className="flex h-12 w-12 items-center justify-center rounded bg-ink text-signal"><HardHat size={24} /></span>
      <h1 className="mt-3 font-display text-3xl font-bold text-ink">Free Account Banayein</h1>
      <form onSubmit={handleSubmit} className="badge-card mt-6 w-full space-y-3 rounded-md p-6">
        <span className="badge-punch" />
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Pura Naam" className="input" />
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input" />
        <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 8 characters)" className="input" />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded bg-signal py-3 text-sm font-semibold text-ink hover:bg-signal-deep disabled:opacity-60">
          {loading && <Loader2 size={16} className="animate-spin" />} Account Banayein
        </button>
      </form>
      <p className="mt-4 text-sm text-steel">
        Pehle se account hai? <Link to="/login" className="font-semibold text-indigo underline">Login karo</Link>
      </p>
      <style>{`.input { width: 100%; border: 1px solid var(--color-paper-line); border-radius: 4px; padding: 0.7rem 0.9rem; font-size: 0.875rem; outline: none; }
      .input:focus { border-color: var(--color-indigo); }`}</style>
    </div>
  )
}
