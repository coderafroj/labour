import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HardHat, Loader2, ImagePlus, MapPin, CheckCircle2 } from 'lucide-react'
import { listCategories } from '../services/categoryService'
import { registerLabourer, uploadPhoto, getMyLabourerProfile } from '../services/labourService'
import { useAuth } from '../hooks/useAuth'
import Loader from '../components/Loader'

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

  if (authLoading || checking) return <Loader />

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex items-center gap-2">
        <span className="flex h-11 w-11 items-center justify-center rounded bg-ink text-signal"><HardHat size={22} /></span>
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Labour Ke Roop Mein Register Karo</h1>
          <p className="text-sm text-steel">Free hai. Registration ke baad admin verify karega, phir profile live ho jayegi.</p>
        </div>
      </div>

      {!user && (
        <p className="mb-4 rounded-md border border-signal bg-signal/10 p-3 text-sm text-ink">
          Form bharne se pehle <button onClick={() => navigate('/login', { state: { from: '/register-labour' } })} className="font-semibold underline">login / signup</button> karna hoga.
        </p>
      )}

      <form onSubmit={handleSubmit} className="badge-card space-y-4 rounded-md p-6">
        <span className="badge-punch" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Pura Naam"><input required value={form.name} onChange={update('name')} className="input" /></Field>
          <Field label="Mobile Number"><input required pattern="[0-9]{10}" title="10 digit number" value={form.phone} onChange={update('phone')} className="input" placeholder="9876543210" /></Field>
        </div>
        <Field label="Pura Address">
          <textarea required value={form.address} onChange={update('address')} className="input min-h-20" placeholder="Ghar/dukaan ka pura pata" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sheher"><input required value={form.city} onChange={update('city')} className="input" placeholder="e.g. Delhi, Lucknow, Patna" /></Field>
          <Field label="Category">
            <select required value={form.categorySlug} onChange={update('categorySlug')} className="input">
              <option value="">Chuno</option>
              {categories.map((c) => <option key={c.$id} value={c.slug}>{c.name}</option>)}
            </select>
          </Field>
        </div>

        <Field label="GPS Geolocation (Pass Ke Clients Ke Liye)">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={detectingLoc}
              className="flex items-center gap-1.5 rounded border border-paper-line bg-paper px-3 py-2 text-xs font-semibold text-ink hover:border-ink disabled:opacity-60"
            >
              {detectingLoc ? <Loader2 size={14} className="animate-spin text-steel" /> : <MapPin size={14} className="text-rust" />}
              {locationCoords ? 'Location Update Karo' : '📍 Meri GPS Location Add Karo'}
            </button>
            {locationCoords && (
              <span className="flex items-center gap-1 text-xs font-semibold text-verified">
                <CheckCircle2 size={14} /> Location Added ({locationCoords.lat.toFixed(4)}, {locationCoords.lng.toFixed(4)})
              </span>
            )}
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Anubhav (saal)"><input required type="number" min="0" value={form.experienceYears} onChange={update('experienceYears')} className="input" /></Field>
          <Field label="Rate (₹ per din)"><input required type="number" min="0" value={form.dailyRate} onChange={update('dailyRate')} className="input" /></Field>
        </div>
        <Field label="Apne Baare Mein (optional)">
          <textarea value={form.bio} onChange={update('bio')} className="input min-h-16" placeholder="Kis tarah ka kaam sabse acha karte ho" />
        </Field>
        <Field label="Photo (optional)">
          <label className="flex w-fit cursor-pointer items-center gap-2 rounded border border-dashed border-paper-line px-4 py-2.5 text-sm text-steel hover:border-ink">
            <ImagePlus size={16} />
            {photoFile ? photoFile.name : 'Photo chuno'}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files[0])} />
          </label>
        </Field>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded bg-ink py-3 text-sm font-semibold text-paper hover:bg-indigo-deep disabled:opacity-60"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          Free Mein Register Karo
        </button>
      </form>

      <style>{`.input { width: 100%; border: 1px solid var(--color-paper-line); border-radius: 4px; padding: 0.6rem 0.75rem; font-size: 0.875rem; background: white; outline: none; }
      .input:focus { border-color: var(--color-indigo); }`}</style>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-steel">{label}</span>
      {children}
    </label>
  )
}
