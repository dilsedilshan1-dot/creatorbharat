import React from 'react';
import { useApp } from '../../context';
import { Btn } from '../Primitives';
import { scrollToTop } from '../../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Megaphone, Target, BookOpen, Heart, ArrowRight, Instagram, Twitter, Youtube } from 'lucide-react';

export default function MobileMenu({ open }) {
  const { st, dsp } = useApp();

  const go = (p) => {
    dsp({ t: 'GO', p });
    scrollToTop();
    dsp({ t: 'UI', v: { mobileMenu: false } });
  };

  const links = [
    { id: 'creators', l: 'Discover Creators', i: Users, d: 'Explore India\'s top talent' },
    { id: 'campaigns', l: 'Active Campaigns', i: Megaphone, d: 'Join the latest brand revolutions' },
    { id: 'roadmap', l: 'Our Vision', i: Target, d: 'The future of Bharat\'s creators' },
    { id: 'blog', l: 'Creator Academy', i: BookOpen, d: 'Learn from the best' },
    { id: 'about', l: 'Community Hub', i: Heart, d: 'Connect with local talent' }
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* FULL SCREEN ELITE OVERLAY */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dsp({ t: 'UI', v: { mobileMenu: false } })}
            style={{ 
              position: 'fixed', inset: 0, 
              background: 'rgba(255,255,255,0.7)', 
              backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
              zIndex: 9500 
            }} 
          />

          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ 
              position: 'fixed', right: 0, top: 0, bottom: 0, 
              width: '100%', maxWidth: 400,
              background: '#fff', 
              zIndex: 9600,
              padding: '24px',
              display: 'flex', flexDirection: 'column',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.05)'
            }}
          >
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #FF9431, #DC2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900 }}>CB</div>
                  <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: '-0.02em' }}>CreatorBharat</span>
               </div>
               <button 
                  onClick={() => dsp({ t: 'UI', v: { mobileMenu: false } })}
                  style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
               >
                  <X size={20} color="#111" />
               </button>
            </div>

            {/* STAGGERED MENU ITEMS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
              {links.map((n, i) => {
                const Icon = n.i;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => go(n.id)}
                    style={{ 
                      padding: '20px', borderRadius: 24, background: 'rgba(0,0,0,0.02)',
                      display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
                      border: '1px solid rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: 16, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
                      <Icon size={22} color="#FF9431" />
                    </div>
                    <div style={{ flex: 1 }}>
                       <div style={{ fontWeight: 800, fontSize: 16, color: '#111' }}>{n.l}</div>
                       <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.4)', fontWeight: 600 }}>{n.d}</div>
                    </div>
                    <ArrowRight size={16} color="rgba(0,0,0,0.2)" />
                  </motion.div>
                );
              })}
            </div>

            {/* PREMIUM FOOTER ACTION */}
            <div style={{ marginTop: 24, padding: '24px', background: '#111', borderRadius: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Btn full lg onClick={() => { dsp({ t: 'UI', v: { authModal: true, mobileMenu: false } }); }}>Login to Dashboard</Btn>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 8 }}>
                <Instagram size={20} color="rgba(255,255,255,0.4)" />
                <Twitter size={20} color="rgba(255,255,255,0.4)" />
                <Youtube size={20} color="rgba(255,255,255,0.4)" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
