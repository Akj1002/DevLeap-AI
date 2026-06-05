# 🚀 DevLeap AI - Premier Coding Interview & DSA Platform

**DevLeap AI** is a full-stack AI-powered platform designed to help developers master Data Structures & Algorithms (DSA), ace technical interviews, and climb the global coding leaderboard.

## ✨ Features

### 💻 **Code Execution Engine**
- Write and execute code in Python, JavaScript, Java, and C++
- Real-time code compilation using Piston API
- Support for custom test cases and inputs
- Instant feedback on code execution

### 🤖 **DevAI Assistant** (Powered by Google Gemini)
- Real-time coding hints without spoiling solutions
- Company-specific interview prep plans
- AI-driven workspace suggestions
- Gemini 1.5 Flash for instant responses

### 📊 **Problem Tracking Dashboard**
- 3000+ LeetCode problems with detailed descriptions
- Track solved problems by difficulty (Easy, Medium, Hard)
- Topic-based filtering and search
- Progress analytics and statistics

### 🏆 **Global Leaderboard**
- Compete with developers worldwide
- Real-time ranking updates
- Streak tracking and achievements
- Badge system for milestones

### 🎥 **Mock Interview Simulator**
- AI-powered technical interviews with camera/audio support
- Real-time feedback and evaluation
- Interview transcripts and analysis
- Performance scoring and improvement suggestions

### 💬 **Community Forum**
- Reddit-style discussion threads
- Question answering and knowledge sharing
- Upvoting system for helpful responses
- Tag-based categorization

### 👤 **User Profiles & Analytics**
- Detailed performance statistics
- Interview report history
- Problem-solving streaks
- Customizable profile with bio and picture

## 🛠️ Tech Stack

### **Backend**
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Google Generative AI API** - AI-powered hints
- **Nodemailer** - Email notifications
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Piston API** - Code execution

### **Frontend**
- **React 18** - UI framework
- **React Router v6** - Navigation
- **Axios** - HTTP client
- **Monaco Editor** - Code editor
- **Google OAuth** - Social login
- **TailwindCSS** - Styling

## 📋 Prerequisites

Ensure you have installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas cloud)
- **Git**

## 🔧 Installation & Setup

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/yourusername/devleap-ai.git
cd devleap-ai
```

### **Step 2: Backend Setup**

1. Navigate to backend folder:
```bash
cd backend
npm install
```

2. Create `.env` file from template:
```bash
cp .env.example .env
```

3. Update `.env` with your credentials:
```env
# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/devleap_db

# Server
PORT=5000
NODE_ENV=development

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Gemini AI
GEMINI_API_KEY=your_google_gemini_api_key

# Email (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

4. **Seed Database** (Load 3000+ LeetCode problems):
```bash
npm run seed
```

5. **Start Backend Server**:
```bash
npm start
```
Server will run on `http://localhost:5000`

### **Step 3: Frontend Setup**

1. Navigate to frontend folder (in a new terminal):
```bash
cd frontend
npm install
```

2. Create `.env.local` file:
```env
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_API_URL=http://localhost:5000
```

3. **Start Frontend Development Server**:
```bash
npm start
```
App will open at `http://localhost:3000`

## 🔑 Getting API Keys

### **1. Google OAuth**
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Create a new project
- Enable "Google+ API"
- Create OAuth 2.0 credentials (Web application)
- Add authorized redirect URIs: `http://localhost:3000`
- Copy `Client ID` and `Client Secret`

### **2. Gemini AI API**
- Visit [Google AI Studio](https://aistudio.google.com/apikey)
- Click "Create API Key"
- Copy the generated key

### **3. MongoDB Atlas**
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a free cluster
- Get connection string (replace `<password>` with your password)

### **4. Gmail App Password** (for Nodemailer)
- Enable 2-Factor Authentication on Gmail
- Generate App-specific password
- Use that password in `.env`

## 📁 Project Structure

```
devleap-ai/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Question.js
│   │   ├── Thread.js
│   │   └── InterviewReport.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── questions.js
│   │   ├── execute.js
│   │   ├── ai.js
│   │   ├── discuss.js
│   │   └── tracker.js
│   ├── server.js
│   ├── seed.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── AuthForm.jsx
│   │   │   ├── FloatingChatbot.jsx
│   │   │   ├── ProblemCard.jsx
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── AuthPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DSASheets.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Discuss.jsx
│   │   │   ├── InterviewAI.jsx
│   │   │   └── ...
│   │   ├── context/
│   │   │   └── GlobalState.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env.local
└── README.md
```

## 🚀 Running the Application

### **Terminal 1 - Backend Server**
```bash
cd backend
npm start
```
Runs on `http://localhost:5000`

### **Terminal 2 - Frontend Development**
```bash
cd frontend
npm start
```
Runs on `http://localhost:3000`

## 📚 API Endpoints

### **Authentication**
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/users/init` - Initialize/create user
- `POST /api/users/google` - Google OAuth login

### **Problems/Questions**
- `GET /api/questions` - Get all problems
- `GET /api/questions/:id` - Get specific problem

### **Code Execution**
- `POST /api/code/run` - Execute code with input

### **AI Assistance**
- `POST /api/ai/chat` - Get AI hints
- `POST /api/ai/prep-plan` - Generate interview prep

### **User Tracking**
- `GET /api/tracker/stats/:userId` - Get user statistics
- `PUT /api/tracker/profile/:userId` - Update profile
- `POST /api/tracker/streak/:userId` - Update streak

### **Leaderboard**
- `GET /api/users/leaderboard` - Get global rankings

### **Discussions**
- `GET /api/discuss` - Get all threads
- `POST /api/discuss` - Create new thread
- `POST /api/discuss/:id/reply` - Add reply to thread
- `POST /api/discuss/:id/upvote` - Upvote thread

### **Interview Reports**
- `POST /api/users/:id/interview-report` - Save interview feedback

## 🔄 Key Features Explained

### **DSA Tracker**
- View all 3000+ problems
- Filter by difficulty and topic
- Track solved problems
- Get AI-generated curriculum based on company

### **Code Workspace**
- Write code in any supported language
- Execute with custom test inputs
- Get real-time feedback
- Submit solutions to save progress

### **Interview Simulator**
- Start mock interviews
- Get real-time AI evaluation
- Camera & audio recording
- Receive detailed feedback reports

### **Community Forum**
- Post and discuss interview experiences
- Get tips from other developers
- Upvote helpful responses
- Tag-based organization

## 🔐 Security Features

- JWT token-based authentication
- Bcrypt password hashing
- Google OAuth 2.0 integration
- Environment variable protection
- Input validation on all endpoints
- CORS configuration for safe cross-origin requests

## 📈 Scaling & Deployment

### **Frontend Deployment** (Vercel/Netlify)
```bash
npm run build
# Deploy 'build' folder
```

### **Backend Deployment** (Heroku/Railway/Render)
```bash
# Push to repository
git push heroku main
```

## 🐛 Troubleshooting

### **Backend Connection Error**
- Verify MongoDB URI is correct
- Check if MongoDB server is running
- Ensure all environment variables are set

### **Google OAuth Not Working**
- Verify Client ID is correct
- Check authorized redirect URIs
- Ensure Google+ API is enabled

### **Code Execution Fails**
- Check internet connection (uses Piston API)
- Verify code syntax
- Check input format matches language requirements

### **Email Not Sending**
- Verify Gmail app password is correct
- Ensure 2FA is enabled on Gmail
- Check EMAIL_USER and EMAIL_PASS in .env

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see LICENSE.md for details.

## 👨‍💻 Author

Created by [Your Name/Team] - Passionate about building tools for developers!

## 🙏 Acknowledgments

- Google Generative AI (Gemini) for AI assistance
- Piston API for code execution
- MongoDB for database
- React.js community
- All contributors and users

## 📞 Support

- **Email**: support@devleap.ai
- **Issues**: [GitHub Issues](https://github.com/yourusername/devleap-ai/issues)
- **Discussions**: Community forum on the platform

---

**Happy Coding! 🎉 Start your interview preparation journey with DevLeap AI!**
