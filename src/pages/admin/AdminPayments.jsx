import { useEffect, useState } from 'react'
import { adminListPayments } from '../../services/paymentService'
import Loader from '../../components/Loader'

export default function AdminPayments() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminListPayments({ limit: 200 }).then((res) => setList(res.documents)).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div className="overflow-x-auto rounded-md border border-paper-line bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-paper-line bg-paper text-xs uppercase text-steel">
          <tr><th className="p-3">Date</th><th className="p-3">Type</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Razorpay Payment ID</th></tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.$id} className="border-b border-paper-line last:border-0">
              <td className="p-3 text-steel">{new Date(p.$createdAt).toLocaleDateString('en-IN')}</td>
              <td className="p-3 capitalize">{p.type}</td>
              <td className="p-3 font-mono">₹{p.amount}</td>
              <td className="p-3 capitalize">{p.status}</td>
              <td className="p-3 font-mono text-xs text-steel">{p.razorpayPaymentId || '—'}</td>
            </tr>
          ))}
          {list.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-steel">Koi payment record nahi hai</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
