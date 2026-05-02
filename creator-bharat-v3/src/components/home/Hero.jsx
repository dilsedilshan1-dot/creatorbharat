import React, { useState, useEffect } from 'react';
import { T, W, ALL_STATES, apiCall, fmt, LS } from '../../theme';
import { Btn } from '../Primitives';

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

export default function Hero({ mob, st, dsp, go }) {
  const [sugs, setSugs] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [showStateSug, setShowStateSug] = useState(false);

  const trending = ['Fashion', 'Tech', 'Travel', 'Lifestyle', 'Gaming', 'Food'];

  useEffect(() => {
    if (!st.cf.q && !st.cf.state) {
      setSugs([]);
      setShowSug(false);
      setActiveIdx(-1);
      return;
    }
    
    const query = st.cf.q || '';
    if (query.length < 1 && !st.cf.state) {
      setSugs([]);
      setShowSug(false);
      setActiveIdx(-1);
      return;
    }

    const localList = LS.get('cb_creators', []);
    const filteredLocal = localList.filter(c => {
      const q = query.toLowerCase();
      const matchesQuery = !q || 
        (c.name || '').toLowerCase().includes(q) || 
        (c.niche || '').toLowerCase().includes(q) || 
        (c.city || '').toLowerCase().includes(q) ||
        (c.state || '').toLowerCase().includes(q);
      const matchesState = !st.cf.state || c.state === st.cf.state;
      return matchesQuery && matchesState;
    });

    if (filteredLocal.length > 0) {
      setSugs(filteredLocal.slice(0, 6));
      setShowSug(true);
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      const url = `/creators?q=${encodeURIComponent(query)}&state=${encodeURIComponent(st.cf.state || '')}&limit=10`;
      apiCall(url).then(d => {
        const apiList = d.creators || (Array.isArray(d) ? d : []);
        const merged = [...apiList];
        filteredLocal.forEach(lc => { if (!merged.find(ac => ac.id === lc.id)) merged.push(lc); });
        setSugs(merged.slice(0, 6));
        setShowSug(true);
        setIsSearching(false);
      }).catch(() => setIsSearching(false));
    }, 300);
    
    return () => clearTimeout(timer);
  }, [st.cf.q, st.cf.state]);

  const handleKeyDown = (e) => {
    if (showSug) {
      const isTrending = !st.cf.q;
      const maxIdx = isTrending ? trending.length - 1 : sugs.length;
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(prev => (prev < maxIdx ? prev + 1 : prev)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(prev => (prev > 0 ? prev - 1 : -1)); }
      else if (e.key === 'Enter') {
        if (isTrending) { if (activeIdx >= 0) dsp({ t: 'GO', p: 'creators', sel: { q: trending[activeIdx] } }); }
        else {
          if (activeIdx >= 0 && activeIdx < sugs.length) go('creator-profile', { creator: sugs[activeIdx] });
          else if (activeIdx === sugs.length || activeIdx === -1) go('creators');
          setShowSug(false);
        }
      } else if (e.key === 'Escape') setShowSug(false);
    }
  };

  return (
    <section style={{ background: '#fff', minHeight: mob ? 'auto' : '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: mob ? 24 : 80, paddingBottom: 40, position: 'relative', overflow: 'visible', textAlign: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '70vw', height: '70vw', background: 'radial-gradient(circle, rgba(255,148,49,0.1) 0%, transparent 70%)', filter: 'blur(100px)', opacity: 0.6 }} />
        <div style={{ position: 'absolute', bottom: '0%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', filter: 'blur(100px)', opacity: 0.6 }} />
      </div>
      
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', opacity: 0.5 }} />

      <div style={{ ...W(), position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Elite Creator Badge */}
        <div className="au" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: mob ? '8px 16px' : '12px 32px', borderRadius: 100, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', marginBottom: 40, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', position: 'relative', maxWidth: '90vw' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: '#FF9431', color: '#fff', padding: '4px 10px', borderRadius: 100, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>New</div>
            <span style={{ fontSize: mob ? 11 : 13, fontWeight: 800, color: '#111', letterSpacing: '0.2px' }}>India's First Unified Creator Support & Identity System</span>
            <div style={{ width: 1, height: 16, background: 'rgba(0,0,0,0.1)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'pulse-green 1.5s infinite' }} />
              <span style={{ fontSize: 10, fontWeight: 900, color: '#10B981', textTransform: 'uppercase' }}>Live Now</span>
            </div>
          </div>
        </div>

        <h1 className="au d1" style={{ fontSize: mob ? 'clamp(28px,9vw,36px)' : 'clamp(76px,9vw,104px)', fontWeight: 900, color: '#111', lineHeight: mob ? 1.15 : 1.02, marginBottom: mob ? 20 : 32, letterSpacing: '-0.05em', maxWidth: '100%', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
          Your Digital <Typewriter words={['Identity', 'Portfolio', 'Empire', 'Legacy']} /> <br />
          Built for <span style={{ background: 'linear-gradient(90deg, #FF9431, #128807)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', paddingRight: mob ? 5 : 15 }}>Bharat.</span>
        </h1>

        <p className="au d2" style={{ fontSize: mob ? 15 : 22, color: 'rgba(0,0,0,0.6)', lineHeight: 1.6, marginBottom: mob ? 32 : 48, fontWeight: 500, maxWidth: 720 }}>
          The all-in-one platform where Tier 2 & Tier 3 creators get the support, identity, and growth they deserve. Your journey from local to national starts here.
        </p>

        <div className="au d3" style={{ display: 'flex', flexDirection: mob ? 'column' : 'row', gap: mob ? 14 : 16, marginBottom: 48, justifyContent: 'center', width: mob ? '100%' : 'auto' }}>
          <Btn lg full={mob} onClick={() => go('apply')} style={{ padding: '22px 48px', fontSize: 18, background: T.gd, color: '#fff', borderRadius: 100, fontWeight: 900, border: 'none', boxShadow: '0 12px 32px rgba(255,148,49,0.35)', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>🚀 Claim Your Link Free</span>
            <div style={{ position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', animation: 'shimmer 3s infinite', transform: 'skewX(-20deg)' }} />
          </Btn>
          <Btn lg variant="ghost" full={mob} onClick={() => dsp({ t: 'UI', v: { demoModal: true } })} style={{ padding: '20px 40px', fontSize: 17, background: 'rgba(0,0,0,0.03)', color: '#111', borderRadius: 100, fontWeight: 700, border: '1.5px solid rgba(0,0,0,0.08)', backdropFilter: 'blur(10px)', justifyContent: 'center', position: 'relative' }}>
            <span style={{ position: 'absolute', top: 12, left: 12, width: 8, height: 8, background: '#EF4444', borderRadius: '50%', animation: 'pulse-red 1.5s infinite' }} />
            👁️ View Live Demo
          </Btn>
        </div>

        {/* SEARCH BAR WITH EXACT NAVBAR BORDER */}
        <div className="au d3" style={{ 
          width: '100%', 
          maxWidth: 1000, 
          padding: 2, 
          borderRadius: mob ? 34 : 102,
          position: 'relative',
          overflow: 'hidden',
          background: 'rgba(0,0,0,0.05)',
          marginBottom: 80,
          zIndex: 100,
          boxShadow: '0 40px 120px -20px rgba(0,0,0,0.12)',
          boxSizing: 'border-box'
        }}>
          {/* THE MOVING LINE ANIMATION (EXACT NAVBAR MATCH) */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: mob ? '120%' : '200%',
            height: mob ? '300%' : '500%',
            background: 'conic-gradient(from 0deg, #138808 0%, #FFFFFF 20%, #FF9933 40%, #FF9933 60%, #FFFFFF 80%, #138808 100%)',
            animation: 'spinBorder 5s linear infinite',
            transform: 'translate(-50%, -50%)',
            zIndex: 0
          }} />

          {/* INNER SEARCH BAR CONTENT */}
          <div style={{ 
            width: '100%', 
            background: 'rgba(255,255,255,0.98)', 
            backdropFilter: 'blur(24px)', 
            borderRadius: mob ? 32 : 100, 
            padding: mob ? 8 : 8, 
            display: 'flex', 
            flexDirection: mob ? 'column' : 'row', 
            alignItems: mob ? 'stretch' : 'center',
            gap: mob ? 8 : 0, 
            position: 'relative', 
            zIndex: 1,
            minHeight: mob ? 'auto' : 84
          }}>
            <div style={{ flex: 1.2, position: 'relative', padding: mob ? '12px 16px' : '0 40px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', borderRight: mob ? 'none' : '1px solid rgba(0,0,0,0.05)', borderBottom: mob ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
              <label style={{ fontSize: 9, fontWeight: 900, color: '#FF9431', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 4, opacity: 0.8 }}>Who are you looking for?</label>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 12 }}>
                <input value={st.cf.q} onChange={e => dsp({ t: 'CF', v: { q: e.target.value } })} placeholder="Name, niche or city..." style={{ width: '100%', border: 'none', background: 'none', fontSize: 18, outline: 'none', fontWeight: 700, color: '#111' }} />
              </div>
            </div>
            <div style={{ flex: 0.8, padding: mob ? '12px 16px' : '0 40px', textAlign: 'left', width: '100%' }}>
              <label style={{ fontSize: 9, fontWeight: 900, color: '#10B981', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 4, opacity: 0.8 }}>Location</label>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#111' }}>{st.cf.state || 'All over India'}</div>
            </div>
            <div style={{ padding: 4, width: mob ? '100%' : 'auto' }}>
              <Btn lg full={mob} onClick={() => go('creators')} style={{ borderRadius: 100, padding: '18px 48px', background: '#111', color: '#fff', border: 'none', fontWeight: 900 }}>Search Now ⚡</Btn>
            </div>
          </div>
        </div>

        {/* CREATOR SUPPORT SYSTEM GRID */}
        <div className="au d4" style={{ width: '100%', maxWidth: 1200, display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(3, 1fr)', gap: 24, padding: mob ? '0 16px' : 0, boxSizing: 'border-box' }}>
           {[
             { t: 'Digital Identity', h: 'Pro Portfolio', d: 'Aapki verified identity jo brands ko impress karegi. Ek hi link mein saara kaam.', i: '👤', bg: '#FDF7F2' },
             { t: 'Learning Hub', h: 'Insights & Articles', d: 'Naya seekho aur grow karo. Industry experts ke articles aur deep analytics.', i: '📖', bg: '#F0FDF4' },
             { t: 'Content Collab', h: 'Podcast Spotlight', d: 'Hamare sath podcast pe aaiye. Hum local creators ki story national level tak le jayenge.', i: '🎙️', bg: '#EFF6FF' },
             { t: 'Regional First', h: 'Tier 2 & 3 Support', d: 'Jaipur ho ya Jodhpur—har shehar ke creator ko support aur pehchan milegi.', i: '📍', bg: '#F5F3FF' },
             { t: 'Ecosystem', h: 'The Full Support', d: 'Community, growth aur opportunities—sab kuch jo ek creator ko chahiye.', i: '⚡', bg: '#FEF2F2' },
             { t: 'Join the Revolution', h: 'Free Forever', d: 'Apni journey aaj hi shuru karein. Zero cost, zero commission, 100% freedom.', i: '🚀', bg: '#FFFBEB' }
           ].map((p, i) => (
             <div key={i} className="card-animated-border" style={{ position: 'relative', borderRadius: 34, padding: 2, overflow: 'hidden', transition: 'all 0.3s', height: '100%' }}>
                {/* THE MOVING BORDER (ALWAYS VISIBLE & FULL PERIMETER) */}
                <div className="border-line" style={{
                  position: 'absolute', top: '50%', left: '50%', width: mob ? '120%' : '200%', height: mob ? '120%' : '200%',
                  background: 'conic-gradient(from 0deg, transparent, #138808, #FFFFFF, #FF9933, transparent 50%, #138808, #FFFFFF, #FF9933, transparent)',
                  animation: 'spinBorder 5s linear infinite',
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.6, transition: 'opacity 0.3s', zIndex: 0
                }} />
                
                {/* INNER CONTENT */}
                <div style={{ background: p.bg, padding: '32px', borderRadius: 32, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12, border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', position: 'relative', zIndex: 1, height: '100%' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }}>{p.i}</div>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 900, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>{p.t}</span>
                    <h3 style={{ fontSize: 20, fontWeight: 900, color: '#111', marginTop: 4, marginBottom: 8 }}>{p.h}</h3>
                    <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)', lineHeight: 1.5, fontWeight: 500 }}>{p.d}</p>
                  </div>
                </div>
             </div>
           ))}
        </div>

        <style>{`
          @keyframes spinBorder {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(360deg); }
          }
          .card-animated-border:hover .border-line {
            opacity: 1;
            animation-duration: 3s;
          }
          .card-animated-border:hover {
            transform: translateY(-8px);
            box-shadow: 0 24px 60px rgba(0,0,0,0.1);
          }
        `}</style>

      </div>
    </section>
  );
}
