import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  Calendar,
  Clock,
  Video,
  User,
  Briefcase,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchInterviews();
  }, [token]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await API.get("/applications/interviews");
      setInterviews(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load scheduled interviews."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInterviewStatus = async (appId, newStatus) => {
    try {
      // Find current app
      const app = interviews.find((i) => i._id === appId);
      if (!app) return;

      // Update interview object
      await API.post(`/applications/${appId}/interview`, {
        scheduledDate: app.interview.scheduledDate,
        scheduledTime: app.interview.scheduledTime,
        interviewType: app.interview.interviewType,
        notes: app.interview.notes,
        status: newStatus,
      });

      // Update state locally
      setInterviews((prev) =>
        prev.map((item) =>
          item._id === appId
            ? { ...item, interview: { ...item.interview, status: newStatus } }
            : item
        )
      );
    } catch (err) {
      alert("Failed to update interview status.");
    }
  };

  const filtered = interviews.filter((item) => {
    if (statusFilter === "All") return true;
    return item.interview?.status === statusFilter;
  });

  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800" }}>Interview Coordination</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Monitor and coordinate scheduled candidate interviews across all active jobs
          </p>
        </div>
        <Link to="/manage-jobs" className="btn btn-secondary">
          Manage Jobs
        </Link>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "1.25rem" }}>
        {["All", "Pending", "Completed", "Cancelled"].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`btn btn-sm ${statusFilter === tab ? "btn-primary" : "btn-secondary"}`}
            style={{ borderRadius: "20px" }}
          >
            {tab} {tab === "All" ? `(${interviews.length})` : `(${interviews.filter((i) => i.interview?.status === tab).length})`}
          </button>
        ))}
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
          <p style={{ color: "var(--text-muted)" }}>Loading scheduled interviews...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <Calendar size={48} color="var(--text-muted)" style={{ margin: "0 auto 1rem" }} />
          <h3>No interviews scheduled yet</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "0.4rem" }}>
            Select candidates from the "Rank Applicants" view to schedule Google Meet, Zoom, or In-Person interviews.
          </p>
          <Link to="/manage-jobs" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            View Jobs & Candidates
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {filtered.map((item) => (
            <div key={item._id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>
                      {item.candidateName}
                    </h3>
                    <span className="badge badge-interview">
                      {item.interview?.status || "Pending"}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "3px" }}>
                    Target Role: <strong>{item.jobId?.title || "Role"}</strong> • Email: {item.candidateEmail} • Phone: {item.candidatePhone}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  <a
                    href={`http://localhost:5000${item.resumeFilePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <FileText size={14} /> Resume <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Schedule Details Box */}
              <div
                style={{
                  backgroundColor: "#fffbeb",
                  border: "1px solid #fef3c7",
                  borderRadius: "8px",
                  padding: "0.85rem 1rem",
                  marginTop: "0.85rem",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "1.5rem",
                  fontSize: "0.9rem",
                  color: "#92400e",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontWeight: "600" }}>
                  <Calendar size={16} /> Date: {new Date(item.interview?.scheduledDate).toLocaleDateString()}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontWeight: "600" }}>
                  <Clock size={16} /> Time: {item.interview?.scheduledTime || "TBD"}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontWeight: "600" }}>
                  <Video size={16} /> Medium: {item.interview?.interviewType}
                </span>
              </div>

              {item.interview?.notes && (
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.6rem" }}>
                  <strong>Notes:</strong> {item.interview.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}