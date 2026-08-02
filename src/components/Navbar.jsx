import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { HardHat, Menu, X, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navLink = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'text-indigo' : 'text-steel hover:text-ink'
  }`

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-paper-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded bg-ink text-signal">
            <HardHat size={20} strokeWidth={2.2} />
          </span>
          <span className="font-display text-2xl font-bold leading-none tracking-tight text-ink">
            Labour<span className="text-rust">Connect</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/browse" className={navLink}>Kaam Wale Dhundo</NavLink>
          <NavLink to="/register-labour" className={navLink}>Labour Register Karo</NavLink>
          <NavLink to="/how-it-works" className={navLink}>Kaise Kaam Karta Hai</NavLink>
          {user && <NavLink to="/dashboard" className={navLink}>Mera Dashboard</NavLink>}
          {isAdmin && (
            <NavLink to="/admin" className="ml-1 flex items-center gap-1 rounded bg-ink px-3 py-2 text-sm font-medium text-paper">
              <LayoutDashboard size={15} /> Admin
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <button onClick={handleLogout} className="flex items-center gap-1.5 rounded border border-paper-line px-3 py-2 text-sm font-medium text-steel hover:text-ink">
              <LogOut size={15} /> Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 text-sm font-medium text-steel hover:text-ink">Login</Link>
              <Link to="/signup" className="rounded bg-signal px-4 py-2 text-sm font-semibold text-ink hover:bg-signal-deep">
                Free Signup
              </Link>
            </>
          )}
        </div>

        <button className="p-2 md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-paper-line px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            <NavLink onClick={() => setOpen(false)} to="/browse" className={navLink}>Kaam Wale Dhundo</NavLink>
            <NavLink onClick={() => setOpen(false)} to="/register-labour" className={navLink}>Labour Register Karo</NavLink>
            <NavLink onClick={() => setOpen(false)} to="/how-it-works" className={navLink}>Kaise Kaam Karta Hai</NavLink>
            {user && <NavLink onClick={() => setOpen(false)} to="/dashboard" className={navLink}>Mera Dashboard</NavLink>}
            {isAdmin && <NavLink onClick={() => setOpen(false)} to="/admin" className={navLink}>Admin Panel</NavLink>}
            {user ? (
              <button onClick={handleLogout} className="mt-2 flex items-center gap-1.5 text-left text-sm font-medium text-steel">
                <LogOut size={15} /> Logout
              </button>
            ) : (
              <div className="mt-2 flex gap-2">
                <Link onClick={() => setOpen(false)} to="/login" className="rounded border border-paper-line px-3 py-2 text-sm font-medium">Login</Link>
                <Link onClick={() => setOpen(false)} to="/signup" className="rounded bg-signal px-3 py-2 text-sm font-semibold text-ink">Signup</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
