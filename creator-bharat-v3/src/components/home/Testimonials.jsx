import React, { useState } from 'react';
import { T } from '../../theme';
import { W } from '../../utils/helpers';

export default function Testimonials({ mob }) {
  const [activeTab, setActiveTab] = useState('creator');

  const creatorSteps = [
    { title: 'Verified Identity', sub: 'Get a premium verified portfolio page that stands out to global brands.', icon: '🛡️', color: '#FF9431' },
    { title: 'National Spotlight', sub: 'Be featured in our exclusive podcasts and articles for maximum reach.', icon: '🎙️', color: '#138808' },
    { title: 'Direct Earnings', sub: 'Collaborate directly with brands and keep 100% of your earnings.', icon: '💰', color: '#3B82F6' }
  ];

  const brandSteps = [
    { title: 'Smart Discovery', sub: 'Find creators using AI-powered filters for niche, location, and reach.', icon: '🔍', color: '#FF9431' },
    { title: 'Direct Access', sub: 'Skip agencies. Connect directly with verified creators for faster deals.', icon: '📩', color: '#138808' },
    { title: 'Campaign Impact', sub: 'Drive real results with our network of authentic and verified talent.', icon: '✅', color: '#3B82F6' }
  ];

  const steps = activeTab === 'creator' ? creatorSteps : brandSteps;

  return (
    <section style={{ padding: mob ? '40px 20px' : '40px 20px 100px 20px', background: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div style={W()}>

        {/* ELITE HEADING SECTION */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 20px',
            background: 'rgba(0,0,0,0.03)', borderRadius: 100, marginBottom: 24
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF9431' }} />
            <span style={{ fontSize: 11, fontWeight: 900, color: '#111', textTransform: 'uppercase', letterSpacing: '2.5px' }}>Platform Blueprint</span>
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
            The Ecosystem of <span style={{ background: 'linear-gradient(90deg, #FF9431, #138808)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Growth.</span>
          </h2>

          <p style={{ fontSize: 18, fontWeight: 600, color: 'rgba(0,0,0,0.4)', maxWidth: 600, margin: '0 auto' }}>
            Everything you need to {activeTab === 'creator' ? 'build, spotlight, and monetize' : 'discover, connect, and scale with'} your vision.
          </p>
        </div>

        {/* ELITE SLIDING TOGGLE CONTAINER */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{
            display: 'inline-flex',
            background: '#F8FAFC',
            padding: 4,
            borderRadius: 100,
            border: '1.5px solid #111',
            position: 'relative'
          }}>
            <button
              onClick={() => setActiveTab('creator')}
              style={{
                padding: '14px 36px',
                borderRadius: 100,
                border: 'none',
                background: activeTab === 'creator' ? '#111' : 'transparent',
                color: activeTab === 'creator' ? '#fff' : '#64748b',
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer',
                transition: 'all 0.4s',
                position: 'relative',
                zIndex: 2
              }}
            >
              For Creators
            </button>
            <button
              onClick={() => setActiveTab('brand')}
              style={{
                padding: '14px 36px',
                borderRadius: 100,
                border: 'none',
                background: activeTab === 'brand' ? '#111' : 'transparent',
                color: activeTab === 'brand' ? '#fff' : '#64748b',
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer',
                transition: 'all 0.4s',
                position: 'relative',
                zIndex: 2
              }}
            >
              For Brands
            </button>
          </div>
        </div>

        {/* STEPS GRID: CAROUSEL ON MOBILE */}
        <div style={{
          display: 'flex',
          flexDirection: mob ? 'row' : 'row', // ALWAYS ROW
          flexWrap: mob ? 'nowrap' : 'wrap', // NO WRAP ON MOBILE
          overflowX: mob ? 'auto' : 'visible', // SCROLL ON MOBILE
          gap: mob ? 20 : 32,
          paddingBottom: mob ? 24 : 0,
          scrollSnapType: mob ? 'x mandatory' : 'none',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          justifyContent: mob ? 'flex-start' : 'center'
        }}>
          {steps.map((s, i) => (
            <div key={activeTab + i} className="how-card au" style={{
              flex: mob ? '0 0 280px' : '1 1 300px', // FIXED WIDTH ON MOBILE
              maxWidth: mob ? '280px' : '380px',
              padding: mob ? '32px 24px' : '52px 40px',
              background: '#fff',
              borderRadius: 32,
              border: '1.5px solid rgba(0,0,0,0.1)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.04)',
              position: 'relative',
              transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              animation: 'slideUp 0.6s ease forwards',
              scrollSnapAlign: 'center',
            }}>
              <div style={{
                position: 'absolute', top: 24, right: 24, fontSize: 32, fontWeight: 900,
                color: 'rgba(0,0,0,0.03)', fontFamily: 'serif', fontStyle: 'italic'
              }}>
                0{i + 1}
              </div>

              <div style={{
                width: 54, height: 54, borderRadius: 16, background: s.color + '15',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, marginBottom: 24
              }}>
                {s.icon}
              </div>

              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#111', marginBottom: 12 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.5)', lineHeight: 1.6, fontWeight: 600 }}>{s.sub}</p>

              <div style={{ width: 32, height: 4, background: s.color, marginTop: 24, borderRadius: 10 }} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .how-card:hover {
          transform: translateY(-12px) scale(1.02);
          border-color: #111;
          box-shadow: 0 40px 80px rgba(0,0,0,0.08);
        }
      `}</style>
    </section>
  );
}
