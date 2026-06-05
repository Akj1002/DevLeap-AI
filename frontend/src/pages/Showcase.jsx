import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const S = {
  bg: '#0a0a0f', surface: '#111119', surfaceHigh: '#18181f', surfaceHighest: '#1f1f28',
  primary: '#818cf8', primaryGlow: 'rgba(129,140,248,0.12)',
  green: '#4ade80', amber: '#fbbf24', red: '#f87171', pink: '#f472b6', cyan: '#22d3ee',
  text: '#f1f5f9', textSub: '#94a3b8', outline: '#25252f',
};

const CATEGORIES = ['all', 'web', 'mobile', 'ai/ml', 'devtools', 'game', 'open-source', 'other'];
const CAT_ICONS = { all: '🌐', web: '🌍', mobile: '📱', 'ai/ml': '🤖', devtools: '🔧', game: '🎮', 'open-source': '📦', other: '✨' };
const TECH_COLORS = { React: '#61dafb', Python: '#ffd43b', TypeScript: '#3178c6', Rust: '#f97316', 'Node.js': '#68a063', 'Three.js': '#4ade80', 'Next.js': '#fff', WebGL2: '#9f7aea', TensorFlow: '#ff6f00' };

function TechBadge({ tech }) {
  return (
    <span style={{ background: 'rgba(255,255,255,0.06)', color: TECH_COLORS[tech] || S.textSub, fontSize: '0.68rem', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.07)' }}>
      {tech}
    </span>
  );
}

function ProjectCard({ project, onLike, onBookmark, onClick, likedIds, bookmarkedIds }) {
  const [hovered, setHovered] = useState(false);
  const isLiked = likedIds.has(project._id);
  const isBookmarked = bookmarkedIds.has(project._id);

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(project)}
      style={{
        background: S.surface, borderRadius: '18px', border: `1px solid ${hovered ? S.primary : S.outline}`,
        overflow: 'hidden', cursor: 'pointer', transition: 'all 0.22s',
        transform: hovered ? 'translateY(-5px)' : 'none',
        boxShadow: hovered ? `0 16px 48px rgba(129,140,248,0.12)` : 'none',
      }}>
      {/* Thumbnail / Banner */}
      <div style={{ height: '140px', background: `linear-gradient(135deg, rgba(129,140,248,0.1), rgba(244,114,182,0.06))`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
        {project.imageUrl ? <img src={project.imageUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>{CAT_ICONS[project.category] || '💻'}</span>}
        {project.featured && <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(251,191,36,0.2)', color: S.amber, fontSize: '0.6rem', fontWeight: 700, padding: '3px 8px', borderRadius: '99px', border: '1px solid rgba(251,191,36,0.3)' }}>⭐ Featured</span>}
        <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: S.textSub, fontSize: '0.62rem', padding: '3px 8px', borderRadius: '6px' }}>
          {CAT_ICONS[project.category]} {project.category}
        </span>
      </div>

      <div style={{ padding: '16px 18px 18px' }}>
        <h3 style={{ color: S.text, fontWeight: 700, fontSize: '0.95rem', margin: '0 0 7px', lineHeight: 1.3 }}>{project.title}</h3>
        <p style={{ color: S.textSub, fontSize: '0.78rem', lineHeight: 1.5, margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{project.description}</p>

        {/* Tech Stack */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
          {(project.techStack || []).slice(0, 4).map(t => <TechBadge key={t} tech={t} />)}
          {(project.techStack || []).length > 4 && <span style={{ color: S.textSub, fontSize: '0.65rem' }}>+{project.techStack.length - 4}</span>}
        </div>

        {/* Author */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: `linear-gradient(135deg, ${S.primary}, ${S.pink})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>
              {project.authorName?.charAt(0)}
            </div>
            <span style={{ color: S.textSub, fontSize: '0.75rem' }}>{project.authorName}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ color: S.textSub, fontSize: '0.72rem' }}>👁 {(project.views || 0).toLocaleString()}</span>
            <button onClick={e => { e.stopPropagation(); onLike(project._id); }}
              style={{ background: 'none', border: 'none', color: isLiked ? S.pink : S.textSub, cursor: 'pointer', padding: 0, fontSize: '0.78rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '3px', transition: 'color 0.15s' }}>
              {isLiked ? '❤️' : '🤍'} {project.likeCount || 0}
            </button>
            <button onClick={e => { e.stopPropagation(); onBookmark(project._id); }}
              style={{ background: 'none', border: 'none', color: isBookmarked ? S.amber : S.textSub, cursor: 'pointer', padding: 0, fontSize: '0.85rem' }}>
              {isBookmarked ? '🔖' : '🏷️'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectModal({ project, onClose, onLike, onComment, likedIds }) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(project.comments || []);
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`/api/projects/${project._id}/comment`, { authorId: user._id, authorName: user.username || 'Anonymous', text: comment });
      setComments(prev => [...prev, res.data.comment]);
      setComment('');
      toast.success('Comment added!');
    } catch { toast.error('Failed to add comment'); } finally { setSubmitting(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '70px 20px 20px', backdropFilter: 'blur(8px)', overflowY: 'auto' }}>
      <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '22px', width: '100%', maxWidth: '780px', marginBottom: '20px', overflow: 'hidden', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: S.surfaceHigh, border: 'none', color: S.textSub, borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', zIndex: 1 }}>✕</button>

        <div style={{ height: '200px', background: `linear-gradient(135deg, rgba(129,140,248,0.15), rgba(34,211,238,0.08))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>
          {CAT_ICONS[project.category] || '💻'}
        </div>

        <div style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', gap: '7px', marginBottom: '8px' }}>
                <span style={{ background: S.primaryGlow, color: S.primary, fontSize: '0.68rem', fontWeight: 600, padding: '3px 9px', borderRadius: '6px' }}>{project.category}</span>
                {project.featured && <span style={{ background: 'rgba(251,191,36,0.12)', color: S.amber, fontSize: '0.68rem', fontWeight: 600, padding: '3px 9px', borderRadius: '6px' }}>⭐ Featured</span>}
              </div>
              <h2 style={{ color: S.text, fontWeight: 800, fontSize: '1.4rem', margin: 0 }}>{project.title}</h2>
              <p style={{ color: S.textSub, fontSize: '0.82rem', margin: '4px 0 0' }}>by {project.authorName}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ padding: '9px 16px', borderRadius: '10px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>⭐ GitHub</a>}
              {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ padding: '9px 16px', borderRadius: '10px', background: `linear-gradient(135deg, ${S.primary}, ${S.pink})`, color: '#fff', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>🌐 Live Demo</a>}
            </div>
          </div>

          <p style={{ color: S.textSub, lineHeight: 1.7, marginBottom: '20px', fontSize: '0.875rem' }}>{project.description}</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
            {(project.techStack || []).map(t => <TechBadge key={t} tech={t} />)}
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
            {[{ label: '❤️ Likes', value: project.likeCount || 0 }, { label: '👁 Views', value: project.views || 0 }, { label: '⭐ GitHub Stars', value: project.githubStars || 0 }, { label: '🍴 Forks', value: project.forks || 0 }].map(s => (
              <div key={s.label} style={{ background: S.surfaceHigh, borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ color: S.text, fontWeight: 700, fontSize: '1.1rem' }}>{s.value.toLocaleString()}</div>
                <div style={{ color: S.textSub, fontSize: '0.65rem', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <button onClick={() => onLike(project._id)} style={{ background: likedIds.has(project._id) ? 'rgba(244,114,182,0.15)' : S.surfaceHigh, border: `1px solid ${likedIds.has(project._id) ? S.pink : S.outline}`, color: likedIds.has(project._id) ? S.pink : S.textSub, padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'inherit', marginBottom: '24px', transition: 'all 0.2s' }}>
            {likedIds.has(project._id) ? '❤️ Liked' : '🤍 Like This Project'}
          </button>

          {/* Comments */}
          <h4 style={{ color: S.text, fontWeight: 700, margin: '0 0 14px' }}>💬 Comments ({comments.length})</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px', maxHeight: '200px', overflowY: 'auto' }}>
            {comments.length === 0 ? <p style={{ color: S.textSub, fontSize: '0.85rem' }}>No comments yet. Be the first!</p> : comments.map((c, i) => (
              <div key={i} style={{ background: S.surfaceHigh, borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <strong style={{ color: S.text, fontSize: '0.82rem' }}>{c.authorName}</strong>
                  <span style={{ color: S.textSub, fontSize: '0.7rem' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p style={{ color: S.textSub, fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>{c.text}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." onKeyDown={e => e.key === 'Enter' && handleComment()}
              style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none' }} />
            <button onClick={handleComment} disabled={submitting || !comment.trim()} style={{ padding: '10px 18px', borderRadius: '10px', background: comment.trim() ? S.primary : S.surfaceHigh, color: comment.trim() ? '#fff' : S.textSub, border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmitProjectModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: '', description: '', techStack: '', tags: '', repoUrl: '', liveUrl: '', category: 'web' });
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) { toast.error('Title and description are required'); return; }
    setSubmitting(true);
    try {
      const res = await axios.post('/api/projects', {
        ...form,
        techStack: form.techStack.split(',').map(t => t.trim()).filter(Boolean),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        authorId: user._id,
        authorName: user.username || 'Anonymous'
      });
      toast.success('🎉 Project submitted!');
      onSuccess(res.data);
      onClose();
    } catch { toast.error('Failed to submit project'); } finally { setSubmitting(false); }
  };

  const inp = { width: '100%', padding: '11px 14px', borderRadius: '10px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.875rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', marginBottom: '14px' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 20px 20px', backdropFilter: 'blur(6px)', overflowY: 'auto' }}>
      <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '22px', padding: '32px', maxWidth: '560px', width: '100%', position: 'relative', marginBottom: '20px' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: S.surfaceHigh, border: 'none', color: S.textSub, borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer' }}>✕</button>
        <h2 style={{ color: S.text, fontWeight: 700, fontSize: '1.3rem', margin: '0 0 20px' }}>🚀 Share Your Project</h2>

        <label style={{ color: S.textSub, fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '7px' }}>CATEGORY</label>
        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ ...inp }}>
          {CATEGORIES.filter(c => c !== 'all').map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
        </select>

        {[
          { label: 'PROJECT TITLE *', key: 'title', placeholder: 'e.g., GPU Accelerated Ray Tracer' },
          { label: 'DESCRIPTION *', key: 'description', placeholder: 'What does it do? What problem does it solve?', textarea: true },
          { label: 'TECH STACK (comma-separated)', key: 'techStack', placeholder: 'React, Node.js, MongoDB' },
          { label: 'TAGS (comma-separated)', key: 'tags', placeholder: 'ai, open-source, fullstack' },
          { label: 'GITHUB URL', key: 'repoUrl', placeholder: 'https://github.com/...' },
          { label: 'LIVE DEMO URL', key: 'liveUrl', placeholder: 'https://...' },
        ].map(f => (
          <div key={f.key}>
            <label style={{ color: S.textSub, fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '7px' }}>{f.label}</label>
            {f.textarea ? (
              <textarea value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} rows={3} style={{ ...inp, resize: 'vertical' }} />
            ) : (
              <input value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} style={inp} />
            )}
          </div>
        ))}

        <button onClick={handleSubmit} disabled={submitting} style={{ width: '100%', padding: '13px', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', background: `linear-gradient(135deg, ${S.primary}, ${S.pink})`, color: '#fff', border: 'none', cursor: submitting ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.7 : 1 }}>
          {submitting ? '⏳ Submitting...' : '🚀 Submit Project'}
        </button>
      </div>
    </div>
  );
}

export default function Showcase() {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [trending, setTrending] = useState({ tags: [], techs: [] });
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('featured');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);
  const [submitModal, setSubmitModal] = useState(false);
  const [likedIds, setLikedIds] = useState(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const debounceRef = useRef(null);

  const fetchProjects = useCallback(async (s = search) => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (category !== 'all') params.category = category;
      if (s) params.search = s;
      const res = await axios.get('/api/projects', { params });
      setProjects(res.data.projects || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch {
      try { await axios.post('/api/projects/seed/bulk'); const r = await axios.get('/api/projects', { params: { limit: 12 } }); setProjects(r.data.projects || []); setTotal(r.data.total || 0); } catch {}
    } finally { setLoading(false); }
  }, [page, category, sort, search]);

  const fetchMeta = async () => {
    try {
      const [s, t] = await Promise.all([axios.get('/api/projects/meta/stats'), axios.get('/api/projects/meta/trending-tags')]);
      setStats(s.data); setTrending(t.data);
    } catch {}
  };

  useEffect(() => { fetchProjects(); fetchMeta(); }, [fetchProjects]);

  const handleLike = async (projectId) => {
    try {
      const res = await axios.post(`/api/projects/${projectId}/like`, { userId: user._id || 'guest' });
      setLikedIds(prev => { const next = new Set(prev); res.data.liked ? next.add(projectId) : next.delete(projectId); return next; });
      setProjects(prev => prev.map(p => p._id === projectId ? { ...p, likeCount: res.data.likeCount } : p));
      toast.success(res.data.liked ? '❤️ Liked!' : 'Unliked');
    } catch { toast.error('Failed to like'); }
  };

  const handleBookmark = async (projectId) => {
    try {
      const res = await axios.post(`/api/projects/${projectId}/bookmark`, { userId: user._id || 'guest' });
      setBookmarkedIds(prev => { const next = new Set(prev); res.data.bookmarked ? next.add(projectId) : next.delete(projectId); return next; });
      toast.success(res.data.bookmarked ? '🔖 Bookmarked!' : 'Bookmark removed');
    } catch { toast.error('Failed to bookmark'); }
  };

  const handleNewProject = (proj) => { setProjects(prev => [proj, ...prev]); setTotal(t => t + 1); };

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, paddingTop: '88px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); *{box-sizing:border-box;} @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}`}</style>

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 20px 60px' }}>
        {/* HERO */}
        <div style={{ textAlign: 'center', padding: '36px 0 28px' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 12px', background: `linear-gradient(135deg, ${S.text}, ${S.primary}, ${S.pink})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Developer Showcase
          </h1>
          <p style={{ color: S.textSub, fontSize: '1rem', margin: '0 auto 24px', maxWidth: '500px', lineHeight: 1.7 }}>Discover and share open-source projects, side hustles, and dev experiments</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setSubmitModal(true)} style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', background: `linear-gradient(135deg, ${S.primary}, ${S.pink})`, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>🚀 Share Project</button>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>🔍</span>
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); clearTimeout(debounceRef.current); debounceRef.current = setTimeout(() => fetchProjects(e.target.value), 400); }} placeholder="Search projects..."
                style={{ padding: '12px 16px 12px 40px', borderRadius: '12px', background: S.surface, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.875rem', fontFamily: 'inherit', width: '260px', outline: 'none' }} />
            </div>
          </div>
        </div>

        {/* STATS */}
        {stats && (
          <div style={{ display: 'flex', gap: '14px', marginBottom: '28px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[{ v: stats.total, l: 'Projects' }, { v: stats.totalLikes?.toLocaleString(), l: 'Total Likes' }, { v: total, l: 'Showing' }].map(s => (
              <div key={s.l} style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '12px', padding: '16px 24px', textAlign: 'center' }}>
                <div style={{ color: S.primary, fontWeight: 800, fontSize: '1.4rem' }}>{s.v}</div>
                <div style={{ color: S.textSub, fontSize: '0.72rem' }}>{s.l}</div>
              </div>
            ))}
          </div>
        )}

        {/* FILTERS */}
        <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '14px', padding: '14px 18px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => { setCategory(c); setPage(1); }} style={{ padding: '7px 13px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600, border: `1px solid ${category === c ? S.primary : S.outline}`, cursor: 'pointer', fontFamily: 'inherit', background: category === c ? S.primaryGlow : 'transparent', color: category === c ? S.primary : S.textSub }}>
                {CAT_ICONS[c]} {c}
              </button>
            ))}
          </div>
          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} style={{ padding: '8px 12px', borderRadius: '9px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.82rem', fontFamily: 'inherit', cursor: 'pointer' }}>
            {[['featured', '⭐ Featured'], ['popular', '❤️ Most Liked'], ['newest', '🆕 Newest']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        {/* TRENDING TAGS */}
        {trending.techs?.length > 0 && (
          <div style={{ marginBottom: '20px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, marginRight: '4px' }}>🔥 TRENDING:</span>
            {trending.techs.slice(0, 8).map(t => (
              <span key={t._id} style={{ background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: TECH_COLORS[t._id] || S.textSub, fontSize: '0.7rem', padding: '3px 9px', borderRadius: '6px', cursor: 'pointer' }} onClick={() => fetchProjects()}>
                {t._id} ({t.count})
              </span>
            ))}
          </div>
        )}

        {/* GRID */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} style={{ background: S.surface, borderRadius: '18px', height: '300px', backgroundImage: `linear-gradient(90deg, ${S.surface}, ${S.surfaceHigh}, ${S.surface})`, backgroundSize: '200%', animation: 'shimmer 1.5s infinite' }} />)}
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: S.textSub }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
            <h3 style={{ color: S.text, fontWeight: 700 }}>No projects found</h3>
            <p>Be the first to share a project!</p>
          </div>
        ) : (
          <>
            <div style={{ color: S.textSub, fontSize: '0.82rem', marginBottom: '14px' }}>{total} projects found</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '28px' }}>
              {projects.map(p => <ProjectCard key={p._id} project={p} onLike={handleLike} onBookmark={handleBookmark} onClick={setSelectedProject} likedIds={likedIds} bookmarkedIds={bookmarkedIds} />)}
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

      {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} onLike={handleLike} onComment={() => {}} likedIds={likedIds} />}
      {submitModal && <SubmitProjectModal onClose={() => setSubmitModal(false)} onSuccess={handleNewProject} />}
    </div>
  );
}
