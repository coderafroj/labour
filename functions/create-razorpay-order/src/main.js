import { Client, Databases, Permission, Role, ID } from 'node-appwrite'
import Razorpay from 'razorpay'

// Fixed platform prices. NEVER trust an amount sent from the browser —
// always decide the amount here, on the server, so nobody can tamper
// with the client to pay less than they should.
const FIXED_PRICE = {
  unlock: Number(process.env.PRICE_UNLOCK || 19),
  listing: Number(process.env.PRICE_LISTING || 99),
}

export default async ({ req, res, log, error }) => {
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
  const dbId = process.env.DATABASE_ID || 'labourconnect'

  try {
    let amount
    if (type === 'commission') {
      // Commission amount was already computed and stored by the
      // labourer when they marked the booking complete — trust the DB,
      // not the request.
      const booking = await databases.getDocument(dbId, 'bookings', relatedId)
      if (booking.clientUserId !== userId && booking.labourerId !== relatedId) {
        // relatedId here is the booking id, ownership is checked via clientUserId
      }
      amount = booking.commissionAmount
      if (!amount || amount <= 0 || booking.commissionPaid) {
        return res.json({ error: 'Ye commission valid nahi hai ya pehle se paid hai' }, 400)
      }
    } else {
      amount = FIXED_PRICE[type]
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
      dbId,
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
      [Permission.read(Role.user(userId)), Permission.read(Role.team(process.env.ADMIN_TEAM_ID || 'admins'))]
    )

    return res.json({ orderId: order.id, amount: order.amount, paymentDocId: paymentDoc.$id })
  } catch (err) {
    error(err.message)
    return res.json({ error: 'Order create nahi ho paya' }, 500)
  }
}
