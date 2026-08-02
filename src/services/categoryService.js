import { databases, ID, Query, Permission, Role } from '../lib/appwrite'
import { DATABASE_ID, COLLECTIONS, ADMIN_TEAM_ID } from '../lib/constants'

export async function listCategories() {
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CATEGORIES, [
    Query.orderAsc('sortOrder'),
    Query.limit(100),
  ])
  return res.documents
}

export async function createCategory(data) {
  return databases.createDocument(DATABASE_ID, COLLECTIONS.CATEGORIES, ID.unique(), data, [
    Permission.read(Role.any()),
    Permission.update(Role.team(ADMIN_TEAM_ID)),
    Permission.delete(Role.team(ADMIN_TEAM_ID)),
  ])
}

export async function updateCategory(id, data) {
  return databases.updateDocument(DATABASE_ID, COLLECTIONS.CATEGORIES, id, data)
}

export async function deleteCategory(id) {
  return databases.deleteDocument(DATABASE_ID, COLLECTIONS.CATEGORIES, id)
}
