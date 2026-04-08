'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const PAGE_COLORS = ['#5865F2', '#57F287', '#FEE75C', '#ED4245'];

export default function Dashboard({ params }) {
  const [guildId, setGuildId] = useState(null);
  const [rules, setRules] = useState([]);
  const [channelId, setChannelId] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [imageMode, setImageMode] = useState('link'); // 'link' or 'upload'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params;
      setGuildId(resolvedParams.guildId);
    }
    getParams();
  }, [params]);

  useEffect(() => {
    if (guildId) {
      fetchRules();
    }
  }, [guildId]);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/rules/${guildId}`);
      setRules(res.data.rules);
      setChannelId(res.data.channelId);
      setImageUrl(res.data.imageUrl || '');
      setImageInput(res.data.imageUrl || '');
    } catch (err) {
      console.error(err);
      toast.error('Failed to load rules.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(`${API_URL}/api/rules/${guildId}`, { rules });
      toast.success('Rules updated successfully!');
      if (channelId) {
        toast.success('Discord channel updated automatically.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save rules.');
    } finally {
      setSaving(false);
    }
  };

  // Save image via link
  const handleSaveImageLink = async () => {
    try {
      setUploading(true);
      await axios.put(`${API_URL}/api/image/${guildId}`, { imageUrl: imageInput });
      setImageUrl(imageInput);
      toast.success('Image updated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save image.');
    } finally {
      setUploading(false);
    }
  };

  // Upload image file
  const handleUploadFile = async (file) => {
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, GIF, WEBP images are allowed!');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image must be under 8MB!');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await axios.post(`${API_URL}/api/image/${guildId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setImageUrl(res.data.imageUrl);
      setImageInput(res.data.imageUrl);
      toast.success('Image uploaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  // Remove image
  const handleRemoveImage = async () => {
    try {
      setUploading(true);
      await axios.delete(`${API_URL}/api/image/${guildId}`);
      setImageUrl('');
      setImageInput('');
      toast.success('Image removed!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove image.');
    } finally {
      setUploading(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadFile(e.target.files[0]);
    }
  };

  const updateCurrentRule = (field, value) => {
    const updatedRules = [...rules];
    const index = activeTab - 1;
    if (updatedRules[index]) {
      updatedRules[index] = { ...updatedRules[index], [field]: value };
      setRules(updatedRules);
    }
  };

  if (loading) {
    return (
      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Loading dashboard...</h2>
      </main>
    );
  }

  const currentRule = rules[activeTab - 1] || { title: '', content: '' };

  return (
    <main style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => router.push('/')}>
            ← Back
          </button>
          <h1>Server Dashboard</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           {!channelId && (
            <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>
              ⚠️ No rules channel set in Discord. Use `/setruleschannel`!
            </span>
          )}
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save & Sync to Discord'}
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: '300px', padding: '1.5rem', borderRight: '1px solid var(--card-border)', overflowY: 'auto' }}>
          <h3 style={{ marginBottom: '1rem', color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Pages
          </h3>
          <div className="tabs">
            {[1, 2, 3, 4].map(page => (
              <button
                key={page}
                className={`tab ${activeTab === page ? 'active' : ''}`}
                onClick={() => setActiveTab(page)}
              >
                Page {page}: {rules[page - 1]?.title || `Page ${page}`}
              </button>
            ))}
          </div>

          {/* ===== IMAGE SETTINGS ===== */}
          <div className="image-settings-section">
            <h3 style={{ marginBottom: '0.75rem', color: '#94a3b8', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              🖼️ Embed Image
            </h3>

            {/* Mode Toggle */}
            <div className="image-mode-toggle">
              <button
                className={`image-mode-btn ${imageMode === 'upload' ? 'active' : ''}`}
                onClick={() => setImageMode('upload')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                </svg>
                Upload
              </button>
              <button
                className={`image-mode-btn ${imageMode === 'link' ? 'active' : ''}`}
                onClick={() => setImageMode('link')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                </svg>
                Link
              </button>
            </div>

            {/* Upload Mode */}
            {imageMode === 'upload' && (
              <div style={{ marginTop: '0.75rem' }}>
                <div
                  className={`image-dropzone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <>
                      <div className="upload-spinner"></div>
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <div className="dropzone-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(88, 101, 242, 0.6)">
                          <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                        </svg>
                      </div>
                      <span style={{ color: '#f1f5f9', fontSize: '0.9rem', fontWeight: '600' }}>
                        Drop image here
                      </span>
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                        or click to browse
                      </span>
                      <span style={{ color: '#475569', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                        JPG, PNG, GIF, WEBP • Max 8MB
                      </span>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </div>
            )}

            {/* Link Mode */}
            {imageMode === 'link' && (
              <div style={{ marginTop: '0.75rem' }}>
                <div className="input-group" style={{ marginBottom: '0.5rem' }}>
                  <input
                    type="url"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="https://i.imgur.com/example.png"
                    style={{ fontSize: '0.85rem', padding: '0.6rem 0.8rem' }}
                  />
                </div>
                <button
                  className="btn btn-save-image"
                  onClick={handleSaveImageLink}
                  disabled={uploading || !imageInput.trim()}
                  style={{ width: '100%' }}
                >
                  {uploading ? 'Saving...' : '🔗 Save Link'}
                </button>
              </div>
            )}

            {/* Current Image Preview */}
            {imageUrl && (
              <div style={{ marginTop: '0.75rem' }}>
                <div className="image-preview-box">
                  <img
                    src={imageUrl}
                    alt="Embed preview"
                    onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                    style={{ width: '100%', borderRadius: '8px', maxHeight: '160px', objectFit: 'cover' }}
                  />
                </div>
                <button
                  className="btn-remove-image"
                  onClick={handleRemoveImage}
                  disabled={uploading}
                >
                  🗑️ Remove Image
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <div className="grid grid-cols-2" style={{ height: '100%' }}>
            
            {/* Form */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Edit Page {activeTab}</h2>
              
              <div className="input-group">
                <label>Page Title</label>
                <input 
                  type="text" 
                  value={currentRule.title} 
                  onChange={(e) => updateCurrentRule('title', e.target.value)}
                  placeholder="e.g., 📜 General Rules"
                />
              </div>

              <div className="input-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label>Content (Supports Discord Markdown)</label>
                <textarea 
                  style={{ flex: 1 }}
                  value={currentRule.content} 
                  onChange={(e) => updateCurrentRule('content', e.target.value)}
                  placeholder="Enter rule content here..."
                ></textarea>
              </div>
            </div>

            {/* Discord Preview */}
            <div className="card" style={{ backgroundColor: '#313338', borderColor: '#1e1f22' }}>
              <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #1e1f22', paddingBottom: '1rem' }}>Discord Preview</h2>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#5865F2', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                  🤖
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '500', color: '#f2f3f5' }}>Rules Bot</span>
                    <span style={{ fontSize: '0.625rem', backgroundColor: '#5865F2', color: 'white', padding: '2px 4px', borderRadius: '3px', fontWeight: 'bold' }}>APP</span>
                  </div>
                  
                  {/* Embed Preview */}
                  <div style={{ 
                    marginTop: '0.5rem', 
                    backgroundColor: '#2b2d31', 
                    borderLeft: `4px solid ${PAGE_COLORS[activeTab - 1]}`,
                    borderRadius: '4px',
                    padding: '1rem'
                  }}>
                    <h3 style={{ color: '#ffffff', marginBottom: '0.5rem', fontSize: '1rem' }}>
                      {currentRule.title || 'Untitled Page'}
                    </h3>
                    <div className="markdown-preview">
                      {currentRule.content || 'No content provided.'}
                    </div>

                    {/* Custom Image in embed */}
                    {imageUrl && (
                      <div style={{ marginTop: '1rem' }}>
                        <img
                          src={imageUrl}
                          alt="Embed image"
                          onError={(e) => { e.target.style.display = 'none'; }}
                          onLoad={(e) => { e.target.style.display = 'block'; }}
                          style={{ width: '100%', borderRadius: '4px', maxHeight: '200px', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Buttons Preview */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <button style={{ backgroundColor: '#4e5058', color: '#dbdee1', padding: '6px 16px', borderRadius: '4px', fontSize: '14px', fontWeight: '500' }}>⏮</button>
                    <button style={{ backgroundColor: '#5865F2', color: 'white', padding: '6px 16px', borderRadius: '4px', fontSize: '14px', fontWeight: '500' }}>◀ Previous</button>
                    <button style={{ backgroundColor: '#4e5058', color: '#dbdee1', padding: '6px 16px', borderRadius: '4px', fontSize: '14px', fontWeight: '500' }}>{activeTab} / 4</button>
                    <button style={{ backgroundColor: '#5865F2', color: 'white', padding: '6px 16px', borderRadius: '4px', fontSize: '14px', fontWeight: '500' }}>Next ▶</button>
                    <button style={{ backgroundColor: '#4e5058', color: '#dbdee1', padding: '6px 16px', borderRadius: '4px', fontSize: '14px', fontWeight: '500' }}>⏭</button>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
