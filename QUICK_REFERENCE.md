# 🚀 DevLeap AI - Quick Reference Guide

## Starting the App

### Backend (Port 5000)
```bash
cd backend
npm start          # Production mode
npm run dev       # Development mode (auto-restart)
```

### Frontend (Port 3000)
```bash
cd frontend
npm start
```

---

## API Endpoints Cheat Sheet

### Authentication
```
POST   /api/auth/signup           - Register user
POST   /api/auth/login            - Login user
POST   /api/users/init            - Initialize user
POST   /api/users/google          - Google OAuth
```

### Problems
```
GET    /api/questions             - Get all problems (1000+)
GET    /api/questions/:id         - Get single problem
```

### Code Execution
```
POST   /api/code/run              - Execute code
Body: { language, code, input }
```

### AI Assistance
```
POST   /api/ai/chat               - Get AI hints
POST   /api/ai/prep-plan          - Generate prep curriculum
```

### User Tracking
```
GET    /api/tracker/stats/:id     - User statistics
GET    /api/tracker/problems/:id  - Solved problems
POST   /api/tracker/streak/:id    - Update streak
PUT    /api/tracker/profile/:id   - Update profile
```

### Leaderboard
```
GET    /api/users/leaderboard     - Global rankings
```

### Discussions
```
GET    /api/discuss               - All threads
POST   /api/discuss               - Create thread
POST   /api/discuss/:id/reply     - Add reply
POST   /api/discuss/:id/upvote    - Upvote thread
```

### Interviews
```
POST   /api/users/:id/interview-report  - Save report
GET    /api/users/:id/progress         - Get progress
POST   /api/users/solve                - Mark solved
```

---

## Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
PORT=5000
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=secret
GEMINI_API_KEY=api_key
EMAIL_USER=email@gmail.com
EMAIL_PASS=app_password
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

---

## File Structure Reference

```
devleap-ai/
├── backend/
│   ├── models/          - MongoDB schemas
│   ├── routes/          - API endpoints
│   ├── middleware/      - Auth, validation
│   ├── utils/           - Helper functions
│   └── server.js        - Main server
│
├── frontend/
│   ├── src/
│   │   ├── pages/       - Page components
│   │   ├── components/  - Reusable components
│   │   ├── context/     - Global state
│   │   └── App.js       - Main app
│   └── public/          - Static files
│
└── [Documentation files]
```

---

## Common Commands

### Install Dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### Start Development
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm start
```

### Seed Database
```bash
cd backend && npm run seed
```

### Build for Production
```bash
# Frontend
cd frontend && npm run build
```

---

## Database Collections

### Users
- `username` - User display name
- `email` - Login email (unique)
- `solvedProblems` - Array of solved problem IDs
- `interviewReports` - Interview feedback array
- `streakDays` - Coding streak counter

### Questions
- `questionId` - Problem ID
- `title` - Problem title
- `difficulty` - Easy/Medium/Hard
- `description` - Problem description
- `topics` - Related topics

### Threads
- `title` - Discussion title
- `content` - Post content
- `author` - User who posted
- `tags` - Discussion tags
- `upvotes` - Upvote count
- `replies` - Replies array

---

## Debugging Tips

### Backend Logging
```javascript
console.log('🌍 Request:', req.method, req.path);
console.log('✅ Success:', message);
console.log('❌ Error:', error.message);
```

### Frontend Debugging
```javascript
axios.interceptors.response.use(
  response => console.log('✅', response),
  error => console.error('❌', error)
);
```

### Check Services
```bash
# Backend health
curl http://localhost:5000/test

# Frontend
open http://localhost:3000
```

---

## Keyboard Shortcuts

### In Code Editor (Dashboard)
- `Ctrl + Enter` - Run code
- `Ctrl + Shift + Enter` - Submit code
- `Ctrl + /` - Toggle comment
- `Alt + Shift + F` - Format code

### In Browser
- `F12` - Open DevTools
- `Ctrl + Shift + C` - Inspect element
- `Ctrl + Shift + J` - Open console

---

## Performance Tips

1. **Database Queries**
   - Use `.populate()` for related data
   - Add `.select()` to limit fields
   - Use pagination for large datasets

2. **Frontend**
   - Use React.memo for components
   - Lazy load route components
   - Optimize images

3. **API**
   - Cache leaderboard data
   - Implement rate limiting
   - Use compression middleware

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 500 | Server error |

---

## Testing Checklist

- [ ] User signup works
- [ ] User login works
- [ ] Google OAuth works
- [ ] Can view problems
- [ ] Can execute code
- [ ] Can get AI hints
- [ ] Can submit problems
- [ ] Leaderboard updates
- [ ] Interview simulator works
- [ ] Discussion forum works

---

## Deployment Checklist

- [ ] All env variables configured
- [ ] Database backups setup
- [ ] Secrets stored safely
- [ ] SSL/HTTPS enabled
- [ ] Error monitoring enabled
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] CDN setup
- [ ] Database indexes created
- [ ] Monitoring alerts setup

---

## Getting Help

- **Documentation**: See README.md & SETUP.md
- **Issues**: GitHub Issues
- **Email**: support@devleap.ai
- **Community**: Discussion forum on app

---

## Quick Links

- 📚 [Full README](README.md)
- 🔧 [Setup Guide](SETUP.md)
- 📋 [Changes Summary](FIXES_SUMMARY.md)
- 🌐 [MongoDB Docs](https://docs.mongodb.com/)
- ⚛️ [React Docs](https://react.dev)
- 🚀 [Express Docs](https://expressjs.com/)

---

**Pro Tip**: Use `npm run dev` for automatic backend restart during development!

Keep coding! 🎉
