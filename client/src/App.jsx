import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import JobListings from "./pages/JobListings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ManageJobs from "./pages/ManageJobs";
import ApplyJob from "./pages/ApplyJob";
import MyApplications from "./pages/MyApplications";
import JobApplicants from "./pages/JobApplicants";
import Dashboard from "./pages/Dashboard";
import Interviews from "./pages/Interviews";
import CandidateProfile from "./pages/CandidateProfile";

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<JobListings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<CandidateProfile />} />
            <Route path="/manage-jobs" element={<ManageJobs />} />
            <Route path="/interviews" element={<Interviews />} />
            <Route path="/apply/:jobId" element={<ApplyJob />} />
            <Route path="/my-applications" element={<MyApplications />} />
            <Route path="/job-applicants/:jobId" element={<JobApplicants />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}