const mongoose = require('mongoose');
require('dotenv').config();

const Contest = require('./models/Contest');

const upcomingContests = [
  {
    contestId: 101,
    name: 'Weekly Contest 400',
    organizer: 'LeetCode',
    date: 'Sun, June 14, 2026',
    time: '8:00 AM IST',
    duration: '1.5 hrs',
    difficulty: 'Intermediate',
    problemsCount: 4,
    registeredCount: 15420,
    daysUntil: 2,
    color: '#f59e0b',
    link: 'https://leetcode.com/contest/',
    isPast: false
  },
  {
    contestId: 102,
    name: 'Global Hackathon 2026',
    organizer: 'Unstop',
    date: 'Sat, June 20, 2026',
    time: '10:00 AM IST',
    duration: '48 hrs',
    difficulty: 'Advanced',
    problemsCount: 5,
    registeredCount: 4200,
    daysUntil: 8,
    color: '#adc6ff',
    link: 'https://unstop.com/hackathons',
    isPast: false
  },
  {
    contestId: 103,
    name: 'June Easy \'26',
    organizer: 'HackerEarth',
    date: 'Sun, June 21, 2026',
    time: '9:30 PM IST',
    duration: '3 hrs',
    difficulty: 'Beginner',
    problemsCount: 6,
    registeredCount: 8900,
    daysUntil: 9,
    color: '#4ae176',
    link: 'https://www.hackerearth.com/challenges/',
    isPast: false
  },
  {
    contestId: 104,
    name: 'ProjectEuler+',
    organizer: 'HackerRank',
    date: 'Ongoing',
    time: 'Anytime',
    duration: 'N/A',
    difficulty: 'Intermediate',
    problemsCount: 250,
    registeredCount: 35000,
    daysUntil: 0,
    color: '#d0bcff',
    link: 'https://www.hackerrank.com/contests/projecteuler/challenges',
    isPast: false
  }
];

const pastContests = [
  {
    contestId: 99,
    name: 'Biweekly Contest 130',
    organizer: 'LeetCode',
    date: 'Sat, May 30, 2026',
    duration: '1.5 hrs',
    problemsCount: 4,
    rank: 1205,
    score: 12,
    solvedCount: 3,
    color: '#f59e0b',
    link: 'https://leetcode.com/contest/biweekly-contest-130/',
    isPast: true
  },
  {
    contestId: 98,
    name: 'Circuits May \'26',
    organizer: 'HackerEarth',
    date: 'Sun, May 24, 2026',
    duration: '7 Days',
    problemsCount: 8,
    rank: 450,
    score: 65,
    solvedCount: 5,
    color: '#4ae176',
    link: 'https://www.hackerearth.com/challenges/',
    isPast: true
  }
];

const seedDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/devleap';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB.');

    await Contest.deleteMany({});
    console.log('Cleared existing contests.');

    await Contest.insertMany([...upcomingContests, ...pastContests]);
    console.log('Successfully seeded contests!');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding contests:', err);
    process.exit(1);
  }
};

seedDB();
