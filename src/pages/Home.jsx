import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShieldCheck, PhoneCall, ArrowRight, CheckCircle2 } from 'lucide-react'
import { listCategories } from '../services/categoryService'
import { browseLabourers } from '../services/labourService'
import { getSettings } from '../services/settingsService'
import CategoryIcon from '../components/CategoryIcon'
import LabourCard from '../components/LabourCard'
import Loader from '../components/Loader'
import SEO from '../components/SEO'

const STEPS = [
  { n: '01', title: 'Category & Sheher Chuno', desc: 'Mistri, electrician, plumber, painter — jo bhi kaam chahiye, category ya sheher se khojein.', icon: Search },
  { n: '02', title: 'Verified Profile Dekho', desc: 'Kaamgaar ka rating, anubhav, daily rate aur verified badge saaf-saaf dekhein.', icon: ShieldCheck },
  { n: '03', title: 'Seedha Contact Karo', desc: 'Bina kisi bichauliye ke seedha kaamgaar ke phone number par call karke kaam karwayein.', icon: PhoneCall },
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

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Handiqo',
    url: 'https://labour-seven.vercel.app/',
    logo: 'https://labour-seven.vercel.app/handiqo_final_app_icon_512.png',
    description: 'Handiqo — Aapke sheher ke verified kaamgaar. Skilled hands, trusted work near you.',
    slogan: 'Har Kaam Ka Sahi Haath',
  }

  return (
    <main>
      <SEO
        title="Har Kaam Ka Sahi Haath | Verified Local Kaamgaar"
        description="Handiqo — Apne sheher ke verified kaamgaar (Mistri, Electrician, Plumber, Painter, Driver, aadi) dhundhein. Skilled hands, trusted work near you."
        keywords="Handiqo, handiqo app, mistri, electrician, plumber, painter, driver, local labour marketplace, skilled workers India"
        schema={schemaData}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-paper-line bg-gradient-to-b from-paper to-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest text-signal">
                <CheckCircle2 size={13} className="text-signal" /> Handiqo Verified Platform
              </span>
            </div>
            <h1 className="mt-4 font-display text-4xl font-black leading-[1.02] text-ink sm:text-6xl">
              Har Kaam Ka<br /> <span className="text-rust">Sahi Haath.</span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-steel">
              Apne sheher ke verified mistri, electrician, plumber, painter aur drivers dhundhein. Seedha contact karein — zero bichauliya, 100% bharosa!
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="badge-card mt-7 flex flex-col gap-2 rounded-md p-3 sm:flex-row shadow-sm">
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="flex-1 rounded border border-paper-line bg-white px-3.5 py-3 text-sm text-ink outline-none focus:border-indigo"
              >
                <option value="">Sabhi Categories</option>
                {categories.map((c) => (
                  <option key={c.$id} value={c.slug}>{c.name}</option>
                ))}
              </select>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Sheher ka naam (e.g. Bareilly, Delhi)"
                className="flex-1 rounded border border-paper-line bg-white px-3.5 py-3 text-sm text-ink outline-none focus:border-indigo"
              />
              <button type="submit" className="flex items-center justify-center gap-2 rounded bg-signal px-6 py-3 text-sm font-bold text-ink hover:bg-signal-deep transition-all">
                <Search size={16} /> Dhundo
              </button>
            </form>
            <p className="mt-3 font-mono text-xs text-steel">
              {settings && settings.unlockFee > 0 ? `Free search — sirf phone number dekhne ka ₹${settings.unlockFee} lagta hai.` : '✨ Abhi Handiqo par sab kuch 100% Free hai!'}
            </p>
          </div>

          {/* Handiqo Brand Card & Visual */}
          <div className="relative hidden items-center justify-center md:flex">
            <div className="relative flex flex-col items-center">
              <div className="relative p-5 bg-white rounded-2xl border-2 border-ink shadow-md">
                <img src="/handiqo_final_dp.svg" alt="Handiqo Official Emblem" className="h-64 w-64 object-contain filter drop-shadow-lg hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="badge-card mt-5 rounded-md p-4 text-center max-w-xs border-2 border-ink bg-white shadow-xs">
                <span className="badge-punch" />
                <p className="font-display text-lg font-black text-ink flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={18} className="text-verified" /> Handiqo Verified
                </p>
                <p className="text-xs text-steel mt-0.5 font-semibold">Aapke Sheher Ka Sabse Bharosemand Service Marketplace</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-ink">Category Se Khojein</h2>
            <p className="text-xs text-steel mt-0.5">Jis kaam ki zarurat ho, wahi category chuno</p>
          </div>
          <Link to="/browse" className="flex items-center gap-1 text-sm font-semibold text-indigo hover:underline">
            Sabhi Categories <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? <Loader /> : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {categories.map((c) => (
              <Link
                key={c.$id}
                to={`/browse?category=${c.slug}`}
                className="group flex flex-col items-center gap-2 rounded-md border border-paper-line bg-white px-3 py-5 text-center transition-all hover:border-ink hover:shadow-md"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper text-indigo group-hover:bg-signal group-hover:text-ink transition-colors">
                  <CategoryIcon name={c.icon} size={22} />
                </span>
                <span className="text-sm font-semibold text-ink">{c.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="border-y border-paper-line bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="text-center md:text-left">
            <span className="text-xs font-mono font-bold tracking-widest text-signal uppercase">Handiqo Process</span>
            <h2 className="font-display text-3xl font-bold mt-1">Handiqo Par Kaam Kaise Hota Hai?</h2>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="relative border-t border-paper/20 pt-6">
                <span className="font-mono text-sm font-bold text-signal">{s.n}</span>
                <s.icon size={28} className="my-3 text-signal" />
                <h3 className="font-display text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-paper/70 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured labourers */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold text-ink">Handiqo Featured Kaamgaar</h2>
              <p className="text-xs text-steel mt-0.5">Top rated aur verified mistri & skilled workers</p>
            </div>
            <Link to="/browse" className="flex items-center gap-1 text-sm font-semibold text-indigo hover:underline">
              Sabhi Dekho <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((l) => <LabourCard key={l.$id} labourer={l} />)}
          </div>
        </section>
      )}

      {/* Become a labourer CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col items-start gap-4 rounded-md border-2 border-ink bg-white p-8 md:flex-row md:items-center md:justify-between shadow-sm">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-rust uppercase">For Skilled Workers</span>
            <h2 className="font-display text-2xl font-bold text-ink mt-0.5">Aap kaam karte hain? Handiqo par free profile banayein.</h2>
            <p className="mt-1 text-sm text-steel">Zyada local clients tak pahunchein aur apne sheher mein direct kaam paayein.</p>
          </div>
          <Link to="/register-labour" className="shrink-0 rounded bg-ink px-6 py-3 text-sm font-bold text-paper hover:bg-indigo-deep transition-all">
            Free Mein Profile Register Karo
          </Link>
        </div>
      </section>
    </main>
  )
}
