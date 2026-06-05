const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' }); // Ensure it resolves to backend/.env

const Roadmap = require('../models/Roadmap');
const StudyPlan = require('../models/StudyPlan');
const Contest = require('../models/Contest');
const Company = require('../models/Company');
const Thread = require('../models/Thread');

// Connect to DB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devleap')
  .then(() => console.log('MongoDB Connected for Seeding'))
  .catch(err => console.error(err));

const S = {
  primary: '#adc6ff',
  secondary: '#d0bcff',
  tertiary: '#4ae176',
  error: '#ffb4ab',
  outline: '#8c909f',
};

const roadmapsData = [
  {
    trackId: 'dsa',
    name: 'DSA Mastery',
    description: 'Master data structures and algorithms from fundamentals to advanced competitive programming.',
    icon: '⚡',
    gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
    barColor: S.primary,
    problemsCount: 200,
    timeToComplete: '3 months',
    topics: ['Arrays', 'Trees', 'Dynamic Programming', 'Graphs'],
    topicColors: [S.primary, S.secondary, '#f59e0b', S.tertiary],
    phases: {
      1: ['Big O Notation', 'Arrays & Strings', 'Linked Lists', 'Stacks & Queues', 'Binary Search', 'Two Pointers'],
      2: ['Trees & BST', 'Heaps', 'Hashing', 'Recursion & Backtracking', 'Sliding Window', 'Prefix Sum'],
      3: ['Dynamic Programming', 'Graphs & BFS/DFS', 'Greedy Algorithms', 'Trie', 'Segment Trees', 'Advanced DP'],
    },
  },
  {
    trackId: 'system-design',
    name: 'System Design',
    description: 'Learn to architect large-scale distributed systems used by top tech companies.',
    icon: '🏗️',
    gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
    barColor: S.secondary,
    problemsCount: 50,
    timeToComplete: '2 months',
    topics: ['Distributed Systems', 'Caching', 'Load Balancing', 'Databases'],
    topicColors: [S.secondary, '#06b6d4', '#f59e0b', S.tertiary],
    phases: {
      1: ['Scalability Basics', 'CAP Theorem', 'Load Balancers', 'SQL vs NoSQL', 'Caching Strategies', 'CDN'],
      2: ['Sharding & Partitioning', 'Message Queues', 'Rate Limiting', 'Consistent Hashing', 'Leader Election', 'Replication'],
      3: ['Design Twitter', 'Design YouTube', 'Design Uber', 'Design WhatsApp', 'Design Google Drive', 'Design Search Engine'],
    },
  },
  {
    trackId: 'frontend',
    name: 'Frontend Dev',
    description: 'Build performant, accessible, and beautiful web applications with modern tools.',
    icon: '🎨',
    gradient: 'linear-gradient(135deg,#06b6d4,#0891b2)',
    barColor: '#06b6d4',
    problemsCount: 80,
    timeToComplete: '2 months',
    topics: ['React', 'TypeScript', 'Performance', 'CSS'],
    topicColors: ['#06b6d4', S.primary, '#f59e0b', S.secondary],
    phases: {
      1: ['HTML & CSS Mastery', 'JavaScript ES6+', 'DOM Manipulation', 'React Fundamentals', 'State Management', 'React Hooks'],
      2: ['TypeScript Basics', 'Advanced React Patterns', 'Context & Redux', 'React Router', 'Form Handling', 'Testing'],
      3: ['Performance Optimization', 'Webpack & Vite', 'Web Vitals', 'Accessibility', 'Micro-frontends', 'SSR & Next.js'],
    },
  },
  {
    trackId: 'backend',
    name: 'Backend Dev',
    description: 'Create robust server-side applications with APIs, databases, and authentication.',
    icon: '⚙️',
    gradient: 'linear-gradient(135deg,#22c55e,#16a34a)',
    barColor: S.tertiary,
    problemsCount: 90,
    timeToComplete: '2.5 months',
    topics: ['REST APIs', 'Databases', 'Authentication', 'Microservices'],
    topicColors: [S.tertiary, S.primary, '#f59e0b', S.secondary],
    phases: {
      1: ['HTTP & REST', 'Node.js Basics', 'Express.js', 'PostgreSQL', 'MongoDB', 'API Design'],
      2: ['JWT & OAuth', 'Middleware', 'Error Handling', 'File Uploads', 'Email Services', 'Rate Limiting'],
      3: ['Microservices', 'gRPC', 'GraphQL', 'Message Brokers', 'Service Mesh', 'API Gateway'],
    },
  }
];

const studyPlansData = [
  {
    planId: 'blind75',
    name: 'Blind 75',
    source: 'Tech Interview Handbook',
    level: 'Intermediate',
    problemsCount: 75,
    topics: ['Arrays', 'Trees', 'Dynamic Programming', 'Graphs', 'BFS/DFS'],
    duration: '6 weeks',
    enrolledStr: '450K',
    description: 'The gold standard list of 75 LeetCode problems curated to prepare you for technical interviews.',
    color: S.primary,
  },
  {
    planId: 'neetcode150',
    name: 'NeetCode 150',
    source: 'NeetCode',
    level: 'Intermediate',
    problemsCount: 150,
    topics: ['Arrays', 'Trees', 'Graphs', 'DP', 'Backtracking'],
    duration: '10 weeks',
    enrolledStr: '380K',
    description: 'An expanded list by NeetCode with video explanations for every single problem. Community favorite.',
    color: S.secondary,
  }
];

const contestsData = [
  {
    contestId: 1, name: 'DevLeap Weekly #43', organizer: 'DevLeap', date: 'Jun 1, 2026', time: '10:00 AM UTC',
    duration: '1.5 hours', difficulty: 'Intermediate', problemsCount: 4, registeredCount: 1240, daysUntil: 8,
    color: S.primary, isPast: false
  },
  {
    contestId: 2, name: 'Monthly Grand Challenge', organizer: 'DevLeap', date: 'Jun 7, 2026', time: '2:00 PM UTC',
    duration: '2.5 hours', difficulty: 'Advanced', problemsCount: 6, registeredCount: 3450, daysUntil: 14,
    color: S.secondary, isPast: false
  },
  {
    contestId: 101, name: 'DevLeap Weekly #42', date: 'May 18, 2026', rank: 142, score: 2800, solvedCount: 3, problemsCount: 4, duration: '1.5 hrs', isPast: true
  },
  {
    contestId: 102, name: 'Monthly Grand Challenge', date: 'May 10, 2026', rank: 89, score: 3200, solvedCount: 4, problemsCount: 6, duration: '2.5 hrs', isPast: true
  }
];

const companiesData = [
  { companyId: 'google', name: 'Google', initial: 'G', industry: 'Tech', questionsCount: 450, comp: '$200K–$280K', rating: 5, easyPercent: 30, mediumPercent: 45, hardPercent: 25, color: S.primary, size: 'FAANG' },
  { companyId: 'meta', name: 'Meta', initial: 'M', industry: 'Tech', questionsCount: 380, comp: '$190K–$270K', rating: 5, easyPercent: 25, mediumPercent: 50, hardPercent: 25, color: '#1d4ed8', size: 'FAANG' },
  { companyId: 'amazon', name: 'Amazon', initial: 'A', industry: 'Tech', questionsCount: 520, comp: '$160K–$230K', rating: 4, easyPercent: 35, mediumPercent: 45, hardPercent: 20, color: '#f59e0b', size: 'FAANG' },
  { companyId: 'stripe', name: 'Stripe', initial: 'St', industry: 'Finance', questionsCount: 210, comp: '$180K–$260K', rating: 5, easyPercent: 20, mediumPercent: 48, hardPercent: 32, color: S.secondary, size: 'Mid-size' }
];

const threadsData = [
  {
    category: 'DSA & Algorithms', title: 'How I finally cracked the sliding window pattern after 3 months of struggle',
    content: 'After struggling with sliding window problems for months, I found a mental model that changed everything. The key insight is thinking about the window as a "contract" between left and right pointers.',
    author: 'CodeNinja_Dev', avatar: 'C', upvotes: 847, tags: ['sliding-window', 'arrays', 'two-pointers']
  },
  {
    category: 'System Design', title: 'Designing a Real-Time Collaborative Code Editor like LeetCode',
    content: 'Building a real-time collaborative code editor is one of the most challenging system design problems. Here is my complete breakdown.',
    author: 'SystemWhisperer', avatar: 'S', upvotes: 1243, tags: ['system-design', 'websockets', 'crdt', 'scale']
  }
];

const seedDB = async () => {
  try {
    await Roadmap.deleteMany({});
    await Roadmap.insertMany(roadmapsData);
    console.log('Roadmaps seeded');

    await StudyPlan.deleteMany({});
    await StudyPlan.insertMany(studyPlansData);
    console.log('Study Plans seeded');

    await Contest.deleteMany({});
    await Contest.insertMany(contestsData);
    console.log('Contests seeded');

    await Company.deleteMany({});
    await Company.insertMany(companiesData);
    console.log('Companies seeded');

    await Thread.deleteMany({});
    await Thread.insertMany(threadsData);
    console.log('Threads seeded');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
