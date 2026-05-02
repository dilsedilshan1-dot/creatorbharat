import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import { scrollToTop, apiCall } from '../theme';
import { BrandTrustStrip, FeaturesEcosystem, VerificationEngine, FeaturedCreatorsSection, Testimonials, FaqSection, FinalCta, HeroSection } from './HomeSections';

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

  return (
    <div style={{ background: '#fff' }}>
      <HeroSection mob={mob} st={st} dsp={dsp} go={go} />
      <BrandTrustStrip />
      <FeaturesEcosystem mob={mob} />
      <VerificationEngine mob={mob} />
      <FeaturedCreatorsSection mob={mob} creators={creators} go={go} loading={loading} />
      <Testimonials mob={mob} />
      <FaqSection mob={mob} />
      <FinalCta mob={mob} go={go} />
    </div>
  );
}
