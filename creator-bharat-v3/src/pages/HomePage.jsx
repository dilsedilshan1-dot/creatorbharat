import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context';
import { apiCall } from '../utils/api';
import { LS } from '../utils/helpers';

// Modular Home Components
import Hero from '../components/home/Hero';
import CommunityPulse from '../components/home/CommunityPulse';
import PlatformShowcase from '../components/home/PlatformShowcase';
import FeaturedCreators from '../components/home/FeaturedCreators';
import Testimonials from '../components/home/Testimonials';
import Manifesto from '../components/home/Manifesto';
import ImpactStats from '../components/home/ImpactStats';
import IndiaMap3D from '../components/IndiaMap3D/IndiaMap3D';


import Faq from '../components/home/Faq';
import Cta from '../components/home/Cta';

const RevealSection = ({ children, mob, delay = 0 }) => {
  if (mob) return <div style={{ position: 'relative', width: '100%' }}>{children}</div>;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      style={{ position: 'relative', width: '100%' }}
    >
      {children}
    </motion.div>
  );
};

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
      const list = Array.isArray(d) ? d : (d.creators || []);
      if (list.length > 0) setCreators(list);
      else {
        const local = LS.get('cb_creators', []);
        if (local.length > 0) setCreators(local);
      }
      setLoading(false);
    }).catch(() => {
      const local = LS.get('cb_creators', []);
      if (local.length > 0) setCreators(local);
      setLoading(false);
    });
  }, []);

  const go = (p, sel) => { 
    dsp({ t: 'GO', p, sel }); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const sections = [
    { id: 'hero', comp: <Hero mob={mob} st={st} dsp={dsp} go={go} /> },
    { id: 'creators', comp: <FeaturedCreators mob={mob} creators={creators} go={go} loading={loading} /> },
    { id: 'impact', comp: <ImpactStats mob={mob} /> },
    { id: 'map', comp: <IndiaMap3D mob={mob} /> },


    { id: 'roadmap', comp: <CommunityPulse mob={mob} /> },
    { id: 'showcase', comp: <PlatformShowcase mob={mob} /> },
    { id: 'manifesto', comp: <Manifesto mob={mob} /> },
    { id: 'blueprint', comp: <Testimonials mob={mob} /> },
    { id: 'faq', comp: <Faq mob={mob} /> },
    { id: 'cta', comp: <Cta mob={mob} go={go} /> }
  ];

  return (
    <div style={{ background: '#fff', overflowX: 'hidden' }}>
      {sections.map((s, i) => (
        <div key={s.id} id={s.id} style={{ marginBottom: mob ? (s.id === 'hero' ? 0 : 20) : 0 }}>
          <RevealSection mob={mob} delay={i * 0.1}>
            {s.comp}
          </RevealSection>
        </div>
      ))}
    </div>
  );
}
