import { Link } from 'react-router-dom'
import { MapPin, Star, BadgeCheck, User, Navigation } from 'lucide-react'
import CategoryIcon from './CategoryIcon'
import { calculateDistance } from '../services/labourService'

export default function LabourCard({ labourer, categoryIcon = 'HardHat', userCoords }) {
  const dist = userCoords && labourer.lat != null && labourer.lng != null
    ? calculateDistance(userCoords.lat, userCoords.lng, labourer.lat, labourer.lng)
    : null

  return (
    <Link
      to={`/labour/${labourer.$id}`}
      className="badge-card group relative flex flex-col overflow-hidden rounded-md transition-transform hover:-translate-y-0.5"
    >
      <span className="badge-punch" aria-hidden="true" />

      {labourer.featured && (
        <span className="absolute right-3 top-3 z-10 rounded-sm bg-signal px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink">
          Featured
        </span>
      )}

      <div className="flex items-center gap-3 border-b border-dashed border-paper-line bg-paper/60 px-4 pb-3 pt-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-ink bg-white">
          {labourer.photoUrl ? (
            <img src={labourer.photoUrl} alt={labourer.name} className="h-full w-full object-cover" />
          ) : (
            <User size={26} className="text-steel" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-xl font-semibold leading-tight text-ink">{labourer.name}</p>
          <p className="flex items-center gap-1 text-xs font-medium text-rust">
            <CategoryIcon name={categoryIcon} size={13} /> {labourer.categoryName}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-4 py-3">
        <div className="flex items-center justify-between text-sm text-steel">
          <span className="flex items-center gap-1.5"><MapPin size={14} /> {labourer.city}</span>
          {dist !== null && (
            <span className="flex items-center gap-1 rounded bg-rust/10 px-2 py-0.5 font-mono text-xs font-semibold text-rust">
              <Navigation size={11} /> {dist} km door
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-steel">{labourer.experienceYears}+ saal ka anubhav</span>
          {labourer.rating > 0 && (
            <span className="flex items-center gap-1 font-mono text-xs text-ink">
              <Star size={13} className="fill-signal text-signal" /> {labourer.rating.toFixed(1)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-paper-line pt-2">
          <span className="font-mono text-lg font-semibold text-ink">₹{labourer.dailyRate}<span className="text-xs font-normal text-steel">/din</span></span>
          {labourer.verified && (
            <span className="stamp flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase">
              <BadgeCheck size={12} /> Verified
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-paper-line bg-indigo px-4 py-2.5 text-center font-mono text-xs font-semibold tracking-wide text-paper group-hover:bg-indigo-deep">
        Profile Dekho &amp; Contact Unlock Karo →
      </div>
    </Link>
  )
}
