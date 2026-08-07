import { Client, Databases, Permission, Role, ID } from 'node-appwrite'
import Razorpay from 'razorpay'

const DB_ID = process.env.DATABASE_ID || 'labourconnect'
const ADMIN_TEAM_ID = process.env.ADMIN_TEAM_ID || 'admins'

export default async ({ req, res, log: _log, error }) => {
  const userId = req.headers['x-appwrite-user-id']
  if (!userId) return res.json({ error: 'Login required' }, 401)

  let payload
  try {
    payload = JSON.parse(req.bodyText || req.body || '{}')
  } catch {
    return res.json({ error: 'Invalid request body' }, 400)
  }
  const { type, relatedId } = payload

  if (!['unlock', 'listing', 'commission'].includes(type) || !relatedId) {
    return res.json({ error: 'Invalid payment type ya relatedId missing' }, 400)
  }

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY)
  const databases = new Databases(client)

  try {
    let amount

    if (type === 'commission') {
      // Commission amount was already computed and stored by the labourer
      // when they marked the booking complete — trust the DB, never the
      // request body.
      const booking = await databases.getDocument(DB_ID, 'bookings', relatedId)
      amount = booking.commissionAmount
      if (!amount || amount <= 0 || booking.commissionPaid) {
        return res.json({ error: 'Ye commission valid nahi hai ya pehle se paid hai' }, 400)
      }
    } else {
      // unlock / listing — price comes LIVE from the database, which the
      // admin panel edits. Nothing about price is hardcoded here, so the
      // admin can change or switch off a fee any time without redeploying
      // this function.
      const settings = await databases.getDocument(DB_ID, 'settings', 'pricing')
      amount = type === 'unlock' ? settings.unlockFee : settings.listingFee
      if (!amount || amount <= 0) {
        return res.json({ error: 'Ye feature abhi free hai, payment ki zarurat nahi' }, 400)
      }
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: 'INR',
      receipt: `${type}_${relatedId}_${Date.now()}`.slice(0, 40),
    })

    const paymentDoc = await databases.createDocument(
      DB_ID,
      'payments',
      ID.unique(),
      {
        userId,
        type,
        relatedId,
        amount,
        razorpayOrderId: order.id,
        razorpayPaymentId: '',
        status: 'created',
      },
      [Permission.read(Role.user(userId)), Permission.read(Role.team(ADMIN_TEAM_ID))]
    )

    return res.json({ orderId: order.id, amount: order.amount, paymentDocId: paymentDoc.$id })
  } catch (err) {
    error(err.message)
    return res.json({ error: 'Order create nahi ho paya' }, 500)
  }
}
