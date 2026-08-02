import { Client, Databases } from 'node-appwrite'
import crypto from 'crypto'

export default async ({ req, res, log, error }) => {
  const userId = req.headers['x-appwrite-user-id']
  if (!userId) return res.json({ error: 'Login required' }, 401)

  let payload
  try {
    payload = JSON.parse(req.bodyText || req.body || '{}')
  } catch {
    return res.json({ error: 'Invalid request body' }, 400)
  }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentDocId } = payload
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !paymentDocId) {
    return res.json({ error: 'Payment details missing' }, 400)
  }

  // This is the whole security model: nobody can mark a payment "paid"
  // without a signature that only Razorpay could have produced using our
  // secret key.
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expected !== razorpay_signature) {
    return res.json({ error: 'Signature match nahi hui, payment fraud ho sakta hai' }, 400)
  }

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY)
  const databases = new Databases(client)
  const dbId = process.env.DATABASE_ID || 'labourconnect'

  try {
    const payment = await databases.getDocument(dbId, 'payments', paymentDocId)
    if (payment.userId !== userId) return res.json({ error: 'Ye payment aapka nahi hai' }, 403)
    if (payment.razorpayOrderId !== razorpay_order_id) return res.json({ error: 'Order mismatch' }, 400)

    if (payment.status === 'paid') return res.json({ ok: true }) // idempotent replay-safe

    await databases.updateDocument(dbId, 'payments', paymentDocId, {
      status: 'paid',
      razorpayPaymentId: razorpay_payment_id,
    })

    if (payment.type === 'listing') {
      const featuredUntil = new Date(Date.now() + Number(process.env.FEATURED_DAYS || 30) * 24 * 60 * 60 * 1000).toISOString()
      await databases.updateDocument(dbId, 'labourers', payment.relatedId, { featured: true, featuredUntil })
    } else if (payment.type === 'commission') {
      await databases.updateDocument(dbId, 'bookings', payment.relatedId, { commissionPaid: true })
    }
    // type === 'unlock' needs no extra write — get-labourer-contact checks
    // the `payments` collection directly for a paid record.

    return res.json({ ok: true })
  } catch (err) {
    error(err.message)
    return res.json({ error: 'Verify nahi ho paya' }, 500)
  }
}
