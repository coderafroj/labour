import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Star, BadgeCheck, User, Lock, Phone, Home as HomeIcon, Loader2, Send, CheckCircle2 } from 'lucide-react'
import { getLabourer, fetchUnlockedContact } from '../services/labourService'
import { startPayment } from '../services/paymentService'
import { createBooking } from '../services/bookingService'
import { useAuth } from '../context/AuthContext'
import { PRICING } from '../lib/constants'
import Loader from '../components/Loader'

export default function LabourDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [labourer, setLabourer] = useState(null)
  const [contact, setContact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const [error, setError] = useState('')
  const [bookingSent, setBookingSent] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const doc = await getLabourer(id)
        setLabourer(doc)
        if (user) {
          try {
            const c = await fetchUnlockedContact(id)
            setContact(c)
          } catch {
            setContact(null)
          }
        }
      } catch {
        setError('Ye profile nahi mili')
      } finally {
        setLoading(false)
      }
    })()
  }, [id, user])

  const handleUnlock = async () => {
    if (!user) return navigate('/login', { state: { from: `/labour/${id}` } })
    setUnlocking(true)
    setError('')
    try {
      await startPayment({
        type: 'unlock',
        relatedId: id,
        amount: PRICING.CONTACT_UNLOCK_FEE,
        user,
        description: `${labourer.name} ka number unlock`,
      })
      const c = await fetchUnlockedContact(id)
      setContact(c)
    } catch (err) {
      setError(err.message)
    } finally {
      setUnlocking(false)
    }
  }

  const handleBooking = async (e) => {
    e.preventDefault()
    if (!user) return navigate('/login', { state: { from: `/labour/${id}` } })
    await createBooking({
      clientUserId: user.$id,
      labourerId: id,
      labourerOwnerId: labourer.ownerUserId,
      message,
      city: labourer.city,
    })
    setBookingSent(true)
  }

  if (loading) return <Loader label="Profile load ho rahi hai..." />
  if (error && !labourer) return <div className="mx-auto max-w-2xl px-4 py-20 text-center text-steel">{error}</div>

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="badge-card overflow-hidden rounded-md">
        <span className="badge-punch" />
        <div className="flex flex-col gap-5 border-b border-dashed border-paper-line p-6 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-ink bg-paper">
            {labourer.photoUrl ? (
              <img src={labourer.photoUrl} alt={labourer.name} className="h-full w-full object-cover" />
            ) : (
              <User size={40} className="text-steel" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-bold text-ink">{labourer.name}</h1>
              {labourer.verified && (
                <span className="stamp flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase">
                  <BadgeCheck size={12} /> Verified
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-semibold text-rust">{labourer.categoryName}</p>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-steel">
              <span className="flex items-center gap-1"><MapPin size={14} /> {labourer.city}</span>
              <span>{labourer.experienceYears}+ saal anubhav</span>
              {labourer.rating > 0 && (
                <span className="flex items-center gap-1"><Star size={13} className="fill-signal text-signal" /> {labourer.rating.toFixed(1)} ({labourer.jobsCompleted} kaam)</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-3xl font-bold text-ink">₹{labourer.dailyRate}</p>
            <p className="text-xs text-steel">per din</p>
          </div>
        </div>

        {labourer.bio && (
          <div className="border-b border-paper-line p-6">
            <p className="font-display text-lg font-semibold text-ink">Bare Mein</p>
            <p className="mt-1 text-sm leading-relaxed text-steel">{labourer.bio}</p>
          </div>
        )}

        <div className="p-6">
          <p className="font-display text-lg font-semibold text-ink">Contact Details</p>

          {contact ? (
            <div className="mt-3 space-y-2 rounded-md border border-verified bg-verified-bg p-4">
              <p className="flex items-center gap-2 font-mono text-lg font-semibold text-ink">
                <Phone size={17} className="text-verified" /> {contact.phone}
              </p>
              <p className="flex items-center gap-2 text-sm text-ink">
                <HomeIcon size={15} className="text-verified" /> {contact.address}
              </p>
            </div>
          ) : (
            <div className="mt-3 flex flex-col items-start gap-3 rounded-md border border-dashed border-paper-line bg-paper p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Lock size={22} className="text-steel" />
                <div>
                  <p className="font-mono text-lg font-semibold tracking-widest text-steel">{labourer.phoneMasked}</p>
                  <p className="text-xs text-steel">Number aur pura address dekhne ke liye unlock karo</p>
                </div>
              </div>
              <button
                onClick={handleUnlock}
                disabled={unlocking}
                className="flex items-center gap-2 rounded bg-signal px-5 py-2.5 text-sm font-semibold text-ink hover:bg-signal-deep disabled:opacity-60"
              >
                {unlocking ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                ₹{PRICING.CONTACT_UNLOCK_FEE} mein Unlock Karo
              </button>
            </div>
          )}
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </div>

        <div className="border-t border-paper-line p-6">
          <p className="font-display text-lg font-semibold text-ink">Booking Request Bhejo</p>
          <p className="mt-1 text-sm text-steel">Ye free hai — booking se pehle kaam ka detail bata sakte ho.</p>
          {bookingSent ? (
            <p className="mt-3 flex items-center gap-2 rounded-md bg-verified-bg p-3 text-sm font-medium text-verified">
              <CheckCircle2 size={16} /> Request bhej di gayi hai, {labourer.name} jald contact karenge.
            </p>
          ) : (
            <form onSubmit={handleBooking} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Kaam ka short detail likho (optional)"
                className="flex-1 rounded border border-paper-line bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo"
              />
              <button type="submit" className="flex items-center justify-center gap-1.5 rounded bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-indigo-deep">
                <Send size={15} /> Request Bhejo
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
