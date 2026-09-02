import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GALLERY_ITEMS, GALLERY_STATS } from '../../data/galleryData';
import { 
  GalleryHeader, GalleryFilterToolbar, GalleryCard, MediaLightboxModal 
} from '../../components/gallery/GalleryComponents';
import SEO from '@/components/common/SEO';
import { apiCall } from '@/utils/api';

export default function GalleryPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeType, setActiveType] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [selectedMedia, setSelectedMedia] = useState(null);

  // API and fallback states
  const [dbGallery, setDbGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scroll to top on page load and fetch gallery
  useEffect(() => {
    window.scrollTo(0, 0);
    let isMounted = true;
    apiCall('/gallery')
      .then(data => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setDbGallery(data);
        }
      })
      .catch(err => {
        console.warn('Ecosystem Gallery API offline, falling back to local dataset.', err?.message || err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const galleryItems = dbGallery.length > 0 ? dbGallery : GALLERY_ITEMS;

  // Filter & Sort Logic (Memoized for optimal SaaS telemetry performance)
  const filteredItems = useMemo(() => {
    let result = [...galleryItems];

    // 1. Filter by Search Query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        (item.location || '').toLowerCase().includes(q) ||
        (item.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    // 2. Filter by Category
    if (activeCategory !== 'All') {
      result = result.filter(item => item.category === activeCategory);
    }

    // 3. Filter by Media Type (Photo / Video)
    if (activeType !== 'all') {
      result = result.filter(item => item.type === activeType);
    }

    // 4. Sort chronological order
    result.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt);
      const dateB = new Date(b.date || b.createdAt);
      return sortBy === 'latest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [search, activeCategory, activeType, sortBy, galleryItems]);

  // Compute dynamic stats based on active items
  const galleryStats = useMemo(() => {
    if (dbGallery.length > 0) {
      const summits = dbGallery.filter(g => g.category === 'Summits').length;
      const collabs = dbGallery.filter(g => g.category === 'Collaborations').length;
      const workshops = dbGallery.filter(g => g.category === 'Workshops').length;
      const media = dbGallery.filter(g => g.category === 'Media').length;
      return {
        totalItems: dbGallery.length,
        cities: new Set(dbGallery.map(g => g.location?.split(',')[0]).filter(Boolean)).size || 1,
        categoriesCount: { Summits: summits, Collaborations: collabs, Workshops: workshops, Media: media },
        totalHoursVideo: `${Math.ceil(dbGallery.filter(g => g.type === 'video').length * 0.4)}+`
      };
    }
    return GALLERY_STATS;
  }, [dbGallery]);

  // Structured Schema data JSON-LD for Search Engines
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": "CreatorBharat Ecosystem Gallery",
    "description": "Visual highlights of India's leading creator-brand network, community summits, and media workshops.",
    "url": typeof window !== 'undefined' ? window.location.href : 'https://creatorbharat.com/gallery',
    "creator": {
      "@type": "Organization",
      "name": "CreatorBharat"
    }
  };

  return (
    <div style={{
      background: '#f8fafc',
      minHeight: '100vh',
      paddingBottom: '120px',
      fontFamily: '"Outfit", sans-serif'
    }}>
      {/* SEO Injection */}
      <SEO 
        title="Ecosystem Gallery | CreatorBharat"
        description="Explore live footage, photos, and news highlights of the CreatorBharat brand networking events, summits, workshops, and node activations across India."
        jsonLd={schemaData}
      />

      {/* Hero Header */}
      <GalleryHeader stats={galleryStats} />

      {/* Filter toolbar and Cards Grid deck */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <GalleryFilterToolbar 
          search={search}
          setSearch={setSearch}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          activeType={activeType}
          setActiveType={setActiveType}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* Dynamic Card deck */}
        <motion.div 
          layout
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 28
          }}
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map(item => (
              <GalleryCard 
                key={item.id}
                item={item}
                onClick={setSelectedMedia}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty Search / No results placeholder */}
        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '80px 20px',
              textAlign: 'center',
              background: '#ffffff',
              border: '1px dashed #cbd5e1',
              borderRadius: 24,
              marginTop: 16
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>No Gallery Nodes Found</h3>
            <p style={{ fontSize: 14, color: '#64748b', maxWidth: 420, margin: '0 auto' }}>
              We couldn't find any photos or videos matching your search criteria. Try modifying your search keywords or switching filters.
            </p>
          </motion.div>
        )}
      </div>

      {/* Lightbox Media Modal Overlay */}
      <AnimatePresence>
        {selectedMedia && (
          <MediaLightboxModal 
            item={selectedMedia}
            onClose={() => setSelectedMedia(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
