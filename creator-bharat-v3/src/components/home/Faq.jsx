import React from 'react';
import { T } from '../../theme';
import { W } from '../../utils/helpers';

export default function Faq({ mob }) {
  return (
    <section style={{ padding: mob ? '20px' : '20px 20px 80px 20px', background: '#fff' }}>
      <div style={W()}>
        
        {/* REVOLUTIONARY HEADING SECTION */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 20px', 
            background: 'rgba(239, 68, 68, 0.05)', borderRadius: 100, marginBottom: 24 
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
            <span style={{ fontSize: 11, fontWeight: 900, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '3px' }}>The Revolution</span>
          </div>
          
          <h2 style={{ 
            fontFamily: "'Fraunces', serif", 
            fontSize: mob ? 36 : 68, 
            fontWeight: 900, 
            color: '#111', 
            lineHeight: 1, 
            letterSpacing: '-0.04em'
          }}>
            The Industry is <span style={{ color: 'rgba(0,0,0,0.15)', textDecoration: 'line-through' }}>Broken.</span> <br />
            <span style={{ background: 'linear-gradient(90deg, #FF9431, #138808)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>We're Fixing it.</span>
          </h2>
        </div>

        {/* PROBLEM VS MISSION GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: 48, alignItems: 'stretch' }}>
          
          {/* THE PROBLEM */}
          <div style={{ 
            padding: 48, 
            borderRadius: 42, 
            background: '#F8FAFC', 
            border: '1.5px solid #111',
            position: 'relative',
            overflow: 'hidden'
          }}>
             <div style={{ fontSize: 13, fontWeight: 900, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 24 }}>The Industry Problem</div>
             <h3 style={{ fontSize: 32, fontWeight: 900, color: '#111', marginBottom: 24, lineHeight: 1.3 }}>Agencies taking 30% of your hard work.</h3>
             <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  'No proper portfolio (Messy screenshots aur links).',
                  'Agencies taking 30% of your hard-earned money.',
                  'Unprofessional communication via chaotic DMs.',
                  'Tier 2 & 3 talent being ignored by national brands.',
                  'Risk of payment delays and agency frauds.'
                ].map((p, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, fontSize: 16, color: 'rgba(0,0,0,0.5)', fontWeight: 600 }}>
                    <span style={{ color: '#EF4444' }}>✕</span> {p}
                  </li>
                ))}
             </ul>
             <div style={{ position: 'absolute', right: -20, bottom: -20, fontSize: 150, opacity: 0.02, fontWeight: 900 }}>STOP</div>
          </div>

          {/* THE MISSION */}
          <div style={{ 
            padding: 48, 
            borderRadius: 42, 
            background: '#111', 
            color: '#fff',
            border: '1.5px solid #111',
            position: 'relative',
            overflow: 'hidden'
          }}>
             <div style={{ fontSize: 13, fontWeight: 900, color: '#FF9431', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 24 }}>Our Core Mission</div>
             <h3 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 24, lineHeight: 1.3 }}>Empowering the Real Bharat Creator.</h3>
             <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  'Smart Media Kit (Your elite, verified portfolio).',
                  '0% Commission. Keep 100% of your earnings.',
                  'Formal dashboard for professional brand deals.',
                  'National spotlight for every local creator.',
                  'Direct and safe connections with real brands.'
                ].map((p, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, fontSize: 16, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                    <span style={{ color: '#10B981' }}>✓</span> {p}
                  </li>
                ))}
             </ul>
             <div style={{ position: 'absolute', right: -20, bottom: -20, fontSize: 150, opacity: 0.05, fontWeight: 900 }}>BHARAT</div>
          </div>

        </div>

        {/* BOTTOM TAGLINE */}
        <div style={{ textAlign: 'center', marginTop: 64 }}>
           <p style={{ fontSize: 20, fontWeight: 800, color: '#111', fontStyle: 'italic', fontFamily: "'Fraunces', serif" }}>
             "Hum middlemen ko nahi, talent ko ameer banana chahte hain."
           </p>
        </div>

      </div>
    </section>
  );
}
