import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const S = {
  bg: '#0a0a0f', surface: '#12121a', surfaceHigh: '#1a1a24', surfaceHighest: '#232330',
  primary: '#10b981', primaryGlow: 'rgba(16,185,129,0.1)',
  secondary: '#3b82f6', amber: '#f59e0b', red: '#ef4444', purple: '#8b5cf6',
  text: '#f8fafc', textSub: '#94a3b8', outline: '#2a2a35',
};

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', icon: 'JS' },
  { id: 'python', label: 'Python', icon: 'Py' },
  { id: 'java', label: 'Java', icon: 'J' },
  { id: 'cpp', label: 'C++', icon: 'C++' },
  { id: 'go', label: 'Go', icon: 'Go' }
];

// Minimal syntax-highlighting textarea with line numbers
function CodeEditor({ value, onChange, language, readOnly = false }) {
  const lineCount = (value || '').split('\n').length;
  return (
    <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', background: '#0d0d12', fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace" }}>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ background: '#0a0a0f', padding: '16px 12px 16px 0', minWidth: '46px', textAlign: 'right', color: '#4a4a5a', fontSize: '0.82rem', lineHeight: '24px', userSelect: 'none', borderRight: `1px solid ${S.outline}`, overflowY: 'hidden' }}>
          {Array.from({ length: Math.max(lineCount, 20) }, (_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <textarea value={value || ''} onChange={e => !readOnly && onChange(e.target.value)} readOnly={readOnly}
          style={{ flex: 1, padding: '16px', background: 'transparent', color: '#e2e8f0', fontSize: '0.85rem', lineHeight: '24px', border: 'none', resize: 'none', outline: 'none', fontFamily: 'inherit', tabSize: 2, whiteSpace: 'pre', overflow: 'auto' }}
          spellCheck={false} autoCorrect="off" autoCapitalize="off" />
      </div>
    </div>
  );
}

export default function AIPairProgramming() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [chatMsg, setChatMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [tab, setTab] = useState('editor'); // mobile only
  const chatEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user._id || 'guest';

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`/api/aipair/sessions/${userId}`);
      setSessions(res.data || []);
      if (res.data.length > 0 && !activeSession) {
        handleLoadSession(res.data[0]);
      } else if (res.data.length === 0) {
        createNewSession();
      }
    } catch {
      createNewSession();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeSession?.chatHistory]);

  const createNewSession = async () => {
    try {
      const res = await axios.post('/api/aipair/sessions', {
        userId, language: 'javascript', initialCode: `// Welcome to AI Pair Programming\n// I am your AI co-pilot. Write some code or ask me a question!\n\nfunction helloWorld() {\n  console.log("Hello, world!");\n}\n`
      });
      setSessions(prev => [res.data, ...prev]);
      handleLoadSession(res.data);
    } catch { toast.error('Failed to create session'); }
  };

  const handleLoadSession = (session) => {
    setActiveSession(session);
    setCode(session.code);
    setLanguage(session.language);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (activeSession) {
      setActiveSession(s => ({ ...s, code: newCode }));
    }
  };

  const saveSessionCode = async () => {
    if (!activeSession) return;
    try {
      await axios.put(`/api/aipair/sessions/${activeSession._id}/code`, { code, language });
      setSessions(prev => prev.map(s => s._id === activeSession._id ? { ...s, code, language } : s));
    } catch {}
  };

  // Debounced save
  useEffect(() => {
    const timer = setTimeout(() => { saveSessionCode(); }, 2000);
    return () => clearTimeout(timer);
  }, [code, language]);

  const handleSendMessage = async () => {
    if (!chatMsg.trim() || !activeSession) return;
    
    const userMsg = { role: 'user', content: chatMsg, timestamp: new Date() };
    setActiveSession(s => ({ ...s, chatHistory: [...s.chatHistory, userMsg] }));
    setChatMsg('');
    setIsTyping(true);

    try {
      const res = await axios.post(`/api/aipair/sessions/${activeSession._id}/chat`, {
        message: chatMsg, code, language
      });
      
      setActiveSession(s => ({ ...s, chatHistory: [...s.chatHistory, { role: 'ai', content: res.data.response, timestamp: new Date() }] }));
      
      if (res.data.suggestedCode) {
        setCode(res.data.suggestedCode);
        toast.info('💻 AI updated the code editor');
      }
    } catch {
      toast.error('AI failed to respond');
      setActiveSession(s => ({ ...s, chatHistory: [...s.chatHistory, { role: 'system', content: 'Error: Connection failed.', timestamp: new Date() }] }));
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = async (action) => {
    let prompt = '';
    switch (action) {
      case 'explain': prompt = 'Please explain this code step by step.'; break;
      case 'refactor': prompt = 'Please refactor this code to make it cleaner and more efficient. Apply the changes directly if possible.'; break;
      case 'bugs': prompt = 'Find any bugs or potential edge cases in this code and fix them.'; break;
      case 'optimize': prompt = 'Optimize this code for time and space complexity.'; break;
      case 'comments': prompt = 'Add detailed JSDoc/docstring comments to this code.'; break;
      default: return;
    }
    setChatMsg(prompt);
    // Use a small timeout so the state update batches before sending
    setTimeout(() => { document.getElementById('ai-send-btn')?.click(); }, 50);
  };

  if (loading) return <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.textSub }}>Loading Pair Programming...</div>;

  return (
    <div style={{ height: '100vh', background: S.bg, color: S.text, paddingTop: '70px', fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap'); *{box-sizing:border-box;} ::-webkit-scrollbar{width:8px;height:8px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:#2a2a35;border-radius:4px;} ::-webkit-scrollbar-thumb:hover{background:#3f3f50;} .markdown-body pre { background: #000 !important; padding: 12px; border-radius: 8px; overflow-x: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; margin: 8px 0; } .markdown-body code { background: #1e1e2c; padding: 2px 4px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.85em; }`}</style>

      {/* Top Navigation Bar */}
      <div style={{ height: '56px', background: S.surface, borderBottom: `1px solid ${S.outline}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🤖</span>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, background: `linear-gradient(135deg, ${S.text}, ${S.primary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI Co-Pilot
            </h1>
          </div>
          
          <div style={{ width: '1px', height: '24px', background: S.outline }} />
          
          <select value={language} onChange={e => { setLanguage(e.target.value); if(activeSession) { setActiveSession(s => ({...s, language: e.target.value})) } }} style={{ padding: '6px 12px', borderRadius: '8px', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, fontSize: '0.85rem', fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
            {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.icon} {l.label}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={createNewSession} style={{ padding: '6px 14px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', background: S.surfaceHigh, border: `1px solid ${S.outline}`, color: S.text, cursor: 'pointer', fontFamily: 'inherit' }}>
            ➕ New Session
          </button>
          <button style={{ padding: '6px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            Deploy
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Sidebar - Sessions */}
        <div style={{ width: '240px', background: S.surface, borderRight: `1px solid ${S.outline}`, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${S.outline}`, fontSize: '0.75rem', fontWeight: 700, color: S.textSub, letterSpacing: '0.05em' }}>RECENT SESSIONS</div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            {sessions.map(s => (
              <div key={s._id} onClick={() => handleLoadSession(s)}
                style={{ padding: '10px 12px', borderRadius: '8px', marginBottom: '4px', cursor: 'pointer', background: activeSession?._id === s._id ? S.surfaceHighest : 'transparent', color: activeSession?._id === s._id ? S.primary : S.textSub, fontWeight: activeSession?._id === s._id ? 600 : 400, transition: 'all 0.15s', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {s.language === 'javascript' ? 'JS' : s.language === 'python' ? 'PY' : s.language === 'java' ? 'JA' : '/>'} · {new Date(s.updatedAt).toLocaleDateString()}
              </div>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Quick Actions Bar */}
          <div style={{ height: '44px', background: S.surfaceHigh, borderBottom: `1px solid ${S.outline}`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: '8px', overflowX: 'auto' }}>
            <span style={{ color: S.textSub, fontSize: '0.75rem', fontWeight: 600, marginRight: '4px' }}>AI Actions:</span>
            {[
              { id: 'explain', icon: '🧠', label: 'Explain' },
              { id: 'refactor', icon: '✨', label: 'Refactor' },
              { id: 'bugs', icon: '🐛', label: 'Find Bugs' },
              { id: 'optimize', icon: '⚡', label: 'Optimize' },
              { id: 'comments', icon: '📝', label: 'Add Comments' },
            ].map(a => (
              <button key={a.id} onClick={() => handleQuickAction(a.id)} style={{ padding: '4px 10px', borderRadius: '6px', background: S.surfaceHighest, border: `1px solid ${S.outline}`, color: S.textSub, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                <span>{a.icon}</span> {a.label}
              </button>
            ))}
          </div>
          
          <div style={{ flex: 1, position: 'relative' }}>
            <CodeEditor value={code} onChange={handleCodeChange} language={language} />
          </div>
        </div>

        {/* AI Chat Sidebar */}
        <div style={{ width: '400px', background: S.surface, borderLeft: `1px solid ${S.outline}`, display: 'flex', flexDirection: 'column' }}>
          {/* Chat Header */}
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${S.outline}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>🤖</div>
            <div>
              <div style={{ color: S.text, fontWeight: 700, fontSize: '0.9rem' }}>DevLeap AI</div>
              <div style={{ color: S.green, fontSize: '0.65rem', fontWeight: 600 }}>● Online</div>
            </div>
          </div>

          {/* Chat Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeSession?.chatHistory?.length === 0 && (
              <div style={{ textAlign: 'center', color: S.textSub, marginTop: '40px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>👋</div>
                <div style={{ fontWeight: 600, marginBottom: '6px' }}>I'm your AI coding assistant.</div>
                <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>Ask me to write code, explain concepts, find bugs, or optimize your solution.</div>
              </div>
            )}
            
            {(activeSession?.chatHistory || []).map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0, background: msg.role === 'user' ? S.surfaceHigh : `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', border: `1px solid ${msg.role === 'user' ? S.outline : 'transparent'}` }}>
                  {msg.role === 'user' ? '🧑' : msg.role === 'system' ? '⚠️' : '🤖'}
                </div>
                <div style={{ maxWidth: '85%' }}>
                  <div style={{ color: S.textSub, fontSize: '0.65rem', marginBottom: '4px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    {msg.role === 'user' ? 'You' : msg.role === 'system' ? 'System' : 'AI'}
                  </div>
                  <div className={msg.role === 'ai' ? 'markdown-body' : ''} style={{ background: msg.role === 'user' ? S.surfaceHigh : msg.role === 'system' ? 'rgba(239,68,68,0.1)' : S.surfaceHighest, border: `1px solid ${msg.role === 'user' ? S.outline : msg.role === 'system' ? 'rgba(239,68,68,0.3)' : S.primaryGlow}`, padding: '12px 16px', borderRadius: '12px', borderTopRightRadius: msg.role === 'user' ? '4px' : '12px', borderTopLeftRadius: msg.role === 'ai' ? '4px' : '12px', color: msg.role === 'system' ? S.red : S.text, fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: msg.role === 'ai' ? 'normal' : 'pre-wrap', wordBreak: 'break-word' }}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>🤖</div>
                <div style={{ background: S.surfaceHighest, border: `1px solid ${S.primaryGlow}`, padding: '12px 16px', borderRadius: '12px', borderTopLeftRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: S.primary, animation: 'pulse 1s infinite' }} />
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: S.primary, animation: 'pulse 1s infinite 0.2s' }} />
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: S.primary, animation: 'pulse 1s infinite 0.4s' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div style={{ padding: '16px', borderTop: `1px solid ${S.outline}`, background: S.surface }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', background: S.surfaceHighest, border: `1px solid ${S.outline}`, borderRadius: '12px', padding: '8px' }}>
              <textarea value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} placeholder="Ask AI to write code, explain, or fix bugs..." rows={1}
                style={{ flex: 1, background: 'transparent', border: 'none', color: S.text, fontSize: '0.875rem', fontFamily: 'inherit', resize: 'none', outline: 'none', maxHeight: '120px', minHeight: '24px', padding: '4px' }} />
              <button id="ai-send-btn" onClick={handleSendMessage} disabled={isTyping || !chatMsg.trim()} style={{ width: '32px', height: '32px', borderRadius: '8px', background: !chatMsg.trim() ? 'transparent' : `linear-gradient(135deg, ${S.primary}, ${S.secondary})`, color: !chatMsg.trim() ? S.textSub : '#fff', border: 'none', cursor: !chatMsg.trim() ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                ➤
              </button>
            </div>
            <div style={{ color: S.textSub, fontSize: '0.65rem', textAlign: 'center', marginTop: '8px' }}>Press Enter to send, Shift+Enter for new line</div>
          </div>
        </div>
      </div>
    </div>
  );
}
