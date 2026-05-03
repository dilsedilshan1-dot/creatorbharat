import React from 'react';
import { motion } from 'framer-motion';
import { W } from '../../utils/helpers';

export default function Manifesto({ mob }) {
  return (
    <section style={{ padding: mob ? '100px 24px' : '160px 0', background: '#000', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      {/* Background Decorative Elements */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, #FF9431 0%, transparent 70%)', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, #138808 0%, transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      <div style={W()}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 24px', 
              background: 'rgba(255,255,255,0.05)', borderRadius: 100, marginBottom: 40,
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF9431', animation: 'pulse-dot 2s infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', color: 'rgba(255,255,255,0.6)' }}>Our Manifesto</span>
          </motion.div>

          <h2 style={{ 
            fontSize: mob ? 'clamp(32px, 8vw, 48px)' : '72px', 
            fontWeight: 900, 
            lineHeight: 1.1, 
            letterSpacing: '-0.04em',
            marginBottom: 40
          }}>
            India’s Next <span style={{ color: '#FF9431' }}>100 Million</span> <br />
            Creators are in <span style={{ background: 'linear-gradient(90deg, #FF9431, #FFFFFF, #138808)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bharat.</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <p style={{ fontSize: mob ? 18 : 24, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontWeight: 500 }}>
              For too long, the spotlight was only on the big cities. But we know the real stories, the raw talent, and the next big empires are rising from the streets of Jaipur, the fields of Punjab, and the small towns of Kerala.
            </p>
            
            <p style={{ fontSize: mob ? 18 : 24, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontWeight: 500 }}>
              CreatorBharat is not just a platform. It is a mission to give every Indian creator their <span style={{ color: '#fff', fontWeight: 900 }}>Identity</span>, their <span style={{ color: '#fff', fontWeight: 900 }}>Freedom</span>, and their <span style={{ color: '#fff', fontWeight: 900 }}>Legacy</span>.
            </p>
          </div>

          <div style={{ marginTop: 60, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: mob ? 20 : 48 }}>
            {[
              { l: 'Verified Trust', v: 'No Middlemen' },
              { l: 'Zero Commission', v: '100% Earnings' },
              { l: 'Regional First', v: 'Global Reach' }
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: '#FF9431', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 8 }}>{stat.l}</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>{stat.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0% { transform: scale(1); opacity: 1; }
          70% { transform: scale(2); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
