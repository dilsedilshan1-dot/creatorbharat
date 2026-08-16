// 🇮🇳 CreatorBharat SaaS Auth Configuration
export const authConfig = Object.freeze({
  jwtSecret: process.env.JWT_SECRET || '',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
  jwtExpiresIn: '15m',
  jwtRefreshExpiresIn: '7d',
  bcryptSaltRounds: 10,
  google: Object.freeze({
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || ''
  })
});
