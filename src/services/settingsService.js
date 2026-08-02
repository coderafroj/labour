import { databases } from '../lib/appwrite'
import { DATABASE_ID, COLLECTIONS, SETTINGS_DOC_ID, PRICING } from '../lib/constants'

// Public, read-only for everyone (client needs to show the correct price
// before paying) — write access belongs only to the admins team.
export async function getSettings() {
  try {
    const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID)
    return {
      unlockFee: doc.unlockFee,
      unlockValidDays: doc.unlockValidDays,
      listingFee: doc.listingFee,
      featuredDays: doc.featuredDays,
      commissionPercent: doc.commissionPercent,
      commissionMin: doc.commissionMin,
    }
  } catch {
    // Settings doc missing (e.g. setup script not run yet) — fall back to
    // the zero-fee defaults so the app never hard-crashes.
    return {
      unlockFee: PRICING.CONTACT_UNLOCK_FEE,
      unlockValidDays: PRICING.UNLOCK_VALID_DAYS,
      listingFee: PRICING.FEATURED_LISTING_FEE,
      featuredDays: PRICING.FEATURED_DAYS,
      commissionPercent: PRICING.COMMISSION_PERCENT,
      commissionMin: PRICING.COMMISSION_MIN,
    }
  }
}

export async function adminUpdateSettings(data) {
  return databases.updateDocument(DATABASE_ID, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID, data)
}
