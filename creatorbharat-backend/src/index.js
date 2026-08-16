// 🇮🇳 CreatorBharat SaaS Express API Server
import * as Sentry from '@sentry/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { rateLimit } from 'express-rate-limit';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from './prisma.js';
import { getSettings } from './utils/settings.js';
import { authMiddleware, requireRole, requireTeamRoles } from './middleware/auth.js';

// Route Imports
import authRouter from './routes/auth.js';
import creatorsRouter from './routes/creators.js';
import campaignsRouter from './routes/campaigns.js';
import adminRouter from './routes/admin.js';
import applicationsRouter from './routes/applications.js';
import paymentsRouter from './routes/payments.js';
import reviewsRouter from './routes/reviews.js';
import messagesRouter from './routes/messages.js';
import blogRouter from './routes/blog.js';
import uploadsRouter from './routes/uploads.js';
import newsletterRouter from './routes/newsletter.js';
import contactsRouter from './routes/contacts.js';
import galleryRouter from './routes/gallery.js';
import podcastsRouter from './routes/podcasts.js';
import aiRouter from './routes/ai.js';
import gigsRouter from './routes/gigs.js';
import notificationsRouter from './routes/notifications.js';
import achievementsRouter from './routes/achievements.js';
import eventsRouter from './routes/events.js';
import communityRouter from './routes/community.js';
import referralsRouter from './routes/referrals.js';
import missionsRouter from './routes/missions.js';
import ambassadorRouter from './routes/ambassador.js';
import savedRouter from './routes/saved.js';
import teamRouter from './routes/team.js';
import { runOnboardingDrip } from './drip/onboardingDrip.js';

const originalNodeEnv = process.env.NODE_ENV;
dotenv.config();
if (originalNodeEnv) {
  process.env.NODE_ENV = originalNodeEnv;
}
console.log('--- GOOGLE OAUTH STARTUP CHECK ---');
console.log('GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('GOOGLE_REDIRECT_URI exists:', !!process.env.GOOGLE_REDIRECT_URI);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('----------------------------------');

// ─── Sentry Error Tracking ────────────────────────────────────────────────────
Sentry.init({
  dsn: process.env.SENTRY_DSN || '', // Set SENTRY_DSN in .env for error tracking
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 0,
  enabled: !!process.env.SENTRY_DSN, // Only active when DSN is provided
});

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 4000;
const server = createServer(app);

// ─── CORS Configuration ───────────────────────────────────────────────────────
// In production: reads ALLOWED_ORIGINS env var (comma-separated)
// In development: allows localhost + any Vercel preview + creatorbharat domains
const devAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'http://localhost:4000'
];

const productionOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server calls (no origin)
    if (!origin) return callback(null, true);

    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      // Strict: only explicitly listed production origins
      if (productionOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: Origin ${origin} is not allowed in production.`));
    }

    // Development: allow localhost + Vercel previews + creatorbharat domains
    const isAllowed = devAllowedOrigins.includes(origin) ||
                      origin.endsWith('.vercel.app') ||
                      origin.includes('creatorbharat');
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'cb_token']
};

const io = new Server(server, {
  cors: corsOptions
});

// Response compression, Security and CORS middleware
app.use(compression());
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

// XSS Input Sanitizer middleware to protect from cross-site scripting
function sanitizeInput(obj) {
  if (typeof obj === 'string') {
    return obj
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/g, '')
      .replace(/javascript:[^"]*/g, '');
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeInput);
  }
  if (obj !== null && typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      sanitized[key] = sanitizeInput(obj[key]);
    }
    return sanitized;
  }
  return obj;
}

app.use((req, res, next) => {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  next();
});

app.use('/uploads', express.static('public/uploads'));

// Strict Rate Limiter for Authentication & OTP requests to prevent spams
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 auth/OTP requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again after a minute.' }
});

// Relaxed Rate Limiter for general browsing APIs
const browseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // Limit each IP to 600 requests per 15 minutes for browsing
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/auth/', authLimiter);
app.use('/api/', browseLimiter);

// Base Health Check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the CreatorBharat SaaS Production API Server! 🇮🇳 🚀',
    status: 'online',
    version: '3.0.0',
    support: 'hello@creatorbharat.com'
  });
});

app.get('/api', (req, res) => {
  res.json({ message: 'CreatorBharat SaaS REST API Engine is active 🚀' });
});

app.get('/api/stats/summary', async (req, res) => {
  try {
    const totalCreators = await prisma.creator.count();
    const reachResult = await prisma.creator.aggregate({
      _sum: { followers: true }
    });
    const totalReach = reachResult._sum.followers || 0;
    const totalCampaigns = await prisma.campaign.count();
    const totalBrands = await prisma.brand.count();

    const stateCountsResult = await prisma.creator.groupBy({
      by: ['state'],
      _count: { state: true }
    });

    const stateCounts = {};
    stateCountsResult.forEach(item => {
      if (item.state) {
        stateCounts[item.state] = item._count.state;
      }
    });

    res.json({
      totalCreators,
      totalReach,
      totalCampaigns,
      totalBrands,
      stateCounts
    });
  } catch (err) {
    console.error('[GET /api/stats/summary] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch platform summary statistics.' });
  }
});

// GET /api/settings/public — public endpoint to load branding details
app.get('/api/settings/public', async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({
      siteName: settings.siteName,
      supportEmail: settings.supportEmail,
      logoUrl: settings.logoUrl,
      footerEmail: settings.footerEmail,
    });
  } catch (err) {
    console.error('[GET /api/settings/public] Error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve public settings.' });
  }
});

// GET /api/brands/:id — public route to fetch brand profile details
app.get('/api/brands/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await prisma.brand.findUnique({
      where: { id },
      select: {
        id: true,
        companyName: true,
        logo: true,
        website: true,
        verified: true
      }
    });
    if (!brand) {
      return res.status(404).json({ error: 'Brand profile not found.' });
    }
    res.json({
      id: brand.id,
      name: brand.companyName,
      photo: brand.logo,
      website: brand.website,
      verified: brand.verified
    });
  } catch (err) {
    console.error('[GET /api/brands/:id] Error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve brand profile.' });
  }
});

// GET /api/pages/:pageName — public route to fetch page configuration
app.get('/api/pages/:pageName', async (req, res) => {
  try {
    const { pageName } = req.params;
    const config = await prisma.dynamicPageConfig.findUnique({
      where: { pageName }
    });
    if (!config) {
      // Structured defaults for demo environments
      let defaultContent = {};
      if (pageName === 'home') {
        defaultContent = {
          heroTitle: 'Find Elite Local Creators Across India',
          heroSubtitle: 'CreatorBharat connects top regional influencers with local and global brands for impactful collaborations.',
          ctaText: 'Launch Campaign Now',
          announcement: '⚡ Version 3.0 Live: Introducing Instant Wallet Bank Settlements!'
        };
      } else if (pageName === 'pricing') {
        defaultContent = {
          starterPrice: 0,
          proPrice: 49,
          proFeatures: 'Instant wallet withdrawals, Automated GST invoicing, Priority campaign listing, 0% commission fees, Pro verified badge',
          brandStarterPrice: 0,
          brandProPrice: 4999,
          brandProFeatures: 'Launch Unlimited Campaigns, Direct Outreach Pitch Console, Full A4 Creator Resume Access, Verified Gold Brand Badge, AI Smart Talent Matches, Advanced Analytics Dashboard, 24/7 Premium Priority Support'
        };
      } else if (pageName === 'calculator') {
        defaultContent = {
          rateMultiplier: 0.018,
          nicheMultiplier: 1.0,
          minFee: 500
        };
      } else if (pageName === 'faqs' || pageName === 'faq') {
        defaultContent = [
          { q: 'How does CreatorBharat escrow work?', a: 'Brands deposit campaign budgets into secure escrows. Funds are released instantly to creators after verified milestone deliverables are submitted.' },
          { q: 'Is there a signup fee for creators?', a: 'Signing up as a basic creator is completely free. Basic creators can receive brand deals. Creator Pro unlocking instant payouts requires a tiny monthly fee of ₹49.' },
          { q: 'Can I link multiple Instagram accounts?', a: 'Currently, each creator account can link one verified primary Instagram handle and one YouTube channel to calculate dynamic engagement rates.' }
        ];
      } else if (pageName === 'creator-landing') {
        defaultContent = {
          heroBadge: "India's Creator Ecosystem",
          heroTitle: "Build Your Creator Legacy.",
          heroSubtitle: "Bharat ke har creator ke liye — Tier 2, Tier 3, ya metro. Verified profile, direct brand deals, zero commission. Apni pehchan banao.",
          ctaPrimary: "Join Free — Start Today",
          ctaSecondary: "See Creator Profiles",
          bottomTitle: "Bharat Ka Creator Kahin Bhi Jayega. 🇮🇳",
          bottomSubtitle: "Bhilwara se Bangalore tak — har creator ki pehchan honi chahiye. Join karo aur apni legacy banao.",
          bottomCtaPrimary: "Join Free Now",
          bottomCtaSecondary: "View Pro Plans"
        };
      } else if (pageName === 'brand-landing') {
        defaultContent = {
          heroBadge: "Brand Command Center",
          heroTitle: "Scale with Bharat's Best.",
          heroSubtitle: "Scout verified regional creators, launch campaigns with escrow protection, and track ROI in real-time. Zero commission. Zero middlemen.",
          ctaPrimary: "Start Scouting Free",
          ctaSecondary: "Browse Creators",
          bottomTitle: "Ready to Scale? Join 500+ Brands.",
          bottomSubtitle: "Start free. No credit card required. Access Bharat's most verified creator network today.",
          bottomCtaPrimary: "Register Your Brand",
          bottomCtaSecondary: "Browse Creators"
        };
      } else if (pageName === 'about') {
        defaultContent = {
          BLUEPRINT_CARDS: [
            {
              num: "01",
              title: "Verify Identity",
              sub: "Digital Pehchan",
              desc: "We verify the analytics, location, and brand-safety of regional creators so brands can bypass fake followers and hire authentic talent.",
              accent: "#FF9431"
            },
            {
              num: "02",
              title: "Bypass Middlemen",
              sub: "Direct Pitch SaaS",
              desc: "Brands pitch directly to creators in Tier 2 & 3 cities through our open marketplace. No agency gatekeepers or massive markups.",
              accent: "#10B981"
            },
            {
              num: "03",
              title: "Zero Broker Fees",
              sub: "Safe Escrow Ledgers",
              desc: "Payouts are secured in safe escrow ledgers and released immediately upon project completion. Best part? We charge 0% commission.",
              accent: "#3B82F6"
            }
          ],
          TIMELINE_DATA: [
            {
              year: "JAN 2026: THE SPARK",
              title: "The Bhilwara Prototype",
              desc: "Identifying the massive gap between regional talent in Tier 2 & 3 cities and national brand opportunities. We tested our first directory manually mapping 150 local creators in Rajasthan.",
              stats: [
                { label: "Creators Mapped", value: "150+" },
                { label: "Target City", value: "Bhilwara" }
              ]
            },
            {
              year: "APR 2026: THE INFRASTRUCTURE",
              title: "The Trust & Identity Layer",
              desc: "Launched our proprietary Creator Score algorithm and verified Digital Pehchan. This allowed upcoming creators to present data-validated analytics without expensive agencies.",
              stats: [
                { label: "Active Profiles", value: "1,200+" },
                { label: "System Trust Metric", value: "Blue Badges" }
              ]
            },
            {
              year: "JUN 2026: THE EXPANSION",
              title: "Elite National Marketplace",
              desc: "Scaled CreatorBharat into an elite SaaS platform with zero broker fee policies, automated ROI calculators, interactive podium leaderboards, and safe escrow ledger systems.",
              stats: [
                { label: "Active Users", value: "2,400+" },
                { label: "Broker Fees Charged", value: "0%" }
              ]
            }
          ],
          PHILOSOPHY_PILLARS: [
            {
              title: 'Identity',
              desc: 'Giving every creator a verified, data-backed professional portfolio that brands can trust.',
              features: ['Digital Pehchan Profile', 'Real-Time Engagement APIs', 'Anti-Fraud Score Metrics'],
              color: '#FF9431',
              badge: 'Infrastructure'
            },
            {
              title: 'Access',
              desc: 'Removing gatekeepers. Creators in small towns now apply directly to the biggest national brands.',
              features: ['Zero-Brokerage Escrow', 'Open Pitch Marketplace', 'Local Language Support'],
              color: '#10B981',
              badge: 'Opportunity'
            },
            {
              title: 'Growth',
              desc: 'Providing the financial tools and analytics to scale from a local star to a national icon.',
              features: ['ROI Valuation Gauges', 'SaaS Media Kits', 'Fast Invoice Financing'],
              color: '#3B82F6',
              badge: 'Scale'
            }
          ],
          LEADERSHIP_TEAM: [
            {
              name: "Mohmmad Dilshan",
              role: "Founder & Chief Architect",
              image: "/team_dilshan.jpg",
              bio: "Democratizing the digital economy for the next billion users through decentralized intelligence, modular architecture, and zero-brokerage campaigns.",
              skills: ["System Architecture", "Product Strategy", "Decentralized Networks", "Escrow Ledgers"],
              socials: {
                linkedin: "https://linkedin.com/in/mohmmad-dilshan",
                github: "https://github.com/mohmmad-dilshan"
              },
              tag: "CONSENSUS_NODE_001",
              location: "Bhilwara"
            }
          ],
          ADVISORY_BOARD: [],
          PRESS_LOGOS: [
            { name: "YourStory", desc: "Featured in Top Regional Startups" },
            { name: "Economic Times", desc: "The SaaS Shift in Creator Tech" },
            { name: "LiveMint", desc: "Empowering Tier 2 & 3 Micro-influencers" },
            { name: "TechCrunch", desc: "Zero-Brokerage Escrow Platform Launch" },
            { name: "Business Standard", desc: "SaaS Disrupting Traditional Talent Agencies" }
          ],
          INVESTOR_LOGOS: [
            { name: "Y Combinator", type: "W26 Candidate" },
            { name: "Sequoia Spark", type: "Cohort III" },
            { name: "Accel Partners", type: "Seed Backer" },
            { name: "AngelList India", type: "Syndicate Lead" }
          ]
        };
      } else if (pageName === 'press') {
        defaultContent = [
          {
            date: "June 10, 2026",
            title: "CreatorBharat Launched: Setting up India's First Identity Layer for Tier 2 & 3 Creators",
            excerpt: "CreatorBharat today announced the rollout of v1, introducing an AI-driven digital trust score, localized regional discovery, and 0% commission structures for micro-creators.",
            url: "#"
          },
          {
            date: "March 15, 2026",
            title: "CreatorBharat Onboards 1,200+ Verified Creators Across Rajasthan and Madhya Pradesh",
            excerpt: "The startup has witnessed 4x growth in regional creator registrations, enabling local brands in Jaipur, Bhilwara, and Indore to run high-ROI campaigns directly.",
            url: "#"
          },
          {
            date: "January 22, 2026",
            title: "CreatorBharat Receives DPIIT Startup Recognition from Govt of India",
            excerpt: "Recognized for building innovative digital infrastructure that maps and verifies regional talent, promoting localized employment and direct commerce.",
            url: "#"
          }
        ];
      } else if (pageName === 'stories') {
        defaultContent = [
          {
            id: 'story-1',
            type: 'brand',
            brandName: 'Jaipur Heritage Apparel',
            niche: 'Fashion & Retail',
            location: 'Jaipur, Rajasthan',
            creatorName: 'Aryan Sharma',
            avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&q=80',
            banner: '/campaign_jaipur_heritage.png',
            title: 'How Jaipur Heritage Apparel grew Sales by 3x in 30 Days 🚀',
            description: 'A traditional fashion brand in Jaipur struggled to reach Gen-Z consumers through social ads, which had high acquisition costs. Partnered with regional creators to curate authentic styling reels.',
            challenge: 'High customer acquisition cost (CAC) and zero regional awareness.',
            solution: 'Launched a hyperlocal styling mission with 3 verified local fashion creators on Instagram.',
            metrics: [
              { label: 'Sales Growth', value: '310%', icon: 'TrendingUp', color: '#ff9431' },
              { label: 'CAC Reduced', value: '-42%', icon: 'Target', color: '#ff4b4b' },
              { label: 'Organic Reach', value: '1.2M+', icon: 'Users', color: '#3b82f6' }
            ],
            testimonial: {
              quote: "CreatorBharat solved our biggest challenge: authenticity at scale. Working with Aryan and other verified local creators was frictionless, and the ROI speaks for itself.",
              author: "Vikram Rathore",
              role: "Marketing Director",
              company: "Jaipur Heritage Apparel"
            },
            actionText: 'Collaborate with Aryan',
            actionPath: '/leaderboard'
          },
          {
            id: 'story-2',
            type: 'creator',
            creatorName: 'Ramesh Dewangan',
            channelName: '@BastarCraftsVlog',
            niche: 'Art & Heritage',
            location: 'Bastar, Chhattisgarh',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
            banner: '/campaign_bastar_crafts.png',
            title: 'From Bastar Village to National Brand Campaigns 🌟',
            description: 'Ramesh is a terracotta artisan in Chhattisgarh. Before joining CreatorBharat, he had no direct access to national brands. He now collaborates with major home decor brands across India.',
            challenge: 'Lack of brand access, pricing transparency, and modern identity tools.',
            solution: 'Created a verified digital creator profile on CreatorBharat, linking regional crafts to urban home design campaigns.',
            metrics: [
              { label: 'Earnings Secured', value: '₹3.5 Lakhs', icon: 'DollarSign', color: '#10b981' },
              { label: 'Followers Gained', value: '+180k', icon: 'Users', color: '#3b82f6' },
              { label: 'Direct Deals', value: '12 Campaigns', icon: 'Award', color: '#8b5cf6' }
            ],
            testimonial: {
              quote: "Pehle mujhe payments ke liye mahino intezar karna padta tha. CreatorBharat par register hone ke baad, brands mujhe direct secure escrows ke saath access karte hain.",
              author: "Ramesh Dewangan",
              role: "Terracotta Master Artisan",
              company: "Bastar Craft Syndicate"
            },
            actionText: "View Ramesh's Profile",
            actionPath: '/leaderboard'
          },
          {
            id: 'story-3',
            type: 'platform',
            title: 'DPIIT Registered Startup: 15,000+ Regional Identities Verified 🇮🇳',
            location: 'National Coverage',
            niche: 'Ecosystem Growth',
            banner: '/platform_milestone_bharat.png',
            description: 'CreatorBharat has officially mapped and verified over 15,000 regional creators across 28 states in India. Under our Bharat-first outreach program, we have eliminated intermediate brokerage commissions.',
            challenge: 'Fragmented talent registry and high commission brokerages in Tier 2/3 cities.',
            solution: 'Designed the unified "Digital Pehchan" verified trust scores, standard escrow payments, and regional leaderboard hubs.',
            metrics: [
              { label: 'States Mapped', value: '28 States', icon: 'Globe2', color: '#ff9431' },
              { label: 'Platform Fee', value: '0% Brokerage', icon: 'ShieldCheck', color: '#10b981' },
              { label: 'Ecosystem Trust', value: '99.4% Secured', icon: 'Zap', color: '#8b5cf6' }
            ],
            testimonial: {
              quote: "Our mission is to democratize opportunities for Tier-2 and Tier-3 talent. We are building the foundational verification layers that traditional agencies ignore.",
              author: "Mohmmad Dilshan",
              role: "Founder & CEO",
              company: "CreatorBharat"
            },
            actionText: 'Claim Your Profile Free',
            actionPath: '/join'
          }
        ];
      } else if (pageName === 'ai-faq') {
        defaultContent = [
          {
            q: "What is the CreatorBharat Elite Score?",
            a: "The Elite Score is a proprietary machine learning score (from 0 to 100) calculated by analyzing a creator's verified follower counts, comment-to-like engagement ratios, content consistency, brand safety index, and niche authority. Higher scores receive premium ranking on our public leaderboards."
          },
          {
            q: "How does the AI Matchmaker algorithm choose creators?",
            a: "Our campaign matching algorithm parses a brand's budget, niche requirements, platforms, and target location. It then performs semantic similarity matching against verified creator bios, local dialect parameters, and past campaign categories to recommend creators with the highest predicted ROI."
          },
          {
            q: "Why is Digital Pehchan KYC required?",
            a: "Digital Pehchan ensures that every creator profile on our platform belongs to a real citizen of India. By submitting Aadhaar, PAN, or GST credentials, creators verify their identity, which eliminates bot traffic and fake profiles and builds trust with brand sponsors."
          }
        ];
      } else if (pageName === 'notifications') {
        defaultContent = [
          {
            id: 'notif-1',
            refNo: 'CB/GOVT/2026/SEC-4/082',
            date: '17-06-2026',
            department: 'Dept. of Verification & Trust',
            deptHi: 'सत्यापन एवं विश्वास विभाग',
            title: 'BharatAI Profile Verification Engine Launched Under Section 4(a) 🛡️',
            titleHi: 'धारा 4(a) के तहत भारतएआई प्रोफाइल सत्यापन प्रणाली का शुभारंभ',
            description: 'All creators operating in Tier 2 & 3 regions of India are hereby notified to claim their official verified badge by submitting authentic audience engagement proofs. Verified profiles receive priority matching in brand campaign allotment. Compliance boosts creator visibility by up to 85%.',
            pdfName: 'CB_Verification_Gazette_v3.pdf',
            status: 'ACTIVE',
            signatory: 'Dr. R. K. Sen, Joint Secretary (Creator Welfare)',
            actionText: 'Apply for Verification',
            actionPath: '/join'
          },
          {
            id: 'notif-2',
            refNo: 'CB/GOVT/2026/MKT-9/104',
            date: '16-06-2026',
            department: 'Dept. of Campaign & Escrow Operations',
            deptHi: 'अभियान एवं एस्क्रो संचालन विभाग',
            title: 'Notification: Launch of Rajasthan Regional Spotlight Campaign 🏺',
            titleHi: 'अधिसूचना: राजस्थान क्षेत्रीय अभियान आवंटन सूचना',
            description: 'Applications are invited from eligible fashion, cultural, and lifestyle creators in Rajasthan for the Jaipur Heritage Promotion Spotlight. Budget allocation is guaranteed under official escrow protection terms. Direct payouts will be executed with zero commissions. Retainers start at ₹25,000 per asset.',
            pdfName: 'CB_Raj_Spotlight_Circular.pdf',
            status: 'ACTIVE',
            signatory: 'Smt. Anjali Sharma, Director (Campaign Allocation)',
            actionText: 'View Allotments',
            actionPath: '/creators'
          },
          {
            id: 'notif-3',
            refNo: 'CB/GOVT/2026/DIR-3/011',
            date: '14-06-2026',
            department: 'Ecosystem Registry Office',
            deptHi: 'पारिस्थितिकी तंत्र रजिस्ट्री कार्यालय',
            title: 'Release of Weekly Top 100 Virality Index & Leaderboard 🏆',
            titleHi: 'साप्ताहिक शीर्ष 100 क्रिएटर्स की वायरल सूचकांक सूची जारी',
            description: 'The national registry of top performing regional creators is updated for the current cycle. Weekly statistics are logged to measure authentic organic reach. Creators appearing in the top decile are recommended for government-partnered regional campaigns.',
            pdfName: 'CB_Leaderboard_Registry_W24.pdf',
            status: 'PUBLISHED',
            signatory: 'Shri Amit Verma, Registrar (Creator Stats)',
            actionText: 'Open Leaderboard',
            actionPath: '/leaderboard'
          }
        ];
      }
      return res.json({ pageName, content: defaultContent });
    }
    res.json(config);
  } catch (err) {
    console.error('[GET /api/pages/:pageName] Error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve page configuration.' });
  }
});

// ─── Platform Settings API ──────────────────────────────────────────────────
// Default platform settings structure
const DEFAULT_PLATFORM_SETTINGS = {
  features: {
    creatorRegistration: true,
    brandRegistration: true,
    campaignCreation: true,
    escrowPayments: true,
    verificationRequests: true,
    leaderboard: true,
    rateCalculator: true,
    communityFeed: true,
    brandSearch: true,
    messages: true,
    achievements: true,
    referralSystem: true,
    walletWithdrawal: true,
    creatorScore: true,
    events: true,
    podcasts: true,
    missionSystem: true,
    gigs: true
  },
  comingSoon: {
    aiMatchmaking: false,
    videoVerification: false,
    mobileApp: true,
    advancedAnalytics: false,
    multiLanguage: false,
    apiAccess: true,
    liveStreaming: true,
    brandMarketplace: false
  },
  commission: {
    platformFeePercent: 0,
    escrowFeePercent: 2.5,
    brandCommissionPercent: 0,
    creatorCommissionPercent: 0,
    minCampaignBudget: 500,
    maxCampaignBudget: 1000000
  },
  creator: {
    maxActiveCampaigns: 10,
    minFollowersForVerification: 1000,
    profileCompletionRequired: 60,
    scoreDecayDays: 90,
    maxPortfolioItems: 20,
    allowGuestProfiles: true
  },
  brand: {
    maxActiveCampaigns: 25,
    maxCreatorsPerCampaign: 100,
    autoApproveBrands: false,
    requireEscrowForCampaigns: true,
    allowDirectMessages: true,
    showBudgetToCreators: true
  },
  announcement: {
    globalBannerEnabled: false,
    globalBannerText: '',
    globalBannerType: 'info',
    maintenanceMode: false,
    maintenanceMessage: 'Platform is under scheduled maintenance. Back in 2 hours.',
    newsTicker: ''
  }
};

// Public GET — frontend fetches this on boot (no auth required)
app.get('/api/platform-settings', async (req, res) => {
  try {
    const record = await prisma.platformSettings.findUnique({ where: { key: 'global' } });
    if (!record) {
      // Seed defaults and return
      await prisma.platformSettings.create({ data: { key: 'global', value: JSON.stringify(DEFAULT_PLATFORM_SETTINGS) } });
      return res.json(DEFAULT_PLATFORM_SETTINGS);
    }
    const parsed = typeof record.value === 'string' ? JSON.parse(record.value) : record.value;
    // Deep merge with defaults to handle new keys added to DEFAULT
    const merged = {
      features: { ...DEFAULT_PLATFORM_SETTINGS.features, ...(parsed.features || {}) },
      comingSoon: { ...DEFAULT_PLATFORM_SETTINGS.comingSoon, ...(parsed.comingSoon || {}) },
      commission: { ...DEFAULT_PLATFORM_SETTINGS.commission, ...(parsed.commission || {}) },
      creator: { ...DEFAULT_PLATFORM_SETTINGS.creator, ...(parsed.creator || {}) },
      brand: { ...DEFAULT_PLATFORM_SETTINGS.brand, ...(parsed.brand || {}) },
      announcement: { ...DEFAULT_PLATFORM_SETTINGS.announcement, ...(parsed.announcement || {}) }
    };
    return res.json(merged);
  } catch (err) {
    console.error('[GET /api/platform-settings] Error:', err.message);
    return res.json(DEFAULT_PLATFORM_SETTINGS);
  }
});

// Admin GET — full settings fetch (admin auth)
app.get('/api/admin/platform-settings', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const record = await prisma.platformSettings.findUnique({ where: { key: 'global' } });
    if (!record) {
      await prisma.platformSettings.create({ data: { key: 'global', value: JSON.stringify(DEFAULT_PLATFORM_SETTINGS) } });
      return res.json(DEFAULT_PLATFORM_SETTINGS);
    }
    const parsed = typeof record.value === 'string' ? JSON.parse(record.value) : record.value;
    const merged = {
      features: { ...DEFAULT_PLATFORM_SETTINGS.features, ...(parsed.features || {}) },
      comingSoon: { ...DEFAULT_PLATFORM_SETTINGS.comingSoon, ...(parsed.comingSoon || {}) },
      commission: { ...DEFAULT_PLATFORM_SETTINGS.commission, ...(parsed.commission || {}) },
      creator: { ...DEFAULT_PLATFORM_SETTINGS.creator, ...(parsed.creator || {}) },
      brand: { ...DEFAULT_PLATFORM_SETTINGS.brand, ...(parsed.brand || {}) },
      announcement: { ...DEFAULT_PLATFORM_SETTINGS.announcement, ...(parsed.announcement || {}) }
    };
    return res.json(merged);
  } catch (err) {
    console.error('[GET /api/admin/platform-settings] Error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch platform settings.' });
  }
});

// Admin PUT — update settings
app.put('/api/admin/platform-settings', authMiddleware, requireRole(['ADMIN']), requireTeamRoles(['SUPERADMIN', 'MODERATOR', 'MANAGER']), async (req, res) => {
  try {
    const newSettings = req.body;
    if (!newSettings || typeof newSettings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings payload.' });
    }
    // Merge with defaults to prevent data loss
    const safe = {
      features: { ...DEFAULT_PLATFORM_SETTINGS.features, ...(newSettings.features || {}) },
      comingSoon: { ...DEFAULT_PLATFORM_SETTINGS.comingSoon, ...(newSettings.comingSoon || {}) },
      commission: { ...DEFAULT_PLATFORM_SETTINGS.commission, ...(newSettings.commission || {}) },
      creator: { ...DEFAULT_PLATFORM_SETTINGS.creator, ...(newSettings.creator || {}) },
      brand: { ...DEFAULT_PLATFORM_SETTINGS.brand, ...(newSettings.brand || {}) },
      announcement: { ...DEFAULT_PLATFORM_SETTINGS.announcement, ...(newSettings.announcement || {}) }
    };
    await prisma.platformSettings.upsert({
      where: { key: 'global' },
      update: { value: JSON.stringify(safe) },
      create: { key: 'global', value: JSON.stringify(safe) }
    });
    return res.json({ success: true, settings: safe });
  } catch (err) {
    console.error('[PUT /api/admin/platform-settings] Error:', err.message);
    return res.status(500).json({ error: 'Failed to update platform settings.' });
  }
});

const DEFAULT_ADMIN_PANEL_SETTINGS = {
  theme: 'dark-sidebar',
  autoRefreshRate: 60,
  sessionTimeout: 3600,
  showConsoleLogs: false,
  soundAlerts: true,
  requireMFA: false
};

// Admin Panel settings — GET
app.get('/api/admin/panel-settings', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const record = await prisma.platformSettings.findUnique({ where: { key: 'admin-panel' } });
    if (!record) {
      await prisma.platformSettings.create({ data: { key: 'admin-panel', value: JSON.stringify(DEFAULT_ADMIN_PANEL_SETTINGS) } });
      return res.json(DEFAULT_ADMIN_PANEL_SETTINGS);
    }
    const parsed = typeof record.value === 'string' ? JSON.parse(record.value) : record.value;
    const merged = { ...DEFAULT_ADMIN_PANEL_SETTINGS, ...parsed };
    return res.json(merged);
  } catch (err) {
    console.error('[GET /api/admin/panel-settings] Error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch admin settings.' });
  }
});

// Admin Panel settings — PUT
app.put('/api/admin/panel-settings', authMiddleware, requireRole(['ADMIN']), requireTeamRoles(['SUPERADMIN']), async (req, res) => {
  try {
    const newSettings = req.body;
    if (!newSettings || typeof newSettings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings payload.' });
    }
    const safe = { ...DEFAULT_ADMIN_PANEL_SETTINGS, ...newSettings };
    await prisma.platformSettings.upsert({
      where: { key: 'admin-panel' },
      update: { value: JSON.stringify(safe) },
      create: { key: 'admin-panel', value: JSON.stringify(safe) }
    });
    return res.json({ success: true, settings: safe });
  } catch (err) {
    console.error('[PUT /api/admin/panel-settings] Error:', err.message);
    return res.status(500).json({ error: 'Failed to update admin settings.' });
  }
});

// Admin Credentials — PUT
app.put('/api/admin/update-credentials', authMiddleware, requireRole(['ADMIN']), requireTeamRoles(['SUPERADMIN']), async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'Admin user not found.' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect current password.' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updateData = { password: hashedPassword };
    if (email) {
      updateData.email = email.toLowerCase().trim();
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    return res.json({ success: true, message: 'Admin credentials updated successfully.', email: updatedUser.email });
  } catch (err) {
    console.error('[PUT /api/admin/update-credentials] Error:', err.message);
    return res.status(500).json({ error: 'Failed to update admin credentials.' });
  }
});

// GET /api/admin/system/backup — Secure sanitized backup (SUPERADMIN only)
app.get('/api/admin/system/backup', authMiddleware, requireRole(['ADMIN']), requireTeamRoles(['SUPERADMIN']), async (req, res) => {
  try {
    // Sanitize user data: NEVER export password hashes or 2FA secrets
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        isSuspended: true,
        createdAt: true,
        updatedAt: true
      },
      take: 5000
    });

    // Sanitize creator data: exclude sensitive KYC documents (Aadhaar / PAN URLs)
    const rawCreators = await prisma.creator.findMany({ take: 5000 });
    const creators = rawCreators.map(({ aadhaarUrl, panUrl, ...rest }) => rest);

    const brands = await prisma.brand.findMany({ take: 5000 });
    const campaigns = await prisma.campaign.findMany({ take: 5000 });
    const payments = await prisma.payment.findMany({ take: 5000 });
    const teamMembers = await prisma.teamMember.findMany({
      select: {
        id: true,
        userId: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      take: 1000
    });

    const backupData = {
      timestamp: new Date().toISOString(),
      version: '3.0.0',
      exportedBy: req.user.email,
      database: {
        usersCount: users.length,
        creatorsCount: creators.length,
        brandsCount: brands.length,
        campaignsCount: campaigns.length,
        paymentsCount: payments.length,
        teamMembersCount: teamMembers.length,
        users,
        creators,
        brands,
        campaigns,
        payments,
        teamMembers
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=creatorbharat_backup_${Date.now()}.json`);
    return res.send(JSON.stringify(backupData, null, 2));
  } catch (err) {
    console.error('[GET /api/admin/system/backup] Error:', err.message);
    return res.status(500).json({ error: 'Failed to generate database backup.' });
  }
});

// GET /api/admin/system/diagnostics
app.get('/api/admin/system/diagnostics', authMiddleware, requireRole(['ADMIN']), requireTeamRoles(['SUPERADMIN', 'MODERATOR', 'MANAGER', 'FINANCE']), async (req, res) => {
  try {
    const counts = {
      users: await prisma.user.count(),
      creators: await prisma.creator.count(),
      brands: await prisma.brand.count(),
      campaigns: await prisma.campaign.count(),
      payments: await prisma.payment.count(),
      teamMembers: await prisma.teamMember.count(),
      otps: await prisma.otpVerification.count()
    };

    const memory = process.memoryUsage();

    return res.json({
      success: true,
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rss: (memory.rss / 1024 / 1024).toFixed(2) + ' MB',
        heapTotal: (memory.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
        heapUsed: (memory.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
        external: (memory.external / 1024 / 1024).toFixed(2) + ' MB'
      },
      counts
    });
  } catch (err) {
    console.error('[GET /api/admin/system/diagnostics] Error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve diagnostics.' });
  }
});

// App Router Registry

app.use('/api/auth', authRouter);
app.use('/api/creators', creatorsRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/admin/team', teamRouter);
app.use('/api/admin', adminRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/blog', blogRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/podcasts', podcastsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/gigs', gigsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/achievements', achievementsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/community', communityRouter);
app.use('/api/referrals', referralsRouter);
app.use('/api/missions', missionsRouter);
app.use('/api/ambassador', ambassadorRouter);
app.use('/api/saved', savedRouter);


// Global 404 Error handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Requested pathway or endpoint not found on this server.',
    message: 'Please verify the route parameters or refer to the official API docs.'
  });
});

// Global Exception handler
app.use((err, req, res, next) => {
  logger.error('Unhandled request exception', err, { path: req.path, method: req.method });
  res.status(500).json({ error: 'Internal Server Error.' });
});

// Active Socket connection registry
const connectedUsers = new Map(); // profileId -> Set of socket.ids

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication failed: Missing token'));
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next(new Error('Authentication failed: Server configuration error'));
    }
    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return next(new Error('Authentication failed: Invalid token payload'));
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { creator: true, brand: true }
    });
    if (!user || user.isSuspended) {
      return next(new Error('Authentication failed: User not found or suspended'));
    }
    socket.user = user;
    next();
  } catch (err) {
    return next(new Error('Authentication failed: Invalid token'));
  }
});

io.on('connection', (socket) => {
  const isBrand = socket.user.role === 'BRAND';
  const profileId = isBrand ? socket.user.brand?.id : socket.user.creator?.id;
  
  if (profileId) {
    if (!connectedUsers.has(profileId)) {
      connectedUsers.set(profileId, new Set());
    }
    connectedUsers.get(profileId).add(socket.id);
  }

  socket.on('send_message', async (payload, callback) => {
    try {
      const { receiverId, text } = payload;
      if (!receiverId || !text) {
        throw new Error('Receiver ID and message content are required');
      }

      let brandId = '';
      let creatorId = '';

      if (isBrand) {
        const brand = socket.user.brand;
        if (!brand) throw new Error('Brand details not found');
        brandId = brand.id;
        creatorId = receiverId;
      } else {
        const creator = socket.user.creator;
        if (!creator) throw new Error('Creator details not found');
        creatorId = creator.id;
        brandId = receiverId;
      }

      const message = await prisma.message.create({
        data: {
          text,
          fromBrand: isBrand,
          brandId,
          creatorId
        }
      });

      const messageData = {
        id: message.id,
        text: message.text,
        time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
        createdAt: message.createdAt,
        read: message.read,
        brandId,
        creatorId
      };

      // Emit to receiver if online
      const receiverSockets = connectedUsers.get(receiverId);
      if (receiverSockets) {
        receiverSockets.forEach(sid => {
          io.to(sid).emit('receive_message', messageData);
        });
      }

      // Sync message to other tabs of the sender
      const senderSockets = connectedUsers.get(profileId);
      if (senderSockets) {
        senderSockets.forEach(sid => {
          if (sid !== socket.id) {
            io.to(sid).emit('receive_message', { ...messageData, isMe: true });
          }
        });
      }

      if (callback) callback({ success: true, message: { ...messageData, isMe: true } });

      // If sending to official support, trigger automated response
      if (receiverId === 'cb-official-support') {
        setTimeout(async () => {
          try {
            const supportResponseText = `Thank you for contacting CreatorBharat Support! 🇮🇳 Our team will review your message shortly. If this is regarding a recent milestone payment, please ensure you have uploaded proper verification links.`;
            
            const supportMessage = await prisma.message.create({
              data: {
                text: supportResponseText,
                fromBrand: !isBrand,
                brandId: isBrand ? profileId : 'cb-official-support',
                creatorId: isBrand ? 'cb-official-support' : profileId,
                read: false
              }
            });

            const supportMsgData = {
              id: supportMessage.id,
              text: supportMessage.text,
              time: new Date(supportMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isMe: false,
              createdAt: supportMessage.createdAt,
              read: supportMessage.read,
              brandId: supportMessage.brandId,
              creatorId: supportMessage.creatorId
            };

            const senderSocks = connectedUsers.get(profileId);
            if (senderSocks) {
              senderSocks.forEach(sid => {
                io.to(sid).emit('receive_message', supportMsgData);
              });
            }
          } catch (err) {
            console.error('Support auto-response error:', err.message);
          }
        }, 1500);
      }
    } catch (err) {
      console.error('Socket send_message error:', err.message);
      if (callback) callback({ success: false, error: err.message });
    }
  });

  socket.on('disconnect', () => {
    if (profileId && connectedUsers.has(profileId)) {
      connectedUsers.get(profileId).delete(socket.id);
      if (connectedUsers.get(profileId).size === 0) {
        connectedUsers.delete(profileId);
      }
    }
  });
});

// Seed Admin Account and Sample Data on Server Startup
(async () => {
  if (process.env.NODE_ENV === 'test') return;
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@creatorbharat.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'change-this-strong-password';

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail.toLowerCase().trim() }
    });

    let adminUser = existingAdmin;
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail.toLowerCase().trim(),
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      console.log(`[Database Seeder]: Default admin user created successfully (${adminEmail}).`);
    } else {
      console.log(`[Database Seeder]: Admin account verified.`);
    }

    if (adminUser) {
      await prisma.teamMember.upsert({
        where: { userId: adminUser.id },
        update: { role: 'SUPERADMIN', status: 'ACTIVE' },
        create: { userId: adminUser.id, role: 'SUPERADMIN', status: 'ACTIVE' }
      });
      console.log(`[Database Seeder]: SUPERADMIN team member profile synced for ${adminEmail}.`);
    }

    // Seed Creators and Brands if empty
    const customerCount = await prisma.user.count({
      where: { role: { in: ['CREATOR', 'BRAND'] } }
    });

    if (customerCount === 0) {
      console.log('[Database Seeder]: No creators or brands found. Seeding realistic sample dataset...');
      
      const defaultPasswordHash = await bcrypt.hash('password123', 10);

      // Create Creators
      const u1 = await prisma.user.create({
        data: {
          email: 'amit@creatorbharat.com',
          password: defaultPasswordHash,
          role: 'CREATOR',
          creator: {
            create: {
              name: 'Amit Sharma',
              handle: 'amit_travels',
              bio: 'Travelling across India to capture the authentic, unseen colors of rural Bharat. Let\'s showcase local beauty to the world.',
              city: 'Jaipur',
              state: 'Rajasthan',
              niche: ['Travel', 'Regional Trends'],
              platform: ['Instagram', 'YouTube'],
              followers: 35000,
              engagementRate: 6.8,
              rateMin: 5000,
              rateMax: 15000,
              photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
              coverImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200',
              isVerified: false,
              isPro: true,
              aadhaarUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800',
              panUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800',
              status: 'PENDING_APPROVAL',
              socialLinks: { instagram: 'https://instagram.com/amit_travels', youtube: 'https://youtube.com/c/amit_travels' }
            }
          }
        },
        include: { creator: true }
      });

      const u2 = await prisma.user.create({
        data: {
          email: 'neha@creatorbharat.com',
          password: defaultPasswordHash,
          role: 'CREATOR',
          creator: {
            create: {
              name: 'Neha Gupta',
              handle: 'neha_beauty',
              bio: 'Beauty, fashion, and lifestyle creator from Indore. I love sharing simple, local skincare and makeup secrets.',
              city: 'Indore',
              state: 'Madhya Pradesh',
              niche: ['Beauty', 'Fashion'],
              platform: ['Instagram'],
              followers: 65000,
              engagementRate: 4.2,
              rateMin: 8000,
              rateMax: 20000,
              photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
              coverImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1200',
              isVerified: true,
              isPro: false,
              status: 'APPROVED',
              socialLinks: { instagram: 'https://instagram.com/neha_beauty' }
            }
          }
        },
        include: { creator: true }
      });

      // Create Brands
      const b1 = await prisma.user.create({
        data: {
          email: 'brand1@mamaearth.com',
          password: defaultPasswordHash,
          role: 'BRAND',
          brand: {
            create: {
              companyName: 'Mamaearth India',
              industry: 'Beauty & Cosmetics',
              website: 'https://mamaearth.in'
            }
          }
        },
        include: { brand: true }
      });

      const b2 = await prisma.user.create({
        data: {
          email: 'brand2@bharatstartups.com',
          password: defaultPasswordHash,
          role: 'BRAND',
          brand: {
            create: {
              companyName: 'BharatStartups',
              industry: 'Venture Capital & Community',
              website: 'https://bharatstartups.com'
            }
          }
        },
        include: { brand: true }
      });

      // Create Campaigns
      const camp1 = await prisma.campaign.create({
        data: {
          brandId: b1.brand.id,
          title: 'Vibrant Rajasthani Beauty Campaign',
          description: 'We are seeking authentic regional beauty creators in Rajasthan to showcase our new herbal facial range using local dialects and traditional style elements.',
          budget: 50000,
          niche: ['Beauty', 'Fashion'],
          platform: ['Instagram'],
          status: 'ACTIVE'
        }
      });

      const camp2 = await prisma.campaign.create({
        data: {
          brandId: b2.brand.id,
          title: 'Rural Entrepreneurs Stories Podcast Series',
          description: 'A campaign calling for tech/podcast creators who can host or feature interviews with successful small-town founders and local startup heroes.',
          budget: 75000,
          niche: ['Tech', 'Regional Trends'],
          platform: ['Instagram', 'YouTube'],
          status: 'ACTIVE'
        }
      });

      // Create Applications
      await prisma.application.create({
        data: {
          campaignId: camp2.id,
          creatorId: u1.creator.id,
          pitch: 'I regularly visit tier-2 entrepreneur spots in Rajasthan and would love to tell their stories in a raw, conversational podcast format.',
          status: 'PENDING'
        }
      });

      await prisma.application.create({
        data: {
          campaignId: camp1.id,
          creatorId: u2.creator.id,
          pitch: 'My audience is 80% girls from Madhya Pradesh and Rajasthan who love traditional skin care. This range perfectly fits my feed.',
          status: 'ACCEPTED'
        }
      });

      // Create Reviews
      await prisma.review.create({
        data: {
          creatorId: u2.creator.id,
          brandId: b1.brand.id,
          reviewerName: 'Mamaearth Brand Team',
          text: 'Excellent deliverables and highly authentic audience resonance. Highly recommend Neha for regional beauty launches.',
          rating: 5
        }
      });

      // Create Payments
      await prisma.payment.create({
        data: {
          id: 'pay_escrow_sample_123',
          brandId: b1.brand.id,
          creatorId: u2.creator.id,
          campaignId: camp1.id,
          recipientCreatorId: u2.creator.id,
          amount: 50000,
          type: 'CAMPAIGN_ESCROW',
          status: 'PAID'
        }
      });

      console.log('[Database Seeder]: Realistic sample dataset (Creators, Brands, Campaigns, Applications, Reviews, Payments) seeded successfully.');
    }


    // Seed Gallery Items if empty
    const galleryCount = await prisma.galleryItem.count();
    if (galleryCount === 0) {
      const defaultGallery = [
        {
          title: 'Jaipur Heritage Fashion Summit',
          description: 'A grand celebration linking traditional Rajasthani weavers with modern Gen-Z digital creators. Highlighted live styling workshops and brand matchmaking.',
          category: 'Summits',
          type: 'video',
          date: 'March 14, 2026',
          location: 'Jaipur, Rajasthan',
          thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          duration: '2:45',
          tags: ['Fashion', 'Brand Deals', 'Weavers']
        },
        {
          title: 'Bastar Art & Craft Exhibition',
          description: 'Showcasing the premium terracotta and brass craft collections of Bastar artisans through visual storytelling campaigns shot by regional travel vloggers.',
          category: 'Collaborations',
          type: 'photo',
          date: 'April 22, 2026',
          location: 'Jagdalpur, Chhattisgarh',
          thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
          tags: ['Artisans', 'Exhibition', 'Regional']
        },
        {
          title: 'Creator Node Bangalore Meetup',
          description: 'An exclusive networking event for tech and lifestyle influencers. Discussed monetization algorithms and brand campaign optimizations.',
          category: 'Summits',
          type: 'photo',
          date: 'May 05, 2026',
          location: 'Bangalore, Karnataka',
          thumbnail: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
          tags: ['Networking', 'Tech', 'Lifestyle']
        },
        {
          title: 'Delhi Influencer Brand Conclave',
          description: 'Corporate brand managers and elite creators discussing escrow escrow metrics on CreatorBharat.',
          category: 'Collaborations',
          type: 'video',
          date: 'May 18, 2026',
          location: 'New Delhi',
          thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
          videoUrl: 'https://www.w3schools.com/html/movie.mp4',
          duration: '1:30',
          tags: ['Brand Deals', 'Escrow', 'Conclave']
        },
        {
          title: 'Mobile Videography & Editing Boot Camp',
          description: 'A hands-on workshop guiding nano and micro creators on high-fidelity color grading and sound design for vertical mobile content.',
          category: 'Workshops',
          type: 'photo',
          date: 'June 01, 2026',
          location: 'Pune, Maharashtra',
          thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
          tags: ['Videography', 'Workshops', 'Mobile']
        },
        {
          title: 'Mumbai Creator Studio Hub Launch',
          description: 'Grand opening of the CreatorBharat flagship streaming facility, equipped with 4K cameras, acoustic chambers, and podcast setups for verified members.',
          category: 'Media',
          type: 'photo',
          date: 'June 10, 2026',
          location: 'Mumbai, Maharashtra',
          thumbnail: 'https://images.unsplash.com/photo-1590608897129-79da98d15969?auto=format&fit=crop&w=800&q=80',
          tags: ['Studio', 'Podcasting', 'Launch']
        }
      ];
      await prisma.galleryItem.createMany({ data: defaultGallery });
      console.log(`[Database Seeder]: ${defaultGallery.length} default gallery items seeded successfully.`);
    }

    // Seed Blog Articles if empty
    const blogCount = await prisma.blog.count();
    if (blogCount === 0) {
      const defaultBlogs = [
        {
          slug: 'creatorbharat-kya-hai-india-ka-creator-ecosystem',
          title: 'CreatorBharat Kya Hai? India Ka Pehla 3-Sided Creator Ecosystem',
          category: 'Platform Guide',
          excerpt: 'CreatorBharat sirf ek influencer platform nahi — ye India ka pehla decentralized creator economy ecosystem hai jo creators, brands, aur communities ko direct connect karta hai, bina kisi agency ke.',
          body: `
            <div class="quick-take" style="background:#fff7ed; border-left:4px solid #ff9431; padding:15px; margin-bottom:20px;">
              <strong>EK LINE MEIN:</strong> CreatorBharat ek 3-sided marketplace hai — creators, brands, aur communities ke liye — jahan koi agency nahi, koi middleman nahi, aur 0% commission.
            </div>
            <p>Agar aap Instagram ya YouTube pe content banate hain aur soch rahe hain ki "brand deals kaise milenge," ya agar aap ek brand hain jo local creators dhundh raha hai Tier-2/3 cities mein — toh CreatorBharat aapke liye bana hai.</p>
            <h2 id="what-is" style="font-family:'Playfair Display',serif; font-weight:800; margin-top:25px; color:#000;">CreatorBharat Kya Hai?</h2>
            <p>CreatorBharat India ka <strong>pehla verified creator ecosystem</strong> hai jo specifically Bharat ke regional creators ke liye design kiya gaya hai. Ye sirf ek directory nahi — ye ek complete SaaS platform hai jahan:</p>
            <ul>
              <li>Creators apna verified digital portfolio banate hain</li>
              <li>Brands verified creators ko directly dhundh aur hire karte hain</li>
              <li>Payments escrow mein secure rehte hain</li>
              <li>Koi bhi commission nahi liya jaata</li>
            </ul>
          `,
          image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200',
          featured: true,
          published: true,
          author: 'CreatorBharat',
          tags: ['CreatorBharat', 'Creator Economy', 'Platform Guide', '3-Sided Marketplace', 'India']
        },
        {
          slug: 'cb-score-kya-hota-hai-kaise-badhayein',
          title: 'CB Score Kya Hota Hai? Apna Creator Trust Score Kaise Badhayein',
          category: 'Creator Guides',
          excerpt: 'CB Score CreatorBharat ka proprietary trust index hai (0-100) jo brands ko instantly batata hai ki creator kitna reliable aur impactful hai. Samjhein kaise ye calculate hota hai aur kaise improve karein.',
          body: `
            <div class="quick-take" style="background:#fff7ed; border-left:4px solid #ff9431; padding:15px; margin-bottom:20px;">
              <strong>QUICK TAKE:</strong> CB Score sirf followers pe based nahi hai. Ye 4 factors ka combination hai — aur ek 50K follower creator, 500K follower creator se zyada score pa sakta hai agar uski engagement aur deal history strong ho.
            </div>
            <p>Jab bhi koi brand CreatorBharat pe kisi creator ka profile dekhta hai, sabse pehle unki nazar CB Score pe jaati hai. Ye 0-100 ka number unhe instantly batata hai ki ye creator brands ke liye kitna valuable hai.</p>
            <h2 id="what-is-score" style="font-family:'Playfair Display',serif; font-weight:800; margin-top:25px; color:#000;">CB Score Kya Hai?</h2>
            <p>CB Score (CreatorBharat Trust Score) India ka <strong>pehla creator credibility index</strong> hai. Ye ek algorithm-driven score hai jo sirf follower count nahi, balki 4 different dimensions ko measure karta hai.</p>
          `,
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200',
          featured: false,
          published: true,
          author: 'CreatorBharat',
          tags: ['CB Score', 'Creator Score', 'Trust Index', 'Creator Growth', 'CreatorBharat']
        },
        {
          slug: 'tier-2-creator-brand-deal-kaise-milega',
          title: 'Tier-2 Creator Ko Brand Deal Kaise Milega? Complete Step-by-Step Guide',
          category: 'Creator Guides',
          excerpt: 'Sirf metro creators ke liye nahi hain brand deals. Jaipur, Bhilwara, Indore ke creators bhi lakhs kamaa sakte hain. Ye guide aapko step-by-step batati hai ki verified hone se lekar pehli brand deal close karne tak ka poora process.',
          body: `
            <div class="quick-take" style="background:#fff7ed; border-left:4px solid #ff9431; padding:15px; margin-bottom:20px;">
              <strong>REALITY CHECK:</strong> 65% of our brand deals on CreatorBharat go to creators from Tier-2 and Tier-3 cities. Brands specifically want authentic regional voices. Aapka "local" hona hi aapka sabse bada advantage hai.
            </div>
            <p>Bahut se creators sochte hain ki brand deals sirf Mumbai ya Delhi ke "big influencers" ke liye hain. Ye myth hai. Brands ab specifically Tier-2 creators dhundh rahe hain kyunki unka audience zyada genuine aur engaged hota hai.</p>
          `,
          image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200',
          featured: false,
          published: true,
          author: 'CreatorBharat',
          tags: ['Brand Deals', 'Tier 2 Creators', 'Creator Income', 'Verified Badge', 'Escrow']
        }
      ];
      await prisma.blog.createMany({ data: defaultBlogs });
      console.log(`[Database Seeder]: ${defaultBlogs.length} default blogs seeded successfully.`);
    }

    // Seed default podcasts if empty
    const podcastCount = await prisma.podcast.count();
    if (podcastCount === 0) {
      const creators = await prisma.creator.findMany({ take: 1 });
      if (creators.length > 0) {
        const creatorId = creators[0].id;
        const defaultPodcasts = [
          {
            creatorId,
            title: 'Rural Entrepreneurship & Grassroots Startups in Rajasthan',
            description: 'In this episode, we talk to local founders in Udaipur who are building agricultural tech solutions for regional farmers, scaling without venture capital.',
            duration: '42:15',
            thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            published: true
          },
          {
            creatorId,
            title: 'How Tier-2 Content Creators are Digitizing Traditional Art Forms',
            description: 'Discussing the rise of local Rajasthani folk musicians and block painters utilizing Instagram Reels and YouTube to sell products directly globally.',
            duration: '28:40',
            thumbnail: 'https://images.unsplash.com/photo-1590608897129-79da98d15969?w=800&q=80',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            published: true
          }
        ];
        await prisma.podcast.createMany({ data: defaultPodcasts });
        console.log(`[Database Seeder]: ${defaultPodcasts.length} default podcasts seeded successfully.`);
      }
    }

    // Seed Dynamic Page Configurations if empty
    const pageConfigCount = await prisma.dynamicPageConfig.count();
    if (pageConfigCount === 0) {
      console.log('[Database Seeder]: Seeding default dynamic page configurations...');
      const defaultPageConfigs = [
        {
          pageName: 'home',
          content: {
            heroTitle: 'Find Elite Local Creators Across India',
            heroSubtitle: 'CreatorBharat connects top regional influencers with local and global brands for impactful collaborations.',
            ctaText: 'Launch Campaign Now',
            announcement: '⚡ Version 3.0 Live: Introducing Instant Wallet Bank Settlements!'
          }
        },
        {
          pageName: 'pricing',
          content: {
            starterPrice: 0,
            proPrice: 49,
            proFeatures: 'Instant wallet withdrawals, Automated GST invoicing, Priority campaign listing, 0% commission fees, Pro verified badge',
            brandStarterPrice: 0,
            brandProPrice: 4999,
            brandProFeatures: 'Launch Unlimited Campaigns, Direct Outreach Pitch Console, Full A4 Creator Resume Access, Verified Gold Brand Badge, AI Smart Talent Matches, Advanced Analytics Dashboard, 24/7 Premium Priority Support'
          }
        },
        {
          pageName: 'calculator',
          content: {
            rateMultiplier: 0.018,
            nicheMultiplier: 1.0,
            minFee: 500
          }
        },
        {
          pageName: 'faq',
          content: [
            { cat: 'General', q: 'How does CreatorBharat escrow work?', a: 'Brands deposit campaign budgets into secure escrows. Funds are released instantly to creators after verified milestone deliverables are submitted.' },
            { cat: 'Creators', q: 'Is there a signup fee for creators?', a: 'Signing up as a basic creator is completely free. Basic creators can receive brand deals. Creator Pro unlocking instant payouts requires a tiny monthly fee of ₹49.' },
            { cat: 'Creators', q: 'Can I link multiple Instagram accounts?', a: 'Currently, each creator account can link one verified primary Instagram handle and one YouTube channel to calculate dynamic engagement rates.' }
          ]
        },
        {
          pageName: 'creator-landing',
          content: {
            heroBadge: "India's Creator Ecosystem",
            heroTitle: "Build Your Creator Legacy.",
            heroSubtitle: "Bharat ke har creator ke liye — Tier 2, Tier 3, ya metro. Verified profile, direct brand deals, zero commission. Apni pehchan banao.",
            ctaPrimary: "Join Free — Start Today",
            ctaSecondary: "See Creator Profiles",
            bottomTitle: "Bharat Ka Creator Kahin Bhi Jayega. 🇮🇳",
            bottomSubtitle: "Bhilwara se Bangalore tak — har creator ki pehchan honi chahiye. Join karo aur apni legacy banao.",
            bottomCtaPrimary: "Join Free Now",
            bottomCtaSecondary: "View Pro Plans"
          }
        },
        {
          pageName: 'brand-landing',
          content: {
            heroBadge: "Brand Command Center",
            heroTitle: "Scale with Bharat's Best.",
            heroSubtitle: "Scout verified regional creators, launch campaigns with escrow protection, and track ROI in real-time. Zero commission. Zero middlemen.",
            ctaPrimary: "Start Scouting Free",
            ctaSecondary: "Browse Creators",
            bottomTitle: "Ready to Scale? Join 500+ Brands.",
            bottomSubtitle: "Start free. No credit card required. Access Bharat's most verified creator network today.",
            bottomCtaPrimary: "Register Your Brand",
            bottomCtaSecondary: "Browse Creators"
          }
        },
        {
          pageName: 'about',
          content: {
            BLUEPRINT_CARDS: [
              {
                num: "01",
                title: "Verify Identity",
                sub: "Digital Pehchan",
                desc: "We verify the analytics, location, and brand-safety of regional creators so brands can bypass fake followers and hire authentic talent.",
                accent: "#FF9431"
              },
              {
                num: "02",
                title: "Bypass Middlemen",
                sub: "Direct Pitch SaaS",
                desc: "Brands pitch directly to creators in Tier 2 & 3 cities through our open marketplace. No agency gatekeepers or massive markups.",
                accent: "#10B981"
              },
              {
                num: "03",
                title: "Zero Broker Fees",
                sub: "Safe Escrow Ledgers",
                desc: "Payouts are secured in safe escrow ledgers and released immediately upon project completion. Best part? We charge 0% commission.",
                accent: "#3B82F6"
              }
            ],
            TIMELINE_DATA: [
              {
                year: "JAN 2026: THE SPARK",
                title: "The Bhilwara Prototype",
                desc: "Identifying the massive gap between regional talent in Tier 2 & 3 cities and national brand opportunities. We tested our first directory manually mapping 150 local creators in Rajasthan.",
                stats: [
                  { label: "Creators Mapped", value: "150+" },
                  { label: "Target City", value: "Bhilwara" }
                ]
              },
              {
                year: "APR 2026: THE INFRASTRUCTURE",
                title: "The Trust & Identity Layer",
                desc: "Launched our proprietary Creator Score algorithm and verified Digital Pehchan. This allowed upcoming creators to present data-validated analytics without expensive agencies.",
                stats: [
                  { label: "Active Profiles", value: "1,200+" },
                  { label: "System Trust Metric", value: "Blue Badges" }
                ]
              },
              {
                year: "JUN 2026: THE EXPANSION",
                title: "Elite National Marketplace",
                desc: "Scaled CreatorBharat into an elite SaaS platform with zero broker fee policies, automated ROI calculators, interactive podium leaderboards, and safe escrow ledger systems.",
                stats: [
                  { label: "Active Users", value: "2,400+" },
                  { label: "Broker Fees Charged", value: "0%" }
                ]
              }
            ],
            PHILOSOPHY_PILLARS: [
              {
                title: 'Identity',
                desc: 'Giving every creator a verified, data-backed professional portfolio that brands can trust.',
                features: ['Digital Pehchan Profile', 'Real-Time Engagement APIs', 'Anti-Fraud Score Metrics'],
                color: '#FF9431',
                badge: 'Infrastructure'
              },
              {
                title: 'Access',
                desc: 'Removing gatekeepers. Creators in small towns now apply directly to the biggest national brands.',
                features: ['Zero-Brokerage Escrow', 'Open Pitch Marketplace', 'Local Language Support'],
                color: '#10B981',
                badge: 'Opportunity'
              },
              {
                title: 'Growth',
                desc: 'Providing the financial tools and analytics to scale from a local star to a national icon.',
                features: ['ROI Valuation Gauges', 'SaaS Media Kits', 'Fast Invoice Financing'],
                color: '#3B82F6',
                badge: 'Scale'
              }
            ],
            LEADERSHIP_TEAM: [
              {
                name: "Mohmmad Dilshan",
                role: "Founder & Chief Architect",
                image: "/team_dilshan.jpg",
                bio: "Democratizing the digital economy for the next billion users through decentralized intelligence, modular architecture, and zero-brokerage campaigns.",
                skills: ["System Architecture", "Product Strategy", "Decentralized Networks", "Escrow Ledgers"],
                socials: {
                  linkedin: "https://linkedin.com/in/mohmmad-dilshan",
                  github: "https://github.com/mohmmad-dilshan"
                },
                tag: "CONSENSUS_NODE_001",
                location: "Bhilwara"
              }
            ],
            ADVISORY_BOARD: [],
            PRESS_LOGOS: [
              { name: "YourStory", desc: "Featured in Top Regional Startups" },
              { name: "Economic Times", desc: "The SaaS Shift in Creator Tech" },
              { name: "LiveMint", desc: "Empowering Tier 2 & 3 Micro-influencers" },
              { name: "TechCrunch", desc: "Zero-Brokerage Escrow Platform Launch" },
              { name: "Business Standard", desc: "SaaS Disrupting Traditional Talent Agencies" }
            ],
            INVESTOR_LOGOS: [
              { name: "Y Combinator", type: "W26 Candidate" },
              { name: "Sequoia Spark", type: "Cohort III" },
              { name: "Accel Partners", type: "Seed Backer" },
              { name: "AngelList India", type: "Syndicate Lead" }
            ]
          }
        },
        {
          pageName: 'press',
          content: [
            {
              date: "June 10, 2026",
              title: "CreatorBharat Launched: Setting up India's First Identity Layer for Tier 2 & 3 Creators",
              excerpt: "CreatorBharat today announced the rollout of v1, introducing an AI-driven digital trust score, localized regional discovery, and 0% commission structures for micro-creators.",
              url: "#"
            },
            {
              date: "March 15, 2026",
              title: "CreatorBharat Onboards 1,200+ Verified Creators Across Rajasthan and Madhya Pradesh",
              excerpt: "The startup has witnessed 4x growth in regional creator registrations, enabling local brands in Jaipur, Bhilwara, and Indore to run high-ROI campaigns directly.",
              url: "#"
            },
            {
              date: "January 22, 2026",
              title: "CreatorBharat Receives DPIIT Startup Recognition from Govt of India",
              excerpt: "Recognized for building innovative digital infrastructure that maps and verifies regional talent, promoting localized employment and direct commerce.",
              url: "#"
            }
          ]
        },
        {
          pageName: 'stories',
          content: [
            {
              id: 'story-1',
              type: 'brand',
              brandName: 'Jaipur Heritage Apparel',
              niche: 'Fashion & Retail',
              location: 'Jaipur, Rajasthan',
              creatorName: 'Aryan Sharma',
              avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&q=80',
              banner: '/campaign_jaipur_heritage.png',
              title: 'How Jaipur Heritage Apparel grew Sales by 3x in 30 Days 🚀',
              description: 'A traditional fashion brand in Jaipur struggled to reach Gen-Z consumers through social ads, which had high acquisition costs. Partnered with regional creators to curate authentic styling reels.',
              challenge: 'High customer acquisition cost (CAC) and zero regional awareness.',
              solution: 'Launched a hyperlocal styling mission with 3 verified local fashion creators on Instagram.',
              metrics: [
                { label: 'Sales Growth', value: '310%', icon: 'TrendingUp', color: '#ff9431' },
                { label: 'CAC Reduced', value: '-42%', icon: 'Target', color: '#ff4b4b' },
                { label: 'Organic Reach', value: '1.2M+', icon: 'Users', color: '#3b82f6' }
              ],
              testimonial: {
                quote: "CreatorBharat solved our biggest challenge: authenticity at scale. Working with Aryan and other verified local creators was frictionless, and the ROI speaks for itself.",
                author: "Vikram Rathore",
                role: "Marketing Director",
                company: "Jaipur Heritage Apparel"
              },
              actionText: 'Collaborate with Aryan',
              actionPath: '/leaderboard'
            },
            {
              id: 'story-2',
              type: 'creator',
              creatorName: 'Ramesh Dewangan',
              channelName: '@BastarCraftsVlog',
              niche: 'Art & Heritage',
              location: 'Bastar, Chhattisgarh',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
              banner: '/campaign_bastar_crafts.png',
              title: 'From Bastar Village to National Brand Campaigns 🌟',
              description: 'Ramesh is a terracotta artisan in Chhattisgarh. Before joining CreatorBharat, he had no direct access to national brands. He now collaborates with major home decor brands across India.',
              challenge: 'Lack of brand access, pricing transparency, and modern identity tools.',
              solution: 'Created a verified digital creator profile on CreatorBharat, linking regional crafts to urban home design campaigns.',
              metrics: [
                { label: 'Earnings Secured', value: '₹3.5 Lakhs', icon: 'DollarSign', color: '#10b981' },
                { label: 'Followers Gained', value: '+180k', icon: 'Users', color: '#3b82f6' },
                { label: 'Direct Deals', value: '12 Campaigns', icon: 'Award', color: '#8b5cf6' }
              ],
              testimonial: {
                quote: "Pehle mujhe payments ke liye mahino intezar karna padta tha. CreatorBharat par register hone ke baad, brands mujhe direct secure escrows ke saath access karte hain.",
                author: "Ramesh Dewangan",
                role: "Terracotta Master Artisan",
                company: "Bastar Craft Syndicate"
              },
              actionText: "View Ramesh's Profile",
              actionPath: '/leaderboard'
            },
            {
              id: 'story-3',
              type: 'platform',
              title: 'DPIIT Registered Startup: 15,000+ Regional Identities Verified 🇮🇳',
              location: 'National Coverage',
              niche: 'Ecosystem Growth',
              banner: '/platform_milestone_bharat.png',
              description: 'CreatorBharat has officially mapped and verified over 15,000 regional creators across 28 states in India. Under our Bharat-first outreach program, we have eliminated intermediate brokerage commissions.',
              challenge: 'Fragmented talent registry and high commission brokerages in Tier 2/3 cities.',
              solution: 'Designed the unified "Digital Pehchan" verified trust scores, standard escrow payments, and regional leaderboard hubs.',
              metrics: [
                { label: 'States Mapped', value: '28 States', icon: 'Globe2', color: '#ff9431' },
                { label: 'Platform Fee', value: '0% Brokerage', icon: 'ShieldCheck', color: '#10b981' },
                { label: 'Ecosystem Trust', value: '99.4% Secured', icon: 'Zap', color: '#8b5cf6' }
              ],
              testimonial: {
                quote: "Our mission is to democratize opportunities for Tier-2 and Tier-3 talent. We are building the foundational verification layers that traditional agencies ignore.",
                author: "Mohmmad Dilshan",
                role: "Founder & CEO",
                company: "CreatorBharat"
              },
              actionText: 'Claim Your Profile Free',
              actionPath: '/join'
            }
          ]
        },
        {
          pageName: 'ai-faq',
          content: [
            {
              q: "What is the CreatorBharat Elite Score?",
              a: "The Elite Score is a proprietary machine learning score (from 0 to 100) calculated by analyzing a creator's verified follower counts, comment-to-like engagement ratios, content consistency, brand safety index, and niche authority. Higher scores receive premium ranking on our public leaderboards."
            },
            {
              q: "How does the AI Matchmaker algorithm choose creators?",
              a: "Our campaign matching algorithm parses a brand's budget, niche requirements, platforms, and target location. It then performs semantic similarity matching against verified creator bios, local dialect parameters, and past campaign categories to recommend creators with the highest predicted ROI."
            },
            {
              q: "Why is Digital Pehchan KYC required?",
              a: "Digital Pehchan ensures that every creator profile on our platform belongs to a real citizen of India. By submitting Aadhaar, PAN, or GST credentials, creators verify their identity, which eliminates bot traffic and fake profiles and builds trust with brand sponsors."
            }
          ]
        },
        {
          pageName: 'notifications',
          content: [
            {
              id: 'notif-1',
              refNo: 'CB/GOVT/2026/SEC-4/082',
              date: '17-06-2026',
              department: 'Dept. of Verification & Trust',
              deptHi: 'सत्यापन एवं विश्वास विभाग',
              title: 'BharatAI Profile Verification Engine Launched Under Section 4(a) 🛡️',
              titleHi: 'धारा 4(a) के तहत भारतएआई प्रोफाइल सत्यापन प्रणाली का शुभारंभ',
              description: 'All creators operating in Tier 2 & 3 regions of India are hereby notified to claim their official verified badge by submitting authentic audience engagement proofs. Verified profiles receive priority matching in brand campaign allotment. Compliance boosts creator visibility by up to 85%.',
              pdfName: 'CB_Verification_Gazette_v3.pdf',
              status: 'ACTIVE',
              signatory: 'Dr. R. K. Sen, Joint Secretary (Creator Welfare)',
              actionText: 'Apply for Verification',
              actionPath: '/join'
            },
            {
              id: 'notif-2',
              refNo: 'CB/GOVT/2026/MKT-9/104',
              date: '16-06-2026',
              department: 'Dept. of Campaign & Escrow Operations',
              deptHi: 'अभियान एवं एस्क्रो संचालन विभाग',
              title: 'Notification: Launch of Rajasthan Regional Spotlight Campaign 🏺',
              titleHi: 'अधिसूचना: राजस्थान क्षेत्रीय अभियान आवंटन सूचना',
              description: 'Applications are invited from eligible fashion, cultural, and lifestyle creators in Rajasthan for the Jaipur Heritage Promotion Spotlight. Budget allocation is guaranteed under official escrow protection terms. Direct payouts will be executed with zero commissions. Retainers start at ₹25,000 per asset.',
              pdfName: 'CB_Raj_Spotlight_Circular.pdf',
              status: 'ACTIVE',
              signatory: 'Smt. Anjali Sharma, Director (Campaign Allocation)',
              actionText: 'View Allotments',
              actionPath: '/creators'
            },
            {
              id: 'notif-3',
              refNo: 'CB/GOVT/2026/DIR-3/011',
              date: '14-06-2026',
              department: 'Ecosystem Registry Office',
              deptHi: 'पारिस्थितिकी तंत्र रजिस्ट्री कार्यालय',
              title: 'Release of Weekly Top 100 Virality Index & Leaderboard 🏆',
              titleHi: 'साप्ताहिक शीर्ष 100 क्रिएटर्स की वायरल सूचकांक सूची जारी',
              description: 'The national registry of top performing regional creators is updated for the current cycle. Weekly statistics are logged to measure authentic organic reach. Creators appearing in the top decile are recommended for government-partnered regional campaigns.',
              pdfName: 'CB_Leaderboard_Registry_W24.pdf',
              status: 'PUBLISHED',
              signatory: 'Shri Amit Verma, Registrar (Creator Stats)',
              actionText: 'Open Leaderboard',
              actionPath: '/leaderboard'
            }
          ]
        }
      ];

      for (const config of defaultPageConfigs) {
        await prisma.dynamicPageConfig.upsert({
          where: { pageName: config.pageName },
          update: {},
          create: config
        });
      }
    }

    // Seed default missions if empty
    const missionCount = await prisma.mission.count();
    if (missionCount === 0) {
      console.log('[Database Seeder]: Seeding default missions...');
      const defaultMissions = [
        {
          id: 'm1',
          title: 'Refer 2 Creators',
          description: 'Invite 2 new creators from your city to join CreatorBharat. Get ₹199 listing fee cashback per referral.',
          type: 'referral',
          reward: '₹199 Cashback',
          rewardAmount: 199,
          steps: ['Share your referral link', '2 creators sign up', 'Both complete profiles', 'Cashback credited in wallet'],
          active: true
        },
        {
          id: 'm2',
          title: 'Post with #CreatorBharat',
          description: 'Post 1 reel or story on Instagram/YouTube with #CreatorBharat tag. Earn direct platform credits.',
          type: 'content',
          reward: '₹500 Credits',
          rewardAmount: 500,
          steps: ['Create engaging content', 'Add #CreatorBharat hashtag', 'Submit post link below', 'Credits in 24hrs'],
          active: true
        },
        {
          id: 'm3',
          title: 'Complete Profile to 100%',
          description: 'Fill all 6 profile tabs (Identity, Socials, Story, Packages, Local Hub, Sponsored Posts) to unlock Pro trial.',
          type: 'profile',
          reward: '7-Day Pro Trial',
          rewardAmount: 0,
          steps: ['Identity tab (name + bio)', 'Social handles + links', 'Story & milestones', 'Packages & rates', 'Local hub info', 'Add 1 sponsored post'],
          active: true
        },
        {
          id: 'm4',
          title: 'Apply to 3 Brand Campaigns',
          description: 'Apply to any 3 active campaigns from the Opportunities section. Show brands you are active and ready!',
          type: 'work',
          reward: '₹100 Wallet Credit',
          rewardAmount: 100,
          steps: ['Browse campaigns below', 'Apply to first campaign', 'Apply to second campaign', 'Apply to third campaign', 'Credit added automatically'],
          active: true
        },
        {
          id: 'm5',
          title: 'Get 1 Brand Review',
          description: 'Complete a brand deal and request a rating from the brand on your public profile. Boosts CB Score by +10.',
          type: 'review',
          reward: '+10 CB Score',
          rewardAmount: 0,
          steps: ['Complete any brand deal', 'Contact brand via messages', 'Request a review/rating', 'Review appears on profile'],
          active: true
        }
      ];

      for (const m of defaultMissions) {
        await prisma.mission.create({
          data: m
        });
      }
    }

    // Seed default events if empty
    const eventCount = await prisma.event.count();
    if (eventCount === 0) {
      console.log('[Database Seeder]: Seeding default events...');
      const defaultEvents = [
        {
          id: 'summit-2027',
          title: 'CreatorBharat National Summit 2027',
          description: 'Bharat ka Sabse Bada Creator Gathering. Birla Auditorium, Jaipur. Highlights include Top 50 creators get free travel + stay, Brand speed-networking sessions, Live Play Button award ceremony, Masterclasses by industry leaders, Exclusive brand deal signings.',
          date: new Date('2027-03-15T09:00:00.000Z'),
          location: 'Jaipur, Rajasthan',
          venue: 'Birla Auditorium, Jaipur',
          type: 'SUMMIT',
          coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
          eligibility: 'CB Score 60+ required',
          isFeatured: true,
          published: true
        },
        {
          id: 'workshop-jaipur-2027',
          title: 'Creator Masterclass — Jaipur Hub',
          description: 'Content Strategy & Brand Pitching Workshop. CB Hub, Bhilwara Road. Highlights include Content strategy for Tier-2 markets, How to pitch brands directly, CB Score improvement workshop, Live profile review session.',
          date: new Date('2027-01-20T10:00:00.000Z'),
          location: 'Jaipur, Rajasthan',
          venue: 'CB Hub, Bhilwara Road',
          type: 'WORKSHOP',
          coverImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=1200',
          eligibility: 'Any verified creator',
          isFeatured: false,
          published: true
        },
        {
          id: 'awards-2027',
          title: 'CreatorBharat Awards Night 2027',
          description: 'Celebrating Bharat\'s Top Regional Creators. NSCI Dome, Worli. Highlights include India Creator Button ceremony, Best Niche Creator awards, Brand Partner of the Year, Rising Star recognition.',
          date: new Date('2027-12-10T18:00:00.000Z'),
          location: 'Mumbai, Maharashtra',
          venue: 'NSCI Dome, Worli',
          type: 'SUMMIT',
          coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
          eligibility: 'CB Score 80+ required',
          isFeatured: true,
          published: true
        }
      ];

      for (const e of defaultEvents) {
        await prisma.event.create({
          data: e
        });
      }
      console.log(`[Database Seeder]: ${defaultEvents.length} default events seeded successfully.`);
    }
  } catch (err) {
    console.error('[Database Seeder Error]:', err.message);
  }
})();

// ─── Sentry Error Handler (must be after all routes) ─────────────────────────
Sentry.setupExpressErrorHandler(app);

// Global 500 error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err.message);
  res.status(500).json({ error: 'An unexpected server error occurred. Our team has been notified.' });
});

// Start Server
const isTestEnv = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
if (!isTestEnv) {
  server.listen(PORT, () => {
    logger.info(`CreatorBharat SaaS API Server running on port ${PORT}`, { port: PORT });
  });

  // ─── Onboarding Email Drip — Auto Cron (every 6 hours) ───────────────────
  // Sends Day 1, Day 3, Day 7 welcome emails to new creators and brands.
  // Set DISABLE_DRIP_CRON=true in .env to disable (useful for local dev).
  if (process.env.DISABLE_DRIP_CRON !== 'true') {
    const SIX_HOURS = 6 * 60 * 60 * 1000;
    setInterval(async () => {
      try {
        logger.info('[Drip Cron] Running onboarding email drip...');
        const result = await runOnboardingDrip();
        logger.info(`[Drip Cron] Complete — Sent: ${result.sent}, Errors: ${result.errors}`);
      } catch (err) {
        logger.error('[Drip Cron] Error:', err.message);
      }
    }, SIX_HOURS);
    logger.info('[Drip Cron] Onboarding email drip scheduled — every 6 hours');
  }
}

export { app, server };
