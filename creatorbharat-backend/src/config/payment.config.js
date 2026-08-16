// 🇮🇳 CreatorBharat SaaS Payment Gateway Configuration
export const paymentConfig = Object.freeze({
  razorpay: Object.freeze({
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || ''
  })
});
