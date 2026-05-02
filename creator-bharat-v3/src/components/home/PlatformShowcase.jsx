import React from 'react';
import { W } from '../../theme';

export default function PlatformShowcase({ mob }) {
  return (
    <section style={{ padding: mob ? '40px 20px' : '40px 20px 80px 20px', background: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      
      {/* GHOST BACKGROUND TEXT */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: mob ? 100 : 220, fontWeight: 900, color: 'rgba(0,0,0,0.012)', zIndex: 0, letterSpacing: '-0.05em', whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none' }}>
        BHARAT HUB
      </div>

      <div style={{ ...W(), maxWidth: 1000, position: 'relative', zIndex: 1 }}>
        
        {/* ELITE HEADING SECTION */}
        <div style={{ marginBottom: 56 }}>
           <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 16px', 
              background: 'rgba(0,0,0,0.03)', borderRadius: 100, marginBottom: 20 
           }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: '#111', textTransform: 'uppercase', letterSpacing: '3px' }}>Identity & Growth</span>
           </div>
           
           <h2 style={{ 
              fontFamily: "'Fraunces', serif", 
              fontSize: mob ? 36 : 64, 
              fontWeight: 900, 
              color: '#111', 
              lineHeight: 1, 
              letterSpacing: '-0.03em'
           }}>
              Our Core Commitment.
           </h2>
        </div>

        {/* MISSION CAPSULE WITH NAV-SYNC BORDER */}
        <div style={{ 
          position: 'relative', 
          padding: '1.5px', 
          borderRadius: 42, 
          overflow: 'hidden',
          background: 'rgba(0,0,0,0.05)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* THE SPINNING LINE (NAVBAR SYNC) */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', width: '150%', height: '400%',
            background: 'conic-gradient(from 0deg, #138808, #FFFFFF, #FF9933, transparent 50%, #138808, #FFFFFF, #FF9933, transparent)',
            animation: 'spinBorder 6s linear infinite',
            transform: 'translate(-50%, -50%)',
            zIndex: 0
          }} />

          {/* THE CONTENT */}
          <div style={{ position: 'relative', zIndex: 1, background: '#fff', borderRadius: 40, padding: mob ? '40px 24px' : '64px 80px', width: '100%' }}>
             <div style={{ fontSize: 32, marginBottom: 24 }}>✨</div>
             
             <h3 style={{ 
                fontSize: mob ? 22 : 36, 
                fontWeight: 800, 
                color: '#111', 
                lineHeight: 1.5, 
                letterSpacing: '-0.02em', 
                maxWidth: 850, 
                margin: '0 auto',
                fontStyle: 'italic',
                fontFamily: "'Fraunces', serif"
             }}>
                "Hum Bharat ke har creator ko unki <span style={{ color: '#FF9431', fontStyle: 'normal' }}>Pehchan</span> dena chahte hain. Hamara mission local talent ko direct <span style={{ color: '#138808', fontStyle: 'normal' }}>National Recognition</span> aur Growth Hub se jodna hai."
             </h3>
             
             {/* Small Stat Pills */}
             <div style={{ marginTop: 48, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 16 }}>
                {[
                   { t: 'Verified Identity', i: '✓' },
                   { t: 'Direct Discovery', i: '🤝' },
                   { t: 'Impact First', i: '🇮🇳' }
                ].map((p, i) => (
                   <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', background: 'rgba(0,0,0,0.02)', borderRadius: 100, border: '1px solid rgba(0,0,0,0.06)' }}>
                      <span style={{ fontSize: 10, fontWeight: 900, color: '#10B981' }}>{p.i}</span>
                      <span style={{ fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>{p.t}</span>
                   </div>
                ))}
             </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spinBorder {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
