import { useEffect, useState, useMemo } from 'react'
import { Plus, Check, X, BadgeCheck, Trash2, Star, Search, Phone, Home as HomeIcon, Loader2 } from 'lucide-react'
import { 
  adminListAllLabourers, 
  adminSetStatus, 
  adminSetVerified, 
  adminSetFeatured,
  adminDeleteLabourer, 
  registerLabourer,
  getMyPrivateInfo
} from '../../services/labourService'
import { listCategories } from '../../services/categoryService'
import { useAuth } from '../../hooks/useAuth'
import { LABOUR_STATUS } from '../../lib/constants'
import Loader from '../../components/Loader'

const TABS = [
  { key: '', label: 'Sabhi Labourers' },
  { key: LABOUR_STATUS.PENDING, label: 'Pending Approval ⏳' },
  { key: LABOUR_STATUS.APPROVED, label: 'Approved ✅' },
  { key: LABOUR_STATUS.REJECTED, label: 'Rejected ❌' },
]

export default function AdminLabourers() {
  const { user } = useAuth()
  const [tab, setTab] = useState('')
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [categories, setCategories] = useState([])
  const [actionError, setActionError] = useState('')
  const [search, setSearch] = useState('')
  const [viewContactId, setViewContactId] = useState(null)
  const [contactData, setContactData] = useState(null)

  const load = () => {
    setLoading(true)
    setActionError('')
    adminListAllLabourers({ status: tab || undefined, limit: 100 })
      .then((res) => setList(res.documents))
      .catch((err) => setActionError('Labourers list load nahi hui: ' + err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [tab])
  useEffect(() => { listCategories().then(setCategories).catch(() => {}) }, [])

  const setStatus = async (id, status) => {
    setActionError('')
    try {
      await adminSetStatus(id, status)
      setList((l) => l.map((x) => (x.$id === id ? { ...x, status } : x)))
    } catch (err) {
      setActionError('Status update fail hua: ' + err.message)
    }
  }

  const toggleVerified = async (id, verified) => {
    setActionError('')
    try {
      await adminSetVerified(id, !verified)
      setList((l) => l.map((x) => (x.$id === id ? { ...x, verified: !verified } : x)))
    } catch (err) {
      setActionError('Verification status update fail hua: ' + err.message)
    }
  }

  const toggleFeatured = async (id, featured) => {
    setActionError('')
    try {
      await adminSetFeatured(id, !featured)
      setList((l) => l.map((x) => (x.$id === id ? { ...x, featured: !featured } : x)))
    } catch (err) {
      setActionError('Featured status update fail hua: ' + err.message)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Kya aap ${name} ki profile permanently delete karna chahte hain?`)) return
    setActionError('')
    try {
      await adminDeleteLabourer(id)
      setList((l) => l.filter((x) => x.$id !== id))
    } catch (err) {
      setActionError('Delete fail hua: ' + err.message)
    }
  }

  const handleShowContact = async (id) => {
    if (viewContactId === id) {
      setViewContactId(null)
      setContactData(null)
      return
    }
    try {
      const priv = await getMyPrivateInfo(id)
      setContactData(priv)
      setViewContactId(id)
    } catch (err) {
      alert('Private info fetch nahi hui: ' + err.message)
    }
  }

  const filteredList = useMemo(() => {
    if (!search.trim()) return list
    const q = search.trim().toLowerCase()
    return list.filter((l) => 
      (l.name || '').toLowerCase().includes(q) ||
      (l.city || '').toLowerCase().includes(q) ||
      (l.categoryName || '').toLowerCase().includes(q)
    )
  }, [list, search])

  const pendingCount = list.filter((l) => l.status === LABOUR_STATUS.PENDING).length

  return (
    <div>
      {actionError && (
        <div className="mb-4 rounded-md border border-danger bg-danger/10 p-3 text-xs font-semibold text-danger">
          {actionError}
        </div>
      )}

      {pendingCount > 0 && tab !== LABOUR_STATUS.PENDING && (
        <div className="mb-4 flex items-center justify-between rounded-md border-2 border-signal bg-signal/15 p-3 text-xs font-bold text-ink">
          <span>⚠️ {pendingCount} labourer profiles approval ka wait kar rahe hain!</span>
          <button onClick={() => setTab(LABOUR_STATUS.PENDING)} className="rounded bg-ink px-3 py-1 text-paper font-semibold">
            Pending Dekho
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 overflow-x-auto rounded-md border border-paper-line bg-white p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded px-3 py-1.5 text-xs font-bold transition-all ${tab === t.key ? 'bg-ink text-paper' : 'text-steel hover:text-ink'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-1.5 rounded bg-signal px-4 py-2 text-xs font-bold text-ink hover:bg-signal-deep transition-all">
          <Plus size={15} /> Labour Add Karo
        </button>
      </div>

      {/* Admin Search Box */}
      <div className="relative mb-4">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Naam, Sheher ya Category se filter karein..."
          className="w-full rounded border border-paper-line bg-white py-2 pl-9 pr-3 text-xs font-semibold outline-none focus:border-indigo"
        />
      </div>

      {showAdd && (
        <AddLabourForm
          categories={categories}
          adminUserId={user.$id}
          onDone={() => { setShowAdd(false); load() }}
        />
      )}

      {loading ? <Loader label="Labourers load ho rahe hain..." /> : (
        <div className="overflow-x-auto rounded-md border border-paper-line bg-white shadow-xs">
          <table className="w-full text-left text-xs font-medium">
            <thead className="border-b border-paper-line bg-paper uppercase font-bold text-steel">
              <tr>
                <th className="p-3">Naam</th>
                <th className="p-3">Category</th>
                <th className="p-3">Sheher</th>
                <th className="p-3">Rate/Din</th>
                <th className="p-3">Status</th>
                <th className="p-3">Verified</th>
                <th className="p-3">Featured</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((l) => (
                <tr key={l.$id} className="border-b border-paper-line last:border-0 hover:bg-paper/40 transition-colors">
                  <td className="p-3 font-bold text-ink">
                    <div className="flex flex-col">
                      <span>{l.name}</span>
                      <button onClick={() => handleShowContact(l.$id)} className="text-[10px] text-indigo font-semibold underline text-left mt-0.5">
                        {viewContactId === l.$id ? 'Hide Contact' : 'Show Phone & Address'}
                      </button>
                      {viewContactId === l.$id && contactData && (
                        <div className="mt-1 p-2 bg-paper rounded border border-paper-line text-[10px] text-ink font-mono">
                          <p className="flex items-center gap-1"><Phone size={10} /> {contactData.phone}</p>
                          <p className="flex items-center gap-1"><HomeIcon size={10} /> {contactData.address}</p>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-steel font-semibold">{l.categoryName}</td>
                  <td className="p-3 text-steel">{l.city}</td>
                  <td className="p-3 font-mono font-bold">₹{l.dailyRate}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                      l.status === LABOUR_STATUS.APPROVED ? 'bg-verified-bg text-verified' :
                      l.status === LABOUR_STATUS.PENDING ? 'bg-signal/20 text-signal-deep' : 'bg-danger/10 text-danger'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button onClick={() => toggleVerified(l.$id, l.verified)} className={`flex items-center gap-1 text-xs font-bold ${l.verified ? 'text-verified' : 'text-steel/60'}`}>
                      <BadgeCheck size={14} /> {l.verified ? 'Haan' : 'Nahi'}
                    </button>
                  </td>
                  <td className="p-3">
                    <button onClick={() => toggleFeatured(l.$id, l.featured)} className={`flex items-center gap-1 text-xs font-bold ${l.featured ? 'text-signal-deep' : 'text-steel/60'}`}>
                      <Star size={14} className={l.featured ? 'fill-signal text-signal' : ''} /> {l.featured ? 'Haan' : 'Nahi'}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {l.status !== LABOUR_STATUS.APPROVED && (
                        <button onClick={() => setStatus(l.$id, LABOUR_STATUS.APPROVED)} title="Approve" className="rounded bg-verified px-2 py-1 text-xs font-bold text-white hover:opacity-90">
                          <Check size={13} />
                        </button>
                      )}
                      {l.status !== LABOUR_STATUS.REJECTED && (
                        <button onClick={() => setStatus(l.$id, LABOUR_STATUS.REJECTED)} title="Reject" className="rounded bg-rust px-2 py-1 text-xs font-bold text-white hover:opacity-90">
                          <X size={13} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(l.$id, l.name)} title="Delete Profile" className="rounded bg-danger p-1 text-xs font-bold text-white hover:opacity-90">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr><td colSpan={8} className="p-6 text-center text-steel font-medium">Koi labourer profile nahi mili</td></tr>
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
    <form onSubmit={handleSubmit} className="mb-5 grid gap-3 rounded-md border-2 border-ink bg-white p-4 sm:grid-cols-3 shadow-xs">
      <input required placeholder="Full Naam" value={form.name} onChange={update('name')} className="input" />
      <input required placeholder="Mobile Number" value={form.phone} onChange={update('phone')} className="input" />
      <input required placeholder="Sheher" value={form.city} onChange={update('city')} className="input" />
      <input required placeholder="Address" value={form.address} onChange={update('address')} className="input sm:col-span-2" />
      <select required value={form.categorySlug} onChange={update('categorySlug')} className="input">
        <option value="">Category Chuno</option>
        {categories.map((c) => <option key={c.$id} value={c.slug}>{c.name}</option>)}
      </select>
      <input required type="number" placeholder="Anubhav (saal)" value={form.experienceYears} onChange={update('experienceYears')} className="input" />
      <input required type="number" placeholder="Rate (₹/din)" value={form.dailyRate} onChange={update('dailyRate')} className="input" />
      <button disabled={submitting} className="flex items-center justify-center gap-2 rounded bg-ink py-2 text-xs font-bold text-paper sm:col-span-1 hover:bg-indigo-deep">
        {submitting && <Loader2 size={15} className="animate-spin" />} Save & Approve
      </button>
      <style>{`.input { border: 1px solid var(--color-paper-line); border-radius: 4px; padding: 0.55rem 0.75rem; font-size: 0.875rem; font-weight: 500; }`}</style>
    </form>
  )
}
