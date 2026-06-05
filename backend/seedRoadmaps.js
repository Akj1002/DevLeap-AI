const mongoose = require('mongoose');
require('dotenv').config();

const Roadmap = require('./models/Roadmap');

const roadmaps = [
  {
    trackId: 'dsa-mastery',
    name: 'DSA Mastery',
    description: 'Master Data Structures and Algorithms to ace top-tier tech interviews. Focuses on patterns rather than memorization.',
    icon: '💻',
    gradient: 'linear-gradient(135deg, #adc6ff 0%, #4d8eff 100%)',
    barColor: '#4d8eff',
    problemsCount: 150,
    timeToComplete: '12 weeks',
    topics: ['Arrays', 'Strings', 'Two Pointers', 'Sliding Window', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming'],
    topicColors: ['#adc6ff', '#adc6ff', '#adc6ff', '#adc6ff', '#adc6ff', '#adc6ff', '#adc6ff', '#adc6ff'],
    phases: {
      1: ['Arrays & Hashing', 'Two Pointers', 'Sliding Window', 'Stack'],
      2: ['Binary Search', 'Linked Lists', 'Trees', 'Tries'],
      3: ['Heap / Priority Queue', 'Backtracking', 'Graphs', '1-D DP', '2-D DP']
    }
  },
  {
    trackId: 'system-design',
    name: 'System Design',
    description: 'Learn how to design large-scale distributed systems. Essential for senior engineering roles.',
    icon: '🏗️',
    gradient: 'linear-gradient(135deg, #d0bcff 0%, #571bc1 100%)',
    barColor: '#d0bcff',
    problemsCount: 35,
    timeToComplete: '8 weeks',
    topics: ['Networking', 'Load Balancing', 'Caching', 'Database Indexing', 'Microservices', 'Message Queues'],
    topicColors: ['#d0bcff', '#d0bcff', '#d0bcff', '#d0bcff', '#d0bcff', '#d0bcff'],
    phases: {
      1: ['Networking Basics', 'DNS & CDNs', 'Load Balancing', 'API Design'],
      2: ['Caching Strategies', 'Database Sharding & Replication', 'Message Queues'],
      3: ['Microservices Architecture', 'System Design Case Studies (Twitter, Uber)']
    }
  },
  {
    trackId: 'frontend-engineering',
    name: 'Frontend Architect',
    description: 'Deep dive into advanced React, web performance, rendering patterns, and modern frontend architecture.',
    icon: '✨',
    gradient: 'linear-gradient(135deg, #4ae176 0%, #00a74b 100%)',
    barColor: '#4ae176',
    problemsCount: 80,
    timeToComplete: '10 weeks',
    topics: ['React Internals', 'State Management', 'Web Vitals', 'Accessibility', 'Testing', 'Build Tools'],
    topicColors: ['#4ae176', '#4ae176', '#4ae176', '#4ae176', '#4ae176', '#4ae176'],
    phases: {
      1: ['HTML/CSS Deep Dive', 'JavaScript Closures & Event Loop', 'DOM Manipulation'],
      2: ['React Rendering & Hooks', 'Advanced State Management (Redux/Zustand)', 'Routing'],
      3: ['Performance Optimization', 'Web Accessibility (a11y)', 'Testing (Jest/Cypress)']
    }
  },
  {
    trackId: 'backend-engineering',
    name: 'Backend Expert',
    description: 'Master server-side logic, API design, database modeling, and scalable deployments.',
    icon: '⚙️',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    barColor: '#f59e0b',
    problemsCount: 65,
    timeToComplete: '10 weeks',
    topics: ['Node.js', 'Express', 'SQL vs NoSQL', 'Authentication', 'Docker', 'CI/CD'],
    topicColors: ['#f59e0b', '#f59e0b', '#f59e0b', '#f59e0b', '#f59e0b', '#f59e0b'],
    phases: {
      1: ['Node.js Fundamentals', 'Express & REST APIs', 'Middleware & Error Handling'],
      2: ['Relational Databases (PostgreSQL)', 'NoSQL Databases (MongoDB)', 'ORM/ODM'],
      3: ['Authentication (JWT/OAuth)', 'Docker Containerization', 'Deployment & CI/CD']
    }
  }
];

const seedDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/devleap';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB.');

    // Clear existing roadmaps
    await Roadmap.deleteMany({});
    console.log('Cleared existing roadmaps.');

    // Insert new roadmaps
    await Roadmap.insertMany(roadmaps);
    console.log('Successfully seeded roadmaps!');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding roadmaps:', err);
    process.exit(1);
  }
};

seedDB();
