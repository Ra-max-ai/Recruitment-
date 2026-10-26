import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  ArrowLeft,
  Users,
  Award,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  Calendar,
  Video,
  Info,
} from "lucide-react";

export default function JobApplicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [notification, setNotification] = useState("");

  // Interview Schedule Modal State
  const [interviewCandidate, setInterviewCandidate] = useState(null);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("10:00 AM");
  const [interviewType, setInterviewType] = useState("Online (Google Meet / Zoom)");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [scheduling, setScheduling] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchJobAndApplicants();
  }, [jobId, token]);

  const fetchJobAndApplicants = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/applications/job/${jobId}`);
      setJob(res.data.job);
      setApplications(res.data.applications);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load candidates for this job."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      setUpdatingId(appId);
      await API.patch(`/applications/${appId}/status`, { status: newStatus });

      setApplications((prev) =>
        prev.map((app) =>
          app._id === appId ? { ...app, status: newStatus } : app
        )
      );

      if (selectedCandidate && selectedCandidate._id === appId) {
        setSelectedCandidate((prev) => ({ ...prev, status: newStatus }));
      }

      setNotification(`Candidate marked as "${newStatus}"!`);
      setTimeout(() => setNotification(""), 3500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!interviewDate || !interviewTime) {
      alert("Please provide both interview date and time.");
      return;
    }

    try {
      setScheduling(true);
      const res = await API.post(`/applications/${interviewCandidate._id}/interview`, {
        scheduledDate: interviewDate,
        scheduledTime: interviewTime,
        interviewType,
        notes: interviewNotes,
      });

      // Update state
      setApplications((prev) =>
        prev.map((app) =>
          app._id === interviewCandidate._id
            ? { ...app, status: "Interview Scheduled", interview: res.data.application.interview }
            : app
        )
      );

      setNotification(`Interview successfully scheduled for ${interviewCandidate.candidateName}!`);
      setTimeout(() => setNotification(""), 4000);
      setInterviewCandidate(null);
      setInterviewNotes("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to schedule interview.");
    } finally {
      setScheduling(false);
    }
  };

  // Filter candidates by status tab
  const filteredApplications = applications.filter((app) => {
    if (statusFilter === "All") return true;
    return app.status === statusFilter;
  });

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

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div>
      <Link
        to="/manage-jobs"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "1rem",
          fontWeight: "600",
          fontSize: "0.9rem",
        }}
      >
        <ArrowLeft size={16} /> Back to Job Management
      </Link>

      {notification && (
        <div
          style={{
            backgroundColor: "var(--success-bg)",
            color: "var(--success)",
            padding: "0.75rem 1rem",
            borderRadius: "6px",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontWeight: "600",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <CheckCircle2 size={18} /> <span>{notification}</span>
        </div>
      )}

      {/* Target Job Header Card */}
      {job && (
        <div className="card mb-4" style={{ borderLeft: "4px solid var(--primary)" }}>
          <div className="flex-between" style={{ flexWrap: "wrap", gap: "10px" }}>
            <div>
              <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Candidate Screening & AI Ranking
              </span>
              <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-main)", marginTop: "2px" }}>
                {job.title}
              </h1>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "3px" }}>
                Required Experience: {job.experienceRequired} yrs • Location: {job.location} • Type: {job.jobType}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="badge badge-review" style={{ fontSize: "0.9rem", padding: "0.4rem 0.8rem" }}>
                <Users size={16} /> Total Applicants: {applications.length}
              </span>
            </div>
          </div>

          <div style={{ marginTop: "1rem", borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
              TARGET SKILLS REQUIRED BY JOB:
            </span>
            <div>
              {job.requiredSkills?.map((skill, i) => (
                <span key={i} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "1.25rem", overflowX: "auto", paddingBottom: "4px" }}>
        {["All", "Shortlisted", "Under Review", "Applied", "Interview Scheduled", "Rejected"].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`btn btn-sm ${statusFilter === tab ? "btn-primary" : "btn-secondary"}`}
            style={{ borderRadius: "20px" }}
          >
            {tab}
            {tab === "All" && ` (${applications.length})`}
            {tab === "Shortlisted" && ` (${applications.filter((a) => a.status === "Shortlisted").length})`}
            {tab === "Under Review" && ` (${applications.filter((a) => a.status === "Under Review").length})`}
            {tab === "Interview Scheduled" && ` (${applications.filter((a) => a.status === "Interview Scheduled").length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "var(--text-muted)" }}>Loading candidate rankings...</p>
        </div>
      ) : error ? (
        <div className="card" style={{ color: "var(--danger)", backgroundColor: "var(--danger-bg)" }}>
          {error}
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <Users size={48} color="var(--text-muted)" style={{ margin: "0 auto 1rem" }} />
          <h3>No candidates found for status: "{statusFilter}"</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "0.4rem" }}>
            {statusFilter === "All"
              ? "Share the job link with job seekers to start receiving applications and automated AI rankings."
              : `Switch to another status tab to view candidate evaluations.`}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {filteredApplications.map((app, index) => {
            const score = app.matchResult?.matchScore || 0;
            const rank = index + 1;

            return (
              <div
                key={app._id}
                className="card"
                style={{
                  borderLeft: `5px solid ${score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444"}`,
                  transition: "box-shadow 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  {/* Candidate Profile Details */}
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        backgroundColor: rank === 1 ? "#fef3c7" : rank === 2 ? "#e2e8f0" : "#f1f5f9",
                        color: rank === 1 ? "#b45309" : "#334155",
                        fontWeight: "800",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.95rem",
                        border: rank === 1 ? "2px solid #f59e0b" : "1px solid var(--border)",
                        flexShrink: 0,
                      }}
                      title={`Rank #${rank}`}
                    >
                      #{rank}
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--text-main)" }}>
                          {app.candidateName}
                        </h3>
                        {getStatusBadge(app.status)}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        📧 {app.candidateEmail} • 📞 {app.candidatePhone} • Applied {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* AI Match Score Badge */}
                  <div style={{ textAlign: "right" }}>
                    <div className={`score-badge ${getScoreColorClass(score)}`} style={{ fontSize: "1.1rem", padding: "0.4rem 0.8rem" }}>
                      <Sparkles size={16} /> {score}% Match
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      AI Match Ranking Score
                    </div>
                  </div>
                </div>

                {/* Skills Analysis Breakdown */}
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "0.9rem",
                    margin: "1rem 0",
                    display: "grid",
                    gap: "0.5rem",
                  }}
                >
                  {/* Matched Skills */}
                  <div>
                    <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#166534", display: "inline-flex", alignItems: "center", gap: "4px", marginRight: "8px" }}>
                      <CheckCircle2 size={13} color="#16a34a" /> MATCHED SKILLS ({app.matchResult?.matchedSkills?.length || 0}):
                    </span>
                    {app.matchResult?.matchedSkills?.length > 0 ? (
                      app.matchResult.matchedSkills.map((s, idx) => (
                        <span key={idx} className="skill-tag matched">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>None detected</span>
                    )}
                  </div>

                  {/* Missing Skills */}
                  <div>
                    <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#991b1b", display: "inline-flex", alignItems: "center", gap: "4px", marginRight: "8px" }}>
                      <XCircle size={13} color="#ef4444" /> MISSING SKILLS ({app.matchResult?.missingSkills?.length || 0}):
                    </span>
                    {app.matchResult?.missingSkills?.length > 0 ? (
                      app.matchResult.missingSkills.map((s, idx) => (
                        <span key={idx} className="skill-tag missing">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: "0.8rem", color: "#16a34a", fontWeight: "600" }}>All required skills matched!</span>
                    )}
                  </div>

                  {/* AI Reasoning Text */}
                  {app.matchResult?.scoreReasoning && (
                    <div style={{ marginTop: "0.3rem", fontSize: "0.85rem", color: "#334155", fontStyle: "italic" }}>
                      <strong>AI Justification:</strong> "{app.matchResult.scoreReasoning}"
                    </div>
                  )}

                  {/* Scheduled Interview Tag if exists */}
                  {app.interview?.scheduledDate && (
                    <div style={{ marginTop: "0.3rem", fontSize: "0.82rem", color: "#b45309", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Calendar size={14} /> Interview scheduled for {new Date(app.interview.scheduledDate).toLocaleDateString()} at {app.interview.scheduledTime} ({app.interview.interviewType})
                    </div>
                  )}
                </div>

                {/* Bottom Actions Bar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <a
                      href={`${import.meta.env.VITE_API_URL}${app.resumeFilePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      <FileText size={14} /> View Resume <ExternalLink size={12} />
                    </a>

                    <button
                      onClick={() => setSelectedCandidate(app)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Info size={14} /> Full AI Breakdown
                    </button>
                  </div>

                  {/* Actions: Shortlist, Schedule Interview, Status Select */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {app.status !== "Shortlisted" && (
                      <button
                        onClick={() => handleStatusChange(app._id, "Shortlisted")}
                        className="btn btn-primary btn-sm"
                        disabled={updatingId === app._id}
                        style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
                      >
                        ✓ Shortlist
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setInterviewCandidate(app);
                        setInterviewDate(todayStr);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ color: "#d97706", borderColor: "#fde68a" }}
                    >
                      <Calendar size={14} /> Schedule Interview
                    </button>

                    <select
                      className="form-select"
                      style={{ padding: "0.35rem 0.75rem", fontSize: "0.85rem", width: "auto" }}
                      value={app.status}
                      disabled={updatingId === app._id}
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Selected">Selected</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Schedule Interview */}
      {interviewCandidate && (
        <div className="modal-overlay" onClick={() => setInterviewCandidate(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex-between mb-2">
              <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>
                Schedule Interview: {interviewCandidate.candidateName}
              </h2>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setInterviewCandidate(null)}
              >
                ✕
              </button>
            </div>

            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1.25rem" }}>
              Coordinate an interview for <strong>{job?.title}</strong>. Candidate will see this update in their portal.
            </p>

            <form onSubmit={handleScheduleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Interview Date *</label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    className="form-input"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Interview Time *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. 10:30 AM or 2:00 PM"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Interview Format / Medium *</label>
                <select
                  className="form-select"
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                >
                  <option value="Online (Google Meet / Zoom)">Online (Google Meet / Zoom)</option>
                  <option value="In-Person (Placement Cell / Office)">In-Person (Placement Cell / Office)</option>
                  <option value="Technical Phone Screen">Technical Phone Screen</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Recruiter Notes / Instructions</label>
                <textarea
                  rows="3"
                  className="form-textarea"
                  placeholder="e.g. Meeting link will be shared via email. Please prepare a demo of your React projects."
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setInterviewCandidate(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={scheduling}
                >
                  {scheduling ? "Scheduling..." : "Confirm & Schedule Interview"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Full AI Candidate Breakdown */}
      {selectedCandidate && (
        <div className="modal-overlay" onClick={() => setSelectedCandidate(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex-between mb-2">
              <h2 style={{ fontSize: "1.3rem", fontWeight: "700" }}>
                AI Evaluation: {selectedCandidate.candidateName}
              </h2>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedCandidate(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <div className={`score-badge ${getScoreColorClass(selectedCandidate.matchResult?.matchScore || 0)}`} style={{ fontSize: "1rem" }}>
                <Sparkles size={16} /> Match Score: {selectedCandidate.matchResult?.matchScore || 0}%
              </div>
              <span style={{ marginLeft: "10px" }}>{getStatusBadge(selectedCandidate.status)}</span>
            </div>

            <div style={{ display: "grid", gap: "0.85rem", fontSize: "0.9rem" }}>
              <div>
                <strong>Candidate Email:</strong> {selectedCandidate.candidateEmail}
              </div>
              <div>
                <strong>Phone Number:</strong> {selectedCandidate.candidatePhone}
              </div>
              <div>
                <strong>Extracted Education:</strong> {selectedCandidate.extractedData?.education || "Not specified"}
              </div>
              <div>
                <strong>Estimated Experience:</strong> {selectedCandidate.extractedData?.experienceYears || 0} years
              </div>
              {selectedCandidate.extractedData?.summary && (
                <div>
                  <strong>Candidate Summary:</strong>
                  <p style={{ marginTop: "2px", color: "var(--text-muted)" }}>
                    {selectedCandidate.extractedData.summary}
                  </p>
                </div>
              )}

              <div>
                <strong>All Extracted Skills:</strong>
                <div style={{ marginTop: "4px" }}>
                  {selectedCandidate.extractedData?.skills?.map((s, i) => (
                    <span key={i} className="skill-tag">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <strong>AI Justification:</strong>
                <p style={{ marginTop: "2px", padding: "0.6rem", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid var(--border)" }}>
                  {selectedCandidate.matchResult?.scoreReasoning}
                </p>
              </div>

              {selectedCandidate.rawExtractedText && (
                <div>
                  <strong>Raw Extracted Resume Text ({selectedCandidate.rawExtractedText.length} chars):</strong>
                  <div
                    style={{
                      maxHeight: "150px",
                      overflowY: "auto",
                      backgroundColor: "#f1f5f9",
                      padding: "0.75rem",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                      marginTop: "4px",
                    }}
                  >
                    {selectedCandidate.rawExtractedText}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  handleStatusChange(selectedCandidate._id, "Shortlisted");
                  setSelectedCandidate(null);
                }}
              >
                ✓ Shortlist Candidate
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedCandidate(null)}
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