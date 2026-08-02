import { Link } from 'react-router-dom'
import { HardHat, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-paper-line bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded bg-signal text-ink">
              <HardHat size={20} strokeWidth={2.2} />
            </span>
            <span className="font-display text-2xl font-bold">Labour<span className="text-signal">Connect</span></span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-paper/60">
            Har mohalle ke bharose-mand kaamgaar, ek jagah. Verified profile, seedha number, koi bichauliya nahi.
          </p>
        </div>

        <div>
          <p className="font-display text-lg font-semibold tracking-wide text-signal">Users Ke Liye</p>
          <ul className="mt-3 space-y-2 text-sm text-paper/70">
            <li><Link to="/browse" className="hover:text-paper">Kaam Wale Dhundo</Link></li>
            <li><Link to="/how-it-works" className="hover:text-paper">Kaise Kaam Karta Hai</Link></li>
            <li><Link to="/signup" className="hover:text-paper">Account Banayein</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-display text-lg font-semibold tracking-wide text-signal">Kaamgaar Ke Liye</p>
          <ul className="mt-3 space-y-2 text-sm text-paper/70">
            <li><Link to="/register-labour" className="hover:text-paper">Free Registration</Link></li>
            <li><Link to="/dashboard" className="hover:text-paper">Apni Profile Dekho</Link></li>
            <li><Link to="/how-it-works" className="hover:text-paper">Featured Kaise Bane</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-display text-lg font-semibold tracking-wide text-signal">Sampark</p>
          <ul className="mt-3 space-y-2 text-sm text-paper/70">
            <li className="flex items-center gap-2"><Phone size={14} /> +91 90000 00000</li>
            <li className="flex items-center gap-2"><Mail size={14} /> help@labourconnect.in</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/10 py-5 text-center font-mono text-xs text-paper/40">
        © {new Date().getFullYear()} LabourConnect — Made for Bharat ka kaamgaar.
      </div>
    </footer>
  )
}
