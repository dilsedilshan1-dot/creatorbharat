import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  ShieldCheck, 
  Download, 
  X, 
  PieChart, 
  TrendingUp, 
  Globe,
  Activity,
  Zap,
  Star,
  Briefcase,
  Mail,
  MapPin,
  Shield,
  Sparkles
} from 'lucide-react';
import { fmt } from '@/utils/helpers';

const StatBox = ({ label, value, icon: Icon, color }) => (
  <div style={{ padding: '20px', background: 'rgba(248,250,252,0.92)', borderRadius: '24px', border: '1.5px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px', backdropFilter: 'blur(8px)' }}>
     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '24px', height: '24px', background: `${color}10`, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <Icon size={12} color={color} />
        </div>
        <span style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
     </div>
     <div style={{ fontSize: '22px', fontWeight: 950, color: '#0f172a' }}>{value}</div>
  </div>
);
StatBox.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.string.isRequired, icon: PropTypes.elementType.isRequired, color: PropTypes.string.isRequired };

const SectionTitle = ({ children, icon: Icon }) => (
  <h3 style={{ fontSize: '18px', fontWeight: 950, color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
     <div style={{ width: '32px', height: '32px', background: '#FF943110', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color="#FF9431" />
     </div>
     {children}
  </h3>
);
SectionTitle.propTypes = { children: PropTypes.node.isRequired, icon: PropTypes.elementType.isRequired };

export const MediaKitPreview = ({ open, onClose, creator, stats }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0); 
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    if (open) {
      setStep(0);
      const t1 = setTimeout(() => setStep(1), 1200);
      const t2 = setTimeout(() => setStep(2), 2800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [open]);

  useEffect(() => {
    if (step === 2 && wrapperRef.current) {
      const handleResize = () => {
        const parentWidth = wrapperRef.current.offsetWidth;
        if (parentWidth > 0) {
          const availableWidth = parentWidth - 48; // Leaves spacing for margins
          if (availableWidth < 950) {
            setScale(Math.max(0.35, availableWidth / 950));
          } else {
            setScale(1);
          }
        }
      };
      
      handleResize();
      window.addEventListener('resize', handleResize);
      
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const width = entry.contentRect.width;
          if (width > 0) {
            const availableWidth = width - 48;
            if (availableWidth < 950) {
              setScale(Math.max(0.35, availableWidth / 950));
            } else {
              setScale(1);
            }
          }
        }
      });
      resizeObserver.observe(wrapperRef.current);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        resizeObserver.disconnect();
      };
    }
  }, [step]);

  if (!open) return null;

  // Pre-process niche tags to avoid nested ternary operators in JSX render
  const rawNiches = Array.isArray(creator.niche)
    ? creator.niche
    : (typeof creator.niche === 'string' ? creator.niche.split('&') : ['Digital Storyteller', 'Content Specialist']);
  const nicheTags = [...rawNiches, 'Verified Creator', 'Elite Partner'].slice(0, 3);

  // Dynamic social platform normalization and extraction from real creator data
  const socialList = (() => {
    const list = [];
    const seen = new Set();

    const PLATFORM_META = {
      'instagram': { type: 'Instagram', color: '#E4405F' },
      'youtube': { type: 'YouTube', color: '#FF0000' },
      'linkedin': { type: 'LinkedIn', color: '#0077B5' },
      'twitter': { type: 'Twitter / X', color: '#1DA1F2' },
      'twitter / x': { type: 'Twitter / X', color: '#1DA1F2' },
      'x': { type: 'Twitter / X', color: '#1DA1F2' },
      'facebook': { type: 'Facebook', color: '#1877F2' }
    };

    // 1. Process creator.socialLinks array
    if (Array.isArray(creator.socialLinks)) {
      creator.socialLinks.forEach(link => {
        if (!link || !link.platform) return;
        const normKey = String(link.platform).toLowerCase().trim();
        const meta = PLATFORM_META[normKey] || { type: link.platform, color: '#6366F1' };
        if (seen.has(meta.type.toLowerCase())) return;

        const handleStr = link.url || (creator.slug ? `@${creator.slug}` : (creator.handle || ''));
        if (!handleStr) return;

        const countStr = (link.followers !== undefined && link.followers !== null && String(link.followers).trim() !== '' && Number(link.followers) > 0)
          ? fmt.num(link.followers)
          : '—';

        seen.add(meta.type.toLowerCase());
        list.push({
          type: meta.type,
          handle: handleStr,
          count: countStr,
          color: meta.color
        });
      });
    }

    // 2. Process direct platform fields if not already captured
    const directPlatforms = [
      { key: 'instagram', field: creator.instagram, followers: creator.instagramFollowers || (stats.followers ? stats.followers : undefined) },
      { key: 'youtube', field: creator.youtube, followers: creator.youtubeFollowers },
      { key: 'linkedin', field: creator.linkedin, followers: creator.linkedinFollowers },
      { key: 'twitter', field: creator.twitter, followers: creator.twitterFollowers },
      { key: 'facebook', field: creator.facebook, followers: creator.facebookFollowers }
    ];

    directPlatforms.forEach(({ key, field, followers }) => {
      const meta = PLATFORM_META[key];
      if (!meta || seen.has(meta.type.toLowerCase())) return;
      if (!field && !followers) return;

      const handleStr = field || (creator.slug ? `@${creator.slug}` : (creator.handle || ''));
      if (!handleStr) return;

      const countStr = (followers !== undefined && followers !== null && String(followers).trim() !== '' && Number(followers) > 0)
        ? fmt.num(followers)
        : '—';

      seen.add(meta.type.toLowerCase());
      list.push({
        type: meta.type,
        handle: handleStr,
        count: countStr,
        color: meta.color
      });
    });

    // 3. If platform array exists on creator (e.g. ['Instagram', 'YouTube'])
    if (Array.isArray(creator.platform)) {
      creator.platform.forEach(p => {
        if (!p) return;
        const normKey = String(p).toLowerCase().trim();
        const meta = PLATFORM_META[normKey] || { type: p, color: '#6366F1' };
        if (seen.has(meta.type.toLowerCase())) return;
        seen.add(meta.type.toLowerCase());
        list.push({
          type: meta.type,
          handle: creator.slug ? `@${creator.slug}` : (creator.handle || '—'),
          count: (meta.type === 'Instagram' && stats.followers && Number(stats.followers) > 0) ? fmt.num(stats.followers) : '—',
          color: meta.color
        });
      });
    }

    return list;
  })();

  const pastBrands = Array.isArray(creator.collabs) && creator.collabs.length > 0
    ? creator.collabs.map(c => (typeof c === 'string' ? c : (c.p || c.brand || c.name || ''))).filter(Boolean)
    : [];

  const logistics = creator.logistics || {
    timezone: 'India (IST — UTC+5:30)',
    invoicing: 'SWIFT, Stripe, PayPal Accepted',
    shipping: 'DHL & FedEx International Shipping',
    meetings: 'Google Meet, Zoom, Slack'
  };

  const handlePrint = () => {
    const content = document.getElementById('media-kit-export-container');
    if (!content) return;

    const printWindow = document.createElement('iframe');
    printWindow.style.position = 'absolute';
    printWindow.style.top = '-10000px';
    printWindow.style.left = '-10000px';
    printWindow.style.width = '210mm';
    document.body.appendChild(printWindow);

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(s => s.outerHTML)
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <base href="${window.location.origin}/" />
          <title>Creator Portfolio - ${creator.name}</title>
          ${styles}
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800;900&display=swap');
            
            * { 
              box-sizing: border-box !important; 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
            }

            html, body { 
              margin: 0 !important; 
              padding: 0 !important; 
              background: #ffffff !important;
              width: 210mm;
              font-family: 'Inter', sans-serif;
              color: #0f172a !important;
            }

            /* CRITICAL: Flatten all scrollable areas for print */
            div, section, article {
              overflow: visible !important;
              height: auto !important;
              max-height: none !important;
              position: static !important;
            }

            #media-kit-export-container { 
              width: 950px !important; 
              zoom: 0.78 !important; /* Scale to fit A4 */
              height: auto !important;
              margin: 0 auto !important; 
              padding: 0 !important;
              box-shadow: none !important; 
              border: none !important;
              border-radius: 0 !important;
              background: #ffffff !important;
              display: block !important;
              position: relative !important;
              overflow: visible !important;
            }

            /* High-fidelity section guards */
            .printable-section { 
              margin: 0 !important;
              padding: 0 !important;
              display: block !important;
              background: transparent !important;
            }

            .print-layout {
               display: block !important;
            }
            .print-layout::after {
               content: "";
               clear: both;
               display: table;
            }
            .print-col-left {
               float: left !important;
               width: 58% !important;
            }
            .print-col-right {
               float: right !important;
               width: 36% !important;
            }

            @page { 
              size: A4 portrait; 
              margin: 5mm !important; 
            }

            /* Premium Typography */
            h1 { font-size: 64px !important; letter-spacing: -3px !important; line-height: 1 !important; margin: 0 0 20px 0 !important; }
            h2 { font-size: 22px !important; letter-spacing: -0.5px !important; margin: 0 0 15px 0 !important; }
            
            /* DP Correction */
            .print-dp { 
               width: 180px !important; 
               height: 180px !important; 
               border-radius: 40px !important; 
               object-fit: cover !important; 
               border: 6px solid rgba(255,255,255,0.1) !important;
               box-shadow: 0 15px 30px rgba(0,0,0,0.2) !important;
               display: block !important;
               visibility: visible !important;
            }

            /* Grid Layout for Print */
            .grid-container {
               display: grid !important;
               grid-template-columns: 1.5fr 1fr !important;
               gap: 60px !important;
            }

            /* Remove scrollbars and UI chrome */
            ::-webkit-scrollbar { display: none !important; }
            .no-print { display: none !important; }
          </style>
        </head>
        <body>
          <div id="media-kit-export-container">
            ${content.innerHTML}
          </div>
        </body>
      </html>
    `;
    
    printWindow.srcdoc = html;

    // Trigger print safely from main thread after images load
    setTimeout(() => {
       try {
         printWindow.contentWindow.focus();
         printWindow.contentWindow.print();
       } catch (e) {
         console.error('Print failed', e);
       }
       setTimeout(() => {
          if (document.body.contains(printWindow)) {
             printWindow.remove();
          }
       }, 2000);
    }, 1200);
  };

  return ReactDOM.createPortal(
    <div id="media-kit-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
       <motion.div 
         initial={{ opacity: 0 }} 
         animate={{ opacity: 1 }} 
         exit={{ opacity: 0 }} 
         onClick={onClose}
         style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(20px)' }} 
       />
       
       <motion.div 
         initial={{ opacity: 0, scale: 0.95, y: 30 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         style={{ 
           width: '100%', 
           maxWidth: step === 2 ? '1100px' : '500px', 
           maxHeight: '94vh',
           background: '#ffffff', 
           borderRadius: '48px', 
           position: 'relative', 
           zIndex: 1, 
           overflow: 'hidden',
           display: 'flex',
           flexDirection: 'column',
           boxShadow: '0 60px 150px rgba(15,23,42,0.15)',
           transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
         }}
       >
          {/* Header */}
          <div style={{ padding: '24px 40px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', position: 'sticky', top: 0, zIndex: 10 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', background: '#FF9431', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <ShieldCheck size={24} color="#fff" />
                </div>
                <div>
                   <h2 style={{ fontSize: '18px', fontWeight: 950, color: '#0f172a', letterSpacing: '-0.5px' }}>CreatorBharat <span style={{ color: '#FF9431' }}>Elite Audit</span></h2>
                   <p style={{ fontSize: '10px', color: '#10B981', fontWeight: 900, letterSpacing: '1.5px' }}>SYSTEM VERSION 4.2 // MASTER CONFIG</p>
                </div>
             </div>
             <button onClick={onClose} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f8fafc', border: '1.5px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                <X size={20} color="#64748b" />
             </button>
          </div>

          <div 
             ref={wrapperRef}
             style={{ 
                flex: 1, 
                overflowY: 'auto', 
                overflowX: 'hidden', 
                padding: step === 2 ? '24px 16px' : '80px 40px',
                display: step === 2 ? 'flex' : 'block',
                flexDirection: 'column',
                alignItems: 'center',
                background: '#f8fafc'
             }}
          >
             <AnimatePresence mode="wait">
                {step === 0 && (
                   <motion.div key="step-0" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} style={{ textAlign: 'center' }}>
                      <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 40px' }}>
                         <motion.div 
                           animate={{ rotate: 360 }} 
                           transition={{ repeat: Infinity, duration: 4, ease: "linear" }} 
                           style={{ position: 'absolute', inset: 0, border: '5px dashed #FF9431', borderRadius: '50%', opacity: 0.4 }} 
                         />
                         <div style={{ position: 'absolute', inset: '15px', background: 'linear-gradient(135deg, #FF9431, #FF5C00)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 15px 30px rgba(255,148,49,0.3)' }}>
                            <Activity size={50} color="#fff" />
                         </div>
                      </div>
                      <h3 style={{ fontSize: '32px', fontWeight: 950, color: '#0f172a', marginBottom: '16px' }}>Auditing Intelligence</h3>
                      <p style={{ fontSize: '18px', color: '#64748b', fontWeight: 500, maxWidth: '400px', margin: '0 auto' }}>Scanning 150+ social signals and real-time conversion patterns.</p>
                   </motion.div>
                )}

                {step === 1 && (
                   <motion.div key="step-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
                      <motion.div 
                        animate={{ scale: [1, 1.1, 1] }} 
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{ width: '120px', height: '120px', background: '#0f172a', borderRadius: '40px', margin: '0 auto 40px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.2)' }}
                      >
                         <Zap size={56} color="#FF9431" fill="#FF9431" />
                      </motion.div>
                      <h3 style={{ fontSize: '32px', fontWeight: 950, color: '#0f172a', marginBottom: '16px' }}>Elite Generation</h3>
                      <p style={{ fontSize: '18px', color: '#64748b', fontWeight: 500 }}>Formatting your professional audit into a brand-ready Creator Resume.</p>
                      <div style={{ maxWidth: '350px', margin: '40px auto 0' }}>
                         <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '100px', overflow: 'hidden' }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5 }} style={{ height: '100%', background: 'linear-gradient(90deg, #FF9431, #FF5C00)' }} />
                         </div>
                      </div>
                   </motion.div>
                )}                 {step === 2 && (
                   <motion.div key="step-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                      {/* PDF RESUME CONTAINER */}
                      <div 
                         id="media-kit-export-container" 
                         style={{ 
                            width: '950px', 
                            background: '#ffffff', 
                            borderRadius: '40px', 
                            boxShadow: '0 50px 120px rgba(15,23,42,0.08)', 
                            border: '1.5px solid #e2e8f0', 
                            overflow: 'hidden',
                            zoom: scale,
                            flexShrink: 0,
                            position: 'relative'
                         }}
                      >
                         {/* Subtle Brand Watermark Background - Distributed vertically */}
                         <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', pointerEvents: 'none', zIndex: 1, opacity: 0.02, overflow: 'hidden' }}>
                            <div style={{ fontSize: '120px', fontWeight: 950, color: '#FF9431', transform: 'rotate(-12deg)', letterSpacing: '12px', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>
                               CREATORBHARAT
                            </div>
                            <div style={{ fontSize: '120px', fontWeight: 950, color: '#0f172a', transform: 'rotate(-12deg)', letterSpacing: '12px', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>
                               VERIFIED AUDIT
                            </div>
                            <div style={{ fontSize: '120px', fontWeight: 950, color: '#FF9431', transform: 'rotate(-12deg)', letterSpacing: '12px', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>
                               CREATORBHARAT
                            </div>
                            <div style={{ fontSize: '120px', fontWeight: 950, color: '#0f172a', transform: 'rotate(-12deg)', letterSpacing: '12px', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>
                               VERIFIED AUDIT
                            </div>
                            <div style={{ fontSize: '120px', fontWeight: 950, color: '#FF9431', transform: 'rotate(-12deg)', letterSpacing: '12px', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>
                               CREATORBHARAT
                            </div>
                         </div>
                         
                         {/* HERO HEADER - Clean premium light theme */}
                         <div style={{ background: 'linear-gradient(135deg, rgba(248,250,252,0.95) 0%, rgba(241,245,249,0.95) 100%)', borderBottom: '1.5px solid #e2e8f0', padding: '80px 60px', position: 'relative', color: '#0f172a', overflow: 'hidden', zIndex: 2, backdropFilter: 'blur(8px)' }}>
                            <div style={{ position: 'absolute', top: '-150px', left: '-50px', width: '500px', height: '500px', background: '#FF9431', borderRadius: '50%', filter: 'blur(180px)', opacity: 0.08 }} />
                            
                            <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <div style={{ maxWidth: '500px' }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(255,148,49,0.12)', borderRadius: '100px', color: '#FF9431', fontSize: '14px', fontWeight: 950, marginBottom: '32px', border: '1px solid rgba(255,148,49,0.3)', letterSpacing: '1px' }}>
                                     <Star size={16} fill="#FF9431" /> {t('mediakit.eliteResume', 'ELITE AUDITED RESUME')}
                                  </div>
                                  <h1 style={{ fontSize: '72px', fontWeight: 950, letterSpacing: '-0.05em', lineHeight: 0.85, marginBottom: '24px', color: '#0f172a' }}>{creator.name}</h1>
                                  <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
                                     {nicheTags.map(tag => (
                                        <span key={tag.trim()} style={{ padding: '6px 14px', background: '#ffffff', borderRadius: '8px', fontSize: '12px', fontWeight: 800, color: '#FF9431', border: '1.5px solid rgba(255,148,49,0.25)', whiteSpace: 'nowrap', boxShadow: '0 2px 4px rgba(15,23,42,0.02)' }}>{tag.trim().toUpperCase()}</span>
                                     ))}
                                  </div>
                                  <p style={{ fontSize: '20px', color: '#475569', fontWeight: 500, lineHeight: 1.5 }}>
                                     {creator.bio || t('mediakit.defaultBio', 'Elite storyteller and digital architect dedicated to crafting high-impact narratives for global brands.')}
                                  </p>
                                </div>
                                <div style={{ width: '220px', height: '220px', borderRadius: '50px', border: '8px solid #ffffff', overflow: 'hidden', transform: 'rotate(4deg)', boxShadow: '0 20px 40px rgba(15,23,42,0.08)', background: '#f1f5f9' }}>
                                   <img 
                                      src={creator.photo} 
                                      crossOrigin="anonymous"
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                      className="print-dp" 
                                      alt="dp" 
                                   />
                                </div>
                            </div>
                         </div>

                         {/* DATA ANALYTICS */}
                         <div style={{ padding: '40px 60px', position: 'relative', zIndex: 2 }}>
                            <div className="print-layout" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
                               
                               {/* CORE METRICS */}
                               <div className="printable-section print-col-left" style={{ position: 'relative', zIndex: 2 }}>
                                  <SectionTitle icon={TrendingUp}>{t('mediakit.performanceAudit', 'Performance Audit')}</SectionTitle>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '60px' }}>
                                     <StatBox
                                       label={t('mediakit.totalReach', 'Total Reach')}
                                       value={(stats.followers !== undefined && stats.followers !== null && Number(stats.followers) > 0) ? fmt.num(stats.followers) : '—'}
                                       icon={Globe}
                                       color="#3b82f6"
                                     />
                                     <StatBox
                                       label={t('mediakit.engagements', 'Engagements')}
                                       value={(stats.engagements !== undefined && stats.engagements !== null && Number(stats.engagements) > 0) ? fmt.num(stats.engagements) : ((creator.engagements !== undefined && creator.engagements !== null && Number(creator.engagements) > 0) ? fmt.num(creator.engagements) : '—')}
                                       icon={Zap}
                                       color="#FF9431"
                                     />
                                     <StatBox
                                       label={t('mediakit.audienceTrust', 'Audience Trust')}
                                       value={(stats.authenticity !== undefined && stats.authenticity !== null && Number(stats.authenticity) > 0) ? `${stats.authenticity}%` : '—'}
                                       icon={ShieldCheck}
                                       color="#10B981"
                                     />
                                     <StatBox
                                       label={t('mediakit.conversion', 'Conversion Potential')}
                                       value={(creator.conversion !== undefined && creator.conversion !== null && String(creator.conversion).trim() !== '') ? String(creator.conversion) : (creator.ai_intel?.stats?.find(s => s.l && s.l.includes('ROI'))?.v || '—')}
                                       icon={TrendingUp}
                                       color="#8b5cf6"
                                     />
                                  </div>

                                  <SectionTitle icon={Star}>{t('mediakit.pastCollabs', 'Past Collaborations')}</SectionTitle>
                                  {pastBrands.length > 0 ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '60px' }}>
                                       {pastBrands.slice(0, 6).map(brand => (
                                          <div key={brand} style={{ padding: '16px', background: 'rgba(248,250,252,0.92)', borderRadius: '16px', border: '1.5px solid #f1f5f9', textAlign: 'center', fontSize: '13px', fontWeight: 900, color: '#64748b', backdropFilter: 'blur(8px)', position: 'relative', zIndex: 2 }}>
                                             {brand}
                                          </div>
                                       ))}
                                    </div>
                                  ) : (
                                    <div style={{ padding: '20px', background: 'rgba(248,250,252,0.92)', borderRadius: '16px', border: '1.5px solid #f1f5f9', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#64748b', marginBottom: '60px' }}>
                                       Available for Brand Collaborations
                                    </div>
                                  )}

                                  <SectionTitle icon={Briefcase}>Signature Offerings</SectionTitle>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '60px' }}>
                                     {(creator.packages || (creator.services && creator.services.length > 0 ? creator.services.map((s, idx) => ({
                                        l: s.t,
                                        v: s.rate ? `₹${Number(s.rate).toLocaleString('en-IN')}` : 'Custom',
                                        items: s.d ? s.d.split(',').map(item => item.trim()) : []
                                     })) : [
                                        { l: 'Dedicated Integration', v: 'Custom', items: ['Full-length dedicated brand integration with premium production.'] },
                                        { l: 'Short-Form Video', v: 'Custom', items: ['High retention reel/short with native storytelling.'] }
                                     ])).slice(0, 2).map((pkg, i) => {
                                        const title = pkg.title || pkg.l;
                                        const price = pkg.price || pkg.v;
                                        const desc = pkg.desc || (pkg.items && pkg.items.join(', ')) || 'Premium branded content.';
                                        return (
                                           <div key={title || i} style={{ padding: '20px', background: 'rgba(248,250,252,0.92)', borderRadius: '24px', border: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(8px)', position: 'relative', zIndex: 2 }}>
                                              <div>
                                                 <div style={{ fontSize: '15px', fontWeight: 950, color: '#0f172a', marginBottom: '6px' }}>{title}</div>
                                                 <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, maxWidth: '220px', lineHeight: 1.4 }}>{desc}</div>
                                              </div>
                                              <div style={{ fontSize: '14px', fontWeight: 950, color: '#FF9431', background: '#FF943115', padding: '8px 16px', borderRadius: '100px', whiteSpace: 'nowrap' }}>
                                                 {price}
                                              </div>
                                           </div>
                                        );
                                     })}
                                  </div>

                                  {/* Industry Brand Affinity Fit */}
                                  <SectionTitle icon={Sparkles}>Brand Affinity Fit</SectionTitle>
                                  {Array.isArray(creator.brand_affinities) && creator.brand_affinities.length > 0 ? (
                                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '60px' }}>
                                        {creator.brand_affinities.slice(0, 4).map(aff => (
                                           <div key={aff.name} style={{ padding: '16px', background: 'rgba(248,250,252,0.92)', borderRadius: '20px', border: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(8px)', position: 'relative', zIndex: 2 }}>
                                              <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569' }}>{aff.name}</span>
                                              {aff.score && (
                                                 <span style={{ fontSize: '11px', fontWeight: 900, color: '#10b981', background: 'rgba(16,185,129,0.08)', padding: '4px 10px', borderRadius: '100px', whiteSpace: 'nowrap' }}>
                                                    {aff.score} Fit
                                                 </span>
                                              )}
                                           </div>
                                        ))}
                                     </div>
                                  ) : (
                                     <div style={{ padding: '24px 32px', background: 'rgba(248,250,252,0.92)', borderRadius: '24px', border: '1.5px solid #f1f5f9', textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: 600, marginBottom: '60px', lineHeight: 1.5 }}>
                                        Brand affinity insights will appear as your profile gains verified campaign data.
                                     </div>
                                  )}

                                  <SectionTitle icon={Zap}>Digital Footprint</SectionTitle>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '60px' }}>
                                     {socialList.length > 0 ? (
                                       socialList.map(s => (
                                          <div key={s.type} style={{ padding: '24px', background: 'rgba(248,250,252,0.92)', borderRadius: '24px', border: '1.5px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(8px)', position: 'relative', zIndex: 2 }}>
                                             <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ width: '40px', height: '40px', background: s.color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: `0 8px 16px ${s.color}30` }}>
                                                   {s.type[0]}
                                                </div>
                                                <div>
                                                   <div style={{ fontSize: '16px', fontWeight: 950, color: '#0f172a' }}>{s.type}</div>
                                                   <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>{s.handle}</div>
                                                </div>
                                             </div>
                                             <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '18px', fontWeight: 950, color: '#0f172a' }}>{s.count}</div>
                                                <div style={{ fontSize: '10px', color: '#10B981', fontWeight: 900 }}>REAL-TIME SYNC</div>
                                             </div>
                                          </div>
                                       ))
                                     ) : (
                                       <div style={{ padding: '24px', background: 'rgba(248,250,252,0.92)', borderRadius: '24px', border: '1.5px solid #f1f5f9', textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                                          No social channels linked yet
                                       </div>
                                     )}
                                  </div>

                                  {/* Professional Production Suite & Tech Stack */}
                                  <SectionTitle icon={ShieldCheck}>Production Suite & Creative Tech</SectionTitle>
                                  {(creator.camera || creator.audio || creator.editing || creator.studio) ? (
                                     <div style={{ padding: '32px', background: 'rgba(248,250,252,0.92)', borderRadius: '32px', border: '1.5px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '60px', backdropFilter: 'blur(8px)', position: 'relative', zIndex: 2 }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                           <div>
                                              <div style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Primary Camera Suite</div>
                                              <div style={{ fontSize: '14px', fontWeight: 950, color: '#0f172a' }}>{creator.camera || '—'}</div>
                                           </div>
                                           <div>
                                              <div style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Audio Capture Suite</div>
                                              <div style={{ fontSize: '14px', fontWeight: 950, color: '#0f172a' }}>{creator.audio || '—'}</div>
                                           </div>
                                           <div>
                                              <div style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Editing & Post Suite</div>
                                              <div style={{ fontSize: '14px', fontWeight: 950, color: '#0f172a' }}>{creator.editing || '—'}</div>
                                           </div>
                                           <div>
                                              <div style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Studio Environments</div>
                                              <div style={{ fontSize: '14px', fontWeight: 950, color: '#0f172a' }}>{creator.studio || '—'}</div>
                                           </div>
                                        </div>
                                     </div>
                                  ) : (
                                     <div style={{ padding: '24px 32px', background: 'rgba(248,250,252,0.92)', borderRadius: '24px', border: '1.5px solid #f1f5f9', textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: 600, marginBottom: '60px' }}>
                                        Production specifications available upon direct inquiry.
                                     </div>
                                  )}
                               </div>

                               {/* AUDIENCE ARCHITECTURE */}
                               <div className="printable-section print-col-right" style={{ position: 'relative', zIndex: 2 }}>
                                  <SectionTitle icon={PieChart}>Audience Architecture</SectionTitle>
                                  <div style={{ background: 'rgba(248,250,252,0.92)', padding: '40px', borderRadius: '40px', border: '1.5px solid #f1f5f9', marginBottom: '60px', backdropFilter: 'blur(8px)', position: 'relative', zIndex: 2 }}>
                                     {/* Creator Focus Areas (from creator.localHubs) */}
                                     {Array.isArray(creator.localHubs) && creator.localHubs.length > 0 && (
                                        <div style={{ marginBottom: '32px' }}>
                                           <div style={{ fontSize: '14px', fontWeight: 950, color: '#0f172a', marginBottom: '14px' }}>Creator Focus Areas</div>
                                           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                              {creator.localHubs.map(hub => {
                                                 const label = typeof hub === 'string' ? hub : (hub?.name || hub?.l || hub?.city || '');
                                                 return label ? (
                                                    <span key={label} style={{ fontSize: '12px', fontWeight: 800, color: '#475569', background: '#ffffff', border: '1.5px solid #e2e8f0', padding: '6px 14px', borderRadius: '100px' }}>
                                                       {label}
                                                    </span>
                                                 ) : null;
                                              })}
                                           </div>
                                        </div>
                                     )}

                                     {/* Verified Geographic Heatmap (only if real verified audience analytics with percentages exist) */}
                                     {Array.isArray(creator.audience_hubs) && creator.audience_hubs.length > 0 && creator.audience_hubs.some(h => typeof h.p === 'number') ? (
                                        <div style={{ marginBottom: '40px' }}>
                                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                              <span style={{ fontSize: '14px', fontWeight: 950, color: '#0f172a' }}>Geographic Heatmap</span>
                                              <span style={{ fontSize: '14px', fontWeight: 950, color: '#FF9431' }}>Reach</span>
                                           </div>
                                           {creator.audience_hubs.map(item => {
                                              const label = item.l || item.name;
                                              const pct = item.p || 0;
                                              return (
                                                 <div key={label} style={{ marginBottom: '20px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 800, color: '#64748b' }}>
                                                       <span>{label}</span>
                                                       <span>{pct}%</span>
                                                    </div>
                                                    <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '100px', overflow: 'hidden' }}>
                                                       <div style={{ height: '100%', background: 'linear-gradient(90deg, #FF9431, #FF5C00)', width: `${pct}%` }} />
                                                    </div>
                                                 </div>
                                              );
                                           })}
                                        </div>
                                     ) : null}

                                     {/* Verified Gender Breakdown (only if real verified audience analytics exist) */}
                                     {creator.audience_gender && (typeof creator.audience_gender.male === 'number' || typeof creator.audience_gender.female === 'number') ? (
                                        <>
                                           <div style={{ fontSize: '14px', fontWeight: 950, color: '#0f172a', marginBottom: '20px' }}>Gender Breakdown</div>
                                           <div style={{ display: 'grid', gridTemplateColumns: (creator.audience_gender.other && creator.audience_gender.other > 0) ? 'repeat(3, 1fr)' : '1fr 1fr', gap: '16px' }}>
                                              <div style={{ padding: '24px 12px', background: '#ffffff', borderRadius: '24px', textAlign: 'center', border: '1.5px solid #e2e8f0' }}>
                                                 <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 900, marginBottom: '6px', letterSpacing: '0.5px' }}>MALE</div>
                                                 <div style={{ fontSize: '22px', fontWeight: 950, color: '#0f172a' }}>{creator.audience_gender.male ?? 0}%</div>
                                              </div>
                                              <div style={{ padding: '24px 12px', background: '#ffffff', borderRadius: '24px', textAlign: 'center', border: '1.5px solid #e2e8f0' }}>
                                                 <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 900, marginBottom: '6px', letterSpacing: '0.5px' }}>FEMALE</div>
                                                 <div style={{ fontSize: '22px', fontWeight: 950, color: '#0f172a' }}>{creator.audience_gender.female ?? 0}%</div>
                                              </div>
                                              {creator.audience_gender.other && creator.audience_gender.other > 0 ? (
                                                 <div style={{ padding: '24px 12px', background: '#ffffff', borderRadius: '24px', textAlign: 'center', border: '1.5px solid #e2e8f0' }}>
                                                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 900, marginBottom: '6px', letterSpacing: '0.5px' }}>OTHER</div>
                                                    <div style={{ fontSize: '22px', fontWeight: 950, color: '#0f172a' }}>{creator.audience_gender.other}%</div>
                                                 </div>
                                              ) : null}
                                           </div>
                                        </>
                                     ) : null}

                                     {/* Neutral state if no verified demographic analytics are linked */}
                                     {!(Array.isArray(creator.audience_hubs) && creator.audience_hubs.some(h => typeof h.p === 'number')) && !(creator.audience_gender && (typeof creator.audience_gender.male === 'number' || typeof creator.audience_gender.female === 'number')) && (
                                        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: 600, lineHeight: 1.5, padding: '12px 8px' }}>
                                           Audience demographic analytics will be displayed once verified channel insights are linked.
                                        </div>
                                     )}
                                  </div>

                                  <SectionTitle icon={Globe}>Verified Channels</SectionTitle>
                                  <div style={{ padding: '32px', background: 'rgba(248, 250, 252, 0.92)', border: '1.5px solid #e2e8f0', borderRadius: '40px', color: '#0f172a', textAlign: 'center', position: 'relative', overflow: 'hidden', marginBottom: '60px', backdropFilter: 'blur(8px)', zIndex: 2 }}>
                                     <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: '#FF9431', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.1 }} />
                                     <div style={{ width: '100px', height: '100px', background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '20px', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', boxShadow: '0 8px 16px rgba(15,23,42,0.02)' }}>
                                        {/* QR Placeholder */}
                                        <div style={{ width: '100%', height: '100%', border: '4px solid #0f172a', display: 'flex', flexWrap: 'wrap' }}>
                                           {['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10','q11','q12','q13','q14','q15','q16'].map((id, i) => (
                                              <div key={id} style={{ width: '25%', height: '25%', background: (i % 3 === 0 || i % 7 === 0) ? '#0f172a' : 'transparent' }} />
                                           ))}
                                        </div>
                                     </div>
                                     <div style={{ fontSize: '14px', fontWeight: 950, marginBottom: '8px', color: '#0f172a' }}>SCAN FOR LIVE AUDIT</div>
                                     <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>CreatorBharat.com/{creator.slug || 'verify'}</div>
                                  </div>

                                  <SectionTitle icon={ShieldCheck}>Trust & Authority</SectionTitle>
                                  {Array.isArray(creator.reviews) && creator.reviews.length > 0 ? (() => {
                                     const validReviews = creator.reviews.filter(r => (r?.text || r?.comment || r?.t));
                                     if (validReviews.length === 0) {
                                        return (
                                           <div style={{ padding: '24px 32px', background: 'rgba(248,250,252,0.92)', borderRadius: '40px', border: '1.5px solid #f1f5f9', marginBottom: '60px', backdropFilter: 'blur(8px)', position: 'relative', zIndex: 2, textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                                              No verified brand reviews yet.
                                           </div>
                                        );
                                     }
                                     const firstReview = validReviews[0];
                                     const reviewText = firstReview.text || firstReview.comment || firstReview.t;
                                     const reviewer = firstReview.reviewerName || firstReview.brand || firstReview.b || 'Verified Brand Partner';
                                     const ratings = validReviews.map(r => Number(r.rating)).filter(n => !isNaN(n) && n > 0);
                                     const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : (creator.rating ? Number(creator.rating).toFixed(1) : null);
                                     const numStars = avgRating ? Math.round(Number(avgRating)) : 5;

                                     return (
                                        <div style={{ padding: '32px', background: 'rgba(248,250,252,0.92)', borderRadius: '40px', border: '1.5px solid #f1f5f9', marginBottom: '60px', backdropFilter: 'blur(8px)', position: 'relative', zIndex: 2 }}>
                                           <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', alignItems: 'center' }}>
                                              {[1,2,3,4,5].map(s => (
                                                 <Star key={s} size={18} fill={s <= numStars ? "#FF9431" : "none"} color="#FF9431" />
                                              ))}
                                              {avgRating && (
                                                 <span style={{ marginLeft: '12px', fontSize: '16px', fontWeight: 950, color: '#0f172a' }}>{avgRating}/5.0</span>
                                              )}
                                           </div>
                                           <p style={{ fontSize: '14px', color: '#475569', fontStyle: 'italic', lineHeight: 1.6, fontWeight: 500, marginBottom: '20px' }}>
                                              "{reviewText}"
                                           </p>
                                           <div style={{ fontSize: '12px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                              — {reviewer}
                                           </div>
                                        </div>
                                     );
                                  })() : (
                                     <div style={{ padding: '24px 32px', background: 'rgba(248,250,252,0.92)', borderRadius: '40px', border: '1.5px solid #f1f5f9', marginBottom: '60px', backdropFilter: 'blur(8px)', position: 'relative', zIndex: 2, textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                                        No verified brand reviews yet.
                                     </div>
                                  )}

                                  <SectionTitle icon={Mail}>Direct Booking & Location</SectionTitle>
                                  <div style={{ padding: '32px', background: 'rgba(255,255,255,0.92)', borderRadius: '40px', border: '1.5px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '60px', backdropFilter: 'blur(8px)', position: 'relative', zIndex: 2 }}>
                                     {/* Email Booking */}
                                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                           <div style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>OFFICIAL BOOKING EMAIL</div>
                                           <div style={{ fontSize: '15px', fontWeight: 950, color: '#0f172a' }}>{creator.contactEmail || creator.email || creator.user?.email || 'Direct Message via CreatorBharat'}</div>
                                        </div>
                                        <div style={{ width: '44px', height: '44px', background: '#3b82f615', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                           <Mail size={18} color="#3b82f6" />
                                        </div>
                                     </div>

                                     {/* Location / Base */}
                                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #e2e8f0', paddingTop: '20px' }}>
                                        <div>
                                           <div style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>PRIMARY CREATOR BASE</div>
                                           <div style={{ fontSize: '15px', fontWeight: 950, color: '#0f172a' }}>
                                              {(() => {
                                                 const city = creator.city && String(creator.city).trim();
                                                 const state = creator.state && String(creator.state).trim();
                                                 if (city && state) return `${city}, ${state}`;
                                                 if (city) return `${city}, India`;
                                                 if (state) return `${state}, India`;
                                                 return 'Location available upon request';
                                              })()}
                                           </div>
                                        </div>
                                        <div style={{ width: '44px', height: '44px', background: '#ef444415', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                           <MapPin size={18} color="#ef4444" />
                                        </div>
                                     </div>

                                     {/* CreatorBharat Escrow Security Badge */}
                                     <div style={{ display: 'flex', gap: '16px', borderTop: '1px dashed #e2e8f0', paddingTop: '20px', alignItems: 'flex-start' }}>
                                        <div style={{ width: '40px', height: '40px', background: '#FF943110', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                           <Shield size={18} color="#FF9431" />
                                        </div>
                                        <div>
                                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                              <span style={{ fontSize: '12px', fontWeight: 950, color: '#0f172a' }}>ESCROW SECURITY BADGE</span>
                                              <span style={{ fontSize: '9px', fontWeight: 900, background: '#10B98115', color: '#10B981', padding: '2px 8px', borderRadius: '100px', letterSpacing: '0.5px' }}>VERIFIED</span>
                                           </div>
                                           <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, lineHeight: 1.5, margin: 0 }}>
                                              Transactions & payouts for this creator are processed under the CreatorBharat Escrow Protocol for 100% brand-creator campaign fulfillment.
                                           </p>
                                        </div>
                                     </div>
                                  </div>

                                  {/* Professional Creative Background & Credentials */}
                                  <SectionTitle icon={Briefcase}>Creative Background & Milestones</SectionTitle>
                                  {(() => {
                                     const normalizedMilestones = Array.isArray(creator.milestones)
                                        ? creator.milestones.map(m => {
                                             if (!m || typeof m !== 'object') return null;
                                             const year = m.year || m.y || '';
                                             const title = m.title || m.t || '';
                                             const desc = m.desc || m.d || '';
                                             if (!year && !title && !desc) return null;
                                             return { year, title, desc };
                                          }).filter(Boolean)
                                        : [];

                                     const story = creator.fullStory && typeof creator.fullStory === 'object' ? {
                                        p1: typeof creator.fullStory.p1 === 'string' ? creator.fullStory.p1.trim() : '',
                                        quote: typeof creator.fullStory.quote === 'string' ? creator.fullStory.quote.trim() : '',
                                        p2: typeof creator.fullStory.p2 === 'string' ? creator.fullStory.p2.trim() : '',
                                        p3: typeof creator.fullStory.p3 === 'string' ? creator.fullStory.p3.trim() : ''
                                     } : null;

                                     const hasStory = Boolean(story && (story.p1 || story.quote || story.p2 || story.p3));
                                     const hasMilestones = normalizedMilestones.length > 0;
                                     const hasExperience = Boolean(creator.experience && String(creator.experience).trim());
                                     const hasEducation = Boolean(creator.education && String(creator.education).trim());
                                     const hasFormats = Boolean(creator.experience_formats && String(creator.experience_formats).trim());
                                     const hasCoBrandedIp = Boolean(creator.cobranded_ip && String(creator.cobranded_ip).trim());

                                     const hasAnyBackground = hasStory || hasMilestones || hasExperience || hasEducation || hasFormats || hasCoBrandedIp;

                                     if (!hasAnyBackground) {
                                        return (
                                           <div style={{ padding: '24px 32px', background: 'rgba(248,250,252,0.92)', borderRadius: '40px', border: '1.5px solid #f1f5f9', marginBottom: '60px', backdropFilter: 'blur(8px)', position: 'relative', zIndex: 2, textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                                              Creative background and credentials available upon request.
                                           </div>
                                        );
                                     }

                                     return (
                                        <div style={{ padding: '32px', background: 'rgba(248,250,252,0.92)', borderRadius: '40px', border: '1.5px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '60px', backdropFilter: 'blur(8px)', position: 'relative', zIndex: 2 }}>
                                           {/* Story Narrative if present */}
                                           {hasStory && (
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                 {story.quote && (
                                                    <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#0f172a', fontWeight: 700, margin: '0 0 8px 0', borderLeft: '3px solid #FF9431', paddingLeft: '14px', lineHeight: 1.5 }}>
                                                       "{story.quote}"
                                                    </p>
                                                 )}
                                                 {story.p1 && <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{story.p1}</p>}
                                                 {story.p2 && <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{story.p2}</p>}
                                                 {story.p3 && <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{story.p3}</p>}
                                              </div>
                                           )}

                                           {/* Verified Milestones Timeline if present */}
                                           {hasMilestones && (
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: hasStory ? '1px dashed #e2e8f0' : 'none', paddingTop: hasStory ? '16px' : '0' }}>
                                                 <div style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>KEY MILESTONES & ACHIEVEMENTS</div>
                                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {normalizedMilestones.slice(0, 4).map((m, idx) => (
                                                       <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                          {m.year && (
                                                             <span style={{ fontSize: '11px', fontWeight: 900, color: '#FF9431', background: '#FF943115', padding: '2px 8px', borderRadius: '100px', whiteSpace: 'nowrap' }}>
                                                                {m.year}
                                                             </span>
                                                          )}
                                                          <div>
                                                             {m.title && <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{m.title}</div>}
                                                             {m.desc && <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{m.desc}</div>}
                                                          </div>
                                                       </div>
                                                    ))}
                                                 </div>
                                              </div>
                                           )}

                                           {/* Explicit Credentials if present */}
                                           {(hasExperience || hasEducation || hasFormats || hasCoBrandedIp) && (
                                              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', borderTop: (hasStory || hasMilestones) ? '1px dashed #e2e8f0' : 'none', paddingTop: (hasStory || hasMilestones) ? '16px' : '0' }}>
                                                 {hasExperience && (
                                                    <div>
                                                       <div style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Years in Industry</div>
                                                       <div style={{ fontSize: '15px', fontWeight: 950, color: '#0f172a' }}>{creator.experience}</div>
                                                    </div>
                                                 )}
                                                 {hasEducation && (
                                                    <div style={{ borderTop: hasExperience ? '1px dashed #e2e8f0' : 'none', paddingTop: hasExperience ? '16px' : '0' }}>
                                                       <div style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Education & Credentials</div>
                                                       <div style={{ fontSize: '15px', fontWeight: 950, color: '#0f172a' }}>{creator.education}</div>
                                                    </div>
                                                 )}
                                                 {hasFormats && (
                                                    <div style={{ borderTop: (hasExperience || hasEducation) ? '1px dashed #e2e8f0' : 'none', paddingTop: (hasExperience || hasEducation) ? '16px' : '0' }}>
                                                       <div style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Primary Content Formats</div>
                                                       <div style={{ fontSize: '15px', fontWeight: 950, color: '#0f172a' }}>{creator.experience_formats}</div>
                                                    </div>
                                                 )}
                                                 {hasCoBrandedIp && (
                                                    <div style={{ borderTop: (hasExperience || hasEducation || hasFormats) ? '1px dashed #e2e8f0' : 'none', paddingTop: (hasExperience || hasEducation || hasFormats) ? '16px' : '0' }}>
                                                       <div style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Co-Branded IP (Shows)</div>
                                                       <div style={{ fontSize: '15px', fontWeight: 950, color: '#0f172a' }}>{creator.cobranded_ip}</div>
                                                    </div>
                                                 )}
                                              </div>
                                           )}
                                        </div>
                                     );
                                  })()}

                                  {/* Collaboration Logistics Widget */}
                                  <SectionTitle icon={Globe}>Collaboration Logistics</SectionTitle>
                                  <div style={{ padding: '32px', background: 'rgba(248,250,252,0.92)', borderRadius: '40px', border: '1.5px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '60px', backdropFilter: 'blur(8px)', position: 'relative', zIndex: 2 }}>
                                     <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                                        <div>
                                           <div style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Timezone Compatibility</div>
                                           <div style={{ fontSize: '15px', fontWeight: 950, color: '#0f172a' }}>{logistics.timezone}</div>
                                        </div>
                                        <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '16px' }}>
                                           <div style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Invoicing & Payments</div>
                                           <div style={{ fontSize: '15px', fontWeight: 950, color: '#0f172a' }}>{logistics.invoicing}</div>
                                        </div>
                                        <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '16px' }}>
                                           <div style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Logistics Support</div>
                                           <div style={{ fontSize: '15px', fontWeight: 950, color: '#0f172a' }}>{logistics.shipping}</div>
                                        </div>
                                        <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '16px' }}>
                                           <div style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Remote Meeting Platforms</div>
                                           <div style={{ fontSize: '15px', fontWeight: 950, color: '#0f172a' }}>{logistics.meetings}</div>
                                        </div>
                                     </div>
                                  </div>
                               </div>
                            </div>

                            {/* FOOTER ENTERPRISE BOOKING & GUARANTEE BANNER - Clean light theme */}
                            <div style={{ clear: 'both', marginTop: '80px', borderTop: '2px solid #e2e8f0', paddingTop: '60px', position: 'relative', zIndex: 2 }}>
                               <div style={{ background: 'linear-gradient(135deg, rgba(248,250,252,0.95) 0%, rgba(241,245,249,0.95) 100%)', border: '1.5px solid #e2e8f0', borderRadius: '40px', padding: '50px 60px', color: '#0f172a', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(8px)' }}>
                                  <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '300px', height: '300px', background: '#FF9431', borderRadius: '50%', filter: 'blur(150px)', opacity: 0.08 }} />
                                  
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '30px', marginBottom: '40px', borderBottom: '1px solid #e2e8f0', paddingBottom: '30px' }}>
                                     <div>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(255,148,49,0.12)', borderRadius: '100px', color: '#FF9431', fontSize: '11px', fontWeight: 900, marginBottom: '16px', letterSpacing: '1px', border: '1px solid rgba(255,148,49,0.3)' }}>
                                           <ShieldCheck size={14} fill="#FF9431" /> CREATORBHARAT ENTERPRISE GUARANTEE
                                        </div>
                                        <h3 style={{ fontSize: '28px', fontWeight: 950, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>Book Securely via CreatorBharat</h3>
                                        <p style={{ fontSize: '14px', color: '#475569', fontWeight: 500, margin: '8px 0 0', maxWidth: '550px', lineHeight: 1.5 }}>
                                           This portfolio cv is verified by CreatorBharat Enterprise. All payments, timeline enforcement, and content deliverables are strictly managed via escrow contracts.
                                        </p>
                                     </div>
                                     <div style={{ display: 'flex', gap: '16px' }}>
                                        <div style={{ textAlign: 'center', padding: '16px 24px', background: '#ffffff', borderRadius: '20px', border: '1.5px solid #e2e8f0', boxShadow: '0 8px 16px rgba(15,23,42,0.02)' }}>
                                           <div style={{ fontSize: '24px', fontWeight: 950, color: '#FF9431' }}>100%</div>
                                           <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, marginTop: '4px' }}>SECURE ESCROW</div>
                                        </div>
                                        <div style={{ textAlign: 'center', padding: '16px 24px', background: '#ffffff', borderRadius: '20px', border: '1.5px solid #e2e8f0', boxShadow: '0 8px 16px rgba(15,23,42,0.02)' }}>
                                           <div style={{ fontSize: '24px', fontWeight: 950, color: '#10B981' }}>0%</div>
                                           <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, marginTop: '4px' }}>SERVICE SLIPPAGE</div>
                                        </div>
                                     </div>
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                                     <div style={{ display: 'flex', gap: '16px' }}>
                                        <div style={{ width: '40px', height: '40px', background: 'rgba(59,130,246,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
                                           <Shield size={18} />
                                        </div>
                                        <div>
                                           <h4 style={{ fontSize: '14px', fontWeight: 950, color: '#0f172a', margin: '0 0 4px 0' }}>Escrow Guarantee</h4>
                                           <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>Campaign budgets are locked and released strictly upon milestone verification and asset validation.</p>
                                        </div>
                                     </div>
                                     <div style={{ display: 'flex', gap: '16px' }}>
                                        <div style={{ width: '40px', height: '40px', background: 'rgba(16,185,129,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', flexShrink: 0 }}>
                                           <ShieldCheck size={18} />
                                        </div>
                                        <div>
                                           <h4 style={{ fontSize: '14px', fontWeight: 950, color: '#0f172a', margin: '0 0 4px 0' }}>Audited Performance</h4>
                                           <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>All geographic, age, and gender demographic metrics are directly audited via certified API pipelines.</p>
                                        </div>
                                     </div>
                                     <div style={{ display: 'flex', gap: '16px' }}>
                                        <div style={{ width: '40px', height: '40px', background: 'rgba(255,148,49,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF9431', flexShrink: 0 }}>
                                           <Zap size={18} />
                                        </div>
                                        <div>
                                           <h4 style={{ fontSize: '14px', fontWeight: 950, color: '#0f172a', margin: '0 0 4px 0' }}>Unified Invoicing</h4>
                                           <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>Contracts, NDAs, and corporate billing are automated under a single enterprise-compliant platform dashboard.</p>
                                        </div>
                                     </div>
                                  </div>

                                  <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                                     <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>
                                        {`© ${new Date().getFullYear()} CreatorBharat. Audit UID: CB-${creator.slug?.toUpperCase() || 'CV'}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`}
                                     </div>
                                     <div style={{ fontSize: '11px', fontWeight: 900, color: '#FF9431', letterSpacing: '1px' }}>
                                        FOR OFFICIAL ENQUIRIES: BRAND@CREATORBHARAT.COM
                                     </div>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </motion.div>
                 )}
              </AnimatePresence>
          </div>

          {/* Footer */}
          {step === 2 && (
             <div className="no-print" style={{ 
                padding: '20px 40px', 
                borderTop: '1px solid #f1f5f9', 
                display: 'flex', 
                flexDirection: scale < 0.65 ? 'column' : 'row', 
                gap: '12px', 
                background: '#ffffff',
                alignItems: 'center'
             }}>
                <button onClick={handlePrint} style={{ 
                   width: '100%', 
                   flex: scale < 0.65 ? 'none' : 1,
                   padding: '16px', 
                   borderRadius: '100px', 
                   background: '#FF9431', 
                   color: '#fff', 
                   border: 'none', 
                   fontWeight: 950, 
                   cursor: 'pointer', 
                   display: 'flex', 
                   alignItems: 'center', 
                   justifyContent: 'center', 
                   gap: '10px', 
                   boxShadow: '0 15px 30px rgba(255,148,49,0.3)', 
                   fontSize: '15px' 
                }}>
                   <Download size={20} /> Export & Download Creator Resume
                </button>
                <button onClick={onClose} style={{ 
                   width: scale < 0.65 ? '100%' : 'auto', 
                   padding: '16px 40px', 
                   borderRadius: '100px', 
                   background: '#f8fafc', 
                   color: '#64748b', 
                   border: '1.5px solid #f1f5f9', 
                   fontWeight: 950, 
                   cursor: 'pointer', 
                   fontSize: '15px',
                   whiteSpace: 'nowrap'
                }}>
                   Close
                </button>
             </div>
          )}
       </motion.div>
    </div>,
    document.body
  );
};

MediaKitPreview.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  creator: PropTypes.object.isRequired,
  stats: PropTypes.object.isRequired
};
