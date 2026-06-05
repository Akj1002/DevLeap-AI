import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const getDateString = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
};

const recentActivity = [
  { id: 1, icon: '✅', name: 'Two Sum', difficulty: 'Easy', time: '2h ago', solved: true },
  { id: 2, icon: '❌', name: 'Merge K Sorted Lists', difficulty: 'Hard', time: '4h ago', solved: false },
  { id: 3, icon: '✅', name: 'Valid Parentheses', difficulty: 'Easy', time: '6h ago', solved: true },
  { id: 4, icon: '✅', name: 'Maximum Subarray', difficulty: 'Medium', time: 'Yesterday', solved: true },
  { id: 5, icon: '❌', name: 'Word Search II', difficulty: 'Hard', time: 'Yesterday', solved: false },
  { id: 6, icon: '✅', name: 'Binary Tree Level Order', difficulty: 'Medium', time: '2d ago', solved: true },
  { id: 7, icon: '✅', name: 'Climbing Stairs', difficulty: 'Easy', time: '2d ago', solved: true },
  { id: 8, icon: '✅', name: 'Product of Array Except Self', difficulty: 'Medium', time: '3d ago', solved: true },
];

const recommendedProblems = [
  { id: 1, title: 'Longest Substring Without Repeating', difficulty: 'Medium', tag: 'Often asked at Google' },
  { id: 2, title: 'Container With Most Water', difficulty: 'Medium', tag: 'Often asked at Meta' },
  { id: 3, title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', tag: 'Often asked at Amazon' },
];

const communityHighlights = [
  { id: 1, title: 'How I cracked Google L5 with 3 months of prep', upvotes: 1240, comments: 87 },
  { id: 2, title: 'Best resources for System Design in 2025', upvotes: 892, comments: 54 },
  { id: 3, title: 'Sliding Window template that works for 90% of problems', upvotes: 654, comments: 41 },
];

const difficultyColor = (d) => {
  if (d === 'Easy') return S.tertiary;
  if (d === 'Medium') return '#f59e0b';
  return S.error;
};

const chartData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Problems Solved',
      data: [3, 5, 2, 7, 4, 6, 1],
      backgroundColor: 'rgba(59,130,246,0.7)',
      borderRadius: 6,
      borderSkipped: false,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(15,23,42,0.95)',
      titleColor: S.text,
      bodyColor: S.outline,
      borderColor: S.outlineVar,
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      grid: { color: S.surfaceHigh },
      ticks: { color: S.outline, font: { family: 'Inter' } },
    },
    y: {
      grid: { color: S.surfaceHigh },
      ticks: { color: S.outline, font: { family: 'Inter' } },
    },
  },
};


export default function PersonalDashboard() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [hoveredRec, setHoveredRec] = useState(null);

  const userName = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u.firstName || u.name?.split(' ')[0] || 'Developer';
    } catch { return 'Developer'; }
  })();

  const streak = 7;
  const weeklyDone = 12;
  const weeklyTotal = 20;
  const weeklyPct = Math.round((weeklyDone / weeklyTotal) * 100);
  const todayDone = 1;
  const todayTotal = 3;
  const todayPct = Math.round((todayDone / todayTotal) * 100);

  return (
    <div style={{
      minHeight: '100vh',
      background: S.bg,
      paddingTop: 90,
      paddingBottom: 60,
      fontFamily: 'Inter, sans-serif',
      color: S.text,
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>

        {/* HEADER */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, background: 'linear-gradient(135deg,#f1f5f9,#94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {getGreeting()}, {userName} 👋
                </h1>
              </div>
              <p style={{ color: S.outline, margin: '6px 0 0', fontSize: 15 }}>{getDateString()}</p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: S.surfaceHigh, border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, padding: '10px 18px',
            }}>
              <span style={{ fontSize: 22 }}>🔥</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{streak} Day Streak</div>
                <div style={{ color: S.outline, fontSize: 12 }}>Keep it going!</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            {[
              { label: '+ Log Problem', icon: '📝', path: '/tracker' },
              { label: 'Start Interview', icon: '🎯', path: '/interview' },
              { label: 'Join Contest', icon: '🏆', path: '/contests' },
              { label: 'View Roadmap', icon: '🗺️', path: '/roadmaps' },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={() => navigate(btn.path)}
                onMouseEnter={() => setHoveredBtn(i)}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: hoveredBtn === i ? 'rgba(59,130,246,0.15)' : 'transparent',
                  border: `1px solid ${hoveredBtn === i ? 'rgba(59,130,246,0.5)' : S.outline}`,
                  color: hoveredBtn === i ? S.primary : S.outline,
                  borderRadius: 10, padding: '8px 16px',
                  cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  transition: 'all 0.2s',
                }}
              >
                <span>{btn.icon}</span>{btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* STATS CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          {/* Today's Goal */}
          <div
            onMouseEnter={() => setHoveredCard('goal')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: S.surface,
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '20px',
              transition: 'all 0.25s',
              transform: hoveredCard === 'goal' ? 'translateY(-4px)' : 'translateY(0)',
              boxShadow: hoveredCard === 'goal' ? '0 12px 32px rgba(0,0,0,0.4)' : 'none',
            }}
          >
            <div style={{ color: S.outline, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Today's Goal</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, color: todayDone >= todayTotal ? S.tertiary : S.text }}>{todayDone} / {todayTotal} solved</div>
            <div style={{ height: 6, background: S.outlineVar, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${todayPct}%`, background: todayDone >= todayTotal ? S.tertiary : S.primary, borderRadius: 3, transition: 'width 0.5s' }} />
            </div>
            <div style={{ color: S.outlineVar, fontSize: 12, marginTop: 6 }}>{todayPct}% complete</div>
          </div>

          {/* Weekly Progress */}
          <div
            onMouseEnter={() => setHoveredCard('weekly')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: S.surface,
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '20px',
              transition: 'all 0.25s',
              transform: hoveredCard === 'weekly' ? 'translateY(-4px)' : 'translateY(0)',
              boxShadow: hoveredCard === 'weekly' ? '0 12px 32px rgba(0,0,0,0.4)' : 'none',
              display: 'flex', alignItems: 'center', gap: 16,
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
              background: `conic-gradient(#3b82f6 ${weeklyPct * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <div style={{
                width: 46, height: 46, borderRadius: '50%',
                background: S.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: S.primary,
              }}>{weeklyPct}%</div>
            </div>
            <div>
              <div style={{ color: S.outline, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Weekly Progress</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{weeklyDone} / {weeklyTotal}</div>
              <div style={{ color: S.outlineVar, fontSize: 12 }}>problems this week</div>
            </div>
          </div>

          {/* Global Rank */}
          <div
            onMouseEnter={() => setHoveredCard('rank')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: S.surface,
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '20px',
              transition: 'all 0.25s',
              transform: hoveredCard === 'rank' ? 'translateY(-4px)' : 'translateY(0)',
              boxShadow: hoveredCard === 'rank' ? '0 12px 32px rgba(0,0,0,0.4)' : 'none',
            }}
          >
            <div style={{ color: S.outline, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Global Rank</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 26, fontWeight: 800 }}>#12,450</div>
              <span style={{ color: S.tertiary, fontSize: 13, fontWeight: 700 }}>▲ 234</span>
            </div>
            <div style={{ color: S.outlineVar, fontSize: 12, marginTop: 4 }}>Top 15% worldwide</div>
          </div>

          {/* Current Streak */}
          <div
            onMouseEnter={() => setHoveredCard('streak')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: S.surface,
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '20px',
              transition: 'all 0.25s',
              transform: hoveredCard === 'streak' ? 'translateY(-4px)' : 'translateY(0)',
              boxShadow: hoveredCard === 'streak' ? '0 12px 32px rgba(0,0,0,0.4)' : 'none',
            }}
          >
            <div style={{ color: S.outline, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Current Streak</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 26 }}>🔥</span>
              <div style={{ fontSize: 26, fontWeight: 800 }}>{streak} days</div>
            </div>
            <div style={{ color: S.outlineVar, fontSize: 12, marginTop: 4 }}>Personal Best: <span style={{ color: '#f59e0b' }}>14 days</span></div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Daily Challenge */}
            <div style={{
              background: S.surface,
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '24px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)',
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{
                  background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                  color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 1,
                  padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase',
                }}>Daily Challenge</span>
                <span style={{ color: S.outlineVar, fontSize: 12 }}>🕐 Resets in 10h 24m</span>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: S.text }}>Two Sum</h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <span style={{ background: 'rgba(34,197,94,0.15)', color: S.tertiary, padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Easy</span>
                {['Array', 'Hash Table'].map(t => (
                  <span key={t} style={{ background: 'rgba(255,255,255,0.06)', color: S.outline, padding: '2px 10px', borderRadius: 20, fontSize: 12 }}>{t}</span>
                ))}
                <span style={{ background: 'rgba(59,130,246,0.12)', color: S.primary, padding: '2px 10px', borderRadius: 20, fontSize: 12 }}>Google</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <span style={{ color: S.outline, fontSize: 13 }}>⏱ Est. 15 min</span>
                <span style={{ color: S.outline, fontSize: 13 }}>📊 Acceptance: 49.5%</span>
              </div>
              <button
                onClick={() => navigate('/workspace/1')}
                style={{
                  width: '100%', padding: '12px', borderRadius: 10,
                  background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                  border: 'none', color: '#fff', fontWeight: 700, fontSize: 15,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.target.style.opacity = '0.85'}
                onMouseLeave={e => e.target.style.opacity = '1'}
              >Solve Now →</button>
            </div>

            {/* 7-Day Activity Chart */}
            <div style={{
              background: S.surface,
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>7-Day Activity</h3>
                <span style={{ color: S.outline, fontSize: 13 }}>28 problems this week</span>
              </div>
              <div style={{ height: 180 }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Study Plan */}
            <div style={{
              background: S.surface,
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <div style={{ color: S.outline, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Active Plan</div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>30-Day DSA Challenge</h3>
                </div>
                <span style={{ background: 'rgba(59,130,246,0.12)', color: S.primary, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Day 12/30</span>
              </div>
              <div style={{ height: 6, background: S.outlineVar, borderRadius: 3, overflow: 'hidden', margin: '12px 0' }}>
                <div style={{ height: '100%', width: '40%', background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)', borderRadius: 3 }} />
              </div>
              <div style={{ color: S.outline, fontSize: 13, marginBottom: 12 }}>Today's topics:</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {['Two Pointers', 'Sliding Window'].map(t => (
                  <span key={t} style={{ background: 'rgba(139,92,246,0.15)', color: S.secondary, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{t}</span>
                ))}
              </div>
              <button
                onClick={() => navigate('/study-plans')}
                style={{
                  width: '100%', padding: '10px', borderRadius: 10,
                  background: 'transparent',
                  border: '1px solid rgba(139,92,246,0.4)',
                  color: S.secondary, fontWeight: 600, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.target.style.background = 'rgba(139,92,246,0.1)'; }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; }}
              >Continue Plan →</button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Recent Activity */}
            <div style={{
              background: S.surface,
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Recent Activity</h3>
                <button onClick={() => navigate('/tracker')} style={{ background: 'none', border: 'none', color: S.primary, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>View All →</button>
              </div>
              <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentActivity.map(item => (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', borderRadius: 10,
                    background: S.surface,
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: S.text }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: S.outlineVar, marginTop: 2 }}>{item.time}</div>
                      </div>
                    </div>
                    <span style={{ color: difficultyColor(item.difficulty), fontSize: 11, fontWeight: 600, background: `${difficultyColor(item.difficulty)}18`, padding: '2px 8px', borderRadius: 12 }}>{item.difficulty}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Problems */}
            <div style={{
              background: S.surface,
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '24px',
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Recommended for You</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recommendedProblems.map((p, i) => (
                  <div
                    key={p.id}
                    onMouseEnter={() => setHoveredRec(i)}
                    onMouseLeave={() => setHoveredRec(null)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px', borderRadius: 10,
                      background: hoveredRec === i ? 'rgba(59,130,246,0.07)' : S.surface,
                      border: `1px solid ${hoveredRec === i ? 'rgba(59,130,246,0.2)' : S.surfaceHigh}`,
                      transition: 'all 0.2s', cursor: 'pointer',
                    }}
                    onClick={() => navigate('/workspace/1')}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: S.text, marginBottom: 4 }}>{p.title}</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span style={{ color: difficultyColor(p.difficulty), fontSize: 11, fontWeight: 600 }}>{p.difficulty}</span>
                        <span style={{ color: S.outlineVar, fontSize: 11 }}>• {p.tag}</span>
                      </div>
                    </div>
                    <button style={{
                      background: 'rgba(59,130,246,0.15)', border: 'none',
                      color: S.primary, fontSize: 12, fontWeight: 600,
                      padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                    }}>Solve</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Highlights */}
            <div style={{
              background: S.surface,
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Community Highlights</h3>
                <button style={{ background: 'none', border: 'none', color: S.primary, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Discuss →</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {communityHighlights.map((post, i) => (
                  <div key={post.id} style={{
                    padding: '12px 14px', borderRadius: 10,
                    background: S.surface,
                    border: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: S.text, marginBottom: 8, lineHeight: 1.4 }}>{post.title}</div>
                    <div style={{ display: 'flex', gap: 14 }}>
                      <span style={{ color: S.outline, fontSize: 12 }}>▲ {post.upvotes.toLocaleString()}</span>
                      <span style={{ color: S.outline, fontSize: 12 }}>💬 {post.comments}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
