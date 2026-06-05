import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const S = {
  bg: '#131319',
  surface: '#1f1f26',
  surfaceHigh: '#2a2930',
  primary: '#adc6ff',
  tertiary: '#4ae176',
  text: '#e4e1ea',
  outline: '#8c909f',
  outlineVar: '#424754',
  onPrimary: '#002e6a',
};

const ICONS = {
  client: '📱',
  lb: '⚖️',
  server: '🌐',
  db: '💾',
  cache: '🧠',
  queue: '📨'
};

const SystemDesign = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Active design state
  const [activeDesign, setActiveDesign] = useState({
    title: 'Untitled Architecture',
    components: [],
    connections: []
  });

  // Drag state
  const [draggingNode, setDraggingNode] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      let res = await axios.get('/api/system-designs');
      if (res.data.length === 0) {
        await axios.post('/api/system-designs/seed/bulk');
        res = await axios.get('/api/system-designs');
      }
      setDesigns(res.data);
      if (res.data.length > 0) {
        setActiveDesign(res.data[0]); // Load first design by default
      }
    } catch (err) {
      console.error("Failed to fetch designs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewArchitecture = () => {
    setActiveDesign({
      title: 'New Architecture ' + Math.floor(Math.random() * 100),
      components: [],
      connections: []
    });
  };

  const handleAddComponent = (type) => {
    const newComponent = {
      id: 'c' + Date.now(),
      type,
      x: 100 + Math.random() * 50,
      y: 100 + Math.random() * 50,
      label: 'New ' + type
    };
    setActiveDesign(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }));
  };

  const handleSaveDesign = async () => {
    try {
      const payload = {
        ...activeDesign,
        authorName: localStorage.getItem('devleap_custom_name') || 'Dev',
      };
      
      const res = await axios.post('/api/system-designs', payload);
      toast.success("Architecture saved successfully!");
      
      // Add to list if new
      if (!activeDesign._id) {
        setDesigns([res.data, ...designs]);
        setActiveDesign(res.data);
      }
    } catch (err) {
      toast.error("Failed to save architecture");
    }
  };

  // --- Dragging Logic ---
  const handlePointerDown = (e, comp) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDraggingNode(comp.id);
  };

  const handlePointerMove = (e) => {
    if (!draggingNode || !canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - offset.x;
    const y = e.clientY - canvasRect.top - offset.y;

    setActiveDesign(prev => ({
      ...prev,
      components: prev.components.map(c => 
        c.id === draggingNode ? { ...c, x, y } : c
      )
    }));
  };

  const handlePointerUp = () => {
    setDraggingNode(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, padding: '90px 4% 40px 4%', fontFamily: 'Inter, system-ui, sans-serif' }}
         onPointerMove={handlePointerMove}
         onPointerUp={handlePointerUp}>
         
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0' }}>Live System Design Whiteboard</h1>
          <p style={{ color: S.outline, margin: 0 }}>Collaborate in real-time, build cloud architectures, and prepare for interviews.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleSaveDesign} style={{ background: S.surfaceHigh, color: S.text, border: `1px solid ${S.outlineVar}`, padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Save Design</button>
          <button onClick={handleNewArchitecture} style={{ background: S.primary, color: S.onPrimary, border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>+ New Architecture</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', height: 'calc(100vh - 200px)' }}>
        
        {/* Sidebar: Public Designs */}
        <div style={{ background: S.surface, borderRadius: '16px', border: `1px solid ${S.surfaceHigh}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: `1px solid ${S.surfaceHigh}` }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Community Designs</h3>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loading ? <div style={{ color: S.outline }}>Loading...</div> : designs.map(d => (
              <div key={d._id} 
                   onClick={() => setActiveDesign(d)}
                   style={{ padding: '12px', background: activeDesign?._id === d._id ? 'rgba(173,198,255,0.1)' : S.surfaceHigh, border: `1px solid ${activeDesign?._id === d._id ? S.primary : 'transparent'}`, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px', color: activeDesign?._id === d._id ? S.primary : S.text }}>{d.title}</div>
                <div style={{ fontSize: '0.8rem', color: S.outline, marginBottom: '8px' }}>by {d.authorName}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: S.outline }}>
                  <span>{d.components?.length || 0} Nodes</span>
                  <span>❤️ {d.likes || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div style={{ background: S.surfaceHigh, borderRadius: '16px', border: `1px solid ${S.surfaceHigh}`, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${S.surface}`, background: S.surfaceLow, display: 'flex', alignItems: 'center', gap: '16px' }}>
             <input 
               value={activeDesign?.title || ''} 
               onChange={(e) => setActiveDesign(prev => ({...prev, title: e.target.value}))}
               style={{ background: 'transparent', border: 'none', color: S.text, fontSize: '1.2rem', fontWeight: 700, outline: 'none', width: '300px' }} 
             />
             <span style={{ color: S.outline, fontSize: '0.9rem' }}>{activeDesign?.components?.length || 0} Components</span>
          </div>

          <div style={{ flex: 1, position: 'relative' }}>
            {/* Toolbar */}
            <div style={{ position: 'absolute', left: '20px', top: '20px', background: S.surface, border: `1px solid ${S.outlineVar}`, borderRadius: '12px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              {Object.keys(ICONS).map(type => (
                <button key={type} 
                        onClick={() => handleAddComponent(type)}
                        title={`Add ${type}`}
                        style={{ width: '40px', height: '40px', background: 'transparent', border: 'none', borderRadius: '8px', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} 
                        onMouseEnter={e => e.currentTarget.style.background=S.surfaceHigh} 
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  {ICONS[type]}
                </button>
              ))}
            </div>

            {/* Canvas */}
            <div ref={canvasRef} style={{ width: '100%', height: '100%', position: 'relative', background: `radial-gradient(${S.outlineVar} 1px, transparent 1px)`, backgroundSize: '20px 20px', cursor: draggingNode ? 'grabbing' : 'default' }}>
              
              {activeDesign?.connections?.map(conn => {
                const src = activeDesign.components.find(c => c.id === conn.source);
                const tgt = activeDesign.components.find(c => c.id === conn.target);
                if (!src || !tgt) return null;
                // Simple SVG line math
                const x1 = src.x + 60; // Approx center
                const y1 = src.y + 20;
                const x2 = tgt.x + 60;
                const y2 = tgt.y + 20;
                return (
                  <svg key={conn.id} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={S.outlineVar} strokeWidth="2" />
                    {conn.label && (
                      <text x={(x1+x2)/2} y={(y1+y2)/2 - 5} fill={S.primary} fontSize="12" textAnchor="middle">{conn.label}</text>
                    )}
                  </svg>
                );
              })}

              {activeDesign?.components?.map(c => (
                <div key={c.id} 
                     onPointerDown={(e) => handlePointerDown(e, c)}
                     style={{ 
                       position: 'absolute', left: `${c.x}px`, top: `${c.y}px`, 
                       background: S.surface, border: `2px solid ${draggingNode === c.id ? S.primary : S.outlineVar}`, 
                       padding: '10px 16px', borderRadius: '8px', fontWeight: 600, color: S.text, 
                       boxShadow: draggingNode === c.id ? '0 10px 25px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.5)',
                       cursor: 'grab', userSelect: 'none', display: 'flex', alignItems: 'center', gap: '8px',
                       zIndex: draggingNode === c.id ? 100 : 1, transition: draggingNode === c.id ? 'none' : 'box-shadow 0.2s, border 0.2s'
                     }}>
                  <span style={{ fontSize: '1.2rem' }}>{ICONS[c.type] || '📦'}</span>
                  <input 
                    value={c.label} 
                    onChange={(e) => {
                      setActiveDesign(prev => ({
                        ...prev, components: prev.components.map(comp => comp.id === c.id ? {...comp, label: e.target.value} : comp)
                      }))
                    }}
                    style={{ background: 'transparent', border: 'none', color: S.text, outline: 'none', width: '100px', fontWeight: 600, fontFamily: 'inherit' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemDesign;
