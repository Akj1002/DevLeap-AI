import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const S = {
  bg: '#0a0a0f', surface: '#13131c', surfaceHigh: '#1a1a26', surfaceHighest: '#222230',
  primary: '#a78bfa', primaryGlow: 'rgba(167,139,250,0.15)',
  secondary: '#38bdf8', green: '#4ade80', amber: '#fbbf24', red: '#f87171',
  pink: '#f472b6', text: '#f1f5f9', textSub: '#94a3b8',
  outline: '#2d2d40', outlineVar: '#1a1a28',
};

const EXPERTISE_AREAS = ['All', 'System Design', 'Backend', 'Frontend', 'Machine Learning', 'DevOps', 'iOS', 'Full Stack', 'Career', 'Startups', 'Data Science', 'Cloud'];
const SORT_OPTIONS = ['featured', 'rating', 'sessions', 'price_low', 'price_high'];
const SORT_LABELS = { featured: '⭐ Featured', rating: '🌟 Top Rated', sessions: '🧑‍🎓 Most Sessions', price_low: '💰 Price: Low', price_high: '💰 Price: High' };

function StarRating({ rating, size = 14 }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: `${size}px`, color: i <= Math.round(rating) ? S.amber : S.outline }}>★</span>
      ))}
    </div>
  );
}

function MentorCard({ mentor, onBook, onReview }) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: S.surface, borderRadius: '20px', border: `1px solid ${hovered ? S.primary : S.outline}`,
        overflow: 'hidden', transition: 'all 0.25s',
        boxShadow: hovered ? `0 12px 40px rgba(167,139,250,0.12)` : 'none',
        transform: hovered ? 'translateY(-4px)' : 'none',
      }}>
      {/* Gradient Banner */}
      <div style={{ height: '80px', background: `linear-gradient(135deg, ${S.primaryGlow}, rgba(56,189,248,0.1))`, position: 'relative' }}>
        {mentor.featured && <span style={{ position: 'absolute', top: '10px', right: '12px', background: 'rgba(251,191,36,0.2)', color: S.amber, fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', border: '1px solid rgba(251,191,36,0.4)' }}>⭐ FEATURED</span>}
        {mentor.verified && <span style={{ position: 'absolute', top: '10px', left: '12px', background: 'rgba(74,222,128,0.15)', color: S.green, fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', border: '1px solid rgba(74,222,128,0.3)' }}>✓ VERIFIED</span>}
      </div>

      <div style={{ padding: '0 24px 24px', marginTop: '-40px' }}>
        {/* Avatar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '14px' }}>
          <img src={mentor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}`}
            alt={mentor.name}
            style={{ width: '72px', height: '72px', borderRadius: '50%', border: `3px solid ${S.bg}`, background: S.surfaceHigh, objectFit: 'cover' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: S.green, fontWeight: 800, fontSize: '1.1rem' }}>
              {mentor.hourlyRate === 0 ? 'Free' : `$${mentor.hourlyRate}/hr`}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginTop: '2px' }}>
              <span style={{ color: S.amber, fontWeight: 700, fontSize: '0.85rem' }}>{mentor.avgRating?.toFixed(1) || '—'}</span>
              <StarRating rating={mentor.avgRating || 0} size={12} />
              <span style={{ color: S.textSub, fontSize: '0.72rem' }}>({mentor.reviewCount || 0})</span>
            </div>
          </div>
        </div>

        {/* Name + Title */}
        <div style={{ marginBottom: '12px' }}>
          <h3 style={{ color: S.text, fontWeight: 700, fontSize: '1.05rem', margin: '0 0 2px' }}>{mentor.name}</h3>
          <div style={{ color: S.textSub, fontSize: '0.82rem' }}>{mentor.title} {mentor.company && `@ ${mentor.company}`}</div>
        </div>

        {/* Expertise Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '14px' }}>
          {(mentor.expertise || []).map(e => (
            <span key={e} style={{ background: S.primaryGlow, color: S.primary, fontSize: '0.68rem', fontWeight: 600, padding: '3px 9px', borderRadius: '6px' }}>{e}</span>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: S.surfaceHigh, borderRadius: '12px', padding: '12px', marginBottom: '14px' }}>
          {[
            { label: 'Sessions', value: mentor.totalSessions || 0 },
            { label: 'Students', value: mentor.totalStudents || 0 },
            { label: 'Rating', value: `${mentor.avgRating?.toFixed(1) || '—'}/5` },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ color: S.text, fontWeight: 700, fontSize: '0.95rem' }}>{s.value}</div>
              <div style={{ color: S.textSub, fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bio */}
        {mentor.bio && (
          <div style={{ marginBottom: '14px' }}>
            <p style={{ color: S.textSub, fontSize: '0.8rem', lineHeight: 1.6, margin: 0, display: expanded ? 'block' : '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {mentor.bio}
            </p>
            {mentor.bio.length > 100 && (
              <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: 'none', color: S.primary, fontSize: '0.75rem', cursor: 'pointer', padding: 0, marginTop: '4px', fontFamily: 'inherit' }}>
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {/* Availability badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: mentor.available ? S.green : S.red, boxShadow: mentor.available ? `0 0 6px ${S.green}` : 'none' }} />
          <span style={{ color: mentor.available ? S.green : S.red, fontSize: '0.78rem', fontWeight: 600 }}>
            {mentor.available ? 'Available Now' : 'Currently Unavailable'}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onBook(mentor)}
            disabled={!mentor.available}
            style={{
              flex: 1, padding: '11px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: mentor.available ? 'pointer' : 'not-allowed',
              background: mentor.available ? `linear-gradient(135deg, ${S.primary}, ${S.secondary})` : S.surfaceHigh,
              color: mentor.available ? '#fff' : S.textSub, transition: 'all 0.2s', fontFamily: 'inherit'
            }}
            onMouseEnter={e => { if (mentor.available) e.currentTarget.style.boxShadow = `0 4px 16px rgba(167,139,250,0.3)`; }}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            {mentor.available ? '📅 Book Session' : 'Unavailable'}
          </button>
          <button
            onClick={() => onReview(mentor)}
            style={{ padding: '11px 14px', borderRadius: '10px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.textSub, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit', fontSize: '1rem' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = S.amber; e.currentTarget.style.color = S.amber; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = S.outline; e.currentTarget.style.color = S.textSub; }}
            title="Leave a review"
          >⭐</button>
        </div>
      </div>
    </div>
  );
}

function BookingModal({ mentor, onClose }) {
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleBook = async () => {
    if (!topic || !date || !time) { toast.error('Please fill in all required fields'); return; }
    setSubmitting(true);
    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      const res = await axios.post(`/api/mentors/${mentor._id}/book`, {
        studentId: user._id, studentName: user.username, scheduledAt, duration, topic
      });
      toast.success(`📅 Session booked! Join link: ${res.data.meetingLink}`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(6px)' }}>
      <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '22px', padding: '32px', maxWidth: '500px', width: '100%', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: S.surfaceHigh, border: 'none', color: S.textSub, borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
          <img src={mentor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}`} alt={mentor.name} style={{ width: '52px', height: '52px', borderRadius: '50%', background: S.surfaceHigh }} />
          <div>
            <h2 style={{ color: S.text, margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Book with {mentor.name}</h2>
            <p style={{ color: S.textSub, margin: 0, fontSize: '0.82rem' }}>{mentor.title} · {mentor.hourlyRate === 0 ? 'Free' : `$${mentor.hourlyRate}/hr`}</p>
          </div>
        </div>

        {[
          { label: 'Session Topic *', type: 'text', value: topic, onChange: setTopic, placeholder: 'e.g., System Design Interview Prep' },
          { label: 'Date *', type: 'date', value: date, onChange: setDate, min: minDate },
          { label: 'Time *', type: 'time', value: time, onChange: setTime },
        ].map(f => (
          <div key={f.label} style={{ marginBottom: '16px' }}>
            <label style={{ color: S.textSub, fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '7px' }}>{f.label}</label>
            <input type={f.type} value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder} min={f.min}
              style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
          </div>
        ))}

        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: S.textSub, fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '7px' }}>DURATION</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[30, 60, 90].map(d => (
              <button key={d} onClick={() => setDuration(d)} style={{
                flex: 1, padding: '9px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, border: `1px solid ${duration === d ? S.primary : S.outline}`, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                background: duration === d ? S.primaryGlow : S.surfaceHigh, color: duration === d ? S.primary : S.textSub
              }}>{d} min</button>
            ))}
          </div>
        </div>

        <button onClick={handleBook} disabled={submitting} style={{ width: '100%', padding: '13px', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: '#fff', border: 'none', cursor: submitting ? 'wait' : 'pointer', fontFamily: 'inherit', transition: 'opacity 0.2s', opacity: submitting ? 0.6 : 1 }}>
          {submitting ? '⏳ Booking...' : `📅 Confirm Booking · ${mentor.hourlyRate === 0 ? 'Free' : `$${Math.round(mentor.hourlyRate * duration / 60)}`}`}
        </button>
      </div>
    </div>
  );
}

function ReviewModal({ mentor, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleReview = async () => {
    if (rating === 0) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      const res = await axios.post(`/api/mentors/${mentor._id}/review`, {
        reviewerId: user._id, reviewerName: user.username || 'Anonymous', rating, comment
      });
      toast.success(`⭐ Review submitted! New rating: ${res.data.avgRating}`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(6px)' }}>
      <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '22px', padding: '32px', maxWidth: '420px', width: '100%', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: S.surfaceHigh, border: 'none', color: S.textSub, borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
        <h2 style={{ color: S.text, margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 700 }}>Rate {mentor.name}</h2>
        <p style={{ color: S.textSub, fontSize: '0.82rem', margin: '0 0 24px' }}>Your feedback helps other developers</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <span key={i} onClick={() => setRating(i)} onMouseEnter={() => setHoveredStar(i)} onMouseLeave={() => setHoveredStar(0)}
              style={{ fontSize: '2.5rem', cursor: 'pointer', transition: 'transform 0.15s', transform: (hoveredStar || rating) >= i ? 'scale(1.2)' : 'scale(1)', color: (hoveredStar || rating) >= i ? S.amber : S.outline, userSelect: 'none' }}>
              ★
            </span>
          ))}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: S.textSub, fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>REVIEW <span style={{ color: S.outline }}>(optional)</span></label>
          <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience working with this mentor..."
            rows={4} style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <button onClick={handleReview} disabled={submitting || rating === 0} style={{ width: '100%', padding: '13px', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', background: rating > 0 ? `linear-gradient(135deg, ${S.amber}, ${S.pink})` : S.surfaceHigh, color: rating > 0 ? '#fff' : S.textSub, border: 'none', cursor: rating > 0 ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
          {submitting ? '⏳ Submitting...' : '⭐ Submit Review'}
        </button>
      </div>
    </div>
  );
}

export default function Mentorship() {
  const [mentors, setMentors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expertise, setExpertise] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [bookModal, setBookModal] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (expertise !== 'All') params.expertise = expertise;
      if (availableOnly) params.available = true;
      if (search) params.search = search;
      const res = await axios.get('/api/mentors', { params });
      setMentors(res.data.mentors || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch {
      // Auto-seed on first load
      try {
        await axios.post('/api/mentors/seed/bulk');
        const res = await axios.get('/api/mentors', { params: { page: 1, limit: 12, sort: 'featured' } });
        setMentors(res.data.mentors || []);
        setTotal(res.data.total || 0);
      } catch (e) {
        toast.error('Failed to load mentors');
      }
    } finally {
      setLoading(false);
    }
  }, [page, sort, expertise, availableOnly, search]);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/mentors/stats/overview');
      setStats(res.data);
    } catch {}
  };

  useEffect(() => { fetchMentors(); fetchStats(); }, [fetchMentors]);

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, paddingTop: '88px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px 60px' }}>

        {/* HERO */}
        <div style={{ textAlign: 'center', padding: '40px 0 36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '99px', padding: '6px 16px', marginBottom: '20px', fontSize: '0.8rem', fontWeight: 600, color: S.primary }}>
            🎓 {total > 0 ? `${total} Expert Mentors` : 'Connecting you with experts'}
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '14px', background: `linear-gradient(135deg, ${S.text}, ${S.primary}, ${S.pink})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            1-on-1 Mentorship<br />from FAANG Engineers
          </h1>
          <p style={{ color: S.textSub, fontSize: '1.05rem', maxWidth: '560px', margin: '0 auto 32px', lineHeight: 1.7 }}>
            Get personalized guidance from engineers at Google, Meta, Apple, Amazon, Netflix, and more.
          </p>
          {/* Search */}
          <div style={{ maxWidth: '620px', margin: '0 auto', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', pointerEvents: 'none' }}>🔍</span>
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, expertise, company..."
              style={{ width: '100%', padding: '16px 18px 16px 50px', borderRadius: '14px', background: S.surface, border: `1px solid ${S.outline}`, color: S.text, fontSize: '1rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
        </div>

        {/* STATS ROW */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '32px' }}>
            {[
              { icon: '🧑‍💻', value: stats.total, label: 'Total Mentors', color: S.primary },
              { icon: '🟢', value: stats.available, label: 'Available Now', color: S.green },
              { icon: '🌟', value: stats.topRated?.[0]?.name || '—', label: 'Top Rated', color: S.amber },
              { icon: '🏷️', value: stats.expertiseCount?.[0]?._id || '—', label: 'Top Expertise', color: S.pink },
            ].map(s => (
              <div key={s.label} style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '14px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
                <div>
                  <div style={{ color: s.color, fontWeight: 800, fontSize: '1.1rem' }}>{s.value}</div>
                  <div style={{ color: S.textSub, fontSize: '0.72rem', marginTop: '2px' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FILTERS */}
        <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '16px', padding: '18px 22px', marginBottom: '28px' }}>
          {/* Expertise Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
            {EXPERTISE_AREAS.map(e => (
              <button key={e} onClick={() => { setExpertise(e); setPage(1); }} style={{
                padding: '7px 14px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600, border: `1px solid ${expertise === e ? S.primary : S.outline}`, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                background: expertise === e ? S.primaryGlow : 'transparent', color: expertise === e ? S.primary : S.textSub
              }}>{e}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} style={{ padding: '9px 14px', borderRadius: '10px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.85rem', fontFamily: 'inherit', cursor: 'pointer' }}>
              {SORT_OPTIONS.map(s => <option key={s} value={s}>{SORT_LABELS[s]}</option>)}
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: S.textSub, fontSize: '0.85rem', userSelect: 'none' }}>
              <div onClick={() => { setAvailableOnly(!availableOnly); setPage(1); }}
                style={{ width: '38px', height: '22px', borderRadius: '11px', background: availableOnly ? S.green : S.outline, transition: 'background 0.2s', position: 'relative', cursor: 'pointer' }}>
                <div style={{ position: 'absolute', top: '3px', left: availableOnly ? '18px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
              </div>
              Available Only
            </label>
          </div>
        </div>

        {/* GRID */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '18px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: S.surface, borderRadius: '20px', border: `1px solid ${S.outline}`, height: '380px', backgroundImage: `linear-gradient(90deg, ${S.surface}, ${S.surfaceHigh}, ${S.surface})`, backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            ))}
          </div>
        ) : mentors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: S.textSub }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🧑‍🏫</div>
            <h3 style={{ color: S.text, fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>No mentors found</h3>
            <p>Try changing your filters or search terms</p>
          </div>
        ) : (
          <>
            <div style={{ color: S.textSub, fontSize: '0.85rem', marginBottom: '16px' }}>Showing {mentors.length} of {total} mentors</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '18px', marginBottom: '32px' }}>
              {mentors.map(mentor => (
                <MentorCard key={mentor._id} mentor={mentor} onBook={setBookModal} onReview={setReviewModal} />
              ))}
            </div>
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} style={{ width: '36px', height: '36px', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: page === p ? S.primary : S.surfaceHigh, color: page === p ? '#fff' : S.textSub }}>{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {bookModal && <BookingModal mentor={bookModal} onClose={() => setBookModal(null)} />}
      {reviewModal && <ReviewModal mentor={reviewModal} onClose={() => setReviewModal(null)} onSuccess={fetchMentors} />}
    </div>
  );
}
