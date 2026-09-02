import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Building2, ShieldCheck, DollarSign, FileText, TrendingUp, Settings, LogOut,
  Lock, Mail, CheckCircle2, AlertTriangle, XCircle, Eye, Check, X, Search, ChevronRight,
  Filter, CreditCard, Trash2, SlidersHorizontal, Info, MessageSquare, PlayCircle, Star,
  BarChart3, Wallet, Trophy, Zap, Globe, Bell, Calendar, Activity, Award, Layers,
  RefreshCw, ExternalLink, Crown, Target, ChevronDown, ChevronUp, Copy, Download,
  Flame, BookOpen, Headphones, AtSign, Phone, MapPin, Hash, ShieldAlert, UserCheck,
  UserX, PieChart, TrendingDown, Package, Cpu, Database, Shield, Image, FolderOpen
} from 'lucide-react';
import { T, fmtINR, fmtNum, fmtDate, Badge, StatCard, SectionHeader, SearchBar, EmptyState, ActionBtn, DangerBtn, TableHead, Table, Td } from './components/ui/Primitives';
import { NAV_SECTIONS, TAB_META } from './components/ui/NavConfig';
import DashboardSection from './components/sections/DashboardSection';
import KycSection from './components/sections/KycSection';
import CreatorsSection from './components/sections/CreatorsSection';
import BrandsSection from './components/sections/BrandsSection';
import CmsSection from './components/sections/CmsSection';
import SystemControlSection from './components/sections/SystemControlSection';
import EngagementSection from './components/sections/EngagementSection';
import { AuditLogsSection } from './components/sections/AuditLogsSection';
import { AdminLayout } from './layout/AdminLayout';
import { AdminModals } from './components/modals/AdminModals';
import { AdminApi } from './services/adminApi';

const API_BASE = import.meta.env.VITE_API_URL || 'https://creatorbharat.onrender.com/api';
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5173' : 'https://creatorbharat.com');







// ─── STATUS COLORS ─────────────────────────────────────────────────────────
const STATUS_COLOR = {
  ACTIVE: T.green, PENDING: T.yellow, REJECTED: T.red, COMPLETED: T.blue,
  ACCEPTED: T.green, SHORTLISTED: T.purple, PAID: T.green, RELEASED: T.blue,
  REFUNDED: T.orange, ESCROW: T.yellow, CAMPAIGN_ESCROW: T.yellow,
  published: T.green, draft: T.muted
};

// ─── Reusable Component: PremiumMediaUpload ─────────────────────────────────
const PremiumMediaUpload = ({ label, value, onChange, type = 'image', onUploadFile }) => {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('upload'); // 'upload' or 'url'

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadMediaFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await uploadMediaFile(e.target.files[0]);
    }
  };

  const uploadMediaFile = async (file) => {
    setLoading(true);
    try {
      const url = await onUploadFile(file, type);
      onChange(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: T.slate, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
        <button
          type="button"
          onClick={() => setMode(mode === 'upload' ? 'url' : 'upload')}
          style={{ background: 'none', border: 'none', color: T.orange, fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: 0 }}
        >
          {mode === 'upload' ? '✍️ Paste URL Link' : '📁 Upload Local File'}
        </button>
      </div>

      {mode === 'url' ? (
        <input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`https://... enter direct ${type} URL`}
          style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }}
        />
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragActive ? T.orange : T.border}`,
            borderRadius: 12,
            padding: '24px 20px',
            textAlign: 'center',
            background: dragActive ? T.orangeLight : T.bg,
            cursor: 'pointer',
            transition: 'all 0.2s',
            position: 'relative'
          }}
          onClick={() => document.getElementById(`file-upload-${label.replace(/[^a-zA-Z]/g, '')}`).click()}
        >
          <input
            type="file"
            id={`file-upload-${label.replace(/[^a-zA-Z]/g, '')}`}
            accept={type === 'video' ? 'video/*' : 'image/*'}
            style={{ display: 'none' }}
            onChange={handleChange}
          />
          
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <RefreshCw size={24} className="spin" style={{ color: T.orange }} />
              <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>Uploading media to Cloudinary...</span>
            </div>
          ) : value ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }} onClick={(e) => e.stopPropagation()}>
              {type === 'video' ? (
                <video src={value} controls style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 8, border: `1px solid ${T.border}` }} />
              ) : (
                <img src={value} alt="Preview" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8, border: `1px solid ${T.border}`, objectFit: 'contain' }} />
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => document.getElementById(`file-upload-${label.replace(/[^a-zA-Z]/g, '')}`).click()}
                  style={{ padding: '6px 12px', background: T.orangeLight, border: `1px solid ${T.orangeBorder}`, borderRadius: 6, fontSize: 11, color: T.orange, fontWeight: 700, cursor: 'pointer' }}
                >
                  Change File
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  style={{ padding: '6px 12px', background: T.redLight, border: `1px solid ${T.red}25`, borderRadius: 6, fontSize: 11, color: T.red, fontWeight: 700, cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Download size={24} style={{ color: T.muted }} />
              <span style={{ fontSize: 13, color: T.navy, fontWeight: 700 }}>Drag & drop file here, or <span style={{ color: T.orange }}>browse</span></span>
              <span style={{ fontSize: 10, color: T.muted }}>Supports {type === 'video' ? 'MP4, WebM (Max 50MB)' : 'PNG, JPG, WebP (Max 5MB)'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [token, setToken] = useState(localStorage.getItem('cb_admin_token') || '');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mob, setMob] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setMob(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ── Core Data
  const [creators, setCreators] = useState([]);
  const [brands, setBrands] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [deepStats, setDeepStats] = useState(null);

  // ── Content Data
  const [blogs, setBlogs] = useState([]);
  const [newsletters, setNewsletters] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [mediaSearch, setMediaSearch] = useState('');

  // ── Platform Control Center States
  const [platformSettings, setPlatformSettings] = useState(null);
  const [psLoading, setPsLoading] = useState(false);
  const [psSaving, setPsSaving] = useState(false);
  const [psSaved, setPsSaved] = useState(false);
  const [psSubTab, setPsSubTab] = useState('features');

  // ── Admin Panel Control States
  const [adminPanelSettings, setAdminPanelSettings] = useState(null);
  const [apLoading, setApLoading] = useState(false);
  const [apSaving, setApSaving] = useState(false);
  const [apSaved, setApSaved] = useState(false);
  const [apSubTab, setApSubTab] = useState('theme');
  const [adminNewEmail, setAdminNewEmail] = useState('');
  const [adminCurrentPassword, setAdminCurrentPassword] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [adminCredsUpdating, setAdminCredsUpdating] = useState(false);
  const [apDiagnostics, setApDiagnostics] = useState(null);
  const [apDiagLoading, setApDiagLoading] = useState(false);

  // ── Admin 2FA States
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFAQrCode, setTwoFAQrCode] = useState(null);
  const [twoFASecret, setTwoFASecret] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAMessage, setTwoFAMessage] = useState(null); // { type: 'success'|'error', text }
  const [twoFAStep, setTwoFAStep] = useState('idle'); // idle | setup | verify | enabled

  // ── Podcast Editor States
  const [podcastModalOpen, setPodcastModalOpen] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState(null);
  const [podCreatorId, setPodCreatorId] = useState('');
  const [podTitle, setPodTitle] = useState('');
  const [podDesc, setPodDesc] = useState('');
  const [podDuration, setPodDuration] = useState('');
  const [podThumbnail, setPodThumbnail] = useState('');
  const [podAudioUrl, setPodAudioUrl] = useState('');
  const [podVideoUrl, setPodVideoUrl] = useState('');
  const [podPublished, setPodPublished] = useState(false);

  // ── Gallery Editor States
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState(null);
  const [galTitle, setGalTitle] = useState('');
  const [galDesc, setGalDesc] = useState('');
  const [galCategory, setGalCategory] = useState('Summits');
  const [galType, setGalType] = useState('photo');
  const [galDate, setGalDate] = useState('');
  const [galLocation, setGalLocation] = useState('');
  const [galThumbnail, setGalThumbnail] = useState('');
  const [galVideoUrl, setGalVideoUrl] = useState('');
  const [galDuration, setGalDuration] = useState('');
  const [galTags, setGalTags] = useState('');

  // ── Campus Ambassador / Events / Missions States
  const [ambassadors, setAmbassadors] = useState([]);
  const [events, setEvents] = useState([]);
  const [missions, setMissions] = useState([]);
  const [missionCompletions, setMissionCompletions] = useState([]);

  // Modals for Events
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [evtTitle, setEvtTitle] = useState('');
  const [evtDescription, setEvtDescription] = useState('');
  const [evtDate, setEvtDate] = useState('');
  const [evtLocation, setEvtLocation] = useState('');
  const [evtLink, setEvtLink] = useState('');
  const [evtImage, setEvtImage] = useState('');

  // Modals for Achievements (Grant Achievement)
  const [grantAchModalOpen, setGrantAchModalOpen] = useState(false);
  const [achCreatorId, setAchCreatorId] = useState('');
  const [achType, setAchType] = useState('VERIFICATION');
  const [achTitle, setAchTitle] = useState('');
  const [achDescription, setAchDescription] = useState('');

  // Modals for Missions
  const [missionModalOpen, setMissionModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState(null);
  const [misTitle, setMisTitle] = useState('');
  const [misDescription, setMisDescription] = useState('');
  const [misReward, setMisReward] = useState('');
  const [misRewardColor, setMisRewardColor] = useState('#FF9431');
  const [misDeadline, setMisDeadline] = useState('');
  const [misSteps, setMisSteps] = useState('');
  const [misActive, setMisActive] = useState(true);

  // ── New Data
  const [allApplications, setAllApplications] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [brandAnalytics, setBrandAnalytics] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  // ── Page Config Manager States
  const [selectedPageName, setSelectedPageName] = useState('pricing');
  const [homeConfig, setHomeConfig] = useState({
    heroTitle: 'Find Elite Local Creators Across India',
    heroSubtitle: 'CreatorBharat connects top regional influencers with local and global brands for impactful collaborations.',
    ctaText: 'Launch Campaign Now',
    announcement: '⚡ Version 3.0 Live: Introducing Instant Wallet Bank Settlements!'
  });
  const [pricingConfig, setPricingConfig] = useState({
    starterPrice: 0,
    proPrice: 49,
    proFeatures: 'Instant wallet withdrawals, Automated GST invoicing, Priority campaign listing, 0% commission fees, Pro verified badge',
    brandStarterPrice: 0,
    brandProPrice: 4999,
    brandProFeatures: 'Launch Unlimited Campaigns, Direct Outreach Pitch Console, Full A4 Creator Resume Access, Verified Gold Brand Badge, AI Smart Talent Matches, Advanced Analytics Dashboard, 24/7 Premium Priority Support'
  });
  const [calculatorConfig, setCalculatorConfig] = useState({
    rateMultiplier: 0.15,
    nicheMultiplier: 1.2,
    minFee: 500
  });
  const [creatorLandingConfig, setCreatorLandingConfig] = useState({
    heroBadge: "India's Creator Ecosystem",
    heroTitle: "Build Your Creator Legacy.",
    heroSubtitle: "Bharat ke har creator ke liye — Tier 2, Tier 3, ya metro. Verified profile, direct brand deals, zero commission. Apni pehchan banao.",
    ctaPrimary: "Join Free — Start Today",
    ctaSecondary: "See Creator Profiles",
    bottomTitle: "Bharat Ka Creator Kahin Bhi Jayega. 🇮🇳",
    bottomSubtitle: "Bhilwara se Bangalore tak — har creator ki pehchan honi chahiye. Join karo aur apni legacy banao.",
    bottomCtaPrimary: "Join Free Now",
    bottomCtaSecondary: "View Pro Plans"
  });
  const [brandLandingConfig, setBrandLandingConfig] = useState({
    heroBadge: "Brand Command Center",
    heroTitle: "Scale with Bharat's Best.",
    heroSubtitle: "Scout verified regional creators, launch campaigns with escrow protection, and track ROI in real-time. Zero commission. Zero middlemen.",
    ctaPrimary: "Start Scouting Free",
    ctaSecondary: "Browse Creators",
    bottomTitle: "Ready to Scale? Join 500+ Brands.",
    bottomSubtitle: "Start free. No credit card required. Access Bharat's most verified creator network today.",
    bottomCtaPrimary: "Register Your Brand",
    bottomCtaSecondary: "Browse Creators"
  });
  const [faqJson, setFaqJson] = useState(JSON.stringify([
    { cat: 'General', q: 'How does CreatorBharat escrow work?', a: 'Brands deposit campaign budgets into secure escrows. Funds are released instantly to creators after verified milestone deliverables are submitted.' },
    { cat: 'Creators', q: 'Is there a signup fee for creators?', a: 'Signing up as a basic creator is completely free. Basic creators can receive brand deals. Creator Pro unlocking instant payouts requires a tiny monthly fee of ₹49.' },
    { cat: 'Creators', q: 'Can I link multiple Instagram accounts?', a: 'Currently, each creator account can link one verified primary Instagram handle and one YouTube channel to calculate dynamic engagement rates.' }
  ], null, 2));
  const [faqError, setFaqError] = useState('');

  const [aboutJson, setAboutJson] = useState(JSON.stringify({
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
  }, null, 2));
  const [aboutError, setAboutError] = useState('');

  const [pressJson, setPressJson] = useState(JSON.stringify([
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
  ], null, 2));
  const [pressError, setPressError] = useState('');

  const [storiesJson, setStoriesJson] = useState(JSON.stringify([
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
  ], null, 2));
  const [storiesError, setStoriesError] = useState('');

  const [aiFaqJson, setAiFaqJson] = useState(JSON.stringify([
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
  ], null, 2));
  const [aiFaqError, setAiFaqError] = useState('');

  const [notificationsJson, setNotificationsJson] = useState(JSON.stringify([
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
  ], null, 2));
  const [notificationsError, setNotificationsError] = useState('');

  // ── CMS Page Visual / JSON Toggle Mode and states
  const [editorMode, setEditorMode] = useState('visual'); // 'visual' | 'json'
  const [rawJsonText, setRawJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [aboutSubTab, setAboutSubTab] = useState('blueprint');
  const [officialSubTab, setOfficialSubTab] = useState('bio');
  const [verifyGuideSubTab, setVerifyGuideSubTab] = useState('creator');
  const [ambassadorSubTab, setAmbassadorSubTab] = useState('perks');
  const [contactSubTab, setContactSubTab] = useState('advantages');
  
  // ── Admin Identity State
  const [adminUser, setAdminUser] = useState(null);
  
  // ── Admin Team Invitation Invite Signup View
  const [inviteName, setInviteName] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteConfirmPassword, setInviteConfirmPassword] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  const [officialConfig, setOfficialConfig] = useState({
    en: { username: 'creatorbharat', displayName: 'CreatorBharat.Official', category: 'Ecosystem • Official Platform Handle', bio: "Democratizing India's Creator Economy. 🇮🇳\nConnecting brands with authentic regional creators with 0% middleman fees.", website: 'www.creatorbharat.com' },
    hi: { username: 'creatorbharat', displayName: 'CreatorBharat.Official', category: 'पारिस्थितिकी तंत्र • आधिकारिक हैंडल', bio: "भारत की क्रिएटर इकोनॉमी का लोकतंत्रीकरण। 🇮🇳\n0% ब्रोकरेज फीस पर ब्रांड्स को क्षेत्रीय क्रिएटर्स से जोड़ना।", website: 'www.creatorbharat.com' },
    baseStats: { posts: 120, followers: '58.4K', following: 128 },
    socialPlatforms: [],
    highlights: [],
    posts: [],
    founder: { name: 'Mohmmad Dilshan', role: 'Founder & CEO', location: 'Bhilwara, Rajasthan', vision: "Building the infrastructure of trust and growth for India's regional creator economy.", achievements: [], stats: [] },
    shards: [],
    analytics: { growth: [], regions: [], metrics: [] },
    portals: []
  });

  const [verifyGuideConfig, setVerifyGuideConfig] = useState({
    creatorSteps: [],
    brandSteps: []
  });

  const [ambassadorConfig, setAmbassadorConfig] = useState({
    perks: [],
    steps: [],
    faqs: []
  });

  const [contactConfig, setContactConfig] = useState({
    advantages: [],
    regionalHubs: [],
    contactMethods: [],
    faqs: []
  });

  const [faqsList, setFaqsList] = useState([]);
  const [aboutConfig, setAboutConfig] = useState({ BLUEPRINT_CARDS: [], TIMELINE_DATA: [], PHILOSOPHY_PILLARS: [], LEADERSHIP_TEAM: [], PRESS_LOGOS: [], INVESTOR_LOGOS: [] });
  const [pressList, setPressList] = useState([]);
  const [storiesList, setStoriesList] = useState([]);
  const [aiFaqList, setAiFaqList] = useState([]);
  const [notificationsList, setNotificationsList] = useState([]);



  // ── Search States
  const [creatorSearch, setCreatorSearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [campaignSearch, setCampaignSearch] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [blogSearch, setBlogSearch] = useState('');
  const [commentSearch, setCommentSearch] = useState('');
  const [newsletterSearch, setNewsletterSearch] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [appSearch, setAppSearch] = useState('');
  const [leaderSearch, setLeaderSearch] = useState('');
  const [brandAnalyticSearch, setBrandAnalyticSearch] = useState('');

  // ── Creator Wallet drill-down
  const [selectedWalletCreator, setSelectedWalletCreator] = useState(null);
  const [walletTxns, setWalletTxns] = useState([]);
  const [walletLoading, setWalletLoading] = useState(false);

  // ── Creator Score modal
  const [scoreModal, setScoreModal] = useState(null); // { creator }
  const [scoreInput, setScoreInput] = useState('');
  const [scoreReason, setScoreReason] = useState('');

  // ── KYC Drawer
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // ── Brand Drawer
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brandDrawerOpen, setBrandDrawerOpen] = useState(false);

  // ── Contact Detail Modal
  const [viewingContact, setViewingContact] = useState(null);

  // ── Campaign Applications accordion
  const [expandedCampaignId, setExpandedCampaignId] = useState(null);
  const [campaignApplications, setCampaignApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);

  // ── Blog Editor
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSlug, setBlogSlug] = useState('');
  const [blogCategory, setBlogCategory] = useState('Marketing');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogBody, setBlogBody] = useState('');
  const [blogAuthor, setBlogAuthor] = useState('CB Editorial');
  const [blogImage, setBlogImage] = useState('');
  const [blogTags, setBlogTags] = useState('');
  const [blogFeatured, setBlogFeatured] = useState(false);
  const [blogPublished, setBlogPublished] = useState(false);

  // ── Settings (Full Platform Config)
  const [platformFee, setPlatformFee] = useState(10);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [supportEmail, setSupportEmail] = useState('support@creatorbharat.com');
  const [siteName, setSiteName] = useState('CreatorBharat');
  const [frontendUrl, setFrontendUrl] = useState('http://localhost:5173');
  const [featAchievements, setFeatAchievements] = useState(true);
  const [featWallet, setFeatWallet] = useState(true);
  const [enableEmail, setEnableEmail] = useState(true);
  const [enableSMS, setEnableSMS] = useState(true);
  // Pricing
  const [proMembershipPrice, setProMembershipPrice] = useState(4900);
  const [campaignBoostPrice, setCampaignBoostPrice] = useState(9900);
  const [featuredSlotPrice, setFeaturedSlotPrice] = useState(19900);
  // Razorpay
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpaySecret, setRazorpaySecret] = useState('');
  const [razorpayMode, setRazorpayMode] = useState('test');
  // Email
  const [resendApiKey, setResendApiKey] = useState('');
  const [emailFrom, setEmailFrom] = useState('onboarding@resend.dev');
  // SMS
  const [smsProvider, setSmsProvider] = useState('fast2sms');
  const [fast2smsKey, setFast2smsKey] = useState('');
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioToken, setTwilioToken] = useState('');
  const [twilioPhone, setTwilioPhone] = useState('');
  const [settingsTab, setSettingsTab] = useState('general');
  const [logoUrl, setLogoUrl] = useState('');
  const [footerEmail, setFooterEmail] = useState('hello@creatorbharat.com');

  // ── Platform Custom Notifications Dispatcher States
  const [notifTargetGroup, setNotifTargetGroup] = useState('ALL_CREATORS');
  const [notifUserId, setNotifUserId] = useState('');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifType, setNotifType] = useState('INFO');
  const [notifLink, setNotifLink] = useState('');

  // ── Creator Profile Editor
  const [editCreatorModalOpen, setEditCreatorModalOpen] = useState(false);
  const [editingCreator, setEditingCreator] = useState(null);
  const [editCreName, setEditCreName] = useState('');
  const [editCreHandle, setEditCreHandle] = useState('');
  const [editCreBio, setEditCreBio] = useState('');
  const [editCreCity, setEditCreCity] = useState('');
  const [editCreState, setEditCreState] = useState('');
  const [editCreFollowers, setEditCreFollowers] = useState(0);
  const [editCreEngagementRate, setEditCreEngagementRate] = useState(0);
  const [editCreRateMin, setEditCreRateMin] = useState(0);
  const [editCreRateMax, setEditCreRateMax] = useState(0);
  const [editCrePhoto, setEditCrePhoto] = useState('');
  const [editCreCoverImage, setEditCreCoverImage] = useState('');
  const [editCreNiche, setEditCreNiche] = useState('');
  const [editCrePlatform, setEditCrePlatform] = useState('');
  const [editCreStatus, setEditCreStatus] = useState('DRAFT');
  const [editCreIsVerified, setEditCreIsVerified] = useState(false);
  const [editCreIsPro, setEditCreIsPro] = useState(false);
  const [editCreAadhaarUrl, setEditCreAadhaarUrl] = useState('');
  const [editCrePanUrl, setEditCrePanUrl] = useState('');

  // ── Brand Profile Editor
  const [editBrandModalOpen, setEditBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [editBrandName, setEditBrandName] = useState('');
  const [editBrandIndustry, setEditBrandIndustry] = useState('');
  const [editBrandWebsite, setEditBrandWebsite] = useState('');

  // ── Campaign Editor
  const [editCampaignModalOpen, setEditCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [editCampTitle, setEditCampTitle] = useState('');
  const [editCampDesc, setEditCampDesc] = useState('');
  const [editCampBudget, setEditCampBudget] = useState(0);
  const [editCampPlatform, setEditCampPlatform] = useState('');
  const [editCampNiche, setEditCampNiche] = useState('');
  const [editCampStatus, setEditCampStatus] = useState('ACTIVE');
  
  // ── Creator Creation States
  const [createCreatorModalOpen, setCreateCreatorModalOpen] = useState(false);
  const [creEmail, setCreEmail] = useState('');
  const [crePassword, setCrePassword] = useState('');
  const [creName, setCreName] = useState('');
  const [creHandle, setCreHandle] = useState('');
  const [crePhone, setCrePhone] = useState('');
  const [creCity, setCreCity] = useState('');
  const [creState, setCreState] = useState('');
  const [creFollowers, setCreFollowers] = useState(0);
  const [creNiche, setCreNiche] = useState('');
  const [crePlatform, setCrePlatform] = useState('');
  const [creRateMin, setCreRateMin] = useState(0);
  const [creRateMax, setCreRateMax] = useState(0);

  // ── Brand Creation States
  const [createBrandModalOpen, setCreateBrandModalOpen] = useState(false);
  const [brandEmail, setBrandEmail] = useState('');
  const [brandPassword, setBrandPassword] = useState('');
  const [brandCompanyName, setBrandCompanyName] = useState('');
  const [brandIndustry, setBrandIndustry] = useState('');
  const [brandWebsite, setBrandWebsite] = useState('');
  const [brandPhone, setBrandPhone] = useState('');

  // ── Campaign Creation States
  const [createCampaignModalOpen, setCreateCampaignModalOpen] = useState(false);
  const [campBrandId, setCampBrandId] = useState('');
  const [campTitle, setCampTitle] = useState('');
  const [campDesc, setCampDesc] = useState('');
  const [campBudget, setCampBudget] = useState(0);
  const [campPlatform, setCampPlatform] = useState('');
  const [campNiche, setCampNiche] = useState('');
  const [campStatus, setCampStatus] = useState('ACTIVE');

  // ── SVG Chart Tooltip State
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // ── UI
  const [dataLoading, setDataLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // ─── Toast Helper ───────────────────────────────────────────────────────────
  const toast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  // ─── Auth ───────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return setAuthError('Email and password are required.');
    setAuthLoading(true); setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      if (data.user?.role !== 'ADMIN') throw new Error('Access denied. Administrator privileges required.');
      // F-02: Route through AdminApi.setToken (sessionStorage by default, no cross-session persistence)
      AdminApi.setToken(data.token, false);
      setToken(data.token);
      setAdminUser(data.user);
      toast('Welcome Back, Administrator! 🛡️', 'success');
    } catch (err) { setAuthError(err.message); }
    finally { setAuthLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('cb_admin_token');
    setToken('');
    setAdminUser(null);
    setCreators([]); setBrands([]); setCampaigns([]); setVerifications([]);
    setPayments([]); setStats(null); setDeepStats(null);
    toast('Session closed', 'info');
  };

  const handleSendTestEmail = async () => {
    try {
      toast('Sending test email...', 'info');
      const res = await fetch(`${API_BASE}/admin/system/test-mail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ to: adminUser?.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast(data.sandbox ? '📧 Email logged to console (no API key set)' : `✅ Test email sent to ${data.recipient}!`, 'success');
    } catch (err) {
      toast(err.message || 'Failed to send test email', 'error');
    }
  };

  const handleSyncCheck = async () => {
    try {
      toast('Running health check...', 'info');
      const res = await fetch(`${API_BASE}/admin/health`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const dbStatus = data.services?.database?.status;
      if (dbStatus === 'healthy') {
        toast('✅ All systems healthy! DB connected, services online.', 'success');
      } else {
        toast(`⚠️ DB Status: ${dbStatus}. Check backend logs.`, 'error');
      }
    } catch (err) {
      toast('Could not reach backend. Is server running?', 'error');
    }
  };

  const handleClearCache = async () => {
    try {
      // Re-fetch all data to refresh admin state
      toast('Refreshing all data...', 'info');
      await fetchData();
      toast('✅ Admin data refreshed from database!', 'success');
    } catch (err) {
      toast('Refresh failed: ' + (err.message || 'Unknown error'), 'error');
    }
  };

  // CSV Export helper
  const handleExportCSV = async (type) => {
    try {
      toast(`Preparing ${type} export...`, 'info');
      const res = await fetch(`${API_BASE}/admin/export/${type}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast(`✅ ${type} data exported successfully!`, 'success');
    } catch (err) {
      toast(`Export failed: ${err.message}`, 'error');
    }
  };

  // Danger Zone real handlers
  const handleDangerOp = async (endpoint, label) => {
    const typed = window.prompt(`Type DELETE to confirm: ${label}\n\n⚠️ THIS CANNOT BE UNDONE!`);
    if (typed !== 'DELETE') { toast('Cancelled — confirmation text did not match.', 'info'); return; }
    try {
      toast(`Executing: ${label}...`, 'info');
      const res = await fetch(`${API_BASE}/admin/danger/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ confirm: 'DELETE' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Operation failed');
      toast(`✅ ${data.message}`, 'success');
      await fetchData();
    } catch (err) {
      toast(`❌ ${err.message}`, 'error');
    }
  };

  const handleUploadFile = async (e, type = 'image', callback) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (e.g. 50MB max for video, 5MB for image)
    const maxSize = type === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return toast(`File is too large. Maximum size allowed is ${type === 'video' ? '50MB' : '5MB'}`, 'error');
    }

    const formData = new FormData();
    formData.append('file', file);
    
    toast('Uploading file...', 'info');
    try {
      const res = await fetch(`${API_BASE}/uploads/${type}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      toast('Upload completed successfully!', 'success');
      callback(data.url);
    } catch (err) {
      toast(err.message || 'File upload failed', 'error');
    }
  };

  const handleUploadMedia = async (file, type = 'image') => {
    // Check file size (e.g. 50MB max for video, 5MB for image)
    const maxSize = type === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast(`File is too large. Maximum size allowed is ${type === 'video' ? '50MB' : '5MB'}`, 'error');
      throw new Error('File too large');
    }

    const formData = new FormData();
    formData.append('file', file);
    
    toast('Uploading media file...', 'info');
    const res = await fetch(`${API_BASE}/uploads/${type}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    toast('Upload completed successfully!', 'success');
    return data.url;
  };

  const handleSaveCreator = async (e) => {
    e.preventDefault();
    if (!editingCreator) return;
    try {
      const nicheArr = editCreNiche.split(',').map(n => n.trim()).filter(Boolean);
      const platArr = editCrePlatform.split(',').map(p => p.trim()).filter(Boolean);
      const res = await fetch(`${API_BASE}/admin/creators/${editingCreator.id}`, {
        method: 'PUT',
        headers: H(),
        body: JSON.stringify({
          name: editCreName,
          handle: editCreHandle,
          bio: editCreBio,
          city: editCreCity,
          state: editCreState,
          followers: parseInt(editCreFollowers) || 0,
          engagementRate: parseFloat(editCreEngagementRate) || 0,
          rateMin: parseInt(editCreRateMin) || 0,
          rateMax: parseInt(editCreRateMax) || 0,
          photo: editCrePhoto,
          coverImage: editCreCoverImage,
          niche: nicheArr,
          platform: platArr,
          status: editCreStatus,
          isVerified: editCreIsVerified,
          isPro: editCreIsPro,
          aadhaarUrl: editCreAadhaarUrl || null,
          panUrl: editCrePanUrl || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update creator profile');
      toast('Creator profile updated successfully!', 'success');
      setEditCreatorModalOpen(false);
      setEditingCreator(null);
      fetchData();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleSaveBrand = async (e) => {
    e.preventDefault();
    if (!editingBrand) return;
    try {
      const res = await fetch(`${API_BASE}/admin/brands/${editingBrand.id}`, {
        method: 'PUT',
        headers: H(),
        body: JSON.stringify({
          companyName: editBrandName,
          industry: editBrandIndustry,
          website: editBrandWebsite
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update brand profile');
      toast('Brand profile updated successfully!', 'success');
      setEditBrandModalOpen(false);
      setEditingBrand(null);
      fetchData();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleSaveCampaign = async (e) => {
    e.preventDefault();
    if (!editingCampaign) return;
    try {
      const nicheArr = editCampNiche.split(',').map(n => n.trim()).filter(Boolean);
      const platArr = editCampPlatform.split(',').map(p => p.trim()).filter(Boolean);
      const res = await fetch(`${API_BASE}/admin/campaigns/${editingCampaign.id}`, {
        method: 'PUT',
        headers: H(),
        body: JSON.stringify({
          title: editCampTitle,
          description: editCampDesc,
          budget: parseInt(editCampBudget) || 0,
          niche: nicheArr,
          platform: platArr,
          status: editCampStatus
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update campaign details');
      toast('Campaign updated successfully!', 'success');
      setEditCampaignModalOpen(false);
      setEditingCampaign(null);
      fetchData();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      const url = editingEvent 
        ? `${API_BASE}/events/${editingEvent.id}`
        : `${API_BASE}/events`;
      const method = editingEvent ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: H(),
        body: JSON.stringify({
          title: evtTitle,
          description: evtDescription,
          date: evtDate,
          location: evtLocation,
          venue: evtLocation,
          type: 'SUMMIT',
          coverImage: evtImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100',
          registrationUrl: evtLink || '',
          eligibility: 'All Creators',
          isFeatured: true,
          published: true
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save event');
      toast(editingEvent ? 'Event updated successfully!' : 'Event created successfully!', 'success');
      setEventModalOpen(false);
      setEditingEvent(null);
      fetchData();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleSaveAchievement = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/achievements`, {
        method: 'POST',
        headers: H(),
        body: JSON.stringify({
          creatorId: achCreatorId,
          type: achType,
          title: achTitle,
          description: achDescription
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to grant achievement');
      toast('Achievement granted successfully!', 'success');
      setGrantAchModalOpen(false);
      setAchCreatorId('');
      setAchType('VERIFICATION');
      setAchTitle('');
      setAchDescription('');
      fetchData();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleSaveMission = async (e) => {
    e.preventDefault();
    try {
      const url = editingMission 
        ? `${API_BASE}/admin/missions/${editingMission.id}`
        : `${API_BASE}/admin/missions`;
      const method = editingMission ? 'PUT' : 'POST';
      
      const stepsArr = misSteps.split('\n').map(s => s.trim()).filter(Boolean);
      
      const res = await fetch(url, {
        method,
        headers: H(),
        body: JSON.stringify({
          title: misTitle,
          description: misDescription,
          reward: misReward,
          rewardColor: misRewardColor || '#FF9431',
          deadline: misDeadline,
          steps: stepsArr,
          active: misActive
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save mission');
      toast(editingMission ? 'Mission updated successfully!' : 'Mission created successfully!', 'success');
      setMissionModalOpen(false);
      setEditingMission(null);
      fetchData();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleSendPlatformNotification = async (e) => {
    e.preventDefault();
    if (!notifTitle || !notifBody) {
      toast('Title and Body are required', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/admin/notifications/send`, {
        method: 'POST',
        headers: H(),
        body: JSON.stringify({
          targetGroup: notifTargetGroup,
          userId: notifTargetGroup === 'INDIVIDUAL' ? notifUserId : undefined,
          title: notifTitle,
          body: notifBody,
          type: notifType,
          link: notifLink || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch notifications');
      toast(data.message || 'Notification dispatched successfully!', 'success');
      setNotifTitle('');
      setNotifBody('');
      setNotifLink('');
      setNotifUserId('');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  // ─── Auth Headers Helper ────────────────────────────────────────────────────
  const H = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });

  // ─── Data Fetch ─────────────────────────────────────────────────────────────
  const fetchData = async () => {
    if (!token) return;
    setDataLoading(true);
    try {
      const fetches = [
        fetch(`${API_BASE}/admin/verifications`, { headers: H() }),
        fetch(`${API_BASE}/creators`, { headers: H() }),
        fetch(`${API_BASE}/admin/brands`, { headers: H() }),
        fetch(`${API_BASE}/campaigns`, { headers: H() }),
        fetch(`${API_BASE}/admin/payments`, { headers: H() }),
        fetch(`${API_BASE}/admin/stats`, { headers: H() }),
        fetch(`${API_BASE}/admin/blogs`, { headers: H() }),
        fetch(`${API_BASE}/admin/newsletters`, { headers: H() }),
        fetch(`${API_BASE}/admin/contacts`, { headers: H() }),
        fetch(`${API_BASE}/admin/podcasts`, { headers: H() }),
        fetch(`${API_BASE}/admin/reviews`, { headers: H() }),
        fetch(`${API_BASE}/admin/comments`, { headers: H() }),
        fetch(`${API_BASE}/admin/applications`, { headers: H() }),
        fetch(`${API_BASE}/admin/leaderboard`, { headers: H() }),
        fetch(`${API_BASE}/admin/brand-analytics`, { headers: H() }),
        fetch(`${API_BASE}/admin/platform/activity`, { headers: H() }),
        fetch(`${API_BASE}/admin/platform/stats/deep`, { headers: H() }),
        fetch(`${API_BASE}/admin/gallery`, { headers: H() }),
        fetch(`${API_BASE}/uploads`, { headers: H() }),
        fetch(`${API_BASE}/admin/settings`, { headers: H() }),
        fetch(`${API_BASE}/admin/system/pages`, { headers: H() }),
        fetch(`${API_BASE}/admin/ambassadors`, { headers: H() }),
        fetch(`${API_BASE}/events`),
        fetch(`${API_BASE}/admin/missions`, { headers: H() }),
        fetch(`${API_BASE}/admin/missions/completions`, { headers: H() }),
        fetch(`${API_BASE}/admin/platform-settings`, { headers: H() }),
        fetch(`${API_BASE}/admin/panel-settings`, { headers: H() }),
        fetch(`${API_BASE}/auth/me`, { headers: H() }),
      ];

      const results = await Promise.allSettled(fetches);
      const safeJson = async (r) => { try { const d = await r.json(); return d; } catch { return null; } };

      const [
        rVer, rCre, rBr, rCam, rPay, rSt, rBlog, rNews, rCont, rPod, rRev, rComm,
        rApps, rLead, rBrandAna, rAct, rDeepSt, rGal, rUp, rSettings, rPages,
        rAmb, rEvt, rMis, rMisComp, rPS, rAP, rMe
      ] = await Promise.all(results.map(r => r.status === 'fulfilled' ? safeJson(r.value) : null));

      if (rVer) setVerifications(Array.isArray(rVer) ? rVer : []);
      if (rCre) setCreators(rCre.creators || (Array.isArray(rCre) ? rCre : []));
      if (rBr) setBrands(Array.isArray(rBr) ? rBr : []);
      if (rCam) setCampaigns(Array.isArray(rCam) ? rCam : []);
      if (rPay) setPayments(Array.isArray(rPay) ? rPay : []);
      if (rSt) setStats(rSt);
      if (rBlog) setBlogs(Array.isArray(rBlog) ? rBlog : []);
      if (rNews) setNewsletters(Array.isArray(rNews) ? rNews : []);
      if (rCont) setContacts(Array.isArray(rCont) ? rCont : []);
      if (rPod) setPodcasts(Array.isArray(rPod) ? rPod : []);
      if (rRev) setReviews(Array.isArray(rRev) ? rRev : []);
      if (rComm) setComments(Array.isArray(rComm) ? rComm : []);
      if (rApps) setAllApplications(Array.isArray(rApps) ? rApps : []);
      if (rLead) setLeaderboard(Array.isArray(rLead) ? rLead : []);
      if (rBrandAna) setBrandAnalytics(Array.isArray(rBrandAna) ? rBrandAna : []);
      if (rAct) setActivityLog(Array.isArray(rAct) ? rAct : []);
      if (rDeepSt) setDeepStats(rDeepSt);
      if (rGal) setGallery(Array.isArray(rGal) ? rGal : []);
      if (rUp) setUploads(Array.isArray(rUp) ? rUp : []);
      if (rAmb) setAmbassadors(Array.isArray(rAmb) ? rAmb : []);
      if (rEvt) setEvents(Array.isArray(rEvt) ? rEvt : []);
      if (rMis) setMissions(Array.isArray(rMis) ? rMis : []);
      if (rMisComp) setMissionCompletions(Array.isArray(rMisComp) ? rMisComp : []);
      if (rPS && !rPS.error) setPlatformSettings(rPS);
      if (rAP && !rAP.error) setAdminPanelSettings(rAP);
      if (rMe && rMe.user) setAdminUser(rMe.user);
      if (rPages && Array.isArray(rPages)) {
        rPages.forEach(p => {
          if (p.pageName === 'home') setHomeConfig(p.content);
          else if (p.pageName === 'pricing') setPricingConfig(p.content);
          else if (p.pageName === 'calculator') setCalculatorConfig(p.content);
          else if (p.pageName === 'faqs' || p.pageName === 'faq') {
            setFaqJson(JSON.stringify(p.content, null, 2));
            setFaqsList(Array.isArray(p.content) ? p.content : p.content.items || []);
          }
          else if (p.pageName === 'creator-landing') setCreatorLandingConfig(p.content);
          else if (p.pageName === 'brand-landing') setBrandLandingConfig(p.content);
          else if (p.pageName === 'about') {
            setAboutJson(JSON.stringify(p.content, null, 2));
            setAboutConfig(p.content || {});
          }
          else if (p.pageName === 'press') {
            setPressJson(JSON.stringify(p.content, null, 2));
            setPressList(p.content || []);
          }
          else if (p.pageName === 'stories') {
            setStoriesJson(JSON.stringify(p.content, null, 2));
            setStoriesList(p.content || []);
          }
          else if (p.pageName === 'ai-faq') {
            setAiFaqJson(JSON.stringify(p.content, null, 2));
            setAiFaqList(p.content || []);
          }
          else if (p.pageName === 'notifications') {
            setNotificationsJson(JSON.stringify(p.content, null, 2));
            setNotificationsList(p.content || []);
          }
          else if (p.pageName === 'official') setOfficialConfig(p.content || {});
          else if (p.pageName === 'verify-guide') setVerifyGuideConfig(p.content || {});
          else if (p.pageName === 'ambassador') setAmbassadorConfig(p.content || {});
          else if (p.pageName === 'contact') setContactConfig(p.content || {});
        });
      }

      if (rSettings) {
        setPlatformFee(rSettings.platformFee || 10);
        setSupportEmail(rSettings.supportEmail || 'support@creatorbharat.com');
        setSiteName(rSettings.siteName || 'CreatorBharat');
        setFrontendUrl(rSettings.frontendUrl || 'http://localhost:5173');
        setFeatAchievements(rSettings.enableAIAssistant ?? true);
        setFeatWallet(rSettings.enableEscrowSystem ?? true);
        setMaintenanceMode(rSettings.maintenanceMode ?? false);
        setEnableEmail(rSettings.enableEmail ?? true);
        setEnableSMS(rSettings.enableSMS ?? true);
        setProMembershipPrice(rSettings.proMembershipPrice || 4900);
        setCampaignBoostPrice(rSettings.campaignBoostPrice || 9900);
        setFeaturedSlotPrice(rSettings.featuredSlotPrice || 19900);
        setRazorpayKeyId(rSettings.razorpayKeyId || '');
        setRazorpaySecret(rSettings.razorpaySecret || '');
        setRazorpayMode(rSettings.razorpayMode || 'test');
        setResendApiKey(rSettings.resendApiKey || '');
        setEmailFrom(rSettings.emailFrom || 'onboarding@resend.dev');
        setLogoUrl(rSettings.logoUrl || '');
        setFooterEmail(rSettings.footerEmail || 'hello@creatorbharat.com');
        setSmsProvider(rSettings.smsProvider || 'fast2sms');
        setFast2smsKey(rSettings.fast2smsKey || '');
        setTwilioSid(rSettings.twilioSid || '');
        setTwilioToken(rSettings.twilioToken || '');
        setTwilioPhone(rSettings.twilioPhone || '');
      }

    } catch (err) {
      console.error('Fetch error:', err);
      toast('Failed to sync data from database', 'error');
    } finally { setDataLoading(false); }
  };

  useEffect(() => { if (token) fetchData(); }, [token]);

  const updatePS = (sec, key, val) => {
    setPlatformSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [sec]: {
          ...prev[sec],
          [key]: val
        }
      };
    });
  };

  const fetchPlatformSettings = async () => {
    if (!token) return;
    setPsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/platform-settings`, { headers: H() });
      const data = await res.json();
      if (data && !data.error) {
        setPlatformSettings(data);
      }
    } catch (err) {
      console.error('Error fetching platform settings:', err);
    } finally {
      setPsLoading(false);
    }
  };

  const savePlatformSettings = async () => {
    if (!platformSettings) return;
    setPsSaving(true);
    setPsSaved(false);
    try {
      const res = await fetch(`${API_BASE}/admin/platform-settings`, {
        method: 'PUT',
        headers: H(),
        body: JSON.stringify(platformSettings)
      });
      const data = await res.json();
      if (data.success) {
        setPlatformSettings(data.settings);
        setPsSaved(true);
        toast('Platform settings saved successfully!', 'success');
        setTimeout(() => setPsSaved(false), 2000);
      } else {
        toast(data.error || 'Failed to save platform settings', 'error');
      }
    } catch (err) {
      console.error(err);
      toast('Network error saving platform settings', 'error');
    } finally {
      setPsSaving(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'feature-control' && !platformSettings && token) {
      fetchPlatformSettings();
    }
  }, [activeTab, token]);

  const updateAP = (key, val) => {
    setAdminPanelSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [key]: val
      };
    });
  };

  const fetchAdminPanelSettings = async () => {
    if (!token) return;
    setApLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/panel-settings`, { headers: H() });
      const data = await res.json();
      if (data && !data.error) {
        setAdminPanelSettings(data);
      }
    } catch (err) {
      console.error('Error fetching admin settings:', err);
    } finally {
      setApLoading(false);
    }
  };

  const saveAdminPanelSettings = async () => {
    if (!adminPanelSettings) return;
    setApSaving(true);
    setApSaved(false);
    try {
      const res = await fetch(`${API_BASE}/admin/panel-settings`, {
        method: 'PUT',
        headers: H(),
        body: JSON.stringify(adminPanelSettings)
      });
      const data = await res.json();
      if (data.success) {
        setAdminPanelSettings(data.settings);
        setApSaved(true);
        toast('Admin panel settings saved successfully!', 'success');
        setTimeout(() => setApSaved(false), 2000);
      } else {
        toast(data.error || 'Failed to save admin settings', 'error');
      }
    } catch (err) {
      console.error(err);
      toast('Network error saving admin settings', 'error');
    } finally {
      setApSaving(false);
    }
  };

  const handleUpdateAdminCredentials = async (e) => {
    e.preventDefault();
    if (adminNewPassword !== adminConfirmPassword) {
      toast('New passwords do not match!', 'error');
      return;
    }
    setAdminCredsUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/admin/update-credentials`, {
        method: 'PUT',
        headers: H(),
        body: JSON.stringify({
          email: adminNewEmail,
          currentPassword: adminCurrentPassword,
          newPassword: adminNewPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast('Admin credentials updated successfully!', 'success');
        setAdminNewEmail('');
        setAdminCurrentPassword('');
        setAdminNewPassword('');
        setAdminConfirmPassword('');
      } else {
        toast(data.error || 'Failed to update admin credentials', 'error');
      }
    } catch (err) {
      console.error(err);
      toast('Network error updating credentials', 'error');
    } finally {
      setAdminCredsUpdating(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'admin-control' && !adminPanelSettings && token) {
      fetchAdminPanelSettings();
    }
  }, [activeTab, token]);

  const fetchDiagnostics = async () => {
    if (!token) return;
    setApDiagLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/system/diagnostics`, { headers: H() });
      const data = await res.json();
      if (data && data.success) {
        setApDiagnostics(data);
      }
    } catch (err) {
      console.error('Error fetching diagnostics:', err);
    } finally {
      setApDiagLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'admin-control' && apSubTab === 'diagnostics' && token) {
      fetchDiagnostics();
    }
  }, [activeTab, apSubTab, token]);

  const getVisualState = (page) => {
    if (page === 'home') return homeConfig;
    if (page === 'pricing') return pricingConfig;
    if (page === 'calculator') return calculatorConfig;
    if (page === 'faqs' || page === 'faq') return faqsList;
    if (page === 'about') return aboutConfig;
    if (page === 'press') return pressList;
    if (page === 'stories') return storiesList;
    if (page === 'ai-faq') return aiFaqList;
    if (page === 'notifications') return notificationsList;
    if (page === 'creator-landing') return creatorLandingConfig;
    if (page === 'brand-landing') return brandLandingConfig;
    if (page === 'official') return officialConfig;
    if (page === 'verify-guide') return verifyGuideConfig;
    if (page === 'ambassador') return ambassadorConfig;
    if (page === 'contact') return contactConfig;
    return {};
  };

  const updateVisualState = (page, data) => {
    if (page === 'home') setHomeConfig(data);
    else if (page === 'pricing') setPricingConfig(data);
    else if (page === 'calculator') setCalculatorConfig(data);
    else if (page === 'faqs' || page === 'faq') setFaqsList(Array.isArray(data) ? data : data.items || []);
    else if (page === 'about') setAboutConfig(data);
    else if (page === 'press') setPressList(data);
    else if (page === 'stories') setStoriesList(data);
    else if (page === 'ai-faq') setAiFaqList(data);
    else if (page === 'notifications') setNotificationsList(data);
    else if (page === 'creator-landing') setCreatorLandingConfig(data);
    else if (page === 'brand-landing') setBrandLandingConfig(data);
    else if (page === 'official') setOfficialConfig(data);
    else if (page === 'verify-guide') setVerifyGuideConfig(data);
    else if (page === 'ambassador') setAmbassadorConfig(data);
    else if (page === 'contact') setContactConfig(data);
  };

  const handleToggleMode = (mode) => {
    if (mode === 'json') {
      const config = getVisualState(selectedPageName);
      setRawJsonText(JSON.stringify(config, null, 2));
      setEditorMode('json');
    } else {
      try {
        const parsed = JSON.parse(rawJsonText);
        updateVisualState(selectedPageName, parsed);
        setJsonError('');
        setEditorMode('visual');
      } catch (err) {
        setJsonError(err.message || 'Invalid JSON format.');
        toast('Cannot switch to Form Mode: Invalid JSON syntax', 'error');
      }
    }
  };

  const handleSavePageConfig = async () => {
    let content = {};
    if (editorMode === 'json') {
      try {
        content = JSON.parse(rawJsonText);
        updateVisualState(selectedPageName, content);
        setJsonError('');
      } catch (err) {
        setJsonError(err.message || 'Invalid JSON format.');
        toast('Failed to save: Invalid JSON syntax', 'error');
        return;
      }
    } else {
      content = getVisualState(selectedPageName);
    }

    const targetPageName = selectedPageName === 'faqs' ? 'faq' : selectedPageName;

    try {
      const res = await fetch(`${API_BASE}/admin/system/pages/${targetPageName}`, {
        method: 'PUT',
        headers: {
          ...H(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      if (res.ok) {
        toast(`${selectedPageName.toUpperCase()} page configuration saved!`, 'success');
      } else {
        toast(`Failed to save: ${data.error || res.statusText}`, 'error');
      }
    } catch (err) {
      console.error(err);
      toast('Network error while saving page configuration.', 'error');
    }
  };

  // ─── API Actions ────────────────────────────────────────────────────────────
  const handleApproveVerification = async (creatorId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/verify/${creatorId}`, { method: 'POST', headers: H() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast('Creator verified successfully ✓', 'success');
      setDrawerOpen(false);
      fetchData();
    } catch (err) { toast(err.message, 'error'); }
  };

  const handleRejectVerification = async (creatorId, reason) => {
    try {
      const res = await fetch(`${API_BASE}/admin/verify/reject/${creatorId}`, {
        method: 'POST', headers: H(), body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast('Verification rejected & documents reset', 'success');
      setDrawerOpen(false); setShowRejectForm(false);
      fetchData();
    } catch (err) { toast(err.message, 'error'); }
  };

  const handleToggleSuspension = async (userId, isCreator = true) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users/suspend/${userId}`, { method: 'POST', headers: H() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast(data.message, 'success');
      fetchData();
    } catch (err) { toast(err.message, 'error'); }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm('Delete this campaign? This is permanent.')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/campaigns/${campaignId}`, { method: 'DELETE', headers: H() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast('Campaign deleted', 'success');
      fetchData();
    } catch (err) { toast(err.message, 'error'); }
  };

  const handleDeleteCreator = async (creatorId) => {
    if (!window.confirm('Delete this creator account permanently? This is irreversible.')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/creators/${creatorId}`, { method: 'DELETE', headers: H() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast('Creator account deleted successfully', 'success');
      fetchData();
    } catch (err) { toast(err.message, 'error'); }
  };

  const handleDeleteBrand = async (brandId) => {
    if (!window.confirm('Delete this brand account permanently? This will also delete all their campaigns.')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/brands/${brandId}`, { method: 'DELETE', headers: H() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast('Brand account deleted successfully', 'success');
      fetchData();
    } catch (err) { toast(err.message, 'error'); }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        method: 'POST',
        headers: H(),
        body: JSON.stringify({
          siteName, supportEmail, frontendUrl, logoUrl, footerEmail,
          platformFee: Number(platformFee),
          proMembershipPrice: Number(proMembershipPrice),
          campaignBoostPrice: Number(campaignBoostPrice),
          featuredSlotPrice: Number(featuredSlotPrice),
          enableAIAssistant: featAchievements,
          enableEscrowSystem: featWallet,
          maintenanceMode,
          enableEmail,
          enableSMS,
          razorpayKeyId, razorpaySecret, razorpayMode,
          resendApiKey, emailFrom,
          smsProvider, fast2smsKey, twilioSid, twilioToken, twilioPhone
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');
      toast('✅ Platform settings saved! Changes are live immediately.', 'success');
      fetchData();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleCreateCreator = async (e) => {
    e.preventDefault();
    if (!creEmail || !crePassword || !creName || !creHandle) {
      return toast('Email, Password, Name, and Handle are required', 'error');
    }
    try {
      const nicheArr = creNiche.split(',').map(n => n.trim()).filter(Boolean);
      const platArr = crePlatform.split(',').map(p => p.trim()).filter(Boolean);
      const res = await fetch(`${API_BASE}/admin/creators`, {
        method: 'POST',
        headers: H(),
        body: JSON.stringify({
          email: creEmail,
          password: crePassword,
          name: creName,
          handle: creHandle,
          phone: crePhone || null,
          city: creCity || null,
          state: creState || null,
          niche: nicheArr,
          platform: platArr,
          followers: Number(creFollowers) || 0,
          rateMin: Number(creRateMin) || 0,
          rateMax: Number(creRateMax) || 0
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create creator account');
      toast('Creator account created successfully!', 'success');
      setCreateCreatorModalOpen(false);
      clearCreatorForm();
      fetchData();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const clearCreatorForm = () => {
    setCreEmail('');
    setCrePassword('');
    setCreName('');
    setCreHandle('');
    setCrePhone('');
    setCreCity('');
    setCreState('');
    setCreFollowers(0);
    setCreNiche('');
    setCrePlatform('');
    setCreRateMin(0);
    setCreRateMax(0);
  };

  const handleCreateBrand = async (e) => {
    e.preventDefault();
    if (!brandEmail || !brandPassword || !brandCompanyName) {
      return toast('Email, Password, and Company Name are required', 'error');
    }
    try {
      const res = await fetch(`${API_BASE}/admin/brands`, {
        method: 'POST',
        headers: H(),
        body: JSON.stringify({
          email: brandEmail,
          password: brandPassword,
          companyName: brandCompanyName,
          industry: brandIndustry || null,
          website: brandWebsite || null,
          phone: brandPhone || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create brand account');
      toast('Brand account created successfully!', 'success');
      setCreateBrandModalOpen(false);
      clearBrandForm();
      fetchData();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const clearBrandForm = () => {
    setBrandEmail('');
    setBrandPassword('');
    setBrandCompanyName('');
    setBrandIndustry('');
    setBrandWebsite('');
    setBrandPhone('');
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!campBrandId || !campTitle || !campDesc) {
      return toast('Brand, Title, and Description are required', 'error');
    }
    try {
      const nicheArr = campNiche.split(',').map(n => n.trim()).filter(Boolean);
      const platArr = campPlatform.split(',').map(p => p.trim()).filter(Boolean);
      const res = await fetch(`${API_BASE}/admin/campaigns`, {
        method: 'POST',
        headers: H(),
        body: JSON.stringify({
          brandId: campBrandId,
          title: campTitle,
          description: campDesc,
          budget: Number(campBudget) || 0,
          platform: platArr,
          niche: nicheArr,
          status: campStatus
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create campaign');
      toast('Campaign created successfully!', 'success');
      setCreateCampaignModalOpen(false);
      clearCampaignForm();
      fetchData();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const clearCampaignForm = () => {
    setCampBrandId('');
    setCampTitle('');
    setCampDesc('');
    setCampBudget(0);
    setCampPlatform('');
    setCampNiche('');
    setCampStatus('ACTIVE');
  };

  const handlePaymentOverride = async (paymentId, action) => {
    try {
      const res = await fetch(`${API_BASE}/admin/payments/override`, {
        method: 'POST', headers: H(), body: JSON.stringify({ paymentId, action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast(data.message, 'success');
      fetchData();
    } catch (err) { toast(err.message, 'error'); }
  };

  const handleUpdateAppStatus = async (appId, status) => {
    try {
      const res = await fetch(`${API_BASE}/admin/applications/${appId}/status`, {
        method: 'POST', headers: H(), body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast(`Status updated to ${status}`, 'success');
      setCampaignApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      setAllApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    } catch (err) { toast(err.message, 'error'); }
  };

  const handleToggleExpand = async (campaignId) => {
    if (expandedCampaignId === campaignId) { setExpandedCampaignId(null); return; }
    setExpandedCampaignId(campaignId); setCampaignApplications([]); setAppsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/campaigns/${campaignId}/applications`, { headers: H() });
      const data = await res.json();
      if (res.ok) setCampaignApplications(Array.isArray(data) ? data : []);
      else toast(data.error || 'Failed to fetch applications', 'error');
    } catch { toast('Failed to fetch applications', 'error'); }
    finally { setAppsLoading(false); }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Delete this blog article permanently?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/blogs/${blogId}`, { method: 'DELETE', headers: H() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast('Blog deleted successfully', 'success');
      fetchData();
    } catch (err) { toast(err.message, 'error'); }
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (!blogTitle || !blogSlug || !blogBody) return toast('Title, Slug, Body are required', 'error');
    try {
      const payload = {
        title: blogTitle.trim(), slug: blogSlug.trim(), category: blogCategory,
        excerpt: blogExcerpt.trim(), body: blogBody.trim(), author: blogAuthor.trim(),
        image: blogImage || 'https://images.unsplash.com/photo-1546074177-ffedd79d494d?q=80&w=600',
        tags: blogTags.split(',').map(t => t.trim()).filter(Boolean),
        featured: blogFeatured, published: blogPublished
      };
      const url = editingBlog ? `${API_BASE}/admin/blogs/${editingBlog.id}` : `${API_BASE}/admin/blogs`;
      const method = editingBlog ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: H(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast(editingBlog ? 'Blog updated!' : 'Blog created!', 'success');
      setBlogModalOpen(false); setEditingBlog(null); clearBlogForm(); fetchData();
    } catch (err) { toast(err.message, 'error'); }
  };

  const clearBlogForm = () => {
    setBlogTitle(''); setBlogSlug(''); setBlogCategory('Marketing'); setBlogExcerpt('');
    setBlogBody(''); setBlogAuthor('CB Editorial'); setBlogImage(''); setBlogTags('');
    setBlogFeatured(false); setBlogPublished(false);
  };

  const openEditBlog = (blog) => {
    setEditingBlog(blog); setBlogTitle(blog.title); setBlogSlug(blog.slug);
    setBlogCategory(blog.category); setBlogExcerpt(blog.excerpt || ''); setBlogBody(blog.body);
    setBlogAuthor(blog.author); setBlogImage(blog.image || '');
    setBlogTags(blog.tags?.join(', ') || ''); setBlogFeatured(blog.featured); setBlogPublished(blog.published);
    setBlogModalOpen(true);
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm('Delete this gallery item permanently?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/gallery/${id}`, { method: 'DELETE', headers: H() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast('Gallery item deleted successfully', 'success');
      fetchData();
    } catch (err) { toast(err.message, 'error'); }
  };

  const handleSaveGallery = async (e) => {
    e.preventDefault();
    if (!galTitle || !galCategory || !galType || !galThumbnail) {
      return toast('Title, Category, Type, and Thumbnail are required', 'error');
    }
    try {
      const payload = {
        title: galTitle.trim(),
        description: galDesc.trim(),
        category: galCategory,
        type: galType,
        date: galDate.trim() || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        location: galLocation.trim(),
        thumbnail: galThumbnail.trim(),
        videoUrl: galVideoUrl.trim() || null,
        duration: galDuration.trim() || null,
        tags: galTags.split(',').map(t => t.trim()).filter(Boolean)
      };
      const url = editingGallery ? `${API_BASE}/admin/gallery/${editingGallery.id}` : `${API_BASE}/admin/gallery`;
      const method = editingGallery ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: H(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast(editingGallery ? 'Gallery item updated!' : 'Gallery item created!', 'success');
      setGalleryModalOpen(false); setEditingGallery(null); clearGalleryForm(); fetchData();
    } catch (err) { toast(err.message, 'error'); }
  };

  const clearGalleryForm = () => {
    setGalTitle(''); setGalDesc(''); setGalCategory('Summits'); setGalType('photo');
    setGalDate(''); setGalLocation(''); setGalThumbnail(''); setGalVideoUrl('');
    setGalDuration(''); setGalTags('');
  };

  const openEditGallery = (item) => {
    setEditingGallery(item);
    setGalTitle(item.title);
    setGalDesc(item.description || '');
    setGalCategory(item.category);
    setGalType(item.type);
    setGalDate(item.date || '');
    setGalLocation(item.location || '');
    setGalThumbnail(item.thumbnail);
    setGalVideoUrl(item.videoUrl || '');
    setGalDuration(item.duration || '');
    setGalTags(item.tags?.join(', ') || '');
    setGalleryModalOpen(true);
  };

  const handleDeleteUpload = async (filename) => {
    if (!window.confirm(`Delete this file permanently? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE}/uploads/${filename}`, {
        method: 'DELETE',
        headers: H()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete file');
      toast('File deleted successfully', 'success');
      fetchData();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleSavePodcast = async (e) => {
    e.preventDefault();
    if (!podCreatorId || !podTitle || !podDuration) {
      return toast('Creator, Title, and Duration are required', 'error');
    }
    try {
      const payload = {
        creatorId: podCreatorId,
        title: podTitle.trim(),
        description: podDesc.trim() || null,
        duration: podDuration.trim(),
        thumbnail: podThumbnail.trim() || null,
        audioUrl: podAudioUrl.trim() || null,
        videoUrl: podVideoUrl.trim() || null,
        published: podPublished
      };

      const url = editingPodcast ? `${API_BASE}/admin/podcasts/${editingPodcast.id}` : `${API_BASE}/admin/podcasts`;
      const method = editingPodcast ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: H(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast(editingPodcast ? 'Podcast episode updated!' : 'Podcast episode created!', 'success');
      setPodcastModalOpen(false);
      setEditingPodcast(null);
      clearPodcastForm();
      fetchData();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const clearPodcastForm = () => {
    setPodCreatorId('');
    setPodTitle('');
    setPodDesc('');
    setPodDuration('');
    setPodThumbnail('');
    setPodAudioUrl('');
    setPodVideoUrl('');
    setPodPublished(false);
  };

  const openEditPodcast = (pod) => {
    setEditingPodcast(pod);
    setPodCreatorId(pod.creatorId);
    setPodTitle(pod.title);
    setPodDesc(pod.description || '');
    setPodDuration(pod.duration);
    setPodThumbnail(pod.thumbnail || '');
    setPodAudioUrl(pod.audioUrl || '');
    setPodVideoUrl(pod.videoUrl || '');
    setPodPublished(pod.published);
    setPodcastModalOpen(true);
  };

  const handleDeleteComment = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/comments/${id}`, { method: 'DELETE', headers: H() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast('Comment deleted', 'success'); fetchData();
    } catch (err) { toast(err.message, 'error'); }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this review? Permanent.')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/reviews/${id}`, { method: 'DELETE', headers: H() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast('Review removed', 'success'); fetchData();
    } catch (err) { toast(err.message, 'error'); }
  };

  const handleDeleteSubscriber = async (id) => {
    if (!window.confirm('Remove subscriber?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/newsletters/${id}`, { method: 'DELETE', headers: H() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast('Subscriber removed', 'success'); fetchData();
    } catch (err) { toast(err.message, 'error'); }
  };

  const handleToggleContactRead = async (id) => {
    try {
      await fetch(`${API_BASE}/admin/contacts/${id}/read`, { method: 'PUT', headers: H() });
      fetchData();
    } catch { }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/contacts/${id}`, { method: 'DELETE', headers: H() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast('Message deleted', 'success'); fetchData();
    } catch (err) { toast(err.message, 'error'); }
  };

  const handleTogglePodcast = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/admin/podcasts/toggle/${id}`, { method: 'POST', headers: H() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast(data.message, 'success'); fetchData();
    } catch (err) { toast(err.message, 'error'); }
  };

  const handleDeletePodcast = async (id) => {
    if (!window.confirm('Delete this podcast episode?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/podcasts/${id}`, { method: 'DELETE', headers: H() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast('Podcast deleted', 'success'); fetchData();
    } catch (err) { toast(err.message, 'error'); }
  };

  const handleFetchWallet = async (creator) => {
    setSelectedWalletCreator(creator); setWalletTxns([]); setWalletLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/creators/${creator.id}/transactions`, { headers: H() });
      const data = await res.json();
      if (res.ok) setWalletTxns(Array.isArray(data) ? data : []);
      else toast(data.error || 'Failed to fetch transactions', 'error');
    } catch { toast('Failed to fetch wallet data', 'error'); }
    finally { setWalletLoading(false); }
  };

  const handleAdjustScore = async () => {
    if (!scoreModal || !scoreInput) return toast('Score value is required', 'error');
    try {
      const res = await fetch(`${API_BASE}/admin/creators/${scoreModal.creator.id}/score`, {
        method: 'POST', headers: H(), body: JSON.stringify({ score: Number(scoreInput), reason: scoreReason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast(data.message, 'success');
      setScoreModal(null); setScoreInput(''); setScoreReason('');
      fetchData();
    } catch (err) { toast(err.message, 'error'); }
  };

  // ─── Computed Counts ─────────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    creators: creators.length,
    brands: brands.length,
    campaigns: campaigns.length,
    payments: payments.length,
    pendingVerifications: verifications.length,
    blogs: blogs.length,
    newsletters: newsletters.length,
    reviews: reviews.length,
    comments: comments.length,
    podcasts: podcasts.length,
    applications: allApplications.length,
    unreadContacts: contacts.filter(c => !c.read).length,
    gallery: gallery.length,
    uploads: uploads.length,
    pendingAmbassadors: ambassadors.filter(a => a.status === 'PENDING').length,
    pendingMissions: missionCompletions.filter(c => c.status === 'PENDING').length,
  }), [creators, brands, campaigns, payments, verifications, blogs, newsletters, reviews, comments, podcasts, allApplications, contacts, gallery, uploads, ambassadors, missionCompletions]);

  const filteredGallery = useMemo(() => gallery.filter(g =>
    `${g.title} ${g.category} ${g.location || ''} ${(g.tags || []).join(' ')}`.toLowerCase().includes(gallerySearch.toLowerCase())
  ), [gallery, gallerySearch]);

  const filteredUploads = useMemo(() => uploads.filter(u =>
    `${u.name}`.toLowerCase().includes(mediaSearch.toLowerCase())
  ), [uploads, mediaSearch]);

  // ─── Filter Helpers ───────────────────────────────────────────────────────────
  const filteredCreators = useMemo(() => (creators || []).filter(c =>
    c && `${c.name || ''} ${c.handle || ''} ${c.city || ''}`.toLowerCase().includes((creatorSearch || '').toLowerCase())
  ), [creators, creatorSearch]);

  const filteredBrands = useMemo(() => brands.filter(b =>
    `${b.companyName} ${b.industry || ''}`.toLowerCase().includes(brandSearch.toLowerCase())
  ), [brands, brandSearch]);

  const filteredCampaigns = useMemo(() => campaigns.filter(c =>
    `${c.title} ${c.brand?.companyName || ''}`.toLowerCase().includes(campaignSearch.toLowerCase())
  ), [campaigns, campaignSearch]);

  const filteredPayments = useMemo(() => payments.filter(p =>
    `${p.type} ${p.razorpayId || ''} ${p.status}`.toLowerCase().includes(paymentSearch.toLowerCase())
  ), [payments, paymentSearch]);

  const filteredBlogs = useMemo(() => blogs.filter(b =>
    `${b.title} ${b.category} ${b.author}`.toLowerCase().includes(blogSearch.toLowerCase())
  ), [blogs, blogSearch]);

  const filteredComments = useMemo(() => comments.filter(c =>
    `${c.content || ''} ${c.authorName || ''} ${c.blog?.title || ''}`.toLowerCase().includes(commentSearch.toLowerCase())
  ), [comments, commentSearch]);

  const filteredNewsletters = useMemo(() => newsletters.filter(n =>
    `${n.email || ''}`.toLowerCase().includes(newsletterSearch.toLowerCase())
  ), [newsletters, newsletterSearch]);

  const filteredContacts = useMemo(() => contacts.filter(c =>
    `${c.name || ''} ${c.email || ''} ${c.message || ''}`.toLowerCase().includes(contactSearch.toLowerCase())
  ), [contacts, contactSearch]);

  const filteredApps = useMemo(() => allApplications.filter(a =>
    `${a.creator?.name || ''} ${a.campaign?.title || ''} ${a.status}`.toLowerCase().includes(appSearch.toLowerCase())
  ), [allApplications, appSearch]);

  const filteredLeaderboard = useMemo(() => leaderboard.filter(c =>
    `${c.name} ${c.handle}`.toLowerCase().includes(leaderSearch.toLowerCase())
  ), [leaderboard, leaderSearch]);

  const filteredBrandAnalytics = useMemo(() => brandAnalytics.filter(b =>
    `${b.companyName} ${b.industry || ''}`.toLowerCase().includes(brandAnalyticSearch.toLowerCase())
  ), [brandAnalytics, brandAnalyticSearch]);

  // ─── SVG Chart Helper ─────────────────────────────────────────────────────────
  const genPoints = (data, key, maxVal, w, h) => {
    if (data.length < 2) return '';
    const step = w / (data.length - 1);
    return data.map((d, i) => {
      const x = i * step;
      const y = h - ((d[key] || 0) / maxVal) * (h - 20) - 10;
      return `${x},${y}`;
    }).join(' ');
  };

  // ─── TEAM MEMBER REGISTRATION FROM INVITATION ──────────────────────────────────
  const searchParams = new URLSearchParams(window.location.search);
  const inviteToken = searchParams.get('token');
  const inviteEmail = searchParams.get('email');
  const isInviteMode = window.location.pathname === '/register-team' || (inviteToken && inviteEmail);

  const handleRegisterTeam = async (e) => {
    e.preventDefault();
    if (!inviteName || !invitePassword || !inviteConfirmPassword) {
      return setInviteError('All fields are required.');
    }
    if (invitePassword !== inviteConfirmPassword) {
      return setInviteError('Passwords do not match.');
    }
    if (invitePassword.length < 6) {
      return setInviteError('Password must be at least 6 characters.');
    }
    setInviteLoading(true);
    setInviteError('');
    try {
      const res = await fetch(`${API_BASE}/admin/team/register-team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          password: invitePassword,
          name: inviteName,
          token: inviteToken
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      // F-02: Route through AdminApi.setToken (sessionStorage by default, no cross-session persistence)
      AdminApi.setToken(data.token, false);
      setToken(data.token);
      setAdminUser(data.user);
      
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      
      toast('Welcome to the CreatorBharat Admin Team! 🎉', 'success');
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  if (isInviteMode && !token) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'radial-gradient(circle at 10% 20%, #0f172a 0%, #1e1b4b 90%)', padding: 16, fontFamily: 'Outfit, system-ui, sans-serif', position: 'relative', overflow: 'hidden' }}>
        {/* Glow Blobs */}
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(249, 115, 22, 0.12)', filter: 'blur(80px)', top: '10%', left: '15%' }} />
        <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.12)', filter: 'blur(80px)', bottom: '15%', right: '10%' }} />

        <div style={{ width: '100%', maxWidth: 460, background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 28, padding: '48px 40px', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', position: 'relative', zIndex: 10 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ width: 68, height: 68, borderRadius: 20, background: 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950, fontSize: 28, color: '#fff', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(249,115,22,0.3)' }}>CB</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 6px', color: '#fff', letterSpacing: -0.5 }}>Join the Admin Team</h2>
            <p style={{ margin: 0, fontSize: 10, color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800 }}>Complete Your Registration</p>
          </div>

          {inviteError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <AlertTriangle size={16} />{inviteError}
            </div>
          )}

          <form onSubmit={handleRegisterTeam} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'rgba(255, 255, 255, 0.6)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Invitation Email</label>
              <input type="email" value={inviteEmail || ''} disabled style={{ width: '100%', padding: '13px 14px', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(15, 23, 42, 0.6)', color: 'rgba(255,255,255,0.5)', fontSize: 14, outline: 'none', boxSizing: 'border-box', cursor: 'not-allowed' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'rgba(255, 255, 255, 0.6)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Full Name</label>
              <input type="text" value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Amit Verma" required style={{ width: '100%', padding: '13px 14px', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(15, 23, 42, 0.4)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'rgba(255, 255, 255, 0.6)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Set Password</label>
              <input type="password" value={invitePassword} onChange={e => setInvitePassword(e.target.value)} placeholder="••••••••" required style={{ width: '100%', padding: '13px 14px', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(15, 23, 42, 0.4)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'rgba(255, 255, 255, 0.6)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Confirm Password</label>
              <input type="password" value={inviteConfirmPassword} onChange={e => setInviteConfirmPassword(e.target.value)} placeholder="••••••••" required style={{ width: '100%', padding: '13px 14px', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(15, 23, 42, 0.4)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={inviteLoading} style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', border: 'none', padding: '14px', borderRadius: 12, fontWeight: 900, fontSize: 14, cursor: inviteLoading ? 'not-allowed' : 'pointer', opacity: inviteLoading ? 0.7 : 1, boxShadow: '0 8px 24px rgba(249,115,22,0.25)', marginTop: 6 }}>
              {inviteLoading ? '⌛ Creating Account...' : '🚀 Create Admin Profile'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'radial-gradient(circle at 10% 20%, #0f172a 0%, #1e1b4b 90%)', padding: 16, fontFamily: 'Outfit, system-ui, sans-serif', position: 'relative', overflow: 'hidden' }}>
        
        {/* Glow Blobs */}
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(249, 115, 22, 0.12)', filter: 'blur(80px)', top: '10%', left: '15%' }} />
        <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.12)', filter: 'blur(80px)', bottom: '15%', right: '10%' }} />

        <div style={{ width: '100%', maxWidth: 440, background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 28, padding: '48px 40px', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', position: 'relative', zIndex: 10 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ width: 68, height: 68, borderRadius: 20, background: 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950, fontSize: 28, color: '#fff', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(249,115,22,0.3)' }}>CB</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 6px', color: '#fff', letterSpacing: -0.5 }}>Admin Control Panel</h2>
            <p style={{ margin: 0, fontSize: 10, color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 800 }}>Restricted Gateway</p>
          </div>
          
          {authError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <AlertTriangle size={16} />{authError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'rgba(255, 255, 255, 0.6)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Admin Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@creatorbharat.com" required style={{ width: '100%', padding: '13px 14px 13px 44px', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(15, 23, 42, 0.4)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'rgba(255, 255, 255, 0.6)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }} />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ width: '100%', padding: '13px 44px 13px 44px', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(15, 23, 42, 0.4)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Eye size={16} style={{ color: showPassword ? '#f97316' : 'rgba(255, 255, 255, 0.4)' }} />
                </button>
              </div>
            </div>
            <button type="submit" disabled={authLoading} style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', border: 'none', padding: '14px', borderRadius: 12, fontWeight: 900, fontSize: 14, cursor: authLoading ? 'not-allowed' : 'pointer', opacity: authLoading ? 0.7 : 1, boxShadow: '0 8px 24px rgba(249,115,22,0.25)', marginTop: 6 }}>
              {authLoading ? '⌛ Authorizing Gateway...' : '🔑 Access Secure Dashboard'}
            </button>
          </form>
          <div style={{ marginTop: 24, padding: 14, background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.15)', borderRadius: 12, fontSize: 11, color: '#f97316', fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            🛡️ Restricted to authorized administrators only
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN DASHBOARD LAYOUT ────────────────────────────────────────────────────
  const chartData = stats?.chartData || [];
  const maxUser = Math.max(...chartData.map(d => d.userCount || 0), 1);
  const maxEscrow = Math.max(...chartData.map(d => d.escrowVolume || 0), 1);

  const meta = TAB_META[activeTab] || { title: activeTab, sub: '' };

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      counts={counts}
      fetchData={fetchData}
      dataLoading={dataLoading}
      handleLogout={handleLogout}
      adminUser={adminUser}
      FRONTEND_URL={FRONTEND_URL}
      toasts={toasts}
      dismissToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
    >
      {/* ══ DASHBOARD ══════════════════════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <DashboardSection
              deepStats={deepStats}
              creators={creators}
              brands={brands}
              campaigns={campaigns}
              verifications={verifications}
              stats={stats}
              allApplications={allApplications}
              blogs={blogs}
              counts={counts}
              chartData={chartData}
              maxUser={maxUser}
              maxEscrow={maxEscrow}
              hoveredPoint={hoveredPoint}
              setHoveredPoint={setHoveredPoint}
              genPoints={genPoints}
              activityLog={activityLog}
              maintenanceMode={maintenanceMode}
              setMaintenanceMode={setMaintenanceMode}
              token={token}
              toast={toast}
              setActiveTab={setActiveTab}
              setSelectedCreator={setSelectedCreator}
              setDrawerOpen={setDrawerOpen}
              handleSendTestEmail={handleSendTestEmail}
              handleSyncCheck={handleSyncCheck}
              handleClearCache={handleClearCache}
              fetchData={fetchData}
            />
          )}

          {/* ══ AUDIT LOGS ═════════════════════════════════════════════════ */}
          {activeTab === 'audit-logs' && (
            <AuditLogsSection />
          )}























                        




                        




























































          {['activity', 'podcasts', 'events', 'ambassadors', 'missions', 'admin-notifications', 'comments', 'newsletters', 'contacts'].includes(activeTab) && (
            <EngagementSection
              activeTab={activeTab}
              counts={counts}
              fetchData={fetchData}
              toast={toast}
              token={token}
              API_BASE={API_BASE}
              activityLog={activityLog}
              podcasts={podcasts}
              clearPodcastForm={clearPodcastForm}
              setEditingPodcast={setEditingPodcast}
              setPodcastModalOpen={setPodcastModalOpen}
              openEditPodcast={openEditPodcast}
              handleTogglePodcast={handleTogglePodcast}
              handleDeletePodcast={handleDeletePodcast}
              events={events}
              setEditingEvent={setEditingEvent}
              setEvtTitle={setEvtTitle}
              setEvtDescription={setEvtDescription}
              setEvtDate={setEvtDate}
              setEvtLocation={setEvtLocation}
              setEvtLink={setEvtLink}
              setEvtImage={setEvtImage}
              setEventModalOpen={setEventModalOpen}
              ambassadors={ambassadors}
              missions={missions}
              setEditingMission={setEditingMission}
              setMisTitle={setMisTitle}
              setMisDescription={setMisDescription}
              setMisReward={setMisReward}
              setMisRewardColor={setMisRewardColor}
              setMisDeadline={setMisDeadline}
              setMisSteps={setMisSteps}
              setMisActive={setMisActive}
              setMissionModalOpen={setMissionModalOpen}
              missionCompletions={missionCompletions}
              notifTargetGroup={notifTargetGroup}
              setNotifTargetGroup={setNotifTargetGroup}
              setNotifUserId={setNotifUserId}
              notifUserId={notifUserId}
              creators={creators}
              brands={brands}
              notifType={notifType}
              setNotifType={setNotifType}
              notifTitle={notifTitle}
              setNotifTitle={setNotifTitle}
              notifBody={notifBody}
              setNotifBody={setNotifBody}
              notifLink={notifLink}
              setNotifLink={setNotifLink}
              handleSendPlatformNotification={handleSendPlatformNotification}
              comments={comments}
              commentSearch={commentSearch}
              setCommentSearch={setCommentSearch}
              filteredComments={filteredComments}
              handleDeleteComment={handleDeleteComment}
              newsletters={newsletters}
              newsletterSearch={newsletterSearch}
              setNewsletterSearch={setNewsletterSearch}
              filteredNewsletters={filteredNewsletters}
              handleDeleteSubscriber={handleDeleteSubscriber}
              contacts={contacts}
              contactSearch={contactSearch}
              setContactSearch={setContactSearch}
              filteredContacts={filteredContacts}
              handleToggleContactRead={handleToggleContactRead}
              handleDeleteContact={handleDeleteContact}
            />
          )}

          {/* ══ VERIFICATIONS ══════════════════════════════════════════════ */}
          {activeTab === 'verifications' && (
            <KycSection
              verifications={verifications}
              setSelectedCreator={setSelectedCreator}
              setDrawerOpen={setDrawerOpen}
            />
          )}

          {['creators', 'creator-wallets', 'creator-score', 'creator-achievements', 'creator-reviews', 'leaderboard'].includes(activeTab) && (
            <CreatorsSection
              activeTab={activeTab}
              creators={creators}
              filteredCreators={filteredCreators}
              creatorSearch={creatorSearch}
              setCreatorSearch={setCreatorSearch}
              clearCreatorForm={clearCreatorForm}
              setCreateCreatorModalOpen={setCreateCreatorModalOpen}
              setEditingCreator={setEditingCreator}
              setEditCreName={setEditCreName}
              setEditCreHandle={setEditCreHandle}
              setEditCreBio={setEditCreBio}
              setEditCreCity={setEditCreCity}
              setEditCreState={setEditCreState}
              setEditCreFollowers={setEditCreFollowers}
              setEditCreEngagementRate={setEditCreEngagementRate}
              setEditCreRateMin={setEditCreRateMin}
              setEditCreRateMax={setEditCreRateMax}
              setEditCrePhoto={setEditCrePhoto}
              setEditCreCoverImage={setEditCreCoverImage}
              setEditCreNiche={setEditCreNiche}
              setEditCrePlatform={setEditCrePlatform}
              setEditCreStatus={setEditCreStatus}
              setEditCreIsVerified={setEditCreIsVerified}
              setEditCreIsPro={setEditCreIsPro}
              setEditCreAadhaarUrl={setEditCreAadhaarUrl}
              setEditCrePanUrl={setEditCrePanUrl}
              setEditCreatorModalOpen={setEditCreatorModalOpen}
              handleFetchWallet={handleFetchWallet}
              setScoreModal={setScoreModal}
              setScoreInput={setScoreInput}
              setScoreReason={setScoreReason}
              handleToggleSuspension={handleToggleSuspension}
              handleDeleteCreator={handleDeleteCreator}
              selectedWalletCreator={selectedWalletCreator}
              setSelectedWalletCreator={setSelectedWalletCreator}
              walletTxns={walletTxns}
              setWalletTxns={setWalletTxns}
              walletLoading={walletLoading}
              setAchCreatorId={setAchCreatorId}
              setAchType={setAchType}
              setAchTitle={setAchTitle}
              setAchDescription={setAchDescription}
              setGrantAchModalOpen={setGrantAchModalOpen}
              reviews={reviews}
              handleDeleteReview={handleDeleteReview}
              leaderboard={leaderboard}
              fetchData={fetchData}
              leaderSearch={leaderSearch}
              setLeaderSearch={setLeaderSearch}
              filteredLeaderboard={filteredLeaderboard}
            />
          )}


          {['brands', 'campaigns', 'applications', 'brand-analytics', 'escrows'].includes(activeTab) && (
            <BrandsSection
              activeTab={activeTab}
              brands={brands}
              clearBrandForm={clearBrandForm}
              setCreateBrandModalOpen={setCreateBrandModalOpen}
              brandSearch={brandSearch}
              setBrandSearch={setBrandSearch}
              filteredBrands={filteredBrands}
              setEditingBrand={setEditingBrand}
              setEditBrandName={setEditBrandName}
              setEditBrandIndustry={setEditBrandIndustry}
              setEditBrandWebsite={setEditBrandWebsite}
              setEditBrandModalOpen={setEditBrandModalOpen}
              setSelectedBrand={setSelectedBrand}
              setBrandDrawerOpen={setBrandDrawerOpen}
              handleToggleSuspension={handleToggleSuspension}
              handleDeleteBrand={handleDeleteBrand}
              campaigns={campaigns}
              clearCampaignForm={clearCampaignForm}
              setCreateCampaignModalOpen={setCreateCampaignModalOpen}
              campaignSearch={campaignSearch}
              setCampaignSearch={setCampaignSearch}
              filteredCampaigns={filteredCampaigns}
              expandedCampaignId={expandedCampaignId}
              handleToggleExpand={handleToggleExpand}
              setEditingCampaign={setEditingCampaign}
              setEditCampTitle={setEditCampTitle}
              setEditCampDesc={setEditCampDesc}
              setEditCampBudget={setEditCampBudget}
              setEditCampPlatform={setEditCampPlatform}
              setEditCampNiche={setEditCampNiche}
              setEditCampStatus={setEditCampStatus}
              setEditCampaignModalOpen={setEditCampaignModalOpen}
              handleDeleteCampaign={handleDeleteCampaign}
              appsLoading={appsLoading}
              campaignApplications={campaignApplications}
              handleUpdateAppStatus={handleUpdateAppStatus}
              allApplications={allApplications}
              appSearch={appSearch}
              setAppSearch={setAppSearch}
              filteredApps={filteredApps}
              brandAnalytics={brandAnalytics}
              brandAnalyticSearch={brandAnalyticSearch}
              setBrandAnalyticSearch={setBrandAnalyticSearch}
              filteredBrandAnalytics={filteredBrandAnalytics}
              setActiveTab={setActiveTab}
              payments={payments}
              paymentSearch={paymentSearch}
              setPaymentSearch={setPaymentSearch}
              filteredPayments={filteredPayments}
              handlePaymentOverride={handlePaymentOverride}
            />
          )}

          {/* ══ BLOGS ══════════════════════════════════════════════════════ */}
          {['pages', 'blogs', 'media-library', 'gallery'].includes(activeTab) && (
            <CmsSection
              activeTab={activeTab}
              mob={mob}
              toast={toast}
              FRONTEND_URL={FRONTEND_URL}
              blogs={blogs}
              blogSearch={blogSearch}
              setBlogSearch={setBlogSearch}
              filteredBlogs={filteredBlogs}
              clearBlogForm={clearBlogForm}
              setEditingBlog={setEditingBlog}
              setBlogModalOpen={setBlogModalOpen}
              openEditBlog={openEditBlog}
              handleDeleteBlog={handleDeleteBlog}
              uploads={uploads}
              mediaSearch={mediaSearch}
              setMediaSearch={setMediaSearch}
              filteredUploads={filteredUploads}
              handleUploadMedia={handleUploadMedia}
              handleDeleteUpload={handleDeleteUpload}
              fetchData={fetchData}
              gallery={gallery}
              gallerySearch={gallerySearch}
              setGallerySearch={setGallerySearch}
              filteredGallery={filteredGallery}
              clearGalleryForm={clearGalleryForm}
              setEditingGallery={setEditingGallery}
              setGalleryModalOpen={setGalleryModalOpen}
              openEditGallery={openEditGallery}
              handleDeleteGallery={handleDeleteGallery}
              selectedPageName={selectedPageName}
              setSelectedPageName={setSelectedPageName}
              editorMode={editorMode}
              setEditorMode={setEditorMode}
              rawJsonText={rawJsonText}
              setRawJsonText={setRawJsonText}
              jsonError={jsonError}
              setJsonError={setJsonError}
              handleToggleMode={handleToggleMode}
              handleSavePageConfig={handleSavePageConfig}
              homeConfig={homeConfig}
              setHomeConfig={setHomeConfig}
              pricingConfig={pricingConfig}
              setPricingConfig={setPricingConfig}
              calculatorConfig={calculatorConfig}
              setCalculatorConfig={setCalculatorConfig}
              faqsList={faqsList}
              setFaqsList={setFaqsList}
              aboutConfig={aboutConfig}
              setAboutConfig={setAboutConfig}
              aboutSubTab={aboutSubTab}
              setAboutSubTab={setAboutSubTab}
              pressList={pressList}
              setPressList={setPressList}
              storiesList={storiesList}
              setStoriesList={setStoriesList}
              aiFaqList={aiFaqList}
              setAiFaqList={setAiFaqList}
              notificationsList={notificationsList}
              setNotificationsList={setNotificationsList}
              officialConfig={officialConfig}
              setOfficialConfig={setOfficialConfig}
              officialSubTab={officialSubTab}
              setOfficialSubTab={setOfficialSubTab}
              verifyGuideConfig={verifyGuideConfig}
              setVerifyGuideConfig={setVerifyGuideConfig}
              verifyGuideSubTab={verifyGuideSubTab}
              setVerifyGuideSubTab={setVerifyGuideSubTab}
              ambassadorConfig={ambassadorConfig}
              setAmbassadorConfig={setAmbassadorConfig}
              ambassadorSubTab={ambassadorSubTab}
              setAmbassadorSubTab={setAmbassadorSubTab}
              contactConfig={contactConfig}
              setContactConfig={setContactConfig}
              contactSubTab={contactSubTab}
              setContactSubTab={setContactSubTab}
              creatorLandingConfig={creatorLandingConfig}
              setCreatorLandingConfig={setCreatorLandingConfig}
              brandLandingConfig={brandLandingConfig}
              setBrandLandingConfig={setBrandLandingConfig}
            />
          )}


          {/* ══ SYSTEM CONTROL SECTION ═══════════════════════════════════ */}
          {['settings', 'danger', 'feature-control', 'admin-control'].includes(activeTab) && (
            <SystemControlSection
              activeTab={activeTab}
              mob={mob}
              toast={toast}
              token={token}
              API_BASE={API_BASE}
              fetchData={fetchData}
              settingsTab={settingsTab}
              setSettingsTab={setSettingsTab}
              siteName={siteName}
              setSiteName={setSiteName}
              supportEmail={supportEmail}
              setSupportEmail={setSupportEmail}
              frontendUrl={frontendUrl}
              setFrontendUrl={setFrontendUrl}
              platformFee={platformFee}
              setPlatformFee={setPlatformFee}
              proMembershipPrice={proMembershipPrice}
              setProMembershipPrice={setProMembershipPrice}
              campaignBoostPrice={campaignBoostPrice}
              setCampaignBoostPrice={setCampaignBoostPrice}
              featuredSlotPrice={featuredSlotPrice}
              setFeaturedSlotPrice={setFeaturedSlotPrice}
              razorpayMode={razorpayMode}
              setRazorpayMode={setRazorpayMode}
              razorpayKeyId={razorpayKeyId}
              setRazorpayKeyId={setRazorpayKeyId}
              razorpaySecret={razorpaySecret}
              setRazorpaySecret={setRazorpaySecret}
              resendApiKey={resendApiKey}
              setResendApiKey={setResendApiKey}
              emailFrom={emailFrom}
              setEmailFrom={setEmailFrom}
              logoUrl={logoUrl}
              setLogoUrl={setLogoUrl}
              footerEmail={footerEmail}
              setFooterEmail={setFooterEmail}
              handleUploadFile={handleUploadFile}
              smsProvider={smsProvider}
              setSmsProvider={setSmsProvider}
              fast2smsKey={fast2smsKey}
              setFast2smsKey={setFast2smsKey}
              twilioSid={twilioSid}
              setTwilioSid={setTwilioSid}
              twilioToken={twilioToken}
              setTwilioToken={setTwilioToken}
              twilioPhone={twilioPhone}
              setTwilioPhone={setTwilioPhone}
              featAchievements={featAchievements}
              setFeatAchievements={setFeatAchievements}
              featWallet={featWallet}
              setFeatWallet={setFeatWallet}
              enableEmail={enableEmail}
              setEnableEmail={setEnableEmail}
              enableSMS={enableSMS}
              setEnableSMS={setEnableSMS}
              maintenanceMode={maintenanceMode}
              setMaintenanceMode={setMaintenanceMode}
              handleSaveSettings={handleSaveSettings}
              handleExportCSV={handleExportCSV}
              handleDangerOp={handleDangerOp}
              psSaving={psSaving}
              psSaved={psSaved}
              psLoading={psLoading}
              platformSettings={platformSettings}
              savePlatformSettings={savePlatformSettings}
              psSubTab={psSubTab}
              setPsSubTab={setPsSubTab}
              updatePS={updatePS}
              apSaving={apSaving}
              apSaved={apSaved}
              apLoading={apLoading}
              adminPanelSettings={adminPanelSettings}
              saveAdminPanelSettings={saveAdminPanelSettings}
              payments={payments}
              stats={stats}
              apSubTab={apSubTab}
              setApSubTab={setApSubTab}
              updateAP={updateAP}
              adminNewEmail={adminNewEmail}
              setAdminNewEmail={setAdminNewEmail}
              adminCurrentPassword={adminCurrentPassword}
              setAdminCurrentPassword={setAdminCurrentPassword}
              adminNewPassword={adminNewPassword}
              setAdminNewPassword={setAdminNewPassword}
              adminConfirmPassword={adminConfirmPassword}
              setAdminConfirmPassword={setAdminConfirmPassword}
              adminCredsUpdating={adminCredsUpdating}
              handleUpdateAdminCredentials={handleUpdateAdminCredentials}
              apDiagLoading={apDiagLoading}
              apDiagnostics={apDiagnostics}
              fetchDiagnostics={fetchDiagnostics}
              activityLog={activityLog}
              twoFAEnabled={twoFAEnabled}
              setTwoFAEnabled={setTwoFAEnabled}
              twoFAQrCode={twoFAQrCode}
              setTwoFAQrCode={setTwoFAQrCode}
              twoFASecret={twoFASecret}
              setTwoFASecret={setTwoFASecret}
              twoFACode={twoFACode}
              setTwoFACode={setTwoFACode}
              twoFALoading={twoFALoading}
              setTwoFALoading={setTwoFALoading}
              twoFAMessage={twoFAMessage}
              setTwoFAMessage={setTwoFAMessage}
              twoFAStep={twoFAStep}
              setTwoFAStep={setTwoFAStep}
            />
          )}

      {/* ══ BRAND DRAWER ═══════════════════════════════════════════════════ */}
      {brandDrawerOpen && selectedBrand && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={() => setBrandDrawerOpen(false)} style={{ flex: 1, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} />
          <div style={{ width: 420, background: T.card, display: 'flex', flexDirection: 'column', boxShadow: '-20px 0 60px rgba(0,0,0,0.12)', overflowY: 'auto' }}>
            <div style={{ padding: '24px 28px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 900, color: T.navy }}>{selectedBrand.companyName}</h3>
                <p style={{ margin: 0, fontSize: 12, color: T.muted }}>{selectedBrand.industry || 'Brand Account'}</p>
              </div>
              <button onClick={() => setBrandDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px 28px', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Company', value: selectedBrand.companyName },
                  { label: 'Industry', value: selectedBrand.industry || '—' },
                  { label: 'Email', value: selectedBrand.user?.email || '—' },
                  { label: 'Website', value: selectedBrand.website || '—' },
                  { label: 'Campaigns', value: selectedBrand._count?.campaigns || 0 },
                  { label: 'Status', value: selectedBrand.user?.isSuspended ? '⛔ Suspended' : '✓ Active' },
                  { label: 'Registered', value: fmtDate(selectedBrand.createdAt) },
                ].map((f, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{f.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{f.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '20px 28px', borderTop: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => { setActiveTab('campaigns'); setCampaignSearch(selectedBrand.companyName); setBrandDrawerOpen(false); }} style={{ padding: '11px', background: T.purpleLight, color: T.purple, border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>View Campaigns</button>
              <button onClick={() => handleToggleSuspension(selectedBrand.user?.id)} style={{ padding: '11px', background: T.redLight, color: T.red, border: `1px solid ${T.red}25`, borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                {selectedBrand.user?.isSuspended ? '↑ Unsuspend Brand' : '⛔ Suspend Brand Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminModals
        podcastModalOpen={podcastModalOpen}
        setPodcastModalOpen={setPodcastModalOpen}
        editingPodcast={editingPodcast}
        setEditingPodcast={setEditingPodcast}
        clearPodcastForm={clearPodcastForm}
        handleSavePodcast={handleSavePodcast}
        podCreatorId={podCreatorId}
        setPodCreatorId={setPodCreatorId}
        creators={creators}
        podTitle={podTitle}
        setPodTitle={setPodTitle}
        podDesc={podDesc}
        setPodDesc={setPodDesc}
        podDuration={podDuration}
        setPodDuration={setPodDuration}
        podThumbnail={podThumbnail}
        setPodThumbnail={setPodThumbnail}
        podAudioUrl={podAudioUrl}
        setPodAudioUrl={setPodAudioUrl}
        podVideoUrl={podVideoUrl}
        setPodVideoUrl={setPodVideoUrl}
        podPublished={podPublished}
        setPodPublished={setPodPublished}
        handleUploadMedia={handleUploadMedia}

        editCreatorModalOpen={editCreatorModalOpen}
        setEditCreatorModalOpen={setEditCreatorModalOpen}
        setEditingCreator={setEditingCreator}
        handleSaveCreator={handleSaveCreator}
        editCreName={editCreName}
        setEditCreName={setEditCreName}
        editCreHandle={editCreHandle}
        setEditCreHandle={setEditCreHandle}
        editCreBio={editCreBio}
        setEditCreBio={setEditCreBio}
        editCreCity={editCreCity}
        setEditCreCity={setEditCreCity}
        editCreState={editCreState}
        setEditCreState={setEditCreState}
        editCreFollowers={editCreFollowers}
        setEditCreFollowers={setEditCreFollowers}
        editCreRateMin={editCreRateMin}
        setEditCreRateMin={setEditCreRateMin}
        editCreRateMax={editCreRateMax}
        setEditCreRateMax={setEditCreRateMax}
        editCreNiche={editCreNiche}
        setEditCreNiche={setEditCreNiche}
        editCrePlatform={editCrePlatform}
        setEditCrePlatform={setEditCrePlatform}
        editCrePhoto={editCrePhoto}
        setEditCrePhoto={setEditCrePhoto}
        editCreCoverImage={editCreCoverImage}
        setEditCreCoverImage={setEditCreCoverImage}
        editCreAadhaarUrl={editCreAadhaarUrl}
        setEditCreAadhaarUrl={setEditCreAadhaarUrl}
        editCrePanUrl={editCrePanUrl}
        setEditCrePanUrl={setEditCrePanUrl}
        editCreStatus={editCreStatus}
        setEditCreStatus={setEditCreStatus}
        editCreIsVerified={editCreIsVerified}
        setEditCreIsVerified={setEditCreIsVerified}
        editCreIsPro={editCreIsPro}
        setEditCreIsPro={setEditCreIsPro}

        editBrandModalOpen={editBrandModalOpen}
        setEditBrandModalOpen={setEditBrandModalOpen}
        setEditingBrand={setEditingBrand}
        handleSaveBrand={handleSaveBrand}
        editBrandName={editBrandName}
        setEditBrandName={setEditBrandName}
        editBrandIndustry={editBrandIndustry}
        setEditBrandIndustry={setEditBrandIndustry}
        editBrandWebsite={editBrandWebsite}
        setEditBrandWebsite={setEditBrandWebsite}

        editCampaignModalOpen={editCampaignModalOpen}
        setEditCampaignModalOpen={setEditCampaignModalOpen}
        setEditingCampaign={setEditingCampaign}
        handleSaveCampaign={handleSaveCampaign}
        editCampTitle={editCampTitle}
        setEditCampTitle={setEditCampTitle}
        editCampBudget={editCampBudget}
        setEditCampBudget={setEditCampBudget}
        editCampDesc={editCampDesc}
        setEditCampDesc={setEditCampDesc}
        editCampPlatform={editCampPlatform}
        setEditCampPlatform={setEditCampPlatform}
        editCampNiche={editCampNiche}
        setEditCampNiche={setEditCampNiche}
        editCampStatus={editCampStatus}
        setEditCampStatus={setEditCampStatus}

        createCreatorModalOpen={createCreatorModalOpen}
        setCreateCreatorModalOpen={setCreateCreatorModalOpen}
        clearCreatorForm={clearCreatorForm}
        handleCreateCreator={handleCreateCreator}
        creEmail={creEmail}
        setCreEmail={setCreEmail}
        crePassword={crePassword}
        setCrePassword={setCrePassword}
        creName={creName}
        setCreName={setCreName}
        creHandle={creHandle}
        setCreHandle={setCreHandle}
        crePhone={crePhone}
        setCrePhone={setCrePhone}
        creCity={creCity}
        setCreCity={setCreCity}
        creState={creState}
        setCreState={setCreState}
        creFollowers={creFollowers}
        setCreFollowers={setCreFollowers}
        creRateMin={creRateMin}
        setCreRateMin={setCreRateMin}
        creRateMax={creRateMax}
        setCreRateMax={setCreRateMax}
        creNiche={creNiche}
        setCreNiche={setCreNiche}
        crePlatform={crePlatform}
        setCrePlatform={setCrePlatform}

        createBrandModalOpen={createBrandModalOpen}
        setCreateBrandModalOpen={setCreateBrandModalOpen}
        clearBrandForm={clearBrandForm}
        handleCreateBrand={handleCreateBrand}
        brandEmail={brandEmail}
        setBrandEmail={setBrandEmail}
        brandPassword={brandPassword}
        setBrandPassword={setBrandPassword}
        brandCompanyName={brandCompanyName}
        setBrandCompanyName={setBrandCompanyName}
        brandIndustry={brandIndustry}
        setBrandIndustry={setBrandIndustry}
        brandWebsite={brandWebsite}
        setBrandWebsite={setBrandWebsite}
        brandPhone={brandPhone}
        setBrandPhone={setBrandPhone}

        createCampaignModalOpen={createCampaignModalOpen}
        setCreateCampaignModalOpen={setCreateCampaignModalOpen}
        clearCampaignForm={clearCampaignForm}
        handleCreateCampaign={handleCreateCampaign}
        campBrandId={campBrandId}
        setCampBrandId={setCampBrandId}
        brands={brands}
        campTitle={campTitle}
        setCampTitle={setCampTitle}
        campBudget={campBudget}
        setCampBudget={setCampBudget}
        campDesc={campDesc}
        setCampDesc={setCampDesc}
        campPlatform={campPlatform}
        setCampPlatform={setCampPlatform}
        campNiche={campNiche}
        setCampNiche={setCampNiche}
        campStatus={campStatus}
        setCampStatus={setCampStatus}

        eventModalOpen={eventModalOpen}
        setEventModalOpen={setEventModalOpen}
        editingEvent={editingEvent}
        setEditingEvent={setEditingEvent}
        handleSaveEvent={handleSaveEvent}
        evtTitle={evtTitle}
        setEvtTitle={setEvtTitle}
        evtDescription={evtDescription}
        setEvtDescription={setEvtDescription}
        evtDate={evtDate}
        setEvtDate={setEvtDate}
        evtLocation={evtLocation}
        setEvtLocation={setEvtLocation}
        evtLink={evtLink}
        setEvtLink={setEvtLink}
        evtImage={evtImage}
        setEvtImage={setEvtImage}

        grantAchModalOpen={grantAchModalOpen}
        setGrantAchModalOpen={setGrantAchModalOpen}
        handleSaveAchievement={handleSaveAchievement}
        achCreatorId={achCreatorId}
        setAchCreatorId={setAchCreatorId}
        achType={achType}
        setAchType={setAchType}
        achTitle={achTitle}
        setAchTitle={setAchTitle}
        achDescription={achDescription}
        setAchDescription={setAchDescription}

        missionModalOpen={missionModalOpen}
        setMissionModalOpen={setMissionModalOpen}
        editingMission={editingMission}
        setEditingMission={setEditingMission}
        handleSaveMission={handleSaveMission}
        misTitle={misTitle}
        setMisTitle={setMisTitle}
        misReward={misReward}
        setMisReward={setMisReward}
        misRewardColor={misRewardColor}
        setMisRewardColor={setMisRewardColor}
        misDeadline={misDeadline}
        setMisDeadline={setMisDeadline}
        misDescription={misDescription}
        setMisDescription={setMisDescription}
        misSteps={misSteps}
        setMisSteps={setMisSteps}
        misActive={misActive}
        setMisActive={setMisActive}

        scoreModal={scoreModal}
        setScoreModal={setScoreModal}
        scoreInput={scoreInput}
        setScoreInput={setScoreInput}
        scoreReason={scoreReason}
        setScoreReason={setScoreReason}
        handleSaveScore={handleSaveScore}

        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        selectedCreator={selectedCreator}
        handleVerifyCreator={handleVerifyCreator}
        handleRejectCreator={handleRejectCreator}

        galleryModalOpen={galleryModalOpen}
        setGalleryModalOpen={setGalleryModalOpen}
        editingGallery={editingGallery}
        setEditingGallery={setEditingGallery}
        clearGalleryForm={clearGalleryForm}
        handleSaveGallery={handleSaveGallery}
        galTitle={galTitle}
        setGalTitle={setGalTitle}
        galType={galType}
        setGalType={setGalType}
        galLocation={galLocation}
        setGalLocation={setGalLocation}
        galDate={galDate}
        setGalDate={setGalDate}
        galCategory={galCategory}
        setGalCategory={setGalCategory}
        galTags={galTags}
        setGalTags={setGalTags}
        galThumbnail={galThumbnail}
        setGalThumbnail={setGalThumbnail}
        galVideoUrl={galVideoUrl}
        setGalVideoUrl={setGalVideoUrl}
        galDuration={galDuration}
        setGalDuration={setGalDuration}
        galDesc={galDesc}
        setGalDesc={setGalDesc}
      />
    </AdminLayout>
  );
}
