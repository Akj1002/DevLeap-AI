import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const S = {
  bg: '#09090e', surface: '#111118', surfaceHigh: '#18181f', surfaceHighest: '#1f1f28',
  primary: '#38bdf8', primaryGlow: 'rgba(56,189,248,0.1)',
  secondary: '#818cf8', green: '#4ade80', amber: '#fbbf24', red: '#f87171', pink: '#f472b6',
  text: '#f1f5f9', textSub: '#94a3b8', outline: '#26262f',
};

const COMPANIES = ['Google', 'Meta', 'Apple', 'Amazon', 'Netflix', 'Microsoft', 'OpenAI', 'Stripe', 'Airbnb', 'Uber', 'Twitter', 'LinkedIn', 'Nvidia', 'Anthropic', 'Other'];
const OUTCOMES = ['all', 'Offer', 'Rejected', 'Withdrew', 'Ghost', 'Pending'];
const LEVELS = ['all', 'Intern', 'Entry', 'Mid', 'Senior', 'Staff', 'Principal'];
const OUTCOME_COLORS = { Offer: '#4ade80', Rejected: '#f87171', Withdrew: '#fbbf24', Ghost: '#94a3b8', Pending: '#38bdf8' };
const DIFFICULTY_LABELS = ['', '⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];

function ExperienceCard({ exp, onClick }) {
  const [hovered, setHovered] = useState(false);
  const outcomeColor = OUTCOME_COLORS[exp.outcome] || S.textSub;

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(exp)}
      style={{ background: S.surface, borderRadius: '16px', border: `1px solid ${hovered ? S.primary : S.outline}`, padding: '20px', cursor: 'pointer', transition: 'all 0.22s', transform: hovered ? 'translateY(-3px)' : 'none', boxShadow: hovered ? `0 10px 32px rgba(56,189,248,0.1)` : 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <div style={{ display: 'flex', gap: '7px', alignItems: 'center', marginBottom: '5px' }}>
            <span style={{ color: S.text, fontWeight: 800, fontSize: '1.05rem' }}>{exp.company}</span>
            {exp.verified && <span style={{ background: 'rgba(74,222,128,0.1)', color: S.green, fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px', borderRadius: '5px' }}>✓ Verified</span>}
          </div>
          <div style={{ color: S.textSub, fontSize: '0.82rem' }}>{exp.role} · {exp.level}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ background: `${outcomeColor}18`, color: outcomeColor, fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: '7px', border: `1px solid ${outcomeColor}30`, marginBottom: '5px' }}>{exp.outcome}</div>
          <div style={{ color: S.textSub, fontSize: '0.68rem' }}>{exp.interviewMonth} {exp.interviewYear}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '14px', marginBottom: '12px', flexWrap: 'wrap', fontSize: '0.75rem', color: S.textSub }}>
        <span>⚡ {exp.rounds} rounds</span>
        <span>⏱️ {exp.duration}</span>
        <span>🎯 {DIFFICULTY_LABELS[exp.difficulty]}</span>
        {exp.salaryOffered > 0 && <span style={{ color: S.green }}>💰 ${(exp.salaryOffered / 1000).toFixed(0)}k</span>}
      </div>

      {(exp.questions || []).length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ color: S.textSub, fontSize: '0.68rem', fontWeight: 600, marginBottom: '6px' }}>QUESTIONS ASKED:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {exp.questions.slice(0, 2).map((q, i) => (
              <div key={i} style={{ background: S.surfaceHigh, borderRadius: '7px', padding: '7px 10px', fontSize: '0.75rem', color: S.textSub, borderLeft: `2px solid ${S.primary}` }}>
                <span style={{ color: S.primary, marginRight: '6px' }}>[{q.round}]</span>{q.question}
              </div>
            ))}
            {exp.questions.length > 2 && <div style={{ color: S.textSub, fontSize: '0.7rem' }}>+{exp.questions.length - 2} more questions</div>}
          </div>
        </div>
      )}

      {(exp.tags || []).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
          {exp.tags.map(t => <span key={t} style={{ background: S.surfaceHigh, color: S.textSub, fontSize: '0.63rem', padding: '2px 7px', borderRadius: '5px' }}>#{t}</span>)}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: S.textSub }}>
        <span>by {exp.anonymous ? 'Anonymous' : exp.authorName}</span>
        <span>▲ {exp.upvoteCount}</span>
      </div>
    </div>
  );
}

function ExperienceDetail({ exp, onClose, onUpvote, onComment, onUpvoteQ, upvotedIds }) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(exp.comments || []);
  const [aiQuestions, setAiQuestions] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const outcomeColor = OUTCOME_COLORS[exp.outcome] || S.textSub;

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await onComment(exp._id, { authorId: user._id, authorName: user.username || 'Anonymous', text: comment });
      setComments(prev => [...prev, res.data.comment]);
      setComment('');
    } catch { toast.error('Failed to add comment'); } finally { setSubmitting(false); }
  };

  const handleExtractQuestions = async () => {
    setExtracting(true);
    try {
      const res = await axios.post(`/api/experiences/${exp._id}/extract-questions`);
      setAiQuestions(res.data.questions || []);
      toast.success(`🤖 Extracted ${res.data.questions?.length} questions!`);
    } catch { toast.error('AI extraction failed'); } finally { setExtracting(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 20px 20px', backdropFilter: 'blur(8px)', overflowY: 'auto' }}>
      <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '22px', width: '100%', maxWidth: '800px', position: 'relative', marginBottom: '20px' }}>
        <div style={{ padding: '24px 28px', borderBottom: `1px solid ${S.outline}` }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: S.surfaceHigh, border: 'none', color: S.textSub, borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer' }}>✕</button>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: `${outcomeColor}15`, color: outcomeColor, fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '7px' }}>{exp.outcome}</span>
            <span style={{ background: S.primaryGlow, color: S.primary, fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '7px' }}>{exp.level}</span>
            {exp.verified && <span style={{ background: 'rgba(74,222,128,0.1)', color: S.green, fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '7px' }}>✓ Verified</span>}
          </div>
          <h2 style={{ color: S.text, fontWeight: 800, fontSize: '1.4rem', margin: '0 0 4px' }}>{exp.company}</h2>
          <p style={{ color: S.textSub, margin: 0, fontSize: '0.875rem' }}>{exp.role} · {exp.interviewMonth} {exp.interviewYear}</p>
        </div>

        <div style={{ padding: '24px 28px' }}>
          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
            {[{ l: 'Rounds', v: exp.rounds }, { l: 'Duration', v: exp.duration }, { l: 'Difficulty', v: DIFFICULTY_LABELS[exp.difficulty] }, { l: 'TC Offered', v: exp.salaryOffered > 0 ? `$${(exp.salaryOffered / 1000).toFixed(0)}k` : 'N/A' }].map(s => (
              <div key={s.l} style={{ background: S.surfaceHigh, borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ color: S.text, fontWeight: 700, fontSize: '0.95rem' }}>{s.v}</div>
                <div style={{ color: S.textSub, fontSize: '0.65rem', marginTop: '2px' }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Process */}
          {exp.process && <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: S.text, fontWeight: 700, margin: '0 0 10px', fontSize: '0.9rem' }}>📋 Interview Process</h4>
            <p style={{ color: S.textSub, lineHeight: 1.7, fontSize: '0.875rem', margin: 0 }}>{exp.process}</p>
          </div>}

          {/* Questions */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ color: S.text, fontWeight: 700, margin: 0, fontSize: '0.9rem' }}>❓ Questions Asked ({exp.questions?.length || 0})</h4>
              <button onClick={handleExtractQuestions} disabled={extracting} style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, background: extracting ? S.surfaceHigh : `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: extracting ? S.textSub : '#fff', border: 'none', cursor: extracting ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
                {extracting ? '⏳ Extracting...' : '🤖 AI Extract Questions'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(exp.questions || []).map((q, i) => (
                <div key={i} style={{ background: S.surfaceHigh, borderRadius: '10px', padding: '12px 14px', borderLeft: `3px solid ${S.primary}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={{ color: S.primary, fontSize: '0.7rem', fontWeight: 700 }}>[{q.round}]</span>
                      <span style={{ background: 'rgba(56,189,248,0.1)', color: S.primary, fontSize: '0.65rem', padding: '1px 7px', borderRadius: '4px' }}>{q.category}</span>
                      <span style={{ background: q.difficulty === 'Hard' ? 'rgba(248,113,113,0.1)' : q.difficulty === 'Medium' ? 'rgba(251,191,36,0.1)' : 'rgba(74,222,128,0.1)', color: q.difficulty === 'Hard' ? S.red : q.difficulty === 'Medium' ? S.amber : S.green, fontSize: '0.65rem', padding: '1px 7px', borderRadius: '4px' }}>{q.difficulty}</span>
                    </div>
                    <button onClick={() => onUpvoteQ(exp._id, i)} style={{ background: 'none', border: 'none', color: S.textSub, cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'inherit' }}>▲ {q.upvotes || 0}</button>
                  </div>
                  <p style={{ color: S.text, fontSize: '0.82rem', margin: 0 }}>{q.question}</p>
                </div>
              ))}
              {aiQuestions.length > 0 && (
                <div style={{ background: 'rgba(129,140,248,0.05)', border: `1px solid rgba(129,140,248,0.2)`, borderRadius: '10px', padding: '14px' }}>
                  <div style={{ color: S.secondary, fontWeight: 700, fontSize: '0.75rem', marginBottom: '8px' }}>🤖 AI-EXTRACTED QUESTIONS</div>
                  {aiQuestions.map((q, i) => (
                    <div key={i} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: i < aiQuestions.length - 1 ? `1px solid ${S.outline}` : 'none' }}>
                      <p style={{ color: S.text, fontSize: '0.82rem', margin: '0 0 3px' }}>{q.question}</p>
                      <div style={{ display: 'flex', gap: '5px' }}><span style={{ color: S.primary, fontSize: '0.65rem' }}>[{q.category}]</span><span style={{ color: S.textSub, fontSize: '0.65rem' }}>{q.difficulty}</span></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          {(exp.tips || []).length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: S.text, fontWeight: 700, margin: '0 0 10px', fontSize: '0.9rem' }}>💡 Pro Tips</h4>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {exp.tips.map((t, i) => <li key={i} style={{ color: S.textSub, fontSize: '0.82rem', lineHeight: 1.5 }}>{t}</li>)}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={() => onUpvote(exp._id)} style={{ padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem', background: upvotedIds.has(exp._id) ? 'rgba(56,189,248,0.12)' : S.surfaceHigh, border: `1px solid ${upvotedIds.has(exp._id) ? S.primary : S.outline}`, color: upvotedIds.has(exp._id) ? S.primary : S.textSub, cursor: 'pointer', fontFamily: 'inherit' }}>
              ▲ {upvotedIds.has(exp._id) ? 'Upvoted' : 'Upvote'} ({exp.upvoteCount})
            </button>
          </div>

          {/* Comments */}
          <h4 style={{ color: S.text, fontWeight: 700, margin: '0 0 12px', fontSize: '0.9rem' }}>💬 Comments ({comments.length})</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px', maxHeight: '200px', overflowY: 'auto' }}>
            {comments.map((c, i) => (
              <div key={i} style={{ background: S.surfaceHigh, borderRadius: '10px', padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: S.text, fontSize: '0.8rem' }}>{c.authorName}</strong>
                  <span style={{ color: S.textSub, fontSize: '0.68rem' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p style={{ color: S.textSub, fontSize: '0.78rem', margin: 0 }}>{c.text}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your thoughts..." onKeyDown={e => e.key === 'Enter' && handleComment()}
              style={{ flex: 1, padding: '10px 12px', borderRadius: '9px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none' }} />
            <button onClick={handleComment} disabled={submitting || !comment.trim()} style={{ padding: '10px 16px', borderRadius: '9px', background: comment.trim() ? S.primary : S.surfaceHigh, color: comment.trim() ? '#000' : S.textSub, border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>
              {submitting ? '...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmitExperienceModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ company: '', role: '', level: 'Mid', outcome: 'Offer', difficulty: 3, rounds: 4, duration: '4 weeks', salaryOffered: 0, process: '', tips: '', tags: '', interviewMonth: 'January', interviewYear: 2026, anonymous: false });
  const [questions, setQuestions] = useState([{ round: 'Coding 1', question: '', category: 'Algorithms', difficulty: 'Medium' }]);
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleSubmit = async () => {
    if (!form.company || !form.role) { toast.error('Company and role are required'); return; }
    setSubmitting(true);
    try {
      const data = { ...form, questions: questions.filter(q => q.question.trim()), tips: form.tips.split('\n').filter(t => t.trim()), tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), authorId: user._id, authorName: form.anonymous ? 'Anonymous' : (user.username || 'Anonymous') };
      const res = await axios.post('/api/experiences', data);
      toast.success('🎉 Experience shared!');
      onSuccess(res.data);
      onClose();
    } catch { toast.error('Failed to submit experience'); } finally { setSubmitting(false); }
  };

  const inp = { width: '100%', padding: '10px 12px', borderRadius: '9px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.85rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', marginBottom: '12px' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 20px 20px', backdropFilter: 'blur(8px)', overflowY: 'auto' }}>
      <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '22px', padding: '32px', maxWidth: '640px', width: '100%', marginBottom: '20px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: S.surfaceHigh, border: 'none', color: S.textSub, borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer' }}>✕</button>
        <h2 style={{ color: S.text, fontWeight: 700, fontSize: '1.3rem', margin: '0 0 20px' }}>📝 Share Interview Experience</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>COMPANY *</label>
            <select value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} style={{ ...inp }}>
              <option value="">Select company</option>
              {COMPANIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>ROLE *</label>
            <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="e.g. Software Engineer" style={{ ...inp }} />
          </div>
          <div>
            <label style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>LEVEL</label>
            <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} style={{ ...inp }}>{['Intern', 'Entry', 'Mid', 'Senior', 'Staff', 'Principal'].map(l => <option key={l}>{l}</option>)}</select>
          </div>
          <div>
            <label style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>OUTCOME</label>
            <select value={form.outcome} onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))} style={{ ...inp }}>{['Offer', 'Rejected', 'Withdrew', 'Ghost', 'Pending'].map(o => <option key={o}>{o}</option>)}</select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>ROUNDS</label>
            <input type="number" value={form.rounds} onChange={e => setForm(f => ({ ...f, rounds: parseInt(e.target.value) }))} style={{ ...inp }} />
          </div>
          <div>
            <label style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>DIFFICULTY (1-5)</label>
            <input type="number" min={1} max={5} value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: parseInt(e.target.value) }))} style={{ ...inp }} />
          </div>
          <div>
            <label style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>TOTAL COMP ($)</label>
            <input type="number" value={form.salaryOffered} onChange={e => setForm(f => ({ ...f, salaryOffered: parseInt(e.target.value) }))} placeholder="0" style={{ ...inp }} />
          </div>
        </div>

        <label style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>PROCESS DESCRIPTION</label>
        <textarea value={form.process} onChange={e => setForm(f => ({ ...f, process: e.target.value }))} placeholder="Describe the full interview process..." rows={3} style={{ ...inp, resize: 'vertical' }} />

        <label style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>TIPS (one per line)</label>
        <textarea value={form.tips} onChange={e => setForm(f => ({ ...f, tips: e.target.value }))} placeholder="Practice system design...&#10;Leetcode daily..." rows={2} style={{ ...inp, resize: 'vertical' }} />

        <label style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>QUESTIONS ({questions.length})</label>
        {questions.map((q, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '7px', marginBottom: '7px' }}>
            <input value={q.round} onChange={e => setQuestions(qs => qs.map((x, j) => j === i ? { ...x, round: e.target.value } : x))} placeholder="Round" style={{ padding: '8px 10px', borderRadius: '8px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.78rem', fontFamily: 'inherit', outline: 'none' }} />
            <input value={q.question} onChange={e => setQuestions(qs => qs.map((x, j) => j === i ? { ...x, question: e.target.value } : x))} placeholder="Question asked..." style={{ padding: '8px 10px', borderRadius: '8px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.78rem', fontFamily: 'inherit', outline: 'none', gridColumn: 'span 2' }} />
            <button onClick={() => setQuestions(qs => qs.filter((_, j) => j !== i))} style={{ padding: '8px', borderRadius: '8px', background: 'rgba(248,113,113,0.1)', border: 'none', color: S.red, cursor: 'pointer' }}>✕</button>
          </div>
        ))}
        <button onClick={() => setQuestions(qs => [...qs, { round: '', question: '', category: 'Algorithms', difficulty: 'Medium' }])} style={{ background: S.surfaceHigh, border: `1px dashed ${S.outline}`, color: S.textSub, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit', marginBottom: '14px', width: '100%' }}>+ Add Question</button>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="Tags (comma-separated): faang, hard, ml" style={{ flex: 1, padding: '10px 12px', borderRadius: '9px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none' }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: S.textSub, fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
            <input type="checkbox" checked={form.anonymous} onChange={e => setForm(f => ({ ...f, anonymous: e.target.checked }))} /> Post anonymously
          </label>
        </div>

        <button onClick={handleSubmit} disabled={submitting} style={{ width: '100%', padding: '13px', borderRadius: '11px', fontWeight: 700, fontSize: '0.95rem', background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: '#000', border: 'none', cursor: submitting ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.7 : 1 }}>
          {submitting ? '⏳ Submitting...' : '📝 Share Experience'}
        </button>
      </div>
    </div>
  );
}

export default function InterviewExperiences() {
  const [experiences, setExperiences] = useState([]);
  const [stats, setStats] = useState(null);
  const [companyStats, setCompanyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState('all');
  const [outcome, setOutcome] = useState('all');
  const [level, setLevel] = useState('all');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [submitModal, setSubmitModal] = useState(false);
  const [upvotedIds, setUpvotedIds] = useState(new Set());
  const [tab, setTab] = useState('feed');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchExperiences = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (company !== 'all') params.company = company;
      if (outcome !== 'all') params.outcome = outcome;
      if (level !== 'all') params.level = level;
      if (search) params.search = search;
      const res = await axios.get('/api/experiences', { params });
      setExperiences(res.data.experiences || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch {
      try { await axios.post('/api/experiences/seed/bulk'); const r = await axios.get('/api/experiences', { params: { limit: 12 } }); setExperiences(r.data.experiences || []); setTotal(r.data.total || 0); } catch {}
    } finally { setLoading(false); }
  }, [page, company, outcome, level, sort, search]);

  const fetchStats = async () => {
    try {
      const [ov, cs] = await Promise.all([axios.get('/api/experiences/stats/overview'), axios.get('/api/experiences/stats/companies')]);
      setStats(ov.data); setCompanyStats(cs.data || []);
    } catch {}
  };

  useEffect(() => { fetchExperiences(); fetchStats(); }, [fetchExperiences]);

  const handleUpvote = async (expId) => {
    try {
      const res = await axios.post(`/api/experiences/${expId}/upvote`, { userId: user._id || 'guest' });
      setUpvotedIds(prev => { const n = new Set(prev); res.data.upvoted ? n.add(expId) : n.delete(expId); return n; });
      setExperiences(prev => prev.map(e => e._id === expId ? { ...e, upvoteCount: res.data.upvoteCount } : e));
      if (selected?._id === expId) setSelected(s => ({ ...s, upvoteCount: res.data.upvoteCount }));
    } catch { toast.error('Failed to upvote'); }
  };

  const handleComment = async (expId, data) => {
    return axios.post(`/api/experiences/${expId}/comment`, data);
  };

  const handleUpvoteQ = async (expId, qIdx) => {
    const res = await axios.post(`/api/experiences/${expId}/questions/${qIdx}/upvote`);
    toast.success(`▲ ${res.data.upvotes} upvotes`);
  };

  const handleOpenExp = async (exp) => {
    try { const r = await axios.get(`/api/experiences/${exp._id}`); setSelected(r.data); } catch { setSelected(exp); }
  };

  const handleNewExp = (exp) => { setExperiences(prev => [exp, ...prev]); setTotal(t => t + 1); };

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, paddingTop: '88px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); *{box-sizing:border-box;} @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}`}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px' }}>
        {/* HERO */}
        <div style={{ padding: '36px 0 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, margin: '0 0 8px', background: `linear-gradient(135deg, ${S.text}, ${S.primary}, ${S.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Interview Experiences
            </h1>
            <p style={{ color: S.textSub, fontSize: '1rem', margin: 0 }}>Real stories from real candidates — {total} shared experiences</p>
          </div>
          <button onClick={() => setSubmitModal(true)} style={{ padding: '13px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: '#000', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>📝 Share Experience</button>
        </div>

        {/* STATS */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {[{ l: 'Total', v: stats.total, c: S.primary }, ...((stats.outcomes || []).map(o => ({ l: o._id, v: o.count, c: OUTCOME_COLORS[o._id] || S.textSub })))].slice(0, 6).map(s => (
              <div key={s.l} style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                <div style={{ color: s.c, fontWeight: 800, fontSize: '1.3rem' }}>{s.v}</div>
                <div style={{ color: S.textSub, fontSize: '0.68rem', marginTop: '2px' }}>{s.l}</div>
              </div>
            ))}
          </div>
        )}

        {/* TABS */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '20px', background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '11px', padding: '3px', width: 'fit-content' }}>
          {['feed', 'companies'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: tab === t ? `linear-gradient(135deg, ${S.primary}, ${S.secondary})` : 'transparent', color: tab === t ? '#000' : S.textSub, textTransform: 'capitalize' }}>
              {t === 'feed' ? '📰 Feed' : '🏢 Companies'}
            </button>
          ))}
        </div>

        {tab === 'feed' && (
          <>
            {/* FILTERS */}
            <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '14px', padding: '14px 18px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1 1 180px' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search..." style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '8px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.82rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
              </div>
              {[
                { v: company, opts: ['all', ...COMPANIES], onChange: v => { setCompany(v); setPage(1); } },
                { v: outcome, opts: OUTCOMES, onChange: v => { setOutcome(v); setPage(1); } },
                { v: level, opts: LEVELS, onChange: v => { setLevel(v); setPage(1); } },
                { v: sort, opts: ['newest', 'popular', 'salary'], onChange: v => { setSort(v); setPage(1); } },
              ].map((f, i) => (
                <select key={i} value={f.v} onChange={e => f.onChange(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.82rem', fontFamily: 'inherit', cursor: 'pointer' }}>
                  {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ))}
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
                {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ background: S.surface, borderRadius: '16px', height: '240px', backgroundImage: `linear-gradient(90deg, ${S.surface}, ${S.surfaceHigh}, ${S.surface})`, backgroundSize: '200%', animation: 'shimmer 1.5s infinite' }} />)}
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                  {experiences.map(e => <ExperienceCard key={e._id} exp={e} onClick={handleOpenExp} />)}
                </div>
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)} style={{ width: '36px', height: '36px', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: page === p ? S.primary : S.surfaceHigh, color: page === p ? '#000' : S.textSub }}>{p}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {tab === 'companies' && (
          <div>
            <h3 style={{ color: S.text, fontWeight: 700, margin: '0 0 16px' }}>🏢 Company Statistics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '14px' }}>
              {companyStats.map(cs => (
                <div key={cs._id} style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '14px', padding: '18px', cursor: 'pointer', transition: 'border-color 0.2s' }} onClick={() => { setCompany(cs._id); setTab('feed'); }} onMouseEnter={e => e.currentTarget.style.borderColor = S.primary} onMouseLeave={e => e.currentTarget.style.borderColor = S.outline}>
                  <div style={{ fontWeight: 800, color: S.text, fontSize: '1.05rem', marginBottom: '12px' }}>{cs._id}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[{ l: 'Reports', v: cs.count }, { l: 'Offer Rate', v: `${Math.round(cs.offerRate * 100)}%` }, { l: 'Avg Difficulty', v: `${cs.avgDifficulty?.toFixed(1) || '—'}/5` }, { l: 'Avg TC', v: cs.avgSalary > 0 ? `$${(cs.avgSalary / 1000).toFixed(0)}k` : 'N/A' }].map(s => (
                      <div key={s.l} style={{ background: S.surfaceHigh, borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                        <div style={{ color: S.primary, fontWeight: 700, fontSize: '0.9rem' }}>{s.v}</div>
                        <div style={{ color: S.textSub, fontSize: '0.62rem' }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selected && <ExperienceDetail exp={selected} onClose={() => setSelected(null)} onUpvote={handleUpvote} onComment={handleComment} onUpvoteQ={handleUpvoteQ} upvotedIds={upvotedIds} />}
      {submitModal && <SubmitExperienceModal onClose={() => setSubmitModal(false)} onSuccess={handleNewExp} />}
    </div>
  );
}
