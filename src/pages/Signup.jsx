import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import SEO from '../components/SEO'

export default function Signup() {
  const { signup, loginWithGoogle } = useAuth()
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
      navigate(location.state?.from || '/dashboard')
    } catch (err) {
      setError(err.message || 'Signup nahi ho paya, dobara try karein')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-16 sm:px-6">
      <SEO
        title="Free Signup | Handiqo"
        description="Handiqo par free account banayein. Apne sheher ke verified kaamgaar dhundhein ya apni skilled worker profile register karein."
      />

      <Link to="/" className="flex items-center gap-2.5 mb-2">
        <img src="/handiqo_final_app_icon.svg" alt="Handiqo" className="h-12 w-12 object-contain" />
      </Link>
      <h1 className="mt-2 font-display text-3xl font-black text-ink">Free Account Banayein</h1>
      <p className="text-xs text-steel mt-1 font-semibold">Handiqo — Har Kaam Ka Sahi Haath</p>

      <div className="badge-card mt-6 w-full space-y-4 rounded-md p-6 shadow-sm border-2 border-ink">
        <span className="badge-punch" />

        <button
          type="button"
          onClick={loginWithGoogle}
          className="flex w-full items-center justify-center gap-3 rounded border-2 border-paper-line bg-white py-3 text-sm font-bold text-ink shadow-xs hover:bg-paper transition-all"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Google Se 1-Click Signup Karo
        </button>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-paper-line" /></div>
          <span className="relative bg-white px-3 text-xs uppercase tracking-wider font-bold text-steel">Ya Email Se Form Bharo</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-steel mb-1">Pura Naam</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Apna naam daalo" className="input" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-steel mb-1">Email Address</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="input" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-steel mb-1">Password</label>
            <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Atleast 8 characters" className="input" />
          </div>

          {error && <p className="text-sm font-semibold text-danger">{error}</p>}

          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded bg-signal py-3 text-sm font-bold text-ink hover:bg-signal-deep transition-all disabled:opacity-60">
            {loading && <Loader2 size={16} className="animate-spin" />} Free Account Banayein
          </button>
        </form>
      </div>

      <p className="mt-4 text-sm text-steel font-medium">
        Pehle se Handiqo account hai? <Link to="/login" className="font-bold text-indigo underline">Login karo</Link>
      </p>

      <style>{`.input { width: 100%; border: 1px solid var(--color-paper-line); border-radius: 4px; padding: 0.7rem 0.9rem; font-size: 0.875rem; outline: none; font-weight: 500; }
      .input:focus { border-color: var(--color-indigo); }`}</style>
    </main>
  )
}
