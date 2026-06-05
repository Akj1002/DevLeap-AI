const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to automatically shift models if one is busy or failing
async function generateWithFallback(prompt) {
  const modelsToTry = ["gemini-1.5-flash", "gemini-2.5-flash", "gemini-1.5-pro"];
  for (let i = 0; i < modelsToTry.length; i++) {
    try {
      const model = genAI.getGenerativeModel({ model: modelsToTry[i] });
      const result = await model.generateContent(prompt);
      return result;
    } catch (err) {
      console.warn(`⚠️ Model ${modelsToTry[i]} failed: ${err.message}. ${i < modelsToTry.length - 1 ? 'Trying next model...' : ''}`);
      if (i === modelsToTry.length - 1) throw err;
    }
  }
}

// 🤖 1. DEVAI CHAT: Workspace Hints and Code Analysis
router.post('/chat', async (req, res) => {
  const { message, context } = req.body; 

  try {
    const prompt = `You are an expert technical interviewer. The student is working on: ${context || 'a coding problem'}. 
    User says: ${message}. 
    Give a concise, helpful hint without spoiling the full solution immediately.`;

    const result = await generateWithFallback(prompt);
    const response = await result.response;
    res.json({ reply: response.text() });
  } catch (err) {
      console.error("❌ Gemini Chat Error:", err.message);
      res.status(500).json({ error: "DevAI Assistant is temporarily busy." });
  }
});

// 🏢 2. DEVAI PREP PLAN: Generates Company-Specific Curriculum
router.post('/prep-plan', async (req, res) => {
  const { company } = req.body;

  try {
    // Strict prompt engineering with a predefined list of exact database tags
    const prompt = `You are an expert technical recruiter. A candidate is applying to ${company}. 
    Return EXACTLY a valid JSON array of 4 topic strings they should study. 
    You MUST pick from this exact list: "Array", "String", "Hash Table", "Dynamic Programming", "Math", "Sorting", "Greedy", "Depth-First Search", "Binary Search", "Tree", "Matrix", "Two Pointers", "Breadth-First Search", "Graph".
    Output ONLY the JSON array. Example: ["Array", "Graph", "Tree", "Dynamic Programming"]`;

    const result = await generateWithFallback(prompt);
    let responseText = await result.response.text();
    
    // Safety filter: Clean markdown
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let topicsArray = [];
    
    try {
        const parsed = JSON.parse(responseText);
        // Guarantee we extract an array, even if Gemini wraps it in an object
        if (Array.isArray(parsed)) {
            topicsArray = parsed;
        } else if (parsed.topics && Array.isArray(parsed.topics)) {
            topicsArray = parsed.topics;
        } else {
            throw new Error("Parsed JSON was not an array");
        }
    } catch (parseError) {
        console.error("⚠️ AI JSON Parse Warning, using fallback:", parseError.message);
        // Fallback curriculum so the app NEVER crashes for the user
        topicsArray = ["Array", "Dynamic Programming", "Hash Table", "Tree"];
    }
    
    res.json({ company, topics: topicsArray });
  } catch (err) {
      console.error("❌ Gemini Prep Plan Error:", err.message);
      res.status(500).json({ error: "Could not generate prep plan." });
  }
});

// 3. DEVAI BEHAVIORAL EVALUATOR: Checks STAR Method Structure
router.post('/evaluate-behavioral', async (req, res) => {
  const { question, category, answer } = req.body;

  try {
    const prompt = `You are a professional tech recruiter. A candidate answered the behavioral question: "${question}" (under category "${category}").
    Answer: "${answer}".
    
    Evaluate this answer using the STAR method structure.
    Return a JSON object containing:
    1. "scores": An object with integer percentage scores (0 to 100) for: "situation", "task", "action", "result", and "overall".
    2. "strengths": An array of 2-3 brief strength bullet points.
    3. "improvements": An array of 2-3 brief improvement areas.
    4. "feedback": A 2-sentence summary feedback.

    Your output MUST be ONLY a valid JSON object. Do not include markdown code block syntax.`;

    const result = await generateWithFallback(prompt);
    let responseText = await result.response.text();
    
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let evaluation;
    try {
        evaluation = JSON.parse(responseText);
    } catch (parseError) {
        console.error("⚠️ Behavioral JSON Parse Warning, using fallback:", parseError.message);
        // Fallback evaluation
        evaluation = {
            scores: {
                situation: 75,
                task: 80,
                action: 70,
                result: 65,
                overall: 72
            },
            strengths: ["Clear structuring of the situation", "Good description of actions taken"],
            improvements: ["Could make the results more quantifiable", "Explain the task complexity in more detail"],
            feedback: "Solid attempt. Your response addresses key STAR elements, but quantifying your results will make it much stronger."
        };
    }
    
    res.json(evaluation);
  } catch (err) {
      console.error("❌ Gemini Behavioral Evaluation Error:", err.message);
      res.status(500).json({ error: "Could not evaluate behavioral response." });
  }
});

// =====================================================
// 4. AI RESUME: Enhance bullet points with STAR method
// =====================================================
router.post('/enhance-resume', async (req, res) => {
  const { bullets, jobTitle, company } = req.body;

  if (!bullets || !Array.isArray(bullets) || bullets.length === 0) {
    return res.status(400).json({ error: 'No bullet points provided.' });
  }

  try {
    const bulletsText = bullets.map((b, i) => `${i + 1}. ${b}`).join('\n');

    const prompt = `You are a world-class resume writer and career coach. Rewrite the following resume bullet points for the role of "${jobTitle || 'the given position'}" at "${company || 'the company'}".

Rules for rewriting:
- Start EVERY bullet with a strong action verb (e.g., Engineered, Spearheaded, Optimized, Designed, Implemented, Reduced, Increased, Delivered).
- Follow the STAR/XYZ method: Action + Task/Context + Quantifiable Result.
- Add specific metrics where possible (e.g., "by 40%", "handling 10k users", "reducing latency from 200ms to 50ms").
- Keep each bullet to 1-2 lines maximum.
- Make them ATS-friendly (use industry-standard keywords).
- Return ONLY a valid JSON array of strings, one enhanced bullet per item. No markdown, no explanation.

Original bullet points:
${bulletsText}

Return format example: ["Enhanced bullet 1", "Enhanced bullet 2"]`;

    const result = await generateWithFallback(prompt);
    let responseText = await result.response.text();

    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    let enhancedBullets = [];
    try {
      enhancedBullets = JSON.parse(responseText);
      if (!Array.isArray(enhancedBullets)) throw new Error('Not an array');
    } catch {
      // Fallback: try to parse line by line
      enhancedBullets = responseText
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .map((line) => line.replace(/^[\d\.\-\*]+\s*/, '').trim());
    }

    res.json({ success: true, enhancedBullets });
  } catch (err) {
    console.error('❌ Resume Enhance Error:', err.message);
    res.status(500).json({ error: 'AI enhancement failed. Please try again.' });
  }
});

// =====================================================
// 5. AI RESUME: Generate professional summary
// =====================================================
router.post('/generate-summary', async (req, res) => {
  const { fullName, jobTitle, yearsOfExperience, skills, experience } = req.body;

  try {
    const experienceSummary = experience
      ? experience.map((e) => `${e.jobTitle} at ${e.company}`).join(', ')
      : 'various companies';

    const prompt = `You are an expert resume writer. Write a compelling, ATS-optimized professional summary for a resume.

Candidate Details:
- Name: ${fullName || 'the candidate'}
- Target Role / Current Title: ${jobTitle || 'Software Engineer'}
- Years of Experience: ${yearsOfExperience || '3+'} years
- Key Skills: ${skills || 'software development'}
- Past Experience at: ${experienceSummary}

Requirements:
- Write exactly 3-4 sentences.
- Start with a strong professional statement (e.g., "Results-driven Software Engineer...").
- Include 2-3 specific technical skills naturally.
- Mention a key achievement or strength.
- End with what value they bring to a new employer.
- Do NOT use first-person ("I", "my"). Write in third-person professional style.
- Return ONLY the summary text. No JSON, no markdown, no extra commentary.`;

    const result = await generateWithFallback(prompt);
    const summary = await result.response.text();

    res.json({ success: true, summary: summary.trim() });
  } catch (err) {
    console.error('❌ Summary Generation Error:', err.message);
    res.status(500).json({ error: 'Could not generate summary. Please try again.' });
  }
});

// =====================================================
// 6. AI RESUME: Analyze ATS score
// =====================================================
router.post('/analyze-ats', async (req, res) => {
  const { resumeText, targetRole } = req.body;

  if (!resumeText) {
    return res.status(400).json({ error: 'Resume text is required.' });
  }

  try {
    const prompt = `You are an ATS (Applicant Tracking System) expert. Analyze the following resume for the role of "${targetRole || 'Software Engineer'}" and return a detailed ATS analysis.

Resume Content:
${resumeText}

Return ONLY a valid JSON object with this exact structure:
{
  "score": <integer 0-100>,
  "grade": "<A+|A|B+|B|C+|C|D>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "missingKeywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>"],
  "formatFeedback": "<1-2 sentence feedback on the resume format and structure>"
}

Do not include markdown or any text outside of the JSON object.`;

    const result = await generateWithFallback(prompt);
    let responseText = await result.response.text();
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch {
      analysis = {
        score: 72,
        grade: 'B+',
        strengths: ['Strong action verbs used', 'Clear structure', 'Relevant skills listed'],
        improvements: ['Add more quantifiable metrics', 'Include relevant keywords', 'Expand project descriptions'],
        missingKeywords: ['CI/CD', 'Agile', 'System Design'],
        formatFeedback: 'Your resume has a clean structure. Consider adding more quantifiable achievements.',
      };
    }

    res.json({ success: true, analysis });
  } catch (err) {
    console.error('❌ ATS Analysis Error:', err.message);
    res.status(500).json({ error: 'ATS analysis failed. Please try again.' });
  }
});

module.exports = router;