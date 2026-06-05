import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const S = {
  bg: '#09090f', surface: '#111119', surfaceHigh: '#181820', surfaceHighest: '#1f1f28',
  primary: '#34d399', primaryGlow: 'rgba(52,211,153,0.1)',
  secondary: '#818cf8', amber: '#fbbf24', red: '#f87171', blue: '#60a5fa', pink: '#f472b6',
  text: '#f1f5f9', textSub: '#94a3b8', outline: '#25252f',
};

const CATEGORIES = ['all', 'DSA', 'System Design', 'Frontend', 'Backend', 'ML/AI', 'DevOps', 'Career'];
const LEVELS = ['all', 'Beginner', 'Intermediate', 'Advanced'];
const CAT_ICONS = { DSA: '🧮', 'System Design': '🏗️', Frontend: '🎨', Backend: '⚙️', 'ML/AI': '🤖', DevOps: '🚀', Career: '💼', all: '🌐' };

function StarRating({ rating, size = 13 }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: `${size}px`, color: i <= Math.round(rating) ? S.amber : S.outline }}>★</span>
      ))}
    </div>
  );
}

function ClassCard({ cls, onEnroll, enrolledIds }) {
  const [hovered, setHovered] = useState(false);
  const isEnrolled = enrolledIds.has(cls._id);
  const isFree = cls.price === 0;
  const isUpcoming = cls.startDate && new Date(cls.startDate) > new Date();

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: S.surface, borderRadius: '18px', border: `1px solid ${hovered ? S.primary : S.outline}`,
        overflow: 'hidden', transition: 'all 0.22s', cursor: 'default',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? `0 12px 36px rgba(52,211,153,0.1)` : 'none',
      }}>
      {/* Thumbnail */}
      <div style={{ height: '120px', background: `linear-gradient(135deg, rgba(52,211,153,0.1), rgba(129,140,248,0.08))`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
        {CAT_ICONS[cls.category] || '📚'}
        {cls.featured && <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(251,191,36,0.18)', color: S.amber, fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>⭐ Featured</span>}
        <span style={{ position: 'absolute', top: '8px', right: '8px', background: S.surfaceHigh, color: S.textSub, fontSize: '0.62rem', padding: '3px 8px', borderRadius: '6px' }}>{cls.level}</span>
        {isUpcoming && <span style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(96,165,250,0.15)', color: S.blue, fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>🗓️ Upcoming</span>}
      </div>

      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '7px' }}>
          <span style={{ background: S.primaryGlow, color: S.primary, fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px', borderRadius: '5px' }}>{cls.category}</span>
        </div>
        <h3 style={{ color: S.text, fontWeight: 700, fontSize: '0.95rem', margin: '0 0 5px', lineHeight: 1.3 }}>{cls.title}</h3>
        <p style={{ color: S.textSub, fontSize: '0.75rem', margin: '0 0 8px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{cls.description}</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
          <img src={cls.instructorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cls.instructor}`} alt={cls.instructor}
            style={{ width: '22px', height: '22px', borderRadius: '50%', background: S.surfaceHigh }} />
          <span style={{ color: S.textSub, fontSize: '0.72rem' }}>{cls.instructor}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <StarRating rating={cls.rating || 0} />
          <span style={{ color: S.amber, fontWeight: 700, fontSize: '0.78rem' }}>{cls.rating?.toFixed(1) || '—'}</span>
          <span style={{ color: S.textSub, fontSize: '0.7rem' }}>({cls.reviewCount})</span>
          <span style={{ color: S.textSub, fontSize: '0.7rem', marginLeft: 'auto' }}>👥 {cls.enrolledCount?.toLocaleString()}</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', fontSize: '0.72rem', color: S.textSub }}>
          <span>📚 {cls.totalLessons} lessons</span>
          <span>⏱️ {cls.duration}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: isFree ? S.green : S.text, fontWeight: 800, fontSize: '1.1rem' }}>{isFree ? 'FREE' : `$${cls.price}`}</div>
          <button onClick={() => onEnroll(cls)} style={{
            padding: '9px 18px', borderRadius: '9px', fontWeight: 700, fontSize: '0.82rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
            background: isEnrolled ? 'rgba(52,211,153,0.1)' : `linear-gradient(135deg, ${S.primary}, ${S.secondary})`,
            color: isEnrolled ? S.green : '#fff'
          }}>
            {isEnrolled ? '✓ Enrolled' : 'Enroll Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ClassDetail({ cls: initialCls, onClose, onEnroll, enrolledIds }) {
  const [cls, setCls] = useState(initialCls);
  const [tab, setTab] = useState('overview');
  const [question, setQuestion] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isEnrolled = enrolledIds.has(cls._id);

  const fetchFull = async () => {
    try { const r = await axios.get(`/api/classes/${cls._id}`); setCls(r.data); } catch {}
  };

  useEffect(() => { fetchFull(); }, []);

  const handleQuestion = async () => {
    if (!question.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`/api/classes/${cls._id}/qna`, { authorId: user._id, authorName: user.username || 'Anonymous', question });
      setCls(c => ({ ...c, qna: [...(c.qna || []), res.data.qna] }));
      setQuestion('');
      toast.success('Question submitted!');
    } catch { toast.error('Failed to submit question'); } finally { setSubmitting(false); }
  };

  const handleReview = async () => {
    if (rating === 0) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      const res = await axios.post(`/api/classes/${cls._id}/review`, { userId: user._id, username: user.username || 'Anonymous', rating, comment: reviewText });
      setCls(c => ({ ...c, rating: res.data.rating, reviewCount: res.data.reviewCount }));
      setRating(0); setReviewText('');
      toast.success('⭐ Review submitted!');
    } catch { toast.error('Failed to submit review'); } finally { setSubmitting(false); }
  };

  const handleUpvoteQ = async (qnaId) => {
    try {
      const res = await axios.post(`/api/classes/${cls._id}/qna/${qnaId}/upvote`);
      setCls(c => ({ ...c, qna: (c.qna || []).map(q => q._id === qnaId ? { ...q, upvotes: res.data.upvotes } : q) }));
    } catch {}
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 20px 20px', backdropFilter: 'blur(8px)', overflowY: 'auto' }}>
      <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '22px', width: '100%', maxWidth: '860px', overflow: 'hidden', position: 'relative', marginBottom: '20px' }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, rgba(52,211,153,0.12), rgba(129,140,248,0.08))`, padding: '28px', borderBottom: `1px solid ${S.outline}` }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: S.surfaceHigh, border: 'none', color: S.textSub, borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', zIndex: 1 }}>✕</button>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <span style={{ background: S.primaryGlow, color: S.primary, fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '7px' }}>{CAT_ICONS[cls.category]} {cls.category}</span>
            <span style={{ background: S.surfaceHigh, color: S.textSub, fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: '7px' }}>{cls.level}</span>
            {cls.featured && <span style={{ background: 'rgba(251,191,36,0.12)', color: S.amber, fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '7px' }}>⭐ Featured</span>}
          </div>
          <h2 style={{ color: S.text, fontWeight: 800, fontSize: '1.4rem', margin: '0 0 8px' }}>{cls.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <img src={cls.instructorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cls.instructor}`} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
            <div>
              <div style={{ color: S.text, fontWeight: 600, fontSize: '0.85rem' }}>{cls.instructor}</div>
              <div style={{ color: S.textSub, fontSize: '0.72rem' }}>{cls.instructorTitle}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <StarRating rating={cls.rating || 0} />
              <span style={{ color: S.amber, fontWeight: 700 }}>{cls.rating?.toFixed(1)}</span>
              <span style={{ color: S.textSub, fontSize: '0.75rem' }}>({cls.reviewCount} reviews)</span>
            </div>
            <span style={{ color: S.textSub, fontSize: '0.75rem' }}>👥 {cls.enrolledCount?.toLocaleString()} enrolled</span>
            <span style={{ color: S.textSub, fontSize: '0.75rem' }}>📚 {cls.totalLessons} lessons · {cls.duration}</span>
            <button onClick={() => onEnroll(cls)} style={{ marginLeft: 'auto', padding: '10px 22px', borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem', background: isEnrolled ? 'rgba(52,211,153,0.1)' : `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: isEnrolled ? S.green : '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              {isEnrolled ? '✓ Enrolled' : cls.price === 0 ? 'Enroll Free' : `Enroll $${cls.price}`}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', padding: '4px 28px', borderBottom: `1px solid ${S.outline}`, gap: '0', overflowX: 'auto' }}>
          {['overview', 'curriculum', 'schedule', 'qna', 'reviews', 'announcements'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '11px 16px', background: 'none', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: tab === t ? S.primary : S.textSub, borderBottom: `2px solid ${tab === t ? S.primary : 'transparent'}`, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{t}</button>
          ))}
        </div>

        <div style={{ padding: '24px 28px' }}>
          {tab === 'overview' && <p style={{ color: S.textSub, lineHeight: 1.7 }}>{cls.description}</p>}

          {tab === 'curriculum' && (
            <div>
              {(cls.curriculum || []).length === 0 ? <p style={{ color: S.textSub }}>Curriculum coming soon.</p> : (cls.curriculum || []).map((w, i) => (
                <div key={i} style={{ marginBottom: '14px' }}>
                  <div style={{ color: S.text, fontWeight: 700, marginBottom: '8px' }}>Week {w.week}: {w.title}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(w.topics || []).map(t => <span key={t} style={{ background: S.surfaceHigh, color: S.textSub, fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px' }}>• {t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'schedule' && (
            <div>
              {(cls.schedule || []).length === 0 ? <p style={{ color: S.textSub }}>No scheduled sessions yet.</p> : (cls.schedule || []).map((s, i) => (
                <div key={i} style={{ background: S.surfaceHigh, borderRadius: '12px', padding: '14px 16px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '7px', marginBottom: '4px' }}>
                      {s.isLive && <span style={{ background: 'rgba(52,211,153,0.12)', color: S.green, fontSize: '0.62rem', fontWeight: 700, padding: '2px 7px', borderRadius: '5px' }}>🔴 LIVE</span>}
                      <span style={{ color: S.textSub, fontSize: '0.72rem' }}>{s.date ? new Date(s.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD'}</span>
                    </div>
                    <div style={{ color: S.text, fontWeight: 600 }}>{s.title}</div>
                    {s.description && <div style={{ color: S.textSub, fontSize: '0.75rem', marginTop: '3px' }}>{s.description}</div>}
                  </div>
                  {isEnrolled && s.isLive && s.liveUrl && (
                    <a href={s.liveUrl} target="_blank" rel="noreferrer" style={{ padding: '8px 16px', borderRadius: '8px', background: `linear-gradient(135deg, ${S.green}, ${S.primary})`, color: '#fff', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 700 }}>Join Live</a>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'qna' && (
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask a question about this course..." onKeyDown={e => e.key === 'Enter' && handleQuestion()}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none' }} />
                <button onClick={handleQuestion} disabled={submitting || !question.trim()} style={{ padding: '10px 18px', borderRadius: '10px', background: question.trim() ? S.primary : S.surfaceHigh, color: question.trim() ? '#000' : S.textSub, border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>Ask</button>
              </div>
              {(cls.qna || []).length === 0 ? <p style={{ color: S.textSub }}>No questions yet. Be the first to ask!</p> : [...(cls.qna || [])].sort((a, b) => b.upvotes - a.upvotes).map(q => (
                <div key={q._id} style={{ background: S.surfaceHigh, borderRadius: '12px', padding: '14px 16px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong style={{ color: S.text, fontSize: '0.85rem' }}>{q.authorName}</strong>
                    <button onClick={() => handleUpvoteQ(q._id)} style={{ background: 'none', border: 'none', color: S.textSub, cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit' }}>▲ {q.upvotes || 0}</button>
                  </div>
                  <p style={{ color: S.text, fontSize: '0.85rem', margin: '0 0 8px' }}><strong>Q:</strong> {q.question}</p>
                  {q.answer && <p style={{ color: S.primary, fontSize: '0.82rem', margin: 0, borderLeft: `3px solid ${S.primary}`, paddingLeft: '10px' }}><strong>A:</strong> {q.answer}</p>}
                </div>
              ))}
            </div>
          )}

          {tab === 'reviews' && (
            <div>
              <div style={{ background: S.surfaceHigh, borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ color: S.textSub, fontSize: '0.75rem', fontWeight: 600, marginBottom: '10px' }}>LEAVE A REVIEW</div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <span key={i} onClick={() => setRating(i)} style={{ fontSize: '1.8rem', cursor: 'pointer', color: rating >= i ? S.amber : S.outline, transition: 'color 0.15s' }}>★</span>
                  ))}
                </div>
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="What did you like or dislike?" rows={2}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', background: S.surface, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.875rem', fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: '10px' }} />
                <button onClick={handleReview} disabled={submitting || rating === 0} style={{ padding: '10px 24px', borderRadius: '9px', fontWeight: 700, background: rating > 0 ? `linear-gradient(135deg, ${S.amber}, ${S.pink})` : S.outline, color: '#fff', border: 'none', cursor: rating > 0 ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                  Submit Review
                </button>
              </div>
              {(cls.reviews || []).length === 0 ? <p style={{ color: S.textSub }}>No reviews yet.</p> : (cls.reviews || []).slice(0, 10).map((r, i) => (
                <div key={i} style={{ borderBottom: `1px solid ${S.outline}`, paddingBottom: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <strong style={{ color: S.text, fontSize: '0.85rem' }}>{r.username}</strong>
                    <StarRating rating={r.rating} size={12} />
                  </div>
                  {r.comment && <p style={{ color: S.textSub, fontSize: '0.82rem', margin: 0 }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}

          {tab === 'announcements' && (
            <div>
              {(cls.announcements || []).length === 0 ? <p style={{ color: S.textSub }}>No announcements.</p> : [...(cls.announcements || [])].reverse().map((a, i) => (
                <div key={i} style={{ background: S.surfaceHigh, borderRadius: '12px', padding: '14px 16px', marginBottom: '10px', borderLeft: `3px solid ${S.green}` }}>
                  <div style={{ color: S.text, fontWeight: 700, marginBottom: '5px' }}>{a.title}</div>
                  <p style={{ color: S.textSub, fontSize: '0.82rem', margin: '0 0 6px', lineHeight: 1.5 }}>{a.content}</p>
                  <div style={{ color: S.outline, fontSize: '0.68rem' }}>{new Date(a.postedAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LiveClasses() {
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [sort, setSort] = useState('featured');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [tab, setTab] = useState('browse');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (category !== 'all') params.category = category;
      if (level !== 'all') params.level = level;
      if (search) params.search = search;
      const res = await axios.get('/api/classes', { params });
      setClasses(res.data.classes || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch {
      try { await axios.post('/api/classes/seed/bulk'); const r = await axios.get('/api/classes', { params: { limit: 12 } }); setClasses(r.data.classes || []); setTotal(r.data.total || 0); } catch {}
    } finally { setLoading(false); }
  }, [page, category, level, sort, search]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  useEffect(() => {
    if (user._id) {
      axios.get(`/api/classes/user/${user._id}/enrolled`).then(r => {
        setEnrolledIds(new Set((r.data || []).map(c => c._id)));
      }).catch(() => {});
    }
  }, []);

  const handleEnroll = async (cls) => {
    if (enrolledIds.has(cls._id)) { toast.info('Already enrolled!'); return; }
    try {
      await axios.post(`/api/classes/${cls._id}/enroll`, { userId: user._id || 'guest' });
      setEnrolledIds(prev => new Set([...prev, cls._id]));
      setClasses(prev => prev.map(c => c._id === cls._id ? { ...c, enrolledCount: c.enrolledCount + 1 } : c));
      toast.success(`🎓 Enrolled in "${cls.title}"!`);
    } catch (e) { toast.error(e.response?.data?.error || 'Enrollment failed'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, paddingTop: '88px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); *{box-sizing:border-box;} @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}`}</style>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px 60px' }}>
        {/* HERO */}
        <div style={{ textAlign: 'center', padding: '36px 0 28px' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, margin: '0 0 12px', background: `linear-gradient(135deg, ${S.text}, ${S.primary}, ${S.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Live Classes & Bootcamps
          </h1>
          <p style={{ color: S.textSub, fontSize: '1rem', maxWidth: '500px', margin: '0 auto 0', lineHeight: 1.7 }}>
            Learn from FAANG engineers with live sessions, Q&A, and community
          </p>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '24px', justifyContent: 'center' }}>
          <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '11px', padding: '3px', display: 'flex' }}>
            {[['browse', '🌐 Browse'], ['enrolled', '🎓 My Courses']].map(([t, l]) => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '9px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: tab === t ? `linear-gradient(135deg, ${S.primary}, ${S.secondary})` : 'transparent', color: tab === t ? '#000' : S.textSub }}>{l}</button>
            ))}
          </div>
        </div>

        {tab === 'browse' && (
          <>
            {/* FILTERS */}
            <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '14px', padding: '14px 18px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => { setCategory(c); setPage(1); }} style={{ padding: '6px 12px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600, border: `1px solid ${category === c ? S.primary : S.outline}`, cursor: 'pointer', fontFamily: 'inherit', background: category === c ? S.primaryGlow : 'transparent', color: category === c ? S.primary : S.textSub }}>
                    {CAT_ICONS[c] || ''} {c}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select value={level} onChange={e => { setLevel(e.target.value); setPage(1); }} style={{ padding: '8px 10px', borderRadius: '8px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.82rem', fontFamily: 'inherit', cursor: 'pointer' }}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} style={{ padding: '8px 10px', borderRadius: '8px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.82rem', fontFamily: 'inherit', cursor: 'pointer' }}>
                  {[['featured', '⭐ Featured'], ['rating', '🌟 Top Rated'], ['popular', '👥 Most Popular'], ['newest', '🆕 Newest']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ background: S.surface, borderRadius: '18px', height: '320px', backgroundImage: `linear-gradient(90deg, ${S.surface}, ${S.surfaceHigh}, ${S.surface})`, backgroundSize: '200%', animation: 'shimmer 1.5s infinite' }} />)}
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                  {classes.map(c => <ClassCard key={c._id} cls={c} onEnroll={handleEnroll} enrolledIds={enrolledIds} />)}
                </div>
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)} style={{ width: '36px', height: '36px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: page === p ? S.primary : S.surfaceHigh, color: page === p ? '#000' : S.textSub }}>{p}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {tab === 'enrolled' && (
          <div>
            {enrolledIds.size === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: S.textSub }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📚</div>
                <h3 style={{ color: S.text, fontWeight: 700 }}>No enrolled courses</h3>
                <p>Browse and enroll in a course to see it here!</p>
                <button onClick={() => setTab('browse')} style={{ padding: '12px 24px', borderRadius: '11px', fontWeight: 700, background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: '#000', border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginTop: '12px' }}>Browse Courses</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {classes.filter(c => enrolledIds.has(c._id)).map(c => <ClassCard key={c._id} cls={c} onEnroll={() => toast.info('Already enrolled!')} enrolledIds={enrolledIds} />)}
              </div>
            )}
          </div>
        )}
      </div>

      {selected && <ClassDetail cls={selected} onClose={() => setSelected(null)} onEnroll={handleEnroll} enrolledIds={enrolledIds} />}
    </div>
  );
}
