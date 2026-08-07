import { useEffect, useState } from 'react'
import { Plus, Check, X, BadgeCheck, Loader2 } from 'lucide-react'
import { adminListAllLabourers, adminSetStatus, adminSetVerified, registerLabourer } from '../../services/labourService'
import { listCategories } from '../../services/categoryService'
import { useAuth } from '../../hooks/useAuth'
import { LABOUR_STATUS } from '../../lib/constants'
import Loader from '../../components/Loader'

const TABS = [
  { key: '', label: 'Sab' },
  { key: LABOUR_STATUS.PENDING, label: 'Pending' },
  { key: LABOUR_STATUS.APPROVED, label: 'Approved' },
  { key: LABOUR_STATUS.REJECTED, label: 'Rejected' },
]

export default function AdminLabourers() {
  const { user } = useAuth()
  const [tab, setTab] = useState('')
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [categories, setCategories] = useState([])

  const load = () => {
    setLoading(true)
    adminListAllLabourers({ status: tab || undefined, limit: 100 }).then((res) => setList(res.documents)).finally(() => setLoading(false))
  }

  useEffect(load, [tab])
  useEffect(() => { listCategories().then(setCategories) }, [])

  const setStatus = async (id, status) => {
    await adminSetStatus(id, status)
    setList((l) => l.map((x) => (x.$id === id ? { ...x, status } : x)))
  }

  const toggleVerified = async (id, verified) => {
    await adminSetVerified(id, !verified)
    setList((l) => l.map((x) => (x.$id === id ? { ...x, verified: !verified } : x)))
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 overflow-x-auto rounded-md border border-paper-line bg-white p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded px-3 py-1.5 text-xs font-semibold ${tab === t.key ? 'bg-ink text-paper' : 'text-steel'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1.5 rounded bg-signal px-4 py-2 text-sm font-semibold text-ink hover:bg-signal-deep">
          <Plus size={16} /> Labour Add Karo
        </button>
      </div>

      {showAdd && (
        <AddLabourForm
          categories={categories}
          adminUserId={user.$id}
          onDone={() => { setShowAdd(false); load() }}
        />
      )}

      {loading ? <Loader /> : (
        <div className="overflow-x-auto rounded-md border border-paper-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-paper-line bg-paper text-xs uppercase text-steel">
              <tr>
                <th className="p-3">Naam</th><th className="p-3">Category</th><th className="p-3">Sheher</th>
                <th className="p-3">Status</th><th className="p-3">Verified</th><th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((l) => (
                <tr key={l.$id} className="border-b border-paper-line last:border-0">
                  <td className="p-3 font-medium text-ink">{l.name}</td>
                  <td className="p-3 text-steel">{l.categoryName}</td>
                  <td className="p-3 text-steel">{l.city}</td>
                  <td className="p-3 capitalize">{l.status}</td>
                  <td className="p-3">
                    <button onClick={() => toggleVerified(l.$id, l.verified)} className={`flex items-center gap-1 text-xs font-semibold ${l.verified ? 'text-verified' : 'text-steel'}`}>
                      <BadgeCheck size={14} /> {l.verified ? 'Haan' : 'Nahi'}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {l.status !== LABOUR_STATUS.APPROVED && (
                        <button onClick={() => setStatus(l.$id, LABOUR_STATUS.APPROVED)} className="rounded bg-verified px-2 py-1 text-xs font-semibold text-white"><Check size={13} /></button>
                      )}
                      {l.status !== LABOUR_STATUS.REJECTED && (
                        <button onClick={() => setStatus(l.$id, LABOUR_STATUS.REJECTED)} className="rounded bg-danger px-2 py-1 text-xs font-semibold text-white"><X size={13} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-steel">Koi labourer nahi mila</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function AddLabourForm({ categories, adminUserId, onDone }) {
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', categorySlug: '', experienceYears: '', dailyRate: '' })
  const [submitting, setSubmitting] = useState(false)
  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const category = categories.find((c) => c.slug === form.categorySlug)
      const doc = await registerLabourer({ ownerUserId: adminUserId, ...form, categoryName: category?.name || '' })
      await adminSetStatus(doc.$id, LABOUR_STATUS.APPROVED)
      onDone()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-5 grid gap-3 rounded-md border border-paper-line bg-white p-4 sm:grid-cols-3">
      <input required placeholder="Naam" value={form.name} onChange={update('name')} className="input" />
      <input required placeholder="Mobile" value={form.phone} onChange={update('phone')} className="input" />
      <input required placeholder="Sheher" value={form.city} onChange={update('city')} className="input" />
      <input required placeholder="Address" value={form.address} onChange={update('address')} className="input sm:col-span-2" />
      <select required value={form.categorySlug} onChange={update('categorySlug')} className="input">
        <option value="">Category</option>
        {categories.map((c) => <option key={c.$id} value={c.slug}>{c.name}</option>)}
      </select>
      <input required type="number" placeholder="Anubhav (saal)" value={form.experienceYears} onChange={update('experienceYears')} className="input" />
      <input required type="number" placeholder="Rate/din" value={form.dailyRate} onChange={update('dailyRate')} className="input" />
      <button disabled={submitting} className="flex items-center justify-center gap-2 rounded bg-ink py-2 text-sm font-semibold text-paper sm:col-span-1">
        {submitting && <Loader2 size={15} className="animate-spin" />} Save Karo (Auto-Approved)
      </button>
      <style>{`.input { border: 1px solid var(--color-paper-line); border-radius: 4px; padding: 0.55rem 0.75rem; font-size: 0.875rem; }`}</style>
    </form>
  )
}
