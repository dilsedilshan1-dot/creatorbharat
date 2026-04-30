import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import { T, W, scrollToTop, apiCall, fmt, ALL_STATES } from '../theme';
import { Btn, SH, Logo } from '../components/Primitives';
import { CreatorCard } from '../components/Cards';

export default function HomePage() {
  const { st, dsp } = useApp();
  const [mob, setMob] = useState(window.innerWidth < 768);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const h = () => setMob(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  useEffect(() => {
    setLoading(true);
    apiCall('/creators?limit=10').then(d => {
      setCreators(d.creators || d || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const go = (p, sel) => { dsp({ t: 'GO', p, sel }); scrollToTop(); };
  const featured = creators.filter(c => c.featured).slice(0, 6);

  return (
    <div style={{ background: '#fff' }}>
      {/* HERO SECTION */}
      <section style={{ background: '#FAFAFA', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: mob ? 140 : 180, paddingBottom: mob ? 80 : 120, position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '100vw', height: '70vh', background: 'radial-gradient(ellipse at top, rgba(255, 148, 49, 0.12), transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' }} />
        
        <div style={{ ...W(), position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div className="au" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderRadius: 100, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', marginBottom: 32, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}>
            <div style={{ background: '#10B981', color: '#fff', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>✓</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Trusted by 50,000+ Creators</span>
          </div>

          <h1 className="au d1" style={{ fontSize: mob ? 'clamp(44px,12vw,56px)' : 'clamp(64px,8vw,88px)', fontWeight: 900, color: '#111', lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.04em', maxWidth: 1000 }}>
            Your Digital <Typewriter words={['Identity', 'Portfolio', 'Brand', 'Growth']} /> <br />
            Built in Minutes.
          </h1>

          <p className="au d2" style={{ fontSize: mob ? 17 : 22, color: 'rgba(0,0,0,0.6)', lineHeight: 1.6, marginBottom: 48, fontWeight: 500, maxWidth: 720 }}>
            Launch your verified creator portfolio, showcase your social reach, and attract top brand deals directly. The all-in-one link for Indian creators.
          </p>

          <div className="au d3" style={{ display: 'flex', flexDirection: mob ? 'column' : 'row', gap: mob ? 14 : 16, marginBottom: 40, justifyContent: 'center', width: mob ? '100%' : 'auto' }}>
            <Btn lg full={mob} onClick={() => go('apply')} style={{ padding: '22px 48px', fontSize: 18, background: T.gd, color: '#fff', borderRadius: 100, fontWeight: 900, border: 'none', boxShadow: '0 12px 32px rgba(255,148,49,0.35)', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>🚀 Claim Your Link Free</span>
              <div style={{ position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', animation: 'shimmer 3s infinite', transform: 'skewX(-20deg)' }} />
            </Btn>
            <Btn lg variant="ghost" full={mob} style={{ padding: '20px 40px', fontSize: 17, background: 'rgba(0,0,0,0.03)', color: '#111', borderRadius: 100, fontWeight: 700, border: '1.5px solid rgba(0,0,0,0.08)', backdropFilter: 'blur(10px)', justifyContent: 'center' }}>
              👁️ View Live Demo
            </Btn>
          </div>

          <style>{`
            @keyframes shimmer {
              0% { left: -100%; }
              50%, 100% { left: 200%; }
            }
            @keyframes blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
            }
          `}</style>

          <div className="au d3" style={{ width: '100%', maxWidth: 800, background: '#fff', borderRadius: mob ? 28 : 100, padding: mob ? 12 : 8, display: 'flex', flexDirection: mob ? 'column' : 'row', gap: 8, boxShadow: '0 20px 50px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)', marginBottom: mob ? 80 : 100 }}>
            <div style={{ flex: 1, position: 'relative', borderRight: mob ? 'none' : '1px solid #F3F4F6', borderBottom: mob ? '1px solid #F3F4F6' : 'none' }}>
              <span style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', fontSize: 18, opacity: .5 }}>🔍</span>
              <input value={st.cf.q} onChange={e => dsp({ t: 'CF', v: { q: e.target.value } })} placeholder="Name or Niche..." style={{ width: '100%', padding: '18px 20px 18px 52px', border: 'none', background: 'none', fontSize: 16, outline: 'none', fontWeight: 500 }} />
            </div>
            <div style={{ width: mob ? '100%' : 200, position: 'relative', borderRight: mob ? 'none' : '1px solid #F3F4F6', borderBottom: mob ? '1px solid #F3F4F6' : 'none' }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, opacity: .5 }}>📍</span>
              <select value={st.cf.state} onChange={e => dsp({ t: 'CF', v: { state: e.target.value } })} style={{ width: '100%', padding: '18px 36px 18px 44px', border: 'none', background: 'none', fontSize: 15, outline: 'none', appearance: 'none', cursor: 'pointer', fontWeight: 500, color: '#111' }}>
                <option value="">All States</option>
                {ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 10, opacity: .4, pointerEvents: 'none' }}>▼</span>
            </div>
            <Btn lg full={mob} onClick={() => go('creators')} style={{ borderRadius: 100, padding: '16px 40px', fontSize: 16, background: '#111', color: '#fff', border: 'none', minWidth: 140 }}>Search</Btn>
          </div>

          <div className="au d4" style={{ width: '100%', maxWidth: 1000, position: 'relative', display: 'flex', justifyContent: 'center', perspective: 1500, minHeight: 600 }}>
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

      {/* FEATURED CREATORS */}
      <section style={{ padding: mob ? '64px 20px' : '100px 20px', background: '#fff' }}>
        <div style={W()}>
          <SH eyebrow="Discover" title="Featured Creators" sub="This week's top picks from Jaipur & beyond." mb={48} />
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(3, 1fr)', gap: 24 }}>
            {creators.slice(0, 6).map(c => <CreatorCard key={c.id} creator={c} onView={() => go('creator-profile', { creator: c })} />)}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{ padding: mob ? '80px 20px' : '120px 20px', background: T.gd, position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ ...W(800), position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: mob ? 32 : 48, fontWeight: 900, color: '#fff', marginBottom: 20 }}>Teri Pehchaan Ka Waqt Aa Gaya</h2>
          <p style={{ fontSize: 18, color: '#fff', opacity: 0.9, marginBottom: 48 }}>Join the 2,400+ creators building the future of Bharat's creator economy.</p>
          <Btn lg variant="white" onClick={() => go('apply')}>Get Started Now</Btn>
        </div>
      </section>
    </div>
  );
}

function Typewriter({ words, interval = 2000 }) {
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
      {/* Dynamic Pro Underline */}
      <svg style={{ position: 'absolute', bottom: -12, left: 0, width: '100%', height: 16, zIndex: 1, pointerEvents: 'none' }} viewBox="0 0 100 20" preserveAspectRatio="none">
        <path d="M2 15 Q 50 2 98 15" stroke="rgba(255, 148, 49, 0.4)" strokeWidth="8" strokeLinecap="round" fill="none" />
      </svg>
    </span>
  );
}
