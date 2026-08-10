import { Client, Account, Databases, Storage, Functions, Teams, ID, Query, Permission, Role } from 'appwrite'

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)

// Load persistent session token from localStorage if third-party cookies are blocked by browser
const savedSession = typeof window !== 'undefined' ? localStorage.getItem('appwrite_session') : null
if (savedSession) {
  client.setSession(savedSession)
}

export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)
export const functions = new Functions(client)
export const teams = new Teams(client)

export { ID, Query, Permission, Role, client }
