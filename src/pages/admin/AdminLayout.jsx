import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, Tags, Wallet, ClipboardList, IndianRupee } from 'lucide-react'
import SEO from '../../components/SEO'

const link = ({ isActive }) =>
  `flex items-center gap-2 rounded px-3 py-2 text-sm font-semibold transition-all ${
    isActive ? 'bg-ink text-paper shadow-xs' : 'text-steel hover:bg-white hover:text-ink'
  }`

export default function AdminLayout() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <SEO title="Handiqo Admin Control Panel" description="Handiqo admin panel for managing labourers, categories, bookings, revenue, and pricing settings." />

      <div className="flex items-center gap-3">
        <img src="/handiqo_final_app_icon.svg" alt="Handiqo Admin" className="h-10 w-10 object-contain" />
        <div>
          <h1 className="font-display text-4xl font-black text-ink">Handiqo Admin Panel</h1>
          <p className="text-xs font-semibold text-steel">Platform Management & Control</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[200px_1fr]">
        <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col md:overflow-visible bg-paper/50 p-2 rounded-md border border-paper-line">
          <NavLink to="/admin" end className={link}><LayoutDashboard size={16} /> Overview</NavLink>
          <NavLink to="/admin/labourers" className={link}><Users size={16} /> Labourers</NavLink>
          <NavLink to="/admin/categories" className={link}><Tags size={16} /> Categories</NavLink>
          <NavLink to="/admin/bookings" className={link}><ClipboardList size={16} /> Bookings</NavLink>
          <NavLink to="/admin/payments" className={link}><Wallet size={16} /> Revenue</NavLink>
          <NavLink to="/admin/settings" className={link}><IndianRupee size={16} /> Pricing & Settings</NavLink>
        </nav>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </main>
  )
}
