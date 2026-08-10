import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Star, BadgeCheck, User, Lock, Phone, Home as HomeIcon, Loader2, Send, CheckCircle2, Navigation } from 'lucide-react'
import { getLabourer, fetchUnlockedContact, calculateDistance } from '../services/labourService'
import { startPayment } from '../services/paymentService'
import { createBooking } from '../services/bookingService'
import { useAuth } from '../hooks/useAuth'
import Loader from '../components/Loader'
import SEO from '../components/SEO'

export default function LabourDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [labourer, setLabourer] = useState(null)
  const [contact, setContact] = useState(null)
  const [unlockFee, setUnlockFee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const [error, setError] = useState('')
  const [bookingSent, setBookingSent] = useState(false)
  const [message, setMessage] = useState('')
  const [userCoords, setUserCoords] = useState(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      )
    }
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const doc = await getLabourer(id)
        setLabourer(doc)
        if (user) {
          try {
            const result = await fetchUnlockedContact(id)
            if (result.locked) setUnlockFee(result.fee)
            else setContact(result)
          } catch {
            // Keep gracefully locked
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
        amount: unlockFee,
        user,
        description: `${labourer.name} ka number unlock`,
      })
      const result = await fetchUnlockedContact(id)
      if (!result.locked) setContact(result)
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

  if (loading) return <Loader label="Handiqo profile load ho rahi hai..." />
  if (error && !labourer) return <div className="mx-auto max-w-2xl px-4 py-20 text-center text-steel">{error}</div>

  const distance = userCoords && labourer?.lat != null && labourer?.lng != null
    ? calculateDistance(userCoords.lat, userCoords.lng, labourer.lat, labourer.lng)
    : null

  const schemaData = labourer ? {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: labourer.name,
    jobTitle: labourer.categoryName,
    address: {
      '@type': 'PostalAddress',
      addressLocality: labourer.city,
    },
    image: labourer.photoUrl || undefined,
  } : null

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {labourer && (
        <SEO
          title={`${labourer.name} — ${labourer.categoryName} in ${labourer.city} | Handiqo`}
          description={`${labourer.name} (${labourer.categoryName}) — Handiqo Verified. ${labourer.experienceYears}+ saal anubhav, Rate: ₹${labourer.dailyRate}/din. Contact info and booking.`}
          keywords={`Handiqo, ${labourer.name}, ${labourer.categoryName}, ${labourer.city}`}
          image={labourer.photoUrl}
          schema={schemaData}
        />
      )}

      <div className="badge-card overflow-hidden rounded-md shadow-sm">
        <span className="badge-punch" />
        <div className="flex flex-col gap-5 border-b border-dashed border-paper-line p-6 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-ink bg-paper shadow-inner">
            {labourer.photoUrl ? (
              <img src={labourer.photoUrl} alt={labourer.name} className="h-full w-full object-cover" />
            ) : (
              <User size={40} className="text-steel" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-black text-ink">{labourer.name}</h1>
              {labourer.verified && (
                <span className="stamp flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider">
                  <BadgeCheck size={13} /> Handiqo Verified
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-bold text-rust">{labourer.categoryName}</p>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-steel font-medium">
              <span className="flex items-center gap-1"><MapPin size={14} /> {labourer.city}</span>
              {distance !== null && (
                <span className="flex items-center gap-1 font-mono font-bold text-rust">
                  <Navigation size={13} /> {distance} km door
                </span>
              )}
              <span>{labourer.experienceYears}+ saal anubhav</span>
              {labourer.rating > 0 && (
                <span className="flex items-center gap-1 font-bold text-ink"><Star size={13} className="fill-signal text-signal" /> {labourer.rating.toFixed(1)} ({labourer.jobsCompleted} kaam)</span>
              )}
            </div>
          </div>
          <div className="text-right sm:border-l sm:border-paper-line sm:pl-6">
            <p className="font-mono text-3xl font-black text-ink">₹{labourer.dailyRate}</p>
            <p className="text-xs font-semibold text-steel uppercase">Per Din Rate</p>
          </div>
        </div>

        {labourer.bio && (
          <div className="border-b border-paper-line p-6">
            <h2 className="font-display text-lg font-bold text-ink">Apne Baare Mein</h2>
            <p className="mt-1 text-sm leading-relaxed text-steel">{labourer.bio}</p>
          </div>
        )}

        <div className="p-6">
          <h2 className="font-display text-lg font-bold text-ink">Contact Details</h2>

          {contact ? (
            <div className="mt-3 space-y-2.5 rounded-md border-2 border-verified bg-verified-bg p-5 shadow-xs">
              <p className="flex items-center gap-2 font-mono text-xl font-bold text-ink">
                <Phone size={18} className="text-verified" /> {contact.phone}
              </p>
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <HomeIcon size={16} className="text-verified" /> {contact.address}
              </p>
            </div>
          ) : !user ? (
            <div className="mt-3 flex flex-col items-start gap-3 rounded-md border border-dashed border-paper-line bg-paper p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Lock size={22} className="text-steel" />
                <div>
                  <p className="font-mono text-lg font-bold tracking-widest text-steel">{labourer.phoneMasked}</p>
                  <p className="text-xs font-semibold text-steel">Number dekhne ke liye pehle login karein</p>
                </div>
              </div>
              <button onClick={() => navigate('/login', { state: { from: `/labour/${id}` } })} className="rounded bg-signal px-5 py-2.5 text-sm font-bold text-ink hover:bg-signal-deep transition-all">
                Login Karo
              </button>
            </div>
          ) : (
            <div className="mt-3 flex flex-col items-start gap-3 rounded-md border border-dashed border-paper-line bg-paper p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Lock size={22} className="text-steel" />
                <div>
                  <p className="font-mono text-lg font-bold tracking-widest text-steel">{labourer.phoneMasked}</p>
                  <p className="text-xs font-semibold text-steel">Number aur pura address dekhne ke liye unlock karein</p>
                </div>
              </div>
              <button
                onClick={handleUnlock}
                disabled={unlocking}
                className="flex items-center gap-2 rounded bg-signal px-5 py-2.5 text-sm font-bold text-ink hover:bg-signal-deep transition-all disabled:opacity-60"
              >
                {unlocking ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                {unlockFee && unlockFee > 0 ? `₹${unlockFee} mein Unlock Karo` : 'Free Unlock Karo'}
              </button>
            </div>
          )}
          {error && <p className="mt-2 text-sm text-danger font-medium">{error}</p>}
        </div>

        <div className="border-t border-paper-line p-6">
          <h2 className="font-display text-lg font-bold text-ink">Booking Request Bhejo</h2>
          <p className="mt-1 text-sm text-steel">Handiqo request bilkul free hai — kaam ki detail pehle bata sakte hain.</p>
          {bookingSent ? (
            <p className="mt-3 flex items-center gap-2 rounded-md bg-verified-bg p-3.5 text-sm font-bold text-verified border border-verified">
              <CheckCircle2 size={18} /> Request bhej di gayi hai! {labourer.name} aapko jald contact karenge.
            </p>
          ) : (
            <form onSubmit={handleBooking} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Kaam ka short detail likho (e.g. 2 kamre paint karwane hain)"
                className="flex-1 rounded border border-paper-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo font-medium"
              />
              <button type="submit" className="flex items-center justify-center gap-2 rounded bg-ink px-6 py-2.5 text-sm font-bold text-paper hover:bg-indigo-deep transition-all">
                <Send size={15} /> Request Bhejo
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
