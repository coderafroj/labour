import { useEffect, useState } from 'react'
import { IndianRupee, Loader2, CheckCircle2, Sliders, Megaphone, ShieldAlert, PhoneCall } from 'lucide-react'
import { getSettings, adminUpdateSettings } from '../../services/settingsService'
import Loader from '../../components/Loader'

export default function AdminSettings() {
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('pricing')

  useEffect(() => {
    getSettings().then(setForm).finally(() => setLoading(false))
  }, [])

  const updateNumber = (key) => (e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))
  const updateText = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const updateBool = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.checked }))

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
    <div className="max-w-3xl">
      <div className="mb-6 flex gap-2 rounded-md border border-paper-line bg-white p-1">
        <button
          type="button"
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold ${
            activeTab === 'pricing' ? 'bg-ink text-paper' : 'text-steel hover:bg-paper'
          }`}
        >
          <IndianRupee size={16} /> Live Monetization &amp; Pricing
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('platform')}
          className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold ${
            activeTab === 'platform' ? 'bg-ink text-paper' : 'text-steel hover:bg-paper'
          }`}
        >
          <Sliders size={16} /> App Controls &amp; Announcements
        </button>
      </div>

      <form onSubmit={handleSave} className="badge-card space-y-6 rounded-md p-6">
        <span className="badge-punch" />

        {activeTab === 'pricing' && (
          <div className="space-y-4">
            <div className="rounded-md bg-signal/10 p-3 text-xs text-ink">
              Ye fees app mein seedhe live lagoo hoti hain. <strong>0</strong> rakhne par feature automatically free ho jaata hai.
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-steel">Contact Unlock Fee (₹)</span>
                <input type="number" min="0" value={form.unlockFee} onChange={updateNumber('unlockFee')} className="input" />
                <span className="mt-1 block text-xs text-steel">Client se — phone/address reveal ka. 0 = free.</span>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-steel">Unlock Validity (Din)</span>
                <input type="number" min="1" value={form.unlockValidDays} onChange={updateNumber('unlockValidDays')} className="input" />
                <span className="mt-1 block text-xs text-steel">Paid unlock kitne din tak valid rehta hai.</span>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-steel">Featured Listing Fee (₹)</span>
                <input type="number" min="0" value={form.listingFee} onChange={updateNumber('listingFee')} className="input" />
                <span className="mt-1 block text-xs text-steel">Kaamgaar se — profile search top par laane ka.</span>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-steel">Featured Days (Din)</span>
                <input type="number" min="1" value={form.featuredDays} onChange={updateNumber('featuredDays')} className="input" />
                <span className="mt-1 block text-xs text-steel">Featured status kitne din tak active rahega.</span>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-steel">Booking Commission (%)</span>
                <input type="number" min="0" step="0.5" value={form.commissionPercent} onChange={updateNumber('commissionPercent')} className="input" />
                <span className="mt-1 block text-xs text-steel">Job complete hone par platform commission. 0 = off.</span>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-steel">Minimum Commission (₹)</span>
                <input type="number" min="0" value={form.commissionMin} onChange={updateNumber('commissionMin')} className="input" />
                <span className="mt-1 block text-xs text-steel">Chhoti booking par minimum flat commission amount.</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'platform' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-md border border-paper-line bg-paper p-4">
              <div>
                <p className="flex items-center gap-1.5 font-semibold text-ink"><ShieldAlert size={16} className="text-rust" /> Maintenance Mode</p>
                <p className="text-xs text-steel">Enable karne par app me maintenance banner dikhega.</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" checked={form.maintenanceMode} onChange={updateBool('maintenanceMode')} className="sr-only peer" />
                <div className="peer h-6 w-11 rounded-full bg-paper-line peer-checked:bg-rust peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all" />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-steel"><Megaphone size={14} /> Top Announcement Banner Text</span>
              <input type="text" value={form.announcementText} onChange={updateText('announcementText')} className="input" placeholder="e.g. 🎉 LabourConnect ab bilkul free hai! Naye kaamgaar aaj hi register karein." />
              <span className="mt-1 block text-xs text-steel">Khaali rakhne par banner nahi dikhega.</span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-steel"><PhoneCall size={14} /> Official Support Phone</span>
                <input type="text" value={form.supportPhone} onChange={updateText('supportPhone')} className="input" placeholder="+91 9876543210" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-steel">Support Email</span>
                <input type="email" value={form.supportEmail} onChange={updateText('supportEmail')} className="input" placeholder="support@labourconnect.com" />
              </label>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 border-t border-paper-line pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded bg-ink px-6 py-2.5 text-sm font-semibold text-paper hover:bg-indigo-deep disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Settings Save Karo
          </button>
          {saved && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-verified">
              <CheckCircle2 size={15} /> Settings save ho gayi hain.
            </p>
          )}
        </div>
      </form>

      <style>{`.input { width: 100%; border: 1px solid var(--color-paper-line); border-radius: 4px; padding: 0.6rem 0.75rem; font-size: 0.875rem; background: white; outline: none; }
      .input:focus { border-color: var(--color-indigo); }`}</style>
    </div>
  )
}
