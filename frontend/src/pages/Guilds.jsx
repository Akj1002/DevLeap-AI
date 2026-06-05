import React, { useState, useEffect } from 'react';
import axios from 'axios';

const S = {
  bg: '#131319',
  surface: '#1f1f26',
  surfaceHigh: '#2a2930',
  surfaceHighest: '#35343b',
  surfaceLow: '#1b1b21',
  primary: '#adc6ff',
  primaryCont: '#4d8eff',
  tertiary: '#4ae176',
  text: '#e4e1ea',
  textSub: '#c2c6d6',
  outline: '#8c909f',
  outlineVar: '#424754',
  onPrimary: '#002e6a',
};

const Guilds = () => {
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuilds = async () => {
      try {
        let res = await axios.get('/api/guilds');
        if (res.data.length === 0) {
          await axios.post('/api/guilds/seed/bulk');
          res = await axios.get('/api/guilds');
        }
        setGuilds(res.data);
      } catch (err) {
        console.error("Failed to fetch guilds", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGuilds();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, padding: '100px 4% 40px 4%', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, margin: '0 0 16px 0', background: `linear-gradient(90deg, ${S.primary}, ${S.tertiary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Developer Guilds</h1>
          <p style={{ color: S.outline, fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>Join a clan, pool your XP, conquer weekly quests, and dominate the global leaderboard.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
          
          {/* Main Guild List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Top Guilds</h2>
              <button style={{ background: S.surfaceHigh, color: S.text, border: `1px solid ${S.outlineVar}`, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Create Guild</button>
            </div>
            
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: S.outline }}>Loading Guilds...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {guilds.map((guild, index) => (
                  <div key={guild._id} style={{ background: S.surface, borderRadius: '16px', border: `1px solid ${S.surfaceHigh}`, padding: '24px', display: 'flex', gap: '24px', alignItems: 'center', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateX(8px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                    
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : S.outlineVar, width: '30px', textAlign: 'center' }}>
                      #{index + 1}
                    </div>

                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: S.surfaceHigh, border: `1px solid ${S.outlineVar}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                      {guild.emblem}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>{guild.name}</h3>
                        <span style={{ background: `${S.primary}20`, color: S.primary, padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>Lv. {guild.level}</span>
                      </div>
                      <p style={{ margin: 0, color: S.textSub, fontSize: '0.9rem' }}>{guild.description}</p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: S.tertiary, marginBottom: '4px' }}>{guild.totalXP.toLocaleString()} XP</div>
                      <div style={{ color: S.outline, fontSize: '0.8rem' }}>{guild.members?.length || 1} Members</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div style={{ background: S.surface, borderRadius: '16px', border: `1px solid ${S.surfaceHigh}`, padding: '24px', position: 'sticky', top: '100px' }}>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', fontWeight: 800 }}>Weekly Global Quests</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Solve 100 Hard DSA</span>
                    <span style={{ fontSize: '0.9rem', color: S.tertiary }}>+10,000 XP</span>
                  </div>
                  <div style={{ height: '8px', background: S.surfaceHighest, borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '45%', height: '100%', background: S.tertiary, borderRadius: '4px' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: S.outline, marginTop: '4px', textAlign: 'right' }}>45 / 100</div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Win 50 Team Code Races</span>
                    <span style={{ fontSize: '0.9rem', color: S.tertiary }}>+25,000 XP</span>
                  </div>
                  <div style={{ height: '8px', background: S.surfaceHighest, borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '12%', height: '100%', background: S.tertiary, borderRadius: '4px' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: S.outline, marginTop: '4px', textAlign: 'right' }}>6 / 50</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Guilds;
