// 📸 CreatorBharat SaaS Premium Media Upload Component
import React, { useState } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { T } from '../ui/Primitives';

export const PremiumMediaUpload = ({ label, value, onChange, type = 'image', onUploadFile }) => {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('upload'); // 'upload' or 'url'

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadMediaFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await uploadMediaFile(e.target.files[0]);
    }
  };

  const uploadMediaFile = async (file) => {
    setLoading(true);
    try {
      const url = await onUploadFile(file, type);
      onChange(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: T.slate, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
        <button
          type="button"
          onClick={() => setMode(mode === 'upload' ? 'url' : 'upload')}
          style={{ background: 'none', border: 'none', color: T.orange, fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: 0 }}
        >
          {mode === 'upload' ? '✍️ Paste URL Link' : '📁 Upload Local File'}
        </button>
      </div>

      {mode === 'url' ? (
        <input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`https://... enter direct ${type} URL`}
          style={{ width: '100%', padding: '10px 14px', border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13, color: T.navy, outline: 'none', boxSizing: 'border-box' }}
        />
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragActive ? T.orange : T.border}`,
            borderRadius: 12,
            padding: '24px 20px',
            textAlign: 'center',
            background: dragActive ? T.orangeLight : T.bg,
            cursor: 'pointer',
            transition: 'all 0.2s',
            position: 'relative'
          }}
          onClick={() => document.getElementById(`file-upload-${label.replace(/[^a-zA-Z]/g, '')}`).click()}
        >
          <input
            type="file"
            id={`file-upload-${label.replace(/[^a-zA-Z]/g, '')}`}
            accept={type === 'video' ? 'video/*' : type === 'audio' ? 'audio/*' : 'image/*'}
            style={{ display: 'none' }}
            onChange={handleChange}
          />
          
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <RefreshCw size={24} className="spin" style={{ color: T.orange }} />
              <span style={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>Uploading media...</span>
            </div>
          ) : value ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }} onClick={(e) => e.stopPropagation()}>
              {type === 'video' ? (
                <video src={value} controls style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 8, border: `1px solid ${T.border}` }} />
              ) : type === 'audio' ? (
                <audio src={value} controls style={{ width: '100%', maxWidth: 300 }} />
              ) : (
                <img src={value} alt="Preview" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8, border: `1px solid ${T.border}`, objectFit: 'contain' }} />
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => document.getElementById(`file-upload-${label.replace(/[^a-zA-Z]/g, '')}`).click()}
                  style={{ padding: '6px 12px', background: T.orangeLight, border: `1px solid ${T.orangeBorder}`, borderRadius: 6, fontSize: 11, color: T.orange, fontWeight: 700, cursor: 'pointer' }}
                >
                  Change File
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  style={{ padding: '6px 12px', background: T.redLight, border: `1px solid ${T.red}25`, borderRadius: 6, fontSize: 11, color: T.red, fontWeight: 700, cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Download size={24} style={{ color: T.muted }} />
              <span style={{ fontSize: 13, color: T.navy, fontWeight: 700 }}>Drag & drop file here, or <span style={{ color: T.orange }}>browse</span></span>
              <span style={{ fontSize: 10, color: T.muted }}>Supports {type === 'video' ? 'MP4, WebM (Max 50MB)' : type === 'audio' ? 'MP3, WAV' : 'PNG, JPG, WebP (Max 5MB)'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
