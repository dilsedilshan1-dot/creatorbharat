import React, { useState, useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import { useApp } from '../context';
import Footer from './home/Footer';
import Navbar from './layout/Navbar';
import MobileMenu from './layout/MobileMenu';
import ToastBar from './layout/ToastBar';
import CompareBar from './layout/CompareBar';
import AuthModal from './layout/AuthModal';

export default function Layout({ children }) {
  const { st, dsp } = useApp();
  const [mob, setMob] = useState(window.innerWidth < 768);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    const h = () => setMob(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => {
      window.removeEventListener('resize', h);
      lenis.destroy();
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
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

      <Navbar />

      <main style={{ flex: 1, position: 'relative', zIndex: 1, paddingTop: mob ? 64 : 80 }}>
        {children}
      </main>

      <Footer mob={mob} />

      {mob && <FloatingMobileNav />}

      <MobileMenu open={st.ui.mobileMenu} />

      <ToastBar />
      <CompareBar />

      {st.ui.authModal && <AuthModal />}
    </div>
  );
}

function FloatingMobileNav() {
  const { st, dsp } = useApp();
  const go = (p) => { dsp({ t: 'GO', p }); window.scrollTo({ top: 0, behavior: 'smooth' }); };

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
            padding: '10px 12px', borderRadius: 100, border: 'none', cursor: 'pointer',
            background: st.page === n.id ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: st.page === n.id ? '#FF9431' : 'rgba(255,255,255,0.6)',
            transition: 'all 0.3s'
          }}
        >
          <span style={{ fontSize: 16 }}>{n.i}</span>
          <span style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{n.l}</span>
        </button>
      ))}
    </div>
  );
}
