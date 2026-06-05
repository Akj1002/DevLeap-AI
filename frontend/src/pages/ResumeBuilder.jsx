import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

// ─── Helpers ────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).substr(2, 9);

const emptyExperience = () => ({
  id: uid(), jobTitle: '', company: '', location: '',
  startDate: '', endDate: '', current: false,
  bullets: [{ text: '', isAiEnhanced: false }],
});

const emptyEducation = () => ({
  id: uid(), degree: '', institution: '', location: '',
  startDate: '', endDate: '', gpa: '', honors: '',
});

const emptyProject = () => ({
  id: uid(), name: '', techStack: '', link: '',
  bullets: [{ text: '', isAiEnhanced: false }],
});

const emptyResume = () => ({
  personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '' },
  summary: '',
  experience: [emptyExperience()],
  education: [emptyEducation()],
  projects: [emptyProject()],
  skills: { technical: '', languages: '', frameworks: '', tools: '', soft: '' },
  certifications: [],
});

// ─── Stitch Design System Tokens ─────────────────────────────────────────────
const C = {
  bg: '#09090f',
  surface: 'rgba(255,255,255,0.03)',
  card: 'rgba(255,255,255,0.045)',
  border: 'rgba(255,255,255,0.08)',
  borderHover: 'rgba(255,255,255,0.14)',
  blue: '#adc6ff',       // Stitch primary
  purple: '#8b5cf6',     // violet-glow for AI features
  green: '#4ae176',      // Stitch tertiary
  amber: '#f59e0b',
  red: '#ffb4ab',        // Stitch error
  text: '#e4e1ea',       // Stitch on-surface
  muted: '#8c909f',      // Stitch outline
  subtle: '#c2c6d6',     // Stitch on-surface-variant
  surfaceContainer: '#1f1f26',
  surfaceContainerHigh: '#2a2930',
  surfaceContainerLow: '#1b1b21',
  outlineVariant: '#424754',
};

// ─── Stitch-Themed Styled Helpers ────────────────────────────────────────────
const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '6px',
  color: '#e4e1ea',
  padding: '8px 12px',
  fontSize: '14px',
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const labelStyle = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#c2c6d6',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  marginBottom: '5px',
  display: 'block',
};

const sectionCardStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '10px',
  padding: '16px',
  marginBottom: '12px',
};

const aiBtn = (loading) => ({
  background: loading
    ? 'rgba(139,92,246,0.06)'
    : 'rgba(139,92,246,0.12)',
  border: `1px solid ${loading ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.35)'}`,
  borderRadius: '6px',
  color: loading ? '#8c909f' : '#c4b5fd',
  padding: '5px 11px',
  fontSize: '12px',
  fontWeight: 600,
  cursor: loading ? 'not-allowed' : 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  fontFamily: 'Inter, sans-serif',
  whiteSpace: 'nowrap',
  transition: 'all 0.2s',
  boxShadow: loading ? 'none' : '0 0 10px rgba(139,92,246,0.2)',
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function ResumeBuilder() {
  const [resume, setResume] = useState(emptyResume());
  const [activeSection, setActiveSection] = useState('personal');
  const [loadingAI, setLoadingAI] = useState({});
  const [saving, setSaving] = useState(false);
  const [atsData, setAtsData] = useState(null);
  const [analyzingAts, setAnalyzingAts] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [showAtsPanel, setShowAtsPanel] = useState(false);
  const [hoveredSection, setHoveredSection] = useState(null);
  const userId = localStorage.getItem('devleap_user_id');
  const printRef = useRef();

  // Load from backend on mount
  useEffect(() => {
    if (!userId) return;
    axios.get(`/api/resume/${userId}`)
      .then(({ data }) => { if (data.success) setResume(data.data); })
      .catch(() => {}); // 404 is fine — means no resume yet
  }, [userId]);

  // ── Generic updaters ──────────────────────────────────────────────────────
  const setPersonal = (field, val) =>
    setResume(r => ({ ...r, personalInfo: { ...r.personalInfo, [field]: val } }));

  const setSkill = (field, val) =>
    setResume(r => ({ ...r, skills: { ...r.skills, [field]: val } }));

  const setSummary = (val) => setResume(r => ({ ...r, summary: val }));

  // Experience
  const updateExp = (id, field, val) =>
    setResume(r => ({
      ...r,
      experience: r.experience.map(e => e.id === id ? { ...e, [field]: val } : e),
    }));

  const updateExpBullet = (expId, idx, val) =>
    setResume(r => ({
      ...r,
      experience: r.experience.map(e =>
        e.id === expId
          ? { ...e, bullets: e.bullets.map((b, i) => i === idx ? { ...b, text: val } : b) }
          : e
      ),
    }));

  const addExpBullet = (expId) =>
    setResume(r => ({
      ...r,
      experience: r.experience.map(e =>
        e.id === expId ? { ...e, bullets: [...e.bullets, { text: '', isAiEnhanced: false }] } : e
      ),
    }));

  const removeExpBullet = (expId, idx) =>
    setResume(r => ({
      ...r,
      experience: r.experience.map(e =>
        e.id === expId ? { ...e, bullets: e.bullets.filter((_, i) => i !== idx) } : e
      ),
    }));

  // Education
  const updateEdu = (id, field, val) =>
    setResume(r => ({
      ...r,
      education: r.education.map(e => e.id === id ? { ...e, [field]: val } : e),
    }));

  // Projects
  const updateProject = (id, field, val) =>
    setResume(r => ({
      ...r,
      projects: r.projects.map(p => p.id === id ? { ...p, [field]: val } : p),
    }));

  const updateProjectBullet = (projId, idx, val) =>
    setResume(r => ({
      ...r,
      projects: r.projects.map(p =>
        p.id === projId
          ? { ...p, bullets: p.bullets.map((b, i) => i === idx ? { ...b, text: val } : b) }
          : p
      ),
    }));

  const addProjectBullet = (projId) =>
    setResume(r => ({
      ...r,
      projects: r.projects.map(p =>
        p.id === projId ? { ...p, bullets: [...p.bullets, { text: '', isAiEnhanced: false }] } : p
      ),
    }));

  const removeProjectBullet = (projId, idx) =>
    setResume(r => ({
      ...r,
      projects: r.projects.map(p =>
        p.id === projId ? { ...p, bullets: p.bullets.filter((_, i) => i !== idx) } : p
      ),
    }));

  // ── AI Actions ────────────────────────────────────────────────────────────
  const enhanceBullets = async (type, id) => {
    const key = `${type}-${id}`;
    setLoadingAI(prev => ({ ...prev, [key]: true }));
    try {
      const item = type === 'exp'
        ? resume.experience.find(e => e.id === id)
        : resume.projects.find(p => p.id === id);

      const rawBullets = item.bullets.map(b => b.text).filter(t => t.trim());
      if (!rawBullets.length) {
        toast.warning('Add some bullet points first before enhancing!');
        return;
      }

      const { data } = await axios.post('/api/ai/enhance-resume', {
        bullets: rawBullets,
        jobTitle: type === 'exp' ? item.jobTitle : item.name,
        company: type === 'exp' ? item.company : '',
      });

      if (data.success && data.enhancedBullets.length) {
        const enhanced = data.enhancedBullets.map(t => ({ text: t, isAiEnhanced: true }));
        if (type === 'exp') {
          setResume(r => ({
            ...r,
            experience: r.experience.map(e =>
              e.id === id ? { ...e, bullets: enhanced } : e
            ),
          }));
        } else {
          setResume(r => ({
            ...r,
            projects: r.projects.map(p =>
              p.id === id ? { ...p, bullets: enhanced } : p
            ),
          }));
        }
        toast.success('✨ AI enhanced your bullet points!');
      }
    } catch {
      toast.error('AI enhancement failed. Please try again.');
    } finally {
      setLoadingAI(prev => ({ ...prev, [key]: false }));
    }
  };

  const generateSummary = async () => {
    setLoadingAI(prev => ({ ...prev, summary: true }));
    try {
      const allSkills = [
        resume.skills.languages, resume.skills.frameworks,
        resume.skills.technical, resume.skills.tools,
      ].filter(Boolean).join(', ');

      const { data } = await axios.post('/api/ai/generate-summary', {
        fullName: resume.personalInfo.fullName,
        jobTitle: resume.experience[0]?.jobTitle || targetRole,
        yearsOfExperience: resume.experience.length > 0 ? resume.experience.length + '+' : '2+',
        skills: allSkills,
        experience: resume.experience,
      });

      if (data.success) {
        setSummary(data.summary);
        toast.success('✨ Professional summary generated!');
      }
    } catch {
      toast.error('Could not generate summary. Check your input.');
    } finally {
      setLoadingAI(prev => ({ ...prev, summary: false }));
    }
  };

  const analyzeAts = async () => {
    setAnalyzingAts(true);
    try {
      const text = buildResumeText();
      const { data } = await axios.post('/api/ai/analyze-ats', {
        resumeText: text,
        targetRole: targetRole || resume.experience[0]?.jobTitle || 'Software Engineer',
      });
      if (data.success) {
        setAtsData(data.analysis);
        setShowAtsPanel(true);
        toast.success(`ATS Score: ${data.analysis.score}/100 (${data.analysis.grade})`);
      }
    } catch {
      toast.error('ATS analysis failed. Try again.');
    } finally {
      setAnalyzingAts(false);
    }
  };

  const buildResumeText = () => {
    const r = resume;
    const pi = r.personalInfo;
    let text = `${pi.fullName}\n${pi.email} | ${pi.phone} | ${pi.location}\n`;
    text += `LinkedIn: ${pi.linkedin} | GitHub: ${pi.github}\n\n`;
    text += `SUMMARY\n${r.summary}\n\n`;
    text += `EXPERIENCE\n${r.experience.map(e =>
      `${e.jobTitle} at ${e.company} (${e.startDate} - ${e.current ? 'Present' : e.endDate})\n` +
      e.bullets.map(b => `• ${b.text}`).join('\n')
    ).join('\n\n')}\n\n`;
    text += `EDUCATION\n${r.education.map(e =>
      `${e.degree} - ${e.institution} (${e.startDate} - ${e.endDate})`
    ).join('\n')}\n\n`;
    text += `PROJECTS\n${r.projects.map(p =>
      `${p.name} | ${p.techStack}\n` + p.bullets.map(b => `• ${b.text}`).join('\n')
    ).join('\n\n')}\n\n`;
    text += `SKILLS\nLanguages: ${r.skills.languages}\nFrameworks: ${r.skills.frameworks}\nTools: ${r.skills.tools}`;
    return text;
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const saveResume = async () => {
    if (!userId) { toast.error('Please log in to save your resume.'); return; }
    setSaving(true);
    try {
      await axios.post(`/api/resume/${userId}`, resume);
      toast.success('Resume saved successfully!');
    } catch {
      toast.error('Failed to save resume. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Print ─────────────────────────────────────────────────────────────────
  const handlePrint = () => window.print();

  // ─── Sidebar sections ────────────────────────────────────────────────────
  const sections = [
    { id: 'personal',   label: 'Personal Information',  icon: '👤', matIcon: 'person' },
    { id: 'summary',    label: 'Professional Summary',   icon: '📝', matIcon: 'summarize' },
    { id: 'experience', label: 'Experience',             icon: '💼', matIcon: 'work_history' },
    { id: 'education',  label: 'Education',              icon: '🎓', matIcon: 'school' },
    { id: 'projects',   label: 'Projects',               icon: '🚀', matIcon: 'rocket_launch' },
    { id: 'skills',     label: 'Skills',                 icon: '⚡', matIcon: 'bolt' },
  ];

  // ATS score color
  const atsColor = (score) => {
    if (score >= 85) return C.green;
    if (score >= 65) return C.amber;
    return C.red;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // EDITOR SECTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const renderPersonal = () => (
    <div>
      <SectionHeader icon="👤" title="Personal Information" subtitle="Your contact details appear at the top of your resume" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {[
          { label: 'Full Name', field: 'fullName', placeholder: 'Abhinav Kumar', span: 2 },
          { label: 'Email', field: 'email', placeholder: 'abhinav@example.com' },
          { label: 'Phone', field: 'phone', placeholder: '+91 98765 43210' },
          { label: 'Location', field: 'location', placeholder: 'Bengaluru, India' },
          { label: 'LinkedIn URL', field: 'linkedin', placeholder: 'linkedin.com/in/abhinav' },
          { label: 'GitHub URL', field: 'github', placeholder: 'github.com/abhinav' },
          { label: 'Portfolio / Website', field: 'portfolio', placeholder: 'abhinav.dev' },
        ].map(({ label, field, placeholder, span }) => (
          <div key={field} style={{ gridColumn: span === 2 ? '1 / -1' : undefined }}>
            <label style={labelStyle}>{label}</label>
            <input
              style={inputStyle}
              value={resume.personalInfo[field]}
              onChange={e => setPersonal(field, e.target.value)}
              placeholder={placeholder}
              onFocus={e => (e.target.style.borderColor = C.blue)}
              onBlur={e => (e.target.style.borderColor = C.border)}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderSummary = () => (
    <div>
      <SectionHeader icon="📝" title="Professional Summary" subtitle="A 3-4 sentence overview that hooks recruiters immediately" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <label style={labelStyle}>Summary</label>
          <button
            style={aiBtn(loadingAI.summary)}
            onClick={generateSummary}
            disabled={loadingAI.summary}
          >
            {loadingAI.summary ? '⏳ Generating...' : '✨ AI Generate'}
          </button>
        </div>
        <textarea
          style={{ ...inputStyle, minHeight: '120px', resize: 'vertical', lineHeight: 1.6 }}
          value={resume.summary}
          onChange={e => setSummary(e.target.value)}
          placeholder="Results-driven Software Engineer with 3+ years of experience..."
          onFocus={e => (e.target.style.borderColor = C.blue)}
          onBlur={e => (e.target.style.borderColor = C.border)}
        />
        <p style={{ fontSize: '12px', color: C.muted }}>
          💡 Tip: Fill in your Experience and Skills first, then click AI Generate for best results.
        </p>
      </div>
    </div>
  );

  const renderExperience = () => (
    <div>
      <SectionHeader icon="💼" title="Work Experience" subtitle="List your roles in reverse chronological order" />
      {resume.experience.map((exp, expIdx) => (
        <div key={exp.id} style={{ ...sectionCardStyle, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: C.subtle }}>
              Experience #{expIdx + 1}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={aiBtn(loadingAI[`exp-${exp.id}`])}
                onClick={() => enhanceBullets('exp', exp.id)}
                disabled={loadingAI[`exp-${exp.id}`]}
              >
                {loadingAI[`exp-${exp.id}`] ? '⏳ Enhancing...' : '✨ AI Enhance Bullets'}
              </button>
              {resume.experience.length > 1 && (
                <button
                  style={{ ...aiBtn(false), color: C.red, borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)' }}
                  onClick={() => setResume(r => ({ ...r, experience: r.experience.filter(e => e.id !== exp.id) }))}
                >
                  🗑️
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            {[
              { label: 'Job Title', field: 'jobTitle', placeholder: 'Software Engineer' },
              { label: 'Company', field: 'company', placeholder: 'Google' },
              { label: 'Location', field: 'location', placeholder: 'Mountain View, CA' },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <label style={labelStyle}>{label}</label>
                <input style={inputStyle} value={exp[field]} placeholder={placeholder}
                  onChange={e => updateExp(exp.id, field, e.target.value)}
                  onFocus={e => (e.target.style.borderColor = C.blue)}
                  onBlur={e => (e.target.style.borderColor = C.border)}
                />
              </div>
            ))}
            <div>
              <label style={labelStyle}>Start Date</label>
              <input style={inputStyle} value={exp.startDate} placeholder="Jan 2022"
                onChange={e => updateExp(exp.id, 'startDate', e.target.value)}
                onFocus={e => (e.target.style.borderColor = C.blue)}
                onBlur={e => (e.target.style.borderColor = C.border)}
              />
            </div>
            <div>
              <label style={labelStyle}>End Date</label>
              <input style={inputStyle} value={exp.endDate} placeholder="Dec 2023"
                disabled={exp.current}
                onChange={e => updateExp(exp.id, 'endDate', e.target.value)}
                onFocus={e => (e.target.style.borderColor = C.blue)}
                onBlur={e => (e.target.style.borderColor = C.border)}
              />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id={`current-${exp.id}`} checked={exp.current}
                onChange={e => updateExp(exp.id, 'current', e.target.checked)}
                style={{ accentColor: C.blue }} />
              <label htmlFor={`current-${exp.id}`} style={{ fontSize: '13px', color: C.subtle, cursor: 'pointer' }}>
                I currently work here
              </label>
            </div>
          </div>

          <label style={labelStyle}>Key Achievements & Responsibilities</label>
          {exp.bullets.map((bullet, bIdx) => (
            <div key={bIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: bullet.isAiEnhanced ? C.purple : C.blue, marginTop: '11px', flexShrink: 0 }} />
              <input
                style={{
                  ...inputStyle,
                  borderColor: bullet.isAiEnhanced ? 'rgba(139,92,246,0.3)' : C.border,
                  background: bullet.isAiEnhanced ? 'rgba(139,92,246,0.04)' : 'rgba(255,255,255,0.04)',
                  flex: 1,
                }}
                value={bullet.text}
                placeholder="Engineered a feature that reduced load time by 40%..."
                onChange={e => updateExpBullet(exp.id, bIdx, e.target.value)}
                onFocus={e => (e.target.style.borderColor = C.blue)}
                onBlur={e => (e.target.style.borderColor = bullet.isAiEnhanced ? 'rgba(139,92,246,0.3)' : C.border)}
              />
              {exp.bullets.length > 1 && (
                <button onClick={() => removeExpBullet(exp.id, bIdx)}
                  style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '16px', padding: '6px' }}>×</button>
              )}
            </div>
          ))}
          <button onClick={() => addExpBullet(exp.id)}
            style={{ ...aiBtn(false), color: C.green, borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.06)', marginTop: '4px' }}>
            + Add Bullet
          </button>
        </div>
      ))}
      <button onClick={() => setResume(r => ({ ...r, experience: [...r.experience, emptyExperience()] }))}
        style={{ ...aiBtn(false), color: C.blue, borderColor: 'rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.06)', padding: '10px 16px', fontSize: '13px' }}>
        + Add Experience
      </button>
    </div>
  );

  const renderEducation = () => (
    <div>
      <SectionHeader icon="🎓" title="Education" subtitle="Most recent degree first" />
      {resume.education.map((edu, idx) => (
        <div key={edu.id} style={{ ...sectionCardStyle, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: C.subtle }}>Education #{idx + 1}</span>
            {resume.education.length > 1 && (
              <button style={{ ...aiBtn(false), color: C.red, borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)' }}
                onClick={() => setResume(r => ({ ...r, education: r.education.filter(e => e.id !== edu.id) }))}>🗑️</button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Degree / Certificate', field: 'degree', placeholder: 'B.Tech in Computer Science' },
              { label: 'Institution', field: 'institution', placeholder: 'IIT Delhi' },
              { label: 'Location', field: 'location', placeholder: 'New Delhi, India' },
              { label: 'GPA / Percentage', field: 'gpa', placeholder: '9.2 / 10' },
              { label: 'Start Date', field: 'startDate', placeholder: 'Aug 2019' },
              { label: 'End Date', field: 'endDate', placeholder: 'May 2023' },
              { label: 'Honors / Awards', field: 'honors', placeholder: 'Dean\'s List, Gold Medalist', span: 2 },
            ].map(({ label, field, placeholder, span }) => (
              <div key={field} style={{ gridColumn: span === 2 ? '1 / -1' : undefined }}>
                <label style={labelStyle}>{label}</label>
                <input style={inputStyle} value={edu[field]} placeholder={placeholder}
                  onChange={e => updateEdu(edu.id, field, e.target.value)}
                  onFocus={e => (e.target.style.borderColor = C.blue)}
                  onBlur={e => (e.target.style.borderColor = C.border)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={() => setResume(r => ({ ...r, education: [...r.education, emptyEducation()] }))}
        style={{ ...aiBtn(false), color: C.blue, borderColor: 'rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.06)', padding: '10px 16px', fontSize: '13px' }}>
        + Add Education
      </button>
    </div>
  );

  const renderProjects = () => (
    <div>
      <SectionHeader icon="🚀" title="Projects" subtitle="Show off your best technical work" />
      {resume.projects.map((proj, pIdx) => (
        <div key={proj.id} style={{ ...sectionCardStyle, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: C.subtle }}>Project #{pIdx + 1}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={aiBtn(loadingAI[`proj-${proj.id}`])}
                onClick={() => enhanceBullets('proj', proj.id)} disabled={loadingAI[`proj-${proj.id}`]}>
                {loadingAI[`proj-${proj.id}`] ? '⏳ Enhancing...' : '✨ AI Enhance'}
              </button>
              {resume.projects.length > 1 && (
                <button style={{ ...aiBtn(false), color: C.red, borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)' }}
                  onClick={() => setResume(r => ({ ...r, projects: r.projects.filter(p => p.id !== proj.id) }))}>🗑️</button>
              )}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            {[
              { label: 'Project Name', field: 'name', placeholder: 'DevLeap AI Platform' },
              { label: 'Tech Stack', field: 'techStack', placeholder: 'React, Node.js, MongoDB, Gemini AI' },
              { label: 'Live Link / GitHub', field: 'link', placeholder: 'github.com/abhinav/devleap', span: 2 },
            ].map(({ label, field, placeholder, span }) => (
              <div key={field} style={{ gridColumn: span === 2 ? '1 / -1' : undefined }}>
                <label style={labelStyle}>{label}</label>
                <input style={inputStyle} value={proj[field]} placeholder={placeholder}
                  onChange={e => updateProject(proj.id, field, e.target.value)}
                  onFocus={e => (e.target.style.borderColor = C.blue)}
                  onBlur={e => (e.target.style.borderColor = C.border)}
                />
              </div>
            ))}
          </div>
          <label style={labelStyle}>Key Points / Impact</label>
          {proj.bullets.map((bullet, bIdx) => (
            <div key={bIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: bullet.isAiEnhanced ? C.purple : C.green, marginTop: '11px', flexShrink: 0 }} />
              <input
                style={{ ...inputStyle, flex: 1, borderColor: bullet.isAiEnhanced ? 'rgba(139,92,246,0.3)' : C.border }}
                value={bullet.text} placeholder="Built scalable REST API serving 10,000+ requests/day..."
                onChange={e => updateProjectBullet(proj.id, bIdx, e.target.value)}
                onFocus={e => (e.target.style.borderColor = C.blue)}
                onBlur={e => (e.target.style.borderColor = bullet.isAiEnhanced ? 'rgba(139,92,246,0.3)' : C.border)}
              />
              {proj.bullets.length > 1 && (
                <button onClick={() => removeProjectBullet(proj.id, bIdx)}
                  style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '16px', padding: '6px' }}>×</button>
              )}
            </div>
          ))}
          <button onClick={() => addProjectBullet(proj.id)}
            style={{ ...aiBtn(false), color: C.green, borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.06)', marginTop: '4px' }}>
            + Add Point
          </button>
        </div>
      ))}
      <button onClick={() => setResume(r => ({ ...r, projects: [...r.projects, emptyProject()] }))}
        style={{ ...aiBtn(false), color: C.blue, borderColor: 'rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.06)', padding: '10px 16px', fontSize: '13px' }}>
        + Add Project
      </button>
    </div>
  );

  const renderSkills = () => (
    <div>
      <SectionHeader icon="⚡" title="Skills" subtitle="Separate each skill with a comma" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {[
          { label: 'Programming Languages', field: 'languages', placeholder: 'Python, JavaScript, Java, C++, Go' },
          { label: 'Frameworks & Libraries', field: 'frameworks', placeholder: 'React, Node.js, Express, Django, Spring Boot' },
          { label: 'Databases & Cloud', field: 'technical', placeholder: 'MongoDB, PostgreSQL, AWS, Docker, Kubernetes' },
          { label: 'Tools & Platforms', field: 'tools', placeholder: 'Git, CI/CD, Jira, Linux, Figma' },
          { label: 'Soft Skills', field: 'soft', placeholder: 'Leadership, Problem Solving, Communication, Agile' },
        ].map(({ label, field, placeholder }) => (
          <div key={field}>
            <label style={labelStyle}>{label}</label>
            <input style={inputStyle} value={resume.skills[field]} placeholder={placeholder}
              onChange={e => setSkill(field, e.target.value)}
              onFocus={e => (e.target.style.borderColor = C.blue)}
              onBlur={e => (e.target.style.borderColor = C.border)}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const sectionMap = {
    personal: renderPersonal,
    summary: renderSummary,
    experience: renderExperience,
    education: renderEducation,
    projects: renderProjects,
    skills: renderSkills,
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RESUME PREVIEW
  // ═══════════════════════════════════════════════════════════════════════════
  const pi = resume.personalInfo;

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  // ── ATS score helpers ──────────────────────────────────────────────────────
  const atsScore = atsData?.score ?? 85;
  const atsGrade = atsData?.grade ?? (atsScore >= 85 ? 'Excellent' : atsScore >= 65 ? 'Good' : 'Needs Work');
  const atsDash = (atsScore / 100) * 100; // stroke-dasharray

  return (
    <>
      {/* ── Stitch styles + print ─────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
        @media print {
          body > * { display: none !important; }
          .resume-print-area { display: block !important; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 99999; background: white; }
        }
        .resume-print-area { display: none; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .ai-glow-btn { background: linear-gradient(135deg,#adc6ff,#d0bcff); position:relative; z-index:1; transition:all 0.3s; }
        .ai-glow-btn::before { content:''; position:absolute; inset:0; background:inherit; filter:blur(8px); opacity:0; z-index:-1; transition:opacity 0.3s; }
        .ai-glow-btn:hover::before { opacity:0.55; }
        .ai-enhance-btn { position:relative; overflow:hidden; transition:transform 0.2s; }
        .ai-enhance-btn:hover { transform:scale(1.04); }
        .ai-enhance-btn::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(139,92,246,0.35),transparent); animation:shine 3s infinite; }
        .ats-ring-glow { filter:drop-shadow(0 0 8px rgba(74,225,118,0.6)); transition:filter 0.3s; }
        .accordion-section:hover .ats-ring-glow { filter:drop-shadow(0 0 12px rgba(74,225,118,0.85)); }
        @keyframes shine { 0%{left:-100%} 20%{left:100%} 100%{left:100%} }
        @keyframes pulseGlow { 0%{box-shadow:0 0 10px rgba(139,92,246,0.3)} 50%{box-shadow:0 0 20px rgba(139,92,246,0.65)} 100%{box-shadow:0 0 10px rgba(139,92,246,0.3)} }
        .ai-badge-glow { animation: pulseGlow 2s infinite; }
        .section-nav-btn:hover { background: rgba(173,198,255,0.08) !important; color: #e4e1ea !important; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#09090f', fontFamily: 'Inter, sans-serif', paddingTop: '64px' }}>

        {/* ── Stitch Toolbar ── */}
        <div style={{
          position: 'sticky', top: '64px', zIndex: 50, height: '64px',
          background: 'rgba(9,9,15,0.85)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(66,71,84,0.2)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px',
        }}>
          {/* Left: role input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#8c909f' }}>work</span>
            <input
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#e4e1ea', fontSize: '14px', fontFamily: 'Inter,sans-serif', width: '100%', maxWidth: '340px' }}
              value={targetRole}
              placeholder="Target Role (e.g., Frontend Developer)"
              onChange={e => setTargetRole(e.target.value)}
            />
          </div>
          {/* Right: actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={analyzeAts} disabled={analyzingAts} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '7px',
              background: 'rgba(53,52,59,0.8)',
              border: '1px solid rgba(66,71,84,0.5)',
              color: '#c2c6d6', fontSize: '13px', fontWeight: 600,
              cursor: analyzingAts ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter,sans-serif', transition: 'all 0.2s',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>analytics</span>
              {analyzingAts ? 'Analyzing...' : 'ATS Score'}
            </button>
            <button onClick={saveResume} disabled={saving} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '7px',
              background: 'rgba(53,52,59,0.8)',
              border: '1px solid rgba(66,71,84,0.5)',
              color: '#c2c6d6', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all 0.2s',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>save</span>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button className="ai-glow-btn" onClick={handlePrint} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 16px', borderRadius: '8px',
              border: 'none', color: '#002e6a',
              fontSize: '11px', fontWeight: 800,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'Inter,sans-serif',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>download</span>
              Export PDF
            </button>
          </div>
        </div>

        {/* ── Split Workspace ── */}
        <div style={{ display: 'flex', height: 'calc(100vh - 128px)' }}>

          {/* ── LEFT PANE: Accordion Editor ── */}
          <section style={{
            width: '50%', flexShrink: 0,
            display: 'flex', flexDirection: 'column',
            borderRight: '1px solid rgba(66,71,84,0.2)',
            background: '#09090f', position: 'relative', zIndex: 10,
          }}>
            {/* Accordion section navigator */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {sections.map(sec => (
                <AccordionSection
                  key={sec.id}
                  id={sec.id}
                  label={sec.label}
                  matIcon={sec.matIcon}
                  active={activeSection === sec.id}
                  onToggle={() => setActiveSection(activeSection === sec.id ? null : sec.id)}
                  aiOptimized={sec.id === 'summary'}
                >
                  {sectionMap[sec.id]?.()}
                </AccordionSection>
              ))}

              {/* ATS results if available */}
              {showAtsPanel && atsData && (
                <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(66,71,84,0.3)', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#e4e1ea' }}>ATS Analysis</span>
                    <button onClick={() => setShowAtsPanel(false)} style={{ background: 'none', border: 'none', color: '#8c909f', cursor: 'pointer', fontSize: '16px' }}>×</button>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#4ae176', margin: '0 0 4px' }}>✅ Strengths</p>
                    {atsData.strengths.map((s, i) => <p key={i} style={{ fontSize: '11px', color: '#c2c6d6', margin: '2px 0', paddingLeft: '8px' }}>• {s}</p>)}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', margin: '0 0 4px' }}>⚠️ Improve</p>
                    {atsData.improvements.map((s, i) => <p key={i} style={{ fontSize: '11px', color: '#c2c6d6', margin: '2px 0', paddingLeft: '8px' }}>• {s}</p>)}
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#ffb4ab', margin: '0 0 4px' }}>🔑 Missing Keywords</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {atsData.missingKeywords.map((kw, i) => (
                        <span key={i} style={{ fontSize: '10px', background: 'rgba(255,180,171,0.1)', border: '1px solid rgba(255,180,171,0.25)', borderRadius: '4px', padding: '2px 6px', color: '#ffb4ab' }}>{kw}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── RIGHT PANE: Live Preview ── */}
          <section style={{
            width: '50%', flexShrink: 0,
            background: '#e8eaf0', display: 'flex', flexDirection: 'column',
            position: 'relative', boxShadow: 'inset 2px 0 12px rgba(0,0,0,0.15)',
          }}>
            {/* Floating ATS Score Badge */}
            <div style={{
              position: 'absolute', top: '20px', right: '20px', zIndex: 20,
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '9999px',
              padding: '6px 16px 6px 6px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              cursor: 'help',
              transition: 'transform 0.3s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              title="ATS Score based on Target Role"
            >
              <div style={{ position: 'relative', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 36 36" width="40" height="40" style={{ transform: 'rotate(-90deg)' }} className="ats-ring-glow">
                  <defs>
                    <linearGradient id="atsGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4ae176" />
                      <stop offset="100%" stopColor="#4d8eff" />
                    </linearGradient>
                  </defs>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="url(#atsGrad)" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${atsDash}, 100`} />
                </svg>
                <span style={{ position: 'absolute', fontSize: '11px', fontWeight: 800, color: '#111827' }}>{atsScore}</span>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>ATS Match</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{atsGrade}</div>
              </div>
            </div>

            {/* Preview Canvas */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
              {/* White Paper Resume */}
              <div ref={printRef} className="resume-preview" style={{
                width: '800px', minHeight: '1131px',
                background: '#fff', color: '#111827',
                boxShadow: '0 8px 48px rgba(0,0,0,0.2)',
                borderRadius: '2px', padding: '48px 48px',
                flexShrink: 0,
                transform: 'scale(0.85)', transformOrigin: 'top center',
                border: '1px solid #e5e7eb',
                fontFamily: '"Merriweather", serif',
              }}>
              {/* Header */}
              <div style={{ borderBottom: '2px solid #1e3a5f', paddingBottom: '14px', marginBottom: '16px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: 900, margin: '0 0 4px', color: '#0f1f3d', letterSpacing: '-0.3px' }}>
                  {pi.fullName || 'Your Name'}
                </h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontSize: '11px', color: '#334155' }}>
                  {pi.email && <span>✉ {pi.email}</span>}
                  {pi.phone && <span>📞 {pi.phone}</span>}
                  {pi.location && <span>📍 {pi.location}</span>}
                  {pi.linkedin && <span>🔗 {pi.linkedin}</span>}
                  {pi.github && <span>💻 {pi.github}</span>}
                  {pi.portfolio && <span>🌐 {pi.portfolio}</span>}
                </div>
              </div>

              {/* Summary */}
              {resume.summary && (
                <ResumeSection title="PROFESSIONAL SUMMARY">
                  <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#1e293b', margin: 0 }}>{resume.summary}</p>
                </ResumeSection>
              )}

              {/* Experience */}
              {resume.experience.some(e => e.jobTitle || e.company) && (
                <ResumeSection title="EXPERIENCE">
                  {resume.experience.filter(e => e.jobTitle || e.company).map(exp => (
                    <div key={exp.id} style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f1f3d' }}>{exp.jobTitle}</span>
                          {exp.company && <span style={{ fontSize: '12px', color: '#334155' }}> · {exp.company}</span>}
                          {exp.location && <span style={{ fontSize: '11px', color: '#64748b' }}> · {exp.location}</span>}
                        </div>
                        <span style={{ fontSize: '11px', color: '#475569', whiteSpace: 'nowrap' }}>
                          {exp.startDate}{(exp.startDate || exp.endDate) && ' — '}{exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      <ul style={{ margin: '5px 0 0 0', paddingLeft: '16px' }}>
                        {exp.bullets.filter(b => b.text.trim()).map((b, i) => (
                          <li key={i} style={{ fontSize: '12px', lineHeight: 1.55, color: '#1e293b', marginBottom: '3px' }}>
                            {b.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </ResumeSection>
              )}

              {/* Education */}
              {resume.education.some(e => e.degree || e.institution) && (
                <ResumeSection title="EDUCATION">
                  {resume.education.filter(e => e.degree || e.institution).map(edu => (
                    <div key={edu.id} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f1f3d' }}>{edu.degree}</span>
                          {edu.institution && <span style={{ fontSize: '12px', color: '#334155' }}> · {edu.institution}</span>}
                        </div>
                        <span style={{ fontSize: '11px', color: '#475569' }}>
                          {edu.startDate}{(edu.startDate || edu.endDate) && ' — '}{edu.endDate}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                        {edu.gpa && `GPA: ${edu.gpa}`}{edu.gpa && edu.honors && ' · '}{edu.honors}
                        {edu.location && ` · ${edu.location}`}
                      </div>
                    </div>
                  ))}
                </ResumeSection>
              )}

              {/* Projects */}
              {resume.projects.some(p => p.name) && (
                <ResumeSection title="PROJECTS">
                  {resume.projects.filter(p => p.name).map(proj => (
                    <div key={proj.id} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f1f3d' }}>{proj.name}</span>
                          {proj.techStack && <span style={{ fontSize: '11px', color: '#6366f1' }}> | {proj.techStack}</span>}
                        </div>
                        {proj.link && <span style={{ fontSize: '11px', color: '#3b82f6' }}>{proj.link}</span>}
                      </div>
                      <ul style={{ margin: '5px 0 0 0', paddingLeft: '16px' }}>
                        {proj.bullets.filter(b => b.text.trim()).map((b, i) => (
                          <li key={i} style={{ fontSize: '12px', lineHeight: 1.55, color: '#1e293b', marginBottom: '3px' }}>{b.text}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </ResumeSection>
              )}

              {/* Skills */}
              {Object.values(resume.skills).some(s => s.trim()) && (
                <ResumeSection title="SKILLS">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {[
                      { label: 'Languages', value: resume.skills.languages },
                      { label: 'Frameworks', value: resume.skills.frameworks },
                      { label: 'Databases & Cloud', value: resume.skills.technical },
                      { label: 'Tools', value: resume.skills.tools },
                      { label: 'Soft Skills', value: resume.skills.soft },
                    ].filter(s => s.value.trim()).map(s => (
                      <div key={s.label} style={{ fontSize: '12px', color: '#1e293b' }}>
                        <span style={{ fontWeight: 700 }}>{s.label}: </span>
                        <span>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </ResumeSection>
              )}
              </div>{/* end white paper */}
            </div>{/* end preview canvas */}

            {/* Zoom controls */}
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', gap: '8px' }}>
              {[{ icon: 'zoom_out', label: 'zoom out' }, { icon: 'zoom_in', label: 'zoom in' }].map(btn => (
                <button key={btn.icon} title={btn.label} style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: '#fff', border: '1px solid #e5e7eb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#6b7280', cursor: 'pointer',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                  transition: 'all 0.15s',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{btn.icon}</span>
                </button>
              ))}
            </div>
          </section>
        </div>{/* end split */}
      </div>{/* end main bg */}

      {/* Hidden print area — mirrors the preview */}
      <div className="resume-print-area">
        <div style={{
          background: '#fff', color: '#111', padding: '40px 48px',
          fontFamily: '"Times New Roman", serif', maxWidth: '800px', margin: '0 auto',
        }}>
          <div style={{ borderBottom: '2px solid #1e3a5f', paddingBottom: '14px', marginBottom: '16px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 900, margin: '0 0 4px', color: '#0f1f3d' }}>{pi.fullName || 'Your Name'}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontSize: '11px', color: '#334155' }}>
              {pi.email && <span>✉ {pi.email}</span>}
              {pi.phone && <span>📞 {pi.phone}</span>}
              {pi.location && <span>📍 {pi.location}</span>}
              {pi.linkedin && <span>🔗 {pi.linkedin}</span>}
              {pi.github && <span>💻 {pi.github}</span>}
              {pi.portfolio && <span>🌐 {pi.portfolio}</span>}
            </div>
          </div>
          {resume.summary && (
            <div style={{ marginBottom: '14px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.12em', color: '#1e3a5f', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', margin: '0 0 8px' }}>PROFESSIONAL SUMMARY</h2>
              <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#1e293b', margin: 0 }}>{resume.summary}</p>
            </div>
          )}
          {resume.experience.some(e => e.jobTitle || e.company) && (
            <div style={{ marginBottom: '14px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.12em', color: '#1e3a5f', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', margin: '0 0 8px' }}>EXPERIENCE</h2>
              {resume.experience.filter(e => e.jobTitle || e.company).map(exp => (
                <div key={exp.id} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div><strong style={{ fontSize: '12px' }}>{exp.jobTitle}</strong>{exp.company && ` · ${exp.company}`}{exp.location && ` · ${exp.location}`}</div>
                    <span style={{ fontSize: '11px', color: '#475569' }}>{exp.startDate}{(exp.startDate || exp.endDate) && ' — '}{exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <ul style={{ margin: '4px 0 0', paddingLeft: '16px' }}>
                    {exp.bullets.filter(b => b.text.trim()).map((b, i) => <li key={i} style={{ fontSize: '11.5px', lineHeight: 1.55, marginBottom: '2px' }}>{b.text}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {resume.education.some(e => e.degree || e.institution) && (
            <div style={{ marginBottom: '14px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.12em', color: '#1e3a5f', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', margin: '0 0 8px' }}>EDUCATION</h2>
              {resume.education.filter(e => e.degree || e.institution).map(edu => (
                <div key={edu.id} style={{ marginBottom: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div><strong>{edu.degree}</strong>{edu.institution && ` · ${edu.institution}`}</div>
                    <span style={{ fontSize: '11px', color: '#475569' }}>{edu.startDate}{(edu.startDate || edu.endDate) && ' — '}{edu.endDate}</span>
                  </div>
                  {(edu.gpa || edu.honors) && <div style={{ fontSize: '11px', color: '#475569' }}>{edu.gpa && `GPA: ${edu.gpa}`}{edu.gpa && edu.honors && ' · '}{edu.honors}</div>}
                </div>
              ))}
            </div>
          )}
          {resume.projects.some(p => p.name) && (
            <div style={{ marginBottom: '14px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.12em', color: '#1e3a5f', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', margin: '0 0 8px' }}>PROJECTS</h2>
              {resume.projects.filter(p => p.name).map(proj => (
                <div key={proj.id} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <div><strong>{proj.name}</strong>{proj.techStack && ` | ${proj.techStack}`}</div>
                    {proj.link && <span style={{ fontSize: '11px', color: '#3b82f6' }}>{proj.link}</span>}
                  </div>
                  <ul style={{ margin: '4px 0 0', paddingLeft: '16px' }}>
                    {proj.bullets.filter(b => b.text.trim()).map((b, i) => <li key={i} style={{ fontSize: '11.5px', lineHeight: 1.55, marginBottom: '2px' }}>{b.text}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {Object.values(resume.skills).some(s => s.trim()) && (
            <div>
              <h2 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.12em', color: '#1e3a5f', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', margin: '0 0 8px' }}>SKILLS</h2>
              {[
                { label: 'Languages', value: resume.skills.languages },
                { label: 'Frameworks', value: resume.skills.frameworks },
                { label: 'Databases & Cloud', value: resume.skills.technical },
                { label: 'Tools', value: resume.skills.tools },
              ].filter(s => s.value.trim()).map(s => (
                <div key={s.label} style={{ fontSize: '11.5px', marginBottom: '3px' }}>
                  <strong>{s.label}: </strong>{s.value}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Stitch Accordion Section ────────────────────────────────────────────────
function AccordionSection({ id, label, matIcon, active, onToggle, aiOptimized, children }) {
  return (
    <div className="accordion-section" style={{
      background: active ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
      backdropFilter: 'blur(24px)',
      border: active ? '1px solid rgba(173,198,255,0.2)' : '1px solid rgba(255,255,255,0.06)',
      borderRadius: '10px', overflow: 'hidden', marginBottom: '10px',
      boxShadow: active ? '0 0 0 1px rgba(173,198,255,0.1) inset' : 'none',
      transition: 'all 0.2s',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '13px 16px', background: 'rgba(255,255,255,0.04)',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: aiOptimized ? '#8b5cf6' : '#adc6ff' }}>{matIcon}</span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#e4e1ea', letterSpacing: '-0.02em' }}>{label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {aiOptimized && (
            <span className="ai-badge-glow" style={{
              fontSize: '10px', color: '#c4b5fd', background: 'rgba(139,92,246,0.15)',
              padding: '2px 8px', borderRadius: '9999px', fontWeight: 700,
              border: '1px solid rgba(139,92,246,0.4)', letterSpacing: '0.03em',
            }}>✨ AI Optimized</span>
          )}
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#8c909f', transform: active ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>expand_more</span>
        </div>
      </button>
      {active && (
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#e4e1ea', margin: 0 }}>{title}</h2>
      </div>
      <p style={{ fontSize: '12px', color: '#8c909f', margin: '0 0 0 26px' }}>{subtitle}</p>
    </div>
  );
}

function ResumeSection({ title, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <h2 style={{
        fontSize: '12px', fontWeight: 900, letterSpacing: '0.12em', color: '#1e3a5f',
        borderBottom: '1.5px solid #cbd5e1', paddingBottom: '3px', margin: '0 0 10px',
        textTransform: 'uppercase',
      }}>{title}</h2>
      {children}
    </div>
  );
}
