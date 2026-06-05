const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');

// =============================================
// GET /api/resume/:userId — Fetch user's resume
// =============================================
router.get('/:userId', async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.params.userId });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'No resume found for this user.' });
    }
    res.json({ success: true, data: resume });
  } catch (err) {
    console.error('❌ Resume Fetch Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch resume.' });
  }
});

// =============================================================
// POST /api/resume/:userId — Create or update user's resume
// =============================================================
router.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const resumeData = req.body;

    const resume = await Resume.findOneAndUpdate(
      { userId },
      { ...resumeData, userId },
      { new: true, upsert: true, runValidators: false }
    );

    res.json({ success: true, message: 'Resume saved successfully!', data: resume });
  } catch (err) {
    console.error('❌ Resume Save Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to save resume.' });
  }
});

module.exports = router;
