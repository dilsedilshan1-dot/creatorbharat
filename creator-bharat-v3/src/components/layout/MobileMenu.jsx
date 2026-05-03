import React from 'react';
import { useApp } from '../../context';
import { Btn, Logo } from '../Primitives';
import { scrollToTop } from '../../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Megaphone, Target, BookOpen, Heart, ArrowRight } from 'lucide-react';

export default function MobileMenu({ open }) {
  const { st, dsp } = useApp();

  const go = (p) => {
    dsp({ t: 'GO', p });
    scrollToTop();
    dsp({ t: 'UI', v: { mobileMenu: false } });
  };

  const links = [
    { id: 'creators', l: 'Creators', i: Users },
    { id: 'campaigns', l: 'Campaigns', i: Megaphone },
    { id: 'roadmap', l: 'Vision', i: Target },
    { id: 'blog', l: 'Academy', i: BookOpen },
    { id: 'about', l: 'About', i: Heart }
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* DIM OVERLAY */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dsp({ t: 'UI', v: { mobileMenu: false } })}
            style={{ 
              position: 'fixed', inset: 0, 
              background: 'rgba(0,0,0,0.3)', 
              backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
              zIndex: 9500 
            }} 
          />

          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            style={{ 
              position: 'fixed', right: 0, top: 0, bottom: 0, 
              width: '80%', maxWidth: 320, // HALF PAGE WIDTH
              background: '#fff', 
              zIndex: 9600,
              padding: '24px',
              display: 'flex', flexDirection: 'column',
              boxShadow: '-10px 0 50px rgba(0,0,0,0.1)',
              borderRadius: '32px 0 0 32px' // MODERN CURVED DRAWER
            }}
          >
            {/* BRAND HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
               <Logo onClick={() => go('home')} sm />
               <button 
                  onClick={() => dsp({ t: 'UI', v: { mobileMenu: false } })}
                  style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
               >
                  <X size={18} color="#111" />
               </button>
            </div>

            {/* SLEEK MENU LIST */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              {links.map((n, i) => {
                const Icon = n.i;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => go(n.id)}
                    style={{ 
                      padding: '16px 20px', borderRadius: 16, 
                      background: st.page === n.id ? 'rgba(255,148,49,0.08)' : 'transparent',
                      display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Icon size={18} color={st.page === n.id ? '#FF9431' : 'rgba(0,0,0,0.4)'} />
                    <span style={{ 
                      fontWeight: 800, fontSize: 15, 
                      color: st.page === n.id ? '#111' : 'rgba(0,0,0,0.6)',
                      flex: 1 
                    }}>{n.l}</span>
                    {st.page === n.id && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF9431' }} />}
                  </motion.div>
                );
              })}
            </div>

            {/* ACTION FOOTER */}
            <div style={{ 
              marginTop: 'auto', paddingTop: 24, 
              borderTop: '1px solid rgba(0,0,0,0.05)',
              display: 'flex', flexDirection: 'column', gap: 12 
            }}>
              <p style={{ fontSize: 11, fontWeight: 900, color: 'rgba(0,0,0,0.3)', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', marginBottom: 4 }}>Account</p>
              <Btn full lg onClick={() => { dsp({ t: 'UI', v: { authModal: true, mobileMenu: false } }); }}>Login to Portal</Btn>
              <p style={{ fontSize: 10, color: 'rgba(0,0,0,0.4)', textAlign: 'center', fontWeight: 700 }}>Made with ❤️ in Bharat</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
