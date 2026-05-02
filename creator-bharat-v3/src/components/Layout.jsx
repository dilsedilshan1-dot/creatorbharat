import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context';
import { T, W, scrollToTop, LS } from '../theme';
import { Logo, Btn, Modal, Fld, Bdg, Bar } from './Primitives';
import Footer from './home/Footer'; // IMPORTING THE NEW ELITE FOOTER

export default function Layout({ children }) {
  const { st, dsp } = useApp();
  const [mob, setMob] = useState(window.innerWidth < 768);

  useEffect(() => {
    const h = () => setMob(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <Navbar />
      <main style={{ flex: 1, position: 'relative', zIndex: 1, paddingTop: mob ? 64 : 80 }}>{children}</main>
      <Footer mob={mob} />
      {mob && <FloatingMobileNav mob={mob} />}
      <MobileMenu open={st.ui.mobileMenu} />
      <ToastBar />
      <CompareBar />
      {st.ui.authModal && <AuthModal />}
      {st.ui.demoModal && <DemoModal />}
    </div>
  );
}

export function Navbar() {
  const { st, dsp } = useApp();
  const [scroll, setScroll] = useState(false);
  const [mob, setMob] = useState(window.innerWidth < 768);

  useEffect(() => {
    const h = () => { setScroll(window.scrollY > 20); setMob(window.innerWidth < 768); };
    window.addEventListener('scroll', h);
    window.addEventListener('resize', h);
    return () => { window.removeEventListener('scroll', h); window.removeEventListener('resize', h); };
  }, []);

  const go = (p) => { dsp({ t: 'GO', p }); scrollToTop(); dsp({ t: 'UI', v: { mobileMenu: false } }); };

  const isCreator = st.role === 'creator', isBrand = st.role === 'brand';
  const links = isCreator
    ? [['dashboard', 'Dashboard'], ['campaigns', 'Deals'], ['leaderboard', 'Leaderboard'], ['blog', 'Articles']]
    : isBrand
      ? [['creators', 'Discover'], ['campaigns', 'My Ads'], ['blog', 'Articles']]
      : [['creators', 'Creators'], ['campaigns', 'Campaigns'], ['monetize', 'Monetize 💰'], ['blog', 'Articles'], ['about', 'About']];

  return (
    <>
      <style>{`
        @keyframes spinBorder {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes flagSweep {
          to { background-position: 200% center; }
        }
        .logo-text-animated {
          background: linear-gradient(90deg, #FF9431, #FFFFFF, #128807, #FF9431);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: flagSweep 3s linear infinite;
        }
        .nav-link {
          position: relative;
          transition: all 0.3s;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 50%;
          width: 0;
          height: 2px;
          background: #FF9431;
          transition: all 0.3s;
          transform: translateX(-50%);
        }
        .nav-link:hover::after {
          width: 20px;
        }
        .mobile-nav-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(12px); z-index: 6000;
        }
        .mobile-nav-sheet {
          position: fixed; left: 12px; right: 12px; bottom: 12px; background: rgba(255, 255, 255, 0.95); 
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(0,0,0,0.05); border-radius: 40px;
          padding: 40px 24px; z-index: 6001; box-shadow: 0 -20px 60px rgba(0,0,0,0.15);
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mobile-menu-item {
          padding: 16px 24px; border-radius: 20px; color: #111; font-weight: 800; font-size: 18px;
          display: flex; alignItems: center; gap: 16px; transition: all 0.2s; cursor: pointer;
        }
        .mobile-menu-item:active { background: rgba(0,0,0,0.05); transform: scale(0.98); }
        .hamburger-bar {
          width: 24px; height: 2px; background: #111; border-radius: 10px; transition: all 0.3s;
        }
        .floating-nav-bar {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
          background: rgba(17, 17, 17, 0.9); backdrop-filter: blur(12px);
          padding: 8px; border-radius: 100px; display: flex; gap: 4px; z-index: 5500;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
        }
        @keyframes slideUp { from { transform: translateY(120%); } to { transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 5000,
        padding: mob ? '12px 16px' : (scroll ? '16px 40px' : '24px 40px'),
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'none'
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          position: 'relative',
          borderRadius: 100,
          padding: 2,
          overflow: 'hidden',
          pointerEvents: 'auto',
          boxShadow: scroll ? '0 20px 40px -10px rgba(0,0,0,0.1)' : '0 10px 30px -10px rgba(0,0,0,0.05)',
          transition: 'all 0.5s ease',
          maxWidth: '100vw',
          boxSizing: 'border-box'
        }}>
          {/* Animated Indian Flag Border */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '200%',
            height: '500%',
            background: 'conic-gradient(from 0deg, #138808 0%, #FFFFFF 20%, #FF9933 40%, #FF9933 60%, #FFFFFF 80%, #138808 100%)',
            animation: 'spinBorder 5s linear infinite',
            zIndex: 0
          }} />

          <nav style={{
            position: 'relative',
            zIndex: 1,
            background: scroll ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            borderRadius: 100,
            padding: mob ? '0 10px 0 16px' : '0 24px',
            height: mob ? 52 : 76,
            display: 'flex',
            alignItems: 'center',
            gap: mob ? 8 : 24
          }}>
            <Logo onClick={() => go('home')} sm={mob} />

            {!mob && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, marginLeft: 48 }}>
                {links.map(([p, l]) => (
                  <button
                    key={p}
                    onClick={() => go(p)}
                    className="nav-link"
                    style={{
                      padding: '8px 16px',
                      background: st.page === p ? 'rgba(0,0,0,0.05)' : 'transparent',
                      border: 'none',
                      color: st.page === p ? '#111' : 'rgba(0,0,0,0.5)',
                      fontWeight: 800,
                      fontSize: 12.5,
                      cursor: 'pointer',
                      borderRadius: 100
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
              {st.user ? (
                <button
                  onClick={() => dsp({ t: 'UI', v: { mobileMenu: !st.ui.mobileMenu } })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: '#fff',
                    border: '1.5px solid rgba(0,0,0,0.04)',
                    borderRadius: 100,
                    padding: mob ? '4px' : '6px 16px 6px 6px',
                    cursor: 'pointer',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.03)'
                  }}
                >
                  <img src={st.user.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(st.user.name)}&background=FF9431&color=fff`} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                  {!mob && <span style={{ fontSize: 13, fontWeight: 900, color: '#111' }}>{st.user.name.split(' ')[0]}</span>}
                </button>
              ) : (
                <>
                  {!mob && <button onClick={() => dsp({ t: 'UI', v: { authModal: true } })} style={{ background: 'transparent', border: 'none', color: '#111', fontSize: 13, fontWeight: 800, cursor: 'pointer', padding: '0 12px' }}>Login</button>}
                  <Btn lg onClick={() => go('apply')} style={{ fontWeight: 900, borderRadius: 100, padding: mob ? '10px 18px' : '10px 28px', fontSize: 12.5, background: '#111', color: '#fff', border: 'none' }}>
                    {mob ? 'Join' : 'Start My Journey'}
                  </Btn>
                  {mob && (
                    <button
                      onClick={() => dsp({ t: 'UI', v: { mobileMenu: !st.ui.mobileMenu } })}
                      style={{ background: '#F3F4F6', border: 'none', width: 44, height: 44, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer' }}
                    >
                      <div className="hamburger-bar" style={{ transform: st.ui.mobileMenu ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
                      <div className="hamburger-bar" style={{ opacity: st.ui.mobileMenu ? 0 : 1 }} />
                      <div className="hamburger-bar" style={{ transform: st.ui.mobileMenu ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
                    </button>
                  )}
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}

export function ToastBar() {
  const { st, dsp } = useApp();
  if (st.toasts.length === 0) return null;
  return (
    <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 10000, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {st.toasts.map(t => (
        <div key={t.id} style={{
          background: '#111',
          color: '#fff',
          borderRadius: 20,
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          border: `1px solid ${t.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
        }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: t.type === 'success' ? '#10B981' : '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>
            {t.type === 'success' ? '✓' : '!'}
          </div>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{t.msg}</span>
          <button onClick={() => dsp({ t: 'RM_TOAST', id: t.id })} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 20 }}>×</button>
        </div>
      ))}
    </div>
  );
}

export function CompareBar() {
  const { st, dsp } = useApp();
  if (st.compared.length === 0) return null;
  return (
    <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#111', borderRadius: 100, zIndex: 6000, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {st.compared.map(id => (
          <div key={id} style={{ width: 32, height: 32, borderRadius: '50%', background: '#FF9431', border: '2px solid #fff' }} />
        ))}
      </div>
      <span style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>Compare {st.compared.length} Creators</span>
      <Btn sm onClick={() => dsp({ t: 'GO', p: 'compare' })} style={{ borderRadius: 100, background: '#fff', color: '#111' }}>Compare Now</Btn>
      <button onClick={() => dsp({ t: 'COMPARE_CLEAR' })} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 18 }}>×</button>
    </div>
  );
}

export function AIChatbot({ mob }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: 'assistant', content: 'Namaste! 🇮🇳 Main CreatorBharat ka AI assistant hoon.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    setMsgs([...msgs, { role: 'user', content: input.trim() }]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      setMsgs(prev => [...prev, { role: 'assistant', content: 'Sahi sawal hai! Main development mein hoon, jald batata hoon. 🙏' }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <div style={{ position: 'fixed', bottom: mob ? 140 : 32, right: mob ? 12 : 32, zIndex: 8500 }}>
        <button onClick={() => setOpen(!open)} style={{ width: mob ? 42 : 64, height: mob ? 42 : 64, borderRadius: '50%', background: '#111', border: 'none', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: mob ? 18 : 28 }}>
          {open ? '×' : '🤖'}
        </button>
      </div>
      {open && (
        <div style={{ position: 'fixed', bottom: mob ? 160 : 112, right: mob ? 12 : 32, left: mob ? 12 : 'auto', width: mob ? 'auto' : 380, height: mob ? 450 : 500, background: '#fff', borderRadius: 32, boxShadow: '0 30px 60px rgba(0,0,0,0.2)', zIndex: 8500, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '24px', background: '#111', color: '#fff' }}>
             <span style={{ fontWeight: 900 }}>BharatAI Assistant</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', padding: '12px 16px', borderRadius: 20, background: m.role === 'user' ? '#111' : '#F3F4F6', color: m.role === 'user' ? '#fff' : '#111', fontSize: 14, fontWeight: 600 }}>{m.content}</div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: 20, borderTop: '1px solid #eee', display: 'flex', gap: 10 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type message..." style={{ flex: 1, padding: '12px', borderRadius: 100, border: '1px solid #ddd', outline: 'none' }} />
            <button onClick={send} style={{ width: 44, height: 44, borderRadius: '50%', background: '#111', color: '#fff', border: 'none' }}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}

export function DemoModal() {
  const { dsp } = useApp();
  return (
    <Modal open={true} onClose={() => dsp({ t: 'UI', v: { demoModal: false } })} title="Welcome to CreatorBharat">
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 16 }}>Experience the Revolution</h2>
        <p style={{ color: '#666', marginBottom: 32 }}>We are building the professional layer for Bharat creators.</p>
        <Btn full lg onClick={() => dsp({ t: 'UI', v: { demoModal: false } })}>Get Started</Btn>
      </div>
    </Modal>
  );
}

export function AuthModal() {
  const { st, dsp } = useApp();
  const [tab, setTab] = useState(st.ui.authTab || 'login');

  return (
    <Modal open={true} onClose={() => dsp({ t: 'UI', v: { authModal: false } })} title={tab === 'login' ? 'Namaste, Welcome Back' : 'Join the Revolution'}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, background: '#F3F4F6', padding: 6, borderRadius: 100 }}>
        <button onClick={() => setTab('login')} style={{ flex: 1, padding: '12px', borderRadius: 100, border: 'none', background: tab === 'login' ? '#fff' : 'transparent', fontWeight: 800, cursor: 'pointer' }}>Login</button>
        <button onClick={() => setTab('register')} style={{ flex: 1, padding: '12px', borderRadius: 100, border: 'none', background: tab === 'register' ? '#fff' : 'transparent', fontWeight: 800, cursor: 'pointer' }}>Register</button>
      </div>
      {tab === 'login' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Fld label="Email Address" type="email" placeholder="you@email.com" />
          <Fld label="Password" type="password" placeholder="••••••••" />
          <Btn full lg onClick={() => { dsp({ t: 'LOGIN', u: { name: 'Demo User', id: 'u1' } }); dsp({ t: 'UI', v: { authModal: false } }); }}>Sign In Now</Btn>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Btn variant="outline" onClick={() => { dsp({ t: 'UI', v: { authModal: false } }); dsp({ t: 'GO', p: 'apply' }); }}>Creator Path</Btn>
          <Btn variant="outline" onClick={() => { dsp({ t: 'UI', v: { authModal: false } }); dsp({ t: 'GO', p: 'brand-register' }); }}>Brand Path</Btn>
        </div>
      )}
    </Modal>
  );
}

export function FloatingMobileNav({ mob }) {
  const { st, dsp } = useApp();
  const go = (p) => { dsp({ t: 'GO', p }); scrollToTop(); };
  
  const navs = [
    { id: 'home', l: 'Home', i: '🏠' },
    { id: 'creators', l: 'Creators', i: '👥' },
    { id: 'campaigns', l: 'Campaigns', i: '📢' },
    { id: 'monetize', l: 'Monetize', i: '💰' }
  ];

  return (
    <div className="floating-nav-bar">
      {navs.map(n => (
        <button
          key={n.id}
          onClick={() => go(n.id)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: mob ? '10px 12px' : '10px 16px', borderRadius: 100, border: 'none', cursor: 'pointer',
            background: st.page === n.id ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: st.page === n.id ? '#FF9431' : 'rgba(255,255,255,0.6)',
            transition: 'all 0.3s'
          }}
        >
          <span style={{ fontSize: mob ? 16 : 18 }}>{n.i}</span>
          <span style={{ fontSize: mob ? 8 : 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{n.l}</span>
        </button>
      ))}
    </div>
  );
}

export function MobileMenu({ open }) {
  const { st, dsp } = useApp();
  if (!open) return null;

  const go = (p) => { dsp({ t: 'GO', p }); scrollToTop(); dsp({ t: 'UI', v: { mobileMenu: false } }); };
  const links = [['creators', 'Discover Creators', '👥'], ['campaigns', 'Active Campaigns', '📢'], ['monetize', 'Monetize Content', '💰'], ['blog', 'Creator Academy', '📖'], ['about', 'Our Mission', '🇮🇳']];

  return (
    <>
      <div className="mobile-nav-overlay" onClick={() => dsp({ t: 'UI', v: { mobileMenu: false } })} style={{ animation: 'fadeIn 0.4s ease' }} />
      <div className="mobile-nav-sheet">
        <div style={{ width: 40, height: 4, background: '#EEE', borderRadius: 10, margin: '0 auto 32px' }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {links.map(([p, l, i]) => (
            <div key={p} className="mobile-menu-item" onClick={() => go(p)}>
              <span style={{ fontSize: 24, background: '#F3F4F6', width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i}</span>
              <span style={{ flex: 1 }}>{l}</span>
              <span style={{ color: '#CCC', fontSize: 14 }}>→</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: '24px', background: '#111', borderRadius: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
           <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 700, textAlign: 'center' }}>Ready to start your journey?</p>
           <Btn full lg onClick={() => { dsp({ t: 'UI', v: { authModal: true, mobileMenu: false } }); }}>Login to Dashboard</Btn>
           <button onClick={() => go('apply')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '14px', borderRadius: 20, fontWeight: 800, cursor: 'pointer' }}>Apply as Creator</button>
        </div>
      </div>
    </>
  );
}
