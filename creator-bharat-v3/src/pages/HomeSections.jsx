import React, { useState, useEffect } from 'react';
import { T, W, ALL_STATES, apiCall } from '../theme';
import { Btn, SH } from '../components/Primitives';
import { CreatorCard } from '../components/Cards';

export function Typewriter({ words, interval = 2000 }) {
  const [idx, setIdx] = useState(0);
  const [sub, setSub] = useState('');
  const [del, setDel] = useState(false);

  useEffect(() => {
    const word = words[idx % words.length];
    const speed = del ? 50 : 100;
    const timeout = setTimeout(() => {
      if (!del && sub === word) {
        setTimeout(() => setDel(true), interval);
      } else if (del && sub === '') {
        setDel(false);
        setIdx(i => i + 1);
      } else {
        setSub(del ? word.substring(0, sub.length - 1) : word.substring(0, sub.length + 1));
      }
    }, speed);
    return () => clearTimeout(timeout);
  }, [sub, del, idx, words, interval]);

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span style={{ position: 'relative', zIndex: 2, background: 'linear-gradient(90deg, #FF9431, #DC2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{sub}</span>
      <span style={{ width: 3, height: '80%', background: '#FF9431', position: 'absolute', right: -6, top: '10%', animation: 'blink 1s infinite' }} />
      <svg style={{ position: 'absolute', bottom: -12, left: 0, width: '100%', height: 16, zIndex: 1, pointerEvents: 'none' }} viewBox="0 0 100 20" preserveAspectRatio="none">
        <path d="M2 15 Q 50 2 98 15" stroke="rgba(255, 148, 49, 0.4)" strokeWidth="8" strokeLinecap="round" fill="none" />
      </svg>
    </span>
  );
}

export function HeroSection({ mob, st, dsp, go }) {
  const [sugs, setSugs] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!st.cf.q || st.cf.q.length < 2) {
      setSugs([]);
      setShowSug(false);
      return;
    }
    const timer = setTimeout(() => {
      setIsSearching(true);
      apiCall(`/creators?q=${encodeURIComponent(st.cf.q)}&limit=4`)
        .then(d => {
          setSugs(d.creators || []);
          setShowSug(true);
          setIsSearching(false);
        })
        .catch(() => {
          setSugs([]);
          setIsSearching(false);
        });
    }, 300);
    return () => clearTimeout(timer);
  }, [st.cf.q]);

  return (
    <section style={{ background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: mob ? 160 : 200, paddingBottom: mob ? 80 : 120, position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
      {/* PREMIUM GRADIENT MESH BACKGROUND */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '70vw', height: '70vw', background: 'radial-gradient(circle, rgba(255,148,49,0.1) 0%, transparent 70%)', filter: 'blur(100px)', opacity: 0.6 }} />
        <div style={{ position: 'absolute', bottom: '0%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', filter: 'blur(100px)', opacity: 0.6 }} />
        <div style={{ position: 'absolute', top: '20%', right: '20%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, transparent 80%)', filter: 'blur(40px)', zIndex: 1 }} />
      </div>
      
      {/* GRID OVERLAY */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', opacity: 0.5 }} />

      <div style={{ ...W(), position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        
        {/* GLASSMORPHIC TRUST BADGE - LARGER ON DESKTOP */}
        <div className="au" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: mob ? '6px 16px' : '10px 28px', borderRadius: 100, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.8)', marginBottom: 40, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex' }}>
              {[
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
                'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80',
                'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&q=80'
              ].map((img, i) => (
                <img key={i} src={img} className="av-h" style={{ width: mob ? 30 : 36, height: mob ? 30 : 36, borderRadius: '50%', border: '2px solid #fff', marginLeft: i === 0 ? 0 : -12, objectFit: 'cover', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', transition: 'all 0.3s' }} alt="User" />
              ))}
            </div>
            <div style={{ marginLeft: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 1, alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: '#FF9431', fontSize: mob ? 10 : 12 }}>★</span>)}
                <span style={{ fontSize: mob ? 9 : 10, fontWeight: 900, color: '#10B981', marginLeft: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>Verified Elite</span>
              </div>
              <span style={{ fontSize: mob ? 13 : 15, fontWeight: 800, color: '#111', letterSpacing: '-0.01em' }}>Trusted by 50,000+ Creators</span>
            </div>
          </div>
          <div style={{ width: 1, height: 20, background: 'rgba(0,0,0,0.08)', margin: '0 12px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: '#10B981', width: 8, height: 8, borderRadius: '50%', animation: 'pulse-green 1.5s infinite' }} />
            <span style={{ fontSize: mob ? 10 : 11, fontWeight: 900, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Now</span>
          </div>
        </div>

        <h1 className="au d1" style={{ fontSize: mob ? 'clamp(36px,11vw,48px)' : 'clamp(76px,9vw,104px)', fontWeight: 900, color: '#111', lineHeight: 1.02, marginBottom: 32, letterSpacing: '-0.05em', maxWidth: 1200, wordBreak: 'keep-all' }}>
          Your Digital <Typewriter words={['Identity', 'Portfolio', 'Empire', 'Legacy']} /> <br />
          Built for <span style={{ background: 'linear-gradient(90deg, #FF9431, #128807)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', paddingRight: 15 }}>Bharat.</span>
        </h1>

        <p className="au d2" style={{ fontSize: mob ? 17 : 22, color: 'rgba(0,0,0,0.6)', lineHeight: 1.6, marginBottom: 48, fontWeight: 500, maxWidth: 720 }}>
          Launch your verified creator portfolio, showcase your social reach, and attract top brand deals directly. The all-in-one link for Indian creators.
        </p>

        <div className="au d3" style={{ display: 'flex', flexDirection: mob ? 'column' : 'row', gap: mob ? 14 : 16, marginBottom: 40, justifyContent: 'center', width: mob ? '100%' : 'auto' }}>
          <Btn lg full={mob} onClick={() => go('apply')} style={{ padding: '22px 48px', fontSize: 18, background: T.gd, color: '#fff', borderRadius: 100, fontWeight: 900, border: 'none', boxShadow: '0 12px 32px rgba(255,148,49,0.35)', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>🚀 Claim Your Link Free</span>
            <div style={{ position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', animation: 'shimmer 3s infinite', transform: 'skewX(-20deg)' }} />
          </Btn>
          <Btn lg variant="ghost" full={mob} onClick={() => dsp({ t: 'UI', v: { demoModal: true } })} style={{ padding: '20px 40px', fontSize: 17, background: 'rgba(0,0,0,0.03)', color: '#111', borderRadius: 100, fontWeight: 700, border: '1.5px solid rgba(0,0,0,0.08)', backdropFilter: 'blur(10px)', justifyContent: 'center', position: 'relative' }}>
            <span style={{ position: 'absolute', top: 12, left: 12, width: 8, height: 8, background: '#EF4444', borderRadius: '50%', animation: 'pulse-red 1.5s infinite' }} />
            👁️ View Live Demo
          </Btn>
        </div>

        <div className="au d3" style={{ 
          width: '100%', 
          maxWidth: 1200, 
          background: 'rgba(255,255,255,0.85)', 
          backdropFilter: 'blur(24px)', 
          WebkitBackdropFilter: 'blur(24px)', 
          borderRadius: mob ? 32 : 100, 
          padding: mob ? 12 : 8, 
          display: 'flex', 
          flexDirection: mob ? 'column' : 'row', 
          alignItems: mob ? 'stretch' : 'center',
          gap: 0, 
          boxShadow: '0 40px 120px -20px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(255,255,255,0.5)', 
          border: '1px solid rgba(0,0,0,0.05)', 
          marginBottom: mob ? 40 : 32, 
          position: 'relative', 
          zIndex: 10,
          minHeight: mob ? 'auto' : 84
        }}>
          {/* Input Section */}
          <div style={{ flex: 1, position: 'relative', padding: mob ? '16px 20px' : '0 40px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', borderRight: mob ? 'none' : '1px solid rgba(0,0,0,0.05)', borderBottom: mob ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
            <label style={{ fontSize: 9, fontWeight: 900, color: '#FF9431', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 4, opacity: 0.8 }}>Who are you looking for?</label>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 12 }}>
              <span style={{ fontSize: 20 }}>{isSearching ? <div className="spin" style={{width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#FF9431'}} /> : '🔍'}</span>
              <input 
                value={st.cf.q} 
                onChange={e => dsp({ t: 'CF', v: { q: e.target.value } })} 
                onFocus={() => { if(sugs.length > 0) setShowSug(true); }}
                onBlur={() => setTimeout(() => setShowSug(false), 200)}
                placeholder="Name, niche or city..." 
                style={{ width: '100%', border: 'none', background: 'none', fontSize: 18, outline: 'none', fontWeight: 700, color: '#111', letterSpacing: '-0.01em' }} 
              />
            </div>
            {/* Real-time suggestions dropdown */}
            {showSug && sugs.length > 0 && (
              <div className="si" style={{ position: 'absolute', top: '100%', left: 0, width: mob ? '100%' : 'calc(100% + 20px)', background: '#fff', borderRadius: 20, boxShadow: '0 20px 40px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.05)', zIndex: 100, padding: 8, marginTop: 8, textAlign: 'left' }}>
                {sugs.map(c => (
                  <div key={c.id} onClick={() => go('creator-profile', { creator: c })} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }} className="sug-item">
                    <img src={c.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&q=80'} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} alt={c.name} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 600 }}>{c.niche || 'Creator'} • {c.city || 'India'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* State Section */}
          <div style={{ flex: 1, position: 'relative', padding: mob ? '16px 20px' : '0 40px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <label style={{ fontSize: 9, fontWeight: 900, color: '#10B981', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 4, opacity: 0.8 }}>Location</label>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 12, position: 'relative' }}>
              <span style={{ fontSize: 20 }}>📍</span>
              <select 
                value={st.cf.state} 
                onChange={e => dsp({ t: 'CF', v: { state: e.target.value } })} 
                style={{ width: '100%', border: 'none', background: 'none', fontSize: 17, outline: 'none', appearance: 'none', cursor: 'pointer', fontWeight: 700, color: '#111', paddingRight: 32 }}
              >
                <option value="">All over India</option>
                {ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', fontSize: 12, opacity: 0.4, pointerEvents: 'none' }}>▼</span>
            </div>
          </div>

          {/* Search Button */}
          <div style={{ padding: 4, marginLeft: mob ? 0 : 'auto' }}>
            <Btn lg full={mob} onClick={() => go('creators')} style={{ borderRadius: 100, padding: mob ? '18px' : '18px 48px', fontSize: 18, background: '#111', color: '#fff', border: 'none', minWidth: mob ? '100%' : 160, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: '0 15px 30px rgba(0,0,0,0.2)' }}>
              <span style={{ fontWeight: 900 }}>Search</span>
              <span style={{ fontSize: 20, transition: 'transform 0.3s' }} className="lightning-icon">⚡</span>
            </Btn>
          </div>
        </div>

        {/* Trending Searches - Now scrollable on mobile */}
        <div className="au d3" style={{ display: 'flex', alignItems: 'center', gap: 12, overflowX: mob ? 'auto' : 'visible', whiteSpace: 'nowrap', padding: mob ? '0 20px' : 0, width: mob ? '100vw' : 'auto', justifyContent: mob ? 'flex-start' : 'center', marginBottom: 100, scrollbarWidth: 'none' }}>
          {!mob && <span style={{ fontSize: 12, fontWeight: 900, color: 'rgba(0,0,0,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Trending:</span>}
          {['Fashion', 'Tech', 'Travel', 'Lifestyle', 'Gaming', 'Food'].map(n => (
            <button key={n} onClick={() => dsp({ t: 'CF', v: { q: n } })} style={{ padding: '10px 22px', borderRadius: 100, background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', fontSize: 13, fontWeight: 700, color: 'rgba(0,0,0,0.5)', cursor: 'pointer', transition: 'all 0.3s', flexShrink: 0 }} className="tag-h">
              {n}
            </button>
          ))}
        </div>

        <div className="au d4" style={{ width: '100%', maxWidth: 1000, position: 'relative', display: 'flex', justifyContent: 'center', perspective: 1500, minHeight: mob ? 750 : 600 }}>
          <div style={{ position: 'relative', transform: 'rotateY(-10deg) rotateX(5deg)', transformStyle: 'preserve-3d' }}>
            <div style={{ width: 320, height: 660, background: '#fff', borderRadius: 48, border: '12px solid #F3F4F6', boxShadow: '0 40px 100px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(0,0,0,0.05)', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 5 }}>
              <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 100, height: 26, background: '#F3F4F6', borderRadius: 20, zIndex: 10 }} />
              <div style={{ flex: 1, background: '#FAFAFA', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                <div style={{ height: 150, background: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80) center/cover' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -50, position: 'relative', zIndex: 2 }}>
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" style={{ width: 100, height: 100, borderRadius: '50%', border: '4px solid #fff', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', objectFit: 'cover' }} alt="Creator" />
                  <div style={{ marginTop: -14, background: '#fff', color: '#10B981', fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 4px 10px rgba(16,185,129,0.15)' }}>✓ Verified Creator</div>
                </div>
                <div style={{ padding: '20px 24px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: 24, fontWeight: 900, color: '#111' }}>Rahul Sharma</h3>
                  <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)', marginBottom: 24, fontWeight: 500 }}>📍 Jaipur • Travel & Culture</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 16, padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#111' }}>248K</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>Followers</div>
                    </div>
                    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 16, padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#FF9431' }}>6.8%</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>Engagement</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto' }}>
                    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', padding: '16px', borderRadius: 16, fontSize: 14, fontWeight: 700, color: '#111', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>📸 View Instagram</div>
                    <div style={{ background: 'linear-gradient(90deg, #FF9431, #DC2626)', padding: '16px', borderRadius: 16, fontSize: 15, fontWeight: 800, color: '#fff', boxShadow: '0 8px 20px rgba(255,148,49,0.3)' }}>🤝 Book for ₹15,000</div>
                  </div>
                </div>
              </div>
            </div>
            {!mob && (
              <>
                <div className="au d5" style={{ position: 'absolute', top: 120, right: -120, background: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 20, padding: '16px 20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 16, zIndex: 10 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>✈️</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#111', marginBottom: 2 }}>MakeMyTrip</p>
                    <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(0,0,0,0.5)' }}>New campaign request</p>
                  </div>
                </div>
                <div className="au d5" style={{ position: 'absolute', bottom: 140, left: -100, background: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 20, padding: '16px 20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 16, zIndex: 10 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900 }}>✓</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#111', marginBottom: 2 }}>Profile Verified</p>
                    <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(0,0,0,0.5)' }}>creatorbharat.in/rahul</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function BrandTrustStrip() {
  return (
    <section style={{ padding: '60px 0', background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
      <div style={{ ...W(), textAlign: 'center', marginBottom: 40 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: T.t4, textTransform: 'uppercase', letterSpacing: '2px' }}>Empowering Creators for Global Brands</p>
      </div>
      <div className="logo-track-rich" style={{ display: 'flex', gap: 80, alignItems: 'center', whiteSpace: 'nowrap' }}>
        {[
          'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png',
          'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
          'https://upload.wikimedia.org/wikipedia/commons/b/b1/Hotstar_logo.svg',
          'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
          'https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png',
          'https://upload.wikimedia.org/wikipedia/commons/c/cd/MakeMyTrip_Logo.png',
          'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png',
          'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
          'https://upload.wikimedia.org/wikipedia/commons/b/b1/Hotstar_logo.svg',
          'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
          'https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png',
          'https://upload.wikimedia.org/wikipedia/commons/c/cd/MakeMyTrip_Logo.png'
        ].map((logo, i) => (
          <img key={i} src={logo} className="brand-logo-rich" alt="Partner" loading="lazy" />
        ))}
      </div>
    </section>
  );
}

export function FeaturesEcosystem({ mob }) {
  return (
    <section style={{ padding: mob ? '100px 20px' : '160px 20px', background: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '10%', right: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(255,148,49,0.05) 0%, transparent 70%)', filter: 'blur(100px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(18,136,7,0.05) 0%, transparent 70%)', filter: 'blur(100px)', pointerEvents: 'none' }} />

      <div style={W()}>
        <div style={{ maxWidth: 800, marginBottom: 100 }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: mob ? 42 : 72, fontWeight: 900, color: '#111', lineHeight: 1, letterSpacing: '-0.04em', marginBottom: 24 }}>Built for Bharat's <br /> <span style={{ background: T.gd, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Creative Revolution.</span></h2>
          <p style={{ fontSize: 22, color: T.t3, lineHeight: 1.6, fontWeight: 500 }}>We've replaced the messy WhatsApp groups and basic link-in-bios with a professional ecosystem that actually converts.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(12, 1fr)', gap: 40 }}>
          {/* FEATURE 1: THE SMART PORTFOLIO */}
          <div className="au feature-card-h" style={{ gridColumn: mob ? '1' : '1 / 7', background: '#FAFAFA', borderRadius: 48, padding: mob ? '40px' : '64px', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ marginBottom: 48 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#FF9431', textTransform: 'uppercase', marginBottom: 16 }}>01. Professionalism</div>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 900, color: '#111', marginBottom: 16 }}>Smart Media Kits</h3>
              <p style={{ fontSize: 17, color: T.t2, lineHeight: 1.6 }}>Automatic data syncing from all social platforms. No manual updates, ever.</p>
            </div>
            <div style={{ position: 'relative', flex: 1, minHeight: 300, background: '#fff', borderRadius: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.08)', padding: 24, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" style={{ width: 48, height: 48, borderRadius: '50%' }} alt="Priya Kapoor" loading="lazy" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>Priya Kapoor</div>
                  <div style={{ fontSize: 12, color: T.t4 }}>Lifestyle Creator • Delhi</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 16 }}>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>1.2M</div>
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.5 }}>IMPRESSIONS</div>
                </div>
                <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 16 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#10B981' }}>7.4%</div>
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.5 }}>ENGAGEMENT</div>
                </div>
              </div>
              <div style={{ marginTop: 20, height: 120, background: 'url(https://images.unsplash.com/photo-1511316761724-b1bbef4c7502?w=400) center/cover', borderRadius: 16 }} />
            </div>
          </div>

          {/* FEATURE 2: DIRECT DEALS */}
          <div className="au d1 feature-card-h" style={{ gridColumn: mob ? '1' : '7 / 13', background: '#111', borderRadius: 48, padding: mob ? '40px' : '64px', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'relative', zIndex: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#10B981', textTransform: 'uppercase', marginBottom: 16 }}>02. Monetization</div>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 16 }}>Direct Brand Deals</h3>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>Receive campaign requests directly in your dashboard. Zero commission.</p>
            </div>
            <div style={{ marginTop: 60, position: 'relative' }}>
              {[
                { b: 'Zomato', p: '₹25,000', i: '🍔' },
                { b: 'Nykaa', p: '₹45,000', i: '💄' }
              ].map((d, i) => (
                <div key={i} className="au" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: '20px 24px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, transform: i === 1 ? 'translateX(40px)' : 'none' }}>
                  <div style={{ fontSize: 24 }}>{d.i}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>{d.b} Collaboration</div>
                    <div style={{ fontSize: 12, opacity: 0.6 }}>New Campaign Offer</div>
                  </div>
                  <div style={{ fontWeight: 900, color: '#FF9431' }}>{d.p}</div>
                </div>
              ))}
            </div>
          </div>

          {/* FEATURE 3: ANALYTICS (WIDE) */}
          <div className="au d2 feature-card-h" style={{ gridColumn: '1 / -1', background: '#FAFAFA', borderRadius: 48, padding: mob ? '40px' : '64px', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: mob ? 'column' : 'row', gap: 60, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#7C3AED', textTransform: 'uppercase', marginBottom: 16 }}>03. Growth</div>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 900, color: '#111', marginBottom: 16 }}>Deep Growth Analytics</h3>
              <p style={{ fontSize: 17, color: T.t2, lineHeight: 1.6 }}>Track every metric that matters. From audience demographics to content performance, everything is under your control.</p>
              <Btn lg style={{ marginTop: 32, borderRadius: 100, padding: '16px 32px', background: '#111', color: '#fff', border: 'none' }}>Analyze My Reach</Btn>
            </div>
            <div style={{ flex: 1.5, background: '#fff', borderRadius: 32, padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.05)', position: 'relative', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 200, gap: 12 }}>
                {[40, 70, 45, 90, 65, 100, 80, 50, 95, 60, 110, 85].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: h + '%', background: i === 10 ? '#FF9431' : 'rgba(0,0,0,0.05)', borderRadius: '8px 8px 4px 4px', position: 'relative' }}>
                    {i === 10 && <div style={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', background: '#111', color: '#fff', padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 900 }}>+142%</div>}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24, display: 'flex', gap: 24, justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: T.t4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF9431' }} /> Impressions</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: T.t4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(0,0,0,0.05)' }} /> Reach</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function VerificationEngine({ mob }) {
  return (
    <section style={{ padding: mob ? '100px 20px' : '140px 20px', background: '#0A0A0A', textAlign: 'center', color: '#fff' }}>
      <div style={W(800)}>
        <div style={{ fontSize: 64, marginBottom: 32 }}>🛡️</div>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: mob ? 36 : 56, fontWeight: 900, marginBottom: 24 }}>The Badge of Authenticity</h2>
        <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 48 }}>Our AI-powered engine audits millions of data points to ensure your influence is real. Get verified and unlock premium brand partnerships.</p>
        <Btn lg style={{ borderRadius: 100, padding: '20px 48px', background: '#fff', color: '#111', fontWeight: 900, border: 'none' }}>Get Your Score →</Btn>
      </div>
    </section>
  );
}

export function FeaturedCreatorsSection({ mob, creators, go, loading }) {
  return (
    <section style={{ padding: mob ? '100px 20px' : '140px 20px', background: '#fff' }}>
      <div style={W()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 64, flexWrap: 'wrap', gap: 24 }}>
          <SH eyebrow="Elite Discovery" title="Featured Talent" sub="Meet the creators who are defining the new age of Bharat." mb={0} />
          <Btn variant="outline" onClick={() => go('creators')}>View All Creators →</Btn>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(3, 1fr)', gap: 32 }}>
          {loading 
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ height: 380, borderRadius: 24, background: '#F3F4F6', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', animation: 'shimmer 2s infinite' }} />
                </div>
              ))
            : creators.slice(0, 6).map(c => <CreatorCard key={c.id} creator={c} onView={() => go('creator-profile', { creator: c })} />)
          }
        </div>
      </div>
    </section>
  );
}

export function Testimonials({ mob }) {
  return (
    <section style={{ padding: mob ? '100px 20px' : '160px 20px', background: '#fff', overflow: 'hidden' }}>
      <div style={W()}>
        <SH eyebrow="Community" title="Success Stories" sub="Real results from creators across Jaipur, Mumbai & beyond." center />

        <div style={{ display: 'flex', gap: 32, overflowX: 'auto', padding: '20px 0', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {[
            { name: 'Arjun Mehta', niche: 'Tech & Gadgets', text: 'CreatorBharat helped me close my first ₹1L deal with a major tech brand. The verified badge actually works!', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
            { name: 'Sana Khan', niche: 'Fashion & Beauty', text: "I've tried many link-in-bios, but this is the first one that actually feels professional and attracts brands.", img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80' },
            { name: 'Vikram Singh', niche: 'Travel & Vlogs', text: 'The analytics are insane. I finally know exactly what my reach is worth. No more guessing rates!', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' }
          ].map((t, i) => (
            <div key={i} style={{ minWidth: mob ? 300 : 400, background: '#F9FAFB', borderRadius: 32, padding: 40, border: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <img src={t.img} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} alt={t.name} loading="lazy" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: '#FF9431', fontWeight: 700 }}>{t.niche}</div>
                </div>
              </div>
              <p style={{ fontSize: 16, color: T.t2, lineHeight: 1.6, fontStyle: 'italic' }}>"{t.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqSection({ mob }) {
  return (
    <section style={{ padding: mob ? '100px 20px' : '160px 20px', background: '#FAFAFA' }}>
      <div style={W(800)}>
        <SH eyebrow="Information" title="Frequently Asked Questions" sub="Got doubts? We've got answers for you." center />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 60 }}>
          {[
            { q: "Is CreatorBharat free for creators?", a: "Yes, our core features including the Smart Media Kit and Brand Discovery are free for all verified creators." },
            { q: "How do I get the Verified Badge?", a: "Once you connect your socials, our AI audits your engagement and authenticity. If you pass our quality score, you get the badge automatically." },
            { q: "Do you take commission from brand deals?", a: "No, we believe in a transparent ecosystem. You negotiate and receive payments directly from brands. Zero commission." },
            { q: "Can brands see my private contact info?", a: "Only verified brands with a professional account can send you inquiry requests. Your data is always secure." }
          ].map((f, i) => (
            <details key={i} style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,0.05)', padding: '24px', cursor: 'pointer' }}>
              <summary style={{ fontWeight: 800, fontSize: 18, color: '#111', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {f.q}
                <span style={{ fontSize: 20, color: '#FF9431' }}>+</span>
              </summary>
              <p style={{ marginTop: 16, fontSize: 16, color: T.t2, lineHeight: 1.6 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta({ mob, go }) {
  return (
    <section style={{ padding: mob ? '80px 20px' : '140px 20px', background: '#111', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(255,148,49,0.15) 0%, transparent 70%)', zIndex: 0 }} />
      <div style={{ ...W(800), position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: mob ? 40 : 64, fontWeight: 900, color: '#fff', marginBottom: 24, lineHeight: 1.1 }}>Ab Rukna Nahi Hai.</h2>
        <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)', marginBottom: 48 }}>Join 50,000+ creators building Bharat's next-gen digital economy.</p>
        <div style={{ display: 'flex', flexDirection: mob ? 'column' : 'row', gap: 16, justifyContent: 'center' }}>
          <Btn lg style={{ padding: '20px 48px', fontSize: 18, background: T.gd, color: '#fff', borderRadius: 100, fontWeight: 900, border: 'none' }} onClick={() => go('apply')}>Launch Your Portfolio Free</Btn>
          <Btn lg variant="outline" style={{ padding: '20px 48px', fontSize: 18, color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 100 }} onClick={() => go('creators')}>Explore Creators</Btn>
        </div>
      </div>
    </section>
  );
}
