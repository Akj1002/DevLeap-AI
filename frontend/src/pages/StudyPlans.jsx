import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  amber: '#f59e0b'
};

const SkeletonCard = () => (
  <div style={{ background: S.surface, border: `1px solid ${S.outlineVar}`, borderRadius: '20px', padding: '24px', minHeight: '260px', display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
      <div style={{ width: '75%', height: '24px', background: S.surfaceHigh, borderRadius: '4px', animation: 'pulse 2s infinite' }}></div>
      <div style={{ width: '64px', height: '24px', background: S.surfaceHigh, borderRadius: '12px', animation: 'pulse 2s infinite' }}></div>
    </div>
    <div style={{ width: '50%', height: '16px', background: S.surfaceHigh, borderRadius: '4px', marginBottom: '16px', animation: 'pulse 2s infinite' }}></div>
    <div style={{ width: '100%', height: '16px', background: S.surfaceHigh, borderRadius: '4px', marginBottom: '8px', animation: 'pulse 2s infinite' }}></div>
    <div style={{ width: '83%', height: '16px', background: S.surfaceHigh, borderRadius: '4px', marginBottom: '24px', animation: 'pulse 2s infinite' }}></div>
    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
      <div style={{ width: '64px', height: '24px', background: S.surfaceHigh, borderRadius: '12px', animation: 'pulse 2s infinite' }}></div>
      <div style={{ width: '64px', height: '24px', background: S.surfaceHigh, borderRadius: '12px', animation: 'pulse 2s infinite' }}></div>
    </div>
    <div style={{ width: '100%', height: '40px', background: S.surfaceHigh, borderRadius: '12px', marginTop: 'auto', animation: 'pulse 2s infinite' }}></div>
    <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }`}</style>
  </div>
);

const levelColors = {
  Beginner: { bg: 'rgba(74, 225, 118, 0.15)', text: S.tertiary, border: `1px solid rgba(74, 225, 118, 0.3)` },
  Intermediate: { bg: 'rgba(245, 158, 11, 0.15)', text: S.amber, border: `1px solid rgba(245, 158, 11, 0.3)` },
  Advanced: { bg: 'rgba(255, 180, 171, 0.15)', text: S.error, border: `1px solid rgba(255, 180, 171, 0.3)` },
  'All Levels': { bg: 'rgba(208, 188, 255, 0.15)', text: S.secondary, border: `1px solid rgba(208, 188, 255, 0.3)` },
  Company: { bg: 'rgba(173, 198, 255, 0.15)', text: S.primary, border: `1px solid rgba(173, 198, 255, 0.3)` },
};

const tabs = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Company'];

export default function StudyPlans() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/study-plans');
        setPlans(res.data);
      } catch (err) {
        toast.error("Failed to fetch study plans");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleStart = (plan) => {
    toast.success(`Started ${plan.name}! Redirecting to tracker...`, {
      style: { background: S.surface, color: S.text, border: `1px solid ${S.outlineVar}` },
    });
    setTimeout(() => {
      navigate('/tracker');
    }, 1500);
  };

  const filtered = activeTab === 'All' 
    ? plans 
    : plans.filter(p => p.level === activeTab || (activeTab === 'Company' && p.level === 'Advanced' && p.name.includes('Pack')));

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, paddingTop: '100px', paddingBottom: '80px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* HERO */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '20px', background: `linear-gradient(to right, ${S.primary}, ${S.secondary}, ${S.primary})`, backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'gradient 4s linear infinite' }}>
            Study Plans
          </h1>
          <p style={{ color: S.outline, fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
            Curated problem sets to master data structures and algorithms. Follow structured plans built by industry experts.
          </p>
          <style>{`@keyframes gradient { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }`}</style>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginBottom: '48px' }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 20px', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.3s', cursor: 'pointer',
                  background: isActive ? 'rgba(173, 198, 255, 0.1)' : S.surface,
                  border: `1px solid ${isActive ? S.primary : 'rgba(66, 71, 84, 0.3)'}`,
                  color: isActive ? S.primary : S.outline,
                  boxShadow: isActive ? `0 0 15px rgba(173,198,255,0.2)` : 'none'
                }}
                onMouseEnter={e => { if(!isActive) { e.currentTarget.style.color = S.text; e.currentTarget.style.borderColor = 'rgba(66, 71, 84, 0.6)'; } }}
                onMouseLeave={e => { if(!isActive) { e.currentTarget.style.color = S.outline; e.currentTarget.style.borderColor = 'rgba(66, 71, 84, 0.3)'; } }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
             <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 0', color: S.outline, fontSize: '1.125rem', border: `1px solid rgba(66, 71, 84, 0.2)`, borderRadius: '16px', background: 'rgba(31, 31, 38, 0.5)' }}>
               No plans found for this category.
             </div>
          ) : (
            filtered.map(plan => {
              const isHovered = hoveredCard === (plan.id || plan._id);
              const levelStyle = levelColors[plan.level] || levelColors.Intermediate;
              
              return (
                <div
                  key={plan.id || plan._id}
                  onMouseEnter={() => setHoveredCard(plan.id || plan._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    position: 'relative', background: S.surface, border: `1px solid ${isHovered ? 'rgba(66, 71, 84, 0.6)' : 'rgba(66, 71, 84, 0.3)'}`, borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', transition: 'all 0.3s',
                    transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                    boxShadow: isHovered ? '0 20px 40px -15px rgba(0,0,0,0.5)' : 'none'
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: `linear-gradient(to right, transparent, ${plan.color || S.primary}, transparent)`, opacity: 0.5, borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '16px' }}>
                    <h3 style={{ fontSize: '1.375rem', fontWeight: 800, color: S.text, lineHeight: 1.2, margin: 0 }}>{plan.name}</h3>
                    <div style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0, background: levelStyle.bg, color: levelStyle.text, border: levelStyle.border }}>
                      {plan.level}
                    </div>
                  </div>
                  
                  <div style={{ color: S.outline, fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px' }}>
                    By <span style={{ color: S.text }}>{plan.source}</span>
                  </div>
                  
                  <p style={{ color: S.outlineVar, fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '24px', flex: 1, minHeight: '60px' }}>
                    {plan.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                    {plan.topics.slice(0, 3).map(topic => (
                      <span key={topic} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: S.text, padding: '4px 10px', borderRadius: '6px', fontWeight: 500, border: `1px solid rgba(66, 71, 84, 0.2)` }}>
                        {topic}
                      </span>
                    ))}
                    {plan.topics.length > 3 && (
                      <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: S.outline, padding: '4px 10px', borderRadius: '6px', fontWeight: 500, border: `1px solid rgba(66, 71, 84, 0.2)` }}>
                        +{plan.topics.length - 3}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '24px', textAlign: 'center', borderTop: `1px solid rgba(66, 71, 84, 0.2)`, borderBottom: `1px solid rgba(66, 71, 84, 0.2)`, padding: '12px 0' }}>
                    <div>
                      <div style={{ color: S.text, fontWeight: 700 }}>{plan.problems}</div>
                      <div style={{ color: S.outline, fontSize: '0.625rem', textTransform: 'uppercase', fontWeight: 600, marginTop: '2px' }}>Problems</div>
                    </div>
                    <div style={{ borderLeft: `1px solid rgba(66, 71, 84, 0.2)`, borderRight: `1px solid rgba(66, 71, 84, 0.2)` }}>
                      <div style={{ color: S.text, fontWeight: 700 }}>{plan.duration}</div>
                      <div style={{ color: S.outline, fontSize: '0.625rem', textTransform: 'uppercase', fontWeight: 600, marginTop: '2px' }}>Duration</div>
                    </div>
                    <div>
                      <div style={{ color: S.text, fontWeight: 700 }}>{plan.enrolledStr || plan.enrolled}</div>
                      <div style={{ color: S.outline, fontSize: '0.625rem', textTransform: 'uppercase', fontWeight: 600, marginTop: '2px' }}>Enrolled</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStart(plan)}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.3s', cursor: 'pointer',
                      background: isHovered ? `linear-gradient(135deg, ${plan.color || S.primary}, ${plan.color || S.primary}cc)` : 'transparent',
                      border: `1px solid ${isHovered ? 'transparent' : (plan.color || S.primary) + '50'}`,
                      color: isHovered ? '#000' : (plan.color || S.primary),
                      textShadow: isHovered ? '0 1px 2px rgba(255,255,255,0.3)' : 'none'
                    }}
                  >
                    {isHovered ? 'Start Plan 🚀' : 'View Details'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
