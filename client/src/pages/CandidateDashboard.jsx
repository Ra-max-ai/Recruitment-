import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Video,
  FileText,
  User,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function CandidateDashboard() {
  const [applications, setApplications] = useState([]);
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
    fetchCandidateData();
  }, [token]);

  const fetchCandidateData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/applications/my-applications");
      setApplications(res.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Dynamic real calculations directly from MongoDB data
  const totalApplications = applications.length;
  const underReviewCount = applications.filter(
    (a) => a.status === "Under Review"
  ).length;
  const shortlistedCount = applications.filter(
    (a) => a.status === "Shortlisted"
  ).length;
  const interviewsCount = applications.filter(
    (a) =>
      a.status === "Interview Scheduled" ||
      (a.interview && a.interview.scheduledDate)
  ).length;

  // Find upcoming interview
  const upcomingInterviewApp = applications.find(
    (a) =>
      a.status === "Interview Scheduled" ||
      (a.interview && a.interview.scheduledDate)
  );

  // Most recent application
  const recentApplication = applications.length > 0 ? applications[0] : null;

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

  const getScoreColorClass = (score) => {
    if (score >= 75) return "score-high";
    if (score >= 50) return "score-mid";
    return "score-low";
  };

  const renderMiniTimeline = (currentStatus) => {
    const isRejected = currentStatus === "Rejected";
    const stages = [
      "Applied",
      "Under Review",
      "Shortlisted",
      "Interview",
      isRejected ? "Rejected" : "Selected",
    ];

    const getStageIndex = (st) => {
      switch (st) {
        case "Applied": return 0;
        case "Under Review": return 1;
        case "Shortlisted": return 2;
        case "Interview Scheduled": return 3;
        case "Selected":
        case "Rejected": return 4;
        default: return 0;
      }
    };

    const activeIndex = getStageIndex(currentStatus);

    return (
      <div style={{ margin: "1rem 0 0.5rem 0", padding: "0 0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
          {stages.map((stageName, idx) => {
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            const isStepActive = idx <= activeIndex;

            let dotBg = "#e2e8f0";
            let dotColor = "#64748b";

            if (isStepActive) {
              if (isRejected && idx === 4) {
                dotBg = "#ef4444";
                dotColor = "#fff";
              } else if (stageName === "Interview" && isCurrent) {
                dotBg = "#f59e0b";
                dotColor = "#fff";
              } else {
                dotBg = "#10b981";
                dotColor = "#fff";
              }
            }

            return (
              <div
                key={stageName}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: isCurrent ? "24px" : "18px",
                    height: isCurrent ? "24px" : "18px",
                    borderRadius: "50%",
                    backgroundColor: dotBg,
                    color: dotColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: "700",
                    border: isCurrent ? "2px solid #fff" : "none",
                    boxShadow: isCurrent ? "0 0 0 2px " + dotBg : "none",
                  }}
                >
                  {isCompleted ? "✓" : idx + 1}
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: isCurrent ? "700" : "500",
                    color: isCurrent ? "var(--text-main)" : "var(--text-muted)",
                    marginTop: "4px",
                    textAlign: "center",
                  }}
                >
                  {stageName}
                </div>
              </div>
            );
          })}

          <div
            style={{
              position: "absolute",
              top: "9px",
              left: "10%",
              right: "10%",
              height: "2px",
              backgroundColor: "#e2e8f0",
              zIndex: 1,
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Top Header */}
      <div className="flex-between mb-4" style={{ flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-main)" }}>
            Candidate Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Welcome back, {user?.name || "Job Seeker"} • Real-time overview of your applications & status
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link to="/" className="btn btn-primary">
            <Briefcase size={16} /> Browse Jobs
          </Link>
          <Link to="/my-applications" className="btn btn-secondary">
            <FileText size={16} /> My Applications
          </Link>
          <Link to="/profile" className="btn btn-secondary">
            <User size={16} /> My Profile
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
          <p style={{ color: "var(--text-muted)" }}>Loading your application dashboard...</p>
        </div>
      ) : (
        <>
          {/* 4 Real Metric Cards */}
          <div className="grid-4 mb-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            {/* 1. Total Applications */}
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
                  {totalApplications}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>
                  TOTAL APPLICATIONS
                </div>
              </div>
            </div>

            {/* 2. Under Review */}
            <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", borderLeft: "4px solid #f59e0b" }}>
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
                <Clock size={24} color="#d97706" />
              </div>
              <div>
                <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-main)" }}>
                  {underReviewCount}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>
                  UNDER REVIEW
                </div>
              </div>
            </div>

            {/* 3. Shortlisted Applications */}
            <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", borderLeft: "4px solid #10b981" }}>
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
                  {shortlistedCount}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>
                  SHORTLISTED
                </div>
              </div>
            </div>

            {/* 4. Upcoming Interviews */}
            <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", borderLeft: "4px solid #8b5cf6" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  backgroundColor: "#f5f3ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Calendar size={24} color="#7c3aed" />
              </div>
              <div>
                <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-main)" }}>
                  {interviewsCount}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>
                  INTERVIEWS SCHEDULED
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Interview Card (if exists) */}
          {upcomingInterviewApp && upcomingInterviewApp.interview && (
            <div
              className="card mb-4"
              style={{
                backgroundColor: "#f5f3ff",
                border: "1.5px solid #c4b5fd",
                padding: "1.25rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "8px",
                      backgroundColor: "#ede9fe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Video size={22} color="#7c3aed" />
                  </div>
                  <div>
                    <span
                      style={{
                        backgroundColor: "#7c3aed",
                        color: "#fff",
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                      }}
                    >
                      Upcoming Interview
                    </span>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginTop: "4px", color: "#1e1b4b" }}>
                      {upcomingInterviewApp.jobId?.title || "Role Interview"}
                    </h3>
                    <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "6px", fontSize: "0.88rem", color: "#4c1d95" }}>
                      <span>
                        <strong>Company:</strong> {upcomingInterviewApp.jobId?.recruiterId?.company || "TalentAI Partner"}
                      </span>
                      <span>
                        <strong>Date:</strong> {new Date(upcomingInterviewApp.interview.scheduledDate).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                      <span>
                        <strong>Mode:</strong> {upcomingInterviewApp.interview.mode || "Video Conference"}
                      </span>
                    </div>
                    {upcomingInterviewApp.interview.notes && (
                      <p style={{ marginTop: "6px", fontSize: "0.85rem", color: "#6b21a8", fontStyle: "italic" }}>
                        Note: "{upcomingInterviewApp.interview.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {upcomingInterviewApp.interview.meetingLink && (
                  <a
                    href={upcomingInterviewApp.interview.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ backgroundColor: "#7c3aed", borderColor: "#7c3aed" }}
                  >
                    <Video size={14} /> Join Interview Room
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Grid: Recent Application Card + Quick Navigation */}
          {recentApplication ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
              {/* Recent Application Detailed Card */}
              <div className="card">
                <div className="flex-between mb-3">
                  <div>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Most Recent Application
                    </span>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginTop: "2px" }}>
                      {recentApplication.jobId?.title || "Position Application"}
                    </h3>
                  </div>
                  {getStatusBadge(recentApplication.status)}
                </div>

                <div style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                  <span>Company: <strong>{recentApplication.jobId?.recruiterId?.company || "Hiring Organization"}</strong></span>
                  <span style={{ margin: "0 8px" }}>•</span>
                  <span>Applied on: {new Date(recentApplication.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>

                {/* AI Screening Score Pill if available */}
                {recentApplication.matchResult?.matchScore !== undefined && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "1rem" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>AI Match Score:</span>
                    <span className={`score-badge ${getScoreColorClass(recentApplication.matchResult.matchScore)}`}>
                      <Sparkles size={12} /> {recentApplication.matchResult.matchScore}% Match
                    </span>
                  </div>
                )}

                {/* Mini Application Progress Timeline */}
                <div style={{ backgroundColor: "#f8fafc", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "#64748b", marginBottom: "0.25rem" }}>
                    Application Status Progress:
                  </div>
                  {renderMiniTimeline(recentApplication.status)}
                </div>

                <div style={{ marginTop: "1.25rem", textAlign: "right" }}>
                  <Link to="/my-applications" className="btn btn-secondary btn-sm">
                    View Full Details <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Quick Actions & Profile Summary */}
              <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.75rem" }}>
                    Candidate Quick Actions
                  </h3>
                  <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
                    Keep your profile and resume updated to ensure Gemini AI accurately matches your skills to hiring recruiters.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <Link
                      to="/"
                      className="btn btn-secondary"
                      style={{ justifyContent: "flex-start", padding: "0.75rem 1rem" }}
                    >
                      <Briefcase size={16} color="var(--primary)" />
                      <span>Browse All Available Jobs</span>
                    </Link>

                    <Link
                      to="/my-applications"
                      className="btn btn-secondary"
                      style={{ justifyContent: "flex-start", padding: "0.75rem 1rem" }}
                    >
                      <FileText size={16} color="#0ea5e9" />
                      <span>View All Submitted Applications ({totalApplications})</span>
                    </Link>

                    <Link
                      to="/profile"
                      className="btn btn-secondary"
                      style={{ justifyContent: "flex-start", padding: "0.75rem 1rem" }}
                    >
                      <User size={16} color="#10b981" />
                      <span>Update Profile & Resume Details</span>
                    </Link>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "1.25rem",
                    padding: "0.75rem",
                    backgroundColor: "#f0fdf4",
                    borderRadius: "6px",
                    border: "1px solid #bbf7d0",
                    fontSize: "0.82rem",
                    color: "#166534",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Sparkles size={14} color="#16a34a" />
                  <span>Resume screening is powered by Google Gemini AI with real text extraction.</span>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State if Candidate has not applied yet */
            <div className="card text-center" style={{ padding: "3rem 1.5rem", marginBottom: "2rem" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "var(--primary-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem auto",
                }}
              >
                <Briefcase size={32} color="var(--primary)" />
              </div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: "700" }}>No Job Applications Yet</h2>
              <p style={{ color: "var(--text-muted)", maxWidth: "450px", margin: "0.5rem auto 1.5rem auto", fontSize: "0.92rem" }}>
                You haven't applied to any positions yet. Explore active job listings, upload your resume, and let our AI match your skills!
              </p>
              <Link to="/" className="btn btn-primary">
                Browse Open Positions <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {/* Recent Applications Table */}
          {applications.length > 0 && (
            <div className="card">
              <div className="flex-between mb-3">
                <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>
                  Your Submitted Applications ({totalApplications})
                </h3>
                <Link to="/my-applications" style={{ fontSize: "0.88rem", color: "var(--primary)", fontWeight: "600" }}>
                  View All &rarr;
                </Link>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="table" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                      <th style={{ padding: "0.75rem 0.5rem" }}>JOB TITLE</th>
                      <th style={{ padding: "0.75rem 0.5rem" }}>COMPANY</th>
                      <th style={{ padding: "0.75rem 0.5rem" }}>APPLIED DATE</th>
                      <th style={{ padding: "0.75rem 0.5rem" }}>AI SCORE</th>
                      <th style={{ padding: "0.75rem 0.5rem" }}>STATUS</th>
                      <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.slice(0, 5).map((app) => (
                      <tr key={app._id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "0.88rem" }}>
                        <td style={{ padding: "0.75rem 0.5rem", fontWeight: "600", color: "var(--text-main)" }}>
                          {app.jobId?.title || "Role"}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)" }}>
                          {app.jobId?.recruiterId?.company || "TalentAI Organization"}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)" }}>
                          {new Date(app.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem" }}>
                          {app.matchResult?.matchScore !== undefined ? (
                            <span className={`score-badge ${getScoreColorClass(app.matchResult.matchScore)}`}>
                              {app.matchResult.matchScore}%
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Pending</span>
                          )}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem" }}>
                          {getStatusBadge(app.status)}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>
                          <Link to="/my-applications" className="btn btn-secondary btn-sm" style={{ padding: "0.25rem 0.6rem", fontSize: "0.78rem" }}>
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}