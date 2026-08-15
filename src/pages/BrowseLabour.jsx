import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SearchX, MapPin, Loader2 } from 'lucide-react'
import { listCategories } from '../services/categoryService'
import { browseLabourers, calculateDistance } from '../services/labourService'
import LabourCard from '../components/LabourCard'
import Loader from '../components/Loader'
import SEO from '../components/SEO'

const PAGE_SIZE = 12

export default function BrowseLabour() {
  const [params, setParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [labourers, setLabourers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [userCoords, setUserCoords] = useState(null)
  const [nearMeActive, setNearMeActive] = useState(false)
  const [gettingLoc, setGettingLoc] = useState(false)
  const [locError, setLocError] = useState('')

  const categorySlug = params.get('category') || ''
  const city = params.get('city') || ''
  const search = params.get('q') || ''

  useEffect(() => {
    listCategories().then(setCategories)
  }, [])

  useEffect(() => {
    setLoading(true)
    setPage(0)
    browseLabourers({ categorySlug, city, search, limit: PAGE_SIZE, offset: 0 })
      .then((res) => {
        setLabourers(res.documents)
        setTotal(res.total)
      })
      .finally(() => setLoading(false))
  }, [categorySlug, city, search])

  const handleToggleNearMe = () => {
    if (nearMeActive) {
      setNearMeActive(false)
      return
    }
    if (!navigator.geolocation) {
      setLocError('GPS Geolocation browser dwara supported nahi hai.')
      return
    }
    setGettingLoc(true)
    setLocError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setNearMeActive(true)
        setGettingLoc(false)
      },
      (err) => {
        setLocError('Location permission deny hui: ' + err.message)
        setGettingLoc(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const sortedLabourers = useMemo(() => {
    if (!nearMeActive || !userCoords) return labourers
    return [...labourers].sort((a, b) => {
      const distA = calculateDistance(userCoords.lat, userCoords.lng, a.lat, a.lng) ?? 999999
      const distB = calculateDistance(userCoords.lat, userCoords.lng, b.lat, b.lng) ?? 999999
      return distA - distB
    })
  }, [labourers, nearMeActive, userCoords])

  const loadMore = async () => {
    const next = page + 1
    setLoading(true)
    const res = await browseLabourers({ categorySlug, city, search, limit: PAGE_SIZE, offset: next * PAGE_SIZE })
    setLabourers((prev) => [...prev, ...res.documents])
    setPage(next)
    setLoading(false)
  }

  const updateParam = (key, value) => {
    const p = new URLSearchParams(params)
    if (value) p.set(key, value)
    else p.delete(key)
    setParams(p)
  }

  const categoryIconFor = (slug) => categories.find((c) => c.slug === slug)?.icon || 'HardHat'

  const categorySchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Verified ${currentCategoryName} ${city ? `in ${city}` : ''} — Handiqo`,
    numberOfItems: total,
    itemListElement: labourers.map((l, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: l.name,
      url: `https://handiqo.vercel.app/labour/${l.$id}`
    }))
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <SEO
        title={`Verified ${currentCategoryName} ${city ? `in ${city}` : ''} | Handiqo Labour`}
        description={`Handiqo par verified ${currentCategoryName} ${city ? `sheher ${city}` : ''} mein khojein. Rating, daily rate, anubhav aur direct phone number.`}
        keywords={`Handiqo, Handiqo ${currentCategoryName}, ${currentCategoryName} near me, ${currentCategoryName} in ${city || 'Bareilly'}, ${city || 'Bareilly'} mistri labour, verified ${currentCategoryName}`}
        schema={categorySchema}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black text-ink">Kaam Wale Dhundo</h1>
          <p className="mt-1 text-sm font-semibold text-steel">Handiqo par {total} verified kaamgaar uplabdh hain</p>
        </div>
        <button
          onClick={handleToggleNearMe}
          disabled={gettingLoc}
          className={`flex items-center gap-2 rounded px-4 py-2.5 text-sm font-bold transition-all shadow-xs ${
            nearMeActive ? 'bg-rust text-paper' : 'border border-paper-line bg-paper text-ink hover:border-ink'
          }`}
        >
          {gettingLoc ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
          {nearMeActive ? '📍 Near Me Active (Pass Wale Pehle)' : '📍 Pass Ke Kaamgaar (Near Me)'}
        </button>
      </div>

      {locError && <p className="mt-2 text-xs text-danger">{locError}</p>}

      <div className="badge-card mt-6 flex flex-col gap-3 rounded-md p-4 sm:flex-row shadow-sm">
        <select
          value={categorySlug}
          onChange={(e) => updateParam('category', e.target.value)}
          className="rounded border border-paper-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-indigo sm:w-56 font-medium"
        >
          <option value="">Sabhi Category</option>
          {categories.map((c) => <option key={c.$id} value={c.slug}>{c.name}</option>)}
        </select>
        <input
          defaultValue={city}
          onBlur={(e) => updateParam('city', e.target.value)}
          placeholder="Sheher ka naam"
          className="rounded border border-paper-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-indigo sm:w-48 font-medium"
        />
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-steel" />
          <input
            defaultValue={search}
            onBlur={(e) => updateParam('q', e.target.value)}
            placeholder="Naam se search karein"
            className="w-full rounded border border-paper-line bg-white py-2.5 pl-10 pr-3.5 text-sm text-ink outline-none focus:border-indigo font-medium"
          />
        </div>
      </div>

      {loading && labourers.length === 0 ? (
        <Loader label="Handiqo verified kaamgaar khoje ja rahe hain..." />
      ) : labourers.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center text-steel">
          <SearchX size={40} className="text-steel/60" />
          <h2 className="font-display text-2xl font-bold text-ink">Koi kaamgaar nahi mila</h2>
          <p className="text-sm max-w-sm">Aap selected category ya sheher badal kar dobara search karein.</p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sortedLabourers.map((l) => (
              <LabourCard key={l.$id} labourer={l} categoryIcon={categoryIconFor(l.categorySlug)} userCoords={userCoords} />
            ))}
          </div>
          {labourers.length < total && (
            <div className="mt-10 text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="rounded border-2 border-ink px-8 py-3 text-sm font-bold text-ink hover:bg-ink hover:text-paper transition-all disabled:opacity-50"
              >
                {loading ? 'Load ho raha hai...' : 'Aur Dikhao'}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  )
}
