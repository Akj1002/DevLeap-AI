import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useCodeStore } from '../store';
import apiClient, { API } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const DEFAULT_TEMPLATE = {
  javascript: `function solve(input) {\n  // write your code here\n  return input;\n}\n\nconsole.log(solve(require('fs').readFileSync(0, 'utf-8')));`,
  python: `def solve(input):\n    # write your code here\n    return input\n\nif __name__ == '__main__':\n    import sys\n    data = sys.stdin.read()\n    print(solve(data))`,
  java: `public class Main {\n  public static void main(String[] args) {\n    // write your code here\n  }\n}`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n  ios::sync_with_stdio(false);\n  cin.tie(nullptr);\n  string s;\n  getline(cin, s);\n  cout << s << "\\n";\n  return 0;\n}`,
};

const ProblemEditor = ({ questionId }) => {
  const {
    code,
    language,
    input,
    output,
    isExecuting,
    setCode,
    setLanguage,
    setInput,
    setOutput,
    setIsExecuting,
    setError,
    reset,
  } = useCodeStore();

  const [question, setQuestion] = useState(null);
  const [testcases, setTestcases] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [editorHeight, setEditorHeight] = useState('400px');

  useEffect(() => {
    const loadQuestion = async () => {
      try {
        const q = await apiClient.get(`/questions/${questionId}`);
        setQuestion(q);
        setTestcases(q.testCases || []);
        setCode(q.solution?.code || DEFAULT_TEMPLATE[language] || DEFAULT_TEMPLATE.python);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load question');
      }
    };
    if (questionId) loadQuestion();

    return () => {};
  }, [questionId]);

  useEffect(() => {
    // adjust editor height based on window
    const onResize = () => setEditorHeight(window.innerHeight < 800 ? '360px' : '520px');
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleRun = async (customInput) => {
    setIsExecuting(true);
    setOutput('');
    setError(null);

    try {
      const payload = {
        code,
        language,
        input: customInput !== undefined ? customInput : input || '',
      };

      const res = await API.executeCode(payload);
      setOutput(res.output || JSON.stringify(res, null, 2));
      toast.success('Execution completed');
    } catch (err) {
      setError(err.message);
      toast.error('Execution failed: ' + err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRunTestcase = async (tc) => {
    setSelectedTest(tc);
    await handleRun(tc.input);
  };

  const handleChangeLanguage = (lang) => {
    setLanguage(lang);
    setCode(DEFAULT_TEMPLATE[lang] || '');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{question ? question.title : 'Loading...'}</h2>
          <p className="text-sm text-gray-500">{question ? question.difficulty : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => handleChangeLanguage(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
          <button
            className="bg-primary-500 text-white px-4 py-2 rounded"
            onClick={() => handleRun()}
            disabled={isExecuting}
          >
            {isExecuting ? 'Running...' : 'Run'}
          </button>
          <button
            className="bg-secondary-500 text-white px-4 py-2 rounded"
            onClick={() => handleRun(testcases[0] && testcases[0].input)}
          >
            Run Example
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="border rounded overflow-hidden">
            <Editor
              height={editorHeight}
              language={language === 'cpp' ? 'cpp' : language}
              defaultValue={code}
              value={code}
              onChange={(val) => setCode(val)}
              options={{
                fontFamily: 'Fira Code, monospace',
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
              }}
            />
          </div>

          <div className="mt-3 flex gap-2">
            <textarea
              className="w-full border rounded p-2 h-28"
              placeholder="Custom input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="w-1/3">
              <div className="text-sm font-medium mb-2">Output</div>
              <pre className="bg-gray-900 text-white p-3 rounded h-28 overflow-auto">{output}</pre>
            </div>
          </div>
        </div>

        <div className="col-span-1">
          <div className="border rounded p-3">
            <div className="text-sm font-semibold mb-2">Problem</div>
            <div className="prose max-w-none">{question && <div dangerouslySetInnerHTML={{ __html: question.description }} />}</div>

            <div className="mt-3">
              <div className="text-sm font-semibold">Examples</div>
              <div className="flex flex-col gap-2 mt-2">
                {testcases.map((tc, idx) => (
                  <button key={idx} className={`text-left p-2 border rounded ${selectedTest === tc ? 'bg-primary-50' : ''}`} onClick={() => handleRunTestcase(tc)}>
                    <div className="text-xs text-gray-600">Input</div>
                    <div className="text-sm font-mono bg-gray-50 p-2 rounded">{tc.input}</div>
                    <div className="text-xs text-gray-600 mt-1">Output</div>
                    <div className="text-sm font-mono bg-gray-50 p-2 rounded">{tc.expectedOutput}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3">
              <div className="text-sm font-semibold">Hints</div>
              <ul className="list-disc list-inside mt-2">
                {question && question.hints && question.hints.map((h, i) => (<li key={i}>{h}</li>))}
              </ul>
            </div>

            <div className="mt-3">
              <div className="text-sm font-semibold">Constraints</div>
              <ul className="list-disc list-inside mt-2">
                {question && question.constraints && question.constraints.map((c, i) => (<li key={i}>{c}</li>))}
              </ul>
            </div>
          </div>

          <div className="mt-3 border rounded p-3">
            <div className="text-sm font-semibold">Submit</div>
            <p className="text-xs text-gray-600">Submit your solution for scoring and leaderboard.</p>
            <button className="mt-2 w-full bg-success-500 text-white py-2 rounded">Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemEditor;
