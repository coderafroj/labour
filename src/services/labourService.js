import { databases, storage, functions, ID, Query, Permission, Role } from '../lib/appwrite'
import { DATABASE_ID, COLLECTIONS, BUCKET_ID, FUNCTIONS, LABOUR_STATUS } from '../lib/constants'

function maskPhone(phone) {
  const digits = String(phone).replace(/\D/g, '')
  if (digits.length < 6) return 'XXXXXXXXXX'
  return digits.slice(0, 5) + 'X'.repeat(digits.length - 5)
}

export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null
  const numLat1 = Number(lat1)
  const numLon1 = Number(lon1)
  const numLat2 = Number(lat2)
  const numLon2 = Number(lon2)
  if (isNaN(numLat1) || isNaN(numLon1) || isNaN(numLat2) || isNaN(numLon2)) return null

  const R = 6371 // Radius of the Earth in km
  const dLat = ((numLat2 - numLat1) * Math.PI) / 180
  const dLon = ((numLon2 - numLon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((numLat1 * Math.PI) / 180) *
      Math.cos((numLat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c
  return Math.round(d * 10) / 10
}

export async function uploadPhoto(file) {
  const res = await storage.createFile(BUCKET_ID, ID.unique(), file)
  return storage.getFileView(BUCKET_ID, res.$id).toString()
}

export async function registerLabourer({ ownerUserId, name, phone, address, city, categorySlug, categoryName, experienceYears, dailyRate, bio, photoUrl, lat, lng }) {
  const publicDoc = await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.LABOURERS,
    ID.unique(),
    {
      name: String(name || '').trim(),
      phoneMasked: maskPhone(phone),
      categorySlug: String(categorySlug || '').trim(),
      categoryName: String(categoryName || '').trim(),
      city: String(city || '').trim(),
      experienceYears: Number(experienceYears) || 0,
      dailyRate: Number(dailyRate) || 0,
      bio: String(bio || '').trim(),
      photoUrl: String(photoUrl || '').trim(),
      status: LABOUR_STATUS.PENDING,
      featured: false,
      featuredUntil: null,
      verified: false,
      rating: 0,
      jobsCompleted: 0,
      ownerUserId: String(ownerUserId || '').trim(),
      lat: lat != null ? Number(lat) : null,
      lng: lng != null ? Number(lng) : null,
    },
    [
      Permission.read(Role.any()),
      Permission.update(Role.user(ownerUserId)),
      Permission.delete(Role.user(ownerUserId)),
    ]
  )

  await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.LABOURER_PRIVATE,
    publicDoc.$id,
    { phone: String(phone || '').trim(), address: String(address || '').trim(), pincode: '' },
    [
      Permission.read(Role.user(ownerUserId)),
      Permission.update(Role.user(ownerUserId)),
      Permission.delete(Role.user(ownerUserId)),
    ]
  )

  return publicDoc
}

export async function browseLabourers({ categorySlug, city, search, limit = 24, offset = 0 } = {}) {
  try {
    const filters = [Query.equal('status', LABOUR_STATUS.APPROVED), Query.limit(100)]
    if (categorySlug) filters.push(Query.equal('categorySlug', categorySlug))
    filters.push(Query.orderDesc('featured'))

    const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.LABOURERS, filters)
    let docs = res.documents

    if (city) {
      const cityLower = city.trim().toLowerCase()
      docs = docs.filter((d) => (d.city || '').toLowerCase().includes(cityLower))
    }

    if (search) {
      const qLower = search.trim().toLowerCase()
      docs = docs.filter((d) => 
        (d.name || '').toLowerCase().includes(qLower) ||
        (d.categoryName || '').toLowerCase().includes(qLower) ||
        (d.city || '').toLowerCase().includes(qLower) ||
        (d.bio || '').toLowerCase().includes(qLower)
      )
    }

    return {
      total: docs.length,
      documents: docs.slice(offset, offset + limit),
    }
  } catch {
    // Robust fallback if strict query index is processing or fails
    const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.LABOURERS, [
      Query.equal('status', LABOUR_STATUS.APPROVED),
      Query.limit(100),
    ])
    let docs = res.documents
    if (categorySlug) {
      const catLower = categorySlug.toLowerCase()
      docs = docs.filter((d) => (d.categorySlug || '').toLowerCase() === catLower || (d.categoryName || '').toLowerCase().includes(catLower.replace('-', ' ')))
    }
    if (city) {
      const cityLower = city.trim().toLowerCase()
      docs = docs.filter((d) => (d.city || '').toLowerCase().includes(cityLower))
    }
    if (search) {
      const qLower = search.trim().toLowerCase()
      docs = docs.filter((d) => 
        (d.name || '').toLowerCase().includes(qLower) ||
        (d.categoryName || '').toLowerCase().includes(qLower) ||
        (d.city || '').toLowerCase().includes(qLower)
      )
    }
    return {
      total: docs.length,
      documents: docs.slice(offset, offset + limit),
    }
  }
}

export async function getLabourer(id) {
  return databases.getDocument(DATABASE_ID, COLLECTIONS.LABOURERS, id)
}

export async function getMyLabourerProfile(ownerUserId) {
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.LABOURERS, [
    Query.equal('ownerUserId', ownerUserId),
    Query.limit(1),
  ])
  return res.documents[0] || null
}

export async function getMyPrivateInfo(labourerId) {
  return databases.getDocument(DATABASE_ID, COLLECTIONS.LABOURER_PRIVATE, labourerId)
}

export async function updateMyLabourerProfile(id, data) {
  return databases.updateDocument(DATABASE_ID, COLLECTIONS.LABOURERS, id, data)
}

// ---- Admin moderation ----------------------------------------------------
export async function adminListAllLabourers({ status, limit = 100, offset = 0 } = {}) {
  const filters = [Query.limit(limit), Query.offset(offset), Query.orderDesc('$createdAt')]
  if (status) filters.push(Query.equal('status', status))
  return databases.listDocuments(DATABASE_ID, COLLECTIONS.LABOURERS, filters)
}

export async function adminSetStatus(id, status) {
  return databases.updateDocument(DATABASE_ID, COLLECTIONS.LABOURERS, id, { status })
}

export async function adminSetVerified(id, verified) {
  return databases.updateDocument(DATABASE_ID, COLLECTIONS.LABOURERS, id, { verified })
}

export async function adminSetFeatured(id, featured, days = 30) {
  const featuredUntil = featured
    ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
    : null
  return databases.updateDocument(DATABASE_ID, COLLECTIONS.LABOURERS, id, { featured, featuredUntil })
}

export async function adminDeleteLabourer(id) {
  try {
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.LABOURER_PRIVATE, id).catch(() => {})
  } catch {
    // Ignore if private doc does not exist
  }
  return databases.deleteDocument(DATABASE_ID, COLLECTIONS.LABOURERS, id)
}

// ---- Paid contact reveal --------------------------------------------------
export async function fetchUnlockedContact(labourerId) {
  const exec = await functions.createExecution(
    FUNCTIONS.GET_CONTACT,
    JSON.stringify({ labourerId }),
    false
  )
  const body = JSON.parse(exec.responseBody || '{}')
  if (exec.responseStatusCode === 402) {
    return { locked: true, fee: body.fee ?? 0 }
  }
  if (exec.responseStatusCode >= 400) {
    throw new Error(body.error || 'Contact fetch nahi hua')
  }
  return { locked: false, phone: body.phone, address: body.address }
}
