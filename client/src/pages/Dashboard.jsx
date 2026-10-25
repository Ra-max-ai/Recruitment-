import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Plus,
  AlertCircle,
  Video,
} from "lucide-react";
import CandidateDashboard from "./CandidateDashboard";

function RecruiterDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchStats();
  }, [token]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await API.get("/dashboard/stats");
      setStats(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load dashboard metrics."
      );
    } finally {
      setLoading(false);
    }
  };

  const getScoreColorClass = (score) => {
    if (score >= 75) return "score-high";
    if (score >= 50) return "score-mid";
    return "score-low";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Applied":
        return <span className="badge badge-applied">Applied</span>;
      case "Under Review":
        return <span className="badge badge-review">Under Review</span>;
      case "Shortlisted":
        return <span className="badge badge-shortlisted">Shortlisted</span>;
      case "Interview Scheduled":
        return <span className="badge badge-interview">Interview Scheduled</span>;
      case "Selected":
        return <span className="badge badge-selected">Selected</span>;
      case "Rejected":
        return <span className="badge badge-rejected">Rejected</span>;
      default:
        return <span className="badge badge-applied">{status}</span>;
    }
  };

  return (
    <div>
      {/* Dashboard Top Header */}
      <div className="flex-between mb-4" style={{ flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-main)" }}>
            Recruiter Analytics Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Welcome back, {user?.name || "Recruiter"} • Real-time overview of jobs, candidates, and AI rankings
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/manage-jobs" className="btn btn-primary">
            <Plus size={16} /> Post New Job
          </Link>
          <Link to="/interviews" className="btn btn-secondary">
            <Calendar size={16} /> View Interviews
          </Link>
        </div>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "var(--danger-bg)",
            color: "var(--danger)",
            padding: "0.75rem",
            borderRadius: "6px",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AlertCircle size={18} /> <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <p style={{ color: "var(--text-muted)" }}>Calculating dashboard metrics & rankings...</p>
        </div>
      ) : stats ? (
        <>
          {/* 5 Core Metric Cards */}
          <div className="grid-4 mb-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            {/* 1. Total Jobs */}
            <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", borderLeft: "4px solid var(--primary)" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  backgroundColor: "var(--primary-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Briefcase size={24} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-main)" }}>
                  {stats.counts.totalJobs}
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: "600" }}>
                  TOTAL POSTED JOBS
                </div>
              </div>
            </div>

            {/* 2. Total Candidates */}
            <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", borderLeft: "4px solid #0ea5e9" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  backgroundColor: "#e0f2fe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Users size={24} color="#0ea5e9" />
              </div>
              <div>
                <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-main)" }}>
                  {stats.counts.totalCandidates}
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: "600" }}>
                  TOTAL CANDIDATES
                </div>
              </div>
            </div>

            {/* 3. Candidates Under Review */}
            <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", borderLeft: "4px solid #3b82f6" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  backgroundColor: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Clock size={24} color="#3b82f6" />
              </div>
              <div>
                <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-main)" }}>
                  {stats.counts.underReview}
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: "600" }}>
                  UNDER REVIEW
                </div>
              </div>
            </div>

            {/* 4. Shortlisted Candidates */}
            <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", borderLeft: "4px solid var(--success)" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  backgroundColor: "var(--success-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle2 size={24} color="var(--success)" />
              </div>
              <div>
                <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-main)" }}>
                  {stats.counts.shortlisted}
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: "600" }}>
                  SHORTLISTED
                </div>
              </div>
            </div>

            {/* 5. Interviews Scheduled */}
            <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", borderLeft: "4px solid #d97706" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  backgroundColor: "#fef3c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Calendar size={24} color="#d97706" />
              </div>
              <div>
                <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-main)" }}>
                  {stats.counts.interviewsScheduled}
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: "600" }}>
                  INTERVIEWS SCHEDULED
                </div>
              </div>
            </div>
          </div>

          {/* Side by Side Content Sections */}
          <div className="grid-2 mb-4">
            {/* Top AI-Ranked Candidates */}
            <div className="card">
              <div className="flex-between mb-2">
                <h2 style={{ fontSize: "1.2rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Sparkles size={18} color="var(--primary)" /> Top Ranked Candidates
                </h2>
                <Link to="/manage-jobs" style={{ fontSize: "0.85rem", fontWeight: "600" }}>
                  View All Jobs
                </Link>
              </div>

              {stats.topRankedCandidates.length === 0 ? (
                <p style={{ color: "var(--text-muted)", padding: "1.5rem 0", textAlign: "center" }}>
                  No candidate evaluations yet.
                </p>
              ) : (
                <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
                  {stats.topRankedCandidates.map((cand, idx) => (
                    <div
                      key={cand._id}
                      style={{
                        padding: "0.75rem 1rem",
                        backgroundColor: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span
                          style={{
                            width: "26px",
                            height: "26px",
                            borderRadius: "50%",
                            backgroundColor: idx === 0 ? "#fef3c7" : "#e2e8f0",
                            color: idx === 0 ? "#b45309" : "#475569",
                            fontSize: "0.8rem",
                            fontWeight: "800",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          #{idx + 1}
                        </span>
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>
                            {cand.candidateName}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            {cand.jobId?.title || "Role"} • {getStatusBadge(cand.status)}
                          </div>
                        </div>
                      </div>

                      <div className={`score-badge ${getScoreColorClass(cand.matchResult?.matchScore || 0)}`}>
                        {cand.matchResult?.matchScore || 0}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Interviews Widget */}
            <div className="card">
              <div className="flex-between mb-2">
                <h2 style={{ fontSize: "1.2rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Calendar size={18} color="#d97706" /> Upcoming Interviews
                </h2>
                <Link to="/interviews" style={{ fontSize: "0.85rem", fontWeight: "600" }}>
                  View All
                </Link>
              </div>

              {stats.upcomingInterviews.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem 0" }}>
                  <p style={{ color: "var(--text-muted)" }}>
                    No upcoming interviews scheduled.
                  </p>
                  <Link to="/manage-jobs" className="btn btn-secondary btn-sm" style={{ marginTop: "0.75rem" }}>
                    Select Candidates to Interview
                  </Link>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
                  {stats.upcomingInterviews.map((item) => (
                    <div
                      key={item._id}
                      style={{
                        padding: "0.85rem 1rem",
                        backgroundColor: "#fffbeb",
                        borderRadius: "8px",
                        border: "1px solid #fef3c7",
                      }}
                    >
                      <div className="flex-between">
                        <div style={{ fontWeight: "700", color: "#78350f" }}>
                          {item.candidateName}
                        </div>
                        <span className="badge badge-interview">
                          {item.interview?.status || "Scheduled"}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "#92400e", marginTop: "4px" }}>
                        Role: <strong>{item.jobId?.title}</strong>
                      </div>
                      <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "#b45309", marginTop: "6px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={13} /> {new Date(item.interview?.scheduledDate).toLocaleDateString()}
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={13} /> {item.interview?.scheduledTime}
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Video size={13} /> {item.interview?.interviewType}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (user?.role === "candidate") {
    return <CandidateDashboard />;
  }

  return <RecruiterDashboard />;
}