import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const S = {
  bg: '#08080d', surface: '#101018', surfaceHigh: '#17172a', surfaceHighest: '#1e1e2c',
  primary: '#c084fc', primaryGlow: 'rgba(192,132,252,0.1)',
  secondary: '#38bdf8', green: '#4ade80', amber: '#fbbf24', red: '#f87171', pink: '#f472b6',
  text: '#f1f5f9', textSub: '#94a3b8', outline: '#252535',
};

const LANGUAGES = ['JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust'];
const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const LOOKING_FOR_OPTIONS = ['Practice', 'Mock Interview', 'Both'];

function ProfileCard({ profile, onBook }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: S.surface, borderRadius: '18px', border: `1px solid ${hovered ? S.primary : S.outline}`,
        padding: '20px', transition: 'all 0.22s', position: 'relative',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? `0 10px 32px rgba(192,132,252,0.1)` : 'none',
      }}>
      {/* Online indicator */}
      <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: profile.online ? S.green : S.outline }} />
        <span style={{ color: profile.online ? S.green : S.textSub, fontSize: '0.65rem', fontWeight: 600 }}>
          {profile.online ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} alt={profile.username}
          style={{ width: '48px', height: '48px', borderRadius: '12px', background: S.surfaceHigh, border: `2px solid ${profile.online ? S.green : S.outline}` }} />
        <div>
          <div style={{ color: S.text, fontWeight: 700, fontSize: '0.95rem' }}>{profile.username}</div>
          <div style={{ background: `${S.primary}18`, color: S.primary, fontSize: '0.62rem', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', marginTop: '2px', display: 'inline-block' }}>{profile.experience}</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
        {[{ l: 'Sessions', v: profile.totalSessions }, { l: 'Rating', v: profile.avgRating?.toFixed(1) || '—' }, { l: 'Reviews', v: profile.reviewCount }].map(s => (
          <div key={s.l} style={{ background: S.surfaceHigh, borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
            <div style={{ color: S.primary, fontWeight: 800, fontSize: '0.9rem' }}>{s.v}</div>
            <div style={{ color: S.textSub, fontSize: '0.6rem', marginTop: '1px' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Skills */}
      {(profile.skills || []).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
          {(profile.skills || []).slice(0, 4).map(s => <span key={s} style={{ background: S.surfaceHighest, color: S.textSub, fontSize: '0.65rem', padding: '3px 8px', borderRadius: '5px' }}>{s}</span>)}
        </div>
      )}

      {/* Languages */}
      {(profile.preferredLanguages || []).length > 0 && (
        <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {(profile.preferredLanguages || []).slice(0, 3).map(l => <span key={l} style={{ background: 'rgba(192,132,252,0.1)', color: S.primary, fontSize: '0.62rem', fontWeight: 600, padding: '2px 8px', borderRadius: '5px' }}>{l}</span>)}
        </div>
      )}

      {profile.bio && <p style={{ color: S.textSub, fontSize: '0.75rem', lineHeight: 1.5, margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{profile.bio}</p>}

      <div style={{ display: 'flex', gap: '6px' }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '7px', borderRadius: '8px', background: S.surfaceHigh, fontSize: '0.7rem', color: S.textSub }}>
          Looking for: <span style={{ color: S.amber, fontWeight: 600 }}>{profile.lookingFor}</span>
        </div>
        <button onClick={() => onBook(profile)} style={{ padding: '8px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '0.78rem', background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          Book →
        </button>
      </div>
    </div>
  );
}

function BookSessionModal({ partner, onClose, onSuccess }) {
  const [form, setForm] = useState({ scheduledAt: '', duration: 60, role: 'both', topic: 'Arrays', difficulty: 'Medium', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleSubmit = async () => {
    if (!form.scheduledAt) { toast.error('Please pick a date and time'); return; }
    setSubmitting(true);
    try {
      const res = await axios.post('/api/peer/sessions', {
        requesterId: user._id, requesterName: user.username || 'You',
        partnerId: partner.userId, partnerName: partner.username,
        ...form, scheduledAt: new Date(form.scheduledAt)
      });
      toast.success('📅 Session booked!');
      onSuccess(res.data);
      onClose();
    } catch { toast.error('Booking failed'); } finally { setSubmitting(false); }
  };

  const inp = { width: '100%', padding: '10px 12px', borderRadius: '9px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.875rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', marginBottom: '14px' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }}>
      <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '22px', padding: '30px', width: '100%', maxWidth: '480px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '14px', background: S.surfaceHigh, border: 'none', color: S.textSub, borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer' }}>✕</button>
        <h3 style={{ color: S.text, fontWeight: 700, fontSize: '1.2rem', margin: '0 0 4px' }}>📅 Book Session with {partner.username}</h3>
        <p style={{ color: S.textSub, fontSize: '0.82rem', margin: '0 0 20px' }}>{partner.experience} level · Rating: ⭐ {partner.avgRating?.toFixed(1)}</p>

        <label style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>DATE & TIME</label>
        <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} style={{ ...inp }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>DURATION (min)</label>
            <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) }))} style={{ ...inp }}>
              {[30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} min</option>)}
            </select>
          </div>
          <div>
            <label style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>YOUR ROLE</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ ...inp }}>
              {['both', 'interviewer', 'interviewee'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <label style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>TOPIC</label>
        <input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} placeholder="e.g. Dynamic Programming, System Design..." style={{ ...inp }} />

        <label style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>DIFFICULTY</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          {['Easy', 'Medium', 'Hard'].map(d => <button key={d} onClick={() => setForm(f => ({ ...f, difficulty: d }))} style={{ flex: 1, padding: '8px', borderRadius: '8px', fontWeight: 600, fontSize: '0.78rem', border: `1px solid ${form.difficulty === d ? S.primary : S.outline}`, cursor: 'pointer', background: form.difficulty === d ? S.primaryGlow : 'transparent', color: form.difficulty === d ? S.primary : S.textSub, fontFamily: 'inherit' }}>{d}</button>)}
        </div>

        <label style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>NOTES (optional)</label>
        <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Any prep notes or expectations..." style={{ ...inp, resize: 'none' }} />

        <button onClick={handleSubmit} disabled={submitting} style={{ width: '100%', padding: '13px', borderRadius: '11px', fontWeight: 700, fontSize: '0.95rem', background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: '#fff', border: 'none', cursor: submitting ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.7 : 1 }}>
          {submitting ? '⏳ Booking...' : '📅 Confirm Booking'}
        </button>
      </div>
    </div>
  );
}

function FeedbackModal({ session, onClose, fromUser }) {
  const [rating, setRating] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [problemSolving, setProblemSolving] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Rating required'); return; }
    setSubmitting(true);
    try {
      await axios.post(`/api/peer/sessions/${session._id}/feedback`, { fromUser, userId: user._id, rating, communication, problemSolving, comment });
      toast.success('⭐ Feedback submitted!');
      onClose();
    } catch { toast.error('Failed to submit feedback'); } finally { setSubmitting(false); }
  };

  const RatingRow = ({ label, value, onChange }) => (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ color: S.textSub, fontSize: '0.75rem', fontWeight: 600 }}>{label}</span>
        <span style={{ color: S.primary, fontSize: '0.75rem', fontWeight: 700 }}>{value}/5</span>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {[1, 2, 3, 4, 5].map(i => <span key={i} onClick={() => onChange(i)} style={{ fontSize: '1.4rem', cursor: 'pointer', color: value >= i ? S.amber : S.outline }}>★</span>)}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }}>
      <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '22px', padding: '28px', width: '100%', maxWidth: '420px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '14px', background: S.surfaceHigh, border: 'none', color: S.textSub, borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer' }}>✕</button>
        <h3 style={{ color: S.text, fontWeight: 700, margin: '0 0 20px', fontSize: '1.1rem' }}>⭐ Rate Your Session</h3>
        <RatingRow label="Overall Rating" value={rating} onChange={setRating} />
        <RatingRow label="Communication" value={communication} onChange={setCommunication} />
        <RatingRow label="Problem Solving" value={problemSolving} onChange={setProblemSolving} />
        <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience..." rows={3}
          style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.85rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', resize: 'none', marginBottom: '16px' }} />
        <button onClick={handleSubmit} disabled={submitting || rating === 0} style={{ width: '100%', padding: '12px', borderRadius: '10px', fontWeight: 700, background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: '#fff', border: 'none', cursor: submitting ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
          Submit Feedback
        </button>
      </div>
    </div>
  );
}

export default function PeerInterviews() {
  const [profiles, setProfiles] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('find');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [lookingFor, setLookingFor] = useState('all');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [bookModal, setBookModal] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [quickMatching, setQuickMatching] = useState(false);
  const [quickMatch, setQuickMatch] = useState(null);
  const [profileSetup, setProfileSetup] = useState(false);
  const [myProfile, setMyProfile] = useState({ username: '', experience: 'Intermediate', skills: '', preferredLanguages: [], lookingFor: 'Both', bio: '' });
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user._id || 'guest';

  const fetchProfiles = useCallback(async () => {
    try {
      const params = {};
      if (experienceFilter !== 'all') params.experience = experienceFilter;
      if (lookingFor !== 'all') params.lookingFor = lookingFor;
      if (onlineOnly) params.online = true;
      const res = await axios.get('/api/peer/profiles', { params });
      setProfiles(res.data || []);
    } catch {
      try { await axios.post('/api/peer/seed/bulk'); const r = await axios.get('/api/peer/profiles'); setProfiles(r.data || []); } catch {}
    } finally { setLoading(false); }
  }, [experienceFilter, lookingFor, onlineOnly]);

  const fetchSessions = useCallback(async () => {
    try { const res = await axios.get(`/api/peer/sessions/user/${userId}`); setMySessions(res.data || []); } catch {}
  }, [userId]);

  useEffect(() => { fetchProfiles(); fetchSessions(); }, [fetchProfiles, fetchSessions]);

  const handleQuickMatch = async () => {
    setQuickMatching(true);
    try {
      const res = await axios.post('/api/peer/quick-match', { userId });
      setQuickMatch(res.data);
      toast.success('🎯 Match found!');
    } catch (e) { toast.error(e.response?.data?.error || 'No matches available'); } finally { setQuickMatching(false); }
  };

  const handleSaveProfile = async () => {
    try {
      await axios.post('/api/peer/profile', {
        userId, username: myProfile.username || user.username, experience: myProfile.experience,
        skills: myProfile.skills.split(',').map(s => s.trim()).filter(Boolean),
        preferredLanguages: myProfile.preferredLanguages, lookingFor: myProfile.lookingFor, bio: myProfile.bio, online: true
      });
      toast.success('✅ Profile saved!');
      setProfileSetup(false);
      fetchProfiles();
    } catch { toast.error('Failed to save profile'); }
  };

  const handleConfirmSession = async (sessionId) => {
    try { await axios.patch(`/api/peer/sessions/${sessionId}/confirm`); fetchSessions(); toast.success('Session confirmed!'); } catch { toast.error('Failed to confirm'); }
  };

  const handleCancelSession = async (sessionId) => {
    try { await axios.patch(`/api/peer/sessions/${sessionId}/cancel`); fetchSessions(); toast.info('Session cancelled'); } catch { toast.error('Failed to cancel'); }
  };

  const statusColors = { pending: S.amber, confirmed: S.green, completed: S.secondary, cancelled: S.red, 'no-show': S.red };

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, paddingTop: '88px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); *{box-sizing:border-box;} @keyframes pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.05);}}`}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px' }}>
        {/* HERO */}
        <div style={{ padding: '36px 0 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, margin: '0 0 8px', background: `linear-gradient(135deg, ${S.text}, ${S.primary}, ${S.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Peer Interviews
            </h1>
            <p style={{ color: S.textSub, fontSize: '1rem', margin: 0 }}>Practice with real developers · Give and receive mock interviews</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={handleQuickMatch} disabled={quickMatching} style={{ padding: '12px 22px', borderRadius: '11px', fontWeight: 700, fontSize: '0.9rem', background: quickMatching ? S.surfaceHigh : `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: quickMatching ? S.textSub : '#fff', border: 'none', cursor: quickMatching ? 'wait' : 'pointer', fontFamily: 'inherit', animation: quickMatching ? 'pulse 1s infinite' : 'none' }}>
              {quickMatching ? '🎯 Matching...' : '⚡ Quick Match'}
            </button>
            <button onClick={() => setProfileSetup(true)} style={{ padding: '12px 18px', borderRadius: '11px', fontWeight: 700, fontSize: '0.9rem', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, cursor: 'pointer', fontFamily: 'inherit' }}>✏️ My Profile</button>
          </div>
        </div>

        {/* Quick Match Result */}
        {quickMatch && (
          <div style={{ background: 'rgba(192,132,252,0.08)', border: `1px solid rgba(192,132,252,0.3)`, borderRadius: '14px', padding: '18px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ color: S.primary, fontWeight: 700, marginBottom: '4px' }}>🎯 Match Found: {quickMatch.partner?.username}</div>
              <div style={{ color: S.textSub, fontSize: '0.82rem' }}>{quickMatch.partner?.experience} · ⭐ {quickMatch.partner?.avgRating?.toFixed(1)} · {quickMatch.partner?.bio?.substring(0, 60)}...</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a href={quickMatch.meetingLink} target="_blank" rel="noreferrer" style={{ padding: '10px 18px', borderRadius: '9px', fontWeight: 700, fontSize: '0.85rem', background: `linear-gradient(135deg, ${S.green}, ${S.secondary})`, color: '#fff', textDecoration: 'none' }}>Join Now</a>
              <button onClick={() => setQuickMatch(null)} style={{ padding: '10px 12px', borderRadius: '9px', background: S.surfaceHigh, border: 'none', color: S.textSub, cursor: 'pointer' }}>✕</button>
            </div>
          </div>
        )}

        {/* TABS */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '24px', background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '11px', padding: '3px', width: 'fit-content' }}>
          {[['find', '🔍 Find Partners'], ['sessions', '📅 My Sessions']].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '9px 22px', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: tab === t ? `linear-gradient(135deg, ${S.primary}, ${S.secondary})` : 'transparent', color: tab === t ? '#fff' : S.textSub }}>{l}</button>
          ))}
        </div>

        {tab === 'find' && (
          <>
            {/* Filters */}
            <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '14px', padding: '14px 18px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
                {['all', ...EXPERIENCE_LEVELS].map(e => (
                  <button key={e} onClick={() => setExperienceFilter(e)} style={{ padding: '6px 12px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600, border: `1px solid ${experienceFilter === e ? S.primary : S.outline}`, cursor: 'pointer', background: experienceFilter === e ? S.primaryGlow : 'transparent', color: experienceFilter === e ? S.primary : S.textSub, fontFamily: 'inherit' }}>{e}</button>
                ))}
              </div>
              <select value={lookingFor} onChange={e => setLookingFor(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.82rem', fontFamily: 'inherit', cursor: 'pointer' }}>
                {['all', ...LOOKING_FOR_OPTIONS].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <label style={{ display: 'flex', gap: '6px', alignItems: 'center', cursor: 'pointer', color: S.textSub, fontSize: '0.82rem' }}>
                <input type="checkbox" checked={onlineOnly} onChange={e => setOnlineOnly(e.target.checked)} /> 🟢 Online only
              </label>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ background: S.surface, borderRadius: '18px', height: '270px', backgroundImage: `linear-gradient(90deg, ${S.surface}, ${S.surfaceHigh}, ${S.surface})`, backgroundSize: '200%', animation: 'shimmer 1.5s infinite' }} />)}
              </div>
            ) : profiles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: S.textSub }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>👥</div>
                <h3 style={{ color: S.text }}>No partners found</h3>
                <p>Try removing some filters or check back later!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                {profiles.map(p => <ProfileCard key={p._id} profile={p} onBook={setBookModal} />)}
              </div>
            )}
          </>
        )}

        {tab === 'sessions' && (
          <div>
            {mySessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: S.textSub }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📅</div>
                <h3 style={{ color: S.text }}>No sessions yet</h3>
                <p>Find a partner and book your first mock interview!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {mySessions.map(s => {
                  const statusColor = statusColors[s.status] || S.textSub;
                  const isRequester = s.requesterId?.toString() === userId;
                  return (
                    <div key={s._id} style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '14px', padding: '16px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '5px' }}>
                            <span style={{ background: `${statusColor}15`, color: statusColor, fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: '5px', textTransform: 'uppercase' }}>{s.status}</span>
                          </div>
                          <div style={{ color: S.text, fontWeight: 700 }}>
                            {isRequester ? `With: ${s.partnerName}` : `From: ${s.requesterName}`}
                          </div>
                          <div style={{ color: S.textSub, fontSize: '0.78rem', marginTop: '3px' }}>
                            📅 {s.scheduledAt ? new Date(s.scheduledAt).toLocaleString() : 'TBD'} · {s.duration} min · {s.topic} · {s.difficulty}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                          {s.status === 'confirmed' && s.meetingLink && (
                            <a href={s.meetingLink} target="_blank" rel="noreferrer" style={{ padding: '8px 14px', borderRadius: '8px', background: `linear-gradient(135deg, ${S.green}, ${S.secondary})`, color: '#fff', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 700 }}>Join Meeting</a>
                          )}
                          {s.status === 'pending' && !isRequester && (
                            <button onClick={() => handleConfirmSession(s._id)} style={{ padding: '8px 14px', borderRadius: '8px', background: S.green, color: '#000', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', fontFamily: 'inherit' }}>✓ Confirm</button>
                          )}
                          {(s.status === 'pending' || s.status === 'confirmed') && (
                            <button onClick={() => handleCancelSession(s._id)} style={{ padding: '8px 14px', borderRadius: '8px', background: 'rgba(248,113,113,0.1)', color: S.red, border: `1px solid rgba(248,113,113,0.2)`, cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', fontFamily: 'inherit' }}>Cancel</button>
                          )}
                          {s.status === 'completed' && !s.feedback?.[isRequester ? 'fromRequester' : 'fromPartner']?.submittedAt && (
                            <button onClick={() => setFeedbackModal({ session: s, fromUser: isRequester ? 'requester' : 'partner' })} style={{ padding: '8px 14px', borderRadius: '8px', background: S.primaryGlow, color: S.primary, border: `1px solid ${S.primary}30`, cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', fontFamily: 'inherit' }}>⭐ Rate</button>
                          )}
                        </div>
                      </div>

                      {s.notes && <p style={{ color: S.textSub, fontSize: '0.75rem', margin: '10px 0 0', paddingTop: '10px', borderTop: `1px solid ${S.outline}` }}>📝 {s.notes}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {bookModal && <BookSessionModal partner={bookModal} onClose={() => setBookModal(null)} onSuccess={fetchSessions} />}
      {feedbackModal && <FeedbackModal session={feedbackModal.session} fromUser={feedbackModal.fromUser} onClose={() => setFeedbackModal(null)} />}

      {/* Profile Setup Modal */}
      {profileSetup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '22px', padding: '28px', width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button onClick={() => setProfileSetup(false)} style={{ position: 'absolute', top: '14px', right: '14px', background: S.surfaceHigh, border: 'none', color: S.textSub, borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer' }}>✕</button>
            <h3 style={{ color: S.text, fontWeight: 700, margin: '0 0 20px', fontSize: '1.2rem' }}>✏️ Set Up Your Partner Profile</h3>

            {[{ l: 'USERNAME', k: 'username', p: 'Your display name' }, { l: 'BIO', k: 'bio', p: 'Tell others about yourself...', ta: true }, { l: 'SKILLS (comma-separated)', k: 'skills', p: 'DSA, System Design, React...' }].map(f => (
              <div key={f.k} style={{ marginBottom: '14px' }}>
                <label style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{f.l}</label>
                {f.ta ? (
                  <textarea value={myProfile[f.k]} onChange={e => setMyProfile(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.p} rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.85rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', resize: 'none' }} />
                ) : (
                  <input value={myProfile[f.k]} onChange={e => setMyProfile(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.p} style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.85rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
                )}
              </div>
            ))}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>EXPERIENCE</label>
                <select value={myProfile.experience} onChange={e => setMyProfile(p => ({ ...p, experience: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontFamily: 'inherit', cursor: 'pointer' }}>
                  {EXPERIENCE_LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>LOOKING FOR</label>
                <select value={myProfile.lookingFor} onChange={e => setMyProfile(p => ({ ...p, lookingFor: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontFamily: 'inherit', cursor: 'pointer' }}>
                  {LOOKING_FOR_OPTIONS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>PREFERRED LANGUAGES</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {LANGUAGES.map(l => (
                  <button key={l} onClick={() => setMyProfile(p => ({ ...p, preferredLanguages: p.preferredLanguages.includes(l) ? p.preferredLanguages.filter(x => x !== l) : [...p.preferredLanguages, l] }))}
                    style={{ padding: '6px 12px', borderRadius: '7px', fontSize: '0.75rem', fontWeight: 600, border: `1px solid ${myProfile.preferredLanguages.includes(l) ? S.primary : S.outline}`, cursor: 'pointer', background: myProfile.preferredLanguages.includes(l) ? S.primaryGlow : 'transparent', color: myProfile.preferredLanguages.includes(l) ? S.primary : S.textSub, fontFamily: 'inherit' }}>{l}</button>
                ))}
              </div>
            </div>

            <button onClick={handleSaveProfile} style={{ width: '100%', padding: '13px', borderRadius: '11px', fontWeight: 700, background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.95rem' }}>Save Profile</button>
          </div>
        </div>
      )}
    </div>
  );
}
