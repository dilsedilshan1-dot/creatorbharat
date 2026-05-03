import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';

function Counter({ value }) {
  const [displayValue, setDisplayValue] = useState(0);
  const target = parseInt(value.replace(/[^0-9]/g, ''));
  const suffix = value.replace(/[0-9,]/g, '');

  useEffect(() => {
    const controls = animate(0, target, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
    });
    return () => controls.stop();
  }, [target]);

  return (
    <span>
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
}

export default function ImpactStats({ mob }) {
  const stats = [
    { l: 'Verified Creators', v: '2,400+', d: 'Authentic local talent', c: '#FF9431' },
    { l: 'Combined Reach', v: '85M+', d: 'Across all platforms', c: '#138808' },
    { l: 'Brand Campaigns', v: '340+', d: 'Successful collaborations', c: '#3B82F6' },
    { l: 'Regional Hubs', v: '150+', d: 'Tier 2 & 3 cities active', c: '#8B5CF6' }
  ];

  return (
    <section style={{ padding: mob ? '60px 20px' : '80px 20px', background: '#fff', textAlign: 'center', position: 'relative' }}>
      
      {/* Background Subtle Gradient */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%', background: 'radial-gradient(circle, rgba(255,148,49,0.03) 0%, transparent 70%)', zIndex: 0 }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 60 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 20px', background: 'rgba(0,0,0,0.03)', borderRadius: 100, marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 900, color: '#111', textTransform: 'uppercase', letterSpacing: '2.5px' }}>Live Ecosystem</span>
          </div>
          
          <h2 style={{ 
            fontFamily: "'Fraunces', serif", 
            fontSize: mob ? 36 : 64, 
            fontWeight: 900, 
            color: '#111', 
            lineHeight: 1, 
            letterSpacing: '-0.03em',
            marginBottom: 20
          }}>
            The Pulse of <span style={{ background: 'linear-gradient(90deg, #FF9431, #138808)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bharat's Economy.</span>
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(0,0,0,0.5)', fontWeight: 600, maxWidth: 600, margin: '0 auto' }}>
            Empowering the next generation of creators from every corner of India.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: mob ? '1fr 1fr' : 'repeat(4, 1fr)', 
          gap: mob ? 12 : 24 
        }}>
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              style={{
                padding: mob ? '24px 12px' : '40px 24px',
                background: '#fff',
                borderRadius: mob ? 24 : 32,
                border: '1.5px solid rgba(0,0,0,0.06)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.02)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: s.c }} />
              
              <div style={{ fontSize: mob ? 22 : 48, fontWeight: 900, color: '#111', marginBottom: 4, letterSpacing: '-0.02em' }}>
                <Counter value={s.v} />
              </div>
              <div style={{ fontSize: mob ? 9 : 14, fontWeight: 900, color: s.c, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
                {s.l}
              </div>
              <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.4)', fontWeight: 600 }}>
                {s.d}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          70% { transform: scale(2); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
