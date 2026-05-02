import React from 'react';
import { W, LS } from '../../theme';

export default function FeaturedCreators({ mob, creators, go, loading }) {
  // Premium & Verified Portrait Fallbacks with specific tags
  const mockCreators = [
    { id: 'm1', name: 'Rahul Sharma', city: 'Jaipur', tag: 'Trending', profile_pic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
    { id: 'm2', name: 'Priya Mehta', city: 'Indore', tag: 'Top 1%', profile_pic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' },
    { id: 'm3', name: 'Amit Gupta', city: 'Lucknow', tag: 'Expert', profile_pic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
    { id: 'm4', name: 'Neha Singh', city: 'Surat', tag: 'Verified', profile_pic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80' },
    { id: 'm5', name: 'Vikram Rajput', city: 'Bhopal', tag: 'New Star', profile_pic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80' },
  ];

  const localData = LS.get('cb_creators', []);
  const realList = (creators && creators.length > 0) ? creators : (localData.length > 0 ? localData : []);
  const finalCreators = realList.length > 0 ? realList : mockCreators;

  return (
    <section style={{ padding: '0 0 60px 0', background: '#fff', position: 'relative', zIndex: 100 }}>
      <div style={{ ...W(), maxWidth: 1100, boxSizing: 'border-box' }}>
        
        {/* ULTRA-ELITE TALENT CAPSULE */}
        <div style={{ 
          position: 'relative', 
          padding: mob ? '12px 16px' : '14px 48px', 
          background: 'rgba(255,255,255,0.98)', 
          backdropFilter: 'blur(40px)',
          borderRadius: 100, 
          border: '1.5px solid #111',
          boxShadow: '0 20px 50px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: mob ? 20 : 40,
          overflow: 'hidden',
          width: '100%',
          boxSizing: 'border-box'
        }}>

           {/* HEADER WITH LIVE INDICATOR */}
           <div style={{ position: 'relative', zIndex: 10, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 16 }}>
              <h2 style={{ fontSize: mob ? 11 : 14, fontWeight: 900, color: '#111', textTransform: 'uppercase', letterSpacing: '3px' }}>
                <span style={{ color: '#FF9431' }}>Elite</span> <span>Spotlight</span>
              </h2>
              <div style={{ width: 1, height: 24, background: 'rgba(0,0,0,0.1)' }} />
              {!mob && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'pulse-green 1.5s infinite' }} />
                  <span style={{ fontSize: 9, fontWeight: 900, color: '#10B981', textTransform: 'uppercase' }}>52 Active</span>
                </div>
              )}
           </div>

           {/* INTERACTIVE SMOOTH MARQUEE */}
           <div className="elite-mq-container" style={{ flex: 1, overflow: 'hidden', position: 'relative', zIndex: 10, height: 64, display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none', background: 'linear-gradient(90deg, #fff 0%, transparent 10%, transparent 90%, #fff 100%)' }} />
              
              <div className="elite-mq-content" style={{ display: 'flex', width: 'max-content', gap: 48, animation: 'mq-move 30s linear infinite', position: 'relative', zIndex: 1 }}>
                {[...finalCreators, ...finalCreators, ...finalCreators].map((c, i) => (
                  <div 
                    key={i} 
                    onClick={() => go('creator-profile', { creator: c })}
                    className="elite-item"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 14, 
                      cursor: 'pointer', 
                      padding: '8px 16px',
                      borderRadius: 100,
                      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      position: 'relative'
                    }}
                  >
                     <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', border: '2.5px solid #fff', boxShadow: '0 4px 15px rgba(0,0,0,0.12)', background: '#F8FAFC' }}>
                        <img 
                          src={c.profile_pic || c.i || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.id || i}`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          alt="" 
                          onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${c.name || 'CB'}` }}
                        />
                     </div>
                     <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: '#111', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {c.name || c.n}
                          {c.tag && <span style={{ fontSize: 8, fontWeight: 900, background: '#138808', color: '#fff', padding: '2px 6px', borderRadius: 100 }}>{c.tag}</span>}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>{c.city || c.c || 'Bharat'}</div>
                     </div>
                  </div>
                ))}
              </div>
           </div>

           {!mob && <div style={{ position: 'relative', zIndex: 10 }}>
              <button onClick={() => go('creators')} style={{ fontSize: 11, fontWeight: 900, color: '#fff', background: '#111', padding: '10px 24px', borderRadius: 100, border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', transition: 'all 0.3s' }} onMouseOver={e => e.target.style.transform = 'scale(1.05)'} onMouseOut={e => e.target.style.transform = 'scale(1)'}>Browse Discovery</button>
           </div>}
        </div>

      </div>

      <style>{`
        @keyframes mq-move {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        @keyframes spinBorder {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-green {
          0% { transform: scale(1); opacity: 1; }
          70% { transform: scale(2); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        .elite-mq-container:hover .elite-mq-content {
          animation-play-state: paused !important;
        }
        .elite-item:hover {
          background: rgba(0,0,0,0.03);
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 10px 30px rgba(0,0,0,0.04);
        }
      `}</style>
    </section>
  );
}
