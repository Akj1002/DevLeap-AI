import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── Particle Canvas Hook ───────────────────────────────── */
function useParticles(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let particles = [];
    const spawn = () => {
      particles = [];
      const count = (canvas.width * canvas.height) / 14000;
      for (let i = 0; i < count; i++) {
        const s = Math.random() * 1.5 + 0.4;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          dx: (Math.random() - 0.5) * 0.35,
          dy: (Math.random() - 0.5) * 0.35,
          size: s,
        });
      }
    };
    spawn();
    window.addEventListener('resize', spawn);

    let raf;
    const LINK_DIST_SQ = (canvas.width / 9) * (canvas.height / 9);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(173,198,255,0.18)';
        ctx.fill();
      }
      // connect nearby particles
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST_SQ) {
            const alpha = (1 - d2 / LINK_DIST_SQ) * 0.07;
            ctx.strokeStyle = `rgba(173,198,255,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('resize', spawn);
    };
  }, [canvasRef]);
}

/* ─── LandingPage Component ──────────────────────────────── */
const LandingPage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  useParticles(canvasRef);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#131319',
      color: '#e4e1ea',
      fontFamily: 'Inter, sans-serif',
      overflowX: 'hidden',
      position: 'relative',
    }}>
      {/* Particle Canvas */}
      <canvas ref={canvasRef} style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none', opacity: 0.6,
      }} />

      {/* ── TopNav ────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '64px',
        background: 'rgba(19,19,25,0.82)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(66,71,84,0.35)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        zIndex: 50,
        display: 'flex', alignItems: 'center',
        padding: '0 32px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1440px', margin: '0 auto' }}>
          {/* Left: logo + links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            {/* Logo */}
            <div
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }}
            >
              <span style={{ fontSize: '20px' }}>⚡</span>
              <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px', color: '#e4e1ea' }}>
                DEV<span style={{ background: 'linear-gradient(135deg,#adc6ff,#d0bcff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>LEAP</span>
              </span>
            </div>
            {/* Nav links */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {['Problems', 'Interview AI', 'Roadmaps', 'Contests', 'Community'].map(lbl => (
                <NavLink key={lbl} label={lbl} onClick={() => {
                  const map = { 'Problems': '/tracker', 'Interview AI': '/interview', 'Roadmaps': '/roadmaps', 'Contests': '/contests', 'Community': '/discuss' };
                  navigate(map[lbl] || '/');
                }} />
              ))}
            </div>
          </div>
          {/* Right: auth buttons */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={() => navigate('/auth')} style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.1)',
              color: '#c2c6d6', borderRadius: '8px', padding: '8px 18px',
              fontSize: '14px', fontWeight: 500, cursor: 'pointer',
              fontFamily: 'Inter,sans-serif', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#e4e1ea'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#c2c6d6'; }}
            >Login</button>
            <button onClick={() => navigate('/auth')} style={{
              background: '#adc6ff', color: '#002e6a',
              border: 'none', borderRadius: '9999px',
              padding: '9px 22px', fontSize: '11px', fontWeight: 800,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'Inter,sans-serif',
              boxShadow: '0 0 20px rgba(173,198,255,0.3)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#d8e2ff'; e.currentTarget.style.boxShadow = '0 0 28px rgba(173,198,255,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#adc6ff'; e.currentTarget.style.boxShadow = '0 0 20px rgba(173,198,255,0.3)'; }}
            >Get Started Free</button>
          </div>
        </div>
      </nav>

      {/* ── Main Content ──────────────────────────────────── */}
      <main style={{ position: 'relative', zIndex: 10, paddingTop: '88px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 32px' }}>

          {/* ── Hero ──────────────────────────────────────── */}
          <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '68vh', textAlign: 'center', paddingTop: '40px' }}>
            {/* Status Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '5px 14px', borderRadius: '9999px',
              background: 'rgba(173,198,255,0.08)',
              border: '1px solid rgba(173,198,255,0.2)',
              color: '#adc6ff', fontSize: '11px', fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              marginBottom: '32px',
              animation: 'fadeInUp 0.5s ease forwards',
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#adc6ff', animation: 'pulse 2s infinite' }} />
              DevLeap AI v2.0 is Live
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(40px,6vw,68px)',
              fontWeight: 800, lineHeight: 1.08,
              letterSpacing: '-0.04em',
              maxWidth: '860px', margin: '0 auto 20px',
              color: '#e4e1ea',
            }}>
              Master{' '}
              <span style={{ background: 'linear-gradient(to right,#adc6ff,#d0bcff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>DSA</span>
              . Ace{' '}
              <span style={{ background: 'linear-gradient(to right,#adc6ff,#d0bcff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Interviews</span>
              .
            </h1>

            {/* Subtext */}
            <p style={{ fontSize: '17px', lineHeight: 1.65, color: '#c2c6d6', maxWidth: '620px', margin: '0 auto 40px' }}>
              Elevate your coding career with AI-powered practice, real-time mock interviews, and personalized roadmaps designed for high-performance developer ecosystems.
            </p>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={() => navigate('/auth')} style={{
                padding: '14px 32px', background: '#adc6ff', color: '#002e6a',
                borderRadius: '10px', border: 'none', fontSize: '11px',
                fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
                cursor: 'pointer', fontFamily: 'Inter,sans-serif',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 0 24px rgba(173,198,255,0.35)',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#d8e2ff'; e.currentTarget.style.boxShadow = '0 0 32px rgba(173,198,255,0.55)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#adc6ff'; e.currentTarget.style.boxShadow = '0 0 24px rgba(173,198,255,0.35)'; e.currentTarget.style.transform = 'none'; }}
              >
                Start for Free
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
              </button>
              <button onClick={() => navigate('/tracker')} style={{
                padding: '14px 28px',
                background: 'rgba(31,31,38,0.6)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.03)',
                borderRadius: '10px', color: '#e4e1ea',
                fontSize: '11px', fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                cursor: 'pointer', fontFamily: 'Inter,sans-serif',
                display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(57,56,64,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(31,31,38,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_circle</span>
                Watch Demo
              </button>
            </div>
          </section>

          {/* ── Stats Row ─────────────────────────────────── */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px', maxWidth: '900px', margin: '0 auto 96px', marginTop: '-10px' }}>
            {[
              { val: '3000+', label: 'Problems', color: '#adc6ff', delay: '0s' },
              { val: '98%',   label: 'Interview Success', color: '#4ae176', delay: '0.1s' },
              { val: '50k+',  label: 'Developers', color: '#d0bcff', delay: '0.2s' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(31,31,38,0.6)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.02), 0 8px 32px rgba(0,0,0,0.3)',
                borderRadius: '14px', padding: '32px 24px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                animation: `floatY 6s ease-in-out ${s.delay} infinite`,
              }}>
                <div style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.03em', color: s.color, marginBottom: '6px', filter: `drop-shadow(0 0 8px ${s.color}60)` }}>{s.val}</div>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(228,225,234,0.8)' }}>{s.label}</div>
              </div>
            ))}
          </section>

          {/* ── Features Bento Grid ───────────────────────── */}
          <section style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '40px' }}>
            {/* Section header */}
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '10px', color: '#e4e1ea' }}>The Ultimate Technical Arsenal</h2>
              <p style={{ fontSize: '14px', color: '#8c909f' }}>Precision tooling for elite software developer ecosystems.</p>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,1fr)', gridTemplateRows: 'auto auto', gap: '20px' }}>

              {/* ── Card 1: Code Editor (8 cols) ── */}
              <BentoCard cols={8} style={{ minHeight: '300px' }} accentColor="#adc6ff" onClick={() => navigate('/tracker')}>
                <div style={{ marginBottom: 'auto' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#adc6ff', display: 'block', marginBottom: '16px' }}>terminal</span>
                  <h3 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '10px' }}>Pro-Grade Code Editor</h3>
                  <p style={{ fontSize: '14px', color: '#8c909f', lineHeight: 1.55, maxWidth: '380px' }}>
                    Multi-language support with IntelliSense, real-time error checking, and integrated execution environment.
                  </p>
                </div>
                {/* Code snippet */}
                <div style={{
                  marginTop: '28px',
                  background: 'rgba(14,14,20,0.8)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '10px', padding: '14px 16px',
                  fontFamily: '"JetBrains Mono",monospace',
                  fontSize: '13px', lineHeight: 1.65,
                  border: '1px solid rgba(66,71,84,0.4)',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)',
                }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    <Dot color="rgba(255,180,171,0.8)" /><Dot color="rgba(74,225,118,0.8)" /><Dot color="rgba(173,198,255,0.8)" />
                  </div>
                  <div style={{ color: '#d0bcff' }}>def <span style={{ color: '#adc6ff' }}>solve</span>(grid: List[List[int]]) -&gt; int:</div>
                  <div style={{ color: '#8c909f', paddingLeft: '20px' }}># Optimization starts here</div>
                  <div style={{ color: '#4ae176', paddingLeft: '20px' }}>return dp_solution(grid)</div>
                </div>
              </BentoCard>

              {/* ── Card 2: AI Interview (4 cols, gradient border) ── */}
              <BentoCard cols={4} style={{ minHeight: '300px' }} gradientBorder accentColor="#d0bcff" onClick={() => navigate('/interview')}>
                <div style={{ marginBottom: 'auto' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#d0bcff', display: 'block', marginBottom: '16px' }}>smart_toy</span>
                  <h3 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '10px' }}>AI Mock Interviews</h3>
                  <p style={{ fontSize: '14px', color: '#8c909f', lineHeight: 1.55 }}>
                    Simulate high-pressure FAANG interviews with real-time AI feedback and dynamic follow-ups.
                  </p>
                </div>
                <div style={{
                  marginTop: '28px',
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(31,31,38,0.6)', padding: '8px 14px',
                  borderRadius: '8px', border: '1px solid rgba(66,71,84,0.25)',
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d0bcff', animation: 'ping 1.5s infinite' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: '#d0bcff', textTransform: 'uppercase' }}>AI Listening...</span>
                </div>
              </BentoCard>

              {/* ── Card 3: DSA Tracker (6 cols) ── */}
              <BentoCard cols={6} style={{ minHeight: '280px' }} accentColor="#4ae176" onClick={() => navigate('/tracker')}>
                <div style={{ marginBottom: 'auto' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#4ae176', display: 'block', marginBottom: '16px' }}>timeline</span>
                  <h3 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '10px' }}>DSA Mastery Tracker</h3>
                  <p style={{ fontSize: '14px', color: '#8c909f', lineHeight: 1.55 }}>
                    Visualize progress across algorithmic patterns with intelligent spaced repetition.
                  </p>
                </div>
                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <ProgressRow label="Dynamic Programming" pct={85} color="#4ae176" />
                  <ProgressRow label="Graphs" pct={60} color="#adc6ff" />
                  <ProgressRow label="Binary Search" pct={72} color="#d0bcff" />
                </div>
              </BentoCard>

              {/* ── Card 4: Resume Builder (6 cols) ── */}
              <BentoCard cols={6} style={{ minHeight: '280px' }} accentColor="#adc6ff" onClick={() => navigate('/resume-builder')}>
                <div style={{ marginBottom: 'auto' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#adc6ff', display: 'block', marginBottom: '16px' }}>description</span>
                  <h3 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '10px' }}>ATS-Optimized Resumes</h3>
                  <p style={{ fontSize: '14px', color: '#8c909f', lineHeight: 1.55 }}>
                    Generate data-driven tech resumes based on your solved problems and platform metrics — AI-enhanced.
                  </p>
                </div>
                <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#4ae176', fontWeight: 700 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }}>verified</span>
                    ATS Score: 94%
                  </div>
                  <button style={{
                    padding: '9px 18px',
                    background: 'rgba(31,31,38,0.9)',
                    border: '1px solid rgba(66,71,84,0.5)',
                    borderRadius: '8px', color: '#e4e1ea',
                    fontSize: '11px', fontWeight: 700,
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                    cursor: 'pointer', fontFamily: 'Inter,sans-serif',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    transition: 'all 0.2s',
                  }}
                    onClick={e => { e.stopPropagation(); navigate('/resume-builder'); }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(173,198,255,0.4)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(66,71,84,0.5)'}
                  >
                    Generate PDF <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>download</span>
                  </button>
                </div>
              </BentoCard>
            </div>
          </section>

          {/* ── Final CTA Strip ───────────────────────────── */}
          <section style={{ textAlign: 'center', padding: '96px 0 0' }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(31,31,38,0.6)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(173,198,255,0.15)',
              borderRadius: '20px',
              padding: '56px 64px',
              maxWidth: '700px', width: '100%',
              boxShadow: '0 8px 48px rgba(0,0,0,0.4)',
            }}>
              <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', color: '#adc6ff', textTransform: 'uppercase', marginBottom: '16px' }}>Ready to Level Up?</div>
              <h2 style={{ fontSize: '38px', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '16px', lineHeight: 1.15 }}>
                Join <span style={{ background: 'linear-gradient(to right,#adc6ff,#d0bcff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>50,000+</span> developers
              </h2>
              <p style={{ fontSize: '15px', color: '#8c909f', marginBottom: '36px', lineHeight: 1.6 }}>
                Start your journey to landing your dream offer. No credit card required.
              </p>
              <button onClick={() => navigate('/auth')} style={{
                padding: '14px 40px', background: '#adc6ff', color: '#002e6a',
                borderRadius: '9999px', border: 'none',
                fontSize: '12px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
                cursor: 'pointer', fontFamily: 'Inter,sans-serif',
                boxShadow: '0 0 28px rgba(173,198,255,0.4)',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#d8e2ff'; e.currentTarget.style.boxShadow = '0 0 40px rgba(173,198,255,0.6)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#adc6ff'; e.currentTarget.style.boxShadow = '0 0 28px rgba(173,198,255,0.4)'; e.currentTarget.style.transform = 'none'; }}
              >
                Create Free Account
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* CSS Keyframes injected inline */}
      <style>{`
        @keyframes floatY {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes floatYDelayed {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%,100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes ping {
          0%   { transform: scale(1);   opacity: 1; }
          75%  { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes borderRotate {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

/* ─── Helper Components ─────────────────────────────────── */

function NavLink({ label, onClick }) {
  const [hov, setHov] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        padding: '7px 14px', fontSize: '14px', fontWeight: 500,
        fontFamily: 'Inter,sans-serif',
        color: hov ? '#e4e1ea' : '#c2c6d6',
        borderRadius: '7px',
        background: hov ? 'rgba(255,255,255,0.04)' : 'none',
        transition: 'all 0.15s',
      }}
    >{label}</button>
  );
}

function Dot({ color }) {
  return <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: color, display: 'inline-block' }} />;
}

function ProgressRow({ label, pct, color }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', color: '#e4e1ea' }}>{label}</span>
        <span style={{ fontSize: '11px', fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ height: '8px', background: 'rgba(53,52,59,0.8)', borderRadius: '9999px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: '9999px',
          background: color,
          boxShadow: `0 0 10px ${color}80`,
          transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  );
}

function BentoCard({ cols, children, style = {}, accentColor = '#adc6ff', gradientBorder = false, onClick }) {
  const [hov, setHov] = React.useState(false);

  const base = {
    gridColumn: `span ${cols}`,
    background: 'rgba(31,31,38,0.6)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: hov ? `1px solid ${accentColor}40` : '1px solid rgba(66,71,84,0.2)',
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.02), 0 8px 32px rgba(0,0,0,0.3)',
    borderRadius: '16px',
    padding: '28px',
    display: 'flex', flexDirection: 'column',
    cursor: 'pointer',
    position: 'relative', overflow: 'hidden',
    transition: 'border-color 0.3s, box-shadow 0.3s',
    ...style,
  };

  if (hov) {
    base.boxShadow = `inset 0 1px 1px rgba(255,255,255,0.03), 0 12px 40px rgba(0,0,0,0.4), 0 0 30px ${accentColor}15`;
  }

  if (gradientBorder) {
    base.background = 'rgba(31,31,38,0.65)';
    base.border = 'none';
    // gradient border via pseudo handled with overlay div
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={base}
    >
      {/* Hover glow overlay */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '16px',
        background: `radial-gradient(circle at 30% 30%, ${accentColor}07 0%, transparent 70%)`,
        opacity: hov ? 1 : 0, transition: 'opacity 0.4s', pointerEvents: 'none',
      }} />
      {/* Gradient border overlay */}
      {gradientBorder && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '16px',
          padding: '1px',
          background: `linear-gradient(45deg, ${accentColor}70, rgba(255,255,255,0.05), ${accentColor}40, rgba(255,255,255,0.03))`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
        }} />
      )}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {children}
      </div>
    </div>
  );
}

export default LandingPage;