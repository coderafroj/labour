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
  SETTINGS: 'settings',
}

export const SETTINGS_DOC_ID = 'pricing'

export const ADMIN_TEAM_ID = import.meta.env.VITE_APPWRITE_ADMIN_TEAM_ID || 'admins'

export const FUNCTIONS = {
  CREATE_ORDER: import.meta.env.VITE_APPWRITE_FN_CREATE_ORDER || 'create-razorpay-order',
  VERIFY_PAYMENT: import.meta.env.VITE_APPWRITE_FN_VERIFY_PAYMENT || 'verify-razorpay-payment',
  GET_CONTACT: import.meta.env.VITE_APPWRITE_FN_GET_CONTACT || 'get-labourer-contact',
}

export const BUCKET_ID = import.meta.env.VITE_APPWRITE_PHOTOS_BUCKET_ID || 'labourer-photos'

// ---- Business / pricing config -----------------------------------------
// IMPORTANT: these are only the FALLBACK values used the very first time
// the `settings/pricing` document is seeded (see scripts/setup-appwrite.js),
// and used in the UI for one frame before the live values load.
//
// The REAL, live numbers live in the database (`settings` collection,
// document id SETTINGS_DOC_ID) and are edited from Admin -> Pricing.
// Every Appwrite Function reads that document on every request — nothing
// about pricing is hardcoded in deployed code, so admin can change or
// switch off any fee at any time without redeploying anything.
//
// Starting at 0 means every fee is OFF by default — the platform launches
// fully free, and you turn charges on later from the admin panel.
export const PRICING = {
  CONTACT_UNLOCK_FEE: 0,
  UNLOCK_VALID_DAYS: 30,

  FEATURED_LISTING_FEE: 0,
  FEATURED_DAYS: 30,

  COMMISSION_PERCENT: 0,
  COMMISSION_MIN: 0,
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
