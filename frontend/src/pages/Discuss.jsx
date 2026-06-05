import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

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

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const CATEGORIES = [
  { id: 'all', name: 'All Posts', icon: '🏠' },
  { id: 'dsa', name: 'DSA & Algorithms', icon: '🧮' },
  { id: 'system-design', name: 'System Design', icon: '🏗️' },
  { id: 'interview', name: 'Interview Experiences', icon: '🎯' },
  { id: 'career', name: 'Career Advice', icon: '💼' },
  { id: 'hot-takes', name: 'Hot Takes', icon: '🔥' },
  { id: 'resources', name: 'Resources', icon: '📚' },
];

const SkeletonCard = () => (
  <div style={{ background: S.surface, border: `1px solid ${S.outlineVar}`, borderRadius: '12px', padding: '20px', display: 'flex', gap: '16px', marginBottom: '12px' }}>
    <div style={{ width: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: S.surfaceHigh, animation: 'pulse 2s infinite' }} />
      <div style={{ width: '32px', height: '16px', borderRadius: '4px', background: S.surfaceHigh, animation: 'pulse 2s infinite' }} />
    </div>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ width: '80px', height: '20px', borderRadius: '4px', background: S.surfaceHigh, animation: 'pulse 2s infinite' }} />
      <div style={{ width: '90%', height: '24px', borderRadius: '4px', background: S.surfaceHigh, animation: 'pulse 2s infinite' }} />
      <div style={{ width: '100%', height: '16px', borderRadius: '4px', background: S.surfaceHigh, animation: 'pulse 2s infinite' }} />
      <div style={{ width: '75%', height: '16px', borderRadius: '4px', background: S.surfaceHigh, animation: 'pulse 2s infinite' }} />
    </div>
    <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }`}</style>
  </div>
);

const Comment = ({ comment, depth = 0 }) => {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [localScore, setLocalScore] = useState(comment.upvotes || 0);
  const [voted, setVoted] = useState(null);

  const handleVote = (dir) => {
    if (voted === dir) { setVoted(null); setLocalScore((comment.upvotes || 0)); }
    else { setVoted(dir); setLocalScore((comment.upvotes || 0) + dir); }
  };

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    toast.success('Reply submitted!');
    setReplyText('');
    setReplyOpen(false);
  };

  return (
    <div style={{ marginTop: '12px', marginLeft: depth > 0 ? '20px' : 0, paddingLeft: depth > 0 ? '16px' : 0, borderLeft: depth > 0 ? `2px solid ${S.outlineVar}` : 'none' }}>
      <div style={{ borderRadius: '8px', padding: '12px', background: depth % 2 === 0 ? S.surfaceLowest : 'transparent' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `linear-gradient(to bottom right, ${S.primary}, ${S.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', color: S.onPrimary, flexShrink: 0 }}>
            {comment.author?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span style={{ color: S.primary, fontWeight: 600, fontSize: '0.875rem' }}>{comment.author || 'User'}</span>
          <span style={{ color: S.outline, fontSize: '0.75rem' }}>{timeAgo(comment.createdAt || comment.time || new Date())}</span>
        </div>
        <p style={{ color: S.outline, fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '12px' }}>{comment.text || comment.content}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button onClick={() => handleVote(1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', transition: 'color 0.2s', color: voted === 1 ? S.primary : S.outlineVar }}>▲</button>
            <span style={{ color: S.outline, fontSize: '0.75rem', fontWeight: 'bold', minWidth: '24px', textAlign: 'center' }}>{localScore}</span>
            <button onClick={() => handleVote(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', transition: 'color 0.2s', color: voted === -1 ? S.error : S.outlineVar }}>▼</button>
          </div>
          <button onClick={() => setReplyOpen(!replyOpen)} style={{ color: S.outlineVar, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.color = S.outline; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }} onMouseLeave={e => { e.currentTarget.style.color = S.outlineVar; e.currentTarget.style.background = 'transparent'; }}>
            💬 Reply
          </button>
        </div>
        {replyOpen && (
          <div style={{ marginTop: '12px' }}>
            <textarea 
              value={replyText} 
              onChange={e => setReplyText(e.target.value)} 
              placeholder="Write a reply..." 
              style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: `1px solid ${S.outlineVar}`, borderRadius: '8px', color: S.text, padding: '12px', fontSize: '0.875rem', resize: 'vertical', minHeight: '60px', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = S.primary}
              onBlur={e => e.target.style.borderColor = S.outlineVar}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button onClick={handleReplySubmit} style={{ padding: '6px 16px', background: S.primary, color: S.onPrimary, borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 0.9} onMouseLeave={e => e.currentTarget.style.opacity = 1}>Submit</button>
              <button onClick={() => setReplyOpen(false)} style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.05)', color: S.outline, borderRadius: '6px', fontSize: '0.75rem', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>Cancel</button>
            </div>
          </div>
        )}
      </div>
      {comment.replies?.map((r, i) => <Comment key={i} comment={r} depth={depth + 1} />)}
    </div>
  );
};

const PostCard = ({ thread, expanded, onExpand }) => {
  const [localScore, setLocalScore] = useState(thread.upvotes || 0);
  const [voted, setVoted] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState(thread.replies || []);

  const handleVote = (e, dir) => {
    e.stopPropagation();
    if (voted === dir) { setVoted(null); setLocalScore((thread.upvotes || 0)); }
    else { setVoted(dir); setLocalScore((thread.upvotes || 0) + dir); }
    axios.post(`/api/discuss/${thread._id || thread.id}/upvote`, { direction: dir }).catch(() => {});
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      const res = await axios.post(`/api/discuss/${thread._id || thread.id}/reply`, { text: replyText, userId: 'dummy_id' });
      setReplies(res.data.replies || [...replies, { author: 'You', text: replyText, upvotes: 0, createdAt: new Date().toISOString() }]);
      toast.success('Comment added!');
    } catch {
      setReplies([...replies, { author: 'You', text: replyText, upvotes: 0, createdAt: new Date().toISOString() }]);
    }
    setReplyText('');
  };

  return (
    <div
      onClick={() => onExpand(thread._id || thread.id)}
      style={{
        background: expanded ? 'rgba(173, 198, 255, 0.05)' : S.surface,
        border: `1px solid ${expanded ? 'rgba(173, 198, 255, 0.3)' : S.outlineVar}`,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s',
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start'
      }}
      onMouseEnter={e => { if(!expanded) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; } }}
      onMouseLeave={e => { if(!expanded) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = S.outlineVar; } }}
    >
      {/* Vote Column */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0, paddingTop: '4px' }}>
        <button
          onClick={(e) => handleVote(e, 1)}
          style={{ width: '32px', height: '28px', borderRadius: '6px', border: `1px solid ${voted === 1 ? 'rgba(173,198,255,0.4)' : S.outlineVar}`, background: voted === 1 ? 'rgba(173,198,255,0.2)' : 'rgba(255,255,255,0.05)', color: voted === 1 ? S.primary : S.outlineVar, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => { if(voted !== 1) { e.currentTarget.style.color = S.primary; e.currentTarget.style.background = 'rgba(173,198,255,0.1)'; } }}
          onMouseLeave={e => { if(voted !== 1) { e.currentTarget.style.color = S.outlineVar; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; } }}
        >▲</button>
        <span style={{ fontWeight: 'bold', fontSize: '0.875rem', padding: '4px 0', color: voted === 1 ? S.primary : voted === -1 ? S.error : S.text }}>
          {localScore >= 1000 ? `${(localScore / 1000).toFixed(1)}k` : localScore}
        </span>
        <button
          onClick={(e) => handleVote(e, -1)}
          style={{ width: '32px', height: '28px', borderRadius: '6px', border: `1px solid ${voted === -1 ? 'rgba(255,180,171,0.4)' : S.outlineVar}`, background: voted === -1 ? 'rgba(255,180,171,0.2)' : 'rgba(255,255,255,0.05)', color: voted === -1 ? S.error : S.outlineVar, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => { if(voted !== -1) { e.currentTarget.style.color = S.error; e.currentTarget.style.background = 'rgba(255,180,171,0.1)'; } }}
          onMouseLeave={e => { if(voted !== -1) { e.currentTarget.style.color = S.outlineVar; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; } }}
        >▼</button>
      </div>

      {/* Content Column */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(173,198,255,0.15)', color: S.primary, padding: '2px 10px', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>{thread.category || 'Discussion'}</span>
          {thread.tags?.slice(0, 3).map(tag => (
            <span key={tag} style={{ background: S.surfaceHigh, color: S.outlineVar, padding: '2px 8px', borderRadius: '9999px', fontSize: '0.6875rem' }}>#{tag}</span>
          ))}
        </div>
        <h3 style={{ color: S.text, fontSize: '1rem', fontWeight: 'bold', lineHeight: 1.4, marginBottom: '8px' }}>{thread.title}</h3>
        {!expanded && (
          <p style={{ color: S.outline, fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {thread.content}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: `linear-gradient(to bottom right, ${S.primary}, ${S.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: 'bold', color: S.onPrimary }}>
              {thread.author?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span style={{ color: S.primary, fontSize: '0.75rem', fontWeight: 600 }}>{thread.author || 'User'}</span>
          </div>
          <span style={{ color: S.outlineVar, fontSize: '0.75rem' }}>{timeAgo(thread.createdAt || new Date())}</span>
          <button onClick={(e) => { e.stopPropagation(); onExpand(thread._id || thread.id); }} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', color: S.outline, border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.color = S.text; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }} onMouseLeave={e => { e.currentTarget.style.color = S.outline; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
            💬 {replies.length} comments
          </button>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div onClick={(e) => e.stopPropagation()} style={{ marginTop: '20px', borderTop: `1px solid ${S.outlineVar}`, paddingTop: '20px' }}>
            <div style={{ color: S.outline, fontSize: '0.9375rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: '24px', background: S.surfaceLowest, borderRadius: '8px', padding: '16px' }}>
              {thread.content}
            </div>
            <h4 style={{ color: S.text, fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💬</span> {replies.length} Comments
            </h4>
            {replies.map((r, i) => <Comment key={i} comment={r} depth={0} />)}
            
            <div style={{ marginTop: '20px', borderTop: `1px solid ${S.outlineVar}`, paddingTop: '16px' }}>
              <textarea 
                value={replyText} 
                onChange={e => setReplyText(e.target.value)} 
                placeholder="Share your thoughts..." 
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${S.outlineVar}`, borderRadius: '12px', color: S.text, padding: '14px', fontSize: '0.875rem', resize: 'vertical', minHeight: '80px', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = S.primary}
                onBlur={e => e.target.style.borderColor = S.outlineVar}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button onClick={handleReply} style={{ padding: '8px 20px', background: `linear-gradient(to bottom right, ${S.primary}, ${S.secondary})`, color: S.onPrimary, border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.opacity = 0.9; e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CreatePostModal = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Discussion');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post('/api/discuss', { title, content, category, tags: tags.split(',').map(t => t.trim()).filter(Boolean), userId: 'dummy_id' });
      onSubmit(res.data);
      toast.success('Post created successfully!');
    } catch (err) {
      toast.error('Failed to create post');
    }
    setSubmitting(false);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: S.surface, border: `1px solid ${S.outlineVar}`, borderRadius: '16px', padding: '32px', width: '560px', maxWidth: '95vw', boxShadow: '0 25px 60px -15px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ color: S.text, fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>✍️ Create Post</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${S.outlineVar}`, borderRadius: '8px', color: S.outline, width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ color: S.outline, fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What's on your mind?" style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: `1px solid ${S.outlineVar}`, borderRadius: '8px', color: S.text, padding: '12px 14px', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = S.primary} onBlur={e => e.target.style.borderColor = S.outlineVar} />
          </div>
          <div>
            <label style={{ color: S.outline, fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: `1px solid ${S.outlineVar}`, borderRadius: '8px', color: S.text, padding: '12px 14px', fontSize: '0.875rem', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}>
              {CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.name} style={{ background: S.surface, color: S.text }}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color: S.outline, fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Content *</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Share your knowledge, experience, or question..." style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: `1px solid ${S.outlineVar}`, borderRadius: '8px', color: S.text, padding: '12px 14px', fontSize: '0.875rem', resize: 'vertical', minHeight: '120px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = S.primary} onBlur={e => e.target.style.borderColor = S.outlineVar} />
          </div>
          <div>
            <label style={{ color: S.outline, fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Tags (comma separated)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="arrays, dynamic-programming, interview" style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: `1px solid ${S.outlineVar}`, borderRadius: '8px', color: S.text, padding: '12px 14px', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = S.primary} onBlur={e => e.target.style.borderColor = S.outlineVar} />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px' }}>
            <button onClick={onClose} style={{ padding: '10px 24px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${S.outlineVar}`, borderRadius: '8px', color: S.outline, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>Cancel</button>
            <button onClick={handleSubmit} disabled={submitting || !title.trim() || !content.trim()} style={{ padding: '10px 24px', borderRadius: '8px', color: S.onPrimary, fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s', border: 'none', cursor: (!title.trim() || !content.trim()) ? 'not-allowed' : 'pointer', background: (!title.trim() || !content.trim()) ? 'rgba(173,198,255,0.4)' : `linear-gradient(to bottom right, ${S.primary}, ${S.secondary})` }} onMouseEnter={e => { if(title.trim() && content.trim()) { e.currentTarget.style.opacity = 0.9; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3)'; } }} onMouseLeave={e => { if(title.trim() && content.trim()) { e.currentTarget.style.opacity = 1; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; } }}>
              {submitting ? 'Posting...' : 'Post 🚀'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Discuss() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('hot');
  const [expandedId, setExpandedId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchThreads = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/discuss');
        setThreads(res.data || []);
      } catch (err) {
        toast.error("Failed to fetch community threads");
      } finally {
        setLoading(false);
      }
    };
    fetchThreads();
  }, []);

  const handleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  const handleNewPost = (post) => {
    setThreads(prev => [post, ...prev]);
    setExpandedId(post._id || post.id);
  };

  const filteredThreads = threads
    .filter(t => {
      if (selectedCategory === 'all') return true;
      const cat = CATEGORIES.find(c => c.id === selectedCategory);
      return cat && t.category === cat.name;
    })
    .filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || (t.content || '').toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'hot') return ((b.upvotes || 0) + (b.replies?.length || 0) * 2) - ((a.upvotes || 0) + (a.replies?.length || 0) * 2);
      if (sortBy === 'new') return new Date(b.createdAt || b.time) - new Date(a.createdAt || a.time);
      if (sortBy === 'top') return (b.upvotes || 0) - (a.upvotes || 0);
      if (sortBy === 'rising') return (b.replies?.length || 0) - (a.replies?.length || 0);
      return 0;
    });

  const isMobile = windowWidth < 768;

  return (
    <div style={{ minHeight: '100vh', paddingTop: '70px', background: S.bg, fontFamily: 'Inter, system-ui, sans-serif', color: S.text }}>
      
      {/* ── LEFT SIDEBAR ── */}
      {!isMobile && (
        <div style={{ position: 'fixed', top: '70px', left: 0, width: '240px', height: 'calc(100vh - 70px)', background: 'rgba(27, 27, 33, 0.95)', backdropFilter: 'blur(10px)', borderRight: `1px solid ${S.outlineVar}`, overflowY: 'auto', zIndex: 40, paddingBottom: '20px' }}>
          
          <div style={{ padding: '20px', borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `linear-gradient(to bottom right, ${S.primary}, ${S.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>🚀</div>
              <div>
                <div style={{ color: S.text, fontWeight: 800, fontSize: '0.9375rem' }}>r/DevLeap</div>
                <div style={{ color: S.outlineVar, fontSize: '0.6875rem' }}>Developer Community</div>
              </div>
            </div>
            <div style={{ color: S.tertiary, fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
              <span style={{ width: '8px', height: '8px', background: S.tertiary, borderRadius: '50%', animation: 'pulse 2s infinite', boxShadow: `0 0 8px ${S.tertiary}` }} />
              <span style={{ fontWeight: 'bold' }}>24,891</span> <span style={{ color: S.outlineVar }}>members online</span>
            </div>
          </div>

          <div style={{ padding: '12px' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: S.outlineVar }}>🔍</span>
              <input 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                placeholder="Search posts..." 
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${S.outlineVar}`, borderRadius: '9999px', color: S.text, padding: '8px 16px 8px 36px', fontSize: '0.75rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = S.primary}
                onBlur={e => e.target.style.borderColor = S.outlineVar}
              />
            </div>
          </div>

          <div style={{ padding: '8px' }}>
            <div style={{ color: S.outlineVar, fontSize: '0.625rem', fontWeight: 'bold', letterSpacing: '0.1em', padding: '0 8px 8px 8px', textTransform: 'uppercase' }}>Categories</div>
            {CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', marginBottom: '2px', textAlign: 'left', transition: 'all 0.2s', cursor: 'pointer', border: 'none',
                    background: isActive ? 'rgba(173,198,255,0.1)' : 'transparent',
                    borderLeft: isActive ? `4px solid ${S.primary}` : '4px solid transparent',
                    borderTopRightRadius: '8px', borderBottomRightRadius: '8px',
                    color: isActive ? S.primary : S.outline,
                    fontWeight: isActive ? 'bold' : '500'
                  }}
                  onMouseEnter={e => { if(!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = S.text; } }}
                  onMouseLeave={e => { if(!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = S.outline; } }}
                >
                  <span style={{ fontSize: '0.9375rem' }}>{cat.icon}</span>
                  <span style={{ fontSize: '0.875rem', flex: 1 }}>{cat.name}</span>
                </button>
              );
            })}
          </div>

          <div style={{ padding: '12px 16px', borderTop: `1px solid rgba(255,255,255,0.05)`, marginTop: '8px' }}>
            <button onClick={() => setShowCreateModal(true)}
              style={{ width: '100%', padding: '12px', background: `linear-gradient(to bottom right, ${S.primary}, ${S.secondary})`, borderRadius: '12px', color: S.onPrimary, fontSize: '0.875rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = 0.9; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              ✍️ Create Post
            </button>
          </div>
        </div>
      )}

      {/* ── CENTER FEED ── */}
      <div style={{ marginLeft: isMobile ? 0 : '240px', padding: '24px 32px', minHeight: 'calc(100vh - 70px)', maxWidth: '900px', boxSizing: 'border-box' }}>
        
        {/* Sort Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '24px', background: 'rgba(31, 31, 38, 0.5)', padding: '6px', borderRadius: '12px', border: `1px solid ${S.outlineVar}`, width: 'fit-content' }}>
          <span style={{ color: S.outlineVar, fontSize: '0.875rem', padding: '0 8px' }}>Sort:</span>
          {['hot', 'new', 'top', 'rising'].map(tab => (
            <button key={tab} onClick={() => setSortBy(tab)}
              style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '0.875rem', textTransform: 'capitalize', transition: 'all 0.2s', border: 'none', cursor: 'pointer',
                background: sortBy === tab ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: sortBy === tab ? S.primary : S.outline,
                fontWeight: sortBy === tab ? 'bold' : 'normal',
                boxShadow: sortBy === tab ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
              }}
              onMouseEnter={e => { if(sortBy !== tab) { e.currentTarget.style.color = S.text; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; } }}
              onMouseLeave={e => { if(sortBy !== tab) { e.currentTarget.style.color = S.outline; e.currentTarget.style.background = 'transparent'; } }}
            >
              {tab === 'hot' ? '🔥' : tab === 'new' ? '✨' : tab === 'top' ? '⬆️' : '📈'} {tab}
            </button>
          ))}
          <div style={{ marginLeft: '16px', color: S.outlineVar, fontSize: '0.75rem', fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>
            {filteredThreads.length} posts
          </div>
        </div>

        {/* Feed */}
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filteredThreads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', background: S.surface, border: `1px solid ${S.outlineVar}`, borderRadius: '16px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: S.text, marginBottom: '8px' }}>No posts found</h3>
            <p style={{ color: S.outline }}>Be the first to start a discussion in this category!</p>
          </div>
        ) : (
          filteredThreads.map(thread => (
            <PostCard key={thread._id || thread.id} thread={thread} expanded={expandedId === (thread._id || thread.id)} onExpand={handleExpand} />
          ))
        )}
      </div>

      {showCreateModal && <CreatePostModal onClose={() => setShowCreateModal(false)} onSubmit={handleNewPost} />}
    </div>
  );
}