import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, LayoutDashboard, Megaphone, ShieldAlert } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getSettings } from '../services/settingsService'

const navLink = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'text-indigo font-semibold' : 'text-steel hover:text-ink'
  }`

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    getSettings().then(setSettings).catch(() => {})
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <>
      {settings?.announcementText && (
        <div className="bg-ink px-4 py-2 text-center text-xs font-medium text-signal">
          <span className="inline-flex items-center gap-1.5"><Megaphone size={13} /> {settings.announcementText}</span>
        </div>
      )}
      {settings?.maintenanceMode && (
        <div className="bg-rust px-4 py-1.5 text-center text-xs font-semibold text-white">
          <span className="inline-flex items-center gap-1.5"><ShieldAlert size={14} /> Platform Under Maintenance Mode</span>
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-paper-line bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/handiqo_final_app_icon.svg" alt="Handiqo Logo" className="h-9 w-9 object-contain" />
            <div className="flex flex-col">
              <span className="font-display text-2xl font-black leading-none tracking-tight text-ink">
                Hand<span className="text-rust">iqo</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-steel uppercase">Verified Kaamgaar</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/browse" className={navLink}>Kaam Wale Dhundo</NavLink>
            <NavLink to="/register-labour" className={navLink}>Kaamgaar Register Karo</NavLink>
            <NavLink to="/how-it-works" className={navLink}>Kaise Kaam Karta Hai</NavLink>
            {user && <NavLink to="/dashboard" className={navLink}>Mera Dashboard</NavLink>}
            {isAdmin && (
              <NavLink to="/admin" className="ml-1 flex items-center gap-1.5 rounded bg-ink px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-paper hover:bg-indigo-deep">
                <LayoutDashboard size={14} /> Admin
              </NavLink>
            )}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-steel">Hi, {user.name?.split(' ')[0]}</span>
                <button onClick={handleLogout} className="flex items-center gap-1.5 rounded border border-paper-line px-3 py-2 text-xs font-semibold text-steel hover:border-ink hover:text-ink">
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 text-sm font-semibold text-steel hover:text-ink">Login</Link>
                <Link to="/signup" className="rounded bg-signal px-4 py-2 text-sm font-bold text-ink shadow-xs hover:bg-signal-deep transition-all">
                  Free Signup
                </Link>
              </>
            )}
          </div>

          <button className="p-2 md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle Navigation Menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="border-t border-paper-line bg-white px-4 pb-5 pt-2 md:hidden">
            <nav className="flex flex-col gap-1">
              <NavLink onClick={() => setOpen(false)} to="/browse" className={navLink}>Kaam Wale Dhundo</NavLink>
              <NavLink onClick={() => setOpen(false)} to="/register-labour" className={navLink}>Kaamgaar Register Karo</NavLink>
              <NavLink onClick={() => setOpen(false)} to="/how-it-works" className={navLink}>Kaise Kaam Karta Hai</NavLink>
              {user && <NavLink onClick={() => setOpen(false)} to="/dashboard" className={navLink}>Mera Dashboard</NavLink>}
              {isAdmin && <NavLink onClick={() => setOpen(false)} to="/admin" className={navLink}>Admin Panel</NavLink>}
              {user ? (
                <button onClick={handleLogout} className="mt-3 flex items-center gap-1.5 text-left text-sm font-semibold text-danger">
                  <LogOut size={15} /> Logout ({user.name})
                </button>
              ) : (
                <div className="mt-3 flex gap-2">
                  <Link onClick={() => setOpen(false)} to="/login" className="flex-1 text-center rounded border border-paper-line py-2 text-sm font-semibold">Login</Link>
                  <Link onClick={() => setOpen(false)} to="/signup" className="flex-1 text-center rounded bg-signal py-2 text-sm font-bold text-ink">Signup</Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
