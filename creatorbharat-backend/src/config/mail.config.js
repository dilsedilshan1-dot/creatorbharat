// 🇮🇳 CreatorBharat SaaS Mail & SMS Configuration
export const mailConfig = Object.freeze({
  resendApiKey: process.env.RESEND_API_KEY || '',
  emailFrom: process.env.EMAIL_FROM || 'CreatorBharat <onboarding@creatorbharat.com>',
  sms: Object.freeze({
    fast2smsKey: process.env.FAST2SMS_API_KEY || '',
    twilioSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioPhone: process.env.TWILIO_PHONE_NUMBER || ''
  })
});
