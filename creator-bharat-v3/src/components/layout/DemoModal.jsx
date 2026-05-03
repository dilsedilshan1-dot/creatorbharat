import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context';
import { Logo, Btn } from '../Primitives';

export default function DemoModal({ open }) {
  const { dsp } = useApp();
  const [step, setStep] = useState(1);
  const [prog, setProg] = useState(0);

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setProg(p => {
        if (p >= 100) {
          setStep(s => (s < 4 ? s + 1 : 1));
          return 0;
        }
        return p + 0.4;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [open, step]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ 
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', 
          backdropFilter: 'blur(12px)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}
        onClick={() => dsp({ t: 'UI', v: { demoModal: false } })}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          style={{ 
            width: '100%', maxWidth: 1000, background: '#fff', borderRadius: 40, 
            overflow: 'hidden', position: 'relative', boxShadow: '0 40px 120px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row', 
            height: window.innerWidth < 768 ? 'auto' : 580
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* CLOSE BUTTON */}
          <button 
            onClick={() => dsp({ t: 'UI', v: { demoModal: false } })}
            style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 300, color: '#111' }}
          >
            ×
          </button>

          {/* LEFT: PHONE SHOWCASE */}
          <div style={{ flex: 1.1, background: '#F8FAFC', padding: 24, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', textAlign: 'left', marginBottom: 20 }}>
               <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 12px', background: 'rgba(255,148,49,0.1)', color: '#FF9431', borderRadius: 100, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', marginBottom: 12 }}>
                 <span style={{ width: 6, height: 6, background: '#FF9431', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} /> Bharat's Creator Ecosystem
               </div>
               <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111', marginBottom: 6 }}>The Future of <span style={{ color: '#FF9431' }}>Bharat's</span> Creators</h2>
            </div>

            {/* SHARED PHONE MOCKUP */}
            <PhoneMockup>
               {step === 1 && <IdentityScreen />}
               {step === 2 && <TrustScreen />}
               {step === 3 && <CommunityScreen />}
               {step === 4 && <VisionScreen />}
            </PhoneMockup>

            {/* STEP CONTROLS WITH PROGRESS LINE */}
            <div style={{ display: 'flex', gap: 6, marginTop: 24, width: '100%' }}>
               {[1,2,3,4].map(i => (
                 <div 
                   key={i} 
                   onClick={() => { setStep(i); setProg(0); }} 
                   style={{ 
                     flex: 1, height: 3, borderRadius: 10, background: 'rgba(0,0,0,0.05)', 
                     cursor: 'pointer', position: 'relative', overflow: 'hidden' 
                   }}
                 >
                    {step === i && (
                      <motion.div 
                        style={{ position: 'absolute', inset: 0, background: '#FF9431', width: `${prog}%` }} 
                      />
                    )}
                    {step > i && <div style={{ position: 'absolute', inset: 0, background: '#FF9431' }} />}
                 </div>
               ))}
            </div>
          </div>

          {/* RIGHT: VISION COPY */}
          <div style={{ flex: 0.9, padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#fff', borderLeft: '1px solid rgba(0,0,0,0.05)' }}>
             <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 19, fontWeight: 900, color: '#111', marginBottom: 12 }}>
                   {step === 1 && "Identity: Own Your Digital Estate"}
                   {step === 2 && "Trust: The Gold Standard"}
                   {step === 3 && "Impact: National Spotlight"}
                   {step === 4 && "Vision: Empowering 100M Creators"}
                </h3>
                <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.5)', lineHeight: 1.5, fontWeight: 600 }}>
                   {step === 1 && "A professional portfolio that turns your followers into your digital estate. You own your data, always."}
                   {step === 2 && "Get verified by BharatAI. We prove your authenticity to the world so you get the respect you deserve."}
                   {step === 3 && "Get featured on our National Podcast, access elite learning resources, and join a verified network."}
                   {step === 4 && "Our ultimate goal is to bridge the gap between local talent and global success. Bharat creators deserve the best."}
                </p>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Btn lg style={{ width: '100%', background: '#111', color: '#fff', borderRadius: 100, fontWeight: 900, padding: '16px' }} onClick={() => dsp({ t: 'GO', p: 'apply' })}>Join the Revolution ⚡</Btn>
             </div>

             <div style={{ marginTop: 40, padding: 20, background: '#F8FAFC', borderRadius: 20, border: '1px solid rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: 10, color: 'rgba(0,0,0,0.4)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>Building Bharat together</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                   <span style={{ fontSize: 12, fontWeight: 800, color: '#111' }}>The OS for the next billion creators.</span>
                </div>
             </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function PhoneMockup({ children }) {
  return (
    <div style={{ 
      width: 190, height: 380, background: '#111', borderRadius: 36, padding: 5, 
      position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' 
    }}>
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 60, height: 16, background: '#111', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, zIndex: 10 }} />
      <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: 32, overflowY: 'hidden', position: 'relative' }}>
         {children}
      </div>
    </div>
  );
}

function IdentityScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '100%' }}>
       <div style={{ height: 60, background: 'linear-gradient(45deg, #FF9431, #DC2626)', position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: -20, left: 14, width: 40, height: 40, borderRadius: '50%', border: '2px solid #fff', background: '#eee' }}>
             <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&q=80" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          </div>
       </div>
       <div style={{ padding: '24px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 900 }}>Aryan Sharma ✅</div>
          <div style={{ fontSize: 7, color: '#FF9431', fontWeight: 900 }}>FASHION • JAIPUR</div>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
             <div style={{ background: '#f5f5f5', padding: 6, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 900 }}>450k+</div>
                <div style={{ fontSize: 5, opacity: 0.5 }}>REACH</div>
             </div>
             <div style={{ background: '#f5f5f5', padding: 6, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 900 }}>8.2%</div>
                <div style={{ fontSize: 5, opacity: 0.5 }}>ENGAGE</div>
             </div>
          </div>
          <div style={{ marginTop: 12, height: 32, background: '#111', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, fontWeight: 800 }}>Connect Now</div>
          <p style={{ fontSize: 7, color: 'rgba(0,0,0,0.6)', marginTop: 10, lineHeight: 1.3, textAlign: 'left' }}>
             Capturing Bharat's authentic style. 🇮🇳 Fashion, Travel, and Lifestyle.
          </p>
          <div style={{ marginTop: 14 }}>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                {[1,2,3,4,5,6].map(i => <div key={i} style={{ aspectRatio: '1', background: '#eee', borderRadius: 4, backgroundImage: `url(https://picsum.photos/100/100?random=${i})`, backgroundSize: 'cover' }} />)}
             </div>
          </div>
       </div>
    </motion.div>
  );
}

function TrustScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '100%', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
       <div style={{ width: 60, height: 60, background: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 24 }}>🛡️</span>
       </div>
       <div style={{ fontSize: 11, fontWeight: 900, color: '#111', marginBottom: 4 }}>Audit Report</div>
       <div style={{ width: '100%', height: 6, background: '#eee', borderRadius: 10, position: 'relative', overflow: 'hidden', marginTop: 16 }}>
          <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} transition={{ duration: 1 }} style={{ position: 'absolute', inset: 0, background: '#10B981' }} />
       </div>
       <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 6, fontSize: 8, fontWeight: 900 }}>
          <span>TRUST SCORE</span>
          <span style={{ color: '#10B981' }}>92/100</span>
       </div>
       <div style={{ marginTop: 24, padding: '10px', background: '#F0FDF4', border: '1px solid #10B981', borderRadius: 12, fontSize: 8, fontWeight: 800, color: '#10B981' }}>
          Verified Profile Issued ✅
       </div>
    </motion.div>
  );
}

function CommunityScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '100%', padding: 16 }}>
       <div style={{ fontSize: 10, fontWeight: 900, marginBottom: 12 }}>Growth & Community</div>
       <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ padding: 10, background: '#F0F9FF', borderRadius: 12, border: '1px solid #0EA5E9', display: 'flex', alignItems: 'center', gap: 8 }}>
             <span style={{ fontSize: 14 }}>🎙️</span>
             <div>
                <div style={{ fontSize: 8, fontWeight: 900, color: '#0369A1' }}>National Spotlight</div>
                <div style={{ fontSize: 6, opacity: 0.6 }}>Podcast Feature</div>
             </div>
          </div>
          <div style={{ padding: 10, background: '#FDF2F8', borderRadius: 12, border: '1px solid #DB2777', display: 'flex', alignItems: 'center', gap: 8 }}>
             <span style={{ fontSize: 14 }}>📖</span>
             <div>
                <div style={{ fontSize: 8, fontWeight: 900, color: '#9D174D' }}>Learning Hub</div>
                <div style={{ fontSize: 6, opacity: 0.6 }}>Growth Articles</div>
             </div>
          </div>
          <div style={{ padding: 10, background: '#F5F3FF', borderRadius: 12, border: '1px solid #7C3AED', display: 'flex', alignItems: 'center', gap: 8 }}>
             <span style={{ fontSize: 14 }}>👥</span>
             <div>
                <div style={{ fontSize: 8, fontWeight: 900, color: '#5B21B6' }}>Elite Network</div>
                <div style={{ fontSize: 6, opacity: 0.6 }}>Pro Community</div>
             </div>
          </div>
       </div>
       <div style={{ marginTop: 16, padding: 10, background: '#111', borderRadius: 10, color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: 8, fontWeight: 900 }}>Support for Tier 2 & 3</div>
          <div style={{ fontSize: 5, opacity: 0.6 }}>LOCAL ASSISTANCE</div>
       </div>
    </motion.div>
  );
}

function VisionScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center', background: '#fff' }}>
       {/* CENTERED LOGO ICON */}
       <div style={{ position: 'relative', width: 54, height: 54, borderRadius: '50%', padding: 2, overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', marginBottom: 12 }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '200%', height: '200%', background: 'conic-gradient(from 0deg, #FF9431, #fff, #128807, #fff, #FF9431)', animation: 'spinBorder 4s linear infinite', zIndex: 0 }} />
          <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '33.33%', background: '#FF9431' }} />
            <div style={{ position: 'absolute', top: '33.33%', left: 0, right: 0, height: '33.34%', background: '#FFFFFF' }} />
            <div style={{ position: 'absolute', top: '66.67%', left: 0, right: 0, height: '33.33%', background: '#128807' }} />
          </div>
       </div>
       <div style={{ fontSize: 18, fontWeight: 900, color: '#111', marginBottom: 16 }}>CreatorBharat</div>

       <h4 style={{ fontSize: 13, fontWeight: 800, color: 'rgba(0,0,0,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Our Mission</h4>
       <p style={{ fontSize: 10, color: 'rgba(0,0,0,0.6)', lineHeight: 1.6, fontWeight: 600 }}>
          To build a Bharat where every local talent becomes a global brand. 🇮🇳
       </p>
       <div style={{ marginTop: 24, width: '100%', height: 2, background: 'linear-gradient(90deg, #FF9431, #DC2626)', borderRadius: 10 }} />
       <div style={{ marginTop: 12, fontSize: 8, fontWeight: 900, color: '#111', textTransform: 'uppercase' }}>100M+ Creators • 1 Mission</div>
    </motion.div>
  );
}
