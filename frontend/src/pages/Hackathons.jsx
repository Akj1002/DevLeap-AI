import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const S = {
  bg: '#09090e', surface: '#111118', surfaceHigh: '#18181f', surfaceHighest: '#1f1f28',
  primary: '#f472b6', primaryGlow: 'rgba(244,114,182,0.12)',
  secondary: '#818cf8', green: '#34d399', amber: '#fbbf24', red: '#f87171',
  blue: '#60a5fa', text: '#f1f5f9', textSub: '#94a3b8',
  outline: '#27272f', outlineVar: '#14141c',
};

const STATUS_META = {
  upcoming: { label: 'Upcoming', color: S.blue, bg: 'rgba(96,165,250,0.12)', icon: '🗓️' },
  active: { label: 'Live Now', color: S.green, bg: 'rgba(52,211,153,0.12)', icon: '🔴' },
  judging: { label: 'Judging', color: S.amber, bg: 'rgba(251,191,36,0.12)', icon: '⚖️' },
  completed: { label: 'Completed', color: S.textSub, bg: 'rgba(148,163,184,0.1)', icon: '✅' },
};

function Countdown({ targetDate, label }) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(targetDate) - Date.now());
      setT({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    calc(); const id = setInterval(calc, 1000); return () => clearInterval(id);
  }, [targetDate]);

  return (
    <div>
      {label && <div style={{ color: S.textSub, fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{label}</div>}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[['d', t.d], ['h', t.h], ['m', t.m], ['s', t.s]].map(([l, v]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${S.outline}`, borderRadius: '8px', padding: '8px 10px', minWidth: '44px', fontSize: '1.25rem', fontWeight: 800, color: S.text, fontVariantNumeric: 'tabular-nums' }}>{String(v).padStart(2, '0')}</div>
            <div style={{ color: S.textSub, fontSize: '0.6rem', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HackathonCard({ hackathon, onRegister, registeredIds, userId }) {
  const [hovered, setHovered] = useState(false);
  const meta = STATUS_META[hackathon.status] || STATUS_META.upcoming;
  const isRegistered = registeredIds.has(hackathon._id);
  const spotsLeft = hackathon.totalSlots - hackathon.registeredCount;
  const spotsPercent = Math.min(100, (hackathon.registeredCount / hackathon.totalSlots) * 100);

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: S.surface, borderRadius: '20px', border: `1px solid ${hovered ? S.primary : S.outline}`,
        overflow: 'hidden', transition: 'all 0.25s', cursor: 'default',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? `0 12px 40px rgba(244,114,182,0.1)` : 'none',
        position: 'relative'
      }}>
      {/* Colored Top Bar */}
      <div style={{ height: '5px', background: `linear-gradient(to right, ${S.primary}, ${S.secondary})`, opacity: hackathon.status === 'active' ? 1 : 0.5 }} />

      {/* Featured Badge */}
      {hackathon.featured && (
        <div style={{ position: 'absolute', top: '18px', right: '16px', background: 'rgba(251,191,36,0.15)', color: S.amber, fontSize: '0.6rem', fontWeight: 700, padding: '3px 9px', borderRadius: '99px', border: '1px solid rgba(251,191,36,0.3)' }}>
          ⭐ FEATURED
        </div>
      )}

      <div style={{ padding: '22px 22px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ fontSize: '2rem', flexShrink: 0 }}>{hackathon.organizerLogo || '🏆'}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '5px', flexWrap: 'wrap' }}>
              <span style={{ background: meta.bg, color: meta.color, fontSize: '0.65rem', fontWeight: 700, padding: '3px 9px', borderRadius: '99px' }}>
                {hackathon.status === 'active' && <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: S.green, marginRight: '5px', animation: 'pulse 1.5s infinite' }} />}
                {meta.icon} {meta.label}
              </span>
              {hackathon.online && <span style={{ background: 'rgba(52,211,153,0.1)', color: S.green, fontSize: '0.62rem', fontWeight: 600, padding: '2px 8px', borderRadius: '99px' }}>🌐 Online</span>}
            </div>
            <h3 style={{ color: S.text, fontWeight: 700, fontSize: '1rem', lineHeight: 1.3, margin: 0 }}>{hackathon.title}</h3>
            <div style={{ color: S.textSub, fontSize: '0.75rem', marginTop: '2px' }}>by {hackathon.organizer}</div>
          </div>
        </div>

        {/* Description */}
        {hackathon.tagline && <p style={{ color: S.textSub, fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{hackathon.tagline}</p>}

        {/* Prize Pool */}
        {hackathon.prizePool > 0 && (
          <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: S.textSub, fontSize: '0.75rem', fontWeight: 600 }}>💰 Prize Pool</span>
            <span style={{ color: S.amber, fontWeight: 800, fontSize: '1.05rem' }}>${hackathon.prizePool.toLocaleString()}</span>
          </div>
        )}

        {/* Countdown */}
        {hackathon.status === 'upcoming' && hackathon.startDate && (
          <div style={{ marginBottom: '14px' }}>
            <Countdown targetDate={hackathon.startDate} label="Starts In" />
          </div>
        )}
        {hackathon.status === 'active' && hackathon.endDate && (
          <div style={{ marginBottom: '14px' }}>
            <Countdown targetDate={hackathon.endDate} label="Ends In" />
          </div>
        )}

        {/* Capacity Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.72rem', color: S.textSub }}>
            <span>{hackathon.registeredCount.toLocaleString()} registered</span>
            <span style={{ color: spotsLeft < 50 ? S.red : spotsLeft < 100 ? S.amber : S.green }}>{spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}</span>
          </div>
          <div style={{ height: '6px', background: S.surfaceHigh, borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${spotsPercent}%`, borderRadius: '3px', background: spotsLeft < 50 ? S.red : `linear-gradient(to right, ${S.primary}, ${S.secondary})`, transition: 'width 0.5s' }} />
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '16px' }}>
          {(hackathon.tags || []).slice(0, 4).map(t => <span key={t} style={{ background: S.surfaceHigh, color: S.textSub, fontSize: '0.65rem', padding: '2px 8px', borderRadius: '5px' }}>#{t}</span>)}
        </div>

        {/* Register Button */}
        <button
          onClick={() => onRegister(hackathon)}
          disabled={hackathon.status === 'completed' || hackathon.registeredCount >= hackathon.totalSlots}
          style={{
            width: '100%', padding: '11px', borderRadius: '11px', fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: (hackathon.status === 'completed' || hackathon.registeredCount >= hackathon.totalSlots) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
            background: isRegistered ? 'rgba(52,211,153,0.1)' : hackathon.status === 'completed' ? S.surfaceHigh : `linear-gradient(135deg, ${S.primary}, ${S.secondary})`,
            color: isRegistered ? S.green : hackathon.status === 'completed' ? S.textSub : '#fff',
          }}
          onMouseEnter={e => { if (!isRegistered && hackathon.status !== 'completed') e.currentTarget.style.boxShadow = `0 4px 20px rgba(244,114,182,0.3)`; }}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
        >
          {hackathon.status === 'completed' ? '✅ Completed' : isRegistered ? '✓ Registered' : hackathon.registeredCount >= hackathon.totalSlots ? '🚫 Full' : '🚀 Register Now'}
        </button>
      </div>
    </div>
  );
}

function HackathonDetail({ hackathon, onClose, onSubmit, onVote, submittedTeamIds }) {
  const [tab, setTab] = useState('overview');
  const [teamName, setTeamName] = useState('');
  const [projectIdea, setProjectIdea] = useState('');
  const [projectName, setProjectName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const meta = STATUS_META[hackathon.status] || STATUS_META.upcoming;

  const handleCreateTeam = async () => {
    if (!teamName.trim()) { toast.error('Team name required'); return; }
    setSubmitting(true);
    try {
      const res = await axios.post(`/api/hackathons/${hackathon._id}/teams`, {
        userId: user._id, username: user.username || 'Anonymous', teamName, projectIdea
      });
      toast.success(`🎉 Team "${teamName}" created!`);
      setTeamName(''); setProjectIdea('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create team');
    } finally { setSubmitting(false); }
  };

  const handleProjectSubmit = async () => {
    if (!projectName.trim() || !repoUrl.trim()) { toast.error('Project name and repo URL are required'); return; }
    setSubmitting(true);
    try {
      await onSubmit(hackathon._id, { teamName: user.username + "'s Team", projectName, repoUrl, demoUrl, description: projectIdea });
      setProjectName(''); setRepoUrl(''); setDemoUrl('');
    } finally { setSubmitting(false); }
  };

  const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: '10px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.875rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', marginBottom: '12px' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 20px 20px', backdropFilter: 'blur(8px)', overflowY: 'auto' }}>
      <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '24px', width: '100%', maxWidth: '800px', overflow: 'hidden', position: 'relative', marginBottom: '20px' }}>
        {/* Hero Banner */}
        <div style={{ background: `linear-gradient(135deg, rgba(244,114,182,0.15), rgba(129,140,248,0.1))`, padding: '28px', borderBottom: `1px solid ${S.outline}` }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: S.surfaceHigh, border: 'none', color: S.textSub, borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1.1rem', zIndex: 1 }}>✕</button>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: meta.bg, color: meta.color, fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '99px' }}>{meta.icon} {meta.label}</span>
            {hackathon.featured && <span style={{ background: 'rgba(251,191,36,0.15)', color: S.amber, fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '99px' }}>⭐ Featured</span>}
          </div>
          <h2 style={{ color: S.text, fontWeight: 800, fontSize: '1.5rem', margin: '0 0 6px' }}>{hackathon.title}</h2>
          <p style={{ color: S.textSub, fontSize: '0.85rem', margin: 0 }}>{hackathon.tagline}</p>
          {hackathon.prizePool > 0 && <div style={{ marginTop: '12px', color: S.amber, fontWeight: 800, fontSize: '1.25rem' }}>💰 ${hackathon.prizePool.toLocaleString()} Prize Pool</div>}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', padding: '4px 28px', borderBottom: `1px solid ${S.outline}`, gap: '0' }}>
          {['overview', 'teams', 'submit', 'leaderboard', 'announcements'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '12px 18px', background: 'none', border: 'none', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: tab === t ? S.primary : S.textSub, borderBottom: `2px solid ${tab === t ? S.primary : 'transparent'}`, textTransform: 'capitalize', transition: 'color 0.2s' }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ padding: '24px 28px' }}>
          {tab === 'overview' && (
            <div>
              <p style={{ color: S.textSub, lineHeight: 1.7, marginBottom: '24px' }}>{hackathon.description}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Start Date', value: hackathon.startDate ? new Date(hackathon.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—' },
                  { label: 'End Date', value: hackathon.endDate ? new Date(hackathon.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—' },
                  { label: 'Team Size', value: `${hackathon.minTeamSize || 1}–${hackathon.maxTeamSize || 4} people` },
                  { label: 'Registered', value: `${hackathon.registeredCount} / ${hackathon.totalSlots}` },
                ].map(i => (
                  <div key={i.label} style={{ background: S.surfaceHigh, borderRadius: '10px', padding: '14px' }}>
                    <div style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, marginBottom: '5px', textTransform: 'uppercase' }}>{i.label}</div>
                    <div style={{ color: S.text, fontWeight: 700, fontSize: '0.95rem' }}>{i.value}</div>
                  </div>
                ))}
              </div>

              {(hackathon.prizes || []).length > 0 && (
                <>
                  <h4 style={{ color: S.text, fontWeight: 700, margin: '0 0 12px' }}>🏆 Prizes</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    {hackathon.prizes.map((p, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: S.surfaceHigh, borderRadius: '10px', padding: '12px 16px' }}>
                        <div>
                          <span style={{ color: S.text, fontWeight: 700 }}>{p.place}</span>
                          {p.description && <span style={{ color: S.textSub, fontSize: '0.78rem', marginLeft: '8px' }}>{p.description}</span>}
                        </div>
                        <span style={{ color: S.amber, fontWeight: 800 }}>${p.amount?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {(hackathon.rules || []).length > 0 && (
                <>
                  <h4 style={{ color: S.text, fontWeight: 700, margin: '0 0 12px' }}>📋 Rules</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {hackathon.rules.map((r, i) => <li key={i} style={{ color: S.textSub, fontSize: '0.85rem', lineHeight: 1.5 }}>{r}</li>)}
                  </ul>
                </>
              )}
            </div>
          )}

          {tab === 'teams' && (
            <div>
              <h4 style={{ color: S.text, fontWeight: 700, margin: '0 0 16px' }}>Create a Team</h4>
              <input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Team Name *" style={inputStyle} />
              <textarea value={projectIdea} onChange={e => setProjectIdea(e.target.value)} placeholder="Project Idea (optional)" rows={3} style={{ ...inputStyle, resize: 'vertical', marginBottom: '16px' }} />
              <button onClick={handleCreateTeam} disabled={submitting} style={{ padding: '12px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                {submitting ? '⏳ Creating...' : '🚀 Create Team'}
              </button>
              <h4 style={{ color: S.text, fontWeight: 700, margin: '24px 0 12px' }}>Existing Teams ({(hackathon.teams || []).length})</h4>
              {(hackathon.teams || []).length === 0 ? <p style={{ color: S.textSub, fontSize: '0.85rem' }}>No teams yet. Be the first to create one!</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(hackathon.teams || []).map((team, i) => (
                    <div key={i} style={{ background: S.surfaceHigh, borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ color: S.text, fontWeight: 700 }}>{team.name}</div>
                        <div style={{ color: S.textSub, fontSize: '0.75rem', marginTop: '2px' }}>Led by {team.leaderName} · {(team.members || []).length}/{team.maxSize} members</div>
                        {team.projectIdea && <div style={{ color: S.primary, fontSize: '0.75rem', marginTop: '3px' }}>💡 {team.projectIdea}</div>}
                      </div>
                      {team.lookingForMembers && <span style={{ background: 'rgba(52,211,153,0.1)', color: S.green, fontSize: '0.68rem', fontWeight: 600, padding: '3px 10px', borderRadius: '99px' }}>🟢 Open</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'submit' && (
            <div>
              <h4 style={{ color: S.text, fontWeight: 700, margin: '0 0 16px' }}>Submit Your Project</h4>
              <input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Project Name *" style={inputStyle} />
              <input value={repoUrl} onChange={e => setRepoUrl(e.target.value)} placeholder="GitHub Repository URL *" style={inputStyle} />
              <input value={demoUrl} onChange={e => setDemoUrl(e.target.value)} placeholder="Live Demo URL (optional)" style={inputStyle} />
              <textarea value={projectIdea} onChange={e => setProjectIdea(e.target.value)} placeholder="Project Description" rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
              <button onClick={handleProjectSubmit} disabled={submitting || hackathon.status !== 'active'} style={{ width: '100%', padding: '13px', borderRadius: '11px', fontWeight: 700, fontSize: '0.9rem', background: hackathon.status === 'active' ? `linear-gradient(135deg, ${S.primary}, ${S.secondary})` : S.surfaceHigh, color: hackathon.status === 'active' ? '#fff' : S.textSub, border: 'none', cursor: hackathon.status === 'active' ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                {submitting ? '⏳ Submitting...' : hackathon.status !== 'active' ? 'Submissions not open' : '📦 Submit Project'}
              </button>
            </div>
          )}

          {tab === 'leaderboard' && (
            <div>
              <h4 style={{ color: S.text, fontWeight: 700, margin: '0 0 16px' }}>Project Leaderboard</h4>
              {(hackathon.submissions || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: S.textSub }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏗️</div>
                  <p>No submissions yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[...hackathon.submissions].sort((a, b) => (b.finalScore || b.votes) - (a.finalScore || a.votes)).map((sub, i) => (
                    <div key={i} style={{ background: S.surfaceHigh, borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${i === 0 ? S.amber : i === 1 ? S.textSub : i === 2 ? '#cd7f32' : S.outline}` }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ color: i < 3 ? S.amber : S.textSub, fontWeight: 800, fontSize: '1.1rem' }}>#{i + 1}</span>
                        <div>
                          <div style={{ color: S.text, fontWeight: 700 }}>{sub.projectName}</div>
                          <div style={{ color: S.textSub, fontSize: '0.75rem' }}>by {sub.teamName}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button onClick={() => onVote(hackathon._id, sub._id)} style={{ background: S.primaryGlow, color: S.primary, border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'inherit' }}>
                          ▲ {sub.votes || 0}
                        </button>
                        {sub.finalScore > 0 && <span style={{ color: S.amber, fontWeight: 700, fontSize: '0.9rem' }}>{sub.finalScore}/10</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'announcements' && (
            <div>
              <h4 style={{ color: S.text, fontWeight: 700, margin: '0 0 16px' }}>Announcements</h4>
              {(hackathon.announcements || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: S.textSub }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📢</div>
                  <p>No announcements yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[...hackathon.announcements].reverse().map((a, i) => (
                    <div key={i} style={{ background: S.surfaceHigh, borderRadius: '12px', padding: '16px', borderLeft: `3px solid ${S.primary}` }}>
                      <div style={{ color: S.text, fontWeight: 700, marginBottom: '6px' }}>{a.title}</div>
                      <p style={{ color: S.textSub, fontSize: '0.85rem', lineHeight: 1.6, margin: '0 0 8px' }}>{a.content}</p>
                      <div style={{ color: S.outline, fontSize: '0.7rem' }}>{new Date(a.postedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Hackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [onlineFilter, setOnlineFilter] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [registeredIds, setRegisteredIds] = useState(new Set());
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchHackathons = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9, sort };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (onlineFilter) params.online = true;
      if (search) params.search = search;
      const res = await axios.get('/api/hackathons', { params });
      setHackathons(res.data.hackathons || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch {
      try {
        await axios.post('/api/hackathons/seed/bulk');
        const res = await axios.get('/api/hackathons', { params: { page: 1, limit: 9, sort: 'featured' } });
        setHackathons(res.data.hackathons || []);
        setTotal(res.data.total || 0);
      } catch { toast.error('Failed to load hackathons'); }
    } finally { setLoading(false); }
  }, [page, sort, statusFilter, onlineFilter, search]);

  useEffect(() => { fetchHackathons(); }, [fetchHackathons]);

  const handleRegister = async (hackathon) => {
    if (registeredIds.has(hackathon._id)) { toast.info('Already registered!'); return; }
    try {
      await axios.post(`/api/hackathons/${hackathon._id}/register`, { userId: user._id || 'guest' });
      setRegisteredIds(prev => new Set([...prev, hackathon._id]));
      setHackathons(prev => prev.map(h => h._id === hackathon._id ? { ...h, registeredCount: h.registeredCount + 1 } : h));
      toast.success(`🎉 Registered for "${hackathon.title}"!`);
    } catch (err) { toast.error(err.response?.data?.error || 'Registration failed'); }
  };

  const openDetail = async (hackathon) => {
    try {
      const res = await axios.get(`/api/hackathons/${hackathon._id}`);
      setSelectedHackathon(res.data);
    } catch { setSelectedHackathon(hackathon); }
  };

  const handleSubmit = async (hackathonId, data) => {
    try {
      await axios.post(`/api/hackathons/${hackathonId}/submit`, { ...data, teamId: user._id });
      toast.success('🚀 Project submitted!');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to submit'); }
  };

  const handleVote = async (hackathonId, subId) => {
    try {
      const res = await axios.post(`/api/hackathons/${hackathonId}/submissions/${subId}/vote`, { userId: user._id || 'guest' });
      toast.success(`Voted! Total: ${res.data.votes}`);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to vote'); }
  };

  const statuses = ['all', 'upcoming', 'active', 'judging', 'completed'];
  const totalPrize = hackathons.reduce((sum, h) => sum + (h.prizePool || 0), 0);
  const totalRegistered = hackathons.reduce((sum, h) => sum + (h.registeredCount || 0), 0);
  const activeCount = hackathons.filter(h => h.status === 'active').length;

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, paddingTop: '88px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        @keyframes shimmer { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }
      `}</style>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px 60px' }}>

        {/* HERO */}
        <div style={{ textAlign: 'center', padding: '40px 0 32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: S.primaryGlow, border: `1px solid rgba(244,114,182,0.3)`, borderRadius: '99px', padding: '6px 16px', marginBottom: '20px', fontSize: '0.8rem', fontWeight: 600, color: S.primary }}>
            {activeCount > 0 && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: S.green, boxShadow: `0 0 8px ${S.green}`, display: 'inline-block', animation: 'pulse 2s infinite' }} />}
            {activeCount > 0 ? `${activeCount} Live Hackathon${activeCount > 1 ? 's' : ''}` : '🏆 Global Hackathons'}
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '14px', background: `linear-gradient(135deg, ${S.text}, ${S.primary}, ${S.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Build. Compete.<br />Win Big.
          </h1>
          <p style={{ color: S.textSub, fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto 32px', lineHeight: 1.7 }}>
            Discover global hackathons, form teams, submit projects, and win life-changing prizes.
          </p>

          {/* Quick Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
            {[
              { value: `$${totalPrize.toLocaleString()}`, label: 'In Prizes' },
              { value: totalRegistered.toLocaleString(), label: 'Registered' },
              { value: total, label: 'Hackathons' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: S.primary }}>{s.value}</div>
                <div style={{ color: S.textSub, fontSize: '0.78rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FILTERS */}
        <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '16px', padding: '16px 20px', marginBottom: '28px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          {/* Status Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {statuses.map(s => {
              const m = s === 'all' ? { label: 'All', color: S.textSub, bg: S.surfaceHigh } : STATUS_META[s];
              return (
                <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} style={{
                  padding: '7px 14px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600, border: `1px solid ${statusFilter === s ? m.color : S.outline}`, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                  background: statusFilter === s ? m.bg : 'transparent', color: statusFilter === s ? m.color : S.textSub
                }}>
                  {m.icon || ''} {m.label}
                </button>
              );
            })}
          </div>

          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '160px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>🔍</span>
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search hackathons..."
              style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: '9px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.85rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
          </div>

          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} style={{ padding: '9px 12px', borderRadius: '9px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.85rem', fontFamily: 'inherit', cursor: 'pointer' }}>
            {[['featured', '⭐ Featured'], ['newest', '🆕 Newest'], ['prize', '💰 Prize Pool'], ['soonest', '⏰ Soonest']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: S.textSub, fontSize: '0.85rem', userSelect: 'none', marginLeft: 'auto' }}>
            <div onClick={() => { setOnlineFilter(!onlineFilter); setPage(1); }}
              style={{ width: '38px', height: '22px', borderRadius: '11px', background: onlineFilter ? S.green : S.outline, transition: 'background 0.2s', position: 'relative', cursor: 'pointer' }}>
              <div style={{ position: 'absolute', top: '3px', left: onlineFilter ? '18px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
            </div>
            Online Only
          </label>
        </div>

        {/* GRID */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '18px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: S.surface, borderRadius: '20px', border: `1px solid ${S.outline}`, height: '380px', backgroundImage: `linear-gradient(90deg, ${S.surface}, ${S.surfaceHigh}, ${S.surface})`, backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            ))}
          </div>
        ) : hackathons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: S.textSub }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🏆</div>
            <h3 style={{ color: S.text, fontWeight: 700, fontSize: '1.25rem', marginBottom: '8px' }}>No hackathons found</h3>
            <p>Try changing your filters</p>
          </div>
        ) : (
          <>
            <div style={{ color: S.textSub, fontSize: '0.85rem', marginBottom: '16px' }}>Showing {hackathons.length} of {total} hackathons</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '18px', marginBottom: '32px' }}>
              {hackathons.map(h => (
                <div key={h._id} onClick={() => openDetail(h)} style={{ cursor: 'pointer' }}>
                  <HackathonCard hackathon={h} onRegister={(e) => { e.stopPropagation?.(); handleRegister(h); }} registeredIds={registeredIds} userId={user._id} />
                </div>
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

      {selectedHackathon && (
        <HackathonDetail
          hackathon={selectedHackathon}
          onClose={() => setSelectedHackathon(null)}
          onSubmit={handleSubmit}
          onVote={handleVote}
          submittedTeamIds={new Set()}
        />
      )}
    </div>
  );
}
