import { useEffect, useState } from 'react'
import { Users, Clock, IndianRupee, Star, ClipboardList } from 'lucide-react'
import { adminListAllLabourers } from '../../services/labourService'
import { adminListPayments } from '../../services/paymentService'
import { adminListBookings } from '../../services/bookingService'
import { LABOUR_STATUS, PAYMENT_TYPES } from '../../lib/constants'
import Loader from '../../components/Loader'

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="badge-card rounded-md p-5">
      <span className="badge-punch" />
      <div className="flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${accent}`}><Icon size={17} /></span>
      </div>
      <p className="mt-3 font-mono text-3xl font-bold text-ink">{value}</p>
      <p className="text-xs uppercase tracking-wide text-steel">{label}</p>
    </div>
  )
}

export default function AdminOverview() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    (async () => {
      const [approved, pending, payments, bookings] = await Promise.all([
        adminListAllLabourers({ status: LABOUR_STATUS.APPROVED, limit: 1 }),
        adminListAllLabourers({ status: LABOUR_STATUS.PENDING, limit: 1 }),
        adminListPayments({ limit: 100 }),
        adminListBookings(),
      ])

      const paidPayments = payments.documents.filter((p) => p.status === 'paid')
      const revenue = paidPayments.reduce((sum, p) => sum + p.amount, 0)
      const byType = paidPayments.reduce((acc, p) => {
        acc[p.type] = (acc[p.type] || 0) + p.amount
        return acc
      }, {})

      setStats({
        approvedCount: approved.total,
        pendingCount: pending.total,
        revenue,
        byType,
        bookingCount: bookings.length,
        recentPayments: payments.documents.slice(0, 8),
      })
      setLoading(false)
    })()
  }, [])

  if (loading) return <Loader />

  return (
    <div className="space-y-8">
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
        <p className="mb-3 font-display text-2xl font-bold text-ink">Recent Payments</p>
        <div className="overflow-x-auto rounded-md border border-paper-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-paper-line bg-paper text-xs uppercase text-steel">
              <tr><th className="p-3">Type</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Date</th></tr>
            </thead>
            <tbody>
              {stats.recentPayments.map((p) => (
                <tr key={p.$id} className="border-b border-paper-line last:border-0">
                  <td className="p-3 capitalize">{p.type}</td>
                  <td className="p-3 font-mono">₹{p.amount}</td>
                  <td className="p-3 capitalize">{p.status}</td>
                  <td className="p-3 text-steel">{new Date(p.$createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function RevenueTile({ label, value }) {
  return (
    <div className="rounded-md border border-paper-line bg-white p-4">
      <p className="flex items-center gap-1 font-mono text-2xl font-bold text-ink"><Star size={15} className="text-signal" />₹{value}</p>
      <p className="text-xs uppercase tracking-wide text-steel">{label}</p>
    </div>
  )
}
