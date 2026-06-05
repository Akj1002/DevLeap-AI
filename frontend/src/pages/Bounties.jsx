import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
};

const Bounties = () => {
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchBounties = async () => {
      try {
        let res = await axios.get('/api/bounties');
        if (res.data.length === 0) {
          await axios.post('/api/bounties/seed/bulk');
          res = await axios.get('/api/bounties');
        }
        setBounties(res.data);
      } catch (err) {
        console.error("Failed to fetch bounties", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBounties();
  }, []);

  const filteredBounties = bounties.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, padding: '100px 4% 40px 4%', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 10px 0' }}>Freelance Bounties</h1>
            <p style={{ color: S.outline, margin: 0, fontSize: '1.1rem' }}>Solve real issues, build your portfolio, and earn cash.</p>
          </div>
          <button style={{ background: S.primary, color: S.onPrimary, border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>+</span> Post a Bounty
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <input 
            type="text" 
            placeholder="Search bounties or tags..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '16px', borderRadius: '12px', background: S.surface, border: `1px solid ${S.surfaceHigh}`, color: S.text, outline: 'none' }}
          />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '16px', borderRadius: '12px', background: S.surface, border: `1px solid ${S.surfaceHigh}`, color: S.text, outline: 'none', minWidth: '150px' }}
          >
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Review">Under Review</option>
          </select>
        </div>

        {/* Board */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: S.outline }}>Loading bounties...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            {filteredBounties.map(bounty => (
              <div key={bounty._id} style={{ background: S.surface, borderRadius: '16px', border: `1px solid ${S.surfaceHigh}`, padding: '24px', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 10px 20px rgba(0,0,0,0.2)` }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: bounty.status === 'Open' ? `${S.tertiary}20` : `${S.outline}20`, color: bounty.status === 'Open' ? S.tertiary : S.outline }}>
                    {bounty.status}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: S.tertiary }}>
                    ${bounty.rewardAmount}
                  </div>
                </div>
                
                <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', fontWeight: 700, color: S.text }}>{bounty.title}</h3>
                <p style={{ color: S.textSub, fontSize: '0.9rem', lineHeight: 1.5, flex: 1, margin: '0 0 20px 0' }}>{bounty.description}</p>
                
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                  {bounty.tags.map((tag, idx) => (
                    <span key={idx} style={{ background: S.surfaceHigh, color: S.outline, padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem' }}>{tag}</span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: `1px solid ${S.surfaceHigh}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: S.primaryCont, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: S.text }}>
                      {bounty.postedBy.charAt(0)}
                    </div>
                    <span style={{ color: S.outline, fontSize: '0.8rem' }}>{bounty.postedBy}</span>
                  </div>
                  <button style={{ background: bounty.status === 'Open' ? S.surfaceHighest : 'transparent', border: `1px solid ${bounty.status === 'Open' ? S.primary : S.outlineVar}`, color: bounty.status === 'Open' ? S.primary : S.outline, padding: '6px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: bounty.status === 'Open' ? 'pointer' : 'not-allowed' }}>
                    {bounty.status === 'Open' ? 'Bid Now' : 'Closed'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bounties;
