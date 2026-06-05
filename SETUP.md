# 🚀 DevLeap AI - Complete Setup Guide

This guide will walk you through every step needed to get DevLeap AI running on your machine.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Setup (Automated)](#quick-setup-automated)
3. [Manual Setup](#manual-setup)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you start, make sure you have:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (usually comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)
- **MongoDB Atlas Account** - [Create free account](https://www.mongodb.com/cloud/atlas)
- **Google Cloud Console Account** - [Access here](https://console.cloud.google.com/)
- **Gmail Account** - For email notifications

### Check if installed:
```bash
node --version    # Should show v16.0.0 or higher
npm --version     # Should show 8.0.0 or higher
git --version     # Should show git version
```

---

## Quick Setup (Automated)

### On Windows:
```bash
setup.bat
```

### On Mac/Linux:
```bash
chmod +x setup.sh
./setup.sh
```

Then skip to [Environment Configuration](#environment-configuration) section.

---

## Manual Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/devleap-ai.git
cd devleap-ai
```

### Step 2: Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

### Step 3: Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env.local
cd ..
```

---

## Environment Configuration

### Backend Configuration (backend/.env)

1. **MongoDB Connection**
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/devleap_db?retryWrites=true&w=majority
   ```
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get connection string (replace username:password)

2. **Google OAuth Setup**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable "Google+ API"
   - Create OAuth 2.0 credentials
   - Add redirect URI: `http://localhost:5000`
   ```env
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

3. **Gemini API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/apikey)
   - Create API key
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Gmail Configuration** (for email notifications)
   - Enable 2-Factor Authentication on Gmail
   - Generate [App Password](https://myaccount.google.com/apppasswords)
   ```env
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password_16chars
   ```

5. **JWT Secret**
   ```env
   JWT_SECRET=create_a_random_strong_secret_key_min_32_chars
   ```

### Frontend Configuration (frontend/.env.local)

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## Database Setup

### Load 3000+ Problems

Once backend .env is configured:

```bash
cd backend
npm run seed
```

This will:
- Connect to MongoDB
- Clear existing questions
- Load 3000+ LeetCode problems with descriptions
- Create indexed collections for fast queries

**Expected Output:**
```
✅ MongoDB Connected for JSON Import
📦 Found 3000 rich questions in JSON.
🧹 Database cleared.
🚀 SUCCESS: 3000+ Questions with Descriptions & Solutions Injected!
```

---

## Running the Application

### Terminal 1 - Start Backend

```bash
cd backend
npm start
```

**Expected Output:**
```
✅ MongoDB Connected Successfully
🚀 Server running on http://localhost:5000
```

### Terminal 2 - Start Frontend

```bash
cd frontend
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view devleap-frontend in the browser.
Local: http://localhost:3000
```

### Terminal 3 (Optional) - Development Mode

For automatic backend restart on code changes:

```bash
cd backend
npm run dev
```

---

## 🎯 Testing the Setup

1. **Backend Health Check**
   - Visit `http://localhost:5000/test`
   - Should see: "Backend is Alive! ✅"

2. **Frontend App**
   - Visit `http://localhost:3000`
   - Should see: DevLeap AI landing page

3. **Google OAuth**
   - Click "Sign Up Free"
   - Click Google Sign-In button
   - Complete Google authentication

4. **Gemini AI**
   - Go to Dashboard
   - Click a problem
   - Ask DevAI a question in the chat
   - Should receive AI response

---

## Troubleshooting

### MongoDB Connection Error
```
❌ DB Connection Error: connect ECONNREFUSED
```

**Solution:**
- Verify MONGO_URI is correct in .env
- Check MongoDB Atlas connection is active
- Ensure your IP is whitelisted in MongoDB Atlas

### Google OAuth Error
```
Error: Invalid OAuth 2.0 client ID
```

**Solution:**
- Verify Client ID in .env is correct
- Check redirect URI includes: `http://localhost:5000`
- Regenerate credentials if needed

### Gemini API Error
```
Error: Invalid API key
```

**Solution:**
- Verify API key in .env is correct
- Check Gemini API is enabled in Google Cloud Console
- Generate new key if needed

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Find and kill process using port 5000
# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -i :5000
kill -9 <PID>
```

### Dependencies Installation Error
```
npm ERR! code ERESOLVE
```

**Solution:**
```bash
npm install --legacy-peer-deps
```

### Cannot Find Module
```
Error: Cannot find module 'dotenv'
```

**Solution:**
```bash
npm install dotenv
```

---

## 📊 Project Structure After Setup

```
devleap-ai/
├── backend/
│   ├── node_modules/
│   ├── .env              (✅ Created with credentials)
│   ├── package.json
│   └── server.js         (Ready to run)
│
├── frontend/
│   ├── node_modules/
│   ├── .env.local        (✅ Created with credentials)
│   ├── package.json
│   └── src/              (Ready to run)
│
├── README.md
└── setup.sh / setup.bat
```

---

## 🚀 Next Steps

1. **Explore Features**
   - Solve DSA problems
   - Use DevAI hints
   - Mock interviews
   - Community forum

2. **Customize**
   - Add your own problems
   - Modify themes and styling
   - Add new features

3. **Deploy**
   - Deploy backend to Heroku/Railway
   - Deploy frontend to Vercel/Netlify

---

## 📞 Support

- **Documentation**: See [README.md](README.md)
- **Issues**: Report bugs on GitHub Issues
- **Email**: support@devleap.ai

---

## ✅ Verification Checklist

Before starting development, verify:

- [ ] Node.js and npm installed
- [ ] Repository cloned
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] .env configured with all required keys
- [ ] MongoDB Atlas connection working
- [ ] Database seeded with 3000+ problems
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can access app at http://localhost:3000

---

**You're all set! Happy coding! 🎉**
