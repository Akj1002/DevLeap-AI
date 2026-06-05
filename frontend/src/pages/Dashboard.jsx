import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../services/api';
import Editor from '@monaco-editor/react';

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

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_SOLUTIONS = [
  {
    id: 1,
    user: 'alexcoder',
    avatar: 'A',
    lang: 'Python',
    langColor: S.primary,
    upvotes: 342,
    time: '2h ago',
    code: `def twoSum(self, nums, target):
    seen = {}
    for i, n in enumerate(nums):
        diff = target - n
        if diff in seen:
            return [seen[diff], i]
        seen[n] = i`,
  },
  {
    id: 2,
    user: 'cpp_wizard',
    avatar: 'C',
    lang: 'C++',
    langColor: '#06b6d4',
    upvotes: 218,
    time: '5h ago',
    code: `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int,int> mp;
    for(int i=0;i<nums.size();i++){
        if(mp.count(target-nums[i]))
            return {mp[target-nums[i]],i};
        mp[nums[i]]=i;
    }
    return {};
}`,
  },
  {
    id: 3,
    user: 'java_dev99',
    avatar: 'J',
    lang: 'Java',
    langColor: '#f59e0b',
    upvotes: 157,
    time: '1d ago',
    code: `public int[] twoSum(int[] nums, int target) {
    Map<Integer,Integer> map = new HashMap<>();
    for(int i=0;i<nums.length;i++){
        int diff=target-nums[i];
        if(map.containsKey(diff))
            return new int[]{map.get(diff),i};
        map.put(nums[i],i);
    }
    return new int[]{};
}`,
  },
];

const MOCK_SUBMISSIONS = [
  { date: '2026-05-24', status: 'Accepted', runtime: '52 ms', memory: '14.2 MB', lang: 'Python 3' },
  { date: '2026-05-23', status: 'Wrong Answer', runtime: 'N/A', memory: 'N/A', lang: 'Python 3' },
  { date: '2026-05-22', status: 'Accepted', runtime: '48 ms', memory: '13.9 MB', lang: 'C++' },
  { date: '2026-05-20', status: 'Time Limit Exceeded', runtime: 'N/A', memory: 'N/A', lang: 'Java' },
  { date: '2026-05-18', status: 'Accepted', runtime: '60 ms', memory: '15.1 MB', lang: 'JavaScript' },
];

const DEFAULT_QUESTION = {
  id: 1,
  title: 'Two Sum',
  difficulty: 'Easy',
  tags: ['Array', 'Hash Table'],
  companies: ['Google', 'Amazon', 'Meta'],
  description: `<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to target</em>.</p>
<p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.</p>
<p>You can return the answer in any order.</p>`,
  examples: [
    { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
    { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].' },
    { input: 'nums = [3,3], target = 6', output: '[0,1]', explanation: '' },
  ],
  constraints: [
    '2 <= nums.length <= 10⁴',
    '-10⁹ <= nums[i] <= 10⁹',
    '-10⁹ <= target <= 10⁹',
    'Only one valid answer exists.',
  ],
  hints: [
    'A really brute force way would be to search for all possible pairs of numbers but that would be too slow.',
    'Try using a hash map to store numbers you have already seen.',
  ],
  testCases: [
    { input: 'nums = [2,7,11,15]\ntarget = 9' },
    { input: 'nums = [3,2,4]\ntarget = 6' },
    { input: 'nums = [3,3]\ntarget = 6' },
  ],
  starterCode: {
    'Python 3': `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Write your solution here
        pass
`,
    'C++': `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
    }
};
`,
    Java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
    }
}
`,
    JavaScript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Write your solution here
};
`,
  },
};

const LANG_MAP = {
  'Python 3': 'python',
  'C++': 'cpp',
  Java: 'java',
  JavaScript: 'javascript',
};

// ─── Helper: format seconds as MM:SS ─────────────────────────────────────────
const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// ─── Difficulty Badge ─────────────────────────────────────────────────────────
const DifficultyBadge = ({ difficulty }) => {
  const map = {
    Easy: { bg: 'rgba(34,197,94,0.15)', color: S.tertiary, border: 'rgba(34,197,94,0.3)' },
    Medium: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
    Hard: { bg: 'rgba(239,68,68,0.15)', color: S.error, border: 'rgba(239,68,68,0.3)' },
  };
  const d = map[difficulty] || map.Easy;
  return (
    <span style={{
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
      background: d.bg,
      color: d.color,
      border: `1px solid ${d.border}`,
    }}>
      {difficulty}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Question state
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);

  // Editor state
  const [language, setLanguage] = useState('Python 3');
  const [code, setCode] = useState('');

  // UI state
  const [leftTab, setLeftTab] = useState('description');
  const [consoleTab, setConsoleTab] = useState('testcases');
  const [selectedCase, setSelectedCase] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [revealedHints, setRevealedHints] = useState([]);

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const timerRef = useRef(null);

  // Run/Submit state
  const [runResult, setRunResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // DevAI state
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Hover states
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [hoveredConsoleTab, setHoveredConsoleTab] = useState(null);

  // ── Fetch Question ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchQuestion = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/questions/${id || 1}`);
        const q = res;
        setQuestion(q);
        const defaultCode = q.starterCode?.[language] || DEFAULT_QUESTION.starterCode[language];
        setCode(defaultCode);
      } catch {
        // Fallback to mock
        setQuestion(DEFAULT_QUESTION);
        setCode(DEFAULT_QUESTION.starterCode[language]);
      } finally {
        setLoading(false);
      }
    };

    const fetchSubmissions = async () => {
      const userId = localStorage.getItem('devleap_user_id');
      if (!userId) return;
      try {
        const res = await axios.get(`/users/${userId}/progress`);
        if (res && res.history) {
           const subId = id || 1;
           const qHistory = res.history.filter(h => h.questionId && (h.questionId._id == subId || h.questionId.id == subId || h.questionId == subId));
           const mapped = qHistory.map(h => ({
             date: new Date(h.solvedAt).toISOString().split('T')[0],
             status: 'Accepted',
             runtime: h.timeSpent ? h.timeSpent + ' ms' : 'N/A',
             memory: 'N/A',
             lang: h.language || 'Python 3'
           })).reverse();
           setSubmissions(mapped.length ? mapped : MOCK_SUBMISSIONS);
        } else {
           setSubmissions(MOCK_SUBMISSIONS);
        }
      } catch (e) {
        setSubmissions(MOCK_SUBMISSIONS);
      }
    };

    fetchQuestion();
    fetchSubmissions();
  }, [id]);

  // ── Update code on language change ─────────────────────────────────────────
  useEffect(() => {
    const q = question || DEFAULT_QUESTION;
    setCode(q.starterCode?.[language] || DEFAULT_QUESTION.starterCode[language] || '');
  }, [language]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  // ── Handle Run ─────────────────────────────────────────────────────────────
  const handleRun = async () => {
    setIsRunning(true);
    setConsoleTab('testresult');
    setRunResult(null);
    try {
      const res = await axios.post('/code/run', {
        code,
        language,
        input: customInput || question?.testCases?.[selectedCase]?.input || '',
        questionId: id || 1,
      });
      setRunResult(res);
    } catch {
      setRunResult({
        status: 'Error',
        runtime: 'N/A',
        memory: 'N/A',
        stdout: 'Could not connect to judge server. Please try again.',
        error: true,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // ── Handle Submit ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setConsoleTab('testresult');
    setRunResult(null);
    try {
      const runRes = await axios.post('/code/run', {
        code,
        language,
        questionId: id || 1,
        submit: true,
      });
      setRunResult({ ...runRes, submitted: true });
      if (runRes.status === 'Accepted') {
        await axios.post('/users/solve', {
          userId: localStorage.getItem('devleap_user_id'),
          questionId: id || 1,
          language,
          runtime: runRes.runtime,
          memory: runRes.memory,
        });
      }
    } catch {
      setRunResult({
        status: 'Error',
        runtime: 'N/A',
        memory: 'N/A',
        stdout: 'Submission failed. Check your connection.',
        error: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Ask DevAI ──────────────────────────────────────────────────────────────
  const handleAskDevAI = async () => {
    setAiLoading(true);
    setConsoleTab('devai');
    try {
      const res = await axios.post('/ai/chat', {
        message: `I'm working on "${question?.title}". Here is my current code:\n\n${code}\n\nCan you help me debug or improve it?`,
        questionId: id || 1,
        context: question?.description || '',
      });
      setAiResponse(res.reply || res.message || 'No response from DevAI.');
    } catch {
      setAiResponse('⚠️ DevAI is currently unavailable. Please try again later.');
    } finally {
      setAiLoading(false);
    }
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
  const s = {
    root: {
      height: '100vh',
      display: 'flex',
      background: S.bg,
      fontFamily: 'Inter, sans-serif',
      overflow: 'hidden',
    },
    loading: {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: S.bg,
      gap: '16px',
    },
    loadingSpinner: {
      width: '44px',
      height: '44px',
      border: '3px solid rgba(59,130,246,0.2)',
      borderTop: '3px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 0.9s linear infinite',
    },
    loadingText: {
      color: '#64748b',
      fontSize: '14px',
      fontWeight: 500,
    },

    // ── LEFT PANEL ──
    leftPanel: {
      width: '45%',
      display: 'flex',
      flexDirection: 'column',
      background: '#0f172a',
      borderRight: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden',
    },

    // Breadcrumb
    breadcrumb: {
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(0,0,0,0.2)',
    },
    breadcrumbText: {
      fontSize: '12px',
      color: S.outlineVar,
    },
    breadcrumbTitle: {
      color: S.outline,
      fontWeight: 500,
    },
    breadcrumbArrows: {
      display: 'flex',
      gap: '4px',
    },
    arrowBtn: (hovered) => ({
      width: '26px',
      height: '26px',
      borderRadius: '6px',
      background: hovered ? S.outlineVar : 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
      color: '#64748b',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      transition: 'background 0.15s',
    }),

    // Tab bar
    tabBar: {
      display: 'flex',
      background: 'rgba(0,0,0,0.25)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '0 12px',
    },
    tab: (active, hovered) => ({
      padding: '10px 16px',
      fontSize: '13px',
      fontWeight: active ? 600 : 500,
      color: active ? S.text : hovered ? '#cbd5e1' : '#64748b',
      cursor: 'pointer',
      borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
      transition: 'color 0.15s, border-color 0.15s',
      userSelect: 'none',
      whiteSpace: 'nowrap',
    }),

    // Description scroll area
    descScroll: {
      flex: 1,
      overflowY: 'auto',
      padding: '20px',
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(255,255,255,0.1) transparent',
    },

    // Problem title
    problemTitle: {
      fontSize: '20px',
      fontWeight: 700,
      color: S.text,
      marginBottom: '12px',
      lineHeight: 1.3,
    },

    // Tags row
    tagsRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap',
      marginBottom: '16px',
    },
    iconBtn: (hovered) => ({
      width: '30px',
      height: '30px',
      borderRadius: '8px',
      background: hovered ? S.outlineVar : 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'background 0.15s',
    }),
    topicTag: {
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 500,
      background: 'rgba(59,130,246,0.12)',
      color: '#60a5fa',
      border: '1px solid rgba(59,130,246,0.2)',
      cursor: 'default',
    },
    companyTag: {
      padding: '3px 8px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: 500,
      background: S.surfaceHigh,
      color: '#64748b',
      border: '1px solid rgba(255,255,255,0.06)',
    },
    sectionLabel: {
      fontSize: '13px',
      fontWeight: 600,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      marginBottom: '6px',
      marginTop: '18px',
    },
    descriptionDiv: {
      fontSize: '14px',
      lineHeight: 1.75,
      color: '#cbd5e1',
    },
    exampleBlock: {
      background: 'rgba(0,0,0,0.35)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px',
      padding: '14px',
      marginBottom: '10px',
    },
    exampleLabel: {
      fontSize: '12px',
      fontWeight: 600,
      color: S.outlineVar,
      marginBottom: '8px',
    },
    exampleCode: {
      fontFamily: '"Fira Code", monospace',
      fontSize: '13px',
      color: S.outline,
      lineHeight: 1.6,
    },
    exampleExplanation: {
      fontSize: '12.5px',
      color: '#64748b',
      marginTop: '6px',
      fontStyle: 'italic',
    },
    constraintList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    constraintItem: {
      fontSize: '13px',
      color: S.outline,
      fontFamily: '"Fira Code", monospace',
      padding: '5px 10px',
      background: 'rgba(0,0,0,0.25)',
      borderRadius: '6px',
      borderLeft: '3px solid rgba(59,130,246,0.4)',
    },
    hintRevealBtn: (revealed, hovered) => ({
      padding: '7px 14px',
      borderRadius: '8px',
      fontSize: '12.5px',
      fontWeight: 500,
      background: revealed ? 'rgba(139,92,246,0.15)' : hovered ? 'rgba(139,92,246,0.1)' : S.surfaceHigh,
      color: revealed ? '#a78bfa' : '#64748b',
      border: `1px solid ${revealed ? 'rgba(139,92,246,0.3)' : S.outlineVar}`,
      cursor: 'pointer',
      transition: 'all 0.2s',
      marginBottom: '6px',
    }),
    hintText: {
      fontSize: '13px',
      color: S.outline,
      lineHeight: 1.65,
      padding: '10px 12px',
      background: 'rgba(139,92,246,0.07)',
      borderRadius: '8px',
      border: '1px solid rgba(139,92,246,0.15)',
      marginBottom: '8px',
    },

    // Placeholder tabs
    placeholderTab: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: S.outlineVar,
      gap: '12px',
    },
    placeholderIcon: {
      fontSize: '40px',
      opacity: 0.5,
    },
    placeholderText: {
      fontSize: '15px',
      fontWeight: 600,
      color: S.outlineVar,
    },
    placeholderSub: {
      fontSize: '13px',
      color: '#334155',
    },

    // Solutions cards
    solutionCard: (hovered) => ({
      background: hovered ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px',
      padding: '14px',
      marginBottom: '12px',
      transition: 'background 0.15s',
      cursor: 'pointer',
    }),
    solutionHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '10px',
    },
    solutionUser: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    solutionAvatar: (color) => ({
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}, #8b5cf6)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: 700,
      color: '#fff',
    }),
    solutionUserName: {
      fontSize: '13px',
      fontWeight: 600,
      color: S.outline,
    },
    solutionMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    langBadge: (color) => ({
      padding: '2px 8px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: 600,
      background: `${color}20`,
      color: color,
      border: `1px solid ${color}40`,
    }),
    upvoteBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '12px',
      color: '#64748b',
    },
    solutionCode: {
      fontFamily: '"Fira Code", monospace',
      fontSize: '12px',
      color: S.outline,
      background: 'rgba(0,0,0,0.35)',
      borderRadius: '8px',
      padding: '10px',
      overflow: 'auto',
      lineHeight: 1.6,
      whiteSpace: 'pre',
    },
    solutionTime: {
      fontSize: '11px',
      color: S.outlineVar,
    },

    // Submissions table
    submTable: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '13px',
    },
    submTh: {
      textAlign: 'left',
      padding: '10px 12px',
      color: S.outlineVar,
      fontWeight: 600,
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '0.6px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    submTd: {
      padding: '12px',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      color: S.outline,
    },

    // ── RIGHT PANEL ──
    rightPanel: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },

    // Action bar
    actionBar: {
      height: '50px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      background: '#0f172a',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      gap: '12px',
      flexShrink: 0,
    },
    langSelect: {
      padding: '6px 10px',
      background: S.surfaceHigh,
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      color: '#cbd5e1',
      fontSize: '13px',
      fontWeight: 500,
      cursor: 'pointer',
      outline: 'none',
      fontFamily: 'Inter, sans-serif',
    },
    timerSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    timerDisplay: {
      fontFamily: '"Fira Code", monospace',
      fontSize: '15px',
      fontWeight: 600,
      color: S.outline,
      minWidth: '52px',
      textAlign: 'center',
    },
    timerBtn: (hovered) => ({
      width: '28px',
      height: '28px',
      borderRadius: '7px',
      background: hovered ? S.outlineVar : S.surfaceHigh,
      border: '1px solid rgba(255,255,255,0.08)',
      color: '#64748b',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '11px',
      transition: 'background 0.15s',
    }),
    actionBtns: {
      display: 'flex',
      gap: '8px',
    },
    devaiBtn: (hovered) => ({
      padding: '7px 14px',
      borderRadius: '8px',
      background: hovered ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.12)',
      border: '1px solid rgba(245,158,11,0.3)',
      color: '#f59e0b',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      fontFamily: 'Inter, sans-serif',
    }),
    runBtn: (hovered) => ({
      padding: '7px 14px',
      borderRadius: '8px',
      background: hovered ? S.outlineVar : 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)',
      color: '#cbd5e1',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontFamily: 'Inter, sans-serif',
    }),
    submitBtn: (hovered, loading) => ({
      padding: '7px 16px',
      borderRadius: '8px',
      background: loading ? 'rgba(34,197,94,0.1)' : hovered ? 'rgba(34,197,94,0.25)' : 'rgba(34,197,94,0.15)',
      border: '1px solid rgba(34,197,94,0.35)',
      color: S.tertiary,
      fontSize: '13px',
      fontWeight: 600,
      cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s',
      fontFamily: 'Inter, sans-serif',
      opacity: loading ? 0.7 : 1,
    }),

    // Monaco editor wrapper
    editorWrapper: {
      flex: 1,
      overflow: 'hidden',
    },

    // Console panel
    consolePanel: {
      height: '35%',
      display: 'flex',
      flexDirection: 'column',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      background: S.bg,
      flexShrink: 0,
    },
    consoleTabBar: {
      display: 'flex',
      background: 'rgba(15,23,42,0.8)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '0 12px',
      flexShrink: 0,
    },
    consoleContent: {
      flex: 1,
      overflow: 'auto',
      padding: '14px',
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(255,255,255,0.08) transparent',
    },

    // Test cases
    caseBtn: (active, hovered) => ({
      padding: '5px 14px',
      borderRadius: '20px',
      fontSize: '12.5px',
      fontWeight: 500,
      background: active ? 'rgba(59,130,246,0.2)' : hovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${active ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.07)'}`,
      color: active ? '#60a5fa' : '#64748b',
      cursor: 'pointer',
      transition: 'all 0.15s',
      fontFamily: 'Inter, sans-serif',
    }),
    caseInput: {
      width: '100%',
      background: 'rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '8px',
      padding: '10px 12px',
      color: S.outline,
      fontSize: '13px',
      fontFamily: '"Fira Code", monospace',
      outline: 'none',
      marginTop: '10px',
      resize: 'vertical',
      minHeight: '60px',
    },
    customInputLabel: {
      fontSize: '12px',
      color: S.outlineVar,
      fontWeight: 500,
      marginTop: '12px',
      display: 'block',
    },

    // Run result
    resultStatus: (status) => {
      const map = {
        Accepted: { color: S.tertiary, bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)' },
        'Wrong Answer': { color: S.error, bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
        'Time Limit Exceeded': { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
        Error: { color: S.error, bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
      };
      const r = map[status] || map['Error'];
      return {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 700,
        background: r.bg,
        color: r.color,
        border: `1px solid ${r.border}`,
        marginBottom: '12px',
      };
    },
    resultMeta: {
      display: 'flex',
      gap: '20px',
      marginBottom: '12px',
    },
    resultMetaItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    },
    resultMetaLabel: {
      fontSize: '11px',
      color: S.outlineVar,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    resultMetaValue: {
      fontSize: '14px',
      fontWeight: 600,
      color: S.outline,
    },
    resultStdout: {
      background: 'rgba(0,0,0,0.35)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '8px',
      padding: '10px 12px',
      fontFamily: '"Fira Code", monospace',
      fontSize: '12.5px',
      color: S.outline,
      whiteSpace: 'pre-wrap',
      lineHeight: 1.6,
    },
    noResultText: {
      color: '#334155',
      fontSize: '13px',
      textAlign: 'center',
      marginTop: '20px',
    },

    // DevAI panel
    devaiPanel: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    },
    devaiHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '12px',
    },
    devaiIcon: {
      fontSize: '20px',
    },
    devaiTitle: {
      fontSize: '14px',
      fontWeight: 700,
      color: '#f59e0b',
    },
    devaiResponse: {
      flex: 1,
      background: 'rgba(245,158,11,0.05)',
      border: '1px solid rgba(245,158,11,0.15)',
      borderRadius: '10px',
      padding: '12px',
      fontSize: '13.5px',
      color: '#cbd5e1',
      lineHeight: 1.7,
      overflow: 'auto',
      whiteSpace: 'pre-wrap',
    },
    devaiEmpty: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      opacity: 0.5,
    },
  };

  const q = question || DEFAULT_QUESTION;

  const getStatusIcon = (status) => {
    if (status === 'Accepted') return '✅';
    if (status === 'Wrong Answer') return '❌';
    if (status === 'Time Limit Exceeded') return '⏱️';
    return '⚠️';
  };

  const getSubmStatusColor = (status) => {
    if (status === 'Accepted') return S.tertiary;
    if (status === 'Wrong Answer') return S.error;
    if (status === 'Time Limit Exceeded') return '#f59e0b';
    return S.outline;
  };

  // ── LEFT PANEL CONTENT ─────────────────────────────────────────────────────
  const renderLeftContent = () => {
    if (leftTab === 'description') {
      return (
        <div style={s.descScroll}>
          {/* Title */}
          <div style={s.problemTitle}>{q.id}. {q.title}</div>

          {/* Difficulty + icons row */}
          <div style={s.tagsRow}>
            <DifficultyBadge difficulty={q.difficulty} />
            <div
              style={s.iconBtn(hoveredBtn === 'heart')}
              onMouseEnter={() => setHoveredBtn('heart')}
              onMouseLeave={() => setHoveredBtn(null)}
              title="Like"
            >🤍</div>
            <div
              style={s.iconBtn(hoveredBtn === 'bookmark')}
              onMouseEnter={() => setHoveredBtn('bookmark')}
              onMouseLeave={() => setHoveredBtn(null)}
              title="Bookmark"
            >🔖</div>
          </div>

          {/* Topic tags */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
            {(q.tags || []).map((tag) => (
              <span key={tag} style={s.topicTag}>{tag}</span>
            ))}
          </div>

          {/* Company tags */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
            {(q.companies || []).map((c) => (
              <span key={c} style={s.companyTag}>🏢 {c}</span>
            ))}
          </div>

          {/* Description */}
          <div
            style={s.descriptionDiv}
            className="problem-description"
            dangerouslySetInnerHTML={{ __html: q.description }}
          />

          {/* Examples */}
          <div style={s.sectionLabel}>Examples</div>
          {(q.examples || []).map((ex, i) => (
            <div key={i} style={s.exampleBlock}>
              <div style={s.exampleLabel}>Example {i + 1}</div>
              <div style={s.exampleCode}>
                <span style={{ color: S.outlineVar }}>Input:  </span>{ex.input}{'\n'}
                <span style={{ color: S.outlineVar }}>Output: </span>{ex.output}
              </div>
              {ex.explanation && (
                <div style={s.exampleExplanation}>💡 {ex.explanation}</div>
              )}
            </div>
          ))}

          {/* Constraints */}
          <div style={s.sectionLabel}>Constraints</div>
          <ul style={s.constraintList}>
            {(q.constraints || []).map((c, i) => (
              <li key={i} style={s.constraintItem}>{c}</li>
            ))}
          </ul>

          {/* Hints */}
          <div style={s.sectionLabel}>Hints</div>
          {(q.hints || []).map((hint, i) => {
            const revealed = revealedHints.includes(i);
            return (
              <div key={i}>
                <button
                  style={s.hintRevealBtn(revealed, hoveredBtn === `hint-${i}`)}
                  onMouseEnter={() => setHoveredBtn(`hint-${i}`)}
                  onMouseLeave={() => setHoveredBtn(null)}
                  onClick={() =>
                    setRevealedHints((prev) =>
                      revealed ? prev.filter((x) => x !== i) : [...prev, i]
                    )
                  }
                >
                  {revealed ? '🔓 Hide Hint ' : '🔒 Reveal Hint '}{i + 1}
                </button>
                {revealed && <div style={s.hintText}>{hint}</div>}
              </div>
            );
          })}

          <div style={{ height: '32px' }} />
        </div>
      );
    }

    if (leftTab === 'editorial') {
      return (
        <div style={s.placeholderTab}>
          <div style={s.placeholderIcon}>📝</div>
          <div style={s.placeholderText}>Editorial coming soon</div>
          <div style={s.placeholderSub}>Our team is working on a detailed explanation</div>
        </div>
      );
    }

    if (leftTab === 'solutions') {
      return (
        <div style={s.descScroll}>
          <div style={{ fontSize: '13px', color: S.outlineVar, marginBottom: '16px' }}>
            {MOCK_SOLUTIONS.length} community solutions
          </div>
          {MOCK_SOLUTIONS.map((sol) => (
            <div
              key={sol.id}
              style={s.solutionCard(hoveredBtn === `sol-${sol.id}`)}
              onMouseEnter={() => setHoveredBtn(`sol-${sol.id}`)}
              onMouseLeave={() => setHoveredBtn(null)}
            >
              <div style={s.solutionHeader}>
                <div style={s.solutionUser}>
                  <div style={s.solutionAvatar(sol.langColor)}>{sol.avatar}</div>
                  <span style={s.solutionUserName}>{sol.user}</span>
                  <span style={s.langBadge(sol.langColor)}>{sol.lang}</span>
                </div>
                <div style={s.solutionMeta}>
                  <div style={s.upvoteBtn}>👍 {sol.upvotes}</div>
                  <div style={s.solutionTime}>{sol.time}</div>
                </div>
              </div>
              <pre style={s.solutionCode}>{sol.code}</pre>
            </div>
          ))}
          <div style={{ height: '24px' }} />
        </div>
      );
    }

    if (leftTab === 'submissions') {
      return (
        <div style={s.descScroll}>
          <div style={{ fontSize: '13px', color: S.outlineVar, marginBottom: '16px' }}>
            Your submissions for this problem
          </div>
          <table style={s.submTable}>
            <thead>
              <tr>
                {['Date', 'Status', 'Runtime', 'Memory', 'Language'].map((h) => (
                  <th key={h} style={s.submTh}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, i) => (
                <tr
                  key={i}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={s.submTd}>{sub.date}</td>
                  <td style={{ ...s.submTd, color: getSubmStatusColor(sub.status), fontWeight: 600 }}>
                    {sub.status}
                  </td>
                  <td style={s.submTd}>{sub.runtime}</td>
                  <td style={s.submTd}>{sub.memory}</td>
                  <td style={s.submTd}>{sub.lang}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ height: '24px' }} />
        </div>
      );
    }
  };

  // ── CONSOLE CONTENT ────────────────────────────────────────────────────────
  const renderConsoleContent = () => {
    if (consoleTab === 'testcases') {
      const cases = q.testCases || DEFAULT_QUESTION.testCases;
      return (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {cases.map((_, i) => (
              <button
                key={i}
                style={s.caseBtn(selectedCase === i, hoveredConsoleTab === `case-${i}`)}
                onMouseEnter={() => setHoveredConsoleTab(`case-${i}`)}
                onMouseLeave={() => setHoveredConsoleTab(null)}
                onClick={() => setSelectedCase(i)}
              >
                Case {i + 1}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '12px', color: S.outlineVar, fontWeight: 600, marginBottom: '6px' }}>
            INPUT
          </div>
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '8px',
            padding: '10px 12px',
            fontFamily: '"Fira Code", monospace',
            fontSize: '13px',
            color: S.outline,
            whiteSpace: 'pre',
            lineHeight: 1.6,
          }}>
            {cases[selectedCase]?.input || ''}
          </div>
          <label style={s.customInputLabel}>CUSTOM INPUT</label>
          <textarea
            style={s.caseInput}
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Enter custom test input..."
            spellCheck={false}
          />
        </div>
      );
    }

    if (consoleTab === 'testresult') {
      if (isRunning || isSubmitting) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid rgba(59,130,246,0.2)',
              borderTop: '2px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              {isSubmitting ? 'Submitting your solution...' : 'Running your code...'}
            </span>
          </div>
        );
      }
      if (!runResult) {
        return <div style={s.noResultText}>▶ Run your code to see output here</div>;
      }
      return (
        <div>
          <div style={s.resultStatus(runResult.status)}>
            {getStatusIcon(runResult.status)} {runResult.status}
          </div>
          <div style={s.resultMeta}>
            <div style={s.resultMetaItem}>
              <span style={s.resultMetaLabel}>Runtime</span>
              <span style={s.resultMetaValue}>{runResult.runtime || 'N/A'}</span>
            </div>
            <div style={s.resultMetaItem}>
              <span style={s.resultMetaLabel}>Memory</span>
              <span style={s.resultMetaValue}>{runResult.memory || 'N/A'}</span>
            </div>
            {runResult.submitted && (
              <div style={s.resultMetaItem}>
                <span style={s.resultMetaLabel}>Type</span>
                <span style={s.resultMetaValue}>Full Submission</span>
              </div>
            )}
          </div>
          {runResult.stdout && (
            <>
              <div style={{ fontSize: '11px', color: S.outlineVar, fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Output</div>
              <div style={s.resultStdout}>{runResult.stdout}</div>
            </>
          )}
        </div>
      );
    }

    if (consoleTab === 'devai') {
      return (
        <div style={s.devaiPanel}>
          <div style={s.devaiHeader}>
            <span style={s.devaiIcon}>🤖</span>
            <span style={s.devaiTitle}>DevAI Assistant</span>
            {aiLoading && (
              <span style={{ fontSize: '12px', color: '#f59e0b', opacity: 0.7 }}>Thinking...</span>
            )}
          </div>
          {aiResponse ? (
            <div style={s.devaiResponse}>{aiResponse}</div>
          ) : (
            <div style={s.devaiEmpty}>
              <div style={{ fontSize: '28px' }}>🤖</div>
              <div style={{ fontSize: '13px', color: S.outlineVar }}>
                Click "Ask DevAI" to get AI-powered help with your code
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  // ── LOADING SCREEN ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={s.loading}>
          <div style={s.loadingSpinner} />
          <div style={s.loadingText}>Loading problem...</div>
        </div>
      </>
    );
  }

  // ── LEFT TABS ──────────────────────────────────────────────────────────────
  const leftTabs = [
    { key: 'description', label: 'Description' },
    { key: 'editorial', label: 'Editorial' },
    { key: 'solutions', label: 'Solutions' },
    { key: 'submissions', label: 'Submissions' },
  ];

  const consoleTabs = [
    { key: 'testcases', label: 'Test Cases' },
    { key: 'testresult', label: 'Test Result' },
    { key: 'devai', label: '🤖 DevAI' },
  ];

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .problem-description code {
          background: rgba(59,130,246,0.12);
          color: #60a5fa;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Fira Code', monospace;
          font-size: 0.9em;
        }
        .problem-description strong { color: #f1f5f9; }
        .problem-description em { color: #94a3b8; }
        .problem-description p { margin: 0 0 12px 0; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        select option { background: #0f172a; color: #f1f5f9; }
      `}</style>

      <div style={s.root}>
        {/* ── LEFT PANEL ── */}
        <div style={s.leftPanel}>
          {/* Breadcrumb */}
          <div style={s.breadcrumb}>
            <div style={s.breadcrumbText}>
              <span
                style={{ cursor: 'pointer', color: S.primary }}
                onClick={() => navigate('/tracker')}
              >
                Problems
              </span>
              <span style={{ margin: '0 6px', color: '#334155' }}>›</span>
              <span style={s.breadcrumbTitle}>{q.title}</span>
            </div>
            <div style={s.breadcrumbArrows}>
              <div
                style={s.arrowBtn(hoveredBtn === 'prev')}
                onMouseEnter={() => setHoveredBtn('prev')}
                onMouseLeave={() => setHoveredBtn(null)}
                onClick={() => navigate(`/dashboard/${Math.max(1, (parseInt(id) || 1) - 1)}`)}
                title="Previous problem"
              >‹</div>
              <div
                style={s.arrowBtn(hoveredBtn === 'next')}
                onMouseEnter={() => setHoveredBtn('next')}
                onMouseLeave={() => setHoveredBtn(null)}
                onClick={() => navigate(`/dashboard/${(parseInt(id) || 1) + 1}`)}
                title="Next problem"
              >›</div>
            </div>
          </div>

          {/* Tab bar */}
          <div style={s.tabBar}>
            {leftTabs.map((t) => (
              <div
                key={t.key}
                style={s.tab(leftTab === t.key, hoveredTab === t.key)}
                onMouseEnter={() => setHoveredTab(t.key)}
                onMouseLeave={() => setHoveredTab(null)}
                onClick={() => setLeftTab(t.key)}
              >
                {t.label}
              </div>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {renderLeftContent()}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={s.rightPanel}>
          {/* Action bar */}
          <div style={s.actionBar}>
            {/* Language select */}
            <select
              style={s.langSelect}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {Object.keys(LANG_MAP).map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>

            {/* Timer */}
            <div style={s.timerSection}>
              <div style={s.timerDisplay}>{formatTime(timerSeconds)}</div>
              <div
                style={s.timerBtn(hoveredBtn === 'timer')}
                onMouseEnter={() => setHoveredBtn('timer')}
                onMouseLeave={() => setHoveredBtn(null)}
                onClick={() => setTimerRunning((r) => !r)}
                title={timerRunning ? 'Pause timer' : 'Resume timer'}
              >
                {timerRunning ? '⏸' : '▶'}
              </div>
            </div>

            {/* Action buttons */}
            <div style={s.actionBtns}>
              <button
                style={s.devaiBtn(hoveredBtn === 'devai')}
                onMouseEnter={() => setHoveredBtn('devai')}
                onMouseLeave={() => setHoveredBtn(null)}
                onClick={handleAskDevAI}
                disabled={aiLoading}
              >
                🤖 Ask DevAI
              </button>
              <button
                style={s.runBtn(hoveredBtn === 'run')}
                onMouseEnter={() => setHoveredBtn('run')}
                onMouseLeave={() => setHoveredBtn(null)}
                onClick={handleRun}
                disabled={isRunning}
              >
                {isRunning ? '⏳ Running...' : '▶ Run'}
              </button>
              <button
                style={s.submitBtn(hoveredBtn === 'submit', isSubmitting)}
                onMouseEnter={() => setHoveredBtn('submit')}
                onMouseLeave={() => setHoveredBtn(null)}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? '⏳ Submitting...' : '✓ Submit'}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div style={s.editorWrapper}>
            <Editor
              height="100%"
              language={LANG_MAP[language] || 'python'}
              value={code}
              onChange={(val) => setCode(val || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: '"Fira Code", "Cascadia Code", monospace',
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                glowJunction: false,
                padding: { top: 16, bottom: 16 },
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on',
                renderLineHighlight: 'line',
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                scrollbar: {
                  verticalScrollbarSize: 6,
                  horizontalScrollbarSize: 6,
                },
              }}
            />
          </div>

          {/* Console Panel */}
          <div style={s.consolePanel}>
            {/* Console tab bar */}
            <div style={s.consoleTabBar}>
              {consoleTabs.map((t) => (
                <div
                  key={t.key}
                  style={s.tab(consoleTab === t.key, hoveredConsoleTab === t.key)}
                  onMouseEnter={() => setHoveredConsoleTab(t.key)}
                  onMouseLeave={() => setHoveredConsoleTab(null)}
                  onClick={() => setConsoleTab(t.key)}
                >
                  {t.label}
                </div>
              ))}
            </div>

            {/* Console content */}
            <div style={s.consoleContent}>
              {renderConsoleContent()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;