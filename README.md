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
- [The DevLeap Ecosystem](#-the-devleap-ecosystem)
- [Core Functional Pillars](#-core-functional-pillars)
- [Tech Stack Overview](#-tech-stack-overview)
- [Zero-Mock Data & Seed-on-Demand](#-zero-mock-data--seed-on-demand)
- [Getting Started](#-getting-started)

---

## 🏗 System Architecture

DevLeap AI is built on a scalable **MERN** stack (MongoDB, Express, React, Node.js), augmented by real-time WebRTC channels and Google's advanced Gemini AI models. 

The backend employs a monolithic architecture with modularized Express routers handling 20+ distinct data domains. Every single feature on the frontend is rigorously backed by a corresponding Mongoose schema, ensuring data persistence, referential integrity, and a completely dynamic user experience without any hardcoded static data.

---

## 🌐 The DevLeap Ecosystem

Our ecosystem is partitioned into discrete environments, each tailored to a specific phase of a developer's journey:

| Environment | Description | Focus Area |
| :--- | :--- | :--- |
| **System Design** | An interactive drag-and-drop canvas for mapping out cloud architectures. | Architecture, Scalability |
| **Freelance Bounties** | A gig-board for bidding on real-world coding issues and earning rewards. | Portfolio, Open Source |
| **Developer Guilds** | Community clans pooling XP to conquer weekly global algorithmic quests. | Community, Collaboration |
| **Hackathons** | End-to-end event management with live voting, countdowns, and team building. | Innovation, Prototyping |
| **Code Racing** | Multiplayer arena for real-time competitive programming matches. | Speed, Syntax Mastery |
| **Showcase feed** | A Dribbble-like portfolio feed to collect upvotes on side projects. | Personal Branding |
| **Job Board** | Aggregated tech listings with one-click applying and salary tracking. | Career Advancement |
| **Mentorship** | Find and book 1-on-1 sessions with industry experts from FAANG. | Guidance, Networking |

---

## 🧠 Core Functional Pillars

### 1. The Problems Arena (DSA Tracker)
A robust, LeetCode-style problem-solving environment featuring over 1,000 algorithmic challenges. Problems are tagged by difficulty and company frequency, integrating directly with a browser-based execution environment and performance analytics dashboards.

### 2. Interactive AI Interviews
A groundbreaking feature utilizing Gemini 1.5. Participate in dynamic behavioral and technical interviews where the AI analyzes your code, vocal responses, and time complexity in real-time to simulate an actual senior engineering loop.

### 3. Collaborative AI Pair Programming
A WebIDE integrated directly with Gemini. Experience context-aware autocomplete, terminal emulation, and instant bug detection while sharing the editor environment with the AI.

### 4. Master Learning Roadmaps
A highly visual, node-based interactive tree mapping out the path from junior to senior engineer. It includes role-specific paths for Frontend, Backend, DevOps, and Data Science, utilizing gamified progression mechanics.

### 5. Peer-to-Peer Interview Matching
Tinder-like matching algorithm for developers seeking mock interviews. Once matched, users enter a synchronized WebRTC video-call room with a shared live-code editor to grill each other on technical concepts.

### 6. AI Code Review Engine
Submit GitHub PR links or raw code snippets. The AI agent conducts rigorous, line-by-line static analysis, leaving actionable, threaded inline comments highlighting vulnerabilities and architectural anti-patterns.

---

## 🛠 Tech Stack Overview

### Frontend
* **Core:** React 18, React Router DOM (v6)
* **Styling:** Custom CSS, CSS Modules, inline theming system
* **State Management:** Context API & React Hooks
* **Networking:** Axios, WebRTC (for peer-to-peer video)

### Backend
* **Core:** Node.js, Express.js
* **Database:** MongoDB, Mongoose ODM
* **AI Integration:** `@google/genai` (Gemini 1.5 Flash/Pro models)
* **Security:** Helmet, CORS, Express-Rate-Limit
* **Utilities:** Dotenv, Nodemon

---

## 🪄 Zero-Mock Data & Seed-on-Demand

To guarantee a production-grade experience out of the box, DevLeap utilizes a sophisticated **"Seed-on-Demand"** architecture. 

Absolutely no mock data is hardcoded into the React frontend. Instead, the application features an intelligent hydration mechanism: if an empty MongoDB collection is detected upon visiting a page, the backend automatically intercepts the request and injects rich, realistic sample data via hidden `/seed/bulk` endpoints. This ensures the ecosystem feels alive and populated immediately upon your first deployment.

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or higher)
* MongoDB (Local instance or Atlas URI)
* Google Gemini API Key

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Akj1002/DevLeap-AI.git
   cd DevLeap-AI
   ```

2. **Configure the Backend:**
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
   *Start the backend server:*
   ```bash
   npm start
   ```

3. **Configure the Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

4. **Access the Platform:**
   Open your browser and navigate to `http://localhost:3000`. The Seed-on-Demand architecture will automatically populate your database as you explore the modules!
