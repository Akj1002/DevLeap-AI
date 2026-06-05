import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';

const S = {
  bg:              '#131319',
  surface:         '#1f1f26',
  surfaceHigh:     '#2a2930',
  surfaceHighest:  '#35343b',
  surfaceLow:      '#1b1b21',
  surfaceLowest:   '#0e0e14',
  primary:         '#adc6ff',
  primaryCont:     '#4d8eff',
  secondary:       '#d0bcff',
  secondaryCont:   '#571bc1',
  tertiary:        '#4ae176',
  error:           '#ffb4ab',
  text:            '#e4e1ea',
  textSub:         '#c2c6d6',
  outline:         '#8c909f',
  outlineVar:      '#424754',
  onPrimary:       '#002e6a',
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
  if (!dateStr) return 'N/A';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const seededRandom = (seed) => {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
};

const SKILLS = [
  { name: 'Arrays', level: 78, color: S.primary },
  { name: 'Trees', level: 65, color: S.tertiary },
  { name: 'Dynamic Programming', level: 45, color: '#f59e0b' },
  { name: 'Graphs', level: 58, color: S.secondary },
  { name: 'Binary Search', level: 82, color: '#06b6d4' },
  { name: 'Two Pointers', level: 70, color: S.error },
];

// ─── Heatmap Component ───────────────────────────────────────────────────────
const ActivityHeatmap = ({ totalSolved }) => {
  const WEEKS = 52;
  const DAYS = 7;
  const rng = useMemo(() => seededRandom(totalSolved || 100), [totalSolved]);

  const grid = useMemo(() => {
    const data = [];
    const weight = Math.min(totalSolved / 300, 1);
    for (let w = 0; w < WEEKS; w++) {
      const week = [];
      for (let d = 0; d < DAYS; d++) {
        const r = rng();
        let level = 0;
        if (r < 0.45 - weight * 0.15) level = 0;
        else if (r < 0.6) level = 1;
        else if (r < 0.75) level = 2;
        else if (r < 0.88) level = 3;
        else level = 4;
        week.push(level);
      }
      data.push(week);
    }
    return data;
  }, [totalSolved]);

  const colors = ['rgba(255,255,255,0.04)', 'rgba(34,197,94,0.25)', 'rgba(34,197,94,0.45)', 'rgba(34,197,94,0.65)', 'rgba(34,197,94,0.90)'];

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  const monthLabels = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    monthLabels.push({ label: MONTHS[d.getMonth()], week: Math.round(((11 - i) / 12) * WEEKS) });
  }

  const totalContributions = grid.flat().reduce((a, v) => a + v, 0);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ color: S.outline, fontSize: '13px' }}>
          <span style={{ color: S.text, fontWeight: 700 }}>{totalContributions}</span> submissions in the last year
        </div>
      </div>
      {/* Month labels */}
      <div style={{ display: 'flex', marginBottom: '4px', paddingLeft: '0px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '3px' }}>
          {Array.from({ length: WEEKS }, (_, w) => {
            const label = monthLabels.find(m => m.week === w);
            return (
              <div key={w} style={{ width: '12px', fontSize: '9px', color: label ? S.outlineVar : 'transparent', flexShrink: 0, userSelect: 'none' }}>
                {label?.label || '.'}
              </div>
            );
          })}
        </div>
      </div>
      {/* Grid */}
      <div style={{ display: 'flex', gap: '3px', overflowX: 'auto' }}>
        {grid.map((week, w) => (
          <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: '3px', flexShrink: 0 }}>
            {week.map((level, d) => (
              <div key={d} title={`Level ${level} activity`}
                style={{ width: '12px', height: '12px', borderRadius: '2px', background: colors[level], border: '1px solid rgba(255,255,255,0.04)', transition: 'transform 0.1s, opacity 0.1s', cursor: 'default', flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.3)'; e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', justifyContent: 'flex-end' }}>
        <span style={{ color: S.outlineVar, fontSize: '11px' }}>Less</span>
        {colors.map((c, i) => (
          <div key={i} style={{ width: '12px', height: '12px', borderRadius: '2px', background: c, border: '1px solid rgba(255,255,255,0.06)' }} />
        ))}
        <span style={{ color: S.outlineVar, fontSize: '11px' }}>More</span>
      </div>
    </div>
  );
};

// ─── Donut Chart Component ───────────────────────────────────────────────────
const DonutChart = ({ easy, medium, hard, total }) => {
  const maxProblems = { easy: 800, medium: 1600, hard: 600 };
  const easyPct = Math.round((easy / maxProblems.easy) * 100);
  const mediumPct = Math.round((medium / maxProblems.medium) * 100);
  const hardPct = Math.round((hard / maxProblems.hard) * 100);

  const size = 140;
  const strokeW = 14;
  const r = (size - strokeW) / 2;
  const circ = 2 * Math.PI * r;

  const easyDash = (easy / Math.max(1, easy + medium + hard)) * circ;
  const mediumDash = (medium / Math.max(1, easy + medium + hard)) * circ;
  const hardDash = (hard / Math.max(1, easy + medium + hard)) * circ;

  const gap = 4;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
      {/* SVG Donut */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeW} />
          {/* Easy (green) */}
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={S.tertiary} strokeWidth={strokeW}
            strokeDasharray={`${easyDash - gap > 0 ? easyDash - gap : 0} ${circ}`} strokeDashoffset={0} strokeLinecap="round" />
          {/* Medium (amber) */}
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f59e0b" strokeWidth={strokeW}
            strokeDasharray={`${mediumDash - gap > 0 ? mediumDash - gap : 0} ${circ}`} strokeDashoffset={-(easyDash)} strokeLinecap="round" />
          {/* Hard (red) */}
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={S.error} strokeWidth={strokeW}
            strokeDasharray={`${hardDash - gap > 0 ? hardDash - gap : 0} ${circ}`} strokeDashoffset={-(easyDash + mediumDash)} strokeLinecap="round" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: S.text, fontWeight: 800, fontSize: '26px', lineHeight: 1 }}>{total}</span>
          <span style={{ color: S.outlineVar, fontSize: '10px', fontWeight: 500 }}>Solved</span>
        </div>
      </div>

      {/* Bars */}
      <div style={{ flex: 1, minWidth: '140px' }}>
        {[
          { label: 'Easy', value: easy, total: maxProblems.easy, pct: easyPct, color: S.tertiary, bg: 'rgba(34,197,94,0.12)' },
          { label: 'Medium', value: medium, total: maxProblems.medium, pct: mediumPct, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
          { label: 'Hard', value: hard, total: maxProblems.hard, pct: hardPct, color: S.error, bg: 'rgba(239,68,68,0.12)' },
        ].map(item => (
          <div key={item.label} style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ background: item.bg, color: item.color, padding: '1px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>{item.label}</span>
              </div>
              <span style={{ color: S.outline, fontSize: '12px', fontWeight: 600 }}>
                <span style={{ color: item.color }}>{item.value}</span>
                <span style={{ color: S.outlineVar }}>/{item.total}</span>
              </span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${item.pct}%`, background: item.color, borderRadius: '3px', transition: 'width 1s ease', boxShadow: `0 0 8px ${item.color}60` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Skill Bar Component ──────────────────────────────────────────────────────
const SkillBar = ({ skill, delay }) => {
  const [animated, setAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div ref={ref} style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ color: S.outline, fontSize: '13px', fontWeight: 500 }}>{skill.name}</span>
        <span style={{ color: skill.color, fontSize: '13px', fontWeight: 700 }}>{skill.level}%</span>
      </div>
      <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: animated ? `${skill.level}%` : '0%', background: `linear-gradient(90deg, ${skill.color}99, ${skill.color})`, borderRadius: '4px', transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: `0 0 12px ${skill.color}50` }} />
      </div>
    </div>
  );
};

// ─── Stat Card Component ─────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? 'rgba(255,255,255,0.06)' : S.surface, border: `1px solid ${hovered ? color + '40' : S.outlineVar}`, borderRadius: '14px', padding: '20px', transition: 'all 0.25s ease', transform: hovered ? 'translateY(-3px)' : 'translateY(0)', boxShadow: hovered ? `0 8px 30px ${color}20` : '0 2px 8px rgba(0,0,0,0.2)', cursor: 'default' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: `linear-gradient(135deg, ${color}20, ${color}40)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{icon}</div>
        <div style={{ background: `${color}18`, color: color, fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '10px', letterSpacing: '0.5px' }}>LIVE</div>
      </div>
      <div style={{ color: S.text, fontWeight: 800, fontSize: '26px', lineHeight: 1.1, marginBottom: '4px' }}>{value}</div>
      <div style={{ color: S.outline, fontSize: '13px', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ color: S.outlineVar, fontSize: '11px', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
};

// ─── Main Profile Component ──────────────────────────────────────────────────
export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [fetchError, setFetchError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const userId = localStorage.getItem('devleap_user_id') || 'me';

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/users/${userId}/progress`);
        if (res.data) setUserData(res.data);
      } catch {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const stats = useMemo(() => {
    if (!userData) return { easy: 0, medium: 0, hard: 0, recentSubmissions: [], acceptanceRate: 0, interviewReports: [] };
    
    let easy = 0, medium = 0, hard = 0;
    const recentSubmissions = [];
    
    (userData.history || []).forEach(h => {
      const diff = h.questionId?.difficulty || 'Easy';
      if (diff === 'Easy') easy++;
      else if (diff === 'Medium') medium++;
      else if (diff === 'Hard') hard++;
      
      recentSubmissions.push({
        id: h._id || Math.random().toString(),
        problem: h.questionId?.title || 'Unknown Problem',
        difficulty: diff,
        status: 'Accepted',
        runtime: h.timeSpent ? h.timeSpent + 'ms' : 'N/A',
        memory: 'N/A',
        language: h.language || 'Python',
        time: h.solvedAt
      });
    });
    
    recentSubmissions.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    const acceptanceRate = userData.totalAttempts > 0 
      ? Math.round((userData.totalSolved / userData.totalAttempts) * 100) 
      : (userData.totalSolved > 0 ? 100 : 0);
      
    const interviewReports = (userData.interviewReports || []).map(r => ({
      ...r,
      status: r.score >= 70 ? 'Passed' : 'Failed',
      role: r.role || 'Software Engineer'
    }));

    return {
      easy, medium, hard,
      recentSubmissions: recentSubmissions.slice(0, 10),
      acceptanceRate,
      interviewReports
    };
  }, [userData]);

  const rankBadge = (userData?.totalSolved || 0) >= 100
    ? { label: 'Elite Coder', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', icon: '👑' }
    : { label: 'Rising Star', color: S.primary, bg: 'rgba(59,130,246,0.15)', icon: '⭐' };

  const badgesList = useMemo(() => {
    const defaultBadges = [
      { id: 'b1', name: '50 Solved', icon: '🎯', description: 'Solved 50 problems', color: S.tertiary, earned: (userData?.totalSolved || 0) >= 50 },
      { id: 'b2', name: 'First Hard', icon: '🔥', description: 'Solved first hard problem', color: S.error, earned: userData?.history?.some(h => h.questionId?.difficulty === 'Hard') || false },
      { id: 'b3', name: '7-Day Streak', icon: '⚡', description: 'Maintained 7-day streak', color: '#f59e0b', earned: (userData?.streakDays || 0) >= 7 },
      { id: 'b4', name: 'Speed Coder', icon: '🚀', description: 'Solved problem in top 10% time', color: S.primary, earned: (userData?.totalSolved || 0) > 0 },
      { id: 'b5', name: 'Community Star', icon: '⭐', description: 'Contributed 50+ forum posts', color: S.secondary, earned: false },
      { id: 'b6', name: 'Top 10%', icon: '👑', description: 'Ranked in global top 10%', color: '#06b6d4', earned: false },
    ];

    if (userData?.badges?.includes('Premium Pro')) {
      defaultBadges.push({
        id: 'b7',
        name: 'Premium Pro',
        icon: '💎',
        description: 'Premium subscription active',
        color: S.secondary,
        earned: true
      });
    } else {
      defaultBadges.push({
        id: 'b7',
        name: 'Premium Pro',
        icon: '💎',
        description: 'Premium subscription active',
        color: S.secondary,
        earned: false
      });
    }

    return defaultBadges;
  }, [userData]);

  const cardStyle = { background: S.surface, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' };
  const sectionTitle = { color: S.text, fontWeight: 800, fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' };

  const difficultyColor = { Easy: S.tertiary, Medium: '#f59e0b', Hard: S.error };
  const statusColor = { Accepted: S.tertiary, 'Wrong Answer': S.error, 'Time Limit Exceeded': '#f59e0b', 'Runtime Error': S.error };

  return (
    <div style={{ minHeight: '100vh', background: S.bg, paddingTop: '70px', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 70px)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(59,130,246,0.2)', borderTopColor: S.primary, margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
            <div style={{ color: S.outline, fontSize: '14px' }}>Loading profile...</div>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : fetchError || !userData ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 70px)' }}>
          <div style={{ color: S.outline, fontSize: '16px' }}>Failed to load profile. Please try again.</div>
        </div>
      ) : (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 40px', animation: 'fadeSlideUp 0.5s ease' }}>

          {/* ── HERO SECTION ── */}
          <div style={{ position: 'relative', marginBottom: '70px' }}>
            {/* Cover Banner */}
            <div style={{ height: '200px', borderRadius: '20px', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 30%, #8b5cf6 70%, #4c1d95 100%)', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 60px rgba(59,130,246,0.3)' }}>
              {/* Decorative patterns */}
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: S.surfaceHigh, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-50px', right: '120px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '20px', left: '40%', width: '100px', height: '100px', borderRadius: '50%', background: S.surface, pointerEvents: 'none' }} />
              {/* Grid lines */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ position: 'absolute', top: 0, left: `${i * 14}%`, width: '1px', height: '100%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
              ))}
            </div>

            {/* Avatar */}
            <div style={{ position: 'absolute', bottom: '-55px', left: '40px', display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
              <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', fontWeight: 900, color: '#fff', border: '4px solid #0a0a0f', boxShadow: '0 8px 30px rgba(59,130,246,0.4)', flexShrink: 0, overflow: 'hidden' }}>
                {userData?.profilePicture && !userData.profilePicture.includes('api.dicebear.com/7.x/avataaars') ? (
                  <img src={userData.profilePicture} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  userData?.username?.[0]?.toUpperCase() || 'U'
                )}
              </div>
            </div>

            {/* Edit Button */}
            <div style={{ position: 'absolute', bottom: '-55px', right: '0' }}>
              <button onClick={() => setEditMode(!editMode)}
                style={{ padding: '10px 20px', background: editMode ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : S.outlineVar, border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: S.text, fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
                onMouseEnter={e => { if (!editMode) { e.currentTarget.style.background = S.outline; } }}
                onMouseLeave={e => { if (!editMode) { e.currentTarget.style.background = S.outlineVar; } }}>
                ✏️ {editMode ? 'Save Profile' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* ── USER INFO ── */}
          <div style={{ marginBottom: '32px', paddingLeft: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <h2 style={{ color: S.text, fontWeight: 900, fontSize: '26px', margin: 0 }}>{userData?.username || 'User'}</h2>
              <span style={{ background: rankBadge.bg, color: rankBadge.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, border: `1px solid ${rankBadge.color}40`, display: 'flex', alignItems: 'center', gap: '4px' }}>
                {rankBadge.icon} {rankBadge.label}
              </span>
            </div>
            <div style={{ color: S.primary, fontSize: '15px', fontWeight: 600, marginBottom: '10px' }}>{userData?.handle || '@user'}</div>
            <div style={{ color: S.outline, fontSize: '14px', marginBottom: '14px', maxWidth: '500px' }}>{userData?.bio || 'No bio provided'}</div>
            {/* Social Links */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {userData?.github && (
                <a href={`https://github.com/${userData.github}`} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 14px', color: S.outline, fontSize: '12px', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = S.outline; e.currentTarget.style.color = S.text; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = S.outline; }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.14 3 .4 2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>
                  GitHub
                </a>
              )}
              {userData?.linkedin && (
                <a href={`https://linkedin.com/in/${userData.linkedin}`} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(10,102,194,0.12)', border: '1px solid rgba(10,102,194,0.3)', borderRadius: '8px', padding: '6px 14px', color: '#60a5fa', fontSize: '12px', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(10,102,194,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(10,102,194,0.12)'; }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
              )}
              {userData?.twitter && (
                <a href={`https://twitter.com/${userData.twitter}`} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(29,161,242,0.08)', border: '1px solid rgba(29,161,242,0.25)', borderRadius: '8px', padding: '6px 14px', color: '#38bdf8', fontSize: '12px', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(29,161,242,0.16)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(29,161,242,0.08)'; }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.243 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  Twitter
                </a>
              )}
            </div>
          </div>

          {/* ── STATS ROW ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
            <StatCard icon="✅" label="Problems Solved" value={userData?.totalSolved || 0} sub={`/ 3000 total`} color={S.tertiary} />
            <StatCard icon="🏆" label="Global Ranking" value={`#${(userData?.leaderboardScore || 0).toLocaleString()}`} sub="Top 5%" color="#f59e0b" />
            <StatCard icon="🔥" label="Current Streak" value={`${userData?.streakDays || 0} days`} sub={`Best: ${userData?.longestStreak || userData?.streakDays || 0} days`} color={S.error} />
            <StatCard icon="📊" label="Acceptance Rate" value={`${stats?.acceptanceRate || 0}%`} sub="Above average" color={S.primary} />
          </div>

          {/* ── TABS ── */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: S.surface, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '4px', width: 'fit-content' }}>
            {['overview', 'submissions', 'reports', 'badges'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: '8px 20px', background: activeTab === tab ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent', border: 'none', borderRadius: '8px', color: activeTab === tab ? '#fff' : S.outline, fontSize: '13px', fontWeight: activeTab === tab ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize' }}>
                {tab === 'overview' ? '📊' : tab === 'submissions' ? '📝' : tab === 'reports' ? '🤖' : '🏅'} {tab}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* LEFT COLUMN */}
              <div>
                {/* Heatmap */}
                <div style={{ ...cardStyle }}>
                  <div style={sectionTitle}><span>📅</span> Activity Heatmap</div>
                  <ActivityHeatmap totalSolved={userData?.totalSolved || 0} />
                </div>

                {/* Solving Stats */}
                <div style={{ ...cardStyle }}>
                  <div style={sectionTitle}><span>📈</span> Solving Statistics</div>
                  <DonutChart
                    easy={stats?.easy || 0}
                    medium={stats?.medium || 0}
                    hard={stats?.hard || 0}
                    total={userData?.totalSolved || 0}
                  />
                </div>

                {/* Skills */}
                <div style={{ ...cardStyle }}>
                  <div style={sectionTitle}><span>🧠</span> Skill Proficiency</div>
                  {SKILLS.map((skill, i) => <SkillBar key={skill.name} skill={skill} delay={i * 100} />)}
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div>
                {/* Recent Submissions */}
                <div style={{ ...cardStyle }}>
                  <div style={sectionTitle}><span>📝</span> Recent Submissions</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          {['Problem', 'Difficulty', 'Status', 'Runtime', 'Time'].map(h => (
                            <th key={h} style={{ color: S.outlineVar, fontSize: '11px', fontWeight: 700, textAlign: 'left', padding: '8px 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {stats?.recentSubmissions.map((sub, i) => (
                          <tr key={sub.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = S.surface}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '12px 10px', color: S.text, fontSize: '13px', fontWeight: 500, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.problem}</td>
                            <td style={{ padding: '12px 10px' }}>
                              <span style={{ background: `${difficultyColor[sub.difficulty] || S.outlineVar}18`, color: difficultyColor[sub.difficulty] || S.outlineVar, padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>{sub.difficulty}</span>
                            </td>
                            <td style={{ padding: '12px 10px' }}>
                              <span style={{ color: statusColor[sub.status] || S.outlineVar, fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {sub.status === 'Accepted' ? '✓' : '✗'} {sub.status}
                              </span>
                            </td>
                            <td style={{ padding: '12px 10px', color: S.outline, fontSize: '12px' }}>{sub.runtime}</td>
                            <td style={{ padding: '12px 10px', color: S.outlineVar, fontSize: '12px' }}>{timeAgo(sub.time)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AI Interview Reports */}
                <div style={{ ...cardStyle }}>
                  <div style={sectionTitle}><span>🤖</span> AI Interview Reports</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {stats?.interviewReports.map(report => {
                      const scoreColor = report.score >= 85 ? S.tertiary : report.score >= 70 ? '#f59e0b' : S.error;
                      return (
                        <div key={report.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = S.outline; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div>
                              <div style={{ color: S.text, fontWeight: 700, fontSize: '14px' }}>{report.company}</div>
                              <div style={{ color: S.outlineVar, fontSize: '12px' }}>{report.role} • {timeAgo(report.date)}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ color: scoreColor, fontWeight: 800, fontSize: '22px', lineHeight: 1 }}>{report.score}</div>
                              <div style={{ color: S.outlineVar, fontSize: '10px' }}>/100</div>
                            </div>
                          </div>
                          <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginBottom: '10px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${report.score}%`, background: `linear-gradient(90deg, ${scoreColor}80, ${scoreColor})`, borderRadius: '2px' }} />
                          </div>
                          <p style={{ color: S.outline, fontSize: '12px', lineHeight: 1.6, margin: 0 }}>{report.feedback}</p>
                          <div style={{ marginTop: '8px' }}>
                            <span style={{ background: report.status === 'Passed' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: report.status === 'Passed' ? S.tertiary : S.error, padding: '2px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
                              {report.status === 'Passed' ? '✓' : '✗'} {report.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Badges */}
                <div style={{ ...cardStyle }}>
                  <div style={sectionTitle}><span>🏅</span> Achievements</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {badgesList.map(badge => (
                      <div key={badge.id}
                        style={{ background: badge.earned ? `${badge.color}10` : 'rgba(255,255,255,0.02)', border: `1px solid ${badge.earned ? badge.color + '30' : 'rgba(255,255,255,0.06)'}`, borderRadius: '12px', padding: '14px 10px', textAlign: 'center', filter: badge.earned ? 'none' : 'grayscale(1)', opacity: badge.earned ? 1 : 0.5, transition: 'all 0.25s', cursor: badge.earned ? 'default' : 'not-allowed' }}
                        onMouseEnter={e => { if (badge.earned) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${badge.color}25`; } }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                        <div style={{ fontSize: '28px', marginBottom: '6px' }}>{badge.earned ? badge.icon : '🔒'}</div>
                        <div style={{ color: badge.earned ? badge.color : S.outlineVar, fontSize: '11px', fontWeight: 700, lineHeight: 1.3 }}>{badge.name}</div>
                        <div style={{ color: S.outlineVar, fontSize: '10px', marginTop: '4px' }}>{badge.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SUBMISSIONS TAB ── */}
          {activeTab === 'submissions' && (
            <div style={{ ...cardStyle }}>
              <div style={sectionTitle}><span>📝</span> All Submissions</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {['All', 'Accepted', 'Wrong Answer', 'Hard', 'Medium', 'Easy'].map(filter => (
                  <button key={filter} style={{ padding: '6px 14px', background: filter === 'All' ? 'rgba(59,130,246,0.2)' : S.surfaceHigh, border: `1px solid ${filter === 'All' ? 'rgba(59,130,246,0.4)' : S.outlineVar}`, borderRadius: '20px', color: filter === 'All' ? S.primary : S.outline, fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                    {filter}
                  </button>
                ))}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['#', 'Problem', 'Difficulty', 'Status', 'Language', 'Runtime', 'Memory', 'Time'].map(h => (
                      <th key={h} style={{ color: S.outlineVar, fontSize: '11px', fontWeight: 700, textAlign: 'left', padding: '10px 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentSubmissions.map((sub, i) => (
                    <tr key={sub.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = S.surface}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 12px', color: S.outlineVar, fontSize: '13px' }}>{i + 1}</td>
                      <td style={{ padding: '14px 12px', color: S.text, fontSize: '13px', fontWeight: 600 }}>{sub.problem}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ background: `${difficultyColor[sub.difficulty]}18`, color: difficultyColor[sub.difficulty], padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>{sub.difficulty}</span>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ color: statusColor[sub.status] || S.outline, fontSize: '12px', fontWeight: 600 }}>
                          {sub.status === 'Accepted' ? '✓ ' : '✗ '}{sub.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ background: 'rgba(255,255,255,0.06)', color: S.outline, padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>{sub.language}</span>
                      </td>
                      <td style={{ padding: '14px 12px', color: S.outline, fontSize: '12px' }}>{sub.runtime}</td>
                      <td style={{ padding: '14px 12px', color: S.outline, fontSize: '12px' }}>{sub.memory}</td>
                      <td style={{ padding: '14px 12px', color: S.outlineVar, fontSize: '12px' }}>{timeAgo(sub.time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── REPORTS TAB ── */}
          {activeTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '12px', padding: '16px 24px', display: 'flex', gap: '32px', flex: 1 }}>
                  {[{ label: 'Total Sessions', val: stats?.interviewReports.length }, { label: 'Avg Score', val: Math.round(stats?.interviewReports.reduce((a, r) => a + r.score, 0) / Math.max(stats?.interviewReports.length, 1)) + '/100' }, { label: 'Pass Rate', val: Math.round((stats?.interviewReports.filter(r => r.status === 'Passed').length / Math.max(stats?.interviewReports.length, 1)) * 100) + '%' }].map(item => (
                    <div key={item.label}>
                      <div style={{ color: S.primary, fontWeight: 800, fontSize: '24px' }}>{item.val}</div>
                      <div style={{ color: S.outlineVar, fontSize: '12px' }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {stats?.interviewReports.map(report => {
                const scoreColor = report.score >= 85 ? S.tertiary : report.score >= 70 ? '#f59e0b' : S.error;
                return (
                  <div key={report.id} style={{ ...cardStyle, marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div>
                        <div style={{ color: S.text, fontWeight: 800, fontSize: '18px', marginBottom: '4px' }}>{report.company} — {report.role}</div>
                        <div style={{ color: S.outlineVar, fontSize: '13px' }}>{timeAgo(report.date)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: scoreColor, fontWeight: 900, fontSize: '36px', lineHeight: 1 }}>{report.score}</div>
                        <div style={{ color: S.outlineVar, fontSize: '12px' }}>/ 100</div>
                      </div>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', marginBottom: '16px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${report.score}%`, background: `linear-gradient(90deg, ${scoreColor}70, ${scoreColor})`, borderRadius: '4px', boxShadow: `0 0 12px ${scoreColor}60` }} />
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
                      <div style={{ color: S.outlineVar, fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '8px' }}>AI Feedback</div>
                      <p style={{ color: S.outline, fontSize: '14px', lineHeight: 1.7, margin: 0 }}>{report.feedback}</p>
                    </div>
                    <span style={{ background: report.status === 'Passed' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: report.status === 'Passed' ? S.tertiary : S.error, padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                      {report.status === 'Passed' ? '✓' : '✗'} {report.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── BADGES TAB ── */}
          {activeTab === 'badges' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {badgesList.map(badge => (
                  <div key={badge.id}
                    style={{ background: badge.earned ? `${badge.color}08` : 'rgba(255,255,255,0.02)', border: `1px solid ${badge.earned ? badge.color + '30' : 'rgba(255,255,255,0.07)'}`, borderRadius: '16px', padding: '28px 20px', textAlign: 'center', filter: badge.earned ? 'none' : 'grayscale(0.8)', opacity: badge.earned ? 1 : 0.5, transition: 'all 0.25s', cursor: badge.earned ? 'default' : 'not-allowed' }}
                    onMouseEnter={e => { if (badge.earned) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${badge.color}30`; } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>{badge.earned ? badge.icon : '🔒'}</div>
                    <div style={{ color: badge.earned ? badge.color : S.outlineVar, fontSize: '14px', fontWeight: 800, marginBottom: '8px' }}>{badge.name}</div>
                    <div style={{ color: S.outlineVar, fontSize: '12px', lineHeight: 1.5 }}>{badge.description}</div>
                    {badge.earned && (
                      <div style={{ marginTop: '12px', background: `${badge.color}15`, padding: '4px 12px', borderRadius: '20px', fontSize: '11px', color: badge.color, fontWeight: 700, display: 'inline-block' }}>Earned ✓</div>
                    )}
                    {!badge.earned && (
                      <div style={{ marginTop: '12px', background: S.surfaceHigh, padding: '4px 12px', borderRadius: '20px', fontSize: '11px', color: S.outlineVar, fontWeight: 600, display: 'inline-block' }}>Locked</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}