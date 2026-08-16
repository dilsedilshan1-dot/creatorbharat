import {
  Users, Building2, ShieldCheck, TrendingUp, Activity, Wallet, Trophy, Award, Star,
  Headphones, Crown, Target, Layers, BarChart3, CreditCard, BookOpen, MessageSquare,
  Mail, Bell, Image, FolderOpen, SlidersHorizontal, Calendar, Cpu, ShieldAlert
} from 'lucide-react';
import { T } from './Primitives';

// ─── Sidebar Nav Config ───────────────────────────────────────────────────────
export const NAV_SECTIONS = (counts) => [
  {
    title: '\uD83D\uDCCA CORE',
    color: T.orange,
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
      { id: 'activity', label: 'Activity Log', icon: Activity },
    ]
  },
  {
    title: '\uD83D\uDC64 CREATOR SYSTEM',
    color: T.blue,
    items: [
      { id: 'verifications', label: 'KYC Verifications', icon: ShieldCheck, badge: counts.pendingVerifications },
      { id: 'creators', label: 'All Creators', icon: Users, badge: counts.creators },
      { id: 'creator-wallets', label: 'Creator Wallets', icon: Wallet, badge: counts.payments },
      { id: 'creator-score', label: 'Creator Score', icon: Trophy },
      { id: 'creator-achievements', label: 'Achievements', icon: Award },
      { id: 'creator-reviews', label: 'Creator Reviews', icon: Star, badge: counts.reviews },
      { id: 'podcasts', label: 'Podcasts', icon: Headphones, badge: counts.podcasts },
      { id: 'leaderboard', label: 'Leaderboard', icon: Crown },
      { id: 'ambassadors', label: 'Ambassador Program', icon: Award, badge: counts.pendingAmbassadors },
      { id: 'missions', label: 'Missions Panel', icon: Target, badge: counts.pendingMissions },
    ]
  },
  {
    title: '\uD83C\uDFE2 BRAND SYSTEM',
    color: T.purple,
    items: [
      { id: 'brands', label: 'All Brands', icon: Building2, badge: counts.brands },
      { id: 'campaigns', label: 'Campaign Manager', icon: Target, badge: counts.campaigns },
      { id: 'applications', label: 'All Applications', icon: Layers, badge: counts.applications },
      { id: 'brand-analytics', label: 'Brand Analytics', icon: BarChart3 },
      { id: 'escrows', label: 'Payments & Escrow', icon: CreditCard, badge: counts.payments },
    ]
  },
  {
    title: '\uD83D\uDCDD CONTENT & MARKETING',
    color: T.green,
    items: [
      { id: 'blogs', label: 'Blog Manager', icon: BookOpen, badge: counts.blogs },
      { id: 'comments', label: 'Comment Moderation', icon: MessageSquare, badge: counts.comments },
      { id: 'newsletters', label: 'Newsletter Subs', icon: Mail, badge: counts.newsletters },
      { id: 'contacts', label: 'Contact Inbox', icon: Bell, badge: counts.unreadContacts },
      { id: 'gallery', label: 'Gallery Manager', icon: Image, badge: counts.gallery },
      { id: 'media-library', label: 'Media Library', icon: FolderOpen, badge: counts.uploads },
      { id: 'pages', label: 'Page Content Manager', icon: SlidersHorizontal },
      { id: 'events', label: 'Events Manager', icon: Calendar },
      { id: 'admin-notifications', label: 'Notification Center', icon: Bell },
    ]
  },
  {
    title: '\u2699\uFE0F SYSTEM',
    color: T.slate,
    items: [
      { id: 'settings', label: 'Settings', icon: SlidersHorizontal },
      { id: 'audit-logs', label: 'Security & Audit Logs', icon: ShieldAlert },
      { id: 'feature-control', label: 'Platform Control Center', icon: Cpu },
      { id: 'admin-control', label: 'Admin Panel Control', icon: ShieldCheck },
      { id: 'danger', label: 'Danger Zone', icon: ShieldAlert },
    ]
  }
];

// ─── Tab Label Helper ─────────────────────────────────────────────────────────
export const TAB_META = {
  dashboard: { title: 'Dashboard Overview', sub: 'Real-time platform metrics and priority actions' },
  activity: { title: 'Platform Activity Log', sub: 'Live feed of all recent platform events' },
  'audit-logs': { title: 'Security & Audit Logs', sub: 'Immutable, cryptographically recorded forensic audit trail' },
  verifications: { title: 'KYC Verification Queue', sub: 'Review and approve creator identity documents' },
  creators: { title: 'All Creators', sub: 'Manage creator profiles, scores and suspensions' },
  'creator-wallets': { title: 'Creator Wallets', sub: 'View transaction history and wallet balances per creator' },
  'creator-score': { title: 'Creator Score Manager', sub: 'Manually adjust or audit creator platform scores' },
  'creator-achievements': { title: 'Achievements & Milestones', sub: 'Track creator achievement progress and manually grant badges' },
  'creator-reviews': { title: 'Creator Reviews', sub: 'Moderate brand reviews given to creators' },
  podcasts: { title: 'Podcast Manager', sub: 'Publish, unpublish, or delete podcast episodes' },
  leaderboard: { title: 'Leaderboard Management', sub: 'Top verified creators by score and followers' },
  brands: { title: 'All Brands', sub: 'Manage brand accounts, suspensions and campaigns' },
  campaigns: { title: 'Campaign Manager', sub: 'Oversee all brand campaign postings and pitches' },
  applications: { title: 'All Campaign Applications', sub: 'Platform-wide creator pitch submissions' },
  'brand-analytics': { title: 'Brand Analytics', sub: 'Campaign spend, applications and performance per brand' },
  escrows: { title: 'Payments & Escrow', sub: 'Override campaign escrow releases and refunds' },
  blogs: { title: 'Blog Manager', sub: 'Create, edit, publish and delete blog articles' },
  comments: { title: 'Comment Moderation', sub: 'Remove spam or offensive blog comments' },
  newsletters: { title: 'Newsletter Subscribers', sub: 'View and manage email list' },
  contacts: { title: 'Contact Inbox', sub: 'Reply to or delete user contact messages' },
  gallery: { title: 'Gallery Manager', sub: 'Manage CreatorBharat Ecosystem Gallery items' },
  'media-library': { title: 'Media Library', sub: 'Upload files and copy their URLs for use across the platform' },
  pages: { title: 'Page Content Manager', sub: 'Dynamically customize public page text, pricing tiers, and calculator rates' },
  settings: { title: 'System Settings', sub: 'Configure platform-wide settings and toggles' },
  'feature-control': { title: 'Platform Control Center', sub: 'Configure live feature toggles, commission rates, and global announcements' },
  'admin-control': { title: 'Admin Panel Control', sub: 'Customize admin interface behaviors, set theme preferences, and audit administrative actions' },
  danger: { title: '\u26A0\uFE0F Danger Zone', sub: 'Irreversible platform-wide operations' },
  events: { title: 'Events Manager', sub: 'Create and coordinate public platform events and conferences' },
  ambassadors: { title: 'Campus Ambassador Applications', sub: 'Review and approve/reject college student representation applications' },
  missions: { title: 'Monthly Missions & Completions', sub: 'Manage monthly platform-wide creator tasks and proof submissions' },
  'admin-notifications': { title: 'Notification Dispatch Center', sub: 'Send customized in-app push alerts and updates to creators or brands' },
};
