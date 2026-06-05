import React, { useState, useEffect } from 'react';
import axios from 'axios';

const S = {
  bg: '#131319',
  surface: '#1f1f26',
  surfaceHigh: '#2a2930',
  surfaceHighest: '#35343b',
  surfaceLow: '#1b1b21',
  surfaceLowest: '#0e0e14',
  primary: '#adc6ff',
  primaryCont: '#4d8eff',
  secondary: '#d0bcff',
  secondaryCont: '#571bc1',
  tertiary: '#4ae176',
  error: '#ffb4ab',
  text: '#e4e1ea',
  textSub: '#c2c6d6',
  outline: '#8c909f',
  outlineVar: '#424754',
  onPrimary: '#002e6a',
};

const Settings = () => {
  const [settings, setSettings] = useState({
    theme: 'dark',
    codeEditorLanguage: 'python',
    fontSize: '14',
    autoSave: true,
    aiStrictness: 'medium',
    notifications: true,
    emailNotifications: false
  });
  
  const [userBio, setUserBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const currentUserId = localStorage.getItem('devleap_user_id');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (!currentUserId) return;
        const res = await axios.get(`/api/users/${currentUserId}/progress`);
        setUserBio(res.data.bio || '');
        setProfilePicture(res.data.profilePicture || '');
        const savedSettings = localStorage.getItem('devleap_settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [currentUserId]);

  const handleSettingsChange = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    localStorage.setItem('devleap_settings', JSON.stringify(updated));
    setMessage('✅ Settings saved globally!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleProfileUpdate = async () => {
    try {
      await axios.put(`/api/tracker/profile/${currentUserId}`, {
        bio: userBio,
        profilePicture: profilePicture
      });
      setMessage('✅ Profile updated in real-time!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Failed to update profile');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: S.bg, color: S.text, fontFamily: 'system-ui' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: `4px solid ${S.surfaceHigh}`, borderTopColor: S.primary, animation: 'spin 1s linear infinite' }} />
              <div style={{ fontWeight: 600, letterSpacing: 1 }}>Loading Settings...</div>
          </div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
  );

  const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', background: S.surfaceHigh, border: `1px solid ${S.outlineVar}`, color: S.text, outline: 'none', fontFamily: 'inherit' };
  const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 700, color: S.outlineVar, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' };
  const cardStyle = { background: S.surface, borderRadius: '16px', border: `1px solid ${S.surfaceHigh}`, padding: '30px', marginBottom: '24px' };

  return (
    <div style={{ padding: '90px 5% 50px 5%', minHeight: '100vh', background: S.bg, color: S.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 24px 0' }}>Settings & Preferences</h1>

        {message && (
          <div style={{ background: message.includes('✅') ? 'rgba(74, 225, 118, 0.15)' : 'rgba(255, 180, 171, 0.15)', color: message.includes('✅') ? S.tertiary : S.error, padding: '16px', borderRadius: '12px', marginBottom: '24px', fontWeight: 600, border: `1px solid ${message.includes('✅') ? 'rgba(74, 225, 118, 0.3)' : 'rgba(255, 180, 171, 0.3)'}` }}>
            {message}
          </div>
        )}

        {/* PROFILE SECTION */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <span style={{ fontSize: '1.4rem' }}>👤</span>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Profile Information</h2>
          </div>
          
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: `4px solid ${S.surfaceHigh}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', fontWeight: 900, color: '#fff', overflow: 'hidden' }}>
                {profilePicture && !profilePicture.includes('api.dicebear.com/7.x/avataaars') ? (
                  <img src={profilePicture} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  'U'
                )}
              </div>
            </div>
            
            <div style={{ flex: 1, minWidth: '300px' }}>
              <label style={labelStyle}>Bio</label>
              <textarea 
                value={userBio} 
                onChange={(e) => setUserBio(e.target.value)}
                placeholder="Tell us about yourself..."
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', marginBottom: '20px' }}
              />
              
              <label style={labelStyle}>Profile Picture URL</label>
              <input 
                type="text" 
                value={profilePicture} 
                onChange={(e) => setProfilePicture(e.target.value)}
                placeholder="https://example.com/avatar.png"
                style={{ ...inputStyle, marginBottom: '20px' }}
              />
              
              <button onClick={handleProfileUpdate} style={{ background: S.primary, color: S.bg, border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '0.95rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                Save Profile Changes
              </button>
            </div>
          </div>
        </div>

        {/* IDE SETTINGS */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <span style={{ fontSize: '1.4rem' }}>💻</span>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Code Editor Settings</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <div>
              <label style={labelStyle}>Theme</label>
              <select value={settings.theme} onChange={(e) => handleSettingsChange('theme', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="dark">Dark Theme</option>
                <option value="light">Light Theme (Preview)</option>
                <option value="highcontrast">High Contrast</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Font Size</label>
              <input type="number" min="10" max="24" value={settings.fontSize} onChange={(e) => handleSettingsChange('fontSize', e.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Default Language</label>
              <select value={settings.codeEditorLanguage} onChange={(e) => handleSettingsChange('codeEditorLanguage', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="python">Python 3</option>
                <option value="javascript">JavaScript (Node)</option>
                <option value="java">Java 17</option>
                <option value="cpp">C++ 20</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: 600, color: S.text }}>
                <div style={{ width: '48px', height: '24px', borderRadius: '12px', background: settings.autoSave ? S.primary : S.surfaceHigh, position: 'relative', transition: 'all 0.3s' }}>
                   <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: settings.autoSave ? S.bg : S.outline, position: 'absolute', top: '3px', left: settings.autoSave ? '27px' : '3px', transition: 'all 0.3s' }} />
                </div>
                <input type="checkbox" checked={settings.autoSave} onChange={(e) => handleSettingsChange('autoSave', e.target.checked)} style={{ display: 'none' }} />
                Auto-save code while typing
              </label>
            </div>
          </div>
        </div>

        {/* AI SETTINGS */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <span style={{ fontSize: '1.4rem' }}>🤖</span>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>DevAI Assistant Settings</h2>
          </div>
          
          <div style={{ maxWidth: '400px' }}>
            <label style={labelStyle}>AI Hint Strictness</label>
            <select value={settings.aiStrictness} onChange={(e) => handleSettingsChange('aiStrictness', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="strict">Strict (Minimal nudges)</option>
              <option value="medium">Medium (Balanced)</option>
              <option value="lenient">Lenient (Detailed code generation)</option>
            </select>
            <p style={{ fontSize: '0.85rem', color: S.outline, marginTop: '8px' }}>Determines how much direct code DevAI is allowed to write for you during hints.</p>
          </div>
        </div>

        {/* NOTIFICATION SETTINGS */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <span style={{ fontSize: '1.4rem' }}>🔔</span>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Notifications</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: 600, color: S.text }}>
              <div style={{ width: '48px', height: '24px', borderRadius: '12px', background: settings.notifications ? S.primary : S.surfaceHigh, position: 'relative', transition: 'all 0.3s' }}>
                   <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: settings.notifications ? S.bg : S.outline, position: 'absolute', top: '3px', left: settings.notifications ? '27px' : '3px', transition: 'all 0.3s' }} />
              </div>
              <input type="checkbox" checked={settings.notifications} onChange={(e) => handleSettingsChange('notifications', e.target.checked)} style={{ display: 'none' }} />
              In-app notifications (leaderboard changes, new interview questions, etc.)
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: 600, color: S.text }}>
              <div style={{ width: '48px', height: '24px', borderRadius: '12px', background: settings.emailNotifications ? S.primary : S.surfaceHigh, position: 'relative', transition: 'all 0.3s' }}>
                   <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: settings.emailNotifications ? S.bg : S.outline, position: 'absolute', top: '3px', left: settings.emailNotifications ? '27px' : '3px', transition: 'all 0.3s' }} />
              </div>
              <input type="checkbox" checked={settings.emailNotifications} onChange={(e) => handleSettingsChange('emailNotifications', e.target.checked)} style={{ display: 'none' }} />
              Email notifications (weekly digest, interview tips, new problems)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;