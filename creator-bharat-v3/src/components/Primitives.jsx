import React, { useState } from 'react';
import { T } from '../theme';

export function Btn({ children, onClick, variant = 'primary', sm, lg, full, disabled, loading, style: sx = {}, href }) {
  const [h, sh] = useState(false);
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: 'inherit', fontWeight: 700, cursor: disabled || loading ? 'not-allowed' : 'pointer',
    border: 'none', borderRadius: 12, transition: 'all .2s cubic-bezier(0.4,0,0.2,1)',
    textDecoration: 'none', fontSize: lg ? 16 : sm ? 12 : 14, padding: lg ? '16px 32px' : sm ? '8px 16px' : '12px 24px',
    opacity: disabled ? .55 : 1, width: full ? '100%' : 'auto', ...sx
  };
  const vs = {
    primary: { background: T.gd, color: '#fff', boxShadow: h ? '0 8px 24px rgba(255,148,49,0.25)' : 'none', transform: h ? 'translateY(-1px)' : 'none' },
    outline: { background: 'transparent', color: T.t1, border: `1.5px solid ${T.bd2}`, boxShadow: h ? T.sh2 : 'none' },
    ghost: { background: h ? T.bg3 : 'transparent', color: T.t2 },
    dark: { background: T.n8, color: '#fff', boxShadow: h ? T.sh3 : 'none' },
    white: { background: '#fff', color: T.t1, boxShadow: T.sh2, transform: h ? 'translateY(-1px)' : 'none' },
    text: { background: 'none', color: T.t1, padding: '0', fontWeight: 700, fontSize: 'inherit' },
    success: { background: T.ok, color: '#fff', boxShadow: h ? '0 8px 24px rgba(16,185,129,0.25)' : 'none' }
  };
  const Tag = href ? 'a' : 'button';
  return (
    <Tag className="btn-int" onClick={onClick} disabled={disabled || loading} href={href}
      style={{ ...base, ...(vs[variant] || vs.primary) }}
      onMouseEnter={() => sh(true)} onMouseLeave={() => sh(false)}>
      {loading ? <span className="spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> : children}
    </Tag>
  );
}

export function Bdg({ children, color = 'gray', sm }) {
  const m = {
    red: { bg: T.ga, col: T.gd },
    green: { bg: T.okl, col: T.ok },
    yellow: { bg: T.wnl, col: T.wn },
    blue: { bg: T.infol, col: T.info },
    purple: { bg: 'rgba(124,58,237,.1)', col: '#7C3AED' },
    gray: { bg: T.bg3, col: T.t2 },
    gold: { bg: 'rgba(217,119,6,.1)', col: T.gold },
    platinum: { bg: 'rgba(124,58,237,.1)', col: T.platinum },
    silver: { bg: 'rgba(156,163,175,.15)', col: '#6B7280' },
    rising: { bg: 'rgba(107,114,128,.1)', col: '#6B7280' },
    dark: { bg: T.n8, col: '#fff' }
  };
  const c = m[color] || m.gray;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: sm ? '2px 7px' : '3px 10px', borderRadius: 20, background: c.bg, color: c.col, fontSize: sm ? 10 : 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}

export function Fld({ label, value, onChange, type = 'text', placeholder, options, rows, helper, required, error, sm, readOnly }) {
  const [foc, setFoc] = useState(false);
  const s = {
    width: '100%', padding: sm ? '10px 14px' : '14px 18px',
    border: `1.5px solid ${error ? '#EF4444' : foc ? '#FF9431' : T.bd}`,
    borderRadius: 12, fontSize: sm ? 13 : 15, color: T.n8,
    background: readOnly ? T.bg3 : '#fff', transition: 'all .2s cubic-bezier(0.4,0,0.2,1)',
    boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none',
    boxShadow: foc ? `0 0 0 4px ${error ? 'rgba(239,68,68,0.15)' : 'rgba(255,148,49,0.15)'}` : 'none'
  };
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: T.n8, marginBottom: 8 }}>{label}{required && <span style={{ color: '#EF4444' }}>*</span>}</label>}
      {options ? (
        <div style={{ position: 'relative' }}>
          <select value={value} onChange={onChange} onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} style={{ ...s, paddingRight: 40, appearance: 'none', cursor: 'pointer' }}>
            {options.map(o => <option key={typeof o === 'object' ? o.v : o} value={typeof o === 'object' ? o.v : o}>{typeof o === 'object' ? o.l : o}</option>)}
          </select>
          <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: T.t3, fontSize: 10 }}>▼</div>
        </div>
      ) : rows ? (
        <textarea value={value} onChange={onChange} rows={rows} placeholder={placeholder} onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} style={{ ...s, resize: 'vertical' }} readOnly={readOnly} />
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} style={s} readOnly={readOnly} />
      )}
      {error && <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, color: '#EF4444', fontSize: 12, fontWeight: 600 }}><span>⚠️</span> {error}</div>}
      {helper && !error && <div style={{ fontSize: 12, color: T.t3, marginTop: 6 }}>{helper}</div>}
    </div>
  );
}

export function Logo({ sm, light, onClick }) {
  const sz = sm ? 34 : 44;
  return (
    <div onClick={onClick} className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: sm ? 10 : 14, cursor: onClick ? 'pointer' : 'default', userSelect: 'none', position: 'relative' }}>
      <div style={{ position: 'relative', width: sz, height: sz, borderRadius: '50%', padding: 2, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
        {/* Logo Spinning Border */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '200%', height: '200%', background: 'conic-gradient(from 0deg, #FF9431, #fff, #128807, #fff, #FF9431)', animation: 'spinBorder 4s linear infinite', zIndex: 0 }} />
        
        <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '33.33%', background: '#FF9431' }} />
          <div style={{ position: 'absolute', top: '33.33%', left: 0, right: 0, height: '33.34%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '25%', height: '25%', borderRadius: '50%', border: '1px solid #000080', position: 'relative' }}>
              {[...Array(12)].map((_, i) => <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', width: '100%', height: 1, background: '#000080', transform: `translate(-50%,-50%) rotate(${i * 15}deg)` }} />)}
            </div>
          </div>
          <div style={{ position: 'absolute', top: '66.67%', left: 0, right: 0, height: '33.33%', background: '#128807' }} />
        </div>
      </div>
      <span className="logo-text-animated" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: sm ? 22 : 28, fontWeight: 900, letterSpacing: '-0.04em', display: 'flex', alignItems: 'center' }}>
        CreatorBharat
      </span>
    </div>
  );
}

export function SH({ eyebrow, title, sub, center, light, mb = 56 }) {
  return (
    <div style={{ textAlign: center ? 'center' : 'left', marginBottom: mb, position: 'relative' }}>
      {eyebrow && <div style={{ display: 'flex', alignItems: 'center', justifyContent: center ? 'center' : 'flex-start', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 32, height: 3, background: T.gd, borderRadius: 4 }} />
        <p style={{ fontSize: 12, fontWeight: 900, letterSpacing: '.15em', textTransform: 'uppercase', color: T.gd }}>{eyebrow}</p>
      </div>}
      <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(32px,6vw,52px)', fontWeight: 900, color: light ? '#fff' : T.t1, marginBottom: sub ? 20 : 0, lineHeight: 1, letterSpacing: '-0.03em' }}>{title}</h2>
      {sub && <p style={{ fontSize: 18, color: light ? 'rgba(255,255,255,0.6)' : T.t2, maxWidth: center ? 640 : '100%', margin: center ? '0 auto' : '0', lineHeight: 1.6, fontWeight: 500 }}>{sub}</p>}
      {!center && <div style={{ width: 60, height: 4, background: T.ga, marginTop: 24, borderRadius: 2 }} />}
    </div>
  );
}

export function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(10px)' }}>
      <div className="si" onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 28, width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto', boxShadow: T.sh4, border: '1px solid rgba(255,255,255,0.2)', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', borderBottom: `1px solid ${T.bd}`, position: 'sticky', top: 0, background: '#fff', zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 900, color: T.n8 }}>{title}</h3>
          <button onClick={onClose} style={{ background: T.bg2, border: 'none', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 20, color: T.t2, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', marginRight: 4 }}>×</button>
        </div>
        <div style={{ padding: '32px 32px 48px' }}>{children}</div>
      </div>
    </div>
  );
}

export function Card({ children, style: sx = {}, onClick, glass }) {
  const [h, sh] = useState(false);
  const base = {
    background: glass ? 'rgba(255,255,255,0.03)' : '#fff',
    backdropFilter: glass ? 'blur(16px)' : 'none',
    border: glass ? '1px solid rgba(255,255,255,0.1)' : `1px solid ${T.bd}`,
    borderRadius: 20,
    transition: 'all .3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: h ? T.sh3 : T.sh1,
    transform: h && onClick ? 'translateY(-4px)' : 'none',
    cursor: onClick ? 'pointer' : 'default',
    overflow: 'hidden',
    ...sx
  };
  return <div onClick={onClick} onMouseEnter={() => sh(true)} onMouseLeave={() => sh(false)} style={base}>{children}</div>;
}

export function Stars({ rating, sm }) {
  const sz = sm ? 12 : 16;
  return <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>{[1, 2, 3, 4, 5].map(i => <svg key={i} width={sz} height={sz} viewBox="0 0 20 20" fill={i <= Math.round(rating) ? '#F59E0B' : '#E5E7EB'}><path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.44.91-5.32L2.27 6.62l5.34-.78z" /></svg>)}{rating > 0 && <span style={{ fontSize: sm ? 11 : 13, color: T.t2, marginLeft: 3, fontWeight: 600 }}>{Number(rating).toFixed(1)}</span>}</span>;
}

export function Ring({ score, size = 80 }) {
  const r = 32, circ = 2 * Math.PI * r, offset = circ - (score / 100) * circ;
  const tier = { label: score >= 91 ? 'Platinum' : score >= 76 ? 'Gold' : score >= 51 ? 'Silver' : 'Rising', color: score >= 91 ? T.platinum : score >= 76 ? T.gold : score >= 51 ? T.silver : T.rising };
  return <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><svg width={size} height={size} viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}><circle cx="40" cy="40" r={r} fill="none" stroke={T.bg3} strokeWidth="6" /><circle cx="40" cy="40" r={r} fill="none" stroke={tier.color} strokeWidth="6" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset .6s' }} /></svg><div style={{ textAlign: 'center' }}><div style={{ fontFamily: "'Fraunces',serif", fontSize: size * 0.28, fontWeight: 900, color: tier.color, lineHeight: 1 }}>{score}</div><div style={{ fontSize: size * 0.11, color: T.t3, fontWeight: 600, marginTop: 1 }}>{tier.label}</div></div></div>;
}

export function Bar({ value, max = 100, color, label, showPct, height = 8 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return <div>{(label || showPct) && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>{label && <span style={{ fontSize: 12, color: T.t2 }}>{label}</span>}{showPct && <span style={{ fontSize: 12, color: color || T.gd, fontWeight: 700 }}>{pct}%</span>}</div>}<div style={{ height, background: T.bg3, borderRadius: height, overflow: 'hidden' }}><div style={{ height: '100%', width: pct + '%', background: color || T.gd, borderRadius: height, transition: 'width .6s' }} /></div></div>;
}

export function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 20, border: `1px solid ${T.bd}`, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ height: 100, background: T.bg3, borderRadius: 12, className: 'skeleton' }} />
      <div style={{ height: 20, width: '70%', background: T.bg3, borderRadius: 4, className: 'skeleton' }} />
      <div style={{ height: 14, width: '40%', background: T.bg3, borderRadius: 4, className: 'skeleton' }} />
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ height: 30, flex: 1, background: T.bg3, borderRadius: 8, className: 'skeleton' }} />
        <div style={{ height: 30, flex: 1, background: T.bg3, borderRadius: 8, className: 'skeleton' }} />
      </div>
    </div>
  );
}

export function Empty({ icon, title, sub, ctaLabel, onCta }) {
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', background: '#fff', borderRadius: 24, border: `1px dashed ${T.bd}` }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontSize: 20, fontWeight: 800, color: T.n8, marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 14, color: T.t3, marginBottom: 24, maxWidth: 300, margin: '0 auto 24px' }}>{sub}</p>
      {ctaLabel && <Btn onClick={onCta}>{ctaLabel}</Btn>}
    </div>
  );
}

export function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${active ? T.gd : T.bd}`, background: active ? T.ga : 'transparent', color: active ? T.gd : T.t2, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}>{label}</button>
  );
}

export function PL({ children, noFooter }) {
  return <div className="page-layout">{children}</div>;
}
