import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const S = {
  bg: '#050505', surface: '#0d0d0d', surfaceHigh: '#151515', surfaceHighest: '#202020',
  primary: '#e11d48', primaryGlow: 'rgba(225,29,72,0.1)',
  secondary: '#f43f5e', amber: '#fbbf24', green: '#22c55e', blue: '#3b82f6',
  text: '#f8fafc', textSub: '#94a3b8', outline: '#262626',
};

const TIERS = ['all', 'Tier 1', 'Tier 2', 'Tier 3', 'Startup'];
const DOMAINS = ['all', 'Fintech', 'E-commerce', 'SaaS', 'AI/ML', 'Healthtech', 'Edtech', 'Crypto'];

function CompanyCard({ company, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => onClick(company)}
      style={{
        background: S.surface, borderRadius: '16px', border: `1px solid ${hovered ? S.primary : S.outline}`,
        padding: '24px', cursor: 'pointer', transition: 'all 0.2s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? `0 12px 32px rgba(225,29,72,0.15)` : 'none',
      }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
        <img src={company.logo || `https://ui-avatars.com/api/?name=${company.name}&background=151515&color=e11d48&size=64`} alt={company.name}
          style={{ width: '56px', height: '56px', borderRadius: '12px', background: S.surfaceHigh, border: `1px solid ${S.outline}` }} />
        <div>
          <h3 style={{ color: S.text, fontWeight: 800, fontSize: '1.2rem', margin: '0 0 4px' }}>{company.name}</h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ background: S.primaryGlow, color: S.primary, fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>{company.tier}</span>
            <span style={{ background: S.surfaceHigh, color: S.textSub, fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>{company.domain}</span>
          </div>
        </div>
      </div>

      <p style={{ color: S.textSub, fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{company.description}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {[
          { l: 'Avg Comp', v: `$${company.avgComp}k`, c: S.green },
          { l: 'WLB Rating', v: `${company.wlbRating}/5`, c: S.amber },
          { l: 'Interview', v: company.interviewDifficulty, c: S.blue }
        ].map(s => (
          <div key={s.l} style={{ background: S.surfaceHigh, borderRadius: '8px', padding: '10px 6px', textAlign: 'center' }}>
            <div style={{ color: s.c, fontWeight: 800, fontSize: '0.9rem' }}>{s.v}</div>
            <div style={{ color: S.textSub, fontSize: '0.65rem', marginTop: '2px', fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompanyDetailModal({ company, onClose }) {
  const [tab, setTab] = useState('overview');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }}>
      <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '24px', width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: S.surfaceHigh, border: 'none', color: S.textSub, borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', zIndex: 10 }}>✕</button>
        
        {/* Header */}
        <div style={{ padding: '32px 32px 24px', borderBottom: `1px solid ${S.outline}`, background: `linear-gradient(135deg, rgba(225,29,72,0.1), transparent)` }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <img src={company.logo || `https://ui-avatars.com/api/?name=${company.name}&background=151515&color=e11d48&size=100`} alt={company.name}
              style={{ width: '80px', height: '80px', borderRadius: '16px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, boxShadow: `0 8px 24px rgba(0,0,0,0.4)` }} />
            <div>
              <h2 style={{ color: S.text, fontWeight: 800, fontSize: '2rem', margin: '0 0 8px' }}>{company.name}</h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <span style={{ background: S.primaryGlow, color: S.primary, fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '6px' }}>{company.tier}</span>
                <span style={{ background: S.surfaceHigh, color: S.textSub, fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '6px' }}>{company.domain}</span>
                <span style={{ background: 'rgba(34,197,94,0.1)', color: S.green, fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '6px' }}>📍 {company.headquarters || 'Global'}</span>
              </div>
              <p style={{ color: S.textSub, fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{company.description}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', padding: '0 32px', borderBottom: `1px solid ${S.outline}` }}>
          {['overview', 'compensation', 'interviews', 'culture'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '16px 24px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t ? S.primary : 'transparent'}`, color: tab === t ? S.primary : S.textSub, fontWeight: 700, fontSize: '0.85rem', textTransform: 'capitalize', cursor: 'pointer', fontFamily: 'inherit' }}>
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
          {tab === 'overview' && (
            <div style={{ display: 'grid', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                {[
                  { l: 'Average Total Comp', v: `$${company.avgComp}k`, c: S.green },
                  { l: 'Work-Life Balance', v: `${company.wlbRating}/5`, c: S.amber },
                  { l: 'Career Growth', v: `${company.growthRating || '4.2'}/5`, c: S.blue },
                  { l: 'Interview Difficulty', v: company.interviewDifficulty, c: S.primary }
                ].map(s => (
                  <div key={s.l} style={{ background: S.surfaceHigh, borderRadius: '12px', padding: '16px', border: `1px solid ${S.outline}` }}>
                    <div style={{ color: s.c, fontWeight: 800, fontSize: '1.2rem', marginBottom: '4px' }}>{s.v}</div>
                    <div style={{ color: S.textSub, fontSize: '0.75rem', fontWeight: 600 }}>{s.l}</div>
                  </div>
                ))}
              </div>

              <div>
                <h4 style={{ color: S.text, fontWeight: 700, fontSize: '1.1rem', margin: '0 0 12px' }}>Tech Stack</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(company.techStack || ['React', 'Node.js', 'Go', 'AWS', 'Kubernetes']).map(t => (
                    <span key={t} style={{ background: S.surfaceHigh, color: S.textSub, fontSize: '0.8rem', padding: '6px 12px', borderRadius: '8px', border: `1px solid ${S.outline}` }}>{t}</span>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ color: S.text, fontWeight: 700, fontSize: '1.1rem', margin: '0 0 12px' }}>Benefits & Perks</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {(company.perks || ['Remote Friendly', 'Comprehensive Health', '401k Match', 'Free Meals']).map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: S.textSub, fontSize: '0.85rem' }}>
                      <span style={{ color: S.green }}>✓</span> {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'compensation' && (
            <div>
              <p style={{ color: S.textSub, marginBottom: '24px' }}>Note: Compensation figures are estimated averages based on user reports.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { level: 'Entry Level (L3)', base: 130, stock: 40, bonus: 15, total: 185 },
                  { level: 'Mid Level (L4)', base: 160, stock: 80, bonus: 25, total: 265 },
                  { level: 'Senior (L5)', base: 200, stock: 150, bonus: 40, total: 390 },
                  { level: 'Staff (L6)', base: 240, stock: 250, bonus: 60, total: 550 },
                ].map((l, i) => (
                  <div key={i} style={{ background: S.surfaceHigh, borderRadius: '12px', padding: '20px', border: `1px solid ${S.outline}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ color: S.text, fontWeight: 700, fontSize: '1.1rem' }}>{l.level}</div>
                      <div style={{ color: S.green, fontWeight: 800, fontSize: '1.2rem' }}>${l.total}k</div>
                    </div>
                    <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', marginBottom: '12px' }}>
                      <div style={{ width: `${(l.base/l.total)*100}%`, background: S.blue }} title={`Base: $${l.base}k`} />
                      <div style={{ width: `${(l.stock/l.total)*100}%`, background: S.primary }} title={`Stock: $${l.stock}k`} />
                      <div style={{ width: `${(l.bonus/l.total)*100}%`, background: S.amber }} title={`Bonus: $${l.bonus}k`} />
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: S.textSub }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', background: S.blue }}/> Base: ${l.base}k</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', background: S.primary }}/> Stock: ${l.stock}k</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', background: S.amber }}/> Bonus: ${l.bonus}k</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'interviews' && (
            <div>
              <div style={{ background: S.surfaceHigh, borderRadius: '12px', padding: '24px', border: `1px solid ${S.outline}`, marginBottom: '24px' }}>
                <h4 style={{ color: S.text, fontWeight: 700, margin: '0 0 16px' }}>Typical Interview Process</h4>
                <div style={{ position: 'relative', paddingLeft: '24px' }}>
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: '7px', width: '2px', background: S.outline }} />
                  {[
                    { title: 'Recruiter Screen', desc: '30 min chat about background and expectations.' },
                    { title: 'Technical Screen', desc: '45-60 min coding round (usually LeetCode Medium/Hard).' },
                    { title: 'Onsite (Virtual)', desc: '4-5 rounds including Coding, System Design, and Behavioral.' },
                    { title: 'Team Matching', desc: 'Conversations with hiring managers to find a mutual fit.' }
                  ].map((step, i) => (
                    <div key={i} style={{ position: 'relative', marginBottom: '20px' }}>
                      <div style={{ position: 'absolute', left: '-24px', top: '4px', width: '16px', height: '16px', borderRadius: '50%', background: S.surfaceHigh, border: `2px solid ${S.primary}`, zIndex: 2 }} />
                      <div style={{ color: S.text, fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>{step.title}</div>
                      <div style={{ color: S.textSub, fontSize: '0.85rem' }}>{step.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'culture' && (
            <div style={{ textAlign: 'center', color: S.textSub, padding: '40px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌱</div>
              <p>Detailed culture reviews and employee testimonials coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState('all');
  const [domain, setDomain] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);



  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        let res = await axios.get('/api/companies');
        if (res.data.length === 0) {
           await axios.post('/api/companies/seed/bulk');
           res = await axios.get('/api/companies');
        }
        setCompanies(res.data);
      } catch (err) {
        console.error("Failed to fetch companies", err);
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(c => {
    if (tier !== 'all' && c.tier !== tier) return false;
    if (domain !== 'all' && c.domain !== domain) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, paddingTop: '88px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); *{box-sizing:border-box;} @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}`}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px' }}>
        {/* HERO */}
        <div style={{ textAlign: 'center', padding: '40px 0 32px' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, margin: '0 0 16px', background: `linear-gradient(135deg, ${S.text}, ${S.primary}, ${S.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Top Tech Companies
          </h1>
          <p style={{ color: S.textSub, fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Explore compensation, culture, and interview processes at top tier tech companies and startups.
          </p>
        </div>

        {/* FILTERS */}
        <div style={{ background: S.surface, border: `1px solid ${S.outline}`, borderRadius: '16px', padding: '16px 20px', marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..." 
              style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
          </div>
          <select value={tier} onChange={e => setTier(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.9rem', fontFamily: 'inherit', cursor: 'pointer' }}>
            {TIERS.map(t => <option key={t} value={t}>{t === 'all' ? 'All Tiers' : t}</option>)}
          </select>
          <select value={domain} onChange={e => setDomain(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.9rem', fontFamily: 'inherit', cursor: 'pointer' }}>
            {DOMAINS.map(d => <option key={d} value={d}>{d === 'all' ? 'All Domains' : d}</option>)}
          </select>
        </div>

        {/* LIST */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ background: S.surface, borderRadius: '16px', height: '280px', backgroundImage: `linear-gradient(90deg, ${S.surface}, ${S.surfaceHigh}, ${S.surface})`, backgroundSize: '200%', animation: 'shimmer 1.5s infinite' }} />)}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: S.textSub }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏢</div>
            <h3 style={{ color: S.text, fontSize: '1.2rem', marginBottom: '8px' }}>No companies found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredCompanies.map(c => <CompanyCard key={c.id} company={c} onClick={setSelectedCompany} />)}
          </div>
        )}
      </div>

      {selectedCompany && <CompanyDetailModal company={selectedCompany} onClose={() => setSelectedCompany(null)} />}
    </div>
  );
}
