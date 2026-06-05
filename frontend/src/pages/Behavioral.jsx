import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const COMPETENCIES = [
  { id: 'customer', name: 'Customer Obsession', icon: '👑', questions: [
      "Tell me about a time when you went above and beyond for a customer.",
      "How do you handle conflict or pushback from a client when they demand an unrealistic feature?",
      "Describe a situation where you had to make a compromise between speed and client satisfaction."
  ]},
  { id: 'ownership', name: 'Ownership', icon: '🔑', questions: [
      "Tell me about a time when you had to take on a task outside of your core responsibilities.",
      "Describe a situation where you made a mistake at work and how you corrected it.",
      "Tell me about a time when you saw a problem in another team's workflow and took ownership to fix it."
  ]},
  { id: 'results', name: 'Deliver Results', icon: '🏆', questions: [
      "Tell me about your most challenging technical project and how you ensured its successful delivery.",
      "Describe a situation where you had to work under a tight deadline and failed to meet it. What did you learn?",
      "How do you prioritize multiple critical bugs or deadlines when everything is high priority?"
  ]},
  { id: 'bias', name: 'Bias for Action', icon: '⚡', questions: [
      "Tell me about a time when you had to make a critical decision with very limited data.",
      "Describe a situation where you took a calculated risk and it failed. How did you pivot?",
      "Tell me about a time when you noticed an optimization possibility in your system and coded a prototype immediately."
  ]}
];


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

export default function Behavioral() {
  const [selectedComp, setSelectedComp] = useState(COMPETENCIES[0]);
  const [selectedQ, setSelectedQ] = useState(COMPETENCIES[0].questions[0]);
  const [activeStage, setActiveStage] = useState('setup'); // 'setup' | 'practice' | 'report'

  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check Speech Recognition capability
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (e) => {
        let transcript = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript;
        }
        setAnswer((prev) => prev + ' ' + transcript);
      };

      rec.onerror = (err) => {
        console.error(err);
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleStartRecording = () => {
    if (!recognitionRef.current) {
      toast.warn('Web Speech API is not supported on this browser. Please type your answer.');
      return;
    }
    
    setIsRecording(true);
    recognitionRef.current.start();
    toast.info('Listening... Speak clearly into your mic.');
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    toast.success('Recording stopped.');
  };

  const handleEvaluate = async () => {
    if (!answer.trim() || answer.length < 50) {
      toast.error('Please enter a detailed response of at least 50 characters.');
      return;
    }

    setIsEvaluating(true);
    try {
      const res = await axios.post('/api/ai/evaluate-behavioral', {
        question: selectedQ,
        category: selectedComp.name,
        answer
      });
      setEvaluation(res.data);
      setActiveStage('report');
      setSaved(false);
    } catch (err) {
      toast.error('Failed to analyze response. Try again later.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveReport = async () => {
    setSaving(true);
    const userId = localStorage.getItem('devleap_user_id');
    if (userId && evaluation) {
      try {
        await axios.post(`/api/users/${userId}/interview-report`, {
          company: "Behavioral practice",
          interviewType: selectedComp.name,
          difficulty: "STAR check",
          score: evaluation.scores?.overall || 70,
          feedback: evaluation.feedback || `Completed STAR behavioral response check.`,
          date: new Date().toISOString()
        });
        setSaved(true);
        toast.success('Report saved to your profile!');
      } catch (e) {
        toast.error('Failed to save report to profile.');
      }
    }
    setSaving(false);
  };

  const s = {
    wrap: { minHeight: '100vh', background: S.bg, paddingTop: '80px', paddingBottom: '60px', fontFamily: 'Inter, sans-serif', color: S.text },
    container: { maxWidth: '900px', margin: '0 auto', padding: '0 24px' },
    card: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '28px', marginBottom: '24px' },
    title: { fontSize: '2.2rem', fontWeight: 800, background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px', textAlign: 'center' },
    subtitle: { color: '#64748b', fontSize: '1.05rem', marginBottom: '32px', textAlign: 'center' },
    compGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' },
    compCard: (active) => ({
      background: active ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255,255,255,0.02)',
      border: `2px solid ${active ? S.primary : S.outlineVar}`,
      borderRadius: '14px', padding: '16px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
    }),
    qBtn: (active) => ({
      width: '100%', background: active ? S.surfaceHigh : 'transparent',
      border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', color: active ? S.text : S.outline,
      padding: '12px 16px', textAlign: 'left', cursor: 'pointer', marginBottom: '8px', transition: 'all 0.15s'
    }),
    btn: { background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }
  };

  return (
    <div style={s.wrap}>
      <div style={s.container}>
        <h1 style={s.title}>STAR Behavioral Simulator 🎙️</h1>
        <p style={s.subtitle}>Master non-technical rounds by evaluating your responses against the Situation, Task, Action, and Result structures.</p>

        {activeStage === 'setup' && (
          <div>
            <div style={s.card}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '16px' }}>1. Select Competency Pillar</h2>
              <div style={s.compGrid}>
                {COMPETENCIES.map((comp) => {
                  const active = selectedComp.id === comp.id;
                  return (
                    <div key={comp.id} style={s.compCard(active)} onClick={() => { setSelectedComp(comp); setSelectedQ(comp.questions[0]); }}>
                      <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '6px' }}>{comp.icon}</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: active ? S.text : S.outline }}>{comp.name}</span>
                    </div>
                  );
                })}
              </div>

              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '16px', marginTop: '30px' }}>2. Choose Behavioral Question</h2>
              <div>
                {selectedComp.questions.map((q, idx) => (
                  <button key={idx} style={s.qBtn(selectedQ === q)} onClick={() => setSelectedQ(q)}>
                    <span style={{ marginRight: '8px', fontWeight: 800, color: S.primary }}>Q{idx + 1}.</span> {q}
                  </button>
                ))}
              </div>
            </div>

            <button style={{ ...s.btn, width: '100%' }} onClick={() => setActiveStage('practice')}>🚀 Begin Preparation</button>
          </div>
        )}

        {activeStage === 'practice' && (
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
              <span style={{ color: S.secondary, fontWeight: 700 }}>{selectedComp.name}</span>
              <button onClick={() => setActiveStage('setup')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>Back to Setup</button>
            </div>
            
            <h3 style={{ fontSize: '1.15rem', color: S.text, marginBottom: '20px', lineHeight: 1.5 }}>"{selectedQ}"</h3>

            {/* Answer Editor */}
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <textarea
                style={{ width: '100%', minHeight: '200px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: S.text, padding: '16px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif', resize: 'vertical' }}
                placeholder="Structure your answer with:
- Situation (What was the context?)
- Task (What was the problem/goal?)
- Action (What did YOU do?)
- Result (What was the outcome, quantified if possible?)"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
              />

              {isRecording && (
                <div style={{ position: 'absolute', bottom: '16px', right: '16px', display: 'flex', gap: '4px', alignItems: 'flex-end', height: '24px' }}>
                  <div style={{ width: '3px', height: '14px', background: S.error, animation: 'wave 0.8s ease infinite' }} />
                  <div style={{ width: '3px', height: '24px', background: S.error, animation: 'wave 0.8s ease infinite 0.1s' }} />
                  <div style={{ width: '3px', height: '18px', background: S.error, animation: 'wave 0.8s ease infinite 0.2s' }} />
                  <style>{`@keyframes wave { 0%, 100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }`}</style>
                </div>
              )}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {isRecording ? (
                <button style={{ ...s.btn, background: 'rgba(239, 68, 68, 0.2)', color: S.error, border: '1px solid rgba(239, 68, 68, 0.4)' }} onClick={handleStopRecording}>🛑 Stop Listening</button>
              ) : (
                <button style={{ ...s.btn, background: S.surfaceHigh, color: S.outline, border: '1px solid rgba(255,255,255,0.1)' }} onClick={handleStartRecording}>🎙️ Record Answer</button>
              )}
              <div style={{ flex: 1 }} />
              <button style={s.btn} onClick={handleEvaluate} disabled={isEvaluating}>{isEvaluating ? 'AI Evaluator working...' : 'Evaluate Answer 🚀'}</button>
            </div>
          </div>
        )}

        {activeStage === 'report' && evaluation && (
          <div>
            {/* Overall Rating Section */}
            <div style={{ ...s.card, textAlign: 'center', background: 'linear-gradient(180deg, rgba(139,92,246,0.06) 0%, transparent 100%)' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '8px' }}>🤖</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>STAR method Score</h2>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: S.secondary, margin: '14px 0' }}>{evaluation.scores?.overall}%</div>
              <p style={{ color: '#cbd5e1', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>{evaluation.feedback}</p>
            </div>

            {/* Score Grid Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Situation', score: evaluation.scores?.situation, color: S.primary },
                { label: 'Task', score: evaluation.scores?.task, color: '#06b6d4' },
                { label: 'Action', score: evaluation.scores?.action, color: S.secondary },
                { label: 'Result', score: evaluation.scores?.result, color: S.tertiary }
              ].map(item => (
                <div key={item.label} style={{ ...s.card, margin: 0, padding: '16px', textAlign: 'center' }}>
                  <span style={{ color: S.outline, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>{item.label}</span>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: item.color, margin: '8px 0' }}>{item.score}%</div>
                  <div style={{ height: '4px', background: S.surfaceHigh, borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${item.score}%`, background: item.color, borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Strengths & Improvements */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div style={{ ...s.card, margin: 0, background: 'rgba(34,197,94,0.03)', border: '1px solid rgba(34,197,94,0.12)' }}>
                <h3 style={{ color: S.tertiary, fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>✓ Key Strengths</h3>
                {evaluation.strengths?.map((item, i) => (
                  <div key={i} style={{ color: '#a7f3d0', fontSize: '0.88rem', background: 'rgba(34,197,94,0.05)', padding: '10px', borderRadius: '8px', marginBottom: '8px', lineHeight: 1.5 }}>{item}</div>
                ))}
              </div>
              <div style={{ ...s.card, margin: 0, background: 'rgba(245,158,11,0.03)', border: '1px solid rgba(245,158,11,0.12)' }}>
                <h3 style={{ color: '#f59e0b', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>⚡ Opportunities</h3>
                {evaluation.improvements?.map((item, i) => (
                  <div key={i} style={{ color: '#fde68a', fontSize: '0.88rem', background: 'rgba(245,158,11,0.05)', padding: '10px', borderRadius: '8px', marginBottom: '8px', lineHeight: 1.5 }}>{item}</div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <button style={{ ...s.btn, flex: 1, background: saved ? 'rgba(34,197,94,0.12)' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', color: saved ? S.tertiary : '#fff', cursor: saved ? 'default' : 'pointer' }} onClick={handleSaveReport} disabled={saving || saved}>
                {saved ? '✓ Report Saved to Profile!' : saving ? 'Saving report...' : '💾 Save to Profile'}
              </button>
              <button style={{ ...s.btn, flex: 1, background: S.surfaceHigh, border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => { setActiveStage('setup'); setAnswer(''); setEvaluation(null); }}>🔄 Restart Practice</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
