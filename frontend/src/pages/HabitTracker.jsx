import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const S = {
  bg: '#08080d', surface: '#0f0f17', surfaceHigh: '#16161f', surfaceHighest: '#1d1d27',
  primary: '#fbbf24', primaryGlow: 'rgba(251,191,36,0.12)',
  secondary: '#f472b6', green: '#4ade80', blue: '#60a5fa', red: '#f87171', purple: '#a78bfa',
  text: '#f1f5f9', textSub: '#94a3b8', outline: '#24242e',
};

const XP_PER_LEVEL = (level) => Math.round(100 * Math.pow(1.5, level - 1));

const MOODS = [{ id: 'fire', emoji: '🔥', label: 'On Fire!' }, { id: 'great', emoji: '😊', label: 'Great' }, { id: 'ok', emoji: '😐', label: 'Okay' }, { id: 'tired', emoji: '😴', label: 'Tired' }];

function XPBar({ xp, xpToNextLevel, level }) {
  const percent = Math.min(100, (xp / xpToNextLevel) * 100);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.72rem', color: S.textSub }}>
        <span>Level {level}</span>
        <span>{xp.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP</span>
      </div>
      <div style={{ height: '8px', background: S.outline, borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percent}%`, borderRadius: '4px', background: `linear-gradient(to right, ${S.primary}, ${S.secondary})`, transition: 'width 0.5s ease', boxShadow: `0 0 12px rgba(251,191,36,0.4)` }} />
      </div>
    </div>
  );
}

function CircularTimer({ seconds, total, color }) {
  const r = 32, c = 2 * Math.PI * r;
  const progress = (seconds / total) * c;
  return (
    <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="40" cy="40" r={r} fill="none" stroke={S.outline} strokeWidth="6" />
      <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6" strokeDasharray={`${progress} ${c}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.5s' }} />
      <text x="40" y="40" textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="14" fontWeight="bold" style={{ transform: 'rotate(90deg)', transformOrigin: '40px 40px' }}>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</text>
    </svg>
  );
}

function FocusTimer({ onComplete }) {
  const [duration, setDuration] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [topic, setTopic] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | focus | break
  const intervalRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const start = () => { setTimeLeft(duration); setRunning(true); setPhase('focus'); };
  const pause = () => setRunning(r => !r);
  const reset = () => { clearInterval(intervalRef.current); setRunning(false); setPhase('idle'); setTimeLeft(duration); };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setPhase('done');
            toast.success('🎯 Focus session complete! Great job!');
            if (user._id) {
              axios.post(`/api/habits/${user._id}/focus`, { duration: Math.floor(duration / 60), topic, completed: true }).catch(() => {});
            }
            onComplete && onComplete(Math.floor(duration / 60));
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else { clearInterval(intervalRef.current); }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const mins = [15, 25, 45, 60];

  return (
    <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '18px', padding: '24px' }}>
      <h3 style={{ color: S.text, fontWeight: 700, fontSize: '1rem', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>🎯 Pomodoro Timer</h3>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <CircularTimer seconds={timeLeft} total={duration} color={phase === 'done' ? S.green : S.primary} />
      </div>

      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '14px' }}>
        {mins.map(m => (
          <button key={m} onClick={() => { if (!running) { setDuration(m * 60); setTimeLeft(m * 60); } }} style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: `1px solid ${duration === m * 60 ? S.primary : S.outline}`, cursor: 'pointer', background: duration === m * 60 ? S.primaryGlow : 'transparent', color: duration === m * 60 ? S.primary : S.textSub, fontFamily: 'inherit' }}>{m}m</button>
        ))}
      </div>

      <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="What are you working on?" disabled={running}
        style={{ width: '100%', padding: '9px 12px', borderRadius: '9px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.82rem', fontFamily: 'inherit', marginBottom: '14px', boxSizing: 'border-box', outline: 'none' }} />

      <div style={{ display: 'flex', gap: '8px' }}>
        {phase === 'idle' || phase === 'done' ? (
          <button onClick={start} style={{ flex: 1, padding: '11px', borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem', background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>▶ Start Focus</button>
        ) : (
          <>
            <button onClick={pause} style={{ flex: 1, padding: '11px', borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, cursor: 'pointer', fontFamily: 'inherit' }}>{running ? '⏸ Pause' : '▶ Resume'}</button>
            <button onClick={reset} style={{ padding: '11px 14px', borderRadius: '10px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.textSub, cursor: 'pointer' }}>↺</button>
          </>
        )}
      </div>
    </div>
  );
}

function CheckInCard({ habit, onCheckIn }) {
  const [mood, setMood] = useState('great');
  const [submitting, setSubmitting] = useState(false);
  const today = new Date().toDateString();
  const lastCI = habit?.lastCheckIn ? new Date(habit.lastCheckIn).toDateString() : null;
  const alreadyDone = lastCI === today;

  const handleCheckIn = async () => {
    setSubmitting(true);
    try {
      const res = await onCheckIn(mood);
      toast.success(`🔥 +${res.xpEarned} XP! Day ${res.streakDays} streak!`);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Check-in failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '18px', padding: '24px' }}>
      <h3 style={{ color: S.text, fontWeight: 700, fontSize: '1rem', margin: '0 0 16px' }}>📅 Daily Check-In</h3>
      {alreadyDone ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>✅</div>
          <p style={{ color: S.green, fontWeight: 700, margin: 0 }}>Checked in today!</p>
          <p style={{ color: S.textSub, fontSize: '0.8rem', margin: '4px 0 0' }}>Come back tomorrow to maintain your streak</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, marginBottom: '10px' }}>HOW ARE YOU FEELING?</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {MOODS.map(m => (
                <button key={m.id} onClick={() => setMood(m.id)} style={{ flex: 1, padding: '10px 8px', borderRadius: '10px', border: `1px solid ${mood === m.id ? S.primary : S.outline}`, cursor: 'pointer', background: mood === m.id ? S.primaryGlow : S.surfaceHigh, fontFamily: 'inherit', fontSize: '0.75rem', color: mood === m.id ? S.primary : S.textSub, transition: 'all 0.2s' }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>{m.emoji}</div>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleCheckIn} disabled={submitting} style={{ width: '100%', padding: '12px', borderRadius: '11px', fontWeight: 700, fontSize: '0.875rem', background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: '#fff', border: 'none', cursor: submitting ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
            {submitting ? '⏳...' : '🔥 Check In Now!'}
          </button>
        </>
      )}
    </div>
  );
}

export default function HabitTracker() {
  const [habit, setHabit] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('dashboard');
  const [newGoal, setNewGoal] = useState({ title: '', description: '', target: 10, category: 'Coding' });
  const [addingGoal, setAddingGoal] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user._id || 'demo-user-123';

  const fetchHabit = useCallback(async () => {
    try {
      const res = await axios.get(`/api/habits/${userId}?username=${user.username || 'Developer'}`);
      setHabit(res.data);
    } catch { setLoading(false); } finally { setLoading(false); }
  }, [userId]);

  const fetchLeaderboard = async () => {
    try { const res = await axios.get('/api/habits/leaderboard/global'); setLeaderboard(res.data || []); } catch {}
  };

  const fetchCalendar = async () => {
    try { const res = await axios.get(`/api/habits/${userId}/calendar`); setCalendar(res.data?.checkIns || []); } catch {}
  };

  useEffect(() => { fetchHabit(); fetchLeaderboard(); fetchCalendar(); }, [fetchHabit]);

  const handleCheckIn = async (mood) => {
    const res = await axios.post(`/api/habits/${userId}/checkin`, { mood });
    fetchHabit();
    return res.data;
  };

  const handleCompleteQuest = async (questId) => {
    try {
      const res = await axios.post(`/api/habits/${userId}/quests/${questId}/complete`);
      toast.success(`⚔️ Quest complete! +${res.data.xpEarned} XP, +${res.data.coinsEarned} coins!`);
      fetchHabit();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed to complete quest'); }
  };

  const handleAddGoal = async () => {
    try {
      await axios.post(`/api/habits/${userId}/goals`, { ...newGoal, progress: 0 });
      toast.success('Goal added!');
      fetchHabit();
      setAddingGoal(false);
      setNewGoal({ title: '', description: '', target: 10, category: 'Coding' });
    } catch { toast.error('Failed to add goal'); }
  };

  // Generate calendar grid for last 12 weeks
  const calSet = new Set(calendar);
  const today = new Date();
  const calGrid = [];
  for (let d = 83; d >= 0; d--) {
    const date = new Date(today); date.setDate(date.getDate() - d);
    calGrid.push({ date, key: date.toISOString().split('T')[0], checked: calSet.has(date.toISOString().split('T')[0]) });
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: S.primary, fontSize: '1.2rem', fontWeight: 700 }}>Loading your journey...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, paddingTop: '88px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); *{box-sizing:border-box;} @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);}}`}</style>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px 60px' }}>
        {/* HERO */}
        <div style={{ padding: '32px 0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, margin: '0 0 8px', background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ⚔️ Coding Quest
            </h1>
            <p style={{ color: S.textSub, fontSize: '1rem', margin: 0 }}>Level up your coding habits with XP, streaks, and daily quests</p>
          </div>
          {habit && (
            <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '14px', padding: '16px 22px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: S.primary, fontWeight: 800, fontSize: '1.5rem', animation: 'float 3s ease-in-out infinite' }}>{habit.streakDays}</div>
                <div style={{ color: S.textSub, fontSize: '0.65rem', fontWeight: 600 }}>🔥 STREAK</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: S.green, fontWeight: 800, fontSize: '1.5rem' }}>{habit.level}</div>
                <div style={{ color: S.textSub, fontSize: '0.65rem', fontWeight: 600 }}>⚡ LEVEL</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: S.secondary, fontWeight: 800, fontSize: '1.5rem' }}>{habit.coins}</div>
                <div style={{ color: S.textSub, fontSize: '0.65rem', fontWeight: 600 }}>🪙 COINS</div>
              </div>
            </div>
          )}
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '24px', background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '12px', padding: '4px', width: 'fit-content' }}>
          {['dashboard', 'quests', 'goals', 'calendar', 'leaderboard'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '9px 18px', borderRadius: '9px', fontWeight: 600, fontSize: '0.82rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: tab === t ? `linear-gradient(135deg, ${S.primary}, ${S.secondary})` : 'transparent', color: tab === t ? '#fff' : S.textSub, transition: 'all 0.2s', textTransform: 'capitalize' }}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'dashboard' && habit && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            {/* Left col */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Profile card */}
              <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '18px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>⚡</div>
                  <div>
                    <div style={{ color: S.text, fontWeight: 700, fontSize: '1.1rem' }}>{habit.username}</div>
                    <div style={{ color: S.primary, fontSize: '0.78rem', fontWeight: 600 }}>{habit.title}</div>
                  </div>
                </div>
                <XPBar xp={habit.xp} xpToNextLevel={habit.xpToNextLevel} level={habit.level} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '16px' }}>
                  {[{ v: habit.totalCheckIns, l: 'Check-ins' }, { v: habit.longestStreak, l: 'Best Streak' }, { v: habit.badges?.length || 0, l: 'Badges' }].map(s => (
                    <div key={s.l} style={{ background: S.surfaceHigh, borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                      <div style={{ color: S.primary, fontWeight: 800, fontSize: '1.1rem' }}>{s.v}</div>
                      <div style={{ color: S.textSub, fontSize: '0.62rem' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <CheckInCard habit={habit} onCheckIn={handleCheckIn} />
            </div>

            {/* Right col */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <FocusTimer onComplete={fetchHabit} />

              {/* Badges */}
              <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '18px', padding: '20px' }}>
                <h3 style={{ color: S.text, fontWeight: 700, fontSize: '1rem', margin: '0 0 14px' }}>🏅 Badges</h3>
                {(habit.badges || []).length === 0 ? (
                  <p style={{ color: S.textSub, fontSize: '0.82rem', margin: 0 }}>Complete your first check-in to earn badges!</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(habit.badges || []).map((b, i) => (
                      <div key={i} title={b.description} style={{ background: S.surfaceHigh, border: `1px solid ${S.outline}`, borderRadius: '10px', padding: '8px 12px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.1rem' }}>{b.icon}</span>
                        <span style={{ color: S.text, fontSize: '0.72rem', fontWeight: 600 }}>{b.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'quests' && habit && (
          <div>
            <h2 style={{ color: S.text, fontWeight: 700, fontSize: '1.3rem', margin: '0 0 20px' }}>⚔️ Active Quests</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
              {(habit.quests || []).map(q => (
                <div key={q.id} style={{ background: S.surface, border: `1px solid ${q.completed ? S.green : S.outline}`, borderRadius: '14px', padding: '18px', opacity: q.completed ? 0.7 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <div style={{ color: S.text, fontWeight: 700, fontSize: '0.95rem' }}>{q.title}</div>
                      <div style={{ color: S.textSub, fontSize: '0.78rem', marginTop: '3px' }}>{q.description}</div>
                    </div>
                    <div style={{ background: q.type === 'daily' ? S.primaryGlow : 'rgba(129,140,248,0.12)', color: q.type === 'daily' ? S.primary : S.purple, fontSize: '0.6rem', fontWeight: 700, padding: '3px 8px', borderRadius: '5px', height: 'fit-content', textTransform: 'uppercase' }}>{q.type}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ color: S.primary, fontSize: '0.78rem', fontWeight: 600 }}>+{q.xpReward} XP</span>
                    <span style={{ color: S.amber, fontSize: '0.78rem', fontWeight: 600 }}>+{q.coinReward} 🪙</span>
                  </div>
                  {q.completed ? (
                    <div style={{ color: S.green, fontWeight: 700, fontSize: '0.85rem' }}>✅ Completed!</div>
                  ) : (
                    <button onClick={() => handleCompleteQuest(q.id)} style={{ width: '100%', padding: '10px', borderRadius: '9px', fontWeight: 700, fontSize: '0.82rem', background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                      Complete Quest
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'goals' && habit && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: S.text, fontWeight: 700, fontSize: '1.3rem', margin: 0 }}>🎯 My Goals</h2>
              <button onClick={() => setAddingGoal(!addingGoal)} style={{ padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem', background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>+ Add Goal</button>
            </div>

            {addingGoal && (
              <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[{ p: 'Goal title', k: 'title' }, { p: 'Description', k: 'description' }].map(f => (
                    <input key={f.k} value={newGoal[f.k]} onChange={e => setNewGoal(g => ({ ...g, [f.k]: e.target.value }))} placeholder={f.p}
                      style={{ padding: '10px 12px', borderRadius: '9px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none' }} />
                  ))}
                  <input type="number" value={newGoal.target} onChange={e => setNewGoal(g => ({ ...g, target: parseInt(e.target.value) }))} placeholder="Target (e.g. 30 problems)"
                    style={{ padding: '10px 12px', borderRadius: '9px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none' }} />
                  <button onClick={handleAddGoal} style={{ padding: '10px', borderRadius: '9px', fontWeight: 700, background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Save Goal</button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {(habit.goals || []).length === 0 ? (
                <p style={{ color: S.textSub }}>No goals yet. Add your first goal!</p>
              ) : (habit.goals || []).map((g, i) => {
                const pct = Math.min(100, ((g.progress || 0) / g.target) * 100);
                return (
                  <div key={i} style={{ background: S.surface, border: `1px solid ${g.completed ? S.green : S.outline}`, borderRadius: '14px', padding: '18px' }}>
                    <div style={{ color: S.text, fontWeight: 700, marginBottom: '5px' }}>{g.title}</div>
                    <div style={{ color: S.textSub, fontSize: '0.78rem', marginBottom: '12px' }}>{g.description}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: S.textSub, marginBottom: '6px' }}>
                      <span>{g.progress || 0} / {g.target}</span>
                      <span style={{ color: g.completed ? S.green : S.primary }}>{g.completed ? '✅ Done!' : `${Math.round(pct)}%`}</span>
                    </div>
                    <div style={{ height: '6px', background: S.outline, borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: g.completed ? S.green : `linear-gradient(to right, ${S.primary}, ${S.secondary})`, borderRadius: '3px', transition: 'width 0.4s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'calendar' && (
          <div>
            <h2 style={{ color: S.text, fontWeight: 700, fontSize: '1.3rem', margin: '0 0 20px' }}>📅 Check-in Calendar</h2>
            <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '18px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} style={{ color: S.textSub, fontSize: '0.68rem', textAlign: 'center', flex: 1 }}>{d}</div>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '4px' }}>
                {calGrid.map(day => (
                  <div key={day.key} title={day.key} style={{ aspectRatio: '1', borderRadius: '4px', background: day.checked ? S.green : S.surfaceHigh, opacity: day.checked ? 1 : 0.4, cursor: 'default', transition: 'opacity 0.2s' }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', alignItems: 'center' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: S.surfaceHigh, opacity: 0.4 }} />
                <span style={{ color: S.textSub, fontSize: '0.72rem' }}>No check-in</span>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: S.green }} />
                <span style={{ color: S.textSub, fontSize: '0.72rem' }}>Checked in</span>
                <span style={{ color: S.textSub, fontSize: '0.72rem', marginLeft: 'auto' }}>{calendar.length} / 84 days</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'leaderboard' && (
          <div>
            <h2 style={{ color: S.text, fontWeight: 700, fontSize: '1.3rem', margin: '0 0 20px' }}>🏆 Global Leaderboard</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {leaderboard.length === 0 ? (
                <p style={{ color: S.textSub }}>No data yet. Check in to appear on the leaderboard!</p>
              ) : leaderboard.map((u, i) => (
                <div key={u._id} style={{ background: S.surface, border: `1px solid ${i < 3 ? [S.primary, S.textSub, '#cd7f32'][i] : S.outline}`, borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: i < 3 ? `rgba(${['251,191,36', '148,163,184', '205,127,50'][i]},0.2)` : S.surfaceHigh, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: i < 3 ? [S.primary, S.textSub, '#cd7f32'][i] : S.textSub, fontSize: '0.875rem' }}>#{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: S.text, fontWeight: 700 }}>{u.username}</div>
                    <div style={{ color: S.textSub, fontSize: '0.75rem' }}>{u.title} · {u.streakDays}🔥 streak · {u.totalCheckIns} check-ins</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: S.primary, fontWeight: 800, fontSize: '0.95rem' }}>Lv.{u.level}</div>
                    <div style={{ color: S.textSub, fontSize: '0.7rem' }}>{u.xp} XP</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
