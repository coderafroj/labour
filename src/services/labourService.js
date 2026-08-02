import { databases, storage, functions, ID, Query, Permission, Role } from '../lib/appwrite'
import { DATABASE_ID, COLLECTIONS, ADMIN_TEAM_ID, BUCKET_ID, FUNCTIONS, LABOUR_STATUS } from '../lib/constants'

function maskPhone(phone) {
  const digits = String(phone).replace(/\D/g, '')
  if (digits.length < 6) return 'XXXXXXXXXX'
  return digits.slice(0, 5) + 'X'.repeat(digits.length - 5)
}

export async function uploadPhoto(file) {
  const res = await storage.createFile(BUCKET_ID, ID.unique(), file)
  return storage.getFileView(BUCKET_ID, res.$id).toString()
}

// A labourer registers their own profile. Public fields go in `labourers`
// (readable by everyone), full phone + address go in `labourer_private`
// (readable only by the owner and admins — never by browsing clients).
export async function registerLabourer({ ownerUserId, name, phone, address, city, categorySlug, categoryName, experienceYears, dailyRate, bio, photoUrl }) {
  const publicDoc = await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.LABOURERS,
    ID.unique(),
    {
      name,
      phoneMasked: maskPhone(phone),
      categorySlug,
      categoryName,
      city,
      experienceYears: Number(experienceYears) || 0,
      dailyRate: Number(dailyRate) || 0,
      bio: bio || '',
      photoUrl: photoUrl || '',
      status: LABOUR_STATUS.PENDING,
      featured: false,
      featuredUntil: null,
      verified: false,
      rating: 0,
      jobsCompleted: 0,
      ownerUserId,
    },
    [
      Permission.read(Role.any()),
      Permission.update(Role.user(ownerUserId)),
      Permission.update(Role.team(ADMIN_TEAM_ID)),
      Permission.delete(Role.team(ADMIN_TEAM_ID)),
    ]
  )

  await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.LABOURER_PRIVATE,
    publicDoc.$id, // same id as the public doc, so lookups are trivial
    { phone, address, pincode: '' },
    [
      Permission.read(Role.user(ownerUserId)),
      Permission.read(Role.team(ADMIN_TEAM_ID)),
      Permission.update(Role.user(ownerUserId)),
      Permission.update(Role.team(ADMIN_TEAM_ID)),
    ]
  )

  return publicDoc
}

export async function browseLabourers({ categorySlug, city, search, limit = 24, offset = 0 } = {}) {
  const filters = [Query.equal('status', LABOUR_STATUS.APPROVED), Query.limit(limit), Query.offset(offset)]
  if (categorySlug) filters.push(Query.equal('categorySlug', categorySlug))
  if (city) filters.push(Query.equal('city', city))
  if (search) filters.push(Query.search('name', search))
  filters.push(Query.orderDesc('featured'))
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.LABOURERS, filters)
  return res
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

// ---- Paid contact reveal --------------------------------------------------
// Calls the get-labourer-contact Appwrite Function, which checks (server
// side, with an API key) whether the current user has a "paid" payment
// record for this labourer before returning the real phone/address.
export async function fetchUnlockedContact(labourerId) {
  const exec = await functions.createExecution(
    FUNCTIONS.GET_CONTACT,
    JSON.stringify({ labourerId }),
    false
  )
  const body = JSON.parse(exec.responseBody || '{}')
  if (exec.responseStatusCode >= 400) {
    throw new Error(body.error || 'Contact abhi unlock nahi hua')
  }
  return body // { phone, address }
}
