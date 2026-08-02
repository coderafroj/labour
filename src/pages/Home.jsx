import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShieldCheck, PhoneCall, ArrowRight, User } from 'lucide-react'
import { listCategories } from '../services/categoryService'
import { browseLabourers } from '../services/labourService'
import { getSettings } from '../services/settingsService'
import CategoryIcon from '../components/CategoryIcon'
import LabourCard from '../components/LabourCard'
import Loader from '../components/Loader'

const STEPS = [
  { n: '01', title: 'Category aur sheher chuno', desc: 'Mistri, electrician, plumber — jo bhi kaam chahiye, search karo.', icon: Search },
  { n: '02', title: 'Verified profile dekho', desc: 'Rating, anubhav, rate — sab pehle se saaf-saaf likha hoga.', icon: ShieldCheck },
  { n: '03', title: '₹19 mein number unlock karo', desc: 'Ek chhota sa charge, aur seedha unka mobile number mil jaata hai.', icon: PhoneCall },
]

export default function Home() {
  const [categories, setCategories] = useState([])
  const [featured, setFeatured] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState('')
  const [categorySlug, setCategorySlug] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      try {
        const [cats, labourers, s] = await Promise.all([
          listCategories(),
          browseLabourers({ limit: 6 }),
          getSettings(),
        ])
        setCategories(cats)
        setFeatured(labourers.documents)
        setSettings(s)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (categorySlug) params.set('category', categorySlug)
    if (city) params.set('city', city)
    navigate(`/browse?${params.toString()}`)
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-paper-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
          <div className="flex flex-col justify-center">
            <span className="w-fit rounded-sm bg-ink px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest text-signal">
              10 shehron mein live
            </span>
            <h1 className="mt-4 font-display text-5xl font-bold leading-[0.95] text-ink sm:text-6xl">
              Har kaam ke liye,<br /> <span className="text-rust">sahi haath.</span>
            </h1>
            <p className="mt-4 max-w-md text-base text-steel">
              Mistri, electrician, plumber, painter — apne mohalle ke verified kaamgaar dhundo,
              seedha unka number lo, bina kisi bichauliye ke.
            </p>

            <form onSubmit={handleSearch} className="badge-card mt-7 flex flex-col gap-2 rounded-md p-3 sm:flex-row">
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="flex-1 rounded border border-paper-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-indigo"
              >
                <option value="">Koi bhi category</option>
                {categories.map((c) => (
                  <option key={c.$id} value={c.slug}>{c.name}</option>
                ))}
              </select>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Sheher ka naam"
                className="flex-1 rounded border border-paper-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-indigo"
              />
              <button type="submit" className="flex items-center justify-center gap-1.5 rounded bg-signal px-5 py-2.5 text-sm font-semibold text-ink hover:bg-signal-deep">
                <Search size={16} /> Dhundo
              </button>
            </form>
            <p className="mt-3 font-mono text-xs text-steel">
              {settings && settings.unlockFee > 0 ? `Free hai — sirf number dekhne ka ₹${settings.unlockFee} lagta hai.` : 'Abhi bilkul free hai — number dekhne ka bhi koi charge nahi.'}
            </p>
          </div>

          {/* Fanned ID badge stack */}
          <div className="relative hidden items-center justify-center md:flex">
            <div className="relative h-80 w-64">
              {[{ rot: -8, top: 30, name: 'Ramesh Yadav', role: 'Electrician', z: 1 },
                { rot: 4, top: 10, name: 'Suresh Kumar', role: 'Mistri', z: 2 },
                { rot: -2, top: 0, name: 'Anita Devi', role: 'House Help', z: 3 }].map((c) => (
                <div
                  key={c.name}
                  style={{ transform: `rotate(${c.rot}deg)`, top: c.top, zIndex: c.z }}
                  className="badge-card absolute left-0 w-64 rounded-md p-4"
                >
                  <span className="badge-punch" />
                  <div className="mb-3 flex items-center gap-3 pt-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink bg-paper">
                      <User size={22} className="text-steel" />
                    </div>
                    <div>
                      <p className="font-display text-lg font-semibold text-ink">{c.name}</p>
                      <p className="text-xs font-medium text-rust">{c.role}</p>
                    </div>
                  </div>
                  <div className="stamp mx-auto w-fit rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase">
                    Verified
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-3xl font-bold text-ink">Category Se Dhundo</h2>
          <Link to="/browse" className="flex items-center gap-1 text-sm font-medium text-indigo hover:underline">
            Sab dekho <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? <Loader /> : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {categories.map((c) => (
              <Link
                key={c.$id}
                to={`/browse?category=${c.slug}`}
                className="group flex flex-col items-center gap-2 rounded-md border border-paper-line bg-white px-3 py-5 text-center transition-colors hover:border-ink"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-paper text-indigo group-hover:bg-signal group-hover:text-ink">
                  <CategoryIcon name={c.icon} size={20} />
                </span>
                <span className="text-sm font-medium text-ink">{c.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* How it works — a real 3-step sequence, numbering earns its place */}
      <section className="border-y border-paper-line bg-indigo text-paper">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl font-bold">3 Step Mein Kaam Ho Jayega</h2>
          <div className="mt-9 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="relative border-t border-paper/20 pt-5">
                <span className="font-mono text-sm text-signal">{s.n}</span>
                <s.icon size={26} className="my-3 text-signal" />
                <p className="font-display text-xl font-semibold">{s.title}</p>
                <p className="mt-1.5 text-sm text-paper/70">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured labourers */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-3xl font-bold text-ink">Featured Kaamgaar</h2>
            <Link to="/browse" className="flex items-center gap-1 text-sm font-medium text-indigo hover:underline">
              Sab dekho <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((l) => <LabourCard key={l.$id} labourer={l} />)}
          </div>
        </section>
      )}

      {/* Become a labourer CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col items-start gap-4 rounded-md border border-paper-line bg-white p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-2xl font-bold text-ink">Aap kaam karte ho? Apna naam register karo — free hai.</p>
            <p className="mt-1 text-sm text-steel">Zyada clients tak pahuncho, apni profile featured karke aage dikho.</p>
          </div>
          <Link to="/register-labour" className="shrink-0 rounded bg-ink px-6 py-3 text-sm font-semibold text-paper hover:bg-indigo-deep">
            Free Mein Register Karo
          </Link>
        </div>
      </section>
    </div>
  )
}
