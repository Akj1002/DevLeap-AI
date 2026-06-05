const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');

// AI Pair session memory stored in DB
const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, unique: true },
  userId: String,
  code: String,
  language: { type: String, default: 'javascript' },
  messages: [{ role: String, content: String, timestamp: { type: Date, default: Date.now } }],
  codeHistory: [{ code: String, timestamp: { type: Date, default: Date.now }, label: String }],
  problemContext: String,
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });
const AIPairSession = mongoose.models.AIPairSession || mongoose.model('AIPairSession', sessionSchema);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
async function aiGenerate(prompt, systemInstruction = '') {
  const models = ['gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-1.5-pro'];
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e) { if (models.indexOf(modelName) === models.length - 1) throw e; }
  }
}

const SYSTEM_PROMPT = `You are DevAI, an expert AI pair programmer and coding mentor. You:
- Help debug, optimize, and improve code
- Explain concepts clearly with examples
- Suggest better algorithms and data structures
- Point out bugs, edge cases, and security issues
- Write clean, production-quality code
- Are concise and actionable — never give vague advice
- Format code blocks with appropriate language tags`;

// 1. GET OR CREATE SESSION
router.post('/session', async (req, res) => {
  try {
    const { sessionId, userId } = req.body;
    let session = await AIPairSession.findOne({ sessionId });
    if (!session) {
      session = new AIPairSession({ sessionId: sessionId || `session-${Date.now()}`, userId });
      await session.save();
    }
    res.json(session);
  } catch (err) { res.status(500).json({ error: 'Session error' }); }
});

// 2. SEND MESSAGE (with code context)
router.post('/session/:sessionId/message', async (req, res) => {
  try {
    const { message, code, language } = req.body;
    const session = await AIPairSession.findOne({ sessionId: req.params.sessionId });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    session.lastActive = new Date();
    if (code !== undefined) session.code = code;
    if (language) session.language = language;
    
    // Build context-aware prompt
    const contextHistory = session.messages.slice(-6).map(m => `${m.role === 'user' ? 'User' : 'DevAI'}: ${m.content}`).join('\n');
    const codeContext = code ? `\n\nCurrent code (${language || session.language}):\n\`\`\`${language || session.language}\n${code}\n\`\`\`` : '';
    const fullPrompt = `${SYSTEM_PROMPT}\n\nConversation history:\n${contextHistory}\n${codeContext}\n\nUser: ${message}\n\nDevAI:`;
    
    const aiReply = await aiGenerate(fullPrompt);
    
    session.messages.push({ role: 'user', content: message });
    session.messages.push({ role: 'assistant', content: aiReply });
    await session.save();
    
    res.json({ reply: aiReply, sessionId: session.sessionId });
  } catch (err) {
    console.error('AI pair error:', err.message);
    res.status(500).json({ error: 'AI assistant is busy. Please try again.' });
  }
});

// 3. ANALYZE CODE
router.post('/session/:sessionId/analyze', async (req, res) => {
  try {
    const { code, language } = req.body;
    const prompt = `Analyze this ${language} code and return JSON:
{
  "summary": "what this code does in 1-2 sentences",
  "complexity": {"time": "O(?)", "space": "O(?)"},
  "bugs": [{"line": <number or null>, "description": "<bug>", "fix": "<suggested fix>"}],
  "improvements": ["<improvement1>", "<improvement2>"],
  "codeQuality": <0-100>,
  "bestPractices": ["<practice violated or followed>"],
  "security": ["<security concern or 'No security issues found'>"]
}
Code:
\`\`\`${language}
${code}
\`\`\`
Return ONLY valid JSON.`;
    const reply = await aiGenerate(prompt);
    const clean = reply.replace(/```json/g, '').replace(/```/g, '').trim();
    res.json(JSON.parse(clean));
  } catch (err) { res.status(500).json({ error: 'Analysis failed' }); }
});

// 4. EXPLAIN CODE
router.post('/session/:sessionId/explain', async (req, res) => {
  try {
    const { code, language, level = 'intermediate' } = req.body;
    const prompt = `${SYSTEM_PROMPT}\nExplain this ${language} code to a ${level}-level developer. Be clear, use analogies where helpful, and explain what each key section does.\n\n\`\`\`${language}\n${code}\n\`\`\``;
    const explanation = await aiGenerate(prompt);
    res.json({ explanation });
  } catch (err) { res.status(500).json({ error: 'Explanation failed' }); }
});

// 5. OPTIMIZE CODE
router.post('/session/:sessionId/optimize', async (req, res) => {
  try {
    const { code, language, goal = 'performance' } = req.body;
    const prompt = `${SYSTEM_PROMPT}\nOptimize this ${language} code for ${goal}. Provide:\n1. Optimized code\n2. Explanation of changes\n3. Complexity comparison (before vs after)\n\nOriginal code:\n\`\`\`${language}\n${code}\n\`\`\``;
    const response = await aiGenerate(prompt);
    res.json({ optimized: response });
  } catch (err) { res.status(500).json({ error: 'Optimization failed' }); }
});

// 6. GENERATE TESTS
router.post('/session/:sessionId/tests', async (req, res) => {
  try {
    const { code, language, framework = 'jest' } = req.body;
    const prompt = `Generate comprehensive unit tests for this ${language} code using ${framework}. Include edge cases, error cases, and happy path tests. Return ONLY the test code.\n\n\`\`\`${language}\n${code}\n\`\`\``;
    const tests = await aiGenerate(prompt);
    res.json({ tests });
  } catch (err) { res.status(500).json({ error: 'Test generation failed' }); }
});

// 7. SAVE CODE SNAPSHOT
router.post('/session/:sessionId/snapshot', async (req, res) => {
  try {
    const { code, label } = req.body;
    const session = await AIPairSession.findOne({ sessionId: req.params.sessionId });
    session.codeHistory.push({ code, label: label || `Snapshot ${session.codeHistory.length + 1}`, timestamp: new Date() });
    session.code = code;
    await session.save();
    res.json({ snapshots: session.codeHistory.length });
  } catch (err) { res.status(500).json({ error: 'Failed to save snapshot' }); }
});

// 8. GET SESSION HISTORY
router.get('/session/:sessionId', async (req, res) => {
  try {
    const session = await AIPairSession.findOne({ sessionId: req.params.sessionId });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch session' }); }
});

// 9. FIX CODE
router.post('/session/:sessionId/fix', async (req, res) => {
  try {
    const { code, language, error } = req.body;
    const prompt = `${SYSTEM_PROMPT}\nFix this ${language} code${error ? ` that has the error: "${error}"` : ''}.\nReturn the fixed code with inline comments explaining what was wrong and what was changed.\n\n\`\`\`${language}\n${code}\n\`\`\``;
    const fixed = await aiGenerate(prompt);
    res.json({ fixed });
  } catch (err) { res.status(500).json({ error: 'Fix failed' }); }
});

// 10. TRANSLATE CODE
router.post('/session/:sessionId/translate', async (req, res) => {
  try {
    const { code, fromLanguage, toLanguage } = req.body;
    const prompt = `Translate this ${fromLanguage} code to ${toLanguage}. Maintain the same logic and functionality. Use idiomatic ${toLanguage} patterns and conventions. Return only the translated code.\n\`\`\`${fromLanguage}\n${code}\n\`\`\``;
    const translated = await aiGenerate(prompt);
    res.json({ translated });
  } catch (err) { res.status(500).json({ error: 'Translation failed' }); }
});

module.exports = router;
