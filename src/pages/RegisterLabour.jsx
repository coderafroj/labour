import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, ImagePlus, MapPin, CheckCircle2, ArrowRight, ArrowLeft, User, Briefcase, IndianRupee, Sparkles } from 'lucide-react'
import { listCategories } from '../services/categoryService'
import { registerLabourer, uploadPhoto, getMyLabourerProfile } from '../services/labourService'
import { useAuth } from '../hooks/useAuth'
import Loader from '../components/Loader'
import SEO from '../components/SEO'

// Each step only asks what it needs to — nobody wants to fill one giant
// form on a phone. The person answers a few friendly questions at a time,
// sees their progress, and can always go back and fix something.
const STEPS = [
  { key: 'basics', title: 'Aapka Parichay', icon: User, question: 'Sabse pehle, aapka naam aur number kya hai?' },
  { key: 'location', title: 'Kaam Kahan Karte Hain', icon: MapPin, question: 'Clients aapko kahan dhundhenge?' },
  { key: 'work', title: 'Aapka Kaam', icon: Briefcase, question: 'Aap kis kaam mein mahir hain?' },
  { key: 'rate', title: 'Rate & Anubhav', icon: IndianRupee, question: 'Aapka rate aur anubhav kitna hai?' },
  { key: 'extra', title: 'Aakhri Chhu', icon: Sparkles, question: 'Apni profile ko thoda aur behtar banayein (optional)' },
]

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
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: '', phone: '', address: '', city: '', categorySlug: '',
    experienceYears: '', dailyRate: '', bio: '',
  })

  useEffect(() => { listCategories().then(setCategories) }, [])

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
      setError('Aapke browser mein GPS support nahi hai.')
      return
    }
    setDetectingLoc(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setDetectingLoc(false)
      },
      (err) => {
        setError('Location detect nahi ho paya: ' + err.message)
        setDetectingLoc(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // What's required before "Aage Badho" is allowed on each step — this is
  // the whole reason the form feels short: it only checks what's on
  // screen right now, not the entire form at once.
  const stepValid = () => {
    if (step === 0) return form.name.trim().length > 1 && /^\d{10}$/.test(form.phone)
    if (step === 1) return form.address.trim().length > 3 && form.city.trim().length > 1
    if (step === 2) return form.categorySlug !== ''
    if (step === 3) return Number(form.experienceYears) >= 0 && Number(form.dailyRate) > 0
    return true
  }

  const handleNext = () => {
    if (!user) return navigate('/login', { state: { from: '/register-labour' } })
    setError('')
    if (!stepValid()) {
      setError('Pehle ye step poora bharein.')
      return
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const handleBack = () => setStep((s) => Math.max(s - 1, 0))

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

  const current = STEPS[step]

  return (
    <main className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <SEO
        title="Kaamgaar Profile Register Karein | Handiqo"
        description="Handiqo par apni skilled worker / labour profile bilkul free mein register karein. Local clients se seedha kaam paayein."
      />

      <div className="mb-6 flex items-center gap-3">
        <img src="/handiqo_final_app_icon.svg" alt="Handiqo Logo" className="h-11 w-11 object-contain" />
        <div>
          <h1 className="font-display text-3xl font-black text-ink">Kaamgaar Profile Banayein</h1>
          <p className="text-xs font-semibold text-steel">100% Free. Bas {STEPS.length} chhote steps.</p>
        </div>
      </div>

      {!user && (
        <div className="mb-6 rounded-md border-2 border-signal bg-signal/15 p-4 text-sm font-semibold text-ink">
          Shuru karne se pehle <button onClick={() => navigate('/login', { state: { from: '/register-labour' } })} className="font-bold text-indigo underline">Handiqo Login / Signup</button> karein.
        </div>
      )}

      {/* Progress dots */}
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-mono text-xs font-bold transition-all ${
                i < step ? 'border-verified bg-verified text-white' :
                i === step ? 'border-ink bg-ink text-signal' :
                'border-paper-line bg-white text-steel'
              }`}
            >
              {i < step ? <CheckCircle2 size={16} /> : i + 1}
            </div>
            {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 ${i < step ? 'bg-verified' : 'bg-paper-line'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={step === STEPS.length - 1 ? handleSubmit : (e) => e.preventDefault()} className="badge-card space-y-5 rounded-md p-6 shadow-sm border-2 border-ink">
        <span className="badge-punch" />

        <div className="flex items-center gap-2 border-b border-dashed border-paper-line pb-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-signal/20 text-ink">
            <current.icon size={18} />
          </span>
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-steel">Step {step + 1} / {STEPS.length} — {current.title}</p>
            <p className="font-display text-lg font-bold text-ink">{current.question}</p>
          </div>
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <Field label="Aapka Pura Naam"><input required autoFocus value={form.name} onChange={update('name')} className="input" placeholder="e.g. Ramesh Kumar" /></Field>
            <Field label="Mobile Number"><input required pattern="[0-9]{10}" title="10 digit number" value={form.phone} onChange={update('phone')} className="input" placeholder="9876543210" /></Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Field label="Sheher"><input required value={form.city} onChange={update('city')} className="input" placeholder="e.g. Bareilly, Delhi, Lucknow" /></Field>
            <Field label="Pura Address">
              <textarea required value={form.address} onChange={update('address')} className="input min-h-20" placeholder="Ghar ya dukaan ka pura pata" />
            </Field>
            <Field label="GPS Location (Pass Ke Clients Ke Liye — optional)">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={detectingLoc}
                  className="flex items-center gap-1.5 rounded border border-paper-line bg-paper px-3.5 py-2.5 text-xs font-bold text-ink hover:border-ink disabled:opacity-60"
                >
                  {detectingLoc ? <Loader2 size={14} className="animate-spin text-steel" /> : <MapPin size={14} className="text-rust" />}
                  {locationCoords ? 'Location Update Karein' : '📍 Meri Live GPS Location Add Karein'}
                </button>
                {locationCoords && <span className="flex items-center gap-1 text-xs font-bold text-verified"><CheckCircle2 size={14} /> Added</span>}
              </div>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Field label="Category">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {categories.map((c) => (
                  <button
                    key={c.$id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, categorySlug: c.slug }))}
                    className={`rounded-md border-2 px-3 py-3 text-center text-xs font-bold transition-all ${
                      form.categorySlug === c.slug ? 'border-ink bg-ink text-signal' : 'border-paper-line bg-white text-ink hover:border-ink'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
              {categories.length === 0 && <p className="text-xs text-steel">Categories load ho rahi hain...</p>}
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Field label="Anubhav (kitne saal se kaam kar rahe hain)"><input required type="number" min="0" value={form.experienceYears} onChange={update('experienceYears')} className="input" placeholder="e.g. 5" /></Field>
            <Field label="Aapka Daily Rate (₹ per din)"><input required type="number" min="1" value={form.dailyRate} onChange={update('dailyRate')} className="input" placeholder="e.g. 600" /></Field>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <Field label="Apne Baare Mein Kuch Likhein (optional)">
              <textarea value={form.bio} onChange={update('bio')} className="input min-h-16" placeholder="Kis tarah ka kaam sabse behtareen karte hain" />
            </Field>
            <Field label="Apni Photo Lagayein (optional, lekin trust badhati hai)">
              <label className="flex w-fit cursor-pointer items-center gap-2 rounded border border-dashed border-paper-line px-4 py-2.5 text-sm font-semibold text-steel hover:border-ink">
                <ImagePlus size={16} />
                {photoFile ? photoFile.name : 'Photo Chuno'}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files[0])} />
              </label>
            </Field>
          </div>
        )}

        {error && <p className="text-sm font-semibold text-danger">{error}</p>}

        <div className="flex items-center justify-between border-t border-paper-line pt-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0}
            className="flex items-center gap-1.5 rounded px-4 py-2.5 text-sm font-bold text-steel hover:text-ink disabled:opacity-0"
          >
            <ArrowLeft size={15} /> Peeche
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded bg-ink px-6 py-2.5 text-sm font-bold text-paper hover:bg-indigo-deep"
            >
              Aage Badho <ArrowRight size={15} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded bg-signal px-6 py-2.5 text-sm font-bold text-ink hover:bg-signal-deep disabled:opacity-60"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Free Mein Register Karo
            </button>
          )}
        </div>
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
