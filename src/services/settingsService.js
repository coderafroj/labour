import { databases } from '../lib/appwrite'
import { DATABASE_ID, COLLECTIONS, SETTINGS_DOC_ID, PRICING } from '../lib/constants'

// Public, read-only for everyone (client needs to show the correct price
// before paying) — write access belongs only to the admins team.
export async function getSettings() {
  try {
    const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID)
    return {
      unlockFee: doc.unlockFee ?? PRICING.CONTACT_UNLOCK_FEE,
      unlockValidDays: doc.unlockValidDays ?? PRICING.UNLOCK_VALID_DAYS,
      listingFee: doc.listingFee ?? PRICING.FEATURED_LISTING_FEE,
      featuredDays: doc.featuredDays ?? PRICING.FEATURED_DAYS,
      commissionPercent: doc.commissionPercent ?? PRICING.COMMISSION_PERCENT,
      commissionMin: doc.commissionMin ?? PRICING.COMMISSION_MIN,
      announcementText: doc.announcementText || '',
      maintenanceMode: Boolean(doc.maintenanceMode),
      supportPhone: doc.supportPhone || '',
      supportEmail: doc.supportEmail || '',
    }
  } catch {
    return {
      unlockFee: PRICING.CONTACT_UNLOCK_FEE,
      unlockValidDays: PRICING.UNLOCK_VALID_DAYS,
      listingFee: PRICING.FEATURED_LISTING_FEE,
      featuredDays: PRICING.FEATURED_DAYS,
      commissionPercent: PRICING.COMMISSION_PERCENT,
      commissionMin: PRICING.COMMISSION_MIN,
      announcementText: '',
      maintenanceMode: false,
      supportPhone: '',
      supportEmail: '',
    }
  }
}

export async function adminUpdateSettings(data) {
  return databases.updateDocument(DATABASE_ID, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID, data)
}
