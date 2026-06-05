import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const DSASheets = () => {
    const navigate = useNavigate();
    
    // Core Data States
    const [problems, setProblems] = useState([]);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // UI States
    const [activeView, setActiveView] = useState('database'); // 'roadmap' or 'database'
    const [selectedProblem, setSelectedProblem] = useState(null);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('All');
    const [topicFilter, setTopicFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        const initializePlatform = async () => {
            try {
                const probRes = await axios.get('/api/questions');
                setProblems(probRes.data);

                let currentUserId = localStorage.getItem('devleap_user_id');
                if (!currentUserId) {
                    const initRes = await axios.post('/api/users/init');
                    currentUserId = initRes.data.user._id;
                    localStorage.setItem('devleap_user_id', currentUserId);
                }

                const userRes = await axios.get(`/api/users/${currentUserId}/progress`);
                setUserData(userRes.data);
                
                if (probRes.data.length > 0) {
                    setSelectedProblem(probRes.data[0]);
                }
            } catch (err) {
                console.error("Initialization failed:", err);
            } finally {
                setLoading(false);
            }
        };
        initializePlatform();
    }, []);

    // Helper: Safely get unique topics for the database filter dropdown
    const getUniqueTopics = () => {
        const allTopics = problems.flatMap(p => {
            if (!p.topics) return [];
            return Array.isArray(p.topics) ? p.topics : String(p.topics).split(',');
        });
        return ['All', ...new Set(allTopics.map(t => t.trim()))].filter(Boolean);
    };
    const uniqueTopics = getUniqueTopics();

    // Helper: Check if solved
    const isSolved = (questionId) => {
        if (!userData || !userData.history) return false;
        return userData.history.some(h => h.questionId && h.questionId._id === questionId);
    };

    const filteredProblems = problems.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDifficulty = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
        
        const pTopicsStr = Array.isArray(p.topics) ? p.topics.join(' ').toLowerCase() : String(p.topics || '').toLowerCase();
        const matchesTopic = topicFilter === 'All' || pTopicsStr.includes(topicFilter.toLowerCase());
        
        const solved = isSolved(p._id);
        const matchesStatus = statusFilter === 'All' || (statusFilter === 'Solved' && solved) || (statusFilter === 'Unsolved' && !solved);

        return matchesSearch && matchesDifficulty && matchesTopic && matchesStatus;
    });

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: S.bg, color: S.text, fontFamily: 'system-ui' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: `4px solid ${S.surfaceHigh}`, borderTopColor: S.primary, animation: 'spin 1s linear infinite' }} />
                <div style={{ fontWeight: 600, letterSpacing: 1 }}>Initializing Platform Engine...</div>
            </div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const totalProblems = problems.length > 0 ? problems.length : 3549;
    const totalSolved = userData ? userData.totalSolved : 0;
    const progressPercentage = totalProblems > 0 ? Math.min((totalSolved / totalProblems) * 100, 100).toFixed(1) : 0;

    return (
        <div style={{ 
            padding: '90px 4% 40px 4%', 
            minHeight: '100vh', 
            background: S.bg, 
            fontFamily: 'Inter, system-ui, sans-serif',
            color: S.text,
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
        }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>DSA Tracker</h1>
                <div style={{ display: 'flex', background: S.surfaceHigh, borderRadius: '12px', padding: '4px' }}>
                    <button onClick={() => setActiveView('roadmap')} style={{ background: activeView === 'roadmap' ? S.primary : 'transparent', color: activeView === 'roadmap' ? S.bg : S.outline, border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}>Guided Roadmap</button>
                    <button onClick={() => setActiveView('database')} style={{ background: activeView === 'database' ? S.primary : 'transparent', color: activeView === 'database' ? S.bg : S.outline, border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}>Full Database</button>
                </div>
            </div>

            {/* MAIN 3-COLUMN LAYOUT */}
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 400px', gap: '24px', height: 'calc(100vh - 180px)', minHeight: '600px' }}>
                
                {/* COLUMN 1: FILTERS */}
                <div style={{ background: S.surface, borderRadius: '16px', border: `1px solid ${S.surfaceHigh}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: `1px solid ${S.surfaceHigh}` }}>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Filters</h2>
                    </div>
                    
                    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', flex: 1 }}>
                        {/* Status Filter */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: S.outlineVar, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Status</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {['All', 'Solved', 'Unsolved'].map(status => (
                                    <label key={status} onClick={() => setStatusFilter(status)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.95rem', color: statusFilter === status ? S.text : S.outline }}>
                                        <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: `2px solid ${statusFilter === status ? S.primary : S.outlineVar}`, background: statusFilter === status ? S.primary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                                            {statusFilter === status && <div style={{ width: '10px', height: '10px', background: S.bg, borderRadius: '2px' }} />}
                                        </div>
                                        {status}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Difficulty Filter */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: S.outlineVar, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Difficulty</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
                                    <label key={diff} onClick={() => setDifficultyFilter(diff)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.95rem', color: difficultyFilter === diff ? S.text : S.outline }}>
                                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${difficultyFilter === diff ? (diff==='Easy'?S.tertiary:diff==='Medium'?'#f59e0b':diff==='Hard'?S.error:S.primary) : S.outlineVar}`, background: difficultyFilter === diff ? (diff==='Easy'?S.tertiary:diff==='Medium'?'#f59e0b':diff==='Hard'?S.error:S.primary) : 'transparent', transition: 'all 0.2s' }}></div>
                                        {diff}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Tags Filter */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: S.outlineVar, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Tags</label>
                            <select value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: S.surfaceHigh, border: `1px solid ${S.outlineVar}`, color: S.text, outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                                {uniqueTopics.map((topic, idx) => <option key={idx} value={topic}>{topic}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Overall Progress Bottom Widget */}
                    <div style={{ padding: '24px', borderTop: `1px solid ${S.surfaceHigh}`, background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: S.outline, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', textAlign: 'center' }}>Overall Progress</div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                            <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                                    <circle cx="60" cy="60" r="54" fill="none" stroke={S.surfaceHigh} strokeWidth="12" />
                                    <circle cx="60" cy="60" r="54" fill="none" stroke={S.primary} strokeWidth="12" strokeLinecap="round" strokeDasharray="339.29" strokeDashoffset={339.29 - (339.29 * progressPercentage) / 100} style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                                </svg>
                                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.8rem', fontWeight: 800, color: S.text }}>{totalSolved}</span>
                                    <span style={{ fontSize: '0.75rem', color: S.outline }}>/ {totalProblems}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', width: '100%', justifyContent: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: S.tertiary }} /><span style={{ fontSize: '0.8rem', color: S.outlineVar }}>Easy</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} /><span style={{ fontSize: '0.8rem', color: S.outlineVar }}>Med</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: S.error }} /><span style={{ fontSize: '0.8rem', color: S.outlineVar }}>Hard</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMN 2: PROBLEM LIST */}
                <div style={{ background: S.surface, borderRadius: '16px', border: `1px solid ${S.surfaceHigh}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    
                    {/* Header & Search */}
                    <div style={{ padding: '20px 24px', borderBottom: `1px solid ${S.surfaceHigh}` }}>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: S.outline, fontSize: '1.2rem' }}>🔍</span>
                            <input 
                                type="text" 
                                placeholder="Search problems..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', background: S.surfaceHigh, border: 'none', color: S.text, outline: 'none', fontSize: '0.95rem', fontFamily: 'inherit' }} 
                            />
                        </div>
                    </div>

                    {/* List Items */}
                    <div style={{ overflowY: 'auto', flex: 1, padding: '12px' }}>
                        {activeView === 'roadmap' ? (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: S.outline }}>
                                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🗺️</div>
                                <h3 style={{ margin: '0 0 10px 0', color: S.text }}>Guided Roadmap</h3>
                                <p style={{ lineHeight: 1.6, maxWidth: '300px', margin: '0 auto' }}>Switch to the Full Database to see the new grid view. Roadmap view is currently being redesigned.</p>
                                <button onClick={() => setActiveView('database')} style={{ marginTop: '20px', background: S.surfaceHigh, color: S.text, border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Go to Database</button>
                            </div>
                        ) : filteredProblems.length === 0 ? (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: S.outlineVar }}>No problems match your filters.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {filteredProblems.map((p, index) => {
                                    const solved = isSolved(p._id);
                                    const isSelected = selectedProblem && selectedProblem._id === p._id;
                                    const diffColor = p.difficulty === 'Hard' ? S.error : p.difficulty === 'Medium' ? '#f59e0b' : S.tertiary;

                                    return (
                                        <div 
                                            key={p._id} 
                                            onClick={() => setSelectedProblem(p)}
                                            style={{ 
                                                padding: '16px', 
                                                borderRadius: '12px', 
                                                display: 'flex', 
                                                alignItems: 'flex-start', 
                                                gap: '16px', 
                                                background: isSelected ? 'rgba(173,198,255,0.06)' : 'transparent', 
                                                border: `1px solid ${isSelected ? 'rgba(173,198,255,0.15)' : 'transparent'}`, 
                                                cursor: 'pointer', 
                                                transition: 'all 0.2s' 
                                            }}
                                            onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                                            onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background = 'transparent' }}
                                        >
                                            <div style={{ 
                                                width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                                                background: solved ? `${S.tertiary}20` : S.surfaceHigh, 
                                                border: `1px solid ${solved ? S.tertiary : S.outlineVar}`, 
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.tertiary, fontSize: '0.8rem' 
                                            }}>
                                                {solved && '✓'}
                                            </div>
                                            
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '1rem', fontWeight: 700, color: isSelected ? S.primary : S.text, marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {index + 1}. {p.title}
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    <span style={{ color: diffColor, fontSize: '0.75rem', fontWeight: 700 }}>{p.difficulty}</span>
                                                    {p.topics && Array.isArray(p.topics) && p.topics.slice(0, 3).map((t, i) => (
                                                        <React.Fragment key={i}>
                                                            <span style={{ color: S.outlineVar, fontSize: '0.75rem' }}>•</span>
                                                            <span style={{ color: S.outline, fontSize: '0.75rem' }}>{t}</span>
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMN 3: PROBLEM DETAILS / PREVIEW */}
                <div style={{ background: S.surface, borderRadius: '16px', border: `1px solid ${S.surfaceHigh}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {selectedProblem ? (
                        <>
                            <div style={{ padding: '24px', borderBottom: `1px solid ${S.surfaceHigh}` }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: S.outline, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Practice</div>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: S.text, lineHeight: 1.3 }}>{selectedProblem.title}</h2>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', alignItems: 'center' }}>
                                    <span style={{ background: selectedProblem.difficulty === 'Hard' ? `${S.error}15` : selectedProblem.difficulty === 'Medium' ? 'rgba(245,158,11,0.15)' : `${S.tertiary}15`, color: selectedProblem.difficulty === 'Hard' ? S.error : selectedProblem.difficulty === 'Medium' ? '#f59e0b' : S.tertiary, padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>{selectedProblem.difficulty}</span>
                                    <span style={{ color: S.outlineVar, fontSize: '0.85rem' }}>{selectedProblem.topics?.[0] || 'Algorithm'}</span>
                                </div>
                            </div>
                            
                            <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {/* Description Preview */}
                                <div>
                                    <h3 style={{ fontSize: '0.9rem', color: S.outline, fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</h3>
                                    <p style={{ fontSize: '0.95rem', color: S.textSub, lineHeight: 1.6, margin: 0 }}>
                                        {selectedProblem.description 
                                            ? (selectedProblem.description.length > 150 ? selectedProblem.description.substring(0, 150) + '...' : selectedProblem.description) 
                                            : "Given an array of integers and a target value, return the indices of the two numbers that add up to the target. You may assume each input has exactly one solution."}
                                    </p>
                                </div>

                                {/* Code Editor Mock */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '0.9rem', color: S.outline, fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Code Environment</h3>
                                    <div style={{ flex: 1, background: S.bg, borderRadius: '12px', border: `1px solid ${S.surfaceHigh}`, padding: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: S.outlineVar }} />
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: S.outlineVar }} />
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: S.outlineVar }} />
                                        </div>
                                        <pre style={{ margin: 0, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', color: S.textSub, lineHeight: 1.6, overflow: 'hidden' }}>
<span style={{ color: '#c678dd' }}>class</span> <span style={{ color: '#e5c07b' }}>Solution</span>:
    <span style={{ color: '#c678dd' }}>def</span> <span style={{ color: '#61afef' }}>solve</span>(<span style={{ color: '#d19a66' }}>self</span>, data):
        <span style={{ color: S.outlineVar }}># Write your code here</span>
        <span style={{ color: '#c678dd' }}>pass</span>
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '24px', borderTop: `1px solid ${S.surfaceHigh}` }}>
                                <button 
                                    onClick={() => navigate(`/workspace/${selectedProblem._id}`)}
                                    style={{ 
                                        width: '100%', padding: '16px', borderRadius: '12px', 
                                        background: S.primary, color: S.bg, 
                                        border: 'none', fontWeight: 800, fontSize: '1rem', 
                                        cursor: 'pointer', transition: 'all 0.2s',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                >
                                    Open Editor <span>→</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', textAlign: 'center', color: S.outlineVar }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👈</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Select a problem</div>
                            <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Click on any problem from the list to preview details and start solving.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default DSASheets;