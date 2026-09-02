import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Seo from '@/components/common/SEO';
import { Btn } from '@/components/common/Primitives';
import { MessageCircle } from 'lucide-react';
import { apiCall } from '@/utils/api';

// Data Import
import { FAQS, FAQ_CATEGORIES } from '../../data/faqs';

// Components Import
import { FAQHero, CategoryTabs, FAQAccordion } from '@/components/faq/FAQComponents';

export default function FAQPage() {
  const navigate = useNavigate();
  const [mob, setMob] = useState(globalThis.innerWidth < 768);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [dynamicFaqs, setDynamicFaqs] = useState(null);

  useEffect(() => {
    const h = () => setMob(globalThis.innerWidth < 768);
    globalThis.addEventListener('resize', h);
    return () => globalThis.removeEventListener('resize', h);
  }, []);

  useEffect(() => {
    apiCall('/pages/faq').then(res => {
      if (res?.content) {
        const items = Array.isArray(res.content) ? res.content : res.content.items;
        if (items?.length) setDynamicFaqs(items);
      }
    }).catch(() => {});
  }, []);

  const ACTIVE_FAQS = dynamicFaqs || FAQS;

  const { counts, filtered } = useMemo(() => {
    const map = { all: ACTIVE_FAQS.length };
    ACTIVE_FAQS.forEach(f => {
      const categoryName = (f.cat || 'General').toLowerCase();
      const catId = FAQ_CATEGORIES.find(c => c.name.toLowerCase().includes(categoryName.replace('for ', '')) || c.id === categoryName)?.id || 'general';
      map[catId] = (map[catId] || 0) + 1;
    });

    const list = ACTIVE_FAQS.filter(f => {
      const matchesSearch = f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
      if (search.trim()) return matchesSearch;
      if (activeCat === 'all') return true;
      const catObj = FAQ_CATEGORIES.find(c => c.id === activeCat);
      const categoryName = (f.cat || 'General').toLowerCase();
      return catObj && categoryName.includes(catObj.name.toLowerCase().replace('for ', ''));
    });

    return { counts: map, filtered: list };
  }, [search, activeCat, ACTIVE_FAQS]);

  const trending = ["Elite Score", "Payment Cycle", "Verification Badge", "Campaign ROI"];

  const faqJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": ACTIVE_FAQS.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  }), [ACTIVE_FAQS]);

  return (
    <div style={{ background: '#fcfcfc', minHeight: '100vh', paddingBottom: '120px' }}>
      <Seo 
        title="Concierge Support Hub & FAQ" 
        description="Have questions about verification ticks, Razorpay Escrows, and payouts? Explore our comprehensive Knowledge Base." 
        keywords="creator faq, escrow questions, creatorbharat help, verification score support"
        jsonLd={faqJsonLd}
      />

      <FAQHero search={search} setSearch={setSearch} mob={mob} trending={trending} />

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
         {/* Category Navigation Tabs */}
         <CategoryTabs activeCat={activeCat} setActiveCat={setActiveCat} setSearch={setSearch} mob={mob} counts={counts} />

         {/* Accordion List */}
         <div style={{ display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
            {filtered.length > 0 ? (
               filtered.map((faq, i) => (
                  <FAQAccordion 
                    key={`${faq.q.slice(0, 15)}-${i}`}
                    q={faq.q} 
                    a={faq.a} 
                    cat={faq.cat}
                    highlight={search} 
                    delay={Math.min(i * 0.05, 0.3)} 
                    mob={mob} 
                  />
               ))
            ) : (
               <div style={{ padding: '80px 20px', textAlign: 'center', background: '#fff', borderRadius: '32px', border: '1.5px dashed #edf2f7' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginBottom: '8px', fontFamily: "'Outfit', sans-serif" }}>No Results Found</h3>
                  <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '400px', margin: '0 auto 24px', lineHeight: 1.6 }}>We couldn't find any questions matching "{search}". Try searching for popular topics like "payout" or "score".</p>
                  <Btn onClick={() => setSearch('')} style={{ background: '#f1f5f9', color: '#475569', borderRadius: '100px', fontWeight: 800 }}>Clear Search</Btn>
               </div>
            )}
         </div>

         {/* Helpdesk Footer */}
         <div style={{ marginTop: '80px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', borderRadius: mob ? '32px' : '48px', padding: mob ? '32px 24px' : '56px', border: '1.5px solid #e2e8f0', color: '#0f172a', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.02)' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle at 100% 0%, rgba(255,148,49,0.08), transparent 70%)' }} />
            <h3 style={{ fontSize: mob ? '26px' : '36px', fontWeight: 950, marginBottom: '16px', letterSpacing: '-0.02em', fontFamily: "'Outfit', sans-serif", color: '#0f172a' }}>Still Have Questions?</h3>
            <p style={{ fontSize: mob ? '15px' : '16px', color: '#475569', maxWidth: '520px', margin: '0 auto 32px', lineHeight: 1.6 }}>Our Concierge Helpdesk is available 24/7. Connect directly with our support engineers.</p>
            <Btn lg onClick={() => navigate('/contact')} style={{ background: 'linear-gradient(135deg, #FF9431 0%, #EA580C 100%)', color: '#fff', borderRadius: '100px', fontWeight: 950, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
               <MessageCircle size={18} /> Contact Support
            </Btn>
         </div>
      </main>
    </div>
  );
}
