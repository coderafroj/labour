import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, ImagePlus, MapPin, CheckCircle2 } from 'lucide-react'
import { listCategories } from '../services/categoryService'
import { registerLabourer, uploadPhoto, getMyLabourerProfile } from '../services/labourService'
import { useAuth } from '../hooks/useAuth'
import Loader from '../components/Loader'
import SEO from '../components/SEO'

export default function RegisterLabour() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [checking, setChecking] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [detectingLoc, setDetectingLoc] = useState(false)
  const [locationCoords, setLocationCoords] = useState(null)
  const [error, setError] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [form, setForm] = useState({
    name: '', phone: '', address: '', city: '', categorySlug: '',
    experienceYears: '', dailyRate: '', bio: '',
  })

  useEffect(() => {
    listCategories().then(setCategories)
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) { setChecking(false); return }
    getMyLabourerProfile(user.$id).then((doc) => {
      if (doc) navigate('/dashboard')
      else setChecking(false)
    })
  }, [user, authLoading, navigate])

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Aapke browser mein GPS Geolocation support nahi hai.')
      return
    }
    setDetectingLoc(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
        setDetectingLoc(false)
      },
      (err) => {
        setError('Location detect nahi ho paya. Permission allow karein ya sheher ka naam manual daalein: ' + err.message)
        setDetectingLoc(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return navigate('/login', { state: { from: '/register-labour' } })
    setSubmitting(true)
    setError('')
    try {
      const category = categories.find((c) => c.slug === form.categorySlug)
      let photoUrl = ''
      if (photoFile) photoUrl = await uploadPhoto(photoFile)
      await registerLabourer({
        ownerUserId: user.$id,
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        categorySlug: form.categorySlug,
        categoryName: category?.name || '',
        experienceYears: form.experienceYears,
        dailyRate: form.dailyRate,
        bio: form.bio,
        photoUrl,
        lat: locationCoords?.lat,
        lng: locationCoords?.lng,
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || checking) return <Loader label="Handiqo registration check ho raha hai..." />

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <SEO
        title="Kaamgaar Profile Register Karein | Handiqo"
        description="Handiqo par apni skilled worker / labour profile bilkul free mein register karein. Local clients se seedha kaam paayein."
      />

      <div className="mb-6 flex items-center gap-3">
        <img src="/handiqo_final_app_icon.svg" alt="Handiqo Logo" className="h-11 w-11 object-contain" />
        <div>
          <h1 className="font-display text-3xl font-black text-ink">Kaamgaar Profile Register Karein</h1>
          <p className="text-xs font-semibold text-steel">100% Free registration. Admin verification ke baad aapki profile live ho jayegi.</p>
        </div>
      </div>

      {!user && (
        <div className="mb-6 rounded-md border-2 border-signal bg-signal/15 p-4 text-sm font-semibold text-ink">
          Form bharne se pehle <button onClick={() => navigate('/login', { state: { from: '/register-labour' } })} className="font-bold text-indigo underline">Handiqo Login / Signup</button> karein.
        </div>
      )}

      <form onSubmit={handleSubmit} className="badge-card space-y-4 rounded-md p-6 shadow-sm border-2 border-ink">
        <span className="badge-punch" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Pura Naam"><input required value={form.name} onChange={update('name')} className="input" placeholder="Apna naam daalein" /></Field>
          <Field label="Mobile Number"><input required pattern="[0-9]{10}" title="10 digit number" value={form.phone} onChange={update('phone')} className="input" placeholder="9876543210" /></Field>
        </div>
        <Field label="Pura Address">
          <textarea required value={form.address} onChange={update('address')} className="input min-h-20" placeholder="Ghar ya dukaan ka pura pata" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sheher"><input required value={form.city} onChange={update('city')} className="input" placeholder="e.g. Bareilly, Delhi, Lucknow" /></Field>
          <Field label="Category">
            <select required value={form.categorySlug} onChange={update('categorySlug')} className="input">
              <option value="">Category Chuno</option>
              {categories.map((c) => <option key={c.$id} value={c.slug}>{c.name}</option>)}
            </select>
          </Field>
        </div>

        <Field label="GPS Location (Pass Ke Clients Ke Liye)">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={detectingLoc}
              className="flex items-center gap-1.5 rounded border border-paper-line bg-paper px-3.5 py-2.5 text-xs font-bold text-ink hover:border-ink disabled:opacity-60 transition-all"
            >
              {detectingLoc ? <Loader2 size={14} className="animate-spin text-steel" /> : <MapPin size={14} className="text-rust" />}
              {locationCoords ? 'Location Update Karein' : '📍 Meri Live GPS Location Add Karein'}
            </button>
            {locationCoords && (
              <span className="flex items-center gap-1 text-xs font-bold text-verified">
                <CheckCircle2 size={14} /> GPS Location Added
              </span>
            )}
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Anubhav (saal)"><input required type="number" min="0" value={form.experienceYears} onChange={update('experienceYears')} className="input" placeholder="e.g. 5" /></Field>
          <Field label="Daily Rate (₹ per din)"><input required type="number" min="0" value={form.dailyRate} onChange={update('dailyRate')} className="input" placeholder="e.g. 600" /></Field>
        </div>
        <Field label="Apne Baare Mein (optional)">
          <textarea value={form.bio} onChange={update('bio')} className="input min-h-16" placeholder="Kis tarah ka kaam sabse behtareen karte hain" />
        </Field>
        <Field label="Photo Upload (optional)">
          <label className="flex w-fit cursor-pointer items-center gap-2 rounded border border-dashed border-paper-line px-4 py-2.5 text-sm font-semibold text-steel hover:border-ink">
            <ImagePlus size={16} />
            {photoFile ? photoFile.name : 'Apni Photo Chuno'}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files[0])} />
          </label>
        </Field>

        {error && <p className="text-sm font-semibold text-danger">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded bg-ink py-3 text-sm font-bold text-paper hover:bg-indigo-deep disabled:opacity-60 transition-all"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          Free Mein Register Karo
        </button>
      </form>

      <style>{`.input { width: 100%; border: 1px solid var(--color-paper-line); border-radius: 4px; padding: 0.65rem 0.85rem; font-size: 0.875rem; background: white; outline: none; font-weight: 500; }
      .input:focus { border-color: var(--color-indigo); }`}</style>
    </main>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-steel">{label}</span>
      {children}
    </label>
  )
}
