import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const S = {
  bg: '#09090e', surface: '#111118', surfaceHigh: '#18181f', surfaceHighest: '#1f1f28',
  primary: '#f97316', primaryGlow: 'rgba(249,115,22,0.1)',
  secondary: '#22d3ee', green: '#4ade80', amber: '#fbbf24', red: '#f87171', purple: '#a78bfa',
  text: '#f1f5f9', textSub: '#94a3b8', outline: '#25252f',
};

const LANGS = [{ id: 'javascript', label: 'JS', icon: '📜' }, { id: 'python', label: 'PY', icon: '🐍' }, { id: 'java', label: 'Java', icon: '☕' }, { id: 'cpp', label: 'C++', icon: '⚙️' }];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

// Minimal syntax-highlighting textarea with line numbers
function CodeEditor({ value, onChange, language, readOnly = false }) {
  const lineCount = (value || '').split('\n').length;
  return (
    <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${S.outline}`, background: '#0d0d0d', fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace" }}>
      <div style={{ display: 'flex' }}>
        <div style={{ background: '#0a0a0a', padding: '14px 10px 14px 0', minWidth: '40px', textAlign: 'right', color: '#4a4a5a', fontSize: '0.78rem', lineHeight: '22px', userSelect: 'none', borderRight: `1px solid ${S.outline}` }}>
          {Array.from({ length: lineCount }, (_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <textarea value={value || ''} onChange={e => !readOnly && onChange(e.target.value)} readOnly={readOnly}
          style={{ flex: 1, padding: '14px', background: 'transparent', color: '#e2e8f0', fontSize: '0.82rem', lineHeight: '22px', border: 'none', resize: 'vertical', minHeight: '240px', outline: 'none', fontFamily: 'inherit', tabSize: 2 }}
          spellCheck={false} autoCorrect="off" autoCapitalize="off" />
      </div>
    </div>
  );
}

function RoomCard({ room, onJoin }) {
  const [hovered, setHovered] = useState(false);
  const isFull = room.participants?.length >= room.maxParticipants;
  const diffColor = { Easy: S.green, Medium: S.amber, Hard: S.red }[room.difficulty] || S.textSub;

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      background: S.surface, borderRadius: '14px', border: `1px solid ${hovered ? S.primary : S.outline}`,
      padding: '18px', transition: 'all 0.2s', boxShadow: hovered ? `0 8px 28px rgba(249,115,22,0.1)` : 'none'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <h4 style={{ color: S.text, fontWeight: 700, fontSize: '0.9rem', margin: 0, flex: 1, paddingRight: '10px' }}>{room.title}</h4>
        <span style={{ background: `${diffColor}15`, color: diffColor, fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: '5px', whiteSpace: 'nowrap' }}>{room.difficulty}</span>
      </div>
      <p style={{ color: S.textSub, fontSize: '0.75rem', lineHeight: 1.4, margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{room.problem}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(room.participants || []).slice(0, 4).map((p, i) => (
            <div key={i} style={{ width: '24px', height: '24px', borderRadius: '50%', background: `hsl(${(i * 60 + 240) % 360}, 70%, 60%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#fff', border: '2px solid rgba(0,0,0,0.3)' }}>
              {(p.username || '?').charAt(0).toUpperCase()}
            </div>
          ))}
          <span style={{ color: S.textSub, fontSize: '0.72rem', alignSelf: 'center' }}>{room.participants?.length || 0}/{room.maxParticipants}</span>
        </div>
        <button onClick={() => onJoin(room)} disabled={isFull} style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: isFull ? 'not-allowed' : 'pointer', fontFamily: 'inherit', background: isFull ? S.surfaceHigh : `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: isFull ? S.textSub : '#fff', opacity: isFull ? 0.6 : 1 }}>
          {isFull ? 'Full' : 'Join →'}
        </button>
      </div>
    </div>
  );
}

function RaceArena({ room: initialRoom, language, username, userId, onLeave }) {
  const [room, setRoom] = useState(initialRoom);
  const [code, setCode] = useState((initialRoom?.starterCode && typeof initialRoom.starterCode === 'object' ? initialRoom.starterCode[language] : '') || `// Start coding here\n`);
  const [status, setStatus] = useState('waiting');
  const [timeLeft, setTimeLeft] = useState(0);
  const [rank, setRank] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [aiHint, setAiHint] = useState('');
  const pollRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`/api/race/room/${room.roomCode}/state`);
        setRoom(res.data);
        if (res.data.status === 'active' && status === 'waiting') { setStatus('coding'); setTimeLeft(res.data.timeLimit || 60); }
        if (res.data.status === 'finished') { setStatus('finished'); clearInterval(pollRef.current); clearInterval(timerRef.current); }
      } catch {}
    }, 2000);
    return () => clearInterval(pollRef.current);
  }, [room.roomCode]);

  useEffect(() => {
    if (status === 'coding' && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); setStatus('timeout'); return 0; } return t - 1; }), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  const handleStart = async () => {
    try { await axios.post(`/api/race/room/${room.roomCode}/start`); setStatus('coding'); setTimeLeft(room.timeLimit || 60); toast.success('🏁 Race started!'); } catch { toast.error('Start failed'); }
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(`/api/race/room/${room.roomCode}/submit`, { userId, username, code, language });
      setRank(res.data.rank);
      setStatus(res.data.rank === 1 ? 'won' : 'submitted');
      toast.success(res.data.rank === 1 ? '🏆 First place! You won!' : `✅ Submitted! Rank #${res.data.rank}`);
      clearInterval(timerRef.current);
    } catch { toast.error('Submit failed'); }
  };

  const getAiHint = async () => {
    setGenerating(true);
    try {
      const res = await axios.post('/api/ai/chat', { message: `Give me a hint (no full solution) for this problem: "${room.problem}". My current code: ${code.substring(0, 200)}. Be concise (2-3 sentences max).` });
      setAiHint(res.data.response || res.data.message || '');
    } catch { setAiHint('AI hint unavailable right now.'); } finally { setGenerating(false); }
  };

  const timeColor = timeLeft < 60 ? S.red : timeLeft < 180 ? S.amber : S.green;
  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ background: S.bg, height: '100%', display: 'flex', flexDirection: 'column', gap: '0' }}>
      {/* Top bar */}
      <div style={{ background: S.surface, borderBottom: `1px solid ${S.outline}`, padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: S.text, fontWeight: 700 }}>{room.title}</div>
          <div style={{ color: S.textSub, fontSize: '0.75rem' }}>Room: {room.roomCode}</div>
        </div>
        {status === 'coding' && (
          <div style={{ color: timeColor, fontWeight: 800, fontSize: '1.4rem', fontVariantNumeric: 'tabular-nums' }}>{formatTime(timeLeft)}</div>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          {status === 'waiting' && <button onClick={handleStart} style={{ padding: '9px 20px', borderRadius: '9px', fontWeight: 700, background: `linear-gradient(135deg, ${S.green}, ${S.secondary})`, color: '#000', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>🏁 Start Race</button>}
          {status === 'coding' && <button onClick={handleSubmit} style={{ padding: '9px 20px', borderRadius: '9px', fontWeight: 700, background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>⚡ Submit</button>}
          <button onClick={onLeave} style={{ padding: '9px 14px', borderRadius: '9px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.textSub, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Leave</button>
        </div>
      </div>

      {/* Main area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '0', flex: 1, overflow: 'auto' }}>
        {/* Problem panel */}
        <div style={{ padding: '20px', borderRight: `1px solid ${S.outline}`, overflowY: 'auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <span style={{ background: `${({ Easy: S.green, Medium: S.amber, Hard: S.red }[room.difficulty])}15`, color: { Easy: S.green, Medium: S.amber, Hard: S.red }[room.difficulty], fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: '5px' }}>{room.difficulty}</span>
            </div>
            <h3 style={{ color: S.text, fontWeight: 700, margin: '0 0 10px' }}>{room.title}</h3>
            <p style={{ color: S.textSub, lineHeight: 1.7, fontSize: '0.875rem' }}>{room.problem}</p>
          </div>

          {(room.testCases || []).filter(t => !t.hidden).length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ color: S.text, fontWeight: 600, fontSize: '0.82rem', marginBottom: '8px' }}>Test Cases:</div>
              {(room.testCases || []).filter(t => !t.hidden).map((tc, i) => (
                <div key={i} style={{ background: S.surfaceHigh, borderRadius: '8px', padding: '10px 12px', marginBottom: '6px', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  <div style={{ color: S.textSub }}>Input: <span style={{ color: S.green }}>{tc.input}</span></div>
                  <div style={{ color: S.textSub }}>Output: <span style={{ color: S.primary }}>{tc.expectedOutput}</span></div>
                </div>
              ))}
            </div>
          )}

          {/* Participants */}
          <div>
            <div style={{ color: S.text, fontWeight: 600, fontSize: '0.82rem', marginBottom: '8px' }}>Racers ({room.participants?.length}):</div>
            {(room.participants || []).map((p, i) => {
              const statusColor = { solved: S.green, coding: S.amber, waiting: S.textSub, failed: S.red }[p.status] || S.textSub;
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: '7px', marginBottom: '5px', background: S.surfaceHigh }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: `hsl(${i * 80 + 200}, 70%, 60%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>{(p.username || '?').charAt(0)}</div>
                    <span style={{ color: S.text, fontSize: '0.8rem', fontWeight: p.username === username ? 700 : 400 }}>{p.username} {p.username === username ? '(you)' : ''}</span>
                  </div>
                  <span style={{ color: statusColor, fontSize: '0.72rem', fontWeight: 600 }}>
                    {p.status === 'solved' ? `#${p.rank} · ${p.timeTaken}s` : p.status}
                  </span>
                </div>
              );
            })}
          </div>

          {/* AI Hint */}
          <div style={{ marginTop: '16px' }}>
            <button onClick={getAiHint} disabled={generating} style={{ width: '100%', padding: '10px', borderRadius: '9px', fontWeight: 700, fontSize: '0.82rem', background: generating ? S.surfaceHigh : `linear-gradient(135deg, ${S.purple}, ${S.secondary})`, color: generating ? S.textSub : '#fff', border: 'none', cursor: generating ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
              {generating ? '⏳ Getting hint...' : '🤖 Get AI Hint (-10s)'}
            </button>
            {aiHint && <div style={{ marginTop: '10px', background: 'rgba(167,139,250,0.08)', border: `1px solid rgba(167,139,250,0.2)`, borderRadius: '9px', padding: '12px', fontSize: '0.82rem', color: S.textSub, lineHeight: 1.5 }}>💡 {aiHint}</div>}
          </div>
        </div>

        {/* Code panel */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: '20px', overflow: 'auto' }}>
          <CodeEditor value={code} onChange={setCode} language={language} readOnly={status === 'won' || status === 'submitted' || status === 'timeout'} />

          {(status === 'won' || status === 'submitted') && (
            <div style={{ marginTop: '16px', background: status === 'won' ? 'rgba(74,222,128,0.1)' : S.surfaceHigh, border: `1px solid ${status === 'won' ? S.green : S.outline}`, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{status === 'won' ? '🏆' : '✅'}</div>
              <div style={{ color: status === 'won' ? S.green : S.text, fontWeight: 700, fontSize: '1.1rem' }}>
                {status === 'won' ? 'You won! First place!' : `Submitted! Rank #${rank}`}
              </div>
            </div>
          )}

          {status === 'timeout' && (
            <div style={{ marginTop: '16px', background: 'rgba(248,113,113,0.08)', border: `1px solid rgba(248,113,113,0.2)`, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏰</div>
              <div style={{ color: S.red, fontWeight: 700 }}>Time's up! Better luck next time.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CodeRacing() {
  const [rooms, setRooms] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState(null);
  const [tab, setTab] = useState('lobby');
  const [difficulty, setDifficulty] = useState('all');
  const [language, setLanguage] = useState('javascript');
  const [creating, setCreating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newRoomForm, setNewRoomForm] = useState({ title: '', problem: '', difficulty: 'Medium', timeLimit: 90 });
  const [roomCode, setRoomCode] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const username = user.username || 'Anonymous';
  const userId = user._id || 'guest';

  const fetchRooms = async () => {
    try {
      const res = await axios.get('/api/race/rooms', { params: { difficulty: difficulty === 'all' ? undefined : difficulty } });
      setRooms(res.data || []);
    } catch {
      try { await axios.post('/api/race/seed/problems'); const r = await axios.get('/api/race/rooms'); setRooms(r.data || []); } catch {}
    } finally { setLoading(false); }
  };

  const fetchLeaderboard = async () => {
    try { const res = await axios.get('/api/race/leaderboard'); setLeaderboard(res.data || []); } catch {}
  };

  useEffect(() => { fetchRooms(); fetchLeaderboard(); }, [difficulty]);

  const joinRoom = async (room) => {
    try {
      const res = await axios.post(`/api/race/room/${room.roomCode}/join`, { userId, username });
      setActiveRoom(res.data);
      toast.success('🏁 Joined the race!');
    } catch (e) { toast.error(e.response?.data?.error || 'Join failed'); }
  };

  const joinByCode = async () => {
    if (!roomCode.trim()) { toast.error('Enter a room code'); return; }
    try {
      const res = await axios.get(`/api/race/room/${roomCode.toUpperCase()}`);
      await joinRoom(res.data);
    } catch { toast.error('Room not found'); }
  };

  const createRoom = async () => {
    if (!newRoomForm.title || !newRoomForm.problem) { toast.error('Title and problem are required'); return; }
    setCreating(true);
    try {
      const res = await axios.post('/api/race/rooms', { ...newRoomForm, createdBy: userId, starterCode: { javascript: `function solution() {\n  // Your code here\n}\n`, python: `def solution():\n    # Your code here\n    pass\n` }, testCases: [], maxParticipants: 4, isPublic: true });
      await joinRoom(res.data);
    } catch { toast.error('Failed to create room'); } finally { setCreating(false); }
  };

  const generateProblem = async () => {
    setGenerating(true);
    try {
      const res = await axios.post('/api/race/generate-problem', { difficulty: newRoomForm.difficulty, topic: 'Arrays' });
      setNewRoomForm(f => ({ ...f, title: res.data.title || f.title, problem: res.data.description || f.problem, timeLimit: res.data.timeLimit || f.timeLimit }));
      toast.success('🤖 Problem generated!');
    } catch { toast.error('AI generation failed'); } finally { setGenerating(false); }
  };

  if (activeRoom) {
    return (
      <div style={{ minHeight: '100vh', background: S.bg, paddingTop: '88px', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap'); *{box-sizing:border-box;}`}</style>
        <div style={{ height: 'calc(100vh - 88px)', display: 'flex', flexDirection: 'column' }}>
          <RaceArena room={activeRoom} language={language} username={username} userId={userId} onLeave={() => { setActiveRoom(null); fetchRooms(); }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, paddingTop: '88px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); *{box-sizing:border-box;}`}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px' }}>
        {/* HERO */}
        <div style={{ textAlign: 'center', padding: '36px 0 28px' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, margin: '0 0 12px', background: `linear-gradient(135deg, ${S.primary}, ${S.secondary}, ${S.amber})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ⚡ Code Racing
          </h1>
          <p style={{ color: S.textSub, fontSize: '1rem', maxWidth: '450px', margin: '0 auto 24px', lineHeight: 1.7 }}>Race against other developers. First to solve wins. Real-time, no mercy.</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {LANGS.map(l => (
              <button key={l.id} onClick={() => setLanguage(l.id)} style={{ padding: '8px 18px', borderRadius: '99px', fontWeight: 700, fontSize: '0.82rem', border: `1px solid ${language === l.id ? S.primary : S.outline}`, cursor: 'pointer', background: language === l.id ? S.primaryGlow : 'transparent', color: language === l.id ? S.primary : S.textSub, fontFamily: 'inherit' }}>
                {l.icon} {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Join by code */}
        <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '14px', padding: '18px 20px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && joinByCode()} placeholder="Room code (e.g. AB12CD)"
            style={{ flex: 1, minWidth: '180px', padding: '11px 14px', borderRadius: '10px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.875rem', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', outline: 'none', textTransform: 'uppercase' }} />
          <button onClick={joinByCode} style={{ padding: '11px 22px', borderRadius: '10px', fontWeight: 700, background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Join Room</button>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '24px', background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '11px', padding: '3px', width: 'fit-content' }}>
          {['lobby', 'create', 'leaderboard'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '9px 22px', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: tab === t ? `linear-gradient(135deg, ${S.primary}, ${S.secondary})` : 'transparent', color: tab === t ? '#fff' : S.textSub, textTransform: 'capitalize' }}>{t === 'lobby' ? '🏟️ Lobby' : t === 'create' ? '➕ Create' : '🏆 Leaderboard'}</button>
          ))}
        </div>

        {tab === 'lobby' && (
          <>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: S.textSub, fontSize: '0.8rem' }}>Filter:</span>
              {['all', ...DIFFICULTIES].map(d => (
                <button key={d} onClick={() => setDifficulty(d)} style={{ padding: '6px 14px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600, border: `1px solid ${difficulty === d ? S.primary : S.outline}`, cursor: 'pointer', background: difficulty === d ? S.primaryGlow : 'transparent', color: difficulty === d ? S.primary : S.textSub, fontFamily: 'inherit' }}>{d}</button>
              ))}
              <button onClick={fetchRooms} style={{ marginLeft: 'auto', padding: '7px 14px', borderRadius: '8px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.textSub, cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit' }}>↺ Refresh</button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: S.textSub }}>Loading rooms...</div>
            ) : rooms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: S.textSub }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏟️</div>
                <h3 style={{ color: S.text }}>No open rooms</h3>
                <p>Create one or wait for other racers!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
                {rooms.map(r => <RoomCard key={r._id} room={r} onJoin={joinRoom} />)}
              </div>
            )}
          </>
        )}

        {tab === 'create' && (
          <div style={{ maxWidth: '560px' }}>
            <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '18px', padding: '28px' }}>
              <h3 style={{ color: S.text, fontWeight: 700, margin: '0 0 20px', fontSize: '1.2rem' }}>Create Race Room</h3>

              <label style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '7px' }}>DIFFICULTY</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {DIFFICULTIES.map(d => <button key={d} onClick={() => setNewRoomForm(f => ({ ...f, difficulty: d }))} style={{ flex: 1, padding: '9px', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem', border: `1px solid ${newRoomForm.difficulty === d ? ({ Easy: S.green, Medium: S.amber, Hard: S.red }[d]) : S.outline}`, cursor: 'pointer', background: newRoomForm.difficulty === d ? `${({ Easy: S.green, Medium: S.amber, Hard: S.red }[d])}15` : 'transparent', color: newRoomForm.difficulty === d ? ({ Easy: S.green, Medium: S.amber, Hard: S.red }[d]) : S.textSub, fontFamily: 'inherit' }}>{d}</button>)}
              </div>

              <label style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '7px' }}>PROBLEM TITLE</label>
              <input value={newRoomForm.title} onChange={e => setNewRoomForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Two Sum Race"
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.875rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', marginBottom: '14px' }} />

              <label style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '7px' }}>PROBLEM DESCRIPTION</label>
              <textarea value={newRoomForm.problem} onChange={e => setNewRoomForm(f => ({ ...f, problem: e.target.value }))} placeholder="Describe the problem to solve..." rows={4}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.875rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', resize: 'vertical', marginBottom: '14px' }} />

              <label style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: '7px' }}>TIME LIMIT (seconds)</label>
              <input type="number" value={newRoomForm.timeLimit} onChange={e => setNewRoomForm(f => ({ ...f, timeLimit: parseInt(e.target.value) }))} min={30} max={600}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.875rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', marginBottom: '20px' }} />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={generateProblem} disabled={generating} style={{ flex: '0 0 auto', padding: '12px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '0.82rem', background: generating ? S.surfaceHigh : `linear-gradient(135deg, #a78bfa, #818cf8)`, color: generating ? S.textSub : '#fff', border: 'none', cursor: generating ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
                  {generating ? '⏳' : '🤖 AI Generate'}
                </button>
                <button onClick={createRoom} disabled={creating} style={{ flex: 1, padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: '#fff', border: 'none', cursor: creating ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: creating ? 0.7 : 1 }}>
                  {creating ? '⏳ Creating...' : '🏁 Create & Join'}
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'leaderboard' && (
          <div>
            <h3 style={{ color: S.text, fontWeight: 700, margin: '0 0 20px', fontSize: '1.2rem' }}>🏆 Global Race Leaderboard</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {leaderboard.length === 0 ? <p style={{ color: S.textSub }}>No data yet. Complete a race to appear!</p> : leaderboard.map((r, i) => (
                <div key={r._id} style={{ background: S.surface, border: `1px solid ${i < 3 ? [S.amber, S.textSub, '#cd7f32'][i] : S.outline}`, borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: i < 3 ? `rgba(${['251,191,36', '148,163,184', '205,127,50'][i]},0.15)` : S.surfaceHigh, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: i < 3 ? [S.amber, S.textSub, '#cd7f32'][i] : S.textSub, fontSize: '0.9rem' }}>#{r.rank}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: S.text, fontWeight: 700 }}>{r.username}</div>
                    <div style={{ color: S.textSub, fontSize: '0.72rem' }}>ELO: {r.eloRating} · {r.totalRaces} races</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: S.green, fontWeight: 800 }}>{r.wins}W</div>
                    <div style={{ color: S.textSub, fontSize: '0.7rem' }}>Win rate: {r.totalRaces > 0 ? Math.round((r.wins / r.totalRaces) * 100) : 0}%</div>
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
