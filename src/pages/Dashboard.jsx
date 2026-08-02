import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, IndianRupee, Loader2, CheckCircle2, Clock, HardHat, Phone, Home as HomeIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getMyLabourerProfile, getMyPrivateInfo, updateMyLabourerProfile } from '../services/labourService'
import { myBookingsAsClient, myBookingsAsLabourer, setJobAmount, updateBookingStatus } from '../services/bookingService'
import { myPayments, startPayment } from '../services/paymentService'
import { getSettings } from '../services/settingsService'
import { BOOKING_STATUS, LABOUR_STATUS } from '../lib/constants'
import Loader from '../components/Loader'

export default function Dashboard() {
  const { user } = useAuth()
  const [labourer, setLabourer] = useState(undefined) // undefined = checking, null = not a labourer
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getMyLabourerProfile(user.$id).then(setLabourer).finally(() => setLoading(false))
  }, [user])

  if (loading) return <Loader />

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-bold text-ink">Mera Dashboard</h1>
      {labourer ? <LabourerDashboard labourer={labourer} setLabourer={setLabourer} user={user} /> : <ClientDashboard user={user} />}
    </div>
  )
}

function StatusPill({ status }) {
  const map = {
    [LABOUR_STATUS.APPROVED]: 'bg-verified-bg text-verified',
    [LABOUR_STATUS.PENDING]: 'bg-signal/20 text-signal-deep',
    [LABOUR_STATUS.REJECTED]: 'bg-danger/10 text-danger',
  }
  return <span className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase ${map[status]}`}>{status}</span>
}

function LabourerDashboard({ labourer, setLabourer, user }) {
  const [privateInfo, setPrivateInfo] = useState(null)
  const [bookings, setBookings] = useState([])
  const [settings, setSettings] = useState(null)
  const [featuring, setFeaturing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getMyPrivateInfo(labourer.$id).then(setPrivateInfo).catch(() => {})
    myBookingsAsLabourer(labourer.$id).then(setBookings)
    getSettings().then(setSettings)
  }, [labourer.$id])

  const handleFeature = async () => {
    setFeaturing(true)
    setError('')
    try {
      if (!settings.listingFee || settings.listingFee <= 0) {
        // Admin has this fee switched off — feature it directly, free.
        const featuredUntil = new Date(Date.now() + (settings.featuredDays || 30) * 86400000).toISOString()
        await updateMyLabourerProfile(labourer.$id, { featured: true, featuredUntil })
      } else {
        await startPayment({
          type: 'listing',
          relatedId: labourer.$id,
          amount: settings.listingFee,
          user,
          description: 'Featured listing',
        })
        // verify-razorpay-payment Function already set featured=true server-side.
      }
      setLabourer((l) => ({ ...l, featured: true }))
    } catch (err) {
      setError(err.message)
    } finally {
      setFeaturing(false)
    }
  }

  const handleAccept = async (id) => {
    await updateBookingStatus(id, BOOKING_STATUS.ACCEPTED)
    setBookings((bs) => bs.map((b) => (b.$id === id ? { ...b, status: BOOKING_STATUS.ACCEPTED } : b)))
  }

  const handleComplete = async (id) => {
    const amount = Number(prompt('Final kaam ka amount (₹) daalo:'))
    if (!amount || amount <= 0) return
    const percent = settings?.commissionPercent || 0
    const min = settings?.commissionMin || 0
    const commission = percent > 0 ? Math.max(min, Math.round((amount * percent) / 100)) : 0
    const alreadyPaid = commission <= 0 // 0% commission = nothing to collect
    await setJobAmount(id, amount, commission, alreadyPaid)
    setBookings((bs) => bs.map((b) => (b.$id === id ? { ...b, status: BOOKING_STATUS.COMPLETED, jobAmount: amount, commissionAmount: commission, commissionPaid: alreadyPaid } : b)))
  }

  const handlePayCommission = async (booking) => {
    try {
      await startPayment({
        type: 'commission',
        relatedId: booking.$id,
        amount: booking.commissionAmount,
        user,
        description: 'Platform commission',
      })
      setBookings((bs) => bs.map((b) => (b.$id === booking.$id ? { ...b, commissionPaid: true } : b)))
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="mt-6 space-y-8">
      <div className="badge-card rounded-md p-6">
        <span className="badge-punch" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded bg-ink text-signal"><HardHat size={20} /></span>
            <div>
              <p className="font-display text-2xl font-bold text-ink">{labourer.name}</p>
              <p className="text-sm text-steel">{labourer.categoryName} • {labourer.city}</p>
            </div>
          </div>
          <StatusPill status={labourer.status} />
        </div>

        {labourer.status === LABOUR_STATUS.PENDING && (
          <p className="mt-3 rounded-md bg-signal/10 p-3 text-sm text-ink">
            Aapki profile admin ke approval ka wait kar rahi hai. Approve hote hi ye search mein dikhne lagegi.
          </p>
        )}

        {privateInfo && (
          <div className="mt-4 grid gap-2 border-t border-paper-line pt-4 text-sm sm:grid-cols-2">
            <p className="flex items-center gap-2 text-steel"><Phone size={14} /> {privateInfo.phone} <span className="text-xs">(sirf aapko aur admin ko dikhta hai)</span></p>
            <p className="flex items-center gap-2 text-steel"><HomeIcon size={14} /> {privateInfo.address}</p>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-paper-line pt-5">
          {labourer.featured ? (
            <span className="flex items-center gap-1 rounded bg-signal px-3 py-2 text-xs font-semibold text-ink"><Star size={13} /> Abhi Featured Hai</span>
          ) : (
            <button
              onClick={handleFeature}
              disabled={featuring || !settings}
              className="flex items-center gap-2 rounded bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:bg-indigo-deep disabled:opacity-60"
            >
              {featuring ? <Loader2 size={15} className="animate-spin" /> : <Star size={15} />}
              {settings && settings.listingFee > 0 ? `₹${settings.listingFee} mein Featured Bano` : 'Free Mein Featured Bano'}
            </button>
          )}
          <Link to={`/labour/${labourer.$id}`} className="text-sm font-medium text-indigo underline">Apni public profile dekho</Link>
        </div>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      </div>

      <div>
        <p className="mb-3 font-display text-2xl font-bold text-ink">Booking Requests</p>
        {bookings.length === 0 ? (
          <p className="text-sm text-steel">Abhi tak koi request nahi aayi.</p>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.$id} className="badge-card rounded-md p-4">
                <span className="badge-punch" />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-ink">{b.message || 'Koi message nahi diya gaya'}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-steel"><Clock size={12} /> {new Date(b.$createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <StatusPill status={b.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {b.status === BOOKING_STATUS.REQUESTED && (
                    <button onClick={() => handleAccept(b.$id)} className="rounded bg-verified px-3 py-1.5 text-xs font-semibold text-white">Accept Karo</button>
                  )}
                  {b.status === BOOKING_STATUS.ACCEPTED && (
                    <button onClick={() => handleComplete(b.$id)} className="rounded bg-ink px-3 py-1.5 text-xs font-semibold text-paper">Kaam Poora Hua — Amount Daalo</button>
                  )}
                  {b.status === BOOKING_STATUS.COMPLETED && !b.commissionPaid && (
                    <button onClick={() => handlePayCommission(b)} className="flex items-center gap-1 rounded bg-signal px-3 py-1.5 text-xs font-semibold text-ink">
                      <IndianRupee size={12} /> Commission ₹{b.commissionAmount} Pay Karo
                    </button>
                  )}
                  {b.commissionPaid && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-verified"><CheckCircle2 size={13} /> Commission Paid</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ClientDashboard({ user }) {
  const [payments, setPayments] = useState([])
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    myPayments(user.$id).then(setPayments)
    myBookingsAsClient(user.$id).then(setBookings)
  }, [user.$id])

  return (
    <div className="mt-6 space-y-8">
      <div className="badge-card rounded-md p-6">
        <span className="badge-punch" />
        <p className="font-display text-xl font-semibold text-ink">Namaste, {user.name}</p>
        <p className="mt-1 text-sm text-steel">Aap abhi client ke roop mein login hain. Kaam karte hain? <Link to="/register-labour" className="font-semibold text-indigo underline">Labour register karo</Link>.</p>
      </div>

      <div>
        <p className="mb-3 font-display text-2xl font-bold text-ink">Meri Booking Requests</p>
        {bookings.length === 0 ? <p className="text-sm text-steel">Koi booking request nahi hai abhi.</p> : (
          <div className="space-y-2">
            {bookings.map((b) => (
              <div key={b.$id} className="flex items-center justify-between rounded-md border border-paper-line bg-white p-3 text-sm">
                <span className="text-steel">{new Date(b.$createdAt).toLocaleDateString('en-IN')} • {b.message || 'No message'}</span>
                <StatusPill status={b.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="mb-3 font-display text-2xl font-bold text-ink">Payment History</p>
        {payments.length === 0 ? <p className="text-sm text-steel">Abhi tak koi payment nahi ki.</p> : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.$id} className="flex items-center justify-between rounded-md border border-paper-line bg-white p-3 text-sm">
                <span className="capitalize text-steel">{p.type} — {new Date(p.$createdAt).toLocaleDateString('en-IN')}</span>
                <span className="font-mono font-semibold text-ink">₹{p.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
