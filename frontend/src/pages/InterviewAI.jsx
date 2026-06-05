import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

// ─── Mock Interview Questions ────────────────────────────────────────────────
const QUESTIONS = {
  'Technical DSA': [
    'Can you explain the two-pointer technique and give an example where you would apply it?',
    'What is the time complexity of quicksort in the worst case, and how can we avoid it?',
    'Explain dynamic programming with a classic example like the knapsack problem.',
    'How would you detect a cycle in a linked list? Walk me through your approach.',
    'Describe the difference between BFS and DFS and when to use each.',
    'How do hash maps work internally? What happens during a collision?',
    'Can you solve the "longest common subsequence" problem and explain your logic?',
    'Explain the sliding window technique and provide a use case.',
  ],
  'System Design': [
    'Design a URL shortening service like Bit.ly. What are the core components?',
    'How would you design a distributed message queue like Kafka?',
    'Walk me through designing a scalable notification system for millions of users.',
    'How would you design the backend for a real-time collaborative document editor?',
    'Design a rate limiter service. What algorithms would you consider?',
    'How would you architect a global CDN from scratch?',
    'Describe how you would design a consistent, highly available key-value store.',
    'Design a recommendation system for an e-commerce platform.',
  ],
  'Behavioral': [
    'Tell me about a time you had a major technical disagreement with a teammate. How did you resolve it?',
    'Describe a situation where you had to deliver a project under extreme time pressure.',
    'Tell me about the most complex technical problem you\'ve solved and your approach.',
    'How do you handle receiving critical feedback on your code or design decisions?',
    'Describe a time you had to learn a new technology quickly. What was your strategy?',
    'Tell me about a time you led a team through a significant technical challenge.',
    'How do you prioritize tasks when you have multiple urgent deadlines?',
    'Describe a situation where you improved a process or system significantly.',
  ],
  'HR Round': [
    'Tell me about yourself and what makes you a strong candidate for this role.',
    'Where do you see yourself in 5 years, and how does this role align with your goals?',
    'What are your biggest strengths and a genuine area where you\'re actively improving?',
    'Why do you want to leave your current role and join our company?',
    'What motivates you most in your day-to-day work as an engineer?',
    'How do you stay updated with the latest trends and technologies in software development?',
    'What is your expected compensation range, and is it negotiable?',
    'Do you have any questions for us about the role, team, or company culture?',
  ],
};

const TYPE_CONFIG = {
  'Technical DSA': { icon: '💻', desc: 'Algorithms & Data Structures' },
  'System Design': { icon: '🏗️', desc: 'Architecture & Scalability' },
  'Behavioral':    { icon: '🧠', desc: 'Situational Leadership' },
  'HR Round':      { icon: '💼', desc: 'Culture & Career Goals' },
};

// ─── Stitch Design Tokens ───────────────────────────────────────────────────────
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

// ─── Keyframe injector ───────────────────────────────────────────────────────
const STYLES = `
  @keyframes pulse-glow {
    0%   { box-shadow: 0 0 20px rgba(173,198,255,0.35), 0 0 60px rgba(208,188,255,0.15); transform: scale(1); }
    50%  { box-shadow: 0 0 50px rgba(173,198,255,0.7),  0 0 100px rgba(208,188,255,0.4); transform: scale(1.06); }
    100% { box-shadow: 0 0 20px rgba(173,198,255,0.35), 0 0 60px rgba(208,188,255,0.15); transform: scale(1); }
  }
  @keyframes wave {
    0%, 100% { transform: scaleY(0.3); }
    50%       { transform: scaleY(1); }
  }
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes score-fill {
    from { stroke-dashoffset: 502; }
  }
  @keyframes mic-pulse {
    0%,100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,180,171,0.5); }
    50%     { transform: scale(1.08); box-shadow: 0 0 0 8px rgba(255,180,171,0); }
  }
  @keyframes ai-ping {
    0%   { opacity: 1; transform: scale(1); }
    75%  { opacity: 0; transform: scale(1.6); }
    100% { opacity: 0; }
  }
  .stage-wrap { animation: fade-in 0.45s ease both; }
  .hover-lift { transition: transform 0.18s ease, box-shadow 0.18s ease; }
  .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(173,198,255,0.2); }
  .hide-scrollbar::-webkit-scrollbar { width: 4px; }
  .hide-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .hide-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 4px; }
  .hide-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); }
`;

// ─── Utility ─────────────────────────────────────────────────────────────────
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const fmt  = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// ─── Sub-components ──────────────────────────────────────────────────────────

function ScoreGauge({ score }) {
  const r = 80, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? S.tertiary : score >= 60 ? '#f59e0b' : S.error;
  return (
    <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto' }}>
      <svg width={200} height={200} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={100} cy={100} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={14} />
        <circle
          cx={100} cy={100} r={r} fill="none"
          stroke={color} strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ animation: 'score-fill 1.4s ease forwards', transition: 'stroke-dashoffset 1.4s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: '2.8rem', fontWeight: 800, color, lineHeight: 1, fontFamily: '"JetBrains Mono",monospace' }}>{score}</span>
        <span style={{ fontSize: '0.85rem', color: S.outline, marginTop: 4 }}>/ 100</span>
      </div>
    </div>
  );
}

function MetricBar({ label, value, delay, color }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.85rem' }}>
        <span style={{ color: S.text, fontWeight: 600 }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{value}%</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          width: `${value}%`, height: '100%', background: color,
          animation: `score-fill 1s ${delay}ms ease both`,
          borderRadius: 3,
        }}></div>
      </div>
    </div>
  );
}

function AccordionItem({ q, index, feedback, userAnswer, score }) {
  const [open, setOpen] = useState(false);
  const col = score >= 80 ? S.tertiary : score >= 60 ? '#f59e0b' : S.error;
  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden', marginBottom: 10,
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.03)', border: 'none', color: S.text,
          padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer', textAlign: 'left', gap: 12,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <span style={{
            background: 'rgba(77,142,255,0.15)', color: S.primaryCont, borderRadius: 6,
            padding: '2px 8px', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
          }}>Q{index + 1}</span>
          <span style={{ fontSize: '0.88rem', color: S.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q}</span>
        </span>
        <span style={{
          background: `${col}22`, color: col, borderRadius: 99, padding: '3px 10px',
          fontSize: '0.78rem', fontWeight: 700, flexShrink: 0,
        }}>{score}%</span>
        <span style={{ color: S.outline, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: '16px 18px', background: S.surfaceLowest, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: '0.75rem', color: S.outline, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Answer</div>
            <div style={{ color: S.textSub, fontSize: '0.88rem', lineHeight: 1.6 }}>{userAnswer}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: S.outline, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Feedback</div>
            <div style={{ color: S.text, fontSize: '0.88rem', lineHeight: 1.6 }}>{feedback}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STAGE 1: SETUP (Stitch Design) ──────────────────────────────────────────────────
function SetupStage({ onStart }) {
  const [resumeFile, setResumeFile]   = useState(null);
  const [interviewType, setType]      = useState('Technical DSA');
  const [company, setCompany]         = useState('');
  const [difficulty, setDifficulty]   = useState('Mid-Level');
  const [dragging, setDragging]       = useState(false);
  const fileRef = useRef(null);

  const handleFile = (file) => {
    if (file) setResumeFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const inp = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(66,71,84,0.6)', borderRadius: '8px',
    padding: '11px 14px', color: S.text, fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Inter,sans-serif', transition: 'border-color 0.2s',
  };

  return (
    <div className="stage-wrap" style={{
      minHeight: '100vh', background: S.bg, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 20px',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '14px',
            background: 'linear-gradient(135deg, #adc6ff, #d0bcff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(173,198,255,0.35)',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '26px', color: '#002e6a' }}>smart_toy</span>
          </div>
          <h1 style={{
            margin: 0, fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.04em',
            background: 'linear-gradient(135deg, #adc6ff, #d0bcff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>AI Mock Interview</h1>
        </div>
        <p style={{ color: S.outline, fontSize: '15px', margin: 0 }}>
          Upload your resume and let AI personalize your interview experience
        </p>
      </div>

      {/* Card */}
      <div style={{
        maxWidth: 700, width: '100%',
        background: 'rgba(31,31,38,0.7)',
        border: '1px solid rgba(66,71,84,0.4)',
        borderRadius: '20px', padding: '36px 40px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>

        {/* Resume Upload */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', color: S.textSub, fontWeight: 600, fontSize: '11px', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
            Resume Upload
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? S.primary : resumeFile ? S.tertiary : 'rgba(66,71,84,0.7)'}`,
              borderRadius: '12px', padding: '32px 20px', textAlign: 'center', cursor: 'pointer',
              background: dragging ? 'rgba(173,198,255,0.05)' : resumeFile ? 'rgba(74,225,118,0.04)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.2s ease', position: 'relative',
            }}
          >
            <input
              ref={fileRef} type="file" accept=".pdf,.doc,.docx"
              style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer', width: '100%', height: '100%' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
            {resumeFile ? (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', color: S.tertiary, marginBottom: 8, display: 'block' }}>task_alt</span>
                <div style={{ color: S.tertiary, fontWeight: 600, fontSize: '14px' }}>{resumeFile.name}</div>
                <div style={{ color: S.outline, fontSize: '12px', marginTop: 4 }}>Click to replace</div>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '36px', color: S.outline, marginBottom: 10, display: 'block' }}>cloud_upload</span>
                <div style={{ color: S.textSub, fontSize: '14px', marginBottom: 4 }}>Drag &amp; drop your resume here</div>
                <span style={{ color: S.primary, fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>or browse files</span>
                <div style={{ color: S.outline, fontSize: '12px', marginTop: 6 }}>PDF, DOC, DOCX supported</div>
              </>
            )}
          </div>
        </div>

        {/* Interview Type */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: S.textSub, fontWeight: 600, fontSize: '11px', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
            Interview Type
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
              const selected = interviewType === type;
              return (
                <div
                  key={type}
                  onClick={() => setType(type)}
                  className="hover-lift"
                  style={{
                    border: `1px solid ${selected ? 'rgba(173,198,255,0.4)' : 'rgba(66,71,84,0.4)'}`,
                    borderRadius: '12px', padding: '14px 16px', cursor: 'pointer',
                    background: selected ? 'rgba(173,198,255,0.08)' : 'rgba(255,255,255,0.02)',
                    boxShadow: selected ? '0 0 20px rgba(173,198,255,0.15)' : 'none',
                    opacity: !selected ? 0.6 : 1,
                    transition: 'all 0.18s ease',
                  }}
                >
                  <div style={{ fontSize: '1.4rem', marginBottom: 5 }}>{cfg.icon}</div>
                  <div style={{ color: selected ? S.text : S.textSub, fontWeight: 700, fontSize: '13px' }}>{type}</div>
                  <div style={{ color: S.outline, fontSize: '11px', marginTop: 2 }}>{cfg.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Company */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: S.textSub, fontWeight: 600, fontSize: '11px', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
            Target Company
          </label>
          <input
            type="text"
            placeholder="e.g. Google, Microsoft, Amazon…"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            style={inp}
            onFocus={(e) => (e.target.style.borderColor = S.primary)}
            onBlur={(e)  => (e.target.style.borderColor = 'rgba(66,71,84,0.6)')}
          />
        </div>

        {/* Difficulty */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', color: S.textSub, fontWeight: 600, fontSize: '11px', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
            Difficulty Level
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Junior', 'Mid-Level', 'Senior'].map((d) => {
              const sel = difficulty === d;
              const colors = { Junior: S.tertiary, 'Mid-Level': '#f59e0b', Senior: S.error };
              return (
                <button
                  key={d} onClick={() => setDifficulty(d)}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: '9999px',
                    border: `1px solid ${sel ? colors[d] : 'rgba(66,71,84,0.5)'}`,
                    background: sel ? `${colors[d]}20` : 'transparent',
                    color: sel ? colors[d] : S.outline,
                    fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                    fontFamily: 'Inter,sans-serif', transition: 'all 0.18s ease',
                  }}
                >{d}</button>
              );
            })}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={() => onStart({ resumeFile, interviewType, company: company || 'Open Company', difficulty })}
          className="hover-lift"
          style={{
            width: '100%', padding: '15px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #adc6ff 0%, #d0bcff 100%)',
            color: '#002e6a', fontWeight: 800, fontSize: '14px',
            letterSpacing: '0.05em', textTransform: 'uppercase',
            boxShadow: '0 8px 32px rgba(173,198,255,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: 'Inter,sans-serif',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>play_arrow</span>
          Start Interview
        </button>
      </div>
    </div>
  );
}

// ─── STAGE 2: INTERVIEW (Stitch Design) ────────────────────────────────────────────
function InterviewStage({ config, onEnd }) {
  const [micMuted,    setMicMuted]    = useState(false);
  const [camOff,      setCamOff]      = useState(false);
  const [cameraActive, setCamActive]  = useState(false);
  const [isAISpeaking, setAISpeaking] = useState(false);
  const [elapsed,     setElapsed]     = useState(0);
  const [currentQ,   setCurrentQ]    = useState(0);
  const [transcript,  setTranscript]  = useState([
    { role: 'user', text: "Yes, I'm ready. Let's start with the requirements." },
  ]);
  // Live metrics (simulate changes)
  const [metrics, setMetrics] = useState({ confidence: 85, clarity: 92, accuracy: 78 });

  const questions = QUESTIONS[config.interviewType] || QUESTIONS['Technical DSA'];
  const total = questions.length;
  const timeRemaining = Math.max(0, 45 * 60 - elapsed);

  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const timerRef  = useRef(null);
  const synthRef  = useRef(window.speechSynthesis);

  // camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamActive(true);
    } catch {
      console.warn('Camera unavailable');
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamActive(false);
  }, []);

  const speakQuestion = useCallback((text) => {
    synthRef.current?.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate  = 0.95;
    utt.pitch = 1.05;
    utt.onstart = () => setAISpeaking(true);
    utt.onend   = () => setAISpeaking(false);
    synthRef.current?.speak(utt);
  }, []);

  // mount
  useEffect(() => {
    startCamera();
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => {
      stopCamera();
      clearInterval(timerRef.current);
      synthRef.current?.cancel();
    };
  }, [startCamera, stopCamera]);

  // speak on question change
  useEffect(() => {
    const q = questions[currentQ];
    if (q) setTimeout(() => speakQuestion(q), 600);
  }, [currentQ, questions, speakQuestion]);

  const nextQuestion = () => {
    if (currentQ < total - 1) setCurrentQ(q => q + 1);
    else handleEnd();
  };

  const handleEnd = () => {
    stopCamera();
    synthRef.current?.cancel();
    clearInterval(timerRef.current);
    onEnd({ questions, elapsed });
  };

  const toggleMic = () => {
    setMicMuted(m => {
      streamRef.current?.getAudioTracks().forEach(t => (t.enabled = m));
      return !m;
    });
  };

  const toggleCam = () => {
    setCamOff(o => {
      streamRef.current?.getVideoTracks().forEach(t => (t.enabled = o));
      return !o;
    });
  };

  const WaveBar = ({ delay }) => (
    <div style={{
      width: 4, borderRadius: 99,
      background: 'linear-gradient(to top, #3b82f6, #8b5cf6)',
      animation: isAISpeaking ? `wave 0.7s ease-in-out ${delay}s infinite` : 'none',
      height: isAISpeaking ? 28 : 6,
      transition: 'height 0.3s ease',
    }} />
  );

  const panelStyle = {
    flex: 1, background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20, position: 'relative', overflow: 'hidden',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: 260,
  };

  return (
    <div className="stage-wrap" style={{
      display: 'flex', height: '100vh', background: '#0a0a0f',
      flexDirection: 'column', fontFamily: 'Inter, sans-serif', overflow: 'hidden',
    }}>
      {/* Top bar */}
      <div style={{
        padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%', background: '#ef4444',
            boxShadow: '0 0 8px #ef4444', animation: 'mic-pulse 1.5s infinite',
          }} />
          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem' }}>Live Interview</span>
          <span style={{
            background: 'rgba(59,130,246,0.15)', color: '#3b82f6',
            borderRadius: 99, padding: '2px 12px', fontSize: '0.78rem', fontWeight: 700,
          }}>{config.interviewType}</span>
        </div>
        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
          Target: <strong style={{ color: '#f1f5f9' }}>{config.company}</strong>
          &nbsp;·&nbsp;
          <strong style={{ color: '#f59e0b' }}>{config.difficulty}</strong>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 28px 0', gap: 20, overflow: 'hidden' }}>
        {/* Video panels */}
        <div style={{ display: 'flex', gap: 20, flex: 1, minHeight: 0 }}>
          {/* AI panel */}
          <div style={panelStyle}>
            <div style={{
              width: 130, height: 130, borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #06b6d4, #3b82f6 40%, #8b5cf6 75%, #0a0a0f)',
              animation: 'pulse-glow 2s ease-in-out infinite',
            }} />
            {/* waveform */}
            <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', marginTop: 24, height: 34 }}>
              {[0, 0.1, 0.2, 0.1, 0].map((d, i) => <WaveBar key={i} delay={d} />)}
            </div>
            <div style={{
              position: 'absolute', bottom: 14, left: 16,
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
              padding: '5px 12px', borderRadius: 8, color: '#f1f5f9', fontWeight: 600, fontSize: '0.82rem',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ color: isAISpeaking ? '#22c55e' : '#475569', fontSize: '0.6rem' }}>●</span>
              DevAI Interviewer
            </div>
            <div style={{
              position: 'absolute', top: 14, right: 14,
              background: 'rgba(59,130,246,0.15)', color: '#3b82f6',
              borderRadius: 8, padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700,
            }}>AI</div>
          </div>

          {/* User panel */}
          <div style={panelStyle}>
            {!cameraActive && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: '3rem', opacity: 0.3 }}>📷</div>
                <div style={{ color: '#475569', fontSize: '0.9rem' }}>Camera Offline</div>
              </div>
            )}
            <video
              ref={videoRef} autoPlay playsInline muted
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                display: cameraActive && !camOff ? 'block' : 'none',
                position: 'absolute', inset: 0,
              }}
            />
            <div style={{
              position: 'absolute', bottom: 14, left: 16,
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
              padding: '5px 12px', borderRadius: 8, color: '#f1f5f9', fontWeight: 600, fontSize: '0.82rem',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ color: micMuted ? '#ef4444' : '#22c55e', fontSize: '0.6rem' }}>●</span>
              You
            </div>
          </div>
        </div>

        {/* Question card */}
        <div style={{
          background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 16, padding: '18px 22px',
          display: 'flex', alignItems: 'flex-start', gap: 14,
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            borderRadius: 10, padding: '8px 12px', fontWeight: 800, fontSize: '0.85rem',
            color: '#fff', flexShrink: 0,
          }}>Q{currentQ + 1}</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Question</div>
            <div style={{ color: '#f1f5f9', fontSize: '1rem', lineHeight: 1.6, fontWeight: 500 }}>
              {questions[currentQ]}
            </div>
          </div>
          {currentQ < total - 1 && (
            <button
              onClick={nextQuestion}
              style={{
                background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                color: '#3b82f6', borderRadius: 10, padding: '8px 16px', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.82rem', flexShrink: 0,
                transition: 'all 0.18s',
              }}
            >Next →</button>
          )}
        </div>
      </div>

      {/* Controls bar */}
      <div style={{ padding: '18px 28px 24px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 99, padding: '12px 24px', maxWidth: 700, margin: '0 auto',
        }}>
          {/* Mic */}
          <button
            onClick={toggleMic}
            title={micMuted ? 'Unmute' : 'Mute'}
            style={{
              width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: micMuted ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)',
              color: micMuted ? '#ef4444' : '#94a3b8', fontSize: '1.2rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.18s',
            }}
          >{micMuted ? '🔇' : '🎙️'}</button>

          {/* Camera */}
          <button
            onClick={toggleCam}
            title={camOff ? 'Show camera' : 'Hide camera'}
            style={{
              width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: camOff ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)',
              color: camOff ? '#ef4444' : '#94a3b8', fontSize: '1.2rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.18s',
            }}
          >{camOff ? '📷' : '📹'}</button>

          {/* Timer */}
          <div style={{
            background: 'rgba(0,0,0,0.3)', borderRadius: 99, padding: '8px 20px',
            fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', color: '#f1f5f9',
            letterSpacing: '0.08em',
          }}>{fmt(elapsed)}</div>

          {/* Question counter */}
          <div style={{
            background: 'rgba(139,92,246,0.15)', borderRadius: 99, padding: '8px 20px',
            fontWeight: 700, fontSize: '0.9rem', color: '#8b5cf6',
          }}>Q {currentQ + 1} / {total}</div>

          <div style={{ flex: 1 }} />

          {/* End */}
          <button
            onClick={handleEnd}
            style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', borderRadius: 99, padding: '10px 22px',
              fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.18s',
            }}
          >⏹ End Interview</button>
        </div>
      </div>
    </div>
  );
}

// ─── STAGE 3: REPORT ────────────────────────────────────────────────────────
function ReportStage({ config, questions, scores, onRestart }) {
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const overall = Math.round(
    (scores.technical + scores.communication + scores.problemSolving + scores.confidence + scores.codeQuality) / 5
  );

  const FEEDBACKS = [
    'Strong opening — you clearly defined your approach before diving into code.',
    'Good use of examples, though the explanation could be more concise.',
    'You identified edge cases well. Try to verify complexity after each step.',
    'Excellent communication of trade-offs. Keep this up in real interviews.',
    'Solid answer, but missed one key nuance. Review this topic more deeply.',
    'Good structure. Practice verbalizing your thought process step-by-step.',
    'Strong conceptual understanding. Work on mapping theory to implementation.',
    'Great answer overall. The confidence in delivery was notable.',
  ];

  const USER_ANSWERS = [
    'I would use a hash map to store the frequencies and iterate through the array once…',
    'The system needs a load balancer, several microservices, and a caching layer…',
    'In that situation I raised the concern in our next sprint retrospective and proposed…',
    'I see myself growing into a senior/staff engineer role, focusing on platform…',
    'Using a sliding window we maintain a running sum and shrink the window when…',
    'The main trade-off is between consistency and availability — I would favor…',
    'I learned Kubernetes in about two weeks by building small projects and reading…',
    'My biggest strength is breaking down complex problems; I am actively improving…',
  ];

  const STRENGTHS = [
    'Clear problem decomposition and structured thinking',
    'Strong communication of technical trade-offs',
    'Confident and professional demeanor throughout',
    'Proactive edge-case identification',
  ];

  const IMPROVEMENTS = [
    'Deepen Big-O analysis — always state time and space complexity explicitly',
    'Practice "think out loud" technique to keep the interviewer engaged',
    'Work on conciseness — some answers could be 20% shorter without losing depth',
  ];

  const qScores = questions.map((_, i) => rand(55, 98));

  const saveReport = async () => {
    setSaving(true);
    const userId = localStorage.getItem('devleap_user_id');
    if (userId) {
      try {
        await axios.post(`/api/users/${userId}/interview-report`, {
          company:       config.company,
          interviewType: config.interviewType,
          difficulty:    config.difficulty,
          score:         overall,
          metrics:       scores,
          feedback:      `Overall score: ${overall}/100. ${STRENGTHS[0]}.`,
        });
        setSaved(true);
      } catch (e) {
        console.error('Save failed', e);
      }
    }
    setSaving(false);
  };

  const labelColor = overall >= 80 ? S.tertiary : overall >= 60 ? '#f59e0b' : S.error;
  const labelText  = overall >= 80 ? 'Excellent' : overall >= 60 ? 'Good' : 'Needs Work';

  return (
    <div className="stage-wrap" style={{
      minHeight: '100vh', background: S.bg, fontFamily: 'Inter, sans-serif',
      color: S.text, overflowY: 'auto',
    }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(77,142,255,0.08) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '48px 40px', textAlign: 'center',
      }}>
        <h1 style={{
          margin: '0 0 4px', fontSize: '2rem', fontWeight: 800,
          background: 'linear-gradient(135deg, #adc6ff, #d0bcff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Interview Report</h1>
        <p style={{ color: S.textSub, margin: '0 0 32px', fontSize: '0.9rem' }}>
          {config.company} · {config.interviewType} · {config.difficulty}
        </p>

        <ScoreGauge score={overall} />

        <div style={{ marginTop: 16 }}>
          <span style={{
            background: `${labelColor}22`, color: labelColor,
            borderRadius: 99, padding: '6px 20px', fontWeight: 700, fontSize: '0.95rem',
          }}>{labelText} Performance</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '36px 24px' }}>

        {/* Metrics */}
        <div style={{
          background: S.surface, border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 20, padding: '28px 32px', marginBottom: 24,
        }}>
          <h2 style={{ margin: '0 0 22px', fontSize: '1.05rem', fontWeight: 700, color: S.textSub, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Performance Metrics
          </h2>
          <MetricBar label="Technical Accuracy"   value={scores.technical}      delay={0}   color={S.secondary} />
          <MetricBar label="Communication"        value={scores.communication}  delay={100} color={S.primaryCont} />
          <MetricBar label="Problem Solving"      value={scores.problemSolving} delay={200} color={S.primary} />
          <MetricBar label="Confidence"           value={scores.confidence}     delay={300} color={S.tertiary} />
          <MetricBar label="Code Quality"         value={scores.codeQuality}    delay={400} color={S.secondaryCont} />
        </div>

        {/* Question Breakdown */}
        <div style={{
          background: S.surface, border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 20, padding: '28px 32px', marginBottom: 24,
        }}>
          <h2 style={{ margin: '0 0 22px', fontSize: '1.05rem', fontWeight: 700, color: S.textSub, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Question Breakdown
          </h2>
          {questions.map((q, i) => (
            <AccordionItem
              key={i} q={q} index={i}
              feedback={FEEDBACKS[i % FEEDBACKS.length]}
              userAnswer={USER_ANSWERS[i % USER_ANSWERS.length]}
              score={qScores[i]}
            />
          ))}
        </div>

        {/* Strengths + Improvements */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
          {/* Strengths */}
          <div style={{
            background: 'rgba(74,225,118,0.05)', border: '1px solid rgba(74,225,118,0.15)',
            borderRadius: 20, padding: '24px',
          }}>
            <h3 style={{ margin: '0 0 16px', color: S.tertiary, fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span> Strengths
            </h3>
            {STRENGTHS.map((s, i) => (
              <div key={i} style={{
                background: 'rgba(74,225,118,0.08)', borderRadius: 10, padding: '10px 14px', marginBottom: 8,
                color: '#86efac', fontSize: '0.85rem', lineHeight: 1.5,
              }}>{s}</div>
            ))}
          </div>

          {/* Improvements */}
          <div style={{
            background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)',
            borderRadius: 20, padding: '24px',
          }}>
            <h3 style={{ margin: '0 0 16px', color: '#f59e0b', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bolt</span> Areas to Improve
            </h3>
            {IMPROVEMENTS.map((s, i) => (
              <div key={i} style={{
                background: 'rgba(245,158,11,0.08)', borderRadius: 10, padding: '10px 14px', marginBottom: 8,
                color: '#fde68a', fontSize: '0.85rem', lineHeight: 1.5,
              }}>{s}</div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 16 }}>
          <button
            onClick={saveReport}
            disabled={saving || saved}
            className="hover-lift"
            style={{
              flex: 1, padding: '15px', borderRadius: 14, border: 'none', cursor: saved ? 'default' : 'pointer',
              background: saved ? 'rgba(74,225,118,0.15)' : 'linear-gradient(135deg, #adc6ff, #d0bcff)',
              color: saved ? S.tertiary : '#002e6a', fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em',
              opacity: saving ? 0.7 : 1, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{saved ? 'task_alt' : 'save'}</span>
            {saved ? 'Saved to Profile' : saving ? 'Saving…' : 'Save to Profile'}
          </button>
          <button
            onClick={onRestart}
            className="hover-lift"
            style={{
              flex: 1, padding: '15px', borderRadius: 14, cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: S.text, fontWeight: 700, fontSize: '14px', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>replay</span>
            Start New Interview
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT COMPONENT ──────────────────────────────────────────────────────────
const InterviewAI = () => {
  const [stage,    setStage]    = useState('setup');   // 'setup' | 'interview' | 'report'
  const [config,   setConfig]   = useState(null);
  const [result,   setResult]   = useState(null);
  const [scores,   setScores]   = useState(null);

  const handleStart = (cfg) => {
    setConfig(cfg);
    setStage('interview');
  };

  const handleEnd = ({ questions, elapsed }) => {
    const s = {
      technical:      rand(60, 95),
      communication:  rand(60, 95),
      problemSolving: rand(60, 95),
      confidence:     rand(60, 95),
      codeQuality:    rand(60, 95),
    };
    setScores(s);
    setResult({ questions, elapsed });
    setStage('report');
  };

  const handleRestart = () => {
    setStage('setup');
    setConfig(null);
    setResult(null);
    setScores(null);
  };

  return (
    <>
      <style>{STYLES}</style>
      {stage === 'setup' && <SetupStage onStart={handleStart} />}
      {stage === 'interview' && config && (
        <InterviewStage config={config} onEnd={handleEnd} />
      )}
      {stage === 'report' && config && result && scores && (
        <ReportStage
          config={config}
          questions={result.questions}
          scores={scores}
          onRestart={handleRestart}
        />
      )}
    </>
  );
};

export default InterviewAI;