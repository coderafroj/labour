import { functions, databases, Query } from '../lib/appwrite'
import { FUNCTIONS, DATABASE_ID, COLLECTIONS } from '../lib/constants'

export async function adminListPayments({ limit = 100, offset = 0 } = {}) {
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PAYMENTS, [
    Query.orderDesc('$createdAt'),
    Query.limit(limit),
    Query.offset(offset),
  ])
  return res
}

export async function myPayments(userId) {
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PAYMENTS, [
    Query.equal('userId', userId),
    Query.orderDesc('$createdAt'),
  ])
  return res.documents
}

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve()
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = resolve
    script.onerror = () => reject(new Error('Razorpay load nahi hua, internet check karein'))
    document.body.appendChild(script)
  })
}

/**
 * Runs the full pay flow for any payment type (unlock / listing / commission).
 * 1. Ask the create-razorpay-order Function for a fresh order (server-side,
 *    keeps the Razorpay key secret off the client).
 * 2. Open Razorpay Checkout.
 * 3. On success, ask verify-razorpay-payment Function to check the
 *    signature and apply the business effect (unlock contact / feature
 *    listing / settle commission). The frontend never marks anything paid
 *    itself — that decision only happens server-side.
 */
export async function startPayment({ type, relatedId, amount, user, description }) {
  await loadRazorpayScript()

  const orderExec = await functions.createExecution(
    FUNCTIONS.CREATE_ORDER,
    JSON.stringify({ type, relatedId, amount }),
    false
  )
  const order = JSON.parse(orderExec.responseBody || '{}')
  if (orderExec.responseStatusCode >= 400) {
    throw new Error(order.error || 'Order nahi ban paya, dobara try karein')
  }

  return new Promise((resolve, reject) => {
    const rz = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: 'INR',
      name: 'LabourConnect',
      description,
      order_id: order.orderId,
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
      },
      theme: { color: '#101E2B' },
      handler: async (response) => {
        try {
          const verifyExec = await functions.createExecution(
            FUNCTIONS.VERIFY_PAYMENT,
            JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentDocId: order.paymentDocId,
            }),
            false
          )
          const result = JSON.parse(verifyExec.responseBody || '{}')
          if (verifyExec.responseStatusCode >= 400) {
            reject(new Error(result.error || 'Payment verify nahi hua'))
          } else {
            resolve(result)
          }
        } catch (err) {
          reject(err)
        }
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancel kar diya gaya')),
      },
    })
    rz.on('payment.failed', (resp) => reject(new Error(resp.error?.description || 'Payment fail ho gaya')))
    rz.open()
  })
}
