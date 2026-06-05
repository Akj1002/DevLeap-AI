# ⚡ DevLeap AI

<div align="center">
  <p><strong>The Ultimate Full-Stack Developer Ecosystem & Mock Interview Platform</strong></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Node.js Version](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
  [![React Version](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://reactjs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Enabled-47A248.svg)](https://www.mongodb.com/)
  [![AI](https://img.shields.io/badge/AI-Google_Gemini-FF6F00.svg)](https://deepmind.google/technologies/gemini/)
</div>

<br />

DevLeap AI is not just another coding platform—it is a massive, interconnected ecosystem designed specifically for modern software engineers. Spanning over 15 advanced modules, DevLeap acts as an all-in-one hub for algorithmic mastery, system design practice, peer-to-peer mentorship, and AI-driven technical interview preparation.

---

## 📑 Table of Contents
- [System Architecture](#-system-architecture)
- [Project Directory Structure](#-project-directory-structure)
- [The DevLeap Ecosystem](#-the-devleap-ecosystem)
- [Core Functional Pillars](#-core-functional-pillars)
- [Tech Stack & Integrations](#-tech-stack--integrations)
- [Zero-Mock Data & Seed-on-Demand](#-zero-mock-data--seed-on-demand)
- [Getting Started](#-getting-started)

---

## 🏗 System Architecture

DevLeap AI is built upon a highly scalable, monolithic **MERN** stack architecture (MongoDB, Express, React, Node.js), augmented by real-time WebRTC channels and Google's advanced Gemini AI models. 

### Backend Data Flow
The backend utilizes Express.js routers heavily modularized across 20+ distinct data domains (Users, Problems, Contests, SystemDesigns, Guilds, etc.). Every single feature on the frontend is rigorously backed by a corresponding Mongoose schema. This ensures total data persistence, strict referential integrity across interconnected models, and a completely dynamic user experience without any hardcoded static JSON data. 
- **Security:** Integrated `express-rate-limit`, `helmet` for HTTP header security, and CORS policies configured for dedicated frontend origins.
- **AI Microservices:** AI routes (like `/api/ai-pair` and `/api/codereviews`) interact directly with `@google/genai` to dynamically execute code reviews and generate conversational behavioral interview flows.

### Frontend Data Flow
The React 18 application utilizes `React Router v6` for extensive client-side routing across 15+ complex views. Global state management is handled elegantly through React Context API and custom hooks. The UI utilizes CSS Modules and inline theming to deliver a unified, premium dark-mode aesthetic with glassmorphism interactions.

---

## 📁 Project Directory Structure

```text
DevLeap-AI/
├── backend/
│   ├── config/          # Database, Logger, and Swagger configuration
│   ├── middleware/      # Auth, Error Handling, Security, Rate Limiting
│   ├── models/          # 20+ Mongoose Schemas (Bounty, CodeRace, Mentor, etc.)
│   ├── routes/          # Express API controllers
│   ├── scripts/         # DB Seed scripts and automation
│   ├── server.js        # Main Express entry point
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/  # Reusable UI components (Navbar, AuthForm, Chatbot)
    │   ├── context/     # GlobalState context providers
    │   ├── hooks/       # Custom hooks (useWebRTC, useAuth)
    │   ├── pages/       # 15+ Core Application Views
    │   ├── services/    # Axios API networking logic
    │   ├── App.js       # Main React Router configuration
    │   └── index.css    # Global design tokens and utilities
    └── package.json
```

---

## 🌐 The DevLeap Ecosystem

Our ecosystem is partitioned into discrete environments, each tailored to a specific phase of a developer's lifecycle:

| Environment | Description | Focus Area |
| :--- | :--- | :--- |
| **System Design** | An interactive drag-and-drop canvas for mapping out cloud architectures. | Architecture, Scalability |
| **Freelance Bounties** | A gig-board for bidding on real-world coding issues and earning rewards. | Portfolio, Open Source |
| **Developer Guilds** | Community clans pooling XP to conquer weekly global algorithmic quests. | Community, Collaboration |
| **Hackathons** | End-to-end event management with live voting, countdowns, and team building. | Innovation, Prototyping |
| **Code Racing** | Multiplayer arena for real-time competitive programming matches. | Speed, Syntax Mastery |
| **Showcase Feed** | A Dribbble-like portfolio feed to collect upvotes on side projects. | Personal Branding |
| **Job Board** | Aggregated tech listings with one-click applying and salary tracking. | Career Advancement |
| **Mentorship** | Find and book 1-on-1 sessions with industry experts from FAANG. | Guidance, Networking |

---

## 🧠 Core Functional Pillars

### 1. The Problems Arena (DSA Tracker)
A robust, LeetCode-style problem-solving environment featuring over 1,000 algorithmic challenges. Problems are tagged by difficulty and company frequency. A comprehensive dashboard tracks your solving velocity, streak consistency, and topic mastery over time.

### 2. Interactive AI Interviews
A groundbreaking feature utilizing Gemini 1.5. Participate in dynamic behavioral and technical interviews where the AI analyzes your code, vocal responses, and time complexity in real-time to simulate an actual senior engineering loop. It includes target-company preparation to mimic specific FAANG interview loops.

### 3. Collaborative AI Pair Programming
A WebIDE integrated directly with Gemini. Experience context-aware autocomplete, terminal emulation, and instant bug detection while sharing the editor environment with the AI.

### 4. Master Learning Roadmaps
A highly visual, node-based interactive tree mapping out the path from junior to senior engineer. It includes role-specific paths for Frontend, Backend, DevOps, and Data Science. As you learn, check off nodes to track your mastery.

### 5. Peer-to-Peer Interview Matching
Tinder-like matching algorithm for developers seeking mock interviews. Once matched, users enter a synchronized WebRTC video-call room with a shared live-code editor to grill each other on technical concepts and leave actionable post-interview reviews.

### 6. AI Code Review Engine
Submit GitHub PR links or raw code snippets. The AI agent conducts rigorous, line-by-line static analysis, leaving actionable, threaded inline comments highlighting potential vulnerabilities, time-complexity bottlenecks, and architectural anti-patterns.

### 7. Global Contests Arena
Put your skills to the ultimate test in global coding contests. Features live leaderboards calculating your position in real-time as you submit passing solutions. Backed by a comprehensive Elo-style rating system.

### 8. The Developer Community
A vibrant, integrated discussion forum where developers solve problems together. Deep dive into specific algorithms, share optimal solutions, or discuss system design tradeoffs. Earn reputation points by helping others and upvoting high-quality answers.

---

## 🛠 Tech Stack & Integrations

### Frontend Technologies
* **Core:** React 18, React Router DOM (v6)
* **Styling:** Custom CSS, CSS Modules, Tailwind-inspired inline theming
* **State Management:** Context API & React Hooks
* **Networking & Comms:** Axios (REST), WebRTC (Peer-to-Peer Video)
* **Tooling:** Create React App, Webpack

### Backend Technologies
* **Core:** Node.js, Express.js
* **Database:** MongoDB, Mongoose ODM
* **AI Integration:** `@google/genai` (Gemini 1.5 Flash/Pro models)
* **Security & Optimization:** Helmet, CORS, Express-Rate-Limit, bcryptjs
* **DevOps Utilities:** Dotenv, Nodemon

---

## 🪄 Zero-Mock Data & Seed-on-Demand

To guarantee a production-grade experience out of the box, DevLeap utilizes a sophisticated **"Seed-on-Demand"** architecture. 

Absolutely no mock data is hardcoded into the React frontend components. Instead, the application features an intelligent hydration mechanism: if an empty MongoDB collection is detected upon visiting a page, the frontend automatically intercepts the request and triggers a `POST` request to hidden `/seed/bulk` API endpoints. The backend instantly injects rich, realistic sample data directly into MongoDB. This ensures the ecosystem feels alive and populated immediately upon your first deployment, while remaining purely data-driven.

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or higher)
* MongoDB (Local instance or MongoDB Atlas URI)
* Google Gemini API Key

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Akj1002/DevLeap-AI.git
   cd DevLeap-AI
   ```

2. **Configure & Run the Backend:**
   ```bash
   cd backend
   npm install
   ```
   *Create a `.env` file in the `backend` directory:*
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   ```
   *Start the backend development server:*
   ```bash
   npm run dev
   ```

3. **Configure & Run the Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

4. **Experience the Magic:**
   Open your browser and navigate to `http://localhost:3000`. The Seed-on-Demand architecture will automatically populate your database with challenges, system designs, bounties, guilds, and users as you explore the modules!
