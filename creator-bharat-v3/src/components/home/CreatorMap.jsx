import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Users, Zap, MapPin } from 'lucide-react';

const TIER_COLORS = {
  1: { dot: '#1e3a8a', light: 'rgba(30, 58, 138, 0.1)', glow: 'rgba(30, 58, 138, 0.4)' },
  2: { dot: '#2563eb', light: 'rgba(37, 99, 235, 0.1)', glow: 'rgba(37, 99, 235, 0.4)' },
  3: { dot: '#60a5fa', light: 'rgba(96, 165, 250, 0.1)', glow: 'rgba(96, 165, 250, 0.4)' },
};

const CITIES = [
  { name: 'Delhi', state: 'Delhi NCR', tier: 1, x: 34.5, y: 25.5 },
  { name: 'Mumbai', state: 'Maharashtra', tier: 1, x: 23.5, y: 56.5 },
  { name: 'Bangalore', state: 'Karnataka', tier: 1, x: 34.5, y: 77.5 },
  { name: 'Hyderabad', state: 'Telangana', tier: 1, x: 40.5, y: 62.5 },
  { name: 'Chennai', state: 'Tamil Nadu', tier: 1, x: 44.5, y: 78.5 },
  { name: 'Kolkata', state: 'West Bengal', tier: 1, x: 67.5, y: 46.5 },
  { name: 'Jaipur', state: 'Rajasthan', tier: 2, x: 28.5, y: 32.5 },
  { name: 'Ahmedabad', state: 'Gujarat', tier: 2, x: 20.5, y: 44.5 },
  { name: 'Pune', state: 'Maharashtra', tier: 2, x: 26.5, y: 59.5 },
];

export default function CreatorMap({ mob }) {
  const [hoveredCity, setHoveredCity] = useState(null);

  return (
    <section id="map-section-verify" style={{ 
      padding: mob ? '60px 20px' : '100px 40px', 
      background: '#fff', 
      minHeight: '800px', // Forced height for visibility
      position: 'relative',
      zIndex: 100
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: mob ? 32 : 48, fontWeight: 900, color: '#000', fontFamily: "'Fraunces', serif" }}>
            The <span style={{ color: '#2563eb' }}>Pan-Bharat</span> Network.
          </h2>
          <p style={{ color: 'rgba(0,0,0,0.5)', marginTop: 16, fontWeight: 600 }}>Explore our presence across the nation.</p>
        </div>

        <div style={{ 
          display: 'flex', 
          flexDirection: mob ? 'column' : 'row', 
          gap: 40,
          background: '#f8fafc',
          borderRadius: 40,
          padding: mob ? '20px' : '60px',
          border: '2px solid #e2e8f0', // Visible border
          alignItems: 'center'
        }}>
          
          {/* Map Container */}
          <div style={{ flex: 1.5, position: 'relative', width: '100%', height: mob ? 450 : 750 }}>
            
            {/* Using a PNG fallback to avoid SVG rendering issues */}
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/India_Map_with_States_and_UTs.svg/800px-India_Map_with_States_and_UTs.svg.png" 
              alt="India Map"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                display: 'block',
                borderRadius: 20
              }}
              onLoad={() => console.log('Map Loaded')}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x1000?text=India+Map+Not+Loaded';
              }}
            />

            {/* City Markers */}
            {CITIES.map((city) => (
              <div 
                key={city.name}
                onMouseEnter={() => setHoveredCity(city)}
                onMouseLeave={() => setHoveredCity(null)}
                style={{ 
                  position: 'absolute', 
                  left: `${city.x}%`, 
                  top: `${city.y}%`,
                  width: 24, height: 24,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: 10
                }}
              >
                {city.tier === 1 && (
                  <motion.div 
                    animate={{ scale: [1, 2.2, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: TIER_COLORS[city.tier].light }}
                  />
                )}
                <div style={{ 
                  width: 10, height: 10, 
                  borderRadius: '50%', 
                  background: TIER_COLORS[city.tier].dot,
                  border: '2px solid #fff',
                  margin: '7px'
                }} />
              </div>
            ))}

            {/* Tooltip */}
            <AnimatePresence>
              {hoveredCity && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute', left: `${hoveredCity.x}%`, top: `${hoveredCity.y - 8}%`,
                    transform: 'translateX(-50%)', width: 180, background: '#fff',
                    padding: '12px', borderRadius: '16px', boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                    zIndex: 100, border: '1px solid #f1f5f9', pointerEvents: 'none'
                  }}
                >
                  <div style={{ fontWeight: 900, fontSize: 16 }}>{hoveredCity.name}</div>
                  <div style={{ fontSize: 11, color: '#2563eb', fontWeight: 800 }}>{hoveredCity.state}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stats */}
          <div style={{ flex: 0.7, width: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
               <div style={{ padding: '24px', background: '#111', color: '#fff', borderRadius: '24px' }}>
                  <div style={{ fontSize: 24, fontWeight: 900 }}>8.5M+</div>
                  <div style={{ fontSize: 12, opacity: 0.5 }}>Creators Mapped</div>
               </div>
               <div style={{ padding: '24px', background: 'rgba(37, 99, 235, 0.05)', color: '#2563eb', borderRadius: '24px', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
                  <div style={{ fontSize: 24, fontWeight: 900 }}>45+</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Major Cities</div>
               </div>
            </div>
            <button style={{ width: '100%', marginTop: 24, padding: '20px', background: '#000', color: '#fff', borderRadius: '100px', border: 'none', fontSize: 16, fontWeight: 900 }}>
              Join Now <Zap size={18} fill="#fff" style={{ marginLeft: 8 }} />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
