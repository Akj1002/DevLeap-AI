import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DSASheets from './pages/DSASheets';
import Dashboard from './pages/Dashboard';        // LeetCode coding workspace
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Discuss from './pages/Discuss';
import InterviewAI from './pages/InterviewAI';
import PersonalDashboard from './pages/PersonalDashboard';
import Roadmaps from './pages/Roadmaps';
import StudyPlans from './pages/StudyPlans';
import Companies from './pages/Companies';
import Contests from './pages/Contests';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import Behavioral from './pages/Behavioral';
import Premium from './pages/Premium';
import ResumeBuilder from './pages/ResumeBuilder';
import Jobs from './pages/Jobs';
import Mentorship from './pages/Mentorship';
import CodeReview from './pages/CodeReview';
import Hackathons from './pages/Hackathons';
import Showcase from './pages/Showcase';
import HabitTracker from './pages/HabitTracker';
import InterviewExperiences from './pages/InterviewExperiences';
import LiveClasses from './pages/LiveClasses';
import CodeRacing from './pages/CodeRacing';
import PeerInterviews from './pages/PeerInterviews';
import AIPairProgramming from './pages/AIPairProgramming';
import Bounties from './pages/Bounties';
import Guilds from './pages/Guilds';
import SystemDesign from './pages/SystemDesign';

// Routes where the Navbar should be hidden (full-screen experiences)
const HIDDEN_NAVBAR_ROUTES = ['/workspace'];

function AppContent() {
  const location = useLocation();
  const hideNavbar = HIDDEN_NAVBAR_ROUTES.some(route =>
    location.pathname.startsWith(route)
  );

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* Core */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Learning */}
        <Route path="/tracker" element={<DSASheets />} />
        <Route path="/workspace/:id" element={<Dashboard />} />
        <Route path="/study-plans" element={<StudyPlans />} />
        <Route path="/roadmaps" element={<Roadmaps />} />
        <Route path="/companies" element={<Companies />} />

        {/* Competition */}
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/contests" element={<Contests />} />

        {/* AI Features */}
        <Route path="/interview" element={<InterviewAI />} />
        <Route path="/behavioral" element={<Behavioral />} />

        {/* Social */}
        <Route path="/discuss" element={<Discuss />} />

        {/* User */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<PersonalDashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/resume-builder" element={<ResumeBuilder />} />
        <Route path="/admin" element={<Admin />} />

        {/* New Pages */}
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/mentorship" element={<Mentorship />} />
        <Route path="/code-review" element={<CodeReview />} />
        <Route path="/hackathons" element={<Hackathons />} />
        <Route path="/showcase" element={<Showcase />} />
        <Route path="/habit-tracker" element={<HabitTracker />} />
        <Route path="/experiences" element={<InterviewExperiences />} />
        <Route path="/live-classes" element={<LiveClasses />} />
        <Route path="/code-racing" element={<CodeRacing />} />
        <Route path="/peer-interviews" element={<PeerInterviews />} />
        <Route path="/ai-pair" element={<AIPairProgramming />} />
        <Route path="/bounties" element={<Bounties />} />
        <Route path="/guilds" element={<Guilds />} />
        <Route path="/system-design" element={<SystemDesign />} />


        {/* Fallback */}
        <Route path="*" element={<LandingPage />} />
      </Routes>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

function App() {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppContent />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;