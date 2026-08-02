// Central place for every ID and business number used across the app.
// Keeping them here means the setup script, the app, and the functions
// all agree on the same names — one source of truth, fewer bugs.

export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'labourconnect'

export const COLLECTIONS = {
  CATEGORIES: 'categories',
  LABOURERS: 'labourers',
  LABOURER_PRIVATE: 'labourer_private',
  BOOKINGS: 'bookings',
  PAYMENTS: 'payments',
}

export const ADMIN_TEAM_ID = import.meta.env.VITE_APPWRITE_ADMIN_TEAM_ID || 'admins'

export const FUNCTIONS = {
  CREATE_ORDER: import.meta.env.VITE_APPWRITE_FN_CREATE_ORDER || 'create-razorpay-order',
  VERIFY_PAYMENT: import.meta.env.VITE_APPWRITE_FN_VERIFY_PAYMENT || 'verify-razorpay-payment',
  GET_CONTACT: import.meta.env.VITE_APPWRITE_FN_GET_CONTACT || 'get-labourer-contact',
}

export const BUCKET_ID = import.meta.env.VITE_APPWRITE_PHOTOS_BUCKET_ID || 'labourer-photos'

// ---- Business / pricing config -----------------------------------------
// This is the whole earning engine, in one readable place.
export const PRICING = {
  // Client pays this once to view one labourer's phone number & address.
  // Unlock stays valid for UNLOCK_VALID_DAYS, after which it can be re-bought.
  CONTACT_UNLOCK_FEE: 19,
  UNLOCK_VALID_DAYS: 30,

  // Labourer pays this to feature their profile at the top of their
  // category for FEATURED_DAYS days (more visibility -> more calls).
  FEATURED_LISTING_FEE: 99,
  FEATURED_DAYS: 30,

  // When a client marks a booking "completed", the labourer confirms the
  // final job amount and pays a small commission on it (Uber-style take
  // rate). Kept low because daily-wage jobs are price-sensitive.
  COMMISSION_PERCENT: 8,
  COMMISSION_MIN: 10,
}

export const PAYMENT_TYPES = {
  UNLOCK: 'unlock',
  LISTING: 'listing',
  COMMISSION: 'commission',
}

export const LABOUR_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

export const BOOKING_STATUS = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

export const DEFAULT_CATEGORIES = [
  { name: 'Mistri / Mason', slug: 'mistri', icon: 'Hammer', description: 'Wall, plaster, tiling, brickwork' },
  { name: 'Electrician', slug: 'electrician', icon: 'Zap', description: 'Wiring, fitting, repair' },
  { name: 'Plumber', slug: 'plumber', icon: 'Wrench', description: 'Pipes, taps, tanks, leakage' },
  { name: 'Painter', slug: 'painter', icon: 'PaintBucket', description: 'Wall paint, texture, polish' },
  { name: 'Carpenter', slug: 'carpenter', icon: 'Hammer', description: 'Furniture, doors, fittings' },
  { name: 'Welder', slug: 'welder', icon: 'Flame', description: 'Gate, grill, steel work' },
  { name: 'Driver', slug: 'driver', icon: 'Car', description: 'Personal & commercial driving' },
  { name: 'House Help', slug: 'house-help', icon: 'Home', description: 'Cleaning, cooking, daily chores' },
  { name: 'Gardener / Mali', slug: 'gardener', icon: 'Trees', description: 'Lawn, plants, upkeep' },
  { name: 'Loader / Labour', slug: 'loader', icon: 'PackageOpen', description: 'Shifting, loading, general labour' },
]
