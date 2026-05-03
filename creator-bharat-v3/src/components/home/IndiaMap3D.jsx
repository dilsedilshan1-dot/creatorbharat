import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Info, TrendingUp, Users, Map as MapIcon, Moon, Sun, Maximize2, Zap } from 'lucide-react';

// Enhanced State Data with Creator Distribution and Regional Vision
const STATE_DATA = {
  "Uttar Pradesh": { t1: "25k+", t2: "150k+", t3: "450k+", color: "#6366f1", vision: "Empowering the heartland with digital literacy and hyper-local storytelling." },
  "Maharashtra": { t1: "85k+", t2: "120k+", t3: "200k+", color: "#8b5cf6", vision: "Leading the 'Creator First' economy with global standards and premium content." },
  "Bihar": { t1: "10k+", t2: "45k+", t3: "250k+", color: "#ec4899", vision: "Unlocking hidden talent through regional languages and grassroot innovation." },
  "West Bengal": { t1: "35k+", t2: "80k+", t3: "150k+", color: "#f43f5e", vision: "Preserving cultural heritage through modern digital aesthetics and art." },
  "Madhya Pradesh": { t1: "15k+", t2: "65k+", t3: "180k+", color: "#10b981", vision: "Connecting central India's heritage with the global creator ecosystem." },
  "Tamil Nadu": { t1: "45k+", t2: "90k+", t3: "160k+", color: "#3b82f6", vision: "Pioneering tech-driven content and regional excellence in every niche." },
  "Rajasthan": { t1: "20k+", t2: "75k+", t3: "140k+", color: "#f59e0b", vision: "Reviving traditional narratives with modern creator tools and global reach." },
  "Karnataka": { t1: "65k+", t2: "85k+", t3: "120k+", color: "#06b6d4", vision: "Building the Silicon Valley of creators through data-driven influence." },
  "Gujarat": { t1: "30k+", t2: "95k+", t3: "180k+", color: "#84cc16", vision: "Fueling entrepreneurial spirit through business-centric digital content." },
  "Andhra Pradesh": { t1: "25k+", t2: "70k+", t3: "130k+", color: "#14b8a6", vision: "Scaling regional narratives with high-impact visual storytelling." },
  "Telangana": { t1: "40k+", t2: "60k+", t3: "110k+", color: "#d946ef", vision: "Nurturing a high-tech creator hub for digital-first entertainment." },
  "Kerala": { t1: "15k+", t2: "55k+", t3: "90k+", color: "#22c55e", vision: "Bridging global influences with authentic local creator communities." },
  "Punjab": { t1: "12k+", t2: "45k+", t3: "80k+", color: "#fbbf24", vision: "Taking vibrant regional culture to every corner of the digital world." },
  "Haryana": { t1: "10k+", t2: "40k+", t3: "75k+", color: "#a855f7", vision: "Accelerating growth through sports, lifestyle, and rural innovation." },
  "Delhi": { t1: "95k+", t2: "10k+", t3: "5k+", color: "#ef4444", vision: "Setting the benchmark for high-velocity trends and political influence." },
  "Jammu - Kashmir": { t1: "5k+", t2: "15k+", t3: "40k+", color: "#2dd4bf", vision: "Showcasing the world-class beauty and resilience through digital lenses." },
};

// SVG Paths for States (Simplified for 3D look)
const PATHS = [
  { id: 'JK', n: 'Jammu - Kashmir', d: "M200,50 L280,55 L350,75 L380,100 L410,130 L400,160 L430,190 L400,230 L320,240 L280,210 L250,200 L210,150 L220,100 Z" },
  { id: 'RJ', n: 'Rajasthan', d: "M150,350 L320,360 L400,500 L350,580 L250,600 L150,530 L120,450 Z" },
  { id: 'MP', n: 'Madhya Pradesh', d: "M320,450 L580,460 L630,550 L580,660 L480,660 L400,580 Z" },
  { id: 'MH', n: 'Maharashtra', d: "M240,580 L440,620 L550,780 L480,880 L320,880 L250,830 L200,730 Z" },
  { id: 'UP', n: 'Uttar Pradesh', d: "M430,320 L650,330 L730,450 L680,560 L580,560 L430,450 Z" },
  { id: 'GJ', n: 'Gujarat', d: "M80,550 L240,580 L260,650 L230,730 L160,730 L100,680 L70,620 Z" },
  { id: 'KA', n: 'Karnataka', d: "M320,880 L480,900 L510,1030 L450,1100 L320,1100 L280,1030 Z" },
  { id: 'TN', n: 'Tamil Nadu', d: "M380,1080 L500,1090 L520,1180 L450,1200 L380,1160 Z" },
  { id: 'AP', n: 'Andhra Pradesh', d: "M580,680 L650,690 L680,850 L630,1050 L520,1100 L480,1050 Z" },
  { id: 'BR', n: 'Bihar', d: "M650,330 L780,350 L820,440 L780,500 L680,480 Z" },
  { id: 'WB', n: 'West Bengal', d: "M780,500 L850,510 L880,650 L850,750 L780,730 Z" },
];

export default function IndiaMap3D({ mob }) {
  const [hoveredState, setHoveredState] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rotation, setRotation] = useState({ x: 15, y: 0 });
  const [isNight, setIsNight] = useState(true);

  // Filtered States for Search
  const filteredPaths = useMemo(() => 
    PATHS.filter(p => p.n.toLowerCase().includes(searchQuery.toLowerCase())),
  [searchQuery]);

  const handleMouseMove = (e) => {
    if (!selectedState) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientY - rect.top - rect.height / 2) / 40;
      const y = (e.clientX - rect.left - rect.width / 2) / 40;
      setRotation({ x: 15 + x, y: y });
    }
  };

  return (
    <section 
      onMouseMove={handleMouseMove}
      style={{ 
        height: mob ? '450px' : '500px', 
        width: '100%', 
        background: isNight ? '#020617' : '#f8fafc',
        color: isNight ? '#fff' : '#000',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        fontFamily: 'Inter, sans-serif',
        borderRadius: mob ? 24 : 32, // Added rounding for mobile too
        margin: mob ? '10px' : '20px auto', 
        maxWidth: mob ? 'calc(100% - 20px)' : '1200px', 
        border: `1px solid ${isNight ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
        boxShadow: '0 30px 80px rgba(0,0,0,0.08)'
      }}
    >
      {/* Background Neon Grid */}
      <div style={{ 
        position: 'absolute', inset: 0, 
        backgroundImage: `linear-gradient(${isNight ? 'rgba(99, 102, 241, 0.05)' : 'rgba(0,0,0,0.02)'} 1px, transparent 1px), linear-gradient(90deg, ${isNight ? 'rgba(99, 102, 241, 0.05)' : 'rgba(0,0,0,0.02)'} 1px, transparent 1px)`,
        backgroundSize: mob ? '30px 30px' : '40px 40px',
        pointerEvents: 'none'
      }} />

      {/* Floating UI Elements - More centered/balanced for mobile */}
      <div style={{ 
        position: 'absolute', 
        top: 15, left: 15, right: 15, 
        zIndex: 100, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ 
          background: isNight ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255,255,255,0.8)', 
          backdropFilter: 'blur(10px)', 
          padding: '6px 12px', 
          borderRadius: '100px',
          display: 'flex', alignItems: 'center', gap: 8,
          border: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
        }}>
          <Search size={12} opacity={0.5} />
          <input 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'none', border: 'none', color: 'inherit', outline: 'none', fontSize: 11, width: mob ? 70 : 100 }}
          />
        </div>
        <button 
          onClick={() => setIsNight(!isNight)}
          style={{ width: 32, height: 32, borderRadius: '50%', background: isNight ? '#1e293b' : '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          {isNight ? <Moon size={14} color="#6366f1" /> : <Sun size={14} color="#f59e0b" />}
        </button>
      </div>

      {/* Main 3D Perspective Map */}
      <div style={{ 
        flex: 1, 
        perspective: '1000px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        paddingBottom: mob ? 40 : 0 // Push map up slightly on mobile
      }}>
        <motion.div
          animate={{ 
            rotateX: rotation.x, 
            rotateY: rotation.y,
            scale: selectedState ? (mob ? 0.75 : 0.8) : (mob ? 0.5 : 0.6),
            y: mob ? -20 : -50,
            x: mob ? 0 : 0 // Ensuring no horizontal offset
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          style={{ 
            width: mob ? '100%' : 600, // Occupy full width on mobile
            height: mob ? '100%' : 600, 
            position: 'relative',
            transformStyle: 'preserve-3d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg 
            viewBox="50 0 900 1200" // Adjusted viewBox to crop empty space and center map
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="15" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {filteredPaths.map((path) => {
              const data = STATE_DATA[path.n] || { pop: 50, color: '#6366f1' };
              const isHovered = hoveredState === path.id;
              const isSelected = selectedState?.id === path.id;
              
              return (
                <g 
                  key={path.id} 
                  onMouseEnter={() => setHoveredState(path.id)} 
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() => setSelectedState(path)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Shadow/Depth Layer */}
                  <path 
                    d={path.d} 
                    fill="rgba(0,0,0,0.3)" 
                    transform="translate(10, 15)"
                  />
                  
                  {/* Neon Glow Outer */}
                  <motion.path 
                    d={path.d} 
                    fill="none" 
                    stroke={data.color} 
                    strokeWidth={isHovered ? 4 : 1}
                    style={{ filter: 'url(#glow)', opacity: isHovered ? 1 : 0.4 }}
                    animate={{ strokeWidth: [1, 3, 1] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                  />

                  {/* Main State Body */}
                  <motion.path 
                    d={path.d} 
                    fill={isNight ? `rgba(${isHovered ? '99, 102, 241' : '15, 23, 42'}, 0.8)` : `rgba(255,255,255,${isHovered ? 0.9 : 0.6})`}
                    stroke={isSelected ? '#fff' : data.color}
                    strokeWidth={isSelected ? 3 : 1.5}
                    animate={{ 
                      translateZ: isHovered ? 50 : 0,
                      fill: isHovered ? data.color : (isNight ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255,255,255,0.6)')
                    }}
                  />

                  {/* State Name Label */}
                  {isHovered && (
                    <motion.text
                      x={500} y={1150} // Central bottom for now
                      textAnchor="middle"
                      style={{ 
                        fill: '#fff', fontSize: 48, fontWeight: 900, 
                        textShadow: '0 0 20px rgba(99, 102, 241, 1)' 
                      }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    >
                      {path.n.toUpperCase()}
                    </motion.text>
                  )}
                </g>
              );
            })}
          </svg>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedState && (
          <motion.div
            initial={{ y: 300, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 300, opacity: 0 }}
            style={{ 
              width: '100%', 
              background: isNight ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255,255,255,0.98)', 
              backdropFilter: 'blur(30px)',
              borderTop: `1px solid ${isNight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              padding: '16px',
              display: 'flex', flexDirection: 'column', gap: 10,
              zIndex: 300,
              position: 'absolute',
              bottom: 0, left: 0,
              height: '75%', // Bottom sheet style for mobile
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              overflowY: 'auto',
              boxShadow: '0 -20px 40px rgba(0,0,0,0.2)',
              scrollbarWidth: 'none'
            }}
          >
            <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, alignSelf: 'center', marginBottom: 5 }} />
            <button onClick={() => setSelectedState(null)} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.5, fontSize: 10, fontWeight: 800 }}>CLOSE</button>
            
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, lineHeight: 1 }}>{selectedState.n}</h1>
              <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
                <div style={{ padding: '2px 5px', background: '#6366f1', borderRadius: 4, fontSize: 8, fontWeight: 900 }}>ACTIVE</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 5 }}>
              <DataCard icon={<Users size={12}/>} label="T1" value={STATE_DATA[selectedState.n]?.t1} small />
              <DataCard icon={<MapIcon size={12}/>} label="T2" value={STATE_DATA[selectedState.n]?.t2} small />
              <DataCard icon={<Maximize2 size={12}/>} label="T3" value={STATE_DATA[selectedState.n]?.t3} small />
            </div>

            <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
              <div style={{ fontSize: 8, fontWeight: 900, color: '#6366f1', textTransform: 'uppercase', marginBottom: 4 }}>Vision</div>
              <p style={{ fontSize: 11, margin: 0, opacity: 0.8, lineHeight: 1.3, fontStyle: 'italic' }}>
                "{STATE_DATA[selectedState.n]?.vision}"
              </p>
            </div>

            <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
              <div style={{ fontSize: 8, fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', marginBottom: 4 }}>Core Gap</div>
              <p style={{ fontSize: 11, margin: 0, opacity: 0.9, fontWeight: 600, color: isNight ? '#fda4af' : '#b91c1c', lineHeight: 1.3 }}>
                Local creators lack identity & support.
              </p>
            </div>

            <button style={{ 
               width: '100%', padding: '12px', background: '#6366f1', color: '#fff', 
               borderRadius: '100px', border: 'none', fontSize: 12, fontWeight: 900, cursor: 'pointer',
               marginTop: 10
            }}>
               EXPLORE HUB
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedState && (
        <div style={{ position: 'absolute', bottom: 20, left: 30, right: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 10, opacity: 0.5, fontWeight: 900, letterSpacing: 2 }}>BHARAT OS // NETWORK</div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>System <span style={{ color: '#10b981' }}>Live</span></div>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, opacity: 0.5, fontWeight: 900 }}>CAPACITY</div>
              <div style={{ fontSize: 16, fontWeight: 900 }}>1.4B+</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, opacity: 0.5, fontWeight: 900 }}>HUBS</div>
              <div style={{ fontSize: 16, fontWeight: 900 }}>28 States</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function DataCard({ icon, label, value, sub, small }) {
  return (
    <div style={{ display: 'flex', gap: small ? 12 : 20, alignItems: 'center' }}>
      <div style={{ 
        width: small ? 36 : 50, 
        height: small ? 36 : 50, 
        borderRadius: small ? 12 : 16, 
        background: 'rgba(99, 102, 241, 0.1)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        color: '#6366f1' 
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: small ? 10 : 12, opacity: 0.5, fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: small ? 16 : 20, fontWeight: 900 }}>{value}</div>
        {!small && <div style={{ fontSize: 11, opacity: 0.4 }}>{sub}</div>}
      </div>
    </div>
  );
}
