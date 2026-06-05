const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// Path: GET /api/questions (Fetches all questions for your tracker)
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to load questions." });
  }
});

// Path: GET /api/questions/:id (Fetches a single question for the workspace)
router.get('/:id', async (req, res) => {
  console.log(`🎯 Hit the single question route for ID: ${req.params.id}`);
  
  try {
    const param = req.params.id;
    
    // 1. Build a smart query to check BOTH String and Number versions of questionId
    let query = { 
        $or: [ 
            { questionId: String(param) }, 
            { questionId: Number(param) } 
        ] 
    };
    
    // 2. If the ID is exactly 24 characters (a MongoDB _id), add it to the search criteria!
    if (param.match(/^[0-9a-fA-F]{24}$/)) {
        query.$or.push({ _id: param });
    }

    const question = await Question.findOne(query);
    
    // 3. Fallback if something truly goes missing
    if (!question) {
      return res.json({
          questionId: param,
          title: "Question Not Found in Database",
          difficulty: "Medium",
          description: "The database is connected, but this specific ID doesn't exist.",
          category: "Algorithms"
      });
    }
    
    res.json(question);
  } catch (err) {
    console.error("❌ Route Error:", err.message);
    res.status(500).json({ title: "Error", description: err.message });
  }
});

module.exports = router;