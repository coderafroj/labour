import { useEffect, useState } from 'react'
import { Search, ShieldCheck, PhoneCall, HardHat, Star, IndianRupee } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getSettings } from '../services/settingsService'
import SEO from '../components/SEO'

export default function HowItWorks() {
  const [s, setS] = useState(null)

  useEffect(() => { getSettings().then(setS) }, [])
  if (!s) return null

  const unlockText = s.unlockFee > 0 ? `₹${s.unlockFee} mein number lo` : 'Free mein contact number lo'
  const listingText = s.listingFee > 0 ? `₹${s.listingFee} mein Featured bano` : 'Free mein Featured bano'

  return (
    <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <SEO
        title="Kaise Kaam Karta Hai | Handiqo Process"
        description="Handiqo app kaise kaam karta hai — Client aur Skilled Kaamgaar ke liye step-by-step process. Har Kaam Ka Sahi Haath."
        keywords="Handiqo process, how handiqo works, hiring local mistri, hiring electrician, skilled workers India"
      />

      <div className="flex items-center gap-3 mb-3">
        <img src="/handiqo_final_app_icon.svg" alt="Handiqo Logo" className="h-10 w-10 object-contain" />
        <h1 className="font-display text-4xl font-black text-ink">Handiqo Kaise Kaam Karta Hai?</h1>
      </div>
      <p className="max-w-xl text-steel font-medium text-sm">Handiqo platform do tarah ke logon ko jodta hai — jinhe kaamgaar chahiye, aur jo verified skilled worker hain.</p>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div className="badge-card rounded-md p-6 shadow-sm border-2 border-ink">
          <span className="badge-punch" />
          <p className="font-display text-2xl font-bold text-ink">Client Ke Liye</p>
          <ol className="mt-4 space-y-4">
            <Step icon={Search} title="Search Karo" desc="Category aur sheher chuno, Handiqo verified profiles turant dikhenge." />
            <Step icon={ShieldCheck} title="Profile & Rating Dekho" desc="Rating, anubhav, daily rate aur badge dekh kar sahi banda chuno." />
            <Step icon={PhoneCall} title={unlockText} desc={s.unlockFee > 0 ? `Ek baar unlock karein, ${s.unlockValidDays} din tak dobara koi fee nahi.` : 'Handiqo par abhi ye bilkul 100% free hai.'} />
          </ol>
        </div>

        <div className="badge-card rounded-md p-6 shadow-sm border-2 border-ink">
          <span className="badge-punch" />
          <p className="font-display text-2xl font-bold text-ink">Kaamgaar Ke Liye</p>
          <ol className="mt-4 space-y-4">
            <Step icon={HardHat} title="Free Profile Registration" desc="Apna naam, kaam, Daily rate aur location daalo — zero charge." />
            <Step icon={ShieldCheck} title="Verification Badge" desc="Admin verify hone ke baad Handiqo Verified badge aayega aur profile search mein aane lagegi." />
            <Step icon={Star} title={listingText} desc={`${s.featuredDays} din tak apni category mein sabse upar dikhein, zyada direct calls paayein.`} />
          </ol>
        </div>
      </div>

      <div className="badge-card mt-8 rounded-md p-6 shadow-sm">
        <span className="badge-punch" />
        <p className="flex items-center gap-2 font-display text-2xl font-bold text-ink"><IndianRupee size={22} /> Booking Complete Hone Par</p>
        <p className="mt-2 max-w-2xl text-sm text-steel leading-relaxed font-medium">
          {s.commissionPercent > 0 ? (
            <>Kaam poora hone ke baad, kaamgaar final amount daal ke booking complete karta hai. Us par sirf{' '}
              <strong className="text-ink">{s.commissionPercent}%</strong> (kam se kam ₹{s.commissionMin}) ka platform commission lagta hai —
              client se koi extra hidden charge nahi.</>
          ) : (
            <>Handiqo par abhi commission 0% hai — kaam poora hone par koi extra charge nahi lagta.</>
          )}
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/browse" className="rounded bg-signal px-6 py-3 text-sm font-bold text-ink hover:bg-signal-deep transition-all">Kaamgaar Dhundo</Link>
        <Link to="/register-labour" className="rounded border-2 border-ink px-6 py-3 text-sm font-bold text-ink hover:bg-ink hover:text-paper transition-all">Kaamgaar Register Karo</Link>
      </div>
    </main>
  )
}

function Step({ icon: Icon, title, desc }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper text-indigo font-bold"><Icon size={17} /></span>
      <div>
        <p className="font-bold text-ink text-base">{title}</p>
        <p className="text-xs text-steel font-medium leading-relaxed">{desc}</p>
      </div>
    </li>
  )
}
