import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const S = {
  bg: '#050505', surface: '#0d0d0d', surfaceHigh: '#161616', surfaceHighest: '#202020',
  primary: '#eab308', primaryGlow: 'rgba(234,179,8,0.1)',
  secondary: '#f97316', green: '#22c55e', amber: '#eab308', red: '#ef4444', blue: '#3b82f6',
  text: '#f8fafc', textSub: '#94a3b8', outline: '#262626',
};

const CATEGORIES = ['all', 'Frontend', 'Backend', 'DevOps', 'Data Science', 'Mobile', 'AI/ML'];

function RoadmapNode({ node, isCompleted, isUnlocked, onClick }) {
  const [hovered, setHovered] = useState(false);
  
  const statusColor = isCompleted ? S.green : isUnlocked ? S.primary : S.textSub;
  const bgColor = isCompleted ? `${S.green}15` : isUnlocked ? S.surfaceHigh : S.surface;
  const borderColor = hovered ? (isCompleted ? S.green : isUnlocked ? S.primary : S.textSub) : (isCompleted ? S.green : isUnlocked ? S.outline : S.outline);
  const opacity = isUnlocked ? 1 : 0.5;

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => isUnlocked && onClick(node)}
      style={{
        position: 'relative', background: bgColor, borderRadius: '16px', border: `2px solid ${borderColor}`,
        padding: '20px', transition: 'all 0.2s', cursor: isUnlocked ? 'pointer' : 'not-allowed',
        opacity, transform: hovered && isUnlocked ? 'translateY(-3px)' : 'none',
        boxShadow: hovered && isUnlocked ? `0 10px 30px ${statusColor}15` : 'none',
        width: '300px', zIndex: 2
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <h4 style={{ color: S.text, fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>{node.title}</h4>
        {isCompleted && <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: S.green, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '0.8rem', fontWeight: 800 }}>✓</div>}
        {!isCompleted && !isUnlocked && <div style={{ fontSize: '1.2rem', color: S.textSub }}>🔒</div>}
      </div>
      <p style={{ color: S.textSub, fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 14px' }}>{node.description}</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: S.textSub, fontSize: '0.72rem', fontWeight: 600 }}>{node.resources?.length || 0} RESOURCES</span>
        <span style={{ color: S.amber, fontSize: '0.72rem', fontWeight: 700 }}>+{node.xpReward || 50} XP</span>
      </div>
    </div>
  );
}

function RoadmapPath({ roadmap, userProgress, onCompleteNode }) {
  const [selectedNode, setSelectedNode] = useState(null);

  const isNodeCompleted = (nodeId) => userProgress.completedNodes.includes(nodeId);
  const isNodeUnlocked = (node) => {
    if ((node.dependsOn || []).length === 0) return true;
    return node.dependsOn.every(depId => isNodeCompleted(depId));
  };

  // Basic layout calculation (assuming roughly linear or simple branching)
  const nodesByLevel = {};
  roadmap.nodes.forEach(n => {
    let level = 0;
    if (n.dependsOn && n.dependsOn.length > 0) {
      const parentLevels = n.dependsOn.map(depId => {
        const p = roadmap.nodes.find(x => x.id === depId);
        // extremely naive level calc for visual representation
        return p ? 1 : 0; 
      });
      level = Math.max(...parentLevels) + 1;
    }
    // Hacky fix for deep trees without real topological sort in frontend
    // Just relying on order of array if simple
    const idx = roadmap.nodes.indexOf(n);
    const l = Math.floor(idx / 2); // 2 nodes per level max visually
    
    if (!nodesByLevel[l]) nodesByLevel[l] = [];
    nodesByLevel[l].push(n);
  });

  return (
    <div style={{ background: S.surface, borderRadius: '24px', border: `1px solid ${S.outline}`, padding: '40px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span style={{ background: S.primaryGlow, color: S.primary, fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '8px', marginBottom: '12px', display: 'inline-block' }}>{roadmap.category}</span>
        <h2 style={{ color: S.text, fontWeight: 800, fontSize: '2rem', margin: '0 0 12px' }}>{roadmap.title}</h2>
        <p style={{ color: S.textSub, fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>{roadmap.description}</p>
        
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: S.text, fontWeight: 800, fontSize: '1.5rem' }}>{userProgress.completedNodes.length} / {roadmap.nodes.length}</div>
            <div style={{ color: S.textSub, fontSize: '0.75rem', fontWeight: 600 }}>COMPLETED</div>
          </div>
          <div style={{ width: '1px', background: S.outline }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: S.primary, fontWeight: 800, fontSize: '1.5rem' }}>{Math.round((userProgress.completedNodes.length / roadmap.nodes.length) * 100) || 0}%</div>
            <div style={{ color: S.textSub, fontSize: '0.75rem', fontWeight: 600 }}>PROGRESS</div>
          </div>
        </div>
      </div>

      {/* Visual Roadmap Tree */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', position: 'relative', padding: '20px 0' }}>
        {/* Background connecting line */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '4px', background: S.outline, transform: 'translateX(-50%)', zIndex: 1 }} />
        <div style={{ position: 'absolute', top: 0, height: `${(userProgress.completedNodes.length / roadmap.nodes.length) * 100}%`, left: '50%', width: '4px', background: S.primary, transform: 'translateX(-50%)', zIndex: 1, transition: 'height 0.5s ease' }} />

        {Object.keys(nodesByLevel).sort().map(level => (
          <div key={level} style={{ display: 'flex', gap: '40px', justifyContent: 'center', width: '100%', position: 'relative', zIndex: 2 }}>
            {nodesByLevel[level].map(node => (
              <RoadmapNode key={node.id} node={node} isCompleted={isNodeCompleted(node.id)} isUnlocked={isNodeUnlocked(node)} onClick={setSelectedNode} />
            ))}
          </div>
        ))}
      </div>

      {/* Node Detail Modal */}
      {selectedNode && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: S.surfaceHighest, border: `1px solid ${S.outline}`, borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '600px', position: 'relative' }}>
            <button onClick={() => setSelectedNode(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: S.surfaceHigh, border: 'none', color: S.textSub, borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer' }}>✕</button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              {isNodeCompleted(selectedNode.id) && <div style={{ background: 'rgba(34,197,94,0.15)', color: S.green, padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>✓ COMPLETED</div>}
              <div style={{ background: 'rgba(234,179,8,0.15)', color: S.primary, padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>⭐ +{selectedNode.xpReward} XP</div>
            </div>

            <h3 style={{ color: S.text, fontWeight: 800, fontSize: '1.5rem', margin: '0 0 12px' }}>{selectedNode.title}</h3>
            <p style={{ color: S.textSub, fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 24px' }}>{selectedNode.description}</p>

            <h4 style={{ color: S.text, fontWeight: 700, fontSize: '1rem', margin: '0 0 12px' }}>📚 Learning Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
              {(selectedNode.resources || []).map((res, i) => (
                <a key={i} href={res.url} target="_blank" rel="noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: S.surface, border: `1px solid ${S.outline}`, padding: '14px 16px', borderRadius: '12px', textDecoration: 'none', transition: 'border-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = S.primary} onMouseLeave={e => e.currentTarget.style.borderColor = S.outline}>
                  <span style={{ color: S.text, fontWeight: 600, fontSize: '0.9rem' }}>{res.title}</span>
                  <span style={{ color: S.textSub, fontSize: '0.75rem', background: S.surfaceHigh, padding: '4px 8px', borderRadius: '6px' }}>{res.type}</span>
                </a>
              ))}
            </div>

            {!isNodeCompleted(selectedNode.id) ? (
              <button onClick={() => { onCompleteNode(selectedNode.id); setSelectedNode(null); }} style={{ width: '100%', padding: '16px', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', background: `linear-gradient(135deg, ${S.green}, #16a34a)`, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Mark as Completed (+{selectedNode.xpReward} XP)
              </button>
            ) : (
              <div style={{ textAlign: 'center', color: S.green, fontWeight: 700, padding: '16px', background: 'rgba(34,197,94,0.05)', borderRadius: '12px', border: `1px solid rgba(34,197,94,0.2)` }}>
                Great job! You've mastered this topic.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Roadmaps() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [userProgress, setUserProgress] = useState({ completedNodes: [] });
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const user = JSON.parse(localStorage.getItem('user') || '{}');



  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        let res = await axios.get('/api/roadmaps');
        if (res.data.length === 0) {
           await axios.post('/api/roadmaps/seed/bulk');
           res = await axios.get('/api/roadmaps');
        }
        setRoadmaps(res.data);
      } catch (err) {
        console.error("Failed to fetch roadmaps", err);
        setRoadmaps([]);
      } finally {
        const saved = localStorage.getItem(`roadmap_prog_${user._id}`);
        if (saved) {
          setUserProgress(JSON.parse(saved));
        } else {
          setUserProgress({ completedNodes: [] });
        }
        setLoading(false);
      }
    };
    fetchRoadmaps();
  }, [user._id]);

  const handleCompleteNode = (nodeId) => {
    const newProg = { ...userProgress, completedNodes: [...userProgress.completedNodes, nodeId] };
    setUserProgress(newProg);
    localStorage.setItem(`roadmap_prog_${user._id}`, JSON.stringify(newProg));
    toast.success('🎉 Node completed! XP awarded.');
  };

  if (activeRoadmap) {
    return (
      <div style={{ minHeight: '100vh', background: S.bg, paddingTop: '88px', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); *{box-sizing:border-box;}`}</style>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          <button onClick={() => setActiveRoadmap(null)} style={{ background: 'none', border: 'none', color: S.textSub, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px', fontFamily: 'inherit' }}>
            ← Back to Roadmaps
          </button>
          <RoadmapPath roadmap={activeRoadmap} userProgress={userProgress} onCompleteNode={handleCompleteNode} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, paddingTop: '88px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); *{box-sizing:border-box;}`}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px' }}>
        {/* HERO */}
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, margin: '0 0 16px', background: `linear-gradient(135deg, ${S.text}, ${S.primary}, ${S.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Developer Roadmaps
          </h1>
          <p style={{ color: S.textSub, fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            Structured learning paths to guide your career. Step by step.
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)} style={{ padding: '8px 16px', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 600, border: `1px solid ${category === c ? S.primary : S.outline}`, cursor: 'pointer', background: category === c ? S.primaryGlow : 'transparent', color: category === c ? S.primary : S.textSub, fontFamily: 'inherit' }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* LIST */}
        {loading ? (
          <div style={{ textAlign: 'center', color: S.textSub, padding: '40px' }}>Loading roadmaps...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {roadmaps.filter(r => category === 'all' || r.category === category).map(r => (
              <div key={r._id} onClick={() => setActiveRoadmap(r)} style={{ background: S.surface, borderRadius: '20px', border: `1px solid ${S.outline}`, padding: '28px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = S.primary; e.currentTarget.style.transform = 'translateY(-4px)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = S.outline; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ background: S.primaryGlow, color: S.primary, fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', display: 'inline-block', marginBottom: '12px' }}>{r.category}</div>
                <h3 style={{ color: S.text, fontWeight: 800, fontSize: '1.3rem', margin: '0 0 10px' }}>{r.title}</h3>
                <p style={{ color: S.textSub, fontSize: '0.85rem', lineHeight: 1.6, margin: '0 0 20px' }}>{r.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: S.textSub, fontSize: '0.8rem', fontWeight: 600 }}>{r.nodes.length} Topics</span>
                  <span style={{ color: S.primary, fontSize: '0.8rem', fontWeight: 700 }}>Start Path →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
