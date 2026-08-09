import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SearchX, MapPin, Loader2 } from 'lucide-react'
import { listCategories } from '../services/categoryService'
import { browseLabourers, calculateDistance } from '../services/labourService'
import LabourCard from '../components/LabourCard'
import Loader from '../components/Loader'

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-ink">Kaam Wale Dhundo</h1>
          <p className="mt-1 text-sm text-steel">{total} verified kaamgaar milte hain LabourConnect par</p>
        </div>
        <button
          onClick={handleToggleNearMe}
          disabled={gettingLoc}
          className={`flex items-center gap-2 rounded px-4 py-2.5 text-sm font-semibold transition-colors ${
            nearMeActive ? 'bg-rust text-paper' : 'border border-paper-line bg-paper text-ink hover:border-ink'
          }`}
        >
          {gettingLoc ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
          {nearMeActive ? '📍 Near Me Active (Pass Wale Top Pe)' : '📍 Pass Ke Kaamgaar (Near Me)'}
        </button>
      </div>

      {locError && <p className="mt-2 text-xs text-danger">{locError}</p>}

      <div className="badge-card mt-6 flex flex-col gap-3 rounded-md p-4 sm:flex-row">
        <select
          value={categorySlug}
          onChange={(e) => updateParam('category', e.target.value)}
          className="rounded border border-paper-line bg-white px-3 py-2 text-sm outline-none focus:border-indigo sm:w-56"
        >
          <option value="">Sab Category</option>
          {categories.map((c) => <option key={c.$id} value={c.slug}>{c.name}</option>)}
        </select>
        <input
          defaultValue={city}
          onBlur={(e) => updateParam('city', e.target.value)}
          placeholder="Sheher"
          className="rounded border border-paper-line bg-white px-3 py-2 text-sm outline-none focus:border-indigo sm:w-48"
        />
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
          <input
            defaultValue={search}
            onBlur={(e) => updateParam('q', e.target.value)}
            placeholder="Naam se search karo"
            className="w-full rounded border border-paper-line bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo"
          />
        </div>
      </div>

      {loading && labourers.length === 0 ? (
        <Loader label="Kaamgaar dhundhe ja rahe hain..." />
      ) : labourers.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center text-steel">
          <SearchX size={36} />
          <p className="font-display text-xl font-semibold text-ink">Koi kaamgaar nahi mila</p>
          <p className="text-sm">Category ya sheher badal kar dobara try karo.</p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sortedLabourers.map((l) => (
              <LabourCard key={l.$id} labourer={l} categoryIcon={categoryIconFor(l.categorySlug)} userCoords={userCoords} />
            ))}
          </div>
          {labourers.length < total && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="rounded border border-ink px-6 py-2.5 text-sm font-semibold text-ink hover:bg-ink hover:text-paper disabled:opacity-50"
              >
                {loading ? 'Load ho raha hai...' : 'Aur Dikhao'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
