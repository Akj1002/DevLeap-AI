import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const S = {
  bg: '#0b0b10', surface: '#131319', surfaceHigh: '#1b1b23', surfaceHighest: '#22222c',
  primary: '#22d3ee', primaryGlow: 'rgba(34,211,238,0.12)',
  secondary: '#a78bfa', green: '#4ade80', amber: '#fbbf24', red: '#f87171',
  orange: '#fb923c', text: '#f1f5f9', textSub: '#94a3b8',
  outline: '#2a2a38', outlineVar: '#161622',
};

const LANGUAGES = ['all', 'javascript', 'python', 'java', 'cpp', 'go', 'rust', 'typescript', 'ruby', 'swift'];
const SEVERITY_COLORS = { critical: S.red, warning: S.amber, info: S.primary };
const SEVERITY_ICONS = { critical: '🔴', warning: '🟡', info: '🔵' };

const langIcon = (l) => {
  const m = { javascript: '🟨', python: '🐍', java: '☕', cpp: '⚡', go: '🐹', rust: '🦀', typescript: '📘', ruby: '💎', swift: '🍎' };
  return m[l] || '📄';
};

function SkeletonCard() {
  return (
    <div style={{ background: S.surface, borderRadius: '14px', padding: '20px', border: `1px solid ${S.outline}` }}>
      {[70, 100, 50, 80].map((w, i) => (
        <div key={i} style={{ height: '13px', width: `${w}%`, borderRadius: '7px', marginBottom: '10px', background: `linear-gradient(90deg, ${S.surfaceHigh}, ${S.surfaceHighest}, ${S.surfaceHigh})`, backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      ))}
    </div>
  );
}

function ReviewListItem({ review, onUpvote, onClick }) {
  const [hovered, setHovered] = useState(false);
  const since = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div onClick={() => onClick(review)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: S.surface, borderRadius: '14px', padding: '20px', border: `1px solid ${hovered ? S.primary : S.outline}`, cursor: 'pointer', transition: 'all 0.2s', transform: hovered ? 'translateX(4px)' : 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
            <span style={{ fontSize: '1rem' }}>{langIcon(review.language)}</span>
            <span style={{ background: S.primaryGlow, color: S.primary, fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px', borderRadius: '5px' }}>{review.language}</span>
            <span style={{ background: review.status === 'resolved' ? 'rgba(74,222,128,0.1)' : 'rgba(34,211,238,0.1)', color: review.status === 'resolved' ? S.green : S.primary, fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: '5px' }}>{review.status}</span>
          </div>
          <h3 style={{ color: S.text, fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3, margin: 0 }}>{review.title}</h3>
        </div>
      </div>
      {review.description && (
        <p style={{ color: S.textSub, fontSize: '0.8rem', lineHeight: 1.5, margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {review.description}
        </p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
        {(review.tags || []).map(t => <span key={t} style={{ background: S.surfaceHigh, color: S.textSub, fontSize: '0.65rem', padding: '2px 7px', borderRadius: '5px' }}>#{t}</span>)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: S.textSub }}>
        <span>by <strong style={{ color: S.text }}>{review.authorName}</strong> · {since(review.createdAt)}</span>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span>👁 {review.views || 0}</span>
          <span>💬 {review.commentCount || 0}</span>
          <button onClick={e => { e.stopPropagation(); onUpvote(review._id); }} style={{ background: 'none', border: 'none', color: S.textSub, cursor: 'pointer', padding: 0, fontSize: '0.75rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '3px' }}>
            ▲ {review.upvotes || 0}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewDetail({ review, onClose, onComment, onUpvoteComment, onAiReview, onResolveComment, aiLoading }) {
  const [comment, setComment] = useState('');
  const [lineNum, setLineNum] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const codeLines = (review.code || '').split('\n');

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await onComment(review._id, { author: user.username || 'Anonymous', authorId: user._id, text: comment, lineNumber: lineNum ? parseInt(lineNum) : null });
      setComment(''); setLineNum('');
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 20px 20px', backdropFilter: 'blur(6px)', overflowY: 'auto' }}>
      <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '22px', width: '100%', maxWidth: '900px', position: 'relative', marginBottom: '20px' }}>
        <div style={{ padding: '24px 28px', borderBottom: `1px solid ${S.outline}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <span style={{ background: S.primaryGlow, color: S.primary, fontSize: '0.7rem', fontWeight: 600, padding: '2px 9px', borderRadius: '5px' }}>{langIcon(review.language)} {review.language}</span>
              {review.complexity && <span style={{ background: S.surfaceHigh, color: S.textSub, fontSize: '0.7rem', padding: '2px 9px', borderRadius: '5px' }}>{review.complexity}</span>}
            </div>
            <h2 style={{ color: S.text, fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>{review.title}</h2>
            <p style={{ color: S.textSub, fontSize: '0.8rem', margin: '4px 0 0' }}>by {review.authorName}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button onClick={() => onAiReview(review._id)} disabled={aiLoading}
              style={{ padding: '9px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '0.8rem', background: aiLoading ? S.surfaceHigh : `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: aiLoading ? S.textSub : '#fff', border: 'none', cursor: aiLoading ? 'wait' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              {aiLoading ? '⏳ Analyzing...' : '🤖 AI Review'}
            </button>
            <button onClick={onClose} style={{ padding: '9px 14px', borderRadius: '10px', background: S.surfaceHigh, border: 'none', color: S.textSub, cursor: 'pointer' }}>✕</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          {/* Code Viewer */}
          <div style={{ borderRight: `1px solid ${S.outline}`, maxHeight: '500px', overflowY: 'auto' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${S.outline}`, fontSize: '0.75rem', fontWeight: 600, color: S.textSub }}>CODE</div>
            <pre style={{ margin: 0, padding: '16px', fontFamily: "'Fira Code', 'Cascadia Code', monospace", fontSize: '0.8rem', lineHeight: 1.7, color: S.text, overflowX: 'auto', background: S.outlineVar }}>
              {codeLines.map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: S.outline, userSelect: 'none', minWidth: '24px', textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                  <span>{line}</span>
                </div>
              ))}
            </pre>
          </div>

          {/* Right Panel */}
          <div style={{ maxHeight: '500px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {/* AI Review */}
            {review.aiReview?.summary && (
              <div style={{ padding: '16px', borderBottom: `1px solid ${S.outline}`, background: 'rgba(34,211,238,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: S.primary }}>🤖 AI REVIEW</div>
                  <div style={{ background: `${review.aiReview.score >= 80 ? S.green : review.aiReview.score >= 60 ? S.amber : S.red}20`, color: review.aiReview.score >= 80 ? S.green : review.aiReview.score >= 60 ? S.amber : S.red, fontSize: '0.78rem', fontWeight: 700, padding: '2px 10px', borderRadius: '99px' }}>
                    Score: {review.aiReview.score}/100
                  </div>
                </div>
                <p style={{ color: S.textSub, fontSize: '0.8rem', lineHeight: 1.6, margin: '0 0 12px' }}>{review.aiReview.summary}</p>
                {(review.aiReview.issues || []).map((issue, i) => (
                  <div key={i} style={{ background: S.surfaceHigh, borderRadius: '8px', padding: '10px 12px', marginBottom: '8px', borderLeft: `3px solid ${SEVERITY_COLORS[issue.severity] || S.textSub}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: SEVERITY_COLORS[issue.severity] }}>{SEVERITY_ICONS[issue.severity]} {issue.severity?.toUpperCase()}</span>
                      {issue.line > 0 && <span style={{ fontSize: '0.68rem', color: S.textSub }}>Line {issue.line}</span>}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: S.text, margin: '0 0 4px', fontWeight: 500 }}>{issue.message}</p>
                    {issue.suggestion && <p style={{ fontSize: '0.75rem', color: S.primary, margin: 0 }}>💡 {issue.suggestion}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Comments */}
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: S.textSub, marginBottom: '12px' }}>💬 COMMENTS ({(review.comments || []).length})</div>
              {(review.comments || []).map(c => (
                <div key={c._id} style={{ marginBottom: '12px', background: c.resolved ? 'rgba(74,222,128,0.05)' : S.surfaceHigh, borderRadius: '10px', padding: '10px 12px', borderLeft: c.lineNumber ? `3px solid ${S.primary}` : 'none', opacity: c.resolved ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <strong style={{ color: S.text, fontSize: '0.8rem' }}>{c.author}</strong>
                      {c.lineNumber && <span style={{ fontSize: '0.65rem', background: S.primaryGlow, color: S.primary, padding: '1px 6px', borderRadius: '4px' }}>L{c.lineNumber}</span>}
                      {c.resolved && <span style={{ fontSize: '0.65rem', color: S.green }}>✓ resolved</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => onUpvoteComment(review._id, c._id)} style={{ background: 'none', border: 'none', color: S.textSub, cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'inherit' }}>▲ {c.upvotes || 0}</button>
                      <button onClick={() => onResolveComment(review._id, c._id)} style={{ background: 'none', border: 'none', color: S.textSub, cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'inherit' }}>✓</button>
                    </div>
                  </div>
                  <p style={{ color: S.textSub, fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>{c.text}</p>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div style={{ padding: '16px', borderTop: `1px solid ${S.outline}` }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input type="number" value={lineNum} onChange={e => setLineNum(e.target.value)} placeholder="Line #"
                  style={{ width: '70px', padding: '8px 10px', borderRadius: '8px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none' }} />
                <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add your review..." onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleComment()}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none' }} />
                <button onClick={handleComment} disabled={submitting || !comment.trim()} style={{ padding: '8px 14px', borderRadius: '8px', background: comment.trim() ? S.primary : S.surfaceHigh, color: comment.trim() ? '#fff' : S.textSub, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'inherit' }}>
                  {submitting ? '...' : '→'}
                </button>
              </div>
              <p style={{ color: S.textSub, fontSize: '0.68rem', margin: 0 }}>Enter to submit · Specify a line number to pin your comment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostReviewModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [tags, setTags] = useState('');
  const [complexity, setComplexity] = useState('Intermediate');
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleSubmit = async () => {
    if (!title.trim() || !code.trim()) { toast.error('Title and code are required'); return; }
    setSubmitting(true);
    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await axios.post('/api/code-reviews', {
        title, description, code, language, tags: tagList, complexity,
        authorId: user._id, authorName: user.username || 'Anonymous'
      });
      toast.success('🎉 Review posted! Waiting for feedback...');
      onSuccess(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post review');
    } finally { setSubmitting(false); }
  };

  const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: '10px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.875rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 20px 20px', backdropFilter: 'blur(6px)', overflowY: 'auto' }}>
      <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '22px', padding: '32px', maxWidth: '680px', width: '100%', position: 'relative', marginBottom: '20px' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: S.surfaceHigh, border: 'none', color: S.textSub, borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer' }}>✕</button>
        <h2 style={{ color: S.text, fontWeight: 700, fontSize: '1.3rem', margin: '0 0 6px' }}>Submit Code for Review</h2>
        <p style={{ color: S.textSub, fontSize: '0.85rem', margin: '0 0 24px' }}>Get feedback from the community and AI</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ color: S.textSub, fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '7px' }}>LANGUAGE</label>
            <select value={language} onChange={e => setLanguage(e.target.value)} style={{ ...inputStyle }}>
              {LANGUAGES.filter(l => l !== 'all').map(l => <option key={l} value={l}>{langIcon(l)} {l}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color: S.textSub, fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '7px' }}>COMPLEXITY</label>
            <select value={complexity} onChange={e => setComplexity(e.target.value)} style={{ ...inputStyle }}>
              {['Beginner', 'Intermediate', 'Advanced'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {[
          { label: 'TITLE *', value: title, onChange: setTitle, placeholder: 'Describe your code in one sentence', type: 'input' },
          { label: 'CONTEXT / QUESTION', value: description, onChange: setDescription, placeholder: 'What are you trying to do? What specific feedback do you need?', type: 'textarea', rows: 2 },
          { label: 'CODE *', value: code, onChange: setCode, placeholder: 'Paste your code here...', type: 'textarea', rows: 12, mono: true },
          { label: 'TAGS (comma-separated)', value: tags, onChange: setTags, placeholder: 'e.g., algorithms, performance, react', type: 'input' },
        ].map(f => (
          <div key={f.label} style={{ marginBottom: '16px' }}>
            <label style={{ color: S.textSub, fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '7px' }}>{f.label}</label>
            {f.type === 'input' ? (
              <input value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder} style={inputStyle} />
            ) : (
              <textarea value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder} rows={f.rows || 3}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: f.mono ? "'Fira Code', monospace" : 'inherit', lineHeight: 1.6 }} />
            )}
          </div>
        ))}

        <button onClick={handleSubmit} disabled={submitting} style={{ width: '100%', padding: '13px', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: '#fff', border: 'none', cursor: submitting ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.7 : 1 }}>
          {submitting ? '⏳ Posting...' : '🚀 Submit for Review'}
        </button>
      </div>
    </div>
  );
}

export default function CodeReview() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [postModal, setPostModal] = useState(false);
  const [langFilter, setLangFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('newest');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const debounceRef = useRef(null);

  const fetchReviews = useCallback(async (searchVal = search) => {
    setLoading(true);
    try {
      const params = { page, limit: 15, sort: sortFilter };
      if (langFilter !== 'all') params.language = langFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchVal) params.search = searchVal;
      const res = await axios.get('/api/code-reviews', { params });
      setReviews(res.data.reviews || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch {
      // Auto-seed
      try {
        await axios.post('/api/code-reviews/seed/bulk');
        const res = await axios.get('/api/code-reviews', { params: { page: 1, limit: 15 } });
        setReviews(res.data.reviews || []);
        setTotal(res.data.total || 0);
      } catch { toast.error('Failed to load reviews'); }
    } finally { setLoading(false); }
  }, [page, langFilter, statusFilter, sortFilter, search]);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/code-reviews/stats/overview');
      setStats(res.data);
    } catch {}
  };

  useEffect(() => { fetchReviews(); fetchStats(); }, [fetchReviews]);

  const handleUpvote = async (reviewId) => {
    try {
      const res = await axios.post(`/api/code-reviews/${reviewId}/upvote`);
      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, upvotes: res.data.upvotes } : r));
      toast.success('Upvoted!');
    } catch { toast.error('Failed to upvote'); }
  };

  const handleOpenReview = async (review) => {
    try {
      const res = await axios.get(`/api/code-reviews/${review._id}`);
      setSelectedReview(res.data);
    } catch { setSelectedReview(review); }
  };

  const handleComment = async (reviewId, commentData) => {
    const res = await axios.post(`/api/code-reviews/${reviewId}/comment`, commentData);
    setSelectedReview(prev => ({ ...prev, comments: [...(prev.comments || []), res.data.comment] }));
    setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, commentCount: res.data.commentCount } : r));
    toast.success('Comment added!');
  };

  const handleUpvoteComment = async (reviewId, commentId) => {
    const res = await axios.post(`/api/code-reviews/${reviewId}/comments/${commentId}/upvote`);
    setSelectedReview(prev => ({ ...prev, comments: (prev.comments || []).map(c => c._id === commentId ? { ...c, upvotes: res.data.upvotes } : c) }));
  };

  const handleResolveComment = async (reviewId, commentId) => {
    const res = await axios.patch(`/api/code-reviews/${reviewId}/comments/${commentId}/resolve`);
    setSelectedReview(prev => ({ ...prev, comments: (prev.comments || []).map(c => c._id === commentId ? { ...c, resolved: res.data.resolved } : c) }));
  };

  const handleAiReview = async (reviewId) => {
    setAiLoading(true);
    try {
      const res = await axios.post(`/api/code-reviews/${reviewId}/ai-review`);
      setSelectedReview(prev => ({ ...prev, aiReview: res.data.aiReview }));
      toast.success('🤖 AI review generated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'AI review failed');
    } finally { setAiLoading(false); }
  };

  const handlePostSuccess = (newReview) => {
    setReviews(prev => [{ ...newReview, commentCount: 0 }, ...prev]);
    setTotal(prev => prev + 1);
  };

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, paddingTop: '88px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px 60px' }}>

        {/* HERO */}
        <div style={{ padding: '36px 0 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 10px', background: `linear-gradient(135deg, ${S.text}, ${S.primary}, ${S.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Code Review Hub
            </h1>
            <p style={{ color: S.textSub, fontSize: '1rem', margin: 0, lineHeight: 1.6 }}>
              Submit code for peer + AI review. Get actionable, line-by-line feedback.
            </p>
          </div>
          <button onClick={() => setPostModal(true)} style={{ padding: '13px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            + Submit Code
          </button>
        </div>

        {/* STATS */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '28px' }}>
            {[
              { label: 'Total Submissions', value: stats.total, color: S.primary },
              { label: 'Open Reviews', value: stats.openReviews, color: S.amber },
              { label: 'Resolved', value: stats.resolvedReviews, color: S.green },
              { label: 'Total Comments', value: stats.totalComments, color: S.secondary },
            ].map(s => (
              <div key={s.label} style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '12px', padding: '16px 18px', textAlign: 'center' }}>
                <div style={{ color: s.color, fontWeight: 800, fontSize: '1.4rem' }}>{s.value}</div>
                <div style={{ color: S.textSub, fontSize: '0.72rem', marginTop: '3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* FILTERS */}
        <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '14px', padding: '16px 20px', marginBottom: '22px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>🔍</span>
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); clearTimeout(debounceRef.current); debounceRef.current = setTimeout(() => fetchReviews(e.target.value), 400); }} placeholder="Search reviews..."
              style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '9px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.85rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
          </div>
          {[
            { value: langFilter, options: LANGUAGES, onChange: v => { setLangFilter(v); setPage(1); }, label: lang => `${lang === 'all' ? '🌐 All Languages' : `${langIcon(lang)} ${lang}`}` },
            { value: statusFilter, options: ['all', 'open', 'resolved', 'closed'], onChange: v => { setStatusFilter(v); setPage(1); } },
            { value: sortFilter, options: ['newest', 'popular', 'most_comments'], onChange: v => { setSortFilter(v); setPage(1); }, label: v => ({ newest: 'Newest', popular: 'Most Popular', most_comments: 'Most Discussed' }[v] || v) },
          ].map((f, i) => (
            <select key={i} value={f.value} onChange={e => f.onChange(e.target.value)} style={{ padding: '9px 12px', borderRadius: '9px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.85rem', fontFamily: 'inherit', cursor: 'pointer' }}>
              {f.options.map(o => <option key={o} value={o}>{f.label ? f.label(o) : o}</option>)}
            </select>
          ))}
        </div>

        {/* LIST */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: S.textSub }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💻</div>
            <h3 style={{ color: S.text, fontWeight: 700, marginBottom: '8px' }}>No reviews yet</h3>
            <p style={{ marginBottom: '20px' }}>Be the first to submit code for review!</p>
            <button onClick={() => setPostModal(true)} style={{ padding: '12px 24px', borderRadius: '12px', background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>
              Submit Code
            </button>
          </div>
        ) : (
          <>
            <div style={{ color: S.textSub, fontSize: '0.82rem', marginBottom: '14px' }}>{total} submissions found</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {reviews.map(r => (
                <ReviewListItem key={r._id} review={r} onUpvote={handleUpvote} onClick={handleOpenReview} />
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

      {selectedReview && (
        <ReviewDetail review={selectedReview} onClose={() => setSelectedReview(null)} onComment={handleComment} onUpvoteComment={handleUpvoteComment} onAiReview={handleAiReview} onResolveComment={handleResolveComment} aiLoading={aiLoading} />
      )}
      {postModal && <PostReviewModal onClose={() => setPostModal(false)} onSuccess={handlePostSuccess} />}
    </div>
  );
}
