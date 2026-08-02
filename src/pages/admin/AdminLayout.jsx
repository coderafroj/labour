import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, Tags, Wallet, ClipboardList, IndianRupee } from 'lucide-react'

const link = ({ isActive }) =>
  `flex items-center gap-2 rounded px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-ink text-paper' : 'text-steel hover:bg-white hover:text-ink'
  }`

export default function AdminLayout() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-4xl font-bold text-ink">Admin Panel</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-[200px_1fr]">
        <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col md:overflow-visible">
          <NavLink to="/admin" end className={link}><LayoutDashboard size={16} /> Overview</NavLink>
          <NavLink to="/admin/labourers" className={link}><Users size={16} /> Labourers</NavLink>
          <NavLink to="/admin/categories" className={link}><Tags size={16} /> Categories</NavLink>
          <NavLink to="/admin/bookings" className={link}><ClipboardList size={16} /> Bookings</NavLink>
          <NavLink to="/admin/payments" className={link}><Wallet size={16} /> Revenue</NavLink>
          <NavLink to="/admin/settings" className={link}><IndianRupee size={16} /> Pricing</NavLink>
        </nav>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
