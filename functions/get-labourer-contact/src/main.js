import { Client, Databases, Query } from 'node-appwrite'

export default async ({ req, res, log, error }) => {
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
  const dbId = process.env.DATABASE_ID || 'labourconnect'

  try {
    // Owner of the profile can always see their own contact info.
    const labourer = await databases.getDocument(dbId, 'labourers', labourerId)
    const isOwner = labourer.ownerUserId === userId

    if (!isOwner) {
      const paid = await databases.listDocuments(dbId, 'payments', [
        Query.equal('userId', userId),
        Query.equal('relatedId', labourerId),
        Query.equal('type', 'unlock'),
        Query.equal('status', 'paid'),
        Query.orderDesc('$createdAt'),
        Query.limit(1),
      ])

      if (paid.documents.length === 0) {
        return res.json({ error: 'Contact abhi unlock nahi hua' }, 402)
      }

      const validDays = Number(process.env.UNLOCK_VALID_DAYS || 30)
      const paidAt = new Date(paid.documents[0].$createdAt).getTime()
      const daysSince = (Date.now() - paidAt) / (1000 * 60 * 60 * 24)
      if (daysSince > validDays) {
        return res.json({ error: 'Unlock expire ho gaya, dobara pay karein' }, 402)
      }
    }

    const priv = await databases.getDocument(dbId, 'labourer_private', labourerId)
    return res.json({ phone: priv.phone, address: priv.address })
  } catch (err) {
    error(err.message)
    return res.json({ error: 'Contact fetch nahi hua' }, 500)
  }
}
