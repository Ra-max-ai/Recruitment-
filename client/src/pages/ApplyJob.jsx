import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  UploadCloud,
  FileCheck,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  Award,
  Calendar,
} from "lucide-react";

export default function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [alreadyAppliedData, setAlreadyAppliedData] = useState(null);

  // Form fields
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isCandidate = user?.role === "candidate";
  const [candidateName, setCandidateName] = useState(user?.name || "");
  const [candidateEmail, setCandidateEmail] = useState(user?.email || "");
  const [candidatePhone, setCandidatePhone] = useState(user?.phone || "");
  const [resumeFile, setResumeFile] = useState(null);

  // States
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setJobLoading(true);
      const res = await API.get(`/jobs/${jobId}`);
      setJob(res.data);

      // Check if logged-in candidate already applied for this job
      if (isCandidate) {
        try {
          const statusRes = await API.get(`/applications/check-status/${jobId}`);
          if (statusRes.data.applied) {
            setAlreadyAppliedData(statusRes.data);
          }
        } catch (e) {
          // ignore status check failure
        }
      }
    } catch (err) {
      setError("Failed to load job details. The job may have been removed.");
    } finally {
      setJobLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (![".pdf", ".docx"].includes(ext)) {
      setError("Please select a valid PDF (.pdf) or Word (.docx) document.");
      setResumeFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit. Please upload a smaller file.");
      setResumeFile(null);
      return;
    }

    setError("");
    setResumeFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (alreadyAppliedData) {
      setError("You have already applied for this position.");
      return;
    }

    if (!resumeFile) {
      setError("Please upload your resume file (.pdf or .docx).");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("jobId", jobId);
      formData.append("candidateName", candidateName);
      formData.append("candidateEmail", candidateEmail);
      formData.append("candidatePhone", candidatePhone);
      formData.append("resume", resumeFile);
      if (user?._id) {
        formData.append("candidateId", user._id);
      }

      const res = await API.post("/applications/apply", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessData(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit application. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (jobLoading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading position details...</p>
      </div>
    );
  }

  // Already Applied Screen (Prevents multiple submissions and form display)
  if (alreadyAppliedData) {
    return (
      <div style={{ maxWidth: "650px", margin: "2.5rem auto" }}>
        <div className="card" style={{ textAlign: "center", padding: "2.5rem 2rem", borderTop: "4px solid var(--primary)" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "var(--primary-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
            }}
          >
            <CheckCircle size={32} color="var(--primary)" />
          </div>

          <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-main)" }}>
            Application Already Submitted
          </h2>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            You have already submitted an active application for <strong>{job?.title}</strong>.
          </p>

          <div
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "1.25rem",
              marginTop: "1.5rem",
              textAlign: "left",
              fontSize: "0.9rem",
            }}
          >
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Current Status: </strong>
              <span className="badge badge-review" style={{ marginLeft: "6px" }}>
                {alreadyAppliedData.status}
              </span>
            </div>
            {alreadyAppliedData.appliedAt && (
              <div style={{ marginBottom: "0.5rem", color: "var(--text-muted)" }}>
                <strong>Applied On: </strong> {new Date(alreadyAppliedData.appliedAt).toLocaleDateString()}
              </div>
            )}
            {alreadyAppliedData.interview?.scheduledDate && (
              <div style={{ marginTop: "0.5rem", padding: "0.6rem", backgroundColor: "#fffbeb", borderRadius: "6px", color: "#b45309" }}>
                <Calendar size={14} style={{ display: "inline", marginRight: "4px" }} />
                <strong>Interview Scheduled: </strong> {new Date(alreadyAppliedData.interview.scheduledDate).toLocaleDateString()} at {alreadyAppliedData.interview.scheduledTime}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "1.75rem" }}>
            <Link to="/my-applications" className="btn btn-primary">
              View in My Applications
            </Link>
            <Link to="/" className="btn btn-secondary">
              Browse Other Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success Confirmation Screen
  if (successData) {
    return (
      <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
        <div className="card" style={{ textAlign: "center", padding: "2.5rem 2rem" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "var(--success-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
            }}
          >
            <CheckCircle size={32} color="var(--success)" />
          </div>

          <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-main)" }}>
            Application Submitted!
          </h2>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            Your resume was uploaded and its plain text successfully analyzed by AI.
          </p>

          <div
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "1rem",
              marginTop: "1.5rem",
              textAlign: "left",
              fontSize: "0.85rem",
            }}
          >
            <div style={{ fontWeight: "700", marginBottom: "0.4rem", color: "var(--primary)" }}>
              📄 Resume Processing Status:
            </div>
            <div><strong>File Name:</strong> {successData.application?.resumeFileName}</div>
            <div><strong>Extracted Characters:</strong> {successData.application?.extractedTextLength} chars</div>
            {successData.application?.matchResult?.matchScore !== undefined && (
              <div style={{ marginTop: "4px" }}>
                <strong>AI Match Score:</strong> <span style={{ fontWeight: "700", color: "var(--primary)" }}>{successData.application.matchResult.matchScore}%</span>
              </div>
            )}
            <div style={{ marginTop: "0.5rem", color: "var(--text-muted)" }}>
              <strong>Extracted Text Preview:</strong>
              <p style={{ fontStyle: "italic", marginTop: "2px", backgroundColor: "#fff", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)" }}>
                "{successData.application?.extractedTextPreview}"
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "1.75rem" }}>
            <Link to="/my-applications" className="btn btn-primary">
              Track My Applications
            </Link>
            <Link to="/" className="btn btn-secondary">
              Browse More Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "1.5rem auto" }}>
      <Link
        to="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "1rem",
          fontWeight: "600",
          fontSize: "0.9rem",
        }}
      >
        <ArrowLeft size={16} /> Back to Job Listings
      </Link>

      {/* Target Job Overview Card */}
      {job && (
        <div className="card mb-4" style={{ borderLeft: "4px solid var(--primary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--primary)" }}>
                {job.title}
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", fontWeight: "500", marginTop: "2px" }}>
                {job.recruiterId?.company || "Hiring Team"} • Posted on {new Date(job.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.75rem 0" }}>
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

          <div>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
              REQUIRED SKILLS FOR THIS ROLE:
            </span>
            {job.requiredSkills?.map((skill, i) => (
              <span key={i} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Application Form */}
      <div className="card">
        <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>
          Candidate Application & Resume Upload
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
          Please upload your updated resume in PDF or Word (.docx) format. Our NLP engine will extract your skills, education, and experience.
        </p>

        {error && (
          <div
            style={{
              backgroundColor: "var(--danger-bg)",
              color: "var(--danger)",
              padding: "0.75rem",
              borderRadius: "6px",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.88rem",
            }}
          >
            <AlertCircle size={16} /> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. John Doe"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="john@example.com"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              type="tel"
              required
              className="form-input"
              placeholder="+1 (555) 000-0000"
              value={candidatePhone}
              onChange={(e) => setCandidatePhone(e.target.value)}
            />
          </div>

          {/* File Upload Area */}
          <div className="form-group">
            <label className="form-label">Resume Document * (PDF or DOCX, max 10MB)</label>
            <div
              style={{
                border: "2px dashed var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "2rem 1.5rem",
                textAlign: "center",
                backgroundColor: resumeFile ? "var(--success-bg)" : "#fafafa",
                cursor: "pointer",
                position: "relative",
                transition: "all 0.2s",
              }}
            >
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                  cursor: "pointer",
                }}
              />

              {resumeFile ? (
                <div>
                  <FileCheck size={36} color="var(--success)" style={{ margin: "0 auto 0.5rem" }} />
                  <div style={{ fontWeight: "700", color: "var(--success)", fontSize: "0.95rem" }}>
                    {resumeFile.name}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB • Click to change file
                  </div>
                </div>
              ) : (
                <div>
                  <UploadCloud size={36} color="var(--primary)" style={{ margin: "0 auto 0.5rem" }} />
                  <div style={{ fontWeight: "600", fontSize: "0.95rem", color: "var(--text-main)" }}>
                    Click or Drag & Drop your Resume here
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    Supports Adobe PDF (.pdf) and Microsoft Word (.docx)
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.85rem", marginTop: "1rem", fontSize: "1rem" }}
            disabled={submitting}
          >
            {submitting ? (
              <span>Extracting Resume Text & Analyzing with AI...</span>
            ) : (
              <span>Submit Application</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}