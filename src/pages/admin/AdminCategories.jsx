import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { listCategories, createCategory, deleteCategory } from '../../services/categoryService'
import CategoryIcon from '../../components/CategoryIcon'
import Loader from '../../components/Loader'

const ICON_OPTIONS = ['Hammer', 'Zap', 'Wrench', 'PaintBucket', 'Flame', 'Car', 'Home', 'Trees', 'PackageOpen', 'HardHat']

export default function AdminCategories() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', slug: '', icon: 'HardHat', description: '' })

  const load = () => listCategories().then(setList).finally(() => setLoading(false))
  useEffect(load, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    await createCategory({ ...form, sortOrder: list.length })
    setForm({ name: '', slug: '', icon: 'HardHat', description: '' })
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Category delete karein? Isse jude labourers ki category khali dikhegi.')) return
    await deleteCategory(id)
    load()
  }

  if (loading) return <Loader />

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="grid gap-3 rounded-md border border-paper-line bg-white p-4 sm:grid-cols-5">
        <input required placeholder="Naam" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" />
        <input required placeholder="slug (jaise electrician)" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="input" />
        <select value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} className="input">
          {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        <input placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input" />
        <button className="flex items-center justify-center gap-1.5 rounded bg-ink py-2 text-sm font-semibold text-paper"><Plus size={15} /> Add</button>
        <style>{`.input { border: 1px solid var(--color-paper-line); border-radius: 4px; padding: 0.55rem 0.75rem; font-size: 0.875rem; }`}</style>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <div key={c.$id} className="flex items-center justify-between rounded-md border border-paper-line bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper text-indigo"><CategoryIcon name={c.icon} /></span>
              <div>
                <p className="font-medium text-ink">{c.name}</p>
                <p className="font-mono text-xs text-steel">{c.slug}</p>
              </div>
            </div>
            <button onClick={() => handleDelete(c.$id)} className="text-steel hover:text-danger"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
