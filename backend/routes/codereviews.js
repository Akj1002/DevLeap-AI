const express = require('express');
const router = express.Router();
const CodeReview = require('../models/CodeReview');
const User = require('../models/User');

// 1. GET ALL CODE REVIEWS
router.get('/', async (req, res) => {
  try {
    const { language, status, sort = 'newest', page = 1, limit = 15, search } = req.query;
    const query = {};
    if (language && language !== 'all') query.language = language;
    if (status && status !== 'all') query.status = status;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];

    const sortMap = {
      newest: { createdAt: -1 },
      popular: { upvotes: -1, views: -1 },
      most_comments: { 'comments': -1 }
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const reviews = await CodeReview.find(query)
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip)
      .limit(parseInt(limit))
      .select('title description language tags authorName upvotes views status complexity createdAt comments');

    const total = await CodeReview.countDocuments(query);
    // Add comment count
    const reviewsWithCount = reviews.map(r => ({
      ...r.toObject(),
      commentCount: r.comments?.length || 0
    }));
    res.json({ reviews: reviewsWithCount, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch code reviews' });
  }
});

// 2. GET SINGLE REVIEW (with comments and AI review)
router.get('/:id', async (req, res) => {
  try {
    const review = await CodeReview.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// 3. CREATE A NEW CODE REVIEW POST
router.post('/', async (req, res) => {
  try {
    const { title, description, code, language, authorId, authorName, tags, complexity } = req.body;
    const review = new CodeReview({ title, description, code, language, authorId, authorName, tags, complexity });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create review post' });
  }
});

// 4. ADD A COMMENT / REVIEW
router.post('/:id/comment', async (req, res) => {
  try {
    const { author, authorId, text, lineNumber, codeSnippet } = req.body;
    const review = await CodeReview.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    const comment = { author, authorId, text, lineNumber, codeSnippet };
    review.comments.push(comment);
    await review.save();
    res.json({ message: 'Comment added!', comment: review.comments[review.comments.length - 1], commentCount: review.comments.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// 5. UPVOTE A REVIEW
router.post('/:id/upvote', async (req, res) => {
  try {
    const review = await CodeReview.findByIdAndUpdate(
      req.params.id, { $inc: { upvotes: 1 } }, { new: true }
    );
    res.json({ upvotes: review.upvotes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upvote' });
  }
});

// 6. UPVOTE A COMMENT
router.post('/:id/comments/:commentId/upvote', async (req, res) => {
  try {
    const review = await CodeReview.findById(req.params.id);
    const comment = review.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    comment.upvotes += 1;
    await review.save();
    res.json({ upvotes: comment.upvotes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upvote comment' });
  }
});

// 7. RESOLVE / CLOSE A REVIEW
router.patch('/:id/status', async (req, res) => {
  try {
    const review = await CodeReview.findByIdAndUpdate(
      req.params.id, { $set: { status: req.body.status } }, { new: true }
    );
    res.json({ message: 'Status updated', status: review.status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// 8. RESOLVE A COMMENT
router.patch('/:id/comments/:commentId/resolve', async (req, res) => {
  try {
    const review = await CodeReview.findById(req.params.id);
    const comment = review.comments.id(req.params.commentId);
    comment.resolved = !comment.resolved;
    await review.save();
    res.json({ resolved: comment.resolved });
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve comment' });
  }
});

// 9. AI REVIEW ENDPOINT (using Gemini)
router.post('/:id/ai-review', async (req, res) => {
  try {
    const review = await CodeReview.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert code reviewer. Analyze this ${review.language} code and provide a structured review.

Code:
\`\`\`${review.language}
${review.code.substring(0, 3000)}
\`\`\`

Respond in this EXACT JSON format:
{
  "summary": "2-3 sentence overall assessment",
  "score": <number 1-100>,
  "issues": [
    { "severity": "critical|warning|info", "line": <line_number_or_0>, "message": "issue description", "suggestion": "how to fix it" }
  ]
}

Provide 3-7 actionable issues. Be specific and constructive.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    // Extract JSON from markdown blocks if present
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) text = jsonMatch[1].trim();
    const aiData = JSON.parse(text);

    review.aiReview = { ...aiData, generatedAt: new Date() };
    await review.save();
    res.json({ aiReview: review.aiReview });
  } catch (err) {
    console.error('AI review error:', err);
    res.status(500).json({ error: 'Failed to generate AI review' });
  }
});

// 10. GET REVIEW STATS
router.get('/stats/overview', async (req, res) => {
  try {
    const total = await CodeReview.countDocuments();
    const byLanguage = await CodeReview.aggregate([
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 8 }
    ]);
    const openReviews = await CodeReview.countDocuments({ status: 'open' });
    const resolvedReviews = await CodeReview.countDocuments({ status: 'resolved' });
    const totalComments = await CodeReview.aggregate([
      { $project: { commentCount: { $size: '$comments' } } },
      { $group: { _id: null, total: { $sum: '$commentCount' } } }
    ]);
    res.json({
      total, byLanguage, openReviews, resolvedReviews,
      totalComments: totalComments[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// 11. SEED SAMPLE REVIEWS
router.post('/seed/bulk', async (req, res) => {
  try {
    const samples = [
      {
        title: 'Binary Search Implementation - Is this optimal?',
        description: 'I wrote a binary search function for a coding challenge. Looking for feedback on edge cases and performance.',
        code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
        language: 'javascript', authorName: 'AlgoLearner',
        tags: ['algorithms', 'search', 'dsa'], complexity: 'Beginner', upvotes: 12, views: 89
      },
      {
        title: 'React custom hook for debounced API calls',
        description: 'Built this hook for a search feature. Am I handling cleanup correctly? Any better patterns?',
        code: `import { useState, useEffect, useCallback } from 'react';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function useSearch(fetchFn, delay = 300) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, delay);

  useEffect(() => {
    if (!debouncedQuery) { setResults([]); return; }
    setLoading(true);
    fetchFn(debouncedQuery).then(data => {
      setResults(data);
      setLoading(false);
    });
  }, [debouncedQuery, fetchFn]);

  return { query, setQuery, results, loading };
}`,
        language: 'javascript', authorName: 'ReactDev99',
        tags: ['react', 'hooks', 'performance'], complexity: 'Intermediate', upvotes: 34, views: 201
      },
      {
        title: 'Python async web scraper - need performance review',
        description: 'Scraping 1000+ pages. Getting timeouts. Looking for async/concurrency improvements.',
        code: `import asyncio
import aiohttp
from bs4 import BeautifulSoup
from typing import List

async def fetch_page(session: aiohttp.ClientSession, url: str) -> str:
    async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
        return await response.text()

async def parse_page(html: str) -> dict:
    soup = BeautifulSoup(html, 'html.parser')
    return {
        'title': soup.find('h1').text if soup.find('h1') else '',
        'links': [a['href'] for a in soup.find_all('a', href=True)]
    }

async def scrape_all(urls: List[str], concurrency: int = 10) -> List[dict]:
    semaphore = asyncio.Semaphore(concurrency)
    async with aiohttp.ClientSession() as session:
        async def bounded_fetch(url):
            async with semaphore:
                html = await fetch_page(session, url)
                return await parse_page(html)
        return await asyncio.gather(*[bounded_fetch(u) for u in urls])`,
        language: 'python', authorName: 'PythonPro',
        tags: ['python', 'async', 'scraping', 'performance'], complexity: 'Advanced', upvotes: 28, views: 156
      }
    ];
    await CodeReview.deleteMany({});
    const created = await CodeReview.insertMany(samples);
    res.json({ message: `Seeded ${created.length} reviews`, reviews: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to seed reviews' });
  }
});

module.exports = router;
