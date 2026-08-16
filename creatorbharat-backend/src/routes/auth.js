// 🇮🇳 CreatorBharat SaaS Authentication Router
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import prisma from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendEmail } from '../utils/mailer.js';
import { sendSMS } from '../utils/sms.js';
import crypto from 'crypto';

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HANDLE_REGEX = /^[a-zA-Z0-9_.-]{3,30}$/;

// ─── Token Helpers ──────────────────────────────────────────────────────────

const signAccessToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing.');
  }
  return jwt.sign(
    { userId, type: 'access' },
    secret,
    { expiresIn: '15m' }
  );
};

const signRefreshToken = (userId) => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!refreshSecret) {
    throw new Error('JWT_REFRESH_SECRET environment variable is missing.');
  }
  return jwt.sign(
    { userId, type: 'refresh' },
    refreshSecret,
    { expiresIn: '7d' }
  );
};

// Backward-compat alias (30d token for Google OAuth redirect scenario)
const signToken = (userId) => signAccessToken(userId);

const safeUser = (user) => {
  const { password, twoFactorSecret, ...rest } = user;
  return rest;
};

// Store refresh token in DB
async function persistRefreshToken(userId, refreshToken) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId, expiresAt }
  });
}

// Build login response with both tokens
async function buildAuthResponse(user) {
  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  await persistRefreshToken(user.id, refreshToken);
  return { token: accessToken, refreshToken, user: safeUser(user) };
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry', 'Other'
];

const CreatorRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  handle: z.string().regex(HANDLE_REGEX),
  city: z.string().min(1, 'City is required'),
  state: z.string().refine(val => INDIAN_STATES.includes(val), {
    message: 'Only creators located in India are allowed to register.'
  }),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number.'),
  otp: z.string().min(4, 'OTP is required')
});

const BrandRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().min(2),
  contactName: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional().or(z.literal('')),
  linkedin: z.string().optional().or(z.literal('')),
  gstin: z.string().optional().or(z.literal('')),
  country: z.string().default('India'),
  state: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  otp: z.string().optional().or(z.literal(''))
}).superRefine((data, ctx) => {
  if (data.country === 'India') {
    if (!data.phone || !/^[6-9]\d{9}$/.test(data.phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phone'],
        message: 'Please enter a valid 10-digit Indian phone number.'
      });
    }
    if (!data.otp || data.otp.length < 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['otp'],
        message: 'OTP is required for Indian brand verification.'
      });
    }
    if (!data.state || !INDIAN_STATES.includes(data.state)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['state'],
        message: 'Please select a valid Indian state.'
      });
    }
  } else {
    if (!data.phone || data.phone.length < 5 || data.phone.length > 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phone'],
        message: 'Please enter a valid phone number (5-20 digits).'
      });
    }
  }
});

// ─── Token Refresh ──────────────────────────────────────────────────────────

// POST /api/auth/refresh — Exchange a valid refresh token for a new access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required.' });
    }

    // Verify JWT signature
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      console.error('[POST /api/auth/refresh] Fatal: JWT_REFRESH_SECRET is not configured.');
      return res.status(500).json({ error: 'Internal server configuration error.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, refreshSecret);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token type.' });
    }

    // Check it exists in DB (not revoked)
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken }
    });
    if (!storedToken) {
      return res.status(401).json({ error: 'Refresh token has been revoked.' });
    }

    if (new Date() > storedToken.expiresAt) {
      await prisma.refreshToken.delete({ where: { token: refreshToken } }).catch(() => {});
      return res.status(401).json({ error: 'Refresh token has expired. Please log in again.' });
    }

    // Issue new access token
    const newAccessToken = signAccessToken(decoded.userId);
    res.json({ token: newAccessToken });
  } catch (err) {
    console.error('[/refresh] Error:', err.message);
    res.status(500).json({ error: 'Token refresh failed.' });
  }
});

// POST /api/auth/logout — Revoke refresh token
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } }).catch(() => {});
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    console.error('[/logout] Error:', err.message);
    res.status(500).json({ error: 'Logout failed.' });
  }
});

// ─── 2FA (TOTP) ─────────────────────────────────────────────────────────────

// POST /api/auth/2fa/setup — Generate a TOTP secret and QR code for the authenticated admin
router.post('/2fa/setup', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: '2FA setup is only available for admin accounts.' });
    }

    // Generate TOTP secret
    const secret = speakeasy.generateSecret({
      name: `CreatorBharat Admin (${req.user.email})`,
      issuer: 'CreatorBharat'
    });

    // Store secret (not yet enabled — user must verify first)
    await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFactorSecret: secret.base32, twoFactorEnabled: false }
    });

    // Generate QR code data URL
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
      message: 'Scan this QR code with Google Authenticator, Authy, or any TOTP app.'
    });
  } catch (err) {
    console.error('[/2fa/setup] Error:', err.message);
    res.status(500).json({ error: '2FA setup failed.' });
  }
});

// POST /api/auth/2fa/verify — Verify a TOTP code and enable 2FA for the account
router.post('/2fa/verify', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: '2FA is only available for admin accounts.' });
    }

    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'TOTP code is required.' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user.twoFactorSecret) {
      return res.status(400).json({ error: 'Run 2FA setup first before verifying.' });
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code.trim(),
      window: 2 // Allow 2 steps of clock drift
    });

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid TOTP code. Please check your authenticator app.' });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFactorEnabled: true }
    });

    res.json({ success: true, message: '2FA has been enabled for your account.' });
  } catch (err) {
    console.error('[/2fa/verify] Error:', err.message);
    res.status(500).json({ error: '2FA verification failed.' });
  }
});

// POST /api/auth/2fa/validate — Validate TOTP code during login (challenge step)
router.post('/2fa/validate', async (req, res) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) {
      return res.status(400).json({ error: 'User ID and TOTP code are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { creator: true, brand: true }
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ error: 'Invalid 2FA challenge request.' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ error: 'Account suspended.' });
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code.trim(),
      window: 2
    });

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid TOTP code. Please try again.' });
    }

    const authResp = await buildAuthResponse(user);
    res.json(authResp);
  } catch (err) {
    console.error('[/2fa/validate] Error:', err.message);
    res.status(500).json({ error: '2FA validation failed.' });
  }
});

// POST /api/auth/2fa/disable — Disable 2FA (requires valid TOTP code + password)
router.post('/2fa/disable', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin only.' });
    }

    const { code, password } = req.body;
    if (!code || !password) {
      return res.status(400).json({ error: 'TOTP code and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const pwMatch = await bcrypt.compare(password, user.password);
    if (!pwMatch) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA is not currently enabled.' });
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code.trim(),
      window: 2
    });

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid TOTP code.' });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFactorEnabled: false, twoFactorSecret: null }
    });

    res.json({ success: true, message: '2FA has been disabled for your account.' });
  } catch (err) {
    console.error('[/2fa/disable] Error:', err.message);
    res.status(500).json({ error: '2FA disable failed.' });
  }
});

// ─── OTP ─────────────────────────────────────────────────────────────────────

// Send OTP to phone number
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit phone number.' });
    }

    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit phone number.' });
    }

    // Default code 1234 for dev/testing, random 4-digit for production
    const otp = process.env.NODE_ENV === 'production' ? Math.floor(1000 + Math.random() * 9000).toString() : '1234';
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.otpVerification.upsert({
      where: { phone: cleanedPhone },
      update: { otp, expiresAt },
      create: { phone: cleanedPhone, otp, expiresAt }
    });

    // Send the OTP via our production SMS utility
    await sendSMS(cleanedPhone, otp);

    res.json({ success: true, message: 'OTP sent successfully.' });
  } catch (err) {
    console.error('[send-otp] Error:', err.message);
    res.status(500).json({ error: 'Failed to send OTP.' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required.' });
    }

    const cleanedPhone = phone.replace(/\D/g, '');
    const record = await prisma.otpVerification.findUnique({
      where: { phone: cleanedPhone }
    });

    if (!record) {
      return res.status(400).json({ error: 'No OTP requested for this phone number.' });
    }

    if (new Date() > record.expiresAt) {
      await prisma.otpVerification.delete({ where: { phone: cleanedPhone } }).catch(() => {});
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

    res.json({ success: true, message: 'OTP verified successfully.' });
  } catch (err) {
    console.error('[verify-otp] Error:', err.message);
    res.status(500).json({ error: 'Verification failed.' });
  }
});

// Login using Phone and OTP
router.post('/login-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required.' });
    }

    const cleanedPhone = phone.replace(/\D/g, '');
    const record = await prisma.otpVerification.findUnique({
      where: { phone: cleanedPhone }
    });

    if (!record) {
      return res.status(400).json({ error: 'No OTP requested for this phone number.' });
    }

    if (new Date() > record.expiresAt) {
      await prisma.otpVerification.delete({ where: { phone: cleanedPhone } }).catch(() => {});
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

    const user = await prisma.user.findUnique({
      where: { phone: cleanedPhone },
      include: { creator: true, brand: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'No account found with this phone number. Please sign up first.' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ error: 'Your account has been suspended by an administrator. Please contact support.' });
    }

    await prisma.otpVerification.delete({ where: { phone: cleanedPhone } }).catch(() => {});

    const authResp = await buildAuthResponse(user);
    res.json(authResp);
  } catch (err) {
    console.error('[login-otp] Error:', err.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ─── Creator Registration ────────────────────────────────────────────────────

router.post('/register/creator', async (req, res) => {
  try {
    const validated = CreatorRegisterSchema.parse(req.body);
    const emailLower = validated.email.toLowerCase().trim();
    const handleLower = validated.handle.toLowerCase().trim();

    const emailExists = await prisma.user.findUnique({ where: { email: emailLower } });
    if (emailExists) return res.status(400).json({ error: 'Email already registered.' });

    const handleExists = await prisma.creator.findUnique({ where: { handle: handleLower } });
    if (handleExists) return res.status(400).json({ error: 'Handle already taken.' });

    let verifiedPhone = null;
    if (validated.phone) {
      const cleanedPhone = validated.phone.replace(/\D/g, '');
      const record = await prisma.otpVerification.findUnique({
        where: { phone: cleanedPhone }
      });
      if (!record || record.otp !== validated.otp?.trim() || new Date() > record.expiresAt) {
        return res.status(400).json({ error: 'Invalid or expired OTP for phone verification.' });
      }
      
      const phoneExists = await prisma.user.findUnique({ where: { phone: cleanedPhone } });
      if (phoneExists) {
        return res.status(400).json({ error: 'Phone number already registered to another account.' });
      }
      verifiedPhone = cleanedPhone;
      await prisma.otpVerification.delete({ where: { phone: cleanedPhone } }).catch(() => {});
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const user = await prisma.user.create({
      data: {
        email: emailLower,
        phone: verifiedPhone,
        password: hashedPassword,
        role: 'CREATOR',
        creator: {
          create: {
            handle: handleLower,
            name: validated.name.trim(),
            city: validated.city?.trim() || null,
            state: validated.state?.trim() || null
          }
        }
      },
      include: { creator: true }
    });

    const authResp = await buildAuthResponse(user);
    res.status(201).json(authResp);

    sendEmail({
      to: user.email,
      subject: 'Welcome to CreatorBharat! 🇮🇳',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #0f172a; max-width: 600px; margin: auto; border: 1px solid #f1f5f9; border-radius: 12px;">
          <h2 style="color: #FF9431;">Welcome to CreatorBharat, ${validated.name.trim()}! 🎉</h2>
          <p>We are thrilled to have you join India's premier influencer network.</p>
          <p>Here are your next steps to get started:</p>
          <ul style="line-height: 1.6;">
            <li><strong>Complete your profile:</strong> Add your portfolio, rates, and local impact details.</li>
            <li><strong>Submit for Verification:</strong> Get your Elite Badge to stand out to premium brands.</li>
            <li><strong>Apply to Campaigns:</strong> Pitch directly to campaigns in your niche.</li>
          </ul>
          <p style="margin-top: 24px;">Best regards,<br/><strong>Team CreatorBharat</strong></p>
        </div>
      `
    }).catch(err => console.error('Welcome email error:', err));
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('[register/creator] Error:', err.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ─── Brand Registration ──────────────────────────────────────────────────────

router.post('/register/brand', async (req, res) => {
  try {
    const validated = BrandRegisterSchema.parse(req.body);
    const emailLower = validated.email.toLowerCase().trim();

    const emailExists = await prisma.user.findUnique({ where: { email: emailLower } });
    if (emailExists) return res.status(400).json({ error: 'Email already registered.' });

    let verifiedPhone = null;
    if (validated.phone) {
      if (validated.country === 'India') {
        const cleanedPhone = validated.phone.replace(/\D/g, '');
        const record = await prisma.otpVerification.findUnique({
          where: { phone: cleanedPhone }
        });
        if (!record || record.otp !== validated.otp?.trim() || new Date() > record.expiresAt) {
          return res.status(400).json({ error: 'Invalid or expired OTP for phone verification.' });
        }
        
        const phoneExists = await prisma.user.findUnique({ where: { phone: cleanedPhone } });
        if (phoneExists) {
          return res.status(400).json({ error: 'Phone number already registered to another account.' });
        }
        verifiedPhone = cleanedPhone;
        await prisma.otpVerification.delete({ where: { phone: cleanedPhone } }).catch(() => {});
      } else {
        const cleanedPhone = validated.phone.replace(/[^\d+]/g, '');
        const phoneExists = await prisma.user.findUnique({ where: { phone: cleanedPhone } });
        if (phoneExists) {
          return res.status(400).json({ error: 'Phone number already registered to another account.' });
        }
        verifiedPhone = cleanedPhone;
      }
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const user = await prisma.user.create({
      data: {
        email: emailLower,
        phone: verifiedPhone,
        password: hashedPassword,
        role: 'BRAND',
        brand: {
          create: {
            companyName: validated.companyName.trim(),
            industry: validated.industry?.trim() || null,
            website: validated.website?.trim() || null,
            country: validated.country,
            state: validated.state?.trim() || null,
            city: validated.city?.trim() || null
          }
        }
      },
      include: { brand: true }
    });

    const authResp = await buildAuthResponse(user);
    res.status(201).json(authResp);

    sendEmail({
      to: user.email,
      subject: 'Welcome to CreatorBharat for Brands! 💼',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #0f172a; max-width: 600px; margin: auto; border: 1px solid #f1f5f9; border-radius: 12px;">
          <h2 style="color: #FF9431;">Welcome to CreatorBharat, ${validated.companyName.trim()}! 🎉</h2>
          <p>We are thrilled to help you scale your campaigns with India's top regional storytellers.</p>
          <p>Here is what you can do right now:</p>
          <ul style="line-height: 1.6;">
            <li><strong>Post a Campaign:</strong> Create a campaign proposal and set your budget.</li>
            <li><strong>Discover Creators:</strong> Use our advanced geographic and niche filters to find verified partners.</li>
            <li><strong>Manage Pitches:</strong> Review creator applications and deposit funds securely into escrow.</li>
          </ul>
          <p style="margin-top: 24px;">Best regards,<br/><strong>Team CreatorBharat</strong></p>
        </div>
      `
    }).catch(err => console.error('Welcome email error:', err));
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('[register/brand] Error:', err.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ─── Email/Password Login ────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { creator: true, brand: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ error: 'Your account has been suspended by an administrator. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // If admin has 2FA enabled, issue a challenge instead of full login
    if (user.role === 'ADMIN' && user.twoFactorEnabled) {
      return res.status(200).json({
        requiresTwoFactor: true,
        userId: user.id,
        message: 'Enter your authenticator app code to complete login.'
      });
    }

    const authResp = await buildAuthResponse(user);
    res.json(authResp);
  } catch (err) {
    console.error('[login] Error:', err.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ─── Session ─────────────────────────────────────────────────────────────────

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: safeUser(req.user) });
});

// ─── Password Reset ──────────────────────────────────────────────────────────

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { creator: true, brand: true }
    });

    if (!user) {
      return res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.passwordReset.create({
      data: { token, userId: user.id, expiresAt }
    });

    const origin = req.headers.origin || 'http://localhost:5173';
    const resetUrl = `${origin}/reset-password?token=${token}`;
    const userName = user.creator?.name || user.brand?.companyName || 'Member';

    await sendEmail({
      to: user.email,
      subject: 'Reset Your CreatorBharat Password 🔒',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #0f172a; max-width: 600px; margin: auto; border: 1px solid #f1f5f9; border-radius: 12px;">
          <h2 style="color: #FF9431;">Reset Your Password 🔒</h2>
          <p>Hello ${userName},</p>
          <p>We received a request to reset the password for your CreatorBharat account. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #FF9431; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 100px; font-weight: 900; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 12px; color: #64748b;">This link will expire in 15 minutes. If you did not request a password reset, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="font-size: 11px; color: #94a3b8;">If the button above does not work, copy and paste this URL into your browser:</p>
          <p style="font-size: 11px; color: #FF9431; word-break: break-all;">${resetUrl}</p>
          <p style="margin-top: 24px; font-size: 13px;">Best regards,<br/><strong>Team CreatorBharat</strong></p>
        </div>
      `
    });

    res.json({ success: true, message: 'Password reset email sent successfully.' });
  } catch (err) {
    console.error('[forgot-password] Error:', err.message);
    res.status(500).json({ error: 'Failed to request password reset. Please try again.' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const record = await prisma.passwordReset.findUnique({ where: { token } });
    if (!record) {
      return res.status(400).json({ error: 'This password reset link is invalid or has expired.' });
    }

    if (new Date() > record.expiresAt) {
      await prisma.passwordReset.delete({ where: { token } }).catch(() => {});
      return res.status(400).json({ error: 'This password reset link has expired. Please request a new one.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: record.userId }, data: { password: hashedPassword } });
    await prisma.passwordReset.delete({ where: { token } }).catch(() => {});

    // Send security alert email after successful password reset
    const updatedUser = await prisma.user.findUnique({
      where: { id: record.userId },
      include: { creator: true, brand: true }
    });
    if (updatedUser) {
      const userName = updatedUser.creator?.name || updatedUser.brand?.companyName || 'Member';
      const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
      sendEmail({
        to: updatedUser.email,
        subject: '⚠️ Your CreatorBharat Password Was Changed',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #0f172a; max-width: 600px; margin: auto; border: 1px solid #f1f5f9; border-radius: 12px;">
            <h2 style="color: #FF9431;">Password Changed Successfully 🔒</h2>
            <p>Hello ${userName},</p>
            <p>Your CreatorBharat account password was successfully changed on <strong>${now} IST</strong>.</p>
            <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 14px; margin: 20px 0;">
              <p style="margin: 0; font-size: 13px; color: #9a3412;">⚠️ <strong>If you did NOT make this change</strong>, your account may be compromised. Please contact us immediately at <a href="mailto:support@creatorbharat.com" style="color: #FF9431;">support@creatorbharat.com</a> or reset your password again right away.</p>
            </div>
            <p style="margin-top: 24px; font-size: 13px;">Best regards,<br/><strong>Team CreatorBharat</strong></p>
          </div>
        `
      }).catch(err => console.error('[reset-password] Confirmation email error:', err));
    }

    res.json({ success: true, message: 'Your password has been reset successfully.' });
  } catch (err) {
    console.error('[reset-password] Error:', err.message);
    res.status(500).json({ error: 'Failed to reset password. Please try again.' });
  }
});

// ─── Google OAuth ─────────────────────────────────────────────────────────────

router.get('/google', (req, res) => {
  const role = req.query.role || 'creator';
  
  let origin = req.query.origin || '';
  if (!origin) {
    const referer = req.get('referer') || '';
    if (referer) {
      try {
        origin = new URL(referer).origin;
      } catch (err) {
        origin = 'http://localhost:5173';
      }
    } else {
      origin = 'http://localhost:5173';
    }
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Google OAuth]: Missing GOOGLE_CLIENT_ID in development. Redirecting to mock login.');
      const redirectCallbackUrl = `${req.protocol}://${req.get('host')}/api/auth/google/callback?code=mock_development_code&state=${role}:::${origin}`;
      return res.redirect(redirectCallbackUrl);
    }
    console.error('[Google OAuth]: Missing GOOGLE_CLIENT_ID in server environment.');
    return res.status(500).send('Google Authentication is not configured on this server.');
  }

  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile&prompt=select_account&state=${role}:::${origin}`;
  res.redirect(googleAuthUrl);
});

router.get('/google/callback', async (req, res) => {
  const stateVal = req.query.state || '';
  const parts = stateVal.split(':::');
  const rolePart = parts[0] || 'creator';
  const originPart = parts[1] || process.env.FRONTEND_URL || 'http://localhost:5173';

  const frontendUrl = originPart;
  try {
    const { code } = req.query;
    const role = rolePart === 'brand' ? 'BRAND' : 'CREATOR';

    if (!code) {
      return res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }

    let emailLower, name, picture;

    const host = req.get('host') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

    if (code === 'mock_development_code' && isLocalhost && process.env.NODE_ENV !== 'production') {
      emailLower = 'google-mock-user@creatorbharat.com';
      name = 'Google Dev User';
      picture = 'https://lh3.googleusercontent.com/a/default-user=s96-c';
    } else {
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
      
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });

      const tokens = await tokenResponse.json();
      if (tokens.error) {
        console.error('[Google OAuth Token Error]:', tokens.error_description || tokens.error);
        return res.redirect(`${frontendUrl}/login?error=token_failed`);
      }

      const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });
      
      const profile = await profileResponse.json();
      if (!profile.email) {
        console.error('[Google OAuth Profile Error]: Missing email in profile payload.');
        return res.redirect(`${frontendUrl}/login?error=profile_failed`);
      }

      emailLower = profile.email.toLowerCase().trim();
      name = profile.name;
      picture = profile.picture;
    }

    let user = await prisma.user.findUnique({
      where: { email: emailLower },
      include: { creator: true, brand: true }
    });

    if (user) {
      // ─── Role Mismatch Protection ─────────────────────────────────────────
      // If someone tries to use the same email for a different role via Google,
      // block it and redirect with a clear error message.
      const userRoleLower = user.role.toLowerCase();
      if (userRoleLower !== role.toLowerCase()) {
        const existingRoleLabel = userRoleLower === 'creator' ? 'Creator' : 'Brand';
        const attemptedRoleLabel = role.toLowerCase() === 'creator' ? 'Creator' : 'Brand';
        console.warn(`[Google OAuth] Role mismatch: ${emailLower} is a ${existingRoleLabel}, tried to login as ${attemptedRoleLabel}`);
        return res.redirect(`${frontendUrl}/login?error=email_role_mismatch&existing_role=${userRoleLower}&attempted_role=${role.toLowerCase()}`);
      }
      // ─────────────────────────────────────────────────────────────────────

      if (user.role === 'CREATOR' && user.creator) {
        let needsUpdate = false;
        const updateData = {};
        if (!user.creator.photo && picture) {
          updateData.photo = picture;
          needsUpdate = true;
        }
        if ((!user.creator.name || user.creator.name === 'Bharat Creator') && name) {
          updateData.name = name;
          needsUpdate = true;
        }
        if (needsUpdate) {
          await prisma.creator.update({
            where: { id: user.creator.id },
            data: updateData
          });
          // Reload user with updated creator info
          user = await prisma.user.findUnique({
            where: { id: user.id },
            include: { creator: true, brand: true }
          });
        }
      }
    }

    if (!user) {
      const dummyPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(dummyPassword, 10);
      
      if (role === 'CREATOR') {
        const baseHandle = emailLower.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
        let handle = baseHandle;
        let handleCount = 0;
        let handleExists = await prisma.creator.findUnique({ where: { handle } });
        while (handleExists) {
          handleCount++;
          handle = `${baseHandle}${handleCount}`;
          handleExists = await prisma.creator.findUnique({ where: { handle } });
        }

        user = await prisma.user.create({
          data: {
            email: emailLower,
            password: hashedPassword,
            role: 'CREATOR',
            creator: {
              create: {
                handle,
                name: name || 'Bharat Creator',
                photo: picture || null
              }
            }
          },
          include: { creator: true }
        });

        // Send welcome email to new Google Creator
        sendEmail({
          to: user.email,
          subject: 'Welcome to CreatorBharat! 🇮🇳',
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #0f172a; max-width: 600px; margin: auto; border: 1px solid #f1f5f9; border-radius: 12px;">
              <h2 style="color: #FF9431;">Welcome to CreatorBharat, ${name || 'Creator'}! 🎉</h2>
              <p>You have successfully signed up using Google. We are thrilled to have you join India's premier influencer network.</p>
              <p>Here are your next steps to get started:</p>
              <ul style="line-height: 1.6;">
                <li><strong>Complete your profile:</strong> Add your portfolio, rates, and local impact details.</li>
                <li><strong>Submit for Verification:</strong> Get your Elite Badge to stand out to premium brands.</li>
                <li><strong>Apply to Campaigns:</strong> Pitch directly to campaigns in your niche.</li>
              </ul>
              <p style="margin-top: 24px;">Best regards,<br/><strong>Team CreatorBharat</strong></p>
            </div>
          `
        }).catch(err => console.error('[Google OAuth] Creator welcome email error:', err));

      } else {
        user = await prisma.user.create({
          data: {
            email: emailLower,
            password: hashedPassword,
            role: 'BRAND',
            brand: {
              create: { companyName: name || 'Bharat Brand Partner' }
            }
          },
          include: { brand: true }
        });

        // Send welcome email to new Google Brand
        sendEmail({
          to: user.email,
          subject: 'Welcome to CreatorBharat for Brands! 💼',
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #0f172a; max-width: 600px; margin: auto; border: 1px solid #f1f5f9; border-radius: 12px;">
              <h2 style="color: #FF9431;">Welcome to CreatorBharat, ${name || 'Brand Partner'}! 🎉</h2>
              <p>You have successfully signed up using Google. We are thrilled to help you scale your campaigns with India's top regional storytellers.</p>
              <p>Here is what you can do right now:</p>
              <ul style="line-height: 1.6;">
                <li><strong>Post a Campaign:</strong> Create a campaign proposal and set your budget.</li>
                <li><strong>Discover Creators:</strong> Use our advanced geographic and niche filters to find verified partners.</li>
                <li><strong>Manage Pitches:</strong> Review creator applications and deposit funds securely into escrow.</li>
              </ul>
              <p style="margin-top: 24px;">Best regards,<br/><strong>Team CreatorBharat</strong></p>
            </div>
          `
        }).catch(err => console.error('[Google OAuth] Brand welcome email error:', err));
      }
    }

    if (user.isSuspended) {
      return res.redirect(`${frontendUrl}/login?error=suspended`);
    }

    // Google OAuth: issue refresh token too, pass it via URL fragment
    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);
    await persistRefreshToken(user.id, refreshToken);
    
    res.redirect(`${frontendUrl}/login?token=${accessToken}&refreshToken=${refreshToken}`);
  } catch (err) {
    console.error('[Google OAuth Callback Exception]:', err.message);
    res.redirect(`${frontendUrl}/login?error=server_error`);
  }
});

export default router;
