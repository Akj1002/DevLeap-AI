const mongoose = require('mongoose');
require('dotenv').config();

const StudyPlan = require('./models/StudyPlan');

const studyPlans = [
  {
    planId: 'blind75',
    name: 'Blind 75',
    source: 'Tech Interview Handbook',
    level: 'Intermediate',
    problemsCount: 75,
    topics: ['Arrays', 'Dynamic Programming', 'Trees', 'Graphs'],
    duration: '3-4 Weeks',
    enrolledStr: '1.2M',
    description: 'The legendary 75 most essential LeetCode questions curated by Blind. Perfect for catching up on standard patterns quickly.',
    color: '#adc6ff'
  },
  {
    planId: 'striver-sde',
    name: 'Striver SDE Sheet',
    source: 'TakeUForward',
    level: 'Advanced',
    problemsCount: 191,
    topics: ['LinkedLists', 'Heaps', 'Recursion', 'Trie'],
    duration: '2 Months',
    enrolledStr: '850K',
    description: 'A comprehensive 191-problem sheet favored by top Indian engineering graduates for product-based company prep.',
    color: '#f59e0b'
  },
  {
    planId: 'neetcode-150',
    name: 'NeetCode 150',
    source: 'NeetCode',
    level: 'All Levels',
    problemsCount: 150,
    topics: ['Two Pointers', 'Sliding Window', 'Backtracking'],
    duration: '6 Weeks',
    enrolledStr: '600K',
    description: 'An expanded version of Blind 75, organized strictly by pattern to help you build algorithmic intuition.',
    color: '#4ae176'
  },
  {
    planId: 'meta-pack',
    name: 'Meta Prep Pack',
    source: 'DevLeap Exclusives',
    level: 'Company',
    problemsCount: 50,
    topics: ['Strings', 'Sorting', 'Trees', 'Matrix'],
    duration: '2 Weeks',
    enrolledStr: '120K',
    description: 'Top 50 most frequently asked questions at Meta (Facebook) over the last 6 months.',
    color: '#d0bcff'
  },
  {
    planId: 'google-pack',
    name: 'Google Target Pack',
    source: 'DevLeap Exclusives',
    level: 'Company',
    problemsCount: 65,
    topics: ['Graphs', 'Dynamic Programming', 'Hard DFS', 'Math'],
    duration: '3 Weeks',
    enrolledStr: '95K',
    description: 'Tackle the notoriously tricky algorithmic rounds at Google with this focused problem set.',
    color: '#ffb4ab'
  },
  {
    planId: 'beginner-path',
    name: 'Zero to DSA',
    source: 'DevLeap Basics',
    level: 'Beginner',
    problemsCount: 30,
    topics: ['Basics', 'Arrays', 'Strings', 'Math'],
    duration: '1 Week',
    enrolledStr: '200K',
    description: 'Never solved an algorithm problem before? Start here. Gentle introduction to problem solving.',
    color: '#4d8eff'
  }
];

const seedDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/devleap';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB.');

    await StudyPlan.deleteMany({});
    console.log('Cleared existing study plans.');

    await StudyPlan.insertMany(studyPlans);
    console.log('Successfully seeded study plans!');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding study plans:', err);
    process.exit(1);
  }
};

seedDB();
