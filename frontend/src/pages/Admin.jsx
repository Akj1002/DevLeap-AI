import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';


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

export default function Admin() {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('metrics'); // 'metrics' | 'questions' | 'users'

  // Question Form State
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    difficulty: 'Medium',
    category: 'Algorithms',
    description: '',
    topics: '',
    testCasesInput: '',
    testCasesOutput: ''
  });

  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [mRes, uRes] = await Promise.all([
        axios.get('/api/admin/metrics'),
        axios.get('/api/admin/users')
      ]);
      setMetrics(mRes.data);
      setUsers(uRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load admin telemetry');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put('/api/admin/users/role', { userId, role: newRole });
      toast.success(`Role updated successfully to ${newRole}`);
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.title || !newQuestion.description) {
      toast.error('Title and description are required');
      return;
    }

    setSubmittingQuestion(true);
    try {
      const testCases = [
        {
          input: newQuestion.testCasesInput || "1 2\n",
          expectedOutput: newQuestion.testCasesOutput || "3\n",
          isHidden: false
        }
      ];

      await axios.post('/api/admin/questions', {
        ...newQuestion,
        testCases
      });

      toast.success('Coding problem added successfully!');
      setNewQuestion({
        title: '',
        difficulty: 'Medium',
        category: 'Algorithms',
        description: '',
        topics: '',
        testCasesInput: '',
        testCasesOutput: ''
      });
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to create coding problem');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  if (loading && !metrics) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: S.bg }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(59,130,246,0.2)', borderTopColor: S.primary, margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <div style={{ color: S.outline, fontSize: '14px' }}>Loading Admin Console...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const s = {
    wrap: { minHeight: '100vh', background: S.bg, paddingTop: '80px', paddingBottom: '60px', fontFamily: 'Inter, sans-serif', color: S.text },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '0 24px' },
    card: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' },
    title: { fontSize: '2.2rem', fontWeight: 800, background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' },
    subtitle: { color: '#64748b', fontSize: '1rem', marginBottom: '32px' },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' },
    statCard: (borderColor) => ({ background: S.surface, border: `1px solid ${borderColor || S.outlineVar}`, borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }),
    tabBar: { display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '24px' },
    tabBtn: (active) => ({ padding: '10px 22px', background: active ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : S.surfaceHigh, border: 'none', borderRadius: '10px', color: active ? '#fff' : S.outline, fontSize: '13px', fontWeight: active ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s' }),
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' },
    input: { background: S.surfaceHigh, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: S.text, padding: '12px 14px', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif' },
    btn: { background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', alignSelf: 'flex-start' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    th: { color: S.outlineVar, fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '12px 16px', borderBottom: '2px solid rgba(255,255,255,0.08)', textAlign: 'left' },
    td: { padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: S.outline }
  };

  return (
    <div style={s.wrap}>
      <div style={s.container}>
        <h1 style={s.title}>Admin Panel ⚙️</h1>
        <p style={s.subtitle}>Overview of system metrics, developer accounts, and curriculum database.</p>

        {/* Telemetry Row */}
        <div style={s.statsRow}>
          <div style={s.statCard('rgba(59, 130, 246, 0.3)')}>
            <span style={{ fontSize: '20px' }}>👥</span>
            <span style={{ color: S.outline, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Total Accounts</span>
            <span style={{ color: S.primary, fontSize: '28px', fontWeight: 800 }}>{metrics?.usersCount || 0}</span>
          </div>
          <div style={s.statCard('rgba(139, 92, 246, 0.3)')}>
            <span style={{ fontSize: '20px' }}>🗄️</span>
            <span style={{ color: S.outline, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Problems Loaded</span>
            <span style={{ color: S.secondary, fontSize: '28px', fontWeight: 800 }}>{metrics?.questionsCount || 0}</span>
          </div>
          <div style={s.statCard('rgba(6, 182, 212, 0.3)')}>
            <span style={{ fontSize: '20px' }}>✓</span>
            <span style={{ color: S.outline, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Accepted Submissions</span>
            <span style={{ color: '#06b6d4', fontSize: '28px', fontWeight: 800 }}>{metrics?.solvedCount || 0}</span>
          </div>
          <div style={s.statCard('rgba(34, 197, 94, 0.3)')}>
            <span style={{ fontSize: '20px' }}>🎙️</span>
            <span style={{ color: S.outline, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>AI Interview Sessions</span>
            <span style={{ color: S.tertiary, fontSize: '28px', fontWeight: 800 }}>{metrics?.interviewsCount || 0}</span>
          </div>
          <div style={s.statCard('rgba(245, 158, 11, 0.3)')}>
            <span style={{ fontSize: '20px' }}>💰</span>
            <span style={{ color: S.outline, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Gemini Est. Costs</span>
            <span style={{ color: '#f59e0b', fontSize: '28px', fontWeight: 800 }}>${metrics?.geminiCostUSD || '0.0000'}</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div style={s.tabBar}>
          <button style={s.tabBtn(activeSubTab === 'metrics')} onClick={() => setActiveSubTab('metrics')}>📊 System Metrics</button>
          <button style={s.tabBtn(activeSubTab === 'questions')} onClick={() => setActiveSubTab('questions')}>➕ Add Question</button>
          <button style={s.tabBtn(activeSubTab === 'users')} onClick={() => setActiveSubTab('users')}>👥 User Manager</button>
        </div>

        {/* Sub-tab 1: System Metrics */}
        {activeSubTab === 'metrics' && (
          <div style={s.card}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>🤖 API Telemetry</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                <span style={{ color: '#cbd5e1' }}>Gemini Tokens (Estimated)</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{(metrics?.geminiTokensUsed || 0).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                <span style={{ color: '#cbd5e1' }}>Forum Content Count (Threads)</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{metrics?.threadsCount || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                <span style={{ color: '#cbd5e1' }}>Judge API Health Status</span>
                <span style={{ color: S.tertiary, fontWeight: 'bold' }}>Healthy (Online)</span>
              </div>
            </div>
          </div>
        )}

        {/* Sub-tab 2: Add Question */}
        {activeSubTab === 'questions' && (
          <div style={s.card}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px' }}>➕ Create Problem Database Entry</h2>
            <form onSubmit={handleCreateQuestion}>
              <div style={s.formGrid}>
                <div style={s.formGroup}>
                  <label style={{ fontSize: '0.85rem', color: S.outline, fontWeight: 600 }}>Problem Title *</label>
                  <input style={s.input} type="text" placeholder="e.g. Reverse Linked List" value={newQuestion.title} onChange={e => setNewQuestion({...newQuestion, title: e.target.value})} required />
                </div>
                <div style={s.formGroup}>
                  <label style={{ fontSize: '0.85rem', color: S.outline, fontWeight: 600 }}>Difficulty</label>
                  <select style={s.input} value={newQuestion.difficulty} onChange={e => setNewQuestion({...newQuestion, difficulty: e.target.value})}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div style={s.formGrid}>
                <div style={s.formGroup}>
                  <label style={{ fontSize: '0.85rem', color: S.outline, fontWeight: 600 }}>Category</label>
                  <input style={s.input} type="text" placeholder="e.g. Algorithms" value={newQuestion.category} onChange={e => setNewQuestion({...newQuestion, category: e.target.value})} />
                </div>
                <div style={s.formGroup}>
                  <label style={{ fontSize: '0.85rem', color: S.outline, fontWeight: 600 }}>Topics (comma separated)</label>
                  <input style={s.input} type="text" placeholder="e.g. linked-list, recursion, pointers" value={newQuestion.topics} onChange={e => setNewQuestion({...newQuestion, topics: e.target.value})} />
                </div>
              </div>

              <div style={s.formGroup}>
                <label style={{ fontSize: '0.85rem', color: S.outline, fontWeight: 600 }}>Description (Markdown/HTML) *</label>
                <textarea style={{ ...s.input, minHeight: '120px', resize: 'vertical' }} placeholder="Provide the LeetCode description, examples, and constraints..." value={newQuestion.description} onChange={e => setNewQuestion({...newQuestion, description: e.target.value})} required />
              </div>

              <div style={s.formGrid}>
                <div style={s.formGroup}>
                  <label style={{ fontSize: '0.85rem', color: S.outline, fontWeight: 600 }}>Example Test Case Input</label>
                  <textarea style={{ ...s.input, fontFamily: 'monospace', minHeight: '60px' }} placeholder="[1,2,3,4,5]\n" value={newQuestion.testCasesInput} onChange={e => setNewQuestion({...newQuestion, testCasesInput: e.target.value})} />
                </div>
                <div style={s.formGroup}>
                  <label style={{ fontSize: '0.85rem', color: S.outline, fontWeight: 600 }}>Expected Test Case Output</label>
                  <textarea style={{ ...s.input, fontFamily: 'monospace', minHeight: '60px' }} placeholder="[5,4,3,2,1]\n" value={newQuestion.testCasesOutput} onChange={e => setNewQuestion({...newQuestion, testCasesOutput: e.target.value})} />
                </div>
              </div>

              <button style={s.btn} type="submit" disabled={submittingQuestion}>{submittingQuestion ? 'Adding Problem...' : 'Create Problem 🚀'}</button>
            </form>
          </div>
        )}

        {/* Sub-tab 3: User Manager */}
        {activeSubTab === 'users' && (
          <div style={s.card}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px' }}>👥 User Account Control</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>User</th>
                    <th style={s.th}>Email</th>
                    <th style={s.th}>Active Role</th>
                    <th style={s.th}>Solved Problems</th>
                    <th style={s.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ ...s.td, color: S.text, fontWeight: 600 }}>{u.username}</td>
                      <td style={s.td}>{u.email}</td>
                      <td style={s.td}>
                        <span style={{ background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.12)' : S.surfaceHigh, color: u.role === 'admin' ? S.error : '#cbd5e1', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>{u.role}</span>
                      </td>
                      <td style={s.td}>{u.solvedProblems?.length || 0} solved</td>
                      <td style={s.td}>
                        <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)} style={{ background: S.bg, border: '1px solid rgba(255,255,255,0.1)', color: S.outline, borderRadius: '6px', padding: '4px 8px', outline: 'none', cursor: 'pointer' }}>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="moderator">Moderator</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
