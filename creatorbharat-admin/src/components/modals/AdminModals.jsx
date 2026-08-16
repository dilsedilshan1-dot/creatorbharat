// 🪟 CreatorBharat SaaS Centralized Admin Modals Component
import React from 'react';
import { X, Trophy, Check } from 'lucide-react';
import { T } from '../ui/Primitives';
import { PremiumMediaUpload } from './PremiumMediaUpload';

export function AdminModals(props) {
  const {
    // Gallery
    galleryModalOpen, setGalleryModalOpen, editingGallery, setEditingGallery, clearGalleryForm, handleSaveGallery,
    galTitle, setGalTitle, galType, setGalType, galLocation, setGalLocation, galDate, setGalDate,
    galCategory, setGalCategory, galTags, setGalTags, galThumbnail, setGalThumbnail, galVideoUrl, setGalVideoUrl,
    galDuration, setGalDuration, galDesc, setGalDesc,

    // Podcast
    podcastModalOpen, setPodcastModalOpen, editingPodcast, setEditingPodcast, clearPodcastForm, handleSavePodcast,
    podCreatorId, setPodCreatorId, creators, podTitle, setPodTitle, podDesc, setPodDesc, podDuration, setPodDuration,
    podThumbnail, setPodThumbnail, podAudioUrl, setPodAudioUrl, podVideoUrl, setPodVideoUrl, podPublished, setPodPublished,
    handleUploadMedia,

    // Edit Creator
    editCreatorModalOpen, setEditCreatorModalOpen, setEditingCreator, handleSaveCreator,
    editCreName, setEditCreName, editCreHandle, setEditCreHandle, editCreBio, setEditCreBio,
    editCreCity, setEditCreCity, editCreState, setEditCreState, editCreFollowers, setEditCreFollowers,
    editCreRateMin, setEditCreRateMin, editCreRateMax, setEditCreRateMax, editCreNiche, setEditCreNiche,
    editCrePlatform, setEditCrePlatform, editCrePhoto, setEditCrePhoto, editCreCoverImage, setEditCreCoverImage,
    editCreAadhaarUrl, setEditCreAadhaarUrl, editCrePanUrl, setEditCrePanUrl, editCreStatus, setEditCreStatus,
    editCreIsVerified, setEditCreIsVerified, editCreIsPro, setEditCreIsPro,

    // Edit Brand
    editBrandModalOpen, setEditBrandModalOpen, setEditingBrand, handleSaveBrand,
    editBrandName, setEditBrandName, editBrandIndustry, setEditBrandIndustry, editBrandWebsite, setEditBrandWebsite,

    // Edit Campaign
    editCampaignModalOpen, setEditCampaignModalOpen, setEditingCampaign, handleSaveCampaign,
    editCampTitle, setEditCampTitle, editCampBudget, setEditCampBudget, editCampDesc, setEditCampDesc,
    editCampPlatform, setEditCampPlatform, editCampNiche, setEditCampNiche, editCampStatus, setEditCampStatus,

    // Create Creator
    createCreatorModalOpen, setCreateCreatorModalOpen, clearCreatorForm, handleCreateCreator,
    creEmail, setCreEmail, crePassword, setCrePassword, creName, setCreName, creHandle, setCreHandle,
    crePhone, setCrePhone, creCity, setCreCity, creState, setCreState, creFollowers, setCreFollowers,
    creRateMin, setCreRateMin, creRateMax, setCreRateMax, creNiche, setCreNiche, crePlatform, setCrePlatform,

    // Create Brand
    createBrandModalOpen, setCreateBrandModalOpen, clearBrandForm, handleCreateBrand,
    brandEmail, setBrandEmail, brandPassword, setBrandPassword, brandCompanyName, setBrandCompanyName,
    brandIndustry, setBrandIndustry, brandWebsite, setBrandWebsite, brandPhone, setBrandPhone,

    // Create Campaign
    createCampaignModalOpen, setCreateCampaignModalOpen, clearCampaignForm, handleCreateCampaign,
    campBrandId, setCampBrandId, brands, campTitle, setCampTitle, campBudget, setCampBudget,
    campDesc, setCampDesc, campPlatform, setCampPlatform, campNiche, setCampNiche, campStatus, setCampStatus,

    // Event
    eventModalOpen, setEventModalOpen, editingEvent, setEditingEvent, handleSaveEvent,
    evtTitle, setEvtTitle, evtDescription, setEvtDescription, evtDate, setEvtDate, evtLocation, setEvtLocation,
    evtLink, setEvtLink, evtImage, setEvtImage,

    // Grant Achievement
    grantAchModalOpen, setGrantAchModalOpen, handleSaveAchievement,
    achCreatorId, setAchCreatorId, achType, setAchType, achTitle, setAchTitle, achDescription, setAchDescription,

    // Mission
    missionModalOpen, setMissionModalOpen, editingMission, setEditingMission, handleSaveMission,
    misTitle, setMisTitle, misReward, setMisReward, misRewardColor, setMisRewardColor, misDeadline, setMisDeadline,
    misDescription, setMisDescription, misSteps, setMisSteps, misActive, setMisActive,

    // Score Modal
    scoreModal, setScoreModal, scoreInput, setScoreInput, scoreReason, setScoreReason, handleSaveScore,

    // Drawer
    drawerOpen, setDrawerOpen, selectedCreator, handleVerifyCreator, handleRejectCreator
  } = props;

  return (
    <>
      {/* ══ GALLERY MODAL ════════════════════════════════════════════ */}
      {galleryModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', overflowY: 'auto', padding: '40px 20px' }}>
          <div style={{ width: '100%', maxWidth: 650, background: T.card, borderRadius: 24, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '24px 28px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: T.navy }}>{editingGallery ? 'Edit Gallery Item' : 'Add Ecosystem Gallery Item'}</h3>
              <button onClick={() => { setGalleryModalOpen(false); setEditingGallery(null); clearGalleryForm(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveGallery} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Title</label>
                  <input value={galTitle} onChange={e => setGalTitle(e.target.value)} placeholder="Event or highlight title..." style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Media Type</label>
                  <select value={galType} onChange={e => setGalType(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, background: T.card, outline: 'none' }}>
                    <option value="photo">Photo</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Location</label>
                  <input value={galLocation} onChange={e => setGalLocation(e.target.value)} placeholder="e.g. Jaipur, Rajasthan" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Date</label>
                  <input value={galDate} onChange={e => setGalDate(e.target.value)} placeholder="e.g. March 14, 2026" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Category</label>
                  <select value={galCategory} onChange={e => setGalCategory(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, background: T.card, outline: 'none' }}>
                    {['Summits', 'Collaborations', 'Workshops', 'Media'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Tags (comma separated)</label>
                  <input value={galTags} onChange={e => setGalTags(e.target.value)} placeholder="e.g. Fashion, Summit, Regional" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <PremiumMediaUpload label="Thumbnail Image" value={galThumbnail} onChange={setGalThumbnail} type="image" onUploadFile={handleUploadMedia} />
              {galType === 'video' && (
                <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: 16 }}>
                  <PremiumMediaUpload label="Video File / Link" value={galVideoUrl} onChange={setGalVideoUrl} type="video" onUploadFile={handleUploadMedia} />
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Duration</label>
                    <input value={galDuration} onChange={e => setGalDuration(e.target.value)} placeholder="e.g. 2:45" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Description / Highlights</label>
                <textarea value={galDesc} onChange={e => setGalDesc(e.target.value)} rows={3} placeholder="Provide details about the summit, workshop, or collaboration..." style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, resize: 'none', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: T.orange, color: '#fff', border: 'none', borderRadius: 11, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>{editingGallery ? 'Update Gallery Item' : 'Add Gallery Item'}</button>
                <button type="button" onClick={() => { setGalleryModalOpen(false); setEditingGallery(null); clearGalleryForm(); }} style={{ padding: '12px 20px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 11, fontWeight: 700, fontSize: 13, cursor: 'pointer', color: T.slate }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ PODCAST MODAL ════════════════════════════════════════════ */}
      {podcastModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', overflowY: 'auto', padding: '40px 20px' }}>
          <div style={{ width: '100%', maxWidth: 650, background: T.card, borderRadius: 24, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '24px 28px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: T.navy }}>{editingPodcast ? 'Edit Podcast Episode' : 'Publish New Podcast Episode'}</h3>
              <button onClick={() => { setPodcastModalOpen(false); setEditingPodcast(null); clearPodcastForm(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSavePodcast} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Host / Creator</label>
                <select value={podCreatorId} onChange={e => setPodCreatorId(e.target.value)} required style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, background: T.card, outline: 'none' }}>
                  <option value="">Select a host creator...</option>
                  {creators.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (@{c.handle})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Episode Title</label>
                <input value={podTitle} onChange={e => setPodTitle(e.target.value)} required placeholder="e.g. Building Creators in India" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Description / Show Notes</label>
                <textarea value={podDesc} onChange={e => setPodDesc(e.target.value)} rows={3} placeholder="What is this episode about?" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Duration (e.g. 12:34)</label>
                  <input value={podDuration} onChange={e => setPodDuration(e.target.value)} required placeholder="e.g. 45:10" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <PremiumMediaUpload label="Cover Image / Thumbnail" value={podThumbnail} onChange={setPodThumbnail} type="image" onUploadFile={handleUploadMedia} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <PremiumMediaUpload label="Audio File (MP3)" value={podAudioUrl} onChange={setPodAudioUrl} type="audio" onUploadFile={handleUploadMedia} />
                <PremiumMediaUpload label="Video File (MP4) - Optional" value={podVideoUrl} onChange={setPodVideoUrl} type="video" onUploadFile={handleUploadMedia} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: T.navy, cursor: 'pointer', marginTop: 8 }}>
                <input type="checkbox" checked={podPublished} onChange={e => setPodPublished(e.target.checked)} style={{ width: 16, height: 16 }} />
                ✓ Publish Episode immediately
              </label>
              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: T.orange, color: '#fff', border: 'none', borderRadius: 11, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>{editingPodcast ? 'Update Episode' : 'Publish Episode'}</button>
                <button type="button" onClick={() => { setPodcastModalOpen(false); setEditingPodcast(null); clearPodcastForm(); }} style={{ padding: '12px 20px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 11, fontWeight: 700, fontSize: 13, cursor: 'pointer', color: T.slate }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ EDIT CREATOR PROFILE MODAL ════════════════════════════════ */}
      {editCreatorModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', overflowY: 'auto', padding: '40px 20px' }}>
          <div style={{ width: '100%', maxWidth: 700, background: T.card, borderRadius: 24, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '24px 28px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: T.navy }}>Edit Creator Profile</h3>
              <button onClick={() => { setEditCreatorModalOpen(false); setEditingCreator(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveCreator} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Full Name</label>
                  <input value={editCreName} onChange={e => setEditCreName(e.target.value)} required style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Handle</label>
                  <input value={editCreHandle} onChange={e => setEditCreHandle(e.target.value)} required style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Bio / Tagline</label>
                <textarea value={editCreBio} onChange={e => setEditCreBio(e.target.value)} rows={2} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box', resize: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>City</label>
                  <input value={editCreCity} onChange={e => setEditCreCity(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>State</label>
                  <input value={editCreState} onChange={e => setEditCreState(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Followers</label>
                  <input type="number" value={editCreFollowers} onChange={e => setEditCreFollowers(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Min Rate (INR)</label>
                  <input type="number" value={editCreRateMin} onChange={e => setEditCreRateMin(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Max Rate (INR)</label>
                  <input type="number" value={editCreRateMax} onChange={e => setEditCreRateMax(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Niches</label>
                  <input value={editCreNiche} onChange={e => setEditCreNiche(e.target.value)} placeholder="Fashion, Tech, Lifestyle" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Platforms</label>
                  <input value={editCrePlatform} onChange={e => setEditCrePlatform(e.target.value)} placeholder="Instagram, YouTube" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <PremiumMediaUpload label="Profile Avatar Photo" value={editCrePhoto} onChange={setEditCrePhoto} type="image" onUploadFile={handleUploadMedia} />
                <PremiumMediaUpload label="Profile Cover Banner" value={editCreCoverImage} onChange={setEditCreCoverImage} type="image" onUploadFile={handleUploadMedia} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Account Status</label>
                  <select value={editCreStatus} onChange={e => setEditCreStatus(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, background: T.card, outline: 'none' }}>
                    <option value="DRAFT">DRAFT</option>
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="VERIFIED">VERIFIED</option>
                  </select>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: T.navy, cursor: 'pointer', marginTop: 16 }}>
                  <input type="checkbox" checked={editCreIsVerified} onChange={e => setEditCreIsVerified(e.target.checked)} style={{ width: 16, height: 16 }} />
                  ✓ Verified Badge
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: T.navy, cursor: 'pointer', marginTop: 16 }}>
                  <input type="checkbox" checked={editCreIsPro} onChange={e => setEditCreIsPro(e.target.checked)} style={{ width: 16, height: 16 }} />
                  ⚡ Pro Tier Member
                </label>
              </div>
              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: T.orange, color: '#fff', border: 'none', borderRadius: 11, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>Update Creator Profile</button>
                <button type="button" onClick={() => { setEditCreatorModalOpen(false); setEditingCreator(null); }} style={{ padding: '12px 20px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 11, fontWeight: 700, fontSize: 13, cursor: 'pointer', color: T.slate }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ EDIT BRAND PROFILE MODAL ══════════════════════════════════ */}
      {editBrandModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', overflowY: 'auto', padding: '40px 20px' }}>
          <div style={{ width: '100%', maxWidth: 550, background: T.card, borderRadius: 24, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '24px 28px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: T.navy }}>Edit Brand Profile</h3>
              <button onClick={() => { setEditBrandModalOpen(false); setEditingBrand(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveBrand} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Company Name</label>
                <input value={editBrandName} onChange={e => setEditBrandName(e.target.value)} required style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Industry</label>
                  <input value={editBrandIndustry} onChange={e => setEditBrandIndustry(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Website</label>
                  <input value={editBrandWebsite} onChange={e => setEditBrandWebsite(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: T.orange, color: '#fff', border: 'none', borderRadius: 11, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>Update Brand Profile</button>
                <button type="button" onClick={() => { setEditBrandModalOpen(false); setEditingBrand(null); }} style={{ padding: '12px 20px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 11, fontWeight: 700, fontSize: 13, cursor: 'pointer', color: T.slate }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ EDIT CAMPAIGN MODAL ══════════════════════════════════════ */}
      {editCampaignModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', overflowY: 'auto', padding: '40px 20px' }}>
          <div style={{ width: '100%', maxWidth: 600, background: T.card, borderRadius: 24, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '24px 28px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: T.navy }}>Edit Campaign</h3>
              <button onClick={() => { setEditCampaignModalOpen(false); setEditingCampaign(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveCampaign} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Campaign Title</label>
                  <input value={editCampTitle} onChange={e => setEditCampTitle(e.target.value)} required style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Budget (INR)</label>
                  <input type="number" value={editCampBudget} onChange={e => setEditCampBudget(e.target.value)} required style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Description / Brief</label>
                <textarea value={editCampDesc} onChange={e => setEditCampDesc(e.target.value)} rows={4} required style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Target Platforms</label>
                  <input value={editCampPlatform} onChange={e => setEditCampPlatform(e.target.value)} placeholder="Instagram, YouTube" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Target Niches</label>
                  <input value={editCampNiche} onChange={e => setEditCampNiche(e.target.value)} placeholder="Fashion, Tech" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Campaign Status</label>
                <select value={editCampStatus} onChange={e => setEditCampStatus(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, background: T.card, outline: 'none' }}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="PAUSED">PAUSED</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: T.orange, color: '#fff', border: 'none', borderRadius: 11, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>Update Campaign Details</button>
                <button type="button" onClick={() => { setEditCampaignModalOpen(false); setEditingCampaign(null); }} style={{ padding: '12px 20px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 11, fontWeight: 700, fontSize: 13, cursor: 'pointer', color: T.slate }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ CREATE CREATOR PROFILE MODAL ════════════════════════════════ */}
      {createCreatorModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', overflowY: 'auto', padding: '40px 20px' }}>
          <div style={{ width: '100%', maxWidth: 700, background: T.card, borderRadius: 24, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '24px 28px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: T.navy }}>Create New Creator Account</h3>
              <button onClick={() => { setCreateCreatorModalOpen(false); clearCreatorForm(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateCreator} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Email Address *</label>
                  <input type="email" value={creEmail} onChange={e => setCreEmail(e.target.value)} required placeholder="creator@email.com" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Password *</label>
                  <input type="password" value={crePassword} onChange={e => setCrePassword(e.target.value)} required placeholder="Min 8 characters" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Full Name *</label>
                  <input value={creName} onChange={e => setCreName(e.target.value)} required placeholder="e.g. Dilshan Mohmmad" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Handle * (Unique)</label>
                  <input value={creHandle} onChange={e => setCreHandle(e.target.value)} required placeholder="e.g. dilshan_m" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Phone Number</label>
                  <input value={crePhone} onChange={e => setCrePhone(e.target.value)} placeholder="10-digit number" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>City</label>
                  <input value={creCity} onChange={e => setCreCity(e.target.value)} placeholder="e.g. Jaipur" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>State</label>
                  <input value={creState} onChange={e => setCreState(e.target.value)} placeholder="e.g. Rajasthan" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Followers</label>
                  <input type="number" value={creFollowers} onChange={e => setCreFollowers(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Min Rate (INR)</label>
                  <input type="number" value={creRateMin} onChange={e => setCreRateMin(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Max Rate (INR)</label>
                  <input type="number" value={creRateMax} onChange={e => setCreRateMax(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Niches</label>
                  <input value={creNiche} onChange={e => setCreNiche(e.target.value)} placeholder="Fashion, Tech, Lifestyle" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Platforms</label>
                  <input value={crePlatform} onChange={e => setCrePlatform(e.target.value)} placeholder="Instagram, YouTube" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: T.orange, color: '#fff', border: 'none', borderRadius: 11, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>Create Creator Account</button>
                <button type="button" onClick={() => { setCreateCreatorModalOpen(false); clearCreatorForm(); }} style={{ padding: '12px 20px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 11, fontWeight: 700, fontSize: 13, cursor: 'pointer', color: T.slate }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ CREATE BRAND PROFILE MODAL ════════════════════════════════ */}
      {createBrandModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', overflowY: 'auto', padding: '40px 20px' }}>
          <div style={{ width: '100%', maxWidth: 550, background: T.card, borderRadius: 24, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '24px 28px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: T.navy }}>Create New Brand Account</h3>
              <button onClick={() => { setCreateBrandModalOpen(false); clearBrandForm(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateBrand} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Email Address *</label>
                  <input type="email" value={brandEmail} onChange={e => setBrandEmail(e.target.value)} required placeholder="brand@company.com" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Password *</label>
                  <input type="password" value={brandPassword} onChange={e => setBrandPassword(e.target.value)} required placeholder="Min 8 characters" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Company Name *</label>
                <input value={brandCompanyName} onChange={e => setBrandCompanyName(e.target.value)} required placeholder="e.g. Tata Projects Ltd" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Industry</label>
                  <input value={brandIndustry} onChange={e => setBrandIndustry(e.target.value)} placeholder="e.g. Technology" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Website</label>
                  <input value={brandWebsite} onChange={e => setBrandWebsite(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Phone Number</label>
                <input value={brandPhone} onChange={e => setBrandPhone(e.target.value)} placeholder="e.g. 9876543210" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: T.orange, color: '#fff', border: 'none', borderRadius: 11, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>Create Brand Account</button>
                <button type="button" onClick={() => { setCreateBrandModalOpen(false); clearBrandForm(); }} style={{ padding: '12px 20px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 11, fontWeight: 700, fontSize: 13, cursor: 'pointer', color: T.slate }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ CREATE CAMPAIGN MODAL ══════════════════════════════════════ */}
      {createCampaignModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', overflowY: 'auto', padding: '40px 20px' }}>
          <div style={{ width: '100%', maxWidth: 600, background: T.card, borderRadius: 24, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '24px 28px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: T.navy }}>Create New Campaign</h3>
              <button onClick={() => { setCreateCampaignModalOpen(false); clearCampaignForm(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateCampaign} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Select Brand *</label>
                <select value={campBrandId} onChange={e => setCampBrandId(e.target.value)} required style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, background: T.card, outline: 'none' }}>
                  <option value="">-- Choose Brand --</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.companyName}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Campaign Title *</label>
                  <input value={campTitle} onChange={e => setCampTitle(e.target.value)} required placeholder="e.g. Diwali Special Launch" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Budget (INR) *</label>
                  <input type="number" value={campBudget} onChange={e => setCampBudget(e.target.value)} required placeholder="50000" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Description / Brief *</label>
                <textarea value={campDesc} onChange={e => setCampDesc(e.target.value)} rows={4} required placeholder="Detail the campaign requirements, deliverables, etc..." style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Target Platforms</label>
                  <input value={campPlatform} onChange={e => setCampPlatform(e.target.value)} placeholder="Instagram, YouTube" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Target Niches</label>
                  <input value={campNiche} onChange={e => setCampNiche(e.target.value)} placeholder="Fashion, Tech" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Campaign Status</label>
                <select value={campStatus} onChange={e => setCampStatus(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, background: T.card, outline: 'none' }}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="PAUSED">PAUSED</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: T.orange, color: '#fff', border: 'none', borderRadius: 11, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>Create Campaign</button>
                <button type="button" onClick={() => { setCreateCampaignModalOpen(false); clearCampaignForm(); }} style={{ padding: '12px 20px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 11, fontWeight: 700, fontSize: 13, cursor: 'pointer', color: T.slate }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ NEW/EDIT EVENT MODAL ════════════════════════════════════ */}
      {eventModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', overflowY: 'auto', padding: '40px 20px' }}>
          <div style={{ width: '100%', maxWidth: 600, background: T.card, borderRadius: 24, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '24px 28px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: T.navy }}>{editingEvent ? 'Edit Event Details' : 'Create New Event'}</h3>
              <button onClick={() => { setEventModalOpen(false); setEditingEvent(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveEvent} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Event Title *</label>
                <input value={evtTitle} onChange={e => setEvtTitle(e.target.value)} required placeholder="e.g. National Creator Summit 2026" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Description / Agenda *</label>
                <textarea value={evtDescription} onChange={e => setEvtDescription(e.target.value)} required rows={4} placeholder="What is the schedule, key hosts, and learning outcomes?" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Date & Time *</label>
                  <input type="datetime-local" value={evtDate} onChange={e => setEvtDate(e.target.value)} required style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Location / Venue *</label>
                  <input value={evtLocation} onChange={e => setEvtLocation(e.target.value)} required placeholder="e.g. New Delhi, ILBS Auditorium" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Registration link</label>
                  <input value={evtLink} onChange={e => setEvtLink(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Banner Cover Image URL</label>
                  <input value={evtImage} onChange={e => setEvtImage(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: T.orange, color: '#fff', border: 'none', borderRadius: 11, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>{editingEvent ? 'Update Event Details' : 'Create Event'}</button>
                <button type="button" onClick={() => { setEventModalOpen(false); setEditingEvent(null); }} style={{ padding: '12px 20px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 11, fontWeight: 700, fontSize: 13, cursor: 'pointer', color: T.slate }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ GRANT ACHIEVEMENT MODAL ══════════════════════════════════ */}
      {grantAchModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', overflowY: 'auto', padding: '40px 20px' }}>
          <div style={{ width: '100%', maxWidth: 550, background: T.card, borderRadius: 24, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '24px 28px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: T.navy }}>Grant Creator Achievement Badge</h3>
              <button onClick={() => { setGrantAchModalOpen(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveAchievement} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Select Creator *</label>
                <select value={achCreatorId} onChange={e => setAchCreatorId(e.target.value)} required style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, background: T.card, outline: 'none' }}>
                  <option value="">-- Choose Creator --</option>
                  {creators.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (@{c.handle})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Badge Type *</label>
                  <select value={achType} onChange={e => setAchType(e.target.value)} required style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, background: T.card, outline: 'none' }}>
                    <option value="VERIFICATION">VERIFICATION</option>
                    <option value="FOLLOWER_MILESTONE">FOLLOWER MILESTONE</option>
                    <option value="DEAL_MILESTONE">DEAL MILESTONE</option>
                    <option value="CUSTOM">CUSTOM BADGE</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Badge Title *</label>
                  <input value={achTitle} onChange={e => setAchTitle(e.target.value)} required placeholder="e.g. Rising Star, Superhost" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Description / Criteria</label>
                <textarea value={achDescription} onChange={e => setAchDescription(e.target.value)} rows={3} placeholder="Describe the reason for awarding this badge..." style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: T.orange, color: '#fff', border: 'none', borderRadius: 11, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>Grant Badge</button>
                <button type="button" onClick={() => { setGrantAchModalOpen(false); }} style={{ padding: '12px 20px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 11, fontWeight: 700, fontSize: 13, cursor: 'pointer', color: T.slate }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ NEW/EDIT MISSION MODAL ══════════════════════════════════ */}
      {missionModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', overflowY: 'auto', padding: '40px 20px' }}>
          <div style={{ width: '100%', maxWidth: 600, background: T.card, borderRadius: 24, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '24px 28px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: T.navy }}>{editingMission ? 'Edit Monthly Mission' : 'Create Monthly Mission'}</h3>
              <button onClick={() => { setMissionModalOpen(false); setEditingMission(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveMission} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Mission Title *</label>
                  <input value={misTitle} onChange={e => setMisTitle(e.target.value)} required placeholder="e.g. Join the Creator Network" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Reward Tag *</label>
                  <input value={misReward} onChange={e => setMisReward(e.target.value)} required placeholder="e.g. 500 Coins, Swag Bag" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Reward Color (Hex)</label>
                  <input value={misRewardColor} onChange={e => setMisRewardColor(e.target.value)} placeholder="#FF9431" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Deadline Date *</label>
                  <input type="date" value={misDeadline} onChange={e => setMisDeadline(e.target.value)} required style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Description / Instructions *</label>
                <textarea value={misDescription} onChange={e => setMisDescription(e.target.value)} required rows={3} placeholder="What does the creator need to do?" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Steps / Checklist (One per line) *</label>
                <textarea value={misSteps} onChange={e => setMisSteps(e.target.value)} required rows={4} placeholder="Complete your profile&#10;Verify your email&#10;Share referral link" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: T.navy, cursor: 'pointer', marginTop: 8 }}>
                <input type="checkbox" checked={misActive} onChange={e => setMisActive(e.target.checked)} style={{ width: 16, height: 16 }} />
                ✓ Mission is Active and visible to creators
              </label>
              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: T.orange, color: '#fff', border: 'none', borderRadius: 11, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>{editingMission ? 'Update Mission' : 'Create Mission'}</button>
                <button type="button" onClick={() => { setMissionModalOpen(false); setEditingMission(null); }} style={{ padding: '12px 20px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 11, fontWeight: 700, fontSize: 13, cursor: 'pointer', color: T.slate }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ ADJUST SCORE MODAL ════════════════════════════════════════ */}
      {scoreModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)' }}>
          <div style={{ width: '100%', maxWidth: 440, background: T.card, borderRadius: 24, padding: 32, boxShadow: '0 30px 80px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: T.navy }}>Adjust Creator Score</h3>
              <button onClick={() => setScoreModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={20} /></button>
            </div>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: T.slate }}>
              Adjusting CB Score for <strong>{scoreModal.name}</strong> (@{scoreModal.handle}). Current score: <strong>{scoreModal.score}</strong>.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>New Score (0–100)</label>
                <input type="number" min="0" max="100" value={scoreInput} onChange={e => setScoreInput(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 14, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.slate, marginBottom: 6, textTransform: 'uppercase' }}>Reason / Notes</label>
                <input value={scoreReason} onChange={e => setScoreReason(e.target.value)} placeholder="e.g. Campaign performance review" style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button onClick={handleSaveScore} style={{ flex: 1, padding: '12px', background: T.orange, color: '#fff', border: 'none', borderRadius: 11, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>Update Score</button>
                <button onClick={() => setScoreModal(null)} style={{ padding: '12px 20px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 11, fontWeight: 700, fontSize: 13, cursor: 'pointer', color: T.slate }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ CREATOR KYC DETAIL DRAWER ══════════════════════════════════ */}
      {drawerOpen && selectedCreator && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end', background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }}>
          <div style={{ width: '100%', maxWidth: 500, background: T.card, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 40px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '24px 32px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: T.navy }}>KYC Verification Review</h3>
                <span style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>ID: {selectedCreator.id}</span>
              </div>
              <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={20} /></button>
            </div>
            <div style={{ padding: 32, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <img src={selectedCreator.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'} alt="Avatar" style={{ width: 64, height: 64, borderRadius: 20, objectFit: 'cover' }} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: T.navy }}>{selectedCreator.name}</div>
                  <div style={{ fontSize: 13, color: T.muted }}>@{selectedCreator.handle}</div>
                  <div style={{ fontSize: 12, color: T.blue, fontWeight: 700, marginTop: 4 }}>{selectedCreator.user?.email || 'No email attached'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button onClick={() => handleVerifyCreator(selectedCreator.id)} style={{ flex: 1, padding: 14, background: T.green, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Check size={16} /> Approve KYC
                </button>
                <button onClick={() => handleRejectCreator(selectedCreator.id)} style={{ flex: 1, padding: 14, background: T.redLight, color: T.red, border: `1px solid ${T.red}30`, borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <X size={16} /> Reject Submission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
