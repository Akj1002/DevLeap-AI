const mongoose = require('mongoose');
const fs = require('fs');
const Question = require('./models/Question');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected for JSON Import'))
    .catch(err => console.error('❌ MongoDB Error:', err));

const importData = async () => {
    try {
        // 1. Read the JSON file
        const rawData = fs.readFileSync('./leetcode_problems.json', 'utf-8');
        const data = JSON.parse(rawData);
        
        console.log(`📦 Found ${data.length} rich questions in JSON.`);

        // 2. Format the data to match your Question.js schema
        const formattedQuestions = data.map(q => ({
            questionId: String(q.question_id || q.id || q.frontend_question_id),
            title: q.title || 'Untitled Question',
            titleSlug: q.title_slug || '',
            difficulty: q.difficulty || 'Medium',
            category: q.category || 'Algorithms',
            // Ali's dataset uses 'description' or 'content' for HTML
            description: q.description || q.content || q.question_content || 'No description available.',
            topics: q.tags || q.topic_tags || [],
            // If the dataset has solutions, we map them here
            solutions: {
                python: q.solution_python || q.python_solution || '',
                java: q.solution_java || '',
                cpp: q.solution_cpp || ''
            }
        }));

        // 3. Clear and Insert
        await Question.deleteMany();
        console.log('🧹 Database cleared.');
        
        await Question.insertMany(formattedQuestions);
        console.log('🚀 SUCCESS: 3000+ Questions with Descriptions & Solutions Injected!');
        
        process.exit();
    } catch (err) {
        console.error('❌ Error during JSON injection:', err.message);
        process.exit(1);
    }
};

importData();