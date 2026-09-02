import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../core/context';
import { LS, fmt } from '../../utils/helpers';
import { fetchCreators, fetchCampaigns } from '../../utils/platformService';
import { MediaKitPreview } from '../../components/creators/profile/MediaKitPreview';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, ExternalLink, TrendingUp, Users, Zap, Briefcase,
  ChevronRight, Wallet, CheckCircle, Clock, Sparkles, Lock,
  ArrowRight, Award, Globe, Settings, Check, MapPin, Download,
  Trophy, X, Copy, Play, Target, Activity, IndianRupee, Heart, Eye,
  RefreshCw, Plus, Flame, Star, Send, ArrowUpRight, Crown, Bell
} from 'lucide-react';

// ─── Design Tokens (2026 Minimalist SaaS Theme) ──────────────────────────────────
const C = {
  saffron: '#FF7A00', // Crisp modern saffron accent
  green: '#10B981',   // Clean emerald green for positive metrics
  blue: '#3B82F6',    // Standard blue for info/messages
  navy: 'var(--db-text-primary, #0F172A)',    // Deep charcoal for primary text
  slate: 'var(--db-text-secondary, #475569)',   // Slate for subtext
  slateLight: 'var(--db-text-muted, #94A3B8)',
  bg: 'transparent',      // Clean off-white background
  card: 'var(--db-card-bg, #FFFFFF)',    // Crisp white cards
  border: 'var(--db-card-border, #E2E8F0)',  // Hairline borders
  borderLight: 'var(--db-header-border, rgba(15, 23, 42, 0.05))',
  glass: 'var(--db-card-bg, rgba(255, 255, 255, 0.85))',
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }
});

// ─── Mono Font Counter ──────────────────────────────────────────────────────────
const MonoValue = ({ val, prefix = '', suffix = '' }) => (
  <span style={{ fontFamily: 'JetBrains Mono, Space Mono, Consolas, monospace', fontWeight: 700 }}>
    {prefix}{val}{suffix}
  </span>
);

// ─── Monochromatic Dot Background ──────────────────────────────────────────────
const AmbientDotGrid = () => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: 'radial-gradient(rgba(15,23,42,0.02) 1.2px, transparent 1.2px)',
      backgroundSize: '20px 20px',
    }} />
  </div>
);

// ─── Minimalist Bento Card ────────────────────────────────────────────────────────
const BentoCard = ({ children, style = {}, hover = true, onClick, delay = 0, className = "" }) => {
  return (
    <motion.div
      {...fadeUp(delay)}
      onClick={onClick}
      className={`cb-bento-tile ${className}`}
      style={{
        background: C.card,
        borderRadius: 16,
        border: `1px solid ${C.border}`,
        padding: '20px',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 1px 3px rgba(0,0,0,0.01)',
        ...style
      }}
      whileHover={hover ? {
        borderColor: C.saffron + '40',
        boxShadow: '0 4px 12px rgba(15,23,42,0.02)'
      } : {}}
    >
      {children}
    </motion.div>
  );
};

// ─── Micro Tag Badge ─────────────────────────────────────────────────────────────
const MiniBadge = ({ children, color = C.saffron, bg }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 8px', borderRadius: 6,
    fontSize: 9, fontWeight: 800, letterSpacing: '0.05em',
    color, background: bg || color + '08',
    border: `1px solid ${color}15`,
    textTransform: 'uppercase'
  }}>
    {children}
  </span>
);

// ─── Minimalist Bento Hero Widget (spans 12 columns) ─────────────────────────────
const BentoHero = ({ creator, verificationStatus, score, navigate, isPro, dsp }) => {
  const name = creator?.name || 'Creator';
  const handle = creator?.handle || '@' + (creator?.name?.toLowerCase()?.replace(/\s+/g, '_') || 'elite_creator');
  const isVerified = verificationStatus === 'APPROVED';
  const followers = creator?.followers || 152000;
  const nicheList = Array.isArray(creator?.niche) ? creator.niche : [creator?.niche || 'Digital Creator'];

  const rawProfileId = creator?.handle || creator?.slug || creator?.id || 'elite';
  const cleanProfileId = rawProfileId.startsWith('@') ? rawProfileId.slice(1) : rawProfileId;

  return (
    <BentoCard hover={false} style={{ gridColumn: 'span 12', padding: '24px', background: C.card }}>
      <div className="hero-flex" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 24
      }}>
        {/* Profile Details Block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              overflow: 'hidden', border: `1px solid ${C.border}`,
              padding: 2, background: '#fff'
            }}>
              <img
                src={creator?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FF7A00&color=fff&size=80&bold=true`}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                alt={name}
              />
            </div>
            {isVerified && (
              <div style={{
                position: 'absolute', bottom: 0, right: 0, width: 22, height: 22,
                borderRadius: '50%', background: C.saffron, border: '2.5px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Check size={10} color="#fff" strokeWidth={4} />
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, margin: 0, fontFamily: 'Outfit' }}>{name}</h2>
              {isPro && (
                <span style={{
                  padding: '2px 6px', borderRadius: 4, fontSize: 8, fontWeight: 900,
                  background: C.navy, color: '#fff', letterSpacing: '0.05em'
                }}>PRO ELITE</span>
              )}
            </div>
            <p style={{ fontSize: 13, color: C.slate, margin: '2px 0 4px', fontWeight: 600 }}>{handle}</p>
            <p style={{ fontSize: 11, color: C.slateLight, margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📍 {creator?.city || 'Jaipur Hub'}</span>
              <span>•</span>
              <span style={{ color: C.saffron }}>{nicheList.join(' · ')}</span>
            </p>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {[
            { label: 'Followers', val: fmt.num(followers) },
            { label: 'CB Score', val: score },
            { label: 'Active Deals', val: '3 Selected' },
            { label: 'Eng. Rate', val: '4.8%' }
          ].map(st => (
            <div key={st.label}>
              <span style={{ fontSize: 9, fontWeight: 800, color: C.slateLight, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{st.label}</span>
              <p style={{ fontSize: 20, color: C.navy, fontWeight: 700, margin: '2px 0 0', fontFamily: 'Outfit' }}>{st.val}</p>
            </div>
          ))}
        </div>

        {/* Console Action Pills */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => navigate(`/creator/c/${cleanProfileId}`)}
            style={{
              padding: '8px 14px', borderRadius: 8, background: C.navy,
              border: 'none', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5
            }}
          >
            <Eye size={13} /> Profile
          </button>
          <button
            onClick={() => navigate('/creator/profile')}
            style={{
              padding: '8px 14px', borderRadius: 8, background: '#fff',
              border: `1px solid ${C.border}`, color: C.navy, fontSize: 12, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5
            }}
          >
            <Settings size={13} /> Edit
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`https://creatorbharat.com/c/${cleanProfileId}`);
              dsp({ t: 'TOAST', d: { type: 'success', msg: 'Copied Link!' } });
            }}
            style={{
              width: 32, height: 32, borderRadius: 8, background: '#fff',
              border: `1px solid ${C.border}`, color: C.slate, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <Copy size={13} />
          </button>
        </div>
      </div>
    </BentoCard>
  );
};

// ─── Analytics Lock Overlay ──────────────────────────────────────────────────────
const AnalyticsLockOverlay = ({ onUpgradeClick }) => (
  <div style={{
    position: 'absolute', inset: 0, background: 'rgba(255, 255, 255, 0.82)',
    backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: 20, textAlign: 'center', zIndex: 10, borderRadius: 'inherit'
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: 10, background: '#fff',
      border: `1px solid ${C.border}`, display: 'flex',
      alignItems: 'center', justifyContent: 'center', marginBottom: 10
    }}>
      <Lock size={15} color={C.saffron} />
    </div>
    <h4 style={{ fontSize: 13, fontWeight: 800, color: C.navy, margin: '0 0 2px', fontFamily: 'Outfit' }}>Analytics Console Gated</h4>
    <p style={{ fontSize: 11, color: C.slate, fontWeight: 500, margin: '0 0 12px', maxWidth: 160, lineHeight: 1.4 }}>
      Detailed view metrics and analytics require Pro Elite activation
    </p>
    <button
      onClick={(e) => { e.stopPropagation(); onUpgradeClick(); }}
      style={{
        padding: '6px 12px', borderRadius: 6, background: C.navy,
        border: 'none', color: '#fff', fontSize: 10, fontWeight: 800, cursor: 'pointer'
      }}
    >
      Unlock with Pro Elite
    </button>
  </div>
);

// ─── Minimalist SVG Sparkline Views (spans 8 columns) ────────────────────────────
const PerformancePulse = ({ views, isAnalyticsLocked, onUpgradeClick }) => {
  const points = [
    { x: 10, y: 95, val: 840 },
    { x: 50, y: 80, val: 960 },
    { x: 90, y: 50, val: 1120 },
    { x: 130, y: 70, val: 1040 },
    { x: 170, y: 35, val: 1350 },
    { x: 210, y: 40, val: 1280 },
    { x: 250, y: 10, val: 1680 }
  ];
  const pathData = `M 10 95 Q 30 90, 50 80 T 90 50 T 130 70 T 170 35 T 210 40 T 250 10`;

  return (
    <BentoCard
      hover={!isAnalyticsLocked}
      style={{
        gridColumn: 'span 8', padding: '20px', minHeight: 300,
        position: 'relative'
      }}
    >
      {isAnalyticsLocked && <AnalyticsLockOverlay onUpgradeClick={onUpgradeClick} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <span style={{ fontSize: 9, fontWeight: 800, color: C.slateLight, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Performance Sparkline</span>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: C.navy, margin: '4px 0 0', fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MonoValue val={views.toLocaleString()} />
            <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>+18%</span>
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['7D', '30D', '6M'].map(t => (
            <button key={t} style={{
              padding: '4px 8px', borderRadius: 6, background: t === '7D' ? C.borderLight : 'transparent',
              border: 'none', color: t === '7D' ? C.navy : C.slateLight,
              fontSize: 10, fontWeight: 700, cursor: 'pointer'
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* SVG Sparkline Graph */}
      <div style={{ height: 160, position: 'relative' }}>
        <svg viewBox="0 0 260 110" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {/* Flat Grid guides */}
          <line x1="10" y1="10" x2="250" y2="10" stroke={C.borderLight} strokeWidth="1" />
          <line x1="10" y1="55" x2="250" y2="55" stroke={C.borderLight} strokeWidth="1" />
          <line x1="10" y1="100" x2="250" y2="100" stroke={C.borderLight} strokeWidth="1" />

          {/* Simple Clean Area Fill */}
          <path d={`${pathData} L 250 100 L 10 100 Z`} fill="rgba(255, 122, 0, 0.02)" />

          {/* Path Line */}
          <motion.path
            d={pathData}
            fill="none"
            stroke={C.saffron}
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />

          {/* Anchor circles */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r="3.5"
              fill="#fff"
              stroke={C.saffron}
              strokeWidth="1.5"
            />
          ))}
        </svg>
      </div>
    </BentoCard>
  );
};

// ─── Command Console / Quick Actions (spans 4 columns) ──────────────────────────
const CommandCenter = ({ navigate, isLocked }) => {
  const items = [
    { label: 'Opportunities', desc: 'Find brief briefs', icon: Zap, color: C.saffron, path: '/creator/opportunities', locked: isLocked },
    { label: 'Analytics Console', desc: 'Detailed statistics', icon: Globe, color: '#6366F1', path: '/creator/analytics', locked: isLocked },
    { label: 'SaaS Wallet', desc: 'Escrow records', icon: Wallet, color: C.green, path: '/creator/wallet', locked: false },
    { label: 'Achievements', desc: 'Unlock milestones', icon: Trophy, color: '#F59E0B', path: '/creator/opportunities', locked: false },
    { label: 'Messages', desc: 'Direct corporate chats', icon: Send, color: C.blue, path: '/creator/messages', locked: false },
    { label: 'Pro Privilege', desc: 'Scale monetization', icon: Sparkles, color: '#EC4899', path: '/creator/monetization', locked: false },
  ];

  return (
    <BentoCard style={{ gridColumn: 'span 4', padding: '20px', minHeight: 300 }}>
      <h3 style={{ fontSize: 9, fontWeight: 800, color: C.slateLight, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Console Commands</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', height: 'calc(100% - 24px)' }}>
        {items.map(a => (
          <div
            key={a.label}
            onClick={() => !a.locked && navigate(a.path)}
            style={{
              padding: '10px', borderRadius: 10,
              background: a.locked ? C.bg : 'transparent',
              border: `1px solid ${a.locked ? C.borderLight : C.border}`,
              display: 'flex', flexDirection: 'column', gap: 5,
              cursor: a.locked ? 'not-allowed' : 'pointer',
              opacity: a.locked ? 0.5 : 1, position: 'relative',
              transition: 'border-color 0.2s'
            }}
            className="command-button"
          >
            {a.locked && <Lock size={9} color={C.slateLight} style={{ position: 'absolute', top: 8, right: 8 }} />}
            <a.icon size={14} color={a.locked ? C.slateLight : a.color} />
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.navy, margin: 0, lineHeight: 1.1 }}>{a.label}</p>
              <p style={{ fontSize: 9, color: C.slateLight, margin: '2px 0 0', fontWeight: 500 }}>{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  );
};

// ─── Escrow Ledger (spans 4 columns) ─────────────────────────────────────────────
const WalletBento = ({ isLocked, navigate }) => {
  const transactions = [
    { title: 'Boat Promotion', date: 'Release Pending', amt: 8500, state: 'pending' },
    { title: 'CB Pioneer Wave', date: 'June 11, 2026', amt: -199, state: 'waived' },
    { title: 'Sponsorship Setup', date: 'June 09, 2026', amt: 4000, state: 'completed' },
  ];

  return (
    <BentoCard style={{ gridColumn: 'span 4', padding: '20px', minHeight: 320, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      {isLocked && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 10, borderRadius: 'inherit'
        }}>
          <Lock size={16} color={C.saffron} />
          <p style={{ fontSize: 11, fontWeight: 700, color: C.slate, textAlign: 'center', maxWidth: 160 }}>Unlock Escrow Ledger after verification</p>
        </div>
      )}

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: C.slateLight, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Escrow Ledger</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.green }}>₹12,450.00</span>
        </div>

        {/* Tabular Ledger Ledger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          {transactions.map((tx, idx) => (
            <div key={idx} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingBottom: 8, borderBottom: idx < transactions.length - 1 ? `1px solid ${C.borderLight}` : 'none'
            }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.navy, margin: 0 }}>{tx.title}</p>
                <span style={{ fontSize: 9, color: C.slateLight, fontWeight: 500 }}>{tx.date}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: tx.amt > 0 ? C.navy : '#EF4444' }}>
                  {tx.amt > 0 ? '+' : ''}₹{Math.abs(tx.amt)}
                </span>
                <span style={{
                  display: 'block', fontSize: 8, fontWeight: 800,
                  color: tx.state === 'completed' ? C.green : tx.state === 'pending' ? C.saffron : C.slateLight
                }}>{tx.state.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => navigate('/creator/wallet')}
        style={{
          width: '100%', padding: '10px', borderRadius: 8,
          background: C.navy, border: 'none', color: '#fff',
          fontSize: 12, fontWeight: 800, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
        }}
      >
        <Wallet size={12} /> Open Escrow Console
      </button>
    </BentoCard>
  );
};

// ─── Geography Demographics (spans 4 columns) ────────────────────────────────────
const GeographyBento = ({ isLocked, isAnalyticsLocked, onUpgradeClick }) => {
  const geos = [
    { city: 'Delhi NCR', pct: 42 },
    { city: 'Mumbai Metro', pct: 28 },
    { city: 'Jaipur, Rajasthan', pct: 18 },
    { city: 'Lucknow, UP', pct: 12 },
  ];

  return (
    <BentoCard
      hover={!isAnalyticsLocked}
      style={{
        gridColumn: 'span 4', padding: '20px', minHeight: 320,
        position: 'relative'
      }}
    >
      {isLocked && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 10, borderRadius: 'inherit'
        }}>
          <Lock size={16} color={C.saffron} />
          <p style={{ fontSize: 11, fontWeight: 700, color: C.slate, textAlign: 'center', maxWidth: 160 }}>Unlock Geography after verification</p>
        </div>
      )}
      {isAnalyticsLocked && !isLocked && <AnalyticsLockOverlay onUpgradeClick={onUpgradeClick} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 9, fontWeight: 800, color: C.slateLight, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Top Geographies</span>
        <MapPin size={13} color={C.slateLight} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {geos.map((g, i) => (
          <div key={g.city}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: C.navy, marginBottom: 4 }}>
              <span>{g.city}</span>
              <span style={{ fontFamily: 'monospace' }}>{g.pct}%</span>
            </div>
            <div style={{ height: 3, borderRadius: 2, background: C.borderLight, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: i === 0 ? C.saffron : C.slate, width: `${g.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  );
};

// ─── Milestone Tracker (spans 4 columns) ─────────────────────────────────────────
const MilestoneBento = ({ followers, navigate }) => {
  const MS = [
    { label: 'Rising Creator', required: 10000, emoji: '🌱', color: C.green },
    { label: 'Bharat Creator', required: 50000, emoji: '🏆', color: C.saffron },
    { label: 'India Creator', required: 100000, emoji: '🇮🇳', color: '#6366F1' },
  ];
  const cur = followers || 152000;
  const next = MS.find(m => cur < m.required) || MS[MS.length - 1];
  const achieved = MS.filter(m => cur >= m.required);
  const pct = Math.min(100, Math.round((cur / next.required) * 100));

  return (
    <BentoCard style={{ gridColumn: 'span 4', padding: '20px', minHeight: 320, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: C.slateLight, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Milestones</span>
          <span style={{ fontSize: 9, fontWeight: 800, color: next.color }}>{pct}% TARGET</span>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '8px 0 14px' }}>
          <span style={{ fontSize: 22 }}>{next.emoji}</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, color: C.navy, margin: 0 }}>{next.label}</p>
            <p style={{ fontSize: 10, color: C.slateLight, margin: 0, fontWeight: 500 }}>
              <MonoValue val={fmt.num(cur)} /> / <MonoValue val={fmt.num(next.required)} />
            </p>
          </div>
        </div>

        <div style={{ height: 4, borderRadius: 2, background: C.borderLight, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ height: '100%', background: next.color, width: `${pct}%` }} />
        </div>

        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {achieved.map(m => (
            <span key={m.label} style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              padding: '2px 6px', borderRadius: 4, background: C.borderLight,
              fontSize: 9, color: C.slate, fontWeight: 700
            }}>
              ✓ {m.emoji} {m.label.split(' ')[0]}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={() => navigate('/creator/opportunities')}
        style={{
          width: '100%', padding: '10px', borderRadius: 8,
          background: '#fff', border: `1px solid ${C.border}`,
          color: C.navy, fontSize: 12, fontWeight: 800, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
        }}
      >
        <Trophy size={12} color={C.saffron} /> Unlocked Rewards Hub
      </button>
    </BentoCard>
  );
};

// ─── Campaigns briefings (spans 8 columns) ──────────────────────────────────────
const CampaignsBento = ({ campaigns, isLocked, navigate }) => {
  const images = [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80'
  ];

  return (
    <BentoCard style={{ gridColumn: 'span 8', padding: '20px', minHeight: 320 }}>
      {isLocked && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 6, zIndex: 10, borderRadius: 'inherit'
        }}>
          <Lock size={18} color={C.saffron} />
          <h4 style={{ fontSize: 13, fontWeight: 800, color: C.navy, margin: 0, fontFamily: 'Outfit' }}>Campaign Hub Gated</h4>
          <p style={{ fontSize: 11, color: C.slate, fontWeight: 500, textAlign: 'center', maxWidth: 220, lineHeight: 1.4 }}>
            Verify credentials to unlock matching corporate campaigns briefs
          </p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <span style={{ fontSize: 9, fontWeight: 800, color: C.slateLight, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Matching Campaigns</span>
          <p style={{ fontSize: 11, color: C.slateLight, margin: '2px 0 0', fontWeight: 600 }}>Active briefings matched to your categories</p>
        </div>
        <button onClick={() => navigate('/creator/opportunities')} style={{
          background: 'none', border: 'none', color: C.saffron,
          fontSize: 11, fontWeight: 800, cursor: 'pointer'
        }}>See all →</button>
      </div>

      {/* Clean Flat Horizontal briefings list */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: 6 }}>
        {campaigns.map((camp, idx) => (
          <div
            key={camp.id || idx}
            onClick={() => navigate('/creator/opportunities')}
            style={{
              flexShrink: 0, width: 220, height: 200, borderRadius: 12,
              border: `1px solid ${C.border}`, overflow: 'hidden', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', background: '#fff'
            }}
            className="campaign-mini-tile"
          >
            {/* Visual Cover image */}
            <div style={{ height: 100, position: 'relative' }}>
              <img src={images[idx % images.length]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.5))' }} />
              <span style={{
                position: 'absolute', top: 10, left: 10,
                background: C.navy, color: '#fff', fontSize: 8,
                fontWeight: 800, padding: '2px 6px', borderRadius: 4
              }}>{camp.niche || 'Niche'}</span>
            </div>
            <div style={{ padding: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: C.navy, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.2 }}>
                {camp.title}
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: C.green }}>₹{fmt.num(camp.budget || camp.budgetMin || 15000)}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: C.slateLight }}>Apply Now</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  );
};

// ─── Application Tracker (spans 4 columns) ────────────────────────────────────────
const ApplicationPulse = ({ myApps, isLocked, navigate }) => {
  const statusColor = s => s === 'selected' ? C.green : s === 'shortlisted' ? '#6366F1' : C.saffron;

  return (
    <BentoCard style={{ gridColumn: 'span 4', padding: '20px', minHeight: 320, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      {isLocked && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 10, borderRadius: 'inherit'
        }}>
          <Lock size={16} color={C.saffron} />
          <p style={{ fontSize: 11, fontWeight: 700, color: C.slate, textAlign: 'center', maxWidth: 160 }}>Unlock Applications after verification</p>
        </div>
      )}

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: C.slateLight, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Application Tracker</span>
          <span style={{ fontSize: 9, fontWeight: 800, color: C.navy, background: C.borderLight, padding: '2px 6px', borderRadius: 4 }}>{myApps.length}</span>
        </div>

        {myApps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ fontSize: 24, margin: 0 }}>📊</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.navy, margin: '8px 0 0' }}>No active applications</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 170, overflowY: 'auto' }}>
            {myApps.slice(0, 3).map(a => (
              <div key={a.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 8px', borderRadius: 8, border: `1px solid ${C.borderLight}`
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: C.navy, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{a.campaignTitle}</h4>
                </div>
                <span style={{
                  fontSize: 8, fontWeight: 800, color: statusColor(a.status),
                  background: statusColor(a.status) + '08', padding: '2px 6px',
                  borderRadius: 4, textTransform: 'uppercase', flexShrink: 0
                }}>{a.status || 'SENT'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => navigate('/creator/applications')}
        style={{
          width: '100%', padding: '10px', borderRadius: 8,
          background: C.navy, border: 'none', color: '#fff',
          fontSize: 12, fontWeight: 800, cursor: 'pointer'
        }}
      >
        Open Applications Console
      </button>
    </BentoCard>
  );
};

// ─── Verification Progress / Onboarding Checklist (spans 6 columns) ──────────────
const OnboardingPanel = ({ hasIdentity, hasSocials, hasStory, hasServices, allChecksComplete, verificationStatus, handleFreeSubmit, navigate }) => {
  const checklist = [
    { done: hasIdentity, label: 'Identity credentials configuration' },
    { done: hasSocials, label: 'Linked social API handlers' },
    { done: hasStory, label: 'Narrative history and milestones' },
    { done: hasServices, label: 'Monetized rate packets configuration' },
  ];
  const count = checklist.filter(s => s.done).length;
  const pct = Math.round((count / checklist.length) * 100);

  if (verificationStatus === 'APPROVED') {
    return (
      <BentoCard style={{ gridColumn: 'span 6', padding: '20px', minHeight: 280, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: C.slateLight, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Audience Demographics</span>
            <span style={{ fontSize: 9, fontWeight: 800, color: C.green }}>LIVE CONNECTED</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[{ label: 'Age 18-24 (Gen Z Focus)', val: 65, color: C.saffron }, { label: 'Age 25-34 (Millennials)', val: 25, color: C.navy }, { label: 'Age 35+ (Mature)', val: 10, color: C.slateLight }].map(d => (
              <div key={d.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: C.navy, marginBottom: 4 }}>
                  <span>{d.label}</span>
                  <span>{d.val}%</span>
                </div>
                <div style={{ height: 3, borderRadius: 2, background: C.borderLight, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: d.color, width: `${d.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, background: C.bg, padding: 10, borderRadius: 10, border: `1px solid ${C.borderLight}`, marginTop: 10 }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: C.saffron, fontFamily: 'monospace' }}>4.8%</span>
            <p style={{ fontSize: 8, color: C.slateLight, fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Engagement</p>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: C.green, fontFamily: 'monospace' }}>92%</span>
            <p style={{ fontSize: 8, color: C.slateLight, fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>Sentiment</p>
          </div>
        </div>
      </BentoCard>
    );
  }

  if (verificationStatus === 'PENDING_APPROVAL') {
    const queue = [
      { active: false, done: true, label: 'Identity configuration checking' },
      { active: false, done: true, label: 'Early pioneer waiver activation' },
      { active: true, done: false, label: 'Compliance board validation' },
      { active: false, done: false, label: 'Marketplace public listing activation' }
    ];

    return (
      <BentoCard style={{ gridColumn: 'span 6', padding: '20px', minHeight: 280 }}>
        <span style={{ fontSize: 9, fontWeight: 800, color: C.slateLight, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Verification Timeline</span>
        <p style={{ fontSize: 11, color: C.slateLight, fontWeight: 500, margin: '2px 0 16px' }}>Evaluating active credentials under queue</p>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {queue.map((s, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 10, paddingBottom: idx < queue.length - 1 ? 12 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: s.done ? C.green : s.active ? C.navy : C.border,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {s.done ? <Check size={8} color="#fff" strokeWidth={4} /> : <div style={{ width: 4, height: 4, borderRadius: '50%', background: s.active ? '#fff' : C.slateLight }} />}
                </div>
                {idx < queue.length - 1 && <div style={{ width: 1.5, flex: 1, background: s.done ? C.green : C.border, marginTop: 2 }} />}
              </div>
              <div style={{ paddingTop: 1 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: s.active ? C.navy : s.done ? C.navy : C.slateLight }}>{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </BentoCard>
    );
  }

  return (
    <BentoCard style={{ gridColumn: 'span 6', padding: '20px', minHeight: 280, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 9, fontWeight: 800, color: C.slateLight, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Creator Checklist</span>
            <p style={{ fontSize: 11, color: C.slateLight, margin: '2px 0 0', fontWeight: 600 }}>Sync details to activate marketplace</p>
          </div>
          <span style={{ fontSize: 12, fontWeight: 800, color: pct === 100 ? C.green : C.saffron }}>{pct}%</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {checklist.map((s, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
              borderRadius: 8, background: s.done ? C.bg : 'transparent',
              border: `1px solid ${s.done ? C.borderLight : C.border}`,
              minWidth: 0
            }}>
              <div style={{
                width: 14, height: 14, borderRadius: '50%',
                background: s.done ? C.green : C.borderLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {s.done && <Check size={8} color="#fff" strokeWidth={4} />}
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: s.done ? C.navy : C.slateLight, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {s.label.split(' ')[0]} synced
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={allChecksComplete ? handleFreeSubmit : () => navigate('/creator/profile')}
        style={{
          width: '100%', padding: '10px', borderRadius: 8,
          background: allChecksComplete ? C.green : C.navy,
          border: 'none', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer',
          marginTop: 10
        }}
      >
        {allChecksComplete ? 'Submit Credentials to Compliance Queue' : 'Complete Setup Credentials →'}
      </button>
    </BentoCard>
  );
};

// ─── CB Page & Media Kit Download (spans 6 columns) ─────────────────────────────
const CBAndMediaKitBento = ({ creator, followingCB, onToggleFollow, isLocked, navigate, dsp, onOpenMediaKit }) => {
  const rawProfileId = creator?.handle || creator?.slug || creator?.id || 'elite';
  const cleanProfileId = rawProfileId.startsWith('@') ? rawProfileId.slice(1) : rawProfileId;

  return (
    <BentoCard style={{ gridColumn: 'span 6', padding: '20px', minHeight: 280, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottom: `1px solid ${C.borderLight}` }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <span style={{ fontSize: 16 }}>🇮🇳</span>
          </div>
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 800, color: C.navy, margin: 0 }}>@CreatorBharat.Official</h4>
            <p style={{ fontSize: 10, color: C.slateLight, margin: 0, fontWeight: 500 }}>India's elite brand gateway updates</p>
          </div>
        </div>

        {/* Media Kit Section */}
        <div style={{ marginTop: 12, position: 'relative' }}>
          {isLocked && (
            <div style={{
              position: 'absolute', inset: -4, background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(3px)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', zIndex: 10, borderRadius: 8
            }}>
              <Lock size={14} color={C.saffron} />
              <span style={{ fontSize: 10, fontWeight: 800, color: C.slate }}>Verified media kit locked</span>
            </div>
          )}
          <span style={{ fontSize: 9, fontWeight: 800, color: C.slateLight, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Public Media Kit Link</span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
            background: C.bg, borderRadius: 8, border: `1px solid ${C.borderLight}`,
            margin: '4px 0 0'
          }}>
            <span style={{ fontSize: 10, color: C.slate, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
              creatorbharat.com/c/{cleanProfileId}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://creatorbharat.com/c/${cleanProfileId}`);
                dsp({ t: 'TOAST', d: { type: 'success', msg: 'Copied profile link!' } });
              }}
              style={{
                width: 22, height: 22, borderRadius: 6, background: '#fff',
                border: `1px solid ${C.border}`, color: C.slate, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <Copy size={10} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        <button
          onClick={onToggleFollow}
          style={{
            flex: 1, padding: '10px', borderRadius: 8,
            background: followingCB ? '#fff' : C.navy,
            border: `1px solid ${C.border}`,
            color: followingCB ? C.navy : '#fff',
            fontSize: 11, fontWeight: 800, cursor: 'pointer'
          }}
        >
          {followingCB ? '✓ Following Page' : '+ Follow Page'}
        </button>
        <button
          type="button"
          onClick={() => !isLocked && onOpenMediaKit && onOpenMediaKit()}
          disabled={isLocked}
          aria-label="Preview and Download PDF Media Kit"
          style={{
            flex: 1, padding: '10px', borderRadius: 8,
            background: isLocked ? C.bg : '#fff',
            border: `1px solid ${C.border}`,
            color: isLocked ? C.slateLight : C.navy,
            fontSize: 11, fontWeight: 800, cursor: isLocked ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
          }}
        >
          <Download size={12} /> Preview Media Kit
        </button>
      </div>
    </BentoCard>
  );
};

// ─── Status banner alerts ────────────────────────────────────────────────────────
const StatusBanner = ({ profileCompleted, verificationStatus, totalSystemUsers, loadingPayment, handleFreeSubmit, handleMockPayment, navigate }) => {
  if (!profileCompleted) return (
    <motion.div {...fadeUp(0.02)} style={{
      background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(16px)', borderRadius: 12,
      padding: '14px 18px', marginBottom: 18, border: '1px solid rgba(245, 158, 11, 0.25)', borderLeft: '6px solid #F59E0B',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 16 }}>⚡</span>
        <div>
          <p style={{ fontSize: 12, fontWeight: 800, color: '#D97706', margin: 0, fontFamily: 'Outfit' }}>Setup Credentials & Sync Profile Hub</p>
          <p style={{ fontSize: 10, fontWeight: 500, color: '#B45309', margin: '2px 0 0' }}>Populate the checklist categories to request admin compliance review</p>
        </div>
      </div>
      <button onClick={() => navigate('/creator/profile')} style={{
        padding: '6px 12px', borderRadius: 6, background: C.saffron,
        border: 'none', color: '#fff', fontSize: 11, fontWeight: 800, cursor: 'pointer'
      }}>Setup Profile →</button>
    </motion.div>
  );

  if (verificationStatus === 'DRAFT') {
    if (totalSystemUsers < 100) return (
      <motion.div {...fadeUp(0.02)} style={{
        background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(16px)', borderRadius: 12,
        padding: '14px 18px', marginBottom: 18, border: '1px solid rgba(16, 185, 129, 0.25)', borderLeft: '6px solid #10B981',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>👑</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, color: '#065F46', margin: 0, fontFamily: 'Outfit' }}>Pioneer Launch Offer — ₹199 Verification fee waived!</p>
            <p style={{ fontSize: 10, fontWeight: 500, color: '#047857', margin: '2px 0 0' }}>Send profile to compliance vetting directly for free</p>
          </div>
        </div>
        <button onClick={handleFreeSubmit} style={{
          padding: '6px 12px', borderRadius: 6, background: C.green,
          border: 'none', color: '#fff', fontSize: 11, fontWeight: 800, cursor: 'pointer'
        }}>Submit Profile Free</button>
      </motion.div>
    );

    return (
      <motion.div {...fadeUp(0.02)} style={{
        background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(16px)', borderRadius: 12,
        padding: '14px 18px', marginBottom: 18, border: '1px solid rgba(245, 158, 11, 0.25)', borderLeft: '6px solid #F59E0B',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>🔒</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, color: '#D97706', margin: 0, fontFamily: 'Outfit' }}>Activate Verified Identity & Ledger System</p>
            <p style={{ fontSize: 10, fontWeight: 500, color: '#B45309', margin: '2px 0 0' }}>One-time editorial vetting fee of ₹199 to activate campaigns matching and escrow ledger</p>
          </div>
        </div>
        <button onClick={handleMockPayment} disabled={loadingPayment} style={{
          padding: '6px 12px', borderRadius: 6, background: C.saffron,
          border: 'none', color: '#fff', fontSize: 11, fontWeight: 800, cursor: loadingPayment ? 'not-allowed' : 'pointer',
          opacity: loadingPayment ? 0.75 : 1
        }}>{loadingPayment ? 'Processing…' : 'Submit Credentials & Pay ₹199'}</button>
      </motion.div>
    );
  }

  if (verificationStatus === 'PENDING_APPROVAL') return (
    <motion.div {...fadeUp(0.02)} style={{
      background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(16px)', borderRadius: 12,
      padding: '14px 18px', marginBottom: 18, border: '1px solid rgba(59, 130, 246, 0.25)', borderLeft: '6px solid #3B82F6',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <motion.span animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} style={{ fontSize: 16, display: 'block' }}>⚙️</motion.span>
        <div>
          <p style={{ fontSize: 12, fontWeight: 800, color: '#1E40AF', margin: 0, fontFamily: 'Outfit' }}>Credentials Evaluation Under Vetting</p>
          <p style={{ fontSize: 10, fontWeight: 500, color: '#3B82F6', margin: '2px 0 0' }}>Board verifying active social endpoints. Queue estimate: 2 hours</p>
        </div>
      </div>
      <div style={{ padding: '4px 10px', borderRadius: 6, background: '#3B82F6', color: '#fff', fontSize: 9, fontWeight: 800 }}>PENDING AUDIT</div>
    </motion.div>
  );

  return null;
};

// ─── Trial Active / Portfolio Banner ─────────────────────────────────────────────
const PortfolioBanner = ({ verificationStatus, portfolioActive, navigate }) => {
  if (portfolioActive) {
    const exp = parseInt(localStorage.getItem('cb_portfolio_expiry') || '0');
    const date = exp ? new Date(exp).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '2028';
    return (
      <motion.div {...fadeUp(0.03)} style={{
        background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(16px)', borderRadius: 12,
        padding: '14px 18px', marginBottom: 18, border: '1px solid rgba(16, 185, 129, 0.25)', borderLeft: '6px solid #10B981',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>⚡</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, color: '#065F46', margin: 0, fontFamily: 'Outfit' }}>Verified Listing & Portfolio Live</p>
            <p style={{ fontSize: 10, fontWeight: 500, color: '#047857', margin: '2px 0 0' }}>Active listing visible to corporate marketing managers · Valid until {date}</p>
          </div>
        </div>
        <div style={{ padding: '4px 10px', borderRadius: 6, background: '#10B981', color: '#fff', fontSize: 9, fontWeight: 800 }}>LISTING LIVE</div>
      </motion.div>
    );
  }

  if (verificationStatus !== 'APPROVED') return null;
  const trialStart = parseInt(localStorage.getItem('cb_trial_start') || '0');
  const daysUsed = trialStart ? Math.floor((Date.now() - trialStart) / 86400000) : 0;
  const daysLeft = Math.max(0, 30 - daysUsed);

  if (!daysLeft && !trialStart) return null;

  const conf = daysLeft === 0
    ? { emoji: '⚠️', border: '#EF4444', tc: '#DC2626', sc: '#EF4444', msg: 'Trial Period Expired', sub: 'Activate lifetime listing to restore dashboard analytics', btn: 'Activate Lifetime', btnBg: '#DC2626' }
    : daysLeft < 7
    ? { emoji: '⏳', border: '#FCD34D', tc: '#D97706', sc: '#B45309', msg: `Trial period expires in ${daysLeft} days`, sub: 'Setup lifetime listing for ₹199', btn: 'Verify Now', btnBg: C.saffron }
    : { emoji: '🎉', border: '#86EFAC', tc: '#065F46', sc: '#047857', msg: `Trial Period Active · ${daysLeft} days remaining`, sub: 'Enjoy full discovery privileges. Upgrade to Pro Elite at ₹199', btn: 'Go Lifetime Pro', btnBg: C.green };

  return (
    <motion.div {...fadeUp(0.03)} style={{
      background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(16px)', borderRadius: 12,
      padding: '14px 18px', marginBottom: 18, border: `1px solid ${conf.border}40`, borderLeft: `6px solid ${conf.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 16 }}>{conf.emoji}</span>
        <div>
          <p style={{ fontSize: 12, fontWeight: 800, color: conf.tc, margin: 0, fontFamily: 'Outfit' }}>{conf.msg}</p>
          <p style={{ fontSize: 10, fontWeight: 500, color: conf.sc, margin: '2px 0 0' }}>{conf.sub}</p>
        </div>
      </div>
      <button onClick={() => navigate('/creator/monetization')} style={{
        padding: '6px 12px', borderRadius: 6, background: conf.btnBg,
        border: 'none', color: '#fff', fontSize: 11, fontWeight: 800, cursor: 'pointer'
      }}>{conf.btn}</button>
    </motion.div>
  );
};

// ─── Upgrade Pro Gated Console Banner ───────────────────────────────────────────
const UpgradeProBanner = ({ onUpgradeClick }) => (
  <motion.div
    {...fadeUp(0.04)}
    whileHover={{ y: -2 }}
    style={{
      background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(16px)',
      borderRadius: 16, padding: '16px 20px', marginBottom: 20, border: `1.5px solid ${C.saffron}25`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      cursor: 'pointer', boxShadow: '0 4px 24px rgba(15,23,42,0.015)'
    }}
    onClick={onUpgradeClick}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: 'rgba(255, 148, 49, 0.1)', color: '#FF7A00',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        <Sparkles size={16} fill="currentColor" />
      </div>
      <div>
        <h4 style={{ fontSize: 13, fontWeight: 800, color: C.navy, margin: 0, fontFamily: 'Outfit' }}>Go Pro Elite for Lifetime Console Access</h4>
        <p style={{ fontSize: 10, color: C.slate, fontWeight: 500, margin: '2px 0 0' }}>Unlock verified blue checkmark, real-time views sparklines, advanced demographics, and priority search ranking</p>
      </div>
    </div>
    <button style={{
      padding: '8px 14px', borderRadius: 8, background: C.navy,
      color: '#fff', fontSize: 11, fontWeight: 800, border: 'none', cursor: 'pointer'
    }}>Upgrade for ₹199</button>
  </motion.div>
);

// ─── Razorpay Simulation Modal ──────────────────────────────────────────────────
const UpgradeModal = ({ isOpen, onClose, onPaymentSuccess }) => {
  const [step, setStep] = useState('summary');
  const [method, setMethod] = useState('upi');

  if (!isOpen) return null;

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
        setStep('summary');
      }, 1500);
    }, 1500);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100000, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 20,
      background: 'rgba(15,23,42,0.35)', backdropFilter: 'blur(4px)'
    }}>
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        style={{
          background: '#fff', borderRadius: 16, padding: '24px',
          maxWidth: 360, width: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          position: 'relative'
        }}
      >
        {step !== 'processing' && <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: C.slateLight, fontSize: 14, cursor: 'pointer' }}>✕</button>}

        {step === 'summary' && (
          <div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: C.saffronLight, color: C.saffron, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Sparkles size={18} fill="currentColor" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, textAlign: 'center', margin: 0, fontFamily: 'Outfit' }}>Razorpay Secure Checkout</h3>
            <p style={{ fontSize: 11, color: C.slate, textAlign: 'center', margin: '2px 0 16px', fontWeight: 500 }}>Upgrade to Creator Pro Lifetime Console</p>

            <div style={{ background: C.bg, padding: 12, borderRadius: 10, border: `1px solid ${C.borderLight}`, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: C.slate, marginBottom: 5 }}>
                <span>Order ID</span><span style={{ color: C.navy, fontFamily: 'monospace' }}>CB-PRO-{Date.now().toString().slice(-6)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: C.slate, marginBottom: 8 }}>
                <span>Package</span><span style={{ color: C.navy }}>Pro Elite Lifetime</span>
              </div>
              <div style={{ height: 1, background: C.borderLight, marginBottom: 8 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, color: C.navy }}>
                <span>Amount Due</span><span style={{ color: C.green }}>₹199.00</span>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 9, fontWeight: 800, color: C.slate, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Payment Option</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[{ id: 'upi', label: 'UPI (GPay, PhonePe, Paytm)', desc: 'Instant activation via QR code', icon: '⚡' }, { id: 'card', label: 'Credit / Debit Card', desc: 'Secure payment gateway', icon: '💳' }].map(m => (
                  <div key={m.id} onClick={() => setMethod(m.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                    borderRadius: 8, border: `1px solid ${method === m.id ? C.saffron : C.border}`,
                    background: method === m.id ? C.saffronLight : '#fff', cursor: 'pointer'
                  }}>
                    <span style={{ fontSize: 14 }}>{m.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: C.navy, margin: 0 }}>{m.label}</p>
                      <p style={{ fontSize: 9, color: C.slate, margin: 0, fontWeight: 500 }}>{m.desc}</p>
                    </div>
                    <div style={{
                      width: 12, height: 12, borderRadius: '50%',
                      border: `1px solid ${method === m.id ? C.saffron : C.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {method === m.id && <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.saffron }} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handlePay} style={{
              width: '100%', padding: '12px', borderRadius: 8,
              background: C.navy, color: '#fff', fontSize: 12, fontWeight: 800,
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 6
            }}>
              Pay ₹199 & Activate Instant
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ display: 'inline-block', width: 32, height: 32, borderRadius: '50%', border: `3px solid ${C.saffronLight}`, borderTopColor: C.saffron, animation: 'spin 1s linear infinite' }} />
            <h4 style={{ fontSize: 14, fontWeight: 800, marginTop: 14, marginBottom: 4, fontFamily: 'Outfit' }}>Processing Sandbox Checkout...</h4>
            <p style={{ fontSize: 10, color: C.slate, fontWeight: 500 }}>Authenticating secure Razorpay parameters</p>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#F0FDF4', color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 20 }}>✓</div>
            <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 4, fontFamily: 'Outfit', color: C.green }}>Credentials Verified!</h4>
            <p style={{ fontSize: 11, color: C.slate, fontWeight: 500 }}>Upgrade complete. Analytics console initialized</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ─── Developer Console Simulator ───────────────────────────────────────────────
const DevBar = ({ profileCompleted, verificationStatus, updateProfileComplete, updateVerification, handleResetAll, isPro, dsp, toast }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isNoProfile = !profileCompleted && verificationStatus === 'DRAFT';
  const isDraft = profileCompleted && verificationStatus === 'DRAFT';
  const isPending = profileCompleted && verificationStatus === 'PENDING_APPROVAL';
  const isApproved = profileCompleted && verificationStatus === 'APPROVED';

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            style={{
              width: 40, height: 40, borderRadius: 10, background: C.navy,
              border: `1px solid ${C.saffron}30`, color: C.saffron,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings size={16} className="spin-slow" />
            <span style={{ position: 'absolute', top: -2, right: -2, display: 'flex', height: 6, width: 6 }}>
              <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: 6, width: 6, backgroundColor: '#EF4444' }} />
            </span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            style={{
              width: 280, background: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(255, 122, 0, 0.25)', borderRadius: 12,
              padding: 14, boxShadow: '0 15px 40px rgba(255, 122, 0, 0.12)', color: '#0F172A'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Settings size={12} color={C.saffron} />
                <span style={{ fontSize: 11, fontWeight: 800, color: '#0F172A' }}>Developer Tools</span>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
              {[
                { label: '1. No Credentials', desc: 'Simulate new signup', active: isNoProfile, act: () => { updateProfileComplete(false); updateVerification('DRAFT'); } },
                { label: '2. Setup Complete', desc: 'Checklist completed (Draft)', active: isDraft, act: () => { updateProfileComplete(true); updateVerification('DRAFT'); } },
                { label: '3. Compliance Vetting', desc: 'Pending admin review', active: isPending, act: () => { updateProfileComplete(true); updateVerification('PENDING_APPROVAL'); } },
                { label: '4. Active Partner', desc: 'Verified public dashboard', active: isApproved, act: () => { updateProfileComplete(true); updateVerification('APPROVED'); } }
              ].map(st => (
                <button
                  key={st.label}
                  onClick={st.act}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '6px 8px', borderRadius: 6,
                    background: st.active ? 'rgba(255,122,0,0.08)' : '#F8FAFC',
                    border: `1px solid ${st.active ? C.saffron : '#E2E8F0'}`,
                    color: st.active ? C.saffron : '#334155',
                    cursor: 'pointer', textAlign: 'left', width: '100%'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, display: 'block' }}>{st.label}</span>
                    <span style={{ fontSize: 7, color: '#64748B', fontWeight: 500 }}>{st.desc}</span>
                  </div>
                  {st.active && <div style={{ width: 4, height: 4, borderRadius: '50%', background: C.saffron }} />}
                </button>
              ))}
            </div>

            {/* Pro Upgrade Toggle */}
            <div style={{
              padding: '8px', borderRadius: 6, background: isPro ? 'rgba(16,185,129,0.08)' : '#F8FAFC',
              border: `1px solid ${isPro ? C.green : '#E2E8F0'}`, marginBottom: 10,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: 9, fontWeight: 800, color: isPro ? C.green : '#0F172A' }}>Pro Elite Lifetime</span>
                <span style={{ fontSize: 7, display: 'block', color: '#64748B', fontWeight: 500 }}>Toggle views/sparklines gate</span>
              </div>
              <button
                onClick={() => { dsp({ t: 'SET_PRO' }); toast(isPro ? 'Revoked Pro' : 'Granted Pro Elite!', isPro ? 'info' : 'success'); }}
                style={{
                  padding: '3px 6px', borderRadius: 4, background: isPro ? C.green : '#0F172A',
                  border: 'none', color: '#fff', fontSize: 8, fontWeight: 800, cursor: 'pointer'
                }}
              >
                {isPro ? 'Revoke' : 'Grant'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: 8 }}>
              <span style={{ fontSize: 7, color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase' }}>Database sandbox</span>
              <button onClick={handleResetAll} style={{
                padding: '3px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.15)',
                border: 'none', color: '#EF4444', fontSize: 8, fontWeight: 800, cursor: 'pointer'
              }}>Reset</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin-slow { animation: spinSlow 18s linear infinite; }
      `}</style>
    </div>
  );
};

// ─── Welcome Onboarding Slides ──────────────────────────────────────────────────
const SLIDES = [
  { index: 0, title: 'Namaste, Creator! 🇮🇳', description: "Welcome to CreatorBharat — India's elite brand cooperation gateway. Let's sync your creator credentials.", icon: Sparkles, color: C.saffron },
  { index: 1, title: 'Live Interactive Portfolio 📸', description: "Configure your digital profile hub connected directly to verified social APIs. Brands search you directly.", icon: Globe, color: '#6366F1' },
  { index: 2, title: 'Escrow Protected Deals 🔒', description: "Accept briefs and get paid via secure escrow verification before you upload a single content asset.", icon: ShieldCheck, color: C.green },
];

// ─── Internal Helpers ────────────────────────────────────────────────────────────
const getCreatorProfile = st => {
  if (!st.user) return null;
  const allC = LS.get('cb_creators', []);
  const found = st.user?.creatorProfile || st.creatorProfile || allC.find(cr => cr.email === st.user?.email);
  
  const getCleanFallback = (profile) => {
    const raw = profile?.handle || st.user?.handle || profile?.name?.toLowerCase().replace(/\s+/g, '-') || st.user?.email?.split('@')[0] || 'elite';
    return raw.startsWith('@') ? raw.slice(1) : raw;
  };

  if (found) {
    const cleanHandle = getCleanFallback(found);
    return {
      id: found.id || cleanHandle,
      slug: found.slug || cleanHandle,
      ...found
    };
  }

  const cleanHandle = getCleanFallback();
  return {
    id: st.user?.id || cleanHandle,
    slug: st.user?.slug || cleanHandle,
    name: st.user?.name || 'Creator',
    handle: st.user?.handle || `@${cleanHandle}`,
    email: st.user?.email || '',
    city: st.user?.city || '',
    state: st.user?.state || '',
    followers: 120000,
    score: 88,
    niche: 'Digital Creator',
    bio: '',
    gallery: [],
    full_story: { p1: '', quote: '', p2: '', p3: '' },
    milestones: [],
    services: [],
    awards: [],
    collabs: []
  };
};

const getMyApps = st => LS.get('cb_applications', []).filter(a => a.applicantEmail === st.user?.email);

const checkFlags = c => {
  const hasIdentity = !!(c?.name && c?.bio);
  const hasSocials = !!(c?.instagram || c?.youtube);
  const hasStory = !!(c?.full_story?.p1 && c?.milestones?.length > 0);
  const hasServices = !!(c?.rateMin && c?.services?.length > 0);
  return { hasIdentity, hasSocials, hasStory, hasServices, allChecksComplete: hasIdentity && hasSocials && hasStory && hasServices };
};

// ─── Main Component ──────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { st, dsp } = useApp();
  const navigate = useNavigate();

  const [welcomeSeen, setWelcomeSeen] = useState(() => localStorage.getItem('cb_welcome_seen') === 'true');
  const [profileCompleted, setProfileCompleted] = useState(() => localStorage.getItem('cb_profile_completed') === 'true');
  const [verificationStatus, setVerificationStatus] = useState(() => localStorage.getItem('cb_verification_status') || 'DRAFT');
  const [activeSlide, setActiveSlide] = useState(0);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [totalSystemUsers, setTotalSystemUsers] = useState(0);
  const [matchingCampaigns, setMatchingCampaigns] = useState([]);
  const [portfolioActive, setPortfolioActive] = useState(() => localStorage.getItem('cb_portfolio_active') === 'true');
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [profileViews, setProfileViews] = useState(() => {

    const v = localStorage.getItem('cb_profile_views');
    if (!v) {
      localStorage.setItem('cb_profile_views', '1424');
      return 1424;
    }
    return parseInt(v);
  });

  const followingCB = st.follows?.includes('creatorbharat-official') || false;
  const toast = useCallback((msg, type) => dsp({ t: 'TOAST', d: { type, msg } }), [dsp]);

  const updateVerification = v => {
    setVerificationStatus(v);
    localStorage.setItem('cb_verification_status', v);
    if (v === 'APPROVED') {
      if (!localStorage.getItem('cb_trial_start')) localStorage.setItem('cb_trial_start', String(Date.now()));
    } else {
      localStorage.removeItem('cb_trial_start');
    }
  };

  const updateProfileComplete = v => {
    setProfileCompleted(v);
    localStorage.setItem('cb_profile_completed', v ? 'true' : 'false');
  };

  const c = getCreatorProfile(st);
  const myApps = getMyApps(st);
  const score = c ? (c.score || fmt.score(c)) : 88;
  const { hasIdentity, hasSocials, hasStory, hasServices, allChecksComplete } = checkFlags(c);
  const isLocked = verificationStatus !== 'APPROVED';
  const isAnalyticsLocked = !st.isPro;
  const [mediaKitOpen, setMediaKitOpen] = useState(false);

  const sanitizedMediaKitCreator = useMemo(() => {
    if (!c) return null;
    return {
      id: c.id,
      name: c.name,
      handle: c.handle,
      slug: c.slug,
      bio: c.bio,
      photo: c.photo,
      coverImage: c.coverImage || c.cover_image,
      city: c.city,
      state: c.state,
      niche: c.niche,
      platform: c.platform,
      followers: c.followers,
      engagementRate: c.engagementRate || c.er,
      services: c.services,
      packages: c.packages,
      milestones: c.milestones,
      socialLinks: c.socialLinks || c.social_links,
      gallery: c.gallery,
      collabs: c.collabs,
      reviews: c.reviews,
      isVerified: c.isVerified,
      isPro: c.isPro,
      score: c.score,
      fullStory: c.fullStory || c.full_story,
      localHubs: c.localHubs || c.local_hubs,
      rateMin: c.rateMin,
      rateMax: c.rateMax
    };
  }, [c]);

  const stats = useMemo(() => {
    if (!c) return { followers: 0, er: 0, reach: 0, authenticity: 0, score: 0 };
    const rawFollowers = c.followers;
    const followers = (rawFollowers !== undefined && rawFollowers !== null) ? Number(rawFollowers) : 0;
    const er = (c.engagementRate !== undefined && c.engagementRate !== null)
      ? Number(c.engagementRate)
      : ((c.er !== undefined && c.er !== null) ? Number(c.er) : 0);
    const scoreVal = (score !== undefined && score !== null)
      ? Number(score)
      : ((c.score !== undefined && c.score !== null) ? Number(c.score) : 0);
    return {
      followers,
      er,
      reach: c.reach !== undefined ? Number(c.reach) : 0,
      authenticity: c.authenticity !== undefined ? Number(c.authenticity) : 0,
      score: scoreVal
    };
  }, [c, score]);

  useEffect(() => {
    const v = parseInt(localStorage.getItem('cb_profile_views') || '1424');
    const nv = v + 1;
    localStorage.setItem('cb_profile_views', String(nv));
    setProfileViews(nv);
  }, []);

  useEffect(() => {
    if (allChecksComplete !== profileCompleted) updateProfileComplete(allChecksComplete);
  }, [allChecksComplete]);

  useEffect(() => {
    let active = true;
    fetchCreators({ limit: 100 }).then(l => {
      if (active) setTotalSystemUsers(l.length);
    }).catch(() => {});

    fetchCampaigns().then(list => {
      if (!active) return;
      const niche = Array.isArray(c?.niche) ? c.niche : [c?.niche].filter(Boolean);
      let matched = list;
      if (niche.length) {
        matched = list.filter(camp => niche.some(n => (camp.niche || camp.title || '').toLowerCase().includes(n.toLowerCase())));
      }
      setMatchingCampaigns((matched.length ? matched : list).slice(0, 4));
    }).catch(() => {});

    return () => { active = false; };
  }, []);

  // Poll unread notification count every 60s
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { apiCall } = await import('../../utils/api');
        const data = await apiCall('/notifications');
        setUnreadNotifCount(data.unreadCount || 0);
      } catch { /* backend offline or not logged in */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleNextSlide = () => {
    if (activeSlide < SLIDES.length - 1) {
      setActiveSlide(activeSlide + 1);
    } else {
      localStorage.setItem('cb_welcome_seen', 'true');
      setWelcomeSeen(true);
      toast("Welcome! Let's setup your console dashboard.", 'success');
    }
  };

  const handleMockPayment = () => {
    setLoadingPayment(true);
    setTimeout(() => {
      setLoadingPayment(false);
      updateVerification('APPROVED');
      setPortfolioActive(true);
      localStorage.setItem('cb_portfolio_active', 'true');
      localStorage.setItem('cb_portfolio_expiry', String(Date.now() + 63072000000));
      toast('Verification complete. Lifetime active! 🎉', 'success');
    }, 1500);
  };

  const handleFreeSubmit = () => {
    updateVerification('PENDING_APPROVAL');
    toast('Profile submitted for review!', 'success');
  };

  const handleResetAll = () => {
    ['cb_welcome_seen', 'cb_profile_completed', 'cb_verification_status', 'cb_trial_start', 'cb_portfolio_active', 'cb_portfolio_expiry'].forEach(k => localStorage.removeItem(k));
    dsp({ t: 'SET_PRO', isPro: false });
    setWelcomeSeen(false);
    setProfileCompleted(false);
    setVerificationStatus('DRAFT');
    setPortfolioActive(false);
    setActiveSlide(0);
    toast('Dashboard state reset successfully!', 'info');
  };

  const handleToggleCB = () => {
    dsp({ t: 'FOLLOW', id: 'creatorbharat-official' });
    toast(!followingCB ? '🎉 Now following @CreatorBharat!' : 'Unfollowed Page', !followingCB ? 'success' : 'info');
  };

  const handleUpgradeSuccess = () => {
    dsp({ t: 'SET_PRO' });
    updateVerification('APPROVED');
    setPortfolioActive(true);
    localStorage.setItem('cb_portfolio_active', 'true');
    localStorage.setItem('cb_portfolio_expiry', String(Date.now() + 63072000000));
    toast('Upgrade to Pro Elite successful! views chart unlocked. 🎉', 'success');
  };

  return (
    <div style={{ background: C.bg, minHeight: '100%', paddingBottom: '60px', position: 'relative' }}>
      {/* Monochromatic background texture */}
      <AmbientDotGrid />

      {/* Onboarding Dialog */}
      <AnimatePresence>
        {!welcomeSeen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.3)',
              backdropFilter: 'blur(6px)', zIndex: 99999, display: 'flex',
              alignItems: 'center', justifyContent: 'center', padding: 20
            }}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              style={{ background: '#fff', borderRadius: 16, padding: '32px', maxWidth: 400, width: '100%', border: `1px solid ${C.border}` }}
            >
              <div style={{ display: 'flex', gap: 6, marginBottom: 24, justifyContent: 'center' }}>
                {SLIDES.map((s, idx) => (
                  <div key={s.index} style={{
                    height: 3, borderRadius: 2,
                    background: idx <= activeSlide ? C.navy : C.border,
                    width: idx === activeSlide ? 20 : 6, transition: 'all 0.2s'
                  }} />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ textAlign: 'center' }}
                >
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: C.navy, margin: '0 0 8px', fontFamily: 'Outfit' }}>{SLIDES[activeSlide].title}</h2>
                  <p style={{ fontSize: 13, color: C.slate, fontWeight: 500, lineHeight: 1.5, margin: '0 0 20px' }}>{SLIDES[activeSlide].description}</p>
                </motion.div>
              </AnimatePresence>

              <div style={{ display: 'flex', gap: 8 }}>
                {activeSlide > 0 && (
                  <button onClick={() => setActiveSlide(activeSlide - 1)} style={{
                    flex: 1, padding: '10px', borderRadius: 8,
                    background: '#fff', border: `1px solid ${C.border}`,
                    color: C.slate, fontSize: 12, fontWeight: 700, cursor: 'pointer'
                  }}>Back</button>
                )}
                <button onClick={handleNextSlide} style={{
                  flex: 2, padding: '10px', borderRadius: 8,
                  background: C.navy, border: 'none', color: '#fff',
                  fontSize: 12, fontWeight: 800, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
                }}>
                  {activeSlide === SLIDES.length - 1 ? 'Get Started 🚀' : 'Continue'}
                  {activeSlide < SLIDES.length - 1 && <ArrowRight size={12} />}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid View */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px', position: 'relative', zIndex: 1 }}>

        {/* Minimal Page Header */}
        <motion.div {...fadeUp(0)} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <MiniBadge color={C.navy} bg={C.borderLight}>CREATOR CONSOLE</MiniBadge>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: C.navy, margin: '6px 0 2px', letterSpacing: '-0.02em', fontFamily: 'Outfit, sans-serif' }}>
                Namaste, {(c?.name || st.user?.name || 'Creator').split(' ')[0]}
              </h1>
              <span style={{ fontSize: 12, color: C.slateLight, fontWeight: 500 }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* Notification Bell */}
              <button
                onClick={() => navigate('/creator/notifications')}
                style={{
                  width: 36, height: 36, borderRadius: 8, background: '#fff',
                  border: `1px solid ${C.border}`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <Bell size={14} color={unreadNotifCount > 0 ? C.saffron : C.slate} />
                {unreadNotifCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16,
                    borderRadius: 8, background: C.saffron, color: '#fff',
                    fontSize: 9, fontWeight: 900, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', padding: '0 3px',
                    border: '2px solid #fff', lineHeight: 1
                  }}>
                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                  </span>
                )}
              </button>
              {/* Settings */}
              <button
                onClick={() => navigate('/creator/settings')}
                style={{
                  width: 36, height: 36, borderRadius: 8, background: '#fff',
                  border: `1px solid ${C.border}`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
              >
                <Settings size={14} color={C.slate} />
              </button>
            </div>

          </div>
        </motion.div>

        {/* Banners */}
        <StatusBanner
          profileCompleted={profileCompleted}
          verificationStatus={verificationStatus}
          totalSystemUsers={totalSystemUsers}
          loadingPayment={loadingPayment}
          handleFreeSubmit={handleFreeSubmit}
          handleMockPayment={handleMockPayment}
          navigate={navigate}
        />
        <PortfolioBanner
          verificationStatus={verificationStatus}
          portfolioActive={portfolioActive}
          navigate={navigate}
        />
        {isAnalyticsLocked && <UpgradeProBanner onUpgradeClick={() => setIsUpgradeOpen(true)} />}

        {/* Bento Grid */}
        <div className="cb-bento-grid">
          {/* Row 1: Hero */}
          <BentoHero
            creator={c}
            verificationStatus={verificationStatus}
            score={score}
            navigate={navigate}
            isPro={st.isPro}
            dsp={dsp}
          />

          {/* Row 2: Performance pulse chart & commands */}
          <PerformancePulse
            views={profileViews}
            isAnalyticsLocked={isAnalyticsLocked}
            onUpgradeClick={() => setIsUpgradeOpen(true)}
          />
          <CommandCenter navigate={navigate} isLocked={isLocked} />

          {/* Row 3: Wallet escrow ledger, geography details & milestone checks */}
          <WalletBento isLocked={isLocked} navigate={navigate} />
          <GeographyBento isLocked={isLocked} isAnalyticsLocked={isAnalyticsLocked} onUpgradeClick={() => setIsUpgradeOpen(true)} />
          <MilestoneBento followers={c?.followers || 0} navigate={navigate} />

          {/* Row 4: Brief campaigns match & applications tracking */}
          <CampaignsBento campaigns={matchingCampaigns} isLocked={isLocked} navigate={navigate} />
          <ApplicationPulse myApps={myApps} isLocked={isLocked} navigate={navigate} />

          {/* Row 5: Checklist panel & Media Kit PDF generator */}
          <OnboardingPanel
            hasIdentity={hasIdentity}
            hasSocials={hasSocials}
            hasStory={hasStory}
            hasServices={hasServices}
            allChecksComplete={allChecksComplete}
            verificationStatus={verificationStatus}
            handleFreeSubmit={handleFreeSubmit}
            navigate={navigate}
          />
          <CBAndMediaKitBento
            creator={c}
            followingCB={followingCB}
            onToggleFollow={handleToggleCB}
            isLocked={isLocked}
            navigate={navigate}
            dsp={dsp}
            onOpenMediaKit={() => setMediaKitOpen(true)}
          />
        </div>
      </div>

      {/* Upgrade sandbox Sim modal */}
      <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} onPaymentSuccess={handleUpgradeSuccess} />

      {/* Media Kit Preview Modal */}
      {sanitizedMediaKitCreator && stats && (
        <MediaKitPreview
          open={mediaKitOpen}
          onClose={() => setMediaKitOpen(false)}
          creator={sanitizedMediaKitCreator}
          stats={stats}
        />
      )}

      {/* Floating State DevBar */}
      {import.meta.env.DEV && (
        <DevBar
          profileCompleted={profileCompleted}
          verificationStatus={verificationStatus}
          updateProfileComplete={updateProfileComplete}
          updateVerification={updateVerification}
          handleResetAll={handleResetAll}
          isPro={st.isPro}
          dsp={dsp}
          toast={toast}
        />
      )}

      {/* Responsive Bento Layout Styles */}
      <style>{`
        * { box-sizing: border-box; }
        .cb-bento-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 20px;
        }
        @media (max-width: 1024px) {
          .cb-bento-grid {
            grid-template-columns: repeat(6, 1fr);
          }
          .cb-bento-tile {
            grid-column: span 6 !important;
          }
        }
        @media (max-width: 768px) {
          .cb-bento-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .hero-flex {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 20px !important;
          }
        }
        ::-webkit-scrollbar { height: 4px; width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 100px; }
      `}</style>
    </div>
  );
}
