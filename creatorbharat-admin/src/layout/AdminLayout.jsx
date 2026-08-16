// 🏛️ CreatorBharat SaaS Admin Layout Component
import React from 'react';
import {
  ExternalLink, LogOut, RefreshCw, X, AlertTriangle, CheckCircle, Info, ShieldCheck
} from 'lucide-react';
import { T } from '../components/ui/Primitives';
import { NAV_SECTIONS, TAB_META } from '../components/ui/NavConfig';

export function AdminLayout({
  activeTab,
  setActiveTab,
  counts = {},
  fetchData,
  dataLoading,
  handleLogout,
  adminUser,
  FRONTEND_URL = 'http://localhost:5173',
  toasts = [],
  dismissToast,
  children
}) {
  const meta = TAB_META[activeTab] || { title: activeTab, sub: '' };
  const navSections = NAV_SECTIONS(counts);

  return (
    <div style={{ display: 'flex', height: '100vh', background: T.bg, fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside style={{
        width: 250,
        background: '#0a0f1d',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
        userSelect: 'none',
        zIndex: 50,
        boxShadow: '4px 0 24px rgba(0,0,0,0.2)'
      }}>
        {/* Logo & Header */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #FF9431 0%, #EA580C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
              color: '#fff',
              fontWeight: 900,
              fontSize: 16
            }}>
              CB
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', letterSpacing: -0.3, display: 'flex', alignItems: 'center', gap: 6 }}>
                CreatorBharat
                <span style={{ fontSize: 9, padding: '2px 6px', background: 'rgba(249,115,22,0.2)', color: '#FF9431', borderRadius: 4, fontWeight: 800 }}>PRO</span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                {adminUser?.role ? `${adminUser.role} Console` : 'Enterprise Control'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {navSections.map(section => (
            <div key={section.title}>
              <div style={{
                fontSize: 10,
                fontWeight: 800,
                color: 'rgba(255,255,255,0.35)',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                padding: '0 10px 8px'
              }}>
                {section.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {section.items.map(item => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '9px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: active ? 'rgba(249,115,22,0.12)' : 'transparent',
                        color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                        fontSize: 12.5,
                        fontWeight: active ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        textAlign: 'left',
                        position: 'relative'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = '#fff';
                        if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = active ? '#fff' : 'rgba(255,255,255,0.55)';
                        if (!active) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {active && (
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          top: '20%',
                          height: '60%',
                          width: 3,
                          background: '#f97316',
                          borderRadius: '0 4px 4px 0',
                          boxShadow: '0 0 8px #f97316'
                        }} />
                      )}
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        background: active ? 'rgba(249,115,22,0.18)' : 'rgba(255,255,255,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Icon size={13.5} style={{ color: active ? '#f97316' : 'inherit' }} />
                      </div>
                      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: 6,
                          background: active ? T.orange : 'rgba(255,255,255,0.08)',
                          color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                          fontSize: 9.5,
                          fontWeight: 800,
                          minWidth: 18,
                          textAlign: 'center'
                        }}>
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div style={{ padding: '16px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={fetchData}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >
            <RefreshCw size={13.5} style={{ animation: dataLoading ? 'spin 1s linear infinite' : 'none' }} /> Sync Data
          </button>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px',
              borderRadius: 8,
              border: '1px solid rgba(239,68,68,0.15)',
              background: 'rgba(239,68,68,0.05)',
              color: '#f87171',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#ff9999'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; e.currentTarget.style.color = '#f87171'; }}
          >
            <LogOut size={13.5} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Top Header Bar */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 40px',
          borderBottom: `1px solid ${T.border}`,
          background: T.card,
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div>
            <h2 style={{ margin: '0 0 2px', fontSize: 20, fontWeight: 900, color: T.navy }}>{meta.title}</h2>
            <p style={{ margin: 0, fontSize: 12, color: T.muted, fontWeight: 500 }}>{meta.sub}</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{
              padding: '6px 14px',
              background: T.greenLight,
              color: T.green,
              fontSize: 11,
              fontWeight: 800,
              borderRadius: 30,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: `1px solid ${T.green}25`
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.green }}></span>
              Live · DB Connected
            </span>
            <a
              href={FRONTEND_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '6px 14px',
                background: T.orangeLight,
                color: T.orange,
                fontSize: 11,
                fontWeight: 800,
                borderRadius: 30,
                textDecoration: 'none',
                border: `1px solid ${T.orangeBorder}`,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <ExternalLink size={11} /> Visit Site
            </a>
          </div>
        </header>

        {/* Content Body */}
        <div style={{ padding: '32px 40px', flex: 1 }}>
          {children}
        </div>
      </main>

      {/* ── TOAST NOTIFICATIONS ──────────────────────────────────────────── */}
      {toasts && toasts.length > 0 && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 380 }}>
          {toasts.map(t => (
            <div
              key={t.id}
              style={{
                padding: '12px 16px',
                borderRadius: 12,
                background: t.type === 'error' ? '#EF4444' : t.type === 'warning' ? '#F59E0B' : '#10B981',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                fontSize: 13,
                fontWeight: 600
              }}
            >
              {t.type === 'error' ? <AlertTriangle size={18} /> : t.type === 'warning' ? <Info size={18} /> : <CheckCircle size={18} />}
              <span style={{ flex: 1 }}>{t.message}</span>
              {dismissToast && (
                <button
                  onClick={() => dismissToast(t.id)}
                  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.8, padding: 0 }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
