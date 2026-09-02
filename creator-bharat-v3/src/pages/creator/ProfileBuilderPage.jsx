import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../core/context';
import { LS, fmt } from '../../utils/helpers';
import { Btn, Card, Fld, Bdg, Ring, Bar } from '../../components/common/Primitives';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Globe, Camera, Image as ImageIcon, CheckCircle2, ChevronRight, Sparkles,
  BookOpen, Layers, MapPin, Plus, Trash2, Loader2, ExternalLink,
  Shield, Megaphone, Lock, Link2, Phone, MessageCircle, Star,
  AtSign, Video, MessageSquare, Download
} from 'lucide-react';
import AuthGatekeeper from '../../components/auth/AuthGatekeeper';
import { MediaKitPreview } from '../../components/creators/profile/MediaKitPreview';
import { updateCreatorProfile } from '../../utils/platformService';
import { uploadFile } from '../../utils/uploadService';
import { ENV } from '@/config/env';

// ─── Step Nav Item ──────────────────────────────────────────────────────────
const StepNavItem = ({ id, label, icon: Icon, active, completed, onClick }) => (
  <button
    onClick={onClick}
    className={`step-nav-item ${active ? 'active' : ''} ${completed ? 'completed' : ''}`}
    style={{ position: 'relative' }}
  >
    <div className="step-nav-icon-box">
       {completed && !active ? <CheckCircle2 size={18} /> : <Icon size={18} />}
    </div>
    <span className="step-nav-label">{label}</span>
    {active && <ChevronRight size={16} className="active-chevron" style={{ opacity: 0.5, color: '#FFF' }} />}
  </button>
);

StepNavItem.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  active: PropTypes.bool.isRequired,
  completed: PropTypes.bool,
  onClick: PropTypes.func.isRequired
};

const FullScreenSaveOverlay = ({ show, title = 'Syncing Profile...', subtitle = 'Securing your portfolio to the cloud' }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          color: '#fff',
          fontFamily: 'Outfit, sans-serif'
        }}
      >
        <div style={{ position: 'relative', width: 90, height: 90, marginBottom: 20 }}>
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px dashed #FF9431',
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 15,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF9431, #EA580C)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(255,148,49,0.4)'
          }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            >
              <Loader2 size={28} style={{ color: '#fff' }} />
            </motion.div>
          </div>
        </div>
        <motion.h4
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          style={{ fontSize: 18, fontWeight: 950, margin: '0 0 8px 0', letterSpacing: '0.02em' }}
        >
          {title}
        </motion.h4>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 0.7 }}
          transition={{ delay: 0.3 }}
          style={{ fontSize: 13, fontWeight: 600, margin: 0 }}
        >
          {subtitle}
        </motion.p>
      </motion.div>
    )}
  </AnimatePresence>
);

FullScreenSaveOverlay.propTypes = {
  show: PropTypes.bool.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string
};

// ─── Pro Lock Overlay ────────────────────────────────────────────────────────
const ProLockBanner = ({ onUpgrade }) => (
  <div style={{
    background: 'linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)',
    border: '1.5px solid rgba(255,148,49,0.3)',
    borderRadius: 16,
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 16
  }}>
    <div style={{ background: 'rgba(255,148,49,0.15)', borderRadius: 10, padding: 8 }}>
      <Lock size={18} color="#FF9431" />
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: 13, fontWeight: 900, color: '#92400e', marginBottom: 2 }}>Pro Feature</p>
      <p style={{ fontSize: 12, color: '#b45309', margin: 0 }}>Unlimited social links — upgrade to Pro (₹49/month)</p>
    </div>
    <button
      onClick={onUpgrade}
      style={{
        background: 'linear-gradient(90deg, #FF9431, #EA580C)',
        color: '#fff', border: 'none', borderRadius: 100,
        padding: '8px 16px', fontSize: 12, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap'
      }}
    >
      Upgrade ↗
    </button>
  </div>
);

ProLockBanner.propTypes = {
  onUpgrade: PropTypes.func.isRequired
};

const TabFooter = ({ onPrev, onNextText = 'Save and Continue →', onNext, disabled = false, mob }) => (
  <div style={{ 
    marginTop: '48px', 
    display: 'flex', 
    flexDirection: mob ? 'column-reverse' : 'row', 
    justifyContent: mob ? 'stretch' : (onPrev ? 'space-between' : 'flex-end'), 
    alignItems: 'center', 
    gap: 16 
  }}>
    {onPrev && (
      <button 
        type="button"
        onClick={onPrev} 
        className="btn-text-slate"
        style={{ width: mob ? '100%' : 'auto', padding: mob ? '12px' : '0', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
      >
        ← Previous
      </button>
    )}
    <Btn 
      lg 
      className="btn-primary-pill" 
      style={{ height: 'auto', padding: mob ? '14px 24px' : '16px 48px', width: mob ? '100%' : 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }} 
      onClick={onNext}
      disabled={disabled}
    >
      {onNextText}
    </Btn>
  </div>
);

TabFooter.propTypes = {
  onPrev: PropTypes.func,
  onNextText: PropTypes.string,
  onNext: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  mob: PropTypes.bool.isRequired
};

const StepInstructionBanner = ({ icon: Icon, title, reason, points = [] }) => (
  <div style={{
    background: 'rgba(255, 148, 49, 0.04)',
    border: '1px dashed rgba(255, 148, 49, 0.22)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    display: 'flex',
    gap: 14,
    alignItems: 'flex-start'
  }}>
    <div style={{
      background: 'rgba(255, 148, 49, 0.1)',
      color: '#FF9431',
      padding: 10,
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      <Icon size={20} />
    </div>
    <div style={{ flex: 1 }}>
      <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 900, color: '#0f172a' }}>{title}</h4>
      <p style={{ margin: '0 0 10px', fontSize: 12.5, fontWeight: 600, color: '#475569', lineHeight: 1.5 }}>
        <strong style={{ color: '#FF9431' }}>Why this matters:</strong> {reason}
      </p>
      {points.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {points.map((pt, i) => (
            <li key={i} style={{ fontSize: 11.5, fontWeight: 550, color: '#64748b', lineHeight: 1.4 }}>{pt}</li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

const PLATFORM_OPTIONS = ['Instagram', 'YouTube', 'LinkedIn', 'Twitter / X', 'Telegram', 'WhatsApp', 'Threads', 'Moj', 'ShareChat', 'Josh', 'Snapchat', 'Facebook', 'Pinterest', 'Twitch', 'Spotify', 'Discord', 'Reddit', 'GitHub', 'Behance', 'Dribbble', 'Medium', 'Website'];
const PLATFORM_EMOJI = {
  'Instagram': '📸', 'YouTube': '▶️', 'LinkedIn': '💼', 'Twitter / X': '𝕏',
  'Telegram': '✈️', 'WhatsApp': '💬', 'Threads': '🧵', 'Moj': '🎵',
  'ShareChat': '💬', 'Josh': '🎥', 'Snapchat': '👻', 'Facebook': '👥',
  'Pinterest': '📌', 'Twitch': '🎮', 'Spotify': '🎧', 'Discord': '👾',
  'Reddit': '🤖', 'GitHub': '💻', 'Behance': '🎨', 'Dribbble': '🏀',
  'Medium': '📝', 'Website': '🌐'
};
const PLATFORM_ICONS = {
  'Instagram': Link2, 'YouTube': Link2, 'Twitter / X': Link2,
  'LinkedIn': Link2, 'Website': Link2
};

const NICHES = ['Influencer', 'YouTuber', 'Lifestyle', 'Tech', 'Fashion', 'Beauty', 'Gaming', 'Finance', 'Travel', 'Comedy', 'Educational', 'Fitness', 'Food'];
const LANGUAGES = [
  'Hindi', 'English', 'Bengali', 'Marathi', 'Telugu', 'Tamil', 'Gujarati', 'Urdu',
  'Kannada', 'Odia', 'Malayalam', 'Punjabi', 'Assamese', 'Maithili', 'Bhojpuri',
  'Rajasthani', 'Haryanvi', 'Tulu', 'Awadhi', 'Other',
];

const getActiveStories = (stories) => {
  if (!Array.isArray(stories)) return [];
  const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;
  return stories.filter(story => {
    if (!story || !story.createdAt) return false;
    const age = Date.now() - new Date(story.createdAt).getTime();
    return age < FORTY_EIGHT_HOURS;
  });
};

const getMonthlyStoriesCount = (stories) => {
  if (!Array.isArray(stories)) return 0;
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  return stories.filter(s => {
    if (!s || !s.createdAt) return false;
    const age = Date.now() - new Date(s.createdAt).getTime();
    return age < THIRTY_DAYS;
  }).length;
};


// ─── Tab 1: Identity ──────────────────────────────────────────────────────────
const IdentityTabContent = ({ F, c, st, mob, upF, saveProfile, saving, dsp, openAiWriter }) => {
  const toggleNiche = (n) => {
    const current = F.niche || [];
    if (current.includes(n)) {
      upF('niche', current.filter(x => x !== n));
    } else {
      if (current.length >= 3) {
        alert('You can select up to 3 categories.');
        return;
      }
      upF('niche', [...current, n]);
    }
  };

  const toggleLanguage = (lang) => {
    const current = F.languages || [];
    if (current.includes(lang)) {
      upF('languages', current.filter(x => x !== lang));
    } else {
      upF('languages', [...current, lang]);
    }
  };

  return (
    <Card className="settings-form-card card-3d-effect">
       <h3 className="db-section-title">Step 1: Personal Identity</h3>
       <StepInstructionBanner 
          icon={User}
          title="Step 1: Identity & Bio Setup"
          reason="Brands search and filter creators by categories (niche), language, and city. A completed identity card is the first impression a corporate sponsor evaluates."
          points={[
            "Select up to 3 niches that define your content style.",
            "Write a clear, professional bio. Mention your audience focus.",
            "Add your active city and state to qualify for location-based offline campaigns."
          ]}
        />
       
       <div style={{ display: 'flex', flexDirection: mob ? 'column' : 'row', gap: '24px', marginBottom: '24px' }}>
          {/* Avatar Photo */}
          <div className="profile-visual-box" style={{ flex: 1, margin: 0 }}>
             <div className="avatar-preview-wrap">
                <img src={F.photo || c?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(st.user.name)}`} alt="" />
             </div>
             <div className="visual-actions">
                <input type="file" id="creator-photo-upload" accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) { 
                      dsp({ t: 'TOAST', d: { type: 'error', msg: 'Image size should not exceed 5MB' } }); 
                      return; 
                    }
                    dsp({ t: 'TOAST', d: { type: 'info', msg: 'Uploading profile photo...' } });
                    try {
                      const res = await uploadFile(file);
                      upF('photo', res.url);
                      dsp({ t: 'TOAST', d: { type: 'success', msg: 'Profile photo uploaded!' } });
                    } catch (err) {
                      dsp({ t: 'TOAST', d: { type: 'error', msg: err.message || 'Upload failed' } });
                    }
                  }}
                />
                <button type="button" className="btn-primary-pill" onClick={() => document.getElementById('creator-photo-upload').click()}>
                   <Camera size={14} /> Profile Photo
                </button>
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', fontWeight: 600 }}>Avatar (up to 5MB)</p>
             </div>
          </div>

          {/* Cover Photo */}
          <div className="profile-visual-box" style={{ flex: 2, margin: 0, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
             <div style={{ width: '100%', height: '80px', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                <img src={F.coverImage || c?.cover_image || c?.banner_image || c?.coverUrl || `https://picsum.photos/seed/cover/1600/500`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="cover banner" />
             </div>
             <div className="visual-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <input type="file" id="creator-cover-upload" accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) { 
                      dsp({ t: 'TOAST', d: { type: 'error', msg: 'Banner size should not exceed 5MB' } }); 
                      return; 
                    }
                    dsp({ t: 'TOAST', d: { type: 'info', msg: 'Uploading cover banner...' } });
                    try {
                      const res = await uploadFile(file);
                      upF('coverImage', res.url);
                      dsp({ t: 'TOAST', d: { type: 'success', msg: 'Cover banner uploaded!' } });
                    } catch (err) {
                      dsp({ t: 'TOAST', d: { type: 'error', msg: err.message || 'Upload failed' } });
                    }
                  }}
                />
                <button type="button" className="btn-primary-pill" onClick={() => document.getElementById('creator-cover-upload').click()}>
                   <Camera size={14} /> Cover Banner
                </button>
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', fontWeight: 600 }}>Horizontal (up to 3MB)</p>
             </div>
          </div>
       </div>

       <div className="form-stack">
          <Fld label="Full Name" value={F.name} onChange={e => upF('name', e.target.value)} placeholder="Amit Sharma" />
          <div style={{ position: 'relative' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Cinematic Bio (150 chars)</label>
                <button
                  type="button"
                  onClick={() => openAiWriter('bio', 150)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,148,49,0.08)', border: '1px solid rgba(255,148,49,0.2)', borderRadius: 100, padding: '4px 10px', fontSize: 11, fontWeight: 800, color: '#FF9431', cursor: 'pointer', outline: 'none' }}
                >
                  <Sparkles size={11} fill="#FF9431" fillOpacity={0.2} />
                  Write with AI
                </button>
             </div>
             <Fld value={F.bio} onChange={e => upF('bio', e.target.value.slice(0, 150))} rows={4} placeholder="I create high-impact tech reviews for regional India..." />
             <span style={{ position: 'absolute', bottom: 12, right: 16, fontSize: 11, color: (F.bio?.length || 0) >= 150 ? '#EF4444' : '#94a3b8', fontWeight: 600 }}>{F.bio?.length || 0}/150</span>
          </div>
          <Fld label="Professional Tagline / Headline (e.g. Gym Creator, YouTube Vlogger, Food Storyteller)" value={F.tagline} onChange={e => upF('tagline', e.target.value)} placeholder="Expert in FoodCulture Storytelling | Building authentic brand identities across Bharat." />
          
          {/* Categories / Niches */}
          <div style={{ marginBottom: '24px' }}>
             <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>
                Content Categories / Niches (Select up to 3)
             </label>
             <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                {NICHES.map(n => {
                  const isSel = (F.niche || []).includes(n);
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => toggleNiche(n)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '100px',
                        border: '1.5px solid ' + (isSel ? '#FF9431' : '#e2e8f0'),
                        background: isSel ? 'rgba(255, 148, 49, 0.08)' : '#fff',
                        color: isSel ? '#FF9431' : '#475569',
                        fontSize: '12px',
                        fontWeight: 750,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {n}
                    </button>
                  );
                })}
             </div>
          </div>

          {/* Content Languages */}
          <div style={{ marginBottom: '24px' }}>
             <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>
                Languages you make content in
             </label>
             <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                {LANGUAGES.map(lang => {
                  const isSel = (F.languages || []).includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '100px',
                        border: '1.5px solid ' + (isSel ? '#FF9431' : '#e2e8f0'),
                        background: isSel ? 'rgba(255, 148, 49, 0.08)' : '#fff',
                        color: isSel ? '#FF9431' : '#475569',
                        fontSize: '12px',
                        fontWeight: 750,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {lang}
                    </button>
                  );
                })}
             </div>
          </div>

          <Fld label="Full Address (Real Address)" value={F.address} onChange={e => upF('address', e.target.value)} placeholder="123 Street Name, Neighborhood, District, Jaipur, Rajasthan, 302001" />
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr 1fr', gap: '24px' }}>
             <Fld label="Base City" value={F.city} onChange={e => upF('city', e.target.value)} placeholder="Jaipur" />
             <Fld label="State / Region" value={F.state} onChange={e => upF('state', e.target.value)} placeholder="Rajasthan" />
             <Fld label="Connections / Reach count (e.g. 500+)" value={F.connections} onChange={e => upF('connections', e.target.value)} placeholder="500+ connections" />
          </div>
          
          <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
             <p style={{ fontSize: 13, fontWeight: 900, color: '#FF9431', marginBottom: 16, textTransform: 'uppercase' }}>Content Philosophy & Brand-Fit Intel</p>
             <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: '24px', marginBottom: '16px' }}>
                <Fld label="Content Philosophy Heading (e.g. My Content Vision)" value={F.philosophyTitle} onChange={e => upF('philosophyTitle', e.target.value)} placeholder="My Content Philosophy (The 'Why')" />
                <Fld label="Regional Dominance Heading (e.g. Heartland Core Reach)" value={F.dominanceTitle} onChange={e => upF('dominanceTitle', e.target.value)} placeholder="My Regional Dominance" />
             </div>
             <Fld label="Mera Content Philosophy (The 'Why')" value={F.philosophy} onChange={e => upF('philosophy', e.target.value)} rows={3} placeholder="Content creation isn't just about demonstrating silicon specifications..." />
             <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: '24px', marginTop: '16px' }}>
                <Fld label="AI Brand-Fit Match %" value={F.aiMatch} onChange={e => upF('aiMatch', e.target.value)} placeholder="98%" />
                <Fld label="Why You Fit Brands" value={F.aiSummary} onChange={e => upF('aiSummary', e.target.value)} placeholder="Vibrant Cinematic Editing, High Conversion ROI" />
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(3, 1fr)', gap: '16px', marginTop: '16px' }}>
                <Fld label="Brand Safety" value={F.aiSafety} onChange={e => upF('aiSafety', e.target.value)} placeholder="99% Secure" />
                <Fld label="Retention Score" value={F.aiRetention} onChange={e => upF('aiRetention', e.target.value)} placeholder="Excellent" />
                <Fld label="ROI Potential" value={F.aiRoi} onChange={e => upF('aiRoi', e.target.value)} placeholder="5.2x" />
             </div>
           </div>
        </div>

        <TabFooter 
          onNextText={saving ? "Saving..." : "Save Identity →"} 
          onNext={saveProfile} 
          disabled={saving} 
          mob={mob} 
        />
    </Card>
  );
};

IdentityTabContent.propTypes = {
  F: PropTypes.object.isRequired, c: PropTypes.object.isRequired, st: PropTypes.object.isRequired,
  mob: PropTypes.bool.isRequired, upF: PropTypes.func.isRequired, saveProfile: PropTypes.func.isRequired, saving: PropTypes.bool,
  openAiWriter: PropTypes.func
};

// ─── Tab 2: Social Ecosystem ──────────────────────────────────────────────────
const SocialTabContent = ({ F, mob, upF, upGallery, upSocialLink, addSocialLink, removeSocialLink, saveProfile, setTab, isPro, navigate }) => {
  const freeLimit = 0;
  const linksUsed = F.socialLinks?.filter(l => l.url).length || 0;

  const instagramFollowersInt = parseInt(F.instagramFollowers) || 0;
  const youtubeFollowersInt = parseInt(F.youtubeFollowers) || 0;
  const linkedinFollowersInt = parseInt(F.linkedinFollowers) || 0;
  const twitterFollowersInt = parseInt(F.twitterFollowers) || 0;
  const facebookFollowersInt = parseInt(F.facebookFollowers) || 0;
  const customFollowersSum = F.socialLinks?.filter(l => l.url).reduce((sum, l) => sum + (parseInt(l.followers) || 0), 0) || 0;
  const currentTotalReach = instagramFollowersInt + youtubeFollowersInt + linkedinFollowersInt + twitterFollowersInt + facebookFollowersInt + customFollowersSum;

  return (
    <Card className="settings-form-card card-3d-effect">
       <h3 className="db-section-title">Step 2: Social Ecosystem & Handles</h3>
       <StepInstructionBanner 
          icon={Globe}
          title="Step 2: Connect Social Handles"
          reason="Connecting social metrics proves your audience reach, engagement rate, and authentic follower count. Brands prioritize creators with connected active socials."
          points={[
            "Link your Instagram or YouTube handles.",
            "Double-check your follower count for accuracy — this is audit-verified by admin.",
            "Providing active channels increases deal opportunities by up to 2.5x."
          ]}
        />
       <p className="db-sub-text" style={{ marginBottom: 40 }}>Link your active social channels, add extra links, and showcase your visual gallery.</p>
       
      <div className="form-stack">
         {/* Primary Platforms */}
         <p style={{ fontSize: 13, fontWeight: 900, color: '#FF9431', marginBottom: 16, textTransform: 'uppercase' }}>Primary Platforms & Handles</p>
         <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: '24px' }}>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <Fld label="Instagram Profile Handle" value={F.instagram} onChange={e => upF('instagram', e.target.value)} placeholder="@username" />
              <Fld label="Instagram Followers" type="number" value={F.instagramFollowers} onChange={e => upF('instagramFollowers', e.target.value)} placeholder="e.g. 50000" style={{ marginTop: '8px' }} />
            </div>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <Fld label="YouTube Channel Link" value={F.youtube} onChange={e => upF('youtube', e.target.value)} placeholder="https://youtube.com/c/..." />
              <Fld label="YouTube Subscribers" type="number" value={F.youtubeFollowers} onChange={e => upF('youtubeFollowers', e.target.value)} placeholder="e.g. 120000" style={{ marginTop: '8px' }} />
            </div>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <Fld label="LinkedIn Profile URL" value={F.linkedin} onChange={e => upF('linkedin', e.target.value)} placeholder="https://linkedin.com/in/username" />
              <Fld label="LinkedIn Followers" type="number" value={F.linkedinFollowers} onChange={e => upF('linkedinFollowers', e.target.value)} placeholder="e.g. 15000" style={{ marginTop: '8px' }} />
            </div>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <Fld label="Twitter / X Profile URL" value={F.twitter} onChange={e => upF('twitter', e.target.value)} placeholder="https://twitter.com/username" />
              <Fld label="Twitter / X Followers" type="number" value={F.twitterFollowers} onChange={e => upF('twitterFollowers', e.target.value)} placeholder="e.g. 25000" style={{ marginTop: '8px' }} />
            </div>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <Fld label="Facebook Profile URL" value={F.facebook} onChange={e => upF('facebook', e.target.value)} placeholder="https://facebook.com/username" />
              <Fld label="Facebook Followers" type="number" value={F.facebookFollowers} onChange={e => upF('facebookFollowers', e.target.value)} placeholder="e.g. 8000" style={{ marginTop: '8px' }} />
            </div>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center' }}>
              <Fld label="Portfolio / Website URL" value={F.portfolio} onChange={e => upF('portfolio', e.target.value)} placeholder="https://mywork.com" style={{ width: '100%' }} />
            </div>
         </div>

          {/* Additional Social Links — Subscription Gated */}
          <div style={{ marginTop: 32, borderTop: '1px solid #f1f5f9', paddingTop: 32 }}>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 900, color: '#FF9431', textTransform: 'uppercase', margin: 0 }}>
                    Additional Social Links
                  </p>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0', fontWeight: 600 }}>
                    {isPro ? 'Unlimited links (Pro)' : 'Unlock Custom Links (Pro Feature)'}
                  </p>
                </div>
                {(isPro || linksUsed < freeLimit) && (
                  <button onClick={addSocialLink} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(255,148,49,0.1)', border: '1px solid rgba(255,148,49,0.3)',
                    color: '#FF9431', borderRadius: 100, padding: '8px 16px', fontSize: 12, fontWeight: 800, cursor: 'pointer'
                  }}>
                    <Plus size={14} /> Add Link
                  </button>
                )}
             </div>
             
             {F.socialLinks?.map((link, idx) => {
               const isLocked = !isPro && idx >= freeLimit;
               return (
                  <div key={idx} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: mob ? '1fr' : '180px 1.8fr 1.2fr 44px', 
                    gap: 12, 
                    marginBottom: 12,
                    background: mob ? '#f8fafc' : 'transparent',
                    padding: mob ? '16px' : '0',
                    borderRadius: mob ? '16px' : '0',
                    border: mob ? '1px solid #e2e8f0' : 'none',
                    alignItems: 'flex-start'
                  }}>
                    {link.platform === 'Custom Link' || !PLATFORM_OPTIONS.includes(link.platform) ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
                        <input
                          type="text"
                          value={link.platform === 'Custom Link' ? '' : link.platform}
                          onChange={e => upSocialLink(idx, 'platform', e.target.value || 'Custom Link')}
                          placeholder="Platform (e.g. Substack)"
                          disabled={isLocked}
                          style={{
                            width: '100%', padding: '10px 12px', borderRadius: 12, border: '1px solid #e2e8f0',
                            fontSize: 13, fontWeight: 700, color: '#0f172a', background: isLocked ? '#f8fafc' : '#fff',
                            height: '42px', boxSizing: 'border-box'
                          }}
                        />
                        <button 
                          onClick={() => upSocialLink(idx, 'platform', 'Instagram')}
                          style={{ fontSize: 10, color: '#FF9431', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', padding: 0, fontWeight: 700 }}
                        >
                          ← Standard
                        </button>
                      </div>
                    ) : (
                      <select
                        value={link.platform}
                        onChange={e => upSocialLink(idx, 'platform', e.target.value)}
                        disabled={isLocked}
                        style={{
                          width: '100%', padding: '10px 12px', borderRadius: 12, border: '1px solid #e2e8f0',
                          fontSize: 13, fontWeight: 700, color: '#0f172a', background: isLocked ? '#f8fafc' : '#fff',
                          cursor: isLocked ? 'not-allowed' : 'pointer', height: '42px'
                        }}
                      >
                        {PLATFORM_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        <option value="Custom Link">+ Custom Link / Other</option>
                      </select>
                    )}
                   <div style={{ position: 'relative' }}>
                     <input
                       type="text"
                       value={link.url}
                       onChange={e => upSocialLink(idx, 'url', e.target.value)}
                       placeholder="https://..."
                       disabled={isLocked}
                       style={{
                         width: '100%', padding: '10px 12px', borderRadius: 12,
                         border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 600,
                         color: '#0f172a', background: isLocked ? '#f8fafc' : '#fff',
                         boxSizing: 'border-box', cursor: isLocked ? 'not-allowed' : 'text', height: '42px'
                       }}
                     />
                     {isLocked && (
                       <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                         <Lock size={14} color="#FF9431" />
                       </div>
                     )}
                   </div>
                   <div>
                     <input
                       type="number"
                       value={link.followers || ''}
                       onChange={e => upSocialLink(idx, 'followers', e.target.value)}
                       placeholder="Followers"
                       disabled={isLocked}
                       style={{
                         width: '100%', padding: '10px 12px', borderRadius: 12,
                         border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 600,
                         color: '#0f172a', background: isLocked ? '#f8fafc' : '#fff',
                         boxSizing: 'border-box', cursor: isLocked ? 'not-allowed' : 'text', height: '42px'
                       }}
                     />
                   </div>
                   <button onClick={() => removeSocialLink(idx)} style={{
                     background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                     borderRadius: 12, color: '#EF4444', cursor: 'pointer', display: 'flex',
                     alignItems: 'center', justifyContent: 'center', flexShrink: 0, height: '42px', width: '100%'
                   }}>
                     <Trash2 size={14} />
                   </button>
                 </div>
               );
             })}

             {!isPro && linksUsed >= freeLimit && (
               <ProLockBanner onUpgrade={() => navigate('/creator/monetization')} />
             )}
          </div>

          {/* Dynamic dynamic calculated reach card */}
          <div style={{
            background: 'linear-gradient(135deg, #FFF8F0 0%, #FFF1E5 100%)',
            borderRadius: 24,
            padding: '24px',
            marginTop: 32,
            color: '#0F172A',
            border: '1.5px solid rgba(255,148,49,0.2)',
            display: 'flex',
            flexDirection: mob ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: mob ? 'flex-start' : 'center',
            gap: 16,
            boxShadow: '0 10px 30px rgba(255,148,49,0.05)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Sparkles size={16} color="#FF9431" fill="#FF9431" fillOpacity={0.2} />
                <span style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: '#EA580C' }}>Dynamically Calculated Reach</span>
              </div>
              <p style={{ fontSize: 13, color: '#475569', margin: 0, fontWeight: 600 }}>Your profile's verified aggregate audience count across all platforms.</p>
            </div>
            <div style={{ textAlign: mob ? 'left' : 'right' }}>
              <p style={{ fontSize: '32px', fontWeight: 950, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>{fmt.num(currentTotalReach)}</p>
              <span style={{ fontSize: 10, color: '#64748B', fontWeight: 800 }}>TOTAL FOLLOWER REACH</span>
            </div>
          </div>

          {/* Contact Details */}
          <div style={{ marginTop: 32, borderTop: '1px solid #f1f5f9', paddingTop: 32 }}>
             <p style={{ fontSize: 13, fontWeight: 900, color: '#FF9431', marginBottom: 16, textTransform: 'uppercase' }}>
               Contact Details (Visible to Verified Brands Only)
             </p>
             
             {/* Security & Verification Banner */}
             <div style={{ 
               background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.02) 100%)', 
               border: '1.5px dashed rgba(16, 185, 129, 0.25)', 
               borderRadius: 16, 
               padding: '16px 20px', 
               marginBottom: 24, 
               display: 'flex', 
               gap: 12, 
               alignItems: 'flex-start' 
             }}>
               <Shield size={20} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
               <div>
                 <p style={{ fontSize: 13, fontWeight: 900, color: '#065f46', margin: '0 0 4px' }}>Private & Secure Data</p>
                 <p style={{ fontSize: 12, color: '#047857', margin: 0, lineHeight: 1.6, fontWeight: 550 }}>
                   Your contact details are encrypted. They will <strong>only</strong> be shared with verified, KYC-approved brands once you accept their campaign proposals. Public visitors cannot see this.
                 </p>
               </div>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: '24px' }}>
                <Fld 
                  label="WhatsApp / Phone" 
                  value={F.contactPhone} 
                  onChange={e => upF('contactPhone', e.target.value)} 
                  placeholder="+91 98765 43210" 
                  icon={Phone}
                />
                <Fld 
                  label="Professional Deal Email" 
                  value={F.contactEmail} 
                  onChange={e => upF('contactEmail', e.target.value)} 
                  placeholder="collab@domain.com" 
                  icon={AtSign}
                />
                <Fld 
                  label="Telegram Username (Optional)" 
                  value={F.contactTelegram} 
                  onChange={e => upF('contactTelegram', e.target.value)} 
                  placeholder="@username" 
                  icon={MessageCircle}
                />
                <Fld 
                  label="Preferred Contact Method" 
                  value={F.contactMethod} 
                  onChange={e => upF('contactMethod', e.target.value)}
                  options={[
                    { v: 'whatsapp', l: 'WhatsApp Direct' },
                    { v: 'email', l: 'Email Address' },
                    { v: 'platform', l: 'Platform Messages (In-App)' },
                    { v: 'instagram', l: 'Instagram DM' }
                  ]}
                 />
              </div>
              
              <div style={{ marginTop: 16 }}>
                 <Fld 
                   label="Availability / Best Time to Contact" 
                   value={F.contactAvailability} 
                   onChange={e => upF('contactAvailability', e.target.value)} 
                   placeholder="e.g. 10 AM - 6 PM IST, Weekdays only" 
                   icon={User}
                 />
              </div>
           </div>
       </div>

       <TabFooter 
          onPrev={() => setTab('identity')} 
          onNextText="Sync Social Hub →" 
          onNext={saveProfile} 
          mob={mob} 
        />
    </Card>
  );
};

SocialTabContent.propTypes = {
  F: PropTypes.object.isRequired, mob: PropTypes.bool.isRequired, upF: PropTypes.func.isRequired,
  upSocialLink: PropTypes.func.isRequired,
  addSocialLink: PropTypes.func.isRequired, removeSocialLink: PropTypes.func.isRequired,
  saveProfile: PropTypes.func.isRequired, setTab: PropTypes.func.isRequired,
  isPro: PropTypes.bool, navigate: PropTypes.func.isRequired
};

// ─── Tab 3: Gallery Portfolio ──────────────────────────────────────────────────
const GalleryTabContent = ({ F, mob, upF, saveProfile, setTab, isPro, navigate, dsp }) => {
  const [newUrl, setNewUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoDesc, setPhotoDesc] = useState('');

  const addStory = () => {
    if (!newUrl.trim()) return;
    
    const storiesList = F.stories || [];
    const monthlyLimit = isPro ? 10 : 3;
    
    const monthlyCount = getMonthlyStoriesCount(storiesList);
    if (monthlyCount >= monthlyLimit) {
      alert(`Monthly limit reached! You can share up to ${monthlyLimit} stories per month.`);
      return;
    }
    
    const newStory = {
      id: `story-${Date.now()}`,
      url: newUrl.trim(),
      caption: newCaption.trim(),
      createdAt: new Date().toISOString()
    };
    
    upF('stories', [newStory, ...storiesList]);
    setNewUrl('');
    setNewCaption('');
  };

  const removeStory = (id) => {
    const storiesList = F.stories || [];
    upF('stories', storiesList.filter(s => s.id !== id));
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should not exceed 5MB');
      return;
    }

    const currentGallery = F.gallery || [];
    const limit = isPro ? 12 : 4;
    if (currentGallery.length >= limit) {
      alert(`Limit reached! You can upload up to ${limit} portfolio images. Upgrade to Pro for more!`);
      return;
    }

    setUploading(true);
    try {
      const uploadRes = await uploadFile(file);
      
      const token = localStorage.getItem('cb_token');
      const res = await fetch(ENV.apiUrl + '/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          imageUrl: uploadRes.url,
          title: photoTitle.trim() || file.name,
          description: photoDesc.trim() || ''
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save gallery item');

      upF('gallery', [...currentGallery, data.item]);
      setPhotoTitle('');
      setPhotoDesc('');
      dsp({ t: 'TOAST', d: { type: 'success', msg: 'Portfolio image uploaded successfully! 📸' } });
    } catch (err) {
      dsp({ t: 'TOAST', d: { type: 'error', msg: err.message || 'Upload failed' } });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (itemId) => {
    if (!confirm('Are you sure you want to remove this image from your portfolio?')) return;
    
    try {
      const token = localStorage.getItem('cb_token');
      const res = await fetch(ENV.apiUrl + `/gallery/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete gallery item');
      }

      upF('gallery', (F.gallery || []).filter(item => item.id !== itemId));
    } catch (err) {
      dsp({ t: 'TOAST', d: { type: 'error', msg: err.message || 'Failed to delete' } });
    }
  };

  const activeStories = getActiveStories(F.stories || []);
  const expiredStories = (F.stories || []).filter(s => !activeStories.some(a => a.id === s.id));
  const monthlyCount = getMonthlyStoriesCount(F.stories || []);
  const monthlyLimit = isPro ? 10 : 3;

  const currentGallery = F.gallery || [];
  const galleryLimit = isPro ? 12 : 4;

  return (
    <Card className="settings-form-card card-3d-effect">
       <h3 className="db-section-title">Step 3: Gallery Portfolio & Creator Stories</h3>
       <StepInstructionBanner 
         icon={ImageIcon}
         title="Step 3: Creator Portfolio & Media Kit"
         reason="Your media kit and project gallery showcase your best visual work, past collaborations, and aesthetic style. It acts as your professional resume."
         points={[
           "Upload high-definition images of your content creation projects.",
           "Showcase brand campaigns you have previously completed.",
           "Keep your portfolio updated with your latest high-performing reels or shots."
         ]}
       />
       <p className="db-sub-text" style={{ marginBottom: 30 }}>Showcase your dynamic portfolio by uploading photos and share temporary Creator Stories.</p>
       
       <div className="form-stack">
          {/* Dynamic Portfolio Section */}
          <div style={{ marginBottom: '40px' }}>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 950, color: '#0f172a', margin: 0 }}>📸 Dynamic Work Portfolio</h4>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#FF9431', background: 'rgba(255,148,49,0.08)', padding: '4px 12px', borderRadius: '100px' }}>
                   {currentGallery.length} / {galleryLimit} Images Uploaded
                </span>
             </div>

             {/* Upload Form Panel */}
             {currentGallery.length < galleryLimit && (
               <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 900, color: '#FF9431', marginBottom: '12px', textTransform: 'uppercase' }}>Add Portfolio Work</div>
                  <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                     <Fld 
                       label="Work Title (e.g. Nike Campaign)" 
                       value={photoTitle} 
                       onChange={e => setPhotoTitle(e.target.value)} 
                       placeholder="Enter photo title..." 
                     />
                     <Fld 
                       label="Brief Description (Optional)" 
                       value={photoDesc} 
                       onChange={e => setPhotoDesc(e.target.value)} 
                       placeholder="Describe this project..." 
                     />
                  </div>
                  <div style={{ display: 'flex', flexDirection: mob ? 'column' : 'row', alignItems: mob ? 'stretch' : 'center', gap: '16px' }}>
                    <input 
                      type="file" 
                      id="portfolio-image-upload" 
                      accept="image/*" 
                      style={{ display: 'none' }}
                      onChange={handleUploadImage}
                    />
                    <button 
                       type="button"
                       disabled={uploading}
                       onClick={() => document.getElementById('portfolio-image-upload').click()}
                       style={{
                         background: uploading ? '#cbd5e1' : 'linear-gradient(135deg, #FF9431 0%, #EA580C 100%)',
                         color: '#fff',
                         border: 'none',
                         padding: '12px 24px',
                         borderRadius: '100px',
                         fontSize: '13px',
                         fontWeight: 800,
                         cursor: uploading ? 'not-allowed' : 'pointer',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '8px'
                       }}
                    >
                       {uploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                       Upload Portfolio Photo 🚀
                    </button>
                    <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Supports JPEG, PNG, WEBP up to 5MB</span>
                  </div>
               </div>
             )}

             {/* Portfolio Masonry/Grid */}
             {currentGallery.length > 0 ? (
               <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '16px' }}>
                  {currentGallery.map((item) => (
                    <div 
                      key={item.id || item.imageUrl} 
                      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 transition-all duration-300 hover:shadow-md"
                      style={{ aspectRatio: '1/1', border: '1px solid #e2e8f0', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}
                    >
                       <img src={item.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} alt="" />
                       <div style={{
                         position: 'absolute',
                         bottom: 0, left: 0, right: 0,
                         background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                         padding: '12px 8px 8px',
                         color: '#fff'
                       }}>
                          <div style={{ fontSize: '12px', fontWeight: 800, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{item.title || 'Untitled'}</div>
                          {item.description && <div style={{ fontSize: '10px', opacity: 0.8, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{item.description}</div>}
                       </div>
                       <button 
                          type="button"
                          onClick={() => handleDeleteImage(item.id)}
                          style={{
                            position: 'absolute', top: '12px', right: '12px',
                            background: 'rgba(239, 68, 68, 0.95)', color: '#fff',
                            border: 'none', borderRadius: '50%',
                            width: '28px', height: '28px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                       >
                          <Trash2 size={14} />
                       </button>
                    </div>
                  ))}
               </div>
             ) : (
               <div style={{ textAlign: 'center', padding: '32px', background: '#f8fafc', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
                  <ImageIcon size={32} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#64748b', margin: 0 }}>No portfolio images uploaded yet.</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Upload your best campaign visual outputs to wow brands!</p>
               </div>
             )}

             {!isPro && (
               <div style={{ marginTop: 16, padding: '12px 16px', background: '#f8fafc', borderRadius: 12, border: '1px dashed #e2e8f0', display: 'flex', flexDirection: mob ? 'column' : 'row', gap: '8px', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 650 }}>
                   🔒 Free account tier limit: Max 3 images. (Upgrade to Pro for 12)
                 </span>
                 <span onClick={() => navigate('/creator/monetization')} style={{ fontSize: 12, color: '#FF9431', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}>
                   Go Pro ↗
                 </span>
               </div>
             )}
          </div>

          {/* Stories Management Section */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '32px' }}>
             {!isPro ? (
               <div style={{ 
                 background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.98))', 
                 borderRadius: '24px', 
                 padding: '40px 24px', 
                 textAlign: 'center', 
                 border: '1px dashed #FF9431',
                 display: 'flex',
                 flexDirection: 'column',
                 alignItems: 'center',
                 justifyContent: 'center',
                 gap: '16px'
               }}>
                 <Lock size={40} color="#FF9431" />
                 <h4 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: 0 }}>🔒 Unlock Creator Stories</h4>
                 <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '450px', margin: 0, fontWeight: 550, lineHeight: 1.5 }}>
                   Interactive Creator Stories allow you to share 48-hour temporary behind-the-scenes content that brands see directly on your avatar. Upgrade to <strong>Creator Pro</strong> to unlock stories!
                 </p>
                 <button 
                   type="button" 
                   onClick={() => navigate('/creator/monetization')}
                   style={{
                     background: 'linear-gradient(135deg, #FF9431 0%, #EA580C 100%)',
                     color: '#fff',
                     border: 'none',
                     padding: '12px 32px',
                     borderRadius: '100px',
                     fontSize: '13px',
                     fontWeight: 800,
                     cursor: 'pointer'
                   }}
                 >
                   Upgrade to Pro ⚡
                 </button>
               </div>
             ) : (
               <>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 950, color: '#0f172a', margin: 0 }}>📸 Interactive Creator Stories</h4>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#FF9431', background: 'rgba(255,148,49,0.08)', padding: '4px 12px', borderRadius: '100px' }}>
                   {monthlyCount} / {monthlyLimit} Shared This Month
                </span>
             </div>
             <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px', fontWeight: 500 }}>
                Upload stories that will be viewable when users click your profile picture. Stories automatically expire after 48 hours.
             </p>

             {/* Add New Story Form */}
             <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#FF9431', marginBottom: '16px', textTransform: 'uppercase' }}>Add New Story</div>
                <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1.5fr 1fr', gap: '16px', marginBottom: '16px' }}>
                   <Fld 
                     label="Story Image URL" 
                     value={newUrl} 
                     onChange={e => setNewUrl(e.target.value)} 
                     placeholder="https://images.unsplash.com/photo-..." 
                   />
                   <Fld 
                     label="Story Caption (Optional)" 
                     value={newCaption} 
                     onChange={e => setNewCaption(e.target.value)} 
                     placeholder="Behind the scenes shoot today! 🎬" 
                   />
                </div>
                <button 
                   type="button"
                   onClick={addStory}
                   disabled={!newUrl.trim() || monthlyCount >= monthlyLimit}
                   style={{
                     background: (!newUrl.trim() || monthlyCount >= monthlyLimit) ? '#cbd5e1' : 'linear-gradient(135deg, #FF9431 0%, #EA580C 100%)',
                     color: '#fff',
                     border: 'none',
                     padding: '12px 24px',
                     borderRadius: '100px',
                     fontSize: '13px',
                     fontWeight: 800,
                     cursor: (!newUrl.trim() || monthlyCount >= monthlyLimit) ? 'not-allowed' : 'pointer',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '8px'
                   }}
                >
                   Upload & Publish Story 🚀
                </button>
                {!isPro && monthlyCount >= monthlyLimit && (
                  <div style={{ marginTop: '12px', fontSize: '12px', color: '#EF4444', fontWeight: 650 }}>
                     🔒 Free tier limit of 3 monthly stories reached. <span onClick={() => navigate('/creator/monetization')} style={{ textDecoration: 'underline', cursor: 'pointer', color: '#FF9431' }}>Upgrade to Pro</span> for 10 stories.
                  </div>
                )}
             </div>

             {/* Active Stories Grid */}
             {activeStories.length > 0 && (
               <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 900, color: '#10B981', marginBottom: '12px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                     <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} /> Active Stories (Expires in 48h)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: mob ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '16px' }}>
                     {activeStories.map(s => {
                       const timeLeftMs = 48 * 60 * 60 * 1000 - (Date.now() - new Date(s.createdAt).getTime());
                       const timeLeftHrs = Math.max(0, Math.round(timeLeftMs / (60 * 60 * 1000)));
                       return (
                         <div key={s.id} style={{ position: 'relative', aspectRatio: '9/16', borderRadius: '16px', overflow: 'hidden', border: '1.5px solid #10B981' }}>
                            <img src={s.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '8px', color: '#fff', fontSize: '11px' }}>
                               <div style={{ fontWeight: 800 }}>{timeLeftHrs} hrs left</div>
                               {s.caption && <div style={{ fontSize: '9px', opacity: 0.8, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{s.caption}</div>}
                            </div>
                            <button 
                               type="button"
                               onClick={() => removeStory(s.id)}
                               style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}
                            >
                               ✕
                            </button>
                         </div>
                       );
                     })}
                  </div>
               </div>
             )}

             {/* Expired Stories Archive */}
             {expiredStories.length > 0 && (
               <div>
                  <div style={{ fontSize: '12px', fontWeight: 900, color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>Expired Stories (Archive)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: mob ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)', gap: '12px' }}>
                     {expiredStories.map(s => (
                        <div key={s.id} style={{ position: 'relative', aspectRatio: '9/16', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', opacity: 0.5 }}>
                           <img src={s.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                           <button 
                              type="button"
                              onClick={() => removeStory(s.id)}
                              style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' }}
                           >
                              ✕
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
             )}
               </>
             )}
          </div>
       </div>

       <TabFooter 
          onPrev={() => setTab('social')} 
          onNextText="Sync Gallery & Stories →" 
          onNext={saveProfile} 
          mob={mob} 
        />
    </Card>
  );
};

GalleryTabContent.propTypes = {
  F: PropTypes.object.isRequired, mob: PropTypes.bool.isRequired, upF: PropTypes.func.isRequired,
  setTab: PropTypes.func.isRequired, isPro: PropTypes.bool, navigate: PropTypes.func.isRequired
};

// ─── Tab 4: Story ─────────────────────────────────────────────────────────────
const StoryTabContent = ({ F, mob, upF, upAward, upCollab, upMilestone, saveProfile, setTab, openAiWriter }) => (
  <Card className="settings-form-card card-3d-effect">
     <h3 className="db-section-title">Step 3: Journey Milestones & Bio</h3>
     <StepInstructionBanner 
       icon={Sparkles}
       title="Step 4: Biography & Career Journey"
       reason="A detailed story explains your passion, unique value proposition, and career milestones. Brands invest in creators who have a compelling narrative."
       points={[
         "Write an engaging background story (paragraph by paragraph) to share your history.",
         "Add milestones with specific years (e.g. reached 50k followers, launched merchandise).",
         "Specify awards, nominations, or industry recognition you have received."
       ]}
     />
     <p className="db-sub-text" style={{ marginBottom: 40 }}>Write your rich biography and declare historical milestones to construct your My Story tab.</p>
     
     <div className="form-stack">
        <div>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Biography Intro Paragraph</label>
              <button
                type="button"
                onClick={() => openAiWriter('storyP1')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,148,49,0.08)', border: '1px solid rgba(255,148,49,0.2)', borderRadius: 100, padding: '4px 10px', fontSize: 11, fontWeight: 800, color: '#FF9431', cursor: 'pointer', outline: 'none' }}
              >
                <Sparkles size={11} fill="#FF9431" fillOpacity={0.2} />
                Write with AI
              </button>
           </div>
           <Fld value={F.storyP1} onChange={e => upF('storyP1', e.target.value)} rows={3} placeholder="Mera safar Hapur ki galiyon se shuru hua jahan..." />
        </div>

        <Fld label="Featured Dynamic Quote" value={F.storyQuote} onChange={e => upF('storyQuote', e.target.value)} placeholder="Content is a connection that touches hearts." />
        
        <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: '24px' }}>
           <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                 <label style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Biography Middle Paragraph</label>
                 <button
                   type="button"
                   onClick={() => openAiWriter('storyP2')}
                   style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,148,49,0.08)', border: '1px solid rgba(255,148,49,0.2)', borderRadius: 100, padding: '4px 10px', fontSize: 11, fontWeight: 800, color: '#FF9431', cursor: 'pointer', outline: 'none' }}
                 >
                   <Sparkles size={11} fill="#FF9431" fillOpacity={0.2} />
                   Write with AI
                 </button>
              </div>
              <Fld value={F.storyP2} onChange={e => upF('storyP2', e.target.value)} rows={3} placeholder="Shuruat mein mere paas sirf ek camera aur sapna tha..." />
           </div>

           <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                 <label style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Biography Conclusion Paragraph</label>
                 <button
                   type="button"
                   onClick={() => openAiWriter('storyP3')}
                   style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,148,49,0.08)', border: '1px solid rgba(255,148,49,0.2)', borderRadius: 100, padding: '4px 10px', fontSize: 11, fontWeight: 800, color: '#FF9431', cursor: 'pointer', outline: 'none' }}
                 >
                   <Sparkles size={11} fill="#FF9431" fillOpacity={0.2} />
                   Write with AI
                 </button>
              </div>
              <Fld value={F.storyP3} onChange={e => upF('storyP3', e.target.value)} rows={3} placeholder="Aaj scale karte hue, Bharat ki regional voice banana agla aim hai..." />
           </div>
        </div>

        {/* Awards */}
        <div style={{ marginTop: 32 }}>
           <p style={{ fontSize: 13, fontWeight: 900, color: '#FF9431', marginBottom: 16, textTransform: 'uppercase' }}>🏆 Key Achievements & Awards (Up to 3)</p>
           <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
              {['award-1', 'award-2', 'award-3'].map((awardKey, idx) => {
                const award = F.awards[idx] || { t: '', o: '', y: '', img: '', link: '' };
                return (
                  <div key={awardKey} style={{ padding: 20, background: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9' }}>
                     <Fld label={`Award Title ${idx + 1}`} value={award.t} onChange={e => upAward(idx, 't', e.target.value)} placeholder="Youth Icon Award" />
                     <Fld label="Issuer Organization" value={award.o} onChange={e => upAward(idx, 'o', e.target.value)} placeholder="Govt of Rajasthan" style={{ marginTop: 8 }} />
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: 8 }}>
                       <Fld label="Year" value={award.y} onChange={e => upAward(idx, 'y', e.target.value)} placeholder="2024" />
                       <Fld label="Verification Link" value={award.link || ''} onChange={e => upAward(idx, 'link', e.target.value)} placeholder="https://awards.org/verify" />
                     </div>
                     <Fld label="Award / Certificate Image URL" value={award.img || ''} onChange={e => upAward(idx, 'img', e.target.value)} placeholder="https://images.unsplash.com/..." style={{ marginTop: 8 }} />
                  </div>
                );
              })}
           </div>
        </div>

        {/* Collabs */}
        <div style={{ marginTop: 32 }}>
           <p style={{ fontSize: 13, fontWeight: 900, color: '#FF9431', marginBottom: 16, textTransform: 'uppercase' }}>🤝 Elite Partnerships & Collaborations (Up to 3)</p>
           <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
              {['collab-1', 'collab-2', 'collab-3'].map((collabKey, idx) => {
                const collab = F.collabs[idx] || { p: '', l: '', d: '', brandLink: '', videoLink: '', img: '', metric: '' };
                return (
                  <div key={collabKey} style={{ padding: 20, background: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9' }}>
                     <Fld label={`Partner Name ${idx + 1}`} value={collab.p} onChange={e => upCollab(idx, 'p', e.target.value)} placeholder="Rajasthan Tourism Govt" />
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: 8 }}>
                       <Fld label="Collab Type" value={collab.l} onChange={e => upCollab(idx, 'l', e.target.value)} placeholder="Government Partner" />
                       <Fld label="Highlight Metric" value={collab.metric || ''} onChange={e => upCollab(idx, 'metric', e.target.value)} placeholder="3.2M Reach" />
                     </div>
                     <Fld label="Description" value={collab.d} onChange={e => upCollab(idx, 'd', e.target.value)} placeholder="Official campaign promoting local heritage." style={{ marginTop: 8 }} />
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: 8 }}>
                       <Fld label="Brand Website Link" value={collab.brandLink || ''} onChange={e => upCollab(idx, 'brandLink', e.target.value)} placeholder="https://brand.com" />
                       <Fld label="Campaign Video URL" value={collab.videoLink || ''} onChange={e => upCollab(idx, 'videoLink', e.target.value)} placeholder="https://youtube.com/..." />
                     </div>
                     <Fld label="Campaign Image URL" value={collab.img || ''} onChange={e => upCollab(idx, 'img', e.target.value)} placeholder="https://images.unsplash.com/..." style={{ marginTop: 8 }} />
                  </div>
                );
              })}
           </div>
        </div>

        {/* Timeline Milestones */}
        <div style={{ marginTop: 32 }}>
           <p style={{ fontSize: 13, fontWeight: 900, color: '#FF9431', marginBottom: 16, textTransform: 'uppercase' }}>📅 Creator Journey Timeline (4 Milestones)</p>
           {F.milestones.map((m, idx) => (
              <div key={m.id} style={{ padding: 20, background: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9', marginBottom: 16 }}>
                 <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '100px 1fr', gap: 16, marginBottom: 12 }}>
                    <Fld label="Year" value={m.y} onChange={e => upMilestone(idx, 'y', e.target.value)} placeholder="2022" />
                    <Fld label="Chapter Title" value={m.t} onChange={e => upMilestone(idx, 't', e.target.value)} placeholder="First Viral Short" />
                 </div>
                 <Fld label="Chapter Details" value={m.d} onChange={e => upMilestone(idx, 'd', e.target.value)} placeholder="Crossed 100K views by highlighting regional monuments..." style={{ marginBottom: 12 }} />
                 <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <Fld label="Category Tag (e.g. Launch, Collab)" value={m.category || ''} onChange={e => upMilestone(idx, 'category', e.target.value)} placeholder="Growth" />
                    <Fld label="Highlight Metric (e.g. 500K Subs)" value={m.metric || ''} onChange={e => upMilestone(idx, 'metric', e.target.value)} placeholder="500K Views" />
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: 12 }}>
                    <Fld label="Thumbnail Image URL" value={m.img || ''} onChange={e => upMilestone(idx, 'img', e.target.value)} placeholder="https://images.unsplash.com/..." />
                    <Fld label="Verification Link" value={m.link || ''} onChange={e => upMilestone(idx, 'link', e.target.value)} placeholder="https://youtube.com/watch?..." />
                 </div>
              </div>
           ))}
        </div>
     </div>

     <TabFooter 
        onPrev={() => setTab('social')} 
        onNextText="Sync Journey →" 
        onNext={saveProfile} 
        mob={mob} 
      />
  </Card>
);

StoryTabContent.propTypes = {
  F: PropTypes.object.isRequired, mob: PropTypes.bool.isRequired, upF: PropTypes.func.isRequired,
  upAward: PropTypes.func.isRequired, upCollab: PropTypes.func.isRequired, upMilestone: PropTypes.func.isRequired,
  saveProfile: PropTypes.func.isRequired, setTab: PropTypes.func.isRequired, openAiWriter: PropTypes.func.isRequired
};

// ─── Tab 4: Packages ──────────────────────────────────────────────────────────
const PackagesTabContent = ({ F, mob, upF, upService, addService, removeService, upViralContent, upCaseStudy, saveProfile, setTab, isPro, navigate }) => {
  const totalFollowers = (parseInt(F.instagramFollowers)||0)+(parseInt(F.youtubeFollowers)||0)+(parseInt(F.linkedinFollowers)||0)+(parseInt(F.twitterFollowers)||0)+(parseInt(F.facebookFollowers)||0);
  const suggestRates = () => {
    let min=3000,max=10000;
    if(totalFollowers>=1000000){min=80000;max=300000;}
    else if(totalFollowers>=500000){min=40000;max=150000;}
    else if(totalFollowers>=100000){min=15000;max=60000;}
    else if(totalFollowers>=50000){min=8000;max=30000;}
    else if(totalFollowers>=10000){min=3000;max=12000;}
    upF('rateMin',String(min)); upF('rateMax',String(max));
  };
  return (
  <Card className="settings-form-card card-3d-effect">
     <h3 className="db-section-title">Step 4: Commercial Deliverables & Pro Work</h3>
     <StepInstructionBanner 
       icon={Layers}
       title="Step 5: Brand Collaboration Packages & Rates"
       reason="Setting clear, transparent prices and deliverable scopes speeds up brand negotiation. Upfront pricing decreases transaction times by 80%."
       points={[
         "Set your minimum and maximum starting rate range.",
         "Click 'Suggest Rates' to get auto-calculated rates based on your connected follower count.",
         "Add custom service packages detailing exactly what you deliver (e.g. Reels, Stories, Posts)."
       ]}
     />
     <p className="db-sub-text" style={{ marginBottom: 40 }}>Define your rate range, service packages, viral hits, and case studies for brand discovery.</p>
     
     <div className="form-stack">
        <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: '24px', marginBottom: 24 }}>
           <Fld label="Reel Minimum Rate (₹)" type="number" value={F.rateMin} onChange={e => upF('rateMin', e.target.value)} placeholder="8,000" />
           <Fld label="Reel Maximum Rate (₹)" type="number" value={F.rateMax} onChange={e => upF('rateMax', e.target.value)} placeholder="25,000" />
        </div>

        {/* Services */}
        <div style={{ marginTop: 24, borderTop: '1px solid #f1f5f9', paddingTop: 24 }}>
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 900, color: '#FF9431', textTransform: 'uppercase', margin: 0 }}>💼 Professional Service Catalog</p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0', fontWeight: 600 }}>
                  {isPro ? 'Unlimited Services (Pro)' : `${F.services.length}/3 Services (Free) — Upgrade for unlimited`}
                </p>
              </div>
              {(isPro || F.services.length < 3) && (
                 <button onClick={addService} style={{
                   display: 'flex', alignItems: 'center', gap: 6,
                   background: 'rgba(255,148,49,0.1)', border: '1px solid rgba(255,148,49,0.3)',
                   color: '#FF9431', borderRadius: 100, padding: '8px 16px', fontSize: 12, fontWeight: 800, cursor: 'pointer'
                 }}>
                   <Plus size={14} /> Add Service
                 </button>
              )}
           </div>
           {F.services.map((s, idx) => {
              const isLocked = !isPro && idx >= 3;
              return (
                 <div key={s.id || idx} style={{ 
                   padding: 20, 
                   background: '#f8fafc', 
                   borderRadius: 16, 
                   border: '1px solid #f1f5f9', 
                   marginBottom: 16,
                   position: 'relative'
                 }}>
                    {isLocked && (
                      <div style={{ position: 'absolute', top: 12, right: 12 }}>
                        <Lock size={16} color="#FF9431" />
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                       <span style={{ fontSize: 13, fontWeight: 900, color: '#475569' }}>Service #{idx + 1}</span>
                       {!isLocked && (
                          <button 
                            type="button"
                            onClick={() => removeService(idx)} 
                            style={{
                              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                              borderRadius: '8px', color: '#EF4444', cursor: 'pointer', 
                              display: 'flex', alignItems: 'center', justifyContent: 'center', 
                              height: '32px', padding: '0 12px', gap: '6px', fontSize: '11px', fontWeight: 800
                            }}
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                       )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 180px', gap: 16, marginBottom: 12, alignItems: 'flex-start' }}>
                       <Fld 
                         label="Service Title" 
                         value={s.t} 
                         onChange={e => upService(idx, 't', e.target.value)} 
                         placeholder="Cinematic Reel Editing" 
                         disabled={isLocked}
                       />
                       <Fld 
                         label="Rate (₹, optional)" 
                         type="number" 
                         value={s.rate || ''} 
                         onChange={e => upService(idx, 'rate', e.target.value)} 
                         placeholder="12000" 
                         disabled={isLocked}
                       />
                    </div>
                    <Fld 
                      label="Service Description & Details" 
                      value={s.d} 
                      onChange={e => upService(idx, 'd', e.target.value)} 
                      placeholder="Includes high-end color grading, drone shots, and native Hinglish scripting with 3 revisions." 
                      rows={2}
                      disabled={isLocked}
                    />
                 </div>
              );
           })}
           {!isPro && F.services.length >= 3 && (
             <div style={{ marginTop: 12, padding: '10px 16px', background: '#f8fafc', borderRadius: 12, border: '1px dashed #e2e8f0', display: 'flex', flexDirection: mob ? 'column' : 'row', gap: '8px', justifyContent: 'space-between', alignItems: 'center' }}>
               <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontWeight: 600 }}>
                 🔒 Upgrade to Pro to add unlimited services (currently max 3)
               </p>
               <button onClick={() => navigate('/creator/monetization')} style={{ background: 'none', border: 'none', color: '#FF9431', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                 Upgrade Now →
               </button>
             </div>
           )}
        </div>

        {/* Viral Content */}
        <div style={{ marginTop: 32 }}>
           <p style={{ fontSize: 13, fontWeight: 900, color: '#FF9431', marginBottom: 16, textTransform: 'uppercase' }}>🔥 Viral Content Hits (Up to 3)</p>
           <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
              {['viral-1', 'viral-2', 'viral-3'].map((viralKey, idx) => {
                const viral = F.viralContent[idx] || { views: '', img: '', title: '', link: '' };
                return (
                  <div key={viralKey} style={{ padding: 20, background: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9' }}>
                     <Fld label={`Video ${idx + 1} Views`} value={viral.views} onChange={e => upViralContent(idx, 'views', e.target.value)} placeholder="1.2M" />
                     <Fld label="Video Title / Topic" value={viral.title || ''} onChange={e => upViralContent(idx, 'title', e.target.value)} placeholder="BMW X5 Review" style={{ marginTop: 8 }} />
                     <Fld label="Video Link / Proof" value={viral.link || ''} onChange={e => upViralContent(idx, 'link', e.target.value)} placeholder="https://youtube.com/watch?..." style={{ marginTop: 8 }} />
                     <Fld label="Cover Image URL" value={viral.img || ''} onChange={e => upViralContent(idx, 'img', e.target.value)} placeholder="https://images.unsplash.com/..." style={{ marginTop: 8 }} />
                  </div>
                );
              })}
           </div>
        </div>

        {/* Case Studies */}
        <div style={{ marginTop: 32 }}>
           <p style={{ fontSize: 13, fontWeight: 900, color: '#FF9431', marginBottom: 16, textTransform: 'uppercase' }}>📊 Brand Case Studies (Up to 3)</p>
           {F.caseStudies.map((cs, idx) => (
              <div key={cs.id} style={{ padding: 20, background: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9', marginBottom: 16 }}>
                 <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 12 }}>
                    <Fld label="Campaign Title" value={cs.title} onChange={e => upCaseStudy(idx, 'title', e.target.value)} placeholder="Jaipur Heritage Launch" />
                    <Fld label="Brand Name" value={cs.brand} onChange={e => upCaseStudy(idx, 'brand', e.target.value)} placeholder="OYO Rooms" />
                 </div>
                 <Fld label="Campaign Brief Description" value={cs.desc || ''} onChange={e => upCaseStudy(idx, 'desc', e.target.value)} placeholder="Promoted heritage homestays to urban young travelers via visual Reels..." style={{ marginBottom: 12 }} />
                 <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 12 }}>
                    <Fld label="Campaign Verification Link" value={cs.link || ''} onChange={e => upCaseStudy(idx, 'link', e.target.value)} placeholder="https://youtube.com/..." />
                    <Fld label="Cover/Thumbnail Image URL" value={cs.img || ''} onChange={e => upCaseStudy(idx, 'img', e.target.value)} placeholder="https://images.unsplash.com/..." />
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(4, 1fr)', gap: 12 }}>
                    <Fld label="Metric 1 Label" value={cs.r1_label} onChange={e => upCaseStudy(idx, 'r1_label', e.target.value)} placeholder="Reach" />
                    <Fld label="Metric 1 Value" value={cs.r1_val} onChange={e => upCaseStudy(idx, 'r1_val', e.target.value)} placeholder="2.1M" />
                    <Fld label="Metric 2 Label" value={cs.r2_label} onChange={e => upCaseStudy(idx, 'r2_label', e.target.value)} placeholder="ROI" />
                    <Fld label="Metric 2 Value" value={cs.r2_val} onChange={e => upCaseStudy(idx, 'r2_val', e.target.value)} placeholder="4.2x" />
                 </div>
              </div>
           ))}
        </div>
     </div>

     <TabFooter 
        onPrev={() => setTab('story')} 
        onNextText="Sync Deliverables →" 
        onNext={saveProfile} 
        mob={mob} 
      />
  </Card>
  );
};

PackagesTabContent.propTypes = {
  F: PropTypes.object.isRequired, mob: PropTypes.bool.isRequired, upF: PropTypes.func.isRequired,
  upService: PropTypes.func.isRequired, addService: PropTypes.func.isRequired, removeService: PropTypes.func.isRequired,
  upViralContent: PropTypes.func.isRequired, upCaseStudy: PropTypes.func.isRequired,
  saveProfile: PropTypes.func.isRequired, setTab: PropTypes.func.isRequired,
  isPro: PropTypes.bool, navigate: PropTypes.func.isRequired
};

// ─── Tab 5: Local Hub ─────────────────────────────────────────────────────────
const LocalTabContent = ({ F, mob, upF, upLocalHub, saveProfile, setTab, openAiWriter }) => (
  <Card className="settings-form-card card-3d-effect">
     <h3 className="db-section-title">Step 5: Local Collab Hub</h3>
     <StepInstructionBanner 
       icon={MapPin}
       title="Step 6: Regional Hub & Local Reach"
       reason="Many local campaigns target regional dialects, local slang, and specific cities. Configuring these helps brands match local hyper-targeted campaigns."
       points={[
         "Select your regional language dialects (e.g. Hindi, Punjabi, Tamil).",
         "Define your active hyper-local reach cities.",
         "Specify target demographics for local community campaigns."
       ]}
     />
     <p className="db-sub-text" style={{ marginBottom: 40 }}>Define your regional reach and attract hyper-local sponsorships from Tier-2 city brands.</p>
     
     <div className="form-stack">
        <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: '24px', marginBottom: 24 }}>
           <Fld label="Local Initiative Heading (e.g. Vocal for Local / Store Visits)" value={F.localTitle} onChange={e => upF('localTitle', e.target.value)} placeholder="Supporting Local Businesses & Homegrown Brands" />
           <Fld label="Impact Hubs Section Heading (e.g. My Active Regional Hubs)" value={F.localHubsTitle} onChange={e => upF('localHubsTitle', e.target.value)} placeholder="My Hyper-Local Impact Hub" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: '24px', marginBottom: 24 }}>
           <Fld label="Regional Dialects / Languages" value={F.regionalDialects} onChange={e => upF('regionalDialects', e.target.value)} placeholder="Bhojpuri, Marwari, Hinglish" />
           <Fld label="Local Market Penetration %" value={F.localPenetration} onChange={e => upF('localPenetration', e.target.value)} placeholder="85%" />
        </div>

        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <label style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>Vocal for Local / Regional Voice Statement</label>
            <button
              type="button"
              onClick={() => openAiWriter('localVoice')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,148,49,0.08)', border: '1px solid rgba(255,148,49,0.2)', borderRadius: 100, padding: '4px 10px', fontSize: 11, fontWeight: 800, color: '#FF9431', cursor: 'pointer', outline: 'none' }}
            >
              <Sparkles size={11} fill="#FF9431" fillOpacity={0.2} />
              Write with AI
            </button>
          </div>
          <Fld value={F.localVoice} onChange={e => upF('localVoice', e.target.value)} rows={3} placeholder="Main local brands aur startups ko support karne ke liye hamesha ready hoon..." />
        </div>

        <div style={{ marginTop: 32 }}>
           <p style={{ fontSize: 13, fontWeight: 900, color: '#FF9431', marginBottom: 16, textTransform: 'uppercase' }}>📍 Active Local Hubs (Up to 3 Cities)</p>
           <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
              {['hub-1', 'hub-2', 'hub-3'].map((hubKey, idx) => {
                const hub = F.localHubs[idx] || { l: '', v: '' };
                const placeholders = [['Indore', '85%'], ['Bhopal', '72%'], ['Ujjain', '64%']];
                return (
                  <div key={hubKey} style={{ padding: 20, background: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9' }}>
                     <Fld label={`Hub City ${idx + 1}`} value={hub.l} onChange={e => upLocalHub(idx, 'l', e.target.value)} placeholder={placeholders[idx][0]} />
                     <Fld label="Hub Reach %" value={hub.v} onChange={e => upLocalHub(idx, 'v', e.target.value)} placeholder={placeholders[idx][1]} style={{ marginTop: 8 }} />
                  </div>
                );
              })}
           </div>
        </div>
     </div>

     <TabFooter 
        onPrev={() => setTab('packages')} 
        onNextText="Sync Local Hub →" 
        onNext={saveProfile} 
        mob={mob} 
      />
  </Card>
);

LocalTabContent.propTypes = {
  F: PropTypes.object.isRequired, mob: PropTypes.bool.isRequired, upF: PropTypes.func.isRequired,
  upLocalHub: PropTypes.func.isRequired, saveProfile: PropTypes.func.isRequired, setTab: PropTypes.func.isRequired,
  openAiWriter: PropTypes.func.isRequired
};

// ─── Tab 6: Sponsored Posts ───────────────────────────────────────────────────
const SponsoredTabContent = ({ F, mob, upSponsoredPost, saveProfile, setTab }) => {
  const PLATFORM_OPTS = ['Instagram', 'YouTube', 'Twitter / X', 'Threads', 'Snapchat', 'Other'];
  
  return (
    <Card className="settings-form-card card-3d-effect">
       <h3 className="db-section-title">Step 6: Sponsored Posts & Brand Work</h3>
       <p className="db-sub-text" style={{ marginBottom: 40 }}>
         Showcase your past sponsored collaborations. This data populates the "Sponsored" tab on your public profile and helps brands see your track record.
       </p>

       {/* Info Banner */}
       <div style={{ background: 'linear-gradient(135deg, rgba(255,148,49,0.08) 0%, rgba(234,88,12,0.05) 100%)', border: '1px solid rgba(255,148,49,0.2)', borderRadius: 16, padding: '16px 20px', marginBottom: 32, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
         <Megaphone size={20} color="#FF9431" style={{ flexShrink: 0, marginTop: 2 }} />
         <div>
           <p style={{ fontSize: 13, fontWeight: 900, color: '#92400e', margin: '0 0 4px' }}>Why this matters?</p>
           <p style={{ fontSize: 12, color: '#b45309', margin: 0, lineHeight: 1.6 }}>
             Brands specifically look for past sponsored work before hiring. A filled Sponsored tab increases your profile views by <strong>3.2x</strong> and deal conversion by <strong>67%</strong>.
           </p>
         </div>
       </div>

       <div className="form-stack">
          {F.sponsoredPosts.map((post, idx) => (
            <div key={idx} style={{ padding: 24, background: '#f8fafc', borderRadius: 20, border: '1px solid #f1f5f9', marginBottom: 20 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                 <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #FF9431, #EA580C)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Megaphone size={16} color="#fff" />
                 </div>
                 <p style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', margin: 0 }}>Sponsored Post #{idx + 1}</p>
               </div>
               
               <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <Fld label="Brand Name" value={post.brand} onChange={e => upSponsoredPost(idx, 'brand', e.target.value)} placeholder="OYO Rooms" />
                  <Fld label="Campaign Title" value={post.campaign} onChange={e => upSponsoredPost(idx, 'campaign', e.target.value)} placeholder="Jaipur Heritage Launch 2024" />
               </div>
               
               <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '160px 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'block' }}>Platform</label>
                    <select value={post.platform} onChange={e => upSponsoredPost(idx, 'platform', e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                      {PLATFORM_OPTS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <Fld label="Post URL (optional)" value={post.postUrl} onChange={e => upSponsoredPost(idx, 'postUrl', e.target.value)} placeholder="https://instagram.com/p/..." />
               </div>
               
               <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
                  <Fld label="Reach / Views" value={post.reach} onChange={e => upSponsoredPost(idx, 'reach', e.target.value)} placeholder="2.1M views" />
                  <Fld label="Engagement Rate" value={post.engagement} onChange={e => upSponsoredPost(idx, 'engagement', e.target.value)} placeholder="8.4%" />
                  <Fld label="Campaign Month" value={post.month} onChange={e => upSponsoredPost(idx, 'month', e.target.value)} placeholder="March 2024" />
               </div>
               
               <Fld label="Campaign Thumbnail Image URL" value={post.thumbnail} onChange={e => upSponsoredPost(idx, 'thumbnail', e.target.value)} placeholder="https://images.unsplash.com/..." />
            </div>
          ))}
       </div>

       {/* Completion Tip */}
       <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: '16px 20px', marginTop: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
         <CheckCircle2 size={18} color="#10B981" />
         <p style={{ fontSize: 12, color: '#065f46', margin: 0, fontWeight: 700 }}>
           Fill at least 1 sponsored post to unlock the "Sponsored" tab on your public profile and earn a <strong>+5 CB Score bonus</strong>!
         </p>
       </div>

       <TabFooter 
          onPrev={() => setTab('local')} 
          onNextText="🎉 Complete Profile & Go Live" 
          onNext={saveProfile} 
          mob={mob} 
        />
    </Card>
  );
};

SponsoredTabContent.propTypes = {
  F: PropTypes.object.isRequired, mob: PropTypes.bool.isRequired,
  upSponsoredPost: PropTypes.func.isRequired, saveProfile: PropTypes.func.isRequired, setTab: PropTypes.func.isRequired
};

// ─── Completion Logic ──────────────────────────────────────────────────────────
const checkTabComplete = (tabName, F) => {
  if (tabName === 'identity')  return !!(F.name && F.bio);
  if (tabName === 'social')    return !!(F.instagram || F.youtube || F.socialLinks?.some(l => l.url));
  if (tabName === 'gallery')   return !!(F.gallery.some(Boolean));
  if (tabName === 'story')     return !!(F.storyP1 && F.milestones.some(m => m.t));
  if (tabName === 'packages')  return !!(F.rateMin && F.services.some(s => s.t));
  if (tabName === 'local')     return !!(F.localVoice || F.localHubs?.some(h => h.l));
  if (tabName === 'sponsored') return !!(F.sponsoredPosts?.some(p => p.brand));
  return true;
};

const getTabStyle = (tabId, currentTab) => ({
  flexShrink: 0, padding: '10px 16px', borderRadius: 100,
  border: tabId === currentTab ? '1px solid #FF9431' : '1px solid #e2e8f0',
  background: tabId === currentTab ? 'rgba(255,148,49,0.1)' : '#fff',
  color: tabId === currentTab ? '#FF9431' : '#64748b',
  fontSize: '13px', fontWeight: 800, cursor: 'pointer'
});

// ─── Sidebar Steps ─────────────────────────────────────────────────────────────
const SIDEBAR_STEPS = [
  { id: 'identity',  label: 'Basic Identity',      icon: User },
  { id: 'social',    label: 'Social & Links',       icon: Globe },
  { id: 'gallery',   label: 'Gallery Portfolio',    icon: ImageIcon },
  { id: 'story',     label: 'Journey & Awards',     icon: BookOpen },
  { id: 'packages',  label: 'Services & Rates',     icon: Layers },
  { id: 'local',     label: 'Local Hub',            icon: MapPin },
  { id: 'sponsored', label: 'Sponsored Posts',      icon: Megaphone }
];

const MOBILE_TABS = [
  { id: 'identity',  label: 'Identity' },
  { id: 'social',    label: 'Socials' },
  { id: 'gallery',   label: 'Gallery' },
  { id: 'story',     label: 'Story' },
  { id: 'packages',  label: 'Packages' },
  { id: 'local',     label: 'Local Hub' },
  { id: 'sponsored', label: 'Sponsored' }
];

// ─── Settings Sidebar ──────────────────────────────────────────────────────────
const SettingsSidebar = ({ score, comp, tab, setTab, F, activation, onActivate }) => {
  const isProfileActive = activation?.isProfileActive;
  const status = activation?.status || 'DRAFT';
  const currentPrice = activation?.currentPrice || 199;
  const activeCount = activation?.activeCount || 0;

  return (
    <div className="db-col-left">
       <Card className="settings-sidebar-card">
          <div className="card-header-center">
             <p className="db-sidebar-label">Profile Strength</p>
             <div className="ring-container">
                <Ring score={score} size={140} strokeWidth={12} color="#FF9431" />
             </div>
             <Bdg color={score >= 91 ? 'violet' : score >= 76 ? 'saffron' : score >= 51 ? 'blue' : 'slate'} lg>
                {fmt.tier(score).label} Tier
             </Bdg>
          </div>

          <div className="progress-box">
             <div className="progress-labels">
                <span className="label">Completion</span>
                <span className="value">{comp.pct}%</span>
             </div>
             <Bar value={comp.pct} color="#FF9431" height={6} />
          </div>

          {/* Profile Status & Activation Section */}
          <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 20, border: '1px solid #e2e8f0' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>Visibility</span>
                {isProfileActive ? (
                   status === 'APPROVED' ? (
                      <span style={{ fontSize: 11, fontWeight: 850, color: '#10B981', background: 'rgba(16,185,129,0.08)', padding: '2px 8px', borderRadius: 100 }}>🟢 Live</span>
                   ) : status === 'PENDING' ? (
                      <span style={{ fontSize: 11, fontWeight: 850, color: '#FF9431', background: 'rgba(255,148,49,0.08)', padding: '2px 8px', borderRadius: 100 }}>⏳ Pending Approval</span>
                   ) : status === 'REJECTED' ? (
                      <span style={{ fontSize: 11, fontWeight: 850, color: '#EF4444', background: 'rgba(239,68,68,0.08)', padding: '2px 8px', borderRadius: 100 }}>❌ Rejected</span>
                   ) : (
                      <span style={{ fontSize: 11, fontWeight: 850, color: '#64748b', background: 'rgba(100,116,139,0.08)', padding: '2px 8px', borderRadius: 100 }}>📝 Draft</span>
                   )
                ) : (
                   <span style={{ fontSize: 11, fontWeight: 850, color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: 100 }}>🔒 Inactive</span>
                )}
             </div>

             {!isProfileActive ? (
                <div>
                   <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4, margin: '0 0 12px', fontWeight: 600 }}>
                      List your profile in the directory to receive brand pitches. 
                   </p>
                   <button 
                      type="button"
                      onClick={onActivate}
                      style={{
                         width: '100%',
                         background: 'linear-gradient(135deg, #FF9431 0%, #EA580C 100%)',
                         color: '#fff',
                         border: 'none',
                         padding: '10px 16px',
                         borderRadius: 12,
                         fontSize: 12,
                         fontWeight: 900,
                         cursor: 'pointer',
                         boxShadow: '0 4px 12px rgba(255,148,49,0.15)'
                      }}
                   >
                      Activate Portfolio (₹{currentPrice}/yr)
                   </button>
                   <p style={{ fontSize: 9, color: '#94a3b8', margin: '6px 0 0', textAlign: 'center', fontWeight: 650 }}>
                      Offer: ₹199/yr for first 1,000 active creators ({activeCount} active).
                   </p>
                </div>
             ) : (
                <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4, margin: 0, fontWeight: 600 }}>
                   {status === 'APPROVED' ? (
                      '🎉 Your profile is active and visible to all brands on the platform!'
                   ) : status === 'PENDING' ? (
                      '⏳ Verification pending. Our admin team is auditing your details.'
                   ) : (
                      '📝 Portfolio listing paid. Submit all 7 tabs for verification to go live.'
                   )}
                </p>
             )}
          </div>

          <div className="tasks-box" style={{ marginTop: 24 }}>
             {SIDEBAR_STEPS.map(step => (
                <StepNavItem 
                  key={step.id} id={step.id} label={step.label}
                  icon={step.icon} active={tab === step.id}
                  completed={checkTabComplete(step.id, F)} onClick={() => setTab(step.id)}
                />
             ))}
          </div>
       </Card>

       <Card className="promo-card-dark" style={{ marginTop: 24, padding: 32, background: '#0F172A', color: '#FFF', borderRadius: 32 }}>
          <div className="promo-header" style={{ marginBottom: 16 }}>
             <Sparkles size={18} color="#FF9431" fill="#FF9431" />
             <span style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase' }}>Pro Checklist</span>
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 0 16px' }}>
            Fill all 7 tabs including Sponsored Posts to unlock "Submit to Admin" and get <strong style={{ color: '#FF9431' }}>+15 CB Score bonus</strong>!
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SIDEBAR_STEPS.map(step => (
              <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: checkTabComplete(step.id, F) ? '#10B981' : 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {checkTabComplete(step.id, F) && <CheckCircle2 size={10} color="#fff" />}
                </div>
                <span style={{ fontSize: 12, color: checkTabComplete(step.id, F) ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)', fontWeight: 700 }}>{step.label}</span>
              </div>
            ))}
          </div>
       </Card>
    </div>
  );
};

SettingsSidebar.propTypes = {
  score: PropTypes.number.isRequired, comp: PropTypes.object.isRequired,
  tab: PropTypes.string.isRequired, setTab: PropTypes.func.isRequired, F: PropTypes.object.isRequired,
  activation: PropTypes.object, onActivate: PropTypes.func
};

// ─── Mobile Tab Selector ───────────────────────────────────────────────────────
const MobileTabSelector = ({ comp, tab, setTab, F }) => (
  <div className="settings-mobile-tabs-container" style={{ width: '100%', marginBottom: 20 }}>
     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: '12px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>Completion</span>
        <span style={{ fontSize: '14px', fontWeight: 950, color: '#FF9431' }}>{comp.pct}%</span>
     </div>
     <Bar value={comp.pct} color="#FF9431" height={4} />

     <div className="settings-mobile-scroll-row" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '16px 0 4px', scrollbarWidth: 'none' }}>
        {MOBILE_TABS.map(t => {
          const isCompleted = checkTabComplete(t.id, F);
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={getTabStyle(t.id, tab)}>
               {t.label} {isCompleted && '✓'}
            </button>
          );
        })}
     </div>
  </div>
);

MobileTabSelector.propTypes = {
  comp: PropTypes.object.isRequired, tab: PropTypes.string.isRequired,
  setTab: PropTypes.func.isRequired, F: PropTypes.object.isRequired
};

// ─── Helper Functions ──────────────────────────────────────────────────────────
const getDefaultCreator = (st, allC) => 
  st.user?.creatorProfile || st.creatorProfile || allC.find(cr => cr.email === st.user?.email) || {
    name: st.user?.name || '', email: st.user?.email || '', bio: '', city: st.user?.city || '', state: st.user?.state || '',
    instagram: '', youtube: '', rateMin: '', rateMax: '', portfolio: '',
    followers: 0, score: 85, gallery: [], full_story: { p1: '', quote: '', p2: '', p3: '' },
    milestones: [], services: [], awards: [], collabs: []
  };

const getDefaultSponsoredPosts = () => [
  { brand: '', campaign: '', platform: 'Instagram', postUrl: '', reach: '', engagement: '', month: '', thumbnail: '' },
  { brand: '', campaign: '', platform: 'YouTube', postUrl: '', reach: '', engagement: '', month: '', thumbnail: '' },
  { brand: '', campaign: '', platform: 'Instagram', postUrl: '', reach: '', engagement: '', month: '', thumbnail: '' },
  { brand: '', campaign: '', platform: 'Instagram', postUrl: '', reach: '', engagement: '', month: '', thumbnail: '' }
];

const getInitialFormState = (c) => {
  const localHubs = (c?.local_impact_hubs?.length || c?.local_hubs?.length || c?.localHubs?.length)
    ? [...(c.local_impact_hubs || c.local_hubs || c.localHubs)]
    : [
    { l: '', v: '' }, { l: '', v: '' }, { l: '', v: '' }
  ];
  const awards = c?.awards?.length ? [...c.awards] : [
    { t: '', o: '', y: '', img: '', link: '' },
    { t: '', o: '', y: '', img: '', link: '' },
    { t: '', o: '', y: '', img: '', link: '' }
  ];
  const collabs = (c?.collabs?.length ? c.collabs : [
    { p: '', l: '', d: '', brandLink: '', videoLink: '', img: '', metric: '' },
    { p: '', l: '', d: '', brandLink: '', videoLink: '', img: '', metric: '' },
    { p: '', l: '', d: '', brandLink: '', videoLink: '', img: '', metric: '' }
  ]).map((col, idx) => ({
    p: col.p || '',
    l: col.l || '',
    d: col.d || '',
    brandLink: col.brandLink || '',
    videoLink: col.videoLink || '',
    img: col.img || '',
    metric: col.metric || '',
    id: col.id || `collab-${idx}`
  }));
  const milestones = (c?.milestones?.length ? c.milestones : [
    { y: '', t: '', d: '', category: '', metric: '', img: '', link: '' }, 
    { y: '', t: '', d: '', category: '', metric: '', img: '', link: '' },
    { y: '', t: '', d: '', category: '', metric: '', img: '', link: '' }, 
    { y: '', t: '', d: '', category: '', metric: '', img: '', link: '' }
  ]).map((m, idx) => ({
    y: m.y || '',
    t: m.t || '',
    d: m.d || '',
    category: m.category || '',
    metric: m.metric || '',
    img: m.img || '',
    link: m.link || '',
    id: m.id || `milestone-${idx}`
  }));
  const services = (c?.services?.length ? c.services : []).map((s, idx) => ({ ...s, id: s.id || `service-${idx}` }));

  // viral_content — read both snake_case and camelCase
  const rawViral = c?.viral_content || c?.viralContent || [];
  const viralContent = (rawViral.length 
    ? rawViral.map(v => typeof v === 'object' ? { views: v.views || '', img: v.img || '', title: v.title || '', link: v.link || '' } : { views: `${v}M`, img: '', title: '', link: '' }) 
    : [
    { views: '', img: '', title: '', link: '' },
    { views: '', img: '', title: '', link: '' },
    { views: '', img: '', title: '', link: '' }
  ]).map((v, idx) => ({ ...v, id: `viral-${idx}` }));

  // case_studies — read both snake_case and camelCase
  const rawCS = c?.case_studies || c?.caseStudies || [];
  const caseStudies = (rawCS.length ? rawCS.map(cs => ({
    title: cs.title || '', brand: cs.brand || '',
    desc: cs.desc || '', link: cs.link || '', img: cs.img || '',
    r1_label: cs.results?.[0]?.l || cs.r1_label || 'Reach', r1_val: cs.results?.[0]?.v || cs.r1_val || '',
    r2_label: cs.results?.[1]?.l || cs.r2_label || 'ROI', r2_val: cs.results?.[1]?.v || cs.r2_val || ''
  })) : [
    { title: '', brand: '', desc: '', link: '', img: '', r1_label: 'Reach', r1_val: '', r2_label: 'ROI', r2_val: '' },
    { title: '', brand: '', desc: '', link: '', img: '', r1_label: 'Sales', r1_val: '', r2_label: 'Clicks', r2_val: '' },
    { title: '', brand: '', desc: '', link: '', img: '', r1_label: 'Views', r1_val: '', r2_label: 'Shares', r2_val: '' }
  ]).map((cs, idx) => ({ ...cs, id: cs.id || `casestudy-${idx}` }));

  // social_links — read both snake_case and camelCase
  const socialLinks = (c?.social_links || c?.socialLinks || []).map(link => ({
    platform: link.platform || 'Instagram',
    url: link.url || '',
    followers: link.followers || ''
  }));

  // sponsored_posts — read both snake_case and camelCase
  const rawSponsored = c?.sponsored_posts || c?.sponsoredPosts || [];
  const sponsoredPosts = rawSponsored.length ? rawSponsored.map(p => ({
    brand: p.brand || '', campaign: p.campaign || '', platform: p.platform || 'Instagram',
    postUrl: p.postUrl || '', reach: p.reach || '', engagement: p.engagement || '',
    month: p.month || '', thumbnail: p.thumbnail || ''
  })) : getDefaultSponsoredPosts();

  // full_story — read both snake_case and camelCase
  const story = c?.full_story || c?.fullStory || {};

  // ai_intel — read nested object first, then flat fields
  const aiIntel = c?.ai_intel || {};

  return {
    name: c?.name || '', bio: c?.bio || '', city: c?.city || '', state: c?.state || '',
    photo: c?.photo || '', coverImage: c?.cover_image || c?.banner_image || c?.coverUrl || '',
    instagram: c?.instagram || '', youtube: c?.youtube || '',
    linkedin: c?.linkedin || '', twitter: c?.twitter || '', facebook: c?.facebook || '',
    instagramFollowers: c?.instagram_followers || c?.instagramFollowers || '',
    youtubeFollowers: c?.youtube_followers || c?.youtubeFollowers || '',
    linkedinFollowers: c?.linkedin_followers || c?.linkedinFollowers || '',
    twitterFollowers: c?.twitter_followers || c?.twitterFollowers || '',
    facebookFollowers: c?.facebook_followers || c?.facebookFollowers || '',
    rateMin: c?.rateMin || '', rateMax: c?.rateMax || '', portfolio: c?.portfolio || '',
    address: c?.address || '', tagline: c?.tagline || '', connections: c?.connections || '500+',
    gallery: Array.isArray(c?.gallery) ? c.gallery : [],
    // Full Story — read from snake_case first
    storyP1: story.p1 || '', storyQuote: story.quote || '',
    storyP2: story.p2 || '', storyP3: story.p3 || '',
    philosophy: c?.philosophy || '',
    philosophyTitle: c?.philosophy_title || c?.philosophyTitle || '',
    dominanceTitle: c?.dominance_title || c?.dominanceTitle || '',
    // AI Intel — nested object first, then flat keys
    aiMatch: aiIntel.match || c?.aiMatch || '',
    aiSummary: aiIntel.summary || c?.aiSummary || '',
    aiSafety: aiIntel.stats?.[0]?.v || c?.aiSafety || '',
    aiRetention: aiIntel.stats?.[1]?.v || c?.aiRetention || '',
    aiRoi: aiIntel.stats?.[2]?.v || c?.aiRoi || '',
    // Local Hub — read all key variants
    localVoice: c?.local_voice || c?.localVoice || '',
    localPenetration: c?.local_penetration || c?.localPenetration || '',
    regionalDialects: c?.regional_dialects || c?.regionalDialects || '',
    localTitle: c?.local_title || c?.localTitle || '',
    localHubsTitle: c?.local_hubs_title || c?.localHubsTitle || '',
    localHubs, awards, collabs, milestones,
    services, viralContent, caseStudies, socialLinks, sponsoredPosts,
    niche: Array.isArray(c?.niche) ? [...c.niche] : (c?.niche ? [c.niche] : []),
    languages: Array.isArray(c?.languages) ? [...c.languages] : (c?.languages ? [c.languages] : ['Hindi']),
    stories: c?.stories ? [...c.stories] : [],
    contactPhone: c?.contact_phone || c?.contactPhone || '',
    contactEmail: c?.contact_email || c?.contactEmail || c?.email || '',
    contactTelegram: c?.contact_telegram || c?.contactTelegram || '',
    contactMethod: c?.contact_method || c?.contactMethod || 'whatsapp',
    contactAvailability: c?.contact_availability || c?.contactAvailability || ''
  };
};

// ─── Activation Modal ──────────────────────────────────────────────────────────
const ActivationModal = ({ isOpen, onClose, currentPrice, activeCount, onSuccess }) => {
  const [step, setStep] = useState('summary'); // summary -> processing -> success
  const [method, setMethod] = useState('upi');

  if (!isOpen) return null;

  const handlePay = async () => {
    setStep('processing');
    try {
      const token = localStorage.getItem('cb_token');
      const orderRes = await fetch(ENV.apiUrl + '/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ type: 'PROFILE_ACTIVATION' })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

      const verifyRes = await fetch(ENV.apiUrl + '/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: 'pay_sim_' + Math.random().toString(36).slice(2, 11),
          razorpay_signature: 'simulated_signature'
        })
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed');

      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
        setStep('summary');
      }, 1800);
    } catch (err) {
      alert(err.message || 'Payment failed');
      setStep('summary');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)' }}>
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0 }}
        style={{
          background: '#fff',
          borderRadius: 28,
          padding: 32,
          maxWidth: 400,
          width: '100%',
          boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
          color: '#0f172a',
          position: 'relative'
        }}
      >
        {step !== 'processing' && (
          <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#94a3b8', fontSize: 18, cursor: 'pointer' }}>✕</button>
        )}

        {step === 'summary' && (
          <div>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,148,49,0.1)', color: '#FF9431', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Shield size={24} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 950, textAlign: 'center', margin: '0 0 4px', fontFamily: 'Outfit' }}>Profile Activation</h3>
            <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center', margin: '0 0 24px', fontWeight: 600 }}>Secure checkout to list your profile live</p>

            <div style={{ background: '#f8fafc', padding: 18, borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, color: '#64748b', marginBottom: 8 }}>
                <span>Order ID</span>
                <span style={{ color: '#0f172a' }}>CB-ACT-{Date.now().toString().slice(-6)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, color: '#64748b', marginBottom: 12 }}>
                <span>Package Plan</span>
                <span style={{ color: '#0f172a' }}>1-Year Portfolio Listing</span>
              </div>
              <div style={{ height: 1, background: '#e2e8f0', marginBottom: 12 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 950, color: '#0f172a' }}>
                <span>Total Amount</span>
                <span style={{ color: '#10B981' }}>₹{currentPrice}.00</span>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 8 }}>Select Payment Method</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { id: 'upi', label: 'UPI (Google Pay / PhonePe)', sub: 'Fast & Secure instant checkout', icon: '⚡' },
                  { id: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay', icon: '💳' },
                ].map(m => (
                  <div 
                    key={m.id} 
                    onClick={() => setMethod(m.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14,
                      border: `1.5px solid ${method === m.id ? '#FF9431' : '#e2e8f0'}`,
                      background: method === m.id ? 'rgba(255,148,49,0.04)' : '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{m.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 900, color: '#0f172a' }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 650 }}>{m.sub}</div>
                    </div>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${method === m.id ? '#FF9431' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {method === m.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF9431' }} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handlePay}
              style={{
                width: '100%', padding: '16px', borderRadius: 14, background: 'linear-gradient(90deg, #FF9431, #EA580C)',
                color: '#fff', fontSize: 14, fontWeight: 950, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 8px 24px rgba(255,148,49,0.2)'
              }}
            >
              Secure Checkout — Pay ₹{currentPrice}
            </button>
            <div style={{ textAlign: 'center', fontSize: 10, color: '#94a3b8', marginTop: 12, fontWeight: 600 }}>
              {activeCount} / 1000 active profiles live on launch offer.
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ display: 'inline-block', width: 48, height: 48, borderRadius: '50%', border: '4px solid rgba(255,148,49,0.1)', borderTopColor: '#FF9431', animation: 'spin 1s linear infinite' }} />
            <h4 style={{ fontSize: 16, fontWeight: 950, marginTop: 24, marginBlockEnd: 4, fontFamily: 'Outfit' }}>Processing Transaction...</h4>
            <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Please do not close or reload this page.</p>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>✓</div>
            <h4 style={{ fontSize: 18, fontWeight: 950, marginBlockEnd: 4, fontFamily: 'Outfit', color: '#10B981' }}>Payment Successful!</h4>
            <p style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBlockEnd: 0 }}>Your portfolio has been activated successfully!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

ActivationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  currentPrice: PropTypes.number.isRequired,
  activeCount: PropTypes.number.isRequired,
  onSuccess: PropTypes.func.isRequired
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ProfileBuilderPage() {
  const { st, dsp } = useApp();
  const navigate = useNavigate();
  const [mob, setMob] = useState(globalThis.innerWidth < 1024);
  const [tab, setTab] = useState('identity');
  const [saving, setSaving] = useState(false);

  // AI Co-Writer State variables
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTargetField, setAiTargetField] = useState(''); // 'bio', 'storyP1', 'storyP2', 'storyP3'
  const [aiTargetLimit, setAiTargetLimit] = useState(0); 
  const [aiTone, setAiTone] = useState('hinglish');
  const [aiKeywords, setAiKeywords] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);

  const [qbOpen, setQbOpen] = useState(false);
  const [qbBuilding, setQbBuilding] = useState(false);
  const [qbNiche, setQbNiche] = useState('');
  const [qbCity, setQbCity] = useState('');
  const [qbFollowers, setQbFollowers] = useState('');
  const [qbTone, setQbTone] = useState('hinglish');

  const handleQuickBuild = () => {
    setQbBuilding(true);
    setTimeout(() => {
      const n = qbNiche || (Array.isArray(F.niche)?F.niche.join(', '):F.niche) || 'Content';
      const city = qbCity || F.city || 'Bharat';
      const followers = parseInt(qbFollowers)||0;
      const texts = {
        en:       { bio:`${n} creator from ${city} | Authentic storytelling for real Bharat | Creating premium content that connects brands with regional audiences.`,
                    tagline:`${n} Creator | Real Stories, Real Impact | Turning views into brand value`,
                    philosophy:`My content philosophy: every video should build a genuine connection. I create ${n} content resonating with ${city}'s audience driving real brand ROI.`,
                    localVoice:`I actively support local businesses and homegrown brands in ${city}. My audience is deeply rooted in regional culture.`,
                    aiSummary:`${n} — High Authenticity, Regional Authority, Strong Engagement & Conversion ROI` },
        hinglish: { bio:`${city} se ${n} creator hoon! Authentic stories banata hoon jo real Bharat se connect karti hain. 🔥`,
                    tagline:`${n} Creator from ${city} | Real stories, real impact | Let's collab! 🚀`,
                    philosophy:`Content sirf views ke liye nahi hota — real impact ke liye. ${n} mein mera kaam ${city} ki audience ke saath authentic connection banana hai.`,
                    localVoice:`Main ${city} ke local brands aur startups ko promote karne ke liye hamesha ready hoon. Local ke liye vocal, always! 🙌`,
                    aiSummary:`${n} — Authentic Regional Voice, High Engagement & Trusted Brand Partner` },
        hi:       { bio:`${n} के क्षेत्र में ${city} से सक्रिय कंटेंट क्रिएटर। प्रामाणिक वीडियो के माध्यम से भारत की जनता को ब्रांड्स से जोड़ता हूँ।`,
                    tagline:`${n} क्रिएटर | प्रामाणिक भारतीय कंटेंट | ब्रांड्स को जनता से जोड़ता हूँ`,
                    philosophy:`मेरी फिलॉसफी — कंटेंट सिर्फ स्क्रॉल नहीं, सच्चा जुड़ाव। मैं ${n} में ऐसा कंटेंट बनाता हूँ जो ${city} की जनता को छूता है।`,
                    localVoice:`मैं ${city} के स्थानीय व्यापारियों का हमेशा समर्थन करता हूँ।`,
                    aiSummary:`${n} — उच्च प्रामाणिकता, क्षेत्रीय अधिकार और मजबूत ROI` },
      };
      const t = texts[qbTone]||texts.hinglish;
      let rateMin='3000',rateMax='10000';
      if(followers>=1000000){rateMin='80000';rateMax='300000';}
      else if(followers>=500000){rateMin='40000';rateMax='150000';}
      else if(followers>=100000){rateMin='15000';rateMax='60000';}
      else if(followers>=50000){rateMin='8000';rateMax='30000';}
      else if(followers>=10000){rateMin='3000';rateMax='12000';}
      setF(p=>({...p, bio:t.bio.slice(0,150), tagline:t.tagline, philosophy:t.philosophy, localVoice:t.localVoice,
        aiSummary:t.aiSummary, aiMatch:'94%', aiSafety:'99% Safe', aiRetention:'Excellent',
        aiRoi:followers>=100000?'5.8x':'3.2x', rateMin, rateMax, city:qbCity||p.city }));
      setQbBuilding(false); setQbOpen(false);
    }, 1200);
  };

  const openAiWriter = (field, limit = 0) => {
    setAiTargetField(field);
    setAiTargetLimit(limit);
    setAiModalOpen(true);
  };

  const handleAiWrite = () => {
    if (!aiKeywords.trim()) {
      alert('Please enter some keywords about your style or niche!');
      return;
    }
    setGeneratingAi(true);
    setTimeout(() => {
      const keys = aiKeywords.toLowerCase();
      let res = '';
      
      if (aiTone === 'en') {
        res = `Content creator specialized in ${keys}. Delivering highly engaging storytelling and raw reviews to build authentic brand connections across India.`;
      } else if (aiTone === 'hi') {
        res = `${keys} के क्षेत्र में सक्रिय कंटेंट क्रिएटर। प्रामाणिक अनुभवों और उत्कृष्ट वीडियो के माध्यम से भारत की जनता को सीधे ब्रांड्स से जोड़ता हूँ।`;
      } else if (aiTone === 'hinglish') {
        res = `Hey! I'm a digital creator doing ${keys}. Making highly engaging videos that regional audiences connect with instantly. Let's collaborate!`;
      } else if (aiTone === 'haryanvi') {
        res = `राम राम जी! ${keys} का एकदम ढाकड़ कंटेंट बनाऊँ हूँ। हरियाणवी बोली में ठेठ रिव्यूज और देसी अंदाज में ऑडियंस तक ब्रांड्स का संदेश पहुँचाऊँ हूँ।`;
      } else if (aiTone === 'rajasthani') {
        res = `खम्मा घणी सा! म्हारो नाम ${F.name || 'क्रिएटर'} है और मैं ${keys} को कंटेंट बणाऊँ। राजस्थानी मिठास और प्रामाणिक अंदाज में ब्रांड्स को प्रमोट करूं।`;
      } else if (aiTone === 'bhojpuri') {
        res = `प्रणाम! ${keys} के क्षेत्र में एकदम गर्दा वीडियो बनावेली। भोजपुरी बोली और ऊर्जायुक्त अंदाज से हमनी के ऑडियंस ब्रांड्स से सीधे जुड़ जाला।`;
      } else if (aiTone === 'marathi') {
        res = `नमस्कार! मी ${keys} या विषयात अस्सल मराठी भाषेत कंटेंट बनवतो. अस्सल प्रादेशिक संस्कृती आणि विश्वासाची जोड देऊन ब्रँड्सना लोकांपर्यंत पोहोचवतो.`;
      }

      if (aiTargetLimit > 0) {
        res = res.slice(0, aiTargetLimit);
      }

      upF(aiTargetField, res);
      setGeneratingAi(false);
      setAiModalOpen(false);
      setAiKeywords('');
    }, 1000);
  };

  const renderQuickBuildModal = () => {
    if(!qbOpen) return null;
    return (
      <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.45)', backdropFilter:'blur(10px)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
        <div style={{ background:'#fff', borderRadius:28, border:'1.5px solid #F1F5F9', padding:'32px', maxWidth:460, width:'100%', boxShadow:'0 30px 60px rgba(15,23,42,0.15)', boxSizing:'border-box' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
            <div style={{ width:48, height:48, borderRadius:16, background:'rgba(255,148,49,0.12)', display:'grid', placeItems:'center' }}><Sparkles size={22} color="#FF9431" fill="#FF9431" /></div>
            <div>
              <h3 style={{ fontSize:18, fontWeight:950, color:'#0F172A', margin:0 }}>🚀 AI Quick Build</h3>
              <p style={{ fontSize:12, color:'#64748B', margin:'2px 0 0' }}>10+ fields auto-fill in 5 seconds</p>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label style={{ fontSize:11, fontWeight:900, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:6 }}>Aapka Niche (e.g. Food, Tech, Fashion)</label>
              <input value={qbNiche} onChange={e=>setQbNiche(e.target.value)} placeholder="Food Vlogging, Tech Reviews, Fitness..." style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #E2E8F0', borderRadius:12, fontSize:13, fontWeight:650, outline:'none', boxSizing:'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:900, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:6 }}>Aapka City</label>
              <input value={qbCity} onChange={e=>setQbCity(e.target.value)} placeholder="Jaipur, Indore, Mumbai..." style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #E2E8F0', borderRadius:12, fontSize:13, fontWeight:650, outline:'none', boxSizing:'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:900, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:6 }}>Total Followers (for rate calculation)</label>
              <input type="number" value={qbFollowers} onChange={e=>setQbFollowers(e.target.value)} placeholder="e.g. 150000" style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #E2E8F0', borderRadius:12, fontSize:13, fontWeight:650, outline:'none', boxSizing:'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:900, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:6 }}>Language / Tone</label>
              <select value={qbTone} onChange={e=>setQbTone(e.target.value)} style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #E2E8F0', borderRadius:12, fontSize:13, fontWeight:700, color:'#0F172A', background:'#F8FAFC', outline:'none' }}>
                <option value="hinglish">🇮🇳 Hinglish (City Smart)</option>
                <option value="en">🇺🇸 English</option>
                <option value="hi">🇮🇳 Hindi</option>
              </select>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:6 }}>
              <button type="button" onClick={()=>setQbOpen(false)} style={{ flex:1, padding:'13px', background:'#F1F5F9', border:'none', borderRadius:12, fontSize:13, fontWeight:800, color:'#475569', cursor:'pointer' }}>Cancel</button>
              <button type="button" onClick={handleQuickBuild} disabled={qbBuilding} style={{ flex:2, padding:'13px', background:'linear-gradient(90deg,#FF9431,#EA580C)', border:'none', borderRadius:12, fontSize:13, fontWeight:900, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                {qbBuilding ? <><Loader2 size={16} className="spin" /> Building...</> : <><Sparkles size={16} /> AI Quick Build karo!</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAiModal = () => {
    if (!aiModalOpen) return null;
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: '#fff', borderRadius: 28, border: '1.5px solid #F1F5F9', padding: mob ? '20px' : '32px', maxWidth: 450, width: '100%', boxShadow: '0 30px 60px rgba(15,23,42,0.15)', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,148,49,0.12)', color: '#FF9431', display: 'grid', placeItems: 'center' }}>
              <Sparkles size={20} fill="#FF9431" fillOpacity={0.2} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 950, color: '#0F172A', margin: 0, fontFamily: "'Outfit', sans-serif" }}>AI Co-Writer Node</h3>
              <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>Draft premium localized bios in seconds</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            
            {/* Tone Selector */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 900, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 8 }}>Select Tone / Localized Dialect</label>
              <select 
                value={aiTone}
                onChange={e => setAiTone(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 14, fontWeight: 700, color: '#0F172A', background: '#F8FAFC', outline: 'none' }}
              >
                <option value="en">🇺🇸 Standard English</option>
                <option value="hi">🇮🇳 Professional Hindi (शुद्ध हिंदी)</option>
                <option value="hinglish">🇮🇳 Hinglish (City Smart / Mix)</option>
                <option value="haryanvi">🌾 Haryanvi Flavor (देसी / ढाकड़)</option>
                <option value="rajasthani">👑 Rajasthani Accent (खम्मा घणी / रजवाड़ी)</option>
                <option value="bhojpuri">🔥 Bhojpuri Fusion (ऊर्जायुक्त / गर्दा)</option>
                <option value="marathi">🚩 Marathi Pride (अस्सल प्रादेशिक)</option>
              </select>
            </div>

            {/* Keywords */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 900, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 8 }}>Niche / Style Keywords</label>
              <input 
                type="text"
                placeholder="e.g. fashion styling, budget food walks, tech reviews"
                value={aiKeywords}
                onChange={e => setAiKeywords(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 14, fontWeight: 650, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                style={{ flex: 1, padding: '14px', background: '#F1F5F9', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 800, color: '#475569', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAiWrite}
                disabled={generatingAi}
                style={{ flex: 1, padding: '14px', background: '#0F172A', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 900, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                {generatingAi ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Write Bio
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  };

  const isPro = st.isPro || localStorage.getItem('cb_is_pro') === 'true';
  const allC = LS.get('cb_creators', []);
  const c = getDefaultCreator(st, allC);
  const [F, setF] = useState(() => getInitialFormState(c));

  const [activation, setActivation] = useState({
    activeCount: 0,
    currentPrice: 199,
    isProfileActive: false,
    status: 'DRAFT'
  });
  const [isActivationOpen, setIsActivationOpen] = useState(false);

  const fetchActivationStatus = async () => {
    try {
      const token = localStorage.getItem('cb_token');
      const res = await fetch(ENV.apiUrl + '/creators/activation/status', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (res.ok) {
        const data = await res.json();
        setActivation(data);
      }
    } catch (err) {
      console.error('Failed to fetch activation status:', err);
    }
  };

  useEffect(() => {
    fetchActivationStatus();
  }, []);

  useEffect(() => {
    if (c) {
      setF(p => ({
        ...getInitialFormState(c),
        socialLinks: (c?.social_links || c?.socialLinks || []).length 
          ? (c.social_links || c.socialLinks).map(link => ({ platform: link.platform || 'Instagram', url: link.url || '', followers: link.followers || '' })) 
          : p.socialLinks,
        sponsoredPosts: (c?.sponsored_posts || c?.sponsoredPosts || []).length 
          ? (c.sponsored_posts || c.sponsoredPosts).map(sp => ({
            brand: sp.brand || '', campaign: sp.campaign || '', platform: sp.platform || 'Instagram',
            postUrl: sp.postUrl || '', reach: sp.reach || '', engagement: sp.engagement || '',
            month: sp.month || '', thumbnail: sp.thumbnail || ''
          })) 
          : p.sponsoredPosts
      }));
    }
  }, [st.user?.creatorProfile]);

  useEffect(() => {
    const h = () => setMob(globalThis.innerWidth < 1024);
    globalThis.addEventListener('resize', h);
    return () => globalThis.removeEventListener('resize', h);
  }, []);

  // ── Update Helpers ──
  const upF = (k, v) => setF(p => ({ ...p, [k]: v }));
  const upGallery = (idx, val) => setF(p => { const copy = [...p.gallery]; copy[idx] = val; return { ...p, gallery: copy }; });
  const upMilestone = (idx, field, val) => setF(p => { const copy = [...p.milestones]; copy[idx] = { ...copy[idx], [field]: val }; return { ...p, milestones: copy }; });
  const upService = (idx, field, val) => setF(p => { const copy = [...p.services]; copy[idx] = { ...copy[idx], [field]: val }; return { ...p, services: copy }; });
  const upAward = (idx, field, val) => setF(p => { const copy = [...p.awards]; copy[idx] = { ...copy[idx], [field]: val }; return { ...p, awards: copy }; });
  const upCollab = (idx, field, val) => setF(p => { const copy = [...p.collabs]; copy[idx] = { ...copy[idx], [field]: val }; return { ...p, collabs: copy }; });
  const upLocalHub = (idx, field, val) => setF(p => { const copy = [...p.localHubs]; copy[idx] = { ...copy[idx], [field]: val }; return { ...p, localHubs: copy }; });
  const upViralContent = (idx, field, val) => setF(p => { const copy = [...p.viralContent]; copy[idx] = { ...copy[idx], [field]: val }; return { ...p, viralContent: copy }; });
  const upCaseStudy = (idx, field, val) => setF(p => { const copy = [...p.caseStudies]; copy[idx] = { ...copy[idx], [field]: val }; return { ...p, caseStudies: copy }; });
  const upSocialLink = (idx, field, val) => setF(p => { const copy = [...p.socialLinks]; copy[idx] = { ...copy[idx], [field]: val }; return { ...p, socialLinks: copy }; });
  const addSocialLink = () => setF(p => ({ ...p, socialLinks: [...p.socialLinks, { platform: 'Instagram', url: '', followers: '' }] }));
  const removeSocialLink = (idx) => setF(p => ({ ...p, socialLinks: p.socialLinks.filter((_, i) => i !== idx) }));
  const addService = () => setF(p => ({ ...p, services: [...p.services, { id: `service-${Date.now()}`, t: '', d: '', rate: '' }] }));
  const removeService = (idx) => setF(p => ({ ...p, services: p.services.filter((_, i) => i !== idx) }));
  const upSponsoredPost = (idx, field, val) => setF(p => { const copy = [...p.sponsoredPosts]; copy[idx] = { ...copy[idx], [field]: val }; return { ...p, sponsoredPosts: copy }; });

  const toast = (msg, type) => dsp({ t: 'TOAST', d: { type, msg } });

  if (!st.user || st.role !== 'creator') return <AuthGatekeeper mob={mob} />;

  const saveProfile = async () => {
    setSaving(true);
    try {
      const filteredGallery = F.gallery.filter(Boolean);
      const filteredMilestones = F.milestones.filter(m => m && m.y && m.t).map(m => ({
        y: m.y, t: m.t, d: m.d,
        category: m.category || '', metric: m.metric || '', img: m.img || '', link: m.link || ''
      }));
      const filteredServices = F.services.filter(s => s && s.t);
      const filteredAwards = F.awards.filter(a => a && a.t && a.y);
      const filteredCollabs = F.collabs.filter(col => col && col.p && col.l).map(col => ({
        p: col.p, l: col.l, d: col.d,
        brandLink: col.brandLink || '',
        videoLink: col.videoLink || '',
        img: col.img || '',
        metric: col.metric || ''
      }));
      const filteredLocalHubs = F.localHubs.filter(h => h && h.l && h.v);
      const filteredViral = F.viralContent.filter(v => v && v.views).map(v => ({
        views: v.views, img: v.img || '', title: v.title || '', link: v.link || ''
      }));
      const filteredSponsoredPosts = F.sponsoredPosts.filter(p => p && p.brand && p.campaign);
      
      const filteredSocialLinks = F.socialLinks.filter(l => l && l.url).map(l => ({
        platform: l.platform,
        url: l.url,
        followers: parseInt(l.followers) || 0
      }));

      const filteredCaseStudies = F.caseStudies.filter(cs => cs && cs.title && cs.brand).map(cs => ({
        title: cs.title, brand: cs.brand,
        desc: cs.desc || '', link: cs.link || '', img: cs.img || '',
        results: [
          { l: cs.r1_label || 'Reach', v: cs.r1_val || 'N/A' },
          { l: cs.r2_label || 'ROI', v: cs.r2_val || 'N/A' }
        ]
      }));

      const instagramFollowersInt = parseInt(F.instagramFollowers) || 0;
      const youtubeFollowersInt = parseInt(F.youtubeFollowers) || 0;
      const linkedinFollowersInt = parseInt(F.linkedinFollowers) || 0;
      const twitterFollowersInt = parseInt(F.twitterFollowers) || 0;
      const facebookFollowersInt = parseInt(F.facebookFollowers) || 0;
      const customFollowersSum = filteredSocialLinks.reduce((sum, l) => sum + (l.followers || 0), 0);
      const totalReach = instagramFollowersInt + youtubeFollowersInt + linkedinFollowersInt + twitterFollowersInt + facebookFollowersInt + customFollowersSum;

      // Build nested ai_intel object that IdentityTab reads
      const ai_intel = {
        match: F.aiMatch || '',
        summary: F.aiSummary || '',
        stats: [
          { l: 'Brand Safety', v: F.aiSafety || '' },
          { l: 'Retention', v: F.aiRetention || '' },
          { l: 'ROI Potential', v: F.aiRoi || '' }
        ]
      };

      const activePlatforms = [];
      if (F.instagram) activePlatforms.push('Instagram');
      if (F.youtube) activePlatforms.push('YouTube');
      if (F.linkedin) activePlatforms.push('LinkedIn');
      if (F.twitter) activePlatforms.push('Twitter / X');
      if (F.facebook) activePlatforms.push('Facebook');
      filteredSocialLinks.forEach(l => {
        if (l.platform) activePlatforms.push(l.platform);
      });

      const calculatedScore = fmt.score({
        photo: F.photo,
        bio: F.bio,
        city: F.city,
        state: F.state,
        niche: F.niche,
        platform: activePlatforms,
        services: filteredServices,
        instagram: F.instagram,
        youtube: F.youtube,
        rateMin: F.rateMin,
        languages: F.languages,
        followers: totalReach,
        er: c?.engagementRate || c?.er || 0.05
      });

      const updatedProfile = { 
        ...c,
        platform: activePlatforms,
        score: calculatedScore,
        // ── Core Identity ──
        name: F.name, bio: F.bio, city: F.city, state: F.state,
        niche: F.niche || [],
        languages: F.languages || [],
        stories: F.stories || [],
        tagline: F.tagline,
        address: F.address,
        connections: F.connections,
        portfolio: F.portfolio,
        gallery: filteredGallery,

        // ── Social Handles ──
        instagram: F.instagram, youtube: F.youtube,
        facebook: F.facebook, linkedin: F.linkedin, twitter: F.twitter,

        // ── Follower Counts (both camelCase + snake_case for compatibility) ──
        instagramFollowers: instagramFollowersInt,
        youtubeFollowers: youtubeFollowersInt,
        linkedinFollowers: linkedinFollowersInt,
        twitterFollowers: twitterFollowersInt,
        facebookFollowers: facebookFollowersInt,
        instagram_followers: instagramFollowersInt,
        youtube_followers: youtubeFollowersInt,
        linkedin_followers: linkedinFollowersInt,
        twitter_followers: twitterFollowersInt,
        facebook_followers: facebookFollowersInt,
        followers: totalReach,

        // ── Rate Card ──
        rateMin: F.rateMin, rateMax: F.rateMax,

        // ── Profile Images (all 3 keys for Hero compatibility) ──
        photo: F.photo || c.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(F.name || st.user.name)}`,
        cover_image: F.coverImage || c.cover_image || `https://picsum.photos/seed/${c.id || 'cover'}/1600/500`,
        banner_image: F.coverImage || c.banner_image || `https://picsum.photos/seed/${c.id || 'cover'}/1600/500`,
        coverUrl: F.coverImage || c.coverUrl || `https://picsum.photos/seed/${c.id || 'cover'}/1600/500`,

        // ── Full Story (both keys — StoryTab reads either) ──
        full_story: { p1: F.storyP1, quote: F.storyQuote, p2: F.storyP2, p3: F.storyP3 },
        fullStory:  { p1: F.storyP1, quote: F.storyQuote, p2: F.storyP2, p3: F.storyP3 },

        // ── Content Philosophy ──
        philosophy: F.philosophy,
        philosophy_title: F.philosophyTitle,
        philosophyTitle: F.philosophyTitle,
        dominance_title: F.dominanceTitle,
        dominanceTitle: F.dominanceTitle,

        // ── AI Intel (nested object + flat keys) ──
        ai_intel,
        aiMatch: F.aiMatch,
        aiSummary: F.aiSummary,
        aiSafety: F.aiSafety,
        aiRetention: F.aiRetention,
        aiRoi: F.aiRoi,

        // ── Awards, Collabs, Milestones, Services ──
        awards: filteredAwards,
        collabs: filteredCollabs,
        milestones: filteredMilestones,
        services: filteredServices,

        // ── Viral Content (both keys) ──
        viral_content: filteredViral,
        viralContent: filteredViral,

        // ── Case Studies (both keys) ──
        case_studies: filteredCaseStudies,
        caseStudies: filteredCaseStudies,

        // ── Local Hub (all keys IdentityTab reads) ──
        local_voice: F.localVoice,
        localVoice: F.localVoice,
        local_penetration: F.localPenetration,
        localPenetration: F.localPenetration,
        regional_dialects: F.regionalDialects,
        regionalDialects: F.regionalDialects,
        local_impact_hubs: filteredLocalHubs,
        localHubs: filteredLocalHubs,
        local_hubs: filteredLocalHubs,
        local_title: F.localTitle,
        localTitle: F.localTitle,
        local_hubs_title: F.localHubsTitle,
        localHubsTitle: F.localHubsTitle,

        // ── Social Links (both keys) ──
        social_links: filteredSocialLinks,
        socialLinks: filteredSocialLinks,

        // ── Sponsored Posts (both keys) ──
        sponsored_posts: filteredSponsoredPosts,
        sponsoredPosts: filteredSponsoredPosts,

        // ── Contact ──
        contact_phone: F.contactPhone,
        contactPhone: F.contactPhone,
        contact_email: F.contactEmail,
        contactEmail: F.contactEmail,
        contact_telegram: F.contactTelegram,
        contactTelegram: F.contactTelegram,
        contact_method: F.contactMethod,
        contactMethod: F.contactMethod,
        contact_availability: F.contactAvailability,
        contactAvailability: F.contactAvailability,

        email: st.user?.email
      };

      const enrichedProfile = await updateCreatorProfile(updatedProfile);

      const isProfileDone = !!(
        F.name && F.bio && (F.instagram || F.youtube) && F.rateMin &&
        F.storyP1 && filteredMilestones.length > 0 && filteredServices.length > 0
      );
      localStorage.setItem('cb_profile_completed', isProfileDone ? 'true' : 'false');
      dsp({ t: 'LOGIN', u: { ...st.user, creatorProfile: enrichedProfile }, role: 'creator' });
      toast('Creator profile synced to database! 🎉', 'success');
    } catch (err) {
      toast('Failed to save profile: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const getDynamicCompleteness = (F) => {
    const activePlatforms = [];
    if (F.instagram) activePlatforms.push('Instagram');
    if (F.youtube) activePlatforms.push('YouTube');
    if (F.linkedin) activePlatforms.push('LinkedIn');
    if (F.twitter) activePlatforms.push('Twitter / X');
    if (F.facebook) activePlatforms.push('Facebook');
    F.socialLinks?.forEach(l => {
      if (l.url && l.platform) activePlatforms.push(l.platform);
    });

    return fmt.completeness({
      photo: F.photo,
      bio: F.bio,
      city: F.city,
      niche: F.niche,
      platform: activePlatforms,
      instagram: F.instagram,
      rateMin: F.rateMin,
      services: F.services?.filter(s => s.t) || []
    });
  };

  const getDynamicScore = (F, c) => {
    const instagramFollowersInt = parseInt(F.instagramFollowers) || 0;
    const youtubeFollowersInt = parseInt(F.youtubeFollowers) || 0;
    const linkedinFollowersInt = parseInt(F.linkedinFollowers) || 0;
    const twitterFollowersInt = parseInt(F.twitterFollowers) || 0;
    const facebookFollowersInt = parseInt(F.facebookFollowers) || 0;
    const customFollowersSum = F.socialLinks?.filter(l => l.url).reduce((sum, l) => sum + (parseInt(l.followers) || 0), 0) || 0;
    const totalFollowers = instagramFollowersInt + youtubeFollowersInt + linkedinFollowersInt + twitterFollowersInt + facebookFollowersInt + customFollowersSum;

    const activePlatforms = [];
    if (F.instagram) activePlatforms.push('Instagram');
    if (F.youtube) activePlatforms.push('YouTube');
    if (F.linkedin) activePlatforms.push('LinkedIn');
    if (F.twitter) activePlatforms.push('Twitter / X');
    if (F.facebook) activePlatforms.push('Facebook');
    F.socialLinks?.forEach(l => {
      if (l.url && l.platform) activePlatforms.push(l.platform);
    });

    return fmt.score({
      photo: F.photo,
      bio: F.bio,
      city: F.city,
      state: F.state,
      niche: F.niche,
      platform: activePlatforms,
      services: F.services?.filter(s => s.t) || [],
      instagram: F.instagram,
      youtube: F.youtube,
      rateMin: F.rateMin,
      languages: F.languages,
      followers: totalFollowers,
      er: c?.engagementRate || c?.er || 0.05
    });
  };

  const comp = getDynamicCompleteness(F);
  const score = getDynamicScore(F, c);
  const [mediaKitOpen, setMediaKitOpen] = useState(false);

  const sanitizedMediaKitCreator = useMemo(() => {
    if (!c && !F) return null;
    const base = c || {};
    return {
      id: base.id || 'creator',
      name: F.name || base.name || '',
      handle: base.handle || `@${base.slug || 'creator'}`,
      slug: base.slug || '',
      bio: F.bio !== undefined ? F.bio : (base.bio || ''),
      photo: F.photo || base.photo || '',
      coverImage: F.coverImage || base.coverImage || base.cover_image || '',
      city: F.city !== undefined ? F.city : (base.city || ''),
      state: F.state !== undefined ? F.state : (base.state || ''),
      niche: Array.isArray(F.niche) ? F.niche : (Array.isArray(base.niche) ? base.niche : []),
      platform: base.platform || [],
      followers: base.followers,
      engagementRate: base.engagementRate || base.er,
      services: F.services || base.services || [],
      packages: F.packages || base.packages || [],
      milestones: F.milestones || base.milestones || [],
      socialLinks: F.socialLinks || base.socialLinks || base.social_links || [],
      gallery: F.gallery || base.gallery || [],
      collabs: F.collabs || base.collabs || [],
      reviews: base.reviews || [],
      isVerified: base.isVerified || false,
      isPro: isPro || false,
      score: (score !== undefined && score !== null) ? Number(score) : (base.score || 0),
      fullStory: {
        p1: F.storyP1 || base.fullStory?.p1 || base.full_story?.p1 || '',
        quote: F.storyQuote || base.fullStory?.quote || base.full_story?.quote || '',
        p2: F.storyP2 || base.fullStory?.p2 || base.full_story?.p2 || '',
        p3: F.storyP3 || base.fullStory?.p3 || base.full_story?.p3 || ''
      },
      localHubs: F.localHubs || base.localHubs || base.local_hubs || [],
      rateMin: F.rateMin !== undefined ? F.rateMin : (base.rateMin || 0),
      rateMax: F.rateMax !== undefined ? F.rateMax : (base.rateMax || 0)
    };
  }, [c, F, isPro, score]);

  const stats = useMemo(() => {
    const rawFollowers = c?.followers;
    const followers = (rawFollowers !== undefined && rawFollowers !== null) ? Number(rawFollowers) : 0;
    const er = (c?.engagementRate !== undefined && c?.engagementRate !== null)
      ? Number(c?.engagementRate)
      : ((c?.er !== undefined && c?.er !== null) ? Number(c?.er) : 0);
    const scoreVal = (score !== undefined && score !== null)
      ? Number(score)
      : ((c?.score !== undefined && c?.score !== null) ? Number(c?.score) : 0);
    return {
      followers,
      er,
      reach: c?.reach !== undefined ? Number(c?.reach) : 0,
      authenticity: c?.authenticity !== undefined ? Number(c?.authenticity) : 0,
      score: scoreVal
    };
  }, [c, score]);

  return (
    <div className="dashboard-page-container">
      <div className="db-page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="badge-saffron">
               <Shield size={14} fill="#FF9431" /> CREATOR IDENTITY
            </div>
            <h1 className="page-title">Profile Builder</h1>
          </div>
          <button
            type="button"
            onClick={() => setMediaKitOpen(true)}
            aria-label="Preview and Download PDF Media Kit"
            className="btn-outline-pill"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 100,
              border: '1.5px solid #0F172A',
              background: '#fff',
              color: '#0F172A',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(15,23,42,0.06)'
            }}
          >
            <Download size={14} color="#FF9431" />
            Preview Media Kit
          </button>
        </div>
        <p className="db-sub-text">
          <strong>📢 Public Portfolio Builder:</strong> Build your digital portfolio. The details you fill here (portfolio media, biography, social links, rates) are <strong>public</strong> and will be visible to brands in the marketplace to secure collaborations.
        </p>
      </div>

      <div className="db-main-grid">
         {mob ? (
            <MobileTabSelector comp={comp} tab={tab} setTab={setTab} F={F} />
         ) : (
            <SettingsSidebar score={score} comp={comp} tab={tab} setTab={setTab} F={F} activation={activation} onActivate={() => setIsActivationOpen(true)} />
         )}

         <div className="db-col-right">
            <AnimatePresence mode="wait">
               {tab === 'identity' && (
                 <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="identity">
                    <IdentityTabContent F={F} c={c} st={st} mob={mob} upF={upF} saveProfile={saveProfile} saving={saving} dsp={dsp} openAiWriter={openAiWriter} />
                 </motion.div>
               )}
                {tab === 'gallery' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="gallery">
                     <GalleryTabContent F={F} mob={mob} upF={upF} upGallery={upGallery} saveProfile={saveProfile} setTab={setTab} isPro={isPro} navigate={navigate} dsp={dsp} />
                  </motion.div>
                )}
                {tab === 'social' && (
                 <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="social">
                    <SocialTabContent F={F} mob={mob} upF={upF} upGallery={upGallery} upSocialLink={upSocialLink} addSocialLink={addSocialLink} removeSocialLink={removeSocialLink} saveProfile={saveProfile} setTab={setTab} isPro={isPro} navigate={navigate} />
                 </motion.div>
               )}
               {tab === 'story' && (
                 <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="story">
                    <StoryTabContent F={F} mob={mob} upF={upF} upAward={upAward} upCollab={upCollab} upMilestone={upMilestone} saveProfile={saveProfile} setTab={setTab} openAiWriter={openAiWriter} />
                 </motion.div>
               )}
               {tab === 'packages' && (
                 <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="packages">
                    <PackagesTabContent F={F} mob={mob} upF={upF} upService={upService} addService={addService} removeService={removeService} upViralContent={upViralContent} upCaseStudy={upCaseStudy} saveProfile={saveProfile} setTab={setTab} isPro={isPro} navigate={navigate} />
                 </motion.div>
               )}
               {tab === 'local' && (
                 <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="local">
                    <LocalTabContent F={F} mob={mob} upF={upF} upLocalHub={upLocalHub} saveProfile={saveProfile} setTab={setTab} openAiWriter={openAiWriter} />
                 </motion.div>
               )}
               {tab === 'sponsored' && (
                 <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="sponsored">
                    <SponsoredTabContent F={F} mob={mob} upSponsoredPost={upSponsoredPost} saveProfile={saveProfile} setTab={setTab} />
                 </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
      {renderQuickBuildModal()}
      {renderAiModal()}
      <ActivationModal 
        isOpen={isActivationOpen} 
        onClose={() => setIsActivationOpen(false)} 
        currentPrice={activation.currentPrice} 
        activeCount={activation.activeCount} 
        onSuccess={fetchActivationStatus} 
      />
      <FullScreenSaveOverlay show={saving} title="Syncing Profile..." subtitle="Updating your public creator portfolio to the marketplace" />

      {/* Media Kit Preview Modal */}
      {sanitizedMediaKitCreator && stats && (
        <MediaKitPreview
          open={mediaKitOpen}
          onClose={() => setMediaKitOpen(false)}
          creator={sanitizedMediaKitCreator}
          stats={stats}
        />
      )}
    </div>
  );
}
