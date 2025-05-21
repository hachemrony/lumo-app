import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import AnalyzeAndExpandPage from './pages/AnalyzeAndExpandPage';
import LessonPage from './pages/LessonPage';
import ExplorePage from './pages/ExplorePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import HomePage from './pages/HomePage'; // ✅ Now clean import
import RequireAuth from './components/RequireAuth';
import './App.css';
import UploadPage from './pages/UploadPage';
import AdminSignupPage from './pages/AdminSignupPage';
import ManageLessonsPage from './pages/ManageLessonsPage';
import AdminHubPage from './pages/AdminHubPage';
import AdminDashboardPage from './pages/AdminDashboardPage';





function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/analyze" element={
          <RequireAuth>
            <AnalyzeAndExpandPage />
          </RequireAuth>
        } />
        <Route path="/lesson" element={<LessonPage />} />

        <Route path="*" element={<NotFoundPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/adminsignup" element={<AdminSignupPage />} />
        <Route path="/manage" element={<ManageLessonsPage />} />
        <Route path="/admin-hub" element={<AdminHubPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />



      </Routes>
    </Router>
  );
}

export default App;
