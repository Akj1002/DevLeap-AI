<div align="center">
  <img src="https://raw.githubusercontent.com/Akj1002/DevLeap-AI/main/docs/screenshots/landing.png" width="100%" alt="DevLeap AI Banner" />
  <h1>🚀 DevLeap AI</h1>
  <p><strong>The Ultimate Full-Stack Developer Ecosystem & Mock Interview Platform</strong></p>
  <p>
    Built with React, Node.js, Express, MongoDB, and Gemini AI. 15+ Advanced Modules designed to help developers practice system design, earn bounties, join guilds, review code, and land their dream jobs.
  </p>
</div>

---

## 🌟 Features Overview

DevLeap AI isn't just a coding platform—it is an interconnected ecosystem for modern software engineers. We've built **15 major features**, fully integrated with real-time MongoDB data and advanced AI.

### 📐 Live System Design Whiteboard
A fully interactive drag-and-drop canvas for drawing cloud architectures. Create, save, and share your system designs with the community.
<img src="https://raw.githubusercontent.com/Akj1002/DevLeap-AI/main/docs/screenshots/system_design.png" width="100%" alt="System Design" />

### 🛡️ Developer Guilds & Clans
Join a developer guild, pool XP together, and conquer weekly global quests (like "Solve 100 Hard DSA" or "Win 50 Code Races").
<img src="https://raw.githubusercontent.com/Akj1002/DevLeap-AI/main/docs/screenshots/guilds.png" width="100%" alt="Developer Guilds" />

### 💰 Freelance Bounties
Find paid micro-tasks and bounties. Bid on real-world issues to build your portfolio while earning cash.
<img src="https://raw.githubusercontent.com/Akj1002/DevLeap-AI/main/docs/screenshots/bounties.png" width="100%" alt="Bounties" />

### 🤖 AI Pair Programming
A collaborative WebIDE environment integrated with Gemini 1.5. Features context-aware autocomplete, terminal emulation, and instant debugging.
<img src="https://raw.githubusercontent.com/Akj1002/DevLeap-AI/main/docs/screenshots/ai_pair.png" width="100%" alt="AI Pair Programming" />

### 👥 Peer Mock Interviews
Match with peers around the world for live mock interviews. Features a shared real-time editor and integrated video-call UI components.
<img src="https://raw.githubusercontent.com/Akj1002/DevLeap-AI/main/docs/screenshots/peer_interviews.png" width="100%" alt="Peer Interviews" />

### 🏎️ Multiplayer Code Racing
Compete against other developers in real-time. Type out solutions, track your ELO, and climb the global competitive programming leaderboard.
<img src="https://raw.githubusercontent.com/Akj1002/DevLeap-AI/main/docs/screenshots/code_racing.png" width="100%" alt="Code Racing" />

### 🤝 Mentorship Network
Find industry experts from top tech companies. Check live availability, book sessions dynamically, and leave 5-star reviews.
<img src="https://raw.githubusercontent.com/Akj1002/DevLeap-AI/main/docs/screenshots/mentorship.png" width="100%" alt="Mentorship" />

### 👀 AI Code Review
Submit your GitHub PRs or code snippets for rigorous, line-by-line review by an advanced AI agent, simulating Senior Engineer feedback.
<img src="https://raw.githubusercontent.com/Akj1002/DevLeap-AI/main/docs/screenshots/code_review.png" width="100%" alt="Code Review" />

### 🏆 Hackathons Portal
Host and participate in virtual hackathons. Includes team builders, countdown timers, and live community voting.
<img src="https://raw.githubusercontent.com/Akj1002/DevLeap-AI/main/docs/screenshots/hackathons.png" width="100%" alt="Hackathons" />

### ✨ Project Showcase
A Dribbble-like feed for developer portfolios. Share your side projects, collect upvotes, and browse tech stacks.
<img src="https://raw.githubusercontent.com/Akj1002/DevLeap-AI/main/docs/screenshots/showcase.png" width="100%" alt="Showcase" />

### 💼 Tech Job Board
Live job listings with debounced full-text search, multi-filters (Remote/Type), quick apply modal, and save-to-DB functionality.
<img src="https://raw.githubusercontent.com/Akj1002/DevLeap-AI/main/docs/screenshots/jobs.png" width="100%" alt="Job Board" />

### 🔥 Habit & XP Tracker
Gamified coding habit tracker with XP, leveling system, streak tracking, and a 365-day contribution heatmap.
<img src="https://raw.githubusercontent.com/Akj1002/DevLeap-AI/main/docs/screenshots/habit_tracker.png" width="100%" alt="Habit Tracker" />

### 🏢 Top Companies & Roadmaps
Detailed tracking of top tech companies with compensation data and interactive skill-tree roadmaps for various developer roles.
<p float="left">
  <img src="https://raw.githubusercontent.com/Akj1002/DevLeap-AI/main/docs/screenshots/companies.png" width="49%" alt="Companies" />
  <img src="https://raw.githubusercontent.com/Akj1002/DevLeap-AI/main/docs/screenshots/roadmaps.png" width="49%" alt="Roadmaps" />
</p>

### 📺 Live Classes & Interview Experiences
A streaming UI for live tech workshops and a Reddit-style feed of massive company-specific interview debriefs.
<p float="left">
  <img src="https://raw.githubusercontent.com/Akj1002/DevLeap-AI/main/docs/screenshots/live_classes.png" width="49%" alt="Live Classes" />
  <img src="https://raw.githubusercontent.com/Akj1002/DevLeap-AI/main/docs/screenshots/experiences.png" width="49%" alt="Experiences" />
</p>

---

## 🏗️ Architecture & Tech Stack

**Frontend:**
- React 18
- React Router DOM
- Styled with modern CSS & CSS-in-JS patterns
- Axios for API communication
- React Toastify

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose (15+ Schemas)
- Google Gemini AI Integration (`@google/genai`)
- Seed-on-Demand architecture for dynamic DB population

---

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Akj1002/DevLeap-AI.git
   cd DevLeap-AI
   ```

2. **Start the Backend:**
   ```bash
   cd backend
   npm install
   # Create a .env file with your MONGO_URI and GEMINI_API_KEY
   npm start
   ```

3. **Start the Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Experience the Magic:**
   The backend implements an intelligent "Seed-on-Demand" strategy. When you visit any page for the first time, if your local MongoDB is empty, it will automatically populate with rich, dynamic seed data so you can experience the full platform immediately without manual setup!
