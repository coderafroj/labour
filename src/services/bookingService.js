import { databases, ID, Query, Permission, Role } from '../lib/appwrite'
import { DATABASE_ID, COLLECTIONS, ADMIN_TEAM_ID, BOOKING_STATUS } from '../lib/constants'

export async function createBooking({ clientUserId, labourerId, labourerOwnerId, message, city }) {
  return databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.BOOKINGS,
    ID.unique(),
    {
      clientUserId,
      labourerId,
      message: message || '',
      city: city || '',
      status: BOOKING_STATUS.REQUESTED,
      jobAmount: 0,
      commissionAmount: 0,
      commissionPaid: false,
    },
    [
      Permission.read(Role.user(clientUserId)),
      Permission.read(Role.user(labourerOwnerId)),
      Permission.read(Role.team(ADMIN_TEAM_ID)),
      Permission.update(Role.user(clientUserId)),
      Permission.update(Role.user(labourerOwnerId)),
      Permission.update(Role.team(ADMIN_TEAM_ID)),
    ]
  )
}

export async function myBookingsAsClient(userId) {
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.BOOKINGS, [
    Query.equal('clientUserId', userId),
    Query.orderDesc('$createdAt'),
  ])
  return res.documents
}

export async function myBookingsAsLabourer(labourerId) {
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.BOOKINGS, [
    Query.equal('labourerId', labourerId),
    Query.orderDesc('$createdAt'),
  ])
  return res.documents
}

export async function updateBookingStatus(id, status) {
  return databases.updateDocument(DATABASE_ID, COLLECTIONS.BOOKINGS, id, { status })
}

export async function setJobAmount(id, jobAmount, commissionAmount, commissionPaid = false) {
  return databases.updateDocument(DATABASE_ID, COLLECTIONS.BOOKINGS, id, {
    jobAmount,
    commissionAmount,
    commissionPaid,
    status: BOOKING_STATUS.COMPLETED,
  })
}

export async function adminListBookings() {
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.BOOKINGS, [
    Query.orderDesc('$createdAt'),
    Query.limit(100),
  ])
  return res.documents
}
