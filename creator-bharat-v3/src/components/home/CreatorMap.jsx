import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin } from 'lucide-react';

export default function CreatorMap({ mob }) {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedHub, setSelectedHub] = useState(null);

  const hubs = [
    { id: 'north', n: 'North Bharat', x: '35%', y: '22%', color: '#000', msg: 'The energy of North Bharat is rising. From Delhi to Jaipur, we are uncovering the next big storytellers.' },
    { id: 'west', n: 'West Bharat', x: '20%', y: '55%', color: '#000', msg: 'The economic engine of India. Your creativity in Mumbai and Gujarat is shaping the digital future.' },
    { id: 'south', n: 'South Bharat', x: '35%', y: '82%', color: '#000', msg: 'Innovation meets tradition. We are celebrating the diverse and powerful voices from the southern coast.' },
    { id: 'east', n: 'East Bharat', x: '82%', y: '42%', color: '#000', msg: 'The soul of Indian art. From the tea gardens to the bay, your stories deserve a national stage.' },
    { id: 'central', n: 'Central Bharat', x: '45%', y: '50%', color: '#000', msg: 'The heart of the nation. Connecting local talent from the heartland to global opportunities.' },
  ];

  const handleDotClick = (hub) => {
    setSelectedHub(hub);
    setShowPopup(true);
  };

  return (
    <section style={{ padding: mob ? '60px 20px' : '100px 20px', background: '#fff', position: 'relative', overflow: 'hidden' }}>
      
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        
        <div style={{ marginBottom: 50 }}>
           <h2 style={{ fontSize: mob ? 28 : 48, fontWeight: 900, color: '#000', fontFamily: "'Fraunces', serif" }}>
             Building the <span style={{ textDecoration: 'underline' }}>Creator Map of Bharat.</span>
           </h2>
        </div>

        {/* Dotted Map with Boundaries Container */}
        <div style={{ position: 'relative', width: '100%', height: mob ? 500 : 850, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* Layer 1: The Dotted Fill (Masked) */}
          <div style={{ 
            position: 'absolute', inset: 0, 
            maskImage: 'url("https://upload.wikimedia.org/wikipedia/commons/e/e0/India_Map_with_States_and_UTs.svg")',
            maskSize: 'contain', maskPosition: 'center', maskRepeat: 'no-repeat',
            WebkitMaskImage: 'url("https://upload.wikimedia.org/wikipedia/commons/e/e0/India_Map_with_States_and_UTs.svg")',
            WebkitMaskSize: 'contain', WebkitMaskPosition: 'center', WebkitMaskRepeat: 'no-repeat',
            background: 'radial-gradient(circle, #000 1.2px, transparent 1.2px)',
            backgroundSize: '8px 8px',
            opacity: 0.7, zIndex: 1
          }} />

          {/* Layer 2: Clear State Boundaries (Overlaid) */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
             <img 
                src="https://upload.wikimedia.org/wikipedia/commons/e/e0/India_Map_with_States_and_UTs.svg" 
                alt="India Boundaries"
                style={{ 
                  width: '100%', height: '100%', objectFit: 'contain', 
                  opacity: 0.8, filter: 'grayscale(1) contrast(10) brightness(0)' 
                }}
             />
          </div>

          {/* Layer 3: Interactive Hotspots */}
          {hubs.map((h) => (
            <motion.div 
              key={h.id}
              whileHover={{ scale: 1.4 }}
              onClick={() => handleDotClick(h)}
              style={{ 
                position: 'absolute', left: h.x, top: h.y, 
                width: 20, height: 20, background: '#000', borderRadius: '50%', 
                cursor: 'pointer', zIndex: 30, border: '4px solid #fff',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', border: '2px solid #000', opacity: 0.2, animation: 'ping 2s infinite' }} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pop-up Message Modal */}
      <AnimatePresence>
        {showPopup && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20
            }}
            onClick={() => setShowPopup(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 30, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff', padding: mob ? '32px 24px' : '64px', borderRadius: 48,
                maxWidth: 550, width: '100%', position: 'relative', textAlign: 'center'
              }}
            >
              <button 
                onClick={() => setShowPopup(false)}
                style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(0,0,0,0.05)', border: 'none', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={20} color="#000" />
              </button>

              <div style={{ width: 64, height: 64, background: 'rgba(0,0,0,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
                <MapPin size={32} color="#000" />
              </div>

              <h2 style={{ fontSize: mob ? 28 : 40, fontWeight: 900, marginBottom: 20, lineHeight: 1.1, color: '#000', fontFamily: "'Fraunces', serif" }}>
                Connect with <br /> {selectedHub?.n}.
              </h2>

              <p style={{ fontSize: 18, color: 'rgba(0,0,0,0.6)', fontWeight: 600, lineHeight: 1.6, marginBottom: 40 }}>
                "{selectedHub?.msg}"
              </p>

              <button style={{ width: '100%', padding: '20px', background: '#000', color: '#fff', borderRadius: 100, border: 'none', fontSize: 16, fontWeight: 900, cursor: 'pointer' }}>
                Explore Local Creators
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(3.5); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
