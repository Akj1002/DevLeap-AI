<div align="center">

# ⚡ DevLeap AI

**The Ultimate Full-Stack Developer Ecosystem & Mock Interview Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-v18+-green.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18.x-61dafb.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Enabled-47A248.svg?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![AI](https://img.shields.io/badge/AI-Google_Gemini-FF6F00.svg?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)

_DevLeap AI is a massive, interconnected ecosystem engineered to take developers from their first line of code to their senior engineering interview._

[Explore The Features](#-the-devleap-ecosystem) • [Architecture Deep-Dive](#-system-architecture) • [Getting Started](#-quick-start-guide) • [Contributing](#-contributing-to-devleap)

</div>

---

## 🌌 The Vision

The modern developer's journey is fragmented. You practice algorithms on one site, mock interviews on another, track jobs on a third, and build your portfolio somewhere else entirely. 

**DevLeap AI unifies the developer lifecycle.** We have engineered over 15 distinct, interconnected modules—ranging from a LeetCode-style problem tracker to real-time WebRTC peer interviews—all unified under a single, seamless, gamified ecosystem. Driven by **Google's Gemini AI**, DevLeap acts as your relentless mentor, pair programmer, and senior code reviewer.

---

## 🌐 The DevLeap Ecosystem

DevLeap is partitioned into interactive environments, each tailored to a specific phase of your career:

<details open>
<summary><b>🔥 Technical Interview Mastery</b></summary>

* **The Problems Arena:** A robust execution sandbox featuring 1,000+ algorithmic challenges. Features dynamic tagging (Difficulty, Topic, Company Frequency) and real-time execution analytics (time/space complexity).
* **Interactive AI Interviews:** Powered by Gemini 1.5. Engage in dynamic behavioral and technical loops where the AI analyzes your vocal cadence, code quality, and edge-case handling to simulate FAANG-level pressure.
* **Peer-to-Peer Interview Matching:** A proprietary matching algorithm pairs you with developers globally. Enter a synchronized WebRTC video-call room with a shared live-code editor to grill each other on technical concepts.
</details>

<details open>
<summary><b>🛡️ Community & Competitive Programming</b></summary>

* **Multiplayer Code Racing:** A real-time competitive programming arena. Type out solutions, track your Elo rating, and climb the global leaderboard.
* **Developer Guilds:** Join community clans, pool your XP, and conquer weekly global algorithmic quests (e.g., "Solve 100 Hard DSA as a team").
* **Hackathons Portal:** End-to-end event management with live voting, countdowns, and team-building capabilities.
* **The Discussion Forum:** A vibrant, threaded forum to debate optimal solutions and system design tradeoffs, backed by a reputation system.
</details>

<details open>
<summary><b>📐 Architecture & Learning</b></summary>

* **Live System Design Whiteboard:** An interactive drag-and-drop canvas for mapping out cloud architectures. Save your designs directly to MongoDB and share them with the community.
* **AI Code Review Engine:** Submit raw code snippets. The AI agent conducts rigorous, line-by-line static analysis, leaving threaded inline comments highlighting vulnerabilities and architectural anti-patterns.
* **Master Learning Roadmaps:** A highly visual, node-based interactive tree mapping out role-specific paths for Frontend, Backend, DevOps, and Data Science.
</details>

<details open>
<summary><b>💼 Career Advancement</b></summary>

* **Freelance Bounties:** A gig-board for bidding on real-world coding issues. Solve problems, build your open-source portfolio, and earn rewards.
* **Tech Job Board:** Aggregated listings featuring debounced full-text search, multi-filters, quick apply modals, and salary tracking.
* **Mentorship Network:** Find and dynamically book 1-on-1 sessions with industry experts.
* **Project Showcase:** A Dribbble-style portfolio feed to collect upvotes on your side projects and browse trending tech stacks.
</details>

---

## 🏗 System Architecture

DevLeap AI is built upon a highly scalable, monolithic **MERN** stack architecture, augmented by real-time protocols and advanced LLMs.

### 🗄️ Backend Data Flow & Security
* **Modular Routing:** Express.js routers are deeply modularized across 20+ distinct data domains (`/api/users`, `/api/coderace`, `/api/guilds`, etc.).
* **Referential Integrity:** Every feature is rigorously backed by a custom Mongoose schema. We utilize complex MongoDB Aggregation Pipelines for generating leaderboards and analytics.
* **Zero-Trust Security:** Integrated `express-rate-limit` to prevent brute force attacks, `helmet` for strict HTTP header security, JWT for stateless authentication, and `bcryptjs` for password hashing.
* **AI Microservices:** Routes like `/api/ai-pair` interact directly with `@google/genai` to stream conversational context and execute static code reviews dynamically.

### 💻 Frontend React Engineering
* **Client-Side Routing:** `React Router v6` handles complex, nested layouts and guarded routes.
* **State & Networking:** Global state is managed via Context API. Axios interceptors seamlessly inject JWT tokens into protected API calls.
* **Real-Time Communications:** `useWebRTC` custom hooks manage RTCPeerConnections and STUN/TURN server negotiations for flawless peer-to-peer video streaming.
* **Glassmorphism UI:** CSS Modules and inline theming deliver a unified, premium dark-mode aesthetic.

---

## 📁 Project Directory Structure

```text
DevLeap-AI/
├── backend/
│   ├── config/          # DB, Logger, and Swagger config
│   ├── middleware/      # Auth, Error Handling, Rate Limiting
│   ├── models/          # 20+ Mongoose Schemas
│   ├── routes/          # Express API controllers
│   ├── scripts/         # Intelligent DB Seed scripts
│   ├── server.js        # Main Express entry point
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/  # Reusable UI (Navbar, AuthForm, Chatbot)
    │   ├── context/     # GlobalState context providers
    │   ├── hooks/       # Custom hooks (useWebRTC, useAuth)
    │   ├── pages/       # 15+ Core Application Views
    │   ├── services/    # Axios API networking
    │   ├── App.js       # React Router configuration
    │   └── index.css    # Global design tokens
    └── package.json
```

---

## 🪄 Zero-Mock Data & Seed-on-Demand

To guarantee a production-grade experience out of the box, DevLeap utilizes a sophisticated **"Seed-on-Demand"** hydration architecture. 

Absolutely no mock data is hardcoded into the React frontend. If the application detects an empty MongoDB collection upon visiting a page, the frontend automatically intercepts the request and triggers a `POST` to hidden `/seed/bulk` API endpoints. The backend instantly injects rich, mathematically realistic sample data directly into MongoDB. This ensures the ecosystem feels alive and populated immediately upon your first deployment!

---

## 🚀 Quick Start Guide

Ready to deploy the ultimate developer ecosystem locally?

### Prerequisites
* **Node.js** (v18 or higher)
* **MongoDB** (Local instance or MongoDB Atlas cluster)
* **Google Gemini API Key** (Get one from Google AI Studio)

### 1. Clone & Install
```bash
git clone https://github.com/Akj1002/DevLeap-AI.git
cd DevLeap-AI
```

### 2. Configure the Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_super_secret_jwt_key
```
Start the backend development server:
```bash
npm run dev
```

### 3. Configure the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm start
```

### 4. Experience the Platform
Navigate to `http://localhost:3000`. The Seed-on-Demand architecture will automatically populate your database with challenges, system designs, bounties, guilds, and users as you explore!

---

## 🤝 Contributing to DevLeap

We believe in the power of open-source. Whether you're fixing bugs, improving documentation, or proposing new ecosystem modules, your contributions are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code adheres to the existing styling conventions and that all Mongoose schemas are properly validated.

---

<div align="center">
  <p>Built with ❤️ by developers, for developers.</p>
</div>
