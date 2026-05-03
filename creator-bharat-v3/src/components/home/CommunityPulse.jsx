import React from 'react';
import { T } from '../../theme';
import { W } from '../../utils/helpers';

export default function CommunityPulse({ mob }) {
  const steps = [
    {
      n: '01',
      h: 'Create Your Verified Identity',
      d: 'Hum har creator ko ek premium, verified portfolio page dete hain. Ye sirf ek link nahi, aapki digital pehchan hai jo brands ko aapka real potential dikhayegi.',
      i: '👤',
      tag: 'Identity',
      color: '#FF9431'
    },
    {
      n: '02',
      h: 'Get Featured in Podcasts & Articles',
      d: 'Sirf identity nahi, hum aapko national spotlight dete hain. Humare podcast aur articles ke zariye Tier 2 & 3 creators ki story poore Bharat tak pahunchegi.',
      i: '🎙️',
      tag: 'Spotlight',
      color: '#138808'
    },
    {
      n: '03',
      h: 'Direct Brand Deals with 0% Commission',
      d: 'Hum middlemen ko hatate hain. Aap brands se direct connect honge aur jo bhi kamayenge, wo 100% aapka hoga. Hamara mission hai aapko independent banana.',
      i: '💸',
      tag: 'Monetize',
      color: '#3B82F6'
    }
  ];

  return (
    <section style={{ padding: mob ? '40px 20px' : '40px 20px 60px 20px', background: '#fff', position: 'relative' }}>
      <div style={W()}>
        {/* Pro Heading UI with Indian Flag */}
        <div style={{ textAlign: 'left', marginBottom: 80, borderLeft: '4px solid #FF9431', paddingLeft: 32, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24 }}>
            <div style={{ flex: 1, minWidth: mob ? '100%' : 600 }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: 'rgba(0,0,0,0.3)', textTransform: 'uppercase', letterSpacing: '4px' }}>How it Works</span>
              <h2 style={{ fontSize: mob ? 40 : 72, fontWeight: 900, color: '#111', marginTop: 12, lineHeight: 1, letterSpacing: '-0.05em' }}>
                The Creator Success <br />
                <span style={{ background: 'linear-gradient(90deg, #FF9431, #138808)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Roadmap.</span>
              </h2>
            </div>

            {/* ANIMATED INDIAN FLAG */}
            <div className="flag-wave-container" style={{ marginBottom: 10 }}>
              <div style={{ width: mob ? 80 : 120, height: mob ? 50 : 75, borderRadius: 8, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, background: '#FF9933' }} />
                <div style={{ flex: 1, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: mob ? 14 : 20, height: mob ? 14 : 20, borderRadius: '50%', border: '1.5px solid #000080', position: 'relative' }}>
                    {[...Array(12)].map((_, i) => (
                      <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', width: '100%', height: 1, background: '#000080', transform: `translate(-50%, -50%) rotate(${i * 30}deg)` }} />
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1, background: '#138808' }} />
                <div className="flag-wave-overlay" />
              </div>
            </div>
          </div>

          <p style={{ fontSize: 18, color: 'rgba(0,0,0,0.5)', marginTop: 24, maxWidth: 600, fontWeight: 500 }}>
            Humein pata hai local creator banna asaan nahi hai. Isliye humne banaya hai India ka pehla step-by-step growth path.
          </p>
        </div>

        {/* Vertical Journey Section: MORE COMPACT ON MOBILE */}
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: mob ? 24 : 100, // TIGHTER GAP ON MOBILE
          position: 'relative'
        }}>
          {!mob && <div style={{
            position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2,
            background: 'linear-gradient(to bottom, #FF9431, #138808, #FF9431)',
            transform: 'translateX(-50%)', opacity: 0.2
          }} />}

          {steps.map((s, i) => (
            <div key={i} style={{
              display: 'flex',
              flexDirection: mob ? 'row' : (i % 2 === 0 ? 'row' : 'row-reverse'), // SIDE BY SIDE ON MOBILE TOO
              alignItems: 'center',
              gap: mob ? 16 : 80,
              textAlign: mob ? 'left' : (i % 2 === 0 ? 'right' : 'left'),
              position: 'relative',
              width: '100%',
              background: mob ? 'rgba(0,0,0,0.02)' : 'transparent',
              padding: mob ? '20px' : 0,
              borderRadius: mob ? 24 : 0
            }}>
              {/* STEP INFO */}
              <div style={{ flex: 1.2 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  marginBottom: mob ? 8 : 20,
                  flexDirection: (mob || i % 2 !== 0) ? 'row' : 'row-reverse'
                }}>
                  <div style={{ fontSize: mob ? 24 : 48, fontWeight: 900, color: 'rgba(0,0,0,0.05)' }}>{s.n}</div>
                  <div style={{ padding: '4px 12px', borderRadius: 100, background: s.color + '15', color: s.color, fontSize: mob ? 9 : 12, fontWeight: 900, textTransform: 'uppercase' }}>{s.tag}</div>
                </div>
                <h3 style={{ fontSize: mob ? 16 : 42, fontWeight: 900, color: '#111', marginBottom: mob ? 4 : 16 }}>{s.h}</h3>
                {!mob && <p style={{ fontSize: 16, color: 'rgba(0,0,0,0.5)', lineHeight: 1.6, maxWidth: 500, margin: i % 2 === 0 ? '0 0 0 auto' : '0 auto 0 0' }}>{s.d}</p>}
              </div>

              {/* STEP VISUAL ICON ON MOBILE */}
              <div style={{ flex: 0.3, display: 'flex', justifyContent: 'center' }}>
                 <div style={{ width: mob ? 50 : 100, height: mob ? 50 : 100, borderRadius: 16, background: s.color + '10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: mob ? 24 : 48 }}>
                   {s.i}
                 </div>
              </div>

              {!mob && (
                <div style={{ flex: 1, width: '100%' }}>
                  <div className="roadmap-card" style={{ position: 'relative', padding: 2, borderRadius: 42, overflow: 'hidden', background: 'rgba(0,0,0,0.05)', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.1)' }}>
                    <div className="card-border" style={{ position: 'absolute', top: '50%', left: '50%', width: '200%', height: '300%', background: `conic-gradient(from 0deg, transparent, ${s.color}, transparent 50%)`, animation: 'spinBorder 4s linear infinite', transform: 'translate(-50%, -50%)', zIndex: 0 }} />
                    <div style={{ position: 'relative', zIndex: 1, background: '#fff', borderRadius: 40, padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
                      <div style={{ width: 100, height: 100, borderRadius: 32, background: s.color + '10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>{s.i}</div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 12, fontWeight: 800, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', marginBottom: 8 }}>Impact Area</p>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#111' }}>The {s.tag} Hub</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spinBorder {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes flagWave {
          0% { transform: translateX(-10%) skewX(5deg); }
          50% { transform: translateX(10%) skewX(-5deg); }
          100% { transform: translateX(-10%) skewX(5deg); }
        }
        .flag-wave-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
          background-size: 200% 100%;
          animation: flagWave 3s ease-in-out infinite;
          pointer-events: none;
        }
        .roadmap-card {
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .roadmap-card:hover {
          transform: scale(1.02) translateY(-10px);
        }
      `}</style>
    </section>
  );
}
