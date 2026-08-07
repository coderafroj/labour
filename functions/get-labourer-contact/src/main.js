import { Client, Databases, Query } from 'node-appwrite'

const DB_ID = process.env.DATABASE_ID || 'labourconnect'

export default async ({ req, res, log: _log, error }) => {
  const userId = req.headers['x-appwrite-user-id']
  if (!userId) return res.json({ error: 'Login required' }, 401)

  let payload
  try {
    payload = JSON.parse(req.bodyText || req.body || '{}')
  } catch {
    return res.json({ error: 'Invalid request body' }, 400)
  }
  const { labourerId } = payload
  if (!labourerId) return res.json({ error: 'labourerId missing' }, 400)

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY)
  const databases = new Databases(client)

  try {
    const labourer = await databases.getDocument(DB_ID, 'labourers', labourerId)
    const isOwner = labourer.ownerUserId === userId

    const settings = await databases.getDocument(DB_ID, 'settings', 'pricing')
    const unlockFee = settings.unlockFee || 0

    // Owner always sees their own contact info. Also, if the admin has set
    // the unlock fee to 0 (or hasn't turned it on yet), contact info is
    // simply free for everyone — no payment record needed at all.
    if (!isOwner && unlockFee > 0) {
      const paid = await databases.listDocuments(DB_ID, 'payments', [
        Query.equal('userId', userId),
        Query.equal('relatedId', labourerId),
        Query.equal('type', 'unlock'),
        Query.equal('status', 'paid'),
        Query.orderDesc('$createdAt'),
        Query.limit(1),
      ])

      if (paid.documents.length === 0) {
        return res.json({ error: 'Contact abhi unlock nahi hua', fee: unlockFee }, 402)
      }

      const validDays = settings.unlockValidDays || 30
      const paidAt = new Date(paid.documents[0].$createdAt).getTime()
      const daysSince = (Date.now() - paidAt) / (1000 * 60 * 60 * 24)
      if (daysSince > validDays) {
        return res.json({ error: 'Unlock expire ho gaya, dobara pay karein', fee: unlockFee }, 402)
      }
    }

    const priv = await databases.getDocument(DB_ID, 'labourer_private', labourerId)
    return res.json({ phone: priv.phone, address: priv.address })
  } catch (err) {
    error(err.message)
    return res.json({ error: 'Contact fetch nahi hua' }, 500)
  }
}
