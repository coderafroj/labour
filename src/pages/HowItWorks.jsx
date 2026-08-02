import { useEffect, useState } from 'react'
import { Search, ShieldCheck, PhoneCall, HardHat, Star, IndianRupee } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getSettings } from '../services/settingsService'

export default function HowItWorks() {
  const [s, setS] = useState(null)

  useEffect(() => { getSettings().then(setS) }, [])
  if (!s) return null

  const unlockText = s.unlockFee > 0 ? `₹${s.unlockFee} mein number lo` : 'Free mein number lo'
  const listingText = s.listingFee > 0 ? `₹${s.listingFee} mein Featured bano` : 'Free mein Featured bano'

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl font-bold text-ink">Ye Kaise Kaam Karta Hai</h1>
      <p className="mt-2 max-w-xl text-steel">LabourConnect do tarah ke logon ke liye kaam karta hai — jinhe kaamgaar chahiye, aur jo kaamgaar hain.</p>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div className="badge-card rounded-md p-6">
          <span className="badge-punch" />
          <p className="font-display text-2xl font-bold text-ink">Client Ke Liye</p>
          <ol className="mt-4 space-y-4">
            <Step icon={Search} title="Search karo" desc="Category aur sheher chuno, verified profiles turant dikh jaayenge." />
            <Step icon={ShieldCheck} title="Profile check karo" desc="Rating, anubhav, aur rate dekh kar sahi banda chuno." />
            <Step icon={PhoneCall} title={unlockText} desc={s.unlockFee > 0 ? `Ek baar unlock karo, ${s.unlockValidDays} din tak dobara paisa nahi lagega.` : 'Abhi ye bilkul free hai.'} />
          </ol>
        </div>

        <div className="badge-card rounded-md p-6">
          <span className="badge-punch" />
          <p className="font-display text-2xl font-bold text-ink">Kaamgaar Ke Liye</p>
          <ol className="mt-4 space-y-4">
            <Step icon={HardHat} title="Free registration" desc="Apna naam, kaam, aur rate daalo — koi charge nahi." />
            <Step icon={ShieldCheck} title="Admin verify karega" desc="Verify hone ke baad profile turant search mein aane lagegi." />
            <Step icon={Star} title={listingText} desc={`${s.featuredDays} din tak apni category mein sabse upar dikho, zyada calls milengi.`} />
          </ol>
        </div>
      </div>

      <div className="badge-card mt-8 rounded-md p-6">
        <span className="badge-punch" />
        <p className="flex items-center gap-2 font-display text-2xl font-bold text-ink"><IndianRupee size={22} /> Booking Poori Hone Par</p>
        <p className="mt-2 max-w-2xl text-sm text-steel">
          {s.commissionPercent > 0 ? (
            <>Kaam poora hone ke baad, kaamgaar final amount daal ke booking complete karta hai. Us par sirf{' '}
              <strong className="text-ink">{s.commissionPercent}%</strong> (kam se kam ₹{s.commissionMin}) ka platform commission lagta hai —
              bas isi se LabourConnect chalta hai, client se koi extra charge nahi.</>
          ) : (
            <>Abhi booking commission bhi off hai — kaam poora hone par koi extra charge nahi lagta.</>
          )}
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/browse" className="rounded bg-signal px-6 py-3 text-sm font-semibold text-ink hover:bg-signal-deep">Kaamgaar Dhundo</Link>
        <Link to="/register-labour" className="rounded border border-ink px-6 py-3 text-sm font-semibold text-ink hover:bg-ink hover:text-paper">Labour Register Karo</Link>
      </div>
    </div>
  )
}

function Step({ icon: Icon, title, desc }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper text-indigo"><Icon size={16} /></span>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="text-sm text-steel">{desc}</p>
      </div>
    </li>
  )
}
