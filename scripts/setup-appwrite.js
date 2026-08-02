// One-time setup script. Run this once with your Appwrite API key and it
// builds the entire backend: database, all 5 collections with the right
// attributes + permissions, the photos bucket, the "admins" team, and
// seeds the starter categories.
//
// Usage:
//   cd scripts && node setup-appwrite.js
// (reads APPWRITE_ENDPOINT / APPWRITE_PROJECT_ID / APPWRITE_API_KEY from
//  the root .env file automatically)

import { Client, Databases, Storage, Teams, Permission, Role, ID } from 'node-appwrite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ---- tiny .env loader (no extra dependency needed) -----------------------
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = (m[2] || '').replace(/^["']|["']$/g, '')
  }
}
loadEnv()

const ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT
const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID
const API_KEY = process.env.APPWRITE_API_KEY
const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID || 'labourconnect'
const ADMIN_TEAM_ID = process.env.VITE_APPWRITE_ADMIN_TEAM_ID || 'admins'
const BUCKET_ID = process.env.VITE_APPWRITE_PHOTOS_BUCKET_ID || 'labourer-photos'

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
  console.error('❌ Missing APPWRITE_ENDPOINT / APPWRITE_PROJECT_ID / APPWRITE_API_KEY.')
  console.error('   Copy .env.example to .env in the project root, fill it in, then re-run this script.')
  process.exit(1)
}

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY)
const databases = new Databases(client)
const storage = new Storage(client)
const teams = new Teams(client)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function ignoreExists(promise, label) {
  try {
    await promise
    console.log(`  ✓ ${label}`)
  } catch (err) {
    if (err.code === 409) console.log(`  · ${label} (already exists, skipped)`)
    else {
      console.error(`  ✗ ${label} FAILED:`, err.message)
      throw err
    }
  }
}

async function waitForAttribute(collectionId, key) {
  for (let i = 0; i < 20; i++) {
    const attrs = await databases.listAttributes(DATABASE_ID, collectionId)
    const attr = attrs.attributes.find((a) => a.key === key)
    if (attr && attr.status === 'available') return
    await sleep(500)
  }
}

async function main() {
  console.log('\n🚀 Setting up LabourConnect on Appwrite\n')

  // ---- Database ----
  await ignoreExists(databases.create(DATABASE_ID, 'LabourConnect'), 'Database: labourconnect')

  // ---- Team: admins ----
  await ignoreExists(teams.create(ADMIN_TEAM_ID, 'Admins'), 'Team: admins')

  // ---- Storage bucket for photos ----
  await ignoreExists(
    storage.createBucket(BUCKET_ID, 'Labourer Photos', [Permission.read(Role.any()), Permission.create(Role.users())], false, true, 5 * 1024 * 1024, ['jpg', 'jpeg', 'png', 'webp']),
    'Storage bucket: labourer-photos'
  )

  // ============================ categories ============================
  console.log('\n📁 Collection: categories')
  await ignoreExists(
    databases.createCollection(DATABASE_ID, 'categories', 'categories', [
      Permission.read(Role.any()),
      Permission.create(Role.team(ADMIN_TEAM_ID)),
      Permission.update(Role.team(ADMIN_TEAM_ID)),
      Permission.delete(Role.team(ADMIN_TEAM_ID)),
    ], true),
    'Create collection'
  )
  await ignoreExists(databases.createStringAttribute(DATABASE_ID, 'categories', 'name', 100, true), 'attr: name')
  await ignoreExists(databases.createStringAttribute(DATABASE_ID, 'categories', 'slug', 100, true), 'attr: slug')
  await ignoreExists(databases.createStringAttribute(DATABASE_ID, 'categories', 'icon', 50, true), 'attr: icon')
  await ignoreExists(databases.createStringAttribute(DATABASE_ID, 'categories', 'description', 255, false), 'attr: description')
  await ignoreExists(databases.createIntegerAttribute(DATABASE_ID, 'categories', 'sortOrder', false, 0, 9999, 0), 'attr: sortOrder')
  await waitForAttribute('categories', 'slug')
  await ignoreExists(databases.createIndex(DATABASE_ID, 'categories', 'slug_idx', 'key', ['slug']), 'index: slug')

  // ============================ labourers (public) ============================
  console.log('\n📁 Collection: labourers')
  await ignoreExists(
    databases.createCollection(DATABASE_ID, 'labourers', 'labourers', [
      Permission.create(Role.users()),
    ], true),
    'Create collection'
  )
  const labourerAttrs = [
    ['name', 150, true],
    ['phoneMasked', 20, true],
    ['categorySlug', 100, true],
    ['categoryName', 100, true],
    ['city', 100, true],
    ['bio', 500, false],
    ['photoUrl', 500, false],
    ['status', 20, true],
    ['ownerUserId', 100, true],
  ]
  for (const [key, size, req] of labourerAttrs) {
    await ignoreExists(databases.createStringAttribute(DATABASE_ID, 'labourers', key, size, req), `attr: ${key}`)
  }
  await ignoreExists(databases.createIntegerAttribute(DATABASE_ID, 'labourers', 'experienceYears', false, 0, 80, 0), 'attr: experienceYears')
  await ignoreExists(databases.createIntegerAttribute(DATABASE_ID, 'labourers', 'dailyRate', false, 0, 100000, 0), 'attr: dailyRate')
  await ignoreExists(databases.createIntegerAttribute(DATABASE_ID, 'labourers', 'jobsCompleted', false, 0, 100000, 0), 'attr: jobsCompleted')
  await ignoreExists(databases.createFloatAttribute(DATABASE_ID, 'labourers', 'rating', false, 0, 5, 0), 'attr: rating')
  await ignoreExists(databases.createBooleanAttribute(DATABASE_ID, 'labourers', 'featured', false, false), 'attr: featured')
  await ignoreExists(databases.createBooleanAttribute(DATABASE_ID, 'labourers', 'verified', false, false), 'attr: verified')
  await ignoreExists(databases.createDatetimeAttribute(DATABASE_ID, 'labourers', 'featuredUntil', false), 'attr: featuredUntil')
  await waitForAttribute('labourers', 'status')
  await waitForAttribute('labourers', 'categorySlug')
  await waitForAttribute('labourers', 'city')
  await waitForAttribute('labourers', 'ownerUserId')
  await waitForAttribute('labourers', 'featured')
  await waitForAttribute('labourers', 'name')
  await ignoreExists(databases.createIndex(DATABASE_ID, 'labourers', 'status_idx', 'key', ['status']), 'index: status')
  await ignoreExists(databases.createIndex(DATABASE_ID, 'labourers', 'category_idx', 'key', ['categorySlug']), 'index: categorySlug')
  await ignoreExists(databases.createIndex(DATABASE_ID, 'labourers', 'city_idx', 'key', ['city']), 'index: city')
  await ignoreExists(databases.createIndex(DATABASE_ID, 'labourers', 'owner_idx', 'key', ['ownerUserId']), 'index: ownerUserId')
  await ignoreExists(databases.createIndex(DATABASE_ID, 'labourers', 'featured_idx', 'key', ['featured']), 'index: featured')
  await ignoreExists(databases.createIndex(DATABASE_ID, 'labourers', 'name_search_idx', 'fulltext', ['name']), 'index: name (search)')

  // ============================ labourer_private ============================
  console.log('\n📁 Collection: labourer_private')
  await ignoreExists(
    databases.createCollection(DATABASE_ID, 'labourer_private', 'labourer_private', [
      Permission.create(Role.users()),
    ], true),
    'Create collection'
  )
  await ignoreExists(databases.createStringAttribute(DATABASE_ID, 'labourer_private', 'phone', 20, true), 'attr: phone')
  await ignoreExists(databases.createStringAttribute(DATABASE_ID, 'labourer_private', 'address', 500, true), 'attr: address')
  await ignoreExists(databases.createStringAttribute(DATABASE_ID, 'labourer_private', 'pincode', 10, false), 'attr: pincode')

  // ============================ bookings ============================
  console.log('\n📁 Collection: bookings')
  await ignoreExists(
    databases.createCollection(DATABASE_ID, 'bookings', 'bookings', [
      Permission.create(Role.users()),
    ], true),
    'Create collection'
  )
  await ignoreExists(databases.createStringAttribute(DATABASE_ID, 'bookings', 'clientUserId', 100, true), 'attr: clientUserId')
  await ignoreExists(databases.createStringAttribute(DATABASE_ID, 'bookings', 'labourerId', 100, true), 'attr: labourerId')
  await ignoreExists(databases.createStringAttribute(DATABASE_ID, 'bookings', 'message', 1000, false), 'attr: message')
  await ignoreExists(databases.createStringAttribute(DATABASE_ID, 'bookings', 'city', 100, false), 'attr: city')
  await ignoreExists(databases.createStringAttribute(DATABASE_ID, 'bookings', 'status', 20, true), 'attr: status')
  await ignoreExists(databases.createIntegerAttribute(DATABASE_ID, 'bookings', 'jobAmount', false, 0, 10000000, 0), 'attr: jobAmount')
  await ignoreExists(databases.createIntegerAttribute(DATABASE_ID, 'bookings', 'commissionAmount', false, 0, 1000000, 0), 'attr: commissionAmount')
  await ignoreExists(databases.createBooleanAttribute(DATABASE_ID, 'bookings', 'commissionPaid', false, false), 'attr: commissionPaid')
  await waitForAttribute('bookings', 'clientUserId')
  await waitForAttribute('bookings', 'labourerId')
  await ignoreExists(databases.createIndex(DATABASE_ID, 'bookings', 'client_idx', 'key', ['clientUserId']), 'index: clientUserId')
  await ignoreExists(databases.createIndex(DATABASE_ID, 'bookings', 'labourer_idx', 'key', ['labourerId']), 'index: labourerId')

  // ============================ payments ============================
  // No client create/update permission on purpose — only the Appwrite
  // Functions (using the API key) may write here.
  console.log('\n📁 Collection: payments')
  await ignoreExists(databases.createCollection(DATABASE_ID, 'payments', 'payments', [], true), 'Create collection')
  await ignoreExists(databases.createStringAttribute(DATABASE_ID, 'payments', 'userId', 100, true), 'attr: userId')
  await ignoreExists(databases.createStringAttribute(DATABASE_ID, 'payments', 'type', 20, true), 'attr: type')
  await ignoreExists(databases.createStringAttribute(DATABASE_ID, 'payments', 'relatedId', 100, true), 'attr: relatedId')
  await ignoreExists(databases.createIntegerAttribute(DATABASE_ID, 'payments', 'amount', true, 0, 1000000), 'attr: amount')
  await ignoreExists(databases.createStringAttribute(DATABASE_ID, 'payments', 'razorpayOrderId', 100, false), 'attr: razorpayOrderId')
  await ignoreExists(databases.createStringAttribute(DATABASE_ID, 'payments', 'razorpayPaymentId', 100, false), 'attr: razorpayPaymentId')
  await ignoreExists(databases.createStringAttribute(DATABASE_ID, 'payments', 'status', 20, true), 'attr: status')
  await waitForAttribute('payments', 'userId')
  await waitForAttribute('payments', 'relatedId')
  await ignoreExists(databases.createIndex(DATABASE_ID, 'payments', 'user_idx', 'key', ['userId']), 'index: userId')
  await ignoreExists(databases.createIndex(DATABASE_ID, 'payments', 'related_idx', 'key', ['relatedId']), 'index: relatedId')

  // ============================ seed categories ============================
  console.log('\n🌱 Seeding starter categories')
  const DEFAULT_CATEGORIES = [
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
  const existing = await databases.listDocuments(DATABASE_ID, 'categories')
  const existingSlugs = new Set(existing.documents.map((d) => d.slug))
  let order = existing.documents.length
  for (const cat of DEFAULT_CATEGORIES) {
    if (existingSlugs.has(cat.slug)) {
      console.log(`  · ${cat.name} (already exists, skipped)`)
      continue
    }
    await databases.createDocument(DATABASE_ID, 'categories', ID.unique(), { ...cat, sortOrder: order++ }, [
      Permission.read(Role.any()),
      Permission.update(Role.team(ADMIN_TEAM_ID)),
      Permission.delete(Role.team(ADMIN_TEAM_ID)),
    ])
    console.log(`  ✓ ${cat.name}`)
  }

  console.log('\n✅ Done! Ab README.md ke "Next steps" section follow karein:')
  console.log('   1. Apna user account banayein aap ke app se (signup)')
  console.log(`   2. Us user ko Appwrite console me "${ADMIN_TEAM_ID}" team me add karein (make it Owner/confirmed)`)
  console.log('   3. Teeno Appwrite Functions deploy karein (functions/ folder dekhen)\n')
}

main().catch((err) => {
  console.error('\n❌ Setup fail ho gaya:', err.message)
  process.exit(1)
})
