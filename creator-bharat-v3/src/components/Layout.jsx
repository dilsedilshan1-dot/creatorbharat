import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context';
import { T, W, scrollToTop, LS } from '../theme';
import { Logo, Btn, Modal, Fld, Bdg, Bar } from './Primitives';

export default function Layout({ children }) {
  const { st, dsp } = useApp();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <Navbar />
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>{children}</main>
      <Footer />
      <ToastBar />
      <CompareBar />
      <AIChatbot />
      {st.ui.authModal && <AuthModal />}
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
    ? [['dashboard', 'Dashboard'], ['campaigns', 'Deals'], ['leaderboard', 'Leaderboard'], ['blog', 'Blogs']]
    : isBrand
      ? [['creators', 'Discover'], ['campaigns', 'My Ads'], ['blog', 'Blogs']]
      : [['creators', 'Creators'], ['campaigns', 'Campaigns'], ['monetize', 'Monetize 💰'], ['blog', 'Blogs'], ['about', 'About']];

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
          filter: drop-shadow(0 1px 1px rgba(0,0,0,0.05));
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
          animation: fadeIn 0.3s ease;
        }
        .mobile-nav-sheet {
          position: fixed; left: 12px; right: 12px; bottom: 12px; background: #fff; border-radius: 40px;
          padding: 40px 24px; z-index: 6001; box-shadow: 0 -20px 60px rgba(0,0,0,0.2);
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: none; } }
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
          transition: 'all 0.5s ease' 
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
            padding: mob ? '0 8px 0 20px' : '0 24px', 
            height: mob ? 60 : 76, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 24
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
                    padding: '6px 16px 6px 6px', 
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
                </>
              )}
              {mob && (
                <button 
                  onClick={() => dsp({ t: 'UI', v: { mobileMenu: !st.ui.mobileMenu } })} 
                  style={{ 
                    background: '#111', 
                    border: 'none', 
                    cursor: 'pointer', 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#fff',
                    fontSize: 20
                  }}
                >
                  {st.ui.mobileMenu ? '×' : '☰'}
                </button>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* MOBILE MENU */}
      {st.ui.mobileMenu && (
        <>
          <div className="mobile-nav-overlay" onClick={() => dsp({ t: 'UI', v: { mobileMenu: false } })} />
          <div className="mobile-nav-sheet">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
              <Logo />
              <button onClick={() => dsp({ t: 'UI', v: { mobileMenu: false } })} style={{ fontSize: 32, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {links.map(([p, l]) => (
                <button key={p} onClick={() => go(p)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px', background: st.page === p ? '#FF9431' : '#FAFAFA', border: 'none', borderRadius: 24, color: st.page === p ? '#fff' : '#111', fontSize: 18, fontWeight: 900, cursor: 'pointer' }}>
                  {l}
                  <span style={{ opacity: 0.5 }}>→</span>
                </button>
              ))}
              {st.user ? (
                <button onClick={() => { dsp({ t: 'LOGOUT' }); go('home'); }} style={{ marginTop: 20, padding: '24px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: 24, fontWeight: 900, fontSize: 18 }}>Logout</button>
              ) : (
                <Btn full lg onClick={() => { dsp({ t: 'UI', v: { authModal: true, mobileMenu: false } }); }} style={{ marginTop: 20, height: 72, borderRadius: 24 }}>Login to Account</Btn>
              )}
            </div>
            <p style={{ textAlign: 'center', fontSize: 13, color: T.t4, marginTop: 40, fontWeight: 700 }}>CreatorBharat • Proudly Made in 🇮🇳 Jaipur</p>
          </div>
        </>
      )}
    </>
  );
}

export function Footer() {
  const { dsp } = useApp();
  const [mob, setMob] = useState(window.innerWidth < 768);
  useEffect(() => { const h = () => setMob(window.innerWidth < 768); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);
  const go = (p) => { dsp({ t: 'GO', p }); scrollToTop(); };

  return (
    <footer style={{ background: '#050505', color: '#fff', paddingTop: mob ? 64 : 120, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.1)' }} />
      <div style={W()}>
        <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '2fr 1fr 1fr 1fr', gap: mob ? 48 : 64, paddingBottom: 80 }}>
          <div style={{ maxWidth: 360 }}>
            <Logo light onClick={() => go('home')} />
            <p style={{ fontSize: 16, lineHeight: 1.8, marginTop: 32, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
               India's premier creator discovery ecosystem. We are building the professional infrastructure for Bharat's authentic talent.
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
               {['𝕏', '📸', '📽️', '🔗'].map((icon, i) => (
                 <div key={i} style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, cursor: 'pointer' }}>{icon}</div>
               ))}
            </div>
          </div>
          
          {[
            { t: 'Product', l: [['creators', 'Find Creators'], ['campaigns', 'Live Campaigns'], ['leaderboard', 'Leaderboard'], ['rate-calc', 'Rate Calculator']] },
            { t: 'Company', l: [['about', 'Our Story'], ['blog', 'Hub & Insights'], ['contact', 'Contact Us'], ['press', 'Press Kit']] },
            { t: 'Support', l: [['pricing', 'Pricing Plans'], ['terms', 'Terms of Service'], ['privacy', 'Privacy Policy']] }
          ].map(col => (
            <div key={col.t}>
              <h4 style={{ fontSize: 13, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 32 }}>{col.t}</h4>
              {col.l.map(([p, l]) => (
                <button key={p} onClick={() => go(p)} style={{ display: 'block', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 15, cursor: 'pointer', marginBottom: 18, padding: 0, textAlign: 'left', fontWeight: 600 }}>{l}</button>
              ))}
            </div>
          ))}
        </div>
        
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>© 2026 CreatorBharat Technologies Pvt. Ltd.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
             <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Made with ❤️ in Jaipur, Rajasthan</p>
             <div style={{ width: 24, height: 16, background: 'linear-gradient(#FF9933, #fff, #138808)', borderRadius: 2 }} />
          </div>
        </div>
      </div>
    </footer>
  );
}

export function ToastBar() {
  const { st, dsp } = useApp();
  if (st.toasts.length === 0) return null;
  return (
    <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 10000, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {st.toasts.map(t => (
        <div className="si" key={t.id} style={{ 
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
    <div className="si" style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#111', borderRadius: 100, zIndex: 6000, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ display: 'flex', gap: 8 }}>
         {st.compared.map(id => (
           <div key={id} style={{ width: 32, height: 32, borderRadius: '50%', background: T.gd, border: '2px solid #fff' }} />
         ))}
      </div>
      <span style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>Compare {st.compared.length} Creators</span>
      <Btn sm onClick={() => dsp({ t: 'GO', p: 'compare' })} style={{ borderRadius: 100, background: '#fff', color: '#111' }}>Compare Now</Btn>
      <button onClick={() => dsp({ t: 'COMPARE_CLEAR' })} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 18 }}>×</button>
    </div>
  );
}

export function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: 'assistant', content: 'Namaste! 🇮🇳 Main CreatorBharat ka AI assistant hoon. Aapki kya madad kar sakta hoon?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMsgs([...msgs, userMsg]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      setMsgs(prev => [...prev, { role: 'assistant', content: 'Bahut badhiya sawal! Abhi hum development mein hain, par main jald hi aapki madad karunga. 🙏' }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 8500 }}>
        <button 
          onClick={() => setOpen(!open)} 
          style={{ width: 64, height: 64, borderRadius: '50%', background: '#111', border: 'none', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}
        >
          {open ? '×' : '🤖'}
        </button>
      </div>
      {open && (
        <div className="si" style={{ position: 'fixed', bottom: 112, right: 32, width: 380, height: 560, background: '#fff', borderRadius: 32, boxShadow: '0 30px 60px rgba(0,0,0,0.2)', zIndex: 8500, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '24px', background: '#111', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
               <span style={{ fontWeight: 900, fontSize: 16 }}>BharatAI Assistant</span>
               <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>ONLINE NOW</span>
               </div>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: '#fff', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', padding: '16px 20px', borderRadius: 24, background: m.role === 'user' ? '#111' : '#F3F4F6', color: m.role === 'user' ? '#fff' : '#111', fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>
                {m.content}
              </div>
            ))}
            {loading && <div style={{ fontSize: 12, color: T.t3, fontWeight: 700, marginLeft: 8 }}>AI is thinking...</div>}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: 24, borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: 12 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Kuch pucho..." style={{ flex: 1, padding: '14px 20px', borderRadius: 100, border: '1px solid rgba(0,0,0,0.1)', outline: 'none', fontSize: 14 }} />
            <button onClick={send} style={{ width: 48, height: 48, borderRadius: '50%', background: '#111', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}

export function AuthModal() {
  const { st, dsp } = useApp();
  const [tab, setTab] = useState(st.ui.authTab || 'login');
  
  return (
    <Modal open={true} onClose={() => dsp({ t: 'UI', v: { authModal: false } })} title={tab === 'login' ? 'Namaste, Welcome Back' : 'Join the Revolution'}>
       <div style={{ display: 'flex', gap: 12, marginBottom: 32, background: '#F3F4F6', padding: 6, borderRadius: 100 }}>
          <button onClick={() => setTab('login')} style={{ flex: 1, padding: '12px', borderRadius: 100, border: 'none', background: tab === 'login' ? '#fff' : 'transparent', fontWeight: 800, fontSize: 14, color: '#111', cursor: 'pointer', boxShadow: tab === 'login' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}>Login</button>
          <button onClick={() => setTab('register')} style={{ flex: 1, padding: '12px', borderRadius: 100, border: 'none', background: tab === 'register' ? '#fff' : 'transparent', fontWeight: 800, fontSize: 14, color: '#111', cursor: 'pointer', boxShadow: tab === 'register' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}>Register</button>
       </div>
       
       <div className="ai">
         {tab === 'login' ? (
           <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
             <Fld label="Email Address" type="email" placeholder="you@email.com" />
             <Fld label="Password" type="password" placeholder="••••••••" />
             <Btn full lg onClick={() => { 
               dsp({ t: 'LOGIN', u: { name: 'Demo Creator', id: 'u1', email: 'demo@creatorbharat.in' }, role: 'creator' });
               dsp({ t: 'UI', v: { authModal: false } });
               dsp({ t: 'TOAST', d: { type: 'success', msg: 'Logged in successfully!' } });
             }} style={{ height: 60, borderRadius: 100 }}>Sign In Now</Btn>
             <p style={{ textAlign: 'center', fontSize: 14, color: T.t3, fontWeight: 600 }}>Forgot password? <span style={{ color: '#FF9431', cursor: 'pointer' }}>Reset it</span></p>
           </div>
         ) : (
           <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 16, color: T.t2, marginBottom: 24, lineHeight: 1.6 }}>Are you a creator or a brand? Select your path to get started.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                 <Btn variant="outline" onClick={() => { dsp({ t: 'UI', v: { authModal: false } }); dsp({ t: 'GO', p: 'apply' }); }}>I am a Creator</Btn>
                 <Btn variant="outline" onClick={() => { dsp({ t: 'UI', v: { authModal: false } }); dsp({ t: 'GO', p: 'brand-register' }); }}>I am a Brand</Btn>
              </div>
           </div>
         )}
       </div>
    </Modal>
  );
}
