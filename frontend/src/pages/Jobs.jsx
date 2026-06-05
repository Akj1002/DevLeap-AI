import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const S = {
  bg: '#0d0d12', surface: '#161620', surfaceHigh: '#1e1e2a', surfaceHighest: '#262633',
  surfaceLow: '#12121a', primary: '#818cf8', primaryGlow: 'rgba(129,140,248,0.15)',
  secondary: '#c084fc', green: '#34d399', amber: '#fbbf24', red: '#f87171',
  blue: '#60a5fa', text: '#e2e8f0', textSub: '#94a3b8', outline: '#334155', outlineVar: '#1e293b',
};

const TYPES = ['All Types', 'Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
const EXPERIENCES = ['All Levels', 'Entry', 'Mid', 'Senior', 'Lead', 'Principal'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'salary', label: 'Highest Salary' },
  { value: 'popular', label: 'Most Applied' },
];

const TAG_COLORS = {
  'faang': { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24' },
  'remote': { bg: 'rgba(52,211,153,0.12)', text: '#34d399' },
  'internship': { bg: 'rgba(129,140,248,0.12)', text: '#818cf8' },
  'ml': { bg: 'rgba(192,132,252,0.12)', text: '#c084fc' },
  'backend': { bg: 'rgba(96,165,250,0.12)', text: '#60a5fa' },
  'frontend': { bg: 'rgba(248,113,113,0.12)', text: '#f87171' },
};
const tagStyle = (tag) => TAG_COLORS[tag] || { bg: 'rgba(148,163,184,0.1)', text: S.textSub };

const expColor = (e) => {
  const map = { Entry: S.green, Mid: S.blue, Senior: S.amber, Lead: S.primary, Principal: S.secondary };
  return map[e] || S.textSub;
};

function StatCard({ icon, value, label, color }) {
  return (
    <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = color}
      onMouseLeave={e => e.currentTarget.style.borderColor = S.outline}>
      <div style={{ fontSize: '1.75rem' }}>{icon}</div>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.78rem', color: S.textSub, marginTop: '2px' }}>{label}</div>
      </div>
    </div>
  );
}

function JobCard({ job, onApply, onSave, savedIds, appliedIds, userId }) {
  const [hovered, setHovered] = useState(false);
  const isSaved = savedIds.has(job._id);
  const isApplied = appliedIds.has(job._id);
  const salary = job.salaryMin && job.salaryMax
    ? `$${(job.salaryMin / 1000).toFixed(0)}k–$${(job.salaryMax / 1000).toFixed(0)}k`
    : job.salaryMin ? `$${(job.salaryMin).toFixed(0)}/hr` : 'Undisclosed';

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', background: S.surface, borderRadius: '18px', padding: '24px',
        border: `1px solid ${hovered ? S.primary : S.outline}`,
        boxShadow: hovered ? `0 8px 32px rgba(129,140,248,0.12)` : '0 1px 4px rgba(0,0,0,0.3)',
        transition: 'all 0.25s', cursor: 'default',
        transform: hovered ? 'translateY(-3px)' : 'none',
      }}>
      {job.featured && (
        <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(251,191,36,0.15)', color: S.amber, fontSize: '0.625rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(251,191,36,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          ⭐ Featured
        </div>
      )}

      {/* Company + Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: S.surfaceHigh, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
          {job.company?.[0] || '🏢'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: S.textSub, fontSize: '0.78rem', fontWeight: 600, marginBottom: '2px' }}>{job.company}</div>
          <div style={{ color: S.text, fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.title}</div>
        </div>
      </div>

      {/* Badges Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
        <span style={{ background: S.primaryGlow, color: S.primary, fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: '6px' }}>{job.type}</span>
        <span style={{ background: `${expColor(job.experience)}18`, color: expColor(job.experience), fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: '6px' }}>{job.experience}</span>
        {job.remote && <span style={{ background: 'rgba(52,211,153,0.12)', color: S.green, fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: '6px' }}>🌐 Remote</span>}
      </div>

      {/* Location + Salary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ color: S.textSub, fontSize: '0.8rem' }}>📍 {job.location}</div>
        <div style={{ color: S.green, fontWeight: 700, fontSize: '0.9rem' }}>{salary}</div>
      </div>

      {/* Skills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
        {(job.skills || []).slice(0, 5).map(s => (
          <span key={s} style={{ background: S.surfaceHigh, color: S.textSub, fontSize: '0.68rem', fontWeight: 500, padding: '2px 8px', borderRadius: '5px', border: `1px solid ${S.outlineVar}` }}>{s}</span>
        ))}
        {(job.skills || []).length > 5 && <span style={{ color: S.textSub, fontSize: '0.68rem', padding: '2px 4px' }}>+{job.skills.length - 5}</span>}
      </div>

      {/* Tags */}
      {(job.tags || []).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '18px' }}>
          {(job.tags || []).slice(0, 3).map(t => {
            const ts = tagStyle(t);
            return <span key={t} style={{ background: ts.bg, color: ts.text, fontSize: '0.65rem', fontWeight: 600, padding: '2px 7px', borderRadius: '5px' }}>#{t}</span>;
          })}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
        <button
          onClick={() => onApply(job)}
          disabled={isApplied}
          style={{
            flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 700, fontSize: '0.82rem',
            border: 'none', cursor: isApplied ? 'default' : 'pointer', transition: 'all 0.2s',
            background: isApplied ? 'rgba(52,211,153,0.12)' : `linear-gradient(135deg, ${S.primary}, ${S.secondary})`,
            color: isApplied ? S.green : '#fff',
          }}
          onMouseEnter={e => { if (!isApplied) e.currentTarget.style.boxShadow = `0 4px 16px rgba(129,140,248,0.35)`; }}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
        >
          {isApplied ? '✓ Applied' : 'Quick Apply'}
        </button>
        <button
          onClick={() => onSave(job)}
          style={{
            padding: '10px 14px', borderRadius: '10px', fontWeight: 700, fontSize: '1rem',
            border: `1px solid ${isSaved ? S.amber : S.outline}`, cursor: 'pointer', transition: 'all 0.2s',
            background: isSaved ? 'rgba(251,191,36,0.1)' : S.surfaceHigh, color: isSaved ? S.amber : S.textSub,
          }}
        >
          {isSaved ? '🔖' : '🔖'}
        </button>
      </div>
      <div style={{ textAlign: 'right', marginTop: '8px', color: S.textSub, fontSize: '0.65rem' }}>
        {job.views || 0} views · {(job.applications || []).length} applicants
      </div>
    </div>
  );
}

function ApplyModal({ job, onClose, onSubmit }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(job, coverLetter);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(6px)' }}>
      <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '20px', padding: '32px', maxWidth: '560px', width: '100%', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: S.surfaceHigh, border: 'none', color: S.textSub, borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
        <h2 style={{ color: S.text, marginBottom: '4px', fontSize: '1.25rem', fontWeight: 700 }}>Apply to {job.company}</h2>
        <p style={{ color: S.textSub, fontSize: '0.875rem', marginBottom: '24px' }}>{job.title} · {job.location}</p>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: S.textSub, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>NAME</label>
          <div style={{ background: S.surfaceHigh, border: `1px solid ${S.outline}`, borderRadius: '10px', padding: '10px 14px', color: S.text, fontSize: '0.875rem' }}>{user.username || 'Your Name'}</div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: S.textSub, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>EMAIL</label>
          <div style={{ background: S.surfaceHigh, border: `1px solid ${S.outline}`, borderRadius: '10px', padding: '10px 14px', color: S.text, fontSize: '0.875rem' }}>{user.email || 'your@email.com'}</div>
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: S.textSub, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>COVER LETTER <span style={{ color: S.outline }}>(optional)</span></label>
          <textarea
            value={coverLetter}
            onChange={e => setCoverLetter(e.target.value)}
            placeholder="Tell them why you're a great fit..."
            rows={5}
            style={{ width: '100%', background: S.surfaceHigh, border: `1px solid ${S.outline}`, borderRadius: '10px', padding: '12px 14px', color: S.text, fontSize: '0.875rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{ width: '100%', padding: '13px', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: '#fff', border: 'none', cursor: submitting ? 'wait' : 'pointer', transition: 'opacity 0.2s', opacity: submitting ? 0.6 : 1 }}
        >
          {submitting ? 'Submitting...' : '🚀 Submit Application'}
        </button>
      </div>
    </div>
  );
}

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [expFilter, setExpFilter] = useState('All Levels');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sort, setSort] = useState('newest');
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [applyModal, setApplyModal] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [seeding, setSeeding] = useState(false);
  const debounceRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchJobs = useCallback(async (searchVal = search) => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (searchVal) params.search = searchVal;
      if (typeFilter !== 'All Types') params.type = typeFilter;
      if (expFilter !== 'All Levels') params.experience = expFilter;
      if (remoteOnly) params.remote = true;
      const res = await axios.get('/api/jobs', { params });
      setJobs(res.data.jobs || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      // If backend has no data yet, seed automatically
      if (err.response?.status !== 200) {
        await seedJobs();
      }
    } finally {
      setLoading(false);
    }
  }, [page, sort, typeFilter, expFilter, remoteOnly]);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/jobs/stats/overview');
      setStats(res.data);
    } catch {}
  };

  const seedJobs = async () => {
    setSeeding(true);
    try {
      await axios.post('/api/jobs/seed/bulk');
      await fetchJobs();
    } catch (err) {
      console.error('Seed error:', err);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => { fetchJobs(); fetchStats(); }, [fetchJobs]);

  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); fetchJobs(val); }, 500);
  };

  const handleApply = async (job, coverLetter) => {
    try {
      await axios.post(`/api/jobs/${job._id}/apply`, {
        userId: user._id, username: user.username, email: user.email, coverLetter
      });
      setAppliedIds(prev => new Set([...prev, job._id]));
      toast.success(`🎉 Applied to ${job.company}!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to apply');
      throw err;
    }
  };

  const handleSave = async (job) => {
    try {
      const res = await axios.post(`/api/jobs/${job._id}/save`, { userId: user._id || 'guest' });
      setSavedIds(prev => {
        const next = new Set(prev);
        if (res.data.saved) next.add(job._id); else next.delete(job._id);
        return next;
      });
      toast.success(res.data.saved ? '🔖 Job saved!' : 'Job removed from saved');
    } catch { toast.error('Failed to save job'); }
  };

  const tabs = [
    { id: 'all', label: 'All Jobs', count: total },
    { id: 'saved', label: 'Saved', count: savedIds.size },
    { id: 'applied', label: 'Applied', count: appliedIds.size },
  ];

  const displayedJobs = activeTab === 'saved'
    ? jobs.filter(j => savedIds.has(j._id))
    : activeTab === 'applied'
      ? jobs.filter(j => appliedIds.has(j._id))
      : jobs;

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, paddingTop: '88px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input:focus { outline: 2px solid ${S.primary}; outline-offset: 0; }
        select { appearance: none; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${S.bg}; } ::-webkit-scrollbar-thumb { background: ${S.outline}; border-radius: 3px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px 60px' }}>

        {/* HERO */}
        <div style={{ textAlign: 'center', padding: '40px 0 32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.3)', borderRadius: '99px', padding: '6px 16px', marginBottom: '20px', fontSize: '0.8rem', fontWeight: 600, color: S.primary }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: S.green, boxShadow: `0 0 8px ${S.green}`, animation: 'pulse 2s infinite', display: 'inline-block' }} />
            {total > 0 ? `${total} Live Positions` : 'Loading Jobs...'}
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '14px', background: `linear-gradient(135deg, ${S.text}, ${S.primary}, ${S.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Your Next Tech Career<br />Starts Here
          </h1>
          <p style={{ color: S.textSub, fontSize: '1.05rem', maxWidth: '560px', margin: '0 auto 32px', lineHeight: 1.7 }}>
            Curated opportunities at the world's top tech companies. Filter, apply, and track — all in one place.
          </p>

          {/* Search */}
          <div style={{ maxWidth: '680px', margin: '0 auto', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', pointerEvents: 'none' }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search jobs, companies, skills..."
              style={{ width: '100%', padding: '16px 18px 16px 50px', borderRadius: '14px', background: S.surface, border: `1px solid ${S.outline}`, color: S.text, fontSize: '1rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* STATS */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '32px' }}>
            <StatCard icon="💼" value={stats.totalJobs} label="Total Positions" color={S.primary} />
            <StatCard icon="🌐" value={stats.remoteJobs} label="Remote Friendly" color={S.green} />
            <StatCard icon="✨" value={stats.newThisWeek} label="New This Week" color={S.amber} />
            <StatCard icon="🏆" value={(stats.topSkills?.[0]?._id) || '—'} label="Most Wanted Skill" color={S.secondary} />
          </div>
        )}

        {/* FILTERS */}
        <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '16px', padding: '18px 22px', marginBottom: '28px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          {[
            { value: typeFilter, options: TYPES, onChange: v => { setTypeFilter(v); setPage(1); } },
            { value: expFilter, options: EXPERIENCES, onChange: v => { setExpFilter(v); setPage(1); } },
            { value: sort, options: SORT_OPTIONS.map(s => s.label), rawOptions: SORT_OPTIONS, onChange: v => { setSort(v); setPage(1); }, isSort: true }
          ].map((f, i) => (
            <select
              key={i}
              value={f.value}
              onChange={e => f.onChange(f.isSort ? e.target.value : e.target.value)}
              style={{ padding: '9px 14px', borderRadius: '10px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.85rem', fontFamily: 'inherit', cursor: 'pointer', minWidth: '140px' }}
            >
              {(f.rawOptions || f.options).map(o => (
                <option key={typeof o === 'object' ? o.value : o} value={typeof o === 'object' ? o.value : o}>
                  {typeof o === 'object' ? o.label : o}
                </option>
              ))}
            </select>
          ))}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: S.textSub, fontSize: '0.85rem', userSelect: 'none' }}>
            <div
              onClick={() => { setRemoteOnly(!remoteOnly); setPage(1); }}
              style={{ width: '38px', height: '22px', borderRadius: '11px', background: remoteOnly ? S.green : S.outline, transition: 'background 0.2s', position: 'relative', cursor: 'pointer' }}>
              <div style={{ position: 'absolute', top: '3px', left: remoteOnly ? '18px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
            </div>
            Remote Only
          </label>
          <button onClick={seedJobs} disabled={seeding} style={{ marginLeft: 'auto', padding: '9px 16px', borderRadius: '10px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.textSub, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            {seeding ? '⏳ Seeding...' : '🔄 Refresh'}
          </button>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '12px', padding: '4px', width: 'fit-content' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '8px 18px', borderRadius: '9px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              background: activeTab === tab.id ? S.primary : 'transparent',
              color: activeTab === tab.id ? '#fff' : S.textSub
            }}>
              {tab.label} {tab.count > 0 && <span style={{ background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : S.surfaceHigh, borderRadius: '99px', padding: '1px 7px', fontSize: '0.7rem', marginLeft: '4px' }}>{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* GRID */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: S.surface, borderRadius: '18px', padding: '24px', border: `1px solid ${S.outline}`, height: '280px' }}>
                {[80, 60, 100, 60, 80].map((w, j) => (
                  <div key={j} style={{ height: '14px', borderRadius: '7px', marginBottom: '12px', width: `${w}%`, background: `linear-gradient(90deg, ${S.surfaceHigh}, ${S.surfaceHighest}, ${S.surfaceHigh})`, backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                ))}
              </div>
            ))}
          </div>
        ) : displayedJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: S.textSub }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: S.text, marginBottom: '8px' }}>No jobs found</h3>
            <p style={{ marginBottom: '20px' }}>Try adjusting your filters or search terms</p>
            <button onClick={seedJobs} style={{ padding: '12px 24px', borderRadius: '12px', background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>
              Load Sample Jobs
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px', marginBottom: '32px' }}>
              {displayedJobs.map(job => (
                <JobCard
                  key={job._id} job={job}
                  onApply={j => setApplyModal(j)}
                  onSave={handleSave}
                  savedIds={savedIds} appliedIds={appliedIds}
                  userId={user._id}
                />
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} style={{
                    width: '36px', height: '36px', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    background: page === p ? S.primary : S.surfaceHigh,
                    color: page === p ? '#fff' : S.textSub
                  }}>{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* APPLY MODAL */}
      {applyModal && (
        <ApplyModal
          job={applyModal}
          onClose={() => setApplyModal(null)}
          onSubmit={handleApply}
        />
      )}
    </div>
  );
}
