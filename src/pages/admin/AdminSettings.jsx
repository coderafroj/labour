import { useEffect, useState } from 'react'
import { IndianRupee, Loader2, CheckCircle2 } from 'lucide-react'
import { getSettings, adminUpdateSettings } from '../../services/settingsService'
import Loader from '../../components/Loader'

const FIELDS = [
  { key: 'unlockFee', label: 'Contact Unlock Fee (₹)', hint: 'Client se — number/address dekhne ka. 0 = free.' },
  { key: 'unlockValidDays', label: 'Unlock Valid Days', hint: 'Ek baar paid unlock kitne din tak kaam karega.' },
  { key: 'listingFee', label: 'Featured Listing Fee (₹)', hint: 'Kaamgaar se — profile top pe dikhane ka. 0 = free.' },
  { key: 'featuredDays', label: 'Featured Days', hint: 'Featured status kitne din tak rehta hai.' },
  { key: 'commissionPercent', label: 'Booking Commission (%)', hint: 'Job complete hone par kaamgaar se. 0 = off.' },
  { key: 'commissionMin', label: 'Minimum Commission (₹)', hint: 'Chhoti booking par bhi kam se kam itna commission.' },
]

export default function AdminSettings() {
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getSettings().then(setForm).finally(() => setLoading(false))
  }, [])

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      await adminUpdateSettings(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !form) return <Loader />

  return (
    <div className="max-w-2xl">
      <div className="mb-5 rounded-md border border-signal bg-signal/10 p-4 text-sm text-ink">
        Ye numbers seedhe live app mein turant lagoo hote hain — koi code change ya
        redeploy nahi karna padta. Kisi bhi fee ko <strong>0</strong> karke
        turant free kar sakte ho.
      </div>

      <form onSubmit={handleSave} className="badge-card space-y-4 rounded-md p-6">
        <span className="badge-punch" />
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <label key={f.key} className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-steel">{f.label}</span>
              <input
                type="number"
                min="0"
                step={f.key === 'commissionPercent' ? '0.5' : '1'}
                value={form[f.key]}
                onChange={update(f.key)}
                className="w-full rounded border border-paper-line bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo"
              />
              <span className="mt-1 block text-xs text-steel">{f.hint}</span>
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded bg-ink px-6 py-2.5 text-sm font-semibold text-paper hover:bg-indigo-deep disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <IndianRupee size={16} />}
          Save Karo
        </button>
        {saved && (
          <p className="flex items-center gap-1.5 text-sm font-medium text-verified">
            <CheckCircle2 size={15} /> Save ho gaya, ab live hai.
          </p>
        )}
      </form>
    </div>
  )
}
