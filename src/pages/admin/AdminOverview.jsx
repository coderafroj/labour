import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Clock, IndianRupee, Star, ClipboardList, CheckCircle2, ArrowRight } from 'lucide-react'
import { adminListAllLabourers } from '../../services/labourService'
import { adminListPayments } from '../../services/paymentService'
import { adminListBookings } from '../../services/bookingService'
import { LABOUR_STATUS, PAYMENT_TYPES } from '../../lib/constants'
import Loader from '../../components/Loader'

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="badge-card rounded-md p-5 shadow-xs">
      <span className="badge-punch" />
      <div className="flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${accent}`}><Icon size={18} /></span>
      </div>
      <p className="mt-3 font-mono text-3xl font-black text-ink">{value}</p>
      <p className="text-xs uppercase tracking-wider font-bold text-steel">{label}</p>
    </div>
  )
}

export default function AdminOverview() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const [approved, pending, payments, bookings] = await Promise.all([
          adminListAllLabourers({ status: LABOUR_STATUS.APPROVED, limit: 1 }),
          adminListAllLabourers({ status: LABOUR_STATUS.PENDING, limit: 1 }),
          adminListPayments({ limit: 100 }),
          adminListBookings(),
        ])

        const paidPayments = (payments.documents || []).filter((p) => p.status === 'paid')
        const revenue = paidPayments.reduce((sum, p) => sum + p.amount, 0)
        const byType = paidPayments.reduce((acc, p) => {
          acc[p.type] = (acc[p.type] || 0) + p.amount
          return acc
        }, {})

        setStats({
          approvedCount: approved.total || 0,
          pendingCount: pending.total || 0,
          revenue,
          byType,
          bookingCount: bookings.length || 0,
          recentPayments: (payments.documents || []).slice(0, 8),
        })
      } catch {
        setStats({
          approvedCount: 0,
          pendingCount: 0,
          revenue: 0,
          byType: {},
          bookingCount: 0,
          recentPayments: [],
        })
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <Loader label="Handiqo admin metrics load ho rahe hain..." />

  return (
    <div className="space-y-8">
      {stats.pendingCount > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-md border-2 border-signal bg-signal/15 p-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-signal-deep" />
            <div>
              <p className="font-bold text-sm text-ink">{stats.pendingCount} Nayi Labourer Profiles Pending Hain!</p>
              <p className="text-xs text-steel">Inhe approve karein taaki ye public search aur category listings mein dikhne lagein.</p>
            </div>
          </div>
          <Link to="/admin/labourers" className="flex items-center gap-1.5 rounded bg-ink px-4 py-2 text-xs font-bold text-paper hover:bg-indigo-deep transition-all">
            Review & Approve Karein <ArrowRight size={14} />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Approved Labourers" value={stats.approvedCount} accent="bg-verified-bg text-verified" />
        <StatCard icon={Clock} label="Approval Pending" value={stats.pendingCount} accent="bg-signal/20 text-signal-deep" />
        <StatCard icon={ClipboardList} label="Total Bookings" value={stats.bookingCount} accent="bg-indigo/10 text-indigo" />
        <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${stats.revenue}`} accent="bg-rust/10 text-rust" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <RevenueTile label="Contact Unlocks" value={stats.byType[PAYMENT_TYPES.UNLOCK] || 0} />
        <RevenueTile label="Featured Listings" value={stats.byType[PAYMENT_TYPES.LISTING] || 0} />
        <RevenueTile label="Booking Commission" value={stats.byType[PAYMENT_TYPES.COMMISSION] || 0} />
      </div>

      <div>
        <p className="mb-3 font-display text-2xl font-black text-ink">Recent Payments</p>
        <div className="overflow-x-auto rounded-md border border-paper-line bg-white shadow-xs">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-paper-line bg-paper text-xs uppercase font-bold text-steel">
              <tr><th className="p-3">Type</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Date</th></tr>
            </thead>
            <tbody>
              {stats.recentPayments.map((p) => (
                <tr key={p.$id} className="border-b border-paper-line last:border-0 hover:bg-paper/30">
                  <td className="p-3 capitalize font-semibold">{p.type}</td>
                  <td className="p-3 font-mono font-bold">₹{p.amount}</td>
                  <td className="p-3 capitalize font-semibold">
                    <span className="flex items-center gap-1 text-verified">
                      <CheckCircle2 size={13} /> {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-steel font-medium">{new Date(p.$createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
              {stats.recentPayments.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center text-steel font-medium">Abhi tak koi payment record nahi hai</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function RevenueTile({ label, value }) {
  return (
    <div className="rounded-md border border-paper-line bg-white p-4 shadow-xs">
      <p className="flex items-center gap-1 font-mono text-2xl font-black text-ink"><Star size={16} className="text-signal fill-signal" />₹{value}</p>
      <p className="text-xs uppercase tracking-wider font-bold text-steel mt-0.5">{label}</p>
    </div>
  )
}
