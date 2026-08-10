import { Link } from 'react-router-dom'
import { Phone, Mail, ShieldCheck, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-paper-line bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <img src="/handiqo_final_app_icon.svg" alt="Handiqo" className="h-9 w-9 object-contain bg-paper rounded p-0.5" />
            <span className="font-display text-2xl font-black text-paper">Hand<span className="text-signal">iqo</span></span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-paper/70">
            <strong>Har Kaam Ka Sahi Haath</strong> — Aapke sheher ke verified mistri, electrician, plumber, painter, aur drivers. Direct contact, zero bichauliya!
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-signal font-semibold">
            <ShieldCheck size={16} /> 100% Verified Local Workers
          </div>
        </div>

        <div>
          <p className="font-display text-base font-bold tracking-wide text-signal uppercase">Users Ke Liye</p>
          <ul className="mt-3 space-y-2 text-sm text-paper/70">
            <li><Link to="/browse" className="hover:text-signal transition-colors">Kaam Wale Dhundo</Link></li>
            <li><Link to="/how-it-works" className="hover:text-signal transition-colors">Kaise Kaam Karta Hai</Link></li>
            <li><Link to="/signup" className="hover:text-signal transition-colors">Free Account Banayein</Link></li>
            <li><Link to="/login" className="hover:text-signal transition-colors">Login Account</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-display text-base font-bold tracking-wide text-signal uppercase">Kaamgaar Ke Liye</p>
          <ul className="mt-3 space-y-2 text-sm text-paper/70">
            <li><Link to="/register-labour" className="hover:text-signal transition-colors">Free Registration</Link></li>
            <li><Link to="/dashboard" className="hover:text-signal transition-colors">Kaamgaar Dashboard</Link></li>
            <li><Link to="/how-it-works" className="hover:text-signal transition-colors">Featured Profile Boost</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-display text-base font-bold tracking-wide text-signal uppercase">Sampark & Help</p>
          <ul className="mt-3 space-y-2 text-sm text-paper/70">
            <li className="flex items-center gap-2"><MapPin size={14} className="text-signal" /> Bharat Ke Har Sheher Mein</li>
            <li className="flex items-center gap-2"><Phone size={14} className="text-signal" /> +91 98765 43210</li>
            <li className="flex items-center gap-2"><Mail size={14} className="text-signal" /> support@handiqo.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-paper/10 py-5 text-center font-mono text-xs text-paper/50">
        © {new Date().getFullYear()} Handiqo. All rights reserved. Made with ❤️ for Bharat ka Kaamgaar.
      </div>
    </footer>
  )
}
