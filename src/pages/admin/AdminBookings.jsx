import { useEffect, useState } from 'react'
import { adminListBookings } from '../../services/bookingService'
import Loader from '../../components/Loader'

export default function AdminBookings() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminListBookings().then(setList).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div className="overflow-x-auto rounded-md border border-paper-line bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-paper-line bg-paper text-xs uppercase text-steel">
          <tr>
            <th className="p-3">Date</th><th className="p-3">Status</th><th className="p-3">Job Amount</th>
            <th className="p-3">Commission</th><th className="p-3">Commission Paid</th>
          </tr>
        </thead>
        <tbody>
          {list.map((b) => (
            <tr key={b.$id} className="border-b border-paper-line last:border-0">
              <td className="p-3 text-steel">{new Date(b.$createdAt).toLocaleDateString('en-IN')}</td>
              <td className="p-3 capitalize">{b.status}</td>
              <td className="p-3 font-mono">₹{b.jobAmount}</td>
              <td className="p-3 font-mono">₹{b.commissionAmount}</td>
              <td className="p-3">{b.commissionPaid ? 'Haan' : 'Nahi'}</td>
            </tr>
          ))}
          {list.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-steel">Koi booking nahi hai</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
