import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import {
  Briefcase,
  MapPin,
  Clock,
  Award,
  ArrowRight,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function JobListings() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState({}); // Map of jobId -> application object
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isCandidate = user?.role === "candidate";

  useEffect(() => {
    fetchJobsAndApplicationState();
  }, []);

  const fetchJobsAndApplicationState = async () => {
    try {
      setLoading(true);
      const jobsRes = await API.get("/jobs");
      setJobs(jobsRes.data);

      // If logged in as candidate, fetch their existing applications to determine state per job
      if (isCandidate) {
        try {
          const myAppsRes = await API.get("/applications/my-applications");
          const map = {};
          myAppsRes.data.forEach((app) => {
            const jId = app.jobId?._id || app.jobId;
            if (jId) {
              map[jId.toString()] = app;
            }
          });
          setAppliedJobs(map);
        } catch (appErr) {
          console.error("Could not fetch candidate application states:", appErr.message);
        }
      }
    } catch (err) {
      setError("Failed to load active job postings. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Render dynamic Action Button based on candidate application state
   */
  const renderActionButton = (job) => {
    const application = appliedJobs[job._id];

    // If candidate has not applied, show standard "Apply Now" button
    if (!application) {
      return (
        <Link to={`/apply/${job._id}`} className="btn btn-primary">
          Apply Now <ArrowRight size={16} />
        </Link>
      );
    }

    // Candidate has already applied: Direct them to My Applications
    const status = application.status;

    if (status === "Interview Scheduled") {
      return (
        <Link
          to="/my-applications"
          className="btn btn-secondary"
          style={{
            backgroundColor: "#fef3c7",
            color: "#b45309",
            borderColor: "#fde68a",
            fontWeight: "700",
          }}
          title="Interview is scheduled! Click to view details"
        >
          <Calendar size={15} /> Interview Scheduled
        </Link>
      );
    }

    if (status === "Rejected") {
      return (
        <Link
          to="/my-applications"
          className="btn btn-secondary"
          style={{
            backgroundColor: "#fef2f2",
            color: "#dc2626",
            borderColor: "#fecaca",
            fontWeight: "600",
          }}
          title="Application Closed"
        >
          Application Closed
        </Link>
      );
    }

    if (status === "Shortlisted") {
      return (
        <Link
          to="/my-applications"
          className="btn btn-secondary"
          style={{
            backgroundColor: "#ecfdf5",
            color: "#059669",
            borderColor: "#a7f3d0",
            fontWeight: "700",
          }}
          title="You have been shortlisted! Click to track"
        >
          <CheckCircle2 size={15} /> Shortlisted
        </Link>
      );
    }

    if (status === "Under Review") {
      return (
        <Link
          to="/my-applications"
          className="btn btn-secondary"
          style={{
            backgroundColor: "#eff6ff",
            color: "#2563eb",
            borderColor: "#bfdbfe",
            fontWeight: "600",
          }}
          title="Application is currently under review"
        >
          <Clock size={15} /> Under Review
        </Link>
      );
    }

    // Default "Applied" state
    return (
      <Link
        to="/my-applications"
        className="btn btn-secondary"
        style={{
          backgroundColor: "#f0fdf4",
          color: "#16a34a",
          borderColor: "#bbf7d0",
          fontWeight: "700",
        }}
        title="Already applied. Click to view status"
      >
        <CheckCircle2 size={15} /> ✓ Applied
      </Link>
    );
  };

  return (
    <div>
      {/* Hero Banner */}
      <div
        style={{
          textAlign: "center",
          padding: "3rem 1rem",
          background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
          borderRadius: "var(--radius-lg)",
          color: "#ffffff",
          marginBottom: "2.5rem",
        }}
      >
        <h1 style={{ fontSize: "2.4rem", fontWeight: "800", marginBottom: "0.75rem" }}>
          AI-Enabled Recruitment Platform
        </h1>
        <p style={{ fontSize: "1.1rem", opacity: 0.9, maxWidth: "600px", margin: "0 auto" }}>
          Intelligent resume screening, skill matching, and candidate evaluation for college placements and modern tech hiring.
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: "700" }}>Active Openings ({jobs.length})</h2>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "var(--text-muted)" }}>Loading current job openings...</p>
        </div>
      )}

      {error && (
        <div className="card" style={{ color: "var(--danger)", backgroundColor: "var(--danger-bg)", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {!loading && jobs.length === 0 && !error && (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <Briefcase size={40} color="var(--text-muted)" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: "600" }}>No Jobs Posted Yet</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            Check back later or log in as a recruiter to post the first job vacancy!
          </p>
          <Link to="/login" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Sign In
          </Link>
        </div>
      )}

      <div style={{ display: "grid", gap: "1.25rem" }}>
        {jobs.map((job) => (
          <div key={job._id} className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--primary)" }}>
                  {job.title}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: "500", marginTop: "2px" }}>
                  {job.recruiterId?.company || "Tech Hiring Team"} • Posted {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Dynamic Action Button according to candidate application state */}
              <div>{renderActionButton(job)}</div>
            </div>

            <p style={{ color: "var(--text-main)", fontSize: "0.95rem", lineHeight: "1.6" }}>
              {job.description}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <MapPin size={15} /> {job.location}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Clock size={15} /> {job.jobType}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Award size={15} /> Min {job.experienceRequired} {job.experienceRequired === 1 ? "year" : "years"} experience
              </span>
            </div>

            <div style={{ marginTop: "0.25rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                REQUIRED SKILLS:
              </span>
              <div>
                {job.requiredSkills.map((skill, idx) => (
                  <span key={idx} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}