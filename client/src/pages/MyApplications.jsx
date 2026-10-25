import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  FileText,
  Calendar,
  Clock,
  Video,
  AlertCircle,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Info,
} from "lucide-react";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchApplications();
  }, [token]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await API.get("/applications/my-applications");
      setApplications(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load your applications. Please try again."
      );
    } finally {
      setLoading(false);
    }
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

  /**
   * Simple, clean visual application progress timeline
   * Stages: Applied -> Under Review -> Shortlisted -> Interview Scheduled -> Selected / Rejected
   */
  const renderTimeline = (currentStatus) => {
    const isRejected = currentStatus === "Rejected";
    const stages = [
      "Applied",
      "Under Review",
      "Shortlisted",
      "Interview Scheduled",
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
      <div style={{ margin: "1.25rem 0 0.75rem 0", padding: "0 0.5rem" }}>
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
              } else if (stageName === "Interview Scheduled" && isCurrent) {
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
                {/* Step Circle */}
                <div
                  style={{
                    width: isCurrent ? "28px" : "22px",
                    height: isCurrent ? "28px" : "22px",
                    borderRadius: "50%",
                    backgroundColor: dotBg,
                    color: dotColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    border: isCurrent ? "3px solid #fff" : "none",
                    boxShadow: isCurrent ? "0 0 0 2px " + dotBg : "none",
                    transition: "all 0.3s",
                  }}
                >
                  {isCompleted ? "✓" : idx + 1}
                </div>

                {/* Step Label */}
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: isCurrent ? "700" : "500",
                    color: isCurrent ? "var(--text-main)" : "var(--text-muted)",
                    marginTop: "6px",
                    textAlign: "center",
                  }}
                >
                  {stageName}
                </div>
              </div>
            );
          })}

          {/* Background Connecting Line */}
          <div
            style={{
              position: "absolute",
              top: "11px",
              left: "10%",
              right: "10%",
              height: "3px",
              backgroundColor: "#e2e8f0",
              zIndex: 1,
            }}
          >
            {/* Active Highlight Line */}
            <div
              style={{
                height: "100%",
                width: `${(activeIndex / 4) * 100}%`,
                backgroundColor: isRejected ? "#ef4444" : "#10b981",
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800" }}>My Applications</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Track your candidate application lifecycle, AI screening results, and interview invitations
          </p>
        </div>
        <Link to="/" className="btn btn-secondary">
          Browse More Jobs
        </Link>
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
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "var(--text-muted)" }}>Loading your application history...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <FileText size={48} color="var(--text-muted)" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>No Applications Submitted Yet</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "0.4rem", maxWidth: "450px", margin: "0.4rem auto 1.5rem" }}>
            Browse open positions, upload your resume, and let our AI matching system connect you with top tech roles.
          </p>
          <Link to="/" className="btn btn-primary">
            Explore Open Positions <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.25rem" }}>
          {applications.map((app) => {
            const matchScore = app.matchResult?.matchScore;

            return (
              <div key={app._id} className="card" style={{ borderLeft: "4px solid var(--primary)" }}>
                {/* Application Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--primary)" }}>
                      {app.jobId?.title || "Job Position"}
                    </h3>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "3px" }}>
                      Company: <strong>{app.jobId?.recruiterId?.company || "Hiring Team"}</strong> • Applied on: {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {matchScore !== undefined && (
                      <span
                        className="score-badge"
                        style={{
                          backgroundColor: matchScore >= 75 ? "#dcfce7" : matchScore >= 50 ? "#fef3c7" : "#fee2e2",
                          color: matchScore >= 75 ? "#15803d" : matchScore >= 50 ? "#b45309" : "#b91c1c",
                          fontSize: "0.85rem",
                        }}
                      >
                        <Sparkles size={14} /> {matchScore}% Match
                      </span>
                    )}
                    {getStatusBadge(app.status)}
                  </div>
                </div>

                {/* Application Progress Timeline */}
                <div style={{ margin: "1rem 0" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Application Tracking Timeline:
                  </span>
                  {renderTimeline(app.status)}
                </div>

                {/* Scheduled Interview Banner (if any) */}
                {app.interview?.scheduledDate && (
                  <div
                    style={{
                      backgroundColor: "#fffbeb",
                      border: "1px solid #fef3c7",
                      borderRadius: "8px",
                      padding: "0.9rem 1rem",
                      marginTop: "0.75rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", color: "#b45309", fontSize: "0.92rem" }}>
                      <Calendar size={16} /> Interview Invitation Received
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", fontSize: "0.85rem", color: "#78350f" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={13} /> {new Date(app.interview.scheduledDate).toLocaleDateString()}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={13} /> {app.interview.scheduledTime || "Time TBD"}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Video size={13} /> {app.interview.interviewType}
                      </span>
                    </div>
                    {app.interview.notes && (
                      <div style={{ fontSize: "0.82rem", color: "#92400e", marginTop: "2px" }}>
                        <strong>Recruiter Note:</strong> {app.interview.notes}
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Footer Details & Modal trigger */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Resume: <strong>{app.resumeFileName}</strong>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <a
                      href={`http://localhost:5000${app.resumeFilePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      <FileText size={14} /> View Resume <ExternalLink size={12} />
                    </a>

                    <button
                      onClick={() => setSelectedApp(app)}
                      className="btn btn-primary btn-sm"
                    >
                      <Info size={14} /> View Application
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex-between mb-2">
              <h2 style={{ fontSize: "1.3rem", fontWeight: "700" }}>
                Application Details
              </h2>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedApp(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--primary)" }}>
                {selectedApp.jobId?.title}
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                {selectedApp.jobId?.recruiterId?.company || "Hiring Team"} • Applied on {new Date(selectedApp.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div style={{ display: "grid", gap: "0.75rem", fontSize: "0.9rem" }}>
              <div>
                <strong>Current Status: </strong>
                <span style={{ marginLeft: "6px" }}>{getStatusBadge(selectedApp.status)}</span>
              </div>

              {selectedApp.matchResult?.matchScore !== undefined && (
                <div>
                  <strong>AI Match Score: </strong>
                  <span style={{ fontWeight: "700", color: "var(--primary)" }}>
                    {selectedApp.matchResult.matchScore}%
                  </span>
                </div>
              )}

              {selectedApp.matchResult?.scoreReasoning && (
                <div style={{ backgroundColor: "#f8fafc", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border)" }}>
                  <strong>AI Screening Evaluation:</strong>
                  <p style={{ fontStyle: "italic", marginTop: "3px", color: "var(--text-main)", fontSize: "0.85rem" }}>
                    "{selectedApp.matchResult.scoreReasoning}"
                  </p>
                </div>
              )}

              {selectedApp.matchResult?.matchedSkills?.length > 0 && (
                <div>
                  <strong>Matched Skills:</strong>
                  <div style={{ marginTop: "4px" }}>
                    {selectedApp.matchResult.matchedSkills.map((s, i) => (
                      <span key={i} className="skill-tag matched">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedApp.interview?.scheduledDate && (
                <div style={{ padding: "0.75rem", backgroundColor: "#fffbeb", borderRadius: "6px", border: "1px solid #fef3c7" }}>
                  <strong style={{ color: "#b45309" }}>Scheduled Interview Details:</strong>
                  <div style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                    Date: {new Date(selectedApp.interview.scheduledDate).toLocaleDateString()} at {selectedApp.interview.scheduledTime}
                  </div>
                  <div style={{ fontSize: "0.85rem" }}>
                    Medium: {selectedApp.interview.interviewType}
                  </div>
                  {selectedApp.interview.notes && (
                    <div style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                      Notes: {selectedApp.interview.notes}
                    </div>
                  )}
                </div>
              )}

              <div>
                <strong>Candidate Submitted Info:</strong>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Name: {selectedApp.candidateName} • Email: {selectedApp.candidateEmail} • Phone: {selectedApp.candidatePhone}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedApp(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}