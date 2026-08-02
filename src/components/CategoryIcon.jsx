import { Hammer, Zap, Wrench, PaintBucket, Flame, Car, Home, Trees, PackageOpen, HardHat } from 'lucide-react'

const ICONS = {
  Hammer, Zap, Wrench, PaintBucket, Flame, Car, Home, Trees, PackageOpen, HardHat,
}

export default function CategoryIcon({ name, size = 18, className = '' }) {
  const Cmp = ICONS[name] || HardHat
  return <Cmp size={size} className={className} />
}
