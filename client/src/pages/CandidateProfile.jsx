import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit2,
  Save,
  ArrowRight,
} from "lucide-react";

export default function CandidateProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Edit form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/auth/candidate-profile");
      setProfile(res.data);
      setName(res.data.user?.name || storedUser?.name || "");
      setPhone(res.data.user?.phone || res.data.latestResume?.phone || storedUser?.phone || "");
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to load candidate profile from server.",
      });
      // Fallback to locally stored user so page is never blank
      if (storedUser) {
        setName(storedUser.name || "");
        setPhone(storedUser.phone || "");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    try {
      setSavingUser(true);
      setMessage({ type: "", text: "" });
      const res = await API.put("/auth/profile", { name, phone });

      // Update local storage user info
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...stored, name: res.data.name, phone: res.data.phone })
      );

      setProfile((prev) => ({
        ...prev,
        user: { ...(prev?.user || stored), name: res.data.name, phone: res.data.phone },
      }));

      setEditMode(false);
      setMessage({ type: "success", text: "Profile details updated successfully!" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setSavingUser(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setMessage({ type: "error", text: "Please select a PDF or DOCX resume file to upload." });
      return;
    }

    try {
      setUploadingResume(true);
      setMessage({ type: "", text: "" });

      const formData = new FormData();
      formData.append("resume", resumeFile);

      const res = await API.put("/auth/profile/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfile((prev) => ({
        ...prev,
        latestResume: res.data.latestResume,
      }));

      if (res.data.latestResume?.phone && !phone) {
        setPhone(res.data.latestResume.phone);
      }

      setResumeFile(null);
      const fileInput = document.getElementById("profileResumeInput");
      if (fileInput) fileInput.value = "";

      setMessage({
        type: "success",
        text: "Resume uploaded and skills extracted successfully!",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to parse and upload resume.",
      });
    } finally {
      setUploadingResume(false);
    }
  };

  // Safe data resolution
  const user = profile?.user || storedUser || {};
  const resume = profile?.latestResume;
  const extracted = resume?.extractedData || {};

  // Normalize education to an array of non-empty strings
  const educationList = Array.isArray(extracted?.education)
    ? extracted.education.filter(Boolean)
    : typeof extracted?.education === "string" &&
      extracted.education.trim() &&
      extracted.education.toLowerCase() !== "not specified"
    ? [extracted.education.trim()]
    : [];

  // Normalize skills to an array of non-empty strings
  const skillsList = Array.isArray(extracted?.skills)
    ? extracted.skills.filter(Boolean)
    : typeof extracted?.skills === "string" && extracted.skills.trim()
    ? extracted.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1rem" }}>
      {/* Page Header */}
      <div className="flex-between mb-4" style={{ flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-main)" }}>
            Candidate Profile
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Manage your personal information, uploaded resume, and AI-extracted qualifications
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/dashboard" className="btn btn-secondary">
            Dashboard
          </Link>
          <Link to="/my-applications" className="btn btn-primary">
            My Applications
          </Link>
        </div>
      </div>

      {message.text && (
        <div
          style={{
            backgroundColor:
              message.type === "success" ? "var(--success-bg)" : "var(--danger-bg)",
            color:
              message.type === "success" ? "var(--success)" : "var(--danger)",
            padding: "0.85rem 1rem",
            borderRadius: "6px",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            fontSize: "0.92rem",
          }}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <p style={{ color: "var(--text-muted)" }}>Loading your profile data...</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Card 1: Personal & Contact Information */}
          <div className="card">
            <div className="flex-between mb-3">
              <h2 style={{ fontSize: "1.2rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <User size={20} color="var(--primary)" /> Personal Information
              </h2>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
                >
                  <Edit2 size={14} /> Edit Contact
                </button>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleUpdateContact}>
                <div className="grid-2 mb-3">
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.4rem", color: "var(--text-main)" }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.4rem", color: "var(--text-main)" }}>
                      Phone Number
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. +91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.4rem", color: "var(--text-muted)" }}>
                    Email Address (Registered Account)
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    value={user?.email || ""}
                    disabled
                    style={{ backgroundColor: "#f8fafc", cursor: "not-allowed" }}
                  />
                  <small style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                    Email is associated with your authentication account and cannot be modified directly.
                  </small>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setName(user?.name || "");
                      setPhone(user?.phone || "");
                    }}
                    className="btn btn-secondary btn-sm"
                    disabled={savingUser}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={savingUser}
                  >
                    <Save size={14} /> {savingUser ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                <div style={{ backgroundColor: "#f8fafc", padding: "0.85rem 1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
                    Full Name
                  </div>
                  <div style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--text-main)", marginTop: "4px" }}>
                    {user?.name || "Not provided"}
                  </div>
                </div>

                <div style={{ backgroundColor: "#f8fafc", padding: "0.85rem 1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
                    Email Address
                  </div>
                  <div style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--text-main)", marginTop: "4px", wordBreak: "break-all" }}>
                    {user?.email || "Not provided"}
                  </div>
                </div>

                <div style={{ backgroundColor: "#f8fafc", padding: "0.85rem 1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
                    Phone Number
                  </div>
                  <div style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--text-main)", marginTop: "4px" }}>
                    {user?.phone || resume?.phone || "Not provided"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Resume & Extracted Qualifications */}
          <div className="card">
            <h2 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={20} color="#0ea5e9" /> Resume Information & Qualifications
            </h2>

            {resume && (resume.fileName || resume.filePath) ? (
              <div>
                {/* Active Resume File Bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    backgroundColor: "var(--primary-light)",
                    border: "1px solid #c7d2fe",
                    padding: "0.85rem 1.15rem",
                    borderRadius: "8px",
                    marginBottom: "1.5rem",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <FileText size={24} color="var(--primary)" />
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "0.95rem", color: "var(--text-main)" }}>
                        {resume.fileName || "Uploaded Resume Document"}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        Uploaded on: {resume.uploadedAt ? new Date(resume.uploadedAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "Recent"}
                      </div>
                    </div>
                  </div>

                  {resume.filePath && (
                    <a
                      href={
                        resume.filePath.startsWith("http")
                          ? resume.filePath
                          : `${import.meta.env.VITE_API_URL}${resume.filePath.startsWith("/") ? "" : "/"}${resume.filePath.replace(/\\/g, "/")}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ backgroundColor: "#fff" }}
                    >
                      <ExternalLink size={14} /> Open Document
                    </a>
                  )}
                </div>

                {/* Experience & Education Grid */}
                <div className="grid-2 mb-4" style={{ gap: "1rem" }}>
                  {/* Experience */}
                  <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}>
                      <Briefcase size={18} color="var(--primary)" />
                      <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--text-main)" }}>
                        Experience
                      </span>
                    </div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1e293b" }}>
                      {extracted?.experienceYears !== undefined && extracted?.experienceYears > 0
                        ? `${extracted.experienceYears} Years`
                        : "Not provided"}
                    </div>
                  </div>

                  {/* Education */}
                  <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}>
                      <GraduationCap size={18} color="#0ea5e9" />
                      <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--text-main)" }}>
                        Education
                      </span>
                    </div>
                    {educationList.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {educationList.map((edu, idx) => (
                          <span key={idx} style={{ fontSize: "0.92rem", fontWeight: "600", color: "var(--text-main)" }}>
                            • {edu}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: "0.95rem", color: "var(--text-muted)" }}>
                        Not provided
                      </div>
                    )}
                  </div>
                </div>

                {/* Extracted Skills */}
                <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "0.6rem" }}>
                    Extracted Skills ({skillsList.length})
                  </div>
                  {skillsList.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {skillsList.map((skill, idx) => (
                        <span
                          key={idx}
                          style={{
                            backgroundColor: "#e0e7ff",
                            color: "#3730a3",
                            fontSize: "0.82rem",
                            fontWeight: "600",
                            padding: "4px 10px",
                            borderRadius: "16px",
                            border: "1px solid #c7d2fe",
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                      Not provided
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "2.5rem 1.5rem", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                <FileText size={40} color="#94a3b8" style={{ margin: "0 auto 0.75rem auto" }} />
                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)" }}>
                  No resume uploaded yet.
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", maxWidth: "460px", margin: "0.25rem auto 1.25rem auto" }}>
                  Upload your resume below to automatically extract your skills, experience, and education for AI matching.
                </p>
              </div>
            )}
          </div>

          {/* Card 3: Update / Upload Resume */}
          <div className="card">
            <h2 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <Upload size={20} color="var(--primary)" /> {resume ? "Update / Re-upload Resume" : "Upload Resume"}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1.25rem" }}>
              Upload your resume document in PDF or DOCX format. Our parsing engine will automatically extract your qualifications and update your profile.
            </p>

            <form onSubmit={handleResumeUpload}>
              <div
                style={{
                  border: "2px dashed #cbd5e1",
                  borderRadius: "8px",
                  padding: "1.5rem",
                  textAlign: "center",
                  backgroundColor: "#f8fafc",
                  marginBottom: "1rem",
                }}
              >
                <input
                  id="profileResumeInput"
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => setResumeFile(e.target.files[0] || null)}
                  style={{ display: "none" }}
                />
                <label
                  htmlFor="profileResumeInput"
                  style={{
                    cursor: "pointer",
                    display: "inline-flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Upload size={32} color="var(--primary)" />
                  <span style={{ fontWeight: "700", color: "var(--primary)", fontSize: "0.95rem" }}>
                    {resumeFile ? resumeFile.name : "Click to select a Resume file"}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Supported formats: PDF, DOCX, DOC (Max: 5MB)
                  </span>
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!resumeFile || uploadingResume}
                >
                  <Sparkles size={16} />
                  {uploadingResume ? "Parsing & Updating Resume..." : resume ? "Update & Re-parse Resume" : "Upload & Parse Resume"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}